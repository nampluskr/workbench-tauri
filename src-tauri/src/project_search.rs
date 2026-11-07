use ignore::{overrides::OverrideBuilder, WalkBuilder};
use regex::RegexBuilder;
use serde_json::{json, Value};
use std::{collections::{HashMap, HashSet}, fs, path::{Path, PathBuf}, sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex}};
use tauri::ipc::Channel;

// Zed 4304dec732 crates/project/src/project_search.rs:166-167.
const MAX_FILES: usize = 5_000;
const MAX_MATCHES: usize = 10_000;
const CONTEXT_LINES: usize = 2; // Zed default excerpt_context_lines.

#[derive(Default)]
pub struct SearchJobs(Mutex<HashMap<String, (String, Arc<AtomicBool>)>>);

fn is_link(meta: &fs::Metadata) -> bool {
    use std::os::windows::fs::MetadataExt;
    meta.file_type().is_symlink() || meta.file_attributes() & 0x400 != 0
}

fn roots(options: &Value) -> Result<Vec<PathBuf>, String> {
    let saved = crate::state::read(&crate::app_data_dir()?)?;
    let state: Value = serde_json::from_str(saved["json"].as_str().ok_or("No workspace folders")?).map_err(|error| error.to_string())?;
    let folders = state.pointer("/windows/0/folders").and_then(Value::as_array).ok_or("No workspace folders")?;
    let requested = options["roots"].as_array().ok_or("Missing workspace roots")?;
    requested.iter().map(|value| {
        let path = value.as_str().ok_or("Invalid workspace folder")?;
        if !folders.iter().any(|folder| folder["path"].as_str().is_some_and(|saved| saved.eq_ignore_ascii_case(path))) { return Err("Folder is outside workspace".into()); }
        let meta = fs::symlink_metadata(path).map_err(|error| error.to_string())?;
        if !meta.is_dir() || is_link(&meta) { return Err("Workspace root must be a folder, not a link".into()); }
        fs::canonicalize(path).map(|path| crate::files::normal_path(&path)).map_err(|error| error.to_string())
    }).collect()
}

fn safe_path(path: &Path, roots: &[PathBuf]) -> Result<PathBuf, String> {
    let path = crate::files::normal_path(path);
    let key = path.to_string_lossy().to_lowercase();
    let root = roots.iter().find(|root| {
        let prefix = root.to_string_lossy().to_lowercase();
        key == prefix || key.starts_with(&format!("{}\\", prefix.trim_end_matches('\\')))
    }).ok_or("Path is outside workspace")?;
    let mut current = root.clone();
    for component in path.components().skip(root.components().count()) {
        if !matches!(component, std::path::Component::Normal(name) if !name.to_string_lossy().contains(':')) { return Err("Invalid search path".into()); }
        current.push(component);
        if is_link(&fs::symlink_metadata(&current).map_err(|error| error.to_string())?) { return Err("Links are not searched".into()); }
    }
    let canonical = crate::files::normal_path(&fs::canonicalize(path).map_err(|error| error.to_string())?);
    if !canonical.starts_with(root) { return Err("Path is outside workspace".into()); }
    Ok(canonical)
}

fn decode(bytes: &[u8]) -> Option<String> {
    if bytes.starts_with(&[0xff, 0xfe]) || bytes.starts_with(&[0xfe, 0xff]) {
        let encoding = if bytes[0] == 0xff { encoding_rs::UTF_16LE } else { encoding_rs::UTF_16BE };
        let (text, _, invalid) = encoding.decode(bytes);
        return (!invalid && !text.contains('\0')).then(|| text.replace("\r\n", "\n").replace('\r', "\n"));
    }
    if bytes.contains(&0) { return None; }
    let bytes = bytes.strip_prefix(&[0xef, 0xbb, 0xbf]).unwrap_or(bytes);
    let text = match std::str::from_utf8(bytes) {
        Ok(text) => text.into(),
        Err(_) => {
            let (text, _, invalid) = encoding_rs::EUC_KR.decode(bytes);
            if invalid { return None; }
            text
        }
    };
    Some(text.replace("\r\n", "\n").replace('\r', "\n"))
}

fn file_matches(path: &Path, text: &str, pattern: &regex::Regex, remaining: usize, cancelled: &AtomicBool) -> Option<Value> {
    let mut matches = Vec::new();
    let mut matched_lines = HashSet::new();
    let lines: Vec<_> = text.split('\n').collect();
    let mut offset = 0;
    let starts: Vec<_> = lines.iter().map(|line| { let start = offset; offset += line.len() + 1; start }).collect();
    for found in pattern.find_iter(text).take(remaining) {
        if cancelled.load(Ordering::Relaxed) { return None; }
        let row = starts.partition_point(|start| *start <= found.start()).saturating_sub(1);
        let end_row = starts.partition_point(|start| *start <= found.end()).saturating_sub(1);
        matches.push(json!({"line": row + 1, "column": text[starts[row]..found.start()].encode_utf16().count() + 1,
            "endLine": end_row + 1, "endColumn": text[starts[end_row]..found.end()].encode_utf16().count() + 1}));
        for line in row..=end_row { matched_lines.insert(line); }
    }
    if matches.is_empty() { return None; }
    let mut excerpts = Vec::new();
    for (row, line) in lines.iter().enumerate() {
        if !(row.saturating_sub(CONTEXT_LINES)..=(row + CONTEXT_LINES).min(lines.len() - 1)).any(|n| matched_lines.contains(&n)) { continue; }
        let spans: Vec<_> = matches.iter().filter_map(|found| {
            let start_row = found["line"].as_u64()? as usize - 1;
            let end_row = found["endLine"].as_u64()? as usize - 1;
            (start_row <= row && row <= end_row).then(|| json!([
                if row == start_row { found["column"].as_u64().unwrap_or(1) - 1 } else { 0 },
                if row == end_row { found["endColumn"].as_u64().unwrap_or(1) - 1 } else { line.encode_utf16().count() as u64 }
            ]))
        }).collect();
        excerpts.push(json!({"number": row + 1, "text": line, "spans": spans}));
    }
    Some(json!({"path": path.to_string_lossy(), "matches": matches, "lines": excerpts}))
}

fn search(roots: &[PathBuf], options: &Value, cancelled: &AtomicBool, mut emit: impl FnMut(Value) -> bool) -> Result<(), String> {
    let query = options["query"].as_str().ok_or("Missing search query")?;
    if query.is_empty() { return Ok(()); }
    let flag = |key: &str| options[key].as_bool().unwrap_or(false);
    let mut source = if flag("regex") { query.to_string() } else { regex::escape(query) };
    if flag("word") { source = format!(r"\b(?:{source})\b"); }
    let pattern = RegexBuilder::new(&source).case_insensitive(!flag("caseSensitive")).multi_line(true).build().map_err(|error| error.to_string())?;
    let mut open = HashMap::new();
    if let Some(files) = options["openFiles"].as_array() {
        for file in files {
            let path = file["path"].as_str().ok_or("Invalid open file")?;
            let path = safe_path(Path::new(path), roots)?;
            let text = file["text"].as_str().ok_or("Invalid open file text")?;
            open.insert(path, text.to_string());
        }
    }
    let mut seen = HashSet::new();
    let mut matched_files = 0;
    let mut matched_ranges = 0;
    for root in roots {
        let mut overrides = OverrideBuilder::new(root);
        for (key, exclude) in [("include", false), ("exclude", true)] {
            for glob in options[key].as_str().unwrap_or("").split(',').map(str::trim).filter(|s| !s.is_empty()) {
                overrides.add(&format!("{}{glob}", if exclude { "!" } else { "" })).map_err(|error| error.to_string())?;
            }
        }
        let overrides = overrides.build().map_err(|error| error.to_string())?;
        let mut walk = WalkBuilder::new(root);
        walk.follow_links(false).overrides(overrides).sort_by_file_path(|a, b| a.cmp(b));
        if flag("ignored") { walk.git_ignore(false).git_global(false).git_exclude(false).ignore(false); }
        for entry in walk.build() {
            if cancelled.load(Ordering::Relaxed) { return Ok(()); }
            let entry = entry.map_err(|error| error.to_string())?;
            if !entry.file_type().is_some_and(|kind| kind.is_file()) { continue; }
            let path = safe_path(entry.path(), roots)?;
            if !seen.insert(path.clone()) || (flag("onlyOpen") && !open.contains_key(&path)) { continue; }
            let text = match open.get(&path) {
                Some(text) => text.clone(),
                None => {
                    let bytes = fs::read(&path).map_err(|error| format!("{}: {error}", path.display()))?;
                    let Some(text) = decode(&bytes) else { continue };
                    text
                }
            };
            if let Some(result) = file_matches(&path, &text, &pattern, MAX_MATCHES - matched_ranges, cancelled) {
                matched_files += 1;
                matched_ranges += result["matches"].as_array().map_or(0, Vec::len);
                if !emit(json!({"kind": "file", "file": result})) { return Ok(()); }
                if matched_files >= MAX_FILES || matched_ranges >= MAX_MATCHES {
                    emit(json!({"kind": "limit"}));
                    return Ok(());
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn project_search(window: tauri::WebviewWindow, jobs: tauri::State<'_, SearchJobs>, options: Value, on_event: Channel<Value>) -> Result<(), String> {
    let cancelled = Arc::new(AtomicBool::new(false));
    let id = options["id"].as_str().ok_or("Missing search id")?.to_string();
    {
        let mut jobs = jobs.0.lock().map_err(|error| error.to_string())?;
        if let Some((_, previous)) = jobs.insert(window.label().to_string(), (id, cancelled.clone())) { previous.store(true, Ordering::Relaxed); }
    }
    tauri::async_runtime::spawn_blocking(move || {
        let result = roots(&options).and_then(|roots| search(&roots, &options, &cancelled, |event| on_event.send(event).is_ok()));
        on_event.send(if cancelled.load(Ordering::Relaxed) { json!({"kind": "error", "message": "Search cancelled."}) }
            else { match result { Ok(()) => json!({"kind": "done"}), Err(error) => json!({"kind": "error", "message": error}) } }).map_err(|error| error.to_string())?;
        Ok(())
    }).await.map_err(|error| error.to_string())?
}

#[tauri::command]
pub fn cancel_project_search(window: tauri::WebviewWindow, jobs: tauri::State<'_, SearchJobs>, id: String) -> Result<(), String> {
    let mut jobs = jobs.0.lock().map_err(|error| error.to_string())?;
    if jobs.get(window.label()).is_some_and(|(running, _)| *running == id) {
        if let Some((_, job)) = jobs.remove(window.label()) { job.store(true, Ordering::Relaxed); }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn filters_unicode_options_binary_and_scope() {
        assert_eq!(decode(b"one\rtwo").as_deref(), Some("one\ntwo"));
        for bytes in [include_bytes!("../../test-fixtures/encoding/utf16le-bom.txt").as_slice(), include_bytes!("../../test-fixtures/encoding/cp949.txt").as_slice()] {
            assert_eq!(decode(bytes).as_deref(), Some("한글 A\n둘째 줄\n"));
        }
        let root = std::env::temp_dir().join(format!("workbench-search-{}", std::process::id()));
        fs::create_dir_all(root.join(".git")).unwrap();
        fs::create_dir_all(root.join("src")).unwrap();
        fs::write(root.join(".gitignore"), "ignored.txt\n").unwrap();
        fs::write(root.join("src/a.txt"), "zero\none\n가😀 word WORD words\nthree\nfour\nfive").unwrap();
        fs::write(root.join("ignored.txt"), "word").unwrap();
        fs::write(root.join("binary"), b"word\0binary").unwrap();
        let root = crate::files::normal_path(&fs::canonicalize(root).unwrap());
        let cancelled = AtomicBool::new(false);
        let mut events = Vec::new();
        search(std::slice::from_ref(&root), &json!({"query":"word", "word":true}), &cancelled, |e| { events.push(e); true }).unwrap();
        assert_eq!(events.len(), 1);
        assert_eq!(events[0]["file"]["matches"].as_array().unwrap().len(), 2);
        assert_eq!(events[0]["file"]["matches"][0]["column"], 5);
        assert_eq!(events[0]["file"]["lines"].as_array().unwrap().len(), 5);
        events.clear();
        search(std::slice::from_ref(&root), &json!({"query":"W.RD", "regex":true, "caseSensitive":true, "include":"src/**/*.txt", "exclude":"ignored.txt"}), &cancelled, |e| { events.push(e); true }).unwrap();
        assert_eq!(events[0]["file"]["matches"].as_array().unwrap().len(), 1);
        events.clear();
        search(std::slice::from_ref(&root), &json!({"query":"word", "ignored":true}), &cancelled, |e| { events.push(e); true }).unwrap();
        assert_eq!(events.len(), 2);
        assert!(safe_path(&root.join("../outside"), std::slice::from_ref(&root)).is_err());
        assert!(search(std::slice::from_ref(&root), &json!({"query":"[", "regex":true}), &cancelled, |_| true).is_err());
        cancelled.store(true, Ordering::Relaxed);
        search(std::slice::from_ref(&root), &json!({"query":"word"}), &cancelled, |_| panic!("cancelled search emitted")).unwrap();
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn open_buffers_limits_and_links() {
        let root = std::env::temp_dir().join(format!("workbench-search-open-{}", std::process::id()));
        fs::create_dir(&root).unwrap();
        fs::write(root.join("a.txt"), "disk").unwrap();
        fs::write(root.join("b.txt"), "draft").unwrap();
        let root = crate::files::normal_path(&fs::canonicalize(root).unwrap());
        let cancelled = AtomicBool::new(false);
        let mut events = Vec::new();
        let options = json!({"query":"draft", "onlyOpen":true, "openFiles":[{"path":root.join("a.txt"),"text":"draft"}]});
        search(std::slice::from_ref(&root), &options, &cancelled, |event| { events.push(event); true }).unwrap();
        assert_eq!(events.len(), 1);
        assert!(events[0]["file"]["path"].as_str().unwrap().ends_with("a.txt"));
        assert_eq!(fs::read_to_string(root.join("a.txt")).unwrap(), "disk");
        let literal = RegexBuilder::new("draft").build().unwrap();
        let limited = file_matches(&root.join("a.txt"), "draft draft", &literal, 1, &cancelled).unwrap();
        assert_eq!(limited["matches"].as_array().unwrap().len(), 1);
        assert!(safe_path(&root.join("../a.txt"), std::slice::from_ref(&root)).is_err());
        assert!(safe_path(&PathBuf::from(root.join("a.txt").to_string_lossy().to_ascii_uppercase()), std::slice::from_ref(&root)).is_ok());
        let link = root.join("link");
        let result = std::process::Command::new("cmd").args(["/C", "mklink", "/J"]).arg(&link).arg(&root).output().unwrap();
        assert!(result.status.success(), "{}", String::from_utf8_lossy(&result.stderr));
        assert!(safe_path(&link.join("a.txt"), std::slice::from_ref(&root)).is_err());
        events.clear();
        search(std::slice::from_ref(&root), &options, &cancelled, |event| { events.push(event); true }).unwrap();
        assert_eq!(events.len(), 1, "junction must not be traversed");
        fs::remove_dir(&link).unwrap();
        fs::remove_dir_all(root).unwrap();
    }
}

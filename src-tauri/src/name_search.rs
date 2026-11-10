use ignore::WalkBuilder;
use serde_json::{json, Value};
use std::{collections::HashSet, fs, path::{Path, PathBuf}};
use tauri::ipc::Channel;

const MAX_FILES: usize = 5_000; // Existing search result limit.
// shortcut: regexp runs in the page (no regex crate), so Rust streams every name; scan at most this many, raise if trees get bigger.
const MAX_SCAN: usize = 100_000;

/// What the name must satisfy. `all` lets every name through for the page to filter (regexp mode).
#[derive(Clone, Copy, Default)]
struct Filter { case_sensitive: bool, whole_word: bool, all: bool }

impl Filter {
    fn from_options(options: &Value) -> Self {
        let flag = |key: &str| options[key].as_bool().unwrap_or(false);
        Filter { case_sensitive: flag("caseSensitive"), whole_word: flag("wholeWord"), all: flag("all") }
    }
}

fn is_link(meta: &fs::Metadata) -> bool {
    use std::os::windows::fs::MetadataExt;
    meta.file_type().is_symlink() || meta.file_attributes() & 0x400 != 0
}

fn roots(label: &str, options: &Value) -> Result<Vec<PathBuf>, String> {
    let saved = crate::state::read(&crate::app_data_dir()?)?;
    let state: Value = serde_json::from_str(saved["json"].as_str().ok_or("No workspace folders")?).map_err(|error| error.to_string())?;
    roots_in_state(&state, label, options)
}

fn roots_in_state(state: &Value, label: &str, options: &Value) -> Result<Vec<PathBuf>, String> {
    let folders = crate::state::window_folders(state, label)?;
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

fn is_word(c: char) -> bool { c.is_alphanumeric() || c == '_' }

/// `query` is already lowercased unless the filter is case sensitive. Substring match; whole word needs a non-word char (or an edge) on both sides.
fn name_matches(name: &str, query: &str, filter: Filter) -> bool {
    if filter.all { return true; }
    let name = if filter.case_sensitive { name.to_string() } else { name.to_lowercase() };
    name.match_indices(query).any(|(start, found)| {
        !filter.whole_word
            || (!name[..start].chars().next_back().is_some_and(is_word) && !name[start + found.len()..].chars().next().is_some_and(is_word))
    })
}

fn search(roots: &[PathBuf], query: &str, filter: Filter, mut emit: impl FnMut(Value) -> bool) -> Result<(), String> {
    if query.is_empty() && !filter.all { return Ok(()); }
    let query = if filter.case_sensitive { query.to_string() } else { query.to_lowercase() };
    let limit = if filter.all { MAX_SCAN } else { MAX_FILES };
    let mut seen = HashSet::new();
    let mut count = 0;
    for root in roots {
        let mut walk = WalkBuilder::new(root);
        walk.follow_links(false).hidden(false).git_ignore(false).git_global(false).git_exclude(false).ignore(false)
            .sort_by_file_path(|a, b| a.cmp(b))
            .filter_entry(|entry| entry.path().symlink_metadata().is_ok_and(|meta| !is_link(&meta)));
        for entry in walk.build() {
            let entry = entry.map_err(|error| error.to_string())?;
            let Some(kind) = entry.file_type() else { continue };
            if entry.depth() == 0 || !(kind.is_file() || kind.is_dir()) || !name_matches(&entry.file_name().to_string_lossy(), &query, filter) { continue; }
            let path = safe_path(entry.path(), roots)?;
            if !seen.insert(path.to_string_lossy().to_lowercase()) { continue; }
            if !emit(json!({"kind":"entry", "entry":{"path":path.to_string_lossy(), "isDir":kind.is_dir()}})) { return Ok(()); }
            count += 1;
            if count >= limit { emit(json!({"kind":"limit"})); return Ok(()); }
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn search_names(window: tauri::WebviewWindow, options: Value, on_event: Channel<Value>) -> Result<(), String> {
    let label = window.label().to_string();
    tauri::async_runtime::spawn_blocking(move || {
        let query = options["query"].as_str().ok_or("Missing search query")?;
        let filter = Filter::from_options(&options);
        let result = roots(&label, &options).and_then(|roots| search(&roots, query, filter, |event| on_event.send(event).is_ok()));
        on_event.send(match result { Ok(()) => json!({"kind":"done"}), Err(error) => json!({"kind":"error", "message":error}) }).map_err(|error| error.to_string())
    }).await.map_err(|error| error.to_string())?
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn roots_belong_to_the_calling_window() {
        let base = std::env::temp_dir().join(format!("workbench-search-windows-{}", std::process::id()));
        let first = base.join("first");
        let second = base.join("second");
        fs::create_dir_all(&first).unwrap();
        fs::create_dir_all(&second).unwrap();
        let state = json!({"windows":[{"id":"w1","folders":[{"path":first}]},{"id":"w2","folders":[{"path":second}]}]});
        assert_eq!(roots_in_state(&state, "main", &json!({"roots":[first]})).unwrap(), vec![crate::files::normal_path(&fs::canonicalize(&first).unwrap())]);
        assert_eq!(roots_in_state(&state, "w2", &json!({"roots":[second]})).unwrap(), vec![crate::files::normal_path(&fs::canonicalize(&second).unwrap())]);
        assert!(roots_in_state(&state, "w2", &json!({"roots":[first]})).is_err());
        assert!(roots_in_state(&state, "main", &json!({"roots":[second]})).is_err());
        assert!(roots_in_state(&state, "missing", &json!({"roots":[first]})).is_err());
        fs::remove_dir_all(base).unwrap();
    }

    #[test]
    fn options_filter_names_by_case_and_word_boundary() {
        let names = ["Readme.md", "readme-old.md", "my_read.txt", "read.md", "to-read"];
        let hits = |query: &str, filter: Filter| names.iter().copied().filter(|name| name_matches(name, query, filter)).collect::<Vec<_>>();
        let off = Filter::default();
        assert_eq!(hits("read", off), names); // default: case-insensitive substring
        assert_eq!(hits("read", Filter { case_sensitive: true, ..off }), ["readme-old.md", "my_read.txt", "read.md", "to-read"]);
        // Word characters include "_", so "my_read" is not a boundary; "Readme" / "readme" are longer words.
        assert_eq!(hits("read", Filter { whole_word: true, ..off }), ["read.md", "to-read"]);
        assert_eq!(hits("Read", Filter { whole_word: true, case_sensitive: true, ..off }), Vec::<&str>::new());
        assert!(hits("(", Filter { all: true, ..off }).len() == names.len()); // regexp mode: the page filters
    }

    #[test]
    fn names_are_substrings_and_search_never_reads_file_contents() {
        let plain = Filter::default();
        for name in ["README.md", "thread.ts", "reader"] { assert!(name_matches(name, "read", plain)); }
        assert!(!name_matches("README.md", "rdm", plain));
        let root = std::env::temp_dir().join(format!("workbench-name-search-{}", std::process::id()));
        fs::create_dir_all(root.join("reader")).unwrap();
        fs::write(root.join("README.md"), [0, 255]).unwrap();
        fs::write(root.join("thread.ts"), "").unwrap();
        fs::write(root.join("other.txt"), "read").unwrap();
        let root = crate::files::normal_path(&fs::canonicalize(root).unwrap());
        let mut entries = Vec::new();
        search(&[root.clone(), root.join("reader")], "READ", Filter::default(), |event| { entries.push(event); true }).unwrap();
        assert_eq!(entries.len(), 3);
        assert_eq!(entries.iter().filter(|entry| entry["entry"]["isDir"] == true).count(), 1);
        assert!(entries.iter().all(|entry| !entry["entry"]["path"].as_str().unwrap().ends_with("other.txt")));
        assert!(safe_path(&root.join("..\\outside"), std::slice::from_ref(&root)).is_err());
        search(std::slice::from_ref(&root), "", Filter::default(), |_| panic!("empty query must not match")).unwrap();
        fs::remove_dir_all(root).unwrap();
    }
}

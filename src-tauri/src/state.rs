use std::{fs, io::{self, Write}, os::windows::ffi::OsStrExt, path::Path, sync::Mutex, time::Duration};
use windows::{core::PCWSTR, Win32::{Foundation::SYSTEMTIME, Storage::FileSystem::{MoveFileExW, ReplaceFileW, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, REPLACE_FILE_FLAGS}}};

const STATE_VERSION: u64 = 1;
const APP_STATE_BAD_MAX_KEEP: usize = 3; // app.state_bad_max_keep
const APP_STATE_REPLACE_RETRY_DELAY: Duration = Duration::from_millis(50); // app.state_replace_retry_delay
const APP_STATE_REPLACE_RETRY_COUNT: usize = 3; // app.state_replace_retry_count
const SAVE_ERROR: &str = "Could not save the window state.";
const READ_NOTICE: &str = "Could not read the window state.";
static STATE_LOCK: Mutex<()> = Mutex::new(());

#[link(name = "kernel32")]
extern "system" {
    fn GetLocalTime(time: *mut SYSTEMTIME);
}

fn timestamp() -> String {
    let mut time = SYSTEMTIME::default();
    unsafe { GetLocalTime(&mut time) };
    format!("{:04}{:02}{:02}-{:02}{:02}{:02}", time.wYear, time.wMonth, time.wDay, time.wHour, time.wMinute, time.wSecond)
}

fn archive_bad(dir: &Path, stamp: &str) -> io::Result<()> {
    let prefix = format!("state.json.bad-{stamp}");
    let mut suffix = 1;
    for entry in fs::read_dir(dir)? {
        let name = entry?.file_name().to_string_lossy().into_owned();
        if name == prefix { suffix = suffix.max(2); }
        if let Some(number) = name.strip_prefix(&format!("{prefix}-")).and_then(|s| s.parse::<usize>().ok()) {
            suffix = suffix.max(number.saturating_add(1));
        }
    }
    loop {
        let name = if suffix == 1 { format!("state.json.bad-{stamp}") } else { format!("state.json.bad-{stamp}-{suffix}") };
        let source: Vec<u16> = dir.join("state.json").as_os_str().encode_wide().chain(Some(0)).collect();
        let destination: Vec<u16> = dir.join(name).as_os_str().encode_wide().chain(Some(0)).collect();
        let result = unsafe { MoveFileExW(PCWSTR(source.as_ptr()), PCWSTR(destination.as_ptr()), Default::default()) };
        match result.map_err(io::Error::from) {
            Ok(()) => break,
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => suffix += 1,
            Err(error) => return Err(error),
        }
    }
    let mut backups = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().into_owned();
        if let Some(rest) = name.strip_prefix("state.json.bad-") {
            let stamp = rest.get(..15);
            let suffix = rest.get(15..).and_then(|tail| if tail.is_empty() { Some(1) } else { tail.strip_prefix('-')?.parse::<usize>().ok().filter(|n| *n >= 2) });
            if let (Some(stamp), Some(suffix)) = (stamp, suffix) {
                if stamp.len() == 15 && stamp.chars().enumerate().all(|(i, c)| if i == 8 { c == '-' } else { c.is_ascii_digit() }) && entry.file_type()?.is_file() {
                    backups.push((stamp.to_string(), suffix, entry.path()));
                }
            }
        }
    }
    backups.sort();
    for (_, _, path) in backups.iter().take(backups.len().saturating_sub(APP_STATE_BAD_MAX_KEEP)) {
        fs::remove_file(path)?;
    }
    Ok(())
}

enum FileState {
    Missing,
    Invalid,
    Valid(String, serde_json::Value),
}

fn load(path: &Path) -> io::Result<FileState> {
    let bytes = match fs::read(path) {
        Ok(bytes) => bytes,
        Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(FileState::Missing),
        Err(error) => return Err(error),
    };
    let Ok(text) = String::from_utf8(bytes) else { return Ok(FileState::Invalid) };
    match serde_json::from_str(&text) {
        Ok(value) => Ok(FileState::Valid(text, value)),
        Err(_) => Ok(FileState::Invalid),
    }
}

fn newer(value: &serde_json::Value) -> bool {
    value.get("version").and_then(serde_json::Value::as_f64).is_some_and(|version| version > STATE_VERSION as f64)
}

pub fn read(dir: &Path) -> Result<serde_json::Value, String> {
    let _guard = STATE_LOCK.lock().map_err(|e| e.to_string())?;
    read_inner(dir)
}

fn read_inner(dir: &Path) -> Result<serde_json::Value, String> {
    let primary = load(&dir.join("state.json")).map_err(|e| e.to_string())?;
    let bad = matches!(primary, FileState::Invalid);
    if bad { archive_bad(dir, &timestamp()).map_err(|e| e.to_string())?; }
    let selected = match primary {
        FileState::Valid(text, value) => Some((text, value)),
        _ => match load(&dir.join("state.json.tmp")).map_err(|e| e.to_string())? {
            FileState::Valid(text, value) => Some((text, value)),
            _ => None,
        },
    };
    let writable = selected.as_ref().is_none_or(|(_, value)| !newer(value));
    Ok(serde_json::json!({ "json": selected.map(|(text, _)| text), "notice": if bad { Some(READ_NOTICE) } else { None }, "writable": writable }))
}

pub fn write(dir: &Path, json: &str) -> Result<(), String> {
    let _guard = STATE_LOCK.lock().map_err(|_| SAVE_ERROR.to_string())?;
    write_inner(dir, json).map_err(|_| SAVE_ERROR.to_string())
}

fn write_inner(dir: &Path, json: &str) -> Result<(), Box<dyn std::error::Error>> {
    serde_json::from_str::<serde_json::Value>(json)?;
    let current = load(&dir.join("state.json"))?;
    let current = match current {
        FileState::Missing | FileState::Invalid => load(&dir.join("state.json.tmp"))?,
        valid => valid,
    };
    if matches!(current, FileState::Valid(_, ref value) if newer(value)) {
        return Err("State version is newer".into());
    }
    fs::create_dir_all(dir)?;
    let tmp = dir.join("state.json.tmp");
    let target = dir.join("state.json");
    let mut file = fs::File::create(&tmp)?;
    file.write_all(json.as_bytes())?;
    file.sync_all()?;
    drop(file);
    replace_file(&tmp, &target)?;
    Ok(())
}

pub(crate) fn replace_file(tmp: &Path, target: &Path) -> io::Result<()> {
    let tmp_w: Vec<u16> = tmp.as_os_str().encode_wide().chain(Some(0)).collect();
    let target_w: Vec<u16> = target.as_os_str().encode_wide().chain(Some(0)).collect();
    let mut last_error = None;
    for attempt in 0..=APP_STATE_REPLACE_RETRY_COUNT {
        let result = unsafe {
            if target.exists() {
                ReplaceFileW(PCWSTR(target_w.as_ptr()), PCWSTR(tmp_w.as_ptr()), PCWSTR::null(), REPLACE_FILE_FLAGS(0), None, None)
            } else {
                MoveFileExW(PCWSTR(tmp_w.as_ptr()), PCWSTR(target_w.as_ptr()), MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH)
            }
        };
        match result { Ok(()) => return Ok(()), Err(error) => last_error = Some(io::Error::from(error)) }
        if attempt < APP_STATE_REPLACE_RETRY_COUNT { std::thread::sleep(APP_STATE_REPLACE_RETRY_DELAY); }
    }
    Err(last_error.unwrap_or_else(|| io::Error::other(SAVE_ERROR)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    static NEXT: AtomicUsize = AtomicUsize::new(0);

    fn temp() -> std::path::PathBuf {
        let dir = std::env::temp_dir().join(format!("workbench-state-{}-{}", std::process::id(), NEXT.fetch_add(1, Ordering::Relaxed)));
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn write_first_and_replace() {
        let dir = temp();
        write(&dir, r#"{"version":1,"x":1}"#).unwrap();
        write(&dir, r#"{"version":1,"x":2}"#).unwrap();
        assert_eq!(fs::read_to_string(dir.join("state.json")).unwrap(), r#"{"version":1,"x":2}"#);
        assert!(!dir.join("state.json.tmp").exists());
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn recovers_tmp_and_rejects_newer_version() {
        let dir = temp();
        fs::write(dir.join("state.json.tmp"), r#"{"version":2}"#).unwrap();
        let result = read(&dir).unwrap();
        assert_eq!(result["json"], r#"{"version":2}"#);
        assert_eq!(result["writable"], false);
        assert!(write(&dir, "{}").is_err());
        fs::write(dir.join("state.json"), "broken").unwrap();
        let result = read(&dir).unwrap();
        assert_eq!(result["notice"], READ_NOTICE);
        assert_eq!(result["json"], r#"{"version":2}"#);
        assert_eq!(result["writable"], false);
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn archives_collisions_and_keeps_three() {
        let dir = temp();
        for _ in 0..5 {
            fs::write(dir.join("state.json"), "broken").unwrap();
            archive_bad(&dir, "20261106-120000").unwrap();
        }
        let names: Vec<_> = fs::read_dir(&dir).unwrap().map(|entry| entry.unwrap().file_name().to_string_lossy().into_owned()).collect();
        assert_eq!(names.len(), APP_STATE_BAD_MAX_KEEP);
        assert!(names.contains(&"state.json.bad-20261106-120000-5".to_string()));
        fs::remove_dir_all(dir).unwrap();
    }
}

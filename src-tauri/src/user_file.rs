use std::{fs, io::{self, Write}, path::Path, sync::Mutex};

static LOCK: Mutex<()> = Mutex::new(());

pub fn read(dir: &Path, name: &str) -> Result<Option<String>, String> {
    match fs::read_to_string(dir.join(name)) {
        Ok(text) => Ok(Some(text)),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

pub fn ensure(dir: &Path, name: &str, initial: &str) -> Result<String, String> {
    let _guard = LOCK.lock().map_err(|error| error.to_string())?;
    fs::create_dir_all(dir).map_err(|error| error.to_string())?;
    let path = dir.join(name);
    match fs::OpenOptions::new().write(true).create_new(true).open(&path) {
        Ok(mut file) => file.write_all(initial.as_bytes()).and_then(|()| file.sync_all()).map_err(|error| error.to_string())?,
        Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {},
        Err(error) => return Err(error.to_string()),
    }
    Ok(path.to_string_lossy().into_owned())
}

pub fn write(dir: &Path, name: &str, expected: Option<&str>, text: &str) -> Result<(), String> {
    let _guard = LOCK.lock().map_err(|error| error.to_string())?;
    if read(dir, name)?.as_deref() != expected {
        return Err(format!("{name} changed on disk. Reload and try again."));
    }
    fs::create_dir_all(dir).map_err(|error| error.to_string())?;
    let temporary = dir.join(format!("{name}.tmp"));
    let mut file = fs::OpenOptions::new().write(true).create_new(true).open(&temporary).map_err(|error| error.to_string())?;
    let result = (|| {
        file.write_all(text.as_bytes())?;
        file.sync_all()?;
        drop(file);
        // Recheck after writing the temporary file before replacing the user's file.
        if read(dir, name).map_err(io::Error::other)?.as_deref() != expected {
            return Err(io::Error::other(format!("{name} changed on disk. Reload and try again.")));
        }
        crate::state::replace_file(&temporary, &dir.join(name))
    })();
    if result.is_err() { let _ = fs::remove_file(&temporary); }
    result.map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn preserves_user_text_and_rejects_stale_updates() {
        let dir = std::env::temp_dir().join(format!("workbench-keymap-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        let text = "[\n// Keep this comment\n]\n";
        for (name, initial) in [("keymap.json", "[]\n"), ("settings.json", "{}\n")] {
            write(&dir, name, None, text).unwrap();
            assert_eq!(read(&dir, name).unwrap().as_deref(), Some(text));
            ensure(&dir, name, initial).unwrap();
            assert_eq!(read(&dir, name).unwrap().as_deref(), Some(text));
            assert!(write(&dir, name, None, initial).is_err());
            assert_eq!(read(&dir, name).unwrap().as_deref(), Some(text));
            write(&dir, name, Some(text), initial).unwrap();
            assert_eq!(read(&dir, name).unwrap().as_deref(), Some(initial));
        }
        fs::remove_dir_all(dir).unwrap();
    }
}

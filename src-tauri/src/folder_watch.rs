use std::{path::{Path, PathBuf}, sync::{Arc, Mutex}};
use notify::{event::{ModifyKind, RenameMode}, Event, EventKind, RecursiveMode, Watcher};
use tauri::Emitter;

#[derive(Default)]
pub struct FolderWatch(Mutex<Option<ActiveWatch>>);

type Sink = Arc<dyn Fn(Vec<String>) + Send + Sync>;
type RootWatcher = Arc<Mutex<Option<notify::RecommendedWatcher>>>;

struct ActiveWatch {
    _parent: Option<notify::RecommendedWatcher>,
    _root: RootWatcher,
}

fn relevant_paths(event: &Event, root: &Path, parent_watch: bool, previous: &mut Vec<PathBuf>) -> Vec<String> {
    if !matches!(event.kind, EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_)) {
        previous.clear();
        return Vec::new();
    }
    let mut paths = event.paths.clone();
    match event.kind {
        EventKind::Modify(ModifyKind::Name(RenameMode::From)) => *previous = paths.clone(),
        EventKind::Modify(ModifyKind::Name(RenameMode::To)) => {
            if !previous.is_empty() { paths.splice(0..0, previous.drain(..)); }
        }
        _ => previous.clear(),
    }
    let relevant = paths.iter().any(|path| {
        if parent_watch {
            path.parent() == root.parent() && path.file_name().zip(root.file_name())
                .is_some_and(|(name, expected)| name.eq_ignore_ascii_case(expected))
        } else { path.starts_with(root) }
    });
    if !relevant { return Vec::new(); }
    paths.iter().map(|path| crate::files::normal_path(path).to_string_lossy().into_owned()).collect()
}

fn watcher(root: PathBuf, sink: Sink) -> notify::Result<notify::RecommendedWatcher> {
    let mut previous = Vec::new();
    notify::recommended_watcher(move |result: notify::Result<Event>| match result {
        Ok(event) => {
            let paths = relevant_paths(&event, &root, false, &mut previous);
            if !paths.is_empty() { sink(paths); }
        }
        Err(error) => eprintln!("Folder watch error: {error}"),
    })
}

fn arm_root(root: &Path, sink: &Sink, state: &RootWatcher) -> Result<(), String> {
    let mut current = state.lock().map_err(|e| e.to_string())?;
    *current = None;
    let mut recursive = watcher(root.to_owned(), sink.clone()).map_err(|e| e.to_string())?;
    recursive.watch(root, RecursiveMode::Recursive).map_err(|e| e.to_string())?;
    *current = Some(recursive);
    Ok(())
}

fn start(root: PathBuf, sink: Sink) -> Result<ActiveWatch, String> {
    let recursive: RootWatcher = Arc::new(Mutex::new(None));
    let parent = if let Some(parent) = root.parent() {
        let callback_root = root.clone();
        let callback_sink = sink.clone();
        let callback_recursive = recursive.clone();
        let mut previous = Vec::new();
        let mut parent_watcher = notify::recommended_watcher(move |result: notify::Result<Event>| match result {
            Ok(event) => {
                let paths = relevant_paths(&event, &callback_root, true, &mut previous);
                if paths.is_empty() { return; }
                let appeared = matches!(event.kind, EventKind::Create(_) | EventKind::Modify(ModifyKind::Name(RenameMode::To | RenameMode::Both)))
                    && event.paths.last().is_some_and(|path| path.parent() == callback_root.parent()
                        && path.file_name().zip(callback_root.file_name()).is_some_and(|(a, b)| a.eq_ignore_ascii_case(b)));
                if appeared && callback_root.is_dir() {
                    if let Err(error) = arm_root(&callback_root, &callback_sink, &callback_recursive) {
                        eprintln!("Failed to resume folder watch: {error}");
                    }
                    callback_sink(vec![crate::files::normal_path(&callback_root).to_string_lossy().into_owned()]);
                } else {
                    callback_sink(paths);
                }
            }
            Err(error) => eprintln!("Folder parent watch error: {error}"),
        }).map_err(|e| e.to_string())?;
        parent_watcher.watch(parent, RecursiveMode::NonRecursive).map_err(|e| e.to_string())?;
        Some(parent_watcher)
    } else { None };
    if root.is_dir() {
        // A parent event may have armed the watcher while it was being installed.
        let mut current = recursive.lock().map_err(|e| e.to_string())?;
        if current.is_none() {
            let mut initial = watcher(root.clone(), sink).map_err(|e| e.to_string())?;
            match initial.watch(&root, RecursiveMode::Recursive) {
                Ok(()) => *current = Some(initial),
                Err(error) if root.exists() => return Err(error.to_string()),
                Err(_) => {}
            }
        }
    } else if root.exists() {
        return Err("Watch path is not a folder".into());
    } else if parent.is_none() {
        return Err("Cannot watch a missing root without a parent".into());
    }
    Ok(ActiveWatch { _parent: parent, _root: recursive })
}

#[tauri::command]
pub fn watch_folder(app: tauri::AppHandle, state: tauri::State<'_, FolderWatch>, path: Option<String>) -> Result<(), String> {
    let mut current = state.0.lock().map_err(|error| error.to_string())?;
    *current = None;
    let Some(path) = path else { return Ok(()) };
    let mut root = crate::files::normal_path(Path::new(&path));
    if !root.is_absolute() { root = std::env::current_dir().map_err(|e| e.to_string())?.join(root); }
    let sink: Sink = Arc::new(move |paths| {
        if let Err(error) = app.emit("fs-changed", serde_json::json!({ "paths": paths })) {
            eprintln!("Failed to emit filesystem change: {error}");
        }
    });
    *current = Some(start(root, sink)?);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{fs, sync::mpsc, time::{Duration, Instant}};

    #[test]
    fn parent_filters_root_and_preserves_rename_paths() {
        let root = Path::new(r"C:\work\project");
        let mut previous = Vec::new();
        let from = Event::new(EventKind::Modify(ModifyKind::Name(RenameMode::From))).add_path(root.into());
        let to = Event::new(EventKind::Modify(ModifyKind::Name(RenameMode::To))).add_path(r"C:\work\renamed".into());
        assert_eq!(relevant_paths(&from, root, true, &mut previous), vec![r"C:\work\project"]);
        assert_eq!(relevant_paths(&to, root, true, &mut previous), vec![r"C:\work\project", r"C:\work\renamed"]);
        let other = Event::new(EventKind::Create(notify::event::CreateKind::Any)).add_path(r"C:\work\other".into());
        assert!(relevant_paths(&other, root, true, &mut previous).is_empty());
    }

    #[test]
    fn recursive_rename_keeps_both_paths() {
        let root = Path::new(r"C:\work\project");
        let mut previous = Vec::new();
        let event = Event::new(EventKind::Modify(ModifyKind::Name(RenameMode::Both)))
            .add_path(r"\\?\C:\work\project\old".into()).add_path(r"\\?\C:\work\project\new".into());
        let verbatim_root = Path::new(r"\\?\C:\work\project");
        assert_eq!(relevant_paths(&event, verbatim_root, false, &mut previous), vec![r"C:\work\project\old", r"C:\work\project\new"]);
        let old = Event::new(EventKind::Modify(ModifyKind::Name(RenameMode::From))).add_path(root.join("old"));
        let new = Event::new(EventKind::Modify(ModifyKind::Name(RenameMode::To))).add_path(root.join("new"));
        assert_eq!(relevant_paths(&old, root, false, &mut previous), vec![r"C:\work\project\old"]);
        assert_eq!(relevant_paths(&new, root, false, &mut previous), vec![r"C:\work\project\old", r"C:\work\project\new"]);
    }

    #[test]
    fn missing_root_is_watched_after_creation_and_recreation() {
        let parent = std::env::temp_dir().join(format!("workbench-watch-{}", std::process::id()));
        fs::create_dir(&parent).unwrap();
        struct TestDir(PathBuf);
        impl Drop for TestDir { fn drop(&mut self) { let _ = fs::remove_dir_all(&self.0); } }
        let _cleanup = TestDir(parent.clone());
        let root = parent.join("root");
        let callback_root = root.clone();
        let (tx, rx) = mpsc::channel();
        let sink: Sink = Arc::new(move |paths| { let _ = tx.send((paths, callback_root.is_dir())); });
        let watch = start(root.clone(), sink).unwrap();
        let wait_for = |path: &Path, exists: bool| {
            let deadline = Instant::now() + Duration::from_secs(5);
            loop {
                let remaining = deadline.saturating_duration_since(Instant::now());
                let (paths, present) = rx.recv_timeout(remaining).expect("expected filesystem event");
                if present == exists && paths.iter().any(|p| Path::new(p) == path) { break; }
            }
        };
        fs::create_dir(&root).unwrap();
        wait_for(&root, true);
        let first = root.join("first.txt");
        fs::write(&first, "first").unwrap();
        wait_for(&first, true);
        fs::remove_dir_all(&root).unwrap();
        wait_for(&root, false);
        fs::create_dir(&root).unwrap();
        wait_for(&root, true);
        let second = root.join("second.txt");
        fs::write(&second, "second").unwrap();
        wait_for(&second, true);
        let moved = parent.join("moved");
        fs::rename(&root, &moved).unwrap();
        wait_for(&root, false);
        fs::rename(&moved, &root).unwrap();
        wait_for(&root, true);
        let third = root.join("third.txt");
        fs::write(&third, "third").unwrap();
        wait_for(&third, true);
        drop(watch);
    }
}

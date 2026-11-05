use std::{collections::BTreeMap, ffi::{c_void, OsStr, OsString}, fs, io, os::windows::{ffi::OsStrExt, fs::OpenOptionsExt, io::{AsRawHandle, FromRawHandle}}, path::{Path, PathBuf}, time::SystemTime};
use windows::{core::PCWSTR, Win32::{Foundation::{HANDLE, HWND, ERROR_NOT_SAME_DEVICE}, Storage::FileSystem::{MoveFileExW, GetFileInformationByHandle, GetFileInformationByHandleEx, SetFileInformationByHandle, BY_HANDLE_FILE_INFORMATION, FILE_DISPOSITION_INFO, FILE_STREAM_INFO, FileDispositionInfo, FileStreamInfo, DELETE, FILE_READ_ATTRIBUTES, FILE_FLAG_BACKUP_SEMANTICS, FILE_FLAG_OPEN_REPARSE_POINT}, UI::{Controls::{TaskDialogIndirect, TASKDIALOGCONFIG, TASKDIALOGCONFIG_0, TASKDIALOG_BUTTON, TDCBF_CANCEL_BUTTON, TD_WARNING_ICON}, WindowsAndMessaging::{IDCANCEL, IDOK}}}};

fn io_error(error: impl std::fmt::Display) -> String { error.to_string() }

#[tauri::command]
pub async fn list_dir(path: String) -> Result<Vec<serde_json::Value>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        fs::read_dir(path)?.map(|entry| {
            let entry = entry?;
            Ok(serde_json::json!({"name": entry.file_name().to_string_lossy(), "is_dir": entry.file_type()?.is_dir()}))
        }).collect::<io::Result<Vec<_>>>()
    }).await.map_err(io_error)?.map_err(io_error)
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<tauri::ipc::Response, String> {
    let bytes = tauri::async_runtime::spawn_blocking(move || fs::read(path)).await.map_err(io_error)?.map_err(io_error)?;
    Ok(tauri::ipc::Response::new(bytes))
}

#[tauri::command]
pub async fn create_file(path: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || fs::File::options().write(true).create_new(true).open(path).map(|_| ())).await.map_err(io_error)?.map_err(io_error)
}

#[tauri::command]
pub async fn create_dir(path: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || fs::create_dir(path)).await.map_err(io_error)?.map_err(io_error)
}

fn rename_exclusive(from: &Path, to: &Path) -> io::Result<()> {
    let from: Vec<u16> = from.as_os_str().encode_wide().chain(Some(0)).collect();
    let to: Vec<u16> = to.as_os_str().encode_wide().chain(Some(0)).collect();
    unsafe { MoveFileExW(PCWSTR(from.as_ptr()), PCWSTR(to.as_ptr()), Default::default()) }.map_err(win32_error)
}

fn win32_error(error: windows::core::Error) -> io::Error {
    let code = error.code().0 as u32;
    let win32_facility = 0xffff_0000;
    let win32_failure = 0x8007_0000;
    if code & win32_facility == win32_failure { io::Error::from_raw_os_error((code & 0xffff) as i32) }
    else { io::Error::from_raw_os_error(code as i32) }
}

#[tauri::command]
pub async fn rename_path(from: String, to: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || rename_exclusive(Path::new(&from), Path::new(&to))).await.map_err(io_error)?.map_err(io_error)
}

fn remove(path: &Path) -> io::Result<()> {
    let kind = fs::symlink_metadata(path)?.file_type();
    if kind.is_dir() { fs::remove_dir_all(path) } else { fs::remove_file(path) }
}

#[tauri::command]
pub async fn trash_paths(paths: Vec<String>) -> serde_json::Value {
    let count = paths.len();
    match tauri::async_runtime::spawn_blocking(move || paths.iter().filter(|path| trash::delete(path).is_err()).count()).await {
        Ok(failed) => serde_json::json!({"failed": failed}),
        Err(_) => serde_json::json!({"failed": count}),
    }
}

#[tauri::command]
pub async fn delete_paths(paths: Vec<String>) -> serde_json::Value {
    let count = paths.len();
    match tauri::async_runtime::spawn_blocking(move || paths.iter().filter(|path| remove(Path::new(path)).is_err()).count()).await {
        Ok(failed) => serde_json::json!({"failed": failed}),
        Err(_) => serde_json::json!({"failed": count}),
    }
}

fn wide(text: &str) -> Vec<u16> { OsStr::new(text).encode_wide().chain(Some(0)).collect() }

#[tauri::command]
pub async fn confirm(window: tauri::WebviewWindow, title: String, main: String, content: Option<String>, ok_label: String, details: Option<String>) -> bool {
    let hwnd = match window.hwnd() { Ok(hwnd) => hwnd.0 as isize, Err(_) => return false };
    match tauri::async_runtime::spawn_blocking(move || {
        let title = wide(&title);
        let main = wide(&main);
        let content = content.as_deref().map(wide);
        let details = details.as_deref().map(wide);
        let label = wide(&ok_label);
        let buttons = [TASKDIALOG_BUTTON { nButtonID: IDOK.0, pszButtonText: PCWSTR(label.as_ptr()) }];
        let config = TASKDIALOGCONFIG {
            cbSize: std::mem::size_of::<TASKDIALOGCONFIG>() as u32,
            hwndParent: HWND(hwnd as *mut _),
            dwCommonButtons: TDCBF_CANCEL_BUTTON,
            Anonymous1: TASKDIALOGCONFIG_0 { pszMainIcon: TD_WARNING_ICON },
            pszWindowTitle: PCWSTR(title.as_ptr()),
            pszMainInstruction: PCWSTR(main.as_ptr()),
            pszContent: content.as_ref().map_or(PCWSTR::null(), |s| PCWSTR(s.as_ptr())),
            pszExpandedInformation: details.as_ref().map_or(PCWSTR::null(), |s| PCWSTR(s.as_ptr())),
            cButtons: buttons.len() as u32,
            pButtons: buttons.as_ptr(),
            nDefaultButton: IDCANCEL.0,
            ..Default::default()
        };
        let mut chosen = IDCANCEL.0;
        unsafe { TaskDialogIndirect(&config, Some(&mut chosen), None, None) }.is_ok() && chosen == IDOK.0
    }).await { Ok(confirmed) => confirmed, Err(_) => false }
}

fn copy_name(source: &Path, is_dir: bool, number: usize) -> io::Result<OsString> {
    let name = source.file_name().ok_or_else(|| io::Error::other("Missing name"))?;
    let mut result = if is_dir { name.to_os_string() } else { source.file_stem().unwrap_or(name).to_os_string() };
    result.push(if number == 0 { " copy".to_string() } else { format!(" copy {number}") });
    if !is_dir {
        if let Some(ext) = source.extension() { result.push("."); result.push(ext); }
    }
    Ok(result)
}

type Snapshot = BTreeMap<PathBuf, (bool, u64, SystemTime)>;

fn snapshot(root: &Path) -> io::Result<Snapshot> {
    fn visit(root: &Path, rel: &Path, entries: &mut Snapshot) -> io::Result<()> {
        let path = if rel.as_os_str().is_empty() { root.to_path_buf() } else { root.join(rel) };
        let meta = fs::symlink_metadata(&path)?;
        if meta.file_type().is_symlink() { return Err(io::Error::other("Links are not supported")); }
        entries.insert(rel.to_owned(), (meta.is_dir(), meta.len(), meta.modified()?));
        if meta.is_dir() {
            for entry in fs::read_dir(path)? { visit(root, &rel.join(entry?.file_name()), entries)?; }
        } else if !meta.is_file() { return Err(io::Error::other("Unsupported file type")); }
        Ok(())
    }
    let mut entries = Snapshot::new();
    visit(root, Path::new(""), &mut entries)?;
    Ok(entries)
}

fn copy_into(source: &Path, target: &Path, is_dir: bool) -> io::Result<()> {
    if is_dir {
        for entry in fs::read_dir(source)? {
            let entry = entry?;
            let kind = entry.file_type()?;
            if kind.is_symlink() { return Err(io::Error::other("Links are not supported")); }
            let dest = target.join(entry.file_name());
            if kind.is_dir() {
                let id = reserve(&dest, true)?;
                copy_reserved(&entry.path(), &dest, true, id)?;
            }
            else if kind.is_file() {
                let id = reserve(&dest, false)?;
                copy_reserved(&entry.path(), &dest, false, id)?;
            } else { return Err(io::Error::other("Unsupported file type")); }
        }
    } else { fs::copy(source, target)?; }
    Ok(())
}

pub(crate) fn normal_path(path: &Path) -> PathBuf {
    let text = path.to_string_lossy();
    if let Some(rest) = text.strip_prefix(r"\\?\UNC\") { PathBuf::from(format!(r"\\{rest}")) }
    else if let Some(rest) = text.strip_prefix(r"\\?\") { PathBuf::from(rest) }
    else { path.to_owned() }
}

fn transfer(source: &Path, target_dir: &Path, cut: bool, duplicate: bool) -> io::Result<Option<PathBuf>> {
    if fs::symlink_metadata(source)?.file_type().is_symlink() { return Err(io::Error::other("Links are not supported")); }
    let output_dir = normal_path(target_dir);
    let source = fs::canonicalize(source)?;
    let target_dir = fs::canonicalize(target_dir)?;
    let meta = fs::symlink_metadata(&source)?;
    if !meta.is_file() && !meta.is_dir() { return Err(io::Error::other("Unsupported file type")); }
    if meta.is_dir() && target_dir.starts_with(&source) { return Err(io::Error::other("Cannot copy a folder into itself")); }
    let same_parent = source.parent().is_some_and(|parent| parent == target_dir);
    if cut && same_parent { return Ok(None); }
    let mut number = 0;
    let mut original = !duplicate && !same_parent;
    loop {
        let name = if original { source.file_name().ok_or_else(|| io::Error::other("Missing name"))?.to_os_string() } else { copy_name(&source, meta.is_dir(), number)? };
        let target = target_dir.join(name);
        if cut {
            match rename_exclusive(&source, &target) {
                Ok(()) => return Ok(Some(output_dir.join(target.file_name().ok_or_else(|| io::Error::other("Missing name"))?))),
                Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {},
                Err(error) if error.raw_os_error() == Some(ERROR_NOT_SAME_DEVICE.0 as i32) => {
                    let before = snapshot(&source)?;
                    match reserve(&target, meta.is_dir()) {
                        Ok(id) => {
                            copy_reserved(&source, &target, meta.is_dir(), id)?;
                            // shortcut: same-size same-time changes and changes after this comparison can be missed; use stronger OS-level coordination if required.
                            if snapshot(&source)? != before { return Err(io::Error::other("Source changed during copy")); }
                            remove(&source)?;
                            return Ok(Some(output_dir.join(target.file_name().ok_or_else(|| io::Error::other("Missing name"))?)));
                        }
                        Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {},
                        Err(error) => return Err(error),
                    }
                }
                Err(error) => return Err(error),
            }
        } else {
            match reserve(&target, meta.is_dir()) {
                Ok(id) => { copy_reserved(&source, &target, meta.is_dir(), id)?; return Ok(Some(output_dir.join(target.file_name().ok_or_else(|| io::Error::other("Missing name"))?))); }
                Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {},
                Err(error) => return Err(error),
            }
        }
        if original { original = false; } else { number += 1; }
    }
}

type FileId = (u32, u32, u32);

#[repr(C)]
struct NtUnicodeString { length: u16, maximum_length: u16, buffer: *const u16 }
#[repr(C)]
struct NtObjectAttributes { length: u32, root: *mut c_void, name: *const NtUnicodeString, attributes: u32, security: *mut c_void, quality: *mut c_void }
#[repr(C)]
struct NtIoStatus { status: isize, information: usize }

#[link(name = "ntdll")]
extern "system" {
    fn NtCreateFile(handle: *mut *mut c_void, access: u32, attributes: *const NtObjectAttributes, status: *mut NtIoStatus, allocation_size: *const i64, file_attributes: u32, share: u32, disposition: u32, options: u32, ea: *const c_void, ea_length: u32) -> i32;
    fn RtlNtStatusToDosError(status: i32) -> u32;
}

fn create_directory_handle(target: &Path) -> io::Result<fs::File> {
    const OBJECT_CASE_INSENSITIVE: u32 = 0x40;
    const FILE_CREATE: u32 = 2;
    const FILE_DIRECTORY_FILE: u32 = 1;
    const FILE_SYNCHRONOUS_IO_NONALERT: u32 = 0x20;
    const FILE_SHARE_ALL: u32 = 7;
    const SYNCHRONIZE: u32 = 0x0010_0000;
    let raw: Vec<u16> = target.as_os_str().encode_wide().collect();
    let prefix: Vec<u16> = r"\\?\".encode_utf16().collect();
    let suffix = raw.strip_prefix(prefix.as_slice()).ok_or_else(|| io::Error::other("Expected an absolute Windows path"))?;
    let mut name: Vec<u16> = r"\??\".encode_utf16().collect();
    name.extend_from_slice(suffix);
    let length = u16::try_from(name.len().checked_mul(2).ok_or_else(|| io::Error::other("Path is too long"))?).map_err(io_error_as_io)?;
    let name = NtUnicodeString { length, maximum_length: length, buffer: name.as_ptr() };
    let attributes = NtObjectAttributes { length: std::mem::size_of::<NtObjectAttributes>() as u32, root: std::ptr::null_mut(), name: &name, attributes: OBJECT_CASE_INSENSITIVE, security: std::ptr::null_mut(), quality: std::ptr::null_mut() };
    let mut handle = std::ptr::null_mut();
    let mut status = NtIoStatus { status: 0, information: 0 };
    // Create and identify the directory atomically so cleanup cannot claim a substituted directory.
    let result = unsafe { NtCreateFile(&mut handle, FILE_READ_ATTRIBUTES.0 | SYNCHRONIZE, &attributes, &mut status, std::ptr::null(), 0, FILE_SHARE_ALL, FILE_CREATE, FILE_DIRECTORY_FILE | FILE_SYNCHRONOUS_IO_NONALERT, std::ptr::null(), 0) };
    if result < 0 { return Err(io::Error::from_raw_os_error(unsafe { RtlNtStatusToDosError(result) } as i32)); }
    Ok(unsafe { fs::File::from_raw_handle(handle) })
}

fn io_error_as_io(error: impl std::fmt::Display) -> io::Error { io::Error::other(error.to_string()) }

fn file_info(file: &fs::File) -> io::Result<BY_HANDLE_FILE_INFORMATION> {
    let mut info = BY_HANDLE_FILE_INFORMATION::default();
    unsafe { GetFileInformationByHandle(HANDLE(file.as_raw_handle()), &mut info) }.map_err(win32_error)?;
    Ok(info)
}

fn file_id(info: &BY_HANDLE_FILE_INFORMATION) -> FileId {
    (info.dwVolumeSerialNumber, info.nFileIndexHigh, info.nFileIndexLow)
}

fn reserve(target: &Path, is_dir: bool) -> io::Result<Option<FileId>> {
    // shortcut: the reserved name can be replaced before fs::copy, use metadata-preserving handle-based copying when available.
    if is_dir {
        let directory = create_directory_handle(target)?;
        Ok(file_info(&directory).ok().map(|info| file_id(&info)))
    } else {
        let file = fs::File::options().write(true).create_new(true).open(target)?;
        Ok(file_info(&file).ok().map(|info| file_id(&info)))
    }
}

fn copy_reserved(source: &Path, target: &Path, is_dir: bool, id: Option<FileId>) -> io::Result<()> {
    let result = copy_into(source, target, is_dir);
    if result.is_err() {
        if let Some(id) = id { cleanup_empty_reservation(target, id, is_dir); }
    }
    result
}

fn cleanup_empty_reservation(target: &Path, id: FileId, is_dir: bool) {
    let file = fs::File::options().access_mode(DELETE.0 | FILE_READ_ATTRIBUTES.0).share_mode(0)
        .custom_flags(FILE_FLAG_BACKUP_SEMANTICS.0 | FILE_FLAG_OPEN_REPARSE_POINT.0).open(target);
    if let Ok(file) = file {
        if let Ok(info) = file_info(&file) {
            if file_id(&info) == id && (is_dir || (info.nFileSizeHigh == 0 && info.nFileSizeLow == 0)) {
                let handle = HANDLE(file.as_raw_handle());
                if !is_dir {
                    let mut streams = [0u64; 512];
                    let checked = unsafe { GetFileInformationByHandleEx(handle, FileStreamInfo, streams.as_mut_ptr().cast(), std::mem::size_of_val(&streams) as u32) }.is_ok();
                    let stream = unsafe { &*(streams.as_ptr().cast::<FILE_STREAM_INFO>()) };
                    if !checked || stream.NextEntryOffset != 0 || stream.StreamSize != 0 { return; }
                }
                let disposition = FILE_DISPOSITION_INFO { DeleteFile: true.into() };
                let _ = unsafe { SetFileInformationByHandle(handle, FileDispositionInfo, &disposition as *const _ as *const _, std::mem::size_of_val(&disposition) as u32) };
            }
        }
    }
}

#[tauri::command]
pub async fn paste_paths(sources: Vec<String>, target_dir: String, cut: bool) -> serde_json::Value {
    let count = sources.len();
    match tauri::async_runtime::spawn_blocking(move || {
        let mut created = Vec::new();
        let mut failed = 0;
        for source in sources {
            match transfer(Path::new(&source), Path::new(&target_dir), cut, false) {
                Ok(Some(path)) => created.push(path.to_string_lossy().into_owned()),
                Ok(None) => {},
                Err(_) => failed += 1,
            }
        }
        serde_json::json!({"created": created, "failed": failed})
    }).await { Ok(result) => result, Err(_) => serde_json::json!({"created": [], "failed": count}) }
}

#[tauri::command]
pub async fn duplicate_path(path: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let path = Path::new(&path);
        let parent = path.parent().ok_or_else(|| io::Error::other("Missing parent"))?;
        transfer(path, parent, false, true)?.map(|p| p.to_string_lossy().into_owned()).ok_or_else(|| io::Error::other("No copy created"))
    }).await.map_err(io_error)?.map_err(io_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    static NEXT: AtomicUsize = AtomicUsize::new(0);

    fn temp() -> PathBuf {
        let dir = std::env::temp_dir().join(format!("workbench-files-{}-{}", std::process::id(), NEXT.fetch_add(1, Ordering::Relaxed)));
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn names_and_recursive_copy_do_not_overwrite() {
        let dir = temp();
        let file = dir.join("a.txt");
        fs::write(&file, "source").unwrap();
        fs::write(dir.join("a copy.txt"), "existing").unwrap();
        assert!(transfer(&file, &dir, false, true).unwrap().unwrap().ends_with("a copy 1.txt"));
        assert_eq!(fs::read_to_string(dir.join("a copy.txt")).unwrap(), "existing");
        let folder = dir.join("folder");
        fs::create_dir_all(folder.join("nested")).unwrap();
        fs::write(folder.join("nested/file"), "content").unwrap();
        let copy = transfer(&folder, &dir, false, true).unwrap().unwrap();
        assert!(copy.ends_with("folder copy"));
        assert_eq!(fs::read_to_string(copy.join("nested/file")).unwrap(), "content");
        assert!(transfer(&folder, &dir, false, true).unwrap().unwrap().ends_with("folder copy 1"));
        assert!(rename_exclusive(&file, &dir.join("a copy.txt")).is_err());
        assert_eq!(fs::read_to_string(&file).unwrap(), "source");
        assert!(transfer(&file, &dir, true, false).unwrap().is_none());
        let destination = dir.join("destination");
        fs::create_dir(&destination).unwrap();
        fs::write(destination.join("a.txt"), "existing").unwrap();
        assert_eq!(transfer(&file, &destination, true, false).unwrap(), Some(destination.join("a copy.txt")));
        assert_eq!(fs::read_to_string(destination.join("a.txt")).unwrap(), "existing");
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn snapshot_detects_changes() {
        let dir = temp();
        fs::write(dir.join("a"), "before").unwrap();
        let before = snapshot(&dir).unwrap();
        fs::write(dir.join("a"), "longer than before").unwrap();
        assert_ne!(before, snapshot(&dir).unwrap());
        fs::write(dir.join("b"), "new").unwrap();
        assert_ne!(before, snapshot(&dir).unwrap());
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn normal_paths_and_transfer_results() {
        assert_eq!(normal_path(Path::new(r"\\?\C:\folder\file")), PathBuf::from(r"C:\folder\file"));
        assert_eq!(normal_path(Path::new(r"\\?\UNC\server\share\file")), PathBuf::from(r"\\server\share\file"));
        let dir = temp();
        let file = dir.join("a.txt");
        fs::write(&file, "content").unwrap();
        assert_eq!(transfer(&file, &dir, false, true).unwrap(), Some(dir.join("a copy.txt")));
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn win32_errors_are_classified() {
        let cross_device = windows::core::Error::from_hresult(windows::core::HRESULT::from_win32(ERROR_NOT_SAME_DEVICE.0));
        assert_eq!(win32_error(cross_device).raw_os_error(), Some(ERROR_NOT_SAME_DEVICE.0 as i32));
        let exists = windows::core::Error::from_hresult(windows::core::HRESULT::from_win32(183));
        assert_eq!(win32_error(exists).kind(), io::ErrorKind::AlreadyExists);
    }

    #[test]
    fn failed_copy_cleans_only_the_original_empty_file() {
        let dir = temp();
        let target = dir.join("target");
        let id = reserve(&target, false).unwrap();
        assert!(copy_reserved(&dir.join("missing"), &target, false, id).is_err());
        assert!(!target.exists());
        let id = reserve(&target, false).unwrap().unwrap();
        fs::write(&target, "user data").unwrap();
        cleanup_empty_reservation(&target, id, false);
        assert_eq!(fs::read_to_string(&target).unwrap(), "user data");
        fs::remove_file(&target).unwrap();
        fs::write(&target, "").unwrap();
        cleanup_empty_reservation(&target, id, false);
        assert!(target.exists());
        let folder = fs::canonicalize(&dir).unwrap().join("folder");
        let id = reserve(&folder, true).unwrap();
        assert!(copy_reserved(&dir.join("missing"), &folder, true, id).is_err());
        assert!(!folder.exists());
        let id = reserve(&folder, true).unwrap().unwrap();
        fs::write(folder.join("user"), "content").unwrap();
        cleanup_empty_reservation(&folder, id, true);
        assert!(folder.join("user").exists());
        fs::remove_file(folder.join("user")).unwrap();
        fs::remove_dir(&folder).unwrap();
        fs::create_dir(&folder).unwrap();
        cleanup_empty_reservation(&folder, id, true);
        assert!(folder.exists());
        let stream_file = dir.join("stream");
        let id = reserve(&stream_file, false).unwrap().unwrap();
        fs::write(dir.join("stream:extra"), "user data").unwrap();
        cleanup_empty_reservation(&stream_file, id, false);
        assert_eq!(fs::read_to_string(dir.join("stream:extra")).unwrap(), "user data");
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn cross_volume_cut_files_preserves_content_and_streams() {
        struct TestDir(PathBuf);
        impl Drop for TestDir { fn drop(&mut self) { let _ = fs::remove_dir_all(&self.0); } }
        let source = TestDir(temp());
        let target_root = Path::new(env!("CARGO_MANIFEST_DIR")).join("target");
        let directory_info = |path: &Path| -> io::Result<BY_HANDLE_FILE_INFORMATION> {
            let dir = fs::File::options().read(true).custom_flags(FILE_FLAG_BACKUP_SEMANTICS.0).open(path)?;
            file_info(&dir)
        };
        let (Ok(source_info), Ok(target_info)) = (directory_info(&source.0), directory_info(&target_root)) else { return };
        if source_info.dwVolumeSerialNumber == target_info.dwVolumeSerialNumber { return; }
        let destination = TestDir(target_root.join(format!("workbench-cross-{}-{}", std::process::id(), NEXT.fetch_add(1, Ordering::Relaxed))));
        fs::create_dir(&destination.0).unwrap();
        for (name, stream) in [("plain.txt", false), ("stream.txt", true)] {
            let path = source.0.join(name);
            fs::write(&path, "file content").unwrap();
            let stream_name = format!("{}:extra", path.display());
            if stream { fs::write(&stream_name, "stream content").unwrap(); }
            let modified = fs::metadata(&path).unwrap().modified().unwrap();
            assert!(snapshot(&path).is_ok(), "single-file snapshot failed");
            let moved = transfer(&path, &destination.0, true, false).unwrap().unwrap();
            assert!(!path.exists());
            assert_eq!(fs::read_to_string(&moved).unwrap(), "file content");
            assert_eq!(fs::metadata(&moved).unwrap().modified().unwrap(), modified);
            if stream { assert_eq!(fs::read_to_string(format!("{}:extra", moved.display())).unwrap(), "stream content"); }
        }
    }
}

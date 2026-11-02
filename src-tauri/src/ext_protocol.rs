//! Extension asset protocol (SPEC R-10, R-11; D-9, D-10; 01-zed A-55.2).
//!
//! The WebView loads grammar WASM, query files and icons of *installed* Zed
//! extensions through the custom scheme `zlext` (on Windows the WebView sees
//! it as `http://zlext.localhost/<extension-id>/<relative path>`). Files are
//! not copied into the project (D-9): the core serves them from the extension
//! roots, after checking every path the way A-55.2 requires:
//!   - the unit of trust is one extension root (`<root>/<id>/`);
//!   - only relative paths inside it; absolute paths and `..` are rejected;
//!   - a link inside the extension that points outside it is rejected (the
//!     resolved file must stay under the resolved extension root; a dev
//!     extension that is itself a link counts its target as its root).
//!
//! Roots: `ZEDLIKE_EXT_ROOTS` (`;`-separated) or, by default,
//! `%LOCALAPPDATA%\Zed\extensions\installed` (D-9 path).

use std::io::Read;
use std::path::{Component, Path, PathBuf};
use std::sync::Mutex;

use tauri::http::{header, Request, Response, StatusCode};

static EXTRA_ROOTS: Mutex<Vec<PathBuf>> = Mutex::new(Vec::new());

/// Extension roots in search order.
pub fn roots() -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = match std::env::var("ZEDLIKE_EXT_ROOTS") {
        Ok(v) if !v.trim().is_empty() => v
            .split(';')
            .filter(|s| !s.trim().is_empty())
            .map(|s| PathBuf::from(s.trim()))
            .collect(),
        _ => std::env::var("LOCALAPPDATA")
            .map(|l| vec![Path::new(&l).join("Zed").join("extensions").join("installed")])
            .unwrap_or_default(),
    };
    out.extend(EXTRA_ROOTS.lock().unwrap().iter().cloned());
    out
}

/// Development only: add a root (used to test link cases with a temporary
/// test extension without touching the user's Zed folder; SPEC R-11).
pub fn add_root(path: PathBuf) {
    let mut v = EXTRA_ROOTS.lock().unwrap();
    if !v.contains(&path) {
        v.push(path);
    }
}

#[derive(Debug)]
pub enum Denied {
    BadExtensionId,
    UnknownExtension,
    Empty,
    Absolute,
    ParentDir,
    EscapesRoot,
    NotFound,
    NotAFile,
}

impl Denied {
    pub fn code(&self) -> &'static str {
        match self {
            Denied::BadExtensionId => "bad-extension-id",
            Denied::UnknownExtension => "unknown-extension",
            Denied::Empty => "empty-path",
            Denied::Absolute => "absolute-path",
            Denied::ParentDir => "parent-dir",
            Denied::EscapesRoot => "link-escapes-extension-root",
            Denied::NotFound => "not-found",
            Denied::NotAFile => "not-a-file",
        }
    }
    fn status(&self) -> StatusCode {
        match self {
            Denied::UnknownExtension | Denied::NotFound => StatusCode::NOT_FOUND,
            _ => StatusCode::FORBIDDEN,
        }
    }
}

fn valid_id(id: &str) -> bool {
    !id.is_empty()
        && id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.')
        && id != "."
        && id != ".."
}

/// A resolved file: the canonical extension root and the canonical file path.
pub struct Resolved {
    pub root: PathBuf,
    pub path: PathBuf,
}

/// A-55.2 check of `rel` inside extension `id`, searched in `roots`.
pub fn resolve_in(roots: &[PathBuf], id: &str, rel: &str) -> Result<PathBuf, Denied> {
    resolve_full(roots, id, rel).map(|r| r.path)
}

/// Same check, also returning the canonical root (used to re-check the open handle).
pub fn resolve_full(roots: &[PathBuf], id: &str, rel: &str) -> Result<Resolved, Denied> {
    if !valid_id(id) {
        return Err(Denied::BadExtensionId);
    }
    if rel.is_empty() {
        return Err(Denied::Empty);
    }
    // Absolute in any Windows or POSIX spelling: leading separator, drive
    // letter, UNC / device prefixes.
    let bytes = rel.as_bytes();
    if rel.starts_with('/')
        || rel.starts_with('\\')
        || (bytes.len() >= 2 && bytes[1] == b':')
        || Path::new(rel).is_absolute()
    {
        return Err(Denied::Absolute);
    }
    let mut clean = PathBuf::new();
    for part in rel.split(['/', '\\']) {
        match part {
            "" | "." => continue,
            ".." => return Err(Denied::ParentDir),
            p => {
                if Path::new(p)
                    .components()
                    .any(|c| !matches!(c, Component::Normal(_)))
                {
                    return Err(Denied::Absolute);
                }
                clean.push(p);
            }
        }
    }
    if clean.as_os_str().is_empty() {
        return Err(Denied::Empty);
    }
    let ext_dir = roots
        .iter()
        .map(|r| r.join(id))
        .find(|p| p.is_dir())
        .ok_or(Denied::UnknownExtension)?;
    // The extension root itself may be a link (dev extension, A-53.5): its
    // target is the root (A-55.2).
    let root = std::fs::canonicalize(&ext_dir).map_err(|_| Denied::UnknownExtension)?;
    let candidate = root.join(&clean);
    let resolved = std::fs::canonicalize(&candidate).map_err(|_| Denied::NotFound)?;
    if !resolved.starts_with(&root) {
        return Err(Denied::EscapesRoot);
    }
    if !resolved.is_file() {
        return Err(Denied::NotAFile);
    }
    Ok(Resolved { root, path: resolved })
}

/// Final path of an open file, from the handle itself (`\\?\` form like
/// std::fs::canonicalize on Windows).
#[cfg(windows)]
fn final_path(file: &std::fs::File) -> Option<PathBuf> {
    use std::os::windows::ffi::OsStringExt;
    use std::os::windows::io::AsRawHandle;
    use windows::Win32::Foundation::HANDLE;
    use windows::Win32::Storage::FileSystem::{GetFinalPathNameByHandleW, FILE_NAME_NORMALIZED};
    let handle = HANDLE(file.as_raw_handle());
    let mut buf = vec![0u16; 1024];
    loop {
        let n = unsafe { GetFinalPathNameByHandleW(handle, &mut buf, FILE_NAME_NORMALIZED) } as usize;
        if n == 0 {
            return None;
        }
        if n < buf.len() {
            return Some(PathBuf::from(std::ffi::OsString::from_wide(&buf[..n])));
        }
        buf.resize(n + 1, 0);
    }
}

#[cfg(not(windows))]
fn final_path(_file: &std::fs::File) -> Option<PathBuf> {
    None
}

/// Open the resolved file and re-check, on the open handle, that it is still
/// inside the extension root; then read through that same handle. A link
/// swapped in after `resolve_full` cannot redirect the read (review P3-1 #2).
pub fn open_and_read(r: &Resolved) -> Result<Vec<u8>, Denied> {
    let mut file = std::fs::File::open(&r.path).map_err(|_| Denied::NotFound)?;
    if cfg!(windows) {
        let fin = final_path(&file).ok_or(Denied::NotFound)?;
        if !fin.starts_with(&r.root) {
            return Err(Denied::EscapesRoot);
        }
    }
    if !file.metadata().map_err(|_| Denied::NotFound)?.is_file() {
        return Err(Denied::NotAFile);
    }
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).map_err(|_| Denied::NotFound)?;
    Ok(bytes)
}

fn content_type(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()).unwrap_or("") {
        "wasm" => "application/wasm",
        "svg" => "image/svg+xml",
        "json" => "application/json",
        "toml" | "scm" | "txt" | "md" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

/// Origins of our own pages (built app and `tauri dev` server).
fn allowed_origin(origin: Option<&str>) -> Option<String> {
    match origin {
        Some(o)
            if o == "http://tauri.localhost"
                || o == "https://tauri.localhost"
                || o == "tauri://localhost"
                || o == "http://localhost:1420" =>
        {
            Some(o.to_string())
        }
        _ => None,
    }
}

fn percent_decode(s: &str) -> Option<String> {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            let h = std::str::from_utf8(b.get(i + 1..i + 3)?).ok()?;
            out.push(u8::from_str_radix(h, 16).ok()?);
            i += 3;
        } else {
            out.push(b[i]);
            i += 1;
        }
    }
    String::from_utf8(out).ok()
}

/// Handler for `zlext://` requests.
pub fn handle(request: Request<Vec<u8>>) -> Response<Vec<u8>> {
    let origin = request
        .headers()
        .get(header::ORIGIN)
        .and_then(|v| v.to_str().ok());
    let cors = allowed_origin(origin);
    let raw_path = request.uri().path().to_string();
    let result = percent_decode(raw_path.trim_start_matches('/'))
        .ok_or(Denied::BadExtensionId)
        .and_then(|p| {
            let (id, rel) = p.split_once('/').unwrap_or((p.as_str(), ""));
            resolve_full(&roots(), id, rel)
        });
    let mut builder = Response::builder();
    if let Some(o) = &cors {
        builder = builder
            .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, o.as_str())
            .header(header::VARY, "Origin")
            .header(header::ACCESS_CONTROL_EXPOSE_HEADERS, "X-Zedlike-Denied");
    }
    match result.and_then(|r| open_and_read(&r).map(|bytes| (r.path, bytes))) {
        Ok((path, bytes)) => builder
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, content_type(&path))
            .header(header::CACHE_CONTROL, "no-store")
            .body(bytes)
            .unwrap(),
        Err(d) => builder
            .status(d.status())
            .header(header::CONTENT_TYPE, "text/plain; charset=utf-8")
            .header("X-Zedlike-Denied", d.code())
            .body(d.code().as_bytes().to_vec())
            .unwrap(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp_root() -> PathBuf {
        let dir = std::env::temp_dir().join(format!("zedlike-ext-test-{}", std::process::id()));
        let ext = dir.join("demo");
        std::fs::create_dir_all(ext.join("languages")).unwrap();
        std::fs::write(ext.join("languages").join("a.scm"), "(x) @y").unwrap();
        std::fs::create_dir_all(dir.join("other")).unwrap();
        std::fs::write(dir.join("other").join("secret.txt"), "s").unwrap();
        dir
    }

    #[test]
    fn a55_2_rules() {
        let root = tmp_root();
        let roots = vec![root.clone()];
        assert!(resolve_in(&roots, "demo", "languages/a.scm").is_ok());
        assert!(matches!(resolve_in(&roots, "demo", "C:/Windows/win.ini"), Err(Denied::Absolute)));
        assert!(matches!(resolve_in(&roots, "demo", "/etc/passwd"), Err(Denied::Absolute)));
        assert!(matches!(resolve_in(&roots, "demo", "\\\\server\\share\\x"), Err(Denied::Absolute)));
        assert!(matches!(resolve_in(&roots, "demo", "../other/secret.txt"), Err(Denied::ParentDir)));
        assert!(matches!(resolve_in(&roots, "demo", "languages\\..\\..\\other\\secret.txt"), Err(Denied::ParentDir)));
        assert!(matches!(resolve_in(&roots, "..", "x"), Err(Denied::BadExtensionId)));
        assert!(matches!(resolve_in(&roots, "demo", "missing.scm"), Err(Denied::NotFound)));
        assert!(matches!(resolve_in(&roots, "nope", "a"), Err(Denied::UnknownExtension)));
        // Reading through the handle re-checks the final path.
        let r = resolve_full(&roots, "demo", "languages/a.scm").unwrap();
        assert_eq!(open_and_read(&r).unwrap(), b"(x) @y");
        let fake = Resolved { root: root.join("demo"), path: root.join("other").join("secret.txt") };
        let fake = Resolved { root: std::fs::canonicalize(&fake.root).unwrap(), path: fake.path };
        assert!(matches!(open_and_read(&fake), Err(Denied::EscapesRoot)));
        let _ = std::fs::remove_dir_all(root);
    }
}

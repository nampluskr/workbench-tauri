//! `zlext` scheme: serves installed Zed extension files to the WebView (D-14, SPEC R-10).
//! WebView address: `http://zlext.localhost/<extension id>/<relative path>`.
//! Every request is checked per A-55.2; a refused request gets 403 with the reason as text.

use std::path::{Component, Path, PathBuf};

use tauri::http::{header, Request, Response, StatusCode};

/// D-14: the only extension root, no override.
fn extensions_root() -> Option<PathBuf> {
    Some(PathBuf::from(std::env::var_os("LOCALAPPDATA")?).join(r"Zed\extensions\installed"))
}

/// Decode `%XX` escapes so encoded `..` or `\` are checked like plain ones.
fn percent_decode(s: &str) -> Option<String> {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' {
            let hex = std::str::from_utf8(bytes.get(i + 1..i + 3)?).ok()?;
            out.push(u8::from_str_radix(hex, 16).ok()?);
            i += 3;
        } else {
            out.push(bytes[i]);
            i += 1;
        }
    }
    String::from_utf8(out).ok()
}

/// A-55.2: `<id>/<relative path>` inside one extension root, resolved to a real file.
pub fn resolve(root: &Path, url_path: &str) -> Result<PathBuf, &'static str> {
    let path = percent_decode(url_path).ok_or("malformed path")?;
    let (id, rel) = path.trim_start_matches('/').split_once('/').ok_or("no extension id")?;
    // Only plain names: no root, drive, UNC prefix, `.` or `..` (separators `/` and `\` both count).
    let plain = |p: &str| !p.is_empty() && Path::new(p).components().all(|c| matches!(c, Component::Normal(_)));
    if !plain(id) || id.contains(['/', '\\']) {
        return Err("bad extension id");
    }
    if rel.starts_with(['/', '\\']) || rel.contains(':') {
        return Err("absolute path");
    }
    if !plain(rel) {
        return Err("relative path must not contain `..` or `.`");
    }
    // The extension root itself may be a link (dev extension); its target counts as the root.
    let ext_root = root.join(id).canonicalize().map_err(|_| "not found")?;
    let file = ext_root.join(rel).canonicalize().map_err(|_| "not found")?;
    if !file.starts_with(&ext_root) {
        return Err("link points outside the extension root");
    }
    Ok(file)
}

fn content_type(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()) {
        Some("wasm") => "application/wasm",
        Some("json") => "application/json",
        Some("svg") => "image/svg+xml",
        _ => "text/plain; charset=utf-8", // .scm and the rest
    }
}

pub fn respond(request: &Request<Vec<u8>>) -> Response<Vec<u8>> {
    // CORS only for the app's own origin (built app, dev server).
    let origin = request.headers().get(header::ORIGIN).and_then(|o| o.to_str().ok());
    let allowed = origin.filter(|o| matches!(*o, "http://tauri.localhost" | "http://localhost:1420"));
    let reply = |status: StatusCode, mime: &str, body: Vec<u8>| {
        let mut builder = Response::builder().status(status).header(header::CONTENT_TYPE, mime);
        if let Some(o) = allowed {
            builder = builder.header(header::ACCESS_CONTROL_ALLOW_ORIGIN, o);
        }
        builder.body(body).unwrap_or_default()
    };
    let result = extensions_root()
        .ok_or("LOCALAPPDATA is not set")
        .and_then(|root| resolve(&root, request.uri().path()));
    match result {
        Ok(file) => match std::fs::read(&file) {
            Ok(bytes) => reply(StatusCode::OK, content_type(&file), bytes),
            Err(e) => reply(StatusCode::INTERNAL_SERVER_ERROR, "text/plain", e.to_string().into_bytes()),
        },
        Err(reason @ "not found") => reply(StatusCode::NOT_FOUND, "text/plain", reason.into()),
        Err(reason) => reply(StatusCode::FORBIDDEN, "text/plain", reason.into()),
    }
}

#[cfg(test)]
mod tests {
    use super::resolve;
    use std::fs;
    use std::process::Command;

    /// A-55.2 path cases on a temporary root with a directory junction (no symlink privilege needed).
    #[test]
    fn path_checks_follow_a_55_2() {
        let base = std::env::temp_dir().join(format!("zlext-test-{}", std::process::id()));
        let root = base.join("installed");
        fs::create_dir_all(root.join("ext/sub")).unwrap();
        fs::create_dir_all(root.join("other")).unwrap();
        fs::create_dir_all(base.join("outside")).unwrap();
        fs::write(root.join("ext/sub/a.scm"), "ok").unwrap();
        fs::write(root.join("other/b.scm"), "other").unwrap();
        fs::write(base.join("outside/secret.txt"), "secret").unwrap();
        let junction = root.join("ext").join("link"); // backslashes only: cmd reads `/x` as a switch
        let made = Command::new("cmd")
            .args(["/C", "mklink", "/J"])
            .arg(&junction)
            .arg(base.join("outside"))
            .output()
            .unwrap();
        assert!(made.status.success(), "mklink /J failed: {}", String::from_utf8_lossy(&made.stderr));

        let ok = resolve(&root, "/ext/sub/a.scm");
        let cases = [
            ("/ext/C:/Windows/win.ini", "absolute path"),
            ("/ext/\\\\server\\share\\x", "absolute path"),
            ("/ext//etc/hosts", "absolute path"),
            ("/ext/../other/b.scm", "relative path must not contain `..` or `.`"),
            ("/ext/sub/%2e%2e/../other/b.scm", "relative path must not contain `..` or `.`"),
            ("/ext/sub\\..\\..\\other\\b.scm", "relative path must not contain `..` or `.`"),
            ("/ext/link/secret.txt", "link points outside the extension root"),
        ];
        let results: Vec<_> = cases.iter().map(|(p, _)| resolve(&root, p)).collect();
        fs::remove_dir(&junction).ok(); // removes the junction only, not its target
        fs::remove_dir_all(&base).ok();

        assert!(ok.unwrap().ends_with("a.scm"));
        for ((path, reason), result) in cases.iter().zip(results) {
            assert_eq!(result, Err(*reason), "{path}");
        }
    }
}

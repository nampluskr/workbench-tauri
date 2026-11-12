//! core v0.8.1 I-7: the HTML preview document, served to its sandboxed frame by the `preview` URI scheme
//! (`http://preview.localhost/<id>` on Windows). A document of its own URL does not inherit the app's CSP, so its inline
//! scripts can run without widening the app's `script-src`. The frontend builds the document (with its CSP as the first
//! `<meta>`, and the same CSP as the frame's `csp` attribute) and stores it here under the preview's id.
//! Only a stored id is answered; any other URL gets 204 No Content, which leaves the frame's document as it is.

use std::collections::HashMap;
use std::sync::{Mutex, MutexGuard};
use tauri::http::{header, Response, StatusCode};

#[derive(Default)]
pub struct PreviewDocs(Mutex<HashMap<String, String>>);

impl PreviewDocs {
    fn lock(&self) -> MutexGuard<'_, HashMap<String, String>> {
        // A panic while holding the lock leaves a plain map behind; it is still usable.
        self.0.lock().unwrap_or_else(|poisoned| poisoned.into_inner())
    }
}

#[tauri::command]
pub fn preview_set(docs: tauri::State<'_, PreviewDocs>, id: String, html: String) {
    docs.lock().insert(id, html);
}

#[tauri::command]
pub fn preview_drop(docs: tauri::State<'_, PreviewDocs>, id: String) {
    docs.lock().remove(&id);
}

/// The answer to a `preview` request for `path` (`/<id>`; the query is not part of it).
pub fn respond(docs: &PreviewDocs, path: &str) -> Response<Vec<u8>> {
    let html = docs.lock().get(path.trim_start_matches('/')).cloned();
    let builder = match html {
        // `Allow-CSP-From` accepts the frame's `csp` attribute (CSP Embedded Enforcement). Any other response, such as an
        // asset URL the page navigates its frame to, lacks it and is blocked.
        Some(html) => Response::builder()
            .header(header::CONTENT_TYPE, "text/html; charset=utf-8")
            .header(header::CACHE_CONTROL, "no-store")
            .header("Allow-CSP-From", "*")
            .body(html.into_bytes()),
        None => Response::builder().status(StatusCode::NO_CONTENT).body(Vec::new()),
    };
    // The headers are constants, so building cannot fail.
    builder.expect("preview response headers are valid")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serves_only_a_stored_document() {
        let docs = PreviewDocs::default();
        docs.lock().insert("p1".into(), "<p>x</p>".into());
        let ok = respond(&docs, "/p1");
        assert_eq!(ok.status(), StatusCode::OK);
        assert_eq!(ok.body(), b"<p>x</p>");
        assert_eq!(ok.headers()["allow-csp-from"], "*");
        assert_eq!(ok.headers()[header::CACHE_CONTROL], "no-store");
        for path in ["/p2", "/", "/p1/other.html", "/C:/x.html"] {
            let other = respond(&docs, path);
            assert_eq!(other.status(), StatusCode::NO_CONTENT, "{path}");
            assert!(other.body().is_empty());
        }
        docs.lock().remove("p1");
        assert_eq!(respond(&docs, "/p1").status(), StatusCode::NO_CONTENT);
    }
}

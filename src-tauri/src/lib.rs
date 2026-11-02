#[cfg(windows)]
mod caption;
mod ext_protocol;

/// Phase 2: colors for the native maximize button (see caption.rs).
#[cfg(windows)]
#[tauri::command]
fn caption_set_colors(
    background: String,
    inactive_background: String,
    hover: String,
    pressed: String,
    foreground: String,
) -> Result<(), String> {
    caption::set_colors(caption::CaptionColors {
        background,
        inactive_background,
        hover,
        pressed,
        foreground,
    })
}

/// Phase 2 verification dump (specs/v0.1/verify/phase2/HOWTO.md).
#[cfg(windows)]
#[tauri::command]
fn caption_debug() -> serde_json::Value {
    caption::debug()
}

/// Phase 3 (SPEC R-11): the same A-55.2 check the `zlext` protocol uses,
/// for one extension id and relative path. Returns allow/deny and the reason.
#[tauri::command]
fn ext_check(id: String, rel: String) -> serde_json::Value {
    match ext_protocol::resolve_in(&ext_protocol::roots(), &id, &rel) {
        Ok(p) => serde_json::json!({ "allowed": true, "resolved": p.display().to_string() }),
        Err(d) => serde_json::json!({ "allowed": false, "reason": d.code() }),
    }
}

/// Phase 3 verification: extension roots in use (D-9 path or ZEDLIKE_EXT_ROOTS).
#[tauri::command]
fn ext_roots() -> Vec<String> {
    ext_protocol::roots()
        .iter()
        .map(|p| p.display().to_string())
        .collect()
}

/// Development builds only: add a temporary extension root so link cases can
/// be tested without touching the user's Zed folder (SPEC R-11).
#[tauri::command]
fn dev_ext_add_root(path: String) -> Result<Vec<String>, String> {
    if !cfg!(debug_assertions) {
        return Err("dev_ext_add_root is only available in debug builds".into());
    }
    ext_protocol::add_root(std::path::PathBuf::from(path));
    Ok(ext_roots())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .register_uri_scheme_protocol("zlext", |_ctx, request| ext_protocol::handle(request));
    #[cfg(windows)]
    let builder = builder
        .invoke_handler(tauri::generate_handler![
            caption_set_colors,
            caption_debug,
            ext_check,
            ext_roots,
            dev_ext_add_root
        ])
        .setup(|app| {
            use tauri::Manager;
            if let Some(window) = app.get_webview_window("main") {
                let hwnd = window.hwnd()?;
                caption::install(hwnd.0 as isize);
            }
            Ok(())
        });
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(windows)]
mod caption;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(windows)]
    let builder = builder
        .invoke_handler(tauri::generate_handler![caption_set_colors, caption_debug])
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

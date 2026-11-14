mod caption;
mod clipboard;
mod state;
mod files;
mod folder_watch;
mod text_io;
mod user_file;
mod name_search;
mod preview;

use notify::{Event, EventKind, RecursiveMode, Watcher};
use tauri::{Emitter, Manager};

fn app_data_dir() -> Result<std::path::PathBuf, String> {
    std::env::var_os("APPDATA")
        .map(|path| std::path::PathBuf::from(path).join("workbench-tauri"))
        .ok_or_else(|| "APPDATA is not set".to_string())
}

#[tauri::command]
fn read_user_keymap() -> Result<Option<String>, String> {
    user_file::read(&app_data_dir()?, "keymap.json")
}

#[tauri::command]
fn write_user_keymap(expected: Option<String>, json: String) -> Result<(), String> {
    user_file::write(&app_data_dir()?, "keymap.json", expected.as_deref(), &json)
}

#[tauri::command]
fn ensure_user_keymap() -> Result<String, String> {
    user_file::ensure(&app_data_dir()?, "keymap.json", "[]\n")
}

#[tauri::command]
fn read_user_settings() -> Result<Option<String>, String> {
    user_file::read(&app_data_dir()?, "settings.json")
}

#[tauri::command]
fn write_user_settings(expected: Option<String>, json: String) -> Result<(), String> {
    user_file::write(&app_data_dir()?, "settings.json", expected.as_deref(), &json)
}

#[tauri::command]
fn ensure_user_settings() -> Result<String, String> {
    user_file::ensure(&app_data_dir()?, "settings.json", "{}\n")
}

#[tauri::command]
fn edit_user_settings(app: tauri::AppHandle) -> Result<(), String> {
    app.emit_to("main", "edit-user-settings", ()).map_err(|error| error.to_string())?;
    let main = app.get_webview_window("main").ok_or("main window missing")?;
    main.unminimize().map_err(|error| error.to_string())?;
    main.set_focus().map_err(|error| error.to_string())
}

#[tauri::command]
async fn open_settings(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("settings") {
        window.unminimize().map_err(|error| error.to_string())?;
        return window.set_focus().map_err(|error| error.to_string());
    }
    // I-2 Zed measured 2026-11-07, D-15.
    // shortcut: one capture at 100%; remeasure for other DPI and fonts.
    const SETTINGS_WIDTH: f64 = 900.0;
    const SETTINGS_HEIGHT: f64 = 750.0;
    let mut builder = tauri::WebviewWindowBuilder::new(&app, "settings", tauri::WebviewUrl::App("index.html?window=settings".into()))
        .title("Settings").inner_size(SETTINGS_WIDTH, SETTINGS_HEIGHT)
        .decorations(false).shadow(true).visible(false);
    // I-15: the browser args come from the main window's config (tauri.conf.json), so both windows share one WebView2
    // environment; different args would fail this window's creation. They are wry's defaults (replaced when args are given)
    // plus `--webrtc-ip-handling-policy=disable_non_proxied_udp`: a preview page's `srcdoc` child frame gets a fresh
    // `RTCPeerConnection` that no script can remove (leader-probe probe5), so WebRTC UDP is turned off for the whole browser.
    // The `--force-webrtc-ip-handling-policy` form has no effect in WebView2 (leader-probe probe5b). The app uses no WebRTC. Removing it in the frame (editor/html.ts NO_WEBRTC) and CSP `webrtc 'block'` stay as further layers.
    if let Some(args) = app.config().app.windows.iter().find(|w| w.label == "main").and_then(|w| w.additional_browser_args.as_deref()) {
        builder = builder.additional_browser_args(args);
    }
    let window = builder.build().map_err(|error| error.to_string())?;
    let caption_window = window.clone();
    window.run_on_main_thread(move || {
        match caption_window.hwnd() {
            Ok(hwnd) => caption::install(hwnd),
            Err(error) => eprintln!("Failed to install Settings caption: {error}"),
        }
    }).map_err(|error| error.to_string())?;
    Ok(())
}

fn is_user_file_change(event: &Event, name: &str) -> bool {
    matches!(event.kind, EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_))
        && event.paths.iter().any(|path| {
            path.file_name()
                .is_some_and(|file| file.eq_ignore_ascii_case(name))
        })
}

fn watch_user_files(app: tauri::AppHandle) -> Result<notify::RecommendedWatcher, String> {
    let dir = app_data_dir()?;
    std::fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let mut watcher = notify::recommended_watcher(move |result: notify::Result<Event>| match result {
        Ok(event) => {
            for (name, notification) in [("keymap.json", "user-keymap-changed"), ("settings.json", "user-settings-changed")] {
                if is_user_file_change(&event, name) {
                    if let Err(error) = app.emit(notification, ()) { eprintln!("Failed to emit {name} change: {error}"); }
                }
            }
        }
        Err(error) => eprintln!("User settings/keymap watch error: {error}"),
    })
    .map_err(|error| error.to_string())?;
    watcher.watch(&dir, RecursiveMode::NonRecursive).map_err(|error| error.to_string())?;
    Ok(watcher)
}

/// I-29: the About window's Host and WebView2 lines. The WebView2 version is empty when the runtime cannot be asked.
#[tauri::command]
fn about_info() -> serde_json::Value {
    serde_json::json!({ "tauri": tauri::VERSION, "webview2": tauri::webview_version().unwrap_or_default() })
}

#[tauri::command]
fn caption_set_colors(window: tauri::WebviewWindow, colors: [String; 5]) -> Result<(), String> {
    caption::set_colors(window.hwnd().map_err(|e| e.to_string())?, &colors)
}

/// core v0.8.3 I-14: Zen Mode hides the title bar, so the native maximize button over it goes and comes back with it.
#[tauri::command]
fn caption_set_visible(window: tauri::WebviewWindow, visible: bool) -> Result<(), String> {
    let target = window.clone();
    window.run_on_main_thread(move || match target.hwnd() {
        Ok(hwnd) => caption::set_visible(hwnd, visible),
        Err(error) => eprintln!("Failed to show or hide the caption button: {error}"),
    }).map_err(|error| error.to_string())
}

#[tauri::command]
async fn check_folder(path: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let path = std::path::Path::new(&path);
        if !std::fs::metadata(path).map_err(|e| e.to_string())?.is_dir() {
            return Err("Not a folder".into());
        }
        for entry in std::fs::read_dir(path).map_err(|e| e.to_string())? {
            entry.map_err(|e| e.to_string())?;
        }
        Ok(())
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
async fn paths_exist(paths: Vec<String>) -> Vec<bool> {
    let count = paths.len();
    match tauri::async_runtime::spawn_blocking(move || paths.iter().map(|p| std::path::Path::new(p).exists()).collect()).await {
        Ok(result) => result,
        Err(error) => {
            eprintln!("Failed to check paths: {error}");
            vec![false; count]
        }
    }
}

#[tauri::command]
async fn read_state() -> Result<serde_json::Value, String> {
    tauri::async_runtime::spawn_blocking(|| state::read(&app_data_dir()?))
        .await.map_err(|e| e.to_string())?
}

#[tauri::command]
async fn write_state(json: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || state::write(&app_data_dir()?, &json))
        .await.map_err(|e| e.to_string())?
}

fn centered_outer_position(
    work_origin: tauri::PhysicalPosition<i32>,
    work_size: tauri::PhysicalSize<u32>,
    client_size: tauri::PhysicalSize<u32>,
    client_offset: tauri::PhysicalPosition<i32>,
) -> tauri::PhysicalPosition<i32> {
    tauri::PhysicalPosition::new(
        work_origin.x + (work_size.width as i32 - client_size.width as i32) / 2 - client_offset.x,
        work_origin.y + (work_size.height as i32 - client_size.height as i32) / 2 - client_offset.y,
    )
}

fn compensated_min_size(
    minimum: tauri::LogicalSize<f64>,
    outer: tauri::PhysicalSize<u32>,
    inner: tauri::PhysicalSize<u32>,
    scale: f64,
) -> tauri::LogicalSize<f64> {
    tauri::LogicalSize::new(
        minimum.width + outer.width.saturating_sub(inner.width) as f64 / scale,
        minimum.height + outer.height.saturating_sub(inner.height) as f64 / scale,
    )
}

fn preview_scheme(ctx: tauri::UriSchemeContext<'_, tauri::Wry>, request: tauri::http::Request<Vec<u8>>) -> tauri::http::Response<Vec<u8>> {
    preview::respond(&ctx.app_handle().state::<preview::PreviewDocs>(), request.uri().path())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(folder_watch::FolderWatch::default())
        .manage(preview::PreviewDocs::default())
        .register_uri_scheme_protocol("preview", preview_scheme)
        // I-14: a second site for the same documents. WebView2 gives it its own renderer process, so a page stuck in a loop on one
        // host does not hold the next preview drawn on the other (markdown-preview.ts, previewHost).
        .register_uri_scheme_protocol("preview1", preview_scheme)
        // I-14: a third site, only for previews once stuck, so a page that loops again does not stop an ordinary host.
        .register_uri_scheme_protocol("preview2", preview_scheme)
        .setup(|app| {
            let main = app.get_webview_window("main").ok_or("main window missing")?;
            let handle = app.handle().clone();
            main.on_window_event(move |event| {
                if matches!(event, tauri::WindowEvent::Destroyed) {
                    if let Some(settings) = handle.get_webview_window("settings") {
                        if let Err(error) = settings.close() { eprintln!("Failed to close Settings: {error}"); }
                    }
                }
            });
            caption::install(main.hwnd()?);
            let monitor = main.current_monitor()?.ok_or("main window monitor missing")?;
            let work_area = monitor.work_area();
            let outer = main.outer_position()?;
            let inner = main.inner_position()?;
            // I-6: center the client area, excluding the invisible resize border; all values are physical pixels.
            main.set_position(centered_outer_position(
                work_area.position,
                work_area.size,
                main.inner_size()?,
                tauri::PhysicalPosition::new(inner.x - outer.x, inner.y - outer.y),
            ))?;
            let config = app.config().app.windows.iter().find(|window| window.label == "main")
                .ok_or("main window configuration missing")?;
            // I-6: compensate for the undecorated window's invisible resize border.
            // shortcut: sample borders at startup; recompute on DPI changes if per-monitor border proportions differ.
            main.set_min_size(Some(compensated_min_size(
                tauri::LogicalSize::new(
                    config.min_width.ok_or("main window minWidth missing")?,
                    config.min_height.ok_or("main window minHeight missing")?,
                ),
                main.outer_size()?,
                main.inner_size()?,
                main.scale_factor()?,
            )))?;
            match watch_user_files(app.handle().clone()) {
                Ok(watcher) => { app.manage(watcher); }
                Err(error) => eprintln!("Failed to watch user settings/keymap: {error}"),
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![caption_set_colors, caption_set_visible, clipboard::read_clipboard_text, clipboard::write_clipboard_text, about_info, read_user_settings, write_user_settings, ensure_user_settings, edit_user_settings, open_settings, read_user_keymap, write_user_keymap, ensure_user_keymap, check_folder, paths_exist, read_state, write_state, files::list_dir, files::read_file, files::create_file, files::create_dir, files::rename_path, files::trash_paths, files::trash_for_undo, files::restore_trashed, files::delete_paths, files::confirm, files::confirm_buttons, files::paste_paths, files::duplicate_path, folder_watch::watch_folder, text_io::save_text, name_search::search_names, preview::preview_set, preview::preview_drop])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::is_user_file_change;
    use notify::{event::{AccessKind, CreateKind, ModifyKind, RemoveKind, RenameMode}, Event, EventKind};

    #[test]
    fn centers_client_area_with_resize_border_offset() {
        use tauri::{PhysicalPosition, PhysicalSize};

        for scale in [1, 2] {
            assert_eq!(
                super::centered_outer_position(
                    PhysicalPosition::new(0, 0),
                    PhysicalSize::new(1920 * scale, 1032 * scale),
                    PhysicalSize::new(1440 * scale, 852 * scale),
                    PhysicalPosition::new(8 * scale as i32, scale as i32),
                ),
                PhysicalPosition::new(232 * scale as i32, 89 * scale as i32),
            );
        }
    }

    #[test]
    fn compensates_minimum_client_size_for_resize_border() {
        use tauri::{LogicalSize, PhysicalSize};

        for scale in [1, 2] {
            assert_eq!(
                super::compensated_min_size(
                    LogicalSize::new(360.0, 240.0),
                    PhysicalSize::new(1456 * scale, 861 * scale),
                    PhysicalSize::new(1440 * scale, 852 * scale),
                    scale as f64,
                ),
                LogicalSize::new(376.0, 249.0),
            );
        }
    }

    #[test]
    fn filters_user_file_changes_including_renames() {
        for name in ["keymap.json", "settings.json"] {
            for kind in [EventKind::Create(CreateKind::Any), EventKind::Modify(ModifyKind::Any), EventKind::Remove(RemoveKind::Any)] {
                assert!(is_user_file_change(&Event::new(kind).add_path(name.to_uppercase().into()), name));
                assert!(!is_user_file_change(&Event::new(kind).add_path("state.json".into()), name));
            }
            assert!(is_user_file_change(&Event::new(EventKind::Modify(ModifyKind::Name(RenameMode::Both)))
                .add_path("temporary".into()).add_path(name.into()), name));
            assert!(!is_user_file_change(&Event::new(EventKind::Access(AccessKind::Any)).add_path(name.into()), name));
        }
    }
}

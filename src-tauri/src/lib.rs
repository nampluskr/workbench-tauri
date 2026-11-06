mod caption;
mod ext_protocol;
mod state;
mod files;
mod folder_watch;
mod text_io;

use notify::{Event, EventKind, RecursiveMode, Watcher};
use tauri::{Emitter, Manager};

fn app_data_dir() -> Result<std::path::PathBuf, String> {
    std::env::var_os("APPDATA")
        .map(|path| std::path::PathBuf::from(path).join("workbench-tauri"))
        .ok_or_else(|| "APPDATA is not set".to_string())
}

#[tauri::command]
fn read_user_keymap() -> Result<Option<String>, String> {
    match std::fs::read_to_string(app_data_dir()?.join("keymap.json")) {
        Ok(contents) => Ok(Some(contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error.to_string()),
    }
}

fn is_keymap_change(event: &Event) -> bool {
    matches!(event.kind, EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_))
        && event.paths.iter().any(|path| {
            path.file_name()
                .is_some_and(|name| name.eq_ignore_ascii_case("keymap.json"))
        })
}

fn watch_user_keymap(app: tauri::AppHandle) -> Result<notify::RecommendedWatcher, String> {
    let dir = app_data_dir()?;
    std::fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    let mut watcher = notify::recommended_watcher(move |result: notify::Result<Event>| match result {
        Ok(event) if is_keymap_change(&event) => {
            if let Err(error) = app.emit("user-keymap-changed", ()) {
                eprintln!("Failed to emit keymap change: {error}");
            }
        }
        Ok(_) => {}
        Err(error) => eprintln!("Keymap watch error: {error}"),
    })
    .map_err(|error| error.to_string())?;
    watcher.watch(&dir, RecursiveMode::NonRecursive).map_err(|error| error.to_string())?;
    Ok(watcher)
}

#[tauri::command]
fn caption_set_colors(window: tauri::WebviewWindow, colors: [String; 5]) -> Result<(), String> {
    caption::set_colors(window.hwnd().map_err(|e| e.to_string())?, &colors)
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

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(folder_watch::FolderWatch::default())
        .setup(|app| {
            let main = app.get_webview_window("main").ok_or("main window missing")?;
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
            match watch_user_keymap(app.handle().clone()) {
                Ok(watcher) => { app.manage(watcher); }
                Err(error) => eprintln!("Failed to watch keymap: {error}"),
            }
            Ok(())
        })
        .register_uri_scheme_protocol("zlext", |_ctx, request| ext_protocol::respond(&request))
        .invoke_handler(tauri::generate_handler![caption_set_colors, read_user_keymap, check_folder, paths_exist, read_state, write_state, files::list_dir, files::read_file, files::create_file, files::create_dir, files::rename_path, files::trash_paths, files::delete_paths, files::confirm, files::confirm_buttons, files::paste_paths, files::duplicate_path, folder_watch::watch_folder, text_io::save_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::is_keymap_change;
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
    fn filters_keymap_changes_including_renames() {
        for kind in [EventKind::Create(CreateKind::Any), EventKind::Modify(ModifyKind::Any), EventKind::Remove(RemoveKind::Any)] {
            assert!(is_keymap_change(&Event::new(kind).add_path("KEYMAP.JSON".into())));
            assert!(!is_keymap_change(&Event::new(kind).add_path("state.json".into())));
        }
        assert!(is_keymap_change(&Event::new(EventKind::Modify(ModifyKind::Name(RenameMode::Both)))
            .add_path("temporary".into()).add_path("keymap.json".into())));
        assert!(!is_keymap_change(&Event::new(EventKind::Access(AccessKind::Any)).add_path("keymap.json".into())));
    }
}

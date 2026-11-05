mod caption;
mod ext_protocol;

use tauri::Manager;

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

#[tauri::command]
fn caption_set_colors(window: tauri::WebviewWindow, colors: [String; 5]) -> Result<(), String> {
    caption::set_colors(window.hwnd().map_err(|e| e.to_string())?, &colors)
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let main = app.get_webview_window("main").ok_or("main window missing")?;
            caption::install(main.hwnd()?);
            Ok(())
        })
        .register_uri_scheme_protocol("zlext", |_ctx, request| ext_protocol::respond(&request))
        .invoke_handler(tauri::generate_handler![caption_set_colors, read_user_keymap])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

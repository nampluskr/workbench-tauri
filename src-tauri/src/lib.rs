mod caption;

use tauri::Manager;

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
        .invoke_handler(tauri::generate_handler![caption_set_colors])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

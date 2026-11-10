use windows::Win32::{
    Foundation::HGLOBAL,
    System::{
        DataExchange::{CloseClipboard, GetClipboardData, IsClipboardFormatAvailable, OpenClipboard},
        Memory::{GlobalLock, GlobalSize, GlobalUnlock},
        Ole::CF_UNICODETEXT,
    },
};

/// I-13: the menu Paste reads the clipboard here, so WebView2 never shows its clipboard permission prompt.
/// Returns an empty string when the clipboard holds no text.
#[tauri::command]
pub fn read_clipboard_text() -> Result<String, String> {
    // SAFETY: the clipboard is opened for the whole read and closed on every path; the global memory block is locked
    // while its UTF-16 units are copied out, and the copy is bounded by the block's size.
    unsafe {
        // Another process can hold the clipboard for a moment; ask a few times before giving up.
        let mut opened = OpenClipboard(None);
        for _ in 0..5 {
            if opened.is_ok() { break; }
            std::thread::sleep(std::time::Duration::from_millis(10));
            opened = OpenClipboard(None);
        }
        opened.map_err(|error| error.to_string())?;
        let text = read_unicode_text();
        let _ = CloseClipboard();
        text
    }
}

unsafe fn read_unicode_text() -> Result<String, String> {
    if IsClipboardFormatAvailable(CF_UNICODETEXT.0 as u32).is_err() { return Ok(String::new()); }
    let handle = HGLOBAL(GetClipboardData(CF_UNICODETEXT.0 as u32).map_err(|error| error.to_string())?.0);
    let data = GlobalLock(handle) as *const u16;
    if data.is_null() { return Err("The clipboard text could not be read.".into()); }
    let units = std::slice::from_raw_parts(data, GlobalSize(handle) / 2);
    let text = String::from_utf16_lossy(units.split(|unit| *unit == 0).next().unwrap_or_default());
    let _ = GlobalUnlock(handle);
    Ok(text)
}

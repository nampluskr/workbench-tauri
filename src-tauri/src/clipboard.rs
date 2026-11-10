use windows::Win32::{
    Foundation::{GlobalFree, HANDLE, HGLOBAL},
    System::{
        DataExchange::{CloseClipboard, EmptyClipboard, GetClipboardData, IsClipboardFormatAvailable, OpenClipboard, SetClipboardData},
        Memory::{GlobalAlloc, GlobalLock, GlobalSize, GlobalUnlock, GMEM_MOVEABLE},
        Ole::CF_UNICODETEXT,
    },
};

/// Another process can hold the clipboard for a moment; ask a few times before giving up.
unsafe fn open_clipboard() -> Result<(), String> {
    let mut opened = OpenClipboard(None);
    for _ in 0..5 {
        if opened.is_ok() { break; }
        std::thread::sleep(std::time::Duration::from_millis(10));
        opened = OpenClipboard(None);
    }
    opened.map_err(|error| error.to_string())
}

/// I-13: the menu Paste reads the clipboard here, so WebView2 never shows its clipboard permission prompt.
/// Returns an empty string when the clipboard holds no text.
#[tauri::command]
pub fn read_clipboard_text() -> Result<String, String> {
    // SAFETY: the clipboard is opened for the whole read and closed on every path; the global memory block is locked
    // while its UTF-16 units are copied out, and the copy is bounded by the block's size.
    unsafe {
        open_clipboard()?;
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

/// I-29: the About window's Copy writes the clipboard here, so it never depends on WebView2's clipboard permission behavior.
#[tauri::command]
pub fn write_clipboard_text(text: String) -> Result<(), String> {
    let units: Vec<u16> = text.encode_utf16().chain(std::iter::once(0)).collect();
    // SAFETY: the clipboard is opened for the whole write and closed on every path; the block is sized for every unit plus the
    // terminator, locked only while the units are copied in, and freed here unless the clipboard took ownership of it.
    unsafe {
        open_clipboard()?;
        let result = write_unicode_text(&units);
        let _ = CloseClipboard();
        result
    }
}

unsafe fn write_unicode_text(units: &[u16]) -> Result<(), String> {
    EmptyClipboard().map_err(|error| error.to_string())?;
    let block = GlobalAlloc(GMEM_MOVEABLE, units.len() * 2).map_err(|error| error.to_string())?;
    let data = GlobalLock(block) as *mut u16;
    if data.is_null() {
        let _ = GlobalFree(Some(block));
        return Err("The clipboard text could not be written.".into());
    }
    std::ptr::copy_nonoverlapping(units.as_ptr(), data, units.len());
    let _ = GlobalUnlock(block);
    match SetClipboardData(CF_UNICODETEXT.0 as u32, Some(HANDLE(block.0))) {
        Ok(_) => Ok(()),
        Err(error) => {
            let _ = GlobalFree(Some(block));
            Err(error.to_string())
        }
    }
}

//! Maximize button of the undecorated window (SPEC R-3, D-6 step 2).
//!
//! Windows shows the snap layout flyout only when the *top-level* window answers
//! `WM_NCHITTEST` with `HTMAXBUTTON`. The WebView child covers the client area and its
//! innermost window belongs to the WebView2 browser process, so that process gets the hit
//! test instead. We therefore cut a hole the size of the button out of the `WRY_WEBVIEW`
//! child (`SetWindowRgn`); inside the hole the top-level window is hit, answers
//! `HTMAXBUTTON`, tracks hover/press itself and draws the button with GDI.
//! The colors come from the theme (`set_colors`), the maximize/restore glyph from `IsZoomed`.

use std::{collections::HashMap, sync::{Arc, LazyLock, Mutex, atomic::{AtomicBool, AtomicU32, Ordering::Relaxed}}};

use windows::core::{w, PCWSTR};
use windows::Win32::Foundation::{COLORREF, HWND, LPARAM, LRESULT, POINT, RECT, WPARAM};
use windows::Win32::Graphics::Gdi::{
    CombineRgn, CreateFontW, CreateRectRgn, CreateSolidBrush, DeleteObject, DrawTextW, FillRect,
    GetDC, InvalidateRect, ReleaseDC, ScreenToClient, SelectObject, SetBkMode, SetTextColor,
    SetWindowRgn, CLEARTYPE_QUALITY, CLIP_DEFAULT_PRECIS, DEFAULT_CHARSET, DT_CENTER,
    DT_NOPREFIX, DT_SINGLELINE, DT_VCENTER, HGDIOBJ, OUT_DEFAULT_PRECIS, RGN_DIFF, TRANSPARENT,
};
use windows::Win32::UI::HiDpi::GetDpiForWindow;
use windows::Win32::UI::Input::KeyboardAndMouse::{
    TrackMouseEvent, TME_LEAVE, TME_NONCLIENT, TRACKMOUSEEVENT,
};
use windows::Win32::UI::Shell::{DefSubclassProc, SetWindowSubclass};
use windows::Win32::UI::WindowsAndMessaging::{
    FindWindowExW, GetClientRect, GetWindowRect, IsZoomed, ShowWindow, HTMAXBUTTON, SW_MAXIMIZE,
    SW_RESTORE, WM_DPICHANGED, WM_NCACTIVATE, WM_NCHITTEST, WM_NCLBUTTONDBLCLK, WM_NCLBUTTONDOWN,
    WM_NCLBUTTONUP, WM_NCMOUSELEAVE, WM_NCMOUSEMOVE, WM_NCDESTROY, WM_PAINT, WM_SIZE,
};

// Spec IDs (spec/zed-metrics.toml): titlebar.window_button.{width,height,glyph_size}; 01-zed L-83.
const TITLEBAR_WINDOW_BUTTON_WIDTH: f64 = 36.0;
const TITLEBAR_WINDOW_BUTTON_HEIGHT: f64 = 32.0;
const TITLEBAR_WINDOW_BUTTON_GLYPH_SIZE: f64 = 10.0;
const GLYPH_MAXIMIZE: u16 = 0xE922;
const GLYPH_RESTORE: u16 = 0xE923;

// Window procedures re-enter each other (SetWindowRgn, ShowWindow), so the state is lock-free.
// COLORS: background, inactive background, hover, pressed, glyph (COLORREF).
struct Caption {
    colors: [AtomicU32; 5],
    hover: AtomicBool,
    pressed: AtomicBool,
    active: AtomicBool,
    // core v0.8.3 I-14: no title bar (Zen Mode), so no button: the WebView is whole again and nothing is hit or drawn here.
    hidden: AtomicBool,
}
static CAPTIONS: LazyLock<Mutex<HashMap<isize, Arc<Caption>>>> = LazyLock::new(|| Mutex::new(HashMap::new()));

fn caption(top: HWND) -> Option<Arc<Caption>> {
    CAPTIONS.lock().ok()?.get(&(top.0 as isize)).cloned()
}

fn scale(top: HWND) -> f64 {
    // SAFETY: plain Win32 query on a window handle of this process.
    match unsafe { GetDpiForWindow(top) } {
        0 => 1.0,
        dpi => dpi as f64 / 96.0,
    }
}

/// Second button from the right (minimize, maximize, close), client coordinates, physical px.
fn button_rect(top: HWND) -> RECT {
    let mut client = RECT::default();
    // shortcut: a failed call leaves an empty client rect, so the button is simply never hit.
    // SAFETY: plain Win32 query on a window handle of this process.
    unsafe { _ = GetClientRect(top, &mut client) };
    let s = scale(top);
    let w = client.right as f64;
    RECT {
        left: (w - 2.0 * TITLEBAR_WINDOW_BUTTON_WIDTH * s).round() as i32,
        top: 0,
        right: (w - TITLEBAR_WINDOW_BUTTON_WIDTH * s).round() as i32,
        bottom: (TITLEBAR_WINDOW_BUTTON_HEIGHT * s).round() as i32,
    }
}

fn redraw(top: HWND) {
    // SAFETY: plain Win32 call on a window handle of this process.
    unsafe { _ = InvalidateRect(Some(top), Some(&button_rect(top)), false) };
}

/// Cut the button's hole out of the WebView child so the top-level window is hit there.
fn apply_region(top: HWND) {
    // SAFETY: all handles belong to the live top-level window; the region handle is either
    // handed to the system (SetWindowRgn succeeded) or deleted here.
    unsafe {
        let Ok(webview) = FindWindowExW(Some(top), None, w!("WRY_WEBVIEW"), PCWSTR::null()) else {
            return;
        };
        if caption(top).is_some_and(|state| state.hidden.load(Relaxed)) {
            _ = SetWindowRgn(webview, None, true);
            return;
        }
        // Region coordinates are relative to the child, so subtract its origin.
        let (mut rect, mut origin) = (RECT::default(), POINT::default());
        _ = GetWindowRect(webview, &mut rect);
        (origin.x, origin.y) = (rect.left, rect.top);
        _ = ScreenToClient(top, &mut origin);
        _ = GetClientRect(top, &mut rect);
        let b = button_rect(top);
        let region = CreateRectRgn(0, 0, rect.right, rect.bottom);
        let hole = CreateRectRgn(b.left - origin.x, b.top - origin.y, b.right - origin.x, b.bottom - origin.y);
        CombineRgn(Some(region), Some(region), Some(hole), RGN_DIFF);
        _ = DeleteObject(HGDIOBJ(hole.0));
        if SetWindowRgn(webview, Some(region), true) == 0 {
            _ = DeleteObject(HGDIOBJ(region.0));
        }
    }
}

fn paint(top: HWND, state: &Caption) {
    if state.hidden.load(Relaxed) { return; }
    let color = |i: usize| COLORREF(state.colors[i].load(Relaxed));
    let background = if state.pressed.load(Relaxed) {
        color(3)
    } else if state.hover.load(Relaxed) {
        color(2)
    } else if state.active.load(Relaxed) {
        color(0)
    } else {
        color(1)
    };
    // SAFETY: the GDI objects created here are selected out and deleted before returning.
    unsafe {
        let mut rect = button_rect(top);
        let glyph = if IsZoomed(top).as_bool() { GLYPH_RESTORE } else { GLYPH_MAXIMIZE };
        let hdc = GetDC(Some(top));
        let brush = CreateSolidBrush(background);
        FillRect(hdc, &rect, brush);
        _ = DeleteObject(HGDIOBJ(brush.0));
        let font = CreateFontW(
            -((TITLEBAR_WINDOW_BUTTON_GLYPH_SIZE * scale(top)).round() as i32),
            0, 0, 0, 400, 0, 0, 0,
            DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, 0,
            w!("Segoe Fluent Icons"),
        );
        let old = SelectObject(hdc, HGDIOBJ(font.0));
        SetBkMode(hdc, TRANSPARENT);
        SetTextColor(hdc, color(4));
        DrawTextW(hdc, &mut [glyph], &mut rect, DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX);
        SelectObject(hdc, old);
        _ = DeleteObject(HGDIOBJ(font.0));
        ReleaseDC(Some(top), hdc);
    }
}

/// Subclass procedure of the top-level window; called by the system with valid arguments.
unsafe extern "system" fn top_proc(
    top: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    _id: usize,
    _data: usize,
) -> LRESULT {
    if msg == WM_NCDESTROY {
        let result = DefSubclassProc(top, msg, wparam, lparam);
        if let Ok(mut captions) = CAPTIONS.lock() { captions.remove(&(top.0 as isize)); }
        return result;
    }
    let Some(state) = caption(top) else { return DefSubclassProc(top, msg, wparam, lparam) };
    let on_button = wparam.0 == HTMAXBUTTON as usize;
    match msg {
        WM_NCHITTEST => {
            // lparam holds the screen coordinates as two signed 16-bit values.
            let mut pt = POINT { x: lparam.0 as i16 as i32, y: (lparam.0 >> 16) as i16 as i32 };
            _ = ScreenToClient(top, &mut pt);
            let b = button_rect(top);
            if !state.hidden.load(Relaxed) && pt.x >= b.left && pt.x < b.right && pt.y >= b.top && pt.y < b.bottom {
                return LRESULT(HTMAXBUTTON as isize);
            }
        }
        WM_NCMOUSEMOVE if on_button => {
            let mut track = TRACKMOUSEEVENT {
                cbSize: size_of::<TRACKMOUSEEVENT>() as u32,
                dwFlags: TME_LEAVE | TME_NONCLIENT,
                hwndTrack: top,
                dwHoverTime: 0,
            };
            _ = TrackMouseEvent(&mut track);
            state.hover.store(true, Relaxed);
            redraw(top);
            // Fall through to the default handling: that is what starts the snap flyout.
        }
        WM_NCMOUSELEAVE => {
            state.hover.store(false, Relaxed);
            state.pressed.store(false, Relaxed);
            redraw(top);
        }
        // Handled here: the default would draw a classic caption button.
        WM_NCLBUTTONDOWN | WM_NCLBUTTONDBLCLK if on_button => {
            state.pressed.store(true, Relaxed);
            redraw(top);
            return LRESULT(0);
        }
        WM_NCLBUTTONUP if on_button => {
            if state.pressed.swap(false, Relaxed) {
                _ = ShowWindow(top, if IsZoomed(top).as_bool() { SW_RESTORE } else { SW_MAXIMIZE });
            }
            redraw(top);
            return LRESULT(0);
        }
        WM_NCACTIVATE => {
            state.active.store(wparam.0 != 0, Relaxed);
            redraw(top);
        }
        WM_SIZE | WM_DPICHANGED => {
            let result = DefSubclassProc(top, msg, wparam, lparam);
            apply_region(top);
            redraw(top);
            return result;
        }
        WM_PAINT => {
            let result = DefSubclassProc(top, msg, wparam, lparam);
            paint(top, &state);
            return result;
        }
        _ => {}
    }
    DefSubclassProc(top, msg, wparam, lparam)
}

pub fn install(top: HWND) {
    let state = Arc::new(Caption {
        colors: [const { AtomicU32::new(0) }; 5],
        hover: AtomicBool::new(false), pressed: AtomicBool::new(false), active: AtomicBool::new(true),
        hidden: AtomicBool::new(false),
    });
    // SAFETY: called on the live window's UI thread; the subclass is removed with the window.
    if !unsafe { SetWindowSubclass(top, Some(top_proc), 1, 0) }.as_bool() { return; }
    if let Ok(mut captions) = CAPTIONS.lock() { captions.insert(top.0 as isize, state); }
    apply_region(top);
    redraw(top);
}

/// Show the button again, or take it away with its hole in the WebView (Zen Mode). Call on the window's UI thread.
pub fn set_visible(top: HWND, visible: bool) {
    let Some(state) = caption(top) else { return };
    state.hidden.store(!visible, Relaxed);
    state.hover.store(false, Relaxed);
    state.pressed.store(false, Relaxed);
    apply_region(top);
    redraw(top);
}

/// Five `#rrggbb` strings in the order of `COLORS`.
pub fn set_colors(top: HWND, colors: &[String; 5]) -> Result<(), String> {
    let parse = |s: &String| {
        let rgb = s.strip_prefix('#').filter(|h| h.len() == 6).and_then(|h| u32::from_str_radix(h, 16).ok());
        // RGB -> COLORREF (0x00BBGGRR)
        rgb.map(|n| (n >> 16 & 0xff) | (n & 0xff00) | (n & 0xff) << 16)
            .ok_or_else(|| format!("bad color {s}"))
    };
    let parsed = colors.iter().map(parse).collect::<Result<Vec<_>, _>>()?;
    let state = caption(top).ok_or("Caption is not installed")?;
    for (slot, value) in state.colors.iter().zip(parsed) {
        slot.store(value, Relaxed);
    }
    redraw(top);
    Ok(())
}

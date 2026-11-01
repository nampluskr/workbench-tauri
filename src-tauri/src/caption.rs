//! Native maximize button for the undecorated window (SPEC R-3, R-4; D-7).
//!
//! With `decorations: false` the title bar is HTML, but Windows only shows the
//! snap-layout flyout when the *top-level* window answers `WM_NCHITTEST` with
//! `HTMAXBUTTON`. The WebView covers the whole client area and its input
//! windows belong to the WebView2 browser process, so they would get the hit
//! test instead. We therefore cut a hole the size of the maximize button out of
//! the `WRY_WEBVIEW` child (`SetWindowRgn`). Inside the hole the top-level
//! window is hit, answers `HTMAXBUTTON`, and paints the button itself:
//! 36x32 logical px, a 10 px glyph in "Segoe Fluent Icons", U+E922 maximize /
//! U+E923 restore (L-39, L-83, L-312). Colors come from the active theme via
//! the `caption_set_colors` command.

#[cfg(windows)]
mod imp {
    use std::sync::Mutex;

    use windows::core::{w, PCWSTR};
    use windows::Win32::Foundation::{COLORREF, HWND, LPARAM, LRESULT, POINT, RECT, WPARAM};
    use windows::Win32::Graphics::Dwm::{
        DwmSetWindowAttribute, DWMWA_WINDOW_CORNER_PREFERENCE, DWMWCP_ROUND,
    };
    use windows::Win32::Graphics::Gdi::{
        CombineRgn, CreateFontW, CreateRectRgn, CreateSolidBrush, DeleteObject, DrawTextW,
        FillRect, GetDC, InvalidateRect, ReleaseDC, ScreenToClient, SelectObject, SetBkMode,
        SetTextColor, SetWindowRgn, CLEARTYPE_QUALITY, CLIP_DEFAULT_PRECIS, DEFAULT_CHARSET,
        DT_CENTER, DT_NOPREFIX, DT_SINGLELINE, DT_VCENTER, HDC, HGDIOBJ, OUT_DEFAULT_PRECIS,
        RGN_DIFF, TRANSPARENT,
    };
    use windows::Win32::UI::HiDpi::GetDpiForWindow;
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        TrackMouseEvent, TME_LEAVE, TME_NONCLIENT, TRACKMOUSEEVENT,
    };
    use windows::Win32::UI::Shell::{DefSubclassProc, SetWindowSubclass};
    use windows::Win32::UI::WindowsAndMessaging::{
        FindWindowExW, GetClientRect, GetWindowRect, IsZoomed, ShowWindow, HTMAXBUTTON,
        SW_MAXIMIZE, SW_RESTORE, WM_ACTIVATE, WM_DPICHANGED, WM_NCACTIVATE, WM_NCHITTEST,
        WM_NCLBUTTONDBLCLK, WM_NCLBUTTONDOWN, WM_NCLBUTTONUP, WM_NCMOUSELEAVE, WM_NCMOUSEMOVE,
        WM_PAINT, WM_PRINT, WM_PRINTCLIENT, WM_SIZE, WM_WINDOWPOSCHANGED,
    };

    /// L-39: each window button is 36x32 logical px, glyph 10 px.
    const BUTTON_W: f64 = 36.0;
    const BUTTON_H: f64 = 32.0;
    const GLYPH_PX: f64 = 10.0;
    /// L-83 / L-312 code points (Segoe Fluent Icons).
    const GLYPH_MAXIMIZE: u16 = 0xE922;
    const GLYPH_RESTORE: u16 = 0xE923;
    const TOP_SUBCLASS_ID: usize = 0x5A4C_0001;
    const WEBVIEW_SUBCLASS_ID: usize = 0x5A4C_0002;

    #[derive(Clone, Copy, Debug)]
    struct Colors {
        background: COLORREF,
        inactive_background: COLORREF,
        hover: COLORREF,
        pressed: COLORREF,
        foreground: COLORREF,
    }

    struct State {
        top: isize,
        webview: isize,
        colors: Colors,
        hover: bool,
        pressed: bool,
        active: bool,
        region_applied: bool,
    }

    static STATE: Mutex<Option<State>> = Mutex::new(None);

    /// Colors sent by the frontend as "#rrggbb" (alpha already composited).
    pub struct CaptionColors {
        pub background: String,
        pub inactive_background: String,
        pub hover: String,
        pub pressed: String,
        pub foreground: String,
    }

    fn parse_hex(s: &str) -> Option<COLORREF> {
        let h = s.strip_prefix('#')?;
        if h.len() != 6 {
            return None;
        }
        let n = u32::from_str_radix(h, 16).ok()?;
        let (r, g, b) = ((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
        Some(COLORREF(r | (g << 8) | (b << 16)))
    }

    fn hwnd(v: isize) -> HWND {
        HWND(v as *mut core::ffi::c_void)
    }

    fn scale(top: HWND) -> f64 {
        let dpi = unsafe { GetDpiForWindow(top) };
        if dpi == 0 {
            1.0
        } else {
            dpi as f64 / 96.0
        }
    }

    /// Maximize button: second from the right (minimize, maximize, close).
    fn button_rect(top: HWND) -> RECT {
        let mut rc = RECT::default();
        unsafe {
            let _ = GetClientRect(top, &mut rc);
        }
        let s = scale(top);
        let w = rc.right as f64;
        RECT {
            left: (w - 2.0 * BUTTON_W * s).round() as i32,
            top: 0,
            right: (w - BUTTON_W * s).round() as i32,
            bottom: (BUTTON_H * s).round() as i32,
        }
    }

    fn find_webview(top: HWND) -> Option<HWND> {
        unsafe { FindWindowExW(Some(top), None, w!("WRY_WEBVIEW"), PCWSTR::null()).ok() }
    }

    /// Cut the maximize-button hole out of the WebView child window.
    fn apply_region(st: &mut State) {
        let top = hwnd(st.top);
        if st.webview == 0 {
            match find_webview(top) {
                Some(wv) => {
                    st.webview = wv.0 as isize;
                    unsafe {
                        let _ = SetWindowSubclass(wv, Some(webview_proc), WEBVIEW_SUBCLASS_ID, 0);
                    }
                }
                None => return,
            }
        }
        let wv = hwnd(st.webview);
        let mut wr = RECT::default();
        let mut cr = RECT::default();
        unsafe {
            let _ = GetWindowRect(wv, &mut wr);
            let _ = GetClientRect(wv, &mut cr);
        }
        // WebView origin in the top-level client coordinates.
        let mut origin = POINT { x: wr.left, y: wr.top };
        unsafe {
            let _ = ScreenToClient(top, &mut origin);
        }
        let b = button_rect(top);
        unsafe {
            let full = CreateRectRgn(0, 0, cr.right, cr.bottom);
            let hole = CreateRectRgn(
                b.left - origin.x,
                b.top - origin.y,
                b.right - origin.x,
                b.bottom - origin.y,
            );
            CombineRgn(Some(full), Some(full), Some(hole), RGN_DIFF);
            let _ = DeleteObject(HGDIOBJ(hole.0));
            // The system owns `full` after a successful SetWindowRgn.
            st.region_applied = SetWindowRgn(wv, Some(full), true) != 0;
            if !st.region_applied {
                let _ = DeleteObject(HGDIOBJ(full.0));
            }
        }
    }

    fn invalidate_button(top: HWND) {
        let r = button_rect(top);
        unsafe {
            let _ = InvalidateRect(Some(top), Some(&r), false);
        }
    }

    fn paint_button(st: &State) {
        let top = hwnd(st.top);
        unsafe {
            let hdc = GetDC(Some(top));
            paint_button_to(st, hdc);
            ReleaseDC(Some(top), hdc);
        }
    }

    /// Draw the button into `hdc` (window DC, or the DC of WM_PRINT/WM_PRINTCLIENT
    /// so PrintWindow captures include it).
    fn paint_button_to(st: &State, hdc: HDC) {
        let top = hwnd(st.top);
        let rect = button_rect(top);
        let c = st.colors;
        let bg = if st.pressed {
            c.pressed
        } else if st.hover {
            c.hover
        } else if st.active {
            c.background
        } else {
            c.inactive_background
        };
        let glyph = if unsafe { IsZoomed(top).as_bool() } { GLYPH_RESTORE } else { GLYPH_MAXIMIZE };
        let s = scale(top);
        unsafe {
            let brush = CreateSolidBrush(bg);
            FillRect(hdc, &rect, brush);
            let _ = DeleteObject(HGDIOBJ(brush.0));
            let font = CreateFontW(
                -((GLYPH_PX * s).round() as i32),
                0,
                0,
                0,
                400,
                0,
                0,
                0,
                DEFAULT_CHARSET,
                OUT_DEFAULT_PRECIS,
                CLIP_DEFAULT_PRECIS,
                CLEARTYPE_QUALITY,
                0,
                w!("Segoe Fluent Icons"),
            );
            let old = SelectObject(hdc, HGDIOBJ(font.0));
            SetBkMode(hdc, TRANSPARENT);
            SetTextColor(hdc, c.foreground);
            let mut text = [glyph];
            let mut r = rect;
            DrawTextW(hdc, &mut text, &mut r, DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX);
            SelectObject(hdc, old);
            let _ = DeleteObject(HGDIOBJ(font.0));
        }
    }

    fn in_button(top: HWND, lparam: LPARAM) -> bool {
        let x = (lparam.0 & 0xffff) as u16 as i16 as i32;
        let y = ((lparam.0 >> 16) & 0xffff) as u16 as i16 as i32;
        let mut pt = POINT { x, y };
        unsafe {
            let _ = ScreenToClient(top, &mut pt);
        }
        let r = button_rect(top);
        pt.x >= r.left && pt.x < r.right && pt.y >= r.top && pt.y < r.bottom
    }

    /// Window procedures run on the UI thread and re-enter each other:
    /// SetWindowRgn sends WM_WINDOWPOSCHANGED to the WebView synchronously, and
    /// restoring the window sends WM_SIZE while we may be inside another
    /// handler. They must never block on STATE, so they use try_lock and skip
    /// the work when the state is already held further up the same stack.
    fn with_state<R>(f: impl FnOnce(&mut State) -> R) -> Option<R> {
        let mut guard = STATE.try_lock().ok()?;
        guard.as_mut().map(f)
    }

    unsafe extern "system" fn top_proc(
        h: HWND,
        msg: u32,
        wparam: WPARAM,
        lparam: LPARAM,
        _id: usize,
        _data: usize,
    ) -> LRESULT {
        match msg {
            WM_NCHITTEST if in_button(h, lparam) => return LRESULT(HTMAXBUTTON as isize),
            WM_NCMOUSEMOVE => {
                let over = wparam.0 == HTMAXBUTTON as usize;
                let changed = with_state(|st| {
                    let changed = over != st.hover;
                    st.hover = over;
                    if !over {
                        st.pressed = false;
                    }
                    changed
                })
                .unwrap_or(false);
                if changed {
                    invalidate_button(h);
                }
                if over {
                    let mut tme = TRACKMOUSEEVENT {
                        cbSize: core::mem::size_of::<TRACKMOUSEEVENT>() as u32,
                        dwFlags: TME_LEAVE | TME_NONCLIENT,
                        hwndTrack: h,
                        dwHoverTime: 0,
                    };
                    let _ = TrackMouseEvent(&mut tme);
                }
                // Let the system run its own handling (snap-layout flyout).
            }
            WM_NCMOUSELEAVE => {
                with_state(|st| {
                    st.hover = false;
                    st.pressed = false;
                });
                invalidate_button(h);
            }
            WM_NCLBUTTONDOWN | WM_NCLBUTTONDBLCLK if wparam.0 == HTMAXBUTTON as usize => {
                // Handle ourselves: DefWindowProc would draw a classic caption button.
                with_state(|st| st.pressed = true);
                invalidate_button(h);
                return LRESULT(0);
            }
            WM_NCLBUTTONUP if wparam.0 == HTMAXBUTTON as usize => {
                let was_pressed =
                    with_state(|st| std::mem::replace(&mut st.pressed, false)).unwrap_or(false);
                // The lock is released here; ShowWindow re-enters with WM_SIZE.
                if was_pressed {
                    let cmd = if IsZoomed(h).as_bool() { SW_RESTORE } else { SW_MAXIMIZE };
                    let _ = ShowWindow(h, cmd);
                }
                invalidate_button(h);
                return LRESULT(0);
            }
            WM_NCACTIVATE => {
                with_state(|st| st.active = wparam.0 != 0);
                invalidate_button(h);
            }
            WM_ACTIVATE => {
                with_state(|st| st.active = (wparam.0 & 0xffff) != 0);
                invalidate_button(h);
            }
            WM_SIZE | WM_DPICHANGED => {
                let r = DefSubclassProc(h, msg, wparam, lparam);
                with_state(apply_region);
                invalidate_button(h);
                return r;
            }
            WM_PRINT | WM_PRINTCLIENT => {
                let r = DefSubclassProc(h, msg, wparam, lparam);
                let hdc = HDC(wparam.0 as *mut core::ffi::c_void);
                with_state(|st| paint_button_to(st, hdc));
                return r;
            }
            WM_PAINT => {
                let r = DefSubclassProc(h, msg, wparam, lparam);
                with_state(|st| paint_button(st));
                return r;
            }
            _ => {}
        }
        DefSubclassProc(h, msg, wparam, lparam)
    }

    unsafe extern "system" fn webview_proc(
        h: HWND,
        msg: u32,
        wparam: WPARAM,
        lparam: LPARAM,
        _id: usize,
        _data: usize,
    ) -> LRESULT {
        let r = DefSubclassProc(h, msg, wparam, lparam);
        if msg == WM_SIZE || msg == WM_WINDOWPOSCHANGED {
            if let Some(top) = with_state(|st| {
                apply_region(st);
                st.top
            }) {
                invalidate_button(hwnd(top));
            }
        }
        r
    }

    pub fn install(top_raw: isize) {
        let top = hwnd(top_raw);
        let gray = COLORREF(0x00808080);
        let mut st = State {
            top: top_raw,
            webview: 0,
            colors: Colors {
                background: gray,
                inactive_background: gray,
                hover: gray,
                pressed: gray,
                foreground: COLORREF(0x00ffffff),
            },
            hover: false,
            pressed: false,
            active: true,
            region_applied: false,
        };
        unsafe {
            // D-7: rounded corners from DWM (D-13: corners/border are the OS's).
            let pref = DWMWCP_ROUND;
            let _ = DwmSetWindowAttribute(
                top,
                DWMWA_WINDOW_CORNER_PREFERENCE,
                &pref as *const _ as *const core::ffi::c_void,
                core::mem::size_of_val(&pref) as u32,
            );
            let _ = SetWindowSubclass(top, Some(top_proc), TOP_SUBCLASS_ID, 0);
        }
        apply_region(&mut st);
        *STATE.lock().unwrap() = Some(st);
        invalidate_button(top);
    }

    pub fn set_colors(c: CaptionColors) -> Result<(), String> {
        let p = |s: &str| parse_hex(s).ok_or_else(|| format!("bad color {s}"));
        let colors = Colors {
            background: p(&c.background)?,
            inactive_background: p(&c.inactive_background)?,
            hover: p(&c.hover)?,
            pressed: p(&c.pressed)?,
            foreground: p(&c.foreground)?,
        };
        let mut guard = STATE.lock().unwrap();
        let st = guard.as_mut().ok_or("caption not installed")?;
        st.colors = colors;
        invalidate_button(hwnd(st.top));
        Ok(())
    }

    /// Verification dump. button_rect is in client coordinates, physical px.
    pub fn debug() -> serde_json::Value {
        let guard = STATE.lock().unwrap();
        let Some(st) = guard.as_ref() else {
            return serde_json::json!({ "installed": false });
        };
        let top = hwnd(st.top);
        let mut rc = RECT::default();
        unsafe {
            let _ = GetClientRect(top, &mut rc);
        }
        let b = button_rect(top);
        let zoomed = unsafe { IsZoomed(top).as_bool() };
        serde_json::json!({
            "installed": true,
            "dpi": unsafe { GetDpiForWindow(top) },
            "scale": scale(top),
            "clientWidth": rc.right,
            "clientHeight": rc.bottom,
            "buttonRect": [b.left, b.top, b.right, b.bottom],
            "hover": st.hover,
            "pressed": st.pressed,
            "active": st.active,
            "zoomed": zoomed,
            "webviewFound": st.webview != 0,
            "regionApplied": st.region_applied,
            "glyph": format!("U+{:04X}", if zoomed { GLYPH_RESTORE } else { GLYPH_MAXIMIZE }),
            "glyphFont": "Segoe Fluent Icons",
        })
    }
}

#[cfg(windows)]
pub use imp::{debug, install, set_colors, CaptionColors};

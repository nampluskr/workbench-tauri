// Phase 2 layout skeleton (SPEC R-4, R-9). Areas follow 01-zed L-11 ~ L-16:
//   window (row): left sidebar (full height, L-12) | Workspace (L-11)
//   Workspace (column): title bar -> body -> status bar (L-13)
//   body (row): left dock -> center PaneGroup (L-14, L-15)
// No right sidebar, no right/bottom dock (L-11, L-14). Dimensions other than
// the title bar (A-32.1, A-32.2) are not judged in v0.1 (SPEC R-9, Q3 A); the
// values used here are the 01-zed defaults so later phases can keep them.
import { onCleanup, onMount } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import PocApp from "../poc/PocApp";
import { injectStyles, rem } from "./styles";
import { varRef } from "../theme/tokens";

/** L-39 / L-83 glyphs (Segoe Fluent Icons). */
const GLYPH_MINIMIZE = "";
const GLYPH_CLOSE = "";

injectStyles(`
.zl-root { display: flex; flex-direction: row; width: 100vw; height: 100vh; overflow: hidden;
  background: ${varRef("background")}; color: ${varRef("text")};
  font-family: "Segoe UI", sans-serif; font-size: 1rem; }
.zl-sidebar { display: flex; flex-direction: column; flex: 0 0 auto; width: ${rem(300)};
  background: ${varRef("panel.background")}; border-right: 1px solid ${varRef("border")};
  box-sizing: border-box; }
.zl-sidebar-header { flex: 0 0 auto; height: ${rem(32)}; }
.zl-sidebar-list { flex: 1 1 0; min-height: 0; border-top: 1px solid ${varRef("border")}; }
.zl-sidebar-footer { flex: 0 0 auto; height: ${rem(30)}; border-top: 1px solid ${varRef("border")};
  box-sizing: border-box; }
.zl-workspace { display: flex; flex-direction: column; flex: 1 1 0; min-width: 0; }
.zl-titlebar { display: flex; flex: 0 0 auto; align-items: stretch; height: ${rem(32)};
  padding-left: ${rem(8)}; box-sizing: border-box; user-select: none;
  background: ${varRef("title_bar.background")}; color: ${varRef("text")}; }
:root[data-window-active="false"] .zl-titlebar { background: ${varRef("title_bar.inactive_background")}; }
.zl-titlebar-drag { flex: 1 1 0; }
.zl-winbtn { flex: 0 0 auto; width: ${rem(36)}; height: ${rem(32)}; padding: 0; border: 0; margin: 0;
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: ${varRef("text")};
  font-family: "Segoe Fluent Icons"; font-size: ${rem(10)}; line-height: 1; }
.zl-winbtn:hover { background: ${varRef("ghost_element.hover")}; }
.zl-winbtn:active { background: ${varRef("ghost_element.active")}; }
.zl-winbtn-close:hover { background: #E81120; color: #ffffff; }
.zl-winbtn-close:active { background: rgba(232, 17, 32, 0.8); color: rgba(255, 255, 255, 0.8); }
.zl-winbtn-native { pointer-events: none; }
.zl-body { display: flex; flex-direction: row; flex: 1 1 0; min-height: 0;
  border-top: 1px solid ${varRef("border")}; }
.zl-dock { flex: 0 0 auto; width: ${rem(240)}; background: ${varRef("panel.background")};
  border-right: 1px solid ${varRef("border")}; box-sizing: border-box; }
.zl-center { flex: 1 1 0; min-width: 0; min-height: 0; display: flex; }
.zl-statusbar { flex: 0 0 auto; height: ${rem(30)}; background: ${varRef("status_bar.background")};
  border-top: 1px solid ${varRef("border")}; box-sizing: border-box; }
`);

function WindowButtons() {
  const win = getCurrentWindow();
  return (
    <>
      <button class="zl-winbtn" data-zl-winbtn="minimize" title="Minimize" onClick={() => win.minimize()}>
        {GLYPH_MINIMIZE}
      </button>
      {/* Drawn natively in a hole of the WebView (src-tauri/src/caption.rs) so
          Windows can show the snap-layout flyout (SPEC R-3). */}
      <div class="zl-winbtn zl-winbtn-native" data-zl-winbtn="maximize" aria-hidden="true" />
      <button class="zl-winbtn zl-winbtn-close" data-zl-winbtn="close" title="Close" onClick={() => win.close()}>
        {GLYPH_CLOSE}
      </button>
    </>
  );
}

export default function Shell() {
  onMount(() => {
    const root = document.documentElement;
    const set = (v: boolean) => root.setAttribute("data-window-active", String(v));
    set(document.hasFocus());
    const on = () => set(true);
    const off = () => set(false);
    window.addEventListener("focus", on);
    window.addEventListener("blur", off);
    onCleanup(() => {
      window.removeEventListener("focus", on);
      window.removeEventListener("blur", off);
    });
  });
  return (
    <div class="zl-root" data-zl-area="window">
      <aside class="zl-sidebar" data-zl-area="sidebar">
        <div class="zl-sidebar-header" data-zl-area="sidebar-header" data-tauri-drag-region />
        <div class="zl-sidebar-list" data-zl-area="sidebar-list" />
        <div class="zl-sidebar-footer" data-zl-area="sidebar-footer" />
      </aside>
      <div class="zl-workspace" data-zl-area="workspace">
        <header class="zl-titlebar" data-zl-area="titlebar" data-tauri-drag-region>
          <div class="zl-titlebar-drag" data-tauri-drag-region />
          <WindowButtons />
        </header>
        <div class="zl-body" data-zl-area="body">
          <aside class="zl-dock" data-zl-area="dock-left" />
          <main class="zl-center" data-zl-area="center">
            <PocApp />
          </main>
        </div>
        <footer class="zl-statusbar" data-zl-area="statusbar" />
      </div>
    </div>
  );
}

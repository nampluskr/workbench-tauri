import { createSignal, Show } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import AppMenu, { UserMenuButton } from "./AppMenu.tsx";
import "./title-bar.css";

// L-83 / L-312: window button glyph code points.
const GLYPH_MINIMIZE = "";
const GLYPH_MAXIMIZE = "";
const GLYPH_RESTORE = "";
const GLYPH_CLOSE = "";

const appWindow = getCurrentWindow();
const [maximized, setMaximized] = createSignal(false);
const syncMaximized = () => void appWindow.isMaximized().then(setMaximized);
// The title bar lives as long as the window, so the listener is never removed.
void appWindow.onResized(syncMaximized);
syncMaximized();
// Inactive title bar color while the window has lost focus (T-40.15).
const [focused, setFocused] = createSignal(document.hasFocus());
window.addEventListener("focus", () => setFocused(true));
window.addEventListener("blur", () => setFocused(false));

export default function TitleBar(props: { settings?: boolean } = {}) {
  return (
    // L-81: the whole bar is the drag region (double-click toggles maximize).
    <header class="title-bar" classList={{ inactive: !focused() }} data-tauri-drag-region>
      <div class="title-left">
        <Show when={!props.settings}>
          <AppMenu />
        </Show>
      </div>
      <Show when={!props.settings}><UserMenuButton /></Show>
      <button class="window-button" aria-label="Minimize" onClick={() => void appWindow.minimize()}>
        {GLYPH_MINIMIZE}
      </button>
      <button
        class="window-button"
        aria-label={maximized() ? "Restore" : "Maximize"}
        onClick={() => void appWindow.toggleMaximize()}
      >
        {maximized() ? GLYPH_RESTORE : GLYPH_MAXIMIZE}
      </button>
      <button class="window-button close" aria-label="Close" onClick={() => void appWindow.close()}>
        {GLYPH_CLOSE}
      </button>
    </header>
  );
}

import { render } from "solid-js/web";
import { getCurrentWindow } from "@tauri-apps/api/window";
import App from "./App.tsx";
import { installKeyboard } from "./keymap/keyboard.ts";
import { loadUserKeymap, watchUserKeymap } from "./keymap/load.ts";
import { loadHome } from "./shell/home.ts";
import { installTooltips } from "./shell/tooltip.ts";
import { guardClose, loadWorkspace } from "./workspace/store.ts";
import { applyTheme } from "./theme/apply.ts";
import { applyMetrics } from "./spec/metrics.ts";
import "./app.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root element not found");
}

// The window starts hidden (tauri.conf.json "visible": false): the WebView would otherwise show
// its default white page until the theme is applied. Show it even if startup fails.
try {
  applyMetrics();
  await applyTheme();
  await loadUserKeymap();
  await loadWorkspace();
  await loadHome();
  installKeyboard();
  installTooltips();
  render(() => <App />, root);
  await watchUserKeymap();
  await guardClose();
} finally {
  await getCurrentWindow().show();
}

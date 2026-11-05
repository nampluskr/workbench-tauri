import { render } from "solid-js/web";
import { getCurrentWindow } from "@tauri-apps/api/window";
import App from "./App.tsx";
import { installKeyboard } from "./keymap/keyboard.ts";
import { loadUserKeymap, watchUserKeymap } from "./keymap/load.ts";
import { installTooltips } from "./shell/tooltip.ts";
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
  installKeyboard();
  installTooltips();
  render(() => <App />, root);
  await watchUserKeymap();
} finally {
  await getCurrentWindow().show();
}

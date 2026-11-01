import { render } from "solid-js/web";
import App from "./App";
import { installProbe } from "./poc/probe";
import { installKeyboard } from "./keymap/dispatch";
import { applyTheme } from "./theme/theme";
import { installThemeBridge } from "./theme/bootstrap";
import { UI_FONT_SIZE_PX } from "./shell/styles";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root element not found");
}

// CSSOM only (CSP has no 'unsafe-inline' for styles).
document.body.style.margin = "0";
// L-01: root rem = ui_font_size.
document.documentElement.style.fontSize = `${UI_FONT_SIZE_PX}px`;

installKeyboard();
installThemeBridge();
// Reference screen theme (A-30.1). Theme selection UI is Phase 7 (T-21).
applyTheme("Catppuccin Mocha");

// Dev entry point for verification (specs/v0.1/verify/phase1·phase2/HOWTO.md).
if (import.meta.env.DEV || new URLSearchParams(location.search).has("poc")) {
  installProbe();
}

render(() => <App />, root);

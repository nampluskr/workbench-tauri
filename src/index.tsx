import { render } from "solid-js/web";
import App from "./App.tsx";
import { installKeyboard } from "./keymap/keyboard.ts";
import { applyTheme } from "./theme/apply.ts";
import { applyMetrics } from "./spec/metrics.ts";
import "./app.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root element not found");
}

applyMetrics();
applyTheme();
installKeyboard();
render(() => <App />, root);

import { render } from "solid-js/web";
import App from "./App.tsx";
import { applyMetrics } from "./spec/metrics.ts";
import "./app.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root element not found");
}

applyMetrics();
render(() => <App />, root);

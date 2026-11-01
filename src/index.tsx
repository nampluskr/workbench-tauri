import { render } from "solid-js/web";
import App from "./App";
import { installProbe } from "./poc/probe";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root element not found");
}

// CSSOM only (CSP has no 'unsafe-inline' for styles).
document.body.style.margin = "0";

// Dev entry point for verification (specs/v0.1/verify/phase1/HOWTO.md).
if (import.meta.env.DEV || new URLSearchParams(location.search).has("poc")) {
  installProbe();
}

render(() => <App />, root);

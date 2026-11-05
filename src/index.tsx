import { render } from "solid-js/web";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root element not found");
}

render(() => null, root);

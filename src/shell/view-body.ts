import { convertFileSrc } from "@tauri-apps/api/core";
import type { ViewKind } from "../editor/preview-kind.ts";

// core v0.8 I-8 / I-9: the body of a view-only tab. The file is loaded by the webview itself through the asset protocol
// (M-8), never read as text. A PDF goes in an iframe (WebView2's own viewer); CSP `object-src` blocks <embed>, `connect-src` fetch.
export function viewBody(path: string, kind: ViewKind): HTMLElement {
  const element = document.createElement("div");
  element.className = `view-body view-${kind}`;
  element.tabIndex = -1;
  const url = convertFileSrc(path);
  if (kind === "pdf") {
    const frame = element.appendChild(document.createElement("iframe"));
    frame.src = url;
    frame.title = path.slice(path.lastIndexOf("\\") + 1);
  } else {
    const image = element.appendChild(document.createElement("img"));
    image.src = url;
    image.alt = path.slice(path.lastIndexOf("\\") + 1);
  }
  return element;
}

// Editor instances live outside the Solid component tree (03-tauri 6절 대응:
// "편집기 인스턴스를 컴포넌트 트리 밖의 저장소에 두고 Pane 슬롯에는 DOM 만 옮겨
// 붙인다"). Components only move `view.dom` between slots; they never create or
// destroy views. SPEC R-1.
import { EditorView } from "@codemirror/view";
import { EditorState, type StateEffect } from "@codemirror/state";
import { zedEditorExtensions } from "./zedEditor";
import { htmlSyntax } from "../syntax/highlight";

/** Phase 3: tabs whose id starts with "h" are HTML documents with Tree-sitter highlighting. */
export function isHtmlTab(tabId: string): boolean {
  return tabId.startsWith("h");
}

/** Original HTML sample (written for this PoC) covering the highlight captures and injections. */
export const HTML_SAMPLE = [
  "<!DOCTYPE html>",
  '<html lang="en">',
  "  <head>",
  '    <meta charset="utf-8">',
  "    <title>Sample &amp; test</title>",
  "    <style>body { margin: 0; }</style>",
  "  </head>",
  "  <body>",
  "    <!-- a comment -->",
  '    <div class="box" style="color: red" onclick="go()" onClick="stay()">',
  "      <p>Hello <b>world</b> &copy; 2026</p>",
  '      <img src="a.png" alt=\'x\'/>',
  "    </div>",
  "    <script>let n = 1; console.log(n);</script>",
  "  </body>",
  "</html>",
  "",
].join("\n");

/** Large HTML document of about `bytes` characters (SPEC R-12 measurement). */
export function bigHtml(bytes: number): string {
  // Lines 8..13 of the sample: comment, div, p, img, /div, script (no <body>,
  // so the repeated block stays well-formed inside one <body>).
  const block = HTML_SAMPLE.split("\n").slice(8, 14).join("\n") + "\n";
  const parts: string[] = ["<!DOCTYPE html>\n<html>\n<body>\n"];
  let n = parts[0].length;
  let i = 0;
  while (n < bytes) {
    const b = block.replace("Hello", `Hello ${i++}`);
    parts.push(b);
    n += b.length;
  }
  parts.push("</body>\n</html>\n");
  return parts.join("");
}

const pendingDocs = new Map<string, string>();

/** Provide the document for a tab before it is first opened. */
export function setInitialDoc(tabId: string, doc: string): void {
  pendingDocs.set(tabId, doc);
}

const views = new Map<string, EditorView>();
const scrollSnapshots = new Map<string, StateEffect<unknown>>();
const instanceIds = new WeakMap<EditorView, number>();
let createdCount = 0;
let docLineCount = 300;

/** Sample document: numbered lines, long enough to scroll. */
export function sampleDoc(lines: number, tabId: string): string {
  const out: string[] = [];
  for (let i = 1; i <= lines; i++) {
    out.push(`${tabId} line ${i}: the quick brown fox jumps over the lazy dog ${i * 7}`);
  }
  return out.join("\n");
}

export function setDefaultLineCount(lines: number): void {
  docLineCount = lines;
}

export function getView(tabId: string): EditorView {
  let view = views.get(tabId);
  if (view) return view;
  view = new EditorView({
    state: EditorState.create({
      doc: pendingDocs.get(tabId) ?? (isHtmlTab(tabId) ? HTML_SAMPLE : sampleDoc(docLineCount, tabId)),
      extensions: isHtmlTab(tabId) ? [zedEditorExtensions(), htmlSyntax()] : zedEditorExtensions(),
    }),
  });
  createdCount += 1;
  instanceIds.set(view, createdCount);
  view.dom.dataset.pocTab = tabId;
  view.dom.dataset.pocInstance = String(createdCount);
  const v = view;
  // Detaching a node loses its scroll offset, so keep the last known one and
  // restore it after the node is attached to another slot.
  v.scrollDOM.addEventListener(
    "scroll",
    () => {
      if (v.dom.isConnected) scrollSnapshots.set(tabId, v.scrollSnapshot());
    },
    { passive: true },
  );
  views.set(tabId, view);
  return view;
}

/** Move the editor DOM of `tabId` into `slot` and restore its scroll offset. */
export function attachView(tabId: string, slot: HTMLElement): void {
  const view = getView(tabId);
  if (view.dom.parentElement !== slot) slot.replaceChildren(view.dom);
  view.requestMeasure();
  const snapshot = scrollSnapshots.get(tabId);
  if (snapshot) view.dispatch({ effects: snapshot });
}

export function instanceId(view: EditorView): number | undefined {
  return instanceIds.get(view);
}

export function allViews(): EditorView[] {
  return [...views.values()];
}

export function getCreatedCount(): number {
  return createdCount;
}

export function existingView(tabId: string): EditorView | undefined {
  return views.get(tabId);
}

/** Replace the document of a tab (used by the R-2 gutter-width probe). */
export function replaceDoc(tabId: string, lines: number): void {
  const view = getView(tabId);
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: sampleDoc(lines, tabId) },
    selection: { anchor: 0 },
  });
}

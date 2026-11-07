import type { EditorState } from "@codemirror/state";
import { createSignal, type Accessor } from "solid-js";
import { markdownCrumbs } from "./breadcrumbs.ts";
import type { OutlineSymbol } from "../syntax/document.ts";

/**
 * I-12: the Markdown headings (`read`) or the outline symbols (`symbols`, other languages) that contain a view's cursor, for the path row. The accessor is handed out when the tab file is
 * made, before its editor exists, so whatever reads it early is told when the first read of the file makes the editor.
 * shortcut: the whole text is split on every cursor move or edit; keep the headings per document version if very long files make that slow.
 */
export function createHeadings(path: string): { read: Accessor<string[]>; symbols: Accessor<OutlineSymbol[]>; update: (state: EditorState, found?: OutlineSymbol[] | null) => void } {
  const [read, set] = createSignal<string[]>([]);
  const [symbols, setSymbols] = createSignal<OutlineSymbol[]>([]);
  const markdown = /\.(md|markdown)$/i.test(path);
  return {
    read, symbols,
    update: (state, found) => {
      if (markdown) set(markdownCrumbs(state.doc.toString().split("\n"), state.doc.lineAt(state.selection.main.head).number - 1));
      else if (found !== undefined) setSymbols((now) => found ?? now); // null: the tree is behind the text, keep the old row
    },
  };
}

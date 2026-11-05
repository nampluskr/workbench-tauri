import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { syntaxHighlighting } from "../syntax/highlight.ts";
import { editorExtensions } from "./extensions.ts";

// D-1 / R-26: only these files get the v0.1 grammars; every other extension stays plain.
const HIGHLIGHTED = new Set(["html", "toml"]);

/** Bytes of a file as text: UTF-8, broken bytes become U+FFFD (D-17). */
export const decodeText = (bytes: ArrayBuffer): string => new TextDecoder("utf-8", { fatal: false }).decode(bytes);

/** A read-only CM6 view of `text`, highlighted when the extension of `path` has a grammar (R-26, D-10). */
export function createFileView(text: string, path: string): EditorView {
  const extension = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return new EditorView({
    state: EditorState.create({
      doc: text,
      extensions: [...editorExtensions, EditorState.readOnly.of(true), ...(HIGHLIGHTED.has(extension) ? [syntaxHighlighting(extension)] : [])],
    }),
  });
}

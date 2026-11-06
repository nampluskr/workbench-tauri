import { Compartment, EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { syntaxHighlighting } from "../syntax/highlight.ts";
import { editorExtensions } from "./extensions.ts";

// D-1 / R-26: only these files get the v0.1 grammars; every other extension stays plain.
const HIGHLIGHTED = new Set(["html", "toml"]);

export type ViewHooks = { changed: () => void; edited: () => void };

const readOnly = new Compartment();

/**
 * A CM6 view of `text` (R-2, D-3), highlighted when the extension of `path` has a grammar. `changed` runs on every
 * document change, `edited` only on the person's own edits (I-063: they promote a preview tab).
 */
export function createFileView(text: string, path: string, editable: boolean, hooks: ViewHooks): EditorView {
  const extension = path.slice(path.lastIndexOf(".") + 1).toLowerCase();
  return new EditorView({
    state: EditorState.create({
      doc: text,
      extensions: [
        ...editorExtensions,
        readOnly.of(EditorState.readOnly.of(!editable)),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          hooks.changed();
          if (update.transactions.some((tr) => tr.docChanged && tr.annotation(Transaction.userEvent) !== undefined)) hooks.edited();
        }),
        ...(HIGHLIGHTED.has(extension) ? [syntaxHighlighting(extension)] : []),
      ],
    }),
  });
}

/** An unreadable file became readable: let the person edit it. */
export const setEditable = (view: EditorView, editable: boolean) => view.dispatch({ effects: readOnly.reconfigure(EditorState.readOnly.of(!editable)) });

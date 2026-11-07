import { Annotation, Compartment, EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { parsed, syntaxHighlighting } from "../syntax/highlight.ts";
import { languages } from "../syntax/assets.ts";
import { fileLanguage } from "../syntax/catalog.ts";
import { isFarJump } from "../workspace/nav-history.ts";
import { editorExtensions } from "./extensions.ts";

/** `peers`: the other views of the same file (D-8: one file in two Panes); `keeper`: the one with the file's undo history. */
export type ViewHooks = {
  changed: () => void;
  edited: () => void;
  peers: () => EditorView[];
  keeper: () => EditorView | null;
  cursor: (line: number, state: EditorState) => void;
  /** I-10: the cursor moved far (nav-history.ts isFarJump); `line` / `column` (1-based) are where it was. */
  jumped: (line: number, column: number) => void;
  /** I-12: the cursor moved, the text changed or a parse finished: the path row's symbols may differ. */
  crumbs: (view: EditorView) => void;
};

// A change that came from a peer view: it is not passed on again and it is not this view's own edit (no preview
// promotion). Only the keeper records it, with the peer's user event so its undo steps group the same way.
const synced = Annotation.define<boolean>();

// A selection change that is Go Back / Go Forward itself: it is not a new place for the history.
export const navigated = Annotation.define<boolean>();

const readOnly = new Compartment();

/** "md" for "C:\w\a.MD"; "" when the file name has no extension. */
export function extensionOf(path: string): string {
  const name = path.slice(path.lastIndexOf("\\") + 1);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/**
 * A CM6 view of `text` (R-2, D-3), highlighted when the extension of `path` has a grammar. `changed` runs on every
 * document change, `edited` only on the person's own edits (I-063: they promote a preview tab).
 */
export function createFileView(text: string, path: string, editable: boolean, hooks: ViewHooks): EditorView {
  const extension = extensionOf(path);
  const language = fileLanguage(languages, path);
  return new EditorView({
    dispatchTransactions(trs, view) {
      view.update(trs);
      for (const tr of trs) {
        if (!tr.docChanged || tr.annotation(synced)) continue;
        const keeper = hooks.keeper();
        const event = tr.annotation(Transaction.userEvent);
        for (const peer of hooks.peers()) {
          const annotations = [synced.of(true), Transaction.addToHistory.of(peer === keeper && tr.annotation(Transaction.addToHistory) !== false)];
          peer.dispatch({ changes: tr.changes, annotations: event === undefined ? annotations : [...annotations, Transaction.userEvent.of(event)] });
        }
      }
    },
    state: EditorState.create({
      doc: text,
      extensions: [
        ...editorExtensions(extension),
        // Key context (v0.2 D-3): Editor, plus `extension == …` for bindings such as the Markdown preview keys (I-044).
        EditorView.editorAttributes.of({ "data-keymap-context": extension ? `Editor extension=${extension}` : "Editor" }),
        readOnly.of(EditorState.readOnly.of(!editable)),
        EditorView.updateListener.of((update) => {
          // I-083: the main cursor's line (0-based) for a preview of this file.
          if (update.selectionSet || update.docChanged) hooks.cursor(update.state.doc.lineAt(update.state.selection.main.head).number - 1, update.state);
          if (update.selectionSet && !update.transactions.some((tr) => tr.annotation(synced) || tr.annotation(navigated))) {
            const before = update.startState.selection.main.head;
            const from = update.startState.doc.lineAt(before);
            if (isFarJump(from.number, update.state.doc.lineAt(update.state.selection.main.head).number)) hooks.jumped(from.number, before - from.from + 1);
          }
          if (update.selectionSet || update.docChanged || update.transactions.some((tr) => tr.effects.some((effect) => effect.is(parsed)))) hooks.crumbs(update.view);
          if (!update.docChanged) return;
          hooks.changed();
          if (update.transactions.some((tr) => tr.docChanged && !tr.annotation(synced) && tr.annotation(Transaction.userEvent) !== undefined)) hooks.edited();
        }),
        ...(language ? [syntaxHighlighting(language)] : []),
      ],
    }),
  });
}

/** An unreadable file became readable: let the person edit it. */
export const setEditable = (view: EditorView, editable: boolean) => view.dispatch({ effects: readOnly.reconfigure(EditorState.readOnly.of(!editable)) });

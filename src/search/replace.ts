import { Transaction, type EditorState, type Text, type TransactionSpec } from "@codemirror/state";

export type ReplacementEdit = { from: number; to: number; insert: string };

/** Apply through the existing editor dispatch so peers, undo, preview promotion and Doc dirty state follow. */
export function applyReplacement(view: { state: EditorState; dispatch: (spec: TransactionSpec) => void }, expected: Text, edit: ReplacementEdit): boolean {
  if (view.state.readOnly || !view.state.doc.eq(expected) || !Number.isInteger(edit.from) || !Number.isInteger(edit.to) || edit.from < 0 || edit.to < edit.from || edit.to > expected.length) return false;
  view.dispatch({ changes: edit, annotations: Transaction.userEvent.of("input.replace") });
  return true;
}

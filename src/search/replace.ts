import { Transaction, type EditorState, type Text, type TransactionSpec } from "@codemirror/state";

export type ReplacementEdit = { from: number; to: number; insert: string };

/** Apply through the existing editor dispatch so peers, undo, preview promotion and Doc dirty state follow. One dispatch = one undo step. */
export function applyReplacement(view: { state: EditorState; dispatch: (spec: TransactionSpec) => void }, expected: Text, edits: ReplacementEdit[]): boolean {
  let end = 0;
  const valid = edits.length > 0 && edits.every((edit) => {
    const ok = Number.isInteger(edit.from) && Number.isInteger(edit.to) && edit.from >= end && edit.to >= edit.from && edit.to <= expected.length;
    end = edit.to;
    return ok;
  });
  if (view.state.readOnly || !view.state.doc.eq(expected) || !valid) return false;
  view.dispatch({ changes: edits, annotations: Transaction.userEvent.of("input.replace") });
  return true;
}

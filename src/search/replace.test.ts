import test from "node:test";
import assert from "node:assert/strict";
import { EditorState, Transaction, type TransactionSpec } from "@codemirror/state";
import { Doc } from "../workspace/doc.ts";
import { applyReplacement } from "./replace.ts";

test("K-29: Replace Next edits the existing Doc, marks it dirty and never saves the disk", async () => {
  const disk = new TextEncoder().encode("가😀 old old") as Uint8Array<ArrayBuffer>;
  let state = EditorState.create();
  let saves = 0;
  let userEvent: string | undefined;
  const doc = new Doc("C:\\root\\a.txt", { text: () => state.doc, set: (text) => { state = EditorState.create({ doc: text }); } }, {
    read: async () => disk,
    save: async () => { saves++; return disk; },
  }, () => {});
  await doc.read();
  const expected = state.doc;
  const view = { get state() { return state; }, dispatch(spec: TransactionSpec) {
    const update = state.update(spec);
    userEvent = update.annotation(Transaction.userEvent);
    state = update.state;
    doc.refresh();
  } };
  assert.ok(applyReplacement(view, expected, { from: 4, to: 7, insert: "new" }));
  assert.equal(state.doc.toString(), "가😀 new old");
  assert.equal(doc.dirty, true);
  assert.equal(userEvent, "input.replace");
  assert.equal(saves, 0);
  assert.equal(new TextDecoder().decode(disk), "가😀 old old");
  assert.equal(applyReplacement(view, expected, { from: 4, to: 7, insert: "lost" }), false, "changed editor must reject a stale prepared edit");
  assert.equal(applyReplacement(view, state.doc, { from: -1, to: 99, insert: "lost" }), false);
  assert.equal(state.doc.toString(), "가😀 new old");
});

import test from "node:test";
import assert from "node:assert/strict";
import { EditorSelection, EditorState } from "@codemirror/state";
import { backtab, tab } from "./indent.ts";

const run = (doc: string, ranges: [number, number][], fn: typeof tab) => {
  const state = EditorState.create({
    doc,
    selection: EditorSelection.create(ranges.map(([a, h]) => EditorSelection.range(a, h))),
    extensions: [EditorState.tabSize.of(4), EditorState.allowMultipleSelections.of(true)],
  });
  const next = state.update(fn(state)).state;
  return { text: next.doc.toString(), heads: next.selection.ranges.map((r) => r.head) };
};

test("I-059 / E-055: Tab at cursors inserts spaces to the next tab stop; with a selection it indents every covered line", () => {
  assert.deepEqual(run("ab", [[2, 2]], tab), { text: "ab  ", heads: [4] });
  assert.deepEqual(run("abcd", [[4, 4]], tab), { text: "abcd    ", heads: [8] });
  assert.deepEqual(run("\tx", [[1, 1]], tab).text, "\t    x"); // a tab counts as 4 columns
  assert.equal(run("a\nb\nc", [[0, 3]], tab).text, "    a\n    b\nc"); // ends at the start of "c": that line is not taken
  assert.equal(run("a\nb", [[0, 0], [2, 3]], tab).text, "    a\n    b"); // a cursor among selections takes its line
});

test("I-059: Shift+Tab removes a leading tab, or the spaces back to the previous tab stop, on each covered line", () => {
  const doc = "      a\n\tb\nc\n  d";
  assert.equal(run(doc, [[0, doc.length]], backtab).text, "    a\nb\nc\nd");
  assert.equal(run("    a", [[5, 5]], backtab).text, "a"); // a cursor outdents its line too
});

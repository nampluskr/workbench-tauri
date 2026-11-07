import test from "node:test";
import assert from "node:assert/strict";
import { EditorSelection, EditorState } from "@codemirror/state";
import { cursorPosition, locationOffset } from "./position.ts";

const state = (doc: string, ranges: [number, number][], mainIndex = ranges.length - 1) => EditorState.create({
  doc,
  selection: EditorSelection.create(ranges.map(([anchor, head]) => EditorSelection.range(anchor, head)), mainIndex),
  extensions: EditorState.allowMultipleSelections.of(true),
});

test("I-5: head position and selected characters count Unicode scalars, including Korean and emoji", () => {
  assert.equal(cursorPosition(state("", [[0, 0]])), "1:1");
  assert.equal(cursorPosition(state("first\n가😀e\u0301z", [[6, 11]])), "2:5 (4 characters)");
  assert.equal(cursorPosition(state("first\n가😀e\u0301z", [[11, 6]])), "2:1 (4 characters)");
  assert.equal(cursorPosition(state("x", [[0, 1]])), "1:2 (1 character)");
});

test("I-5: selections, lines and characters follow Zed's order and exclude an unselected final line", () => {
  assert.equal(cursorPosition(state("ab\ncd\nef", [[0, 3]])), "2:1 (3 characters)");
  assert.equal(cursorPosition(state("ab\ncd\nef", [[0, 4]])), "2:2 (2 lines, 4 characters)");
  assert.equal(cursorPosition(state("ab\ncd\nef", [[0, 1], [3, 6]])), "3:1 (2 selections, 2 lines, 4 characters)");
  assert.equal(cursorPosition(state("ab\ncd\nef", [[0, 0], [3, 3]], 0)), "1:1 (2 selections)");
});

test("K-26: search locations use UTF-16 offsets and clamp stale results to the current document", () => {
  const doc = EditorState.create({ doc: "first\n가😀 word" }).doc;
  assert.equal(locationOffset(doc, { line: 2, column: 5 }), 10);
  assert.equal(locationOffset(doc, { line: 99, column: 99 }), doc.length);
  assert.equal(locationOffset(doc, { line: 0, column: 0 }), 0);
});

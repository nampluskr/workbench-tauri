import test from "node:test";
import assert from "node:assert/strict";
import { emptySearch, highlightParts, nextMatch, receiveSearch, searchPosition, type SearchFile } from "./model.ts";

test("K-26: streamed files, limits and failures preserve results and finish without replacing earlier files", () => {
  const file: SearchFile = { path: "C:\\root\\file.py", matches: [{ line: 3, column: 5, endLine: 3, endColumn: 9 }], lines: [] };
  let state = receiveSearch({ ...emptySearch(), busy: true }, { kind: "file", file });
  state = receiveSearch(state, { kind: "limit" });
  assert.deepEqual(state, { files: [file], busy: true, error: "", limited: true });
  state = receiveSearch(state, { kind: "done" });
  assert.equal(state.busy, false);
  state = receiveSearch(state, { kind: "error", message: "Invalid glob" });
  assert.deepEqual(state.files, [file]);
  assert.equal(state.error, "Invalid glob");
  assert.equal(state.busy, false);
});

test("K-26: highlights preserve Unicode and overlapping spans; result navigation wraps", () => {
  const parts = highlightParts("가😀 word WORD", [[9, 13], [4, 8], [6, 8]]);
  assert.equal(parts.map((part) => part.text).join(""), "가😀 word WORD");
  assert.deepEqual(parts.filter((part) => part.match).map((part) => part.text), ["word", "WORD"]);
  assert.deepEqual(highlightParts("plain", []), [{ text: "plain", match: false }]);
  assert.equal(nextMatch(0, 3, -1), 2);
  assert.equal(nextMatch(2, 3, 1), 0);
  assert.equal(nextMatch(0, 0, 1), 0);
  const match = { line: 1, column: 1, endLine: 2, endColumn: 2 };
  const file: SearchFile = { path: "a", matches: [match], lines: [{ number: 1, text: "가😀", spans: [] }, { number: 2, text: "x", spans: [] }] };
  assert.equal(searchPosition(file, match), "2:2 (2 lines, 4 characters)");
});

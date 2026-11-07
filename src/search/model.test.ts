import test from "node:test";
import assert from "node:assert/strict";
import { activeSpan, emptySearch, excerptsOf, highlightParts, relativeDir, nextMatch, receiveSearch, searchPosition, type SearchFile } from "./model.ts";

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
  assert.deepEqual(highlightParts("plain", []), [{ text: "plain", match: false, active: false }]);
  assert.equal(nextMatch(0, 3, -1), 2);
  assert.equal(nextMatch(2, 3, 1), 0);
  assert.equal(nextMatch(0, 0, 1), 0);
  const match = { line: 1, column: 1, endLine: 2, endColumn: 2 };
  const file: SearchFile = { path: "a", matches: [match], lines: [{ number: 1, text: "가😀", spans: [] }, { number: 2, text: "x", spans: [] }] };
  assert.equal(searchPosition(file, match), "2:2 (2 lines, 4 characters)");
});

test("K-32: the selected match is the active span, excerpts split at gaps, headers show the relative folder", () => {
  assert.deepEqual(highlightParts("ab ab", [[0, 2], [3, 5]], [3, 5]).filter((part) => part.match).map((part) => part.active), [false, true]);
  const match = { line: 2, column: 3, endLine: 3, endColumn: 2 };
  assert.deepEqual(activeSpan(match, { number: 2, text: "abcd" }), [2, 4]);
  assert.deepEqual(activeSpan(match, { number: 3, text: "xyz" }), [0, 1]);
  assert.equal(activeSpan(match, { number: 4, text: "q" }), undefined);
  const row = (number: number) => ({ number, text: "", spans: [] as [number, number][] });
  assert.deepEqual(excerptsOf([row(1), row(2), row(7), row(8), row(9)]).map((lines) => lines.map((line) => line.number)), [[1, 2], [7, 8, 9]]);
  assert.equal(relativeDir("C:\\root\\specs\\v0.1\\INTENT.md", "C:\\root"), "specs\\v0.1\\");
  assert.equal(relativeDir("C:\\root\\AGENTS.md", "C:\\root"), "");
  assert.equal(relativeDir("C:\\root\\src\\a.ts", "C:\\root", "root"), "root\\src\\");
});

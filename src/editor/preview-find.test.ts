import assert from "node:assert/strict";
import test from "node:test";
import { SearchQuery } from "@codemirror/search";
import { repaint, textMatches } from "./preview-find.ts";
import { frameMessage, frameRequest } from "./html.ts";
import { wholeWordTest } from "./search.ts";
import { Keymap } from "../keymap/engine.ts";
import { EDITOR_BINDINGS } from "../keymap/builtin.ts";

const text = "Read the readme.\nmy_read 읽기 읽기\nREAD.md";
const count = (spec: ConstructorParameters<typeof SearchQuery>[0]) => textMatches(text, new SearchQuery({ literal: true, ...spec }))?.length ?? null;

test("core v0.8.1 I-9: preview find counts by the editor bar's rules: case, whole word, regexp, Hangul", () => {
  assert.equal(count({ search: "read" }), 4);
  assert.equal(count({ search: "read", caseSensitive: true }), 2);
  assert.equal(count({ search: "read", test: wholeWordTest }), 3); // "readme" is not a whole word; "_" separates words (I-20)
  assert.equal(count({ search: "re.d", regexp: true }), 4);
  assert.equal(count({ search: "re.d" }), 0);
  assert.equal(count({ search: "읽기" }), 2);
  assert.equal(count({ search: "" }), 0);
  assert.equal(count({ search: "(", regexp: true }), null); // invalid: the bar shows "Invalid regex"
  assert.deepEqual(textMatches(text, new SearchQuery({ search: "읽기", literal: true }))![1], { from: 28, to: 30 });
});

test("core v0.8.1 I-9: Ctrl+F, F3, Shift+F3 and Escape reach the find commands in a preview", () => {
  const keys = new Keymap();
  keys.addSections("default", EDITOR_BINDINGS);
  const preview = [new Set(["Workspace"]), new Set(["Pane"]), new Set(["MarkdownPreview"])];
  for (const [key, action] of [["ctrl-f", "editor::Find"], ["f3", "editor::FindNext"], ["shift-f3", "editor::FindPrevious"], ["escape", "editor::Cancel"]]) {
    assert.deepEqual(keys.dispatch([key], preview), { type: "match", action });
  }
  assert.deepEqual(keys.dispatch(["enter"], [...preview, new Set(["EditorSearch"])]), { type: "match", action: "editor::FindNext" });
});

test("core v0.8.1 I-9 (K-06-R1): a new search, a move and closing leave only this preview's current marks; current is 0 or 1", () => {
  const others = new Set<string>(["other preview"]), current = new Set<string>();
  let painted = repaint(others, current, [], ["apple1", "apple2", "Apple"], 2);
  painted = repaint(others, current, painted, ["python"], 0); // the query changed: the ranges are new objects
  assert.deepEqual([[...others], [...current]], [["other preview"], ["python"]]);
  painted = repaint(others, current, painted, ["a", "b"], 1); // F3
  painted = repaint(others, current, painted, ["a", "b"], 0);
  assert.deepEqual([[...others], [...current]], [["other preview", "b"], ["a"]]);
  repaint(others, current, painted, [], -1); // closed
  assert.deepEqual([[...others], [...current]], [["other preview"], []]);
});

// core v0.8.2 ORDER-07 #4: an HTML preview's find is the same bar and the same rules over the text its frame hands over.
test("core v0.8.2 I-25: a frame's text is searched by the preview find's rules; the marks go back in document order", () => {
  const frame = {};
  const request = frameRequest({ source: frame, data: { previewAct: { token: "tok", text } } }, frame, "tok");
  assert.ok(request && "text" in request);
  const marks = (spec: ConstructorParameters<typeof SearchQuery>[0]) => textMatches(request.text, new SearchQuery({ literal: true, ...spec }))?.flatMap(({ from, to }) => [from, to]) ?? null;
  assert.equal(marks({ search: "read" })!.length / 2, 4);
  assert.equal(marks({ search: "read", caseSensitive: true })!.length / 2, 2);
  assert.equal(marks({ search: "read", test: wholeWordTest })!.length / 2, 3);
  assert.equal(marks({ search: "re.d", regexp: true })!.length / 2, 4);
  assert.equal(marks({ search: "(", regexp: true }), null); // "Invalid regex": nothing to mark
  const all = marks({ search: "read" })!;
  assert.deepEqual(all, [...all].sort((a, b) => a - b)); // Next and Previous step through them as they stand in the page
  assert.deepEqual(all.slice(0, 4), [0, 4, 9, 13]);
  assert.deepEqual(frameMessage.find(all, 0, true), { previewFind: { marks: all, at: 0, scroll: true } }); // a new query: the first match, scrolled to
  assert.deepEqual(frameMessage.find(null, 1, true), { previewFind: { at: 1, scroll: true } }); // Next: the index alone
  assert.deepEqual(frameMessage.find([], -1, false), { previewFind: { marks: [], at: -1, scroll: false } }); // closed: the marks go
});

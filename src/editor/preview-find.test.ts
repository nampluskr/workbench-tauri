import assert from "node:assert/strict";
import test from "node:test";
import { SearchQuery } from "@codemirror/search";
import { textMatches } from "./preview-find.ts";
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

import test from "node:test";
import assert from "node:assert/strict";
import { EditorState } from "@codemirror/state";
import { createHeadings } from "./headings.ts";

test("K-41: the accessor handed out before the editor exists follows later cursor moves and edits", () => {
  const headings = createHeadings("D:\w\AGENTS.md");
  const early = headings.read; // what the path row captured when the tab was made
  assert.deepEqual(early(), []);
  const doc = "# AGENTS\n\n## 레포 규칙\n\ntext";
  headings.update(EditorState.create({ doc, selection: { anchor: 0 } }));
  assert.deepEqual(early(), ["# AGENTS"]); // opened: the cursor is on the first heading
  headings.update(EditorState.create({ doc, selection: { anchor: doc.length } }));
  assert.deepEqual(early(), ["# AGENTS", "## 레포 규칙"]);
});

test("K-41: only Markdown files have headings", () => {
  const headings = createHeadings("D:\w\Pane.tsx");
  headings.update(EditorState.create({ doc: "# not a heading in tsx", selection: { anchor: 0 } }));
  assert.deepEqual(headings.read(), []);
});

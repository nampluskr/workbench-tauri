import test from "node:test";
import assert from "node:assert/strict";
import { createSignal } from "solid-js";
import { statusItems } from "./status.ts";
import type { Tab } from "../workspace/context.ts";

test("I-5: active editor and preview status follows each tab; tools, loading editors and no tab hide both items", () => {
  const [position, setPosition] = createSignal("1:1");
  const tab = { path: "C:\\project\\a.py", file: { position } } as Tab;
  assert.deepEqual(statusItems(tab), { position: "1:1", filetype: "Python" });
  setPosition("5:28 (5 characters)");
  assert.deepEqual(statusItems(tab), { position: "5:28 (5 characters)", filetype: "Python" });
  assert.equal(statusItems(undefined), undefined);
  assert.equal(statusItems({ ...tab, tool: true }), undefined);
  assert.equal(statusItems({ ...tab, file: { ...tab.file, position: undefined } }), undefined);
  const preview = { ...tab, markdown: true, file: { ...tab.file, position: () => "8:1" } };
  assert.deepEqual(statusItems(preview), { position: "8:1", filetype: "Markdown" });
  assert.deepEqual(statusItems(tab), { position: "5:28 (5 characters)", filetype: "Python" });
});

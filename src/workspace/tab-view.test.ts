import test from "node:test";
import assert from "node:assert/strict";
import { searchPath, searchTitle, tabTooltip, tabWheelDelta } from "./tab-view.ts";

test("I-11: tab tooltips are the absolute path, the search name or the tool name", () => {
  assert.deepEqual(tabTooltip({ path: "D:\projects\workbench-tauri\AGENTS.md" }), { title: "D:\projects\workbench-tauri\AGENTS.md" });
  assert.deepEqual(tabTooltip({ path: "C:\a.txt", readOnly: true }), { title: "C:\a.txt", meta: "Read-Only Tab" });
  assert.deepEqual(tabTooltip({ path: searchPath(1), tool: true, title: "ponytail" }), { title: "Search" });
  assert.deepEqual(tabTooltip({ path: searchPath(2), tool: true, title: "" }), { title: "Search" });
  assert.equal(tabTooltip({ path: "Extensions", tool: true }), null);
});

test("core I-6: each Search tab has its own path and is titled with its searched query, \"Search\" before a search", () => {
  assert.notEqual(searchPath(1), searchPath(2));
  assert.equal(searchTitle(""), "Search");
  assert.equal(searchTitle("ponytail"), "ponytail");
});

test("I-16: one Chromium wheel notch (deltaY 100) scrolls the tab row about 78px, as Zed's three lines do", () => {
  const lineHeight = 16 * 1.618;
  assert.ok(Math.abs(tabWheelDelta(100, 0, lineHeight) - 77.66) < 0.1);
  assert.equal(tabWheelDelta(3, 1, lineHeight), 3 * lineHeight); // already in lines
  assert.equal(tabWheelDelta(-100, 0, lineHeight), -tabWheelDelta(100, 0, lineHeight));
});

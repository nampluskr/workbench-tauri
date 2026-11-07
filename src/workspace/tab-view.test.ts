import test from "node:test";
import assert from "node:assert/strict";
import { tabTooltip, tabWheelDelta } from "./tab-view.ts";

test("I-11: tab tooltips are the absolute path, the search query or the tool name", () => {
  assert.deepEqual(tabTooltip({ path: "D:\projects\workbench-tauri\AGENTS.md" }), { title: "D:\projects\workbench-tauri\AGENTS.md" });
  assert.deepEqual(tabTooltip({ path: "C:\a.txt", readOnly: true }), { title: "C:\a.txt", meta: "Read-Only Tab" });
  assert.deepEqual(tabTooltip({ path: "Project Search", tool: true, title: "ponytail" }), { title: "ponytail" });
  assert.deepEqual(tabTooltip({ path: "Project Search", tool: true, title: "" }), { title: "Project Search" });
  assert.deepEqual(tabTooltip({ path: "Project Diagnostics", tool: true, title: "No problems" }), { title: "Project Diagnostics" });
  assert.equal(tabTooltip({ path: "Extensions", tool: true }), null);
});

test("I-16: one Chromium wheel notch (deltaY 100) scrolls the tab row about 78px, as Zed's three lines do", () => {
  const lineHeight = 16 * 1.618;
  assert.ok(Math.abs(tabWheelDelta(100, 0, lineHeight) - 77.66) < 0.1);
  assert.equal(tabWheelDelta(3, 1, lineHeight), 3 * lineHeight); // already in lines
  assert.equal(tabWheelDelta(-100, 0, lineHeight), -tabWheelDelta(100, 0, lineHeight));
});

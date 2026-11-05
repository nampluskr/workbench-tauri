import test from "node:test";
import assert from "node:assert/strict";
import { moveTab, type Pane } from "./panes.ts";

test("moveTab moves the tab, activates it, and picks a neighbor in the source", () => {
  const panes: Pane[] = [
    { tabs: ["a", "b", "c"], active: "b" },
    { tabs: [], active: null },
  ];
  assert.deepEqual(moveTab(panes, "b", 0, 1), [
    { tabs: ["a", "c"], active: "c" },
    { tabs: ["b"], active: "b" },
  ]);
  assert.equal(moveTab(panes, "b", 0, 0), panes);
  assert.equal(moveTab(panes, "x", 0, 1), panes);
});

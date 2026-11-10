import test from "node:test";
import assert from "node:assert/strict";
import { stepTab } from "./tabs.ts";

test("ORDER-11 U-2: B goes back to A, wraps back to C, then forward to A", () => {
  const tabs = ["A", "B", "C"];
  let active: number | null = 1;
  for (const [direction, expected] of [[-1, "A"], [-1, "C"], [1, "A"]] as const) {
    active = stepTab(tabs.length, active, direction);
    assert.equal(tabs[active!], expected);
  }
  assert.equal(stepTab(0, null, -1), null);
  assert.equal(stepTab(1, 0, 1), 0);
});

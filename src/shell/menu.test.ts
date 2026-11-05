import test from "node:test";
import assert from "node:assert/strict";
import { cycle, first, last, placeMenu, step, type MenuEntry } from "./menu.ts";

const item = (label: string, disabled = false): MenuEntry => ({ label, action: label, disabled });
// 0 A, 1 ---, 2 B (disabled), 3 C, 4 ---, 5 D (disabled)
const entries: MenuEntry[] = [item("A"), "separator", item("B", true), item("C"), "separator", item("D", true)];

test("I-515, I-518: stepping skips separators and disabled items and wraps at both ends", () => {
  assert.equal(step(entries, null, 1), 0); // first press goes to the first selectable item
  assert.equal(step(entries, null, -1), 3); // from nothing, backward gives the last selectable one
  assert.equal(step(entries, 0, 1), 3);
  assert.equal(step(entries, 3, 1), 0); // wraps past the disabled tail
  assert.equal(step(entries, 0, -1), 3);
  assert.equal(first(entries), 0);
  assert.equal(last(entries), 3);
  assert.equal(step([item("X", true), "separator"], null, 1), null); // nothing can be selected
  assert.equal(step([item("Only")], 0, 1), 0);
});

test("I-303: Left/Right along the menu bar wraps", () => {
  assert.equal(cycle(4, 3, 1), 0);
  assert.equal(cycle(4, 0, -1), 3);
  assert.equal(cycle(4, 1, 1), 2);
});

test("I-314, I-501: the popup stays inside the window with the 8px margin on every side", () => {
  const view = { w: 1000, h: 600 };
  const size = { w: 200, h: 100 };
  assert.deepEqual(placeMenu({ x: 300, y: 32 }, size, view), { x: 300, y: 32 });
  assert.deepEqual(placeMenu({ x: 3, y: 32 }, size, view), { x: 8, y: 32 }); // too close to the left edge
  assert.deepEqual(placeMenu({ x: 900, y: 580 }, size, view), { x: 792, y: 492 }); // pushed in from right and bottom
});

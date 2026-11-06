import test from "node:test";
import assert from "node:assert/strict";
import { closeOnFocusOut, cycle, first, hoverMenuItem, last, placeMenu, placeSubmenu, step, type MenuEntry } from "./menu.ts";

const item = (label: string, disabled = false): MenuEntry => ({ label, action: label, disabled });
// 0 A, 1 ---, 2 B (disabled), 3 C, 4 ---, 5 D (disabled)
const entries: MenuEntry[] = [item("A"), "separator", item("B", true), item("C"), "separator", item("D", true)];

test("K-09-R3: hovering a disabled sibling closes Panel Layout without selecting or opening it", () => {
  const disabled = { label: "Extensions", disabled: true };
  const panel = { label: "Panel Layout", children: [disabled] };
  assert.deepEqual(hoverMenuItem(disabled, 4, 6), { closeChild: true, openChild: false, select: false });
  assert.deepEqual(hoverMenuItem(disabled, 4, null), { closeChild: false, openChild: false, select: false });
  assert.deepEqual(hoverMenuItem(disabled, 0, 6, true), { closeChild: false, openChild: false, select: false });
  assert.deepEqual(hoverMenuItem(panel, 6, 6), { closeChild: false, openChild: false, select: false });
  assert.deepEqual(hoverMenuItem(panel, 6, null), { closeChild: false, openChild: true, select: false });
  assert.deepEqual(hoverMenuItem({ label: "Enabled" }, 4, 6), { closeChild: true, openChild: false, select: true });
});

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

test("K-09: submenus flip to the left at the right window edge and remain inside vertically", () => {
  const size = { w: 200, h: 100 };
  const view = { w: 1000, h: 600 };
  assert.deepEqual(placeSubmenu({ left: 200, right: 400, top: 32 }, size, view), { x: 400, y: 32 });
  assert.deepEqual(placeSubmenu({ left: 790, right: 992, top: 580 }, size, view), { x: 590, y: 492 });
});

test("K-09-R1: submenu removal keeps the replacement menu open but outside focus closes it", async (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  const parent = {} as Element;
  const replacement = {} as Element;
  const outside = {} as Element;
  let windowFocused = true;
  const document = { activeElement: outside, hasFocus: () => windowFocused };
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "document", previous);
    else Reflect.deleteProperty(globalThis, "document");
  });
  const root = { contains: (node: Node | null) => node === parent || node === replacement };
  let closed = 0;
  const close = () => { closed++; };

  // View > Editor Layout is removed before Go receives focus.
  closeOnFocusOut(root, close);
  assert.equal(closed, 0);
  document.activeElement = replacement;
  await Promise.resolve();
  assert.equal(closed, 0);

  // User menu > Panel Layout is removed before its parent receives focus.
  document.activeElement = outside;
  closeOnFocusOut(root, close);
  document.activeElement = parent;
  await Promise.resolve();
  assert.equal(closed, 0);

  closeOnFocusOut(root, close);
  document.activeElement = outside;
  await Promise.resolve();
  assert.equal(closed, 1);

  document.activeElement = parent;
  closeOnFocusOut(root, close);
  windowFocused = false;
  await Promise.resolve();
  assert.equal(closed, 2);
});

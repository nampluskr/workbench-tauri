import test from "node:test";
import assert from "node:assert/strict";
import { fuzzyFilter, moveSelection, pickerKey } from "./picker.ts";

const THEMES = ["Ayu Dark", "Catppuccin Mocha", "One Dark", "One Light"];

test("fuzzy filter: empty query keeps the list, letters match in order, best match first", () => {
  assert.deepEqual(fuzzyFilter(THEMES, "  ").map((m) => m.item), THEMES);
  assert.deepEqual(fuzzyFilter(THEMES, "one d").map((m) => m.item), ["One Dark"]);
  assert.deepEqual(fuzzyFilter(THEMES, "OL").map((m) => [m.item, m.positions]), [["One Light", [0, 4]]]);
  assert.deepEqual(fuzzyFilter(THEMES, "xyz"), []);
  // Consecutive letters and word starts beat scattered ones; list order breaks ties.
  assert.deepEqual(fuzzyFilter(["Ayu Dark", "One Dark", "Darkroom"], "dark").map((m) => m.item), ["Darkroom", "Ayu Dark", "One Dark"]);
  assert.equal(fuzzyFilter(THEMES, "mocha")[0].item, "Catppuccin Mocha");
});

test("selection wraps at both ends (P-004)", () => {
  assert.equal(moveSelection(3, 2, 1), 0);
  assert.equal(moveSelection(3, 0, -1), 2);
  assert.equal(moveSelection(3, 1, 1), 2);
  assert.equal(moveSelection(0, 0, 1), 0);
});

test("picker keys follow the menu context; IME and other chords are left to the input", () => {
  const key = (k: string, mods: Partial<{ ctrlKey: boolean; shiftKey: boolean; altKey: boolean; isComposing: boolean }> = {}) =>
    pickerKey({ key: k, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, ...mods });
  assert.equal(key("ArrowUp"), "previous");
  assert.equal(key("p", { ctrlKey: true }), "previous");
  assert.equal(key("Tab", { shiftKey: true }), "previous");
  assert.equal(key("ArrowDown"), "next");
  assert.equal(key("n", { ctrlKey: true }), "next");
  assert.equal(key("Tab"), "next");
  assert.equal(key("Home"), "first");
  assert.equal(key("End"), "last");
  assert.equal(key("Enter"), "confirm");
  assert.equal(key("Enter", { isComposing: true }), undefined);
  assert.equal(key("c", { ctrlKey: true }), undefined);
  assert.equal(key("a"), undefined);
});

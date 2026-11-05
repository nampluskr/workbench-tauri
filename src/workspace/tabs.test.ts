import test from "node:test";
import assert from "node:assert/strict";
import { openTab, tabEdges, type TabInfo } from "./tabs.ts";

const tab = (path: string, preview: boolean): TabInfo => ({ path, preview });
const open = (tabs: TabInfo[], active: number | null, path: string, preview: boolean) => openTab(tabs, active, path, preview, 1, () => tab(path, preview));
const names = (tabs: TabInfo[]) => tabs.map((t) => `${t.path}${t.preview ? "*" : ""}`);

test("I-062: a new preview tab takes the place of the preview tab", () => {
  const first = open([], null, "a", true);
  assert.deepEqual(names(first.tabs), ["a*"]);
  const second = open(open(first.tabs, 0, "n", false).tabs, 1, "b", true); // a*, n -> b replaces a*
  assert.deepEqual(names(second.tabs), ["b*", "n"]);
  assert.equal(second.active, 0);
  assert.equal(second.replaced?.path, "a");
});

test("I-063, I-087: opening normally promotes an open preview tab; opening as preview never demotes", () => {
  const tabs = [tab("a", true), tab("n", false)];
  const promoted = open(tabs, 1, "a", false);
  assert.deepEqual(names(promoted.tabs), ["a", "n"]);
  assert.equal(promoted.created, false);
  assert.equal(promoted.active, 0);
  assert.deepEqual(names(open(promoted.tabs, 0, "n", true).tabs), ["a", "n"]);
});

test("a normal tab goes right after the active tab; a preview with none open is added the same way", () => {
  const tabs = [tab("a", false), tab("b", false), tab("c", false)];
  const added = open(tabs, 0, "x", false);
  assert.deepEqual(names(added.tabs), ["a", "x", "b", "c"]);
  assert.equal(added.active, 1);
  assert.deepEqual(names(open(tabs, 2, "y", true).tabs), ["a", "b", "c", "y*"]);
  assert.deepEqual(names(open(tabs, null, "z", false).tabs), ["a", "b", "c", "z"]);
});

test("L-63: sides with a line depend on position and on the active tab", () => {
  const edges = (i: number, n: number, active: number | null) => Object.values(tabEdges(i, n, active)).map(Number).join("");
  assert.equal(edges(0, 3, 0), "010"); // first, active: right line
  assert.equal(edges(0, 3, 1), "001"); // first, inactive: bottom line
  assert.equal(edges(1, 3, 1), "110"); // middle, active: both sides
  assert.equal(edges(1, 3, 2), "101"); // middle, before the active tab: left and bottom
  assert.equal(edges(1, 3, 0), "011"); // middle, after the active tab: right and bottom
  assert.equal(edges(2, 3, 2), "110"); // last, active
  assert.equal(edges(2, 3, 0), "011"); // last, inactive: right and bottom
});

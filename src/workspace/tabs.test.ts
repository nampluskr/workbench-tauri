import test from "node:test";
import assert from "node:assert/strict";
import { closeTargets, activeAfterClose, openTab, pinnedCount, stepTab, tabEdges, togglePin, type TabInfo } from "./tabs.ts";

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

test("I-072: closing the active tab goes to the most recent tab still open, else the left neighbour; others keep the active one", () => {
  const [a, b, c, d] = ["a", "b", "c", "d"];
  assert.equal(activeAfterClose([a, b, c, d], 2, 2, [a, d, c]), 2); // d, now at index 2
  assert.equal(activeAfterClose([a, b, c, d], 2, 2, [c]), 1); // no history: left neighbour b
  assert.equal(activeAfterClose([a, b, c], 0, 0, []), 0); // first tab: its right neighbour moves to 0
  assert.equal(activeAfterClose([a, b, c], 0, 2, [c]), 1); // an inactive tab before the active one
  assert.equal(activeAfterClose([a, b, c], 2, 0, [a]), 0);
  assert.equal(activeAfterClose([a], 0, 0, [a]), null);
});

test("I-062: a modified preview tab is not replaced; the new preview goes after the active tab, and is the one replaced next", () => {
  const keep = (t: TabInfo) => t.path === "dirty";
  const openKeep = (tabs: TabInfo[], active: number | null, path: string) => openTab(tabs, active, path, true, 1, () => tab(path, true), keep);
  const first = openKeep([tab("a", false), tab("dirty", true)], 1, "b");
  assert.deepEqual([names(first.tabs), first.active, first.replaced], [["a", "dirty*", "b*"], 2, null]);
  const second = openKeep(first.tabs, 2, "c");
  assert.deepEqual([names(second.tabs), second.active, second.replaced?.path], [["a", "dirty*", "c*"], 2, "b"]);
});

test("I-065 / I-067: pinning moves to the end of the pin area and ends preview; unpinning moves just after it; new tabs stay out of it", () => {
  const pin = (path: string) => ({ path, preview: false, pinned: true });
  const tabs = [pin("p1"), pin("p2"), tab("a", false), tab("b", true)];
  assert.equal(pinnedCount(tabs), 2);
  const pinned = togglePin(tabs, 3, 3);
  assert.deepEqual([names(pinned.tabs), pinned.tabs[2].pinned, pinned.active], [["p1", "p2", "b", "a"], true, 2]);
  const unpinned = togglePin(pinned.tabs, 0, 3);
  assert.deepEqual([names(unpinned.tabs), unpinned.tabs[2].pinned, unpinned.active], [["p2", "b", "p1", "a"], false, 3]);
  const opened = openTab(tabs, 0, "new", false, 1, () => tab("new", false));
  assert.deepEqual([names(opened.tabs), opened.active], [["p1", "p2", "new", "a", "b*"], 2]); // after the active tab, past the pins
});

test("I-010: Ctrl+PageUp / PageDown go by position and wrap", () => {
  assert.equal(stepTab(3, 2, 1), 0);
  assert.equal(stepTab(3, 0, -1), 2);
  assert.equal(stepTab(3, 1, 1), 2);
  assert.equal(stepTab(0, null, 1), null);
});

test("I-9: bulk close targets are relative to the clicked tab and always retain pins", () => {
  const tabs = [
    { path: "pin", preview: false, pinned: true, dirty: false },
    { path: "left", preview: false, dirty: true },
    { path: "clicked", preview: false, dirty: false },
    { path: "right", preview: false, dirty: false },
  ];
  const targets = (mode: "others" | "left" | "right" | "clean" | "all") => closeTargets(tabs, 2, mode, (tab) => tab.dirty).map((tab) => tab.path);
  assert.deepEqual(targets("others"), ["left", "right"]);
  assert.deepEqual(targets("left"), ["left"]);
  assert.deepEqual(targets("right"), ["right"]);
  assert.deepEqual(targets("clean"), ["clicked", "right"]);
  assert.deepEqual(targets("all"), ["left", "clicked", "right"]);
  assert.deepEqual(closeTargets(tabs, 0, "left", (tab) => tab.dirty), []);
});

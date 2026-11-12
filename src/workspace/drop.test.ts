import test from "node:test";
import assert from "node:assert/strict";
import { bodyDrop, dropSide, entryIndex, lineSide, place } from "./drop.ts";

test("I-712 / I-713: edges within min(w, h) * ratio split toward the nearest edge; the boundary and inside are the center", () => {
  // 1000 x 500 body: d = 100
  assert.equal(bodyDrop(1000, 500, 500, 250, 0.2), null);
  assert.equal(bodyDrop(1000, 500, 50, 250, 0.2), "left");
  assert.equal(bodyDrop(1000, 500, 950, 250, 0.2), "right");
  assert.equal(bodyDrop(1000, 500, 500, 20, 0.2), "up");
  assert.equal(bodyDrop(1000, 500, 500, 480, 0.2), "down");
  assert.equal(bodyDrop(1000, 500, 100, 250, 0.2), null); // x = d exactly: center
  assert.equal(bodyDrop(1000, 500, 30, 10, 0.2), "up"); // corner: up is nearer (10 < 30)
  assert.equal(bodyDrop(1000, 500, 10, 10, 0.2), "up"); // a tie goes to the first in up, right, down, left
});

test("I-715: the line is left of a tab before the dragged one, right of one after, left in another Pane", () => {
  assert.equal(dropSide(1, true, 3), "left");
  assert.equal(dropSide(4, true, 3), "right");
  assert.equal(dropSide(3, true, 3), null);
  assert.equal(dropSide(0, false, 3), "left");
});

test("I-715: a drag with no target (its own tab, the bar's start) draws no line; only the target tab of the target Pane has one", () => {
  const [a, b] = ["A", "B"];
  assert.equal(lineSide(null, a, 1, a, 3), null);
  assert.equal(lineSide({ pane: a, where: { kind: "tab", index: 1 } }, a, 1, a, 3), "left");
  assert.equal(lineSide({ pane: a, where: { kind: "tab", index: 1 } }, a, 2, a, 3), null); // another tab
  assert.equal(lineSide({ pane: a, where: { kind: "tab", index: 1 } }, b, 1, a, 3), null); // the same index in another Pane
  assert.equal(lineSide({ pane: b, where: { kind: "tab", index: 0 } }, b, 0, a, 3), "left");
  assert.equal(lineSide({ pane: a, where: { kind: "end" } }, a, 1, a, 3), null);
});

test("I-719 / I-720 / I-717: the new place decides pinning; at the pin area's end the tab keeps its state; preview ends", () => {
  const t = (path: string, pinned = false, preview = false) => ({ path, pinned, preview });
  const tabs = [t("p1", true), t("p2", true), t("a"), t("b")];
  const names = (list: { path: string; pinned?: boolean }[]) => list.map((x) => x.path + (x.pinned ? "^" : ""));
  assert.deepEqual(names(place(tabs, 1, t("x")).tabs), ["p1^", "x^", "p2^", "a", "b"]); // into the pin area: pinned
  assert.deepEqual(names(place(tabs, 3, t("x", true)).tabs), ["p1^", "p2^", "a", "x", "b"]); // past it: not pinned
  assert.deepEqual(names(place(tabs, 2, t("x", true)).tabs), ["p1^", "p2^", "x^", "a", "b"]); // at its end: kept
  assert.deepEqual(names(place(tabs, 2, t("x")).tabs), ["p1^", "p2^", "x", "a", "b"]);
  assert.deepEqual(names(place([], 0, t("x", true)).tabs), ["x^"]); // first place of a Pane without pins (I-720)
  assert.equal(place(tabs, 9, t("x", false, true)).tabs[4].preview, false); // past the end: the end; preview ends
});

test("I-3: a tree file dropped on a tab goes before that tab, new or already open in the Pane", () => {
  // [A, B, C, D], B active: a new X opens after B (at 2); dropped on D (3) it is [A, B, C, X, D].
  const rest = ["A", "B", "C", "D"].map((path) => ({ path, preview: false, pinned: false }));
  const x = { path: "X", preview: false, pinned: false };
  assert.deepEqual(place(rest, entryIndex(3, 2, false), x).tabs.map((t) => t.path), ["A", "B", "C", "X", "D"]);
  // C already open (at 2), dropped on D (3): [A, B, D] without it, so before D is index 2.
  assert.equal(entryIndex(3, 2, true), 2);
  assert.equal(entryIndex(0, 2, true), 0);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRows,
  clickRange,
  clickToggle,
  collapseAll,
  collapseStep,
  expandStep,
  move,
  naturalCmp,
  only,
  sortChildren,
  stickyRows,
  visibleRange,
  type Child,
  type Listing,
  type Row,
} from "./tree.ts";

const dir = (name: string): Child => ({ name, is_dir: true });
const file = (name: string): Child => ({ name, is_dir: false });
const R = "D:\\proj";

// proj: docs\guides\a.md (docs holds only guides), src\{main.ts, lib\x.ts}, README.md
const listing: Listing = new Map([
  [R, [dir("docs"), dir("src"), file("README.md")]],
  [`${R}\\docs`, [dir("guides")]],
  [`${R}\\docs\\guides`, [file("a.md")]],
  [`${R}\\src`, [dir("lib"), file("main.ts")]],
  [`${R}\\src\\lib`, [file("x.ts")]],
]);
const paths = (rows: Row[]) => rows.map((r) => r.path.slice(R.length + 1) || ".");
const build = (open: string[]) => buildRows(R, "proj", new Set([R, ...open.map((p) => `${R}\\${p}`)]), listing);

test("L-50 sort: folders first, then natural case-insensitive order", () => {
  const sorted = sortChildren([file("b.md"), file("file10"), dir("Zeta"), file("file2"), dir("alpha"), file("A.md")]);
  assert.deepEqual(sorted.map((c) => c.name), ["alpha", "Zeta", "A.md", "b.md", "file2", "file10"]);
  assert.ok(naturalCmp("a01", "a1") !== 0, "equal by value still has one fixed order");
  assert.ok(naturalCmp("a2", "a10") < 0);
});

test("L-42: a folder whose only child is a folder is one row; the root is never folded", () => {
  const { rows } = build(["docs\\guides"]);
  assert.deepEqual(paths(rows), [".", "docs\\guides", "docs\\guides\\a.md", "src", "README.md"]);
  assert.deepEqual(rows[1].segments.map((s) => s.name), ["docs", "guides"]);
  assert.equal(rows[1].expanded, true);
  const lone = buildRows("D:\\only", "only", new Set(["D:\\only"]), new Map([["D:\\only", [dir("x")]], ["D:\\only\\x", [dir("y")]], ["D:\\only\\x\\y", []]]));
  assert.deepEqual(lone.rows.map((r) => r.segments.length), [1, 2]); // the root stays its own row
});

test("L-38: guides span a folder's first child to its last descendant", () => {
  const { rows } = build(["docs\\guides", "src"]);
  assert.deepEqual(rows[1].guides, [{ first: true, last: false }]); // docs\guides under the root
  assert.deepEqual(rows[2].guides.map((g) => [g.first, g.last]), [[false, false], [true, true]]); // a.md: root guide, then its own
  const last = rows.at(-1)!;
  assert.deepEqual(last.guides, [{ first: false, last: true }]); // README.md ends the root's range
  assert.ok(rows.every((r) => r.guides.length === r.depth && r.guides.every(Boolean)), "one guide per ancestor level, none missing");
});

test("rows ask for the folders they still lack, and fold only once the listing is known", () => {
  const partial: Listing = new Map([[R, [dir("docs")]]]);
  const first = buildRows(R, "proj", new Set([R]), partial);
  assert.deepEqual(first.needs, [`${R}\\docs`]);
  assert.equal(first.rows[1].segments.length, 1);
  assert.deepEqual(buildRows(R, "proj", new Set([R]), new Map()).needs, [R]);
});

test("D-9: the virtual range is the visible rows plus overscan, clamped", () => {
  assert.deepEqual(visibleRange(0, 260, 26, 1000, 10), { start: 0, end: 20 });
  assert.deepEqual(visibleRange(2600, 260, 26, 1000, 10), { start: 90, end: 120 });
  assert.deepEqual(visibleRange(25900, 260, 26, 1000, 10), { start: 986, end: 1000 });
  assert.deepEqual(visibleRange(0, 260, 26, 0, 10), { start: 0, end: 0 });
});

test("R-13: sticky ancestors keep folded rows and yield at descendant boundaries", () => {
  const nested = build(["docs\\guides", "src", "src\\lib"]).rows;
  // proj, docs\\guides, a.md, src, lib, x.ts, main.ts, README.md
  // A parent at its natural sticky slot is already drawn as an overlay (Zed anchor at a.md).
  assert.deepEqual(stickyRows(nested, 0, 200, 20), [{ index: 0, top: 0 }, { index: 1, top: 20 }]);
  assert.deepEqual(stickyRows(nested, 20, 200, 20), [{ index: 0, top: 0 }, { index: 1, top: 20 }]);
  assert.deepEqual(stickyRows(nested, 21, 200, 20), [{ index: 0, top: 0 }, { index: 1, top: 19 }]);
  // At the boundary the following subtree's parents already occupy their natural slots.
  assert.deepEqual(stickyRows(nested, 40, 200, 20), [{ index: 0, top: 0 }, { index: 3, top: 20 }, { index: 4, top: 40 }]);
  assert.deepEqual(stickyRows(nested, 60, 200, 20), [{ index: 0, top: 0 }, { index: 3, top: 20 }, { index: 4, top: 40 }]);
  assert.deepEqual(stickyRows(nested, 61, 200, 20), [{ index: 0, top: 0 }, { index: 3, top: 20 }, { index: 4, top: 39 }]);
  assert.deepEqual(stickyRows([], 0, 200, 20), []);
  assert.deepEqual(stickyRows(nested.slice(0, 1), 0, 200, 20), []);
});

test("R-13: each root starts a separate sticky chain", () => {
  const first = build(["docs\\guides", "src"]).rows;
  const second = build(["docs\\guides"]).rows;
  const forest = [...first, ...second];
  const end = first.length * 20;
  // The final child enters slot zero before the root starts drifting, then the next root takes over.
  assert.deepEqual(stickyRows(forest, end - 21, 200, 20), [{ index: 0, top: 0 }]);
  assert.deepEqual(stickyRows(forest, end - 20, 200, 20), [{ index: 0, top: 0 }]);
  assert.deepEqual(stickyRows(forest, end - 19, 200, 20), [{ index: 0, top: -1 }]);
  assert.deepEqual(stickyRows(forest, end - 1, 200, 20), [{ index: 0, top: -19 }]);
  assert.deepEqual(stickyRows(forest, end, 200, 20), [{ index: first.length, top: 0 }, { index: first.length + 1, top: 20 }]);
  assert.deepEqual(stickyRows(forest, end + 20, 200, 20), [{ index: first.length, top: 0 }, { index: first.length + 1, top: 20 }]);
});

const rows = build(["docs\\guides", "src"]).rows; // ., docs\guides, a.md, src, src\lib, main.ts, README.md
const at = (i: number) => rows[i].path;

test("I-030, I-088: Up/Down/Home/End stop at the ends and start from the edges with no selection", () => {
  assert.equal(move(rows, only(at(6)), "next", false)!.index, 6);
  assert.equal(move(rows, only(at(0)), "prev", false)!.index, 0);
  assert.equal(move(rows, only(at(2)), "next", false)!.sel.selected, at(3));
  assert.equal(move(rows, only(null), "next", false)!.index, 0);
  assert.equal(move(rows, only(null), "prev", false)!.index, 6);
  assert.equal(move(rows, only(at(3)), "last", false)!.index, 6);
  assert.equal(move(rows, only(at(3)), "first", false)!.index, 0);
  assert.equal(move([], only(null), "next", false), null);
});

test("I-043, I-090: Shift extends from the anchor, Ctrl toggles", () => {
  let sel = only(at(2));
  sel = move(rows, sel, "next", true)!.sel;
  sel = move(rows, sel, "next", true)!.sel;
  assert.deepEqual(sel.marked, [at(2), at(3), at(4)]);
  assert.equal(sel.anchor, at(2));
  sel = move(rows, sel, "prev", true)!.sel; // shrinking back toward the anchor
  assert.deepEqual(sel.marked, [at(2), at(3)]);
  assert.deepEqual(clickRange(rows, only(at(1)), at(4)).marked, [at(1), at(2), at(3), at(4)]);
  assert.deepEqual(clickRange(rows, only(at(4)), at(1)).marked, [at(1), at(2), at(3), at(4)]);
  const toggled = clickToggle(only(at(1)), at(5)); // the selected item joins the set first
  assert.deepEqual(toggled.marked, [at(1), at(5)]);
  assert.equal(toggled.selected, at(5));
  const removed = clickToggle(toggled, at(5));
  assert.deepEqual([removed.marked, removed.selected], [[at(1)], at(1)]);
  assert.deepEqual(clickToggle(only(at(1)), at(1)), { selected: null, marked: [], anchor: null });
});

test("I-089, I-031: Right opens, then goes down; Left closes, then goes to the parent; folded paths step by piece", () => {
  const closed = build([]).rows; // ., docs\guides (closed), src (closed), README.md
  assert.deepEqual(expandStep(closed, only(closed[2].path)), { expanded: { path: closed[2].path, open: true } });
  assert.deepEqual(expandStep(rows, only(at(3))), { select: at(4) }); // src is open: next row
  assert.deepEqual(expandStep(rows, only(at(2))), null); // a file
  assert.deepEqual(expandStep(rows, only(`${R}\\docs`)), { select: `${R}\\docs\\guides` }); // piece of the folded row
  assert.deepEqual(collapseStep(rows, only(at(3))), { expanded: { path: at(3), open: false } });
  assert.deepEqual(collapseStep(rows, only(at(2))), { select: at(1) }); // a file goes to its parent row
  assert.deepEqual(collapseStep(rows, only(at(1))), { expanded: { path: at(1), open: false } }); // last piece of an open folded row closes first
  assert.deepEqual(collapseStep(rows, only(`${R}\\docs`)), { select: at(0) }); // first piece: parent row (the root)
  assert.deepEqual(collapseStep(rows, only(at(0))), { expanded: { path: R, open: false } }); // Left may close the root (only Ctrl+Left keeps it)
  assert.equal(collapseStep(build([]).rows.slice(0, 1).map((r) => ({ ...r, expanded: false })), only(R)), null); // a closed root has nowhere to go
});

test("I-032, D-17: collapsing everything keeps the root open", () => {
  assert.deepEqual([...collapseAll(new Set([R, `${R}\\src`]), R)], [R]);
});

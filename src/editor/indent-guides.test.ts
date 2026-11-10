import test from "node:test";
import assert from "node:assert/strict";
import { activeBlock, depths, guessIndentUnit, guideRuns, lineDepth, type Lines } from "./indent-guides.ts";
import { toggleApplies } from "./view-options.ts";

const lines = (text: string): Lines => { const rows = text.split("\n"); return { count: rows.length, at: (n) => rows[n - 1] }; };

test("I-5: depth by 4 columns, blank lines continue the block, guides are runs of lines deeper than their level", () => {
  assert.deepEqual(["", "  ", "a", "  a", "    a", "\ta", "\t    a", " \t a", "        a"].map((text) => lineDepth(text)), [null, null, 0, 0, 1, 1, 2, 1, 2]);
  // Three levels of TS with a blank line inside the deepest block and one between two blocks.
  const ts = lines("function f() {\n    if (x) {\n        run();\n\n        done();\n    }\n\n    return 1;\n}");
  const d = depths(ts, 1, ts.count);
  assert.deepEqual(d, [0, 1, 2, 2, 2, 1, 1, 1, 0]); // line 4 is inside the if block; line 7 sits between depth 1 and 1
  assert.deepEqual(guideRuns(d, 1), [{ level: 1, from: 3, to: 5 }, { level: 0, from: 2, to: 8 }]);
  // A blank line at the end of a block takes the smaller depth: the inner guide stops above it.
  assert.deepEqual(depths(lines("a\n    b\n        c\n\n    d"), 1, 5), [0, 1, 2, 1, 1]);
  assert.deepEqual(depths(lines("    a\n\n"), 1, 3), [1, 0, 0]); // trailing blanks have no block
  // Markdown: a sub list four spaces in gets a guide, two spaces does not.
  assert.deepEqual(guideRuns(depths(lines("- a\n    - b\n    - c\n- d\n  - e"), 1, 5), 1), [{ level: 0, from: 2, to: 3 }]);
  // The window may start inside a block: the lines above it are looked at for a blank first line.
  assert.deepEqual(depths(lines("a\n    b\n\n    c"), 3, 4), [1, 1]);
});

test("I-5: the active block follows Zed's enclosing indent", () => {
  const ts = lines("function f() {\n    if (x) {\n        run();\n\n        done();\n    }\n    return 1;\n}\nlet y;");
  assert.deepEqual(activeBlock(ts, 3), { level: 1, from: 3, to: 5 }); // inside the if block
  assert.deepEqual(activeBlock(ts, 4), { level: 1, from: 3, to: 5 }); // a blank line inside takes the block around it
  assert.deepEqual(activeBlock(ts, 2), { level: 1, from: 3, to: 5 }); // "if (x) {" opens the deeper block
  assert.deepEqual(activeBlock(ts, 6), { level: 0, from: 2, to: 7 }); // the closing "}" belongs to the outer block
  assert.deepEqual(activeBlock(ts, 1), { level: 0, from: 2, to: 7 }); // so does the line that opens it
  assert.equal(activeBlock(ts, 8), null); // top level
  assert.equal(activeBlock(ts, 9), null);
  assert.deepEqual(activeBlock(lines("a\n    b\n\n\n    c"), 3), { level: 0, from: 2, to: 5 });
  assert.equal(activeBlock(lines("a\n\nb"), 2), null);
});

test("I-6 / I-7: line numbers toggle in any focused editor, wrapping only in a Markdown one", () => {
  const stack = (...names: string[]) => [new Set(["Workspace"]), ...names.map((n) => new Set(n.split(" ")))];
  assert.equal(toggleApplies(stack("Pane", "Editor extension=md"), "wordWrap"), true);
  assert.equal(toggleApplies(stack("Pane", "Editor extension=markdown", "EditorSearch"), "wordWrap"), true);
  assert.equal(toggleApplies(stack("Pane", "Editor extension=ts"), "wordWrap"), false);
  assert.equal(toggleApplies(stack("Pane", "Editor"), "wordWrap"), false);
  for (const editor of ["Editor extension=md", "Editor extension=ts", "Editor"]) assert.equal(toggleApplies(stack("Pane", editor), "lineNumbers"), true);
  for (const other of [[], ["Sidebar"], ["Pane"], ["MarkdownPreview"], ["KeymapEditor"]]) for (const option of ["lineNumbers", "wordWrap"] as const) assert.equal(toggleApplies(stack(...other), option), false);
});

test("I-15: the indent unit is guessed like VS Code: 2 or 4 spaces, tabs and unclear files keep 4", () => {
  const unit = (text: string) => guessIndentUnit(lines(text));
  assert.equal(unit("a:\n  b:\n    c:\n      d: 1\n    e: 2\n  f: 3\ng: 4"), 2); // three steps of 2
  assert.equal(unit("function f() {\n    if (x) {\n        run();\n    }\n}"), 4);
  assert.equal(unit("a\n  b\n    c\n      d\n        e\n    f"), 2); // 2 counted often enough to beat 4
  assert.equal(unit("a\n\tb\n\t\tc\n\td"), 4); // tab file
  assert.equal(unit("one\ntwo\n"), 4); // nothing to count
  assert.deepEqual(depths(lines("a:\n  b:\n    c: 1"), 1, 3, 2), [0, 1, 2]);
  assert.deepEqual(guideRuns(depths(lines("a:\n  b:\n    c: 1"), 1, 3, 2), 1), [{ level: 1, from: 3, to: 3 }, { level: 0, from: 2, to: 3 }]);
});

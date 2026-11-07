// SPEC R-11 V1: pinned HTML copy only.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { EditorState } from "@codemirror/state";
import { Parser, type Edit, type Node, type Tree } from "web-tree-sitter";
import { loadLanguage } from "./grammar.ts";
import { editTree, mostlyReplaced, parseDoc, parseDocSliced } from "./incremental.ts";

await Parser.init();
const parser = new Parser();
const wasmPath = new URL("../assets/zed-grammars/grammars/html.wasm", import.meta.url);
const available = existsSync(wasmPath);
if (available) parser.setLanguage(await loadLanguage(new Uint8Array(readFileSync(wasmPath))));

// Every node with its range: catches reused nodes left at wrong offsets by a bad edit.
const shape = (node: Node): string =>
  `${node.type}[${node.startIndex},${node.endIndex},${node.startPosition.row}:${node.startPosition.column}](${node.children.map((c) => shape(c!)).join(" ")})`;

test("each transaction: one Tree.edit per change, parse gets the edited old tree, result equals a full parse", { skip: !available }, () => {
  // Sibling elements, so a misplaced edit leaves a reused node at a wrong offset.
  let state = EditorState.create({ doc: "<a>é</a>\n<b>2</b>\n<i>3</i>\n<s>4</s>\n<u>5</u>\n" });
  let tree = parseDoc(parser, state.doc, null)!;
  const transactions = [
    // several changes in one transaction: insert a line break, delete across lines, replace text
    [{ from: 3, insert: "xyz\n" }, { from: 13, to: 22 }, { from: 28, to: 29, insert: "<em>q</em>" }],
    [{ from: 0, insert: "<!-- c -->\n" }],
  ];
  for (const changes of transactions) {
    const tr = state.update({ changes });
    const edits: Edit[] = [];
    const originalEdit = tree.edit.bind(tree);
    tree.edit = (edit: Edit) => (edits.push(edit), originalEdit(edit));
    let passedOld: Tree | null | undefined;
    let input: unknown;
    const originalParse = parser.parse.bind(parser);
    parser.parse = (callback, old, options) => ((input = callback), (passedOld = old), originalParse(callback, old, options));

    editTree(tree, tr.changes, state.doc, tr.newDoc);
    const next = parseDoc(parser, tr.newDoc, tree)!;
    parser.parse = originalParse;

    assert.equal(edits.length, changes.length);
    if (changes.length === 3) {
      // Hand-computed: each edit in the coordinates of the text after the previous edits.
      const p = (row: number, column: number) => ({ row, column });
      assert.deepEqual(
        edits.map((e) => [e.startIndex, e.oldEndIndex, e.newEndIndex, e.startPosition, e.oldEndPosition, e.newEndPosition]),
        [
          [3, 3, 7, p(0, 3), p(0, 3), p(1, 0)],
          [17, 26, 17, p(2, 4), p(3, 4), p(2, 4)],
          [23, 24, 33, p(3, 1), p(3, 2), p(3, 11)],
        ],
      );
    }
    assert.equal(passedOld, tree);
    assert.equal(typeof input, "function"); // read in chunks, not one whole-document string
    assert.equal(shape(next.rootNode), shape(originalParse(tr.newDoc.toString())!.rootNode));
    tree.delete();
    tree = next;
    state = tr.state;
  }
});

test("R-30: a parse in slices gives the thread back between slices and ends with the same tree as one parse", { skip: !available }, async () => {
  const state = EditorState.create({ doc: '<div class="row"><span id="a1">some text &amp; more</span></div>\n'.repeat(20000) });
  let ticks = 0;
  const timer = setInterval(() => ticks++, 1); // runs only if a slice ends and the event loop turns
  const sliced = (await parseDocSliced(parser, state.doc, 5, () => false))!;
  clearInterval(timer);
  assert.ok(ticks > 0, "the event loop ran between slices");
  assert.equal(shape(sliced.rootNode), shape(parseDoc(parser, state.doc, null)!.rootNode));
  assert.equal(await parseDocSliced(parser, state.doc, 0, () => true), null, "a parse nobody wants any more stops");
  parser.reset();
});

test("R-25: a change that keeps less than half of the text is a replacement; small edits and cutting are not", () => {
  const base = EditorState.create({ doc: "x".repeat(100) });
  const of = (changes: Parameters<typeof base.update>[0]["changes"]) => base.update({ changes }).changes;
  assert.equal(mostlyReplaced(of({ from: 0, to: 100, insert: "y".repeat(100) })), true, "everything new");
  assert.equal(mostlyReplaced(of({ from: 40, to: 45, insert: "abc" })), false, "an edit");
  assert.equal(mostlyReplaced(of({ from: 10, to: 90 })), false, "cutting most of it keeps what is left");
  assert.equal(mostlyReplaced(of({ from: 50, to: 50, insert: "z".repeat(200) })), true, "a block much bigger than the old text");
  assert.equal(mostlyReplaced(of({ from: 0, to: 100 })), false, "emptied");
});

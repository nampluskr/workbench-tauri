// CM6 <-> Tree-sitter incremental parsing (SPEC R-11). Indexes and Points are UTF-16 code units
// (web-tree-sitter 0.27.1; only QueryOptions takes bytes).
import type { ChangeSet, Text } from "@codemirror/state";
import { Edit, type Parser, type Point, type Range, type Tree } from "web-tree-sitter";

const point = (doc: Text, pos: number): Point => {
  const line = doc.lineAt(pos);
  return { row: line.number - 1, column: pos - line.from };
};

/**
 * Report every change of a transaction to `tree` with Tree.edit. Changes are applied in order,
 * so each edit is expressed in the coordinates of the text after the previous ones: everything
 * before change k already equals the new document, hence start = fromB.
 */
export function editTree(tree: Tree, changes: ChangeSet, oldDoc: Text, newDoc: Text): void {
  changes.iterChanges((fromA, toA, fromB, toB) => {
    const start = point(newDoc, fromB);
    const removedRows = oldDoc.lineAt(toA).number - oldDoc.lineAt(fromA).number;
    const oldEndPosition = removedRows
      ? { row: start.row + removedRows, column: toA - oldDoc.lineAt(toA).from }
      : { row: start.row, column: start.column + (toA - fromA) };
    tree.edit(
      new Edit({
        startIndex: fromB,
        oldEndIndex: fromB + (toA - fromA),
        newEndIndex: toB,
        startPosition: start,
        oldEndPosition,
        newEndPosition: point(newDoc, toB),
      }),
    );
  });
}

// Chunk size for the parse input callback: the parser reads the document piece by piece
// instead of one string of the whole document.
const CHUNK = 4096;

/** Parse `doc`, reusing the edited `oldTree` when given. */
export function parseDoc(parser: Parser, doc: Text, oldTree: Tree | null): Tree | null {
  return parser.parse((index) => (index < doc.length ? doc.sliceString(index, index + CHUNK) : undefined), oldTree);
}

/**
 * R-30: the first full parse of a big file, in slices of `sliceMs`, giving the main thread back between slices so typing,
 * scrolling and menus stay live. A cancelled web-tree-sitter parse resumes where it stopped on the next call, so `parser`
 * must belong to this parse alone. `stop` says the result is no longer wanted (the view went away); null is returned then.
 */
export async function parseDocSliced(parser: Parser, doc: Text, sliceMs: number, stop: () => boolean, oldTree: Tree | null = null, includedRanges?: Range[]): Promise<Tree | null> {
  for (;;) {
    const start = performance.now();
    const tree = parser.parse((index) => (index < doc.length ? doc.sliceString(index, index + CHUNK) : undefined), oldTree, {
      includedRanges,
      progressCallback: () => performance.now() - start > sliceMs, // true cancels this slice
    });
    if (tree) return tree;
    await new Promise((resolve) => setTimeout(resolve));
    if (stop()) {
      parser.reset();
      return null;
    }
  }
}

/** Less than half of the new text is kept from the old one: reusing the old tree gains nothing (R-25, a file read again). */
export function mostlyReplaced(changes: ChangeSet): boolean {
  let inserted = 0;
  changes.iterChangedRanges((_fromA, _toA, fromB, toB) => (inserted += toB - fromB));
  return (changes.newLength - inserted) * 2 < changes.newLength;
}

// CM6 <-> Tree-sitter incremental parsing (SPEC R-11). Indexes and Points are UTF-16 code units
// (web-tree-sitter 0.27.1; only QueryOptions takes bytes).
import type { ChangeSet, Text } from "@codemirror/state";
import { Edit, type Parser, type Point, type Tree } from "web-tree-sitter";

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

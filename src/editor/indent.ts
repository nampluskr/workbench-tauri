import { countColumn, EditorSelection, type ChangeSpec, type EditorState, type TransactionSpec } from "@codemirror/state";

// I-059 editor::Tab / editor::Backtab with E-055 (`tab_size` 4, `hard_tabs` false: spaces only). The size is the
// state's tabSize (EDITOR_TAB_SIZE). Kept here instead of @codemirror/language's indentMore / indentLess, whose unit
// would need that package as a direct dependency.

/** Lines the ranges cover; a range ending at a line start does not take that line. */
function lineStarts(state: EditorState): number[] {
  const starts = new Set<number>();
  for (const range of state.selection.ranges) {
    const last = range.to > range.from && state.doc.lineAt(range.to).from === range.to ? range.to - 1 : range.to;
    for (let pos = range.from; pos <= last; ) {
      const line = state.doc.lineAt(pos);
      starts.add(line.from);
      pos = line.to + 1;
    }
  }
  return [...starts];
}

/**
 * Tab: with only cursors, spaces up to the next tab stop at each cursor; with a selection, every covered line gets one
 * indent level.
 * shortcut: Zed also moves a cursor in leading whitespace to the syntax-suggested indent (E-056 auto_indent); there is no
 * syntax indent here, so it is always the next tab stop.
 */
export function tab(state: EditorState): TransactionSpec {
  const size = state.tabSize;
  if (state.selection.ranges.every((r) => r.empty)) {
    return {
      ...state.changeByRange((range) => {
        const line = state.doc.lineAt(range.head);
        const n = size - (countColumn(line.text.slice(0, range.head - line.from), size) % size);
        return { changes: { from: range.head, insert: " ".repeat(n) }, range: EditorSelection.cursor(range.head + n) };
      }),
      userEvent: "input.indent",
    };
  }
  return { changes: lineStarts(state).map((from) => ({ from, insert: " ".repeat(size) })), userEvent: "input.indent" };
}

/** Shift+Tab: each covered line loses one level: a leading tab, or the spaces back to the previous tab stop. */
export function backtab(state: EditorState): TransactionSpec {
  const size = state.tabSize;
  const changes: ChangeSpec[] = [];
  for (const from of lineStarts(state)) {
    const text = state.doc.lineAt(from).text;
    const spaces = /^ */.exec(text)![0].length;
    const n = text.startsWith("\t") ? 1 : spaces === 0 ? 0 : ((spaces - 1) % size) + 1;
    if (n > 0) changes.push({ from, to: from + n });
  }
  return { changes, userEvent: "delete.dedent" };
}

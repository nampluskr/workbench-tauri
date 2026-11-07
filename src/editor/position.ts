import type { EditorState } from "@codemirror/state";

/** I-5: Unicode scalar counts, excluding a selection's final line when it ends at column zero. */
export function cursorPosition(state: EditorState): string {
  const { doc, selection } = state;
  const head = selection.main.head;
  const line = doc.lineAt(head);
  let characters = 0;
  let lines = 0;
  for (const range of selection.ranges) {
    if (range.empty) continue;
    characters += [...doc.sliceString(range.from, range.to)].length;
    const end = doc.lineAt(range.to);
    lines += end.number - doc.lineAt(range.from).number + (range.to > end.from ? 1 : 0);
  }
  const counts: string[] = [];
  for (const [count, name] of [[selection.ranges.length, "selection"], [lines, "line"], [characters, "character"]] as const) {
    if (count > (name === "character" ? 0 : 1)) counts.push(`${count} ${name}${count > 1 ? "s" : ""}`);
  }
  return `${line.number}:${[...doc.sliceString(line.from, head)].length + 1}${counts.length ? ` (${counts.join(", ")})` : ""}`;
}

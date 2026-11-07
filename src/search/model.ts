export type SearchMatch = { line: number; column: number; endLine: number; endColumn: number };
export type SearchFile = { path: string; matches: SearchMatch[]; lines: { number: number; text: string; spans: [number, number][] }[] };
export type SearchEvent = { kind: "file"; file: SearchFile } | { kind: "done" | "limit" } | { kind: "error"; message: string };
export type SearchState = { files: SearchFile[]; busy: boolean; error: string; limited: boolean };
export const emptySearch = (): SearchState => ({ files: [], busy: false, error: "", limited: false });

export function receiveSearch(state: SearchState, event: SearchEvent): SearchState {
  if (event.kind === "file") return { ...state, files: [...state.files, event.file] };
  if (event.kind === "error") return { ...state, busy: false, error: event.message };
  return { ...state, busy: event.kind !== "done" && state.busy, limited: state.limited || event.kind === "limit" };
}

/** Overlapping multiline matches share one highlight; offsets are UTF-16 for DOM and CodeMirror. */
export function highlightParts(text: string, spans: [number, number][]): { text: string; match: boolean }[] {
  const parts: { text: string; match: boolean }[] = [];
  let end = 0;
  for (const [from, to] of [...spans].sort((a, b) => a[0] - b[0])) {
    if (from > end) parts.push({ text: text.slice(end, from), match: false });
    if (to > end) parts.push({ text: text.slice(Math.max(from, end), to), match: true });
    end = Math.max(end, to);
  }
  if (end < text.length) parts.push({ text: text.slice(end), match: false });
  return parts;
}

export const nextMatch = (index: number, total: number, delta: number): number => total ? (index + delta + total) % total : 0;

export function searchPosition(file: SearchFile, match: SearchMatch): string {
  let characters = 0;
  for (const line of file.lines) {
    if (line.number < match.line || line.number > match.endLine) continue;
    const from = line.number === match.line ? match.column - 1 : 0;
    const to = line.number === match.endLine ? match.endColumn - 1 : line.text.length;
    characters += [...line.text.slice(from, to)].length + (line.number < match.endLine ? 1 : 0);
  }
  const last = file.lines.find((line) => line.number === match.endLine)?.text ?? "";
  const column = [...last.slice(0, match.endColumn - 1)].length + 1;
  const lines = match.endLine - match.line + (match.endColumn > 1 ? 1 : 0);
  const counts = [...(lines > 1 ? [`${lines} lines`] : []), ...(characters ? [`${characters} character${characters > 1 ? "s" : ""}`] : [])];
  return `${match.endLine}:${column}${counts.length ? ` (${counts.join(", ")})` : ""}`;
}

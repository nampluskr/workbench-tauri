import { EditorState } from "@codemirror/state";
import type { SearchQuery } from "@codemirror/search";

/**
 * core v0.8.1 I-9: the matches of a find-bar query in a preview's text, by the editor tab's own rules (CM's SearchQuery with the
 * same case, whole-word and regexp handling), so both find bars agree. Empty matches are left out (nothing to mark). Null: an invalid regexp.
 */
export function textMatches(text: string, query: SearchQuery): { from: number; to: number }[] | null {
  if (!query.search) return [];
  if (!query.valid) return null;
  const state = EditorState.create({ doc: text });
  const found: { from: number; to: number }[] = [];
  for (const { from, to } of { [Symbol.iterator]: () => query.getCursor(state) as Iterator<{ from: number; to: number }> }) if (to > from) found.push({ from, to });
  return found;
}

// What a preview's text is read from, for the app's own previews (shell/preview-search.ts) and inside an HTML preview's frame (html.ts).
/** Text under these is not looked at: the code block header (language, Copy), a notebook cell's [n], and what is not shown as text. */
export const FIND_SKIP = ".code-block-header, .nb-count, style, script, annotation";
/** Text in different blocks is joined with a line break, so a match never runs from one block into the next. */
export const FIND_BLOCKS = "p, li, h1, h2, h3, h4, h5, h6, td, th, pre, blockquote, div, dt, dd, math, text, foreignObject";

type RangeSet<T> = { add: (value: T) => unknown; delete: (value: T) => unknown };
/**
 * Swaps one preview's marks in the shared highlights: everything it put there before (`painted`) is taken out, then `next` goes in,
 * `next[index]` alone in `current`. Returns what is painted now, to pass back next time.
 */
export function repaint<T>(others: RangeSet<T>, current: RangeSet<T>, painted: readonly T[], next: readonly T[], index: number): T[] {
  for (const r of painted) { others.delete(r); current.delete(r); }
  next.forEach((r, i) => (i === index ? current : others).add(r));
  return [...next];
}

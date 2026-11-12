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

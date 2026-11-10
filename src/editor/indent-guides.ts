import { StateField } from "@codemirror/state";
import { EditorView, RectangleMarker, layer } from "@codemirror/view";
import { EDITOR_TAB_SIZE } from "../spec/metrics.ts";

/** A document read by 1-based line number. */
export type Lines = { count: number; at: (line: number) => string };

// Zed multi_buffer.rs enclosing_indent: SEARCH_ROW_LIMIT 25000 and SEARCH_WHITESPACE_ROW_LIMIT 2500.
const BLOCK_LIMIT = 25000;
const BLANK_LIMIT = 2500;

const GUESS_LINES = 10000;
const UNIT_CANDIDATES = [2, 4, 6, 8, 3, 5, 7];

/**
 * The indent unit of a file (I-15), by the rules of VS Code guessIndentation() (editor/common/model/indentationGuesser.ts,
 * read in the installed bundle; rules only): look at the first 10000 lines; for each non-blank line, compare its leading
 * spaces with the previous non-blank line (one indent must be a prefix of the other) and count the difference when it is
 * 1..8; the unit is the candidate (2 4 6 8 3 5 7, in that order on a tie) with the most counts, but 2 wins over 4 when
 * 2 was counted at least two thirds as often. Tab-led lines outnumbering lines with 2+ leading spaces mean a tab file, and
 * nothing counted means no unit: both give EDITOR_TAB_SIZE (the old fixed 4).
 * shortcut: no "looks like alignment" filter (a comma-ended line aligned under an argument), add it if guides jump on those.
 */
export function guessIndentUnit(lines: Lines): number {
  const counts = new Array<number>(9).fill(0);
  let tabs = 0, spaced = 0, previous = "";
  for (let n = 1; n <= Math.min(lines.count, GUESS_LINES); n++) {
    const text = lines.at(n);
    const lead = /^[ \t]*/.exec(text)![0];
    if (lead.length === text.length) continue; // blank line
    if (lead.includes("\t")) tabs++; else if (lead.length > 1) spaced++;
    let common = 0;
    while (common < lead.length && common < previous.length && lead[common] === previous[common]) common++;
    const now = lead.slice(common), before = previous.slice(common);
    previous = lead;
    if (/\t/.test(now + before)) continue; // a tab step is not a space step
    const diff = Math.abs(now.length - before.length);
    if (diff <= 8) counts[diff]++;
  }
  if (tabs >= spaced) return EDITOR_TAB_SIZE;
  let unit = 0, best = 0;
  for (const c of UNIT_CANDIDATES) if (counts[c] > best) { best = counts[c]; unit = c; }
  if (unit === 4 && counts[2] > 0 && counts[2] >= (counts[4] * 2) / 3) unit = 2;
  return unit || EDITOR_TAB_SIZE;
}

/** Indent steps of a line (`unit` columns each, a tab runs to the next tab stop); null for a blank line. */
export function lineDepth(text: string, unit = EDITOR_TAB_SIZE): number | null {
  let column = 0;
  for (const char of text) {
    if (char === " ") column++;
    else if (char === "\t") column = (Math.floor(column / EDITOR_TAB_SIZE) + 1) * EDITOR_TAB_SIZE;
    else return Math.floor(column / unit);
  }
  return null;
}

/** The nearest non-blank line from `from` going `step` (1 or -1), at most `limit` lines on. */
function neighbour(lines: Lines, from: number, step: 1 | -1, limit: number, unit: number): { line: number; depth: number } | null {
  for (let line = from, i = 0; line >= 1 && line <= lines.count && i < limit; line += step, i++) {
    const depth = lineDepth(lines.at(line), unit);
    if (depth !== null) return { line, depth };
  }
  return null;
}

/** Depth of lines `from..to`; a blank line takes the smaller depth of the non-blank lines around it, so guides run through it but stop where the block ends. */
export function depths(lines: Lines, from: number, to: number, unit = EDITOR_TAB_SIZE): number[] {
  const own: (number | null)[] = [];
  for (let line = from; line <= to; line++) own.push(lineDepth(lines.at(line), unit));
  const above: number[] = [];
  let last = neighbour(lines, from - 1, -1, BLANK_LIMIT, unit)?.depth ?? 0;
  own.forEach((depth) => { above.push(last); if (depth !== null) last = depth; });
  const below: number[] = [];
  last = neighbour(lines, to + 1, 1, BLANK_LIMIT, unit)?.depth ?? 0;
  for (let i = own.length - 1; i >= 0; i--) { below[i] = last; if (own[i] !== null) last = own[i]!; }
  return own.map((depth, i) => depth ?? Math.min(above[i], below[i]));
}

/** One guide: the 0-based `level` (column level * unit) over lines `from..to`. */
export type Guide = { level: number; from: number; to: number };

/** Guides of consecutive lines starting at line `first`, each a run of lines deeper than its level. */
export function guideRuns(depth: readonly number[], first: number): Guide[] {
  const out: Guide[] = [];
  const starts: number[] = [];
  const close = (end: number) => out.push({ level: starts.length - 1, from: starts.pop()!, to: end });
  depth.forEach((d, i) => {
    while (starts.length > d) close(first + i - 1);
    while (starts.length < d) starts.push(first + i);
  });
  while (starts.length) close(first + depth.length - 1);
  return out;
}

/** The block that holds the cursor: guide `level` over lines `from..to`. */
export type ActiveBlock = Guide;

/**
 * Zed's active guide (crates/multi_buffer enclosing_indent, behavior only): a line that opens a deeper block counts as that
 * block; a blank line takes the deeper of the non-blank lines above and below (above on a tie); the block is the run of lines at
 * least as deep, blank lines inside it included, none at its ends. Depth 0 has no guide.
 */
export function activeBlock(lines: Lines, cursor: number, unit = EDITOR_TAB_SIZE): ActiveBlock | null {
  let row = cursor;
  let depth = lineDepth(lines.at(cursor), unit);
  if (depth !== null) {
    const next = cursor < lines.count ? lineDepth(lines.at(cursor + 1), unit) : null;
    if (next !== null && next > depth) { depth = next; row = cursor + 1; }
  } else {
    const up = neighbour(lines, cursor - 1, -1, BLANK_LIMIT, unit);
    const down = neighbour(lines, cursor + 1, 1, BLANK_LIMIT, unit);
    const pick = up && down ? (up.depth >= down.depth ? up : down) : up ?? down;
    if (!pick) return null;
    depth = pick.depth;
    row = pick.line;
  }
  if (depth === 0) return null;
  let from = row;
  let to = row;
  for (let line = row - 1, i = 0; line >= 1 && i < BLOCK_LIMIT; line--, i++) {
    const d = lineDepth(lines.at(line), unit);
    if (d === null) continue;
    if (d < depth) break;
    from = line;
  }
  for (let line = row + 1, i = 0; line <= lines.count && i < BLOCK_LIMIT; line++, i++) {
    const d = lineDepth(lines.at(line), unit);
    if (d === null) continue;
    if (d < depth) break;
    to = line;
  }
  return { level: depth - 1, from, to };
}

/** I-15: the unit of the file, found again after every edit (a scan of at most 10000 lines). */
const unitField = StateField.define<number>({
  create: (state) => guessIndentUnit({ count: state.doc.lines, at: (line) => state.doc.line(line).text }),
  update: (unit, tr) => (tr.docChanged ? guessIndentUnit({ count: tr.state.doc.lines, at: (line) => tr.state.doc.line(line).text }) : unit),
});

/** Core v0.7 I-5: guides under the text of the viewport lines, drawn as a layer so the document text is untouched (nothing to copy). */
export const indentGuides = [
  unitField,
  layer({
    above: false,
    class: "cm-indentGuideLayer",
    update: (update) => update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged || update.heightChanged,
    markers(view) {
      const doc = view.state.doc;
      const unit = view.state.field(unitField);
      const lines: Lines = { count: doc.lines, at: (line) => doc.line(line).text };
      const first = doc.lineAt(view.viewport.from).number;
      const guides = guideRuns(depths(lines, first, doc.lineAt(view.viewport.to).number, unit), first);
      if (!guides.length) return [];
      const active = activeBlock(lines, doc.lineAt(view.state.selection.main.head).number, unit);
      // Layer coordinates, as CM's own selection layer: relative to the scroller's content origin.
      const scroll = view.scrollDOM.getBoundingClientRect();
      const baseLeft = scroll.left - view.scrollDOM.scrollLeft * view.scaleX;
      const baseTop = scroll.top - view.scrollDOM.scrollTop * view.scaleY;
      const line = view.contentDOM.querySelector(".cm-line"); // E-005 / I-27: the text starts after the .cm-line padding, which is not the same with and without line numbers
      const margin = line ? parseFloat(getComputedStyle(line).paddingLeft) || 0 : 0;
      const textLeft = view.contentDOM.getBoundingClientRect().left + margin;
      const step = unit * view.defaultCharacterWidth;
      const mark = ({ level, from, to }: Guide) => {
        const top = view.lineBlockAt(doc.line(from).from);
        const bottom = view.lineBlockAt(doc.line(to).from);
        const current = !!active && active.level === level && active.from <= to && from <= active.to;
        return { current, marker: new RectangleMarker(current ? "cm-indentGuide cm-indentGuide-active" : "cm-indentGuide",
          textLeft + level * step - baseLeft, view.documentTop + top.top - baseTop, null, bottom.bottom - top.top) };
      };
      const marks = guides.map(mark);
      return [...marks.filter((m) => !m.current), ...marks.filter((m) => m.current)].map((m) => m.marker);
    },
  }),
  EditorView.theme({
    ".cm-indentGuide": { position: "absolute", pointerEvents: "none", width: "var(--editor-indent-guide-width)", backgroundColor: "var(--editor-indent-guide)" },
    ".cm-indentGuide-active": { width: "var(--editor-indent-guide-active-width)", backgroundColor: "var(--editor-indent-guide-active)" },
  }),
];

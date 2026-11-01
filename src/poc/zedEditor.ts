// CM6 extensions that reproduce the Zed editor metrics checked by SPEC R-2
// (03-tauri R-02). Values come from 01-zed 01-LAYOUT (E-, L- IDs); colors are
// the Catppuccin Mocha values listed in 01-zed 03-THEME-ICONS. The theme loader
// itself is Phase 2 (SPEC R-8); these are fixed PoC values.
import {
  EditorView,
  GutterMarker,
  Decoration,
  drawSelection,
  gutterLineClass,
  lineNumbers,
} from "@codemirror/view";
import { EditorState, RangeSet, type Extension } from "@codemirror/state";
import { selectionShape } from "./selectionShape";

/**
 * CSP nonce for CM6's runtime <style> element. In built assets Tauri injects
 * a per-load nonce into every <style> of index.html and adds it to
 * `style-src`; index.html carries an empty <style id="csp-nonce-carrier"> for
 * this. In `tauri dev` (pages loaded from the Vite server) there is none.
 */
export function cspNonce(): string {
  const carrier = document.getElementById("csp-nonce-carrier") as HTMLStyleElement | null;
  return carrier?.nonce ?? "";
}

/** SPEC R-2 / question Q7 A: measure with a system monospace font. */
export const EDITOR_FONT_FAMILY = "Consolas";
/** L-08: buffer font 15px. */
export const EDITOR_FONT_SIZE = 15;
/** E-010: buffer_line_height "comfortable" = font size x 1.618. */
export const LINE_HEIGHT_FACTOR = 1.618;
export const LINE_HEIGHT_PX = EDITOR_FONT_SIZE * LINE_HEIGHT_FACTOR;
/** E-015: selection corner radius = 0.15 x line height. */
export const SELECTION_RADIUS_PX = 0.15 * LINE_HEIGHT_PX;
/** E-030: editor scrollbar thickness. */
export const SCROLLBAR_PX = 15;
/** E-002: min_line_number_digits default 4. */
export const MIN_LINE_NUMBER_DIGITS = 4;
/** E-003 / E-004: gutter left 3 ch, right 4 ch. */
export const GUTTER_LEFT_CH = 3;
export const GUTTER_RIGHT_CH = 4;

/** Catppuccin Mocha tokens used by the PoC (03-THEME-ICONS value tables). */
export const MOCHA = {
  background: "#1e1e2e", // editor.background
  foreground: "#cdd6f4", // editor.foreground
  lineNumber: "#7f849c", // editor.line_number
  activeLineBackground: "#cdd6f412", // editor.active_line.background (E-011, E-112)
  selection: "#9399b240", // players[0].selection (E-015)
  cursor: "#f5e0dc", // players[0].cursor
  scrollbarThumb: "#585b7080", // scrollbar.thumb.background
  scrollbarTrack: "#11111b", // scrollbar.track.background
} as const;

export const EDITOR_FONT = `${EDITOR_FONT_SIZE}px ${EDITOR_FONT_FAMILY}`;

export interface FontMetrics {
  /** Advance width of "0" (the `ch` of E-003). */
  ch: number;
  /** Absolute font descent (E-005). */
  descent: number;
}

/** Font metrics of the editor font, measured with a canvas. */
export function measureFontMetrics(): FontMetrics {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  ctx.font = EDITOR_FONT;
  const m = ctx.measureText("0");
  return { ch: m.width, descent: Math.abs(m.fontBoundingBoxDescent) };
}

/**
 * Line starts to highlight as the current line (E-011): the line of every
 * empty selection range, unless a non-empty range touches that line.
 */
export function activeLineStarts(state: EditorState): number[] {
  const doc = state.doc;
  const busy: Array<[number, number]> = [];
  for (const r of state.selection.ranges) {
    if (!r.empty) busy.push([doc.lineAt(r.from).number, doc.lineAt(r.to).number]);
  }
  const starts = new Set<number>();
  for (const r of state.selection.ranges) {
    if (!r.empty) continue;
    const line = doc.lineAt(r.head);
    if (busy.some(([a, b]) => line.number >= a && line.number <= b)) continue;
    starts.add(line.from);
  }
  return [...starts].sort((a, b) => a - b);
}

const activeLineDeco = Decoration.line({ class: "zl-activeLine" });

class ActiveLineGutterMarker extends GutterMarker {
  elementClass = "zl-activeLineGutter";
}
const activeLineGutterMarker = new ActiveLineGutterMarker();

const activeLine: Extension = [
  EditorView.decorations.compute(["selection"], (state) =>
    Decoration.set(activeLineStarts(state).map((from) => activeLineDeco.range(from))),
  ),
  gutterLineClass.compute(["selection"], (state) =>
    RangeSet.of(activeLineStarts(state).map((from) => activeLineGutterMarker.range(from))),
  ),
];

function zedTheme(metrics: FontMetrics): Extension {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        color: MOCHA.foreground,
        backgroundColor: MOCHA.background,
      },
      "& .cm-scroller": {
        fontFamily: EDITOR_FONT_FAMILY,
        fontSize: `${EDITOR_FONT_SIZE}px`,
        lineHeight: `${LINE_HEIGHT_PX}px`,
      },
      "& .cm-content": { padding: "0" },
      // E-005: gap between gutter and text = |descent|. Put on the line so the
      // current-line background (E-011) starts right at the gutter edge.
      "& .cm-line": { padding: `0 0 0 ${metrics.descent}px` },
      "& .cm-gutters": {
        backgroundColor: MOCHA.background,
        color: MOCHA.lineNumber,
        border: "none",
      },
      // E-002 (min 4 digits), E-003 (left 3 ch), E-004 (right 4 ch).
      "& .cm-lineNumbers .cm-gutterElement": {
        boxSizing: "content-box",
        minWidth: `${MIN_LINE_NUMBER_DIGITS}ch`,
        padding: `0 ${GUTTER_RIGHT_CH}ch 0 ${GUTTER_LEFT_CH}ch`,
        textAlign: "right",
      },
      "& .zl-activeLine": { backgroundColor: MOCHA.activeLineBackground },
      "& .cm-gutterElement.zl-activeLineGutter": {
        backgroundColor: MOCHA.activeLineBackground,
      },
      // E-015: the selection is drawn by selectionShape() (SVG outline). The
      // rectangle layer of drawSelection() is hidden; drawSelection still
      // draws the cursor and hides the native selection.
      "& .cm-selectionLayer": { display: "none" },
      "& .zl-selectionShape": {
        position: "absolute",
        left: "0",
        top: "0",
        width: "1px",
        height: "1px",
        overflow: "visible",
        pointerEvents: "none",
      },
      "& .cm-cursor, & .cm-dropCursor": { borderLeftColor: MOCHA.cursor },
      // E-030: 15px editor scrollbar.
      "& .cm-scroller::-webkit-scrollbar": {
        width: `${SCROLLBAR_PX}px`,
        height: `${SCROLLBAR_PX}px`,
      },
      "& .cm-scroller::-webkit-scrollbar-track": { backgroundColor: MOCHA.scrollbarTrack },
      "& .cm-scroller::-webkit-scrollbar-thumb": { backgroundColor: MOCHA.scrollbarThumb },
    },
    { dark: true },
  );
}

/** All editor extensions used by the PoC. */
export function zedEditorExtensions(metrics: FontMetrics = measureFontMetrics()): Extension {
  return [
    EditorView.cspNonce.of(cspNonce()),
    lineNumbers(),
    drawSelection(),
    selectionShape({ radius: () => SELECTION_RADIUS_PX, fill: MOCHA.selection }),
    EditorState.allowMultipleSelections.of(true),
    activeLine,
    zedTheme(metrics),
  ];
}

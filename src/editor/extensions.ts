import { EditorState } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { cursorDocEnd, cursorDocStart, history, selectDocEnd, selectDocStart, simplifySelection } from "@codemirror/commands";
import { BUFFER_FONT_FAMILY, EDITOR_TAB_SIZE, EDITOR_UNDO_GROUP_INTERVAL_MS } from "../spec/metrics.ts";

// Metric variables come from applyMetrics() (spec/metrics.ts); color variables come
// from the theme JSON (Phase 2, D-8/D-9) and are unset until then.
const lineHeight =
  "calc(var(--typography-buffer-font-size) * var(--editor-line-height-comfortable-multiplier))";

const zedEditorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontFamily: BUFFER_FONT_FAMILY,
    fontSize: "var(--typography-buffer-font-size)",
    fontWeight: "var(--font-weight-default)", // I-14
    fontFeatureSettings: "normal", // I-14: UI calt setting does not apply to the buffer
    color: "var(--editor-foreground)",
    backgroundColor: "var(--editor-background)",
  },
  ".cm-scroller": {
    fontFamily: "inherit",
    lineHeight, // E-010
  },
  ".cm-scroller::-webkit-scrollbar": {
    width: "var(--scrollbar-width-editor)", // E-030
    height: "var(--scrollbar-width-editor)",
  },
  ".cm-scroller::-webkit-scrollbar-track": {
    background: "var(--scrollbar-track-background)",
  },
  // The corner where both scrollbars meet takes the track color.
  ".cm-scroller::-webkit-scrollbar-corner": {
    background: "var(--scrollbar-track-background)",
  },
  ".cm-scroller::-webkit-scrollbar-thumb": {
    background: "var(--scrollbar-thumb-background)",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    background: "var(--scrollbar-thumb-hover-background)",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:active": {
    background: "var(--scrollbar-thumb-active-background)",
  },
  ".cm-content": { padding: 0 },
  // E-005: margin between gutter and text. It sits inside the line so that the
  // active-line rectangle (E-011) covers it.
  ".cm-line": { padding: "0 0 0 var(--editor-gutter-margin)" },
  ".cm-gutters": {
    backgroundColor: "var(--editor-gutter-background)",
    color: "var(--editor-line-number)",
    "&.cm-gutters-before": { borderRightWidth: 0 },
  },
  // E-002: number width = max(digits, min digits) * ch; I-14: measured Zed padding.
  ".cm-lineNumbers .cm-gutterElement": {
    boxSizing: "content-box",
    minWidth: "calc(var(--editor-gutter-min-line-number-digits) * 1ch)",
    padding:
      "0 var(--editor-gutter-padding-right) 0 var(--editor-gutter-padding-left)",
  },
  // E-011: gutter element + line together span the full editor width.
  ".cm-activeLine": { backgroundColor: "var(--editor-active-line-background)" },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--editor-active-line-background)",
    color: "var(--editor-active-line-number)",
  },
  // E-012: cursor width (drawSelection draws the cursor as a left border).
  ".cm-cursor": { borderLeftWidth: "var(--editor-cursor-width)" },
  // E-015: selection color and corner radius = line height * multiplier.
  ".cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground":
    {
      background: "var(--players-0-selection)",
      borderRadius: `calc(${lineHeight} * var(--editor-selection-corner-radius-multiplier))`,
    },
});

export const editorExtensions = (extension: string) => [
  /^(md|markdown)$/.test(extension) ? EditorView.lineWrapping : [], // I-8: same extensions as Markdown preview
  EditorView.cspNonce.of(document.getElementById("csp-nonce-carrier")?.nonce ?? ""),
  lineNumbers(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  drawSelection(),
  // Column selection yields one range per line; without this CM6 keeps only the main range.
  EditorState.allowMultipleSelections.of(true),
  // E-046: Zed's multi_cursor_modifier defaults to Alt. CM6 would read Ctrl on Windows, which kept the
  // pre-drag cursor as a range in a Ctrl+Shift column drag (and added ranges on Ctrl+click).
  EditorView.clickAddsSelectionRange.of((e) => e.altKey),
  // E-047 (D-11): Ctrl+Shift+drag selects a column from the pointer. Alt+Shift and middle-button drag are out of scope.
  rectangularSelection({ eventFilter: (e) => e.button === 0 && e.ctrlKey && e.shiftKey }),
  EditorState.tabSize.of(EDITOR_TAB_SIZE), // E-055
  history({ newGroupDelay: EDITOR_UNDO_GROUP_INTERVAL_MS }), // E-059c; the keys are the app keymap's editor::Undo / Redo
  // I-051 / I-053: the browser's own Ctrl+Home / End stops where the drawn lines end (CM6 draws only those in view). Like
  // the other cursor keys (I-048 ~ I-055) they are the editor's, not the app keymap's.
  keymap.of([
    { key: "Escape", run: simplifySelection }, // K-33: Zed editor::Cancel (selection_collections.rs try_cancel): a selection collapses to its head, several ranges to the main one
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
  ]),
  zedEditorTheme,
];

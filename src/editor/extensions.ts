import { EditorState } from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { history } from "@codemirror/commands";
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
  // E-002/E-003/E-004: number width = max(digits, min digits) * ch, padded in ch.
  ".cm-lineNumbers .cm-gutterElement": {
    boxSizing: "content-box",
    minWidth: "calc(var(--editor-gutter-min-line-number-digits) * 1ch)",
    padding:
      "0 calc(var(--editor-gutter-padding-right-ch) * 1ch) 0 calc(var(--editor-gutter-padding-left-ch) * 1ch)",
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

export const editorExtensions = [
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
  EditorView.editorAttributes.of({ "data-keymap-context": "Editor" }),
  zedEditorTheme,
];

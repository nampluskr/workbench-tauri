// Zed metrics mirrored from spec/zed-metrics.toml (D-1). Keys are the toml item IDs
// (`section.key`); each becomes a CSS variable `--section-key` with `.`/`_` -> `-`.
const REM_SIZE = 16; // units.rem_size (L-01)
/** L-02: px -> rem is px / rem_size. The only place that converts. */
const rem = (px: number) => `${px / REM_SIZE}rem`;

// Buffer font size stays in px (L-08); every other length goes through rem().
const METRICS: Record<string, string> = {
  "units.rem_size": `${REM_SIZE}px`, // L-01
  "typography.buffer_font_size": "15px", // L-08
  "editor.gutter.min_line_number_digits": "4", // E-002
  "editor.gutter.padding_left_ch": "3", // E-003
  "editor.gutter.padding_right_ch": "4", // E-004
  "editor.line_height.comfortable_multiplier": "1.618", // E-010
  "editor.selection.corner_radius_multiplier": "0.15", // E-015
  "scrollbar.width.editor": rem(15), // E-030
  "titlebar.height": rem(32), // L-21
  "titlebar.window_button.width": rem(36), // L-39
  "titlebar.window_button.height": rem(32), // L-39
  "titlebar.window_button.glyph_size": rem(10), // L-39
  "sidebar.default_width": rem(300), // L-33
  "sidebar.header_height": rem(32), // L-12
  "sidebar.footer.padding": rem(4), // L-35
  "sidebar.footer.gap": rem(4), // L-35
  "sidebar.footer.border_top": rem(1), // L-35
  "sidebar.footer.icon_size": rem(14), // L-35
  "buttons.height.default": rem(22), // L-07
  "window.border_workspace_top": rem(1), // L-301
  "window.border_workspace_bottom": rem(1), // L-301
  "window.border_sidebar_header_bottom": rem(1), // L-302
  "window.border_sidebar_right": rem(1), // L-303
  "window.border_dock_left": rem(1), // L-16
  "project_panel.default_width": rem(240), // L-32 (left Dock content)
  "dock.resize_handle_width": rem(6), // L-30
  "dock.min_width": rem(6), // L-31
  "tab.bar_height": rem(32), // L-22
  "tab.end_buttons_area.gap": rem(4), // L-27
  "tab.end_buttons_area.padding_x": rem(6), // L-27
  "tab.end_buttons_area.border_bottom": rem(1), // L-27
  "tab.end_buttons_area.border_start_right": rem(1), // L-27
  "tab.end_buttons_area.border_end_left": rem(1), // L-27
  "tab.bar_icon_size": rem(14), // L-300
  "tab.border_width": rem(1), // L-63
  "statusbar.height": rem(30), // L-28
  "statusbar.padding_y": rem(4), // L-28
  "statusbar.button_height": rem(22), // L-28
  "statusbar.group_gap": rem(8), // L-29
  "statusbar.item_gap": rem(4), // L-29
  "statusbar.icon_size": rem(14), // L-92
};

// System monospace stand-in; Lilex is out of scope (INTENT).
export const BUFFER_FONT_FAMILY = "Consolas, monospace";

/** Publish the metrics as CSS variables on :root (constructable sheet, no inline style). */
export function applyMetrics(): void {
  const vars = Object.entries(METRICS).map(
    ([id, value]) => `--${id.replace(/[._]/g, "-")}: ${value};`,
  );

  // E-005: gutter margin = |descent| of the buffer font. CSS cannot read it.
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${METRICS["typography.buffer_font_size"]} ${BUFFER_FONT_FAMILY}`;
  const descent = Math.abs(ctx.measureText("0").fontBoundingBoxDescent);
  vars.push(`--editor-gutter-margin: ${descent}px;`);

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`:root { font-size: var(--units-rem-size); ${vars.join(" ")} }`);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

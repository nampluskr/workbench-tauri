// Zed metrics mirrored from spec/zed-metrics.toml (D-1). Keys are the toml item IDs
// (`section.key`); each becomes a CSS variable `--section-key` with `.`/`_` -> `-`.
const REM_SIZE = 16; // units.rem_size (L-01)
/** L-02: px -> rem is px / rem_size. The only place that converts. */
const rem = (px: number) => `${px / REM_SIZE}rem`;

export const PROJECT_PANEL_ITEM_HEIGHT = 26; // project_panel.item.height (L-36); script needs it for the virtual window

// Buffer font size stays in px (L-08); every other length goes through rem().
const METRICS: Record<string, string> = {
  "units.rem_size": `${REM_SIZE}px`, // L-01
  "typography.buffer_font_size": "15px", // L-08
  "typography.size.default": rem(14), // L-05 (label default: tree name, tab title, title bar folder button)
  "editor.gutter.min_line_number_digits": "4", // E-002
  "editor.gutter.padding_left_ch": "3", // E-003
  "editor.gutter.padding_right_ch": "4", // E-004
  "editor.line_height.comfortable_multiplier": "1.618", // E-010
  "editor.cursor_width": rem(2), // E-012
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
  "icons.size.medium": rem(16), // L-06 (project panel file and folder icons; L-40 itself is not judged)
  "project_panel.item.height": rem(PROJECT_PANEL_ITEM_HEIGHT), // L-36 (comfortable)
  "project_panel.item.content_height": rem(24), // L-36
  "project_panel.item.border_width": rem(1), // L-48
  "project_panel.item.border_right_width": rem(2), // L-48
  "project_panel.item.padding_x": rem(6), // L-37
  "project_panel.item.gap": rem(4), // L-37
  "project_panel.indent_step": rem(20), // L-37
  "project_panel.indent_guide.width": rem(1), // L-38
  "project_panel.indent_guide.offset_x": rem(15), // L-38
  "project_panel.indent_guide.padding_y": rem(4), // L-38
  "project_panel.collapsed_path.padding_x": rem(2), // L-43
  "dock.resize_handle_width": rem(6), // L-30
  "dock.min_width": rem(6), // L-31
  "tab.bar_height": rem(32), // L-22
  "tab.end_buttons_area.gap": rem(4), // L-27
  "tab.end_buttons_area.padding_x": rem(6), // L-27
  "tab.end_buttons_area.border_bottom": rem(1), // L-27
  "tab.end_buttons_area.border_start_right": rem(1), // L-27
  "tab.end_buttons_area.border_end_left": rem(1), // L-27
  "tab.bar_icon_size": rem(14), // L-300
  "inline_input.height": rem(24), // P-019
  "inline_input.border_top_bottom_left": rem(1), // P-020
  "inline_input.border_right": rem(2), // P-020
  "inline_input.banner.padding_y": rem(4), // P-021
  "inline_input.banner.padding_x": rem(8), // P-021
  "inline_input.banner.border": rem(1), // P-021
  "tab.border_width": rem(1), // L-63
  "tab.content_height": rem(31), // L-23
  "tab.padding_x": rem(4), // L-24
  "tab.gap": rem(4), // L-24
  "tab.active_padding_bottom": rem(1), // L-63
  "statusbar.height": rem(30), // L-28
  "statusbar.padding_y": rem(4), // L-28
  "statusbar.button_height": rem(22), // L-28
  "statusbar.group_gap": rem(8), // L-29
  "statusbar.item_gap": rem(4), // L-29
  "statusbar.icon_size": rem(14), // L-92
  "tooltip.transparent_margin_left": rem(8), // L-209
  "tooltip.transparent_margin_top": rem(10), // L-209
  "tooltip.corner_radius": rem(8), // L-211
  "tooltip.border_width": rem(1), // L-211
  "tooltip.shadow.1.offset_y": rem(2), // L-212
  "tooltip.shadow.1.blur": rem(3), // L-212
  "tooltip.shadow.1.color": "#000000", // L-212
  "tooltip.shadow.1.alpha": "0.12", // L-212
  "tooltip.shadow.2.offset_y": rem(1), // L-212
  "tooltip.shadow.2.blur": rem(0), // L-212
  "tooltip.shadow.2.color": "#000000", // L-212
  "tooltip.shadow.2.alpha_light": "0.03", // L-212
  "tooltip.shadow.2.alpha_dark": "0.06", // L-212
  "tooltip.padding_y": rem(4), // L-213
  "tooltip.padding_x": rem(8), // L-213
  "tooltip.font_size": rem(14), // L-214
  "tooltip.title.max_width": rem(288), // L-215, also the meta line's max width (L-216)
  "tooltip.title.shortcut_gap": rem(16), // L-215
  "tooltip.meta.font_size": rem(12), // L-216
  "tooltip.shortcut.padding_x": rem(2), // L-222
  "tooltip.shortcut.padding_y": rem(2), // L-222
  "tooltip.shortcut.chord_gap": rem(4), // L-222
  "tooltip.multi.row_gap": rem(4), // L-232
  "tooltip.multi.separator_padding_top": rem(4), // L-232
  "tooltip.multi.separator_border_width": rem(1), // L-232
  "tooltip.multi.title_shortcut_gap": rem(8), // L-232
  "titlebar.padding_left": rem(8), // L-82
  "titlebar.left_group.gap": rem(2), // L-87
  "sidebar.item_row.height": rem(31), // L-34
  "sidebar.project_header.padding_left": rem(8), // L-34
  "sidebar.project_header.padding_right": rem(6), // L-34
  "sidebar.item.icon_size": rem(14), // A-12.1
  "sidebar.item.focus_border_width": rem(1), // A-12.5
  "menu.min_width": rem(200), // I-313 (inside the borders; menu.min_outer_width = 202 is this plus the two borders)
  "menu.max_height_ratio": "0.75", // I-313
  "menu.border_width": rem(1), // I-315
  "menu.corner_radius": rem(8), // I-315
  "menu.list_padding_y": rem(4), // I-315
  "menu.item.margin_x": rem(4), // I-316
  "menu.item.padding_x": rem(6), // I-316
  "menu.item.shortcut_min_gap": rem(16), // I-316
  "menu.item.shortcut_chord_gap": rem(4), // L-221
  "menu.item.font_size": rem(14), // I-317
  "menu.item.line_height": rem(22.652), // I-317
  "menu.separator.height": rem(1), // I-318
  "menu.separator.margin_y": rem(6), // I-318
  "menu.app_menu_button.icon_size": rem(14), // I-321
  "menu.horizontal.item_font_size": rem(12), // I-321
  "menu.horizontal.item_gap": rem(4), // I-321
};

// Tooltip values that script reads (the rest above reach CSS only).
export const TOOLTIP_DELAY_MS = 500; // tooltip.delay_default (L-206)
export const TOOLTIP_CURSOR_OFFSET = { x: 1, y: 1 }; // tooltip.cursor_offset_x / _y (L-208)

// Sidebar and state values that script reads.
export const SIDEBAR_WIDTH = { default: 300, min: 200, max: 800 }; // sidebar.default_width / min_width / max_width (L-33)
export const STATE_SAVE_DEBOUNCE_MS = 500; // app.state_save_debounce (A-24.2)
export const PROJECT_NAME_MAX_CHARS = 40; // titlebar.project_name.max_chars (L-88)

// Project panel and tab values that script reads.
export const PROJECT_PANEL_NAME_TOOLTIP_DELAY_MS = 1500; // project_panel.name_tooltip_delay (L-49)
export const TREE_OVERSCAN_ROWS = 10; // rows drawn beyond the visible range on each side (D-9)
export const PANE_MAX_PREVIEW_TABS = 1; // pane.max_preview_tabs (I-062)
export const TAB_MAX_TITLE_CHARS = 24; // tab.max_title_chars (L-26)

// Menu values that script reads.
export const MENU_POPUP_OFFSET = { x: -5, y: 0 }; // menu.popup_offset_x / _y (I-314)
export const MENU_KEYBOARD_OFFSET = { x: 2, y: 2 }; // menu.context.keyboard_offset_x / _y (I-502)
export const MENU_WINDOW_MARGIN = 8; // menu.context.window_margin (I-314, I-501)
export const MENU_SHORTCUT_ACTIVATE_DELAY_MS = 50; // menu.shortcut_activate_delay (I-520)

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

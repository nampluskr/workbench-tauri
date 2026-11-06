// Zed metrics mirrored from spec/zed-metrics.toml (D-1). Keys are the toml item IDs
// (`section.key`); each becomes a CSS variable `--section-key` with `.`/`_` -> `-`.
const REM_SIZE = 16; // units.rem_size (L-01)
/** L-02: px -> rem is px / rem_size. The only place that converts. */
const rem = (px: number) => `${px / REM_SIZE}rem`;

export const PROJECT_PANEL_ITEM_HEIGHT = 26; // project_panel.item.height (L-36); script needs it for the virtual window

// Buffer font size stays in px (L-08); every other length goes through rem().
const METRICS: Record<string, string> = {
  "units.rem_size": `${REM_SIZE}px`, // L-01
  "typography.ui_font_size": rem(16), // L-08
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
  "pane.split_line_thickness": rem(1), // I-725
  "pane.split_line_mouse_hitbox": rem(4), // I-725
  "pane.directional_drop_overlay_ratio": "0.5", // I-714
  "pane.tab_drop_line_width": rem(2), // I-715
  "pane.tab_bar_end_drop_min_width": rem(24), // I-716
  "pane.zoomed_padding": rem(8), // L-17
  "pane.zoomed_border": rem(1), // L-17
  "toolbar.padding_y": rem(6), // E-038
  "toolbar.padding_x": rem(8), // E-038
  "toolbar.border_bottom": rem(1), // E-038
  "toolbar.min_height": rem(32), // E-038
  "toolbar.quick_actions_gap": rem(1), // E-038
  "markdown_preview.max_width": rem(800), // L-101
  "markdown_preview.container_padding": rem(16), // L-102
  "markdown_preview.body.font_size": rem(16), // L-103
  "markdown_preview.body.line_height_multiplier": "1.5", // L-103
  "markdown_preview.paragraph_gap": rem(16), // L-103
  "markdown_preview.list_gap": rem(12), // L-103
  "markdown_preview.heading.font_weight": "600", // L-104
  "markdown_preview.heading.line_height_multiplier": "1.25", // L-104
  "markdown_preview.h1.font_size": rem(28), // L-104
  "markdown_preview.h2.font_size": rem(22.4), // L-104
  "markdown_preview.h3.font_size": rem(19.2), // L-104
  "markdown_preview.h4.font_size": rem(16), // L-104
  "markdown_preview.h5.font_size": rem(14), // L-104
  "markdown_preview.h6.font_size": rem(13.6), // L-104
  "markdown_preview.h1.padding_bottom": rem(8), // L-105
  "markdown_preview.h1.border_bottom": rem(1), // L-105
  "markdown_preview.h2.padding_bottom": rem(4), // L-105
  "markdown_preview.h2.border_bottom": rem(1), // L-105
  "markdown_preview.blockquote.padding_left": rem(16), // L-106
  "markdown_preview.blockquote.border_left": rem(4), // L-106
  "markdown_preview.table.border_outer": rem(1.5), // L-107
  "markdown_preview.table.corner_radius": rem(4), // L-107
  "markdown_preview.table.cell_padding_x": rem(10), // L-107
  "markdown_preview.table.cell_padding_y": rem(4), // L-107
  "markdown_preview.table.cell_border": rem(1), // L-107
  "markdown_preview.table.header_font_weight": "600", // L-107
  "markdown_preview.link.underline_width": rem(1), // L-108
  "markdown_preview.link.underline_opacity": "0.5", // L-108
  "markdown_preview.inline_code.font_size": rem(14), // L-109
  "markdown_preview.inline_code.background_opacity": "0.08", // L-109
  "markdown_preview.code_block.padding": rem(12), // L-109
  "markdown_preview.code_block.margin_y": rem(16), // L-109
  "markdown_preview.code_block.corner_radius": rem(6), // L-109
  "markdown_preview.frontmatter.border": rem(1), // L-111
  "markdown_preview.frontmatter.corner_radius": rem(4), // L-111
  "markdown_preview.frontmatter.key_cell_font_weight": "600", // L-111
  "markdown_preview.frontmatter.value_border_left": rem(1), // L-111
  "markdown_preview.frontmatter.row_border_top": rem(1), // L-111
  "tab.start_slot.width": rem(12), // L-25 (modified dot)
  "tab.start_slot.height": rem(12), // L-25
  "tab.end_slot.width": rem(14), // L-25 (close button)
  "tab.end_slot.height": rem(14), // L-25
  "tab.indicator_size": rem(10), // L-65
  "icons.size.small": rem(14), // L-06 (tab close icon, L-66)
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
export const PANE_MIN_DRAG = { w: 80, h: 100 }; // pane.min_drag_width / min_drag_height (I-726)
export const PANE_DROP_TARGET_SIZE_RATIO = 0.2; // pane.drop_target_size_ratio (I-712)
export const MARKDOWN_PREVIEW_PARSE_DEBOUNCE_MS = 200; // markdown_preview.parse_debounce (I-082)

// Editor values that script reads.
export const EDITOR_TAB_SIZE = 4; // editor.tab_size (E-055)
export const EDITOR_UNDO_GROUP_INTERVAL_MS = 300; // editor.undo.group_interval (E-059c)
export const CONFIRM_CLOSE_PATH_MAX_CHARS = 80; // editor.confirm_close.path_max_chars (E-081)

// Menu values that script reads.
export const MENU_POPUP_OFFSET = { x: -5, y: 0 }; // menu.popup_offset_x / _y (I-314)
export const MENU_KEYBOARD_OFFSET = { x: 2, y: 2 }; // menu.context.keyboard_offset_x / _y (I-502)
export const MENU_WINDOW_MARGIN = 8; // menu.context.window_margin (I-314, I-501)
export const MENU_SHORTCUT_ACTIVATE_DELAY_MS = 50; // menu.shortcut_activate_delay (I-520)

// I-14: bundled Zed families; DirectWrite maps Korean to Malgun Gothic on this PC.
const UI_FONT_FAMILY = '"IBM Plex Sans", "Malgun Gothic", sans-serif';
export const BUFFER_FONT_FAMILY = '"Lilex", "Malgun Gothic", monospace';
const FONT_WEIGHT = 400; // I-14: default UI and buffer weight
const UI_FONT_FEATURE_SETTINGS = '"calt" 0'; // I-14: disable UI contextual alternates

/** Publish the metrics as CSS variables on :root (constructable sheet, no inline style). */
export async function applyMetrics(): Promise<void> {
  const vars = Object.entries(METRICS).map(
    ([id, value]) => `--${id.replace(/[._]/g, "-")}: ${value};`,
  );

  // E-005: gutter margin = |descent| of the buffer font. CSS cannot read it.
  await document.fonts.load(`${FONT_WEIGHT} ${METRICS["typography.buffer_font_size"]} "Lilex"`);
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${METRICS["typography.buffer_font_size"]} ${BUFFER_FONT_FAMILY}`;
  const descent = Math.abs(ctx.measureText("0").fontBoundingBoxDescent);
  vars.push(`--editor-gutter-margin: ${descent}px;`);
  vars.push(`--buffer-font-family: ${BUFFER_FONT_FAMILY};`); // L-103: code in the Markdown preview uses the buffer font
  vars.push(`--ui-font-family: ${UI_FONT_FAMILY};`);
  vars.push(`--font-weight-default: ${FONT_WEIGHT};`);
  vars.push(`--ui-font-feature-settings: ${UI_FONT_FEATURE_SETTINGS};`);

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`:root { font-size: var(--units-rem-size); ${vars.join(" ")} }`);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

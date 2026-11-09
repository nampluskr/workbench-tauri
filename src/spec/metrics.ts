// Zed metrics mirrored from spec/zed-metrics.toml (D-1). Keys are the toml item IDs
// (`section.key`); each becomes a CSS variable `--section-key` with `.`/`_` -> `-`.
const REM_SIZE = 16; // units.rem_size (L-01)
/** L-02: px -> rem is px / rem_size. The only place that converts. */
const rem = (px: number) => `${px / REM_SIZE}rem`;

export const PROJECT_PANEL_ITEM_HEIGHT = 26; // project_panel.item.height (L-36); script needs it for the virtual window
export const PROJECT_PANEL_DEFAULT_WIDTH = 240; // project_panel.default_width (L-32)
export const DOCK_MIN_WIDTH = 6; // dock.min_width (L-31), also used by Sidebar (core I-11)

// Buffer font size (L-08) and measured gutter padding stay in px; other lengths go through rem().
const METRICS: Record<string, string> = {
  "dialog.about.width": rem(440), // P-018
  "dialog.about.height": rem(300), // P-018
  "dialog.about.padding": rem(16), // P-018
  "dialog.about.gap": rem(16), // P-018
  "extensions.header.padding_top": rem(16), // X-45
  "extensions.header.padding_x": rem(16), // X-45
  "extensions.header.row_gap": rem(16), // X-45
  "extensions.search_input.height": rem(32), // X-46
  "extensions.search_input.min_width": rem(384), // X-46
  "extensions.search_input.padding_left": rem(6), // X-46
  "extensions.search_input.padding_right": rem(8), // X-46
  "extensions.search_input.gap": rem(8), // X-46
  "extensions.search_input.border": rem(1), // X-46
  "extensions.search_input.corner_radius": rem(6), // X-46
  "extensions.search_input.font_size": rem(14), // X-46
  "extensions.search_input.line_height_multiplier": "1.3", // X-46
  "extensions.category_bar.gap": rem(8), // X-48
  "extensions.category_bar.padding_y": rem(10), // X-48
  "extensions.category_bar.padding_x": rem(16), // X-48
  "extensions.category_bar.border_bottom": rem(1), // X-48
  "extensions.list.padding_x": rem(16), // X-49
  "extensions.list.padding_bottom": rem(16), // X-49
  "extensions.card.margin_top": rem(16), // X-49
  "extensions.card.height": rem(110), // X-49
  "extensions.card.padding": rem(12), // X-49
  "extensions.card.gap_y": rem(8), // X-49
  "extensions.card.border": rem(1), // X-49
  "extensions.card.corner_radius": rem(6), // X-49
  "keymap_editor.padding": rem(8), // K-010
  "keymap_editor.gap_vertical": rem(4), // K-010
  "keymap_editor.top_row.gap": rem(8), // K-011
  "keymap_editor.search_input.height": rem(32), // K-012
  "keymap_editor.search_input.padding_x": rem(8), // K-012
  "keymap_editor.search_input.border": rem(1), // K-012
  "keymap_editor.search_input.corner_radius": rem(6), // K-012
  "keymap_editor.button_group.gap": rem(4), // K-013
  "keymap_editor.button_group.min_width": rem(320), // K-013
  "keymap_editor.table.icon_column_width": rem(36), // K-022
  "keymap_editor.table.ratio_action": "0.25", // K-022
  "keymap_editor.table.ratio_arguments": "0.20", // K-022
  "keymap_editor.table.ratio_keystrokes": "0.14", // K-022
  "keymap_editor.table.ratio_context": "0.45", // K-022
  "keymap_editor.table.ratio_source": "0.08", // K-022
  "keymap_editor.row.border_width": rem(2), // K-030
  "keymap_editor.icon_column_button.size": rem(18), // K-036
  "keymap_editor.keystroke_input.padding_x": rem(12), // K-050
  "keymap_editor.keystroke_input.gap": rem(8), // K-050
  "keymap_editor.keystroke_input.min_height": rem(40), // K-050
  "keymap_editor.keystroke_input.corner_radius": rem(6), // K-050
  "keymap_editor.keystroke_input.border": rem(1), // K-050
  "keymap_editor.modal.width": rem(544), // K-080
  "keymap_editor.modal.body_gap": rem(10), // K-082
  "keymap_editor.modal.footer_gap": rem(4), // K-083
  "titlebar.user_menu.button_width": rem(22), // I-608
  "titlebar.right_group.gap": rem(4), // L-89 / I-603: user menu to native window buttons.
  "titlebar.user_menu.button_height": rem(22), // I-608
  "titlebar.user_menu.button_icon_size": rem(14), // I-601
  "titlebar.user_menu.button_corner_radius": rem(4), // I-609
  // picker.* and picker.theme_selector.*: spec/zed-metrics.toml [picker] (P-001..P-004, P-010)
  "picker.modal_top_offset": rem(80), // P-001
  "picker.default_width": rem(544), // P-002 (theme_selector.width is the same 544)
  "picker.default_max_height": rem(384), // P-002
  "picker.max_width_ratio": "0.95", // P-002
  "picker.max_height_ratio": "0.95", // P-002
  "picker.corner_radius": rem(8), // P-002
  "picker.border_width": rem(1), // P-002
  "picker.input_divider_width": rem(1), // P-003
  "picker.input_row.height": rem(36), // P-003
  "picker.input_row.padding_x": rem(10), // P-003
  "picker.input_row.gap": rem(4), // P-003
  "picker.list.padding_y": rem(4), // P-004
  "picker.item.margin_x": rem(4), // P-004
  "picker.item.padding_x": rem(6), // P-004
  "picker.item.padding_y": rem(4), // P-004
  "picker.item.corner_radius": rem(4), // P-004
  "picker.item.gap": rem(4), // P-004
  "picker.theme_selector.footer_padding": rem(8), // P-010
  "picker.theme_selector.footer_border_top": rem(1), // P-010
  "picker.window_height_margin": rem(160), // P-002
  "picker.shadow.1": "0 2px 3px rgba(0,0,0,0.12)", // P-002
  "picker.shadow.2": "0 4px 8px rgba(0,0,0,0.08)", // P-002
  "picker.shadow.3": "0 8px 16px rgba(0,0,0,0.04)", // P-002
  "picker.shadow.4": "0 12px 24px rgba(0,0,0,0.12)", // P-002
  "picker.item.font_size": rem(14), // P-004
  "picker.item.line_height_ratio": "1.618", // P-004
  "picker.empty.padding_y": rem(8), // P-004
  "picker.theme_selector.check_icon_size": rem(16), // P-010
  "units.rem_size": `${REM_SIZE}px`, // L-01
  "typography.ui_font_size": rem(16), // L-08
  "typography.buffer_font_size": "15px", // L-08
  "typography.size.default": rem(14), // L-05 (label default: tree name, tab title, title bar folder button)
  "typography.size.small": rem(12), // L-05 (SettingsSectionHeader LabelSize::Small)
  "typography.size.large": rem(16), // L-05 (Project Search landing title, LabelSize::Large)
  "buttons.padding_x.large_medium": rem(8), // L-07 (Settings dropdown ButtonSize::Medium)
  "buttons.gap": rem(4), // L-07
  "settings.search.padding_left": rem(6), // L-10 / Zed 4304dec732 settings_ui.rs render_search pl_1p5
  "settings.search.padding_right": rem(2), // L-10 / render_search pr_0p5
  "settings.search.gap": rem(6), // L-10 / render_search gap_1p5
  "settings.control.corner_radius": rem(4), // L-10 rounded_sm; Zed ButtonLike and render_search
  "editor.gutter.min_line_number_digits": "4", // E-002
  "editor.search_bar.gap": rem(8), // E-061
  // Project Search (K-32): toml IDs (`editor.search_input.max_width`, `[search_results]`), sources are in the toml.
  "editor.search_input.max_width": rem(1200), // toml; Zed ui/src/utils/search_input.rs MAX_WIDTH
  "search_results.header.padding": rem(4), // toml; editor.rs:303 BUFFER_HEADER_PADDING
  "search_results.header.padding_left": rem(4), // toml; header.rs `.pl_1()`
  "search_results.header.padding_right": rem(8), // toml; header.rs `.pr_2()`
  "search_results.header.gap": rem(6), // toml; header.rs `.gap_1p5()`
  "search_results.header.radius": rem(2), // toml; header.rs `.rounded_sm()`
  "search_results.header.lines": "2", // toml; editor.rs:302 FILE_HEADER_HEIGHT, in buffer lines
  "editor.search_input.min_height": rem(32), // E-062
  "editor.search_input.padding_left": rem(8), // E-062
  "editor.search_input.padding_right": rem(4), // E-062
  "editor.search_input.border": rem(1), // E-062
  "editor.search_input.corner_radius": rem(6), // E-062
  "editor.search_input.font_size": rem(14), // E-063
  // shortcut: gutter padding measured at Lilex 15, remeasure if the buffer font or size changes.
  "editor.gutter.padding_left": "22px", // I-14: Zed measured 2026-11-07, replaces E-003 3ch
  "editor.gutter.padding_right": "29px", // I-14: Zed measured 2026-11-07, replaces E-004 4ch
  "editor.line_height.comfortable_multiplier": "1.618", // E-010
  "editor.cursor_width": rem(2), // E-012
  "editor.selection.corner_radius_multiplier": "0.15", // E-015
  "scrollbar.width.editor": rem(15), // E-030
  "scrollbar.width.ui": rem(6), // L-308; gpui-base/src/scrollbar.rs:25 THUMB_WIDTH (R-8)
  "scrollbar.padding": rem(4), // L-308; gpui-base/src/scrollbar.rs:27 THUMB_INSET
  // R-8 gpui sources: D:/projects/workbench-gpui/vendor/gpui-base/src/scrollbar.rs (no matching toml IDs).
  "scrollbar.thumb.active_width": rem(8), // :29 THUMB_ACTIVE_WIDTH; hover and drag
  "scrollbar.thumb.min_length": rem(48), // :23 MIN_THUMB_SIZE; painted length excludes both insets (:1225)
  // gpui-component-0.8.1/src/theme/mod.rs:422,433,443,774 sets radius 6; Base clamps to half the painted width (:40-43).
  "scrollbar.thumb.radius": rem(6),
  "titlebar.height": "32px", // L-21: Windows caption stays fixed when UI font size changes.
  "titlebar.window_button.width": "36px", // L-39 / A-32.2
  "titlebar.window_button.height": "32px", // L-39 / A-32.2
  "titlebar.window_button.glyph_size": "10px", // L-39 / A-32.2
  "titlebar.window_button.close.hover_background": "#E81120", // L-84
  "titlebar.window_button.close.hover_foreground": "#FFFFFF", // L-84
  "titlebar.window_button.close.active_opacity": "0.8", // L-84: the pressed button shows both colours at 80%
  "sidebar.default_width": rem(300), // L-33
  "sidebar.header_height": "32px", // L-12: aligned with the fixed Windows caption.
  "sidebar.footer.padding": rem(4), // L-35
  "sidebar.footer.gap": rem(4), // L-35
  "sidebar.footer.border_top": rem(1), // L-35
  "sidebar.footer.icon_size": rem(14), // L-35
  "buttons.height.default": rem(22), // L-07
  "buttons.padding_x.default_compact": rem(4), // L-07
  "window.border_workspace_top": rem(1), // L-301
  "window.border_workspace_bottom": rem(1), // L-301
  "window.border_sidebar_header_bottom": rem(1), // L-302
  "window.border_sidebar_right": rem(1), // L-303
  "window.border_dock_left": rem(1), // L-16
  "project_panel.default_width": rem(PROJECT_PANEL_DEFAULT_WIDTH), // L-32 (left Dock content)
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
  // No toml ID yet (K-53): Zed markdown.rs:272-279 border_widths 1px solid border_variant; requested for registration.
  "markdown_preview.code_block.border": rem(1),
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
  "icons.size.xsmall": rem(12), // L-06 (Project Search excerpt expand arrows)
  "statusbar.height": rem(30), // L-28
  "statusbar.padding_y": rem(4), // L-28
  "statusbar.padding_x": rem(4), // Zed status_bar.rs:153 `.p(Base04)` pads all four sides (toml statusbar.padding_x)
  "statusbar.toggle_gap": rem(2), // Zed status_bar.rs:280-287 `gap_0p5` between the sidebar toggle and its divider (toml statusbar.toggle_gap)
  "statusbar.button_height": rem(22), // L-28
  "statusbar.group_gap": rem(8), // L-29
  "statusbar.item_gap": rem(4), // L-29
  "statusbar.icon_size": rem(14), // L-92
  "statusbar.cursor_position.font_size": rem(12), // L-97
  "statusbar.left_divider.width": rem(1), // measured Zed 4304dec 2026-11-07
  "statusbar.left_divider.height": rem(16), // measured Zed 4304dec 2026-11-07
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
  // toml [sidebar] IDs since the K-57 spec sync (same values as K-44 measured; sources in the toml, W-45).
  "sidebar.item.border_right_width": rem(2), // crates/sidebar/src/sidebar.rs:2415-2416 border_1 / border_r_2
  "sidebar.item.separator_width": rem(1), // crates/sidebar/src/sidebar.rs:2297-2299 border_t_1
  "sidebar.item.icon_slot_size": rem(16), // crates/ui/src/components/ai/thread_item.rs:291 icon_container size_4
  "sidebar.item.icon_gap": rem(6), // crates/ui/src/components/ai/thread_item.rs:461 content gap_1p5
  "sidebar.item.font_size": rem(14), // Temporary (K-51): Zed sidebar.rs:2377 Label default; crates/ui/src/styles/typography.rs:139,152 TextSize::Default
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
export const KEYMAP_RECORD_MAX_STROKES = 3; // keymap_editor.record.max_keystrokes (K-055)

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
export const USER_MENU_POPUP_OFFSET = { x: 5, y: 0 }; // titlebar.user_menu.popup_offset_x / _y (I-611)
export const MENU_KEYBOARD_OFFSET = { x: 2, y: 2 }; // menu.context.keyboard_offset_x / _y (I-502)
export const MENU_WINDOW_MARGIN = 8; // menu.context.window_margin (I-314, I-501)
export const MENU_SHORTCUT_ACTIVATE_DELAY_MS = 50; // menu.shortcut_activate_delay (I-520)
export const SETTINGS_DROPDOWN_OFFSET_Y = 2; // L-10 / Zed 4304dec732 components/dropdown.rs offset y=2px.

// I-14: bundled Zed families; DirectWrite maps Korean to Malgun Gothic on this PC.
const UI_FONT_FAMILY = '"IBM Plex Sans", "Malgun Gothic", sans-serif';
export const BUFFER_FONT_FAMILY = '"Lilex", "Malgun Gothic", monospace';
const FONT_WEIGHT = 400; // I-14: default UI and buffer weight
const UI_FONT_FEATURE_SETTINGS = '"calt" 0'; // I-14: disable UI contextual alternates

/** Publish the metrics as CSS variables on :root (constructable sheet, no inline style). */
let metricsSheet: CSSStyleSheet | undefined;
export async function applyMetrics(uiFontSize = 16, bufferFontSize = 15): Promise<void> {
  const bufferSize = `${bufferFontSize}px`;
  const vars = Object.entries(METRICS).map(
    ([id, value]) => `--${id.replace(/[._]/g, "-")}: ${value};`,
  );

  // E-005: gutter margin = |descent| of the buffer font. CSS cannot read it.
  await document.fonts.load(`${FONT_WEIGHT} ${bufferSize} "Lilex"`);
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${bufferSize} ${BUFFER_FONT_FAMILY}`;
  const descent = Math.abs(ctx.measureText("0").fontBoundingBoxDescent);
  vars.push(`--editor-gutter-margin: ${descent}px;`);
  vars.push(`--buffer-font-family: ${BUFFER_FONT_FAMILY};`); // L-103: code in the Markdown preview uses the buffer font
  vars.push(`--ui-font-family: ${UI_FONT_FAMILY};`);
  vars.push(`--font-weight-default: ${FONT_WEIGHT};`);
  vars.push(`--ui-font-feature-settings: ${UI_FONT_FEATURE_SETTINGS};`);

  vars.push(`--units-rem-size: ${uiFontSize}px; --typography-ui-font-size: ${uiFontSize}px; --typography-buffer-font-size: ${bufferSize};`);
  metricsSheet ??= new CSSStyleSheet();
  metricsSheet.replaceSync(`:root { font-size: var(--units-rem-size); ${vars.join(" ")} }`);
  if (!document.adoptedStyleSheets.includes(metricsSheet)) document.adoptedStyleSheets = [...document.adoptedStyleSheets, metricsSheet];
}

// I-16: Zed scrolls the tab row by (wheel lines x window line height) per wheel event (gpui div.rs:3404 pixel_delta, events.rs:578);
// a notch of the default 3 lines moves it about 78px (zed-wheel-down*.png). Chromium reports that notch as deltaY 100.
export const WHEEL_PIXELS_PER_LINE = 100 / 3;
export const UI_LINE_HEIGHT_RATIO = 1.618; // gpui TextStyle line_height phi(), as picker.item.line_height_ratio (P-004)

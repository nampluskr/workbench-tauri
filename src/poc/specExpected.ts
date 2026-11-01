// Expected values for the Phase 1 checks, written from the SPEC / 01-zed text
// on purpose and NOT imported by the implementation (review P1-1 #5): if the
// implementation constants drift, the probe still compares against the spec.

/** A-31.1: dimension tolerance. */
export const TOLERANCE_PX = 1;

/** L-08: buffer font size 15px. */
export const FONT_SIZE_PX = 15;
/** E-010: "15px에서 24.27px" (15 x 1.618). */
export const LINE_HEIGHT_PX = 24.27;
/** E-015: "24.27px에서 3.64px" (0.15 x line height). */
export const SELECTION_RADIUS_PX = 3.64;
/** E-015: inner corners of a multi-line selection use twice the radius. */
export const SELECTION_INNER_RADIUS_PX = 2 * 3.64;
/** E-030: editor scrollbar 15px. */
export const SCROLLBAR_PX = 15;
/** E-002: min_line_number_digits default 4. */
export const MIN_LINE_NUMBER_DIGITS = 4;
/** E-003: gutter left padding 3 ch. */
export const GUTTER_LEFT_CH = 3;
/** E-004: gutter right padding 4 ch (folds + line numbers). */
export const GUTTER_RIGHT_CH = 4;

/** Catppuccin Mocha values (01-zed 03-THEME-ICONS value tables). */
export const MOCHA_ACTIVE_LINE_BACKGROUND = "#cdd6f412"; // E-011 editor_active_line_background
export const MOCHA_PLAYER0_SELECTION = "#9399b240"; // E-015 players[0].selection

/** IDs that every R-2 measurement must report (SPEC R-2 table). */
export const REQUIRED_R2_IDS = [
  "E-002",
  "E-003",
  "E-004",
  "E-005",
  "E-010",
  "E-011",
  "E-015",
  "E-030",
] as const;

import { EDITOR_FONT_SIZE_MAX, EDITOR_FONT_SIZE_MIN, EDITOR_FONT_SIZE_STEP } from "../spec/metrics.ts";

/** U-17: next editor font size. direction 0 is reset: back to the `buffer_font_size` setting (`base`). */
export const stepEditorFontSize = (current: number, direction: -1 | 0 | 1, base: number): number =>
  direction === 0 ? base : Math.min(EDITOR_FONT_SIZE_MAX, Math.max(EDITOR_FONT_SIZE_MIN, current + direction * EDITOR_FONT_SIZE_STEP));

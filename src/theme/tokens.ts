// v0.1 target tokens (fixed in PROGRESS Phase 2 from 03-THEME-ICONS 1.3절 T-40)
// and the T-26 fallback rules that apply to them.

export const TARGET_TOKENS = [
  "background",
  "border",
  "border.variant",
  "ghost_element.hover",
  "ghost_element.active",
  "text",
  "title_bar.background",
  "title_bar.inactive_background",
  "status_bar.background",
  "tab_bar.background",
  "tab.active_background",
  "tab.inactive_background",
  "panel.background",
  "scrollbar.thumb.background",
  "scrollbar.thumb.hover_background",
  "scrollbar.thumb.active_background",
  "scrollbar.thumb.border",
  "scrollbar.track.background",
  "scrollbar.track.border",
  "editor.background",
  "editor.foreground",
  "editor.gutter.background",
  "editor.line_number",
  "editor.active_line_number",
  "editor.active_line.background",
  "players[0].cursor",
  "players[0].selection",
] as const;

export type TargetToken = (typeof TARGET_TOKENS)[number];

/** A T-26 rule: the value used when the JSON has no value (absent or null). */
export interface FallbackRule {
  id: string;
  /** Another token to copy, or a fixed color. */
  from: { token: string } | { color: string };
}

/** 03-THEME-ICONS 1.2절, rows that apply to TARGET_TOKENS. */
export const FALLBACKS: Partial<Record<TargetToken, FallbackRule>> = {
  // T-26.3: scrollbar.thumb.active_background <- scrollbar.thumb.background
  "scrollbar.thumb.active_background": { id: "T-26.3", from: { token: "scrollbar.thumb.background" } },
  // T-26.8: scrollbar.thumb.border <- fallback theme #3b3d45
  "scrollbar.thumb.border": { id: "T-26.8", from: { color: "#3b3d45" } },
};

/** CSS custom property for a token, e.g. "title_bar.background" -> "--zl-title_bar-background". */
export function cssVar(token: string): string {
  return "--zl-" + token.replace(/\[(\d+)\]/g, "-$1").replace(/\./g, "-");
}

export function varRef(token: TargetToken): string {
  return `var(${cssVar(token)})`;
}

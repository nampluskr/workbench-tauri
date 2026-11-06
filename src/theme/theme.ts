// Theme JSON -> T-26 fallbacks -> CSS variables (03-tauri R-11, SPEC R-7).

export type Rgba = { r: number; g: number; b: number; a: number }; // all 0..255

/** T-01.7: "#RRGGBB" (alpha 255) or "#RRGGBBAA". */
export function parseColor(value: string): Rgba {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(value);
  if (!m) throw new Error(`bad theme color: ${value}`);
  const [r, g, b, a] = [m[1], m[2], m[3], m[4] ?? "ff"].map((h) => parseInt(h, 16));
  return { r, g, b, a };
}

/** Canonical lowercase "#rrggbbaa" (CSS accepts it). */
export function formatColor({ r, g, b, a }: Rgba): string {
  return "#" + [r, g, b, a].map((n) => n.toString(16).padStart(2, "0")).join("");
}

// R-7 target tokens (PROGRESS Phase 2 table 1). Keys outside T-40 are never used (T-26.17).
export const TARGET_TOKENS = [
  "border",
  "title_bar.background",
  "title_bar.inactive_background",
  "text",
  "text.muted",
  "ghost_element.hover",
  "ghost_element.active",
  "status_bar.background",
  "tab_bar.background",
  "tab.active_background",
  "tab.inactive_background",
  "panel.background",
  "editor.background",
  "editor.foreground",
  "editor.gutter.background",
  "editor.line_number",
  "editor.active_line_number",
  "editor.active_line.background",
  "players[0].selection",
  "scrollbar.thumb.background",
  "scrollbar.thumb.hover_background",
  "scrollbar.thumb.active_background",
  "scrollbar.track.background",
  "background",
  "elevated_surface.background", // T-40.6: tooltip, menu
  "border.variant", // T-40.2: tooltip, menu
  "ghost_element.selected", // I-514: keyboard-selected menu item
  "text.disabled", // I-514: disabled menu item
  "border.focused", // A-12.5: keyboard cursor ring of a sidebar item
  "icon.muted", // A-12.1: folder icon
  "icon.disabled", // A-12.7: icon of a folder whose path is gone
  "error", // status.error (P-020, P-021): inline name input with an error
  "warning", // status.warning (P-020, P-021): inline name input with a warning; tab conflict dot (L-65)
  "text.accent", // Color::Accent (L-65, I-071): modified tab dot
  "pane_group.border", // I-725: split line
  "drop_target.background", // T-40.7 / I-714 / I-715: tab drag targets
  "drop_target.border", // T-26.13 / I-715: the tab drop line
  "toolbar.background", // E-038 / E-121: the editor toolbar (Markdown tabs)
] as const;
export type Token = (typeof TARGET_TOKENS)[number];

// T-26 rules that touch the target tokens: value taken from another token when the JSON has none.
// T-26.3, T-26.4.
const FALLBACK_FROM: Partial<Record<Token, Token>> = {
  "scrollbar.thumb.active_background": "scrollbar.thumb.background",
  "pane_group.border": "border", // T-26.4
};
// T-26 values for target tokens no theme has: theme.fallback.* in spec/zed-metrics.toml.
const FALLBACK_VALUE: Partial<Record<Token, string>> = {
  "drop_target.border": "#d7dadf", // theme.fallback."drop_target.border" (T-26.13)
};

/** "players[0].selection" -> "--players-0-selection" (PROGRESS W-7 naming rule). */
export function cssVarName(token: string): string {
  return "--" + token.replace(/[._[\]]/g, "-").replace(/-+/g, "-").replace(/-$/, "");
}

export type ThemeStyle = Record<string, unknown> & { players?: Record<string, unknown>[] };
export type ThemeFile = { themes: { name: string; appearance: "light" | "dark"; style: ThemeStyle }[] };

/** T-01.4-T-01.6: find `themes[].name` and check its shape. */
export function findTheme(file: ThemeFile, name: string): ThemeFile["themes"][number] {
  const theme = file.themes?.find((t) => t.name === name);
  if (!theme) throw new Error(`theme not found: ${name}`);
  if (theme.appearance !== "light" && theme.appearance !== "dark") throw new Error(`bad appearance: ${name}`);
  if (typeof theme.style !== "object" || theme.style === null) throw new Error(`no style: ${name}`);
  return theme;
}

function rawValue(style: ThemeStyle, token: Token): string | undefined {
  const m = /^players\[(\d+)\]\.(\w+)$/.exec(token);
  const v = m ? style.players?.[Number(m[1])]?.[m[2]] : style[token];
  return typeof v === "string" ? v : undefined; // absent and null both count as "no value"
}

/** Token -> canonical color for the target tokens, JSON value first, then T-26. */
export function resolveTokens(style: ThemeStyle): Record<Token, string> {
  const out = {} as Record<Token, string>;
  for (const token of TARGET_TOKENS) {
    const from = FALLBACK_FROM[token];
    const value = rawValue(style, token) ?? (from && rawValue(style, from)) ?? FALLBACK_VALUE[token];
    if (value === undefined) throw new Error(`theme has no value for ${token}`);
    out[token] = formatColor(parseColor(value));
  }
  return out;
}

/** Opaque "#rrggbb" of `top` painted over `bottom` (source-over, bottom taken as opaque). */
export function over(top: string, bottom: string): string {
  const [t, b] = [parseColor(top), parseColor(bottom)];
  const mix = (x: number, y: number) => Math.round((x * t.a + y * (255 - t.a)) / 255);
  return formatColor({ r: mix(t.r, b.r), g: mix(t.g, b.g), b: mix(t.b, b.b), a: 255 }).slice(0, 7);
}

export function themeCss(tokens: Record<Token, string>): string {
  return `:root { ${TARGET_TOKENS.map((t) => `${cssVarName(t)}: ${tokens[t]};`).join(" ")} }`;
}

// Syntax colors (T-06) are outside the R-7 target tokens: they are only turned into highlight
// classes for R-9. Class "cm-syntax-<key with . -> ->" per theme syntax key.
type SyntaxStyle = { color?: string | null; font_style?: string | null; font_weight?: number | null };

export const syntaxClass = (key: string) => "cm-syntax-" + key.replace(/\./g, "-");

export function syntaxCss(style: ThemeStyle): string {
  const syntax = (style.syntax ?? {}) as Record<string, SyntaxStyle>;
  return Object.entries(syntax)
    .map(([key, s]) => {
      const rules = [
        s.color && `color: ${formatColor(parseColor(s.color))};`,
        s.font_style && `font-style: ${s.font_style};`,
        s.font_weight && `font-weight: ${s.font_weight};`,
      ].filter(Boolean);
      return `.${syntaxClass(key)} { ${rules.join(" ")} }`;
    })
    .join("\n");
}

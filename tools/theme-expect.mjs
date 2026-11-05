// Independent expectation for R-7: reads the bundled theme JSON and the W-7 target token list (PROGRESS Phase 2).
// Deliberately does not import src/theme/theme.ts, so the app's own parser is not its own judge.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// D-13: Catppuccin is read from the installed Zed extension, no longer bundled in the repo (this PC only).
const CATPPUCCIN = process.env.LOCALAPPDATA + "/Zed/extensions/installed/catppuccin/themes/catppuccin-mauve.json";
const FILES = {
  "Catppuccin Mocha": CATPPUCCIN,
  "Catppuccin Latte": CATPPUCCIN,
  "One Light": "src/theme/assets/one/one.json",
};

// PROGRESS W-7 table 1 (fixed list, 24 tokens).
export const TARGET_TOKENS = [
  "border", "title_bar.background", "title_bar.inactive_background", "text", "text.muted", "ghost_element.hover",
  "ghost_element.active", "status_bar.background", "tab_bar.background", "tab.active_background", "tab.inactive_background",
  "panel.background", "editor.background", "editor.foreground", "editor.gutter.background", "editor.line_number",
  "editor.active_line_number", "editor.active_line.background", "players[0].selection", "scrollbar.thumb.background",
  "scrollbar.thumb.hover_background", "scrollbar.thumb.active_background", "scrollbar.track.background", "background",
];

export const cssVar = (token) => "--" + token.replace(/[._[\]]+/g, "-").replace(/-$/, "");

/** #RRGGBB / #RRGGBBAA -> [r,g,b,a(0..255)] (T-01.7: six digits mean alpha 1). */
export function parseHex(s) {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
  if (!m) throw new Error("bad color " + s);
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255, m[2] ? parseInt(m[2], 16) : 255];
}
export const toHex8 = ([r, g, b, a]) => "#" + [r, g, b, a].map((v) => v.toString(16).padStart(2, "0")).join("");

/** Token -> lower-case #rrggbbaa as the theme JSON says it, with T-26.3 for the scrollbar active thumb. */
export function expectedTokens(themeName) {
  const file = JSON.parse(readFileSync(resolve(root, FILES[themeName]), "utf8"));
  const theme = file.themes.find((t) => t.name === themeName);
  if (!theme) throw new Error("theme not in file: " + themeName);
  const style = theme.style;
  const get = (t) => (t === "players[0].selection" ? style.players?.[0]?.selection : style[t]);
  const out = {};
  for (const t of TARGET_TOKENS) {
    let v = get(t);
    if ((v === undefined || v === null) && t === "scrollbar.thumb.active_background") v = get("scrollbar.thumb.background"); // T-26.3
    if (typeof v !== "string") throw new Error(`no value for ${t} in ${themeName}`);
    out[t] = toHex8(parseHex(v));
  }
  return { appearance: theme.appearance, tokens: out };
}

/** Straight-alpha composite of layers (each #rrggbbaa) over nothing: first layer must be opaque. Rounds like 8-bit blending. */
export function composite(layers) {
  let [r, g, b] = parseHex(layers[0]);
  for (const l of layers.slice(1)) {
    const [lr, lg, lb, la] = parseHex(l), a = la / 255;
    r = Math.round(lr * a + r * (1 - a)); g = Math.round(lg * a + g * (1 - a)); b = Math.round(lb * a + b * (1 - a));
  }
  return [r, g, b];
}

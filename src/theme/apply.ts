import { invoke } from "@tauri-apps/api/core";
import one from "./assets/one/one.json";
import { findTheme, over, resolveTokens, syntaxCss, themeCss, type ThemeFile } from "./theme.ts";

// Catppuccin is read from the installed Zed extension (D-13, D-14); One is in the repo (D-9).
async function installed(path: string): Promise<ThemeFile> {
  const response = await fetch(`http://zlext.localhost/${path}`);
  if (!response.ok) throw new Error(`zlext ${path}: ${response.status} ${await response.text()}`);
  return response.json();
}
const catppuccin = () => installed("catppuccin/themes/catppuccin-mauve.json");

// D-8: the three themes of this version.
const THEMES: Record<string, () => Promise<ThemeFile>> = {
  "Catppuccin Mocha": catppuccin,
  "Catppuccin Latte": catppuccin,
  "One Light": async () => one as ThemeFile,
};
const DEFAULT_THEME = "Catppuccin Mocha"; // reference screen A-30.1

const sheet = new CSSStyleSheet();
/** Syntax keys of the applied theme, for the T-27.1 lookup. */
export let syntaxKeys: ReadonlySet<string> = new Set();

/**
 * Apply the theme named by `?theme=` (V3 switches themes by navigating with it; the selector UI is
 * out of scope, T-21), else the default. Variables live in one constructable sheet, no inline style.
 */
export async function applyTheme(): Promise<void> {
  const requested = new URLSearchParams(location.search).get("theme");
  const name = requested && Object.hasOwn(THEMES, requested) ? requested : DEFAULT_THEME;
  const { style } = findTheme(await THEMES[name](), name);
  const tokens = resolveTokens(style);
  syntaxKeys = new Set(Object.keys(style.syntax ?? {}));
  sheet.replaceSync(`${themeCss(tokens)}\n${syntaxCss(style)}`);
  if (!document.adoptedStyleSheets.includes(sheet)) document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  // The native maximize button (src-tauri/src/caption.rs) cannot read CSS: send it the flat colors.
  const bar = tokens["title_bar.background"];
  void invoke("caption_set_colors", {
    colors: [
      over(bar, tokens.background),
      over(tokens["title_bar.inactive_background"], tokens.background),
      over(tokens["ghost_element.hover"], bar),
      over(tokens["ghost_element.active"], bar),
      over(tokens.text, bar),
    ],
  });
}

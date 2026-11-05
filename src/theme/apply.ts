import { invoke } from "@tauri-apps/api/core";
import catppuccin from "./assets/catppuccin/catppuccin-mauve.json";
import one from "./assets/one/one.json";
import { findTheme, over, resolveTokens, themeCss, type ThemeFile } from "./theme.ts";

// D-8: the three themes of this version.
const THEMES: Record<string, ThemeFile> = {
  "Catppuccin Mocha": catppuccin as ThemeFile,
  "Catppuccin Latte": catppuccin as ThemeFile,
  "One Light": one as ThemeFile,
};
const DEFAULT_THEME = "Catppuccin Mocha"; // reference screen A-30.1

const sheet = new CSSStyleSheet();

/**
 * Apply the theme named by `?theme=` (V3 switches themes by navigating with it; the selector UI is
 * out of scope, T-21), else the default. Variables live in one constructable sheet, no inline style.
 */
export function applyTheme(): void {
  const requested = new URLSearchParams(location.search).get("theme");
  const name = requested && Object.hasOwn(THEMES, requested) ? requested : DEFAULT_THEME;
  const tokens = resolveTokens(findTheme(THEMES[name], name).style);
  sheet.replaceSync(themeCss(tokens));
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

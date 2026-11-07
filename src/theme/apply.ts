import { invoke } from "@tauri-apps/api/core";
import { BASE_THEME, pickTheme } from "./registry.ts";
import { registry } from "./themes.ts";
import { formatColor, over, panelFocusedBorder, parseColor, resolveTokens, syntaxCss, themeCss } from "./theme.ts";

const sheet = new CSSStyleSheet();
/** Syntax keys of the applied theme, for the T-27.1 lookup. */
export let syntaxKeys: ReadonlySet<string> = new Set();

/**
 * Apply the user theme (unknown or unset -> One Dark, D-8), retaining the V3 `?theme=` override.
 * Variables live in one constructable sheet.
 */
export async function applyTheme(selected?: string): Promise<void> {
  const requested = new URLSearchParams(location.search).get("theme") ?? selected;
  const { style, appearance } = pickTheme(registry, requested);
  const tokens = resolveTokens(style, pickTheme(registry, BASE_THEME[appearance]).style);
  syntaxKeys = new Set(Object.keys(style.syntax ?? {}));
  document.documentElement.dataset.appearance = appearance; // the tooltip shadow alpha differs by light/dark (L-212)
  const elementBackground = style["element.background"];
  const keymapColors = typeof elementBackground === "string" ? `:root { --element-background: ${formatColor(parseColor(elementBackground))}; }` : "";
  const panelBorder = panelFocusedBorder(style, appearance);
  const panelColors = panelBorder ? `:root { --panel-focused-border: ${panelBorder}; }` : "";
  sheet.replaceSync(`${themeCss(tokens)}\n${syntaxCss(style)}\n${keymapColors}\n${panelColors}`);
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

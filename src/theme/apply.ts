import { invoke } from "@tauri-apps/api/core";
import { BASE_THEME, pickTheme } from "./registry.ts";
import { registry } from "./themes.ts";
import { formatColor, over, panelFocusedBorder, parseColor, resolveTokens, syntaxCss, themeCss } from "./theme.ts";

const sheet = new CSSStyleSheet();
/** Syntax keys of the applied editor theme, for the T-27.1 lookup. */
export let syntaxKeys: ReadonlySet<string> = new Set();
/** The same for the applied preview theme (code blocks of a Markdown preview). */
export let previewSyntaxKeys: ReadonlySet<string> = new Set();
/** Light or dark, for the applied preview theme (Mermaid picks its colours by it). */
export let previewAppearance: "light" | "dark" = "dark";

// I-3: the UI theme is :root; the editor and preview themes redefine the same variables on their tab bodies, so
// everything inside inherits them. The editor body is the CM view (find bar, gutter, scrollbar) and its path row.
const EDITOR_BODY = ".cm-editor, .editor-toolbar";
const PREVIEW_BODY = ".markdown-preview";

function resolve(name?: string) {
  const theme = pickTheme(registry, name);
  return { style: theme.style, appearance: theme.appearance, tokens: resolveTokens(theme.style, pickTheme(registry, BASE_THEME[theme.appearance]).style, theme.name) };
}

/**
 * Apply the UI, editor and preview themes (unknown or unset -> One Dark, D-8), retaining the V3 `?theme=` override,
 * which covers all three. Variables live in one constructable sheet.
 */
export async function applyTheme(ui?: string, editor = ui, preview = ui): Promise<void> {
  const forced = new URLSearchParams(location.search).get("theme") ?? undefined;
  const [u, e, p] = [ui, editor, preview].map((name) => resolve(forced ?? name));
  syntaxKeys = new Set(Object.keys(e.style.syntax ?? {}));
  previewSyntaxKeys = new Set(Object.keys(p.style.syntax ?? {}));
  previewAppearance = p.appearance;
  document.documentElement.dataset.appearance = u.appearance; // the tooltip shadow alpha differs by light/dark (L-212)
  const elementBackground = u.style["element.background"];
  const keymapColors = typeof elementBackground === "string" ? `:root { --element-background: ${formatColor(parseColor(elementBackground))}; }` : "";
  const panelColors = `:root { --panel-focused-border: ${panelFocusedBorder(u.style, u.appearance)}; }`;
  sheet.replaceSync([
    themeCss(u.tokens), themeCss(e.tokens, EDITOR_BODY), themeCss(p.tokens, PREVIEW_BODY),
    syntaxCss(e.style, ".cm-editor"), syntaxCss(p.style, PREVIEW_BODY), keymapColors, panelColors,
  ].join("\n"));
  if (!document.adoptedStyleSheets.includes(sheet)) document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  // The native maximize button (src-tauri/src/caption.rs) cannot read CSS: send it the flat colors.
  const { tokens } = u;
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

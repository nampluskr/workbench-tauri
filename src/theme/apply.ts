import { invoke } from "@tauri-apps/api/core";
import { BASE_THEME, pickTheme } from "./registry.ts";
import { registry } from "./themes.ts";
import { splitLineColor } from "../shell/split-line.ts";
import { formatColor, headingColorsCss, over, panelFocusedBorder, parseColor, resolveTokens, syntaxCss, themeCss } from "./theme.ts";

const sheet = new CSSStyleSheet();
/** Syntax keys of the applied editor theme, for the T-27.1 lookup. */
export let syntaxKeys: ReadonlySet<string> = new Set();
/** The same for the applied preview theme (code blocks of a Markdown preview). */
export let previewSyntaxKeys: ReadonlySet<string> = new Set();
/** Light or dark, for the applied preview theme (Mermaid picks its colours by it). */
export let previewAppearance: "light" | "dark" = "dark";
/** The applied preview theme's page colours, for the HTML preview's frame document (an iframe document does not inherit CSS variables): text, text.accent. */
export let previewColors = { text: "", accent: "" };
const previewListeners = new Set<() => void>();
/** Call `fn` when what an HTML preview's frame document carries may have changed: a theme was applied, or the Settings (previewLookChanged). Returns the unsubscribe. */
export function onPreviewThemeChange(fn: () => void): () => void {
  previewListeners.add(fn);
  return () => void previewListeners.delete(fn);
}
/** core v0.8.2 I-14: the Settings an HTML preview shows (sizes, gaps, code font, heading colours) were applied; the preview compares and re-renders. */
export function previewLookChanged(): void {
  for (const fn of previewListeners) fn();
}

// I-3: the UI theme is :root; the editor and preview themes redefine the same variables on their tab bodies, so
// everything inside inherits them. The editor body is the CM view (find bar, gutter, scrollbar) and its path row.
const EDITOR_BODY = ".cm-editor, .editor-toolbar";
const PREVIEW_BODY = ".markdown-preview";

function resolve(name?: string) {
  const theme = pickTheme(registry, name);
  return { style: theme.style, appearance: theme.appearance, tokens: resolveTokens(theme.style, pickTheme(registry, BASE_THEME[theme.appearance]).style, theme.name) };
}

/**
 * Apply the UI, editor and preview themes (unknown or unset -> One Light, core v0.8.2 I-2), retaining the V3 `?theme=` override,
 * which covers all three. Variables live in one constructable sheet.
 */
export async function applyTheme(ui?: string, editor = ui, preview = ui): Promise<void> {
  const forced = new URLSearchParams(location.search).get("theme") ?? undefined;
  const [u, e, p] = [ui, editor, preview].map((name) => resolve(forced ?? name));
  syntaxKeys = new Set(Object.keys(e.style.syntax ?? {}));
  previewSyntaxKeys = new Set(Object.keys(p.style.syntax ?? {}));
  previewAppearance = p.appearance;
  previewColors = { text: p.tokens.text, accent: p.tokens["text.accent"] };
  document.documentElement.dataset.appearance = u.appearance; // the tooltip shadow alpha differs by light/dark (L-212)
  const elementBackground = u.style["element.background"];
  const keymapColors = typeof elementBackground === "string" ? `:root { --element-background: ${formatColor(parseColor(elementBackground))}; }` : "";
  const panelColors = `:root { --panel-focused-border: ${panelFocusedBorder(u.style, u.appearance)}; }`;
  // core v0.8.3 I-13: the split line is outside the Panes, so it cannot inherit their themes: one variable per pair of areas.
  const border = { ui: u.tokens["pane_group.border"], edit: e.tokens["pane_group.border"], view: p.tokens["pane_group.border"] };
  const splitLines = `:root { ${([["edit", "edit"], ["edit", "view"], ["view", "view"]] as const)
    .map(([a, b]) => `--split-line-${a}-${b}: ${splitLineColor("body", "h", a, b, border)};`).join(" ")} }`;
  sheet.replaceSync([
    themeCss(u.tokens), themeCss(e.tokens, EDITOR_BODY), themeCss(p.tokens, PREVIEW_BODY),
    `${PREVIEW_BODY} { --preview-color-scheme: ${p.appearance}; }`, // the HTML preview frame's color-scheme (app.css .html-frame)
    syntaxCss(e.style, ".cm-editor"), syntaxCss(p.style, PREVIEW_BODY), keymapColors, panelColors, splitLines,
    syntaxCss(u.style, ".outline-bar"), // core v0.8.1 I-4: the Outline badges are UI, so the UI theme's syntax colors
    headingColorsCss(u.style), headingColorsCss(p.style, PREVIEW_BODY), // core v0.8.2 I-11: the Outline's heading text by the UI theme, a preview's by the Preview theme
  ].join("\n"));
  if (!document.adoptedStyleSheets.includes(sheet)) document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  previewLookChanged();
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

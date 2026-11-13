import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { BASE_THEME, buildRegistry, pickTheme } from "./registry.ts";
import { headingColorsCss, over, panelFocusedBorder, parseColor, resolveTokens, syntaxCss, themeCss } from "./theme.ts";
import { areaTheme, parseSettings, THEME_AREAS, toggleThemeMode, updateSettings, type ThemeArea } from "../settings/model.ts";
import { themeButtons } from "../shell/status.ts";

// Every theme JSON under assets/ (committed one/ plus the .gitignore copies when present).
const assets = new URL("./assets/", import.meta.url);
const files = Object.fromEntries(readdirSync(assets, { recursive: true, encoding: "utf8" })
  .filter((p) => p.endsWith(".json")).map((p) => [p, readFileSync(new URL(p.replaceAll("\\", "/"), assets), "utf8")]));
const registry = buildRegistry(files);

test("I-3: the same theme can be scoped to a tab body; unscoped output is unchanged", () => {
  const tokens = resolveTokens(pickTheme(registry, "One Dark").style);
  assert.ok(themeCss(tokens).startsWith(":root { --border:"));
  assert.ok(themeCss(tokens, ".markdown-preview").startsWith(".markdown-preview { --border:"));
  const style = { syntax: { "string.regex": { color: "#112233" } } };
  assert.equal(syntaxCss(style), ".cm-syntax-string-regex { color: #112233ff; }");
  assert.equal(syntaxCss(style, ".cm-editor"), ".cm-editor .cm-syntax-string-regex { color: #112233ff; }");
});

test("K-46: panel focus uses the theme value or the Zed dark/light default", () => {
  for (const appearance of ["dark", "light"] as const) {
    assert.equal(panelFocusedBorder({ "panel.focused_border": "#abcdef" }, appearance), "#abcdefff");
    assert.equal(panelFocusedBorder({ "panel.focused_border": null }, appearance), appearance === "dark" ? "#2870bdff" : "#0588f0ff");
    assert.equal(panelFocusedBorder({}, appearance), appearance === "dark" ? "#2870bdff" : "#0588f0ff");
  }
  assert.throws(() => panelFocusedBorder({ "panel.focused_border": "bad" }, "dark"));
});

// PROGRESS Phase 2 table 1 (R-7) with the CSS variable names fixed in W-7.
const VARS: [token: string, cssVar: string][] = [
  ["border", "--border"],
  ["title_bar.background", "--title-bar-background"],
  ["title_bar.inactive_background", "--title-bar-inactive-background"],
  ["text", "--text"],
  ["text.muted", "--text-muted"],
  ["text.placeholder", "--text-placeholder"],
  ["ghost_element.hover", "--ghost-element-hover"],
  ["ghost_element.active", "--ghost-element-active"],
  ["status_bar.background", "--status-bar-background"],
  ["tab_bar.background", "--tab-bar-background"],
  ["tab.active_background", "--tab-active-background"],
  ["tab.inactive_background", "--tab-inactive-background"],
  ["panel.background", "--panel-background"],
  ["editor.background", "--editor-background"],
  ["editor.foreground", "--editor-foreground"],
  ["editor.gutter.background", "--editor-gutter-background"],
  ["editor.line_number", "--editor-line-number"],
  ["editor.active_line_number", "--editor-active-line-number"],
  ["editor.active_line.background", "--editor-active-line-background"],
  ["editor.indent_guide", "--editor-indent-guide"],
  ["editor.indent_guide_active", "--editor-indent-guide-active"],
  ["editor.invisible", "--editor-invisible"],
  ["players[0].selection", "--players-0-selection"],
  ["scrollbar.thumb.background", "--scrollbar-thumb-background"],
  ["scrollbar.thumb.hover_background", "--scrollbar-thumb-hover-background"],
  ["scrollbar.track.background", "--scrollbar-track-background"],
  ["background", "--background"],
  ["elevated_surface.background", "--elevated-surface-background"],
  ["border.variant", "--border-variant"],
  ["ghost_element.selected", "--ghost-element-selected"],
  ["text.disabled", "--text-disabled"],
  ["border.focused", "--border-focused"],
  ["icon.muted", "--icon-muted"],
  ["icon.disabled", "--icon-disabled"],
  ["error", "--error"],
  ["warning", "--warning"],
  ["text.accent", "--text-accent"],
  ["info.background", "--info-background"],
  ["pane_group.border", "--pane-group-border"],
  ["drop_target.background", "--drop-target-background"],
  ["drop_target.border", "--drop-target-border"],
  ["toolbar.background", "--toolbar-background"],
  ["editor.subheader.background", "--editor-subheader-background"],
  ["element.hover", "--element-hover"],
  ["panel.overlay_background", "--panel-overlay-background"],
  ["panel.overlay_hover", "--panel-overlay-hover"],
];

test("parseColor: #RRGGBB has alpha 255, #RRGGBBAA keeps it, anything else is rejected (T-01.7)", () => {
  assert.deepEqual(parseColor("#1e1e2e"), { r: 0x1e, g: 0x1e, b: 0x2e, a: 255 });
  assert.deepEqual(parseColor("#74ade83d"), { r: 0x74, g: 0xad, b: 0xe8, a: 0x3d });
  assert.throws(() => parseColor("1e1e2e"));
  assert.throws(() => parseColor("#1e1e2"));
});

for (const { name, appearance, style } of registry) {
  test(`${name}: the target tokens equal the JSON value, the T-26 value or the One base value`, () => {
    const base = pickTheme(registry, BASE_THEME[appearance]).style;
    const css = themeCss(resolveTokens(style, base, name));
    const vars = new Map([...css.matchAll(/(--[\w-]+): (#[0-9a-f]{8});/g)].map((m) => [m[1], m[2]]));
    assert.equal(vars.size, VARS.length);
    for (const [token, cssVar] of VARS) {
      if (token.startsWith("editor.indent_guide") && /^One (Dark|Light)$/.test(name)) continue; // I-14, the next test
      const pick = (s: typeof style) => (token === "players[0].selection" ? (s.players?.[0] as any)?.selection : s[token]);
      // T-26.3 / T-26.4: derived from another token of the same theme; T-26.13: a fixed value; else the base theme.
      const panel = (style["panel.background"] ?? base["panel.background"]) as string;
      const hover = (style["element.hover"] ?? base["element.hover"]) as string;
      const derived = token === "pane_group.border" ? style.border
        : token === "panel.overlay_background" ? panel.slice(0, 7)
        : token === "panel.overlay_hover" ? over(hover, panel) : undefined;
      const expected = pick(style) ?? derived ?? pick(base) ?? (token === "drop_target.border" ? "#d7dadf" : token === "editor.indent_guide" ? "#3b3d45" : token === "editor.indent_guide_active" ? "#1b1d23" : undefined); // T-26.9 / T-26.10
      assert.deepEqual(parseColor(vars.get(cssVar)!), parseColor(expected as string), `${token} -> ${cssVar}`);
    }
  });
}

test("T-26.1/2: sticky defaults are opaque and theme overrides win", () => {
  const base = registry[0].style;
  const style = { ...base, "panel.background": "#00000080", "element.hover": "#ffffff80", "panel.overlay_background": null, "panel.overlay_hover": null };
  const resolved = resolveTokens(style, base);
  assert.equal(resolved["panel.overlay_background"], "#000000ff");
  assert.equal(resolved["panel.overlay_hover"], "#808080ff");
  assert.equal(resolveTokens({ ...style, "panel.overlay_background": "#123456", "panel.overlay_hover": "#abcdef" }, base)["panel.overlay_background"], "#123456ff");
  assert.equal(resolveTokens({ ...style, "panel.overlay_hover": "#abcdef" }, base)["panel.overlay_hover"], "#abcdefff");
});

test("I-14: One Dark and One Light get Zed's default guide colors; other themes keep T-26.9 / T-26.10 or their own value", () => {
  const guides = (name: string) => { const t = resolveTokens(pickTheme(registry, name).style, pickTheme(registry, BASE_THEME[pickTheme(registry, name).appearance]).style, name); return [t["editor.indent_guide"], t["editor.indent_guide_active"]]; };
  assert.deepEqual(guides("One Dark"), ["#fefef31b", "#fffaed2d"]);
  assert.deepEqual(guides("One Light"), ["#1f180021", "#19130029"]);
  // a theme file without the keys (not named One) and one with them
  const one = pickTheme(registry, "One Dark").style;
  assert.deepEqual([resolveTokens(one, one)["editor.indent_guide"], resolveTokens(one, one)["editor.indent_guide_active"]], ["#3b3d45ff", "#1b1d23ff"]);
  const own = { ...one, "editor.indent_guide": "#112233", "editor.indent_guide_active": "#445566" };
  assert.deepEqual([resolveTokens(own, one, "One Dark")["editor.indent_guide"], resolveTokens(own, one, "One Dark")["editor.indent_guide_active"]], ["#112233ff", "#445566ff"]);
});

test("core v0.8.2 I-2: a status bar theme button turns its own area only and the file keeps it; no settings is One Light; heading colours follow the area's theme", () => {
  const named = (appearance: string) => registry.filter((t) => t.appearance === appearance).map((t) => t.name);
  const choices = { dark_theme: named("dark"), light_theme: named("light"), icon_theme: [] };
  const read = (text: string | null) => parseSettings(text, choices);
  const themes = (text: string | null) => THEME_AREAS.map((area) => areaTheme(read(text), area));
  const press = (text: string | null, area: ThemeArea) => updateSettings(text, toggleThemeMode(read(text), area), choices);
  // What applyTheme puts in the sheet for the heading colours (core v0.8.2 I-11): the UI theme on :root, the preview theme on its body.
  const headings = (text: string | null) => [headingColorsCss(pickTheme(registry, areaTheme(read(text), "theme")).style), headingColorsCss(pickTheme(registry, areaTheme(read(text), "preview_theme")).style, ".markdown-preview")];
  assert.deepEqual(themes(null), ["One Light", "One Light", "One Light"]); // no settings yet
  assert.deepEqual(themeButtons(read(null)).map((b) => [b.text, b.name, b.label]), [["UI", "sun", "UI: Light Theme"], ["Edit", "sun", "Editor: Light Theme"], ["View", "sun", "Preview: Light Theme"]]);

  const view = press("// mine\n", "preview_theme");
  assert.ok(view.startsWith("// mine\n"));
  assert.deepEqual(themes(view), ["One Light", "One Light", "One Dark"]); // read again from the file: kept over a restart
  assert.deepEqual(themeButtons(read(view)).map((b) => [b.area, b.name]), [["theme", "sun"], ["editor_theme", "sun"], ["preview_theme", "moon"]]);
  assert.equal(headings(view)[0], headings(null)[0]); // the Outline's heading colours stay with the UI theme
  assert.equal(headings(view)[1], headingColorsCss(pickTheme(registry, "One Dark").style, ".markdown-preview"));
  assert.notEqual(headings(view)[1], headings(null)[1]);

  const ui = press(view, "theme");
  assert.deepEqual(themes(ui), ["One Dark", "One Light", "One Dark"]);
  assert.equal(headings(ui)[0], headingColorsCss(pickTheme(registry, "One Dark").style));
  assert.deepEqual(themes(press(ui, "editor_theme")), ["One Dark", "One Dark", "One Dark"]);
  assert.deepEqual(themes(press(press(ui, "theme"), "preview_theme")), ["One Light", "One Light", "One Light"]);
});

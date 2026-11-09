import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { BASE_THEME, buildRegistry, pickTheme } from "./registry.ts";
import { panelFocusedBorder, parseColor, resolveTokens, themeCss } from "./theme.ts";

// Every theme JSON under assets/ (committed one/ plus the .gitignore copies when present).
const assets = new URL("./assets/", import.meta.url);
const files = Object.fromEntries(readdirSync(assets, { recursive: true, encoding: "utf8" })
  .filter((p) => p.endsWith(".json")).map((p) => [p, readFileSync(new URL(p.replaceAll("\\", "/"), assets), "utf8")]));
const registry = buildRegistry(files);

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
  ["players[0].selection", "--players-0-selection"],
  ["scrollbar.thumb.background", "--scrollbar-thumb-background"],
  ["scrollbar.thumb.hover_background", "--scrollbar-thumb-hover-background"],
  ["scrollbar.thumb.active_background", "--scrollbar-thumb-active-background"],
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
    const css = themeCss(resolveTokens(style, base));
    const vars = new Map([...css.matchAll(/(--[\w-]+): (#[0-9a-f]{8});/g)].map((m) => [m[1], m[2]]));
    assert.equal(vars.size, VARS.length);
    for (const [token, cssVar] of VARS) {
      const pick = (s: typeof style) => (token === "players[0].selection" ? (s.players?.[0] as any)?.selection : s[token]);
      // T-26.3 / T-26.4: derived from another token of the same theme; T-26.13: a fixed value; else the base theme.
      const derived = token === "pane_group.border" ? style.border : token === "scrollbar.thumb.active_background" ? style["scrollbar.thumb.background"] : undefined;
      const expected = pick(style) ?? derived ?? pick(base) ?? (token === "drop_target.border" ? "#d7dadf" : undefined);
      assert.deepEqual(parseColor(vars.get(cssVar)!), parseColor(expected as string), `${token} -> ${cssVar}`);
    }
  });
}

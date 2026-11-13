import test from "node:test";
import assert from "node:assert/strict";
import { Keymap } from "../keymap/engine.ts";
import { iconThemeSelector, themeSelector, THEME_SELECTOR_BINDINGS } from "./selector.ts";
import { areaTheme, parseSettings, THEME_AREAS, updateSettings } from "../settings/model.ts";

const appearance = (name: string) => name.endsWith("Light") || name.endsWith("Latte") ? "light" as const : "dark" as const;
function setup(save: (name: string) => Promise<void> = async () => {}) {
  const log: string[] = [];
  const config = themeSelector({
    themes: ["One Dark", "One Light"],
    current: "One Dark",
    preview: (name) => log.push(`preview ${name}`),
    appearance,
    saveAll: async (values) => { const name = String(values.theme_dark ?? values.theme_light); log.push(`save ${name}`); await save(name); },
    fail: (error) => log.push(`fail ${error}`),
    viewThemes: () => log.push("install"),
  });
  return { config, log };
}

test("select theme: opens on the current theme with Zed's placeholder and footer", () => {
  const { config } = setup();
  assert.equal(config.placeholder, "Select Theme...");
  assert.equal(config.checked, "One Dark");
  assert.equal(config.footer.label, "View Themes");
});

test("select theme: moving previews, closing without a choice restores the opening theme", () => {
  const { config, log } = setup();
  config.preview("One Light");
  config.revert();
  assert.deepEqual(log, ["preview One Light", "preview One Dark"]);
});

test("select theme: confirming saves that name and does not revert; a failed save restores", async () => {
  const ok = setup();
  await ok.config.confirm("One Light");
  assert.deepEqual(ok.log, ["save One Light"]);
  const bad = setup(async () => { throw new Error("busy"); });
  await bad.config.confirm("One Light");
  assert.deepEqual(bad.log, ["save One Light", "fail Error: busy", "preview One Dark"]);
});

test("select theme: a custom revert replaces the preview of the opening theme", async () => {
  const log: string[] = [];
  const config = themeSelector({
    themes: ["One Dark", "One Light"], current: "One Dark", preview: (name) => log.push(`preview ${name}`),
    revert: () => log.push("revert"), appearance, saveAll: async () => { throw new Error("busy"); }, fail: () => {}, viewThemes: () => {},
  });
  config.revert();
  await config.confirm("One Light");
  assert.deepEqual(log, ["revert", "revert"]);
});

test("core v0.8.2 I-2: Themes… parts dark from light, and a choice goes into that setting of all three areas, which turn that way", async () => {
  const saved: object[] = [];
  const config = themeSelector({
    themes: ["Catppuccin Mocha", "One Dark", "Catppuccin Latte", "One Light"], current: "One Light", preview: () => {},
    appearance, saveAll: async (values) => void saved.push(values), fail: () => {}, viewThemes: () => {},
  });
  assert.deepEqual(config.items, ["Catppuccin Mocha", "One Dark", "Catppuccin Latte", "One Light"]);
  assert.equal(config.divideBefore, "Catppuccin Latte"); // the line sits above the first light theme
  await config.confirm("Catppuccin Mocha");
  await config.confirm("Catppuccin Latte");
  assert.deepEqual(saved, [
    { theme_dark: "Catppuccin Mocha", theme_mode: "dark", editor_theme_dark: "Catppuccin Mocha", editor_theme_mode: "dark", preview_theme_dark: "Catppuccin Mocha", preview_theme_mode: "dark" },
    { theme_light: "Catppuccin Latte", theme_mode: "light", editor_theme_light: "Catppuccin Latte", editor_theme_mode: "light", preview_theme_light: "Catppuccin Latte", preview_theme_mode: "light" },
  ]);
  // Written and read back: the light themes saved before stay as settings, every area shows the dark choice.
  const choices = { dark_theme: ["Catppuccin Mocha", "One Dark"], light_theme: ["Catppuccin Latte", "One Light"], icon_theme: [] };
  const s = parseSettings(updateSettings('{ "editor_theme_light": "Catppuccin Latte" }', saved[0], choices), choices);
  assert.deepEqual(THEME_AREAS.map((area) => areaTheme(s, area)), ["Catppuccin Mocha", "Catppuccin Mocha", "Catppuccin Mocha"]);
  assert.deepEqual([s.theme_light, s.editor_theme_light], ["One Light", "Catppuccin Latte"]);
  assert.equal(iconThemeSelector({ themes: ["a"], current: "a", preview: () => {}, save: async () => {}, fail: () => {}, viewIconThemes: () => {} }).divideBefore, undefined);
});

test("select theme: Ctrl-K Ctrl-T is bound in the Workspace context", () => {
  const keymap = new Keymap();
  keymap.addSections("default", THEME_SELECTOR_BINDINGS);
  assert.deepEqual(keymap.dispatch(["ctrl-k", "ctrl-t"], [new Set(["Workspace"])]), { type: "match", action: "theme_selector::Toggle" });
});

test("select icon theme: Zed's words, the same preview, save and undo", async () => {
  const log: string[] = [];
  const config = iconThemeSelector({
    themes: ["Zed (Default)", "Catppuccin Mocha"], current: "Zed (Default)",
    preview: (name) => log.push(`preview ${name}`), save: async (name) => { log.push(`save ${name}`); },
    fail: () => {}, viewIconThemes: () => log.push("install"),
  });
  assert.equal(config.placeholder, "Select Icon Theme...");
  assert.equal(config.footer.label, "View Icon Themes");
  config.footer.run();
  config.preview("Catppuccin Mocha");
  config.revert();
  await config.confirm("Catppuccin Mocha");
  assert.deepEqual(log, ["install", "preview Catppuccin Mocha", "preview Zed (Default)", "save Catppuccin Mocha"]);
});

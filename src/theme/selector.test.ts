import test from "node:test";
import assert from "node:assert/strict";
import { Keymap } from "../keymap/engine.ts";
import { iconThemeSelector, themeSelector, THEME_SELECTOR_BINDINGS, type ThemeSelectorDeps } from "./selector.ts";

function setup(save: ThemeSelectorDeps["save"] = async () => {}) {
  const log: string[] = [];
  const config = themeSelector({
    themes: ["One Dark", "One Light"],
    current: "One Dark",
    preview: (name) => log.push(`preview ${name}`),
    save: async (name) => { log.push(`save ${name}`); await save(name); },
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
    revert: () => log.push("revert"), save: async () => { throw new Error("busy"); }, fail: () => {}, viewThemes: () => {},
  });
  config.revert();
  await config.confirm("One Light");
  assert.deepEqual(log, ["revert", "revert"]);
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

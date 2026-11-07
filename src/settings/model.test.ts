import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, filterSettings, parseSettings, settingMenu, updateSetting } from "./model.ts";
const THEMES = ["One Dark", "Catppuccin Mocha", "One Light"];
import { stripJsonc } from "../keymap/user.ts";

test("settings defaults, invalid values and supported values", () => {
  for (const text of [null, "{}", "{broken", "[]", '{"theme":"unknown","ui_font_size":0,"buffer_font_size":"20"}']) assert.deepEqual(parseSettings(text, THEMES), DEFAULTS);
  assert.equal(DEFAULTS.theme, "One Dark");
  assert.equal(parseSettings('{"theme":"Catppuccin Mocha"}', THEMES).theme, "Catppuccin Mocha");
  assert.equal(parseSettings('{"theme":"Catppuccin Mocha"}', []).theme, "One Dark");
  assert.deepEqual(parseSettings('{"theme":"One Light","ui_font_size":18.5,"buffer_font_size":20}', THEMES), { ...DEFAULTS, theme: "One Light", ui_font_size: 18.5, buffer_font_size: 20 });
});

test("settings writes preserve unknown keys, comments, duplicate keys and line endings", () => {
  const original = '\uFEFF{\r\n// Keep } this\r\n"other":{"theme":"a", "items":[1,2]},\r\n"theme": {"old":true}, /* keep */ "theme":"old",\r\n}\r\n';
  const next = updateSetting(original, "theme", "One Light", THEMES);
  assert.equal(next, original.replace('{"old":true}', '"One Light"').replace('"old"', '"One Light"'));
  const appended = updateSetting(next, "ui_font_size", 20, THEMES);
  assert.ok(appended.startsWith(next.slice(0, next.lastIndexOf("}"))));
  assert.equal(parseSettings(appended, THEMES).ui_font_size, 20);
  assert.deepEqual(JSON.parse(stripJsonc(appended.replace(/^\uFEFF/, ""))).other, {theme:"a",items:[1,2]});
  assert.equal(parseSettings(updateSetting(null, "buffer_font_size", 19, THEMES), THEMES).buffer_font_size, 19);
  assert.throws(() => updateSetting("broken", "theme", "One Light", THEMES));
  assert.throws(() => updateSetting("{}", "ui_font_size", -1, THEMES));
  assert.throws(() => updateSetting("{}", "theme", "Unlisted", THEMES));
  assert.equal(updateSetting('{"ui_font_size":16/*keep*/,"other":true// keep too\n}', "ui_font_size", 20, THEMES), '{"ui_font_size":20/*keep*/,"other":true// keep too\n}');
  const nested = updateSetting('{"theme":{"old":true/*keep nested*/}}', "theme", "One Light", THEMES);
  assert.ok(nested.includes("/*keep nested*/"));
  assert.equal(parseSettings(nested, THEMES).theme, "One Light");
});

test("settings search includes page and section titles like Zed's search index", () => {
  assert.deepEqual(filterSettings("editor TEXT").map((r) => r.key), ["buffer_font_size"]);
  assert.equal(filterSettings("theme").length, 2);
  assert.equal(filterSettings("missing").length, 0);
  assert.deepEqual(filterSettings("BUFFER").map((r) => r.key), ["buffer_font_size"]);
  assert.deepEqual(filterSettings("buffer text").map((r) => r.key), ["buffer_font_size"]);
  assert.equal(filterSettings("appearance").length, 4);
});

test("settings dropdown menus keep supported choices, selection and the saved value", () => {
  let changed = "";
  const menu = settingMenu("theme", "One Light", (value) => { changed = value; }, THEMES);
  assert.deepEqual(menu.map((item) => [item.label, item.checked]), [["One Dark", false], ["Catppuccin Mocha", false], ["One Light", true]]);
  menu[1].run!();
  assert.equal(changed, "Catppuccin Mocha");
  const icons = settingMenu("icon_theme", DEFAULTS.icon_theme, () => {}, THEMES);
  assert.deepEqual(icons.map((item) => [item.label, item.checked]), [["Zed (Default)", true]]);
});

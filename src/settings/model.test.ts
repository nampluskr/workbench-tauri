import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULTS, filterSettings, parseSettings, settingMenu, updateSetting, updateSettings } from "./model.ts";
const THEMES = { theme: ["One Dark", "Catppuccin Mocha", "One Light"], icon_theme: ["Zed (Default)", "Catppuccin Mocha"] };
import { stripJsonc } from "../keymap/user.ts";

test("settings defaults, invalid values and supported values", () => {
  for (const text of [null, "{}", "{broken", "[]", '{"theme":"unknown","ui_font_size":0,"buffer_font_size":"20"}']) assert.deepEqual(parseSettings(text, THEMES), DEFAULTS);
  assert.equal(DEFAULTS.theme, "One Dark");
  assert.equal(parseSettings('{"theme":"Catppuccin Mocha"}', THEMES).theme, "Catppuccin Mocha");
  assert.equal(parseSettings('{"theme":"Catppuccin Mocha"}', { ...THEMES, theme: [] }).theme, "One Dark");
  assert.equal(parseSettings('{"icon_theme":"Catppuccin Mocha"}', THEMES).icon_theme, "Catppuccin Mocha");
  assert.equal(parseSettings('{"icon_theme":"Missing"}', THEMES).icon_theme, "Zed (Default)");
  assert.equal(parseSettings('{"icon_theme":"Catppuccin Mocha"}', { ...THEMES, icon_theme: [] }).icon_theme, "Zed (Default)");
  assert.deepEqual(parseSettings('{"theme":"One Light","ui_font_size":18.5,"buffer_font_size":20}', THEMES), { ...DEFAULTS, theme: "One Light", editor_theme: "One Light", preview_theme: "One Light", ui_font_size: 18.5, buffer_font_size: 20 });
  // I-2: a v0.6 file (four keys) reads preview_font_size as 16; a valid value is kept, an invalid one falls back.
  assert.equal(parseSettings('{"theme":"One Light","icon_theme":"Zed (Default)","ui_font_size":16,"buffer_font_size":15}', THEMES).preview_font_size, 16);
  assert.equal(parseSettings('{"preview_font_size":20}', THEMES).preview_font_size, 20);
  assert.equal(parseSettings('{"preview_font_size":"20"}', THEMES).preview_font_size, 16);
  assert.equal(parseSettings(updateSetting('{\n  // keep\n  "theme": "One Light"\n}\n', "preview_font_size", 18, THEMES), THEMES).preview_font_size, 18);
});

test("I-3: editor and preview themes follow theme until set; one write sets all three", () => {
  const themes = (text: string) => { const s = parseSettings(text, THEMES); return [s.theme, s.editor_theme, s.preview_theme]; };
  assert.deepEqual(themes("{}"), ["One Dark", "One Dark", "One Dark"]);
  assert.deepEqual(themes('{"theme":"One Light"}'), ["One Light", "One Light", "One Light"]); // a v0.6 file
  assert.deepEqual(themes('{"theme":"One Light","editor_theme":"Catppuccin Mocha"}'), ["One Light", "Catppuccin Mocha", "One Light"]);
  assert.deepEqual(themes('{"theme":"One Light","editor_theme":"Missing","preview_theme":5}'), ["One Light", "One Light", "One Light"]);
  assert.deepEqual(themes('{"theme":"Missing","preview_theme":"Catppuccin Mocha"}'), ["One Dark", "One Dark", "Catppuccin Mocha"]);
  const written = updateSettings('{\n  // keep\n  "theme": "One Dark"\n}', { theme: "One Light", editor_theme: "One Light", preview_theme: "One Light" }, THEMES);
  assert.ok(written.includes("// keep"));
  assert.deepEqual(themes(written), ["One Light", "One Light", "One Light"]);
  assert.throws(() => updateSettings("{}", { editor_theme: "Unlisted" }, THEMES));
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

test("settings search includes the category title, name and description", () => {
  const keys = (query: string) => filterSettings(query).map((r) => r.key);
  assert.deepEqual(keys("preview"), ["preview_theme", "preview_font_size"]);
  assert.deepEqual(keys("EDITOR"), ["editor_theme", "buffer_font_size"]);
  assert.deepEqual(keys("ui"), ["theme", "icon_theme", "ui_font_size"]);
  assert.deepEqual(keys("ui font size"), ["ui_font_size"]);
  assert.equal(keys("theme").length, 4);
  assert.equal(keys("font size").length, 3);
  assert.equal(keys("missing").length, 0);
});

test("settings dropdown menus keep supported choices, selection and the saved value", () => {
  let changed = "";
  const menu = settingMenu("theme", "One Light", (value) => { changed = value; }, THEMES);
  assert.deepEqual(menu.map((item) => [item.label, item.checked]), [["One Dark", false], ["Catppuccin Mocha", false], ["One Light", true]]);
  menu[1].run!();
  assert.equal(changed, "Catppuccin Mocha");
  const icons = settingMenu("icon_theme", DEFAULTS.icon_theme, () => {}, THEMES);
  assert.deepEqual(icons.map((item) => [item.label, item.checked]), [["Zed (Default)", true], ["Catppuccin Mocha", false]]);
});

test("appending a key looks like an editor wrote it: comma after the last value, same indent, comments kept", () => {
  const add = (text: string | null) => updateSetting(text, "theme", "One Light", THEMES);
  // The failing input of the V3 run: no blank line, no comma at the start of a line.
  assert.equal(add('{\n  "icon_theme": "Zed (Default)"\n}'), '{\n  "icon_theme": "Zed (Default)",\n  "theme": "One Light"\n}');
  assert.equal(add('{\r\n\t"icon_theme": "Zed (Default)"\r\n}\r\n'), '{\r\n\t"icon_theme": "Zed (Default)",\r\n\t"theme": "One Light"\r\n}\r\n');
  assert.equal(add('{\n  "a": 1,\n  "b": [1, 2]\n}\n'), '{\n  "a": 1,\n  "b": [1, 2],\n  "theme": "One Light"\n}\n');
  // A trailing comma is the file's style: the new line keeps it.
  assert.equal(add('{\n  "a": 1,\n}'), '{\n  "a": 1,\n  "theme": "One Light",\n}');
  // Comments: one after the last value stays on its line, one before "}" stays above the new key, a "}" in a comment is no brace.
  assert.equal(add('{\n  "a": 1 // note\n}'), '{\n  "a": 1, // note\n  "theme": "One Light"\n}');
  assert.equal(add('{\n  "a": 1\n  // end\n}'), '{\n  "a": 1,\n  // end\n  "theme": "One Light"\n}');
  assert.equal(add('{\n  // } here\n  "a": 1\n}'), '{\n  // } here\n  "a": 1,\n  "theme": "One Light"\n}');
  assert.equal(add('// Zed settings\n//\n{\n  // only a comment\n}\n'), '// Zed settings\n//\n{\n  // only a comment\n  "theme": "One Light"\n}\n');
  // "}" on the last value's line, one-line objects, empty objects.
  assert.equal(add('{\n  "a": 1 }'), '{\n  "a": 1,\n  "theme": "One Light"\n}');
  assert.equal(add('{ "a": 1 }'), '{ "a": 1, "theme": "One Light" }');
  assert.equal(add('{ "a": 1, }'), '{ "a": 1, "theme": "One Light", }');
  assert.equal(add("{}"), '{\n  "theme": "One Light"\n}');
  assert.equal(add("{\n}\n"), '{\n  "theme": "One Light"\n}\n');
  assert.equal(add(null), '{\n  "theme": "One Light"\n}\n');
  // Nothing but blanks or comments: the object follows them.
  assert.equal(add(""), '{\n  "theme": "One Light"\n}\n');
  assert.equal(add("// c"), '// c\n{\n  "theme": "One Light"\n}\n');
  assert.equal(add("// c\r\n"), '// c\r\n{\r\n  "theme": "One Light"\r\n}\r\n');
  // Two adds in a row give the same shape as writing both at once.
  assert.equal(updateSetting(add("{}"), "icon_theme", "Zed (Default)", THEMES), '{\n  "theme": "One Light",\n  "icon_theme": "Zed (Default)"\n}');
  for (const text of ["", "// c", "{}", '{\n  "a": 1 // n\n}', "{ }", '{\n  "a": {"b": [1]}\n}']) assert.doesNotThrow(() => parseSettings(add(text), THEMES), text);
});

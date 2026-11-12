import test from "node:test";
import assert from "node:assert/strict";
import { CODE_FONTS, DEFAULTS, categoryKeys, filterSettings, parseSettings, removeSettings, settingMenu, type SettingKey, settingNumber, settingStep, updateSetting, updateSettings } from "./model.ts";
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

test("I-5 ~ I-8, I-10: the five editor view settings read, validate and write", () => {
  const read = (json: string) => parseSettings(json, THEMES);
  assert.deepEqual([DEFAULTS.editor_line_height, DEFAULTS.editor_line_numbers, DEFAULTS.editor_word_wrap, DEFAULTS.editor_indent_guides, DEFAULTS.editor_render_whitespace], [1.6, true, true, true, false]);
  const set = read('{"editor_line_height":2.3,"editor_line_numbers":false,"editor_word_wrap":false,"editor_indent_guides":false,"editor_render_whitespace":true}');
  assert.deepEqual([set.editor_line_height, set.editor_line_numbers, set.editor_word_wrap, set.editor_indent_guides, set.editor_render_whitespace], [2.3, false, false, false, true]);
  // I-8: 1.0 to 3.0 in 0.1 steps; anything else in a file is invalid and reads as the default.
  for (const value of [1, 1.7, 3]) assert.equal(read(`{"editor_line_height":${value}}`).editor_line_height, value);
  for (const value of [0.9, 3.1, 1.65, 0, -1, '"2"', "true", "null"]) assert.equal(read(`{"editor_line_height":${value}}`).editor_line_height, 1.6, String(value));
  for (const value of ['"yes"', "1", "null"]) assert.deepEqual(read(`{"editor_line_numbers":${value},"editor_render_whitespace":${value}}`), DEFAULTS, value);
  // The Settings screen moves a step or typed value to the nearest allowed one, so the file never gets an invalid one.
  assert.equal(settingNumber("editor_line_height", 1.6 + settingStep("editor_line_height")), 1.7);
  assert.equal(settingNumber("editor_line_height", 3.5), 3);
  assert.equal(settingNumber("editor_line_height", 0.2), 1);
  assert.equal(settingNumber("buffer_font_size", 15.5), 15.5);
  // A write keeps comments and unknown keys, and reads back.
  const written = updateSettings('{\n  // keep\n  "x": 1\n}', { editor_line_height: 1.8, editor_word_wrap: false }, THEMES);
  assert.ok(written.includes("// keep"));
  assert.deepEqual([read(written).editor_line_height, read(written).editor_word_wrap], [1.8, false]);
  assert.throws(() => updateSetting("{}", "editor_line_height", 1.65, THEMES));
  assert.throws(() => updateSetting("{}", "editor_line_numbers", "no", THEMES));
});

test("I-9: the four preview gaps are whole pixels 0 to 48; a file value outside that reads as the default", () => {
  const keys = ["preview_paragraph_line_gap", "preview_paragraph_gap", "preview_list_line_gap", "preview_list_gap"] as const;
  const read = (json: string) => parseSettings(json, THEMES);
  assert.deepEqual(keys.map((k) => DEFAULTS[k]), [8, 16, 6, 4]); // core v0.8.1 I-8: the list defaults follow Zed
  // A value already in the user file is kept, also the old defaults.
  assert.deepEqual([read(`{"preview_list_line_gap":8,"preview_list_gap":12}`).preview_list_line_gap, read(`{"preview_list_gap":12}`).preview_list_gap, read("{}").preview_list_gap], [8, 12, 4]);
  for (const key of keys) {
    for (const value of [0, 1, 48]) assert.equal(read(`{"${key}":${value}}`)[key], value);
    for (const value of [-1, 49, 8.5, "\"8\"", "null"]) assert.equal(read(`{"${key}":${value}}`)[key], DEFAULTS[key], `${key} ${value}`);
  }
  // The Settings screen moves a step or typed value to the nearest allowed whole pixel.
  assert.equal(settingNumber("preview_list_gap", 12 + settingStep("preview_list_gap")), 13);
  assert.equal(settingNumber("preview_list_gap", 60), 48);
  assert.equal(settingNumber("preview_list_gap", -3), 0);
  assert.equal(settingNumber("preview_list_gap", 8.6), 9);
  assert.equal(read(updateSetting("{}", "preview_paragraph_gap", 20, THEMES)).preview_paragraph_gap, 20);
  assert.throws(() => updateSetting("{}", "preview_paragraph_gap", 49, THEMES));
});

test("settings search includes the category title, name and description", () => {
  const keys = (query: string) => filterSettings(query).map((r) => r.key);
  assert.deepEqual(keys("preview"), ["preview_theme", "preview_font_size", "preview_code_font_family", "preview_code_font_size", "preview_paragraph_line_gap", "preview_paragraph_gap", "preview_list_line_gap", "preview_list_gap"]);
  assert.deepEqual(keys("EDITOR"), ["editor_theme", "buffer_font_family", "buffer_font_size", "editor_line_height", "editor_line_numbers", "editor_word_wrap", "editor_indent_guides", "editor_render_whitespace"]);
  assert.deepEqual(keys("ui"), ["theme", "icon_theme", "ui_font_size", "editor_indent_guides"]); // "guides" holds "ui"
  assert.deepEqual(keys("ui font size"), ["ui_font_size"]);
  assert.equal(keys("theme").length, 4);
  assert.equal(keys("font size").length, 5); // the Line Height and Code Font Size descriptions name the font size
  assert.equal(keys("missing").length, 0);
});

test("core v0.8.1 I-10: code fonts come from the bundled list, the code block size is a whole percent 50 to 150; anything else reads as the default", () => {
  const read = (json: string) => parseSettings(json, THEMES);
  assert.deepEqual([DEFAULTS.buffer_font_family, DEFAULTS.preview_code_font_family, DEFAULTS.preview_code_font_size], ["JetBrains Mono", "JetBrains Mono", 85]);
  for (const key of ["buffer_font_family", "preview_code_font_family"] as const) {
    for (const name of CODE_FONTS) assert.equal(read(`{"${key}":"${name}"}`)[key], name);
    for (const value of ['"Consolas"', '"jetbrains mono"', "1", "null"]) assert.equal(read(`{"${key}":${value}}`)[key], "JetBrains Mono", `${key} ${value}`);
    assert.deepEqual(settingMenu(key, "Hack", () => {}, THEMES).map((item) => [item.label, item.checked]), CODE_FONTS.map((name) => [name, name === "Hack"]));
  }
  for (const value of [50, 100, 150]) assert.equal(read(`{"preview_code_font_size":${value}}`).preview_code_font_size, value);
  for (const value of [49, 151, 85.5, '"85"', "null"]) assert.equal(read(`{"preview_code_font_size":${value}}`).preview_code_font_size, 85, String(value));
  assert.deepEqual([settingNumber("preview_code_font_size", 200), settingNumber("preview_code_font_size", 10), settingNumber("preview_code_font_size", 85.6)], [150, 50, 86]);
  // Saved the usual way: comments and unknown keys stay.
  const text = '{\n  // mine\n  "unknown": 1\n}\n';
  const saved = updateSettings(text, { buffer_font_family: "D2Coding", preview_code_font_size: 90 }, THEMES);
  assert.ok(saved.includes("// mine") && saved.includes('"unknown": 1'));
  assert.deepEqual([read(saved).buffer_font_family, read(saved).preview_code_font_size], ["D2Coding", 90]);
  assert.throws(() => updateSetting("{}", "preview_code_font_family", "Consolas", THEMES));
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


test("I-17: Load Defaults deletes the category's keys and keeps everything else", () => {
  const text = '﻿{\r\n  // keep\r\n  "unknown": 1,\r\n  "theme": "One Light",\r\n  "ui_font_size": 20,\r\n  // about the size\r\n  "buffer_font_size": 22, // note\r\n  "editor_word_wrap": false,\r\n  "preview_font_size": 24\r\n}\r\n';
  const keys = categoryKeys("Editor");
  const next = removeSettings(text, keys);
  assert.ok(keys.includes("buffer_font_size") && keys.includes("editor_word_wrap") && !keys.includes("preview_font_size"));
  assert.ok(!next.includes("buffer_font_size") && !next.includes("editor_word_wrap") && !next.includes("// note"));
  assert.ok(next.startsWith("﻿{\r\n") && next.includes("// keep") && next.includes("// about the size") && next.includes('"unknown": 1'));
  assert.equal(next.replace(/\r\n/g, "").includes("\n"), false); // line endings stay CRLF
  const s = parseSettings(next, THEMES);
  assert.equal(s.buffer_font_size, DEFAULTS.buffer_font_size);
  assert.equal(s.editor_word_wrap, DEFAULTS.editor_word_wrap);
  assert.deepEqual([s.theme, s.ui_font_size, s.preview_font_size], ["One Light", 20, 24]);
  assert.equal(removeSettings(next, keys), next); // nothing left to delete
});

test("I-17: deleting keys leaves valid JSONC for a first, last, only, inline and trailing-comma member", () => {
  const del = (text: string | null, ...keys: SettingKey[]) => removeSettings(text, keys);
  assert.equal(del('{\n  "a": 1,\n  "ui_font_size": 20\n}', "ui_font_size"), '{\n  "a": 1\n}'); // last: the comma before it goes
  assert.equal(del('{\n  "a": 1, // c\n  "ui_font_size": 20\n}', "ui_font_size"), '{\n  "a": 1 // c\n}');
  assert.equal(del('{\n  "ui_font_size": 20,\n  "a": 1\n}', "ui_font_size"), '{\n  "a": 1\n}'); // first
  assert.equal(del('{\n  "a": 1,\n  "ui_font_size": 20,\n}', "ui_font_size"), '{\n  "a": 1,\n}'); // trailing comma stays
  assert.equal(del('{\n  "ui_font_size": 20\n}\n', "ui_font_size"), "{\n}\n"); // only
  assert.equal(del('{ "a": 1, "ui_font_size": 20 }', "ui_font_size"), '{ "a": 1 }');
  assert.equal(del('{ "ui_font_size": 20, "a": 1 }', "ui_font_size"), '{ "a": 1 }');
  assert.equal(del('{"a":{"ui_font_size":1},"ui_font_size":20}', "ui_font_size"), '{"a":{"ui_font_size":1}}'); // nested keys stay
  const all = Object.keys(DEFAULTS) as SettingKey[];
  const full = JSON.stringify(Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, k === "theme" || k === "editor_theme" || k === "preview_theme" ? "One Dark" : v])), null, 2);
  for (const text of [full, "// c\n" + full, full.replace(/,\n/g, ",\n// x\n"), full.replace(/\n\s*/g, " ")]) {
    const out = del(text, ...all);
    assert.doesNotThrow(() => parseSettings(out, THEMES), out);
    assert.equal(out.replace(/\/\/ [cx]\n/g, "").replace(/\s/g, ""), "{}");
  }
  assert.equal(del(null), "");
  assert.equal(del("// only a comment\n", "theme"), "// only a comment\n");
  assert.throws(() => del("broken", "theme"));
});

import test from "node:test";
import assert from "node:assert/strict";
import { appendBinding, keymapRows, actionLabel, filterBindings, KEYMAP_EDITOR_BINDINGS } from "./edit.ts";
import { Keymap } from "./engine.ts";
import { stripJsonc } from "./user.ts";

test("K-11: append and change bindings preserve JSONC comments, unknown fields and trailing text", () => {
  for (const trailing of ["", ","]) {
    const text = '\uFEFF[\r\n// keep ]\r\n{"context":"Pane","custom":42,"bindings":{"ctrl-j":"pane::CloseActiveItem"}}' + trailing + '\r\n] // trailing ]';
    const previous = { action: "pane::CloseActiveItem", keys: "ctrl-j", context: "Pane", source: "User" as const };
    const edited = appendBinding(text, "Pane", "ctrl-k ctrl-j", previous.action, previous);
    assert.ok(edited.startsWith(text.slice(0, text.lastIndexOf("\r\n]"))));
    assert.ok(edited.endsWith("] // trailing ]"));
    assert.ok(edited.includes('"custom":42'));
    const sections = JSON.parse(stripJsonc(edited.replace(/^\uFEFF/, "")));
    const keymap = new Keymap();
    keymap.addSections("user", sections);
    assert.deepEqual(keymap.dispatch(["ctrl-j"], [new Set(["Pane"])]), { type: "none" });
    assert.deepEqual(keymap.dispatch(["ctrl-k", "ctrl-j"], [new Set(["Pane"])]), { type: "match", action: previous.action });
  }
  assert.equal(JSON.parse(appendBinding(null, "", "ctrl-j", "pane::CloseActiveItem"))[0].bindings["ctrl-j"], "pane::CloseActiveItem");
  assert.throws(() => appendBinding("invalid", "", "ctrl-j", "x"));
  assert.throws(() => appendBinding("[]", "", "", "x"));
  assert.throws(() => appendBinding("[[]]", "", "ctrl-j", "x"));
  assert.throws(() => appendBinding("[/* unfinished", "", "ctrl-j", "x"));
  const unchanged = appendBinding('[{"context":"Pane","bindings":{"ctrl-j":"pane::CloseActiveItem"}}]', "Pane", "ctrl-j", "pane::CloseActiveItem");
  assert.equal(JSON.parse(unchanged).length, 2);
  const old = { keys: "ctrl-w", context: "Pane", action: "pane::CloseActiveItem", source: "Default" as const };
  const keepOther = appendBinding('[{"context":"Pane","bindings":{"ctrl-w":"editor::Undo"}}]', "Pane", "ctrl-j", old.action, old);
  const preserved = new Keymap();
  preserved.addSections("user", JSON.parse(keepOther));
  assert.deepEqual(preserved.dispatch(["ctrl-w"], [new Set(["Pane"])]), { type: "match", action: "editor::Undo" });
});

test("K-11: rows include defaults, user overrides, nulls and unbound actions; filter uses readable action names", () => {
  const rows = keymapRows([{ context: "Pane", bindings: { "ctrl-w": "pane::CloseActiveItem" } }], '[{"bindings":{"ctrl-j":null}}]', ["pane::CloseActiveItem", "zed::OpenKeymap"]);
  assert.equal(rows.length, 3);
  assert.equal(actionLabel("pane::CloseActiveItem"), "pane: close active item");
  assert.equal(filterBindings(rows, "PANE close").length, 1);
  assert.equal(filterBindings(rows, "OpenKeymap").length, 1);
  assert.equal(filterBindings(rows, "missing").length, 0);
  assert.ok(rows.some((r) => r.source === "User" && r.action === null));
  const keymap = new Keymap();
  keymap.addSections("default", KEYMAP_EDITOR_BINDINGS);
  assert.deepEqual(keymap.dispatch(["ctrl-k", "ctrl-s"], [new Set(["Workspace"])]), { type: "match", action: "zed::OpenKeymap" });
  assert.deepEqual(keymap.dispatch(["ctrl-e"], [new Set(["Workspace"]), new Set(["KeymapEditor"])]), { type: "match", action: "keymap_editor::EditInJson" });
});

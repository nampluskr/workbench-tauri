import test from "node:test";
import assert from "node:assert/strict";
import { createSignal } from "solid-js";
import { statusButtons, statusItems } from "./status.ts";
import { commands, keymap } from "../keymap/keyboard.ts";
import { shortcutFor } from "../keymap/display.ts";
import type { Tab } from "../workspace/context.ts";

test("I-22 / I-19: status buttons retain Zed's order, state, labels and tooltip shortcuts", () => {
  const stack = [new Set(["Workspace"]), new Set(["Pane"]), new Set(["Editor"])];
  for (const sidebar of [false, true]) for (const dock of [false, true]) for (const locked of [false, true]) for (const outline of [false, true]) {
    const buttons = statusButtons(sidebar, dock, locked, outline);
    assert.deepEqual(buttons.flatMap((button) => [button.name, ...(button.dividerAfter ? ["divider"] : [])]), [
      ...(!sidebar ? ["threads_sidebar_left_closed", "divider"] : []),
      "file_tree", "divider", "list_tree", "divider", "magnifying_glass", "eye",
    ]);
    assert.deepEqual(buttons.map((button) => [button.name, button.label, button.toggled]), [
      ...(!sidebar ? [["threads_sidebar_left_closed", "Open Folder Sidebar", undefined]] : []),
      ["file_tree", dock ? "Close Left Dock" : "Project Panel", dock],
      ["list_tree", outline ? "Close Outline" : "Outline", outline],
      ["magnifying_glass", "Search", undefined],
      ["eye", "Lock Preview", locked],
    ]);
    assert.deepEqual(buttons.map((button) => shortcutFor(keymap, button.action, stack)?.join(" ")), [
      ...(!sidebar ? ["Ctrl-Alt-J"] : []), dock ? "Ctrl-B" : "Ctrl-Shift-E", undefined, "Ctrl-Shift-F", undefined,
    ]);
  }
  for (const [stroke, action] of [["ctrl-shift-f", "pane::DeploySearch"]]) {
    assert.deepEqual(keymap.dispatch([stroke], stack), { type: "match", action });
    assert.equal(typeof commands.get(action), "function");
    assert.doesNotThrow(() => commands.get(action)!());
  }
  assert.deepEqual(keymap.dispatch(["ctrl-shift-m"], stack), { type: "none" });
});

test("I-5: active editor and preview status follows each tab; tools, loading editors and no tab hide both items", () => {
  const [position, setPosition] = createSignal("1:1");
  const tab = { path: "C:\\project\\a.py", file: { position } } as Tab;
  assert.deepEqual(statusItems(tab), { position: "1:1", filetype: "Python" });
  setPosition("5:28 (5 characters)");
  assert.deepEqual(statusItems(tab), { position: "5:28 (5 characters)", filetype: "Python" });
  assert.equal(statusItems(undefined), undefined);
  assert.equal(statusItems({ ...tab, tool: true }), undefined);
  assert.deepEqual(statusItems({ ...tab, tool: true, file: { ...tab.file, toolPosition: () => "45:35 (8 characters)" } }), { position: "45:35 (8 characters)", filetype: "" });
  assert.equal(statusItems({ ...tab, file: { ...tab.file, position: undefined } }), undefined);
  const preview = { ...tab, markdown: true, file: { ...tab.file, position: () => "8:1" } };
  assert.deepEqual(statusItems(preview), { position: "8:1", filetype: "Python" }); // the preview tab shows its file's own kind
  assert.equal(statusItems({ ...preview, path: "C:\\project\\a.csv" })?.filetype, "Plain Text"); // no CSV kind exists; a CSV preview shows what its editor tab shows
  assert.deepEqual(statusItems(tab), { position: "5:28 (5 characters)", filetype: "Python" });
});

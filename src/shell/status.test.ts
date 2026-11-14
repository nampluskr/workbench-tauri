import test from "node:test";
import assert from "node:assert/strict";
import { createSignal } from "solid-js";
import { statusButtons, statusItems } from "./status.ts";
import { hasSearchTab, searchPath } from "../workspace/tab-view.ts";
import { commands, keymap } from "../keymap/keyboard.ts";
import { shortcutFor } from "../keymap/display.ts";
import type { Tab } from "../workspace/context.ts";

test("I-22 / I-19: status buttons retain Zed's order, state, labels and tooltip shortcuts", () => {
  const stack = [new Set(["Workspace"]), new Set(["Pane"]), new Set(["Editor"])];
  for (const sidebar of [false, true]) for (const dock of [false, true]) for (const locked of [false, true]) for (const outline of [false, true]) {
    const buttons = statusButtons(sidebar, dock, locked, outline, false);
    assert.deepEqual(buttons.flatMap((button) => [button.name, ...(button.dividerAfter ? ["divider"] : [])]), [
      sidebar ? "threads_sidebar_left_open" : "threads_sidebar_left_closed", "divider",
      "file_tree", "divider", "list_tree", "divider", "magnifying_glass", "eye",
    ]);
    assert.deepEqual(buttons.map((button) => [button.name, button.label, button.toggled]), [
      sidebar ? ["threads_sidebar_left_open", "Toggle Folder", true] : ["threads_sidebar_left_closed", "Toggle Folder", false],
      ["file_tree", "Toggle Tree", dock],
      ["list_tree", "Toggle Outline", outline],
      ["magnifying_glass", "Search", false],
      ["eye", "Lock Preview", locked],
    ]);
    assert.deepEqual(buttons.slice(0, 3).map((button) => button.action), ["multi_workspace::ToggleWorkspaceSidebar", "workspace::ToggleLeftDock", "outline_panel::Toggle"]);
    assert.deepEqual(buttons.map((button) => shortcutFor(keymap, button.action, stack)?.join(" ")), [
      "Ctrl-Alt-1", "Ctrl-Alt-2", "Ctrl-Alt-3", "Ctrl-Shift-F", undefined,
    ]);
  }
  for (const [stroke, action] of [["ctrl-shift-f", "pane::DeploySearch"]]) {
    assert.deepEqual(keymap.dispatch([stroke], stack), { type: "match", action });
    assert.equal(typeof commands.get(action), "function");
    assert.doesNotThrow(() => commands.get(action)!());
  }
  assert.deepEqual(keymap.dispatch(["ctrl-shift-m"], stack), { type: "none" });
});

test("core v0.8.2 I-1: each of the five left buttons is on by its own condition; Search by a Search tab in any pane of the folder", () => {
  const on = (...args: Parameters<typeof statusButtons>) => statusButtons(...args).map((button) => button.toggled);
  assert.deepEqual(on(false, false, false, false, false), [false, false, false, false, false]);
  assert.deepEqual(on(true, false, false, false, false), [true, false, false, false, false]); // folder sidebar open
  assert.deepEqual(on(false, true, false, false, false), [false, true, false, false, false]); // left dock open
  assert.deepEqual(on(false, false, false, true, false), [false, false, true, false, false]); // Outline open
  assert.deepEqual(on(false, false, false, false, true), [false, false, false, true, false]); // a Search tab exists
  assert.deepEqual(on(false, false, true, false, false), [false, false, false, false, true]); // Lock Preview
  assert.deepEqual(on(true, true, true, true, true), [true, true, true, true, true]);
  // The sidebar button stays in both states, with its own icon; the Search button's click is the same either way.
  assert.deepEqual([true, false].map((open) => statusButtons(open, false, false, false, false)[0].name), ["threads_sidebar_left_open", "threads_sidebar_left_closed"]);
  assert.deepEqual([true, false].map((open) => statusButtons(false, false, false, false, open)[3].action), ["pane::DeploySearch", "pane::DeploySearch"]);
  // `tabs` is every tab of the folder's panes (allTabs): a Search tab anywhere counts, other tool tabs and files do not.
  const file = { path: "C:\\p\\Search:1.md" }, image = { path: "C:\\p\\a.png", tool: true }, search = { path: searchPath(3), tool: true };
  assert.equal(hasSearchTab([]), false);
  assert.equal(hasSearchTab([file, image, { path: "Search:1" }]), false);
  assert.equal(hasSearchTab([file, image, search]), true);
  assert.equal(hasSearchTab([file, image]), false); // the last Search tab closed
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
  const preview = { ...tab, markdown: true, file: { ...tab.file, position: () => "8" } }; // core v0.8.3 I-15: a preview's position is its line only
  assert.deepEqual(statusItems(preview), { position: "8", filetype: "Python" }); // the preview tab shows its file's own kind
  assert.equal(statusItems({ ...preview, path: "C:\\project\\a.csv" })?.filetype, "Plain Text"); // no CSV kind exists; a CSV preview shows what its editor tab shows
  assert.deepEqual(statusItems(tab), { position: "5:28 (5 characters)", filetype: "Python" });
});

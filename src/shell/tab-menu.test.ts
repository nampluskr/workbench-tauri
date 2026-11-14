import test from "node:test";
import assert from "node:assert/strict";
import { tabMenu, type MenuTab } from "./tab-menu.ts";
import { Keymap } from "../keymap/engine.ts";
import { BUILTIN } from "../keymap/builtin.ts";
import { TAB_BINDINGS } from "./tab-menu.ts";
import { shortcutForEntry } from "./menu.ts";

const tab = (extra: Partial<MenuTab> = {}): MenuTab => ({ path: "D:\\w\\a.md", preview: false, dirty: false, readOnly: false, ...extra });
const labels = (tabs: MenuTab[], index = 0) => tabMenu(tabs, index).map((e) => e === "separator" ? "|" : e.label);
const close = ["Close", "Close Others", "|", "Close Left", "Close Right", "|", "Close Clean", "Close All"];

test("I-9: preview, Markdown editor, code editor and tool menu groups match the approved order", () => {
  assert.deepEqual(labels([tab({ markdown: true })]), [...close, "|", "Make Tab Read-Only", "|", "Pin Tab", "|", "Show Source"]);
  const file = [...close, "|", "Make Tab Read-Only", "|", "Pin Tab", "|", "Copy Path", "Copy Relative Path", "|", "Reveal in File Explorer", "Reveal in Tree Sidebar"];
  assert.deepEqual(labels([tab()]), [...file, "|", "Open Preview"]);
  assert.deepEqual(labels([tab({ path: "D:\\w\\a.py" })]), file);
  assert.deepEqual(labels([tab({ tool: true })]), [...close, "|", "Pin Tab"]);
  const locked = labels([tab({ readOnly: true, pinned: true })]);
  assert.ok(locked.includes("Make Tab Editable"));
  assert.ok(locked.includes("Unpin Tab"));
});

test("I-9: disabled close entries use the clicked tab, neighbor positions and clean tabs", () => {
  const disabled = (tabs: MenuTab[], index: number) => tabMenu(tabs, index).flatMap((e) => e !== "separator" && e.disabled ? [e.label] : []);
  assert.deepEqual(disabled([tab({ dirty: true })], 0), ["Close Others", "Close Left", "Close Right", "Close Clean"]);
  assert.deepEqual(disabled([tab(), tab({ dirty: true })], 1), ["Close Right"]);
  assert.deepEqual(disabled([tab({ pinned: true }), tab({ dirty: true })], 1), ["Close Right"]);
});

test("I-9: shortcut display uses the keymap; Close and Copy Relative Path have no printed shortcut", () => {
  const keys = new Keymap();
  keys.addSections("default", [...BUILTIN, ...TAB_BINDINGS]);
  const stack = [new Set(["Workspace"]), new Set(["Pane"])];
  const entries = tabMenu([tab()], 0);
  const shortcut = (label: string) => shortcutForEntry(entries.find((e) => e !== "separator" && e.label === label)!, keys, stack);
  assert.equal(shortcut("Close"), undefined);
  assert.equal(shortcut("Copy Relative Path"), undefined);
  assert.deepEqual(shortcut("Copy Path"), ["Ctrl-K", "P"]);
  assert.deepEqual(shortcut("Close Others"), ["Ctrl-Alt-Shift-T"]);
  assert.deepEqual(shortcut("Pin Tab"), ["Ctrl-K", "Shift-Enter"]);
  keys.addSections("user", [{ context: "Pane", bindings: { "alt-p": "workspace::CopyPath" } }]);
  assert.deepEqual(shortcut("Copy Path"), ["Alt-P"]);
});

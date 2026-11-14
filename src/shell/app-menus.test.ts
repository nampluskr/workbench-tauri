import test from "node:test";
import assert from "node:assert/strict";
import { appMenus, userMenu } from "./app-menus.ts";
import { first, shortcutForEntry, type MenuEntry } from "./menu.ts";
import { FONT_LICENSES, licenseText } from "./licenses.ts";
import { displayChunks } from "../keymap/display.ts";
import { BUILTIN, EDITOR_BINDINGS } from "../keymap/builtin.ts";
import { Keymap } from "../keymap/engine.ts";

const labels = (entries: MenuEntry[]) => entries.map((e) => e === "separator" ? "---" : e.label);

test("K-13: menu shortcuts match Zed Windows primary keys without changing Close Editor's action", () => {
  const keymap = new Keymap();
  keymap.addSections("default", BUILTIN);
  keymap.addSections("default", EDITOR_BINDINGS);
  const stack = [new Set(["Workspace"]), new Set(["Pane"]), new Set(["Editor", "extension=md"])];
  const menus = appMenus(() => false);
  const items = menus.flatMap((menu) => menu.entries).flatMap((entry) => entry !== "separator" && entry.children ? entry.children : [entry]);
  const keys = Object.fromEntries(items.filter((entry) => entry !== "separator").map((entry) => [entry.label, shortcutForEntry(entry, keymap, stack)?.join(" ")]));
  assert.deepEqual(keys, {
    Quit: "Ctrl-Q", "Open Folder...": "Ctrl-K Ctrl-O", Save: "Ctrl-S",
    "Close Editor": "Ctrl-W", "Close Window": "Ctrl-Shift-W", Undo: "Ctrl+Z", Redo: "Ctrl+Y",
    Cut: "Ctrl+X", Copy: "Ctrl+C", Paste: "Ctrl+V", Find: "Ctrl+F", Replace: "Ctrl+H",
    "Toggle Line Comment": "Ctrl+/", "Toggle Block Comment": "Shift+Alt+A", "Select All": "Ctrl+A",
    "Add Next Occurrence": "Ctrl+D", "Add Cursor Above": "Ctrl+Alt+Up", "Add Cursor Below": "Ctrl+Alt+Down",
    "Toggle Tree Sidebar": "Ctrl-Alt-2", "Toggle Folder Sidebar": "Ctrl-Alt-1", "Toggle Outline Sidebar": "Ctrl-Alt-3",
    "Split Up": "Ctrl-K Up", "Split Down": "Ctrl-K Down", "Split Left": "Ctrl-K Left", "Split Right": "Ctrl-\\",
    "Maximize Pane": "Shift-Escape",
    "Open Preview": "Ctrl-Shift-V", "Open Preview to the Side": "Ctrl-K V",
    About: undefined,
  });
  const close = menus[0].entries[4];
  if (close === "separator") assert.fail();
  assert.equal(close.action, "workspace::CloseActiveItem");
  assert.deepEqual(keymap.dispatch(["ctrl-w"], stack), { type: "match", action: "pane::CloseActiveItem" });
  for (const key of ["ctrl-y", "ctrl-shift-z"]) assert.deepEqual(keymap.dispatch([key], stack), { type: "match", action: "editor::Redo" });
  keymap.addSections("user", [{ context: "Editor", bindings: { "ctrl-alt-y": "editor::Redo" } }]);
  assert.deepEqual(shortcutForEntry(menus[1].entries[1], keymap, stack), ["Ctrl+Alt+Y"]);
});

test("K-10: menus start with File, end File with Quit and retain the other entries", () => {
  let disabled = false;
  const menus = appMenus(() => disabled);
  assert.deepEqual(menus.map((m) => m.name), ["File", "Edit", "View", "Help"]);
  assert.deepEqual(labels(menus[0].entries), ["Open Folder...", "---", "Save", "---", "Close Editor", "Close Window", "---", "Quit"]);
  assert.deepEqual(menus[0].entries.at(-1), { label: "Quit", action: "zed::Quit" });
  assert.deepEqual(labels(menus[1].entries), ["Undo", "Redo", "---", "Cut", "Copy", "Paste", "---", "Find", "Replace", "---", "Toggle Line Comment", "Toggle Block Comment", "---", "Select All", "Add Next Occurrence", "Add Cursor Above", "Add Cursor Below"]);
  assert.deepEqual(menus[1].entries.flatMap((e) => e !== "separator" && e.disabled ? [e.label] : []), []);
  assert.deepEqual(labels(menus[2].entries), ["Toggle Tree Sidebar", "Toggle Folder Sidebar", "Toggle Outline Sidebar", "Editor Layout", "Maximize Pane", "---", "Open Preview", "Open Preview to the Side"]);
  const layout = menus[2].entries[3];
  assert.notEqual(layout, "separator");
  if (layout !== "separator") assert.deepEqual(labels(layout.children!), ["Split Up", "Split Down", "Split Left", "Split Right"]);
  for (const item of menus[2].entries.slice(-2)) {
    if (item === "separator") assert.fail();
    assert.equal(item.disabled, false);
    disabled = true;
    assert.equal(item.disabled, true);
    disabled = false;
  }
});

test("I-29: Help is About alone; I-28: there is no Go menu", () => {
  const menus = appMenus(() => true);
  assert.deepEqual(menus.map((m) => m.name), ["File", "Edit", "View", "Help"]);
  assert.deepEqual(menus.at(-1)!.entries, [{ label: "About", action: "zed::About" }]);
});

test("K-10-R1: Settings and Keymap are active; Panel Layout picks Left or Right Sidebars", () => {
  let side: "left" | "right" = "left";
  const USER_MENU = userMenu(() => side);
  assert.deepEqual(labels(USER_MENU), ["Settings", "Keymap", "Themes…", "Icon Themes…", "Extensions", "---", "Panel Layout"]);
  assert.deepEqual(USER_MENU.slice(0, 5).map((e) => e !== "separator" && e.shortcut ? displayChunks(e.shortcut) : []), [[], [], [], [], []]);
  const keymap = USER_MENU[1];
  if (keymap === "separator") assert.fail();
  assert.equal(keymap.action, "zed::OpenKeymap");
  assert.ok(!keymap.disabled);
  const icons = USER_MENU[3];
  if (icons === "separator") assert.fail();
  assert.equal(icons.action, "icon_theme_selector::Toggle");
  assert.ok(!icons.disabled);
  const themes = USER_MENU[2];
  if (themes === "separator") assert.fail();
  assert.equal(themes.action, "theme_selector::Toggle");
  assert.ok(!themes.disabled);
  const extensions = USER_MENU[4];
  if (extensions === "separator") assert.fail();
  assert.equal(extensions.action, "zed::Extensions");
  assert.ok(!extensions.disabled);
  assert.equal(first(USER_MENU), 0);
  const settings = USER_MENU[0];
  if (settings === "separator") assert.fail();
  assert.equal(settings.action, "zed::OpenSettings");
  const panel = USER_MENU[6];
  if (panel === "separator") assert.fail();
  // core v0.8.3 I-17: two rows, the side in use checked; no "Custom" row. Left keeps Classic's command ID.
  const rows = () => panel.children!.map((item) => item === "separator" ? null : [item.label, item.action, item.checked, !!item.disabled]);
  assert.deepEqual(rows(), [["Left Sidebars", "workspace::UseClassicLayout", true, false], ["Right Sidebars", "workspace::UseRightSidebars", false, false]]);
  assert.equal(first(panel.children!), 0);
  side = "right";
  assert.deepEqual(rows(), [["Left Sidebars", "workspace::UseClassicLayout", false, false], ["Right Sidebars", "workspace::UseRightSidebars", true, false]]);
});

test("K-09: license notices retain available text when a copy is missing", async () => {
  assert.deepEqual(FONT_LICENSES, ["/fonts/ibm-plex-sans/license.txt", "/fonts/lilex/OFL.txt", "/fonts/jetbrains-mono/OFL.txt", "/fonts/hack/LICENSE.md", "/fonts/ubuntu-mono/LICENCE.txt", "/fonts/ubuntu-mono/copyright.txt", "/fonts/d2coding/OFL.txt"]);
  assert.equal(await licenseText({ bundled: async () => "Full notice", missing: async () => { throw new Error("missing"); } }), "bundled\n\nFull notice\n\nmissing\n\nLicense copy unavailable.");
  assert.equal(await licenseText({}), "");
});

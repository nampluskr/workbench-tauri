import test from "node:test";
import assert from "node:assert/strict";
import { APP_NAME, appMenus, userMenu } from "./app-menus.ts";
import { isClassicLayout } from "./layout.ts";
import { PROJECT_PANEL_DEFAULT_WIDTH } from "../spec/metrics.ts";
import { first, shortcutForEntry, type MenuEntry } from "./menu.ts";
import { FONT_LICENSES, licenseText } from "./licenses.ts";
import { displayChunks } from "../keymap/display.ts";
import { BUILTIN } from "../keymap/builtin.ts";
import { Keymap } from "../keymap/engine.ts";

const labels = (entries: MenuEntry[]) => entries.map((e) => e === "separator" ? "---" : e.label);

test("K-13: menu shortcuts match Zed Windows primary keys without changing Close Editor's action", () => {
  const keymap = new Keymap();
  keymap.addSections("default", BUILTIN);
  const stack = [new Set(["Workspace"]), new Set(["Pane"]), new Set(["Editor", "extension=md"])];
  const menus = appMenus(() => false);
  const items = menus.flatMap((menu) => menu.entries).flatMap((entry) => entry !== "separator" && entry.children ? entry.children : [entry]);
  const keys = Object.fromEntries(items.filter((entry) => entry !== "separator").map((entry) => [entry.label, shortcutForEntry(entry, keymap, stack)?.join(" ")]));
  assert.deepEqual(keys, {
    [`Quit ${APP_NAME}`]: "Ctrl-Q", "Open Folder...": "Ctrl-K Ctrl-O", Save: "Ctrl-S",
    "Close Editor": "Ctrl-W", "Close Window": "Ctrl-Shift-W", Undo: "Ctrl-Z", Redo: "Ctrl-Y",
    "Toggle Left Dock": "Ctrl-B", "Toggle Folder Sidebar": "Ctrl-Alt-J", "Focus Folder Sidebar": "Ctrl-Alt-;",
    "Split Up": "Ctrl-K Up", "Split Down": "Ctrl-K Down", "Split Left": "Ctrl-K Left", "Split Right": "Ctrl-\\",
    "Maximize Pane": "Shift-Escape", "Project Panel": "Ctrl-Shift-E",
    "Open Markdown Preview": "Ctrl-Shift-V", "Open Markdown Preview to the Side": "Ctrl-K V",
    "Previous Tab": "Ctrl-PageUp", "Next Tab": "Ctrl-PageDown", Minimize: undefined, Zoom: undefined,
    "View Dependency Licenses": undefined, "File Bug Report...": undefined, "Request Feature...": undefined, [`${APP_NAME} Repository`]: undefined,
  });
  const close = menus[1].entries[4];
  if (close === "separator") assert.fail();
  assert.equal(close.action, "workspace::CloseActiveItem");
  assert.deepEqual(keymap.dispatch(["ctrl-w"], stack), { type: "match", action: "pane::CloseActiveItem" });
  for (const key of ["ctrl-y", "ctrl-shift-z"]) assert.deepEqual(keymap.dispatch([key], stack), { type: "match", action: "editor::Redo" });
  keymap.addSections("user", [{ context: "Editor", bindings: { "ctrl-alt-y": "editor::Redo" } }]);
  assert.deepEqual(shortcutForEntry(menus[2].entries[1], keymap, stack), ["Ctrl-Alt-Y"]);
});

test("K-09: implemented menus keep the pinned Zed order and split submenu", () => {
  let disabled = false;
  const menus = appMenus(() => disabled);
  assert.deepEqual(menus.map((m) => m.name), [APP_NAME, "File", "Edit", "View", "Go", "Window", "Help"]);
  assert.deepEqual(labels(menus[1].entries), ["Open Folder...", "---", "Save", "---", "Close Editor", "Close Window"]);
  assert.deepEqual(labels(menus[2].entries), ["Undo", "Redo"]);
  assert.deepEqual(labels(menus[3].entries), ["Toggle Left Dock", "Toggle Folder Sidebar", "Focus Folder Sidebar", "Editor Layout", "Maximize Pane", "---", "Project Panel", "Open Markdown Preview", "Open Markdown Preview to the Side"]);
  const layout = menus[3].entries[3];
  assert.notEqual(layout, "separator");
  if (layout !== "separator") assert.deepEqual(labels(layout.children!), ["Split Up", "Split Down", "Split Left", "Split Right"]);
  for (const item of menus[3].entries.slice(-2)) {
    if (item === "separator") assert.fail();
    assert.equal(item.disabled, false);
    disabled = true;
    assert.equal(item.disabled, true);
    disabled = false;
  }
  assert.deepEqual(labels(menus[4].entries), ["Previous Tab", "Next Tab"]);
  assert.deepEqual(labels(menus[5].entries), ["Minimize", "Zoom"]);
});

test("K-09: Help sends the repository's issue and repository URLs, without opening a browser", () => {
  const help = appMenus(() => true).at(-1)!.entries;
  assert.deepEqual(labels(help), ["View Dependency Licenses", "---", "File Bug Report...", "Request Feature...", "---", `${APP_NAME} Repository`]);
  assert.deepEqual(help.flatMap((e) => e !== "separator" && e.url ? [e.url] : []), [
    "https://github.com/nampluskr/workbench-tauri/issues/new",
    "https://github.com/nampluskr/workbench-tauri/issues/new",
    "https://github.com/nampluskr/workbench-tauri",
  ]);
});

test("K-10-R1: Settings, Keymap and Classic are active; custom layout is checked and disabled", () => {
  let classic = true;
  const USER_MENU = userMenu(() => classic);
  assert.deepEqual(labels(USER_MENU), ["Settings", "Keymap", "Themes…", "Icon Themes…", "Extensions", "---", "Panel Layout"]);
  assert.deepEqual(USER_MENU.slice(0, 5).map((e) => e !== "separator" && e.shortcut ? displayChunks(e.shortcut) : []), [[], [], [], [], []]);
  const keymap = USER_MENU[1];
  if (keymap === "separator") assert.fail();
  assert.equal(keymap.action, "zed::OpenKeymap");
  assert.ok(!keymap.disabled);
  assert.ok([3].every((i) => USER_MENU[i] !== "separator" && USER_MENU[i].disabled));
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
  assert.deepEqual(labels(panel.children!), ["Classic"]);
  assert.equal(first(panel.children!), 0);
  assert.equal(panel.children![0] !== "separator" && panel.children![0].checked, true);
  classic = false;
  assert.deepEqual(labels(panel.children!), ["Classic", "Custom"]);
  assert.deepEqual(panel.children!.map((item) => item === "separator" ? null : [item.checked, !!item.disabled]), [[false, false], [true, true]]);
  assert.ok(isClassicLayout(true, PROJECT_PANEL_DEFAULT_WIDTH));
  assert.ok(!isClassicLayout(false, PROJECT_PANEL_DEFAULT_WIDTH));
  assert.ok(!isClassicLayout(true, PROJECT_PANEL_DEFAULT_WIDTH + 1));
});

test("K-09: license notices retain available text when a copy is missing", async () => {
  assert.deepEqual(FONT_LICENSES, ["/fonts/ibm-plex-sans/license.txt", "/fonts/lilex/OFL.txt"]);
  assert.equal(await licenseText({ bundled: async () => "Full notice", missing: async () => { throw new Error("missing"); } }), "bundled\n\nFull notice\n\nmissing\n\nLicense copy unavailable.");
  assert.equal(await licenseText({}), "");
});

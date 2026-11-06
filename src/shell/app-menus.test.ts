import test from "node:test";
import assert from "node:assert/strict";
import { APP_NAME, appMenus, USER_MENU } from "./app-menus.ts";
import { first, type MenuEntry } from "./menu.ts";
import { FONT_LICENSES, licenseText } from "./licenses.ts";
import { displayChunks } from "../keymap/display.ts";

const labels = (entries: MenuEntry[]) => entries.map((e) => e === "separator" ? "---" : e.label);

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

test("K-09: user menu has display-only shortcuts and a reachable disabled layout submenu", () => {
  assert.deepEqual(labels(USER_MENU), ["Settings", "Keymap", "Themes…", "Icon Themes…", "Extensions", "---", "Panel Layout"]);
  assert.deepEqual(USER_MENU.slice(0, 5).map((e) => e !== "separator" && e.shortcut ? displayChunks(e.shortcut) : []), [["Ctrl-,"], ["Ctrl-K", "Ctrl-S"], ["Ctrl-K", "Ctrl-T"], [], ["Ctrl-Shift-X"]]);
  assert.ok(USER_MENU.slice(0, 5).every((e) => e !== "separator" && e.disabled && !e.action));
  assert.equal(first(USER_MENU), 6);
  const panel = USER_MENU[6];
  if (panel === "separator") assert.fail();
  assert.deepEqual(labels(panel.children!), ["Classic", "Agentic"]);
  assert.equal(first(panel.children!), null);
});

test("K-09: license notices retain available text when a copy is missing", async () => {
  assert.deepEqual(FONT_LICENSES, ["/fonts/ibm-plex-sans/license.txt", "/fonts/lilex/OFL.txt"]);
  assert.equal(await licenseText({ bundled: async () => "Full notice", missing: async () => { throw new Error("missing"); } }), "bundled\n\nFull notice\n\nmissing\n\nLicense copy unavailable.");
  assert.equal(await licenseText({}), "");
});

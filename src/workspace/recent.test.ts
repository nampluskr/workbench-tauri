import test from "node:test";
import assert from "node:assert/strict";
import { keymap } from "../keymap/keyboard.ts";
import { shortcutFor } from "../keymap/display.ts";
import { addRecent, dropMissing, RECENT_MAX, removeRecent, showWelcome, stepRow, welcomeSections } from "./recent.ts";
import { OUTLINE_DEFAULT, parseState, serializeState } from "./state-file.ts";

const WELCOME = [new Set(["Workspace"]), new Set(["Pane"]), new Set(["Welcome", "menu"])];
const keysFor = (action: string) => shortcutFor(keymap, action, WELCOME);

test("core v0.8.2 I-3: Welcome shows only with no folder open; its rows, with keys read from the keymap; no recent folders, no section", () => {
  assert.deepEqual([showWelcome(0, false), showWelcome(1, false), showWelcome(0, true), showWelcome(2, true)], [true, false, false, false]);

  const bare = welcomeSections([], keysFor);
  assert.deepEqual(bare.map((s) => s.title), ["Get Started"]); // no RECENT FOLDERS section
  assert.deepEqual(bare[0].rows, [
    { icon: "folder_open", label: "Open Folder", action: "workspace::Open", keys: ["Ctrl-K", "Ctrl-O"] },
    { icon: "settings", label: "Open Settings", action: "zed::OpenSettings", keys: ["Ctrl-,"] },
  ]);
  // A user binding shows instead; an unbound action has no key area.
  keymap.add("user", [{ keys: "ctrl-alt-o", action: "workspace::Open", context: "Workspace" }, { keys: "ctrl-,", action: null, context: "Workspace" }]);
  try { assert.deepEqual(welcomeSections([], keysFor)[0].rows.map((r) => r.keys), [["Ctrl-Alt-O"], undefined]); }
  finally { keymap.clear("user"); }

  const paths = ["D:\\projects\\workbench-core", "D:\\tmp\\v081-zed-i16-ws", "D:\\projects"];
  const [, recent] = welcomeSections(paths, keysFor);
  assert.equal(recent.title, "Recent Folders");
  assert.deepEqual(recent.rows.map((r) => [r.icon, r.label, r.action, r.keys]), [
    ["folder", "workbench-core", "welcome::OpenRecentProject1", ["Ctrl-1"]],
    ["folder", "v081-zed-i16-ws", "welcome::OpenRecentProject2", ["Ctrl-2"]],
    ["folder", "projects", "welcome::OpenRecentProject3", ["Ctrl-3"]],
  ]);
  assert.equal(welcomeSections(Array.from({ length: 8 }, (_, i) => `D:\\p${i}`), keysFor)[1].rows.length, RECENT_MAX);
  // Ctrl-1 is the Welcome screen's only: elsewhere the key is not bound.
  assert.deepEqual(keymap.dispatch(["ctrl-1"], WELCOME), { type: "match", action: "welcome::OpenRecentProject1" });
  assert.deepEqual(keymap.dispatch(["ctrl-1"], WELCOME.slice(0, 2)), { type: "none" });
  // Up / Down / Enter are the menu actions there; the selection wraps, and starts at an end.
  assert.deepEqual(["down", "up", "enter"].map((key) => keymap.dispatch([key], WELCOME)), ["menu::SelectNext", "menu::SelectPrevious", "menu::Confirm"].map((action) => ({ type: "match", action })));
  assert.deepEqual([stepRow(5, -1, 1), stepRow(5, -1, -1), stepRow(5, 4, 1), stepRow(5, 0, -1), stepRow(5, 2, 1), stepRow(0, -1, 1)], [0, 4, 0, 4, 3, -1]);
});

test("core v0.8.2 I-3: recent folders: the opened one first, once, five at most; kept in the state file; gone ones dropped", () => {
  let list: string[] = [];
  for (const path of ["D:\\a", "D:\\b", "D:\\c"]) list = addRecent(list, path);
  assert.deepEqual(list, ["D:\\c", "D:\\b", "D:\\a"]);
  assert.deepEqual(addRecent(list, "d:\\A\\"), ["d:\\A\\", "D:\\c", "D:\\b"]); // the same folder moves up, not doubled
  for (const path of ["D:\\d", "D:\\e", "D:\\f"]) list = addRecent(list, path);
  assert.deepEqual(list, ["D:\\f", "D:\\e", "D:\\d", "D:\\c", "D:\\b"]); // the oldest is out

  // Saved and read back, beside the keys of the state file that are not ours.
  const mem = { folders: [], activeId: null, sidebarWidth: 300, lockPreview: false, outline: OUTLINE_DEFAULT, recent: list };
  const text = serializeState({ other: 1, windows: [{ id: "w1", window: { x: 1 } }] }, mem);
  assert.deepEqual(parseState(text).recent, list);
  assert.deepEqual([JSON.parse(text).other, JSON.parse(text).windows[0].window], [1, { x: 1 }]);
  assert.deepEqual(parseState(null).recent, []);
  assert.deepEqual(parseState(JSON.stringify({ windows: [{ folders: [] }] })).recent, []); // a 0.8.1 file
  assert.deepEqual(parseState(JSON.stringify({ windows: [{ recent_folders: ["D:\\a", 5, null, "D:\\b", "3", "4", "5", "6"] }] })).recent, ["D:\\a", "D:\\b", "3", "4", "5"]);
  assert.deepEqual(parseState(JSON.stringify({ windows: [{ recent_folders: "D:\\a" }] })).recent, []);

  // A folder that no longer exists (paths_exist at startup, or a failed open) leaves the list.
  assert.deepEqual(dropMissing(list, [true, false, true, false, true]), ["D:\\f", "D:\\d", "D:\\b"]);
  assert.deepEqual(dropMissing(list, []), list); // the check failed: nothing is dropped
  assert.deepEqual(removeRecent(list, "d:\\E"), ["D:\\f", "D:\\d", "D:\\c", "D:\\b"]);
  assert.equal(removeRecent(list, "D:\\zz").length, list.length);
});

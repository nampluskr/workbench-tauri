import test from "node:test";
import assert from "node:assert/strict";
import { addOrActivate, displayNames, filterFolders, folderLabel, move, moveCursor, remove, rename, type Folder } from "./folders.ts";
import { folderName, normalizePath, parentName, pathKey, truncateName } from "./paths.ts";
import { parseState, serializeState, STATE_VERSION } from "./state-file.ts";

const folder = (id: string, path: string): Folder => ({ id, path, added_at: "2026-11-06T00:00:00.000Z" });
const abc = [folder("a", "D:\\a"), folder("b", "D:\\b"), folder("c", "D:\\c")];

test("A-28.7~A-28.13: path normalization and comparison", () => {
  assert.equal(normalizePath("D:\\projects\\"), "D:\\projects");
  assert.equal(normalizePath("d:/projects"), "D:\\projects");
  assert.equal(normalizePath("C:\\"), "C:\\"); // a root keeps its backslash
  assert.equal(normalizePath("\\\\?\\C:\\work\\notes"), "C:\\work\\notes");
  assert.equal(normalizePath("\\\\?\\UNC\\nas\\share\\docs\\"), "\\\\nas\\share\\docs");
  assert.equal(normalizePath("\\\\nas\\share\\"), "\\\\nas\\share\\");
  assert.equal(normalizePath("D:\\a\\.\\b\\..\\c"), "D:\\a\\c"); // . and .. are removed
  assert.equal(pathKey("D:\\Projects"), pathKey("d:\\projects\\"));
  for (const bad of ["C:foo", "\\foo", "relative\\dir", "\\\\?\\Volume{1}\\x", "\\\\.\\pipe\\x"]) assert.equal(normalizePath(bad), null, bad);
});

test("A-12.6: only a name that is shared gets the folder above appended", () => {
  const names = displayNames(["D:\\a\\docs", "D:\\b\\docs", "D:\\x", "D:\\DOCS"]);
  assert.deepEqual(names.map((n) => n.parent), ["a", "b", "", "D:\\"]); // case-insensitive; a top-level folder shows its root
  assert.deepEqual(names.map((n) => n.name), ["docs", "docs", "x", "DOCS"]);
  assert.equal(folderName("C:\\"), "C:\\");
  assert.equal(parentName("C:\\"), "");
  assert.equal(truncateName("x".repeat(41), 40), "x".repeat(40) + "…");
  assert.equal(truncateName("x".repeat(40), 40), "x".repeat(40));
});

test("A-13.1, A-13.2, A-13.8: a new folder goes last and active; the same path only activates the old one", () => {
  let made = 0;
  const make = (): Folder => folder(`new${++made}`, "E:\\new");
  const added = addOrActivate(abc, "E:\\new", make);
  assert.deepEqual(added.folders.map((f) => f.id), ["a", "b", "c", "new1"]);
  assert.equal(added.activeId, "new1");
  const again = addOrActivate(added.folders, "e:/NEW/", make); // same folder written differently
  assert.equal(again.folders, added.folders);
  assert.equal(again.activeId, "new1");
  assert.equal(made, 1);
});

test("A-13.5: removing the active folder activates the one below, else above, else none; others keep the active one", () => {
  assert.equal(remove(abc, "b", "b").activeId, "c");
  assert.equal(remove(abc, "c", "c").activeId, "b");
  assert.equal(remove(abc, "a", "c").activeId, "c"); // not the active one
  assert.equal(remove([abc[0]], "a", "a").activeId, null);
  assert.deepEqual(remove(abc, "b", "b").folders.map((f) => f.id), ["a", "c"]);
});

test("R-10, A-17.3: drops reorder across multiple rows; the cursor stops at the ends", () => {
  assert.deepEqual(move(abc, "c", "a").map((f) => f.id), ["c", "a", "b"]);
  assert.deepEqual(move(abc, "a", "c").map((f) => f.id), ["b", "c", "a"]);
  assert.equal(move(abc, "a", "a"), abc);
  assert.equal(move(abc, "gone", "c"), abc);
  assert.equal(move(abc, "a", "gone"), abc);
  assert.equal(moveCursor(abc, null, 1), "a");
  assert.equal(moveCursor(abc, null, -1), "c");
  assert.equal(moveCursor(abc, "b", 1), "c");
  assert.equal(moveCursor(abc, "c", 1), "c");
  assert.equal(moveCursor(abc, "a", -1), "a");
  assert.equal(moveCursor([], null, 1), null);
});

test("A-20, A-22.6, A-24.7: unknown keys survive a round trip; a bad active id means the first folder; a newer version is read-only", () => {
  const text = JSON.stringify({
    version: 1,
    recent: [{ path: "D:\\x" }],
    windows: [
      {
        id: "w7",
        window: { x: 1 },
        folders: [{ id: "a", path: "D:\\a", added_at: "t", color: "red" }, { id: "b", path: "D:\\b", added_at: "t" }, { nope: 1 }, { id: "a", path: "D:\\dup", added_at: "t" }],
        active_folder_id: "gone",
        sidebar: { open: false, width: 250 },
      },
      { id: "w8" },
    ],
  });
  const loaded = parseState(text);
  assert.deepEqual(loaded.folders.map((f) => f.id), ["a", "b"]); // malformed and duplicate-id entries are dropped
  assert.equal(loaded.activeId, "a");
  assert.equal(loaded.sidebarWidth, 250);
  assert.equal(loaded.readOnly, false);
  const out = JSON.parse(serializeState(loaded.raw, { folders: [loaded.folders[1], loaded.folders[0]], activeId: "b", sidebarWidth: 400 }));
  assert.deepEqual(out.recent, [{ path: "D:\\x" }]); // unknown top-level key
  assert.deepEqual(out.windows[0].window, { x: 1 }); // unknown key of the window
  assert.deepEqual(out.windows[0].sidebar, { open: false, width: 400 }); // sibling of the width kept
  assert.equal(out.windows[0].folders[1].color, "red"); // unknown key of a folder
  assert.deepEqual(out.windows[0].folders.map((f: Folder) => f.id), ["b", "a"]);
  assert.equal(out.windows[0].active_folder_id, "b");
  assert.equal(out.windows[1].id, "w8"); // another window untouched
  assert.equal(parseState(JSON.stringify({ version: STATE_VERSION + 1 })).readOnly, true);
  assert.equal(parseState("{ not json").invalid, true);
  assert.deepEqual(parseState(null).folders, []);
});

test("R-11, A-22: state accepts Dock widths; invalid widths fall back to the default", () => {
  const out = JSON.parse(serializeState({}, { folders: abc, activeId: "a", sidebarWidth: 300 }));
  assert.equal(out.version, STATE_VERSION);
  assert.equal(out.windows[0].folders.length, 3);
  for (const width of [6, 240, 900])
    assert.equal(parseState(JSON.stringify({ windows: [{ sidebar: { width } }] })).sidebarWidth, width);
  for (const width of [0, -1, 5, null, "240", 1e400])
    assert.equal(parseState(JSON.stringify({ windows: [{ sidebar: { width } }] })).sidebarWidth, 300);
});

test("R-10, R-19: display names, order and width round trip; search uses renamed names and clearing restores all", () => {
  const renamed = rename(abc, "b", " Research ");
  assert.equal(folderLabel(renamed[1]), "Research");
  assert.equal(renamed[1].path, abc[1].path);
  assert.deepEqual(filterFolders(renamed, "sEaR").map((f) => f.id), ["b"]);
  assert.deepEqual(filterFolders(renamed, "b"), []);
  assert.equal(filterFolders(renamed, "").length, 3);
  assert.equal(folderLabel(rename(renamed, "b", "  ")[1]), "b");
  assert.equal(folderLabel({ ...abc[0], name: 12 } as unknown as Folder), "a");
  const saved = serializeState({}, { folders: move(renamed, "c", "a"), activeId: "b", sidebarWidth: 900 });
  const loaded = parseState(saved);
  assert.deepEqual(loaded.folders.map((f) => f.id), ["c", "a", "b"]);
  assert.equal(folderLabel(loaded.folders[2]), "Research");
  assert.equal(loaded.activeId, "b");
  assert.equal(loaded.sidebarWidth, 900);
  assert.deepEqual(displayNames(renamed.map((f) => f.path), renamed.map(folderLabel)).map((n) => n.name), ["a", "Research", "c"]);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BUILTIN, EDITOR_BINDINGS } from "./builtin.ts";
import { Keymap, parseKeys } from "./engine.ts";

// R-1: the built-in keymap must equal the expected table pinned in the current version's PROGRESS (Phase 2), row for row.
const progress = readFileSync(fileURLToPath(new URL("../../specs/v0.4/PROGRESS.md", import.meta.url)), "utf8");
const table = progress.slice(progress.indexOf("**R-1 기대 바인딩 표(v0.4)"), progress.indexOf("**우리가 지은 액션 이름"));
const row = (keys: string, context: string, action: string) => `${parseKeys(keys).join(" ")}\t${context}\t${action}`;

test("R-1: built-in keymap equals the PROGRESS expected table (key, context, action)", () => {
  const expected = new Set<string>();
  for (const line of table.split("\n").filter((l) => /^\| (I|A)-/.test(l))) {
    const [, , keys, , , context, action] = line.split("|").map((c) => c.trim().replace(/`/g, ""));
    expected.add(row(keys.replace(/ 키$/, "").replaceAll("+", "-"), context === "없음" ? "" : context, action));
  }
  // v0.8 M-5: the preview keys match every previewable extension, not only md; the pinned v0.4 table (a past version, read only) names md.
  const previewContext = /^Editor && \(extension == md \|\|[^)]*\)$/;
  const actual = new Set(BUILTIN.flatMap(({ context, bindings }) =>
    Object.entries(bindings).map(([keys, action]) => row(keys, previewContext.test(context ?? "") ? "Editor && extension == md" : context ?? "", String(action)))));
  assert.ok(expected.size > 50, "table not found in PROGRESS");
  assert.deepEqual([...actual].sort(), [...expected].sort());
});

// R-3: the same key means different things by focus. Delete removes a folder in the sidebar, trashes in the panel.
test("R-3: Delete and Backspace resolve by the deeper focus context", () => {
  const keymap = new Keymap();
  keymap.addSections("default", BUILTIN);
  const workspace = new Set(["Workspace"]);
  const sidebar = [workspace, new Set(["Sidebar"])];
  const panel = [workspace, new Set(["ProjectPanel", "menu", "not_editing"])];
  assert.deepEqual(keymap.dispatch(["delete"], sidebar), { type: "match", action: "project_panel::RemoveFromProject" });
  assert.deepEqual(keymap.dispatch(["delete"], panel), { type: "match", action: "project_panel::Trash" });
  assert.deepEqual(keymap.dispatch(["delete"], [workspace]), { type: "none" });
  // Panel keys that also exist in the menu context: the panel's own binding is the later one and wins at equal depth.
  assert.deepEqual(keymap.dispatch(["enter"], panel), { type: "match", action: "project_panel::Rename" });
  assert.deepEqual(keymap.dispatch(["down"], panel), { type: "match", action: "menu::SelectNext" });
  assert.deepEqual(keymap.dispatch(["right"], panel), { type: "match", action: "project_panel::ExpandSelectedEntry" });
  assert.deepEqual(keymap.dispatch(["space"], panel), { type: "match", action: "project_panel::Open" });
});

// U-13: Ctrl+Shift+Up/Down add a cursor only in the Editor; elsewhere the key stays unbound.
test("U-13: Ctrl+Shift+Up/Down add cursors in the Editor context only", () => {
  
  const keymap = new Keymap();
  keymap.addSections("default", BUILTIN);
  keymap.addSections("default", EDITOR_BINDINGS);
  const workspace = new Set(["Workspace"]);
  const editor = [workspace, new Set(["Editor"])], panel = [workspace, new Set(["ProjectPanel", "menu", "not_editing"])];
  assert.deepEqual(keymap.dispatch(["ctrl-shift-up"], editor), { type: "match", action: "editor::AddCursorAbove" });
  assert.deepEqual(keymap.dispatch(["ctrl-shift-down"], editor), { type: "match", action: "editor::AddCursorBelow" });
  assert.deepEqual(keymap.dispatch(["ctrl-alt-up"], editor), { type: "match", action: "editor::AddCursorAbove" });
  assert.deepEqual(keymap.dispatch(["ctrl-shift-up"], panel), { type: "none" });
});

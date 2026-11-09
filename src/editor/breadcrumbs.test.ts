import test from "node:test";
import assert from "node:assert/strict";
import { pathCrumb } from "./breadcrumbs.ts";

test("I-16: each open folder uses only its relative path, without a root label or drive letter", () => {
  for (const root of ["D:\\projects\\workbench-tauri", "C:\\other", "D:\\"]) {
    const prefix = root.endsWith("\\") ? root : root + "\\";
    for (const relative of ["AGENTS.md", "src\\shell\\Pane.tsx", "src\\main.py"]) {
      assert.equal(pathCrumb(root, prefix + relative), relative);
    }
  }
});

test("I-16: outside files show only their name; Windows folder matching ignores case", () => {
  assert.equal(pathCrumb("D:\\project", "C:\\elsewhere\\a.md"), "a.md");
  assert.equal(pathCrumb("D:\\project", "D:\\project-other\\a.md"), "a.md");
  assert.equal(pathCrumb("D:\\PROJECT", "d:\\project\\src\\file.ts"), "src\\file.ts");
});

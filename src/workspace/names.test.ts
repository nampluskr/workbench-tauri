import test from "node:test";
import assert from "node:assert/strict";
import { confirmName, existsError, inputKeyAction, renameSelection, validComponent, validationFor, WARN_WHITESPACE } from "./names.ts";

test("P-022: Enter drops trailing dots, turns a trailing slash into a folder, splits a path into pieces", () => {
  assert.deepEqual(confirmName("a.txt..", true, false), { parts: ["a.txt"], isDir: false });
  assert.deepEqual(confirmName("dir\\", true, false), { parts: ["dir"], isDir: true });
  assert.equal(confirmName("dir/", true, false)?.isDir, true);
  assert.deepEqual(confirmName("a/b\\c.rs", true, false)?.parts, ["a", "b", "c.rs"]);
  assert.equal(confirmName("   ", true, false), null);
  assert.equal(confirmName("...", true, false), null);
  assert.equal(confirmName("", true, false), null);
  assert.deepEqual(confirmName("x.md", false, false)?.parts, ["x.md"]); // a rename is one piece
  assert.equal(confirmName("a/b", false, false), null, "a rename has no separators");
  assert.equal(confirmName("new/", false, true), null, "a rename has no trailing-slash folder rule");
});

test("names Windows cannot hold are refused", () => {
  for (const bad of ["con", "NUL.txt", "a:b", "a?b", "x|y", "q\"r", "tab\tname", "..", "name."]) assert.equal(validComponent(bad), false, bad);
  for (const good of ["console", "a b", ".gitignore", "com10", "file (1).txt", "한글 이름.md"]) assert.equal(validComponent(good), true, good);
  assert.equal(confirmName("a/../b", true, false), null, "no piece may climb out");
});

test("P-021: taken is an error, blanks around the name a warning, else nothing", () => {
  assert.deepEqual(validationFor("a.txt", "a.txt", true), { kind: "error", text: existsError("a.txt") });
  assert.deepEqual(validationFor(" a.txt", "a.txt", false), { kind: "warning", text: WARN_WHITESPACE });
  assert.deepEqual(validationFor("a.txt ", "a.txt", false), { kind: "warning", text: WARN_WHITESPACE });
  assert.equal(validationFor("a.txt", "a.txt", false), null);
  assert.equal(validationFor(" a ", "a", true)?.kind, "error", "taken wins over blanks");
});

test("P-019: a rename selects the name without the extension (files) or the whole name (folders)", () => {
  assert.deepEqual(renameSelection("main.rs", false), [0, 4]);
  assert.deepEqual(renameSelection("archive.tar.gz", false), [0, 11]);
  assert.deepEqual(renameSelection(".gitignore", false), [0, 10]);
  assert.deepEqual(renameSelection("noext", false), [0, 5]);
  assert.deepEqual(renameSelection("v1.2", true), [0, 4]);
});

test("R-20: Enter and Escape do nothing while an IME is composing", () => {
  assert.equal(inputKeyAction({ key: "Enter", isComposing: false, keyCode: 13 }), "commit");
  assert.equal(inputKeyAction({ key: "Escape", isComposing: false, keyCode: 27 }), "cancel");
  assert.equal(inputKeyAction({ key: "Enter", isComposing: true, keyCode: 13 }), null);
  assert.equal(inputKeyAction({ key: "Escape", isComposing: true, keyCode: 27 }), null);
  assert.equal(inputKeyAction({ key: "Enter", isComposing: false, keyCode: 229 }), null, "keyCode 229 is a composing key even when isComposing is already false");
  const esc = { key: "Escape", isComposing: false, keyCode: 27 };
  assert.equal(inputKeyAction(esc, 5), null, "an Escape right after the composition ended is the IME's");
  assert.equal(inputKeyAction(esc, 500), "cancel");
  assert.equal(inputKeyAction({ key: "Enter", isComposing: false, keyCode: 13 }, 5), "commit", "Enter confirms the composed name");
  assert.equal(inputKeyAction({ key: "ArrowLeft", isComposing: false, keyCode: 37 }), null);
});

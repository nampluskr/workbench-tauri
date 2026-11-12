import test from "node:test";
import assert from "node:assert/strict";
import { deletePrompt, dragItems, dropJobs, failureText, moveTakenText, pasteJobs, relativePath, targetDir } from "./ops.ts";
import { buildRows, isDirPath, parentOf, targetsOf, type Listing } from "./tree.ts";
import { tildePath } from "./paths.ts";

const R = "D:\\proj";

test("A-14.7~A-14.9: the confirmation text of one item and of several", () => {
  assert.deepEqual(deletePrompt(["a.txt"], false, "workbench-tauri"), {
    title: "workbench-tauri",
    main: "Do you want to trash `a.txt`?",
    content: null,
    okLabel: "Trash",
  });
  const one = deletePrompt(["a.txt"], true, "t");
  assert.equal(one.main, "Are you sure you want to permanently delete `a.txt`?");
  assert.equal(one.content, "This cannot be undone.");
  assert.equal(one.okLabel, "Delete");
  assert.equal(deletePrompt(["a", "b"], false, "t").main, "Do you want to trash the following 2 files?\na\nb");
  assert.ok(deletePrompt(["a", "b"], true, "t").main.startsWith("Are you sure you want to permanently delete the following 2 files?\n"));
});

test("P-015: a long list shows ten names and counts the rest", () => {
  const names = Array.from({ length: 13 }, (_, i) => `f${i}`);
  const lines = deletePrompt(names, false, "t").main.split("\n");
  assert.equal(lines.length, 1 + 10 + 1);
  assert.equal(lines.at(-1), ".. 3 files not shown");
  assert.equal(deletePrompt(names.slice(0, 10), false, "t").main.split("\n").length, 11, "exactly ten: nothing is left out");
});

test("A-14.11: the failure text", () => {
  assert.equal(failureText(false, 2, 5), "Failed to trash 2 of 5 file(s).");
  assert.equal(failureText(true, 1, 1), "Failed to delete 1 of 1 file(s).");
});

test("I-549: relative paths; the folder itself is its name", () => {
  assert.equal(relativePath(R, "proj", R), "proj");
  assert.equal(relativePath(R, "proj", `${R}\\src\\main.rs`), "src\\main.rs");
  assert.equal(relativePath("D:\\", "D:\\", "D:\\a\\b"), "a\\b");
  assert.equal(relativePath(R, "proj", "E:\\elsewhere\\x"), "E:\\elsewhere\\x");
  assert.equal(relativePath(R, "proj", "D:\\project2\\x"), "D:\\project2\\x", "a sibling whose name starts the same is outside");
});

const listing: Listing = new Map([
  [R, [{ name: "docs", is_dir: true }, { name: "src", is_dir: true }, { name: "a.txt", is_dir: false }]],
  [`${R}\\docs`, [{ name: "guides", is_dir: true }]],
  [`${R}\\docs\\guides`, [{ name: "g.md", is_dir: false }]],
  [`${R}\\src`, [{ name: "m.rs", is_dir: false }, { name: "n.rs", is_dir: false }]],
]);
const rowsOf = (open: string[], extra = {}) => buildRows(R, "proj", new Set([R, ...open.map((p) => `${R}\\${p}`)]), listing, extra).rows;

test("I-091, I-036: New File goes in the selected folder, the folder of a selected file, else the root", () => {
  const rows = rowsOf(["docs\\guides", "src"]);
  assert.equal(targetDir(R, rows, `${R}\\src`), `${R}\\src`);
  assert.equal(targetDir(R, rows, `${R}\\src\\m.rs`), `${R}\\src`);
  assert.equal(targetDir(R, rows, `${R}\\a.txt`), R);
  assert.equal(targetDir(R, rows, `${R}\\docs`), `${R}\\docs`, "the first piece of a folded path is a folder");
  assert.equal(targetDir(R, rows, null), R);
  assert.equal(targetDir("D:\\", [], "D:\\a.txt"), "D:\\", "a file in a drive root");
  assert.equal(parentOf("\\\\srv\\share\\", "\\\\srv\\share\\x.txt"), "\\\\srv\\share\\");
  assert.equal(isDirPath(rows, `${R}\\docs`), true);
  assert.equal(isDirPath(rows, `${R}\\a.txt`), false);
});

test("P-019: the row of a new item: a folder first, a file after the folders; the folder it goes in is not folded", () => {
  const folder = rowsOf(["src"], { newEntry: { dir: R, isDir: true } }).map((r) => (r.isNew ? "<new>" : r.path.slice(R.length + 1) || "."));
  assert.deepEqual(folder, [".", "<new>", "docs\\guides", "src", "src\\m.rs", "src\\n.rs", "a.txt"]);
  const file = rowsOf([], { newEntry: { dir: R, isDir: false } }).map((r) => (r.isNew ? "<new>" : r.path.slice(R.length + 1) || "."));
  assert.deepEqual(file, [".", "docs\\guides", "src", "<new>", "a.txt"]);
  const inChain = buildRows(R, "proj", new Set([R, `${R}\\docs`]), listing, { newEntry: { dir: `${R}\\docs`, isDir: false } }).rows;
  assert.deepEqual(inChain.map((r) => (r.isNew ? "<new>" : r.segments.map((s) => s.name).join("\\"))), ["proj", "docs", "guides", "<new>", "src", "a.txt"]);
  assert.equal(inChain[1].segments.length, 1, "docs stays a row of its own while a name is typed in it");
  const last = rowsOf(["src"], { newEntry: { dir: `${R}\\src`, isDir: false } }).filter((r) => r.depth === 2).map((r) => (r.isNew ? "<new>" : "x"));
  assert.deepEqual(last, ["<new>", "x", "x"], "a new file takes the first place after the folders, even in a folder of files only");
});

test("I-543: Unfold Directory keeps a folder from folding into one row", () => {
  const folded = rowsOf([]).map((r) => r.segments.map((s) => s.name).join("\\"));
  assert.deepEqual(folded.slice(0, 2), ["proj", "docs\\guides"]);
  const unfolded = rowsOf([], { unfolded: new Set([`${R}\\docs`]) }).map((r) => r.segments.map((s) => s.name).join("\\"));
  assert.deepEqual(unfolded.slice(0, 2), ["proj", "docs"]);
});

test("I-562: an action works on the marked items when the selection is among them", () => {
  assert.deepEqual(targetsOf({ selected: "a", marked: ["a", "b"], anchor: "a" }), ["a", "b"]);
  assert.deepEqual(targetsOf({ selected: "c", marked: ["a", "b"], anchor: "a" }), ["c"]);
  assert.deepEqual(targetsOf({ selected: "a", marked: [], anchor: "a" }), ["a"]);
  assert.deepEqual(targetsOf({ selected: null, marked: [], anchor: null }), []);
});

test("R-22: cutting into the same folder does nothing; an item never goes into itself", () => {
  const jobs = pasteJobs([`${R}\\a.txt`, `${R}\\src\\m.rs`], R, true, R);
  assert.deepEqual(jobs, { run: [`${R}\\src\\m.rs`], refused: [] });
  assert.deepEqual(pasteJobs([`${R}\\a.txt`], R, false, R).run, [`${R}\\a.txt`], "a copy into its own folder makes a copy");
  assert.deepEqual(pasteJobs([`${R}\\src`], `${R}\\src\\deep`, false, R), { run: [], refused: [`${R}\\src`] });
  assert.deepEqual(pasteJobs([`${R}\\src`], `${R}\\src`, true, R), { run: [], refused: [`${R}\\src`] });
  assert.deepEqual(pasteJobs([`${R}\\src`], `${R}\\src2`, false, R).run, [`${R}\\src`], "a folder whose name starts the same is not inside");
});

test("L-247: the home folder shows as ~", () => {
  assert.equal(tildePath("C:\\Users\\me\\proj\\a.txt", "C:\\Users\\me"), "~\\proj\\a.txt");
  assert.equal(tildePath("c:\\users\\ME", "C:\\Users\\me"), "~");
  assert.equal(tildePath("C:\\Users\\me2\\a", "C:\\Users\\me"), "C:\\Users\\me2\\a");
  assert.equal(tildePath("D:\\x", null), "D:\\x");
});

test("I-3: a tree drag carries the marked items, never the root nor what is inside a carried folder", () => {
  assert.deepEqual(dragItems(R, [`${R}\\a.txt`, `${R}\\src`], `${R}\\b.txt`), [`${R}\\b.txt`], "pressed outside the marks: it alone");
  assert.deepEqual(dragItems(R, [`${R}\\src`, `${R}\\SRC\\m.rs`, `${R}\\src2`, R], `${R}\\src`), [`${R}\\src`, `${R}\\src2`]);
  assert.deepEqual(dragItems(R, [], R), []);
});

test("I-3: a drop does nothing on the item itself, its own folders or (a move) where it already is", () => {
  const src = `${R}\\src`, file = `${R}\\src\\m.rs`;
  assert.deepEqual(dropJobs([src], src, false, R), [], "onto itself");
  assert.deepEqual(dropJobs([src], `${src}\\deep`, false, R), [], "into its own folder");
  assert.deepEqual(dropJobs([file], src, false, R), [], "already there");
  assert.deepEqual(dropJobs([file], src, true, R), [file], "Ctrl copies into the same folder (a copy name, Rust transfer)");
  assert.deepEqual(dropJobs([file, `${R}\\a.txt`], src, false, R), [`${R}\\a.txt`], "of several, only those that move");
  assert.deepEqual(dropJobs([file], R, false, R), [file], "to the root");
  assert.equal(moveTakenText("p\\a.txt", "p\\src\\a.txt"), "Failed to move `p\\a.txt` to `p\\src\\a.txt`. A file or folder already exists there.");
});

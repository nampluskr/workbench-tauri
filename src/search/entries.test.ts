import test from "node:test";
import assert from "node:assert/strict";
import { entryDir, fileRow, modifiedText, sizeText, type SearchEntry } from "./entries.ts";

test("core v0.8.3 I-26: the Size cell is B, KB or MB (a folder has none) and the Modified cell is local YYYY-MM-DD HH:mm", () => {
  const size = (bytes: number) => sizeText({ path: "D:\\work\\a.bin", isDir: false, size: bytes });
  assert.deepEqual([0, 1023, 1024, 4096, 1024 * 1024 - 1, 1024 * 1024, 1.5 * 1024 * 1024, 5000 * 1024 * 1024].map(size),
    ["0 B", "1023 B", "1 KB", "4 KB", "1023 KB", "1.0 MB", "1.5 MB", "5000.0 MB"]);
  assert.equal(sizeText({ path: "D:\\work\\orders", isDir: true, size: 4096 }), ""); // a folder row's Size is empty
  assert.equal(sizeText({ path: "D:\\work\\a.bin", isDir: false }), "");
  assert.equal(modifiedText(new Date(2026, 10, 2, 10, 12, 59).getTime()), "2026-11-02 10:12");
  assert.equal(modifiedText(new Date(2026, 0, 5, 3, 4).getTime()), "2026-01-05 03:04");
  assert.equal(modifiedText(null), "");
  // The Path cell stops at the folder the entry is in.
  assert.deepEqual(["D:\\work\\specs\\v0.5\\orders\\ORDER-01.md", "D:\\work\\specs\\v0.5\\orders", "D:\\work\\README.md"].map((path) => entryDir("D:\\work", path)),
    ["specs\\v0.5\\orders", "specs\\v0.5", ""]);
});

test("U-22: Open File keeps the files among the name search results and leaves the folders out", () => {
  // What search_names streams for "read" (its substring match is tested in name_search.rs): a folder, two files, one nested.
  const entries: SearchEntry[] = [
    { path: "D:\\work\\reader", isDir: true }, { path: "D:\\work\\README.md", isDir: false }, { path: "D:\\work\\src\\thread.ts", isDir: false },
  ];
  const rows = entries.map((entry) => fileRow(entry, "D:\\work")).filter((row) => row !== null);
  assert.deepEqual(rows.map((row) => [row.name, row.rel]), [["README.md", "README.md"], ["thread.ts", "src\\thread.ts"]]);
});

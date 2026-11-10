import test from "node:test";
import assert from "node:assert/strict";
import { fileRow, type SearchEntry } from "./entries.ts";

test("U-22: Open File keeps the files among the name search results and leaves the folders out", () => {
  // What search_names streams for "read" (its substring match is tested in name_search.rs): a folder, two files, one nested.
  const entries: SearchEntry[] = [
    { path: "D:\\work\\reader", isDir: true }, { path: "D:\\work\\README.md", isDir: false }, { path: "D:\\work\\src\\thread.ts", isDir: false },
  ];
  const rows = entries.map((entry) => fileRow(entry, "D:\\work")).filter((row) => row !== null);
  assert.deepEqual(rows.map((row) => [row.name, row.rel]), [["README.md", "README.md"], ["thread.ts", "src\\thread.ts"]]);
});

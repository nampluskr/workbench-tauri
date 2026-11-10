import test from "node:test";
import assert from "node:assert/strict";
import { csvTable, parseCsv } from "./csv.ts";
import { hasPreview, previewKind } from "./preview-kind.ts";
import { Keymap } from "../keymap/engine.ts";
import { BUILTIN } from "../keymap/builtin.ts";

test("I-7: quoted fields, CRLF, empty cells, TSV and markup stay literal text", () => {
  assert.deepEqual(parseCsv('a,"b,c","d\ne","say ""hi"""\r\n1,,3\r\n', ","), [["a", "b,c", "d\ne", 'say "hi"'], ["1", "", "3"]]);
  assert.deepEqual(parseCsv("a,b\r1,2", ","), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCsv("a,b\n\n1,\n", ","), [["a", "b"], ["1", ""]]);
  assert.deepEqual(parseCsv("a,b\tc\n<b>x</b>\t2", "\t"), [["a,b", "c"], ["<b>x</b>", "2"]]);
  assert.deepEqual(parseCsv("", ","), []);
});

test("I-7: only the first 1,000 data rows are kept, and the note counts data rows without the header", () => {
  const file = (data: number) => ["h", ...Array.from({ length: data }, (_, i) => String(i))].join("\n");
  assert.equal(csvTable(file(1000), ",")!.note, null);
  const table = csvTable(file(1001), ",")!;
  assert.equal(table.rows.length, 1000);
  assert.equal(table.note, "Showing first 1,000 of 1,001 rows");
  assert.deepEqual(table.header, ["h"]);
  assert.equal(csvTable("", ","), null);
});

test("M-5: one check names the previewable files; a user binding of OpenPreview reaches .csv", () => {
  for (const path of ["C:\\a.md", "C:\\a.MARKDOWN", "C:\\a.csv", "C:\\a.TSV"]) assert.equal(hasPreview(path), true);
  for (const path of ["C:\\a.txt", "C:\\a.json", "C:\\a.html", "C:\\a.ipynb", "C:\\a.svg", "C:\\a.md.txt", "C:\\csv", "C:\\a.csv\\b"]) assert.equal(hasPreview(path), false);
  assert.equal(previewKind("C:\\a.Tsv"), "tsv");
  const keys = new Keymap();
  keys.addSections("default", BUILTIN);
  keys.addSections("user", [{ context: "Editor", bindings: { "alt-p": "markdown::OpenPreview" } }]);
  const editor = (ext: string) => [new Set(["Workspace"]), new Set(["Pane"]), new Set(["Editor", `extension=${ext}`])];
  assert.deepEqual(keys.dispatch(["alt-p"], editor("csv")), { type: "match", action: "markdown::OpenPreview" });
  assert.deepEqual(keys.dispatch(["ctrl-shift-v"], editor("csv")), { type: "match", action: "markdown::OpenPreview" });
  assert.deepEqual(keys.dispatch(["ctrl-shift-v"], editor("markdown")), { type: "match", action: "markdown::OpenPreview" });
  assert.deepEqual(keys.dispatch(["ctrl-shift-v"], editor("txt")), { type: "none" });
});

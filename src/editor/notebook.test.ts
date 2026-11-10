import test from "node:test";
import assert from "node:assert/strict";
import { joinSource, NOTEBOOK_HTML_FORBID_ATTR, NOTEBOOK_HTML_FORBID_TAGS, notebookLanguage, parseNotebook, pickMime, pickOutput, stripAnsi } from "./notebook.ts";
import { hasPreview, previewKind } from "./preview-kind.ts";

const notebook = (cells: unknown[], extra: object = {}) => JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: {}, cells, ...extra });

test("I-2: .ipynb has a preview", () => {
  assert.equal(previewKind("a\b.IPYNB"), "ipynb");
  assert.ok(hasPreview("x.ipynb"));
});

test("cells keep file order and kinds; source is a string or an array of lines alike", () => {
  const parsed = parseNotebook(notebook([
    { cell_type: "markdown", source: ["# Title\n", "text"] },
    { cell_type: "code", source: "print(1)\nprint(2)", execution_count: 3, outputs: [] },
    { cell_type: "raw", source: ["a\n", "b"] },
    { cell_type: "code", source: ["x"], execution_count: null, outputs: [] },
  ]));
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.cells.map((c) => c.type), ["markdown", "code", "raw", "code"]);
  assert.equal(parsed.cells[0].source, "# Title\ntext");
  assert.equal(parsed.cells[1].type === "code" && parsed.cells[1].count, 3);
  assert.equal(parsed.cells[3].type === "code" && parsed.cells[3].count, null);
  assert.equal(joinSource("a\nb"), joinSource(["a\n", "b"]));
});

test("language: language_info.name, then kernelspec.language, else python", () => {
  assert.equal(notebookLanguage({ language_info: { name: "julia" }, kernelspec: { language: "r" } }), "julia");
  assert.equal(notebookLanguage({ kernelspec: { language: "r" } }), "r");
  assert.equal(notebookLanguage({}), "python");
  assert.equal(notebookLanguage(undefined), "python");
});

test("ANSI colour codes are removed from stream, text and traceback", () => {
  assert.equal(stripAnsi("\x1b[0;31mError\x1b[0m: x\x1b[1;32m!"), "Error: x!");
  assert.deepEqual(pickOutput({ output_type: "stream", name: "stderr", text: ["\x1b[31mbad\x1b[0m\n"] }), { kind: "text", text: "bad\n", stderr: true });
  assert.deepEqual(pickOutput({ output_type: "stream", name: "stdout", text: "ok" }), { kind: "text", text: "ok", stderr: false });
  const error = pickOutput({ output_type: "error", ename: "ValueError", evalue: "bad", traceback: ["\x1b[0;31m---\x1b[0m", "line 2"] });
  assert.deepEqual(error, { kind: "error", title: "ValueError: bad", traceback: "---\nline 2" });
  assert.deepEqual(pickOutput({ output_type: "execute_result", data: { "text/plain": "\x1b[1m3\x1b[0m" } }), { kind: "text", text: "3", stderr: false });
});

test("one MIME shows: picture > HTML > text; unshowable kinds say so", () => {
  assert.equal(pickMime({ "text/plain": "<Figure>", "image/png": "iVBORw0=\n" })?.kind, "image");
  assert.deepEqual(pickMime({ "text/plain": "x", "image/jpeg": ["/9j/", "4AAQ"] }), { kind: "image", src: "data:image/jpeg;base64,/9j/4AAQ" });
  assert.equal(pickMime({ "text/plain": "df", "text/html": "<table></table>" })?.kind, "html");
  assert.equal(pickMime({ "text/plain": "x", "image/svg+xml": "<svg/>" })?.kind, "svg");
  assert.equal(pickMime({ "text/plain": "x" })?.kind, "text");
  assert.deepEqual(pickMime({ "application/javascript": "alert(1)" }), { kind: "hidden", mime: "application/javascript" });
  assert.deepEqual(pickMime({ "application/vnd.jupyter.widget-view+json": {}, "application/javascript": "x" }), { kind: "hidden", mime: "application/vnd.jupyter.widget-view+json, application/javascript" });
  assert.equal(pickMime({}), null);
  // a picture that is not base64 never becomes a data: URI
  assert.deepEqual(pickMime({ "image/png": "x\" onerror=\"alert(1)" }), { kind: "hidden", mime: "image/png" });
});

test("HTML outputs drop script, iframe, form, style and style attributes", () => {
  for (const tag of ["script", "iframe", "form", "style"]) assert.ok(NOTEBOOK_HTML_FORBID_TAGS.includes(tag));
  assert.ok(NOTEBOOK_HTML_FORBID_ATTR.includes("style"));
});

test("a file that is not a notebook gives one line", () => {
  assert.deepEqual(parseNotebook("{ not json"), { ok: false, message: "Not a valid notebook" });
  assert.deepEqual(parseNotebook("[]"), { ok: false, message: "Not a valid notebook" });
  assert.deepEqual(parseNotebook(JSON.stringify({ nbformat: 4, metadata: {} })), { ok: false, message: "Not a valid notebook" });
  assert.deepEqual(parseNotebook(JSON.stringify({ nbformat: 3, worksheets: [] })), { ok: false, message: "Unsupported notebook format" });
  assert.deepEqual(parseNotebook(JSON.stringify({ nbformat: 3, cells: [] })), { ok: false, message: "Unsupported notebook format" });
});

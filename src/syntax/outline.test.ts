// core v0.8.1 I-4 V1: Outline items from the pinned outline.scm copies.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { Parser, type Language } from "web-tree-sitter";
import { languageConfigs } from "./catalog.ts";
import { compileQuery, loadLanguage } from "./grammar.ts";
import { codeOutline, foldedBlocks, headingNumbers, headingOfBlock, headingSections, htmlOutline, initialCollapsed, itemAt, itemOfHeading, notebookOutline, outlineRows, outlineStep, unfoldKeys, withHtmlHeadings, type OutlineItem } from "./outline.ts";
import { htmlHeadingText, markdownHeadings, renderMarkdown } from "../editor/markdown.ts";

const root = new URL("../assets/zed-grammars/", import.meta.url);
const available = existsSync(new URL("manifest.json", root));
const configs = available ? languageConfigs(Object.fromEntries(readdirSync(new URL("languages/", root))
  .map((name) => [`languages/${name}/config.toml`, readFileSync(new URL(`languages/${name}/config.toml`, root), "utf8")]))) : [];
await Parser.init();
const grammars = new Map<string, Language>();
async function grammar(id: string): Promise<Language> {
  const name = configs.find((config) => config.id === id)!.grammar;
  if (!grammars.has(name)) grammars.set(name, await loadLanguage(new Uint8Array(readFileSync(new URL(`grammars/${name}.wasm`, root)))));
  return grammars.get(name)!;
}
async function parse(id: string, source: string) {
  const language = await grammar(id);
  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(source)!;
  parser.delete();
  return { language, tree };
}
async function outline(id: string, source: string): Promise<OutlineItem[]> {
  const { language, tree } = await parse(id, source);
  const query = compileQuery(language, readFileSync(new URL(`languages/${id}/outline.scm`, root), "utf8"));
  try { return (await codeOutline(tree, query, id, (from, to) => source.slice(from, to)))!; } finally { tree.delete(); }
}
/** "kind name" per item, children indented by two spaces. */
const shape = (items: OutlineItem[], depth = 0): string[] =>
  items.flatMap((item) => [`${"  ".repeat(depth)}${item.kind}${item.level ? item.level : ""} ${item.name}`, ...shape(item.children, depth + 1)]);

const SAMPLES: Record<string, [string, string]> = {
  c: ["struct point { int x; };\nint add(int a, int b) { int local = a; return local + b; }\n", "function add"],
  cpp: ["namespace geo {\nclass Shape {\n  void draw();\n  Shape* clone();\n  int side;\n  int* data;\n};\n}\n", "module geo"],
  css: ["body, p { color: red; }\n@media screen { a { color: blue; } }\n", "selector body, p"],
  go: ["package main\ntype Point struct { X int }\nfunc main() { x := 1; _ = x }\n", "function main"],
  html: ["<html><body><div>x</div></body></html>\n", "element html"],
  javascript: ["class Shape { draw() { const local = 1; } }\nfunction main() { let count = 0; }\n", "class Shape"],
  json: ['{ "name": "x", "nested": { "a": 1 } }\n', "key name"],
  jsonc: ['{\n  // comment\n  "compilerOptions": { "strict": true }\n}\n', "key compilerOptions"],
  markdown: ["# Title\n\n## Part\n\ntext\n", "heading1 Title"],
  python: ["class GaussianMixture:\n    def fit(self, x):\n        local = 1\n        return local\n\ndef main():\n    pass\n", "class GaussianMixture"],
  rust: ["struct Point { x: i32 }\nimpl Point {\n    fn len(&self) -> i32 { let local = 1; local }\n}\nfn main() {}\n", "struct Point"],
  toml: ["title = \"x\"\n[package]\nname = \"y\"\n", "key title"],
  tsx: ["export function App() { const local = 1; return <div />; }\n", "function App"],
  typescript: ["interface Shape { area(): number }\nclass Circle { radius = 1; area() { const r = this.radius; return r * r; } }\nfunction main() { const local = 1; }\n", "interface Shape"],
  yaml: ["name: app\nservices:\n  web:\n    image: nginx\n", "key name"],
};

test("I-4: each of the 15 outline.scm languages gives at least one item", { skip: !available }, async () => {
  assert.equal(Object.keys(SAMPLES).length, 15);
  for (const [id, [source, expected]] of Object.entries(SAMPLES)) {
    const items = shape(await outline(id, source));
    assert.ok(items.length > 0, id);
    assert.ok(items.some((item) => item.trim() === expected), `${id}: ${items.join(" | ")}`);
  }
});

test("I-4: code nests by range, methods are marked, locals and properties are left out", { skip: !available }, async () => {
  assert.deepEqual(shape(await outline("python", SAMPLES.python[0])), ["class GaussianMixture", "  method fit", "function main"]);
  assert.deepEqual(shape(await outline("typescript", SAMPLES.typescript[0])), ["interface Shape", "class Circle", "  method area", "function main"]);
  assert.deepEqual(shape(await outline("rust", SAMPLES.rust[0])), ["struct Point", "impl Point", "  method len", "function main"]);
  assert.deepEqual(shape(await outline("cpp", SAMPLES.cpp[0])), ["module geo", "  class Shape", "    method draw", "    method clone"]); // A-6: a pointer-returning method stays, a pointer field goes
});

test("I-4 #10: a file of many top-level nodes is queried node by node with the same items, and a stop gives null", { skip: !available }, async () => {
  const source = Array.from({ length: 40 }, (_, i) => `const c${i} = ${i};\nfunction f${i}() { const local = 1; }\n`).join("");
  const items = shape(await outline("javascript", source));
  assert.equal(items.length, 80);
  assert.deepEqual(items.slice(0, 2), ["variable c0", "function f0"]); // a `(program (lexical_declaration))` pattern: run from the root
  const { language, tree } = await parse("javascript", source);
  const query = compileQuery(language, readFileSync(new URL("languages/javascript/outline.scm", root), "utf8"));
  assert.equal(await codeOutline(tree, query, "javascript", (from, to) => source.slice(from, to), async () => true), null);
  tree.delete();
});

test("I-4: Markdown headings nest by level, a # line in a code block is no heading", { skip: !available }, async () => {
  const source = "# Top\n\n## A\n\n```sh\n# not a heading\n```\n\n### A.1\n\n## B\n\n#### Deep\n";
  const items = await outline("markdown", source);
  assert.deepEqual(shape(items), ["heading1 Top", "  heading2 A", "    heading3 A.1", "  heading2 B", "    heading4 Deep"]);
  assert.equal(items[0].children[1].line, 10, "the line of ## B");
  assert.deepEqual(itemAt(items, source.indexOf("A.1")).map((item) => item.name), ["Top", "A", "A.1"]);
});

test("I-4: a notebook lists markdown cell headings at their JSON line, not code cells", { skip: !available }, async () => {
  const notebook = JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: {}, cells: [
    { cell_type: "markdown", metadata: {}, source: ["# Iris\n", "\n", "Intro\n", "## Load\n"] },
    { cell_type: "code", metadata: {}, source: ["# not a heading\n", "class Model:\n", "    pass\n"], outputs: [], execution_count: null },
    { cell_type: "markdown", metadata: {}, source: "```\n# fenced\n```\n### Notes" },
  ] }, null, 1);
  const { tree } = await parse("json", notebook);
  const items = notebookOutline(tree, notebook.length, markdownHeadings);
  tree.delete();
  assert.deepEqual(shape(items), ["heading1 Iris", "  heading2 Load", "    heading3 Notes"]);
  const lines = notebook.split("\n");
  assert.match(lines[items[0].children[0].line], /"## Load\\n"/);
  assert.match(lines[items[0].children[0].children[0].line], /"source": "```/);
  assert.deepEqual([items[0].heading, items[0].children[0].heading, items[0].children[0].children[0].heading], [0, 1, 2]);
});

test("core v0.8.2 I-24: HTML headings of the body are Outline items, and the scroll target of each item is that heading", { skip: !available }, async () => {
  const flat = (items: OutlineItem[]): OutlineItem[] => items.flatMap((item) => [item, ...flat(item.children)]);
  // What the preview draws: tag, data-line, data-heading and text of each numbered heading element, in order.
  const drawn = (html: string) => [...html.matchAll(/<(h[1-6]) data-line="(\d+)" data-line-end="\d+" data-heading="(\d+)"[^>]*>([^<]*)/g)]
    .map(([, tag, line, heading, text]) => ({ tag, line: Number(line), heading: Number(heading), text }));

  // .md: a click reveals by line (markdown-preview.ts reveal): the innermost block on the line of the item is its heading element.
  const source = "# Top\n\n<h2>Raw A</h2>\n\n### Deep\n\n<div align=\"center\">\n<h2 class=\"x\">Raw B</h2>\n<!-- <h1>not drawn</h1> -->\n</div>\n\n```html\n<h1>code</h1>\n```\n\n## Last\n";
  const lines = source.split("\n");
  const lineStart = (line: number) => lines.slice(0, line).join("\n").length + (line ? 1 : 0);
  const items = withHtmlHeadings(await outline("markdown", source), markdownHeadings(source), lineStart, source.length);
  assert.deepEqual(shape(items), ["heading1 Top", "  heading2 Raw A", "    heading3 Deep", "  heading2 Raw B", "  heading2 Last"]);
  assert.deepEqual(flat(items).map((item) => [`h${item.level}`, item.line, item.name]), drawn(renderMarkdown(source)).map((h) => [h.tag, h.line, h.text]));
  assert.ok(source.slice(flat(items)[3].at).startsWith("<h2 class=\"x\">Raw B"));
  const plain = await outline("markdown", "# Only\n\n## Marks\n");
  assert.equal(withHtmlHeadings(plain, markdownHeadings("# Only\n\n## Marks\n"), lineStart, 18), plain); // no HTML heading: untouched

  // .ipynb: a click reveals by number (`heading`), counted over the markdown cells: the element with that data-heading.
  const cells = ["<h1>LLM LangChain</h1>", "## Setup\n\n<h3>Raw step</h3>\ntext\n", "<!-- <h2>not drawn</h2> -->\n\n<h2>Raw end</h2>\n\n# Next"];
  const notebook = JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: {}, cells: [
    { cell_type: "markdown", metadata: {}, source: cells[0] },
    { cell_type: "code", metadata: {}, source: "print('<h1>no</h1>')", outputs: [], execution_count: null },
    { cell_type: "markdown", metadata: {}, source: cells[1].split(/(?<=\n)/) },
    { cell_type: "markdown", metadata: {}, source: cells[2] },
  ] }, null, 1);
  const { tree } = await parse("json", notebook);
  const cellItems = notebookOutline(tree, notebook.length, markdownHeadings);
  tree.delete();
  assert.deepEqual(shape(cellItems), ["heading1 LLM LangChain", "  heading2 Setup", "    heading3 Raw step", "  heading2 Raw end", "heading1 Next"]);
  const headings: ReturnType<typeof markdownHeadings> = []; // one list over the cells, as notebookNodes renders them
  const cellHtml = cells.map((cell) => renderMarkdown(cell, headings)).join("");
  assert.deepEqual(flat(cellItems).map((item) => [`h${item.level}`, item.heading, item.name]), drawn(cellHtml).map((h) => [h.tag, h.heading, h.text]));
  assert.deepEqual(flat(cellItems).map((item) => item.heading), [0, 1, 2, 3, 4]);
  assert.match(notebook.split("\n")[flat(cellItems)[2].line], /<h3>Raw step<\/h3>/);
});

test("A-7: a markdown cell whose source is one string keeps its same-level headings apart and in order", { skip: !available }, async () => {
  const notebook = JSON.stringify({ nbformat: 4, cells: [{ cell_type: "markdown", source: "# One\ntext\n# Two\n" }] });
  const { tree } = await parse("json", notebook);
  const items = notebookOutline(tree, notebook.length, markdownHeadings);
  tree.delete();
  assert.deepEqual(shape(items), ["heading1 One", "heading1 Two"]);
  assert.ok(notebook.slice(items[1].at).startsWith("# Two"));
});

test("I-4: rows follow the open items, a collapsed key hides its children and guides mark the open range", () => {
  const item = (name: string, children: OutlineItem[] = []): OutlineItem => ({ name, kind: "heading", from: 0, to: 0, at: 0, line: 0, children });
  const items = [item("A", [item("a1"), item("a2", [item("x")])]), item("B")];
  const rows = outlineRows(items, new Set());
  assert.deepEqual(rows.map((row) => `${row.depth}${row.item.name}`), ["0A", "1a1", "1a2", "2x", "0B"]);
  assert.deepEqual(rows.map((row) => row.guides.map((g) => `${+g.first}${+g.last}`).join(",")), ["", "10", "00", "01,11", ""]);
  assert.deepEqual(outlineRows(items, new Set(["/A#0/a2#0"])).map((row) => row.item.name), ["A", "a1", "a2", "B"]);
});

test("core v0.8.1 I-18: Outline keys follow the project tree's rules", () => {
  const item = (name: string, children: OutlineItem[] = []): OutlineItem => ({ name, kind: "heading", from: 0, to: 0, at: 0, line: 0, children });
  const rows = outlineRows([item("A", [item("a1"), item("a2", [item("x")])]), item("B")], new Set(["/A#0/a2#0"]));
  const [A, a1, a2, B] = rows.map((row) => row.key);
  assert.deepEqual(outlineStep(rows, null, "next"), { select: A }); // nothing selected: Down gives the first row
  assert.deepEqual(outlineStep(rows, B, "next"), { select: B }); // stops at the end
  assert.deepEqual(outlineStep(rows, a1, "prev"), { select: A });
  assert.deepEqual(outlineStep(rows, A, "expand"), { select: a1 }); // open: to the first child
  assert.deepEqual(outlineStep(rows, a2, "expand"), { toggle: a2 }); // closed: open it
  assert.equal(outlineStep(rows, a1, "expand"), null); // a leaf
  assert.deepEqual(outlineStep(rows, A, "collapse"), { toggle: A }); // open: close it
  assert.deepEqual(outlineStep(rows, a2, "collapse"), { select: A }); // closed: to the parent
  assert.equal(outlineStep(rows, B, "collapse"), null); // a top-level leaf
});

test("core v0.8.2 I-6: an HTML file's Outline is its h1~h6 as sections, not its tags", { skip: !available }, async () => {
  const source = '<html><head><title>T</title><script>const s = "<h1>no</h1>";</script></head>\n<body>\n<h1 class="x">Top <b>bold</b> &amp; more</h1>\n<p>text</p>\n'
    + '<div><h2>Part\n  A</h2></div>\n<!-- <h2>hidden</h2> -->\n<h3>Deep</h3>\n<h2>Part B</h2>\n</body></html>\n';
  const items = htmlOutline(await outline("html", source), (item) => htmlHeadingText(source.slice(item.at + item.name.length, item.to)), source.length);
  assert.deepEqual(shape(items), ["heading1 Top bold & more", "  heading2 Part A", "    heading3 Deep", "  heading2 Part B"]);
  const last = items[0].children[1];
  assert.equal(source.split("\n")[last.line], "<h2>Part B</h2>"); // a click puts the cursor on the heading's line
  assert.ok(source.slice(last.at).startsWith("h2>Part B"));
  assert.deepEqual(itemAt(items, source.indexOf("Deep")).map((item) => item.name), ["Top bold & more", "Part A", "Deep"]);
});

test("core v0.8.2 I-8: heading numbers: none for H1, one more part per level, again from 1 under each H1, 0 for a skipped level", { skip: !available }, () => {
  const table: [string, number[], string[]][] = [
    ["several H1", [1, 2, 2, 3, 1, 2, 3, 4], ["", "1", "2", "2.1", "", "1", "1.1", "1.1.1"]],
    ["a skipped level", [1, 3, 3, 2, 4], ["", "0.1", "0.2", "1", "1.0.1"]],
    ["no H1", [2, 3, 2, 3, 3], ["1", "1.1", "2", "2.1", "2.2"]],
    ["H5 and H6", [2, 3, 4, 5, 6, 6, 5], ["1", "1.1", "1.1.1", "1.1.1.1", "1.1.1.1.1", "1.1.1.1.2", "1.1.1.2"]],
    // the HTML headings of a Markdown body are in the list the numbers are made from (I-24); an inline one in a paragraph is not
    ["HTML headings", markdownHeadings("# Top\n\n<h2>Raw</h2>\n\ntext <h2>inline</h2>\n\n### Deep\n\n<div>\n<h2>Raw B</h2>\n</div>\n").map((h) => h.level), ["", "1", "1.1", "2"]],
  ];
  for (const [name, levels, expected] of table) assert.deepEqual(headingNumbers(levels), expected, name);
});

test("core v0.8.2 I-10: an Outline first shows two layers, whatever level it starts at", { skip: !available }, async () => {
  const first = (items: OutlineItem[]) => outlineRows(items, new Set(initialCollapsed(items))).map((row) => `${row.depth}${row.item.name}`);
  assert.deepEqual(first(await outline("markdown", "# Top\n\n## A\n\n### A.1\n\n#### A.1.a\n\n## B\n\n# Next\n\n## C\n\n### C.1\n")), ["0Top", "1A", "1B", "0Next", "1C"]);
  assert.deepEqual(first(await outline("markdown", "## A\n\n### A.1\n\n#### A.1.a\n\n## B\n")), ["0A", "1A.1", "0B"]); // starts at H2: H2 and H3
  assert.deepEqual(first(await outline("python", "class A:\n    def f(self):\n        def inner():\n            pass\n\ndef main():\n    pass\n")), ["0A", "1f", "0main"]);
  const open = await outline("markdown", "# Top\n\n## A\n\n### A.1\n\n#### A.1.a\n");
  assert.deepEqual(outlineRows(open, new Set(initialCollapsed(open).slice(1))).map((row) => row.item.name), ["Top", "A", "A.1", "A.1.a"]); // only the second layer is folded
});

test("core v0.8.2 I-18: a folded heading hides up to the next heading of its level or higher, by the Outline's own key; going inside unfolds", { skip: !available }, async () => {
  // .md, with HTML headings of the body: the preview's sections have the keys of the Outline's rows, so a fold is one state for both.
  const source = "# Top\n\nintro\n\n## A  `code` ##\n\ntext\n\n<h3>Raw</h3>\n\nmore\n\n## B\n\n<div>\n<h3>Raw</h3>\n</div>\n\n# Next\n";
  const lines = source.split("\n");
  const lineStart = (line: number) => lines.slice(0, line).join("\n").length + (line ? 1 : 0);
  const rows = outlineRows(withHtmlHeadings(await outline("markdown", source), markdownHeadings(source), lineStart, source.length), new Set());
  const sections = headingSections(markdownHeadings(source));
  assert.deepEqual(sections.map((section) => section.key), rows.map((row) => row.key));
  assert.deepEqual(sections.map((section) => [section.parent, section.end]), [[-1, 5], [0, 3], [1, 3], [0, 5], [3, 5], [-1, 6]]);
  const [top, a, raw] = sections.map((section) => section.key);
  // blocks: Top, intro, A, text, Raw, more, B, Raw (in the div), Next
  const blocks = [0, -1, 1, -1, 2, -1, 3, 4, 5];
  const hidden = (...keys: string[]) => foldedBlocks(blocks, sections, new Set(keys)).map(Number).join("");
  assert.equal(hidden(), "000000000");
  assert.equal(hidden(a), "000111000"); // H2 stops at the next H2, its H3 goes with it
  assert.equal(hidden(raw), "000001000"); // H3 stops at the H2
  assert.equal(hidden(top, raw), "011111110"); // H1 stops at the next H1 only
  assert.deepEqual(unfoldKeys(blocks, sections, 5), [raw, a, top]); // a find match, an editor cursor: the paragraph under Raw
  assert.deepEqual(unfoldKeys(blocks, sections, 4), [a, top]); // an Outline click, a #id link: the heading itself (its own fold does not hide it)
  assert.deepEqual(unfoldKeys(blocks, sections, 1), [top]);
  assert.deepEqual(unfoldKeys(blocks, sections, 0), []);

  // .ipynb: headings are counted over the markdown cells; a code cell (with its outputs) is one block under the heading before it.
  const cells = ["# One", "## Two\n\ntext", "# Three"];
  const notebook = JSON.stringify({ nbformat: 4, cells: [
    { cell_type: "markdown", source: cells[0] }, { cell_type: "code", source: "a = 1", outputs: [] },
    { cell_type: "markdown", source: cells[1] }, { cell_type: "code", source: "b = 2", outputs: [] }, { cell_type: "markdown", source: cells[2] },
  ] }, null, 1);
  const { tree } = await parse("json", notebook);
  const items = notebookOutline(tree, notebook.length, markdownHeadings);
  tree.delete();
  const headings: ReturnType<typeof markdownHeadings> = [];
  for (const cell of cells) renderMarkdown(cell, headings); // as the preview draws them
  const nb = headingSections(headings);
  assert.deepEqual(nb.map((section) => section.key), outlineRows(items, new Set()).map((row) => row.key));
  const nbBlocks = [0, -1, 1, -1, -1, 2]; // One, code cell, Two, text, code cell, Three
  assert.deepEqual(foldedBlocks(nbBlocks, nb, new Set([nb[1].key])), [false, false, false, true, true, false]);
  assert.deepEqual(foldedBlocks(nbBlocks, nb, new Set([nb[0].key])), [false, true, true, true, true, false]);
  assert.deepEqual(unfoldKeys(nbBlocks, nb, 4), [nb[1].key, nb[0].key]);
});

test("core v0.8.2 I-7: a click in a notebook preview marks the Outline row of the heading its block is under", { skip: !available }, async () => {
  const notebook = JSON.stringify({ nbformat: 4, cells: [
    { cell_type: "code", source: "import x", outputs: [] }, { cell_type: "markdown", source: "# One" }, { cell_type: "code", source: "a = 1", outputs: [] },
    { cell_type: "markdown", source: "## Two\n\ntext" }, { cell_type: "code", source: "b = 2", outputs: [] }, { cell_type: "markdown", source: "# Three" },
  ] }, null, 1);
  const { tree } = await parse("json", notebook);
  const items = notebookOutline(tree, notebook.length, markdownHeadings);
  tree.delete();
  const blocks = [-1, 0, -1, 1, -1, -1, 2]; // code cell, One, code cell, Two, text, code cell, Three
  const rowOf = (block: number) => itemOfHeading(items, headingOfBlock(blocks, block)).map((item) => item.name);
  assert.deepEqual([rowOf(2), rowOf(4), rowOf(5), rowOf(3), rowOf(6)], [["One"], ["One", "Two"], ["One", "Two"], ["One", "Two"], ["Three"]]);
  assert.deepEqual(rowOf(0), []); // before the first heading: no row
  assert.equal(itemOfHeading(items, 1).at(-1)!.heading, 1); // the row an Outline click reveals by number is the row marked after it
});

// core v0.8.1 I-4 V1: Outline items from the pinned outline.scm copies.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { Parser, type Language } from "web-tree-sitter";
import { languageConfigs } from "./catalog.ts";
import { compileQuery, loadLanguage } from "./grammar.ts";
import { codeOutline, itemAt, notebookOutline, outlineRows, outlineStep, type OutlineItem } from "./outline.ts";
import { markdownHeadings } from "../editor/markdown.ts";

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

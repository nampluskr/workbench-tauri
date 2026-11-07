import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { Text } from "@codemirror/state";
import { Parser } from "web-tree-sitter";
import { fileLanguage, languageConfigs, type LanguageConfig } from "./catalog.ts";
import { compileQuery, loadLanguage } from "./grammar.ts";
import { SyntaxDocument } from "./document.ts";
import type { LoadedLanguage } from "./assets.ts";

const root = new URL("../assets/zed-grammars/", import.meta.url);
const available = existsSync(new URL("manifest.json", root));
const configs = available ? languageConfigs(Object.fromEntries(readdirSync(new URL("languages/", root))
  .map((name) => [`languages/${name}/config.toml`, readFileSync(new URL(`languages/${name}/config.toml`, root), "utf8")]))) : [];
await Parser.init();
async function load(config: LanguageConfig): Promise<LoadedLanguage> {
  const language = await loadLanguage(new Uint8Array(readFileSync(new URL(`grammars/${config.grammar}.wasm`, root))));
  const source = (name: string) => readFileSync(new URL(`languages/${config.id}/${name}.scm`, root), "utf8");
  return { config, language, highlights: compileQuery(language, source("highlights")), outline: compileQuery(language, source("outline")) };
}
const keys = new Set(["keyword", "function", "type", "punctuation.bracket"]);

/** The crumb texts at the 1-based `line` (first non-blank column) of a pinned sample file. */
async function crumbs(file: string, line: number): Promise<{ text: string; marks: string[] }[]> {
  const text = readFileSync(new URL(`../../test-fixtures/syntax/${file}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const doc = Text.of(text.split("\n"));
  const syntax = new SyntaxDocument(fileLanguage(configs, file)!, configs, load);
  assert.ok(await syntax.update(doc, null, () => false));
  const at = doc.line(line);
  const found = syntax.symbols(at.from + at.text.length - at.text.trimStart().length, keys);
  syntax.destroy();
  return found.map((symbol) => ({ text: symbol.text, marks: symbol.marks.map((mark) => `${mark.key}:${symbol.text.slice(mark.from, mark.to)}`) }));
}

test("K-52: Zed captures — Rust, TypeScript and Python symbols at the cursor line (zed-*-sym.png)", { skip: !available }, async () => {
  assert.deepEqual((await crumbs("sample.rs", 21)).map((s) => s.text), ["impl Counter", "pub fn bump", "fn clamp"]);
  // The "( )" is the two parameter-list parentheses of outline.scm, a space apart because the parameters stand between them.
  assert.deepEqual((await crumbs("sample.ts", 18)).map((s) => s.text), ["class Inventory", "add( )", "function normalize( )"]);
  assert.deepEqual((await crumbs("sample.py", 21)).map((s) => s.text), ["class Library", "def add", "def normalize"]);
});

test("K-52: symbol text carries the syntax colour of each keyword and name", { skip: !available }, async () => {
  const [first] = await crumbs("sample.rs", 21);
  assert.deepEqual(first.marks.slice(0, 2), ["keyword:impl", "type:Counter"]);
});

test("K-52: outside every symbol there is only the path (HTML line 1)", { skip: !available }, async () => {
  assert.deepEqual(await crumbs("sample.html", 1), []);
});

test("K-53: a Markdown fenced code block is coloured by its info word; no language is plain", { skip: !available }, async () => {
  const { codeBlockHighlights } = await import("./document.ts");
  const found = await codeBlockHighlights("rust", "fn main() {}\n", configs, load, keys);
  assert.equal(found[0].key, "keyword"); // "fn"
  assert.deepEqual(await codeBlockHighlights("", "fn main() {}\n", configs, load, keys), []);
  assert.deepEqual(await codeBlockHighlights("nosuchlang", "fn main() {}\n", configs, load, keys), []);
});

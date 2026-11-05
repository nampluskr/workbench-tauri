// SPEC R-9 V1. Reads the installed Zed HTML extension directly (D-13): this PC only.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Parser, type Language } from "web-tree-sitter";
import { compileQuery, loadLanguage, skipDylinkNeeded, themeKey } from "./grammar.ts";

const ext = `${process.env.LOCALAPPDATA}/Zed/extensions/installed/html`;
const wasm = new Uint8Array(readFileSync(`${ext}/grammars/html.wasm`));
const scm = (name: string) => readFileSync(`${ext}/languages/html/${name}.scm`, "utf8");

await Parser.init();
let html: Language;

test("D-12: html.wasm fails as is, loads from the patched in-memory copy, the original stays intact", async () => {
  const before = wasm.slice();
  await assert.rejects(loadLanguage(new Uint8Array(0)));
  await assert.rejects(import("web-tree-sitter").then(({ Language }) => Language.load(wasm)));
  html = await loadLanguage(wasm);
  assert.deepEqual(wasm, before);
  assert.notDeepEqual(skipDylinkNeeded(wasm), wasm);
});

const parse = (source: string) => {
  const parser = new Parser();
  parser.setLanguage(html);
  return parser.parse(source)!;
};

test("the six .scm compile and highlights.scm yields captures", () => {
  for (const name of ["brackets", "highlights", "indents", "injections", "outline", "overrides"]) {
    assert.doesNotThrow(() => compileQuery(html, scm(name)), name);
  }
  const captures = compileQuery(html, scm("highlights")).captures(parse('<!doctype html><p class="a">x</p>').rootNode);
  assert.deepEqual(
    [...new Set(captures.map((c) => c.name))].sort(),
    ["attribute", "punctuation.bracket.html", "punctuation.delimiter.html", "string", "tag", "tag.doctype"],
  );
});

test("W-9 predicates P-1..P-7", () => {
  const injections = compileQuery(html, scm("injections"));
  const brackets = compileQuery(html, scm("brackets"));
  const injected = (source: string) =>
    injections.matches(parse(source).rootNode).map((m) => ({
      language: m.setProperties?.["injection.language"],
      content: m.captures.find((c) => c.name === "injection.content")?.node.text,
    }));
  assert.deepEqual(injected('<p style="color:red">'), [{ language: "css", content: "color:red" }]); // P-1
  assert.deepEqual(injected('<p class="color:red">'), []); // P-2
  assert.deepEqual(injected('<b onclick="go()">'), [{ language: "javascript", content: "go()" }]); // P-3
  assert.deepEqual(injected('<b onClick="go()">'), []); // P-4
  assert.deepEqual(injected("<script>let x = 1;</script>"), [{ language: "javascript", content: "let x = 1;" }]); // P-5
  const props = (source: string, open: string) =>
    brackets
      .matches(parse(source).rootNode)
      .filter((m) => m.captures.find((c) => c.name === "open")?.node.text === open)
      .map((m) => m.setProperties);
  assert.deepEqual(props('<a href="x">', '"'), [{ "rainbow.exclude": null }]); // P-6
  assert.deepEqual(props("<div></div>", "<div>"), [{ "newline.only": null, "rainbow.exclude": null }]); // P-7
});

test("T-27.1: longest dot-boundary prefix among Mocha syntax keys, else no style", () => {
  const catppuccin = JSON.parse(
    readFileSync(`${process.env.LOCALAPPDATA}/Zed/extensions/installed/catppuccin/themes/catppuccin-mauve.json`, "utf8"),
  );
  const keys = new Set(Object.keys(catppuccin.themes.find((t: any) => t.name === "Catppuccin Mocha").style.syntax));
  assert.equal(themeKey("tag.doctype", keys), "tag.doctype"); // exact key
  assert.equal(themeKey("punctuation.bracket.html", keys), "punctuation.bracket"); // longest prefix
  assert.equal(themeKey("string.special", keys), "string.special");
  assert.equal(themeKey("keywordx", keys), null); // "keyword" is not a dot-boundary prefix
  assert.equal(themeKey("nothing.here", keys), null);
});

test("range units: QueryOptions indexes are bytes (code units x 2), Node indexes are code units", () => {
  const source = "<p>é</p><b>x</b>"; // `<b>` starts at code unit 8
  const query = compileQuery(html, scm("highlights"));
  const tags = (from: number, to: number) =>
    query.captures(parse(source).rootNode, { startIndex: from * 2, endIndex: to * 2 })
      .filter((c) => c.name === "tag").map((c) => [c.node.text, c.node.startIndex]);
  assert.deepEqual(tags(8, 16), [["b", 9], ["b", 14]]);
});

// R-19 other grammar: TOML extension (Markdown/JSON are built into Zed, not extensions; user 2026-11-05).
const tomlExt = `${process.env.LOCALAPPDATA}/Zed/extensions/installed/toml`;
const tomlScm = ["brackets", "highlights", "indents", "injections", "outline", "overrides", "redactions", "textobjects"];

test("TOML: toml.wasm loads with or without the dylink workaround, the eight .scm compile, a sample parses cleanly", async () => {
  const bytes = new Uint8Array(readFileSync(`${tomlExt}/grammars/toml.wasm`));
  // It also lists libc.so as NEEDED, yet loads as is (unlike html.wasm); the app patches every grammar the same way.
  assert.notDeepEqual(skipDylinkNeeded(bytes), bytes);
  await import("web-tree-sitter").then(({ Language }) => Language.load(bytes));
  const toml = await loadLanguage(bytes);
  for (const name of tomlScm) {
    assert.doesNotThrow(() => compileQuery(toml, readFileSync(`${tomlExt}/languages/toml/${name}.scm`, "utf8")), name);
  }
  const parser = new Parser();
  parser.setLanguage(toml);
  const tree = parser.parse('# c\n[server]\nname = "a\tb"\nport = 8080\nok = true\nlist = [1, 2]\n')!;
  assert.equal(tree.rootNode.hasError, false);
  const highlights = compileQuery(toml, readFileSync(`${tomlExt}/languages/toml/highlights.scm`, "utf8"));
  const names = [...new Set(highlights.captures(tree.rootNode).map((c) => c.name))].sort();
  const catppuccin = JSON.parse(
    readFileSync(`${process.env.LOCALAPPDATA}/Zed/extensions/installed/catppuccin/themes/catppuccin-mauve.json`, "utf8"),
  );
  const keys = new Set(Object.keys(catppuccin.themes.find((t: any) => t.name === "Catppuccin Mocha").style.syntax));
  assert.equal(themeKey("property", keys), "property");
  assert.equal(themeKey("string.escape", keys), "string.escape");
  assert.equal(themeKey("punctuation.bracket", keys), "punctuation.bracket");
});

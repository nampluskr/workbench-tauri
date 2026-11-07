import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { EditorState } from "@codemirror/state";
import { Parser } from "web-tree-sitter";
import { fileLanguage, injectionLanguage, languageConfigs, type LanguageConfig } from "./catalog.ts";
import { compileQuery, loadLanguage } from "./grammar.ts";
import { SyntaxDocument, resolveHighlights } from "./document.ts";
import type { LoadedLanguage } from "./assets.ts";

const root = new URL("../assets/zed-grammars/", import.meta.url);
const available = existsSync(new URL("manifest.json", root));
const configs = available ? languageConfigs(Object.fromEntries(readdirSync(new URL("languages/", root))
  .map((name) => [`languages/${name}/config.toml`, readFileSync(new URL(`languages/${name}/config.toml`, root), "utf8")]))) : [];
const cache = new Map<string, Promise<LoadedLanguage>>();
const grammarCache = new Map<string, ReturnType<typeof loadLanguage>>();
await Parser.init();
function load(config: LanguageConfig): Promise<LoadedLanguage> {
  let result = cache.get(config.id);
  if (!result) {
    result = (async () => {
      let grammar = grammarCache.get(config.grammar);
      if (!grammar) { grammar = loadLanguage(new Uint8Array(readFileSync(new URL(`grammars/${config.grammar}.wasm`, root)))); grammarCache.set(config.grammar, grammar); }
      const language = await grammar;
      const source = (name: string) => readFileSync(new URL(`languages/${config.id}/${name}.scm`, root), "utf8");
      return { config, language, highlights: compileQuery(language, source("highlights")),
        injections: existsSync(new URL(`languages/${config.id}/injections.scm`, root)) ? compileQuery(language, source("injections")) : undefined };
    })();
    cache.set(config.id, result);
  }
  return result;
}
const config = (id: string) => configs.find((item) => item.id === id)!;
const keys = new Set(["comment", "keyword", "number", "string", "variable", "type", "function", "operator", "punctuation", "tag", "attribute", "property", "title", "emphasis", "text", "link_text", "link_uri"]);

test("K-50: config suffixes select visible languages with exact case and longest dot suffix", { skip: !available }, () => {
  for (const item of configs.filter((item) => !item.hidden)) for (const suffix of item.suffixes) {
    assert.equal(fileLanguage(configs, `D:\\project\\${suffix}`)?.id, item.id, suffix);
    assert.equal(fileLanguage(configs, `D:\\project\\file.${suffix}`)?.id, item.id, suffix);
  }
  for (const [path, expected] of [["a.C", "cpp"], ["a.c", "c"], ["a.MD", "markdown"], ["tsconfig.json", "jsonc"], ["x.json", "json"], [".env", "env"], ["x.PY", undefined], ["x.toml", undefined], ["x.regex", undefined], ["nottsconfig.json", "json"]]) {
    assert.equal(fileLanguage(configs, path!)?.id, expected, path);
  }
  assert.equal(injectionLanguage(configs, "some/path/main.RS")?.id, "rust");
  assert.equal(injectionLanguage(configs, "Markdown-Inline")?.id, "markdown-inline");
  assert.equal(injectionLanguage(configs, "SQL"), undefined);
  assert.equal(fileLanguage([], "file.rs"), undefined);
});

test("K-50: one mark wins by start/end/depth/order, unmapped captures leave the parent color", () => {
  assert.deepEqual(resolveHighlights([
    { from: 0, to: 10, name: "string", depth: 0 },
    { from: 2, to: 8, name: "absent", depth: 0 },
    { from: 3, to: 7, name: "number", depth: 0 },
    { from: 3, to: 7, name: "keyword", depth: 1 },
  ], keys), [{ from: 0, to: 3, key: "string" }, { from: 3, to: 7, key: "keyword" }, { from: 7, to: 10, key: "string" }]);
  assert.deepEqual(resolveHighlights([
    { from: 0, to: 5, name: "string", depth: 0 }, { from: 0, to: 5, name: "keyword", depth: 0 },
  ], keys), [{ from: 0, to: 5, key: "keyword" }]);
});

test("K-50: all four injection regex queries compile and retain positive/negative matches", { skip: !available }, async () => {
  for (const id of ["javascript", "tsx", "typescript", "python"]) {
    const syntax = await load(config(id));
    const parser = new Parser();
    parser.setLanguage(syntax.language);
    const count = (text: string) => {
      const tree = parser.parse(text)!;
      const matches = syntax.injections!.matches(tree.rootNode).filter((match) => match.setProperties?.["injection.language"] === (id === "python" ? "sql" : "jsdoc"));
      tree.delete();
      return matches.length;
    };
    assert.ok(count(id === "python" ? '# SQL\nquery = "select 1"\n' : '/** docs\nmore docs */\nconst value = 1;') > 0, id);
    assert.equal(count(id === "python" ? '# sqlite\nquery = "select 1"\n' : '/* ordinary */\nconst value = 1;'), 0, id);
    parser.delete();
  }
});

test("K-50: Markdown injects inline text and a path-suffix fence, edits reuse parsers and match a fresh parse", { skip: !available }, async () => {
  let state = EditorState.create({ doc: '# 제목\n\nA **bold** word.\n\n```src/main.RS\nfn main() { let n = 42; }\n```\n' });
  const syntax = new SyntaxDocument(config("markdown"), configs, load);
  assert.equal(await syntax.update(state.doc, null, () => false), true);
  const ids = [...syntax.layers.values()].map((layer) => layer.syntax.config.id);
  assert.ok(ids.includes("markdown-inline"));
  assert.ok(ids.includes("rust"));
  const number = state.doc.toString().indexOf("42");
  assert.ok(syntax.highlights(0, state.doc.length, keys).some((span) => span.key === "number" && span.from === number && span.to === number + 2));
  const rustParser = [...syntax.layers.values()].find((layer) => layer.syntax.config.id === "rust")!.parser;
  const change = state.update({ changes: { from: number, to: number + 2, insert: "73" } });
  assert.equal(await syntax.update(change.state.doc, change.changes, () => true), false, "cancelled edits do not publish");
  assert.equal(await syntax.update(change.state.doc, change.changes, () => false), true);
  state = change.state;
  assert.equal([...syntax.layers.values()].find((layer) => layer.syntax.config.id === "rust")!.parser, rustParser);
  const fresh = new SyntaxDocument(config("markdown"), configs, load);
  await fresh.update(state.doc, null, () => false);
  assert.deepEqual(syntax.highlights(0, state.doc.length, keys), fresh.highlights(0, state.doc.length, keys));
  for (const layer of syntax.layers.values()) assert.equal(layer.tree.rootNode.hasError, false, layer.syntax.config.id);
  syntax.destroy(); fresh.destroy();
});

test("K-50: HTML script/style and combined inline HTML use nested grammars without coloring gaps", { skip: !available }, async () => {
  const doc = EditorState.create({ doc: '<style>p { color: red; }</style><script>const n = 1; const re = /a+/;</script><p onclick="go()">text</p>' }).doc;
  const syntax = new SyntaxDocument(config("html"), configs, load);
  await syntax.update(doc, null, () => false);
  const ids = [...syntax.layers.values()].map((layer) => layer.syntax.config.id);
  assert.ok(ids.includes("css")); assert.ok(ids.includes("javascript"));
  assert.ok(ids.includes("regex"));
  const spans = syntax.highlights(0, doc.length, keys);
  const at = doc.toString().indexOf("const");
  assert.ok(spans.some((span) => span.from <= at && span.to >= at + 5 && span.key === "keyword"));
  const inline = new SyntaxDocument(config("markdown-inline"), configs, load);
  const inlineDoc = EditorState.create({ doc: '<b>**middle**</b>' }).doc;
  await inline.update(inlineDoc, null, () => false);
  const htmlLayers = [...inline.layers.values()].filter((layer) => layer.syntax.config.id === "html");
  assert.equal(htmlLayers.length, 1);
  assert.equal(htmlLayers[0].ranges?.length, 2);
  assert.ok(inline.highlights(0, inlineDoc.length, keys).some((span) => span.key === "emphasis" && inlineDoc.sliceString(span.from, span.to) === "**middle**"));
  syntax.destroy(); inline.destroy();
});

test("K-50: each visible language produces themed spans from its pinned grammar", { skip: !available }, async (t) => {
  const samples: Record<string, string> = {
    bash: 'echo "hello"\n', c: 'int main(void) { return 1; }\n', cpp: 'int main() { return 1; }\n',
    css: 'p { color: red; }\n', diff: 'diff --git a/a b/a\n--- a/a\n+++ b/a\n@@ -1 +1 @@\n-old\n+new\n',
    // One Dark has no markup.heading token for a commit subject; its comments still have a theme color.
    env: 'NAME="hello"\n', gitcommit: 'Add a feature\n\nExplain the change.\n# A comment\n', go: 'package main\nfunc main() {}\n',
    gomod: 'module example.com/app\n\ngo 1.23\n', gowork: 'go 1.23\n\nuse ./app\n', html: '<p class="a">text</p>',
    javascript: 'const n = 1;', json: '{"n": 1}', jsonc: '{"n": 1}', markdown: '# Heading\n',
    python: 'def main():\n    return 1\n', rust: 'fn main() { let n = 1; }',
    tsx: 'const node = <p>hello</p>;', typescript: 'const n: number = 1;', yaml: 'name: hello\n',
  };
  const one = JSON.parse(readFileSync(new URL("../theme/assets/one/one.json", import.meta.url), "utf8"));
  const themeKeys = new Set<string>(Object.keys(one.themes.find((theme: { name: string }) => theme.name === "One Dark").style.syntax));
  for (const item of configs.filter((item) => !item.hidden)) {
    assert.ok(samples[item.id], `Missing sample: ${item.id}`);
    const doc = EditorState.create({ doc: samples[item.id] }).doc;
    const syntax = new SyntaxDocument(item, configs, load);
    assert.equal(await syntax.update(doc, null, () => false), true, item.id);
    const spans = syntax.highlights(0, doc.length, themeKeys);
    assert.ok(spans.length > 0, `No One Dark themed spans: ${item.id}`);
    for (let i = 1; i < spans.length; i++) assert.ok(spans[i - 1].to <= spans[i].from, item.id);
    for (const layer of syntax.layers.values()) assert.equal(layer.tree.rootNode.hasError, false, item.id);
    t.diagnostic(`${item.id} -> ${item.grammar}: ${spans.length} themed spans`);
    syntax.destroy();
  }
});

test("K-50: unavailable language leaves an empty document instead of throwing", async () => {
  assert.deepEqual(languageConfigs({ "languages/broken/config.toml": 'name = "bad\\q"\ngrammar = "x"' }), []);
  assert.deepEqual(languageConfigs({ "languages/broken/config.toml": '' }), []);
  const missing = { id: "missing", name: "Missing", grammar: "missing", suffixes: [], hidden: false };
  const syntax = new SyntaxDocument(missing, [], async () => undefined);
  assert.equal(await syntax.update(EditorState.create({ doc: "x" }).doc, null, () => false), true);
  assert.deepEqual(syntax.highlights(0, 1, keys), []);
  syntax.destroy();
});

test("K-50: C++ has-ancestor? colors a deeply qualified call, not the same identifier used as a value", { skip: !available }, async () => {
  const source = 'void f() { a::b::c::d::e::target(); auto value = a::b::c::d::e::target; }';
  const doc = EditorState.create({ doc: source }).doc;
  const syntax = new SyntaxDocument(config("cpp"), configs, load);
  await syntax.update(doc, null, () => false);
  const spans = syntax.highlights(0, doc.length, new Set(["function.call"]));
  assert.ok(spans.some((span) => span.from === source.indexOf("target") && span.to === source.indexOf("target") + 6));
  assert.equal(spans.some((span) => span.from <= source.lastIndexOf("target") && span.to > source.lastIndexOf("target")), false);
  syntax.destroy();
});

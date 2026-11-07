import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { Parser } from "web-tree-sitter";
import { compileQuery, loadLanguage } from "./grammar.ts";

const root = new URL("../assets/zed-grammars/", import.meta.url);
const manifestFile = new URL("manifest.json", root);

test("ORDER-11: pinned grammar copies load and their Zed queries compile", { skip: !existsSync(manifestFile) }, async () => {
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  assert.equal(manifest.zedCommit, "4304dec732a75505066de5ce2dbbfb2bec369498");
  assert.equal(manifest.languages.length, 24);
  assert.equal(manifest.grammars.length, 20);
  assert.equal(readdirSync(new URL("grammars/", root)).filter((file) => file.endsWith(".wasm")).length, 20);
  assert.equal(readdirSync(new URL("languages/", root)).length, 24);
  await Parser.init();
  const languages = new Map();
  const failures: string[] = [];
  for (const grammar of manifest.grammars) {
    assert.equal(grammar.status, "built", `${grammar.name}: ${grammar.error}`);
    const bytes = readFileSync(new URL(`grammars/${grammar.name}.wasm`, root));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), grammar.wasmSha256, grammar.name);
    assert.ok(grammar.licenseFiles.length, `${grammar.name}: missing license`);
    for (const license of grammar.licenseFiles) assert.ok(existsSync(new URL(license, root)), license);
    if (grammar.licenseSource) {
      assert.equal(grammar.licenseSource.parserSha256, grammar.parserSha256, `${grammar.name}: license commit parser differs`);
      assert.match(grammar.licenseSource.rev, /^[a-f0-9]{40}$/);
      assert.equal(grammar.licenseSource.rev, grammar.crateVcsRevision, grammar.name);
    }
    languages.set(grammar.name, await loadLanguage(bytes));
  }
  for (const { name, grammar } of manifest.languages) {
    const language = languages.get(grammar);
    assert.ok(language, `${name}: no grammar ${grammar}`);
    assert.ok(existsSync(new URL(`languages/${name}/config.toml`, root)), name);
    assert.ok(existsSync(new URL(`languages/${name}/highlights.scm`, root)), name);
    for (const queryName of ["highlights", "injections", "outline"]) {
      const path = new URL(`languages/${name}/${queryName}.scm`, root);
      if (!existsSync(path)) continue;
      try {
        compileQuery(language, readFileSync(path, "utf8")).delete();
      } catch (error) {
        failures.push(`${name}/${queryName}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  assert.deepEqual(failures, [], "Zed query compilation failures");
});

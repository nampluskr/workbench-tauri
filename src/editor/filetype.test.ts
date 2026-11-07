import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { languageConfigs } from "../syntax/catalog.ts";
import filetypes from "./filetypes.json" with { type: "json" };
import { filetype } from "./filetype.ts";

test("I-5: every pinned Zed suffix maps to its original name", () => {
  assert.equal(filetypes.length, 19);
  for (const language of filetypes) {
    for (const suffix of language.path_suffixes) {
      assert.equal(filetype(`C:\\project\\${suffix}`), language.name, suffix);
      assert.equal(filetype(`C:\\project\\file.${suffix}`), language.name, suffix);
    }
  }
});

test("I-5: compound names beat generic extensions, exact case distinguishes C and C++, unknown is Plain Text", () => {
  for (const [name, expected] of [
    ["tsconfig.json", "JSONC"], ["devcontainer.json", "JSONC"], ["file.json", "JSON"],
    ["flake.lock", "JSON"], ["pixi.lock", "YAML"], [".env", "Env"], [".bashrc", "Shell Script"],
    ["COMMIT_EDITMSG", "Git Commit"], ["a.c", "C"], ["a.C", "C++"], ["a.MD", "Markdown"],
    ["Makefile", "Plain Text"], ["file.txt", "Plain Text"], ["file.unknown", "Plain Text"],
    ["nottsconfig.json", "JSON"], ["foojson", "Plain Text"],
  ]) assert.equal(filetype(`C:\\project\\${name}`), expected, name);
});

const copies = new URL("../assets/zed-grammars/languages/", import.meta.url);
const catalog = existsSync(copies) ? languageConfigs(Object.fromEntries(readdirSync(copies)
  .map((name) => [`languages/${name}/config.toml`, readFileSync(new URL(`${name}/config.toml`, copies), "utf8")]))) : [];

test("K-56: extension languages are named from the syntax catalog, and only when its copies exist", { skip: !catalog.some((config) => config.id === "gitignore") }, () => {
  for (const [name, expected] of [["sample.html", "HTML"], ["Cargo.toml", "TOML"], [".gitignore", "Git Ignore"], ["a.rs", "Rust"], ["a.C", "C++"]]) {
    assert.equal(filetype(`C:\\project\\${name}`, catalog), expected, name);
  }
  assert.equal(filetype("C:\\project\\sample.html", []), "Plain Text"); // no copies: only the built-in names
  assert.equal(filetype("C:\\project\\a.rs", []), "Rust");
});

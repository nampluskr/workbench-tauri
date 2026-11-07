import test from "node:test";
import assert from "node:assert/strict";
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

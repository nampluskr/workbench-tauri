import test from "node:test";
import assert from "node:assert/strict";
import { nameRegExp } from "./name-regexp.ts";

test("U-8: regexp names honor case and word options, and an invalid pattern matches nothing", () => {
  const names = ["Readme.md", "readme-old.md", "my_read.txt"];
  const hits = (pattern: string, caseSensitive = false, wholeWord = false) => {
    const regexp = nameRegExp(pattern, { caseSensitive, wholeWord });
    return regexp ? names.filter((name) => regexp.test(name)) : [];
  };
  assert.deepEqual(hits("^read"), ["Readme.md", "readme-old.md"]);
  assert.deepEqual(hits("^read", true), ["readme-old.md"]);
  assert.deepEqual(hits("read", false, true), []);
  assert.deepEqual(hits("readme(?=-)", false, true), ["readme-old.md"]);
  assert.equal(nameRegExp("[", { caseSensitive: false, wholeWord: false }), null);
  assert.equal(nameRegExp("", { caseSensitive: false, wholeWord: false }), null);
});

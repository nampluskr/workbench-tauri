import test from "node:test";
import assert from "node:assert/strict";
import { codeBlockParts, trimBlankLines } from "./code-block.ts";

test("core v0.8.2 I-22: blank lines at a code block's start and end are cut, blank lines inside stay", () => {
  assert.equal(trimBlankLines("\n\nx = 1\nprint(x)\n\n\n"), "x = 1\nprint(x)"); // the 0.8.1 measured block (markdown-it ends it with \n)
  assert.equal(trimBlankLines("  \t\n\r\nx\n \t \n"), "x"); // spaces, tabs and CRLF blank lines
  assert.equal(trimBlankLines("a\n\n  \nb"), "a\n\n  \nb");
  assert.equal(trimBlankLines("  indented\n"), "  indented"); // a line's own indent stays
  assert.equal(trimBlankLines("\n \n\t\n"), "");
});

test("core v0.8.2 I-23: line numbers start at the first shown line and are not in the code text that copy and find read", () => {
  const parts = codeBlockParts("\n\nx = 1\n\nprint(x)\n\n");
  assert.equal(parts.text, "x = 1\n\nprint(x)"); // copy writes this; the code element's only text
  assert.equal(parts.numbers, "1\n2\n3");
  assert.ok(!/^\d/m.test(parts.text));
  assert.deepEqual(codeBlockParts(" \n"), { text: "", numbers: "" });
});

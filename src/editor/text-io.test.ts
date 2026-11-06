import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { decode, lineEndingOf } from "./text-io.ts";

// R-5: the same fixture bytes the core's encoder test writes (test-fixtures/encoding), decoded here. Together they catch a
// difference between TextDecoder("euc-kr") and encoding_rs EUC_KR (D-5).
const fixture = (name: string) => new Uint8Array(readFileSync(new URL(`../../test-fixtures/encoding/${name}`, import.meta.url)));
const TEXT = "한글 A\n둘째 줄\n";

test("R-5: each fixture decodes to the text with its encoding and line ending", () => {
  for (const [name, encoding, lineEnding] of [
    ["utf8-lf.txt", "utf-8", "lf"],
    ["utf8-crlf.txt", "utf-8", "crlf"],
    ["utf8-bom.txt", "utf-8-bom", "lf"],
    ["utf16le-bom.txt", "utf-16le", "lf"],
    ["utf16be-bom.txt", "utf-16be", "lf"],
    ["cp949.txt", "cp949", "lf"],
  ] as const) {
    assert.deepEqual(decode(fixture(name)), { text: TEXT, encoding, lineEnding }, name);
  }
});

test("D-5: line ending is the most frequent one, the first on a tie, LF when there is none", () => {
  assert.equal(lineEndingOf("a\r\nb\r\nc\nd"), "crlf");
  assert.equal(lineEndingOf("a\nb\r\nc\n"), "lf");
  assert.equal(lineEndingOf("a\r\nb\n"), "crlf");
  assert.equal(lineEndingOf("a\nb\r\n"), "lf");
  assert.equal(lineEndingOf("abc"), "lf");
  assert.deepEqual(decode(new TextEncoder().encode("a\r\nb\nc")).text, "a\nb\nc");
});

test("D-5: UTF-16 without a BOM is not guessed; empty bytes are UTF-8 LF", () => {
  assert.equal(decode(new Uint8Array([0x41, 0x00, 0x42, 0x00])).encoding, "utf-8"); // valid UTF-8 (NULs), not sniffed as UTF-16
  assert.deepEqual(decode(new Uint8Array()), { text: "", encoding: "utf-8", lineEnding: "lf" });
});

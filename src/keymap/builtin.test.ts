import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BUILTIN } from "./builtin.ts";
import { parseKeys } from "./engine.ts";

// R-1: the built-in keymap must equal the expected table pinned in PROGRESS (Phase 2), row for row.
const progress = readFileSync(fileURLToPath(new URL("../../specs/v0.2/PROGRESS.md", import.meta.url)), "utf8");
const table = progress.slice(progress.indexOf("**R-1 기대 바인딩 표"), progress.indexOf("**우리가 지은 액션 이름"));
const row = (keys: string, context: string, action: string) => `${parseKeys(keys).join(" ")}\t${context}\t${action}`;

test("R-1: built-in keymap equals the PROGRESS expected table (key, context, action)", () => {
  const expected = new Set<string>();
  for (const line of table.split("\n").filter((l) => /^\| (I|A)-/.test(l))) {
    const [, , keys, , , context, action] = line.split("|").map((c) => c.trim().replace(/`/g, ""));
    expected.add(row(keys.replace(/ 키$/, "").replaceAll("+", "-"), context === "없음" ? "" : context, action));
  }
  const actual = new Set(BUILTIN.flatMap(({ context, bindings }) =>
    Object.entries(bindings).map(([keys, action]) => row(keys, context ?? "", String(action)))));
  assert.ok(expected.size > 50, "table not found in PROGRESS");
  assert.deepEqual([...actual].sort(), [...expected].sort());
});

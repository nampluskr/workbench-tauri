import test from "node:test";
import assert from "node:assert/strict";
import { buildRegistry, DEFAULT_THEME, pickTheme } from "./registry.ts";

const theme = (name: unknown, appearance: unknown = "dark") => ({ name, appearance, style: {} });
const file = (...themes: unknown[]) => JSON.stringify({ themes });

test("registry: dark first then light, each by string order; broken files and themes are skipped", () => {
  const list = buildRegistry({
    "b.json": file(theme("Zed Light", "light"), theme("Beta"), theme("")),
    "a.json": file(theme("Alpha Light", "light"), theme("Beta"), theme("Bad", "sepia"), { name: "NoStyle", appearance: "dark" }, null, theme(5)),
    "broken.json": "{",
    "null.json": "null",
    "other.json": JSON.stringify({ themes: "none" }),
    "c.json": file(theme("Alpha"), theme("Frappé"), theme("Frappé - No Italics")),
  });
  assert.deepEqual(list.map((t) => t.name), ["Alpha", "Beta", "Frappé", "Frappé - No Italics", "Alpha Light", "Zed Light"]);
});

test("registry: no files gives an empty list; an unknown or missing name picks One Light (core v0.8.2 I-2)", () => {
  assert.deepEqual(buildRegistry({}), []);
  const list = buildRegistry({ "one.json": file(theme("One Dark"), theme("One Light", "light")) });
  assert.equal(DEFAULT_THEME, "One Light");
  assert.equal(pickTheme(list, "One Dark").name, "One Dark");
  for (const name of ["Missing", undefined]) assert.equal(pickTheme(list, name).name, DEFAULT_THEME);
  assert.throws(() => pickTheme([], "x"));
});

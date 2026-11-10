import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// I-25: the Licenses screen's Rust list must be the crates of Cargo.lock at their locked versions.
test("I-25: every listed Rust crate is in Cargo.lock at the locked version, and tauri and windows are listed", () => {
  const lock = new Set([...readFileSync("src-tauri/Cargo.lock", "utf8").matchAll(/^name = "(.+)"\nversion = "(.+)"/gm)].map(([, name, version]) => `${name} ${version}`));
  const text = readFileSync("src/licenses/rust-dependencies.txt", "utf8");
  const listed = text.split("\n\n")[1].split("\n").map((line) => line.split("  ")[0]);
  assert.ok(listed.length > 100);
  assert.deepEqual(listed.filter((crate) => !lock.has(crate)), []);
  for (const name of ["tauri", "windows"]) assert.ok(listed.some((crate) => crate.startsWith(`${name} `)), name);
  assert.ok(!listed.some((crate) => crate.startsWith("workbench-tauri ")), "the app itself is not a dependency");
  assert.ok(text.includes("Permission is hereby granted"), "license texts are included");
});

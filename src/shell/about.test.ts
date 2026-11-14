import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { aboutText, attributions, licenseCounts, osName } from "./about.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
// The same files the Licenses screen globs (AppMenu.tsx), under the same kind of keys.
const files = {
  "../licenses/frontend-dependencies.txt": read("licenses/frontend-dependencies.txt"),
  "../licenses/rust-dependencies.txt": read("licenses/rust-dependencies.txt"),
  "../licenses/catppuccin-icons-1.24.0-MIT.txt": read("licenses/catppuccin-icons-1.24.0-MIT.txt"),
  "../licenses/codicons-0.0.46-24-CC-BY-4.0.txt": read("licenses/codicons-0.0.46-24-CC-BY-4.0.txt"),
  "../assets/codicons/NOTICE.txt": read("assets/codicons/NOTICE.txt"),
};

test("I-29: the About list takes versions, licenses and copyright lines from the Licenses data", () => {
  const list = Object.fromEntries(attributions(files).map((entry) => [entry.name, entry]));
  assert.deepEqual(Object.keys(list), ["Tauri", "Solid", "CodeMirror", "web-tree-sitter", "markdown-it", "KaTeX", "Mermaid", "Catppuccin Icons", "Codicons", "IBM Plex Sans", "Lilex", "JetBrains Mono", "Hack", "Ubuntu Mono", "D2Coding"]);
  assert.deepEqual(list.Tauri, { name: "Tauri", version: "2.12.5", license: "Apache-2.0 OR MIT", copyright: "Copyright (c) 2017 - Present Tauri Apps Contributors" });
  assert.deepEqual(list.Solid, { name: "Solid", version: "1.9.18", license: "MIT", copyright: "Copyright (c) 2016-2025 Ryan Carniato" });
  assert.equal(list.CodeMirror.version, "6.43.15");
  assert.deepEqual([list.KaTeX.version, list.KaTeX.license, list.Mermaid.version, list.Mermaid.license], ["0.18.11", "MIT", "12.2.0", "MIT"]);
  assert.equal(list["web-tree-sitter"].copyright, "Copyright (c) 2018 Max Brunsfeld");
  assert.deepEqual(list.Codicons, { name: "Codicons", version: "0.0.46-24", license: "CC-BY-4.0", copyright: "Copyright (c) Microsoft Corporation." });
  assert.equal(list["Catppuccin Icons"].copyright, "Copyright (c) 2021 Catppuccin");
  for (const entry of Object.values(list)) assert.ok(entry.license && entry.copyright, entry.name);
  assert.deepEqual(attributions({}).map((entry) => entry.name), ["IBM Plex Sans", "Lilex", "JetBrains Mono", "Hack", "Ubuntu Mono", "D2Coding"], "missing data leaves out only what it cannot name");
});

test("I-29: the Copy text holds the header, the technical lines and the main list; Windows 11 is told from the platform version", () => {
  const counts = licenseCounts(files);
  assert.ok(counts.rust > 100 && counts.javascript > 10);
  const text = aboutText({ name: "workbench-tauri", version: "0.8.3", date: "2026-11-10", host: "Tauri 2.12.5", webview2: "130.0.2849.80", os: "Windows 11 x64" }, attributions(files), counts);
  const lines = text.split("\n");
  assert.deepEqual(lines.slice(0, 8), ["workbench-tauri", "Version: 0.8.3", "Date: 2026-11-10", "Host: Tauri 2.12.5", "WebView2: 130.0.2849.80", "OS: Windows 11 x64", "", "Third-Party Software & Attributions"]);
  assert.ok(lines.includes("- Tauri 2.12.5 — Apache-2.0 OR MIT — Copyright (c) 2017 - Present Tauri Apps Contributors"));
  assert.ok(lines.includes("- Lilex — OFL-1.1 — Copyright 2019 The Lilex Project Authors"));
  assert.match(lines.at(-1)!, new RegExp(`^- and ${counts.rust} Rust crates and ${counts.javascript} JavaScript packages`));
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130";
  assert.equal(osName(ua, { platformVersion: "15.0.0", architecture: "x86", bitness: "64" }), "Windows 11 x64");
  assert.equal(osName(ua, { platformVersion: "10.0.0", architecture: "x86", bitness: "64" }), "Windows 10 x64");
  assert.equal(osName(ua), "Windows x64");
});

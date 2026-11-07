import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { bundledExtensions, CATEGORIES, emptyExtensions, EXTENSIONS_BINDINGS, filterExtensions, INSTALL_FILTERS, parseManifest } from "./model.ts";
import { Keymap } from "../keymap/engine.ts";

test("K-21: extension.toml top-level strings and string arrays", () => {
  const toml = [
    "﻿# comment", 'id = "multi"', 'name = "Multi \\"Quoted\\" \\u00e9"   # trailing', "version = '1.0.0'",
    'authors = ["A <a@x.dev>", # first', '  "B <b@x.dev>",', "]", 'description = "Soothing 🦀"', 'repository = "https://example.com/r"',
    "schema_version = 1", "", "[themes.x]", 'name = "ignored"',
  ].join("\n");
  assert.deepEqual(parseManifest(toml), { id: "multi", name: 'Multi "Quoted" é', version: "1.0.0", author: "A <a@x.dev>, B <b@x.dev>", description: "Soothing 🦀", repository: "https://example.com/r" });
  assert.deepEqual(parseManifest('name = "Bare"'), { id: "Bare", name: "Bare", version: "", author: "", description: "", repository: "" });
  assert.equal(parseManifest('author = "Single"\nname = "S"')?.author, "Single");
  for (const bad of ["", 'version = "1"', 'name = "x', 'name = "x" junk', "name = 5", "name =",'name = "a"\nauthors = ["b"', 'name = "\\q"', "no equals", 'authors = [["x"]]\nname = "n"']) {
    assert.equal(parseManifest(bad), undefined, bad);
  }
});

test("K-21: cards come from extension.toml and the files the extension has; built-in themes and bad files give none", () => {
  const files = ["theme/assets/cat/themes/a.json", "theme/assets/cat/LICENSE", "assets/icon-themes/cat-icons/icon_themes/i.json", "theme/assets/one/one.json"];
  const manifests = {
    "theme/assets/cat/extension.toml": 'name = "Cat"\nversion = "1"\nauthors = ["X <x@y>", "Z"]\ndescription = "D"\nrepository = "https://r"',
    "assets/icon-themes/cat-icons/extension.toml": 'name = "Cat Icons"',
    "theme/assets/empty/extension.toml": 'name = "No resources"',
    "theme/assets/broken/extension.toml": "name =",
  };
  assert.deepEqual(bundledExtensions(manifests, files).map(({ name, version, author, description, repository, kinds }) => ({ name, version, author, description, repository, kinds })), [
    { name: "Cat", version: "1", author: "X <x@y>, Z", description: "D", repository: "https://r", kinds: ["Themes"] },
    { name: "Cat Icons", version: "", author: "", description: "", repository: "", kinds: ["Icon Themes"] },
  ]);
  assert.deepEqual(bundledExtensions(manifests, []), [], "no copies, no cards");
  assert.deepEqual(bundledExtensions({}, files), []);
  const both = bundledExtensions({ "a/extension.toml": 'name = "Both"' }, ["a/themes/t.json", "a/icon_themes/i.json"]);
  assert.deepEqual(both[0].kinds, ["Themes", "Icon Themes"]);
});

// The real copies, when present: the three extension sets of core D-8, read from their extension.toml.
const set = (path: string) => new URL(`../${path}`, import.meta.url);
const copies = ["theme/assets/catppuccin", "theme/assets/macos-classic", "assets/icon-themes/catppuccin-icons"];
test("K-21: copied extension sets show their extension.toml values", { skip: !copies.every((c) => existsSync(set(`${c}/extension.toml`))) }, () => {
  const manifests = Object.fromEntries(copies.map((c) => [`${c}/extension.toml`, readFileSync(set(`${c}/extension.toml`), "utf8")]));
  const files = ["theme/assets/catppuccin/themes/x.json", "theme/assets/macos-classic/themes/x.json", "assets/icon-themes/catppuccin-icons/icon_themes/x.json"];
  assert.deepEqual(bundledExtensions(manifests, files).map(({ name, version, author, kinds, repository }) => [name, version, author, kinds.join(), repository]), [
    ["Catppuccin", "0.2.27", "Catppuccin <releases@catppuccin.com>", "Themes", "https://github.com/catppuccin/zed"],
    ["Catppuccin Icons", "1.24.0", "Catppuccin <releases@catppuccin.com>", "Icon Themes", "https://github.com/catppuccin/zed-icons"],
    ["macOS Classic Theme", "0.4.0", "Jason Lee <huacnlee@gmail.com>", "Themes", "https://github.com/huacnlee/zed-theme-macos-classic"],
  ]);
});

test("K-12: search, categories and installation status combine", () => {
  const rows = bundledExtensions({
    "t/extension.toml": 'name = "One"\nauthors = ["Zed Industries"]\ndescription = "Color palette"',
    "i/extension.toml": 'name = "Zed Icons"\nauthors = ["Zed Industries"]',
  }, ["t/themes/a.json", "i/icon_themes/a.json"]);
  assert.deepEqual(CATEGORIES, ["All", "Themes", "Icon Themes"]);
  assert.deepEqual(INSTALL_FILTERS, ["All", "Installed", "Not Installed"]);
  assert.equal(filterExtensions(rows, "  ZED palette ", "Themes", "Installed").length, 1);
  assert.equal(filterExtensions(rows, "", "All", "Installed").length, 2);
  assert.equal(filterExtensions(rows, "", "Icon Themes", "All")[0].name, "Zed Icons");
  assert.deepEqual(filterExtensions(rows, "", "All", "Not Installed"), []);
  assert.deepEqual(filterExtensions(rows, "missing", "All", "All"), []);
  assert.equal(emptyExtensions("dark", "Installed"), 'No installed extensions that match "dark"');
  assert.equal(emptyExtensions("", "Not Installed"), "No uninstalled extensions");
  const keymap = new Keymap();
  keymap.addSections("default", EXTENSIONS_BINDINGS);
  assert.deepEqual(keymap.dispatch(["ctrl-shift-x"], [new Set(["Workspace"])]), { type: "match", action: "zed::Extensions" });
});

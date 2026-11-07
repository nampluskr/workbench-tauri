import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bundledExtensions, CATEGORIES, emptyExtensions, EXTENSIONS_BINDINGS, filterExtensions, INSTALL_FILTERS } from "./model.ts";
import { Keymap } from "../keymap/engine.ts";

test("K-12: copied theme metadata and absent icon copies", () => {
  const one = readFileSync(new URL("../theme/assets/one/one.json", import.meta.url), "utf8");
  const rows = bundledExtensions({ one }, true);
  assert.deepEqual(rows.map(({ name, version, author, description, category }) => ({ name, version, author, description, category })), [
    { name: "One Dark", version: "", author: "Zed Industries", description: "", category: "Themes" },
    { name: "One Light", version: "", author: "Zed Industries", description: "", category: "Themes" },
    { name: "Zed (Default)", version: "", author: "", description: "", category: "Icon Themes" },
  ]);
  assert.deepEqual(bundledExtensions({}, false), []);
  assert.deepEqual(bundledExtensions({ missing: '{"themes":[{"name":"Bare"},null,{},4]}', broken: "{", invalid: "null" }, false), [
    { id: "missing:0", name: "Bare", version: "", author: "", description: "", category: "Themes" },
  ]);
  const added = bundledExtensions({ extra: JSON.stringify({ author: "Family", version: "1", description: "Description", themes: [{ name: "New" }, { name: "Override", author: "Other" }] }) }, false);
  assert.equal(added.length, 2);
  assert.deepEqual([added[0].version, added[0].author, added[0].description, added[1].author], ["1", "Family", "Description", "Other"]);
});

test("K-12: search, categories and installation status combine", () => {
  const rows = bundledExtensions({ one: JSON.stringify({ author: "Zed Industries", description: "Color palette", themes: [{ name: "One Dark" }, { name: "One Light" }] }) }, true);
  assert.deepEqual(CATEGORIES, ["All", "Themes", "Icon Themes"]);
  assert.deepEqual(INSTALL_FILTERS, ["All", "Installed", "Not Installed"]);
  assert.equal(filterExtensions(rows, "  ZED palette DARK ", "Themes", "Installed").length, 1);
  assert.equal(filterExtensions(rows, "", "All", "Installed").length, 3);
  assert.equal(filterExtensions(rows, "", "Icon Themes", "All")[0].name, "Zed (Default)");
  assert.deepEqual(filterExtensions(rows, "", "All", "Not Installed"), []);
  assert.deepEqual(filterExtensions(rows, "missing", "All", "All"), []);
  assert.equal(emptyExtensions("dark", "Installed"), 'No installed extensions that match "dark"');
  assert.equal(emptyExtensions("", "Not Installed"), "No uninstalled extensions");
  const keymap = new Keymap();
  keymap.addSections("default", EXTENSIONS_BINDINGS);
  assert.deepEqual(keymap.dispatch(["ctrl-shift-x"], [new Set(["Workspace"])]), { type: "match", action: "zed::Extensions" });
});

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { buildIconThemes, dirIcon, fileIcon, resolveAsset } from "./icon-themes.ts";

const ZED = "zed-icons/file_icons/";
const CAT = "icon-themes/cat/icons/";
const assets = new Set(["file", "rust", "docker", "book", "tsx", "json", "folder", "folder_open"].map((n) => `${ZED}${n}.svg`)
  .concat(["readme", "markdown", "folder_src", "folder_src_open", "_folder", "_folder_open"].map((n) => `${CAT}${n}.svg`)));
const icon = (name: string) => ({ path: `${ZED}${name}.svg` }); // the generated Zed JSON: paths from the asset root

const zedJson = JSON.stringify({ name: "Zed (Default)", themes: [{
  name: "Zed (Default)", appearance: "dark",
  file_stems: { Dockerfile: "docker" },
  file_suffixes: { rs: "rust", bak: "backup", md: "markdown", tsx: "tsx", json: "json" },
  file_icons: { default: icon("file"), rust: icon("rust"), docker: icon("docker"), markdown: icon("book"), tsx: icon("tsx"), json: icon("json") },
  directory_icons: { collapsed: `${ZED}folder.svg`, expanded: `${ZED}folder_open.svg` },
}] });
const catJson = JSON.stringify({ name: "Cat", themes: [
  { name: "Cat Dark", appearance: "dark", file_stems: { README: "readme" }, file_suffixes: { md: "markdown" },
    file_icons: { readme: { path: "./icons/readme.svg" }, markdown: { path: "./icons/markdown.svg" } },
    directory_icons: { collapsed: "./icons/_folder.svg", expanded: "./icons/_folder_open.svg" },
    named_directory_icons: { src: { collapsed: "./icons/folder_src.svg", expanded: "./icons/folder_src_open.svg" }, half: { collapsed: "./icons/folder_src.svg", expanded: null } },
    chevron_icons: { collapsed: null, expanded: null } },
  { name: "Cat Light", appearance: "light", directory_icons: {}, file_icons: {} },
] });
const list = buildIconThemes([{ json: catJson, root: "icon-themes/cat" }, { json: zedJson, root: "" }, { json: "{", root: "x" }, { json: "null", root: "x" }], assets);

test("icon theme list: dark first then light by name; bad files are skipped", () => {
  assert.deepEqual(list.map((t) => t.name), ["Cat Dark", "Zed (Default)", "Cat Light"]);
  assert.deepEqual(buildIconThemes([], assets), []);
});

test("icon paths: relative to the theme root, inside the copied folders only (T-32.11)", () => {
  assert.equal(resolveAsset("icon-themes/cat", "./icons/readme.svg", assets), `${CAT}readme.svg`);
  for (const bad of ["/zed-icons/file_icons/file.svg", "C:\\x.svg", "https://x/a.svg", "..\\..\\x.svg", "../zed-icons/file_icons/file.svg", "../../zed-icons/file_icons/file.svg", "icons/../icons/readme.svg", "./icons/missing.svg", null, 5]) {
    assert.equal(resolveAsset("icon-themes/cat", bad, assets), undefined, String(bad));
  }
});

test("file icons: name, suffix chain, stem, default (T-22.1-T-22.5)", () => {
  const pick = (name: string) => fileIcon(list, "Zed (Default)", name);
  assert.equal(pick("Dockerfile"), `${ZED}docker.svg`);
  assert.equal(pick("Dockerfile.prod"), `${ZED}docker.svg`);
  assert.equal(pick("main.rs"), `${ZED}rust.svg`);
  assert.equal(pick("a.stories.tsx"), `${ZED}tsx.svg`);
  assert.equal(pick(".data.json"), `${ZED}json.svg`);
  assert.equal(pick("notes.md"), `${ZED}book.svg`);
  assert.equal(pick("unknown.xyz"), `${ZED}file.svg`);
  assert.equal(pick("notes.bak"), `${ZED}file.svg`, "backup has no definition: the default file icon (K-17)");
  assert.equal(pick("constructor.zzz"), `${ZED}file.svg`);
});

test("extension theme sits on Zed (Default): own icons first, then Zed's tables and icons (T-22.6, T-32.10)", () => {
  const pick = (name: string) => fileIcon(list, "Cat Dark", name);
  assert.equal(pick("README"), `${CAT}readme.svg`);
  assert.equal(pick("x.md"), `${CAT}markdown.svg`);
  assert.equal(pick("main.rs"), `${ZED}rust.svg`, "suffix from Zed, no rust icon in the theme");
  assert.equal(pick("x.xyz"), `${ZED}file.svg`, "no default key in the theme (T-20.14)");
  assert.equal(fileIcon(list, "Missing", "main.rs"), `${ZED}rust.svg`, "an unknown theme draws as Zed (Default)");
  assert.equal(fileIcon(list.filter((t) => t.name !== "Zed (Default)"), "Cat Dark", "x.xyz"), undefined);
  assert.equal(fileIcon([], "Cat Dark", "x.rs"), undefined);
});

test("folder icons: named, then plain; open state picks the path (T-22.7-T-22.10)", () => {
  assert.equal(dirIcon(list, "Cat Dark", "src", false), `${CAT}folder_src.svg`);
  assert.equal(dirIcon(list, "Cat Dark", " src ", true), `${CAT}folder_src_open.svg`);
  assert.equal(dirIcon(list, "Cat Dark", "SRC", false), `${CAT}_folder.svg`, "names are case-sensitive");
  assert.equal(dirIcon(list, "Cat Dark", "half", true), `${CAT}_folder_open.svg`, "a null path falls through");
  assert.equal(dirIcon(list, "Cat Light", "docs", true), `${ZED}folder_open.svg`, "no plain folder in the theme: Zed (Default)");
  assert.equal(dirIcon(list, "Zed (Default)", "src", false), `${ZED}folder.svg`);
  assert.equal(dirIcon([], "Zed (Default)", "src", false), undefined);
});

// The real copies, when present: every icon the lookup returns must be an existing file.
const copies = new URL("../assets/icon-themes/", import.meta.url);
test("copied icon themes: nine themes and every returned path exists", { skip: !existsSync(new URL("zed/zed-default.json", copies)) || !existsSync(new URL("catppuccin-icons/icon_themes", copies)) }, () => {
  const assetsRoot = new URL("../assets/", import.meta.url);
  const found = new Set<string>();
  for (const base of ["zed-icons/file_icons/", "icon-themes/catppuccin-icons/icons/"]) {
    for (const f of readdirSync(new URL(base, assetsRoot), { recursive: true, encoding: "utf8" })) if (f.endsWith(".svg")) found.add(base + f.replaceAll("\\", "/"));
  }
  const sources = [
    { json: readFileSync(new URL("zed/zed-default.json", copies), "utf8"), root: "" },
    ...readdirSync(new URL("catppuccin-icons/icon_themes/", copies)).map((f) => ({ json: readFileSync(new URL(`catppuccin-icons/icon_themes/${f}`, copies), "utf8"), root: "icon-themes/catppuccin-icons" })),
  ];
  const real = buildIconThemes(sources, found);
  assert.equal(real.length, 9);
  assert.equal(real[0].name, "Catppuccin Frappé");
  assert.equal(real.at(-1)!.name, "Catppuccin Latte Monochrome");
  for (const theme of real) {
    for (const path of [fileIcon(real, theme.name, "README.md"), fileIcon(real, theme.name, "main.rs"), fileIcon(real, theme.name, "x.bak"), fileIcon(real, theme.name, "zzz.unknown"),
      dirIcon(real, theme.name, "src", false), dirIcon(real, theme.name, "src", true), dirIcon(real, theme.name, "nothing-named-this", false)]) {
      assert.ok(path && found.has(path), `${theme.name}: ${path}`);
    }
  }
});

// I-29: what the About window says. Versions, licenses and copyright lines of the libraries are read from the same copies the Licenses
// screen shows (src/licenses/*.txt and the notices next to the assets), so they cannot drift from it.

export type AboutInfo = { name: string; version: string; date: string; host: string; webview2: string; os: string };
export type Attribution = { name: string; version: string; license: string; copyright: string };
export type LicenseCounts = { rust: number; javascript: number };

// A real copyright line: "Copyright (c) ...", "Copyright © ..." or "Copyright 2019 ...", not "Copyright and Similar Rights" or "Copyright [yyyy]".
const COPYRIGHT = /^[ \t]*Copyright (?:\(c\)|©|\d{4}).*$/im;
const escapeRegExp = (text: string) => text.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&");
const copyrightOf = (text: string | undefined) => text?.match(COPYRIGHT)?.[0].trim() ?? "";
const file = (files: Record<string, string>, suffix: string) => Object.entries(files).find(([path]) => path.endsWith(suffix))?.[1];

function licenseName(text: string): string {
  if (/Permission is hereby granted, free of charge/.test(text)) return "MIT";
  if (/Apache License/.test(text)) return "Apache-2.0";
  if (/Mozilla Public License/.test(text)) return "MPL-2.0";
  return "";
}

/** A JavaScript package of frontend-dependencies.txt: its version comes from the section header, its license and copyright from the text under it. */
function npmPackage(frontend: string, name: string, label: string): Attribution | undefined {
  const header = new RegExp(`^node_modules/${escapeRegExp(name)}@([^/\\n]+)/LICENSE[^\\n]*\\n`, "m").exec(frontend);
  if (!header) return undefined;
  const text = frontend.slice(header.index + header[0].length).split(/^node_modules\//m)[0];
  return { name: label, version: header[1], license: licenseName(text), copyright: copyrightOf(text) };
}

/** A crate of rust-dependencies.txt: the index line gives version and license, the text group that lists the crate gives the copyright. */
function rustCrate(rust: string, name: string, label: string): Attribution | undefined {
  const line = new RegExp(`^${escapeRegExp(name)} (\\S+)  (.+)$`, "m").exec(rust);
  if (!line) return undefined;
  const crate = `${name} ${line[1]}`;
  const copyright = rust.split(/^==== /m).slice(1).flatMap((group) => {
    const [owners, ...text] = group.split("\n");
    return owners.replace(/ ====$/, "").split(", ").includes(crate) ? [copyrightOf(text.join("\n"))] : [];
  }).find(Boolean) ?? "";
  return { name: label, version: line[1], license: line[2], copyright };
}

/** An asset notice copied as `name-version-license.txt` into src/licenses. `notice` is the asset folder's own file when the copyright line lives there. */
function noticeFile(files: Record<string, string>, base: string, label: string, notice?: string): Attribution | undefined {
  const name = new RegExp(`/licenses/${escapeRegExp(base)}-(\\d+\\.\\d+\\.\\d+(?:-\\d+)?)-([^/]+)\\.txt$`);
  for (const [path, text] of Object.entries(files)) {
    const match = name.exec(path);
    if (match) return { name: label, version: match[1], license: match[2], copyright: copyrightOf(text) || copyrightOf(notice) };
  }
  return undefined;
}

// The fonts ship their license files in public/fonts and are fetched at run time, so their lines are written here (IBM Plex Sans and Lilex state no version).
const FONTS: Attribution[] = [
  { name: "IBM Plex Sans", version: "", license: "OFL-1.1", copyright: 'Copyright © 2017 IBM Corp. with Reserved Font Name "Plex"' },
  { name: "Lilex", version: "", license: "OFL-1.1", copyright: "Copyright 2019 The Lilex Project Authors" },
  // core v0.8.1 I-10: the code fonts, versions as their release archives name them.
  { name: "JetBrains Mono", version: "2.304", license: "OFL-1.1", copyright: "Copyright 2020 The JetBrains Mono Project Authors" },
  { name: "Hack", version: "3.003", license: "MIT AND Bitstream-Vera", copyright: "Copyright 2018 Source Foundry Authors; Copyright 2003 Bitstream, Inc." },
  { name: "Ubuntu Mono", version: "0.83", license: "Ubuntu Font Licence 1.0", copyright: "Copyright 2011 Canonical Ltd." },
  { name: "D2Coding", version: "1.3.2", license: "OFL-1.1", copyright: "Copyright (c) 2015, NAVER Corporation" },
];

/** The libraries the running app is built from: the framework, the editor, the syntax, Markdown, formula and diagram engines, the bundled icons and the fonts. */
export function attributions(files: Record<string, string>): Attribution[] {
  const frontend = file(files, "frontend-dependencies.txt") ?? "", rust = file(files, "rust-dependencies.txt") ?? "";
  return [
    rustCrate(rust, "tauri", "Tauri"),
    npmPackage(frontend, "solid-js", "Solid"),
    npmPackage(frontend, "@codemirror/view", "CodeMirror"),
    npmPackage(frontend, "web-tree-sitter", "web-tree-sitter"),
    npmPackage(frontend, "markdown-it", "markdown-it"),
    npmPackage(frontend, "katex", "KaTeX"),
    npmPackage(frontend, "mermaid", "Mermaid"),
    noticeFile(files, "catppuccin-icons", "Catppuccin Icons"),
    noticeFile(files, "codicons", "Codicons", file(files, "/codicons/NOTICE.txt")),
    ...FONTS,
  ].filter((entry): entry is Attribution => !!entry);
}

/** How many Rust crates and JavaScript packages the Licenses screen lists, for the line that points there. */
export function licenseCounts(files: Record<string, string>): LicenseCounts {
  const frontend = file(files, "frontend-dependencies.txt") ?? "", rust = file(files, "rust-dependencies.txt") ?? "";
  const crates = rust.split("\n\n")[1]?.split("\n").filter(Boolean).length ?? 0;
  return { rust: crates, javascript: new Set(Array.from(frontend.matchAll(/^node_modules\/((?:@[^/]+\/)?[^/@]+@[^/]+)\//gm), (m) => m[1])).size };
}

/** "Windows 11 x64": WebView2 reports a Windows 10 UA string on Windows 11, only the platform version (13 and up) tells them apart. */
export function osName(userAgent: string, data?: { platformVersion?: string; architecture?: string; bitness?: string }): string {
  if (!/Windows NT/.test(userAgent)) return "unknown";
  const major = parseInt(data?.platformVersion ?? "", 10);
  const windows = Number.isNaN(major) ? "Windows" : major >= 13 ? "Windows 11" : "Windows 10";
  const arch = data?.architecture === "arm" ? "arm64" : data?.architecture === "x86" ? (data.bitness === "32" ? "x86" : "x64") : /Win64|x64/.test(userAgent) ? "x64" : "";
  return [windows, arch].filter(Boolean).join(" ");
}

export const entryLine = ({ name, version, license, copyright }: Attribution) => [[name, version].filter(Boolean).join(" "), license, copyright].filter(Boolean).join(" — ");

/** The whole About window as the text Copy puts on the clipboard. */
export function aboutText(info: AboutInfo, list: Attribution[], counts: LicenseCounts): string {
  return [
    info.name,
    `Version: ${info.version}`, `Date: ${info.date}`, `Host: ${info.host}`, `WebView2: ${info.webview2}`, `OS: ${info.os}`,
    "",
    "Third-Party Software & Attributions",
    ...list.map((entry) => `- ${entryLine(entry)}`),
    `- and ${counts.rust} Rust crates and ${counts.javascript} JavaScript packages; the full list and license texts are in Licenses`,
  ].join("\n");
}

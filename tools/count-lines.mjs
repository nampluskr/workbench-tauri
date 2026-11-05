// M-4 line counts (D-18): app code / tests / tools, for a git ref (the legacy PoC tag) or the working tree.
// Usage: node tools/count-lines.mjs <ref|worktree>   -> JSON to stdout
// Counted: src/**/*.{ts,tsx,css}, src-tauri/src/**/*.rs, tools/**. Not counted: docs, JSON data, lock files, icons, config.
// Tests: src/**/*.test.ts, plus each Rust file's tail from its first `#[cfg(test)]` (checked by hand to be a trailing `mod tests`).
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ref = process.argv[2];
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28 });
let files; // path -> text
if (ref === "worktree") {
  files = {};
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) { if (n !== "node_modules" && n !== "target") walk(p); } else files[p.replaceAll("\\", "/")] = readFileSync(p, "utf8");
    }
  };
  for (const d of ["src", "src-tauri/src", "tools"]) walk(d);
} else {
  files = Object.fromEntries(git("ls-tree", "-r", "--name-only", ref).split("\n").filter((p) => /^(src\/|src-tauri\/src\/|tools\/)/.test(p)).map((p) => [p, git("show", `${ref}:${p}`)]));
}

const lines = (t) => (t === "" ? [] : t.replace(/\r?\n$/, "").split(/\r?\n/));
const count = (ls) => ({ lines: ls.length, nonblank: ls.filter((l) => l.trim()).length });
const add = (a, b) => ({ lines: a.lines + b.lines, nonblank: a.nonblank + b.nonblank });
const zero = { lines: 0, nonblank: 0 };
const out = { ref, app: { ts: zero, rust: zero }, tests: { ts: zero, rust: zero }, tools: zero, files: {}, rustTestStart: {}, poc: zero };
for (const [path, text] of Object.entries(files)) {
  const ls = lines(text);
  if (path.startsWith("tools/")) { out.tools = add(out.tools, count(ls)); out.files[path] = ["tools", count(ls).lines]; continue; }
  if (/^src\/.*\.(ts|tsx|css)$/.test(path)) {
    const kind = /\.test\.ts$/.test(path) ? "tests" : "app";
    out[kind].ts = add(out[kind].ts, count(ls));
    out.files[path] = [kind + ".ts", count(ls).lines];
    if (path.startsWith("src/poc/")) out.poc = add(out.poc, count(ls));
  } else if (/^src-tauri\/src\/.*\.rs$/.test(path)) {
    const at = ls.findIndex((l) => /^\s*#\[cfg\(test\)\]/.test(l));
    const body = at < 0 ? ls : ls.slice(0, at), tail = at < 0 ? [] : ls.slice(at);
    out.app.rust = add(out.app.rust, count(body));
    out.tests.rust = add(out.tests.rust, count(tail));
    out.files[path] = ["rust", count(body).lines, count(tail).lines];
    if (at >= 0) out.rustTestStart[path] = `cfg(test) at line ${at + 1} of ${ls.length}`;
  }
}
console.log(JSON.stringify(out, null, 1));

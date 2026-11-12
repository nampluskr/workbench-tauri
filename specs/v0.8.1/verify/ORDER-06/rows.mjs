// Ink rows of a preview screenshot: node rows.mjs <png> <x0> <x1> <y0> <y1>. Prints runs of rows that hold glyph ink
// (top, bottom, height, left ink x) and full-width rule rows. Background = the most common color in the region.
import { readFileSync } from "node:fs";
import { decodePng } from "file:///D:/projects/workbench-tauri/tools/png.mjs";
const [file, x0s, x1s, y0s, y1s] = process.argv.slice(2);
const { w, h, data } = decodePng(readFileSync(file));
const x0 = +x0s, x1 = Math.min(+x1s, w), y0 = +y0s, y1 = Math.min(+y1s, h);
const key = (i) => (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
const counts = new Map();
for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const k = key((y * w + x) * 4); counts.set(k, (counts.get(k) || 0) + 1); }
const bg = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
const bgc = [bg >> 16, (bg >> 8) & 255, bg & 255];
const diff = (i) => Math.abs(data[i] - bgc[0]) + Math.abs(data[i + 1] - bgc[1]) + Math.abs(data[i + 2] - bgc[2]);
const rows = [];
for (let y = y0; y < y1; y++) {
  let ink = 0, faint = 0, left = -1;
  for (let x = x0; x < x1; x++) { const d = diff((y * w + x) * 4); if (d > 120) { ink++; if (left < 0) left = x; } else if (d > 6) faint++; }
  rows.push({ y, ink, faint, left });
}
const runs = [];
let cur = null;
for (const r of rows) {
  const rule = r.ink < 3 && r.faint > (x1 - x0) * 0.5;
  if (rule) { runs.push({ kind: "rule", top: r.y, bottom: r.y }); cur = null; continue; }
  if (r.ink > 0) { if (cur && r.y === cur.bottom + 1) { cur.bottom = r.y; cur.left = Math.min(cur.left, r.left); } else { cur = { kind: "text", top: r.y, bottom: r.y, left: r.left }; runs.push(cur); } }
}
// merge consecutive rule rows
const out = [];
for (const r of runs) { const p = out.at(-1); if (r.kind === "rule" && p && p.kind === "rule" && r.top === p.bottom + 1) p.bottom = r.top; else out.push({ ...r }); }
console.log(JSON.stringify({ bg: "#" + bg.toString(16).padStart(6, "0"), runs: out.map((r) => ({ ...r, height: r.bottom - r.top + 1 })) }));

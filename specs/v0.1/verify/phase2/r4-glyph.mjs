// checker script: R-4 glyph render check.
// 1) code points actually present in the source files (Shell.tsx, caption.rs)
// 2) reference glyphs: the same font ("Segoe Fluent Icons", 10px) + code point drawn in a throw-away DOM row
//    (removed afterwards), screenshotted by CDP; compared with the app's buttons.
import fs from "node:fs";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";

const ROOT = "D:/projects/workbench-tauri";
const P = ROOT + "/specs/v0.1/verify/phase2/";
const SP = "C:/Users/nampl/AppData/Local/Temp/claude/D--projects-workbench-tauri/00945238-03d7-4894-8b14-f634b949c9b7/scratchpad/";
const run = (f, a) => execFileSync(f, a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
const cdp = (expr, shot) => {
  const args = ["tools/cdp-eval.mjs", "--pid", "17684", "--port", "9222", expr, "--out", SP + "g.json"];
  if (shot) args.push("--screenshot", P + shot);
  run("node", args);
  return JSON.parse(fs.readFileSync(SP + "g.json", "utf8")).value;
};
function loadPng(f) {
  const b = fs.readFileSync(f);
  let p = 8, w, h, ct;
  const idat = [];
  while (p < b.length) {
    const l = b.readUInt32BE(p), t = b.toString("ascii", p + 4, p + 8);
    const d = b.subarray(p + 8, p + 8 + l);
    if (t === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    if (t === "IDAT") idat.push(d);
    p += 12 + l;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp, out = Buffer.alloc(h * stride);
  let q = 0;
  for (let y = 0; y < h; y++) {
    const f2 = raw[q++];
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0, up = y > 0 ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v = raw[q++];
      if (f2 === 1) v += a; else if (f2 === 2) v += up; else if (f2 === 3) v += (a + up) >> 1;
      else if (f2 === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      out[y * stride + x] = v & 255;
    }
  }
  return { w, h, bpp, data: out };
}
const px = (im, x, y) => { const i = (y * im.w + x) * im.bpp; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
// bbox of "lit" pixels: differ from the box's corner color by more than `thr` (sum of channels)
function bbox(im, ox, oy, w, h, thr = 60) {
  const bg = px(im, ox + 1, oy + 1);
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = px(im, ox + x, oy + y);
    if (Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) > thr) { n++; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1, lit: n };
}

const out = { codePoints: {}, compare: {} };
// 1) code points in source
const cps = (s) => [...s].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"));
const shell = fs.readFileSync(ROOT + "/src/shell/Shell.tsx", "utf8").split("\n");
for (const [i, line] of shell.entries()) { const m = line.match(/const (GLYPH_\w+) = "(.*)";/); if (m) out.codePoints[`src/shell/Shell.tsx:${i + 1} ${m[1]}`] = cps(m[2]); }
const cap = fs.readFileSync(ROOT + "/src-tauri/src/caption.rs", "utf8").split("\n");
for (const [i, line] of cap.entries()) { const m = line.match(/const (GLYPH_\w+): u16 = (0x[0-9A-F]+);/); if (m) out.codePoints[`src-tauri/src/caption.rs:${i + 1} ${m[1]}`] = m[2].replace("0x", "U+"); }
for (const [i, line] of cap.entries()) if (/w!\("Segoe Fluent Icons"\)/.test(line)) out.codePoints[`src-tauri/src/caption.rs:${i + 1} font`] = "Segoe Fluent Icons";
for (const [i, line] of shell.entries()) if (/font-family: "Segoe Fluent Icons"/.test(line)) out.codePoints[`src/shell/Shell.tsx:${i + 1} font-family`] = "Segoe Fluent Icons";

// 2) reference row in the page (Mocha theme assumed active)
const rect = cdp(`(()=>{
 const root=document.createElement('div');root.id='__checker_glyphs';
 root.style.position='fixed';root.style.left='10px';root.style.top=(innerHeight-120)+'px';root.style.zIndex='99999';root.style.display='flex';root.style.gap='4px';root.style.background='#11111b';
 for(const cp of [0xE921,0xE922,0xE923,0xE8BB]){const d=document.createElement('div');d.style.width='36px';d.style.height='32px';d.style.display='flex';d.style.alignItems='center';d.style.justifyContent='center';d.style.fontFamily='"Segoe Fluent Icons"';d.style.fontSize='10px';d.style.lineHeight='1';d.style.color='#cdd6f4';d.style.background='#11111b';d.textContent=String.fromCodePoint(cp);root.appendChild(d);}
 document.body.appendChild(root);
 return [...root.children].map(c=>{const r=c.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});})()`, "r4-glyph-reference-cdp.png");
cdp("(()=>{document.getElementById('__checker_glyphs').remove();return 1})()");
const ref = loadPng(P + "r4-glyph-reference-cdp.png");
const names = ["U+E921 minimize", "U+E922 maximize", "U+E923 restore", "U+E8BB close"];
const refBox = rect.map((r, i) => ({ name: names[i], bbox: bbox(ref, Math.round(r.x * 2), Math.round(r.y * 2), 72, 64) }));
out.reference = refBox;

// app: HTML buttons from the CDP screenshot of the active window (min and close)
const app = loadPng(P + "r8-mocha-active-cdp.png");
const rects = cdp("__poc.shell.rects()");
const wb = rects.windowButtons;
const appMin = bbox(app, wb.minimize.rect.physical.x, 0, 72, 64);
const appClose = bbox(app, wb.close.rect.physical.x, 0, 72, 64);
const eq = (a, b) => Math.abs(a.w - b.w) <= 1 && Math.abs(a.h - b.h) <= 1 && Math.abs(a.x0 - b.x0) <= 1 && Math.abs(a.y0 - b.y0) <= 1;
// pixel-for-pixel diff of the whole 72x64 box
const diffBox = (imA, ax, ay, imB, bx, by) => { let n = 0, mx = 0; for (let y = 0; y < 64; y++) for (let x = 0; x < 72; x++) { const a = px(imA, ax + x, ay + y), b = px(imB, bx + x, by + y); const d = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2])); if (d > 0) n++; mx = Math.max(mx, d); } return { differingPixels: n, maxChannelDiff: mx }; };
out.compare["minimize (HTML button, U+E921)"] = { app: appMin, reference: refBox[0].bbox, bboxMatch: eq(appMin, refBox[0].bbox), pixelDiff: diffBox(app, wb.minimize.rect.physical.x, 0, ref, Math.round(rect[0].x * 2), Math.round(rect[0].y * 2)) };
out.compare["close (HTML button, U+E8BB)"] = { app: appClose, reference: refBox[3].bbox, bboxMatch: eq(appClose, refBox[3].bbox), pixelDiff: diffBox(app, wb.close.rect.physical.x, 0, ref, Math.round(rect[3].x * 2), Math.round(rect[3].y * 2)) };
// native maximize: PrintWindow captures (capture offset = client origin inside the image)
const norm = JSON.parse(fs.readFileSync(P + "r4-normal-capture.json", "utf8"));
const normIm = loadPng(P + "r4-normal.png");
const nox = norm.clientRect.x - norm.rect.x, noy = norm.clientRect.y - norm.rect.y;
const bx = wb.maximize.rect.physical.x;
const appMax = bbox(normIm, bx + nox, noy, 72, 64);
out.compare["maximize (native GDI, U+E922) vs Chrome reference"] = { app: appMax, reference: refBox[1].bbox, bboxMatch: eq(appMax, refBox[1].bbox), note: "GDI ClearType vs Chrome text: compare glyph box size/position only (+-1 physical px)" };
const mx = JSON.parse(fs.readFileSync(P + "r3-maximized-capture.json", "utf8"));
const mxIm = loadPng(P + "r3-maximized.png");
const appRestore = bbox(mxIm, bx + (mx.clientRect.x - mx.rect.x), mx.clientRect.y - mx.rect.y, 72, 64);
out.compare["restore (native GDI, U+E923, window maximized) vs Chrome reference"] = { app: appRestore, reference: refBox[2].bbox, bboxMatch: eq(appRestore, refBox[2].bbox) };
fs.writeFileSync(P + "r4-glyph-compare.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.codePoints, null, 1));
for (const [k, v] of Object.entries(out.compare)) console.log(k, "bboxMatch=" + v.bboxMatch, JSON.stringify(v.app), JSON.stringify(v.reference), JSON.stringify(v.pixelDiff || ""));

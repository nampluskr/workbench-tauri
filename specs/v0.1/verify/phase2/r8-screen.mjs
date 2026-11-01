// checker script: R-8 screen color samples S-1..S-13 from PrintWindow captures (same PID/HWND as the CDP target).
// usage: node r8-screen.mjs "Catppuccin Mocha" mocha
import fs from "node:fs";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";

const ROOT = "D:/projects/workbench-tauri";
const P = ROOT + "/specs/v0.1/verify/phase2/";
const SP = "C:/Users/nampl/AppData/Local/Temp/claude/D--projects-workbench-tauri/00945238-03d7-4894-8b14-f634b949c9b7/scratchpad/";
const [, , THEME, KEY] = process.argv;
const PID = "17684";
const HWND = "0x760830";

const run = (file, args) => execFileSync(file, args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 });
const cdp = (expr) => {
  const out = SP + "cdp-tmp.json";
  run("node", ["tools/cdp-eval.mjs", "--pid", PID, "--port", "9222", expr, "--out", out]);
  return JSON.parse(fs.readFileSync(out, "utf8")).value;
};
const ps = (args) => run("pwsh", ["-NoProfile", "-File", ...args]);

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
  const bpp = ct === 6 ? 4 : 3;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let q = 0;
  for (let y = 0; y < h; y++) {
    const f2 = raw[q++];
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const up = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v = raw[q++];
      if (f2 === 1) v += a;
      else if (f2 === 2) v += up;
      else if (f2 === 3) v += (a + up) >> 1;
      else if (f2 === 4) {
        const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
      }
      out[y * stride + x] = v & 255;
    }
  }
  return { w, h, bpp, data: out };
}
const pxAt = (im, x, y) => { const i = (y * im.w + x) * im.bpp; return [im.data[i], im.data[i + 1], im.data[i + 2]]; };
const hexOf = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const hex = (s) => { const h = s.replace("#", ""); const n = (i) => parseInt(h.slice(i, i + 2), 16); return [n(0), n(2), n(4), h.length === 8 ? n(6) : 255]; };
const over = (top, bot) => { const a = top[3] / 255; return [0, 1, 2].map((i) => Math.round(a * top[i] + (1 - a) * bot[i])); };

const style = JSON.parse(fs.readFileSync(ROOT + "/src/theme/assets/catppuccin/catppuccin-mauve.json", "utf8")).themes.find((t) => t.name === THEME).style;
const tk = (k) => hex(k === "players[0].selection" ? style.players[0].selection : style[k]);
const expected = {
  "S-1": tk("title_bar.background").slice(0, 3),
  "S-2": tk("title_bar.inactive_background").slice(0, 3),
  "S-3": tk("text").slice(0, 3),
  "S-4": over(tk("ghost_element.hover"), tk("title_bar.background")),
  "S-5": tk("panel.background").slice(0, 3),
  "S-6": tk("panel.background").slice(0, 3),
  "S-7": tk("status_bar.background").slice(0, 3),
  "S-8": tk("border").slice(0, 3),
  "S-9": tk("tab_bar.background").slice(0, 3),
  "S-10a": tk("tab.active_background").slice(0, 3),
  "S-10i": tk("tab.inactive_background").slice(0, 3),
  "S-11": tk("editor.background").slice(0, 3),
  "S-12": over(tk("editor.active_line.background"), tk("editor.background")),
  "S-13": over(tk("players[0].selection"), tk("editor.background")),
};

const cdpShot = (name) => {
  run("node", ["tools/cdp-eval.mjs", "--pid", PID, "--port", "9222", "1", "--out", SP + "cdp-tmp.json", "--screenshot", P + name]);
  return { im: loadPng(P + name), ox: 0, oy: 0, meta: null };
};
const capture = (name) => {
  const j = JSON.parse(ps(["tools/capture.ps1", "-Hwnd", HWND, "-Out", P + name]));
  return { im: loadPng(P + name), ox: j.clientRect.x - j.rect.x, oy: j.clientRect.y - j.rect.y, meta: j };
};
const activate = () => { try { ps(["tools/win-input.ps1", "-ProcessId", PID, "-Action", "click", "-X", "900", "-Y", "730"]); } catch (e) { /* retried by caller */ } };
const deactivate = () => ps([SP + "deactivate.ps1"]);
const isActive = () => cdp("__poc.theme.samples().windowActive");

const PREP = (selection) => `(async()=>{
 const fr=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const u=performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/poc\\/editorStore\\.ts\\?t=/.test(n)).pop();
 const s=await import(u);
 const v=['a','b','c'].map(t=>s.existingView(t)).find(v=>v&&v.dom.isConnected);
 v.scrollDOM.scrollTop=0;
 const L=n=>v.state.doc.line(n);
 v.dispatch({selection:${selection ? "{anchor:L(3).from+11,head:L(5).from+21}" : "{anchor:L(6).from+5}"}});
 await fr();await fr();
 const line=n=>[...v.dom.querySelectorAll('.cm-line')].find(e=>new RegExp('line '+n+':').test(e.textContent));
 const rc=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}};
 const tabs=[...document.querySelectorAll('[data-poc-pane] button')].filter(b=>b.textContent.trim()&&b.textContent!=='\\u21c4').map(b=>({t:b.textContent,r:rc(b),bg:getComputedStyle(b).backgroundColor}));
 const ae=v.dom.querySelector('.zl-activeLine');
 const pane=document.querySelector('[data-poc-pane]');
 const sp=v.dom.querySelector('.zl-selectionShape path');
 return {sel:sp&&rc(sp),line4:line(4)&&rc(line(4)),active:ae&&rc(ae),tabs,editor:rc(v.dom),tabbar:pane&&pane.firstElementChild&&rc(pane.firstElementChild)};
})()`;

const results = { theme: THEME, note: "primary = CDP page screenshot (WebView pixels, no color conversion); secondary = PrintWindow of the whole window (carries a +-1..2 channel offset from the OS capture path)", cdp: {}, printwindow: {} };
const sample = (cap, cx, cy) => hexOf(pxAt(cap.im, Math.round(cx) + cap.ox, Math.round(cy) + cap.oy));
const mk = (S) => (id, what, got, exp, tol = 1) => {
  const d = Math.max(...[0, 1, 2].map((i) => Math.abs(parseInt(got.slice(1 + 2 * i, 3 + 2 * i), 16) - exp[i])));
  S[id] = { what, expected: hexOf(exp), actual: got, maxChannelDiff: d, verdict: d <= tol ? "충족" : "불충족" };
};
results.apply = cdp(`__poc.theme.apply(${JSON.stringify(THEME)}).then(r=>({ok:r.ok,captionOk:r.captionOk}))`);
const rects = cdp("__poc.shell.rects()");
const R = (k) => rects.areas[k].physical;
const tb = R("titlebar");
const scan = (cap, fixed, from, to, horiz) => {
  const out = [];
  for (let v = from; v < to; v++) out.push([v, horiz ? hexOf(pxAt(cap.im, fixed + cap.ox, v + cap.oy)) : hexOf(pxAt(cap.im, v + cap.ox, fixed + cap.oy))]);
  return out.filter(([, c], i) => i === 0 || c !== out[i - 1][1]);
};

function judgeStatic(label, c1, geo1, S, extra) {
  const check = mk(S);
  check("S-1", "title bar bg, window active", sample(c1, tb.x + 700, 20), expected["S-1"]);
  check("S-5", "sidebar bg", sample(c1, 200, 800), expected["S-5"]);
  check("S-6", "left dock bg", sample(c1, R("dock-left").x + 100, 800), expected["S-6"]);
  check("S-7", "status bar bg", sample(c1, R("statusbar").x + 700, R("statusbar").y + 30), expected["S-7"]);
  const bs = {
    "below title bar (column x=1500, y 60..70)": scan(c1, 1500, 60, 70, true),
    "above status bar (column x=1500, 8 physical px above the status bar top to 6 below)": scan(c1, 1500, R("statusbar").y - 8, R("statusbar").y + 6, true),
    "right of sidebar (row y=800, x 592..606)": scan(c1, 800, 592, 606, false),
    "right of left dock (row y=800, x 1074..1086)": scan(c1, 800, 1074, 1086, false),
  };
  extra.borderScan = bs;
  for (const [k, arr] of Object.entries(bs)) {
    let bestD = 999, bestRun = null;
    for (const [y, c] of arr) { const d = Math.max(...[0, 1, 2].map((i) => Math.abs(parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16) - expected["S-8"][i]))); if (d < bestD) { bestD = d; bestRun = [y, c]; } }
    // width: count consecutive physical px whose color is within 1 of the token color
    S["S-8 " + k] = { what: "border line (2 physical px = 1 css px) color", expected: hexOf(expected["S-8"]), actual: arr.map((a) => a[0] + ":" + a[1]).join(" | "), maxChannelDiff: bestD, verdict: bestD <= 1 ? "충족" : "불충족" };
  }
  const tabbar = geo1.tabbar;
  check("S-9", "pane tab bar bg", sample(c1, (tabbar.x + tabbar.w - 40) * 2, (tabbar.y + tabbar.h / 2) * 2), expected["S-9"]);
  for (const t of geo1.tabs) {
    const rgbOf = (c) => "rgb(" + c.join(", ") + ")";
    const id = t.bg === rgbOf(expected["S-10a"]) ? "S-10a" : t.bg === rgbOf(expected["S-10i"]) ? "S-10i" : "S-10?";
    if (S[id]) continue;
    check(id, "tab '" + t.t + "' (css bg " + t.bg + "), 3 css px inside top-left", sample(c1, (t.r.x + 3) * 2, (t.r.y + 3) * 2), expected[id]);
  }
  check("S-11", "editor bg (empty area right of text)", sample(c1, (geo1.editor.x + geo1.editor.w - 60) * 2, (geo1.editor.y + 200) * 2), expected["S-11"]);
  check("S-12", "current line (empty cursor) bg", sample(c1, (geo1.active.x + geo1.active.w - 60) * 2, (geo1.active.y + 4) * 2), expected["S-12"]);
  const r = rects.windowButtons.minimize.rect.physical;
  const bg = pxAt(c1.im, r.x + 2 + c1.ox, 3 + c1.oy);
  let best = null, bd = -1;
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
    const p = pxAt(c1.im, x + c1.ox, y + c1.oy);
    const d = Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]);
    if (d > bd) { bd = d; best = [x, y, hexOf(p)]; }
  }
  check("S-3", "minimize glyph, strongest pixel at (" + best[0] + "," + best[1] + ")", best[2], expected["S-3"]);
  return check;
}

let act = false;
for (let i = 0; i < 4 && !act; i++) { activate(); act = isActive() === "true"; }
results.windowActiveAtCapture1 = act;
const geo1 = cdp(PREP(false));
const c1p = capture("r8-" + KEY + "-active.png");
const c1c = cdpShot("r8-" + KEY + "-active-cdp.png");
judgeStatic("pw", c1p, geo1, results.printwindow, results);
judgeStatic("cdp", c1c, geo1, results.cdp, {});

// ---- calibration: reference swatches painted with the exact token CSS, measured the same way ----
const tokHex = (k) => (k === "players[0].selection" ? style.players[0].selection : style[k]);
const swatchSpec = {
  "S-1": { bg: tokHex("title_bar.background") },
  "S-2": { bg: tokHex("title_bar.inactive_background") },
  "S-4": { bg: tokHex("title_bar.background"), over: tokHex("ghost_element.hover") },
  "S-5": { bg: tokHex("panel.background") },
  "S-7": { bg: tokHex("status_bar.background") },
  "S-8": { bg: tokHex("border") },
  "S-9": { bg: tokHex("tab_bar.background") },
  "S-10a": { bg: tokHex("tab.active_background") },
  "S-10i": { bg: tokHex("tab.inactive_background") },
  "S-11": { bg: tokHex("editor.background") },
  "S-12": { bg: tokHex("editor.background"), over: tokHex("editor.active_line.background") },
  "S-13": { bg: tokHex("editor.background"), over: tokHex("players[0].selection") },
  "S-3": { bg: tokHex("title_bar.background"), glyph: tokHex("text") },
};
const swatchRects = cdp(`(()=>{
 const spec=${JSON.stringify(swatchSpec)};
 const root=document.createElement('div');root.id='__checker_swatches';
 root.style.position='fixed';root.style.left='10px';root.style.top=(innerHeight-40)+'px';root.style.zIndex='99999';root.style.display='flex';root.style.gap='4px';
 const out={};
 for(const [id,s] of Object.entries(spec)){
  const d=document.createElement('div');d.style.width='36px';d.style.height='32px';d.style.background=s.bg;d.style.position='relative';
  if(s.over){const o=document.createElement('div');o.style.position='absolute';o.style.inset='0';o.style.background=s.over;d.appendChild(o);}
  if(s.glyph){d.style.font='10px "Segoe Fluent Icons"';d.style.color=s.glyph;d.style.lineHeight='32px';d.style.textAlign='center';d.textContent=String.fromCodePoint(0xE921);}
  root.appendChild(d);
 }
 document.body.appendChild(root);
 [...root.children].forEach((d,i)=>{const r=d.getBoundingClientRect();out[Object.keys(spec)[i]]={x:r.left,y:r.top,w:r.width,h:r.height};});
 return out;})()`);
const cSw = cdpShot("r8-" + KEY + "-swatches-cdp.png");
cdp("(()=>{document.getElementById('__checker_swatches').remove();return 1})()");
results.calibration = {};
const strongest = (cap, r, bgp) => { let best = null, bd = -1; for (let y = Math.round(r.y * 2); y < (r.y + r.h) * 2; y++) for (let x = Math.round(r.x * 2); x < (r.x + r.w) * 2; x++) { const p = pxAt(cap.im, x, y); const d = Math.abs(p[0] - bgp[0]) + Math.abs(p[1] - bgp[1]) + Math.abs(p[2] - bgp[2]); if (d > bd) { bd = d; best = p; } } return hexOf(best); };
const cmpCal = (id, appHex, refHex, note) => {
  const d = Math.max(...[0, 1, 2].map((i) => Math.abs(parseInt(appHex.slice(1 + 2 * i, 3 + 2 * i), 16) - parseInt(refHex.slice(1 + 2 * i, 3 + 2 * i), 16))));
  results.calibration[id] = { app: appHex, reference: refHex, maxChannelDiff: d, verdict: d <= 1 ? "충족" : "불충족", note };
};

const geo2 = cdp(PREP(true));
const c2p = capture("r8-" + KEY + "-selection.png");
const c2c = cdpShot("r8-" + KEY + "-selection-cdp.png");
for (const [S, c] of [[results.printwindow, c2p], [results.cdp, c2c]]) {
  mk(S)("S-13", "selection fill, 3 css px right of the selection path's left edge on line 4, 3 css px below line top", sample(c, (geo2.sel.x + 3) * 2, (geo2.line4.y + 3) * 2), expected["S-13"]);
}
results.selectionGeometry = { sel: geo2.sel, line4: geo2.line4 };

cdp("(async()=>{const u=performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.includes('poc/editorStore.ts?t=')).pop();const s=await import(u);const v=['a','b','c'].map(t=>s.existingView(t)).find(v=>v&&v.dom.isConnected);v.dispatch({selection:{anchor:0}});return 1})()");
deactivate();
results.windowInactiveAtCapture3 = isActive() === "false";
const c3p = capture("r8-" + KEY + "-inactive.png");
const c3c = cdpShot("r8-" + KEY + "-inactive-cdp.png");
mk(results.printwindow)("S-2", "title bar bg, window inactive", sample(c3p, tb.x + 700, 20), expected["S-2"]);
mk(results.cdp)("S-2", "title bar bg, window inactive", sample(c3c, tb.x + 700, 20), expected["S-2"]);
for (const [id, r] of Object.entries(swatchRects)) {
  const ref = id === "S-3" ? strongest(cSw, r, pxAt(cSw.im, Math.round(r.x * 2) + 2, Math.round(r.y * 2) + 2)) : sample(cSw, (r.x + r.w / 2) * 2, (r.y + r.h / 2) * 2);
  const appKey = id;
  const app = results.cdp[appKey];
  if (app) cmpCal(id, app.actual, ref, "reference swatch painted with the token CSS, same renderer");
}
results.expected = Object.fromEntries(Object.entries(expected).map(([k, v]) => [k, hexOf(v)]));
fs.writeFileSync(P + "r8-" + KEY + "-screen.json", JSON.stringify(results, null, 1));
for (const which of ["cdp", "printwindow"]) {
  console.log("== " + which);
  for (const [k, v] of Object.entries(results[which])) console.log(k, v.verdict, v.expected, v.actual, "d=" + v.maxChannelDiff, "-", v.what);
}
console.log("active1", act, "inactive3", results.windowInactiveAtCapture3);

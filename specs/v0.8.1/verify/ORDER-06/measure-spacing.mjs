// ORDER-06 V3: tauri markdown preview of spacing.md / INTENT.md in One Light (the user's Zed theme), screenshots for the
// same ink-row analysis as Zed, plus computed margins. Usage: node o6.mjs <tag>  (tag names the output files: before/after).
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const TAG = process.argv[2] || "before";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-06";
const WW = SW + "\\o6ws";
const DATA = S + "/appdata6/workbench-tauri";
mkdirSync(DATA, { recursive: true });
writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Light", preview_theme: "One Light", ui_font_size: 16 }) + "\n");
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = SW + "\\appdata6";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview6";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel)).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, dbl) => { const p = await pt(js); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await sleep(700); };
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
const shot = async (n) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/" + n + ".png", Buffer.from(r.data, "base64")); };
const open = async (f) => {
  await click(row(f), true); await sleep(1200);
  await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)"); await sleep(2000);
  // hide the left dock so the preview has the whole width like the Zed window (no project panel there)
};
try {
  app = await launchApp(); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  await open("spacing.md");
  await click("document.querySelector('.status-bar [aria-label=\"Close Left Dock\"]')").catch(() => {});
  await click("document.querySelector('.sidebar-toggle, [aria-label=\"Close Folder Sidebar\"]')").catch(() => {});
  log.box = await ev(`(()=>{const p=${preview};const b=p.getBoundingClientRect();const body=p.querySelector('.markdown-body').getBoundingClientRect();return {preview:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)],body:[Math.round(body.x),Math.round(body.width)],scrollHeight:p.scrollHeight}})()`);
  log.computed = await ev(`(()=>{const p=${preview};const cs=(e)=>getComputedStyle(e);const out=[];for(const e of p.querySelectorAll('.markdown-body > *, .markdown-body li')){const c=cs(e);const r=e.getBoundingClientRect();out.push({tag:e.tagName,text:e.textContent.trim().slice(0,24),top:Math.round(r.top+p.scrollTop),h:Math.round(r.height),mt:c.marginTop,mb:c.marginBottom,pt:c.paddingTop,pb:c.paddingBottom,bb:c.borderBottomWidth+' '+c.borderBottomColor,lh:c.lineHeight,fs:c.fontSize,ff:c.fontFamily.slice(0,20)})}return out})()`);
  log.vars = await ev("(()=>{const c=getComputedStyle(document.documentElement);return Object.fromEntries(['--preview-list-gap','--preview-list-line-gap','--markdown-preview-heading-rule-width'].map(k=>[k,c.getPropertyValue(k).trim()]))})()");
  for (const [i, top] of [[1, 0], [2, 350], [3, 99999]]) { await ev(preview + ".scrollTop=" + top); await sleep(400); log["scroll" + i] = await ev(preview + ".scrollTop"); await shot(`tauri-${TAG}-spacing-${i}`); }
  await click("document.querySelector('.status-bar [aria-label=\"Project Panel\"]')").catch(() => {});
  await open("INTENT.md");
  await click("document.querySelector('.status-bar [aria-label=\"Close Left Dock\"]')").catch(() => {});
  await ev(preview + ".scrollTop=0"); await sleep(600); await shot(`tauri-${TAG}-intent`);
  // preview font size 20: heading margins and list gaps keep their ratio (headings) / px (list settings)
  writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Light", preview_theme: "One Light", ui_font_size: 16, preview_font_size: 20 }) + "\n"); await sleep(2000);
  log.size20 = await ev(`(()=>{const p=${preview};const q=(s)=>{const e=p.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return {fs:c.fontSize,mt:c.marginTop,mb:c.marginBottom,lh:c.lineHeight}};return {h2:q('h2'),h3:q('h3'),li:q('li'),p:q('p')}})()`);
  // a user value in settings.json is used
  writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Light", preview_theme: "One Light", ui_font_size: 16, preview_list_gap: 12, preview_list_line_gap: 8 }) + "\n"); await sleep(2000);
  log.userListValues = await ev("(()=>{const c=getComputedStyle(document.documentElement);return {gap:c.getPropertyValue('--preview-list-gap').trim(),line:c.getPropertyValue('--preview-list-line-gap').trim()}})()");
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(OUT + `/tauri-${TAG}.json`, JSON.stringify(log, null, 2)); console.log(JSON.stringify(log).slice(0, 600)); }

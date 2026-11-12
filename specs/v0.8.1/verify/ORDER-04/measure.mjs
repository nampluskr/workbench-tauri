// v0.8.1 ORDER-04 V3: I-4 Outline side bar (mockup F).
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-04";
const W = S + "/o4ws", WW = SW + "\\o4ws";
const DATA = S + "/appdata4/workbench-tauri";
rmSync(W, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true }); rmSync(S + "/appdata4", { recursive: true, force: true });
mkdirSync(OUT, { recursive: true }); mkdirSync(DATA, { recursive: true });
const put = (f, t) => { mkdirSync((W + "/" + f).replace(/\/[^/]+$/, ""), { recursive: true }); writeFileSync(W + "/" + f, t); };
const para = (n) => Array.from({ length: n }, (_, i) => "text line " + i).join("\n");
put("doc.md", ["# Guide", "", para(6), "", "## Install", "", para(6), "", "```sh", "# not a heading", "```", "", "### Windows", "", para(6), "", "#### Path", "", para(30), "", "## Usage", "", para(40), "", "### Keys", "", para(40), ""].join("\n"));
put("nb.ipynb", JSON.stringify({ cells: [
  { cell_type: "markdown", metadata: {}, source: ["# Analysis\n", "intro"] },
  { cell_type: "code", metadata: {}, execution_count: null, outputs: [], source: ["# a comment, not a heading\n", "class Model:\n", "    def fit(self):\n", "        pass"] },
  { cell_type: "markdown", metadata: {}, source: ["## Load data"] },
  { cell_type: "markdown", metadata: {}, source: ["### Clean"] },
], metadata: {}, nbformat: 4, nbformat_minor: 5 }, null, 1));
put("sample.py", "import os\n\nclass GaussianMixture:\n    def fit(self, x):\n        local = 1\n        return local\n\n    def _e_step(self):\n        pass\n\ndef helper():\n    tmp = 2\n    return tmp\n");
put("sample.ts", "export class Store {\n  count = 0;\n  add(n: number) { const local = n; return local; }\n}\nexport function make() { let x = 1; return x; }\ninterface Shape { area(): number }\n");
put("sample.rs", "struct Point { x: i32 }\nimpl Point {\n    fn len(&self) -> i32 { let l = 1; l }\n}\nfn main() { let v = 2; }\nenum Kind { A, B }\n");
put("plain.txt", "nothing here\n");
let big = ""; for (let i = 0; i < 600; i++) big += `export class C${i} {\n  m${i}(a: number) {\n    const v = a + ${i};\n    return v;\n  }\n}\nexport function f${i}() {\n  return ${i};\n}\n\n`;
put("big.ts", big); // 6,000 lines
let bigmd = ""; for (let i = 0; i < 300; i++) bigmd += `## Section ${i}\n\n${para(18)}\n\n`;
put("big.md", bigmd); // ~6,300 lines
const state = (extra = {}) => JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 }, ...extra }] });
const setTheme = (t) => writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: t }) + "\n");
setTheme("One Dark"); writeFileSync(DATA + "/state.json", state());
process.env.APPDATA = SW + "\\appdata4";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview4";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n, clip) => { const r = await app.send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) }); writeFileSync(OUT + "/" + n + ".png", Buffer.from(r.data, "base64")); };
const P = (rel) => WW + "\\" + rel.replace(/\//g, "\\");
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(P(rel))).slice(1, -1) + "]')";
const pt = (js, center) => ev("(()=>{const e=" + js + ";if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+" + (center ? "r.width/2" : "Math.min(r.width/2,60)") + "),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, o = {}) => { const p = await pt(js, o.center); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (o.dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await sleep(o.wait ?? 700); };
const KEYS = { v: ["V", "KeyV", 86], z: ["z", "KeyZ", 90], end: ["End", "End", 35] };
const press = async (k, mod = 0) => { const [key, code, vk] = KEYS[k]; await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await sleep(600); };
const CTRL = 2, SHIFT = 8;
const statusOrder = () => ev("[...document.querySelector('.status-bar .group.grow').children].map(e=>e.classList.contains('status-divider')?'|':(e.getAttribute('aria-label')||e.textContent.trim()))");
const outlineRows = () => ev("(()=>{const b=document.querySelector('.outline-bar');if(!b||b.hidden)return null;const empty=b.querySelector('.outline-empty');return {doc:b.querySelector('.outline-doc')?.textContent||null,empty:empty?empty.textContent:null,rows:[...b.querySelectorAll('.outline-list > .tree-row')].map(r=>({depth:r.querySelectorAll('.tree-item > .tree-indent').length,badge:r.querySelector('.outline-badge')?.textContent||'',name:r.querySelector('.tree-label')?.textContent,selected:r.classList.contains('selected'),toggle:!!r.querySelector('.outline-toggle')}))}})()");
const outlineRow = (name) => "[...document.querySelectorAll('.outline-list > .tree-row')].find(r=>r.querySelector('.tree-label')?.textContent===" + JSON.stringify(name) + ")";
const cursorLine = () => ev("(()=>{const ed=[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent);if(!ed)return null;const l=ed.querySelector('.cm-activeLine');return {line:l?l.textContent.slice(0,60):null,focused:ed.classList.contains('cm-focused')}})()");
const tabs = () => ev("[...document.querySelectorAll('.pane')].map(p=>[...p.querySelectorAll('.tab')].map(t=>t.querySelector('.tab-title').textContent.trim()+(t.classList.contains('active')?'!':'')))");
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const foreground = () => execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
const outlineBtn = "document.querySelector('.status-bar [aria-label=\"Outline\"], .status-bar [aria-label=\"Close Outline\"]')";

try {
  app = await launchApp(); await sleep(6000); foreground(); await sleep(600);
  log.window = await ev("({w:outerWidth,h:outerHeight,dpr:devicePixelRatio})");
  await step("c11_initial", async () => {
    const r = { status: await statusOrder(), outlineHidden: await ev("document.querySelector('.outline-bar')?.hidden"), layout: await ev("(()=>{const q=(s)=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.width)]};return {dock:q('.dock-left'),paneArea:q('.pane-area'),sidebar:q('.sidebar')}})()") };
    await shot("c11-initial-closed"); return r;
  });
  await step("c1_open", async () => {
    await click(outlineBtn);
    await click(row("doc.md"), { dbl: true }); await sleep(1200);
    const r = { status: await statusOrder(), btnPressed: await ev(outlineBtn + "?.getAttribute('aria-pressed')"), layout: await ev("(()=>{const q=(s)=>{const b=document.querySelector(s).getBoundingClientRect();return [Math.round(b.x),Math.round(b.width)]};return {dock:q('.dock-left'),outline:q('.outline-bar'),paneArea:q('.pane-area')}})()"), outline: await outlineRows() };
    await shot("c1-onedark");
    setTheme("One Light"); await sleep(2500); await shot("c1-onelight"); r.light = { text: await ev("getComputedStyle(document.querySelector('.outline-list > .tree-row')).color"), badge: await ev("getComputedStyle(document.querySelector('.outline-badge')).color") };
    setTheme("One Dark"); await sleep(2500);
    // close the left dock: Outline stays
    await click("document.querySelector('.status-bar [aria-label=\"Close Left Dock\"]')");
    r.dockClosed = { dockHidden: await ev("document.querySelector('.dock-left').hidden"), outlineVisible: !(await ev("document.querySelector('.outline-bar').hidden")), status: await statusOrder() };
    await shot("c1-dock-closed");
    await click("document.querySelector('.status-bar [aria-label=\"Project Panel\"]')");
    return r;
  });
  await step("c2_metrics", async () => ev(`(()=>{const cs=(e,p)=>e?getComputedStyle(e,p):null;const r=document.querySelector('.outline-list > .tree-row');const deep=[...document.querySelectorAll('.outline-list > .tree-row')].find(x=>x.querySelectorAll('.tree-item > .tree-indent').length>=1);
    const ind=deep.querySelector('.tree-indent');const g=deep.querySelector('.tree-guide');const tg=document.querySelector('.outline-toggle .icon, .outline-toggle svg');const slot=document.querySelector('.outline-badge-slot');const bd=document.querySelector('.outline-badge');const main=r.querySelector('.tree-main');const lab=r.querySelector('.tree-label');const hdr=document.querySelector('.outline-header');
    const gb=cs(g,'::before');return {rowHeight:r.getBoundingClientRect().height,indent:ind.getBoundingClientRect().width,guideLeft:gb.left,guideWidth:gb.width,guideColor:gb.backgroundColor,toggle:tg?tg.getBoundingClientRect().width:null,slot:slot.getBoundingClientRect().width,badge:[bd.getBoundingClientRect().width,bd.getBoundingClientRect().height],badgeFont:cs(bd).fontSize,badgeWeight:cs(bd).fontWeight,headingBadgeFont:cs(document.querySelector('.outline-badge.heading')).fontSize,padX:cs(main).paddingLeft,gap:cs(main).columnGap,labelFont:cs(lab).fontSize+' '+cs(lab).fontFamily,headerHeight:hdr.getBoundingClientRect().height,barWidth:document.querySelector('.outline-bar').getBoundingClientRect().width}})()`));
  await step("c3_border_resize", async () => {
    const st = () => ev("(()=>{const b=getComputedStyle(document.querySelector('.outline-bar'));const d=getComputedStyle(document.querySelector('.dock-left'));const h=getComputedStyle(document.querySelector('.outline-bar > .dock-resize-handle'));return {outline:b.borderRightWidth+' '+b.borderRightColor,dock:d.borderRightWidth+' '+d.borderRightColor,handleBg:h.backgroundColor,handleCursor:h.cursor,handleBorder:h.borderLeftColor}})()");
    const before = await st();
    const hp = await pt("document.querySelector('.outline-bar > .dock-resize-handle')", true);
    await app.mouse("mouseMoved", hp.x, hp.y); await sleep(500);
    const hover = await st();
    const w0 = await ev("document.querySelector('.outline-bar').getBoundingClientRect().width");
    await app.mouse("mousePressed", hp.x, hp.y, { button: "left", clickCount: 1 });
    for (let s = 1; s <= 10; s++) { await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hp.x + s * 6, y: hp.y, button: "left", buttons: 1 }); await sleep(30); }
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: hp.x + 60, y: hp.y, button: "left", clickCount: 1 }); await sleep(800);
    const w1 = await ev("document.querySelector('.outline-bar').getBoundingClientRect().width");
    return { before, hover, w0, w1 };
  });
  await step("c4_markdown", async () => outlineRows());
  await step("c7_click_editor", async () => {
    await click(outlineRow("Usage")); await sleep(500);
    return { cursor: await cursorLine(), topLine: await ev("(()=>{const ed=[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent);const s=ed.querySelector('.cm-scroller').getBoundingClientRect();const l=ed.querySelector('.cm-activeLine').getBoundingClientRect();return {lineTop:Math.round(l.top-s.top),viewport:Math.round(s.height)}})()") };
  });
  await step("c8_follow_edit", async () => {
    const r = {};
    // cursor into "Windows" section
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent).find(l=>l.textContent==='### Windows')"); await sleep(400);
    await press("end"); await sleep(400);
    r.cursorWindows = (await outlineRows()).rows.filter((x) => x.selected).map((x) => x.name);
    // add a heading, then undo
    await app.send("Input.insertText", { text: "\n\n## Added Section" }); await sleep(1200);
    r.afterAdd = (await outlineRows()).rows.map((x) => x.name);
    await press("z", CTRL); await press("z", CTRL); await sleep(1200);
    r.afterUndo = (await outlineRows()).rows.map((x) => x.name);
    return r;
  });
  await step("c9_fold", async () => {
    const t = outlineRow("Install") + ".querySelector('.outline-toggle')";
    await click(t); const folded = (await outlineRows()).rows.map((x) => x.name);
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent).find(l=>l.textContent==='#### Path')"); await sleep(600);
    const selectedWhileFolded = (await outlineRows()).rows.filter((x) => x.selected).map((x) => x.name);
    await click(outlineRow("Install") + ".querySelector('.outline-toggle')"); const unfolded = (await outlineRows()).rows.map((x) => x.name);
    return { folded, selectedWhileFolded, unfolded };
  });
  await step("c7_preview", async () => {
    await click("[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)");
    await press("v", CTRL | SHIFT); await sleep(1500);
    const r = { tabs: await tabs(), outline: (await outlineRows())?.rows.map((x) => x.name) };
    await click(outlineRow("Keys")); await sleep(800);
    r.previewScroll = await ev("(()=>{const p=[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent);const h=[...p.querySelectorAll('h1,h2,h3,h4')].find(x=>x.textContent.trim()==='Keys');const pr=p.getBoundingClientRect();return {headingTopFromPreviewTop:Math.round(h.getBoundingClientRect().top-pr.top),previewHeight:Math.round(pr.height)}})()");
    await shot("c7-preview-scroll");
    return r;
  });
  await step("c5_ipynb", async () => {
    await click(row("nb.ipynb"), { dbl: true }); await sleep(1500);
    const r = { tabs: await tabs(), outline: await outlineRows() };
    await click(outlineRow("Load data")); await sleep(600);
    r.cursor = await cursorLine();
    await shot("c5-ipynb");
    return r;
  });
  await step("c6_code", async () => {
    const r = {};
    for (const f of ["sample.py", "sample.ts", "sample.rs", "plain.txt"]) { await click(row(f), { dbl: true }); await sleep(1500); r[f] = await outlineRows(); }
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='sample.py')"); await sleep(800);
    r.backToPy = (await outlineRows())?.rows.map((x) => x.badge + " " + x.name);
    await shot("c6-python");
    return r;
  });
  await step("c10_perf", async () => {
    const r = {};
    for (const f of ["big.ts", "big.md"]) {
      await click(row(f), { dbl: true }); await sleep(4000);
      const rows0 = await ev("document.querySelectorAll('.outline-list > .tree-row').length");
      await click("[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)"); await sleep(300);
      await ev("window.__lt=[];window.__po=new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(Math.round(e.duration))});window.__po.observe({type:'longtask',buffered:false});window.__mut=null;window.__mo=new MutationObserver(()=>{if(window.__mut===null)window.__mut=performance.now()});window.__mo.observe(document.querySelector('.outline-list'),{childList:true,subtree:true,characterData:true})");
      const t0 = await ev("performance.now()");
      for (let i = 0; i < 30; i++) { await app.send("Input.insertText", { text: "x" }); await sleep(40); }
      const tType = await ev("performance.now()");
      await ev("window.__mut=null"); const tMark = await ev("performance.now()");
      await app.send("Input.insertText", { text: f.endsWith(".md") ? "\n\n## Perf Heading\n" : "\nexport function perfProbe() { return 1; }\n" });
      await sleep(3000);
      r[f] = { rowsBefore: rows0, longTasks: await ev("window.__lt"), typing30ms: Math.round(tType - t0), insertToOutlineMs: await ev("window.__mut===null?null:Math.round(window.__mut-" + tMark + ")"), probeListed: await ev("[...document.querySelectorAll('.outline-list .tree-label')].some(l=>/perfProbe|Perf Heading/.test(l.textContent))") };
      await ev("window.__po.disconnect();window.__mo.disconnect()");
    }
    return r;
  });
  await step("c8_tab_switch", async () => {
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='sample.rs')"); await sleep(800);
    const rs = (await outlineRows())?.rows.map((x) => x.name);
    await click("document.querySelector('.status-bar [aria-label=\"Search\"]')"); await sleep(800);
    return { rs, searchTab: await outlineRows() };
  });
  await step("c11_regress", async () => {
    await click("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]')");
    const lock = await ev("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]').getAttribute('aria-pressed')");
    await click("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]')");
    await click(outlineBtn); // close
    return { lockToggled: lock, closed: await ev("document.querySelector('.outline-bar').hidden"), status: await statusOrder(), layout: await ev("(()=>{const q=(s)=>{const e=document.querySelector(s);if(!e||e.hidden)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.width)]};return {dock:q('.dock-left'),paneArea:q('.pane-area'),sidebar:q('.sidebar')}})()") };
  });
  await click(outlineBtn); // leave it open for the restart check
  log.widthBeforeRestart = await ev("document.querySelector('.outline-bar').getBoundingClientRect().width");
  app.kill(); await new Promise((r) => setTimeout(r, 2500));
  log.stateOutlineKey = (() => { try { return JSON.parse(readFileSync(DATA + "/state.json", "utf8")).windows[0].outline; } catch (e) { return "ERR " + e.message; } })();
  app = await launchApp(); await sleep(6000);
  log.c3_restart = await ev("(()=>{const b=document.querySelector('.outline-bar');return {open:!b.hidden,width:b.getBoundingClientRect().width}})()");
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(OUT + "/v3.json", JSON.stringify(log, null, 2)); console.log("done"); }

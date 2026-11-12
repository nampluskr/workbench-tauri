// ORDER-04 V3 follow-up after K-04-R2: dock handle past its maximum with Outline open (R1-1), preview scroll to a middle
// heading (#7), list follows the cursor in a long document (#8), console errors while opening files (#6).
import { writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-04";
const WW = SW + "\\o4ws";
const DATA = S + "/appdata4/workbench-tauri";
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 }, outline: { open: true, width: 240 } }] }));
process.env.APPDATA = SW + "\\appdata4";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview4";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const P = (rel) => WW + "\\" + rel.replace(/\//g, "\\");
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(P(rel))).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, dbl) => { const p = await pt(js); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await sleep(700); };
const oLabel = (name) => "(()=>{const r=[...document.querySelectorAll('.outline-list > .tree-row')].find(r=>r.querySelector('.tree-label')?.textContent===" + JSON.stringify(name) + ");r?.scrollIntoView({block:'center'});return r?.querySelector('.tree-label')})()";
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const widths = () => ev("(()=>{const w=(s)=>Math.round(document.querySelector(s).getBoundingClientRect().width);return {dock:w('.dock-left'),outline:w('.outline-bar'),paneArea:w('.pane-area')}})()");
const errors = [];
try {
  app = await launchApp(); await sleep(6000);
  // console capture is off in this run
  app.on((m) => { if (m.method === "Runtime.exceptionThrown") errors.push("exception: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 200)); if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push("console.error: " + m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200)); if (m.method === "Log.entryAdded" && m.params.entry.level === "error") errors.push("log: " + m.params.entry.text.slice(0, 200)); });
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  if (false) await step("r1_1_dock_past_max", async () => {
    const before = await widths();
    const hp = await pt("document.querySelector('.dock-left > .dock-resize-handle')");
    await app.mouse("mouseMoved", hp.x, hp.y); await app.mouse("mousePressed", hp.x, hp.y, { button: "left", clickCount: 1 });
    const during = [];
    for (let s = 1; s <= 14; s++) { await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hp.x + s * 100, y: hp.y, button: "left", buttons: 1 }); await sleep(40); if (s % 4 === 0) during.push(await widths()); }
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: hp.x + 1400, y: hp.y, button: "left", clickCount: 1 }); await sleep(800);
    const after = await widths();
    await sleep(800);
    const saved = JSON.parse(readFileSync(DATA + "/state.json", "utf8")).windows[0];
    return { before, during, after, saved: { outline: saved.outline, dock: saved.dock ?? saved.left_dock ?? null } };
  });
  // put the dock back to a usable width by double-clicking its handle (resets to the default)
  if (false) { const hp = await pt("document.querySelector('.dock-left > .dock-resize-handle')"); await app.mouse("mouseMoved", hp.x, hp.y); for (let c = 1; c <= 2; c++) { await app.mouse("mousePressed", hp.x, hp.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", hp.x, hp.y, { button: "left", clickCount: c }); } await sleep(800); log.afterReset = await widths(); }
  log.skip = 1; if (false) await step("c6_console", async () => {
    for (const f of ["sample.py", "sample.ts", "sample.rs", "plain.txt", "nb.ipynb", "big.json"]) { await click(row(f), true); await sleep(2000); }
    return { errors: [...errors] };
  });
  await step("c7_preview_middle", async () => {
    await click(row("big.md"), true); await sleep(4000);
    execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
    log.diag = await ev("({focus:document.hasFocus(),active:document.activeElement?.className?.toString().slice(0,60),tabs:[...document.querySelectorAll('.pane .tab .tab-title')].map(t=>t.textContent.trim()),editors:[...document.querySelectorAll('.cm-editor')].map(e=>!!e.offsetParent),rows:[...document.querySelectorAll('.tree-window .tree-row')].length})");
    { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/diag-c7.png", Buffer.from(r.data, "base64")); }
    await click("[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)");
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)"); await sleep(1500);
    const pos = (h) => ev("(()=>{const p=[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent);const x=[...p.querySelectorAll('h1,h2,h3,h4')].find(e=>e.textContent.trim()===" + JSON.stringify(h) + ");const s=p.querySelector('.markdown-body')?.parentElement||p;return {top:Math.round(x.getBoundingClientRect().top-p.getBoundingClientRect().top),scrollTop:Math.round((p.scrollTop||s.scrollTop))}})()");
    const r = { tabs: await ev("[...document.querySelectorAll('.pane .tab .tab-title')].map(t=>t.textContent.trim())"), previews: await ev("[...document.querySelectorAll('.markdown-preview')].map(e=>!!e.offsetParent)") };
    log.c7r = r; for (const h of ["Section 150", "Section 40"]) { await click(oLabel(h)); await sleep(900); r[h + "_tabs"] = await ev("[...document.querySelectorAll('.pane .tab')].map(t=>t.querySelector('.tab-title').textContent.trim()+(t.classList.contains('active')?'!':''))"); r[h] = await pos(h); r[h + "_scrollers"] = await ev("(()=>{const p=[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent);const x=[...p.querySelectorAll('h1,h2,h3,h4')].find(e=>e.textContent.trim()===" + JSON.stringify(h) + ");const out=[];for(let e=x;e;e=e.parentElement){if(e.scrollHeight>e.clientHeight+2)out.push({cls:(e.className||e.tagName).toString().slice(0,40),st:Math.round(e.scrollTop),sh:e.scrollHeight,ch:e.clientHeight,top:Math.round(x.getBoundingClientRect().top-e.getBoundingClientRect().top)})}return out})()"); }
    return r;
  });
  await step("c8_follow_scroll", async () => {
    execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
    await click(row("big.md"), true); await sleep(4000);
    const list = "document.querySelector('.outline-list')";
    const before = await ev(list + ".scrollTop");
    // move the cursor far down with Ctrl+End
    await click("[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)");
    const ep = await pt("[...document.querySelectorAll('.cm-scroller')].find(e=>e.offsetParent)"); for (let i = 0; i < 20; i++) { await app.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: ep.x + 200, y: ep.y, deltaX: 0, deltaY: 2000 }); await sleep(60); } await sleep(800); await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent&&e.getBoundingClientRect().top>200&&e.getBoundingClientRect().top<600).find(l=>l.textContent.startsWith('text'))"); await sleep(1500);
    return ev("(()=>{const l=" + list + ";const s=l.querySelector('.tree-row.selected');const lr=l.getBoundingClientRect(),sr=s?.getBoundingClientRect();return {before:" + before + ",after:Math.round(l.scrollTop),selected:s?.querySelector('.tree-label').textContent,selectedVisible:!!sr&&sr.top>=lr.top&&sr.bottom<=lr.bottom}})()");
  });
} catch (e) { log.fatal = e.stack; }
finally { log.errorsAll = errors; app?.kill(); writeFileSync(OUT + "/v3-c2.json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log)); }

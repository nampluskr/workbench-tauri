// ORDER-04 V3 follow-up: outline refresh after edits (small and 6,000-line files), cursor follow, folded parent, code badge size.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-04";
const WW = SW + "\\o4ws";
const DATA = S + "/appdata4/workbench-tauri";
{ const j = {}; for (let i = 0; i < 1500; i++) j["key" + i] = { name: "n" + i, value: i, tags: ["a", "b"] }; writeFileSync(S + "/o4ws/big.json", JSON.stringify(j, null, 2)); }
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 }, outline: { open: true, width: 260 } }] }));
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
const KEYS = { z: ["z", "KeyZ", 90], end: ["End", "End", 35] };
const press = async (k, mod = 0) => { const [key, code, vk] = KEYS[k]; await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await sleep(500); };
const names = () => ev("[...document.querySelectorAll('.outline-list > .tree-row .tree-label')].map(l=>l.textContent)");
const selected = () => ev("[...document.querySelectorAll('.outline-list > .tree-row.selected .tree-label')].map(l=>l.textContent)");
const oRow = (name) => "[...document.querySelectorAll('.outline-list > .tree-row')].find(r=>r.querySelector('.tree-label')?.textContent===" + JSON.stringify(name) + ")";
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
// wait until pred() is true, polling every 100 ms, up to ms; returns elapsed ms or null
const waitFor = async (predJs, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(predJs)) return Date.now() - t0; await sleep(100); } return null; };
try {
  app = await launchApp(); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  const r = {}; log.small_md = r;
  await step("small_md_run", async () => {
    await click(row("doc.md"), true); await sleep(1500);
    r.before = await names();
    await click(oRow("Windows") + ".querySelector('.tree-label')"); await sleep(500);
    r.selectedAfterJump = await selected();
    await press("end");
    await app.send("Input.insertText", { text: "\n\n## Added Section" });
    r.addMs = await waitFor("[...document.querySelectorAll('.outline-list .tree-label')].some(l=>l.textContent==='Added Section')", 8000);
    r.afterAdd = await names();
    r.selectedAfterAdd = await selected();
    for (let i = 0; i < 3; i++) await press("z", 2);
    r.removeMs = await waitFor("![...document.querySelectorAll('.outline-list .tree-label')].some(l=>l.textContent==='Added Section')", 8000);
    r.afterUndo = await names();
    // folded parent: jump to Path, fold Install
    await click(oRow("Path") + ".querySelector('.tree-label')"); await sleep(500);
    await click(oRow("Install") + ".querySelector('.outline-toggle')"); await sleep(400);
    r.folded = { rows: await names(), selected: await selected() };
    await click(oRow("Install") + ".querySelector('.outline-toggle')"); await sleep(400);
    return "ok";
  });
  await step("code_badge", async () => {
    await click(row("sample.py"), true); await sleep(1500);
    return ev("(()=>{const b=[...document.querySelectorAll('.outline-badge')].find(x=>!x.classList.contains('heading'));const cs=getComputedStyle(b);return {text:b.textContent,size:[b.getBoundingClientRect().width,b.getBoundingClientRect().height],font:cs.fontSize,weight:cs.fontWeight,color:cs.color,bg:cs.backgroundColor}})()");
  });
  await step("big", async () => {
    const r = {};
    for (const [f, text, probe] of [["big.ts", "\nexport function perfProbe() { return 1; }\n", "perfProbe"], ["big.md", "\n\n## Perf Heading\n", "Perf Heading"]]) {
      await click(row(f), true); await sleep(5000);
      const rows0 = await ev("document.querySelectorAll('.outline-list > .tree-row').length");
      // put the cursor at the end of the first line through the editor view, then type
      await click("[...document.querySelectorAll('.cm-line')].find(e=>e.offsetParent)"); await press("end");
      await ev("window.__lt=[];window.__po=new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(Math.round(e.duration))});window.__po.observe({entryTypes:['longtask']})");
      const t0 = Date.now();
      for (let i = 0; i < 30; i++) { await app.send("Input.insertText", { text: "x" }); await sleep(40); }
      const typing = Date.now() - t0;
      await app.send("Input.insertText", { text });
      const ms = await waitFor("[...document.querySelectorAll('.outline-list .tree-label')].some(l=>l.textContent===" + JSON.stringify(probe) + ")", 15000);
      r[f] = { rowsBefore: rows0, rowsAfter: await ev("document.querySelectorAll('.outline-list > .tree-row').length"), typing30Ms: typing, insertToListedMs: ms, longTasks: await ev("window.__lt"), poSupported: await ev("PerformanceObserver.supportedEntryTypes.includes('longtask')") };
      await ev("window.__po.disconnect()");
    }
    return r;
  });
  await step("r1_stale", async () => {
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='big.ts')"); await sleep(1500);
    await click("[...document.querySelectorAll('.cm-line')].find(e=>e.offsetParent)"); await press("end");
    await app.send("Input.insertText", { text: "y" });
    await click("document.querySelector('.status-bar [aria-label=\"Search\"]')"); // within the 200 ms debounce
    await sleep(2500);
    return ev("(()=>{const b=document.querySelector('.outline-bar');return {empty:b.querySelector('.outline-empty')?.textContent||null,rows:b.querySelectorAll('.outline-list > .tree-row').length,doc:b.querySelector('.outline-doc')?.textContent||null}})()");
  });
  await step("r2_notebook_preview", async () => {
    await click("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]')");
    await click(row("nb.ipynb")); await sleep(2500);
    const r = { tabs: await ev("[...document.querySelectorAll('.pane .tab .tab-title')].map(t=>t.textContent.trim())"), names: await names() };
    await click("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]')");
    return r;
  });
  await step("a2_big_json", async () => {
    await click(row("big.json"), true); await sleep(6000);
    const rows0 = await ev("document.querySelectorAll('.outline-list > .tree-row').length");
    await click("[...document.querySelectorAll('.cm-line')].find(e=>e.offsetParent)"); await press("end");
    await ev("window.__lt=[];window.__po=new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(Math.round(e.duration))});window.__po.observe({entryTypes:['longtask']})");
    const t0 = Date.now(); for (let i = 0; i < 20; i++) { await app.send("Input.insertText", { text: " " }); await sleep(40); }
    const typing = Date.now() - t0; await sleep(3000);
    const r = { lines: 12001, rows: rows0, typing20Ms: typing, longTasks: await ev("window.__lt") }; await ev("window.__po.disconnect()"); return r;
  });
  await step("a1_widths", async () => {
    const hp = await pt("document.querySelector('.outline-bar > .dock-resize-handle')");
    await app.mouse("mouseMoved", hp.x, hp.y); await app.mouse("mousePressed", hp.x, hp.y, { button: "left", clickCount: 1 });
    for (let s = 1; s <= 12; s++) { await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hp.x + s * 120, y: hp.y, button: "left", buttons: 1 }); await sleep(30); }
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: hp.x + 1440, y: hp.y, button: "left", clickCount: 1 }); await sleep(800);
    return ev("(()=>{const w=(s)=>Math.round(document.querySelector(s).getBoundingClientRect().width);return {dock:w('.dock-left'),outline:w('.outline-bar'),paneArea:w('.pane-area'),body:w('.workspace-body'),inner:innerWidth}})()");
  });
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(OUT + "/v3-b.json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log)); }

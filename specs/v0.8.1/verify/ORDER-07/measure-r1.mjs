// ORDER-07 V3 after K-07a-R2 (C-12 B + A): tab switching (no double load, no false toast), frame-target network log and CSP
// violations (#4), mockup drawings capture (#2), timers stop and renderer CPU after closing (#8). Usage: node o7c.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const EXE = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : undefined;
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-07";
const W = S + "/o7ws", WW = SW + "\\o7ws";
const DATA = S + "/appdata7/workbench-tauri";
rmSync(W, { recursive: true, force: true }); mkdirSync(DATA, { recursive: true });
cpSync(OUT + "/fixtures", W, { recursive: true });
cpSync("D:/projects/workbench-core/specs/v0.8.1/mockups/outline/index.html", W + "/outline-mockup.html");
writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = SW + "\\appdata7"; process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview7";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {}; let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel)).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const clickAt = async (x, y, dbl) => { for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", x, y); await app.mouse("mousePressed", x, y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", x, y, { button: "left", clickCount: c }); } await sleep(700); };
const click = async (js, dbl) => { const p = await pt(js); if (!p) throw new Error("not found " + js); await clickAt(p.x, p.y, dbl); };
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const openPreview = async (f) => { await click(row(f), true); await sleep(1200); await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {}); await sleep(2500); };
const tabBy = (t) => "[...document.querySelectorAll('.pane .tab')].find(x=>x.querySelector('.tab-title').textContent.trim()===" + JSON.stringify(t) + ")";
// frame target (out-of-process iframe): one websocket session per target url
let fw = null, fwUrl = null, fid = 0; const fEvents = [];
async function frameTarget() {
  const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  const t = list.filter((x) => x.type === "iframe" && /preview/.test(x.url)).pop();
  if (!t) return null;
  if (fwUrl !== t.webSocketDebuggerUrl) { try { fw?.close(); } catch {} fw = new WebSocket(t.webSocketDebuggerUrl); fwUrl = t.webSocketDebuggerUrl; await new Promise((r) => (fw.onopen = r)); fw.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.method) fEvents.push(d); }); }
  return t;
}
const fsend = (method, params = {}) => new Promise((res) => { const id = ++fid; const h = (m) => { const d = JSON.parse(m.data); if (d.id === id) { fw.removeEventListener("message", h); res(d.result ?? d); } }; fw.addEventListener("message", h); fw.send(JSON.stringify({ id, method, params })); });
const fev = async (expr) => { if (!(await frameTarget())) return { noFrame: true }; const r = await fsend("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); return r.result?.value ?? r; };
const toasts = () => ev("[...document.querySelectorAll('.toast')].map(t=>t.innerText)");
const cpu = () => JSON.parse(execFileSync("pwsh", ["-NoProfile", "-Command", "Get-Process msedgewebview2 -ErrorAction SilentlyContinue | Select-Object Id,@{n='cpu';e={[math]::Round($_.CPU,2)}} | ConvertTo-Json -Compress"], { encoding: "utf8" }) || "[]");
try {
  app = await launchApp(EXE || undefined); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  log.exe = EXE || "debug";
  writeFileSync(W + "/page.html", "<p id=ran>no</p><script>document.getElementById('ran').textContent='ran'</script>");
  if (process.argv[3] === "about") {
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))").catch(() => {});
    await click("[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))"); await sleep(1200);
    log.about = await ev("[...document.querySelectorAll('dialog')].map(d=>d.innerText.slice(0,80))");
    const sh = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/c9-release-about.png", Buffer.from(sh.data, "base64"));
    throw new Error("about done");
  }
  await step("r1_fast_tabs", async () => {
    await openPreview("navigate.html"); await sleep(1500);
    const s0 = await fev("document.getElementById('started').textContent");
    const loads = []; const t0 = Date.now();
    const pa = await pt(tabBy("navigate.html")), pb = await pt(tabBy("Preview navigate.html"));
    for (let k = 0; k < 10; k++) { const p = k % 2 ? pb : pa; await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: 1 }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: 1 }); await sleep(250); }
    const ms = Date.now() - t0; await sleep(2000);
    return { switches: 10, ms, started0: s0, startedNow: await fev("document.getElementById('started').textContent"), title: await fev("document.title"), toasts: await toasts() };
  });
  await step("r1_nav_after_tabs", async () => {
    const press = async (label) => { const f = await ev("(()=>{const e=[...document.querySelectorAll('iframe')].find(x=>x.offsetParent);const r=e.getBoundingClientRect();return {x:r.x,y:r.y}})()"); const p = await fev(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`); await clickAt(Math.round(f.x + p.x), Math.round(f.y + p.y)); await sleep(2200); return { title: await fev("document.title"), started: await fev("document.getElementById('started')?.textContent ?? null") }; };
    return { https: await press("location.href = https://…"), refresh: await press("location.href = refresh.html"), asset: await press("location = asset URL"), toasts: await toasts() };
  });
  await step("r1_loopnav_after_tabs", async () => { await openPreview("loopnav.html"); await sleep(9000); return { title: await fev("document.title"), toasts: await toasts() }; });
  await step("r1_after_loop_new_preview", async () => {
    await ev("document.querySelectorAll('.toast').forEach(t=>t.remove())");
    await openPreview("navigate.html"); await sleep(1500);
    await fev("setTimeout(()=>{while(true){}},50); 1"); await sleep(1500);
    await click("[...document.querySelectorAll('.pane .tab.active button[aria-label=\"Close Tab\"]')][0]"); await sleep(2500);
    await openPreview("page.html"); await sleep(3000);
    const iframe = await ev("(()=>{const f=[...document.querySelectorAll('iframe')].find(e=>e.offsetParent);return f?{src:f.src,w:Math.round(f.getBoundingClientRect().width)}:null})()"); const list = (await (await fetch("http://127.0.0.1:9222/json/list")).json()).map((t) => t.type + " " + t.url.slice(0, 40)); const sh = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/r1-after-loop-new-preview.png", Buffer.from(sh.data, "base64")); await sleep(5000); return { ran: await fev("document.getElementById('ran')?.textContent ?? null"), iframe, targets: list, appAlive: await ev("1+1") };
  });
} catch (e) { log.fatal = e.stack; }
finally { try { fw?.close(); } catch {} app?.kill(); writeFileSync(OUT + "/v3-r1" + (process.argv[3] ? "-" + process.argv[3] : "") + ".json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log).slice(0, 3500)); }

// ORDER-07 V3 after K-07a-R2 (C-12 B + A): tab switching (no double load, no false toast), frame-target network log and CSP
// violations (#4), mockup drawings capture (#2), timers stop and renderer CPU after closing (#8). Usage: node o7c.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const EXE = process.argv[2];
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
  await step("a_tab_switch", async () => {
    await openPreview("navigate.html"); await sleep(1500);
    const started0 = await fev("document.getElementById('started').textContent");
    for (let i = 0; i < 6; i++) { await click(tabBy("navigate.html")); await sleep(700); await click(tabBy("Preview navigate.html")); await sleep(900); }
    await sleep(1500);
    return { started0, startedAfter: await fev("document.getElementById('started').textContent"), title: await fev("document.title"), toasts: await toasts() };
  });
  await step("b4_frame_network", async () => {
    await openPreview("network.html"); await sleep(2500);
    await frameTarget(); fEvents.length = 0;
    await fsend("Network.enable"); await fsend("Log.enable"); await fsend("Runtime.enable");
    const r = await fev("new Promise(res=>{const v=[];document.addEventListener('securitypolicyviolation',e=>v.push(e.violatedDirective+' '+e.blockedURI));const out={};const t=(k,p)=>p.then(()=>out[k]='REACHED',e=>out[k]='blocked '+e.name);t('fetch',fetch('https://example.com'));const x=new XMLHttpRequest();x.onerror=()=>out.xhr='blocked';x.open('GET','https://example.com');x.send();try{const w=new WebSocket('wss://echo.websocket.org');w.onerror=()=>out.ws='blocked'}catch(e){out.ws='blocked '+e.name}const i=new Image();i.onerror=()=>out.img='blocked';i.src='https://example.com/x.png';const s=document.createElement('script');s.onerror=()=>out.script='blocked';s.src='https://example.com/x.js';document.head.append(s);setTimeout(()=>res({out,violations:v}),2500)})");
    await sleep(500);
    const sent = fEvents.filter((e) => e.method === "Network.requestWillBeSent").map((e) => e.params.request.url);
    return { ...r, networkRequestsFromFrame: sent, logViolations: fEvents.filter((e) => e.method === "Log.entryAdded").map((e) => e.params.entry.text.slice(0, 100)).slice(0, 8) };
  });
  await step("b2_mockup", async () => {
    await openPreview("outline-mockup.html"); await sleep(3000);
    await fev("document.querySelector('#designs')?.scrollIntoView({block:'start'})"); await sleep(800);
    const f = await ev("(()=>{const e=[...document.querySelectorAll('iframe')].find(x=>x.offsetParent);const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()");
    const s = await app.send("Page.captureScreenshot", { format: "png", clip: { ...f, scale: 1 } }); writeFileSync(OUT + "/c2-mockup-drawings.png", Buffer.from(s.data, "base64"));
    return { frame: f, designs: await fev("document.querySelectorAll('#designs > *').length") };
  });
  await step("b8_stop", async () => {
    await openPreview("navigate.html"); await sleep(2500);
    const c = await fev("document.getElementById('count').textContent");
    const before = cpu();
    await click("[...document.querySelectorAll('.pane .tab.active button[aria-label=\"Close Tab\"]')][0]"); await sleep(3000);
    const afterClose = cpu(); await sleep(4000); const later = cpu();
    await openPreview("navigate.html"); await sleep(2200);
    return { countBeforeClose: c, reopenedCount: await fev("document.getElementById('count').textContent"), procs: { before: before.length, afterClose: afterClose.length, later: later.length }, cpuDeltaAfterClose: later.map((p) => ({ id: p.Id, d: Math.round((p.cpu - (afterClose.find((q) => q.Id === p.Id)?.cpu ?? p.cpu)) * 100) / 100 })).filter((x) => x.d > 0.05) };
  });
  await step("b8_loop_close", async () => {
    await openPreview("navigate.html"); await sleep(1500);
    await fev("setTimeout(()=>{while(true){}},50); 1"); await sleep(1500);
    const busy1 = cpu(); await sleep(3000); const busy2 = cpu();
    const busyDelta = busy2.map((p) => ({ id: p.Id, d: Math.round((p.cpu - (busy1.find((q) => q.Id === p.Id)?.cpu ?? p.cpu)) * 100) / 100 })).filter((x) => x.d > 0.5);
    await click("[...document.querySelectorAll('.pane .tab.active button[aria-label=\"Close Tab\"]')][0]"); await sleep(3000);
    const a1 = cpu(); await sleep(4000); const a2 = cpu();
    return { busyDuringLoop: busyDelta, afterCloseDelta: a2.map((p) => ({ id: p.Id, d: Math.round((p.cpu - (a1.find((q) => q.Id === p.Id)?.cpu ?? p.cpu)) * 100) / 100 })).filter((x) => x.d > 0.5), procsAfter: a2.length, appAlive: await ev("1+1") };
  });
} catch (e) { log.fatal = e.stack; }
finally { try { fw?.close(); } catch {} app?.kill(); writeFileSync(OUT + "/v3-c.json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log).slice(0, 3500)); }

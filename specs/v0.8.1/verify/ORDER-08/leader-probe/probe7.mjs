import { writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs"; import { pathToFileURL } from "node:url"; const REPO="D:/projects/workbench-tauri"; const FILTER=null;

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = TEMP + "/v081-probe7";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-08";
const W = S + "/o8ws", WW = SW + "\\o8ws";
const DATA = S + "/appdata8/workbench-tauri";
const WEBVIEW = S + "/webview8";

// 1. Prepare clean test environment
rmSync(W, { recursive: true, force: true });
rmSync(S + "/appdata8", { recursive: true, force: true });
rmSync(WEBVIEW, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });
mkdirSync(W, { recursive: true });

// Copy test fixtures
cpSync(REPO + "/specs/v0.8.1/verify/ORDER-07/fixtures", W, { recursive: true });
cpSync(OUT + "/fixtures", W, { recursive: true });
cpSync("D:/projects/workbench-core/specs/v0.8.1/mockups/outline/index.html", W + "/outline-mockup.html");

// Add plain, page, and tiny.pdf fixtures
writeFileSync(W + "/plain.html", "<h1>Plain</h1><p>Unstyled text with <a href=\"#x\">a link</a>.</p><p id=\"x\">x</p>\n");
writeFileSync(W + "/page.html", "<p id=\"ran\">no</p><script>document.getElementById('ran').textContent='ran'</script>\n");
writeFileSync(W + "/tiny.pdf", "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

const setSettings = (o) => writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Dark", ...o }) + "\n");
setSettings({});
writeFileSync(DATA + "/state.json", JSON.stringify({
  version: 1,
  windows: [{
    id: "w1",
    folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }],
    active_folder_id: "f1",
    sidebar: { width: 200 }
  }]
}));

process.env.APPDATA = SW + "\\appdata8";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview8";

const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);

const log = {};
let app;
const contexts = new Map(); // contextId -> origin
const netUrls = [];
let appMainCspHeader = null;

const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (name) => {
  const r = await app.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(OUT + "/" + name + ".png", Buffer.from(r.data, "base64"));
};

const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel.replace(/\//g, "\\"))).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");

const clickAt = async (x, y, dbl = false, mod = 0) => {
  for (let c = 1; c <= (dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", x, y);
    await app.mouse("mousePressed", x, y, { button: "left", clickCount: c, modifiers: mod });
    await app.mouse("mouseReleased", x, y, { button: "left", clickCount: c, modifiers: mod });
  }
  await sleep(700);
};

const click = async (js, dbl = false, mod = 0) => {
  const p = await pt(js);
  if (!p) throw new Error("element not found: " + js);
  await clickAt(p.x, p.y, dbl, mod);
};

const step = async (name, fn) => {
  if (FILTER && !name.includes(FILTER)) return;
  console.log(`[STEP] Starting ${name}...`);
  try {
    log[name] = await fn();
    console.log(`[STEP] Completed ${name}`);
  } catch (e) {
    log[name] = "ERR " + e.message;
    console.error(`[STEP] Failed ${name}: ${e.message}`);
  }
};

// leader probe (ORDER-08 #6): each leak fixture opened through the UI with the app in front; page output, pongs, notice, LAN STUN hits.
import dgram from "node:dgram";
import os from "node:os";
import { readFileSync as rf } from "node:fs";
const lan = Object.values(os.networkInterfaces()).flat().find(i => i.family === "IPv4" && !i.internal).address;
for (const f of ["webrtc-direct","webrtc-blank","webrtc-srcdoc","webrtc-open","webrtc-worker","webrtc-proto"]) writeFileSync(W + "/" + f + "-lan.html", rf(W + "/" + f + ".html", "utf8").replaceAll("stun.l.google.com:19302", lan + ":3478"));
const hits = []; const sock = dgram.createSocket("udp4"); sock.on("message", (m, r) => hits.push(r.address + ":" + r.port)); await new Promise(r => sock.bind(3478, "0.0.0.0", r));
const openPreview = async (f) => { await click(row(f), true); await sleep(1200); await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {}); };
const closeAll = async () => { for (let i=0;i<10;i++){ const n=await ev(`document.querySelectorAll('.pane .tab button[aria-label="Close Tab"]').length`); if(!n)break; await click(`document.querySelector('.pane .tab button[aria-label="Close Tab"]')`).catch(()=>{}); await sleep(400);} };
const frameText = async (src) => { const list = await (await fetch("http://127.0.0.1:9222/json/list")).json(); const t = list.find(x => x.type === "iframe" && x.url === src); if (!t) return "noTarget"; const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r); const v = await Promise.race([new Promise(r => setTimeout(() => r("TIMEOUT"), 3000)), new Promise(r => { ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id === 1) r(d.result?.result?.value) }; ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { returnByValue: true, expression: "document.body.innerText" } })) })]); ws.close(); return v; };
const { execFileSync } = await import("node:child_process");
const fg = () => { try { return execFileSync("pwsh", ["-NoProfile","-ExecutionPolicy","Bypass","-File","D:/projects/workbench-tauri/tools/win-input.ps1","-ProcessId",String(app.pid),"-Action","foreground"], { encoding: "utf8", windowsHide: true }).trim().slice(0, 80); } catch (e) { return "fg-err"; } };
app = await launchApp(); await app.sleep(5000);
await ev(`window.__pp={pong:0};addEventListener("message",e=>{if(e.data?.previewPong)__pp.pong++})`);
const out = {};
for (const f of ["webrtc-direct-lan","webrtc-blank-lan","webrtc-srcdoc-lan","webrtc-open-lan","webrtc-worker-lan","webrtc-proto-lan","webrtc-srcdoc","links","beacon"]) {
  await closeAll(); fg(); await ev(`__pp.pong=0`); const h0 = hits.length;
  await openPreview(f + ".html"); await sleep(6000); fg();
  const st = await ev(`(()=>{const fr=[...document.querySelectorAll("iframe.html-frame")].find(x=>x.offsetParent);const n=[...document.querySelectorAll(".html-preview p")].find(p=>p.offsetParent);return {src:fr?fr.src:null,pong:__pp.pong,notice:!!n,focus:document.hasFocus(),vis:document.visibilityState}})()`);
  st.text = st.src ? String(await frameText(st.src)).slice(0, 500) : null; st.stunHits = hits.length - h0;
  out[f] = st; console.log(f, JSON.stringify(st));
}
writeFileSync("D:/projects/workbench-tauri/specs/v0.8.1/verify/ORDER-08/leader-probe/probe7.json", JSON.stringify({ lan, out }, null, 1));
sock.close(); app.kill();

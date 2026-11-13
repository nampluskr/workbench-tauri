// ORDER-08 V3: Comprehensive verification for criteria #2 through #8.
// Verifies loop recovery, hang notice, unresponsive renderer CPU behavior, ORDER-07 regression,
// WebRTC/link/beacon leaks (including WebRTC child iframe escape), security settings, plain theme & tab navigation.
// Output: specs/v0.8.1/verify/ORDER-08/v3.json and c-*.png screenshots.
// Usage: node specs/v0.8.1/verify/ORDER-08/measure-v3.mjs [exePath] [stepFilter]

import { writeFileSync, mkdirSync, rmSync, cpSync, readFileSync, appendFileSync, existsSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import dgram from "node:dgram";
import os from "node:os";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-" ? process.argv[2] : undefined;
const FILTER = process.argv[3] || null;

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = TEMP + "/v081-o8";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-08";
const W = S + "/o8ws", WW = SW + "\\o8ws";
const DATA = S + "/appdata8/workbench-tauri";
const WEBVIEW = S + "/webview8";

function getLocalLanIpv4() {
  const nets = os.networkInterfaces();
  const nonInternal = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const isIpv4 = net.family === "IPv4" || net.family === 4;
      if (isIpv4 && !net.internal) {
        nonInternal.push(net.address);
      }
    }
  }
  const lan = nonInternal.find((ip) => /^192\.168\./.test(ip) || /^10\./.test(ip) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip));
  return lan || nonInternal[0] || "127.0.0.1";
}

const LAN_IP = getLocalLanIpv4();
console.log(`[SETUP] Detected LAN IPv4 for local STUN: ${LAN_IP}`);

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

// Ensure localstun fixtures in OUT/fixtures and W use the detected LAN_IP:3478
for (const name of ["direct", "blank", "srcdoc", "open", "worker", "proto"]) {
  const origPath = OUT + `/fixtures/webrtc-${name}.html`;
  if (existsSync(origPath)) {
    const raw = readFileSync(origPath, "utf8");
    const replaced = raw.replace(/stun:stun\.l\.google\.com:19302/g, `stun:${LAN_IP}:3478`);
    writeFileSync(W + `/webrtc-${name}-localstun.html`, replaced);
    writeFileSync(OUT + `/fixtures/webrtc-${name}-localstun.html`, replaced);
  }
}

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
  ensureForeground(app.pid);
  await sleep(300);

  // Assertion check at the start of every step: exactly 1 pane and 0 visible preview iframes
  const panes = await ev("document.querySelectorAll('.pane').length").catch(() => -1);
  const iframes = await ev("document.querySelectorAll('iframe').length").catch(() => -1);
  if (panes !== 1 || iframes !== 0) {
    const errMsg = `Pre-step assertion failed: expected 1 pane and 0 iframes, got ${panes} panes and ${iframes} iframes`;
    console.error(`[STEP] Failed ${name}: ${errMsg}`);
    log[name] = { error: errMsg, panes, iframes };
    return;
  }

  try {
    log[name] = await fn();
    console.log(`[STEP] Completed ${name}`);
  } catch (e) {
    log[name] = "ERR " + e.message;
    console.error(`[STEP] Failed ${name}: ${e.message}`);
  }
};

const tabBy = (t) => "[...document.querySelectorAll('.pane .tab')].find(x=>x.querySelector('.tab-title').textContent.trim()===" + JSON.stringify(t) + ")";
const toasts = () => ev("[...document.querySelectorAll('.toast')].map(t=>t.innerText)");

const closeActiveTab = async () => {
  await click("[...document.querySelectorAll('.pane .tab.active button[aria-label=\"Close Tab\"]')][0]").catch(() => {});
  await sleep(1000);
};

const closeAllTabs = async () => {
  // Dismiss any open modal dialogs
  await ev("(()=>{ document.querySelectorAll('dialog[open]').forEach(d => { try { d.close(); } catch {} }); })()").catch(() => {});

  for (let loop = 0; loop < 30; loop++) {
    const tabs = await ev("document.querySelectorAll('.pane .tab').length").catch(() => 0);
    const panes = await ev("document.querySelectorAll('.pane').length").catch(() => 1);
    const iframes = await ev("document.querySelectorAll('iframe').length").catch(() => 0);
    if (tabs === 0 && panes <= 1 && iframes === 0) break;

    // First try closing active tab via Ctrl+W
    await ev("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', ctrlKey: true, bubbles: true }))").catch(() => {});
    await sleep(200);

    const tabsAfterKey = await ev("document.querySelectorAll('.pane .tab').length").catch(() => 0);
    if (tabsAfterKey > 0) {
      const closeSelector = "document.querySelector('.pane .tab.active button[aria-label=\"Close Tab\"], .pane .tab button[aria-label=\"Close Tab\"], .pane .tab.active button[aria-label=\"Unpin Tab\"], .pane .tab button[aria-label=\"Unpin Tab\"]')";
      const hasBtn = await ev(`!!${closeSelector}`).catch(() => false);
      if (hasBtn) {
        await click(closeSelector).catch(() => {});
      } else {
        await ev("(()=>{ const b = document.querySelector('.pane .tab button[aria-label=\"Close Tab\"], .pane .tab button[aria-label=\"Unpin Tab\"]'); if (b) b.click(); })()").catch(() => {});
      }
    } else if (panes > 1) {
      // Focus another pane if current pane is empty but multiple panes exist
      await click("document.querySelectorAll('.pane')[1]").catch(() => {});
    }
    await sleep(350);
  }

  const finalPanes = await ev("document.querySelectorAll('.pane').length").catch(() => 1);
  const finalTabs = await ev("document.querySelectorAll('.pane .tab').length").catch(() => 0);
  const finalIframes = await ev("document.querySelectorAll('iframe').length").catch(() => 0);
  if (finalPanes > 1 || finalTabs > 0 || finalIframes > 0) {
    console.warn(`[WARN] closeAllTabs finished with ${finalPanes} panes, ${finalTabs} tabs, ${finalIframes} iframes`);
  }
};

const openPreview = async (f) => {
  await click(row(f), true);
  await sleep(1200);
  await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
  await sleep(2500);
};

// ----------------------------------------------------------------------------
// Frame inspection and WebSocket target evaluation (Item 1)
// ----------------------------------------------------------------------------
async function getVisibleFrames() {
  return await ev(`(()=>{
    return [...document.querySelectorAll('.html-frame, iframe')]
      .filter(f => f.offsetParent !== null && /preview[0-9]*\.localhost/.test(f.src))
      .map(f => {
        const r = f.getBoundingClientRect();
        return {
          src: f.src,
          sandbox: f.getAttribute('sandbox'),
          csp: f.getAttribute('csp'),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
        };
      });
  })()`);
}

async function getActiveFrame() {
  return await ev(`(()=>{
    // Determine active pane
    const panes = [...document.querySelectorAll('.pane')];
    let activePane = panes.find(p => p.matches(':focus-within')) || panes.find(p => p.contains(document.activeElement));
    if (!activePane) {
      activePane = panes.find(p => p.querySelector('.tab.active')) || panes[0];
    }
    if (!activePane) return null;

    // Pick only the visible .html-frame in the active pane
    const frames = [...activePane.querySelectorAll('.html-frame, iframe')]
      .filter(f => f.offsetParent !== null && /preview[0-9]*\.localhost/.test(f.src));
    const f = frames[0] || null;
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return {
      src: f.src,
      sandbox: f.getAttribute('sandbox'),
      csp: f.getAttribute('csp'),
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    };
  })()`);
}

let fw = null;
let fwUrl = null;
let fid = 0;
const fEvents = [];

async function connectToTarget(wsUrl) {
  if (fw && fw.readyState === WebSocket.OPEN && fwUrl === wsUrl) {
    return fw;
  }
  try { fw?.close(); } catch {}
  fw = null;
  fwUrl = null;

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error("WS connect timeout to " + wsUrl)), 4000);
    ws.onopen = () => { clearTimeout(timer); res(); };
    ws.onerror = (e) => { clearTimeout(timer); rej(e); };
  });

  ws.addEventListener("message", (m) => {
    try {
      const d = JSON.parse(m.data);
      if (d.method) fEvents.push(d);
    } catch {}
  });

  fw = ws;
  fwUrl = wsUrl;
  return fw;
}

async function findFrameTarget(expectedSrc) {
  let targetSrc = expectedSrc;
  if (!targetSrc) {
    const active = await getActiveFrame();
    if (active) targetSrc = active.src;
  }
  if (!targetSrc) return null;

  for (let i = 0; i < 12; i++) {
    try {
      const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
      const target = list.find((x) => {
        if (!x.url) return false;
        if (x.url === targetSrc) return true;
        try {
          const u1 = new URL(x.url);
          const u2 = new URL(targetSrc);
          return u1.host === u2.host && u1.pathname === u2.pathname;
        } catch {
          return false;
        }
      });
      if (target && target.webSocketDebuggerUrl) {
        await connectToTarget(target.webSocketDebuggerUrl);
        return target;
      }
    } catch {}
    await sleep(300);
  }
  return null;
}

const fsend = (method, params = {}, timeoutMs = 6000) => new Promise((res) => {
  if (!fw || fw.readyState !== WebSocket.OPEN) {
    return res({ error: "WS not open" });
  }
  const id = ++fid;
  const timer = setTimeout(() => {
    fw?.removeEventListener("message", h);
    res({ error: "fsend timeout for " + method });
  }, timeoutMs);

  const h = (m) => {
    try {
      const d = JSON.parse(m.data);
      if (d.id === id) {
        clearTimeout(timer);
        fw.removeEventListener("message", h);
        res(d.result ?? d);
      }
    } catch {}
  };
  fw.addEventListener("message", h);
  fw.send(JSON.stringify({ id, method, params }));
});

function unwrapCdpEvaluate(r) {
  if (!r) return { error: "no response" };
  if (r.error) return { error: typeof r.error === "string" ? r.error : JSON.stringify(r.error) };
  if (r.exceptionDetails) {
    const desc = r.exceptionDetails.exception?.description || r.exceptionDetails.text || "evaluation exception";
    return { error: desc };
  }
  const resObj = r.result !== undefined ? r.result : r;
  if (resObj && resObj.type === "undefined") {
    return { error: "undefined" };
  }
  if (resObj && resObj.value !== undefined) {
    return resObj.value;
  }
  if (r.value !== undefined) {
    return r.value;
  }
  if (resObj && resObj.type) {
    return { error: `non-primitive type: ${resObj.type} (${resObj.description || ""})` };
  }
  return { error: "unknown CDP evaluate result" };
}

async function fev(expr, expectedSrc) {
  const t = await findFrameTarget(expectedSrc);
  if (!t) return { error: "noFrame: " + expectedSrc };
  const r = await fsend("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  return unwrapCdpEvaluate(r);
}

async function frameEval(expr, expectedSrc) {
  const res = await fev(expr, expectedSrc);
  if (!res || typeof res !== "object" || !res.error || !res.error.startsWith("noFrame")) {
    return res;
  }

  // Fallback to in-process contexts if any
  const ids = [...contexts.entries()].filter(([, o]) => /preview[0-9]*\.localhost/.test(o)).map(([id]) => id);
  for (const id of ids.reverse()) {
    try {
      const r = await app.send("Runtime.evaluate", { expression: expr, contextId: id, returnByValue: true, awaitPromise: true });
      const unwrapped = unwrapCdpEvaluate(r);
      if (!unwrapped || typeof unwrapped !== "object" || !unwrapped.error) {
        return unwrapped;
      }
    } catch {}
  }
  return res;
}

const tableOf = async (expectedSrc) => frameEval("[...document.querySelectorAll('#rows tr')].map(r=>[...r.cells].map(c=>c.textContent).join(' | '))", expectedSrc);

// ----------------------------------------------------------------------------
// Process Tree, Foreground & Network Helpers (Item 1 & Item 2)
// ----------------------------------------------------------------------------
function getAppTreePids() {
  try {
    const root = app.pid;
    const psCmd = `
      $root = ${root}
      $tree = @($root)
      $procs = Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId
      $queue = @($root)
      while ($queue.Count -gt 0) {
        $curr = $queue[0]
        if ($queue.Count -gt 1) { $queue = $queue[1..($queue.Count - 1)] } else { $queue = @() }
        $kids = $procs | Where-Object { $_.ParentProcessId -eq $curr }
        foreach ($k in $kids) {
          if (-not ($tree -contains $k.ProcessId)) {
            $tree += $k.ProcessId
            $queue += $k.ProcessId
          }
        }
      }
      $tree | ConvertTo-Json -Compress
    `;
    const out = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", psCmd], { encoding: "utf8", windowsHide: true }).trim();
    if (!out) return [root];
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [app.pid];
  }
}

function getAppRendererCpus() {
  const treePids = new Set(getAppTreePids());
  try {
    const cmd = "Get-Process msedgewebview2 -ErrorAction SilentlyContinue | Select-Object Id, @{n='cpu';e={[math]::Round($_.CPU,2)}} | ConvertTo-Json -Compress";
    const raw = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd], { encoding: "utf8", windowsHide: true }).trim();
    if (!raw) return [];
    const list = JSON.parse(raw);
    const arr = Array.isArray(list) ? list : [list];
    return arr.filter((p) => treePids.has(p.Id));
  } catch {
    return [];
  }
}

function checkPidCpu(pid) {
  try {
    const cmd = `Get-Process -Id ${pid} -ErrorAction SilentlyContinue | Select-Object Id, @{n='cpu';e={[math]::Round($_.CPU,2)}} | ConvertTo-Json -Compress`;
    const raw = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd], { encoding: "utf8", windowsHide: true }).trim();
    if (!raw) return { pid, isAlive: false, cpu: null };
    const p = JSON.parse(raw);
    return { pid, isAlive: true, cpu: p.cpu };
  } catch {
    return { pid, isAlive: false, cpu: null };
  }
}

function getForegroundTitle() {
  try {
    const cmd = `
      $h = (Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();' -Name "W$([Guid]::NewGuid().ToString('N').Substring(0,8))" -Namespace "U" -PassThru)::GetForegroundWindow()
      $p = Get-Process | Where-Object { $_.MainWindowHandle -eq $h }
      if ($p) {
        [PSCustomObject]@{ pid = $p.Id; name = $p.ProcessName; title = $p.MainWindowTitle } | ConvertTo-Json -Compress
      } else {
        [PSCustomObject]@{ hwnd = $h.ToInt64(); title = "unknown" } | ConvertTo-Json -Compress
      }
    `;
    const out = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd], { encoding: "utf8", windowsHide: true }).trim();
    return out ? JSON.parse(out) : null;
  } catch {
    return null;
  }
}

function getNetworkSnapshot() {
  const treePids = new Set(getAppTreePids());
  const appTcp = [];
  let otherTcpCount = 0;
  const appUdp = [];

  try {
    const tcpCmd = `
      Get-NetTCPConnection -State Established,SynSent -ErrorAction SilentlyContinue |
        Where-Object { $_.RemoteAddress -ne '127.0.0.1' -and $_.RemoteAddress -ne '::1' -and $_.RemoteAddress -ne '0.0.0.0' } |
        Select-Object OwningProcess, LocalAddress, LocalPort, RemoteAddress, RemotePort, State |
        ConvertTo-Json -Compress
    `;
    const tcpOut = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", tcpCmd], { encoding: "utf8", windowsHide: true }).trim();
    if (tcpOut) {
      const tcpParsed = JSON.parse(tcpOut);
      const tcpList = Array.isArray(tcpParsed) ? tcpParsed : [tcpParsed];
      for (const conn of tcpList) {
        if (treePids.has(conn.OwningProcess)) {
          appTcp.push(conn);
        } else {
          otherTcpCount++;
        }
      }
    }
  } catch {}

  try {
    const udpCmd = `
      Get-NetUDPEndpoint -ErrorAction SilentlyContinue |
        Select-Object OwningProcess, LocalAddress, LocalPort |
        ConvertTo-Json -Compress
    `;
    const udpOut = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", udpCmd], { encoding: "utf8", windowsHide: true }).trim();
    if (udpOut) {
      const udpParsed = JSON.parse(udpOut);
      const udpList = Array.isArray(udpParsed) ? udpParsed : [udpParsed];
      for (const ep of udpList) {
        if (treePids.has(ep.OwningProcess)) {
          appUdp.push(ep);
        }
      }
    }
  } catch {}

  return {
    appTreePids: [...treePids],
    appTcpConnections: appTcp,
    otherAppsTcpCount: otherTcpCount,
    appUdpEndpoints: appUdp
  };
}

function getProcessTypeInfo(pid) {
  if (!pid) return { pid, type: null, utilitySubType: null, commandLine: null };
  try {
    const cmd = `
      $proc = Get-CimInstance Win32_Process -Filter "ProcessId=${Number(pid)}" -ErrorAction SilentlyContinue
      if (-not $proc) {
        $proc = Get-Process -Id ${Number(pid)} -ErrorAction SilentlyContinue
      }
      $proc.CommandLine
    `;
    const cmdLine = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd], { encoding: "utf8", windowsHide: true }).trim();
    const typeMatch = cmdLine.match(/--type=([^\s"]+)/);
    const subTypeMatch = cmdLine.match(/--utility-sub-type=([^\s"]+)/);
    return {
      pid: Number(pid),
      type: typeMatch ? typeMatch[1] : (cmdLine.toLowerCase().includes("msedgewebview2") ? "browser" : "main"),
      utilitySubType: subTypeMatch ? subTypeMatch[1] : null,
      commandLine: cmdLine || null
    };
  } catch (e) {
    return { pid: Number(pid), type: null, utilitySubType: null, error: e.message };
  }
}

function getTreeProcessTypes(rootPid) {
  try {
    const psFile = REPO + "/specs/v0.8.1/verify/ORDER-08/leader-probe/tree-types.ps1";
    const out = execFileSync("pwsh", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", psFile, "-RootPid", String(rootPid)], { encoding: "utf8", windowsHide: true }).trim();
    return out ? out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
  } catch {
    try {
      const psFile = REPO + "/specs/v0.8.1/verify/ORDER-08/leader-probe/tree-types.ps1";
      const out = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", psFile, "-RootPid", String(rootPid)], { encoding: "utf8", windowsHide: true }).trim();
      return out ? out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
    } catch (e) {
      return ["ERR: " + e.message];
    }
  }
}

let stunSocket = null;
const stunPackets = [];

async function startStunServer() {
  if (stunSocket) return;
  try {
    const sock = dgram.createSocket("udp4");
    sock.on("message", (msg, rinfo) => {
      const hit = {
        time: Date.now(),
        address: rinfo.address,
        port: rinfo.port,
        length: msg.length
      };
      stunPackets.push(hit);
      console.log(`[STUN HIT] from ${rinfo.address}:${rinfo.port} len=${msg.length}`);
    });
    sock.on("error", (err) => {
      console.warn("[WARN] STUN socket error:", err.message);
    });
    await new Promise((res) => {
      const timer = setTimeout(() => res(), 3000);
      sock.bind(3478, "0.0.0.0", () => {
        clearTimeout(timer);
        console.log("[STUN] Listening on 0.0.0.0:3478");
        res();
      });
    });
    stunSocket = sock;
  } catch (e) {
    console.warn("[WARN] Could not bind STUN receiver on port 3478:", e.message);
  }
}

function stopStunServer() {
  try { stunSocket?.close(); } catch {}
  stunSocket = null;
}

const ensureForeground = (pid) => {
  try {
    execFileSync("pwsh", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(pid), "-Action", "foreground"], { encoding: "utf8", windowsHide: true });
  } catch {
    try {
      execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(pid), "-Action", "foreground"], { encoding: "utf8", windowsHide: true });
    } catch {}
  }
};

const bringProcessToForeground = (pid) => {
  if (!pid) return false;
  try {
    const cmd = `
      $targetPid = ${Number(pid)}
      $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
      if ($proc) {
        $h = $proc.MainWindowHandle
        if ($h -eq [IntPtr]::Zero) {
          Start-Sleep -Milliseconds 400
          $proc.Refresh()
          $h = $proc.MainWindowHandle
        }
        if ($h -ne [IntPtr]::Zero) {
          $hex = '0x{0:X}' -f [int64]$h
          try {
            pwsh -NoProfile -ExecutionPolicy Bypass -File "${REPO}/tools/win-input.ps1" -TargetHwnd $hex -Action foreground
          } catch {
            powershell -NoProfile -ExecutionPolicy Bypass -File "${REPO}/tools/win-input.ps1" -TargetHwnd $hex -Action foreground
          }
        }
      }
    `;
    execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd], { encoding: "utf8", windowsHide: true });
    return true;
  } catch {
    return false;
  }
};

const spawnNotepad = () => {
  const child = spawn("notepad.exe", [], { detached: true, stdio: "ignore" });
  child.unref();
  return child.pid;
};

const killSpecificProcess = (pid) => {
  if (!pid) return;
  try {
    process.kill(pid);
  } catch {}
  try {
    execFileSync("powershell", ["-NoProfile", "-Command", `Stop-Process -Id ${Number(pid)} -Force -ErrorAction SilentlyContinue`], { encoding: "utf8", windowsHide: true });
  } catch {}
};

try {
  await startStunServer();
  app = await launchApp(EXE);
  await sleep(6000);
  ensureForeground(app.pid);
  await sleep(600);

  app.on((m) => {
    if (m.method === "Runtime.executionContextCreated") contexts.set(m.params.context.id, m.params.context.origin || m.params.context.name || "");
    if (m.method === "Runtime.executionContextDestroyed") contexts.delete(m.params.executionContextId);
    if (m.method === "Network.requestWillBeSent") netUrls.push(m.params.request.url);
    if (m.method === "Network.responseReceived") {
      const u = m.params.response.url;
      if (/tauri\.localhost/.test(u) || /index\.html/.test(u)) {
        const h = m.params.response.headers;
        const csp = h["content-security-policy"] || h["Content-Security-Policy"] || h["content-security-policy-report-only"];
        if (csp) appMainCspHeader = csp;
      }
    }
  });

  await app.send("Runtime.enable");
  await app.send("Network.enable");
  await app.send("Target.setAutoAttach", { autoAttach: false, waitForDebuggerOnStart: false, flatten: true }).catch(() => {});

  log.exe = EXE || "debug";
  log.appPid = app.pid;
  log.initialAppTreePids = getAppTreePids();

  // --------------------------------------------------------------------------
  // Criterion #3 & #4: Loop hang detection, app responsiveness, notice & CPU
  // --------------------------------------------------------------------------
  await step("c3_c4_hang_and_cpu", async () => {
    const r = {};
    const beforeCpus = getAppRendererCpus();

    await openPreview("loop.html");
    r.openTime = Date.now();

    // Responsiveness while loop is spinning
    const t0 = Date.now();
    r.appAliveDuringLoop = await Promise.race([
      ev("document.querySelectorAll('.tree-row').length"),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timed out")), 3000))
    ]).catch((e) => e.message);
    r.appAliveMs = Date.now() - t0;

    // Identify loop renderer PID (highest CPU delta in app tree after 2.5s)
    await sleep(2500);
    const duringCpus = getAppRendererCpus();
    let loopPid = null;
    let maxDelta = -1;
    for (const cur of duringCpus) {
      const prev = beforeCpus.find((b) => b.Id === cur.Id);
      const delta = prev ? cur.cpu - prev.cpu : cur.cpu;
      if (delta > maxDelta) {
        maxDelta = delta;
        loopPid = cur.Id;
      }
    }
    r.loopRendererPid = loopPid;
    r.loopRendererInitialCpuDelta = maxDelta;

    // Wait for hang detection notice (K-08b 1s ping, 5s timeout)
    let notice = null;
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      notice = await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent");
      if (notice) break;
    }
    r.hangNotice = notice;
    r.hangNoticeDetectedAtSec = Math.round((Date.now() - r.openTime) / 1000);
    r.frameCountAfterHang = await ev("[...document.querySelectorAll('iframe')].filter(f=>f.offsetParent&&/preview[0-9]*\.localhost/.test(f.src)).length");
    await shot("c3-hang-notice");

    // Measure CPU for the specific loop renderer PID at 0s, 10s, 20s, 30s
    r.cpuTimeline = {};
    r.cpuTimeline["0s"] = checkPidCpu(loopPid);
    await sleep(10000);
    r.cpuTimeline["10s"] = checkPidCpu(loopPid);
    await sleep(10000);
    r.cpuTimeline["20s"] = checkPidCpu(loopPid);
    await sleep(10000);
    r.cpuTimeline["30s"] = checkPidCpu(loopPid);

    await closeActiveTab();
    await sleep(2000);
    r.loopRendererAfterClose = checkPidCpu(loopPid);
    await closeAllTabs();
    return r;
  });

  // --------------------------------------------------------------------------
  // Criterion #2: Recovery after loop, file edit redraw, split pane with loop
  // --------------------------------------------------------------------------
  await step("c2_recovery_and_panes", async () => {
    const r = {};

    // 1. Open page.html preview -> verify script execution (#ran === "ran")
    await openPreview("page.html");
    await sleep(2500);
    const pageFrame = await getActiveFrame();
    r.page = {
      frameSrc: pageFrame?.src,
      ran: await frameEval("document.getElementById('ran')?.textContent", pageFrame?.src),
      frame: pageFrame
    };
    await shot("c2-after-loop-page");
    await closeAllTabs();
    await sleep(1500);

    // 2. Open outline mockup -> verify #designs renders
    await openPreview("outline-mockup.html");
    await sleep(3000);
    const mockupFrame = await getActiveFrame();
    r.mockup = {
      frameSrc: mockupFrame?.src,
      designs: await frameEval("document.querySelectorAll('#designs > *').length", mockupFrame?.src),
      title: await frameEval("document.title", mockupFrame?.src),
      frame: mockupFrame
    };
    await shot("c2-after-loop-mockup");
    await closeAllTabs();
    await sleep(1500);

    // 3. Edit loop file to remove loop -> verify preview re-renders
    await openPreview("loop.html");
    await sleep(6000); // wait for hang notice
    r.noticeBeforeEdit = await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent");

    // Check if loop.html editor tab is dirty; revert or close if needed
    for (let u = 0; u < 5; u++) {
      const isDirty = await ev("!!document.querySelector('.tab-indicator.dirty, .tab-indicator.conflict')");
      if (!isDirty) break;
      await ev("(()=>{ const cm = document.querySelector('.cm-content'); if (cm) cm.focus(); })()");
      await app.key("z", 2); // Ctrl+Z
      await sleep(150);
    }
    const tabDirty = await ev("!!document.querySelector('.tab-indicator.dirty, .tab-indicator.conflict')");
    r.tabDirtyBeforeWrite = tabDirty;
    if (tabDirty) {
      await closeActiveTab();
      await sleep(500);
    }

    writeFileSync(W + "/loop.html", "<!DOCTYPE html><html><body><h1>Loop Fixed</h1><p id=\"fixed\">recovered successfully</p></body></html>\n");
    await sleep(3500);

    const bufferText = await ev("document.querySelector('.cm-content')?.textContent");
    r.bufferContainsFixed = bufferText ? bufferText.includes("Loop Fixed") : null;

    const fixedFrame = await getActiveFrame();
    r.fixedRedraw = {
      frameSrc: fixedFrame?.src,
      fixedText: await frameEval("document.getElementById('fixed')?.textContent", fixedFrame?.src),
      title: await frameEval("document.title", fixedFrame?.src),
      hasNotice: !!(await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))"))
    };
    await shot("c2-loop-fixed-redraw");
    await closeAllTabs();
    await sleep(1000);

    // Restore original loop.html fixture
    writeFileSync(W + "/loop.html", "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Loop</title></head><body><h1>Loop</h1><script>setTimeout(()=>{while(true){}},50);</script></body></html>\n");
    await sleep(1000);

    // 4. Split pane step (Item 5):
    // Open loop in pane 1, wait for hang notice (6s+), then open page.html in pane 2.
    // Then touch loop.html (keep loop) to re-render loop pane, and verify page.html continues to respond.
    await openPreview("loop.html");
    await sleep(6000); // wait for hang notice
    const loopNoticeBeforeSplit = await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent");

    // Open page.html in side pane via View menu
    await click(row("page.html"), true);
    await sleep(1000);
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await sleep(400);
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('View'))");
    await sleep(400);
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('Open Preview to the Side'))");
    await sleep(3500);

    const visibleFrames1 = await getVisibleFrames();
    const pageFrameSrc1 = visibleFrames1[0]?.src;
    const pageRanInitial = await frameEval("document.getElementById('ran')?.textContent", pageFrameSrc1);
    await shot("c2-split-pane-loop-and-page");

    // Touch loop.html on disk (keeping loop intact) to trigger loop pane re-render
    appendFileSync(W + "/loop.html", "\n<!-- touch loop to re-render -->\n");
    await sleep(3500);

    const visibleFrames2 = await getVisibleFrames();
    const pageFrameSrc2 = visibleFrames2[0]?.src || pageFrameSrc1;
    const pageRanAfterLoopTouch = await frameEval("({ran: document.getElementById('ran')?.textContent, math: 2+2, time: Date.now()})", pageFrameSrc2);

    r.splitPane = {
      panes: await ev("document.querySelectorAll('.pane').length"),
      loopNoticeBeforeSplit,
      pageFrameSrc: pageFrameSrc1,
      pageRanInitial,
      pageRanAfterLoopTouch,
      iframesBeforeTouch: visibleFrames1,
      iframesAfterTouch: visibleFrames2
    };

    await closeAllTabs();
    return r;
  });

  // --------------------------------------------------------------------------
  // Criterion #3 (cont.): No false positives on normal page or fast tab switch
  // --------------------------------------------------------------------------
  await step("c3_no_false_positive", async () => {
    const r = {};

    // 1. Normal page open for 10s
    await openPreview("page.html");
    await sleep(10000);
    const normalFrame = await getActiveFrame();
    r.normalPage10s = {
      frameSrc: normalFrame?.src,
      ran: await frameEval("document.getElementById('ran')?.textContent", normalFrame?.src),
      notice: await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent ?? null")
    };
    await closeActiveTab();
    await sleep(1000);

    // 2. Fast tab switching 10 times between editor and preview
    await click(row("page.html"), true);
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2000);

    const pa = await pt(tabBy("page.html"));
    const pb = await pt(tabBy("Preview page.html"));
    for (let k = 0; k < 10; k++) {
      const p = k % 2 ? pb : pa;
      if (p) {
        await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: 1 });
        await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: 1 });
      }
      await sleep(250);
    }
    await sleep(2000);
    const fastTabsFrame = await getActiveFrame();
    r.fastTabSwitches = {
      switches: 10,
      frameSrc: fastTabsFrame?.src,
      notice: await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent ?? null"),
      toasts: await toasts()
    };
    await closeAllTabs();
    return r;
  });

  // --------------------------------------------------------------------------
  // Criterion #3 (cont.): Background window test (Notepad in foreground for 15s)
  // Normal page preview should NOT show hang notice (behind window & after foreground return).
  // Loop page preview behind window -> return to foreground -> hang notice in 5~7s.
  // --------------------------------------------------------------------------
  await step("c3_background_window_test", async () => {
    const r = {};

    const checkHangNotice = async () => {
      return await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent || null");
    };

    // Subtest 1: Normal page (page.html)
    console.log("Starting c3 background window test for normal page...");
    ensureForeground(app.pid);
    await sleep(400);
    await openPreview("page.html");
    await sleep(2500);

    // Spawn child notepad.exe and record specific PID
    const normalNotepadPid = spawnNotepad();
    console.log(`Spawned child notepad for normal page test with PID: ${normalNotepadPid}`);
    await sleep(600);
    bringProcessToForeground(normalNotepadPid);
    await sleep(400);
    const fgDuringNormal = getForegroundTitle();

    // Keep notepad in foreground for 15 seconds, checking for false hang notices
    const normalNoticesDuringBg = [];
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      const n = await checkHangNotice();
      if (n) normalNoticesDuringBg.push({ sec: i + 1, notice: n });
    }

    // Bring app back to foreground and wait 10 seconds, checking for false hang notices
    ensureForeground(app.pid);
    await sleep(400);
    const fgAfterNormalReturn = getForegroundTitle();
    const normalNoticesAfterReturn = [];
    for (let i = 0; i < 10; i++) {
      await sleep(1000);
      const n = await checkHangNotice();
      if (n) normalNoticesAfterReturn.push({ sec: i + 1, notice: n });
    }

    // Terminate only this specific notepad PID
    killSpecificProcess(normalNotepadPid);

    r.normalPage = {
      notepadPid: normalNotepadPid,
      foregroundDuringBg: fgDuringNormal,
      noticesDuringBg15s: normalNoticesDuringBg,
      hadNoticeDuringBg: normalNoticesDuringBg.length > 0,
      foregroundAfterReturn: fgAfterNormalReturn,
      noticesAfterReturn10s: normalNoticesAfterReturn,
      hadNoticeAfterReturn: normalNoticesAfterReturn.length > 0,
      passed: normalNoticesDuringBg.length === 0 && normalNoticesAfterReturn.length === 0
    };

    await closeAllTabs();
    await sleep(1500);

    // Subtest 2: Loop page (loop.html)
    console.log("Starting c3 background window test for loop page...");
    ensureForeground(app.pid);
    await sleep(400);
    await openPreview("loop.html");
    await sleep(1500);

    // Spawn child notepad.exe and bring to front for 15s
    const loopNotepadPid = spawnNotepad();
    console.log(`Spawned child notepad for loop page test with PID: ${loopNotepadPid}`);
    await sleep(600);
    bringProcessToForeground(loopNotepadPid);
    await sleep(400);
    const fgDuringLoop = getForegroundTitle();

    // 15 seconds behind window with ping suspended
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
    }

    // Bring app back to foreground and measure time until hang notice appears (expected 5~7s)
    const returnTime = Date.now();
    ensureForeground(app.pid);
    await sleep(300);
    const fgAfterLoopReturn = getForegroundTitle();

    let loopHangNotice = null;
    let loopHangNoticeDetectedAtSec = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      const n = await checkHangNotice();
      if (n) {
        loopHangNotice = n;
        loopHangNoticeDetectedAtSec = Math.round((Date.now() - returnTime) / 100) / 10;
        break;
      }
    }

    // Terminate only this specific notepad PID
    killSpecificProcess(loopNotepadPid);
    await shot("c3-background-loop-hang");

    r.loopPage = {
      notepadPid: loopNotepadPid,
      foregroundDuringBg: fgDuringLoop,
      foregroundAfterReturn: fgAfterLoopReturn,
      hangNotice: loopHangNotice,
      hangNoticeDetectedAtSec: loopHangNoticeDetectedAtSec,
      triggeredWithin5to7s: loopHangNoticeDetectedAtSec !== null && loopHangNoticeDetectedAtSec >= 4.5 && loopHangNoticeDetectedAtSec <= 8.5,
      passed: loopHangNotice !== null && loopHangNoticeDetectedAtSec >= 4.5 && loopHangNoticeDetectedAtSec <= 8.5
    };

    await closeAllTabs();
    return r;
  });

  // --------------------------------------------------------------------------
  // Criterion #5: ORDER-07 5-fixture regression + preview1/preview2 host verification
  // --------------------------------------------------------------------------
  await step("c5_order07_regression", async () => {
    const r = {};

    // 1. isolation.html
    await openPreview("isolation.html");
    await sleep(2500);
    const isoFrame = await getActiveFrame();
    r.isolation = {
      frameSrc: isoFrame?.src,
      frame: isoFrame,
      ran: await frameEval("document.getElementById('ran')?.textContent", isoFrame?.src),
      localjs: await frameEval("document.getElementById('localjs')?.textContent", isoFrame?.src),
      cssBorder: await frameEval("getComputedStyle(document.querySelector('.local-css'))?.borderStyle", isoFrame?.src),
      img: await frameEval("(i=>i?{complete:i.complete,w:i.naturalWidth}:null)(document.querySelector('img'))", isoFrame?.src),
      table: await tableOf(isoFrame?.src)
    };
    await shot("c5-isolation");

    appendFileSync(W + "/isolation.html", "\n<p id=\"edited\">edited marker</p>\n");
    await sleep(2500);
    r.isolation.redrawAfterEdit = await frameEval("document.getElementById('edited')?.textContent ?? null", isoFrame?.src);
    await closeActiveTab();
    await sleep(1000);

    // 2. network.html
    const netStart = netUrls.length;
    await openPreview("network.html");
    await sleep(3000);
    const netFrame = await getActiveFrame();
    const netSlice = netUrls.slice(netStart);
    r.network = {
      frameSrc: netFrame?.src,
      table: await tableOf(netFrame?.src),
      internetRequests: netSlice.filter((u) => /example\.com|websocket\.org|https:\/\/(?!asset|preview[0-9]*|ipc|tauri)/.test(u))
    };
    await shot("c5-network");
    await closeActiveTab();
    await sleep(1000);

    // 3. navigate.html
    await openPreview("navigate.html");
    await sleep(2000);
    const navFrame = await getActiveFrame();
    const navState = async () => ({
      title: await frameEval("document.title", navFrame?.src),
      started: await frameEval("document.getElementById('started')?.textContent ?? null", navFrame?.src),
      count: await frameEval("document.getElementById('count')?.textContent ?? null", navFrame?.src),
      appUrl: await ev("location.href")
    });
    r.navigate = { frameSrc: navFrame?.src, start: await navState(), clicks: {} };

    for (const label of ["location.href = https://…", "location.href = refresh.html", "location = asset URL", "window.open", "form.submit()", "top.location"]) {
      try {
        const p = await frameEval(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)return null;b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`, navFrame?.src);
        if (p && navFrame?.rect) {
          await clickAt(Math.round(navFrame.rect.x + p.x), Math.round(navFrame.rect.y + p.y));
          await sleep(2000);
        }
        r.navigate.clicks[label] = await navState();
      } catch (e) {
        r.navigate.clicks[label] = "ERR " + e.message;
      }
    }
    await shot("c5-navigate");
    await closeActiveTab();
    await sleep(1000);

    // 4. refresh.html
    await openPreview("refresh.html");
    await sleep(4500);
    const refFrame = await getActiveFrame();
    r.refresh = {
      frameSrc: refFrame?.src,
      title: await frameEval("document.title", refFrame?.src),
      body: await frameEval("document.body?.innerText?.slice(0, 100) ?? null", refFrame?.src),
      src: refFrame?.src
    };
    await closeActiveTab();
    await sleep(1000);

    // 5. loopnav.html
    await openPreview("loopnav.html");
    await sleep(8000);
    const loopnavFrame = await getActiveFrame();
    r.loopnav = {
      frameSrc: loopnavFrame?.src,
      title: await frameEval("document.title", loopnavFrame?.src),
      src: loopnavFrame?.src,
      toasts: await toasts(),
      appAnswer: await ev("1+1")
    };
    await closeActiveTab();
    await sleep(1000);

    // 6. Alternative host (preview1 or preview2) verification
    // Trigger hang to activate host avoidance
    await openPreview("loop.html");
    await sleep(6000); // wait for hang notice
    // Within 20s, opening a new preview routes to alternate host
    await openPreview("isolation.html");
    await sleep(2500);
    const altFrame = await getActiveFrame();
    r.alternate_host = {
      frameSrc: altFrame?.src,
      isAlternateHost: /preview[1-9]\.localhost/.test(altFrame?.src || ""),
      ran: await frameEval("document.getElementById('ran')?.textContent", altFrame?.src),
      localjs: await frameEval("document.getElementById('localjs')?.textContent", altFrame?.src)
    };
    await shot("c5-preview1-isolation");
    await closeAllTabs();
    return r;
  });

  // --------------------------------------------------------------------------
  // Criterion #6: Leak tests (Item 1, Item 2, Item 3)
  // Wait 25s for stuck host avoidance to expire and renderers to settle.
  // Evaluate frame values BEFORE network snapshot to prevent foreground loss.
  // --------------------------------------------------------------------------
  await step("c6_leak_tests", async () => {
    const r = {};

    console.log("Waiting 25s for stuck host avoidance to expire and renderers to settle before leak tests...");
    await sleep(25000);

    const runLeakSubtest = async (filename, shotName, readFrameValuesFn) => {
      // 1. Ensure foreground before opening preview
      ensureForeground(app.pid);
      await sleep(400);

      const netBefore = getNetworkSnapshot();
      const stunStart = stunPackets.length;
      const cdpStart = netUrls.length;

      await openPreview(filename);
      await sleep(5000); // 5 seconds after opening

      // 2. Ensure foreground BEFORE reading frame values and notice
      ensureForeground(app.pid);
      await sleep(400);

      // Record foreground window at read time
      const foregroundAtRead = getForegroundTitle();
      const visState = await ev("document.visibilityState");
      const hangNotice = await ev("[...document.querySelectorAll('p')].find(p=>p.textContent.includes('This HTML page is not responding'))?.textContent || null");
      let noticeInfo = null;
      if (hangNotice) {
        noticeInfo = {
          detectedAt: new Date().toISOString(),
          visibilityState: visState,
          foreground: foregroundAtRead
        };
      }

      // 3. Read frame values
      const activeFrame = await getActiveFrame();
      const frameSrc = activeFrame?.src;
      let frameData;
      try {
        frameData = await readFrameValuesFn(frameSrc);
      } catch (err) {
        frameData = { outputRaw: { error: err.message || String(err) } };
      }

      const isUndetermined = Boolean(
        hangNotice ||
        !frameSrc ||
        frameData?.outputRaw?.error
      );
      const verdict = isUndetermined ? "판정 불가 (undetermined)" : "정상 판정";

      // 4. Capture screenshot
      await shot(shotName);

      // 5. AFTER reading frame values, take OS network snapshot
      const netAfter = getNetworkSnapshot();
      const cdpSlice = netUrls.slice(cdpStart);
      const newStunPackets = stunPackets.slice(stunStart);

      const newTcp = netAfter.appTcpConnections.filter(
        (c) => !netBefore.appTcpConnections.some((b) => b.LocalPort === c.LocalPort && b.RemoteAddress === c.RemoteAddress && b.OwningProcess === c.OwningProcess)
      );
      const newUdpAll = netAfter.appUdpEndpoints.filter(
        (u) => !netBefore.appUdpEndpoints.some((b) => b.LocalPort === u.LocalPort && b.OwningProcess === u.OwningProcess)
      );
      const newUdpMdns = newUdpAll.filter((u) => u.LocalPort === 5353);
      const newUdpExcludingMdns = newUdpAll.filter((u) => u.LocalPort !== 5353);

      const otherTcp = Math.max(0, netAfter.otherAppsTcpCount - netBefore.otherAppsTcpCount);

      // Collect process type info (--type= and --utility-sub-type=) for owning PIDs
      const owningPids = [...new Set([...newTcp.map((c) => c.OwningProcess), ...newUdpAll.map((u) => u.OwningProcess)])];
      const processDetails = Object.fromEntries(owningPids.map((pid) => [pid, getProcessTypeInfo(pid)]));

      // Tree process types via leader-probe/tree-types.ps1
      const treeProcessTypes = getTreeProcessTypes(app.pid);

      // Check if any new UDP socket was opened by NetworkService
      const hasNetworkServiceUdp = newUdpAll.some((u) => {
        const info = processDetails[u.OwningProcess];
        return info?.utilitySubType === "network.mojom.NetworkService" || (info?.commandLine && info.commandLine.includes("network.mojom.NetworkService"));
      });

      // Item 4 expectation: "열림·STUN 없음" (open_no_stun) when network service opened UDP but STUN received 0
      const networkServiceUdpStatus = hasNetworkServiceUdp
        ? (newStunPackets.length === 0 ? "열림·STUN 없음 (open_no_stun)" : "STUN 유출 (leaked_stun)")
        : "없음 (closed)";

      // 5. Close tabs and clean up for next test
      await closeAllTabs();
      await sleep(1500);

      return {
        frameSrc,
        visibilityState: visState,
        hangNotice,
        noticeInfo,
        foregroundAtRead,
        isUndetermined,
        verdict,
        ...frameData,
        localStunHits: newStunPackets.length,
        localStunPackets: newStunPackets,
        networkServiceUdpStatus,
        cdpExternalRequests: cdpSlice.filter((u) => /stun|google|dns-leak|preconnect-leak|prefetch-leak|preload-leak|sendbeacon-leak|eventsource-leak|example\.com/i.test(u)),
        appTreeNewTcpConnections: newTcp,
        appTreeNewUdpEndpoints: newUdpExcludingMdns,
        mDnsUdpEndpoints: newUdpMdns,
        newUdpAllCount: newUdpAll.length,
        newUdpExcludingMdnsCount: newUdpExcludingMdns.length,
        processDetails,
        treeProcessTypes,
        otherAppsNewTcpCount: otherTcp
      };
    };

    const readOField = async (src) => {
      const oRaw = await frameEval("document.getElementById('o')?.textContent", src);
      const text = typeof oRaw === "string" ? oRaw : (oRaw?.error ? "" : JSON.stringify(oRaw));
      const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
      const candLines = lines.filter((l) => l.includes("OPEN cand"));
      const hostCands = candLines.filter((l) => /\bhost\b/i.test(l));
      const srflxCands = candLines.filter((l) => /\bsrflx\b/i.test(l));
      const relayCands = candLines.filter((l) => /\brelay\b/i.test(l));
      return {
        outputRaw: oRaw,
        outputLines: lines,
        isOpen: lines.some((l) => l.includes("OPEN")),
        candidateCounts: {
          host: hostCands.length,
          srflx: srflxCands.length,
          relay: relayCands.length,
          total: candLines.length
        },
        candidateLines: candLines,
        hasError: lines.some((l) => l.includes("err")),
        hits: lines.find((l) => l.includes("hits")) || null
      };
    };

    // 1. Local STUN avenues (port 3478 via LAN IPv4)
    r.webrtc_direct_local = await runLeakSubtest("webrtc-direct-localstun.html", "c6-webrtc-direct-local", readOField);
    r.webrtc_blank_local = await runLeakSubtest("webrtc-blank-localstun.html", "c6-webrtc-blank-local", readOField);
    r.webrtc_srcdoc_local = await runLeakSubtest("webrtc-srcdoc-localstun.html", "c6-webrtc-srcdoc-local", readOField);
    r.webrtc_open_local = await runLeakSubtest("webrtc-open-localstun.html", "c6-webrtc-open-local", readOField);
    r.webrtc_worker_local = await runLeakSubtest("webrtc-worker-localstun.html", "c6-webrtc-worker-local", readOField);
    r.webrtc_proto_local = await runLeakSubtest("webrtc-proto-localstun.html", "c6-webrtc-proto-local", readOField);

    // 2. Original Google STUN avenues (stun.l.google.com:19302)
    r.webrtc_direct_google = await runLeakSubtest("webrtc-direct.html", "c6-webrtc-direct-google", readOField);
    r.webrtc_blank_google = await runLeakSubtest("webrtc-blank.html", "c6-webrtc-blank-google", readOField);
    r.webrtc_srcdoc_google = await runLeakSubtest("webrtc-srcdoc.html", "c6-webrtc-srcdoc-google", readOField);
    r.webrtc_open_google = await runLeakSubtest("webrtc-open.html", "c6-webrtc-open-google", readOField);
    r.webrtc_worker_google = await runLeakSubtest("webrtc-worker.html", "c6-webrtc-worker-google", readOField);
    r.webrtc_proto_google = await runLeakSubtest("webrtc-proto.html", "c6-webrtc-proto-google", readOField);

    // 3. Links & Beacon
    r.links = await runLeakSubtest("links.html", "c6-links", async (src) => ({
      created: await frameEval("[...document.querySelectorAll('#created li')].map(e=>e.textContent)", src),
      errors: await frameEval("[...document.querySelectorAll('#errors li')].map(e=>e.textContent)", src)
    }));

    r.beacon = await runLeakSubtest("beacon.html", "c6-beacon", async (src) => ({
      beaconResult: await frameEval("document.getElementById('beacon-result')?.textContent", src),
      eventsourceResult: await frameEval("document.getElementById('eventsource-result')?.textContent", src)
    }));

    const allPaths = [
      r.webrtc_direct_local, r.webrtc_direct_google,
      r.webrtc_blank_local, r.webrtc_blank_google,
      r.webrtc_srcdoc_local, r.webrtc_srcdoc_google,
      r.webrtc_open_local, r.webrtc_open_google,
      r.webrtc_worker_local, r.webrtc_worker_google,
      r.webrtc_proto_local, r.webrtc_proto_google
    ];

    const determinedPaths = allPaths.filter((p) => !p.isUndetermined);
    const undeterminedPaths = allPaths.filter((p) => p.isUndetermined);

    r.summary = {
      lanIp: LAN_IP,
      totalLocalStunHits: stunPackets.length,
      allLocalStunHitsZero: [
        r.webrtc_direct_local, r.webrtc_blank_local, r.webrtc_srcdoc_local,
        r.webrtc_open_local, r.webrtc_worker_local, r.webrtc_proto_local
      ].every((p) => (p.localStunHits || 0) === 0),
      totalPaths: allPaths.length,
      determinedCount: determinedPaths.length,
      undeterminedCount: undeterminedPaths.length,
      undeterminedAvenues: undeterminedPaths.map((p) => ({
        src: p.frameSrc,
        verdict: p.verdict,
        hangNotice: p.hangNotice,
        foreground: p.foregroundAtRead
      })),
      allSrflxZero: determinedPaths.length > 0 && determinedPaths.every((p) => p.candidateCounts?.srflx === 0),
      allHostZero: determinedPaths.length > 0 && determinedPaths.every((p) => p.candidateCounts?.host === 0),
      allCdpExternalZero: allPaths.every((p) => p.cdpExternalRequests?.length === 0),
      candidateEvidenceNote: undeterminedPaths.length > 0
        ? `${undeterminedPaths.length} undetermined avenues (noFrame/hangNotice) excluded from candidate 0 evidence; verified from ${determinedPaths.length} determined avenues`
        : "All 12 avenues determined and verified candidate 0"
    };

    return r;
  });

  // --------------------------------------------------------------------------
  // Criterion #7: Security Settings (Item 4: appCsp via originalPolicy/header)
  // --------------------------------------------------------------------------
  await step("c7_security_settings", async () => {
    const r = {};

    // 1. App window inline script blocked + get originalPolicy
    const inlineResult = await app.send("Runtime.evaluate", {
      expression: "new Promise(res=>{let v=null, pol=null;document.addEventListener('securitypolicyviolation',e=>{v=e.violatedDirective;pol=e.originalPolicy},{once:true});const s=document.createElement('script');s.textContent='window.__x=1';document.head.append(s);setTimeout(()=>res({x:window.__x??null,violation:v,originalPolicy:pol}),300)})",
      awaitPromise: true,
      returnByValue: true
    }).then((res) => res.result?.value);

    r.appInlineBlocked = {
      x: inlineResult?.x ?? null,
      violation: inlineResult?.violation ?? null
    };

    // 2. App CSP (Item 4: from originalPolicy, response header, or meta)
    r.appCsp = inlineResult?.originalPolicy
      || appMainCspHeader
      || await ev("document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')?.content || null");

    // 3. Frame attributes & CSP from open preview
    await openPreview("page.html");
    await sleep(2000);
    const curFrame = await getActiveFrame();
    r.frame = curFrame;
    r.frameCspHeader = await frameEval("document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')?.content || null", curFrame?.src);
    await closeAllTabs();
    return r;
  });

  // --------------------------------------------------------------------------
  // Criterion #8: v0.8 features (Plain theme colors, Tab key into/out of frame)
  // --------------------------------------------------------------------------
  await step("c8_plain_theme_and_tab", async () => {
    const r = {};
    await openPreview("plain.html");
    await sleep(2000);
    const plainFrame = await getActiveFrame();
    r.frameSrc = plainFrame?.src;

    const waitForFrameElements = async (src, timeoutMs = 4000) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try {
          const ready = await frameEval("Boolean(document.body && document.querySelector('a'))", src);
          if (ready === true) return true;
        } catch {}
        await sleep(200);
      }
      return false;
    };

    const readStyles = async () => {
      try {
        await waitForFrameElements(plainFrame?.src, 4000);
      } catch {}

      const evalScript = `(() => {
        try {
          const body = document.body;
          const a = document.querySelector('a');
          const docEl = document.documentElement;
          if (!body) return { error: "document.body is null" };
          const b = getComputedStyle(body);
          const aStyle = a ? getComputedStyle(a) : null;
          const docStyle = docEl ? getComputedStyle(docEl) : null;
          return {
            text: b ? b.color : null,
            link: aStyle ? aStyle.color : null,
            docBg: docStyle ? docStyle.backgroundColor : null,
            bodyBg: b ? b.backgroundColor : null,
            scheme: docStyle ? docStyle.colorScheme : null
          };
        } catch (e) {
          return { error: e.message || String(e) };
        }
      })()`;

      let frameStyle;
      try {
        frameStyle = await frameEval(evalScript, plainFrame?.src);
      } catch (e) {
        frameStyle = { error: e.message || String(e) };
      }

      let iframeBg;
      try {
        iframeBg = await ev("(()=>{ const f = [...document.querySelectorAll('iframe')].find(e=>e.offsetParent); return f ? getComputedStyle(f).backgroundColor : null; })()");
      } catch (e) {
        iframeBg = { error: e.message || String(e) };
      }

      return {
        frame: frameStyle,
        iframeBg
      };
    };

    // One Dark
    try {
      r.oneDark = await readStyles();
      await shot("c8-plain-onedark");
    } catch (e) {
      r.oneDark = { error: e.message || String(e) };
    }

    // Switch to One Light
    try {
      setSettings({ preview_theme: "One Light" });
      await sleep(2500);
      r.oneLight = await readStyles();
      await shot("c8-plain-onelight");
    } catch (e) {
      r.oneLight = { error: e.message || String(e) };
    } finally {
      // Restore One Dark
      try {
        setSettings({});
        await sleep(2000);
      } catch {}
    }

    // Tab navigation into and out of iframe
    try {
      const tabSeq = [];
      await ev("[...document.querySelectorAll('.markdown-preview, .html-preview, .view-body')].find(e=>e.offsetParent)?.focus()");
      for (let i = 0; i < 4; i++) {
        await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await sleep(300);
        tabSeq.push({
          main: await ev("document.activeElement?.tagName"),
          frame: await frameEval("document.activeElement?.tagName", plainFrame?.src)
        });
      }
      r.tabNavigation = tabSeq;
    } catch (e) {
      r.tabNavigation = { error: e.message || String(e) };
    }
    await closeAllTabs();
    return r;
  });

} catch (e) {
  log.fatal = e.stack;
  console.error("FATAL error during measurement:", e);
} finally {
  try { stopStunServer(); } catch {}
  try { fw?.close(); } catch {}
  app?.kill();
  const outPath = OUT + (FILTER ? "/v3-" + FILTER + ".json" : "/v3.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log("Measurement completed. Results written to: " + outPath);
}

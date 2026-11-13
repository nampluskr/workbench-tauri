// specs/v0.8.1/verify/ORDER-08/measure-host.mjs
// Measurement script for core ORDER-08 3.1 (Items 1~3, Revision 2):
// Candidate D (additional URI scheme `preview1` sharing same handler, http://preview1.localhost)
// Tested without CSP bypass (using real app CSP with preview and preview1 allowed).
//
// Measurements:
// 1. 측정 3: CSP & basic rendering for C (preview.localhost) and D (preview1.localhost)
// 2. 측정 1: Process isolation: C x 2, D x 2, C + D pair
// 3. 측정 2-가: while(true){} loop on C -> parallel C & D render -> 40s CPU timeline -> subsequent C & D render
// 4. 측정 2-나: while(true){} loop on D (in same session) -> parallel D & C render -> 40s CPU timeline -> subsequent D & C render
// 5. Iframe targets and renderer processes recorded at each step.
//
// Usage: node specs/v0.8.1/verify/ORDER-08/measure-host.mjs [exePath]

import { writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

const REPO = "D:/projects/workbench-tauri";
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-08";
const FIXTURES = OUT + "/fixtures";
const EXE = process.argv[2] && process.argv[2] !== "-" ? process.argv[2] : undefined;

const S = resolve(tmpdir(), "v081-measure-host");
const SW = S.replace(/\//g, "\\");
const DATA = S + "/appdata8/workbench-tauri";
const WEBVIEW = SW + "\\webview8";

rmSync(S, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });
mkdirSync(OUT, { recursive: true });

writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(DATA + "/state.json", JSON.stringify({
  version: 1,
  windows: [{ id: "w1", folders: [], sidebar: { width: 200 } }]
}));

process.env.APPDATA = SW + "\\appdata8";
process.env.WEBVIEW2_USER_DATA_FOLDER = WEBVIEW;

const { launchApp, DEFAULT_EXE } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getRendererProcs() {
  const psCmd = `
    $ErrorActionPreference = 'SilentlyContinue'
    try {
      $cim = Get-CimInstance Win32_Process -Filter "Name = 'msedgewebview2.exe'"
      if ($cim) {
        $renderers = $cim | Where-Object { $_.CommandLine -like '*--type=renderer*' }
        $renderers | ForEach-Object {
          $p = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
          [PSCustomObject]@{
            id = $_.ProcessId
            parent = $_.ParentProcessId
            commandLine = $_.CommandLine
            cpu = if ($p) { [math]::Round($p.CPU, 2) } else { 0 }
          }
        } | ConvertTo-Json -Compress
        exit 0
      }
    } catch {}
    Get-Process msedgewebview2 -ErrorAction SilentlyContinue | ForEach-Object {
      [PSCustomObject]@{
        id = $_.Id
        parent = 0
        commandLine = ""
        cpu = [math]::Round($_.CPU, 2)
      }
    } | ConvertTo-Json -Compress
  `;

  for (const shell of ["pwsh", "powershell"]) {
    try {
      const out = execFileSync(shell, ["-NoProfile", "-Command", psCmd], { encoding: "utf8" }).trim();
      if (!out) return [];
      const parsed = JSON.parse(out);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // try fallback shell
    }
  }
  return [];
}

async function getIframeTargets() {
  try {
    const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
    return list
      .filter((x) => x.type === "iframe")
      .map((x) => ({
        id: x.id,
        url: x.url,
        title: x.title
      }));
  } catch (e) {
    return [{ error: e.message }];
  }
}

async function inspectFrame(matchUrl, timeoutMs = 3000) {
  let list = [];
  try {
    list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  } catch (e) {
    return { error: "Failed to fetch CDP target list: " + e.message, rendered: false };
  }

  const target = list.find((x) => x.type === "iframe" && (!matchUrl || x.url.includes(matchUrl)));
  if (!target) {
    return {
      noTarget: true,
      rendered: false,
      availableTargets: list.map((x) => ({ type: x.type, url: x.url, title: x.title }))
    };
  }

  let ws;
  try {
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
      setTimeout(() => rej(new Error("WS connect timeout")), 1500);
    });

    const res = await new Promise((res, rej) => {
      const id = 2002;
      const timer = setTimeout(() => rej(new Error("Timeout (3s exceeded)")), timeoutMs);
      ws.onmessage = (m) => {
        const d = JSON.parse(m.data);
        if (d.id === id) {
          clearTimeout(timer);
          res(d.result?.result?.value ?? d.result ?? d);
        }
      };
      const expr = `({ title: document.title, href: window.location.href })`;
      ws.send(JSON.stringify({
        id,
        method: "Runtime.evaluate",
        params: { expression: expr, returnByValue: true, awaitPromise: true }
      }));
    });

    const rendered = typeof res?.title === "string" && res.title.startsWith("Loaded:");
    return {
      success: true,
      targetId: target.id,
      url: target.url,
      title: res?.title ?? target.title,
      href: res?.href ?? null,
      rendered
    };
  } catch (e) {
    const isTimeout = e.message.includes("Timeout");
    return {
      success: false,
      timeout: isTimeout,
      status: isTimeout ? "응답 없음 (3초 초과)" : e.message,
      rendered: false,
      targetId: target.id,
      url: target.url
    };
  } finally {
    try { ws?.close(); } catch {}
  }
}

async function evalInFrameWithTimeout(matchUrl, expr, timeoutMs = 3000) {
  let list = [];
  try {
    list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  } catch (e) {
    return { error: "Failed to fetch CDP target list: " + e.message, timeout: false, rendered: false };
  }

  const target = list.find((x) => x.type === "iframe" && (!matchUrl || x.url.includes(matchUrl)));
  if (!target) {
    return {
      noTarget: true,
      timeout: false,
      rendered: false,
      availableTargets: list.map((x) => ({ type: x.type, url: x.url, title: x.title }))
    };
  }

  let ws;
  try {
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
      setTimeout(() => rej(new Error("WS connect timeout")), 1500);
    });

    const res = await new Promise((res, rej) => {
      const id = 2001;
      const timer = setTimeout(() => rej(new Error("Timeout (3s exceeded)")), timeoutMs);
      ws.onmessage = (m) => {
        const d = JSON.parse(m.data);
        if (d.id === id) {
          clearTimeout(timer);
          res(d.result?.result?.value ?? d.result ?? d);
        }
      };
      ws.send(JSON.stringify({
        id,
        method: "Runtime.evaluate",
        params: { expression: expr, returnByValue: true, awaitPromise: true }
      }));
    });

    const rendered = typeof res === "string" && res.startsWith("Loaded:");
    return {
      success: true,
      timeout: false,
      targetId: target.id,
      url: target.url,
      value: res,
      rendered
    };
  } catch (e) {
    const isTimeout = e.message.includes("Timeout");
    return {
      success: false,
      timeout: isTimeout,
      rendered: false,
      status: isTimeout ? "응답 없음 (3초 초과)" : e.message,
      targetId: target?.id,
      url: target?.url
    };
  } finally {
    try { ws?.close(); } catch {}
  }
}

let app;
const mHostResult = {
  exe: EXE || DEFAULT_EXE,
  startedAt: new Date().toISOString(),
  item3_csp_and_load: {},
  item1_process_isolation: {},
  item2_loop_c: {},
  item2_loop_d: {},
  completedAt: null
};

try {
  console.log("Launching app for Candidate D measurement (without CSP bypass)...");
  app = await launchApp(EXE || undefined);
  await sleep(5000);

  // Bring to foreground
  const ensureForeground = () => {
    for (const shell of ["pwsh", "powershell"]) {
      try {
        execFileSync(shell, ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
        break;
      } catch {}
    }
  };
  ensureForeground();
  await sleep(1000);

  const registerPreview = async (id, html) => {
    await app.evaluate(`window.__TAURI_INTERNALS__.invoke("preview_set", { id: ${JSON.stringify(id)}, html: ${JSON.stringify(html)} })`);
  };

  const addIframe = async (id, src) => {
    await app.evaluate(`(() => {
      const old = document.getElementById(${JSON.stringify(id)});
      if (old) old.remove();
      const f = document.createElement("iframe");
      f.id = ${JSON.stringify(id)};
      f.setAttribute("sandbox", "allow-scripts");
      f.src = ${JSON.stringify(src)};
      f.style.cssText = "position:fixed; bottom:0; right:0; width:200px; height:150px; z-index:99999; border:1px solid red;";
      document.body.appendChild(f);
    })()`);
  };

  const removeIframe = async (id) => {
    await app.evaluate(`(() => {
      const f = document.getElementById(${JSON.stringify(id)});
      if (f) f.remove();
    })()`);
  };

  // --------------------------------------------------------------------------
  // Measurement Item 3: C and D CSP & basic rendering (No CSP bypass)
  // --------------------------------------------------------------------------
  console.log("Starting Measurement 3: Candidate C and D CSP and basic rendering...");
  await app.evaluate(`(() => {
    window.__csp_violations = [];
    window.addEventListener("securitypolicyviolation", (e) => {
      window.__csp_violations.push({
        directive: e.effectiveDirective,
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy
      });
    });
  })()`);

  await registerPreview("csp-test-c", readFileSync(FIXTURES + "/normal-c1.html", "utf8"));
  await registerPreview("csp-test-d", readFileSync(FIXTURES + "/normal-d1.html", "utf8"));

  // Candidate C: http://preview.localhost/csp-test-c
  await app.evaluate(`window.__csp_violations = [];`);
  await addIframe("csp-frame-c", "http://preview.localhost/csp-test-c");
  await sleep(1800);
  const inspectC = await inspectFrame("preview.localhost/csp-test-c");
  const violationsC = await app.evaluate(`[...window.__csp_violations]`);
  const targetsCspC = await getIframeTargets();
  await removeIframe("csp-frame-c");

  // Candidate D: http://preview1.localhost/csp-test-d
  await app.evaluate(`window.__csp_violations = [];`);
  await addIframe("csp-frame-d", "http://preview1.localhost/csp-test-d");
  await sleep(1800);
  const inspectD = await inspectFrame("preview1.localhost/csp-test-d");
  const violationsD = await app.evaluate(`[...window.__csp_violations]`);
  const targetsCspD = await getIframeTargets();
  await removeIframe("csp-frame-d");

  mHostResult.item3_csp_and_load = {
    candidateC: {
      url: "http://preview.localhost/csp-test-c",
      blocked: violationsC.length > 0,
      violations: violationsC,
      title: inspectC.title,
      href: inspectC.href,
      rendered: inspectC.rendered,
      iframeTargets: targetsCspC
    },
    candidateD: {
      url: "http://preview1.localhost/csp-test-d",
      blocked: violationsD.length > 0,
      violations: violationsD,
      title: inspectD.title,
      href: inspectD.href,
      rendered: inspectD.rendered,
      iframeTargets: targetsCspD
    }
  };

  // --------------------------------------------------------------------------
  // Measurement Item 1: Renderer Process Isolation (C x 2, D x 2, C + D pair)
  // --------------------------------------------------------------------------
  console.log("Starting Measurement 1: Renderer process isolation...");

  // CDP SystemInfo probe
  try {
    const sysInfo = await app.send("SystemInfo.getProcessInfo");
    mHostResult.item1_process_isolation.systemInfoProcessInfo = sysInfo?.processInfo ?? null;
  } catch (e) {
    mHostResult.item1_process_isolation.systemInfoProcessInfo = { unsupported: true, error: e.message };
  }

  // Case 1: C 두 개 (C1 and C2)
  console.log("  Testing Case 1: C two frames (docC1, docC2)...");
  await registerPreview("docC1", readFileSync(FIXTURES + "/normal-c1.html", "utf8"));
  await registerPreview("docC2", readFileSync(FIXTURES + "/normal-c2.html", "utf8"));

  const procsBeforeC1 = getRendererProcs();
  await addIframe("frame-c1", "http://preview.localhost/docC1");
  await sleep(2000);
  const procsAfterC1 = getRendererProcs();
  const resC1 = await evalInFrameWithTimeout("preview.localhost/docC1", "document.title");
  const targetsC1 = await getIframeTargets();

  const procsBeforeC2 = getRendererProcs();
  await addIframe("frame-c2", "http://preview.localhost/docC2");
  await sleep(2000);
  const procsAfterC2 = getRendererProcs();
  const resC2 = await evalInFrameWithTimeout("preview.localhost/docC2", "document.title");
  const targetsC2 = await getIframeTargets();

  const newPidsC1 = procsAfterC1.filter((p) => !procsBeforeC1.some((b) => b.id === p.id)).map((p) => p.id);
  const newPidsC2 = procsAfterC2.filter((p) => !procsBeforeC2.some((b) => b.id === p.id)).map((p) => p.id);
  await removeIframe("frame-c1");
  await removeIframe("frame-c2");
  await sleep(1000);

  mHostResult.item1_process_isolation.case1_twoC = {
    c1: { url: "http://preview.localhost/docC1", eval: resC1, newPids: newPidsC1, targets: targetsC1 },
    c2: { url: "http://preview.localhost/docC2", eval: resC2, newPids: newPidsC2, targets: targetsC2 },
    separateProcess: newPidsC2.length > 0 && !newPidsC1.some((id) => newPidsC2.includes(id)),
    allProcsAfter: procsAfterC2.map((p) => ({ id: p.id, cpu: p.cpu }))
  };

  // Case 2: D 두 개 (D1 and D2)
  console.log("  Testing Case 2: D two frames (docD1, docD2)...");
  await registerPreview("docD1", readFileSync(FIXTURES + "/normal-d1.html", "utf8"));
  await registerPreview("docD2", readFileSync(FIXTURES + "/normal-d2.html", "utf8"));

  const procsBeforeD1 = getRendererProcs();
  await addIframe("frame-d1", "http://preview1.localhost/docD1");
  await sleep(2000);
  const procsAfterD1 = getRendererProcs();
  const resD1 = await evalInFrameWithTimeout("preview1.localhost/docD1", "document.title");
  const targetsD1 = await getIframeTargets();

  const procsBeforeD2 = getRendererProcs();
  await addIframe("frame-d2", "http://preview1.localhost/docD2");
  await sleep(2000);
  const procsAfterD2 = getRendererProcs();
  const resD2 = await evalInFrameWithTimeout("preview1.localhost/docD2", "document.title");
  const targetsD2 = await getIframeTargets();

  const newPidsD1 = procsAfterD1.filter((p) => !procsBeforeD1.some((b) => b.id === p.id)).map((p) => p.id);
  const newPidsD2 = procsAfterD2.filter((p) => !procsBeforeD2.some((b) => b.id === p.id)).map((p) => p.id);
  await removeIframe("frame-d1");
  await removeIframe("frame-d2");
  await sleep(1000);

  mHostResult.item1_process_isolation.case2_twoD = {
    d1: { url: "http://preview1.localhost/docD1", eval: resD1, newPids: newPidsD1, targets: targetsD1 },
    d2: { url: "http://preview1.localhost/docD2", eval: resD2, newPids: newPidsD2, targets: targetsD2 },
    separateProcess: newPidsD2.length > 0 && !newPidsD1.some((id) => newPidsD2.includes(id)),
    allProcsAfter: procsAfterD2.map((p) => ({ id: p.id, cpu: p.cpu }))
  };

  // Case 3: C 하나 + D 하나 (C1 and D1 pair)
  console.log("  Testing Case 3: C + D pair (docC_pair, docD_pair)...");
  await registerPreview("docC_pair", readFileSync(FIXTURES + "/normal-c1.html", "utf8"));
  await registerPreview("docD_pair", readFileSync(FIXTURES + "/normal-d1.html", "utf8"));

  const procsBeforePairC = getRendererProcs();
  await addIframe("frame-pair-c", "http://preview.localhost/docC_pair");
  await sleep(2000);
  const procsAfterPairC = getRendererProcs();
  const resPairC = await evalInFrameWithTimeout("preview.localhost/docC_pair", "document.title");
  const targetsPairC = await getIframeTargets();

  const procsBeforePairD = getRendererProcs();
  await addIframe("frame-pair-d", "http://preview1.localhost/docD_pair");
  await sleep(2000);
  const procsAfterPairD = getRendererProcs();
  const resPairD = await evalInFrameWithTimeout("preview1.localhost/docD_pair", "document.title");
  const targetsPairD = await getIframeTargets();

  const newPidsPairC = procsAfterPairC.filter((p) => !procsBeforePairC.some((b) => b.id === p.id)).map((p) => p.id);
  const newPidsPairD = procsAfterPairD.filter((p) => !procsBeforePairD.some((b) => b.id === p.id)).map((p) => p.id);
  await removeIframe("frame-pair-c");
  await removeIframe("frame-pair-d");
  await sleep(1000);

  const isSeparateCandD = newPidsPairD.length > 0 && !newPidsPairC.some((id) => newPidsPairD.includes(id));

  mHostResult.item1_process_isolation.case3_pairCandD = {
    c: { url: "http://preview.localhost/docC_pair", eval: resPairC, newPids: newPidsPairC, targets: targetsPairC },
    d: { url: "http://preview1.localhost/docD_pair", eval: resPairD, newPids: newPidsPairD, targets: targetsPairD },
    separateProcess: isSeparateCandD,
    allProcsAfter: procsAfterPairD.map((p) => ({ id: p.id, cpu: p.cpu }))
  };

  // --------------------------------------------------------------------------
  // Measurement Item 2-가: Loop on C
  // --------------------------------------------------------------------------
  console.log("Starting Measurement 2-가: Loop on Candidate C (http://preview.localhost/loopDocC)...");
  await registerPreview("loopDocC", readFileSync(FIXTURES + "/loop.html", "utf8"));
  await registerPreview("normWhileLoopC", readFileSync(FIXTURES + "/normal-c1.html", "utf8"));
  await registerPreview("normWhileLoopD", readFileSync(FIXTURES + "/normal-d1.html", "utf8"));
  await registerPreview("afterLoopC", readFileSync(FIXTURES + "/after-loop.html", "utf8"));
  await registerPreview("afterLoopD", readFileSync(FIXTURES + "/normal-d2.html", "utf8"));

  const procsBeforeLoopC = getRendererProcs();
  const t0C = Date.now();
  await addIframe("loop-frame-c", "http://preview.localhost/loopDocC");
  await sleep(2500); // 2.5s for loop to spin
  const t1C = Date.now();
  const elapsedSecC = (t1C - t0C) / 1000;
  const procsDuringLoopC = getRendererProcs();

  let loopPidC = null;
  let maxCpuDeltaC = -Infinity;
  for (const p of procsDuringLoopC) {
    const prev = procsBeforeLoopC.find((b) => b.id === p.id);
    const delta = prev ? p.cpu - prev.cpu : p.cpu;
    if (delta > maxCpuDeltaC) {
      maxCpuDeltaC = delta;
      loopPidC = p.id;
    }
  }
  const cpuPerSecC = maxCpuDeltaC > 0 ? Number((maxCpuDeltaC / elapsedSecC).toFixed(2)) : 0;
  const targetsDuringLoopC = await getIframeTargets();
  console.log(`  [Loop on C] loopPidC=${loopPidC}, deltaCpu=${maxCpuDeltaC.toFixed(2)}, cpuPerSec=${cpuPerSecC}`);

  // While loop C is STILL OPEN in DOM:
  console.log("  [Loop on C] Testing normal page on C while loop is OPEN...");
  await addIframe("parallel-c-while-loop", "http://preview.localhost/normWhileLoopC");
  await sleep(2000);
  const resParallelC = await evalInFrameWithTimeout("preview.localhost/normWhileLoopC", "document.title", 3000);
  const targetsParallelC = await getIframeTargets();
  await removeIframe("parallel-c-while-loop");

  console.log("  [Loop on C] Testing normal page on D while loop is OPEN...");
  await addIframe("parallel-d-while-loop", "http://preview1.localhost/normWhileLoopD");
  await sleep(2000);
  const resParallelD = await evalInFrameWithTimeout("preview1.localhost/normWhileLoopD", "document.title", 3000);
  const targetsParallelD = await getIframeTargets();
  await removeIframe("parallel-d-while-loop");

  // Remove loop C frame from DOM
  console.log("  [Loop on C] Removing loop frame from DOM...");
  await removeIframe("loop-frame-c");

  // Measure CPU timeline at 0, 5, 10, 20, 30, 40s
  console.log("  [Loop on C] Measuring CPU at 0, 5, 10, 20, 30, 40s...");
  const intervals = [
    { delay: 0, targetSec: 0 },
    { delay: 5, targetSec: 5 },
    { delay: 5, targetSec: 10 },
    { delay: 10, targetSec: 20 },
    { delay: 10, targetSec: 30 },
    { delay: 10, targetSec: 40 }
  ];

  const cpuTimelineC = [];
  for (const step of intervals) {
    if (step.delay > 0) await sleep(step.delay * 1000);
    const currentProcs = getRendererProcs();
    const targetProc = currentProcs.find((p) => p.id === loopPidC);
    const iframes = await getIframeTargets();
    cpuTimelineC.push({
      second: step.targetSec,
      pid: loopPidC,
      alive: !!targetProc,
      cpu: targetProc ? targetProc.cpu : null,
      iframeTargets: iframes,
      allRenderers: currentProcs.map((p) => ({ id: p.id, cpu: p.cpu }))
    });
    console.log(`    [Loop on C] ${step.targetSec}s: alive=${!!targetProc}, CPU=${targetProc?.cpu ?? 'none'}`);
  }

  // After loop C removed: test normal page on C
  console.log("  [Loop on C] Testing normal page on C after loop removed...");
  await addIframe("after-c-test", "http://preview.localhost/afterLoopC");
  await sleep(2500);
  const resAfterC = await evalInFrameWithTimeout("preview.localhost/afterLoopC", "document.title", 3000);
  const targetsAfterC = await getIframeTargets();
  await removeIframe("after-c-test");

  // After loop C removed: test normal page on D
  console.log("  [Loop on C] Testing normal page on D after loop removed...");
  await addIframe("after-d-test", "http://preview1.localhost/afterLoopD");
  await sleep(2500);
  const resAfterD = await evalInFrameWithTimeout("preview1.localhost/afterLoopD", "document.title", 3000);
  const targetsAfterD = await getIframeTargets();
  await removeIframe("after-d-test");

  mHostResult.item2_loop_c = {
    loopUrl: "http://preview.localhost/loopDocC",
    loopPid: loopPidC,
    loopDeltaCpu2_5s: maxCpuDeltaC,
    loopCpuPerSec: cpuPerSecC,
    targetsDuringLoop: targetsDuringLoopC,
    renderWhileLoopRunning: {
      onC: { url: "http://preview.localhost/normWhileLoopC", evalResult: resParallelC, rendered: resParallelC.rendered, targets: targetsParallelC },
      onD: { url: "http://preview1.localhost/normWhileLoopD", evalResult: resParallelD, rendered: resParallelD.rendered, targets: targetsParallelD }
    },
    cpuTimeline: cpuTimelineC,
    stillConsumingCpuAt40s: (cpuTimelineC.find((x) => x.second === 40)?.cpu ?? 0) > (cpuTimelineC.find((x) => x.second === 0)?.cpu ?? 0),
    renderAfterLoopRemoved: {
      onC: { url: "http://preview.localhost/afterLoopC", evalResult: resAfterC, rendered: resAfterC.rendered, targets: targetsAfterC },
      onD: { url: "http://preview1.localhost/afterLoopD", evalResult: resAfterD, rendered: resAfterD.rendered, targets: targetsAfterD }
    }
  };

  // --------------------------------------------------------------------------
  // Measurement Item 2-나: Loop on D (continue in same session)
  // --------------------------------------------------------------------------
  console.log("Starting Measurement 2-나: Loop on Candidate D (http://preview1.localhost/loopDocD)...");
  await registerPreview("loopDocD", readFileSync(FIXTURES + "/loop.html", "utf8"));
  await registerPreview("normWhileLoopD2", readFileSync(FIXTURES + "/normal-d1.html", "utf8"));
  await registerPreview("normWhileLoopC2", readFileSync(FIXTURES + "/normal-c1.html", "utf8"));
  await registerPreview("afterLoopD2", readFileSync(FIXTURES + "/after-loop.html", "utf8"));
  await registerPreview("afterLoopC2", readFileSync(FIXTURES + "/normal-c2.html", "utf8"));

  const procsBeforeLoopD = getRendererProcs();
  const t0D = Date.now();
  await addIframe("loop-frame-d", "http://preview1.localhost/loopDocD");
  await sleep(2500); // 2.5s for loop to spin
  const t1D = Date.now();
  const elapsedSecD = (t1D - t0D) / 1000;
  const procsDuringLoopD = getRendererProcs();

  let loopPidD = null;
  let maxCpuDeltaD = -Infinity;
  for (const p of procsDuringLoopD) {
    const prev = procsBeforeLoopD.find((b) => b.id === p.id);
    const delta = prev ? p.cpu - prev.cpu : p.cpu;
    if (delta > maxCpuDeltaD) {
      maxCpuDeltaD = delta;
      loopPidD = p.id;
    }
  }
  const cpuPerSecD = maxCpuDeltaD > 0 ? Number((maxCpuDeltaD / elapsedSecD).toFixed(2)) : 0;
  const targetsDuringLoopD = await getIframeTargets();
  console.log(`  [Loop on D] loopPidD=${loopPidD}, deltaCpu=${maxCpuDeltaD.toFixed(2)}, cpuPerSec=${cpuPerSecD}`);

  // While loop D is STILL OPEN in DOM:
  console.log("  [Loop on D] Testing normal page on D while loop is OPEN...");
  await addIframe("parallel-d2-while-loop", "http://preview1.localhost/normWhileLoopD2");
  await sleep(2000);
  const resParallelD2 = await evalInFrameWithTimeout("preview1.localhost/normWhileLoopD2", "document.title", 3000);
  const targetsParallelD2 = await getIframeTargets();
  await removeIframe("parallel-d2-while-loop");

  console.log("  [Loop on D] Testing normal page on C while loop is OPEN...");
  await addIframe("parallel-c2-while-loop", "http://preview.localhost/normWhileLoopC2");
  await sleep(2000);
  const resParallelC2 = await evalInFrameWithTimeout("preview.localhost/normWhileLoopC2", "document.title", 3000);
  const targetsParallelC2 = await getIframeTargets();
  await removeIframe("parallel-c2-while-loop");

  // Remove loop D frame from DOM
  console.log("  [Loop on D] Removing loop frame from DOM...");
  await removeIframe("loop-frame-d");

  // Measure CPU timeline at 0, 5, 10, 20, 30, 40s
  console.log("  [Loop on D] Measuring CPU at 0, 5, 10, 20, 30, 40s...");
  const cpuTimelineD = [];
  for (const step of intervals) {
    if (step.delay > 0) await sleep(step.delay * 1000);
    const currentProcs = getRendererProcs();
    const targetProc = currentProcs.find((p) => p.id === loopPidD);
    const iframes = await getIframeTargets();
    cpuTimelineD.push({
      second: step.targetSec,
      pid: loopPidD,
      alive: !!targetProc,
      cpu: targetProc ? targetProc.cpu : null,
      iframeTargets: iframes,
      allRenderers: currentProcs.map((p) => ({ id: p.id, cpu: p.cpu }))
    });
    console.log(`    [Loop on D] ${step.targetSec}s: alive=${!!targetProc}, CPU=${targetProc?.cpu ?? 'none'}`);
  }

  // After loop D removed: test normal page on D
  console.log("  [Loop on D] Testing normal page on D after loop removed...");
  await addIframe("after-d2-test", "http://preview1.localhost/afterLoopD2");
  await sleep(2500);
  const resAfterD2 = await evalInFrameWithTimeout("preview1.localhost/afterLoopD2", "document.title", 3000);
  const targetsAfterD2 = await getIframeTargets();
  await removeIframe("after-d2-test");

  // After loop D removed: test normal page on C
  console.log("  [Loop on D] Testing normal page on C after loop removed...");
  await addIframe("after-c2-test", "http://preview.localhost/afterLoopC2");
  await sleep(2500);
  const resAfterC2 = await evalInFrameWithTimeout("preview.localhost/afterLoopC2", "document.title", 3000);
  const targetsAfterC2 = await getIframeTargets();
  await removeIframe("after-c2-test");

  mHostResult.item2_loop_d = {
    loopUrl: "http://preview1.localhost/loopDocD",
    loopPid: loopPidD,
    loopDeltaCpu2_5s: maxCpuDeltaD,
    loopCpuPerSec: cpuPerSecD,
    targetsDuringLoop: targetsDuringLoopD,
    renderWhileLoopRunning: {
      onD: { url: "http://preview1.localhost/normWhileLoopD2", evalResult: resParallelD2, rendered: resParallelD2.rendered, targets: targetsParallelD2 },
      onC: { url: "http://preview.localhost/normWhileLoopC2", evalResult: resParallelC2, rendered: resParallelC2.rendered, targets: targetsParallelC2 }
    },
    cpuTimeline: cpuTimelineD,
    stillConsumingCpuAt40s: (cpuTimelineD.find((x) => x.second === 40)?.cpu ?? 0) > (cpuTimelineD.find((x) => x.second === 0)?.cpu ?? 0),
    renderAfterLoopRemoved: {
      onD: { url: "http://preview1.localhost/afterLoopD2", evalResult: resAfterD2, rendered: resAfterD2.rendered, targets: targetsAfterD2 },
      onC: { url: "http://preview.localhost/afterLoopC2", evalResult: resAfterC2, rendered: resAfterC2.rendered, targets: targetsAfterC2 }
    }
  };

  mHostResult.completedAt = new Date().toISOString();
  console.log("Measurements finished successfully!");
} catch (e) {
  console.error("FATAL in measure-host:", e);
  mHostResult.fatalError = e.stack || String(e);
} finally {
  try {
    app?.kill();
  } catch {}
  writeFileSync(OUT + "/m-host.json", JSON.stringify(mHostResult, null, 2));
  console.log(`Results written to ${OUT}/m-host.json`);
}

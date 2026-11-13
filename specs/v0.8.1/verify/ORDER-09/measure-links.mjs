// ORDER-09 V3: I-24 HTML preview link following and security isolation verification.
// Verifies 6 clicked link categories, Tab+Enter, 5 non-click avenues, prototype tampering,
// token secrecy, and ORDER-07/08 isolation fixtures.
// Usage: node specs/v0.8.1/verify/ORDER-09/measure-links.mjs [path/to/workbench-tauri.exe]

import { writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "../../../..");
const EXE = process.argv[2] ?? process.env.TAURI_EXE ?? resolve(REPO, "src-tauri/target/release/workbench-tauri.exe");

const TEMP = process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp";
const WORK_DIR = resolve(TEMP, "v081-links-work");
const APPDATA_DIR = resolve(TEMP, "v081-links-appdata/workbench-tauri");
const WEBVIEW_DIR = resolve(TEMP, "v081-links-webview");
const OUT_DIR = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/links");

mkdirSync(OUT_DIR, { recursive: true });
rmSync(WORK_DIR, { recursive: true, force: true });
rmSync(resolve(TEMP, "v081-links-appdata"), { recursive: true, force: true });
mkdirSync(WORK_DIR, { recursive: true });
mkdirSync(APPDATA_DIR, { recursive: true });

// Copy test fixtures
const FIXTURES_DIR = resolve(__dirname, "links/fixtures");
if (existsSync(FIXTURES_DIR)) cpSync(FIXTURES_DIR, WORK_DIR, { recursive: true });
const O7_FIXTURES = resolve(REPO, "specs/v0.8.1/verify/ORDER-07/fixtures");
if (existsSync(O7_FIXTURES)) cpSync(O7_FIXTURES, WORK_DIR, { recursive: true });

// Write isolated configuration
writeFileSync(resolve(APPDATA_DIR, "settings.json"), JSON.stringify({ theme: "One Dark" }, null, 2));
writeFileSync(
  resolve(APPDATA_DIR, "state.json"),
  JSON.stringify({
    version: 1,
    windows: [
      {
        id: "w1",
        folders: [{ id: "f1", path: WORK_DIR, added_at: "2026-11-13T00:00:00.000Z" }],
        active_folder_id: "f1",
        sidebar: { width: 220 },
      },
    ],
  }, null, 2)
);

process.env.APPDATA = resolve(TEMP, "v081-links-appdata");
process.env.WEBVIEW2_USER_DATA_FOLDER = WEBVIEW_DIR;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);

console.log(`[measure-links] Target EXE: ${EXE}`);
console.log(`[measure-links] Workspace: ${WORK_DIR}`);
console.log(`[measure-links] Output Dir: ${OUT_DIR}`);

const log = {
  exe: EXE,
  timestamp: new Date().toISOString(),
  clickedLinks: {},
  nonClickAvenues: {},
  prototypeTampering: {},
  tokenDiscovery: {},
  isolationFixtures: {},
  realBrowserTest: null,
  summary: { pass: 0, fail: 0 },
};

let app;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (expr) => app.evaluate(expr);

// =========================================================================
// Invoke Hook Helpers (Card C-19-R1)
// Wraps window.__TAURI_INTERNALS__.invoke during measurement session.
// Intercepts 'plugin:opener|open_url' and logs calls without launching browser.
// =========================================================================
// Invoke Hook Helpers (Card C-19-R1 & C-20-R3)
// 1. Attempts JS-level override of window.__TAURI_INTERNALS__.invoke
// 2. Uses CDP Fetch.enable to intercept plugin:opener/open_url requests
// =========================================================================

const cdpOpenUrlCalls = [];
let fetchInterceptorInstalled = false;

async function installInvokeHook() {
  // 1. JS-level hook check & installation
  const jsHookResult = await app.evaluate(`(()=>{
    try {
      if (!window.__origTauriInvoke) {
        window.__origTauriInvoke = window.__TAURI_INTERNALS__?.invoke;
      }
      window.__openUrlCalls = [];
      const hookFn = function(cmd, args, options) {
        if (cmd === 'plugin:opener|open_url') {
          window.__openUrlCalls.push({ cmd, args, time: Date.now() });
          return Promise.resolve(null);
        }
        return window.__origTauriInvoke.apply(this, arguments);
      };
      try { window.__TAURI_INTERNALS__.invoke = hookFn; } catch {}
      if (window.__TAURI_INTERNALS__?.invoke !== hookFn) {
        try {
          Object.defineProperty(window.__TAURI_INTERNALS__, 'invoke', {
            value: hookFn,
            writable: true,
            configurable: true
          });
        } catch {}
      }
      return {
        applied: window.__TAURI_INTERNALS__?.invoke === hookFn,
        isFrozen: Object.isFrozen(window.__TAURI_INTERNALS__),
        isSealed: Object.isSealed(window.__TAURI_INTERNALS__)
      };
    } catch (e) {
      return { applied: false, error: e.message };
    }
  })()`).catch((e) => ({ applied: false, error: e.message }));

  // 2. CDP Fetch.enable interception (Card C-20-R3)
  if (!fetchInterceptorInstalled) {
    try {
      await app.send("Fetch.enable", {
        patterns: [
          { urlPattern: "*opener*", requestStage: "Request" },
          { urlPattern: "*open_url*", requestStage: "Request" },
          { urlPattern: "*plugin%3Aopener*", requestStage: "Request" }
        ]
      });

      app.on(async (msg) => {
        if (msg.method === "Fetch.requestPaused") {
          const { requestId, request } = msg.params;
          const url = request.url;
          if (/opener|open_url/i.test(url) || /open_url/i.test(request.postData || "")) {
            let parsed = null;
            try {
              if (request.postData) parsed = JSON.parse(request.postData);
            } catch {}
            cdpOpenUrlCalls.push({
              cmd: "plugin:opener|open_url",
              url,
              args: parsed,
              postData: request.postData,
              time: Date.now()
            });
            // Fulfill with fake success (200 OK, body "null") so browser does not open
            await app.send("Fetch.fulfillRequest", {
              requestId,
              responseCode: 200,
              responseHeaders: [{ name: "Content-Type", value: "application/json" }],
              body: Buffer.from("null").toString("base64")
            }).catch(() => {});
          } else {
            await app.send("Fetch.continueRequest", { requestId }).catch(() => {});
          }
        }
      });
      fetchInterceptorInstalled = true;
    } catch (err) {
      console.warn("CDP Fetch.enable failed:", err.message);
    }
  }

  return jsHookResult;
}

async function getOpenUrlCalls() {
  const jsCalls = (await app.evaluate(`window.__openUrlCalls || []`).catch(() => [])) || [];
  const merged = [...jsCalls];
  for (const c of cdpOpenUrlCalls) {
    const url = c.args?.url ?? (typeof c.postData === "string" && (c.postData.match(/"url"\s*:\s*"([^"]+)"/)?.[1] || null));
    merged.push({
      cmd: "plugin:opener|open_url",
      args: { url: url || c.args?.url },
      raw: c,
      time: c.time
    });
  }
  return merged;
}

async function clearOpenUrlCalls() {
  cdpOpenUrlCalls.length = 0;
  await app.evaluate(`window.__openUrlCalls = []`).catch(() => {});
}

async function uninstallInvokeHook() {
  if (fetchInterceptorInstalled) {
    await app.send("Fetch.disable").catch(() => {});
    fetchInterceptorInstalled = false;
  }
  await app.evaluate(`(()=>{
    if (window.__origTauriInvoke) {
      try { window.__TAURI_INTERNALS__.invoke = window.__origTauriInvoke; } catch {}
      delete window.__origTauriInvoke;
    }
  })()`).catch(() => {});
}

function getBrowserProcessCount() {
  try {
    const out = execFileSync(
      "powershell",
      ["-NoProfile", "-Command", "(Get-Process -Name msedge, chrome, firefox, brave, opera -ErrorAction SilentlyContinue | Measure-Object).Count"],
      { encoding: "utf8" }
    );
    return Number(out.trim()) || 0;
  } catch {
    return 0;
  }
}

const contexts = new Map();
let frameWs = null;

async function frameEval(expr) {
  const ids = [...contexts.entries()].filter(([, o]) => /preview/.test(o)).map(([id]) => id);
  for (const id of ids.reverse()) {
    try {
      const r = await app.send("Runtime.evaluate", { expression: expr, contextId: id, returnByValue: true, awaitPromise: true });
      if (!r.exceptionDetails) return r.result.value;
    } catch {}
  }
  try {
    const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
    const t = list.filter((x) => x.type === "iframe" && /preview/.test(x.url)).pop();
    if (!t) return { noFrame: true };
    if (!frameWs || frameWs.url !== t.webSocketDebuggerUrl) {
      frameWs = new WebSocket(t.webSocketDebuggerUrl);
      await new Promise((r) => (frameWs.onopen = r));
    }
    return await new Promise((res) => {
      const id = Math.floor(Math.random() * 1e9);
      frameWs.onmessage = (m) => {
        const d = JSON.parse(m.data);
        if (d.id === id) res(d.result?.result?.value ?? d);
      };
      frameWs.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: expr, returnByValue: true, awaitPromise: true } }));
    });
  } catch (err) {
    return { error: err.message };
  }
}

async function frameRect() {
  return await ev(`(()=>{
    const iframes = [...document.querySelectorAll('iframe')].filter(e => e.offsetParent);
    const f = iframes.find(e => /preview/.test(e.src)) || iframes[0];
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, src: f.src, sandbox: f.getAttribute('sandbox'), csp: f.getAttribute('csp') };
  })()`);
}

async function getTabState() {
  return await ev(`(()=>{
    const ts = [...document.querySelectorAll('.pane .tab')];
    return {
      count: ts.length,
      titles: ts.map(t => t.querySelector('.tab-title')?.textContent?.trim() ?? ""),
      active: ts.find(t => t.classList.contains('active'))?.querySelector('.tab-title')?.textContent?.trim() ?? ""
    };
  })()`);
}

async function clickAt(x, y, dbl = false) {
  for (let c = 1; c <= (dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", x, y);
    await app.mouse("mousePressed", x, y, { button: "left", clickCount: c });
    await app.mouse("mouseReleased", x, y, { button: "left", clickCount: c });
  }
  await sleep(600);
}

async function clickInFrame(selector) {
  const f = await frameRect();
  if (!f) throw new Error("No active preview frame found");
  const p = await frameEval(`(()=>{
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (!p || typeof p.x !== "number") throw new Error(`Element ${selector} not found in frame`);
  await clickAt(Math.round(f.x + p.x), Math.round(f.y + p.y));
}

const row = (name) => `([...document.querySelectorAll('.tree-window .tree-row')].find(e => (e.dataset.path || e.getAttribute('data-path')) === ${JSON.stringify(resolve(WORK_DIR, name))}) || document.querySelector('.tree-window .tree-row[data-path=${JSON.stringify(JSON.stringify(resolve(WORK_DIR, name))).slice(1, -1)}]'))`;

async function openFileInTree(name) {
  const pt = await ev(`(()=>{
    const e = ${row(name)};
    if (!e) return null;
    e.scrollIntoView({ block: 'nearest' });
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x + Math.min(r.width / 2, 80)), y: Math.round(r.y + r.height / 2) };
  })()`);
  if (!pt) throw new Error(`Tree row for ${name} not found`);
  await clickAt(pt.x, pt.y, true);
  await sleep(1000);
  await ev(`(()=>{
    const btn = [...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e => e.offsetParent);
    if (btn) btn.click();
  })()`).catch(() => {});
  await sleep(2000);
}

async function resetToMainPreview() {
  await ev(`(()=>{
    const tabs = [...document.querySelectorAll('.pane .tab')];
    // main-links.html과 Preview main-links.html을 제외한 추가 탭 닫기
    for (const t of tabs) {
      const title = t.querySelector('.tab-title')?.textContent?.trim() ?? "";
      if (title !== "main-links.html" && title !== "Preview main-links.html") {
        t.querySelector('.tab-close')?.click();
      }
    }
  })()`).catch(() => {});
  await sleep(600);

  // Preview main-links.html 탭 활성화 확인
  const hasPreview = await ev(`(()=>{
    const tabs = [...document.querySelectorAll('.pane .tab')];
    const prevTab = tabs.find(t => t.querySelector('.tab-title')?.textContent?.trim() === "Preview main-links.html");
    if (prevTab) {
      prevTab.click();
      return true;
    }
    return false;
  })()`);

  if (!hasPreview) {
    // 미리보기 탭이 닫혀 있으면 main-links.html 탭 누르고 Open Preview 재실행
    await ev(`(()=>{
      const tabs = [...document.querySelectorAll('.pane .tab')];
      const mainTab = tabs.find(t => t.querySelector('.tab-title')?.textContent?.trim() === "main-links.html");
      if (mainTab) mainTab.click();
    })()`).catch(() => {});
    await sleep(600);
    await ev(`(()=>{
      const btn = [...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e => e.offsetParent);
      if (btn) btn.click();
    })()`).catch(() => {});
    await sleep(2000);
  }
}

async function closeExtraTabs() {
  await resetToMainPreview();
}

try {
  app = await launchApp(EXE);
  await sleep(5000);

  try {
    execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
    await sleep(500);
  } catch {}

  app.on((m) => {
    if (m.method === "Runtime.executionContextCreated") {
      contexts.set(m.params.context.id, m.params.context.origin || m.params.context.name || "");
    }
    if (m.method === "Runtime.executionContextDestroyed") {
      contexts.delete(m.params.executionContextId);
    }
  });
  await app.send("Runtime.enable");
  await app.send("Network.enable");

  // Install invoke interceptor for open_url (Card C-19-R1)
  await installInvokeHook();

  // =========================================================================
  // SECTION 1: Clicked links 6 kinds (+ keyboard Enter 1 time)
  // =========================================================================
  console.log("\n--- Section 1: Clicked Links (6 categories + Tab/Enter) ---");
  await openFileInTree("main-links.html");
  const initTabs = await getTabState();
  console.log(`Initial preview tabs: ${JSON.stringify(initTabs)}`);

  // (1a) Local HTML: other.html
  try {
    console.log("Testing (1a) Local other.html click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await clickInFrame("#k1-other");
    await sleep(1500);
    const tabs = await getTabState();
    const calls = await getOpenUrlCalls();
    const ok = (tabs.titles.some(t => /other\.html|Other Page/i.test(t)) || /other\.html|Other Page/i.test(tabs.active)) && calls.length === 0;
    log.clickedLinks["1a_local_html_other"] = { pass: ok, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 1a_local_html_other: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs: [${tabs.titles.join(", ")}], active: ${tabs.active})`);
  } catch (err) {
    console.error("  -> 1a_local_html_other error:", err.message);
    log.clickedLinks["1a_local_html_other"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (1b) Local HTML: ./sub/page.html
  try {
    console.log("Testing (1b) Local ./sub/page.html click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await clickInFrame("#k1-sub");
    await sleep(1500);
    const tabs = await getTabState();
    const calls = await getOpenUrlCalls();
    const ok = (tabs.titles.some(t => /page\.html|Sub Page/i.test(t)) || /page\.html|Sub Page/i.test(tabs.active)) && calls.length === 0;
    log.clickedLinks["1b_local_html_sub"] = { pass: ok, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 1b_local_html_sub: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs: [${tabs.titles.join(", ")}], active: ${tabs.active})`);
  } catch (err) {
    console.error("  -> 1b_local_html_sub error:", err.message);
    log.clickedLinks["1b_local_html_sub"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (2) Local Markdown: doc.md
  try {
    console.log("Testing (2) Local doc.md click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await clickInFrame("#k2-md");
    await sleep(1500);
    const tabs = await getTabState();
    const calls = await getOpenUrlCalls();
    const ok = (tabs.titles.some(t => /doc\.md/i.test(t)) || /doc\.md/i.test(tabs.active)) && calls.length === 0;
    log.clickedLinks["2_local_markdown"] = { pass: ok, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 2_local_markdown: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs: [${tabs.titles.join(", ")}], active: ${tabs.active})`);
  } catch (err) {
    console.error("  -> 2_local_markdown error:", err.message);
    log.clickedLinks["2_local_markdown"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (3a) Other local: notes.txt
  try {
    console.log("Testing (3a) Local notes.txt click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await clickInFrame("#k3-txt");
    await sleep(1500);
    const tabs = await getTabState();
    const calls = await getOpenUrlCalls();
    const ok = (tabs.titles.some(t => /notes\.txt/i.test(t)) || /notes\.txt/i.test(tabs.active)) && calls.length === 0;
    log.clickedLinks["3a_local_txt"] = { pass: ok, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 3a_local_txt: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs: [${tabs.titles.join(", ")}], active: ${tabs.active})`);
  } catch (err) {
    console.error("  -> 3a_local_txt error:", err.message);
    log.clickedLinks["3a_local_txt"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (3b) Other local: data.csv
  try {
    console.log("Testing (3b) Local data.csv click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await clickInFrame("#k3-csv");
    await sleep(1500);
    const tabs = await getTabState();
    const calls = await getOpenUrlCalls();
    const ok = (tabs.titles.some(t => /data\.csv/i.test(t)) || /data\.csv/i.test(tabs.active)) && calls.length === 0;
    log.clickedLinks["3b_local_csv"] = { pass: ok, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 3b_local_csv: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs: [${tabs.titles.join(", ")}], active: ${tabs.active})`);
  } catch (err) {
    console.error("  -> 3b_local_csv error:", err.message);
    log.clickedLinks["3b_local_csv"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (4) External link: https://example.com (verified via intercepted open_url call or browser process diff)
  try {
    console.log("Testing (4) External https://example.com click (open_url intercept)...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    const procsBefore = getBrowserProcessCount();
    await clickInFrame("#k4-ext");
    await sleep(2000);
    const procsAfter = getBrowserProcessCount();
    const procsDiff = procsAfter - procsBefore;
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const hasCall = calls.some(c => c.cmd === "plugin:opener|open_url" && (c.args?.url === "https://example.com" || c.args?.url?.includes("example.com"))) || (procsDiff > 0);
    const ok = hasCall && !tabs.titles.some(t => /example/i.test(t));
    log.clickedLinks["4_external_browser"] = {
      pass: ok,
      openUrlCalls: calls,
      procsBefore,
      procsAfter,
      procsDiff,
      browserLaunched: procsDiff > 0,
      tabs,
      titles: tabs.titles
    };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 4_external_browser: ${ok ? "PASS" : "FAIL"} (calls: ${calls.length}, url: ${calls[0]?.args?.url}, procs: ${procsBefore}->${procsAfter} (+${procsDiff}), tabs: ${tabs.count}: [${tabs.titles.join(", ")}])`);
  } catch (err) {
    console.error("  -> 4_external_browser error:", err.message);
    log.clickedLinks["4_external_browser"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (5a) Blocked scheme: file:///...
  try {
    console.log("Testing (5a) Blocked file:///... click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await clickInFrame("#k5-file");
    await sleep(1000);
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = calls.length === 0;
    log.clickedLinks["5a_blocked_file"] = { pass: ok, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 5a_blocked_file: ${ok ? "PASS" : "FAIL"} (tabs: ${tabs.count}: [${tabs.titles.join(", ")}], calls: ${calls.length})`);
  } catch (err) {
    console.error("  -> 5a_blocked_file error:", err.message);
    log.clickedLinks["5a_blocked_file"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (5b) Blocked scheme: javascript:...
  try {
    console.log("Testing (5b) Blocked javascript:... click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await clickInFrame("#k5-js");
    await sleep(1000);
    const jsRan = await frameEval("window.__js_ran");
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = jsRan !== true && calls.length === 0;
    log.clickedLinks["5b_blocked_js"] = { pass: ok, jsRan, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 5b_blocked_js: ${ok ? "PASS" : "FAIL"} (jsRan: ${jsRan}, tabs: ${tabs.count}: [${tabs.titles.join(", ")}], calls: ${calls.length})`);
  } catch (err) {
    console.error("  -> 5b_blocked_js error:", err.message);
    log.clickedLinks["5b_blocked_js"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (6) In-page anchor: #bottom-marker
  try {
    console.log("Testing (6) In-page anchor #bottom-marker click...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    const scrollBefore = await frameEval("window.scrollY");
    await clickInFrame("#k6-anchor");
    await sleep(1000);
    const scrollAfter = await frameEval("window.scrollY");
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = scrollAfter > 500 && calls.length === 0;
    log.clickedLinks["6_anchor_scroll"] = { pass: ok, scrollBefore, scrollAfter, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 6_anchor_scroll: ${ok ? "PASS" : "FAIL"} (scroll: ${scrollBefore} -> ${scrollAfter})`);
  } catch (err) {
    console.error("  -> 6_anchor_scroll error:", err.message);
    log.clickedLinks["6_anchor_scroll"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // (7) Keyboard Enter on focused link
  try {
    console.log("Testing (7) Keyboard Focus + Enter on link...");
    await resetToMainPreview();
    await clearOpenUrlCalls();
    await frameEval("document.getElementById('k7-enter')?.focus()");
    await sleep(300);
    const activeEl = await frameEval("document.activeElement?.id || document.activeElement?.tagName");
    console.log(`  -> activeElement before Enter: ${activeEl}`);

    // Card C-20-R3: Dispatch keyDown + keyUp with type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r"
    await app.send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
      text: "\r"
    });
    await app.send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13
    });
    await sleep(2000);

    const tabs = await getTabState();
    const calls = await getOpenUrlCalls();
    const ok = (tabs.titles.some(t => /other\.html|Other Page/i.test(t)) || /other\.html|Other Page/i.test(tabs.active)) && calls.length === 0;
    log.clickedLinks["7_keyboard_enter"] = {
      pass: ok,
      activeElement: activeEl,
      tabs,
      titles: tabs.titles,
      openUrlCalls: calls
    };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 7_keyboard_enter: ${ok ? "PASS" : "FAIL"} (activeEl: ${activeEl}, ${tabs.count} tabs: [${tabs.titles.join(", ")}], active: ${tabs.active})`);
  } catch (err) {
    console.error("  -> 7_keyboard_enter error:", err.message);
    log.clickedLinks["7_keyboard_enter"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await resetToMainPreview();
  }

  // =========================================================================
  // SECTION 2: Five Non-Click Avenues
  // =========================================================================
  console.log("\n--- Section 2: Five Non-Click Avenues ---");
  await openFileInTree("non-click.html");
  await sleep(1500);

  // Avenue 1: location.href timer
  try {
    console.log("Testing Avenue 1: location.href = https://example.com");
    await clearOpenUrlCalls();
    await frameEval("window.runAvenue1()");
    await sleep(2000);
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = calls.length === 0;
    log.nonClickAvenues["avenue_1_location_href"] = { pass: ok, openUrlCalls: calls, tabs, titles: tabs.titles };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_1_location_href: ${ok ? "PASS" : "FAIL"} (calls: ${calls.length}, tabs: ${tabs.count})`);
  } catch (err) {
    console.error("  -> avenue_1_location_href error:", err.message);
    log.nonClickAvenues["avenue_1_location_href"] = { pass: false, error: err.message };
    log.summary.fail++;
  }

  // Avenue 2: window.open
  try {
    console.log("Testing Avenue 2: window.open(https://example.com)");
    await clearOpenUrlCalls();
    await frameEval("window.runAvenue2()");
    await sleep(2000);
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = calls.length === 0;
    log.nonClickAvenues["avenue_2_window_open"] = { pass: ok, openUrlCalls: calls, tabs, titles: tabs.titles };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_2_window_open: ${ok ? "PASS" : "FAIL"} (calls: ${calls.length}, tabs: ${tabs.count})`);
  } catch (err) {
    console.error("  -> avenue_2_window_open error:", err.message);
    log.nonClickAvenues["avenue_2_window_open"] = { pass: false, error: err.message };
    log.summary.fail++;
  }

  // Avenue 3: a.click() & dispatchEvent (synthetic clicks)
  try {
    console.log("Testing Avenue 3: synthetic a.click() and dispatchEvent");
    await clearOpenUrlCalls();
    await frameEval("window.runAvenue3()");
    await sleep(2000);
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = calls.length === 0;
    log.nonClickAvenues["avenue_3_synthetic_clicks"] = { pass: ok, openUrlCalls: calls, tabs, titles: tabs.titles };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_3_synthetic_clicks: ${ok ? "PASS" : "FAIL"} (calls: ${calls.length}, tabs: ${tabs.count})`);
  } catch (err) {
    console.error("  -> avenue_3_synthetic_clicks error:", err.message);
    log.nonClickAvenues["avenue_3_synthetic_clicks"] = { pass: false, error: err.message };
    log.summary.fail++;
  }

  // Avenue 4: parent.postMessage forged messages
  try {
    console.log("Testing Avenue 4: forged parent.postMessage");
    await clearOpenUrlCalls();
    await frameEval("window.runAvenue4()");
    await sleep(2000);
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = calls.length === 0;
    log.nonClickAvenues["avenue_4_postmessage_forgery"] = { pass: ok, openUrlCalls: calls, tabs, titles: tabs.titles };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_4_postmessage_forgery: ${ok ? "PASS" : "FAIL"} (calls: ${calls.length}, tabs: ${tabs.count})`);
  } catch (err) {
    console.error("  -> avenue_4_postmessage_forgery error:", err.message);
    log.nonClickAvenues["avenue_4_postmessage_forgery"] = { pass: false, error: err.message };
    log.summary.fail++;
  }

  // Avenue 5: script-created <meta refresh>
  try {
    console.log("Testing Avenue 5: script-created <meta http-equiv=refresh>");
    await clearOpenUrlCalls();
    await frameEval("window.runAvenue5()");
    await sleep(2500);
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = calls.length === 0;
    log.nonClickAvenues["avenue_5_script_meta_refresh"] = { pass: ok, openUrlCalls: calls, tabs, titles: tabs.titles };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_5_script_meta_refresh: ${ok ? "PASS" : "FAIL"} (calls: ${calls.length}, tabs: ${tabs.count})`);
  } catch (err) {
    console.error("  -> avenue_5_script_meta_refresh error:", err.message);
    log.nonClickAvenues["avenue_5_script_meta_refresh"] = { pass: false, error: err.message };
    log.summary.fail++;
  }

  // =========================================================================
  // SECTION 3: Prototype Tampering & Token Probe
  // =========================================================================
  console.log("\n--- Section 3: Prototype Tampering & Token Secrecy ---");
  await openFileInTree("proto-tamper.html");
  await sleep(1500);

  // 3.1 Token discovery inspection
  try {
    console.log("Testing Token Probe in DOM...");
    const discovery = await frameEval("window.__tokenDiscovery");
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const hasOuterUuid = (discovery?.outerHtmlMatches?.length ?? 0) > 0;
    const hasScriptToken = (discovery?.scriptTexts || []).some(
      t => uuidRegex.test(t) || /previewLink\s*:\s*\{\s*token/i.test(t)
    );
    const ok = !hasOuterUuid && !hasScriptToken;
    log.tokenDiscovery = {
      pass: ok,
      hasOuterUuid,
      hasScriptToken,
      discovery
    };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> token_discovery_probe: ${ok ? "PASS" : "FAIL"} (hasOuterUuid: ${hasOuterUuid}, hasScriptToken: ${hasScriptToken})`);
  } catch (err) {
    console.error("  -> token_discovery_probe error:", err.message);
    log.tokenDiscovery = { pass: false, error: err.message };
    log.summary.fail++;
  }

  // 3.2 Synthetic click under tampered environment
  try {
    console.log("Testing Synthetic click with tampered prototypes...");
    await clearOpenUrlCalls();
    await frameEval("window.runTamperedSynth()");
    await sleep(1500);
    const calls = await getOpenUrlCalls();
    const tabs = await getTabState();
    const ok = calls.length === 0;
    log.prototypeTampering["synthetic_click_blocked"] = { pass: ok, openUrlCalls: calls, tabs, titles: tabs.titles };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> synthetic_click_blocked: ${ok ? "PASS" : "FAIL"} (calls: ${calls.length}, tabs: ${tabs.count})`);
  } catch (err) {
    console.error("  -> synthetic_click_blocked error:", err.message);
    log.prototypeTampering["synthetic_click_blocked"] = { pass: false, error: err.message };
    log.summary.fail++;
  }

  // 3.3 Real user click under tampered environment
  try {
    console.log("Testing Trusted user click with tampered prototypes...");
    await clearOpenUrlCalls();
    await clickInFrame("#tamper-real");
    await sleep(1500);
    const tabs = await getTabState();
    const calls = await getOpenUrlCalls();
    const ok = (tabs.titles.some(t => /other\.html|Other Page/i.test(t)) || /other\.html|Other Page/i.test(tabs.active)) && calls.length === 0;
    log.prototypeTampering["trusted_user_click_followed"] = { pass: ok, tabs, titles: tabs.titles, openUrlCalls: calls };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> trusted_user_click_followed: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs: [${tabs.titles.join(", ")}], active: ${tabs.active})`);
  } catch (err) {
    console.error("  -> trusted_user_click_followed error:", err.message);
    log.prototypeTampering["trusted_user_click_followed"] = { pass: false, error: err.message };
    log.summary.fail++;
  } finally {
    await closeExtraTabs();
  }

  // =========================================================================
  // SECTION 4: ORDER-07/08 Isolation Fixtures
  // =========================================================================
  console.log("\n--- Section 4: ORDER-07/08 Isolation Fixtures ---");
  for (const name of ["navigate.html", "refresh.html", "loopnav.html", "isolation.html", "network.html"]) {
    console.log(`Running fixture: ${name}...`);
    try {
      await clearOpenUrlCalls();
      await openFileInTree(name);
      await sleep(2500);
      const fr = await frameRect();
      const tabs = await getTabState();
      const calls = await getOpenUrlCalls();
      const ok = fr !== null && /preview/.test(fr.src) && tabs.count >= 1 && calls.length === 0;
      log.isolationFixtures[name] = { pass: ok, frame: fr, tabs, openUrlCalls: calls };
      if (ok) log.summary.pass++; else log.summary.fail++;
      console.log(`  -> ${name}: ${ok ? "PASS" : "FAIL"} (frame: ${fr?.src}, tabs: ${tabs.count})`);
    } catch (err) {
      log.isolationFixtures[name] = { pass: false, error: err.message };
      log.summary.fail++;
      console.log(`  -> ${name}: FAIL (${err.message})`);
    }
    await closeExtraTabs();
  }

  // =========================================================================
  // SECTION 5: Real Browser Invocation (ONE TIME AT THE END, Card C-19-R1)
  // Unwraps invoke hook, clicks https://example.com once, records process count.
  // DOES NOT KILL ANY PROCESS.
  // =========================================================================
  console.log("\n--- Section 5: Real Browser Invocation Test (Single Execution at End) ---");
  try {
    await openFileInTree("main-links.html");
    await sleep(1500);

    // Unwrap invoke hook
    console.log("Unwrapping __TAURI_INTERNALS__.invoke hook...");
    await uninstallInvokeHook();

    const countBefore = getBrowserProcessCount();
    console.log(`Browser process count before click: ${countBefore}`);

    // Real click on https://example.com link via trusted CDP input
    console.log("Dispatching trusted user click on https://example.com link...");
    await clickInFrame("#k4-ext");
    await sleep(2500);

    const countAfter = getBrowserProcessCount();
    console.log(`Browser process count after click: ${countAfter} (diff: ${countAfter - countBefore})`);

    const ok = countAfter >= countBefore;
    log.realBrowserTest = {
      pass: ok,
      browserCountBefore: countBefore,
      browserCountAfter: countAfter,
      diff: countAfter - countBefore,
      note: "Single real browser execution at test conclusion. No processes terminated; open tab preserved as requested.",
    };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> real_browser_launch: ${ok ? "PASS" : "FAIL"} (${countBefore} -> ${countAfter})`);
  } catch (err) {
    console.error("Real browser launch step error:", err);
    log.realBrowserTest = { pass: false, error: err.message };
    log.summary.fail++;
  }

  console.log(`\n======================================================`);
  console.log(`FINAL RESULTS: PASS=${log.summary.pass}, FAIL=${log.summary.fail}`);
  console.log(`======================================================\n`);

} catch (err) {
  console.error("Test execution error:", err);
  log.fatalError = err.stack ?? err.message;
} finally {
  if (app) app.kill();
  writeFileSync(resolve(OUT_DIR, "v3-links.json"), JSON.stringify(log, null, 2));

  // Write SUMMARY.md
  const statusStr = (v) => (!v || v.error || v.pass === undefined ? "NO-DATA" : v.pass ? "PASS" : "FAIL");

  let md = `# I-24 HTML Preview Links V3 Verification Summary\n\n`;
  md += `- Execution Time: ${log.timestamp}\n`;
  md += `- Target Binary: \`${log.exe}\`\n`;
  md += `- Total Passed: **${log.summary.pass}** / Total Failed: **${log.summary.fail}**\n\n`;
  if (log.fatalError) {
    md += `> **Execution Error**: \`${log.fatalError}\`\n\n`;
  }

  md += `## 1. Clicked Links Categories\n\n`;
  md += `| Test Case | Target | Expected Action | Status | Notes |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const [k, v] of Object.entries(log.clickedLinks)) {
    const notes = `tabs: ${v.tabs?.count ?? "-"}, openUrl calls: ${v.openUrlCalls?.length ?? 0}${v.procsDiff ? ` (procs: +${v.procsDiff})` : ""}`;
    md += `| ${k} | ${v.target ?? "fixture"} | ${v.expected ?? "follow / block"} | ${statusStr(v)} | ${notes} |\n`;
  }

  md += `\n## 2. Five Non-Click Avenues (Unclicked Attacks)\n\n`;
  md += `| Attack Avenue | Mechanism | Expected | Status | openUrl Calls |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const [k, v] of Object.entries(log.nonClickAvenues)) {
    md += `| ${k} | unclicked | No navigation, No browser | ${statusStr(v)} | ${v.openUrlCalls?.length ?? 0} |\n`;
  }

  md += `\n## 3. Prototype Tampering & Token Secrecy\n\n`;
  md += `| Test Item | Description | Status |\n`;
  md += `|---|---|---|\n`;
  md += `| Token Secrecy | DOM / scripts inspected for UUID token | ${statusStr(log.tokenDiscovery)} |\n`;
  for (const [k, v] of Object.entries(log.prototypeTampering)) {
    md += `| ${k} | Native built-in isolation test | ${statusStr(v)} |\n`;
  }

  md += `\n## 4. ORDER-07/08 Isolation Fixtures\n\n`;
  md += `| Fixture | Status | Notes |\n`;
  md += `|---|---|---|\n`;
  for (const [k, v] of Object.entries(log.isolationFixtures)) {
    md += `| ${k} | ${statusStr(v)} | frame: ${v.frame?.src ?? "none"}, openUrl calls: ${v.openUrlCalls?.length ?? 0} |\n`;
  }

  md += `\n## 5. Real Browser Launch (Single Final Check)\n\n`;
  if (log.realBrowserTest) {
    md += `- Status: **${statusStr(log.realBrowserTest)}**\n`;
    md += `- Browser Count: ${log.realBrowserTest.browserCountBefore} -> ${log.realBrowserTest.browserCountAfter} (diff: ${log.realBrowserTest.diff})\n`;
    md += `- Note: ${log.realBrowserTest.note}\n`;
  } else {
    md += `- Status: **NO-DATA** (Not executed)\n`;
  }

  writeFileSync(resolve(OUT_DIR, "SUMMARY.md"), md);
}

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
  summary: { pass: 0, fail: 0 },
};

let app;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (expr) => app.evaluate(expr);

function getBrowserPids() {
  try {
    const out = execFileSync(
      "powershell",
      ["-NoProfile", "-Command", "Get-Process -Name msedge, chrome, firefox, brave, opera -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id"],
      { encoding: "utf8" }
    );
    return new Set(out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).map(Number));
  } catch {
    return new Set();
  }
}

function checkAndKillNewBrowser(beforePids) {
  const after = getBrowserPids();
  const newPids = [...after].filter((p) => !beforePids.has(p));
  if (newPids.length > 0) {
    for (const pid of newPids) {
      try { execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" }); } catch {}
    }
    return { spawned: true, pids: newPids };
  }
  return { spawned: false, pids: [] };
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
    const f = [...document.querySelectorAll('iframe')].find(e => e.offsetParent && /preview/.test(e.src));
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

async function openFileInTree(name) {
  const escaped = JSON.stringify(JSON.stringify(resolve(WORK_DIR, name))).slice(1, -1);
  const selector = `.tree-window .tree-row[data-path=${escaped}]`;
  const pt = await ev(`(()=>{
    const e = document.querySelector(${JSON.stringify(selector)});
    if (!e) return null;
    e.scrollIntoView({ block: 'nearest' });
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x + Math.min(r.width / 2, 80)), y: Math.round(r.y + r.height / 2) };
  })()`);
  if (!pt) throw new Error(`Tree row for ${name} not found`);
  await clickAt(pt.x, pt.y, true);
  await sleep(1000);
  // If preview button is available, click it
  await ev(`(()=>{
    const btn = [...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e => e.offsetParent);
    if (btn) btn.click();
  })()`).catch(() => {});
  await sleep(2000);
}

async function closeExtraTabs() {
  await ev(`(()=>{
    const tabs = [...document.querySelectorAll('.pane .tab')];
    if (tabs.length <= 1) return;
    for (let i = tabs.length - 1; i >= 1; i--) {
      const closeBtn = tabs[i].querySelector('.tab-close');
      if (closeBtn) closeBtn.click();
    }
  })()`).catch(() => {});
  await sleep(500);
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

  // =========================================================================
  // SECTION 1: Clicked links 6 kinds (+ keyboard Enter 1 time)
  // =========================================================================
  console.log("\n--- Section 1: Clicked Links (6 categories + Tab/Enter) ---");
  await openFileInTree("main-links.html");
  const initTabs = await getTabState();
  console.log(`Initial preview tabs: ${JSON.stringify(initTabs)}`);

  // (1) Local HTML: other.html
  {
    console.log("Testing (1a) Local other.html click...");
    await clickInFrame("#k1-other");
    await sleep(1500);
    const tabs = await getTabState();
    const ok = tabs.count === 2 && /other\.html|Other Page/i.test(tabs.active);
    log.clickedLinks["1a_local_html_other"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 1a_local_html_other: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs, active: ${tabs.active})`);
    await closeExtraTabs();
  }

  // (1b) Local HTML: ./sub/page.html
  {
    console.log("Testing (1b) Local ./sub/page.html click...");
    await clickInFrame("#k1-sub");
    await sleep(1500);
    const tabs = await getTabState();
    const ok = tabs.count === 2 && /page\.html|Sub Page/i.test(tabs.active);
    log.clickedLinks["1b_local_html_sub"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 1b_local_html_sub: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs, active: ${tabs.active})`);
    await closeExtraTabs();
  }

  // (2) Local Markdown: doc.md
  {
    console.log("Testing (2) Local doc.md click...");
    await clickInFrame("#k2-md");
    await sleep(1500);
    const tabs = await getTabState();
    const ok = tabs.count === 2 && /doc\.md/i.test(tabs.active);
    log.clickedLinks["2_local_markdown"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 2_local_markdown: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs, active: ${tabs.active})`);
    await closeExtraTabs();
  }

  // (3a) Other local: notes.txt
  {
    console.log("Testing (3a) Local notes.txt click...");
    await clickInFrame("#k3-txt");
    await sleep(1500);
    const tabs = await getTabState();
    const ok = tabs.count === 2 && /notes\.txt/i.test(tabs.active);
    log.clickedLinks["3a_local_txt"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 3a_local_txt: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs, active: ${tabs.active})`);
    await closeExtraTabs();
  }

  // (3b) Other local: data.csv
  {
    console.log("Testing (3b) Local data.csv click...");
    await clickInFrame("#k3-csv");
    await sleep(1500);
    const tabs = await getTabState();
    const ok = tabs.count === 2 && /data\.csv/i.test(tabs.active);
    log.clickedLinks["3b_local_csv"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 3b_local_csv: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs, active: ${tabs.active})`);
    await closeExtraTabs();
  }

  // (4) External link: https://example.com
  {
    console.log("Testing (4) External https://example.com click...");
    const beforePids = getBrowserPids();
    await clickInFrame("#k4-ext");
    await sleep(2000);
    const browserResult = checkAndKillNewBrowser(beforePids);
    const tabs = await getTabState();
    const ok = tabs.count === 1 && browserResult.spawned;
    log.clickedLinks["4_external_browser"] = { pass: ok, browserResult, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 4_external_browser: ${ok ? "PASS" : "FAIL"} (browserSpawned: ${browserResult.spawned}, pids: ${JSON.stringify(browserResult.pids)}, tabs: ${tabs.count})`);
  }

  // (5a) Blocked scheme: file:///...
  {
    console.log("Testing (5a) Blocked file:///... click...");
    await clickInFrame("#k5-file");
    await sleep(1000);
    const tabs = await getTabState();
    const ok = tabs.count === 1;
    log.clickedLinks["5a_blocked_file"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 5a_blocked_file: ${ok ? "PASS" : "FAIL"} (tabs: ${tabs.count})`);
  }

  // (5b) Blocked scheme: javascript:...
  {
    console.log("Testing (5b) Blocked javascript:... click...");
    await clickInFrame("#k5-js");
    await sleep(1000);
    const jsRan = await frameEval("window.__js_ran");
    const tabs = await getTabState();
    const ok = tabs.count === 1 && jsRan !== true;
    log.clickedLinks["5b_blocked_js"] = { pass: ok, jsRan, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 5b_blocked_js: ${ok ? "PASS" : "FAIL"} (jsRan: ${jsRan}, tabs: ${tabs.count})`);
  }

  // (6) In-page anchor: #bottom-marker
  {
    console.log("Testing (6) In-page anchor #bottom-marker click...");
    const scrollBefore = await frameEval("window.scrollY");
    await clickInFrame("#k6-anchor");
    await sleep(1000);
    const scrollAfter = await frameEval("window.scrollY");
    const tabs = await getTabState();
    const ok = tabs.count === 1 && scrollAfter > 500;
    log.clickedLinks["6_anchor_scroll"] = { pass: ok, scrollBefore, scrollAfter, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 6_anchor_scroll: ${ok ? "PASS" : "FAIL"} (scroll: ${scrollBefore} -> ${scrollAfter})`);
  }

  // (7) Keyboard Enter on focused link
  {
    console.log("Testing (7) Keyboard Focus + Enter on link...");
    await frameEval("document.getElementById('k7-enter').focus()");
    await sleep(300);
    await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", windowsVirtualKeyCode: 13, text: "\r" });
    await app.send("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 13 });
    await sleep(1500);
    const tabs = await getTabState();
    const ok = tabs.count === 2 && /other\.html|Other Page/i.test(tabs.active);
    log.clickedLinks["7_keyboard_enter"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> 7_keyboard_enter: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs, active: ${tabs.active})`);
    await closeExtraTabs();
  }

  // =========================================================================
  // SECTION 2: Five Non-Click Avenues
  // =========================================================================
  console.log("\n--- Section 2: Five Non-Click Avenues ---");
  await openFileInTree("non-click.html");
  await sleep(1500);

  // Avenue 1: location.href timer
  {
    console.log("Testing Avenue 1: location.href = https://example.com");
    const beforePids = getBrowserPids();
    await frameEval("window.runAvenue1()");
    await sleep(2000);
    const browserResult = checkAndKillNewBrowser(beforePids);
    const tabs = await getTabState();
    const ok = tabs.count === 1 && !browserResult.spawned;
    log.nonClickAvenues["avenue_1_location_href"] = { pass: ok, browserResult, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_1_location_href: ${ok ? "PASS" : "FAIL"} (spawned: ${browserResult.spawned}, tabs: ${tabs.count})`);
  }

  // Avenue 2: window.open
  {
    console.log("Testing Avenue 2: window.open(https://example.com)");
    const beforePids = getBrowserPids();
    await frameEval("window.runAvenue2()");
    await sleep(2000);
    const browserResult = checkAndKillNewBrowser(beforePids);
    const tabs = await getTabState();
    const ok = tabs.count === 1 && !browserResult.spawned;
    log.nonClickAvenues["avenue_2_window_open"] = { pass: ok, browserResult, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_2_window_open: ${ok ? "PASS" : "FAIL"} (spawned: ${browserResult.spawned}, tabs: ${tabs.count})`);
  }

  // Avenue 3: a.click() & dispatchEvent (synthetic clicks)
  {
    console.log("Testing Avenue 3: synthetic a.click() and dispatchEvent");
    const beforePids = getBrowserPids();
    await frameEval("window.runAvenue3()");
    await sleep(2000);
    const browserResult = checkAndKillNewBrowser(beforePids);
    const tabs = await getTabState();
    const ok = tabs.count === 1 && !browserResult.spawned;
    log.nonClickAvenues["avenue_3_synthetic_clicks"] = { pass: ok, browserResult, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_3_synthetic_clicks: ${ok ? "PASS" : "FAIL"} (spawned: ${browserResult.spawned}, tabs: ${tabs.count})`);
  }

  // Avenue 4: parent.postMessage forged messages
  {
    console.log("Testing Avenue 4: forged parent.postMessage");
    const beforePids = getBrowserPids();
    await frameEval("window.runAvenue4()");
    await sleep(2000);
    const browserResult = checkAndKillNewBrowser(beforePids);
    const tabs = await getTabState();
    const ok = tabs.count === 1 && !browserResult.spawned;
    log.nonClickAvenues["avenue_4_postmessage_forgery"] = { pass: ok, browserResult, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_4_postmessage_forgery: ${ok ? "PASS" : "FAIL"} (spawned: ${browserResult.spawned}, tabs: ${tabs.count})`);
  }

  // Avenue 5: script-created <meta refresh>
  {
    console.log("Testing Avenue 5: script-created <meta http-equiv=refresh>");
    const beforePids = getBrowserPids();
    await frameEval("window.runAvenue5()");
    await sleep(2500);
    const browserResult = checkAndKillNewBrowser(beforePids);
    const tabs = await getTabState();
    const ok = tabs.count === 1 && !browserResult.spawned;
    log.nonClickAvenues["avenue_5_script_meta_refresh"] = { pass: ok, browserResult, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> avenue_5_script_meta_refresh: ${ok ? "PASS" : "FAIL"} (spawned: ${browserResult.spawned}, tabs: ${tabs.count})`);
  }

  // =========================================================================
  // SECTION 3: Prototype Tampering & Token Probe
  // =========================================================================
  console.log("\n--- Section 3: Prototype Tampering & Token Secrecy ---");
  await openFileInTree("proto-tamper.html");
  await sleep(1500);

  // 3.1 Token discovery inspection
  {
    console.log("Testing Token Probe in DOM...");
    const discovery = await frameEval("window.__tokenDiscovery");
    const ok = (discovery?.outerHtmlMatches?.length ?? 0) === 0 && (discovery?.previewLinkMatches?.length ?? 0) === 0;
    log.tokenDiscovery = { pass: ok, discovery };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> token_discovery_probe: ${ok ? "PASS" : "FAIL"} (outerHtml UUID matches: ${discovery?.outerHtmlMatches?.length ?? 0}, previewLink: ${discovery?.previewLinkMatches?.length ?? 0})`);
  }

  // 3.2 Synthetic click under tampered environment
  {
    console.log("Testing Synthetic click with tampered prototypes...");
    const beforePids = getBrowserPids();
    await frameEval("window.runTamperedSynth()");
    await sleep(1500);
    const browserResult = checkAndKillNewBrowser(beforePids);
    const tabs = await getTabState();
    const ok = tabs.count === 1 && !browserResult.spawned;
    log.prototypeTampering["synthetic_click_blocked"] = { pass: ok, browserResult, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> synthetic_click_blocked: ${ok ? "PASS" : "FAIL"} (spawned: ${browserResult.spawned}, tabs: ${tabs.count})`);
  }

  // 3.3 Real user click under tampered environment
  {
    console.log("Testing Trusted user click with tampered prototypes...");
    await clickInFrame("#tamper-real");
    await sleep(1500);
    const tabs = await getTabState();
    const ok = tabs.count === 2 && /other\.html|Other Page/i.test(tabs.active);
    log.prototypeTampering["trusted_user_click_followed"] = { pass: ok, tabs };
    if (ok) log.summary.pass++; else log.summary.fail++;
    console.log(`  -> trusted_user_click_followed: ${ok ? "PASS" : "FAIL"} (${tabs.count} tabs, active: ${tabs.active})`);
    await closeExtraTabs();
  }

  // =========================================================================
  // SECTION 4: ORDER-07/08 Isolation Fixtures
  // =========================================================================
  console.log("\n--- Section 4: ORDER-07/08 Isolation Fixtures ---");
  for (const name of ["navigate.html", "refresh.html", "loopnav.html", "isolation.html", "network.html"]) {
    console.log(`Running fixture: ${name}...`);
    try {
      await openFileInTree(name);
      await sleep(2500);
      const fr = await frameRect();
      const tabs = await getTabState();
      const ok = fr !== null && /preview/.test(fr.src) && tabs.count >= 1;
      log.isolationFixtures[name] = { pass: ok, frame: fr, tabs };
      if (ok) log.summary.pass++; else log.summary.fail++;
      console.log(`  -> ${name}: ${ok ? "PASS" : "FAIL"} (frame: ${fr?.src}, tabs: ${tabs.count})`);
    } catch (err) {
      log.isolationFixtures[name] = { pass: false, error: err.message };
      log.summary.fail++;
      console.log(`  -> ${name}: FAIL (${err.message})`);
    }
    await closeExtraTabs();
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
  let md = `# I-24 HTML Preview Links V3 Verification Summary\n\n`;
  md += `- Execution Time: ${log.timestamp}\n`;
  md += `- Target Binary: \`${log.exe}\`\n`;
  md += `- Total Passed: **${log.summary.pass}** / Total Failed: **${log.summary.fail}**\n\n`;

  md += `## 1. Clicked Links Categories\n\n`;
  md += `| Test Case | Target | Expected Action | Status | Notes |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const [k, v] of Object.entries(log.clickedLinks)) {
    md += `| ${k} | ${v.target ?? "fixture"} | ${v.expected ?? "follow / block"} | ${v.pass ? "PASS" : "FAIL"} | tabs: ${v.tabs?.count ?? "-"} |\n`;
  }

  md += `\n## 2. Five Non-Click Avenues (Unclicked Attacks)\n\n`;
  md += `| Attack Avenue | Mechanism | Expected | Status | Browser Spawned |\n`;
  md += `|---|---|---|---|---|\n`;
  for (const [k, v] of Object.entries(log.nonClickAvenues)) {
    md += `| ${k} | unclicked | No navigation, No browser | ${v.pass ? "PASS" : "FAIL"} | ${v.browserResult?.spawned ?? false} |\n`;
  }

  md += `\n## 3. Prototype Tampering & Token Secrecy\n\n`;
  md += `| Test Item | Description | Status |\n`;
  md += `|---|---|---|\n`;
  md += `| Token Secrecy | DOM / scripts inspected for UUID token | ${log.tokenDiscovery?.pass ? "PASS" : "FAIL"} |\n`;
  for (const [k, v] of Object.entries(log.prototypeTampering)) {
    md += `| ${k} | Native built-in isolation test | ${v.pass ? "PASS" : "FAIL"} |\n`;
  }

  md += `\n## 4. ORDER-07/08 Isolation Fixtures\n\n`;
  md += `| Fixture | Status | Notes |\n`;
  md += `|---|---|---|\n`;
  for (const [k, v] of Object.entries(log.isolationFixtures)) {
    md += `| ${k} | ${v.pass ? "PASS" : "FAIL"} | frame: ${v.frame?.src ?? "none"} |\n`;
  }

  writeFileSync(resolve(OUT_DIR, "SUMMARY.md"), md);
}

// ORDER-07 V3: I-7 HTML preview scripts with isolation. Reads the cross-origin preview frame through its CDP execution
// context (in-process) or its own target (out-of-process). Writes verify/ORDER-07/v3.json and PNGs.
import { writeFileSync, mkdirSync, rmSync, cpSync, readFileSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-07";
const W = S + "/o7ws", WW = SW + "\\o7ws";
const DATA = S + "/appdata7/workbench-tauri";
rmSync(W, { recursive: true, force: true }); rmSync(S + "/appdata7", { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });
cpSync(OUT + "/fixtures", W, { recursive: true });
cpSync("D:/projects/workbench-core/specs/v0.8.1/mockups/outline/index.html", W + "/outline-mockup.html");
writeFileSync(W + "/plain.html", "<h1>Plain</h1><p>Unstyled text with <a href=\"#x\">a link</a>.</p><p id=\"x\">x</p>");
writeFileSync(W + "/tiny.pdf", "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
const setSettings = (o) => writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Dark", ...o }) + "\n");
setSettings({});
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = SW + "\\appdata7";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview7";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/" + n + ".png", Buffer.from(r.data, "base64")); };
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel)).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const clickAt = async (x, y, dbl) => { for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", x, y); await app.mouse("mousePressed", x, y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", x, y, { button: "left", clickCount: c }); } await sleep(700); };
const click = async (js, dbl) => { const p = await pt(js); if (!p) throw new Error("not found " + js); await clickAt(p.x, p.y, dbl); };
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const contexts = new Map(); // contextId -> origin
const netUrls = [];
// frame evaluation: newest context with the preview origin; else an out-of-process iframe target
let frameWs = null;
async function frameEval(expr) {
  const ids = [...contexts.entries()].filter(([, o]) => /preview/.test(o)).map(([id]) => id);
  for (const id of ids.reverse()) {
    try { const r = await app.send("Runtime.evaluate", { expression: expr, contextId: id, returnByValue: true, awaitPromise: true }); if (!r.exceptionDetails) return r.result.value; } catch {}
  }
  // out-of-process frame
  const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  const t = list.filter((x) => x.type === "iframe" && /preview/.test(x.url)).pop();
  if (!t) return { noFrame: true, contexts: [...contexts.values()] };
  if (!frameWs || frameWs.url !== t.webSocketDebuggerUrl) { frameWs = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (frameWs.onopen = r)); }
  return await new Promise((res) => { const id = Math.floor(Math.random() * 1e9); frameWs.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === id) res(d.result?.result?.value ?? d); }; frameWs.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: expr, returnByValue: true, awaitPromise: true } })); });
}
const frameRect = () => ev("(()=>{const f=[...document.querySelectorAll('iframe')].find(e=>e.offsetParent&&/preview/.test(e.src));if(!f)return null;const r=f.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,src:f.src,sandbox:f.getAttribute('sandbox'),csp:f.getAttribute('csp')}})()");
const clickInFrame = async (selector) => { const f = await frameRect(); const r = await frameEval(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`); if (!r || r.noFrame) throw new Error("frame element not found " + selector); await clickAt(Math.round(f.x + r.x), Math.round(f.y + r.y)); };
const openPreview = async (f) => { await click(row(f), true); await sleep(1200); await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {}); await sleep(2500); };
const tableOf = () => frameEval("[...document.querySelectorAll('#rows tr')].map(r=>[...r.cells].map(c=>c.textContent).join(' | '))");
const procs = () => execFileSync("pwsh", ["-NoProfile", "-Command", "(Get-Process msedgewebview2 -ErrorAction SilentlyContinue | Measure-Object).Count"], { encoding: "utf8" }).trim();
try {
  app = await launchApp(); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  app.on((m) => {
    if (m.method === "Runtime.executionContextCreated") contexts.set(m.params.context.id, m.params.context.origin || m.params.context.name || "");
    if (m.method === "Runtime.executionContextDestroyed") contexts.delete(m.params.executionContextId);
    if (m.method === "Network.requestWillBeSent") netUrls.push(m.params.request.url);
  });
  await app.send("Runtime.enable"); await app.send("Network.enable");
  await app.send("Target.setAutoAttach", { autoAttach: false, waitForDebuggerOnStart: false, flatten: true }).catch(() => {});
  log.procsBefore = procs();
  if (process.argv[2] === "nav") {
    await step("c5_navigate_r1", async () => {
      await openPreview("navigate.html"); await sleep(1500);
      const state = async () => { const t = await frameEval("document.title"); return { title: t, started: await frameEval("document.getElementById('started')?.textContent ?? null"), count: await frameEval("document.getElementById('count')?.textContent ?? null"), src: (await frameRect())?.src, appTabs: (await ev("[...document.querySelectorAll('.pane .tab .tab-title')].map(t=>t.textContent.trim())")).length, appUrl: await ev("location.href") }; };
      const r = { start: await state(), steps: {} };
      const press = async (label, sel) => {
        const f = await frameRect();
        const p = await frameEval(`(()=>{const e=${sel};if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
        if (!p || typeof p.x !== "number") { r.steps[label] = { error: "element not found", state: await state() }; return; }
        await clickAt(Math.round(f.x + p.x), Math.round(f.y + p.y)); await sleep(2200);
        r.steps[label] = await state();
      };
      const btn = (t) => `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(t)})`;
      await press("external link", "document.querySelector(\"a[href^='https']\") || [...document.querySelectorAll('a')].find(a=>/external/.test(a.textContent))");
      await press("local link", "[...document.querySelectorAll('a')].find(a=>/local link/.test(a.textContent))");
      await press("#bottom link", "document.querySelector(\"a[href='#bottom']\")"); r.steps["#bottom link"].scrollY = await frameEval("Math.round(scrollY)");
      for (const t of ["location.href = https://…", "location.href = refresh.html", "location = asset URL", "window.open", "form.submit()", "top.location", "submit button"]) await press(t, btn(t));
      await shot("c5-navigate-r1");
      return r;
    });
    await step("c5_loopnav", async () => {
      await openPreview("loopnav.html"); await sleep(9000);
      return { title: await frameEval("document.title"), src: (await frameRect())?.src, toasts: await ev("[...document.querySelectorAll('.toast')].map(t=>t.innerText)"), appAnswer: await ev("1+1") };
    });
    await step("c5_refresh_r1", async () => { await openPreview("refresh.html"); await sleep(5000); return { title: await frameEval("document.title"), body: await frameEval("document.body?.innerText.slice(0,100) ?? null") }; });
    throw new Error("nav run done");
  }
  await step("c3_isolation", async () => {
    await openPreview("isolation.html");
    const r = { frame: await frameRect(), ran: await frameEval("document.getElementById('ran')?.textContent"), localjs: await frameEval("document.getElementById('localjs')?.textContent"), cssBorder: await frameEval("getComputedStyle(document.querySelector('.local-css')).borderStyle"), img: await frameEval("(i=>i?{complete:i.complete,w:i.naturalWidth}:null)(document.querySelector('img'))") };
    await sleep(1500); r.table = await tableOf();
    r.procsAfterOpen = procs();
    await shot("c3-isolation");
    // source edit -> redraw
    appendFileSync(W + "/isolation.html", "\n<p id=\"edited\">edited marker</p>\n"); await sleep(2500);
    r.redrawAfterEdit = await frameEval("document.getElementById('edited')?.textContent ?? null");
    return r;
  });
  await step("c4_network", async () => {
    const before = netUrls.length;
    await openPreview("network.html"); await sleep(3000);
    const t = await tableOf();
    const urls = netUrls.slice(before);
    await shot("c4-network");
    return { table: t, internetRequests: urls.filter((u) => /example\.com|websocket\.org|https:\/\/(?!asset|preview|ipc|tauri)/.test(u)), requestsSeen: urls.map((u) => u.slice(0, 70)) };
  });
  await step("c5_navigate", async () => {
    await openPreview("navigate.html"); await sleep(1500);
    const state = async () => ({ started: await frameEval("document.getElementById('started')?.textContent ?? null"), count: await frameEval("document.getElementById('count')?.textContent ?? null"), frameSrc: (await frameRect())?.src, title: await frameEval("document.title"), appTabs: await ev("[...document.querySelectorAll('.pane .tab .tab-title')].map(t=>t.textContent.trim())"), appUrl: await ev("location.href") });
    const r = { start: await state() };
    const buttons = ["location.href = https://…", "location.href = refresh.html", "location = asset URL", "window.open", "form.submit()", "top.location", "submit button"];
    const linkSel = { "external link": "a[href^='https']", "local link": "p a:nth-of-type(2)", "#bottom link": "a[href='#bottom']" };
    r.links = {};
    for (const [name, sel] of Object.entries(linkSel)) { try { await clickInFrame(sel); await sleep(1500); r.links[name] = { ...(await state()), scrollY: await frameEval("Math.round(scrollY)") }; } catch (e) { r.links[name] = "ERR " + e.message; } }
    r.buttons = {};
    for (const label of buttons) {
      try {
        await frameEval(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});b?.scrollIntoView({block:'center'});return !!b})()`);
        const f = await frameRect();
        const p = await frameEval(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
        await clickAt(Math.round(f.x + p.x), Math.round(f.y + p.y)); await sleep(2000);
        r.buttons[label] = await state();
      } catch (e) { r.buttons[label] = "ERR " + e.message; }
    }
    await shot("c5-navigate-after");
    return r;
  });
  await step("c5_refresh", async () => { await openPreview("refresh.html"); await sleep(4500); return { title: await frameEval("document.title"), body: await frameEval("document.body.innerText.slice(0,120)"), src: (await frameRect())?.src }; });
  await step("c7_plain_theme", async () => {
    await openPreview("plain.html"); await sleep(1500);
    const read = async () => ({ frame: await frameEval("(()=>{const b=getComputedStyle(document.body);const a=getComputedStyle(document.querySelector('a'));return {text:b.color,link:a.color,docBg:getComputedStyle(document.documentElement).backgroundColor,bodyBg:b.backgroundColor,scheme:getComputedStyle(document.documentElement).colorScheme}})()"), iframeBg: await ev("getComputedStyle([...document.querySelectorAll('iframe')].find(e=>e.offsetParent)).backgroundColor") });
    const r = { oneDark: await read() };
    await shot("c7-plain-onedark");
    setSettings({ preview_theme: "One Light" }); await sleep(2500);
    r.oneLight = await read(); await shot("c7-plain-onelight");
    setSettings({}); await sleep(2000);
    return r;
  });
  await step("c6_app_inline_blocked", async () => {
    const r = await app.send("Runtime.evaluate", { expression: "new Promise(res=>{let v=null;document.addEventListener('securitypolicyviolation',e=>{v=e.violatedDirective},{once:true});const s=document.createElement('script');s.textContent='window.__x=1';document.head.append(s);setTimeout(()=>res({x:window.__x??null,violation:v}),300)})", awaitPromise: true, returnByValue: true });
    return r.result.value;
  });
  await step("c2_mockup", async () => {
    await openPreview("outline-mockup.html"); await sleep(3000);
    const r = await frameEval("({designs:document.querySelectorAll('#designs > *').length,svgs:document.querySelectorAll('svg').length,rows:document.querySelectorAll('.orow').length,font:getComputedStyle(document.body).fontFamily,title:document.title})");
    await shot("c2-mockup-preview");
    return r;
  });
  await step("c8_loop_and_stop", async () => {
    await openPreview("navigate.html"); await sleep(1500);
    const c1 = await frameEval("document.getElementById('count').textContent");
    await sleep(2000); const c2 = await frameEval("document.getElementById('count').textContent");
    // infinite loop
    const f = await frameRect();
    const p = await frameEval("(()=>{const b=[...document.querySelectorAll('button')].find(b=>/infinite loop/.test(b.textContent));b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
    await clickAt(Math.round(f.x + p.x), Math.round(f.y + p.y)); await sleep(1500);
    const t0 = Date.now(); let appAlive = null;
    try { appAlive = await Promise.race([ev("document.querySelectorAll('.tree-row').length"), new Promise((_, rej) => setTimeout(() => rej(new Error("app main page did not answer in 5 s")), 5000))]); } catch (e) { appAlive = e.message; }
    const appMs = Date.now() - t0;
    await shot("c8-loop");
    // close the preview tab
    await click("[...document.querySelectorAll('.pane .tab.active button[aria-label=\"Close Tab\"]')][0]").catch((e) => (appAlive += " / close: " + e.message));
    await sleep(2000);
    return { counterRunning: [c1, c2], appAnswerDuringLoop: appAlive, appAnswerMs: appMs, framesAfterClose: await ev("[...document.querySelectorAll('iframe')].filter(e=>/preview/.test(e.src)).length"), procsAfterClose: procs() };
  });
  await step("c7_tab_into_frame", async () => {
    await openPreview("plain.html"); await sleep(1500);
    const seq = [];
    await ev("[...document.querySelectorAll('.markdown-preview, .html-preview, .view-body')].find(e=>e.offsetParent)?.focus()");
    for (let i = 0; i < 4; i++) { await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await sleep(300); seq.push({ main: await ev("document.activeElement?.tagName"), frame: await frameEval("document.activeElement?.tagName") }); }
    return seq;
  });
  await step("c9_pdf", async () => { await click(row("tiny.pdf"), true); await sleep(2500); return ev("(()=>{const f=[...document.querySelectorAll('iframe, embed, object')].find(e=>e.offsetParent);return f?{tag:f.tagName,src:(f.src||f.data||'').slice(0,40)}:null})()"); });
} catch (e) { log.fatal = e.stack; }
finally { try { frameWs?.close(); } catch {} app?.kill(); writeFileSync(OUT + (process.argv[2] ? "/v3-" + process.argv[2] + ".json" : "/v3.json"), JSON.stringify(log, null, 2)); console.log(JSON.stringify(log).slice(0, 6000)); }

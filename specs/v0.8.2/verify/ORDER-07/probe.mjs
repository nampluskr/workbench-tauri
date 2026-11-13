// v0.8.2 ORDER-07 screen probe (core ORDER-07 6절 기능, 9.2 미뤄 둔 화면 측정 ORDER-02~06, 9.2 다시 그리기 시간, 6절 전체 회귀, 9.3).
// Patterns from verify/ORDER-02/leader-probe/probe.mjs: tools/cdp-lib.mjs launchApp, isolated APPDATA + WEBVIEW2_USER_DATA_FOLDER per
// session under %TEMP%, state.json seeding the folder, click() only when elementFromPoint hits the target, CDP mouse, frame values
// through the iframe CDP target (json/list), real keys / wheel / drag via tools/win-input.ps1 (SendInput, foreground-checked).
// Nothing is added to the app (AGENTS 4.2): values are read with getComputedStyle / getBoundingClientRect over CDP.
//
// Usage: node specs/v0.8.2/verify/ORDER-07/probe.mjs <exe copy in %TEMP%> [A] [B] [C] [D]   (no section = all, in the order below)
//   A  ORDER-07 6절 기능 #1~#4            B  미뤄 둔 화면 측정 (ORDER-02~06 6절, 9.2 "여기서 볼 것", 8절 정화 DOM)
//   C  HTML 미리보기 다시 그리기 시간(9.2)   D  전체 회귀 (6절, 9.3 탭 스크롤 세 경우)
// Run order: B welcome part (fresh session, no folder) -> A -> B main -> C -> D -> B One Dark part (fresh session, settings.json dark).
// Output: specs/v0.8.2/verify/ORDER-07/out/result.json (saved after every record) and PNG captures in the same folder.
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const OUT = `${REPO}/specs/v0.8.2/verify/ORDER-07/out`;
const BUDGET_MS = 15 * 60 * 1000; // core ORDER-07 9.2: 15 minutes per section, then "측정 불가"
const EXE = process.argv[2] ? resolve(process.argv[2]) : "";
// --only=id1,id2: re-run those records only; they replace the same ids of out/result-run1.json (kept as the first run), marked rerun:true
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);
const ASKED = process.argv.slice(3).filter((a) => !a.startsWith("--")).map((s) => s.toUpperCase());
const SECTIONS = ASKED.length ? ASKED : ["A", "B", "C", "D"];
const norm = (p) => p.replace(/\\/g, "/").toLowerCase();
if (!EXE || !existsSync(EXE)) { console.error("usage: node probe.mjs <exe copy in %TEMP%> [A] [B] [C] [D]"); process.exit(2); }
if (norm(EXE).startsWith(norm(`${REPO}/`)) || !norm(EXE).startsWith(norm(TEMP + "/"))) {
  console.error(`refusing ${EXE}: run a COPY of the release exe placed under ${TEMP} (the user's shortcut points at src-tauri/target/release)`);
  process.exit(2);
}
const { launchApp } = await import(pathToFileURL(`${REPO}/tools/cdp-lib.mjs`).href);
mkdirSync(OUT, { recursive: true });

const R = { card: "core v0.8.2 ORDER-07", exe: EXE, sections: SECTIONS, started: new Date().toISOString(), input: "keys/wheel/drag/type: SendInput (tools/win-input.ps1, foreground-checked); clicks: CDP mouse after an elementFromPoint check", records: [] };
if (ONLY.length) {
  const RUN1 = `${OUT}/result-run1.json`;
  if (!existsSync(RUN1)) copyFileSync(`${OUT}/result.json`, RUN1);
  // a further re-run builds on the merged result.json (it already holds earlier re-run records), the first on run1
  const cur = JSON.parse(readFileSync(`${OUT}/result.json`, "utf8"));
  const base = cur.only ? cur : JSON.parse(readFileSync(RUN1, "utf8"));
  Object.assign(R, { run1: base.run1 ?? base.started, only: [...new Set([...(base.only ?? []), ...ONLY])], records: base.records, webviewFind: base.webviewFind });
}
const put = (rec) => { if (ONLY.length) rec.rerun = true; const i = R.records.findIndex((r) => r.id === rec.id); if (i >= 0) R.records[i] = rec; else R.records.push(rec); };
const save = () => writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
const lines = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("\n");
const near = (a, b, tol = 0.5) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------- clipboard (pwsh Get-Clipboard; the prior text is put back at the end)
const pw = (cmd) => execFileSync("pwsh", ["-NoProfile", "-Command", cmd], { encoding: "utf8" });
const clipRead = () => { try { return pw("Get-Clipboard -Raw").replace(/\r\n/g, "\n").replace(/\n$/, ""); } catch { return null; } };
const CLIP_SAVE = `${TEMP}/v082-o7-clipboard-before.txt`;
const priorClip = (() => { try { return pw("Get-Clipboard -Raw"); } catch { return null; } })();
if (priorClip !== null) writeFileSync(CLIP_SAVE, priorClip);
const clipRestore = () => { if (priorClip) try { pw(`Set-Clipboard -Value (Get-Content -Raw -LiteralPath '${CLIP_SAVE.replace(/'/g, "''")}')`); } catch {} };

// ---------------------------------------------------------------- fixtures (generated into each session workspace)
const PY = 'def hello():\n    print("hi")\n\n    return 1'; // what a code block shows and copies (I-22: no leading/trailing blank lines)
const SECTION_COUNT = 6;
const filler = (s, k) => `Paragraph ${k} of section ${s} carries plain words so the line wraps across the body width of the preview and the frame alike.`;
function pairMd() {
  let md = "# Pair Document\n\nIntro paragraph with the needle word for the find test, written in plain text only.\n\n";
  for (let s = 1; s <= SECTION_COUNT; s++) {
    md += `## Section ${s}\n\n### Section ${s}.1\n\n${[1, 2, 3].map((k) => filler(s, k)).join("\n\n")}\n\n`;
    if (s === 1) md += "- Item one\n  - Nested one\n  - Nested two\n- Item two\n- Item three\n\n| Name | Value | Note |\n|---|---|---|\n| a | 1 | first |\n| b | 2 | second |\n\n";
    if (s === 2) md += "```python\n\n\n" + PY + "\n\n\n```\n\n";
  }
  return md + "Last paragraph has the needle word again.\n";
}
function plainHtml() {
  let h = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Pair</title></head><body>\n<h1>Pair Document</h1>\n<p>Intro paragraph with the needle word for the find test, written in plain text only.</p>\n";
  for (let s = 1; s <= SECTION_COUNT; s++) {
    h += `<h2>Section ${s}</h2>\n<h3>Section ${s}.1</h3>\n${[1, 2, 3].map((k) => `<p>${filler(s, k)}</p>`).join("\n")}\n`;
    if (s === 1) h += "<ul><li>Item one<ul><li>Nested one</li><li>Nested two</li></ul></li><li>Item two</li><li>Item three</li></ul>\n<table><thead><tr><th>Name</th><th>Value</th><th>Note</th></tr></thead><tbody><tr><td>a</td><td>1</td><td>first</td></tr><tr><td>b</td><td>2</td><td>second</td></tr></tbody></table>\n";
    if (s === 2) h += `<pre><code class="language-python">\n\n\n${PY.replace(/</g, "&lt;")}\n\n\n</code></pre>\n`;
  }
  return h + "<p>Last paragraph has the needle word again.</p>\n</body></html>\n";
}
const STYLED = { fontSize: "18px", color: "rgb(200, 30, 30)", h1Color: "rgb(0, 128, 0)" };
const styledHtml = () => `<!doctype html><html><head><meta charset="utf-8"><title>Styled</title><style>body{font-size:18px;color:rgb(200,30,30)} h1{color:rgb(0,128,0)}</style></head><body>
<h1>Styled Page</h1><h2>Part one</h2>${lines(12, (i) => `<p>Styled paragraph ${i} with its own px font size and colour.</p>`)}
<h2>Part two</h2><p>External picture below must not load.</p><img src="https://example.com/o7-external.png" alt="external">
${lines(12, (i) => `<p>Second part paragraph ${i}.</p>`)}</body></html>\n`;
const SANITIZE = ["<script>window.__o7xss=1</script>", "<style>body{background:red}</style>", '<iframe src="https://example.com/o7-frame"></iframe>',
  '<form action="https://example.com/o7-form"><input name="q"></form>', '<p onclick="window.__o7click=1">onclick text</p>', '<img src="nothing.png" onerror="window.__o7err=1">',
  '<a href="javascript:window.__o7js=1">js link</a>', '<img src="https://example.com/o7-ext.png" alt="ext">'];
function aMd() {
  return ["# A Document", "", "Links: [plain page](plain.html), [the notebook](nb.ipynb), [go to Section B](#section-b).", "",
    "<h2>Body HTML Heading</h2>", "", ...SANITIZE.flatMap((s) => [s, ""]),
    "## Deep", "", "### Deep 3", "", "#### Deep 4", "", "##### Deep 5", "", "###### Deep 6", "", "Deep paragraph.", "",
    "## Diagram", "", "```mermaid", "graph TD", "  A[Start] --> B[End]", "```", "",
    ...Array.from({ length: 40 }, (_, i) => [`Filler paragraph ${i} keeps Section B below the fold.`, ""]).flat(),
    "## Section B", "", "Section B paragraph is the anchor target.", ""].join("\n");
}
const cellMd = (src) => ({ cell_type: "markdown", metadata: {}, source: src });
const cellCode = (src, count, outputs = []) => ({ cell_type: "code", execution_count: count, metadata: {}, outputs, source: src });
const nbJson = () => JSON.stringify({ nbformat: 4, nbformat_minor: 5, metadata: { kernelspec: { name: "python3", display_name: "Python 3", language: "python" }, language_info: { name: "python" } },
  cells: [cellMd("# Notebook Title\n\nIntro paragraph alpha of the notebook."), cellMd("## Section A\n\nText in section A."), cellMd(""),
    cellCode("print('hello')", 1, [{ output_type: "stream", name: "stdout", text: ["hello\n"] }]), cellMd("## Section B\n\nText in section B."),
    cellCode("x = 1", null), cellMd("## Section C\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\nEnd paragraph of section C.")] }, null, 1);
function writeFixtures(W) {
  mkdirSync(`${W}/sub`, { recursive: true });
  writeFileSync(`${W}/pair.md`, pairMd());
  writeFileSync(`${W}/plain.html`, plainHtml());
  writeFileSync(`${W}/styled.html`, styledHtml());
  writeFileSync(`${W}/a.md`, aMd());
  writeFileSync(`${W}/nb.ipynb`, nbJson());
  writeFileSync(`${W}/links-nb.html`, '<!doctype html><html><body><h1>Links</h1><p><a href="nb.ipynb">open the notebook</a></p></body></html>\n');
  writeFileSync(`${W}/data.csv`, "name,value,note\n" + lines(8, (i) => `row${i},${i},csv note ${i}`) + "\n");
  writeFileSync(`${W}/data.tsv`, "name\tvalue\n" + lines(8, (i) => `row${i}\t${i}`) + "\n");
  writeFileSync(`${W}/pic.svg`, '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#4a90d9"/><text x="10" y="45">svg</text></svg>\n');
  writeFileSync(`${W}/diagram.mmd`, "graph TD\n  A[One] --> B[Two]\n"); // editor/preview-kind.ts: mmd / mermaid
  writeFileSync(`${W}/code.py`, lines(400, (i) => `x_${i} = ${i}  # line ${i}`));
  writeFileSync(`${W}/scroll.md`, "# Scroll\n\n" + lines(150, (i) => `Paragraph ${i} with some words to fill the line.\n`));
  writeFileSync(`${W}/scroll.html`, `<!doctype html><html><body>${lines(200, (i) => `<p>HTML paragraph ${i}</p>`)}</body></html>`);
  // generated, the v0.8.1 Outline test file not located: about 2000 headings
  writeFileSync(`${W}/big.md`, lines(667, (i) => `# Big ${i}\n\n## Big ${i}.1\n\n### Big ${i}.1.1\n\ntext ${i}\n`));
  writeFileSync(`${W}/rename-me.txt`, "rename\n");
  writeFileSync(`${W}/move-me.txt`, "move\n");
  copyFileSync("D:/projects/workbench-core/specs/v0.8.1/mockups/outline/index.html", `${W}/mockup.html`);
  copyFileSync(`${REPO}/specs/v0.8.1/verify/ORDER-08/fixtures/links.html`, `${W}/links.html`);
  copyFileSync(`${REPO}/specs/v0.8.1/verify/ORDER-08/fixtures/beacon.html`, `${W}/beacon.html`);
  copyFileSync("D:/projects/edu-ai-rag-agent/labs/01-llm-langchain/01-llm-langchain-lab.ipynb", `${W}/lab.ipynb`); // read-only source, copied
}

// ---------------------------------------------------------------- sessions
let S = null; // { app, theme, folder, W, WW, DATA, settings, hwnd, net }
let sessionCount = 0;
const DARK = { theme_mode: "dark", editor_theme_mode: "dark", preview_theme_mode: "dark" };

async function endSession() {
  if (!S) return;
  try { S.app.kill(); } catch {} // cdp-lib kill: taskkill /T of the process this probe spawned only
  S = null;
  await sleepMs(2500);
}

async function startSession({ folder, theme }) {
  await endSession();
  const k = ++sessionCount;
  const D = `${TEMP}/v082-o7-${k}`, DW = D.replace(/\//g, "\\");
  const W = `${D}/ws`, WW = `${DW}\\ws`, DATA = `${D}/appdata/workbench-tauri`;
  rmSync(D, { recursive: true, force: true });
  mkdirSync(DATA, { recursive: true });
  writeFixtures(W);
  const settings = theme === "dark" ? { ...DARK } : {};
  if (Object.keys(settings).length) writeFileSync(`${DATA}/settings.json`, JSON.stringify(settings, null, 2) + "\n"); // One Light: no settings.json (default)
  const win = { id: "w1", folders: folder ? [{ id: "f1", path: WW, added_at: "2026-11-14T00:00:00.000Z" }] : [], active_folder_id: folder ? "f1" : null,
    sidebar: { width: 200 }, outline: { open: true, width: 240 }, recent_folders: folder ? [] : [WW] };
  writeFileSync(`${DATA}/state.json`, JSON.stringify({ version: 1, windows: [win] }));
  process.env.APPDATA = `${DW}\\appdata`;
  process.env.WEBVIEW2_USER_DATA_FOLDER = `${DW}\\webview`;
  const app = await launchApp(EXE);
  S = { app, theme: theme === "dark" ? "One Dark (settings.json *_mode dark)" : "One Light (default, no settings.json)", themeKey: theme, folder, W, WW, DATA, settings, hwnd: null, net: [] };
  app.on((m) => { if (m.method === "Network.requestWillBeSent") S?.net.push({ t: Date.now(), url: m.params.request.url }); });
  await app.send("Network.enable");
  await sleepMs(4000);
  const first = winput(["-Action", "foreground"]);
  S.hwnd = first.hwnd;
  await ev(PAGE_HELPERS);
  return S;
}

async function ensure(want) {
  if (S && S.folder === want.folder && S.themeKey === want.theme && !want.fresh) return S;
  return startSession(want);
}

// ---------------------------------------------------------------- app helpers
const ev = (js) => S.app.evaluate(js);
const sleep = (ms) => sleepMs(ms);
function winput(args) {
  const target = S?.hwnd ? ["-TargetHwnd", S.hwnd] : ["-ProcessId", String(S.app.pid)];
  const out = execFileSync("pwsh", ["-NoProfile", "-File", `${REPO}/tools/win-input.ps1`, ...target, ...args], { encoding: "utf8" });
  try { return JSON.parse(out); } catch { return { raw: out }; }
}
const keys = (...k) => winput(["-Action", "keys", "-Keys", k.join(",")]); // never a key with a comma (win-input splits on it)
const typeText = (text) => winput(["-Action", "type", "-Text", text]);
const shot = async (name) => { writeFileSync(`${OUT}/${name}.png`, Buffer.from((await S.app.send("Page.captureScreenshot", { format: "png" })).data, "base64")); return `${name}.png`; };
const monitorShot = (name, action = "state") => { const r = winput(["-Action", action, "-Out", `${OUT}/${name}.png`]); return { file: `${name}.png`, result: r }; };
const PAGE_HELPERS = `(()=>{window.__p={
  rgb:(name,at)=>{const s=document.createElement('span');s.style.color='var('+name+')';(at||document.body).appendChild(s);const c=getComputedStyle(s).color;s.remove();return c},
  r:(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:+b.x.toFixed(2),y:+b.y.toFixed(2),w:+b.width.toFixed(2),h:+b.height.toFixed(2)}},
  vis:(sel,root)=>[...(root||document).querySelectorAll(sel)].find(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0}), // not offsetParent: null for position:fixed and SVG
  n:(v)=>v==null||v===''?null:+parseFloat(v).toFixed(2)
};return 1})()`;
// bring into view, then refuse unless elementFromPoint hits the target (or, for a frame, the iframe element)
const pt = (js) => ev(`(()=>{const e=${js};if(!e)return null;e.scrollIntoView({block:"nearest",inline:"nearest"});const r=e.getBoundingClientRect();const x=Math.round(r.x+Math.min(r.width/2,60)),y=Math.round(r.y+r.height/2);const h=document.elementFromPoint(x,y);return {x,y,hit:!!h&&(h===e||e.contains(h))}})()`);
async function clickAt(x, y, { wait = 800, dbl = false, button = "left" } = {}) {
  await S.app.mouse("mouseMoved", x, y);
  for (let c = 1; c <= (dbl ? 2 : 1); c++) {
    await S.app.mouse("mousePressed", x, y, { clickCount: c, button });
    await S.app.mouse("mouseReleased", x, y, { clickCount: c, button });
  }
  await sleep(wait);
}
async function click(js, opts = {}) {
  const p = await pt(js);
  if (!p) throw new Error("not found " + js);
  if (!p.hit) throw new Error("click target covered or off-screen: " + js);
  await clickAt(p.x, p.y, opts);
  return p;
}
const exists = (js) => ev(`!!(${js})`);
async function waitFor(js, ms = 8000) { const t = Date.now(); while (Date.now() - t < ms) { if (await ev(`!!(${js})`).catch(() => false)) return Date.now() - t; await sleep(150); } return null; }
const row = (name) => `[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.textContent.trim()===${JSON.stringify(name)})`;
const paneEl = (pane) => `[...document.querySelectorAll('.pane')][${pane}]`;
const tab = (title, pane = 0) => `(${paneEl(pane)} ? [...${paneEl(pane)}.querySelectorAll('.tab')].find(e=>e.querySelector('.tab-title')?.textContent.trim()===${JSON.stringify(title)}) : null)`;
const active = (pane = 0) => ev(`${paneEl(pane)}?.querySelector(".tab.active .tab-title")?.textContent.trim() ?? null`);
const activeTabs = () => ev(`[...document.querySelectorAll('.pane')].map(p=>p.querySelector('.tab.active .tab-title')?.textContent.trim()??null)`);
const scroller = (pane = 0) => `(()=>{const p=${paneEl(pane)};return p?[...p.querySelectorAll('.cm-scroller, .markdown-preview')].find(e=>e.offsetParent):null})()`;
const mdPreview = `__p.vis('.markdown-preview:not(.html-preview)')`;
const outlineRow = (label) => `[...document.querySelectorAll('.outline-bar .tree-row')].find(e=>e.querySelector('.tree-label')?.textContent.trim()===${JSON.stringify(label)})`;
const outlineSelected = () => ev(`document.querySelector('.outline-bar .tree-row.selected .tree-label')?.textContent.trim() ?? null`);
const openFile = async (name) => { await click(row(name), { wait: 1800, dbl: true }); }; // a double-click opens a kept tab
const openPreviewBtn = `[...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`;
async function openPreview(name) { await openFile(name); await click(openPreviewBtn, { wait: 2500 }); }
// A heading document opens with its Outline (and so its preview sections, I-18) at depth 2 (I-10): H2 sections start folded.
// Content under them (pair.md's table and code block) is measured after Outline > Expand All.
async function expandAll() {
  await click(`document.querySelector('.outline-bar .tree-row')`, { wait: 300, button: "right" });
  await click(`[...document.querySelectorAll('#context-menu .menu-item')].find(e=>e.textContent.includes('Expand All'))`, { wait: 800 });
}
// A visible editor line of `pane` (the .cm-content box is the whole document: its centre is off-screen in a long file).
const cmLine = (pane = 0, starts = "") => `[...${paneEl(pane)}.querySelectorAll('.cm-line')].find(l=>{const r=l.getBoundingClientRect();return r.height>0&&r.top>=0&&r.bottom<=innerHeight&&l.textContent.startsWith(${JSON.stringify(starts)})})`;
// Click a visible editor line inside the visible text area: a line scrolled sideways (no wrap) starts under the gutter (run1 C).
async function clickLine(pane = 0, starts = "", opts = { wait: 400 }) {
  const p = await ev(`(()=>{const l=${cmLine(pane, starts)};if(!l)return null;const r=l.getBoundingClientRect();const sc=l.closest('.cm-scroller').getBoundingClientRect();const g=l.closest('.cm-editor').querySelector('.cm-gutters');
    const left=Math.max(r.left,sc.left+(g&&g.offsetParent?g.getBoundingClientRect().width:0))+12;const x=Math.round(left),y=Math.round(r.top+Math.min(r.height/2,10));const h=document.elementFromPoint(x,y);return {x,y,hit:!!h&&(h===l||l.contains(h))}})()`);
  if (!p) throw new Error(`no visible editor line "${starts}" in pane ${pane}`);
  if (!p.hit) throw new Error(`editor line "${starts}" covered at ${p.x},${p.y}`);
  await clickAt(p.x, p.y, opts);
}
async function closeAll() {
  for (let i = 0; i < 24; i++) {
    const n = await ev(`document.querySelectorAll('.pane .tab').length`);
    if (!n) return;
    if (await exists(`document.querySelector('dialog[open]')`)) throw new Error("a dialog is open while closing tabs (unsaved change?)");
    const close = `[...document.querySelectorAll('.pane .tab')].map(t=>t.querySelector('.tab-close[aria-label="Close Tab"], .tab-close[aria-label="Unpin Tab"]')).find(Boolean)`;
    const firstTab = `document.querySelector('.pane .tab')`;
    await click(firstTab, { wait: 300 });
    await click(close, { wait: 500 }).catch(async () => { keys("ctrl+w"); await sleep(500); });
  }
  throw new Error("tabs left after closeAll");
}
async function setSettings(patch) { // merged into the file as it is now (the app writes keys of its own, e.g. the Outline choices)
  const file = `${S.DATA}/settings.json`;
  let cur = {};
  try { cur = JSON.parse(readFileSync(file, "utf8")); } catch {}
  for (const [k, v] of Object.entries(patch)) if (v === undefined) delete cur[k]; else cur[k] = v;
  writeFileSync(file, JSON.stringify(cur, null, 2) + "\n"); // the app watches it (user-settings-changed)
  await sleep(2000);
}
async function moveMouseAway() { const p = await ev(`(()=>{const r=document.querySelector('.pane')?.getBoundingClientRect();return r?{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}:{x:300,y:300}})()`); await S.app.mouse("mouseMoved", p.x, p.y); await sleep(300); }

// ---------------------------------------------------------------- other CDP targets (HTML frame, Settings window)
async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; setTimeout(() => rej(new Error("ws timeout")), 5000); });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(JSON.stringify(d.error))) : p.res(d.result); } else if (d.method) listeners.forEach((f) => f(d)); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => { if (pending.delete(i)) rej(new Error("cdp timeout " + method)); }, 10000); });
  const evaluate = async (expression) => { const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result.value; };
  const mouse = (type, x, y, extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", ...extra });
  return { send, evaluate, mouse, on: (f) => listeners.push(f), closed: () => ws.readyState !== 1, close: () => { try { ws.close(); } catch {} } };
}
const targets = async () => (await fetch("http://127.0.0.1:9222/json/list")).json();
const frameSrc = (pane = null) => ev(`(()=>{const ps=[...document.querySelectorAll('.pane')];const roots=${pane === null ? "[document]" : `[ps[${pane}]].filter(Boolean)`};const f=roots.flatMap(r=>[...r.querySelectorAll('.html-frame')]).find(f=>f.offsetParent);return f?f.src:null})()`);
const F_HELPERS = `const __n=(v)=>v==null||v===''?null:+parseFloat(v).toFixed(2);const __r=(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:+b.x.toFixed(2),y:+b.y.toFixed(2),w:+b.width.toFixed(2),h:+b.height.toFixed(2)}};`;
async function frameEval(expr, pane = null) {
  const src = await frameSrc(pane);
  if (!src) throw new Error("no visible HTML frame");
  let t = null;
  for (let i = 0; i < 20 && !t; i++) {
    const list = (await targets()).filter((x) => x.type === "iframe" && x.webSocketDebuggerUrl);
    t = list.filter((x) => x.url === src).pop() ?? list.filter((x) => x.url.startsWith(src)).pop() ?? null;
    if (!t) await sleep(250);
  }
  if (!t) throw new Error("frame target not found for " + src);
  const c = await cdp(t.webSocketDebuggerUrl);
  try { return await c.evaluate(`(()=>{${F_HELPERS}return (${expr});})()`); } finally { c.close(); }
}
async function waitFrame(pane = null, ms = 10000) {
  const t = Date.now();
  while (Date.now() - t < ms) { if (await frameEval(`document.readyState==="complete"&&!!document.body&&document.body.childElementCount>0`, pane).catch(() => false)) return Date.now() - t; await sleep(250); }
  throw new Error("frame document not ready");
}
const frameScrollY = (pane = null) => frameEval("scrollY", pane);
// click inside the HTML frame: the element must be hit inside the frame and the frame must be hit in the app (zoom 1 only)
async function clickFrame(expr, pane = null, opts = {}) {
  const p = await frameEval(`(()=>{const e=${expr};if(!e)return null;e.scrollIntoView({block:"center"});const b=e.getBoundingClientRect();const x=b.x+Math.min(b.width/2,40),y=b.y+Math.min(b.height/2,10);const h=document.elementFromPoint(x,y);return {x,y,hit:!!h&&(h===e||e.contains(h)),zoom:parseFloat(document.documentElement.style.zoom||"1")}})()`, pane);
  if (!p) throw new Error("frame element not found " + expr);
  if (!p.hit) throw new Error("frame element covered " + expr);
  if (p.zoom !== 1) throw new Error("frame click at zoom " + p.zoom + " not supported");
  const src = await frameSrc(pane);
  const f = await ev(`(()=>{const f=[...document.querySelectorAll('.html-frame')].find(f=>f.src===${JSON.stringify(src)});const b=f.getBoundingClientRect();const x=Math.round(b.x+${p.x}),y=Math.round(b.y+${p.y});return {x,y,hit:document.elementFromPoint(x,y)===f}})()`);
  if (!f.hit) throw new Error("frame covered in the app at " + f.x + "," + f.y);
  await clickAt(f.x, f.y, opts);
  return f;
}
async function settingsWindow(ms = 8000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    const w = (await targets()).find((x) => x.type === "page" && /window=settings/.test(x.url));
    if (w) return cdp(w.webSocketDebuggerUrl);
    await sleep(300);
  }
  return null;
}
async function clickIn(c, js, wait = 800) {
  const p = await c.evaluate(`(()=>{const e=${js};if(!e)return null;e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();const x=Math.round(r.x+r.width/2),y=Math.round(r.y+r.height/2);const h=document.elementFromPoint(x,y);return {x,y,hit:!!h&&(h===e||e.contains(h))}})()`);
  if (!p || !p.hit) throw new Error("settings window target missing or covered: " + js);
  await c.mouse("mouseMoved", p.x, p.y);
  await c.mouse("mousePressed", p.x, p.y, { clickCount: 1 });
  await c.mouse("mouseReleased", p.x, p.y, { clickCount: 1 });
  await sleep(wait);
}
async function closeSettingsWindow(c) { try { await clickIn(c, `document.querySelector('.title-bar [aria-label="Close"]')`, 1200); } catch {} c.close(); }
async function openMenuItem(path) { // app menu: Open Application Menu > name > item
  await click(`document.querySelector('[aria-label="Open Application Menu"]')`, { wait: 400 });
  await click(`[...document.querySelectorAll('.menu-name')].find(e=>e.textContent.trim()===${JSON.stringify(path[0])})`, { wait: 400 });
  await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.offsetParent&&e.textContent.trim().startsWith(${JSON.stringify(path[1])}))`, { wait: 1200 });
}
async function userMenuItem(label) {
  await click(`document.querySelector('[aria-label="User menu"]')`, { wait: 400 });
  await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.offsetParent&&e.textContent.trim().startsWith(${JSON.stringify(label)}))`, { wait: 1200 });
}

// ---------------------------------------------------------------- records
let part = { section: "", deadline: 0, want: null, ensured: false };
async function item(id, expected, fn, { fresh = true } = {}) {
  const rec = { section: part.section, id, theme: S?.theme ?? null, activeTab: null, expected, measured: null, verdict: "unmeasured", note: "", shot: null };
  if (ONLY.length && !ONLY.includes(id)) return rec; // not asked for in this re-run
  put(rec);
  if (!part.ensured && part.want) { part.ensured = true; await ensure(part.want); } // a part launches only when one of its records runs
  if (Date.now() > part.deadline) { rec.note = "15-minute section budget used up (core ORDER-07 9.2: 측정 불가)"; save(); return rec; }
  console.log(`[${part.section}] ${id}`);
  try {
    if (!S) throw new Error("no app session");
    rec.theme = S.theme;
    if (fresh) { await closeAll(); winput(["-Action", "foreground"]); }
    const left = part.deadline - Date.now();
    const out = await Promise.race([fn(rec), sleepMs(left).then(() => { throw new Error("section budget ran out during this item"); })]);
    Object.assign(rec, out ?? {});
  } catch (e) {
    rec.verdict = "unmeasured";
    rec.note = (rec.note ? rec.note + " | " : "") + "error: " + e.message;
    try { rec.shot = rec.shot ?? await shot(`err-${id.replace(/[^\w.-]+/g, "_")}`); } catch {}
  }
  save();
  return rec;
}
const snap = async (rec) => { rec.activeTab = await activeTabs(); }; // the tab(s) shown when the value is read
const verdictOf = (ok) => (ok ? "pass" : "problem");
const unmeasured = (id, expected, why) => { put({ section: part.section, id, theme: S?.theme ?? null, activeTab: null, expected, measured: null, verdict: "unmeasured", note: why, shot: null }); save(); };
function derive(id, from, note = "") { // a regression line already measured above (each item once): its verdict is the source records'
  if (ONLY.length && !ONLY.includes(id)) return;
  const src = from.map((f) => R.records.find((r) => r.id === f));
  const v = src.some((r) => !r) ? "unmeasured" : src.some((r) => r.verdict === "problem") ? "problem" : src.every((r) => r.verdict === "pass") ? "pass" : "unmeasured";
  put({ section: part.section, id, theme: src.find(Boolean)?.theme ?? S?.theme ?? null, activeTab: null, expected: "same as " + from.join(", "), measured: src.map((r) => (r ? `${r.id}: ${r.verdict}` : "not run (run section B in the same invocation)")),
    verdict: v, note: note || "derived from the record(s) above, not measured twice", shot: null });
  save();
}
async function runPart(section, want, fn) {
  part = { section, deadline: Date.now() + BUDGET_MS, want, ensured: false };
  try { await fn(); } catch (e) { unmeasured(`${section}-part-error`, "the part runs", "error: " + e.message); }
}

// ================================================================ B welcome part (ORDER-05 #6, #8·9; fresh session, no folder)
async function partWelcome() {
  await item("O5-6", "settings.json absent -> all three areas One Light (I-2 기본), first screen capture", async (rec) => {
    await snap(rec);
    const m = await ev(`({appearance:document.documentElement.dataset.appearance??null,status:[...document.querySelectorAll('.status-bar button')].map(b=>b.getAttribute('aria-label'))})`);
    m.settingsFile = existsSync(`${S.DATA}/settings.json`);
    const ok = !m.settingsFile && m.appearance === "light" && ["UI: Light Theme", "Editor: Light Theme", "Preview: Light Theme"].every((l) => m.status.includes(l));
    return { measured: m, verdict: verdictOf(ok), shot: await shot("O5-6-first-screen-onelight") };
  }, { fresh: false });
  await item("O5-8·9-welcome", "Welcome (icon, title, subtitle, GET STARTED two rows) centred in the pane (|dx|,|dy| <= 1 px); side by side with Zed G1-welcome-zed.png", async (rec) => {
    await snap(rec);
    const m = await ev(`(()=>{const w=document.querySelector('.welcome');if(!w)return null;const c=__p.r(w.querySelector('.welcome-content'));const pane=__p.r(w.closest('.pane')||w.parentElement);const wr=__p.r(w);
      return {content:c,welcome:wr,pane,dxPane:+(c.x+c.w/2-(pane.x+pane.w/2)).toFixed(2),dyPane:+(c.y+c.h/2-(pane.y+pane.h/2)).toFixed(2),dxWelcome:+(c.x+c.w/2-(wr.x+wr.w/2)).toFixed(2),dyWelcome:+(c.y+c.h/2-(wr.y+wr.h/2)).toFixed(2),
      title:w.querySelector('h1')?.textContent,subtitle:w.querySelector('.welcome-header p')?.textContent,sections:[...w.querySelectorAll('section')].map(s=>s.getAttribute('aria-label')),rows:[...w.querySelectorAll('.welcome-row')].map(r=>r.innerText.replace(/\\s+/g,' ').trim())}})()`);
    for (const p of ["D:/projects/workbench-core/specs/v0.8.2/img/G1-welcome-zed.png", "D:/projects/workbench-core/specs/v0.8.2/img/G1-welcome-zed-hover.png"]) if (existsSync(p)) copyFileSync(p, `${OUT}/zed-${p.split("/").pop()}`);
    const ok = m && near(m.dxWelcome, 0, 1) && near(m.dyWelcome, 0, 1) && m.title === "Welcome to Workbench" && m.subtitle === "A compact, powerful editor";
    return { measured: m, verdict: verdictOf(ok), shot: await shot("O5-8-welcome"), note: "Zed captures copied to out/zed-G1-welcome-zed*.png for side by side (leader-core judges the look). Centre is checked against the .welcome box; the pane centre offset is recorded too." };
  }, { fresh: false });
  await item("O5-9.2-icon", "app icon sharp: natural size >= drawn size x devicePixelRatio", async (rec) => {
    await snap(rec);
    const m = await ev(`(()=>{const i=document.querySelector('.welcome-logo');return i?{natural:[i.naturalWidth,i.naturalHeight],drawn:__p.r(i),dpr:devicePixelRatio,complete:i.complete}:null})()`);
    return { measured: m, verdict: verdictOf(m && m.complete && m.natural[0] >= m.drawn.w * m.dpr), note: "visual sharpness beyond the pixel ratio is for the user (V4)" };
  }, { fresh: false });
  await item("O5-8·9-nofile", 'left dock "No File" = Outline "No outline": font family, size, weight, colour, line height, padding (I-3 #9)', async (rec) => {
    await snap(rec);
    const m = await ev(`(()=>{const pick=e=>{if(!e)return null;const s=getComputedStyle(e);return {text:e.textContent.trim(),visible:!!e.offsetParent,fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,color:s.color,lineHeight:s.lineHeight,padding:s.padding,margin:s.margin,textAlign:s.textAlign}};
      return {noFile:pick(document.querySelector('.dock-left .outline-empty')),noOutline:pick(document.querySelector('.outline-bar .outline-empty')),oldButton:!!document.querySelector('.dock-left .panel-button')}})()`);
    const keys_ = ["fontFamily", "fontSize", "fontWeight", "color", "lineHeight", "padding", "margin", "textAlign"];
    const ok = m.noFile?.text === "No File" && m.noOutline?.text === "No outline" && m.noFile.visible && m.noOutline.visible && keys_.every((k) => m.noFile[k] === m.noOutline[k]);
    return { measured: m, verdict: m.noFile?.visible && m.noOutline?.visible ? verdictOf(ok) : "unmeasured", note: m.noFile?.visible && m.noOutline?.visible ? "" : "the left dock or the Outline is not shown in this state", shot: await shot("O5-9-nofile") };
  }, { fresh: false });
  await item("O5-8·9-rows", "GET STARTED rows run their command: Open Settings -> the Settings window opens", async (rec) => {
    await snap(rec);
    await click(`[...document.querySelectorAll('.welcome-row')].find(r=>r.textContent.includes('Open Settings'))`, { wait: 1500 });
    const c = await settingsWindow();
    const m = { settingsWindowOpened: !!c };
    if (c) await closeSettingsWindow(c);
    winput(["-Action", "foreground"]);
    return { measured: m, verdict: verdictOf(m.settingsWindowOpened), note: "Open Folder row: unmeasured — it opens the native folder dialog, which the probe cannot close safely (win-input sends to the app window only)" };
  }, { fresh: false });
  await item("O5-8·9-recent", "clicking the RECENT PROJECTS row opens that folder (tree rows appear, Welcome goes)", async (rec) => {
    await snap(rec);
    await click(`[...document.querySelectorAll('.welcome-row')].find(r=>r.querySelector('.welcome-label')?.textContent.trim()==='ws')`, { wait: 2500 });
    const ms = await waitFor(`document.querySelector('.tree-window .tree-row')`, 8000);
    const m = { treeRowsAfterMs: ms, welcomeGone: !(await exists(`document.querySelector('.welcome')`)), recentRows: R.records.find((r) => r.id === "O5-8·9-welcome")?.measured?.rows };
    if (ms !== null) S.folder = true; // the session continues as a folder session
    return { measured: m, verdict: verdictOf(ms !== null && m.welcomeGone), shot: await shot("O5-8-after-recent") };
  }, { fresh: false });
}

// ================================================================ A: ORDER-07 6절 기능
async function partA() {
  const zoomState = (pane = null) => frameEval(`({zoom:document.documentElement.style.zoom||"",computedZoom:getComputedStyle(document.documentElement).zoom,bodyFontSize:getComputedStyle(document.body).fontSize,pHeight:__r(document.querySelector('p'))?.h,pFontSize:getComputedStyle(document.querySelector('p')).fontSize})`, pane);
  const appSize = () => ev(`getComputedStyle(${mdPreview}??document.querySelector('.markdown-preview')).getPropertyValue('--typography-preview-font-size').trim()`);
  const focusInside = async () => { await clickFrame(`[...document.querySelectorAll('p')][2]`); return ev(`document.activeElement?.tagName`); };
  const focusOutside = async (title) => {
    await click(tab(title), { wait: 600 });
    let how = "tab click";
    let where = await ev(`(()=>{const a=document.activeElement;return {tag:a?.tagName,cls:a?.className,inPreview:!!a?.closest?.('.html-preview')}})()`);
    if (where.tag === "IFRAME" || !where.inPreview) { await ev(`document.querySelector('.html-preview')?.focus()`); how = "element.focus() by CDP (no spot outside the frame takes a click: the frame fills the tab)"; where = await ev(`(()=>{const a=document.activeElement;return {tag:a?.tagName,cls:a?.className,inPreview:!!a?.closest?.('.html-preview')}})()`); }
    return { how, where };
  };

  await item("O7-6.1", "Outline row click in the HTML preview tab scrolls the frame: scrollY before < after, the heading at the frame top (|top| <= 2 px or end of document)", async (rec) => {
    await openPreview("plain.html");
    await waitFrame();
    await snap(rec);
    const rows = await ev(`[...document.querySelectorAll('.outline-bar .tree-row .tree-label')].map(e=>e.textContent.trim())`);
    const before = await frameScrollY();
    await click(outlineRow("Section 5"), { wait: 1200 });
    const after = await frameScrollY();
    const h = await frameEval(`(()=>{const h=[...document.querySelectorAll('h2')].find(e=>e.textContent.trim()==='Section 5');return {top:__r(h)?.y,maxScroll:document.documentElement.scrollHeight-innerHeight}})()`);
    const ok = rows.includes("Section 5") && after > before && (Math.abs(h.top) <= 2 || near(after, h.maxScroll, 2));
    return { measured: { outlineRows: rows, before, after, headingTop: h.top, maxScroll: h.maxScroll, selected: await outlineSelected() }, verdict: verdictOf(ok), shot: await shot("O7-6.1-outline-click") };
  });
  await item("O7-6.2", 'paragraph click in the frame (under "Section 3.1", folded at depth 2) -> Outline selected row "Section 3.1" (unfolded to show it)', async (rec) => {
    await click(tab("Preview plain.html"), { wait: 600 });
    await snap(rec);
    await clickFrame(`[...document.querySelectorAll('p')].find(p=>p.textContent.includes('Paragraph 2 of section 3'))`, null, { wait: 1200 });
    const sel = await outlineSelected();
    return { measured: { selected: sel }, verdict: verdictOf(sel === "Section 3.1"), shot: await shot("O7-6.2-frame-click") };
  }, { fresh: false });
  for (const file of ["plain.html", "styled.html"]) {
    for (const where of ["in", "out"]) {
      await item(`O7-6.3-${file.replace(".html", "")}-${where}`, `focus ${where === "in" ? "inside" : "outside"} the frame, Ctrl+= once (SendInput): root zoom 1 -> >1 and drawn text grows (${file === "styled.html" ? "page CSS 18px" : "no CSS"}); Ctrl+0 -> zoom 1`, async (rec) => {
        if (!(await exists(tab(`Preview ${file}`)))) { await closeAll(); await openPreview(file); await waitFrame(); }
        await click(tab(`Preview ${file}`), { wait: 600 });
        const focus = where === "in" ? { activeElement: await focusInside() } : await focusOutside(`Preview ${file}`);
        await snap(rec);
        const before = { ...(await zoomState()), appPreviewSize: await appSize() };
        keys("ctrl+=");
        await sleep(1200);
        const after = { ...(await zoomState()), appPreviewSize: await appSize() };
        const s = await shot(`O7-6.3-${file.replace(".html", "")}-${where}-zoomed`);
        keys("ctrl+0");
        await sleep(1200);
        const reset = { ...(await zoomState()), appPreviewSize: await appSize() };
        const z = (o) => parseFloat(o.zoom || "1");
        const ok = z(before) === 1 && z(after) > 1 && after.pHeight > before.pHeight && z(reset) === 1;
        return { measured: { focus, before, after, reset }, verdict: verdictOf(ok), shot: s, note: "bodyFontSize is the computed (unzoomed) value; root zoom and the drawn paragraph height show the growth (K-08: root zoom)" };
      }, { fresh: false });
    }
  }
  await closeAll().catch(() => {});
  for (const where of ["in", "out"]) {
    await item(`O7-6.4-${where}`, `focus ${where === "in" ? "inside" : "outside"} the frame, Ctrl+F (SendInput) opens the app find bar; "needle" -> count 1/2; Enter (next) -> 2/2 and the frame scrolls`, async (rec) => {
      if (!(await exists(tab("Preview plain.html")))) { await openPreview("plain.html"); await waitFrame(); }
      await click(tab("Preview plain.html"), { wait: 600 });
      await frameEval("scrollTo(0,0)");
      const focus = where === "in" ? { activeElement: await focusInside() } : await focusOutside("Preview plain.html");
      await frameEval("scrollTo(0,0)");
      await snap(rec);
      const winsBefore = where === "in" ? winput(["-Action", "windows"]).windows : null;
      keys("ctrl+f");
      await sleep(900);
      const bar = await ev(`(()=>{const b=document.querySelector('.html-preview .preview-search');return {present:!!b,focusInInput:document.activeElement?.getAttribute('aria-label')==='Find'}})()`);
      const barShot = await shot(`O7-6.4-${where}-findbar`);
      let wv = null;
      if (where === "in") { const m = monitorShot("O7-6.4-webview-find-monitor", "windows"); wv = { before: winsBefore, after: m.result.windows, file: m.file }; }
      typeText("needle");
      await sleep(1200);
      const count1 = await ev(`document.querySelector('.html-preview .document-search-count')?.textContent ?? null`);
      const y1 = await frameScrollY();
      keys("enter");
      await sleep(1200);
      const count2 = await ev(`document.querySelector('.html-preview .document-search-count')?.textContent ?? null`);
      const y2 = await frameScrollY();
      keys("esc");
      await sleep(600);
      const closed = !(await exists(`document.querySelector('.html-preview .preview-search')`));
      const ok = bar.present && count1 === "1/2" && count2 === "2/2" && y2 !== y1;
      if (wv) R.webviewFind = wv;
      return { measured: { focus, bar, count1, scrollY1: y1, count2, scrollY2: y2, closedByEsc: closed }, verdict: verdictOf(ok), shot: barShot };
    }, { fresh: false });
  }
  await item("O7-6.4-webview-find", "no WebView find window: visible top-level windows of the app process tree are the same before and after Ctrl+F in the frame (full-monitor capture)", async (rec) => {
    await snap(rec);
    const wv = R.webviewFind;
    if (!wv) return { verdict: "unmeasured", note: "O7-6.4-in did not reach the capture" };
    const t = (l) => (l ?? []).map((w) => String(w).replace(/ rect=.*$/, "")).sort().join(";"); // "hwnd pid class title", rect left out
    return { measured: wv, verdict: verdictOf(t(wv.before) === t(wv.after)), shot: wv.file };
  }, { fresh: false });
}

// ================================================================ B main part (ORDER-02~06 6절 + 9.2 + 8절)
async function partB() {
  // ORDER-04 9.2: first open of an H1 document's preview with the Outline open (before any other use of pair.md)
  await item("O4-9.2-firstopen", "Outline open, first open of an H1 document's preview: Outline shows depth 2 (H1, H2) only (I-10); the preview's folds follow the link (reported)", async (rec) => {
    await openPreview("pair.md");
    await sleep(1000);
    await snap(rec);
    const m = await ev(`({outlineLevels:[...document.querySelectorAll('.outline-bar .tree-row')].map(r=>+r.getAttribute('aria-level')),outlineRows:document.querySelectorAll('.outline-bar .tree-row').length,
      previewFoldedBlocks:document.querySelectorAll('.markdown-body [data-folded]').length,previewH3Shown:[...document.querySelectorAll('.markdown-body h3')].filter(h=>h.offsetParent&&!h.closest('[data-folded]')).length,
      chevrons:[...document.querySelectorAll('.markdown-body .heading-fold')].map(b=>b.getAttribute('aria-expanded'))})`);
    return { measured: m, verdict: verdictOf(m.outlineRows > 0 && m.outlineLevels.every((l) => l <= 2)), shot: await shot("O4-9.2-firstopen"), note: "preview fold state is reported as measured (ORDER-04 3.7 asks for a report)" };
  });
  await item("O2-8", "preview code line numbers on: code cell and code block numbered from 1, colour = editor line number colour (non-active line)", async (rec) => {
    await setSettings({ preview_code_line_numbers: true });
    await openFile("code.py");
    const editorColor = await ev(`(()=>{const g=[...document.querySelectorAll('.cm-lineNumbers .cm-gutterElement')].filter(e=>e.offsetParent&&!e.classList.contains('cm-activeLineGutter')&&/\\d/.test(e.textContent));return g[1]?getComputedStyle(g[1]).color:null})()`);
    await openPreview("pair.md");
    await expandAll();
    await snap(rec);
    const md = await ev(`(()=>{const g=__p.vis('.markdown-body .code-line-numbers');return g?{display:getComputedStyle(g).display,color:getComputedStyle(g).color,lines:g.dataset.lines}:null})()`);
    const s1 = await shot("O2-8-md-linenumbers");
    await openPreview("nb.ipynb");
    const nb = await ev(`(()=>{const g=__p.vis('.markdown-body .nb-code .code-line-numbers');return g?{display:getComputedStyle(g).display,color:getComputedStyle(g).color,lines:g.dataset.lines}:null})()`);
    await shot("O2-8-nb-linenumbers");
    await setSettings({ preview_code_line_numbers: undefined });
    const ok = md && nb && md.display !== "none" && nb.display !== "none" && /^1\b/.test(md.lines ?? "") && /^1\b/.test(nb.lines ?? "") && md.color === editorColor && nb.color === editorColor;
    return { measured: { editorLineNumberColor: editorColor, md, nb }, verdict: verdictOf(ok), shot: s1 };
  });
  await item("O2-1·3", "md and ipynb preview text start equal; fixed left margin = container padding + left margin = 78 px (14 + 64 at 14 px); editor text start with line numbers off = 78 px (I-13)", async (rec) => {
    const start = (sel) => ev(`(()=>{const pv=${mdPreview};const b=pv.querySelector('.markdown-body');const p=pv.querySelector(${JSON.stringify(sel)});const pr=pv.getBoundingClientRect(),br=b.getBoundingClientRect(),r=p.getBoundingClientRect();
      return {textFromPreview:+(r.left-pr.left).toFixed(2),bodyFromPreview:+(br.left-pr.left).toFixed(2),fixed:+(parseFloat(getComputedStyle(pv).paddingLeft)+(r.left-br.left)).toFixed(2),previewWidth:+pr.width.toFixed(1)}})()`);
    await openPreview("pair.md");
    const md = await start(":scope .markdown-body > p");
    await openPreview("nb.ipynb");
    const nb = await start(".nb-markdown p");
    await shot("O2-1-nb-start");
    await setSettings({ editor_line_numbers: false });
    await openFile("code.py");
    await snap(rec);
    const ed = await ev(`(()=>{const ed=__p.vis('.cm-editor');const line=ed.querySelector('.cm-line');const w=document.createTreeWalker(line,NodeFilter.SHOW_TEXT);const t=w.nextNode();const rg=document.createRange();rg.setStart(t,0);rg.setEnd(t,1);
      return {textFromEditor:+(rg.getBoundingClientRect().left-ed.getBoundingClientRect().left).toFixed(2),gutters:!!ed.querySelector('.cm-gutters')?.offsetParent}})()`);
    const s = await shot("O2-3-editor-no-linenumbers");
    await setSettings({ editor_line_numbers: undefined });
    const ok = near(md.textFromPreview, nb.textFromPreview) && near(md.fixed, 78) && near(nb.fixed, 78) && near(ed.textFromEditor, 78);
    return { measured: { md, nb, editor: ed }, verdict: verdictOf(ok), shot: s, note: "textFromPreview includes any centring of the 700 px body in a wide pane (I-13: the editor does not follow it); 'fixed' is padding + margin" };
  });
  await item("O2-2", "notebook: [1] and [ ] inside the 64 px left margin, beside the code box (no line above it)", async (rec) => {
    await openPreview("nb.ipynb");
    await snap(rec);
    const m = await ev(`[...document.querySelectorAll('.markdown-body .nb-code')].map(c=>{const n=c.querySelector('.nb-count'),box=c.querySelector('.code-block'),b=c.closest('.markdown-body');const nr=n.getBoundingClientRect(),xr=box.getBoundingClientRect(),br=b.getBoundingClientRect();
      return {text:n.textContent,countLeftFromBody:+(nr.left-br.left).toFixed(2),countRightToBox:+(xr.left-nr.right).toFixed(2),countTopToBox:+(nr.top-xr.top).toFixed(2),marginPx:parseFloat(getComputedStyle(b).paddingLeft)}})`);
    const ok = m.length === 2 && m[0].text === "[1]" && m[1].text === "[ ]" && m.every((c) => c.countLeftFromBody >= 0 && c.countRightToBox >= 0 && c.countLeftFromBody < c.marginPx && c.countTopToBox >= -1);
    return { measured: m, verdict: verdictOf(ok), shot: await shot("O2-2-notebook") };
  });
  await item("O2-4", "md and ipynb table width = body content width; CSV table content-sized (narrower)", async (rec) => {
    const tw = () => ev(`(()=>{const b=__p.vis('.markdown-body');const t=b.querySelector('table');const s=getComputedStyle(b);return {table:t?+t.getBoundingClientRect().width.toFixed(2):null,body:+(b.getBoundingClientRect().width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)).toFixed(2)}})()`);
    await openPreview("pair.md");
    await expandAll();
    const md = await tw();
    await openPreview("nb.ipynb");
    const nb = await tw();
    await openPreview("data.csv");
    await snap(rec);
    const csv = await tw();
    const ok = near(md.table, md.body, 1) && near(nb.table, nb.body, 1) && csv.table < csv.body - 1;
    return { measured: { md, nb, csv }, verdict: verdictOf(ok), shot: await shot("O2-4-csv") };
  });
  let sizes = null;
  await item("O2-5", "at 14 px: code block, notebook output and table text 12.04 px, inline code 12.25 px", async (rec) => {
    await openPreview("pair.md");
    const md = await ev(`(()=>{const b=__p.vis('.markdown-body');const cs=e=>e?getComputedStyle(e):null;const pre=b.querySelector('.code-block pre');const td=b.querySelector('td');
      return {body:__p.n(cs(b.querySelector('p')).fontSize),pre:__p.n(cs(pre).fontSize),preLineHeight:__p.n(cs(pre).lineHeight),td:__p.n(cs(td).fontSize)}})()`);
    await openPreview("a.md");
    const inline = await ev(`(()=>{const b=__p.vis('.markdown-body');const c=[...b.querySelectorAll('code')].find(c=>!c.closest('pre'));return c?__p.n(getComputedStyle(c).fontSize):null})()`);
    await openPreview("nb.ipynb");
    await snap(rec);
    const nb = await ev(`(()=>{const b=__p.vis('.markdown-body');const cs=e=>e?getComputedStyle(e):null;const pre=b.querySelector('.nb-code .code-block pre'),out=b.querySelector('.nb-output');
      return {pre:__p.n(cs(pre).fontSize),preLineHeight:__p.n(cs(pre).lineHeight),output:__p.n(cs(out).fontSize),outputLineHeight:__p.n(cs(out).lineHeight)}})()`);
    sizes = { md, nb, inline };
    const ok = md.body === 14 && near(md.pre, 12.04, 0.01) && near(md.td, 12.04, 0.01) && near(nb.pre, 12.04, 0.01) && near(nb.output, 12.04, 0.01) && (inline === null || near(inline, 12.25, 0.01));
    return { measured: sizes, verdict: verdictOf(ok), note: inline === null ? "a.md has no inline code: inline size not measured" : "" };
  });
  await item("O2-6", "code block, code cell and output line height = font size x 1.45 (default), computed", async (rec) => {
    await snap(rec);
    if (!sizes) return { verdict: "unmeasured", note: "O2-5 values missing" };
    const chk = (fs, lh) => near(lh, fs * 1.45, 0.06);
    const ok = chk(sizes.md.pre, sizes.md.preLineHeight) && chk(sizes.nb.pre, sizes.nb.preLineHeight) && chk(sizes.nb.output, sizes.nb.outputLineHeight);
    return { measured: { md: [sizes.md.pre, sizes.md.preLineHeight], codeCell: [sizes.nb.pre, sizes.nb.preLineHeight], output: [sizes.nb.output, sizes.nb.outputLineHeight] }, verdict: verdictOf(ok), note: "values read in O2-5 (same open documents)" };
  }, { fresh: false });
  derive("O2-9.2", ["O2-1·3", "O2-2"], "ORDER-02 9.2 (chevron/[n] inside the 64 px margin, editor text start 78 px) is read by O2-1·3 and O2-2");

  // ORDER-03
  await item("O3-1-notebook", "user notebook (copy of 01-llm-langchain-lab.ipynb): first line drawn as a heading; first screen capture", async (rec) => {
    await openPreview("lab.ipynb");
    await sleep(1500);
    await snap(rec);
    const m = await ev(`(()=>{const c=document.querySelector('.markdown-body .nb-cell');const e=c?.querySelector('h1,h2,h3,h4,h5,h6,p,pre');return {firstCell:c?.className,firstTag:e?.tagName,firstText:e?.textContent.trim().slice(0,80)}})()`);
    return { measured: m, verdict: verdictOf(/^H[1-6]$/.test(m.firstTag ?? "")), shot: await shot("O3-1-user-notebook") };
  });
  await item("O3-1-bodyhtml", 'markdown body HTML <h2>Body HTML Heading</h2> drawn as an h2 (capture)', async (rec) => {
    await openPreview("a.md");
    await snap(rec);
    const m = await ev(`(()=>{const h=[...document.querySelectorAll('.markdown-body h2')].find(e=>e.textContent.includes('Body HTML Heading'));return h?{tag:h.tagName,fontSize:getComputedStyle(h).fontSize}:null})()`);
    return { measured: m, verdict: verdictOf(!!m), shot: await shot("O3-1-bodyhtml") };
  });
  await item("O3-8-sanitize", "ORDER-07 8절: the sanitized .markdown-body innerHTML has no script, style, iframe, form, onclick/onerror, javascript: URL, external img src", async (rec) => {
    await openPreview("a.md");
    await snap(rec);
    const html = await ev(`__p.vis('.markdown-body').innerHTML`);
    writeFileSync(`${OUT}/O3-8-sanitize-dump.html`, html);
    // Checked on the DOM: the app's own Mermaid SVG carries a <style> (run1 false hit), and a local picture is an http://asset.localhost URL.
    const left = await ev(`(()=>{const b=__p.vis('.markdown-body');const q=s=>[...b.querySelectorAll(s)];const ext=u=>/^(https?:)?\\/\\//i.test(u)&&!/^https?:\\/\\/([a-z0-9-]+\\.)*localhost\\//i.test(u);
      return {script:q('script').length,styleOutsideAppSvg:q('style').filter(s=>!s.closest('svg[id^="mermaid"]')).map(s=>s.textContent.slice(0,60)),iframe:q('iframe').length,form:q('form').length,
        onclick:q('[onclick]').length,onerror:q('[onerror]').length,javascriptUrl:q('[href],[src]').filter(e=>/^\\s*javascript:/i.test(e.getAttribute('href')??e.getAttribute('src')??'')).length,
        externalSrc:q('[src],[srcset]').map(e=>e.getAttribute('src')??'').filter(ext),appSvgStyles:q('svg style').length}})()`);
    const found = Object.entries(left).filter(([k, v]) => k !== "appSvgStyles" && (Array.isArray(v) ? v.length : v)).map(([k]) => k);
    const ran = await ev(`({xss:window.__o7xss??null,click:window.__o7click??null,err:window.__o7err??null,js:window.__o7js??null})`);
    return { measured: { left: found, counts: left, pageFlags: ran, dumpChars: html.length }, note: "the one <style> in the dump is inside the app-drawn Mermaid SVG (a.md's ```mermaid block), not from the test input", verdict: verdictOf(!found.length && Object.values(ran).every((v) => v === null)), shot: "O3-8-sanitize-dump.html" };
  });
  await item("O3-6", "three link combos open preview tabs: md preview -> .html, md preview -> .ipynb, HTML preview -> .ipynb", async (rec) => {
    const out = {};
    await openPreview("a.md");
    await click(`[...document.querySelectorAll('.markdown-body a')].find(a=>a.textContent.trim()==='plain page')`, { wait: 2500 });
    out.mdToHtml = { active: await active(), html: await exists(`__p.vis('.html-frame')`) };
    await closeAll();
    await openPreview("a.md");
    await click(`[...document.querySelectorAll('.markdown-body a')].find(a=>a.textContent.trim()==='the notebook')`, { wait: 2500 });
    out.mdToIpynb = { active: await active(), notebook: await exists(`__p.vis('.markdown-body .nb-cell')`) };
    await closeAll();
    await openPreview("links-nb.html");
    await waitFrame();
    await clickFrame(`document.querySelector('a')`, null, { wait: 2500 });
    await snap(rec);
    out.htmlToIpynb = { active: await active(), notebook: await exists(`__p.vis('.markdown-body .nb-cell')`) };
    const ok = out.mdToHtml.active === "Preview plain.html" && out.mdToHtml.html && out.mdToIpynb.active === "Preview nb.ipynb" && out.mdToIpynb.notebook && out.htmlToIpynb.active === "Preview nb.ipynb" && out.htmlToIpynb.notebook;
    return { measured: out, verdict: verdictOf(ok), shot: await shot("O3-6-html-to-ipynb") };
  });

  // ORDER-04
  await item("O4-1", "HTML edit tab Outline is the h1~h6 heading tree (no tag items); capture", async (rec) => {
    await openFile("plain.html");
    await sleep(1000);
    await snap(rec);
    const labels = await ev(`[...document.querySelectorAll('.outline-bar .tree-row .tree-label')].map(e=>e.textContent.trim())`);
    const heads = ["Pair Document", ...Array.from({ length: SECTION_COUNT }, (_, i) => [`Section ${i + 1}`, `Section ${i + 1}.1`]).flat()];
    return { measured: labels, verdict: verdictOf(labels.length > 0 && labels.every((l) => heads.includes(l))), shot: await shot("O4-1-html-edit-outline") };
  });
  await item("O4-2", 'ipynb preview: click "Text in section B." -> Outline selected "Section B"; Outline click "Section C" -> selected "Section C"', async (rec) => {
    await openPreview("nb.ipynb");
    await snap(rec);
    await click(`[...document.querySelectorAll('.markdown-body p')].find(p=>p.textContent.includes('Text in section B'))`, { wait: 900 });
    const afterClick = await outlineSelected();
    await click(outlineRow("Section C"), { wait: 900 });
    const afterOutline = await outlineSelected();
    return { measured: { afterClick, afterOutline }, verdict: verdictOf(afterClick === "Section B" && afterOutline === "Section C"), shot: await shot("O4-2-ipynb-click") };
  });
  await item("O4-4", "heading Outline right-click menu: Show Icons, Show Numbers, Expand All, Collapse All, Show Heading Colors; capture with numbers and heading colours on", async (rec) => {
    await openPreview("a.md");
    await snap(rec);
    const menu = async () => { await click(outlineRow("A Document"), { wait: 300, button: "right" }); return ev(`[...document.querySelectorAll('#context-menu .menu-item')].map(e=>({label:e.textContent.replace('✓','').trim(),checked:e.getAttribute('aria-checked')}))`); };
    const pick = (label) => click(`[...document.querySelectorAll('#context-menu .menu-item')].find(e=>e.textContent.includes(${JSON.stringify(label)}))`, { wait: 600 });
    const first = await menu();
    await pick("Show Numbers");
    await menu();
    await pick("Show Heading Colors");
    const both = await menu();
    const s = await shot("O4-4-outline-menu-numbers-colors");
    keys("esc");
    await sleep(400);
    const want = ["Show Icons", "Show Numbers", "Expand All", "Collapse All", "Show Heading Colors"];
    const ok = want.every((w) => first.some((m) => m.label === w)) && both.find((m) => m.label === "Show Numbers")?.checked === "true" && both.find((m) => m.label === "Show Heading Colors")?.checked === "true";
    return { measured: { first, both }, verdict: verdictOf(ok), shot: s };
  });
  await item("O4-6", "heading colours on: Outline H1~H3 label colour = UI --heading-color-N; preview H1~H3 colour = Preview --heading-color-N (computed)", async (rec) => {
    await openPreview("pair.md");
    await click(outlineRow("Pair Document"), { wait: 300, button: "right" });
    await click(`[...document.querySelectorAll('#context-menu .menu-item')].find(e=>e.textContent.includes('Expand All'))`, { wait: 700 });
    await snap(rec);
    const m = await ev(`[1,2,3].map(n=>{const l=document.querySelector('.outline-bar .tree-label.heading-'+n);const h=__p.vis('.markdown-body h'+n);
      return {level:n,outline:l?getComputedStyle(l).color:null,outlineExpected:l?__p.rgb('--heading-color-'+n,l.parentElement):null,preview:h?getComputedStyle(h).color:null,previewExpected:h?__p.rgb('--heading-color-'+n,h.parentElement):null,headingColorsClass:document.documentElement.classList.contains('heading-colors')}})`);
    const ok = m.every((x) => x.outline && x.outline === x.outlineExpected && x.preview && x.preview === x.previewExpected);
    return { measured: m, verdict: verdictOf(ok), shot: await shot("O4-6-heading-colors") };
  });
  await item("O4-9.2-longnum", "number style: the long H6 number (1.1.1.1.1) and its label do not overlap (capture)", async (rec) => {
    await openPreview("a.md");
    await click(outlineRow("A Document"), { wait: 300, button: "right" });
    await click(`[...document.querySelectorAll('#context-menu .menu-item')].find(e=>e.textContent.includes('Expand All'))`, { wait: 700 });
    await snap(rec);
    const m = await ev(`(()=>{const r=${outlineRow("Deep 6")};if(!r)return null;const n=r.querySelector('.outline-number'),l=r.querySelector('.tree-label');return {number:n?.textContent,numberRight:__p.r(n)?.x+__p.r(n)?.w,labelLeft:__p.r(l)?.x,labelOverflow:l.scrollWidth>l.clientWidth}})()`);
    return { measured: m, verdict: verdictOf(m && m.number && m.numberRight <= m.labelLeft + 0.5), shot: await shot("O4-9.2-longnum") };
  });
  await item("O4-8", "preview chevron on \"Section 2\" toggles its fold (H2 sections start folded, I-10/I-18); the Outline row of the same item follows (aria-expanded = chevron); capture", async (rec) => {
    await openPreview("pair.md");
    await snap(rec);
    const fold = `[...document.querySelectorAll('.markdown-body h2')].find(h=>h.textContent.includes('Section 2')).querySelector('.heading-fold')`;
    const state = () => ev(`({chevron:${fold}.getAttribute('aria-expanded'),hidden:document.querySelectorAll('.markdown-body [data-folded]').length,outline:${outlineRow("Section 2")}?.getAttribute('aria-expanded')})`);
    const before = await state();
    await click(fold, { wait: 800 });
    const after = await state();
    const s = await shot("O4-8-preview-fold");
    await click(fold, { wait: 800 });
    const back = await state();
    const ok = before.chevron !== after.chevron && after.outline === after.chevron && before.outline === before.chevron && back.chevron === before.chevron && back.outline === back.chevron && before.hidden !== after.hidden;
    return { measured: { before, after, back }, verdict: verdictOf(ok), shot: s, note: "run1 assumed Section 2 starts open; it starts folded (depth 2), so the first click opens it" };
  });
  await item("O4-9.2-chevron", "chevron sits in the left margin (right edge <= body text start) and within the heading's first line", async (rec) => {
    await openPreview("pair.md");
    await snap(rec);
    const m = await ev(`(()=>{const h=[...document.querySelectorAll('.markdown-body h2')].find(e=>e.offsetParent);const b=h.querySelector('.heading-fold');const p=__p.vis('.markdown-body > p');const hr=h.getBoundingClientRect(),br=b.getBoundingClientRect();
      const t=document.createRange();t.selectNodeContents(h.lastChild);const tr=t.getBoundingClientRect();return {chevronRight:+br.right.toFixed(2),textStart:+p.getBoundingClientRect().left.toFixed(2),chevronCenterY:+((br.top+br.bottom)/2).toFixed(2),lineTop:+tr.top.toFixed(2),lineBottom:+(tr.top+parseFloat(getComputedStyle(h).lineHeight)).toFixed(2)}})()`);
    return { measured: m, verdict: verdictOf(m.chevronRight <= m.textStart + 0.5 && m.chevronCenterY >= m.lineTop && m.chevronCenterY <= m.lineBottom), shot: await shot("O4-9.2-chevron") };
  });
  await item("O4-9.2-emptycell", "folded ipynb: the gap below a folded section holding an empty markdown cell (A) = the gap below one without (B), +-1 px", async (rec) => {
    await openPreview("nb.ipynb");
    for (const name of ["Section A", "Section B"]) await click(`[...document.querySelectorAll('.markdown-body h2')].find(h=>h.textContent.includes(${JSON.stringify(name)})).querySelector('.heading-fold')`, { wait: 500 });
    await snap(rec);
    const m = await ev(`(()=>{const h=n=>[...document.querySelectorAll('.markdown-body h2')].find(e=>e.textContent.includes(n)).getBoundingClientRect();const a=h('Section A'),b=h('Section B'),c=h('Section C');return {gapAtoB:+(b.top-a.bottom).toFixed(2),gapBtoC:+(c.top-b.bottom).toFixed(2)}})()`);
    const s = await shot("O4-9.2-emptycell-folded");
    for (const name of ["Section A", "Section B"]) await click(`[...document.querySelectorAll('.markdown-body h2')].find(h=>h.textContent.includes(${JSON.stringify(name)})).querySelector('.heading-fold')`, { wait: 400 });
    return { measured: m, verdict: verdictOf(near(m.gapAtoB, m.gapBtoC, 1)), shot: s };
  });
  await item("O4-9.2-mermaid", "a mermaid diagram inside a folded section is drawn (non-zero size) after the section is unfolded", async (rec) => {
    await openPreview("a.md");
    await sleep(1500);
    const fold = `[...document.querySelectorAll('.markdown-body h2')].find(h=>h.textContent.includes('Diagram')).querySelector('.heading-fold')`;
    await click(fold, { wait: 600 });
    const folded = await ev(`document.querySelectorAll('.markdown-body [data-folded] svg').length`);
    await click(fold, { wait: 1200 });
    await snap(rec);
    const m = await ev(`(()=>{const h=[...document.querySelectorAll('.markdown-body h2')].find(h=>h.textContent.includes('Diagram'));let e=h.nextElementSibling;while(e&&!e.querySelector('svg')&&e.tagName!=='H2')e=e.nextElementSibling;const s=e?.querySelector('svg');return s?__p.r(s):null})()`);
    return { measured: { svgInFoldedBlocks: folded, afterUnfold: m }, verdict: verdictOf(m && m.w > 0 && m.h > 0), shot: await shot("O4-9.2-mermaid") };
  });
  await item("O4-9.2-big", "big.md (generated, the v0.8.1 Outline test file not located; 2001 headings): Outline rows appear after opening the edit tab, ms", async (rec) => {
    const t0 = Date.now();
    await openFile("big.md");
    const ms = await waitFor(`document.querySelector('.outline-bar .tree-row')`, 14000);
    await snap(rec);
    const alive = await ev("1+1").catch(() => null);
    return { measured: { msFromDoubleClick: ms === null ? null : Date.now() - t0, appAnswers: alive === 2 }, verdict: verdictOf(ms !== null && alive === 2), note: "time includes the 1.8 s wait after the double-click (openFile); pass = rows appear and the app answers", shot: await shot("O4-9.2-big") };
  });

  // ORDER-05
  const toggledCell = () => ev(`(()=>{const b=[...document.querySelectorAll('.status-bar .icon-button[aria-pressed="true"]')][0];if(!b)return null;const s=getComputedStyle(b);
    return {label:b.getAttribute('aria-label'),w:__p.r(b).w,h:__p.r(b).h,radius:s.borderRadius,background:s.backgroundColor,boxShadow:s.boxShadow,color:s.color,
      expect:{background:__p.rgb('--editor-background',b),border:__p.rgb('--border',b),accent:__p.rgb('--text-accent',b)}}})()`);
  const toggledOk = (m) => m && near(m.w, 22) && near(m.h, 22) && m.radius === "4px" && m.background === m.expect.background && m.boxShadow.includes(m.expect.border) && m.color === m.expect.accent;
  await item("O5-1-light", "pressed status bar button cell: 22x22, radius 4, background editor.background, 1 px inset border, colour text.accent (One Light)", async (rec) => {
    await moveMouseAway();
    await snap(rec);
    const m = await toggledCell();
    return { measured: m, verdict: verdictOf(toggledOk(m)), shot: await shot("O5-1-light") };
  }, { fresh: false });
  await item("O5-3-statusbar", "status bar with the folder sidebar open (toggle in two places): left five buttons, UI/Edit/View at the right end after a divider; capture", async (rec) => {
    await openFile("code.py");
    if (await exists(`document.querySelector('.status-bar [aria-label="Open Folder Sidebar"]')`)) await click(`document.querySelector('.status-bar [aria-label="Open Folder Sidebar"]')`, { wait: 800 });
    await moveMouseAway();
    await snap(rec);
    const m = await ev(`({left:[...document.querySelectorAll('.status-bar .group.grow > .icon-button')].map(b=>b.getAttribute('aria-label')),right:[...document.querySelectorAll('.status-bar > .group:last-child > .icon-button')].map(b=>b.textContent.trim()),dividers:document.querySelectorAll('.status-bar .status-divider').length,sidebarShown:!document.querySelector('.sidebar').hidden,sidebarToggle:!!__p.vis('.sidebar-footer [aria-label="Toggle Sidebar"]')})`);
    const bar = await ev(`__p.r(document.querySelector('.status-bar'))`);
    const s = `O5-3-statusbar.png`;
    writeFileSync(`${OUT}/${s}`, Buffer.from((await S.app.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: bar.y, width: Math.max(bar.x + bar.w, 1), height: bar.h, scale: 1 } })).data, "base64"));
    await shot("O5-3-window-sidebar-open");
    const ok = m.left.length === 5 && m.right.join(",") === "UI,Edit,View" && m.sidebarShown && m.sidebarToggle;
    return { measured: m, verdict: verdictOf(ok), shot: s };
  });
  await item("O5-3-edit", "pressing Edit flips only the editor theme: editor background changes, UI and preview backgrounds stay", async (rec) => {
    await openFile("pair.md");
    await clickLine(0, "", { wait: 300 });
    keys("ctrl+k", "v");
    await sleep(2500);
    await snap(rec);
    const bg = () => ev(`({ui:getComputedStyle(document.querySelector('.status-bar')).backgroundColor,editor:getComputedStyle(__p.vis('.cm-editor')).backgroundColor,preview:getComputedStyle(${mdPreview}).backgroundColor,editLabel:[...document.querySelectorAll('.status-bar .icon-button')].find(b=>b.textContent.trim()==='Edit')?.getAttribute('aria-label')})`);
    const before = await bg();
    await click(`[...document.querySelectorAll('.status-bar .icon-button')].find(b=>b.textContent.trim()==='Edit')`, { wait: 1500 });
    const after = await bg();
    const s = await shot("O5-3-edit-pressed");
    await click(`[...document.querySelectorAll('.status-bar .icon-button')].find(b=>b.textContent.trim()==='Edit')`, { wait: 1200 });
    if (await exists(`document.querySelector('.status-bar [aria-label="Close Folder Sidebar"]')`)) await click(`document.querySelector('.status-bar [aria-label="Close Folder Sidebar"]')`, { wait: 600 });
    return { measured: { before, after }, verdict: verdictOf(before.editor !== after.editor && before.ui === after.ui && before.preview === after.preview), shot: s };
  });
  await item("O5-7", "Themes… selector: list split into dark and light (a divider), capture", async (rec) => {
    await snap(rec);
    await userMenuItem("Themes…");
    const m = await ev(`({open:!!__p.vis('.picker'),items:document.querySelectorAll('.picker .picker-item').length,dividers:document.querySelectorAll('.picker .picker-divider').length,labels:[...document.querySelectorAll('.picker .picker-label')].map(e=>e.textContent.trim()).slice(0,40)})`);
    const s = await shot("O5-7-themes");
    keys("esc");
    await sleep(500);
    return { measured: m, verdict: verdictOf(m.open && m.items > 1 && m.dividers >= 1), shot: s };
  }, { fresh: false });

  // ORDER-06 (HTML preview look)
  const PAIR = (root, left, box, bar) => `(()=>{const B=${root};const L=${left};const X=${box};const ps=getComputedStyle(X);const cs=e=>e?getComputedStyle(e):null;const n=v=>v==null||v===''?null:+parseFloat(v).toFixed(2);const q=s=>B.querySelector(s);
    const p=q('p');const lis=[...B.querySelectorAll('li')];const sub=q('li > ul, li > ol');const t=q('table');const pre=q('.code-block pre');const s=getComputedStyle(B);
    return {fontFamily:cs(p).fontFamily,fontSize:n(cs(p).fontSize),pLineHeight:n(cs(p).lineHeight),pMarginBottom:n(cs(p).marginBottom),liLineHeight:n(cs(lis[0]).lineHeight),liGap:lis[1]?n(cs(lis[1]).marginTop):null,
      subIndent:n(cs(sub).paddingLeft),bodyWidth:n(B.getBoundingClientRect().width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),textStart:n(p.getBoundingClientRect().left-L),tableWidth:n(t?.getBoundingClientRect().width),
      preFontSize:n(cs(pre)?.fontSize),preLineHeight:n(cs(pre)?.lineHeight),h1:n(cs(q('h1')).fontSize),h2:n(cs(q('h2')).fontSize),h3:n(cs(q('h3')).fontSize),
      room:n(X.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight)-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)),scrollbar:n(${bar})}})()`; // room: what the body could take (max 700 at 14 px)
  await item("O6-1", "CSS-less HTML = same Markdown (computed): font, size, p line height and gap, list line and gap, sub-list 28 px (2em), body 700 px, text start, table 100%, code 12.04 px and line height, h1~h3", async (rec) => {
    await openPreview("pair.md");
    await expandAll();
    const md = await ev(PAIR(`__p.vis('.markdown-preview:not(.html-preview) .markdown-body')`, `${mdPreview}.getBoundingClientRect().left`, mdPreview, `${mdPreview}.offsetWidth-${mdPreview}.clientWidth`));
    await shot("O6-1-md");
    await closeAll();
    await openPreview("plain.html");
    await waitFrame();
    await snap(rec);
    const html = await frameEval(PAIR("document.body", "0", "document.documentElement", "innerWidth-document.documentElement.clientWidth"));
    const s = await shot("O6-1-html");
    const diff = Object.keys(md).filter((k) => k !== "room" && k !== "scrollbar" && (typeof md[k] === "number" ? !near(md[k], html[k]) : md[k] !== html[k]));
    const ok = !diff.length && md.subIndent === 28 && near(md.bodyWidth, Math.min(700, md.room)) && near(html.bodyWidth, Math.min(700, html.room)) && near(md.tableWidth, md.bodyWidth, 1) && near(md.preFontSize, 12.04, 0.01);
    return { measured: { md, html, differs: diff }, verdict: verdictOf(ok), shot: s, note: "two captures (O6-1-md.png, O6-1-html.png) at the same pane width instead of a split view: a split narrows the 700 px body. With the Outline and the dock open the pane gives the body less than 700 px (room); scrollbar = width a vertical scrollbar takes from the box" };
  });
  await item("O6-2", `page CSS wins: styled.html body font-size ${STYLED.fontSize}, colour ${STYLED.color}, h1 colour ${STYLED.h1Color}`, async (rec) => {
    const net0 = S.net.length;
    await openPreview("styled.html");
    await waitFrame();
    await snap(rec);
    const m = await frameEval(`({fontSize:getComputedStyle(document.body).fontSize,color:getComputedStyle(document.body).color,h1Color:getComputedStyle(document.querySelector('h1')).color})`);
    R.styledNet = { frameResources: await frameEval(`performance.getEntriesByType('resource').map(e=>e.name)`), page: S.net.slice(net0) };
    return { measured: m, verdict: verdictOf(m.fontSize === STYLED.fontSize && m.color === STYLED.color && m.h1Color === STYLED.h1Color), shot: await shot("O6-2-styled") };
  });
  await item("O6-5", "external requests 0 while styled.html (with an external <img>) is open: frame resource entries and app Network requests hold no non-local URL", async (rec) => {
    await snap(rec);
    const n = R.styledNet;
    if (!n) return { verdict: "unmeasured", note: "O6-2 did not run" };
    const external = (u) => /^(https?|wss?):\/\//i.test(u) && !/^(https?|wss?):\/\/([a-z0-9-]+\.)*localhost(:\d+)?\//i.test(u) && !/^https?:\/\/127\.0\.0\.1/.test(u);
    const ext = [...n.frameResources, ...n.page.map((x) => x.url)].filter(external);
    return { measured: { external: ext, frameResources: n.frameResources.length, pageRequests: n.page.length }, verdict: verdictOf(!ext.length), note: "frame requests blocked by its CSP never leave and leave no entry; page requests from Network.enable on the app target (v0.8.1 way)" };
  }, { fresh: false });
  await item("O6-3", "Settings window: Preview Font Size + once (no Ctrl+=) -> open HTML preview body font-size 15 px, zoom 1; settings.json saved", async (rec) => {
    await openPreview("plain.html");
    await waitFrame();
    const before = await frameEval(`({fs:getComputedStyle(document.querySelector('p')).fontSize,zoom:document.documentElement.style.zoom||"1"})`);
    await userMenuItem("Settings");
    const c = await settingsWindow();
    if (!c) throw new Error("Settings window did not open");
    let saved = null, after = null;
    try {
      await clickIn(c, `[...document.querySelectorAll('.settings-category')].find(b=>b.textContent.trim()==='Preview')`);
      await clickIn(c, `document.querySelector('[aria-label="Increase Preview Font Size"]')`, 2500);
      saved = JSON.parse(readFileSync(`${S.DATA}/settings.json`, "utf8")).preview_font_size ?? null;
      winput(["-Action", "foreground"]);
      await waitFrame();
      await snap(rec);
      after = await frameEval(`({fs:getComputedStyle(document.querySelector('p')).fontSize,zoom:document.documentElement.style.zoom||"1"})`);
      R.settingsRun = { saved, before, after };
      await shot("O6-3-after-settings");
      await clickIn(c, `document.querySelector('[aria-label="Decrease Preview Font Size"]')`, 1500);
    } finally { await closeSettingsWindow(c); }
    winput(["-Action", "foreground"]);
    return { measured: { before, after, savedPreviewFontSize: saved }, verdict: verdictOf(before.fs === "14px" && after?.fs === "15px" && after?.zoom === "1" && saved === 15), shot: "O6-3-after-settings.png" };
  });
  await item("O6-4", `HTML code block: header shows "python" and Copy; Copy click -> clipboard = the block without its blank lines`, async (rec) => {
    await openPreview("plain.html");
    await waitFrame();
    await snap(rec);
    const head = await frameEval(`(()=>{const b=document.querySelector('.code-block');b.scrollIntoView({block:"center"});return {language:b.querySelector('.code-block-language')?.textContent,copy:!!b.querySelector('.code-block-copy'),colored:b.querySelectorAll('pre span').length,shown:b.querySelector('pre').textContent}})()`);
    const s = await shot("O6-4-html-code-block");
    await clickFrame(`document.querySelector('.code-block-copy')`, null, { wait: 1000 });
    const clip = clipRead();
    return { measured: { ...head, clipboard: clip }, verdict: verdictOf(head.language === "python" && head.copy && head.colored > 0 && clip === PY && head.shown === PY), shot: s };
  });
  await item("O6-7", "v0.8.1 mockup page (copy) capture: report whether the base look / 700 px body changed it", async (rec) => {
    await openPreview("mockup.html");
    await waitFrame();
    await snap(rec);
    const m = await frameEval(`({bodyWidth:__r(document.body)?.w,title:document.title,viewport:innerWidth})`);
    return { measured: m, verdict: "pass", note: "capture only: the difference from v0.8.1 is judged by leader-core against v0.8.1 captures", shot: await shot("O6-7-mockup") };
  });
  await item("O6-9.2-font", "the frame's data: fonts load: body and code font families are loaded faces (document.fonts.check)", async (rec) => {
    await openPreview("plain.html");
    await waitFrame();
    await snap(rec);
    const m = await frameEval(`(async()=>{await document.fonts.ready;const fam=s=>getComputedStyle(s).fontFamily.split(',')[0].trim();const b=fam(document.body),c=fam(document.querySelector('.code-block pre')||document.body);
      return {body:b,code:c,bodyLoaded:document.fonts.check('14px '+b),codeLoaded:document.fonts.check('12px '+c),loaded:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight)}})()`);
    return { measured: m, verdict: verdictOf(m.bodyLoaded && m.codeLoaded && m.loaded.length > 0), shot: await shot("O6-9.2-font") };
  });
  await item("O6-9.2-cssRules", "release build: the app's cssRules reach the frame (the frame base style holds the .markdown-body rules in one @layer)", async (rec) => {
    await openPreview("plain.html");
    await waitFrame();
    await snap(rec);
    const m = await frameEval(`(()=>{const st=[...document.querySelectorAll('head style')];const base=st.find(s=>s.textContent.includes('@layer{')); /* the bundled @font-face rules come first (run1 looked for a leading @layer) */let rules=0;try{for(const sh of document.styleSheets)for(const r of sh.cssRules)if(r instanceof CSSLayerBlockRule)rules+=r.cssRules.length}catch{}
      return {styles:st.length,baseChars:base?.textContent.length??0,layerRules:rules,hasBodyRule:!!base&&base.textContent.includes(':root body')}})()`);
    return { measured: m, verdict: verdictOf(m.layerRules > 10 && m.hasBodyRule) };
  });
}

// ================================================================ B One Dark part (ORDER-05 #1 dark)
async function partDark() {
  await item("O5-1-dark", "pressed status bar button cell: 22x22, radius 4, background editor.background, 1 px inset border, colour text.accent (One Dark)", async (rec) => {
    await moveMouseAway();
    await snap(rec);
    const m = await ev(`(()=>{const b=[...document.querySelectorAll('.status-bar .icon-button[aria-pressed="true"]')][0];if(!b)return null;const s=getComputedStyle(b);
      return {appearance:document.documentElement.dataset.appearance,label:b.getAttribute('aria-label'),w:__p.r(b).w,h:__p.r(b).h,radius:s.borderRadius,background:s.backgroundColor,boxShadow:s.boxShadow,color:s.color,
        expect:{background:__p.rgb('--editor-background',b),border:__p.rgb('--border',b),accent:__p.rgb('--text-accent',b)}}})()`);
    const ok = m && m.appearance === "dark" && near(m.w, 22) && near(m.h, 22) && m.radius === "4px" && m.background === m.expect.background && m.boxShadow.includes(m.expect.border) && m.color === m.expect.accent;
    return { measured: m, verdict: verdictOf(ok), shot: await shot("O5-1-dark") };
  }, { fresh: false });
}

// ================================================================ C: HTML preview redraw time (9.2)
async function partC() {
  const redraw = async (rec, label) => {
    await openFile("plain.html");
    await clickLine(0, "", { wait: 400 });
    keys("ctrl+k", "v");
    await sleep(3000);
    await waitFrame(1);
    await snap(rec);
    const styleChars = await frameEval(`[...document.querySelectorAll('style')].reduce((n,s)=>n+s.textContent.length,0)`, 1);
    const codeFont = await frameEval(`getComputedStyle(document.querySelector('.code-block pre')).fontFamily`, 1);
    await ev(`(()=>{window.__o7={loads:[],keys:[],ready:[]};const f=document.querySelectorAll('.pane')[1].querySelector('.html-frame');f.addEventListener('load',()=>__o7.loads.push(performance.now()));
      addEventListener('keydown',()=>__o7.keys.push(performance.now()),true);addEventListener('message',e=>{if(e.data?.previewReady===true)__o7.ready.push(performance.now())});return 1})()`);
    await clickLine(0, "", { wait: 300 });
    keys("end", "x");
    let t = null;
    for (let i = 0; i < 60 && !t; i++) { await sleep(250); t = await ev(`(()=>{const k=__o7.keys.at(-1);const l=__o7.loads.find(x=>x>k),r=__o7.ready.find(x=>x>k);return l?{keyToLoadMs:+(l-k).toFixed(1),keyToReadyMs:r?+(r-k).toFixed(1):null}:null})()`); }
    keys("ctrl+z", "ctrl+s");
    await sleep(800);
    return { measured: { codeFont, frameStyleChars: styleChars, ...(t ?? { keyToLoadMs: null }) }, verdict: t ? "pass" : "problem", note: `${label}; measured from the last keydown (SendInput "x") to the frame's next load / previewReady; value is for leader-core (no limit set)` };
  };
  await item("O7-9.2-redraw-default", "time from one typed character in the HTML edit tab to the frame document reload, default code font (about 0.9 MB of fonts)", (rec) => redraw(rec, "default fonts"));
  await item("O7-9.2-redraw-d2coding", "same with preview_code_font_family D2Coding (about 5.6 MB)", async (rec) => {
    await setSettings({ preview_code_font_family: "D2Coding" });
    try {
      const r = await redraw(rec, "D2Coding set in settings.json (live reload)");
      if (!/D2Coding/.test(r.measured.codeFont ?? "")) { r.verdict = "unmeasured"; r.note += " | the frame code font is not D2Coding: the setting did not reach it"; }
      return r;
    } finally { await closeAll().catch(() => {}); await setSettings({ preview_code_font_family: undefined }); }
  });
}

// ================================================================ D: 전체 회귀 (pass/problem only)
async function partD() {
  const kinds = [["markdown", "pair.md", `!!__p.vis('.markdown-body > h1')`], ["ipynb", "nb.ipynb", `!!__p.vis('.markdown-body .nb-cell')`], ["html", "plain.html", null],
    ["csv", "data.csv", `!!__p.vis('.markdown-body .csv-table')`], ["tsv", "data.tsv", `!!__p.vis('.markdown-body .csv-table')`], ["svg", "pic.svg", `!!__p.vis('.markdown-body svg')`], ["mermaid", "diagram.mmd", `!!__p.vis('.markdown-body svg')`]];
  for (const [kind, file, js] of kinds) {
    await item(`R-open-${kind}`, `${file} preview opens and draws`, async (rec) => {
      await openPreview(file);
      await sleep(kind === "mermaid" ? 2000 : 500);
      await snap(rec);
      const ok = js ? await ev(js) : (await waitFrame().then(() => true).catch(() => false));
      return { measured: { drawn: ok }, verdict: verdictOf(ok), shot: ok ? null : await shot(`R-open-${kind}`) };
    });
  }
  await item("R-md-sync", "md edit tab <-> preview: editor line -> preview block marked; preview block click -> editor cursor line", async (rec) => {
    await openFile("pair.md");
    await clickLine(0, "", { wait: 300 });
    keys("ctrl+k", "v");
    await sleep(2500);
    await expandAll();
    await snap(rec);
    await clickLine(0, "### Section 1.1", { wait: 900 });
    const marked = await ev(`[...document.querySelectorAll('.pane')][1].querySelector('.active-block')?.textContent.trim().slice(0,40) ?? null`);
    await click(`[...[...document.querySelectorAll('.pane')][1].querySelectorAll('.markdown-body > p')].find(p=>p.textContent.startsWith('Paragraph 1 of section 2'))`, { wait: 900 });
    const cursor = await ev(`[...document.querySelectorAll('.pane')][0].querySelector('.cm-activeLine')?.textContent.slice(0,40) ?? null`);
    return { measured: { previewMarked: marked, editorLine: cursor }, verdict: verdictOf(/Section 1\.1/.test(marked ?? "") && (cursor ?? "").startsWith("Paragraph 1 of section 2")) };
  });
  await item("R-md-anchor", "#section-b link scrolls the md preview to that heading", async (rec) => {
    await openPreview("a.md");
    await snap(rec);
    const before = await ev(`${scroller()}.scrollTop`);
    await click(`[...document.querySelectorAll('.markdown-body a')].find(a=>a.textContent.trim()==='go to Section B')`, { wait: 1000 });
    const m = await ev(`(()=>{const s=${scroller()};const h=[...s.querySelectorAll('h2')].find(e=>e.textContent.includes('Section B'));return {after:s.scrollTop,maxScroll:s.scrollHeight-s.clientHeight,top:+(h.getBoundingClientRect().top-s.getBoundingClientRect().top).toFixed(1)}})()`);
    return { measured: { before, ...m }, verdict: verdictOf(m.after > before && (Math.abs(m.top) < 40 || Math.abs(m.after - m.maxScroll) <= 1)), note: "Section B is the last section: at the end of the document it cannot reach the top, so max scroll counts" };
  });
  for (const [kind, file, query, want] of [["md", "pair.md", "needle", "1/2"], ["ipynb", "nb.ipynb", "section", null]]) {
    await item(`R-find-${kind}`, `preview find (${kind}): Ctrl+F, "${query}" -> a count${want ? " " + want : " > 0"}`, async (rec) => {
      await openPreview(file);
      await click(`__p.vis('.markdown-body p')`, { wait: 400 });
      await snap(rec);
      keys("ctrl+f");
      await sleep(700);
      typeText(query);
      await sleep(900);
      const count = await ev(`__p.vis('.preview-search .document-search-count')?.textContent ?? null`);
      keys("esc");
      return { measured: { count }, verdict: verdictOf(want ? count === want : /^\d+\/[1-9]\d*$/.test(count ?? "")) };
    });
  }
  // 9.3: the ORDER-02 probe's three cases once each (I-12 / I-27)
  await item("R-tabscroll-setup", "four tabs open for the 9.3 cases (scroll.md, code.py, scroll.html, Preview scroll.html)", async (rec) => {
    await openFile("scroll.md"); await openFile("code.py"); await openFile("scroll.html");
    await click(openPreviewBtn, { wait: 2500 });
    await waitFrame();
    await snap(rec);
    return { measured: await ev(`[...${paneEl(0)}.querySelectorAll(".tab .tab-title")].map(e=>e.textContent.trim())`), verdict: "pass" };
  });
  const isHtml = () => ev(`!!${paneEl(0)}?.querySelector('.markdown-preview.html-preview')?.offsetParent`);
  const pos = async () => ((await isHtml()) ? await frameScrollY(0) : await ev(`${scroller(0)}?.scrollTop ?? null`));
  const wheel = async () => { const p = await pt(scroller(0)); for (let i = 0; i < 6; i++) { winput(["-Action", "wheel", "-X", String(p.x), "-Y", String(p.y), "-DY", "-120"]); await sleep(120); } await sleep(700); };
  for (const [t, other, id] of [["scroll.md", "code.py", "R-tabscroll-md-code"], ["Preview scroll.html", "scroll.md", "R-tabscroll-html-md"], ["Preview scroll.html", "code.py", "R-tabscroll-html-code"]]) {
    await item(id, `${t} scrolled (SendInput wheel x6), ${other} shown, back: same position (+-1 px), active tabs as clicked`, async (rec) => {
      await click(tab(t), { wait: 1200 });
      await wheel();
      const before = await pos(); const activeBefore = await active();
      await click(tab(other), { wait: 1200 });
      const activeVia = await active();
      await click(tab(t), { wait: 1500 });
      await snap(rec);
      const after = await pos(); const activeAfter = await active();
      const ok = before > 0 && Math.abs(after - before) <= 1 && activeBefore === t && activeVia === other && activeAfter === t;
      return { measured: { before, after, activeBefore, activeVia, activeAfter }, verdict: verdictOf(ok), shot: ok ? null : await shot(id) };
    }, { fresh: false });
  }
  await item("R-code-copy", "md code block Copy -> clipboard = shown text; leading/trailing blank lines not drawn (I-22)", async (rec) => {
    await openPreview("pair.md");
    await expandAll();
    await snap(rec);
    const shown = await ev(`__p.vis('.markdown-body .code-block pre').textContent`);
    await click(`__p.vis('.markdown-body .code-block .code-block-copy')`, { wait: 900 });
    const clip = clipRead();
    R.mdCopy = { shown, clip };
    return { measured: { shown, clipboard: clip }, verdict: verdictOf(clip === shown && shown === PY) };
  });
  derive("R-code-blank", ["R-code-copy"], "shown text equals the block without its leading/trailing blank lines (R-code-copy compares it with the fixture)");
  derive("R-code-linenums", ["O2-8"], "on: O2-8; off is the default state every other capture shows");
  derive("R-bodyhtml", ["O3-1-bodyhtml", "O3-8-sanitize"]);
  derive("R-links3", ["O3-6"]);
  await item("R-outline-keys", "Outline keyboard (v0.8.1 I-18): focus a row, Down (SendInput) moves the selection", async (rec) => {
    await openPreview("pair.md");
    await click(outlineRow("Pair Document"), { wait: 500 }); // a row click moves focus to the preview (Outline.tsx go)
    // focus the list itself: a click on its empty area below the rows (the list has tabindex 0)
    const blank = await ev(`(()=>{const l=document.querySelector('.outline-bar .outline-list');const r=l.getBoundingClientRect();const rows=[...l.querySelectorAll('.tree-row')];const last=rows.at(-1).getBoundingClientRect();const x=Math.round(r.x+r.width/2),y=Math.round(Math.min(r.bottom-8,last.bottom+20));return {x,y,hit:document.elementFromPoint(x,y)===l}})()`);
    if (!blank.hit) throw new Error("no empty area of the Outline list to click");
    await clickAt(blank.x, blank.y, { wait: 400 });
    await snap(rec);
    const before = await ev(`document.querySelector('.outline-bar .tree-row[aria-selected="true"] .tree-label, .outline-bar .tree-row.marked .tree-label')?.textContent.trim() ?? null`);
    keys("down");
    await sleep(500);
    const after = await ev(`(()=>{const a=document.activeElement;return [...document.querySelectorAll('.outline-bar .tree-row')].filter(r=>r.matches('.selected,.marked,[aria-selected="true"]')||r.className.includes('picked')).map(r=>r.querySelector('.tree-label')?.textContent.trim())})()`);
    return { measured: { before, after }, verdict: verdictOf(after.length > 0 && !after.every((x) => x === before)), note: "pass = the marked row moved off the clicked one; focus put on the list by clicking its empty area", measuredFocus: await ev(`document.activeElement?.className`) };
  });
  derive("R-outline-menu", ["O4-4"]);
  derive("R-outline-numbers", ["O4-4", "O4-9.2-longnum"]);
  derive("R-outline-colors", ["O4-6"]);
  derive("R-outline-fold", ["O4-8"]);
  await item("R-status-buttons", "status bar: five toggle buttons at the left, UI/Edit/View at the right", async (rec) => {
    await snap(rec);
    const m = await ev(`({left:document.querySelectorAll('.status-bar .group.grow > .icon-button').length,right:[...document.querySelectorAll('.status-bar > .group:last-child > .icon-button')].map(b=>b.textContent.trim())})`);
    return { measured: m, verdict: verdictOf(m.left === 5 && m.right.join(",") === "UI,Edit,View") };
  }, { fresh: false });
  derive("R-themes", ["O5-7"]);
  derive("R-welcome", ["O5-8·9-welcome", "O5-8·9-rows", "O5-8·9-recent"], "Open Folder row not run (native dialog), see O5-8·9-rows");
  derive("R-nofile", ["O5-8·9-nofile"]);
  derive("R-html-same", ["O6-1"]);
  derive("R-html-copy", ["O6-4"]);
  derive("R-html-net0", ["O6-5"]);
  // The frame is its own CDP target: its Network events are read there (Network.enable on the iframe target), across one reload of
  // the frame document so the page scripts run again while listening. A request stopped before it leaves ends in loadingFailed with a
  // blockedReason (csp, ...); a response, or a net error without blockedReason (e.g. ERR_NAME_NOT_RESOLVED: a DNS lookup), means it left.
  const frameNetwork = async (waitMs) => {
    const src = await frameSrc();
    const t = (await targets()).filter((x) => x.type === "iframe" && x.url === src).pop();
    if (!t) throw new Error("frame target not found");
    const c = await cdp(t.webSocketDebuggerUrl);
    const reqs = new Map();
    const get = (id) => { if (!reqs.has(id)) reqs.set(id, {}); return reqs.get(id); };
    c.on((m) => {
      const p = m.params ?? {};
      if (m.method === "Network.requestWillBeSent") Object.assign(get(p.requestId), { url: p.request.url, type: p.type ?? null });
      else if (m.method === "Network.loadingFailed") Object.assign(get(p.requestId), { failed: p.errorText, blockedReason: p.blockedReason ?? null, corsError: p.corsErrorStatus?.corsError ?? null, canceled: !!p.canceled });
      else if (m.method === "Network.responseReceived") Object.assign(get(p.requestId), { status: p.response.status });
    });
    await c.send("Network.enable");
    await c.evaluate("location.reload()").catch(() => {});
    await sleep(waitMs);
    const closedEarly = c.closed();
    c.close();
    const all = [...reqs.values()];
    const external = all.filter((r) => r.url && /^(https?|wss?):\/\//i.test(r.url) && !/localhost|127\.0\.0\.1/.test(new URL(r.url).host));
    return { external, left: external.filter((r) => r.status !== undefined || (r.failed && !r.blockedReason)), requests: all.length, targetClosedDuringReload: closedEarly };
  };
  await item("R-html-scripts", "v0.8.1 script pages: links.html lists four created links, beacon.html reports its calls; no external request leaves (frame target Network events: every external request blocked, none answered)", async (rec) => {
    await openPreview("links.html");
    await waitFrame();
    await sleep(1000);
    const linksNet = await frameNetwork(3000);
    await waitFrame();
    const links = await frameEval(`({created:document.querySelectorAll('#created li').length,errors:[...document.querySelectorAll('#errors li')].map(e=>e.textContent),resourceEntries:performance.getEntriesByType('resource').map(e=>e.name)})`);
    await closeAll();
    await openPreview("beacon.html");
    await waitFrame();
    await sleep(1000);
    const beaconNet = await frameNetwork(4000);
    await waitFrame();
    await sleep(1000);
    await snap(rec);
    const beacon = await frameEval(`({beacon:document.getElementById('beacon-result')?.textContent,es:document.getElementById('eventsource-result')?.textContent,resourceEntries:performance.getEntriesByType('resource').map(e=>e.name)})`);
    const left = [...linksNet.left, ...beaconNet.left];
    const seen = linksNet.requests + beaconNet.requests > 0 && !linksNet.targetClosedDuringReload && !beaconNet.targetClosedDuringReload;
    return { measured: { links, linksNet, beacon, beaconNet }, verdict: !seen ? "unmeasured" : verdictOf(links.created === 4 && beacon.beacon !== "testing" && !left.length),
      note: (seen ? "" : "no Network events reached the frame target (or it closed on reload) | ") + "resource timing entries are not proof a request left; the verdict uses the frame target's Network events", shot: await shot("R-html-scripts-beacon") };
  });
  // tree: select, rename (F2), drag into sub/ — once each, last, since they change the workspace
  await item("R-tree-select", "tree row click selects it", async (rec) => {
    await click(row("rename-me.txt"), { wait: 500 });
    await snap(rec);
    return { measured: { selected: await ev(`${row("rename-me.txt")}?.classList.contains('selected')`) }, verdict: verdictOf(await ev(`${row("rename-me.txt")}?.classList.contains('selected')`)) };
  });
  await item("R-tree-rename", "F2 (SendInput), type renamed.txt, Enter -> the file is renamed on disk", async (rec) => {
    await click(row("rename-me.txt"), { wait: 500 });
    keys("f2");
    await sleep(600);
    const editing = await exists(`document.querySelector('.tree-input')`);
    keys("ctrl+a");
    typeText("renamed.txt");
    keys("enter");
    await sleep(1500);
    await snap(rec);
    const ok = existsSync(`${S.W}/renamed.txt`) && !existsSync(`${S.W}/rename-me.txt`);
    return { measured: { inputShown: editing, renamedOnDisk: ok, row: await exists(row("renamed.txt")) }, verdict: verdictOf(ok) };
  });
  await item("R-tree-drag", "drag move-me.txt onto sub (SendInput drag) -> sub/move-me.txt on disk", async (rec) => {
    const a = await pt(row("move-me.txt")), b = await pt(row("sub"));
    if (!a?.hit || !b?.hit) throw new Error("tree rows covered");
    winput(["-Action", "drag", "-X", String(a.x), "-Y", String(a.y), "-DX", String(b.x - a.x), "-DY", String(b.y - a.y)]);
    await sleep(2000);
    await snap(rec);
    const ok = existsSync(`${S.W}/sub/move-me.txt`) && !existsSync(`${S.W}/move-me.txt`);
    return { measured: { movedOnDisk: ok, dialog: await exists(`document.querySelector('dialog[open]')`) }, verdict: verdictOf(ok) };
  }, { fresh: false });
  if (R.settingsRun) derive("R-settings", ["O6-3"], "Settings opened from the User menu, Preview Font Size + saved (settings.json) and shown, then − back");
  else await item("R-settings", "Settings: open (User menu), change one value (Preview Font Size +), saved in settings.json; then back", async (rec) => {
    await snap(rec);
    await userMenuItem("Settings");
    const c = await settingsWindow();
    if (!c) throw new Error("Settings window did not open");
    let saved = null;
    try {
      await clickIn(c, `[...document.querySelectorAll('.settings-category')].find(b=>b.textContent.trim()==='Preview')`);
      await clickIn(c, `document.querySelector('[aria-label="Increase Preview Font Size"]')`, 2000);
      saved = JSON.parse(readFileSync(`${S.DATA}/settings.json`, "utf8")).preview_font_size ?? null;
      await clickIn(c, `document.querySelector('[aria-label="Decrease Preview Font Size"]')`, 1500);
    } finally { await closeSettingsWindow(c); }
    winput(["-Action", "foreground"]);
    return { measured: { saved }, verdict: verdictOf(saved === 15) };
  }, { fresh: false });
  await item("R-about", "Help > About shows Version 0.8.2", async (rec) => {
    await snap(rec);
    await openMenuItem(["Help", "About"]);
    const v = await ev(`document.querySelector('.about-dialog[open] .about-header p')?.textContent.trim() ?? null`);
    const s = await shot("R-about");
    keys("esc");
    await sleep(400);
    return { measured: { version: v }, verdict: verdictOf(v === "Version 0.8.2"), shot: s };
  }, { fresh: false });
}

// ================================================================ run
try {
  if (SECTIONS.includes("B")) await runPart("B", { folder: false, theme: "light", fresh: true }, partWelcome);
  if (SECTIONS.includes("A")) await runPart("A", { folder: true, theme: "light" }, partA);
  if (SECTIONS.includes("B")) await runPart("B", { folder: true, theme: "light" }, partB);
  if (SECTIONS.includes("C")) await runPart("C", { folder: true, theme: "light" }, partC);
  if (SECTIONS.includes("D")) await runPart("D", { folder: true, theme: "light" }, partD);
  if (SECTIONS.includes("B")) await runPart("B", { folder: true, theme: "dark" }, partDark);
} finally {
  await endSession();
  clipRestore();
  R.finished = new Date().toISOString();
  R.summary = Object.fromEntries(["pass", "problem", "unmeasured"].map((v) => [v, R.records.filter((r) => r.verdict === v).map((r) => r.id)]));
  save();
  console.log(JSON.stringify(R.summary, null, 1));
}

// v0.8.2 ORDER-02 8.1 #12 leader probe (I-27): copied from verify/ORDER-01/leader-probe/probe.mjs.
// Five fresh app sessions; in each, every case is a first departure: md edit tab -> code.py,
// HTML preview -> a.md, HTML preview -> code.py. The last session adds one split-pane case (ORDER-01 #8).
// Usage: node specs/v0.8.2/verify/ORDER-02/leader-probe/probe.mjs [exe] [sessions=5]
// Isolated APPDATA/WebView2 folders; no settings.json (theme One Dark). Wheel is real SendInput via tools/win-input.ps1.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = resolve(process.argv[2] || `${REPO}/src-tauri/target/debug/workbench-tauri.exe`);
const SESSIONS = Number(process.argv[3] || 5);
const OUT = `${REPO}/specs/v0.8.2/verify/ORDER-02/leader-probe/out`;
const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const { launchApp } = await import(pathToFileURL(`${REPO}/tools/cdp-lib.mjs`).href);
const lines = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("\n");
mkdirSync(OUT, { recursive: true });
const R = { exe: EXE, theme: "One Dark (default, no settings.json)", input: "SendInput wheel x6 (-120), tab clicks via CDP mouse", sessions: [] };
const save = () => writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));

async function session(k, withSplit) {
  const S = `${TEMP}/v082-probe2-${k}`, SW = S.replace(/\//g, "\\");
  const W = `${S}/ws`, WW = `${SW}\\ws`, DATA = `${S}/appdata/workbench-tauri`;
  rmSync(S, { recursive: true, force: true });
  mkdirSync(DATA, { recursive: true });
  mkdirSync(W, { recursive: true });
  writeFileSync(`${W}/a.md`, "# A\n\n" + lines(150, (i) => `Paragraph ${i} with some words to fill the line.\n`));
  writeFileSync(`${W}/code.py`, lines(400, (i) => `x_${i} = ${i}  # line ${i}`));
  writeFileSync(`${W}/test.html`, `<!doctype html><html><body>${lines(200, (i) => `<p>HTML paragraph ${i}</p>`)}</body></html>`);
  writeFileSync(`${DATA}/state.json`, JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-14T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
  process.env.APPDATA = `${SW}\\appdata`;
  process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview`;

  const app = await launchApp(EXE);
  const ev = (js) => app.evaluate(js);
  const sleep = (ms) => app.sleep(ms);
  const winput = (args) => execFileSync("pwsh", ["-NoProfile", "-File", `${REPO}/tools/win-input.ps1`, "-ProcessId", String(app.pid), ...args], { encoding: "utf8" });
  const shot = async (n) => writeFileSync(`${OUT}/${n}.png`, Buffer.from((await app.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
  // I-27 analysis 4.1: bring the target into view, then refuse to click unless elementFromPoint hits the target itself.
  const pt = (js) => ev(`(()=>{const e=${js};if(!e)return null;e.scrollIntoView({block:"nearest",inline:"nearest"});const r=e.getBoundingClientRect();const x=Math.round(r.x+r.width/2),y=Math.round(r.y+r.height/2);const h=document.elementFromPoint(x,y);return {x,y,hit:!!h&&(h===e||e.contains(h))}})()`);
  const click = async (js, wait = 800, dbl = false) => {
    const p = await pt(js);
    if (!p) throw new Error("not found " + js);
    if (!p.hit) throw new Error("click target covered or off-screen: " + js);
    await app.mouse("mouseMoved", p.x, p.y);
    for (let c = 1; c <= (dbl ? 2 : 1); c++) {
      await app.mouse("mousePressed", p.x, p.y, { clickCount: c });
      await app.mouse("mouseReleased", p.x, p.y, { clickCount: c });
    }
    await sleep(wait);
  };
  const row = (name) => `[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.textContent.trim()===${JSON.stringify(name)})`;
  const paneEl = (pane) => `[...document.querySelectorAll('.pane')][${pane}]`;
  const tab = (title, pane = 0) => `(${paneEl(pane)} ? [...${paneEl(pane)}.querySelectorAll('.tab')].find(e=>e.textContent.trim()===${JSON.stringify(title)}) : null)`;
  // Visible scroller of a pane: CM scrollDOM for edit tabs, .markdown-preview for previews (shell/view-scroll.ts restoreScroll targets).
  const scroller = (pane = 0) => `(()=>{const p=${paneEl(pane)};return p?[...p.querySelectorAll('.cm-scroller, .markdown-preview')].find(e=>e.offsetParent):null})()`;
  // HTML preview: the frame document scrolls; read it through its own CDP target (only one HTML preview is open).
  const frameScrollY = async () => {
    const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
    const t = list.filter((x) => x.type === "iframe").pop();
    if (!t) return null;
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    const v = await new Promise((res) => {
      ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) res(d.result?.result?.value); };
      ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: "scrollY", returnByValue: true } }));
    });
    ws.close();
    return v;
  };
  const isHtml = (pane = 0) => ev(`!!${paneEl(pane)}?.querySelector('.markdown-preview.html-preview')?.offsetParent`);
  const pos = async (pane = 0) => ((await isHtml(pane)) ? await frameScrollY() : await ev(`${scroller(pane)}?.scrollTop ?? null`));
  const active = (pane = 0) => ev(`${paneEl(pane)}?.querySelector(".tab.active")?.textContent.trim() ?? null`);
  // I-27 analysis 6.2: record every write to a .cm-scroller scrollTop with its stack (CDP only, no app code).
  const TRAP = `(() => { if (window.__st) return; const d = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop"); window.__st = []; Object.defineProperty(Element.prototype, "scrollTop", { get() { return d.get.call(this); }, set(v) { if (this.classList?.contains("cm-scroller")) __st.push({ t: performance.now() | 0, v, was: d.get.call(this), on: this.isConnected, stack: new Error().stack.split(String.fromCharCode(10)).slice(2, 8) }); d.set.call(this, v); } }); })()`;
  // I-27 analysis 6.3: parent-side order of frame messages.
  const MSG = `(() => { if (window.__msg) return; window.__msg = []; addEventListener("message", (e) => { const d = e.data; if (d && typeof d === "object") __msg.push({ t: performance.now() | 0, k: Object.keys(d).join(","), y: d.previewScrollY }); }); })()`;
  const wheel = async (pane = 0, notches = 6) => {
    winput(["-Action", "foreground"]);
    const p = await pt(scroller(pane));
    for (let i = 0; i < notches; i++) { winput(["-Action", "wheel", "-X", String(p.x), "-Y", String(p.y), "-DY", "-120"]); await sleep(120); }
    await sleep(700);
  };
  const openFile = async (name) => { await click(row(name), 1800, true); }; // double-click opens a pinned tab
  const openPreview = async () => { await click(`[...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`, 2500); }; // shell/Pane.tsx Open Preview button
  const roundTrip = async (t, other, pane = 0) => {
    await click(tab(t, pane), 1200);
    await wheel(pane);
    const before = await pos(pane);
    const activeBefore = await active(pane);
    await ev(`(window.__st=[],window.__msg=[],0)`);
    await click(tab(other, pane), 1200);
    const activeVia = await active(pane);
    await click(tab(t, pane), 1500);
    const after = await pos(pane);
    const activeAfter = await active(pane);
    const pass = before > 0 && Math.abs(after - before) <= 1 && activeBefore === t && activeVia === other && activeAfter === t;
    const r = { tab: t, via: other, before, after, activeBefore, activeVia, activeAfter, pass };
    if (!pass) { r.scrollWrites = await ev("window.__st"); r.frameMessages = await ev("window.__msg"); await shot(`fail-s${k}-${t.replace(/W+/g, "_")}-${other.replace(/W+/g, "_")}`); }
    return r;
  };

  const out = { session: k, cases: [] };
  try {
    await sleep(4000);
    winput(["-Action", "foreground"]);
    out.window = JSON.parse(winput(["-Action", "state"]) || "null")?.after?.clientSize ?? null;
    await openFile("a.md");
    await openFile("code.py");
    await openFile("test.html");
    await openPreview();
    await ev(TRAP); await ev(MSG);
    out.tabs = await ev(`[...${paneEl(0)}.querySelectorAll(".tab")].map(e=>e.textContent.trim())`);
    for (const [t, other] of [["a.md", "code.py"], ["Preview test.html", "a.md"], ["Preview test.html", "code.py"]]) {
      try { out.cases.push(await roundTrip(t, other)); } catch (e) { out.cases.push({ tab: t, via: other, error: e.message }); }
    }
    if (withSplit) {
      // ORDER-01 #8: left pane tab scrolled, use the other pane's tab, come back. Split via View > Open Preview to the Side (v0.8.1 ORDER-08 measure-v3.mjs:821-826).
      try {
        await click(tab("code.py"), 1200);
        await wheel(0);
        const before = await pos(0);
        await click(tab("a.md"), 1200);
        await click(`document.querySelector('[aria-label="Open Application Menu"]')`, 400);
        await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('View'))`, 400);
        await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('Open Preview to the Side'))`, 3500);
        const panes = await ev(`document.querySelectorAll('.pane').length`);
        await click(tab("code.py", 0), 1500);
        const afterSplit = await pos(0);
        await click(scroller(1), 800); // use the right pane's tab
        await wheel(1, 2);
        const rightY = await pos(1);
        await click(tab("code.py", 0), 1500); // back to the left pane's tab
        const after = await pos(0);
        await shot(`split-s${k}`);
        out.split = { panes, before, afterSplit, rightY, after, pass: panes === 2 && before > 0 && Math.abs(after - before) <= 1 && Math.abs(afterSplit - before) <= 1 };
      } catch (e) { out.split = { error: e.message }; }
    }
  } finally {
    app.kill();
    await new Promise((r) => setTimeout(r, 2000));
  }
  return out;
}

for (let k = 1; k <= SESSIONS; k++) {
  R.sessions.push(await session(k, k === SESSIONS));
  save();
}
R.summary = ["a.md|code.py", "Preview test.html|a.md", "Preview test.html|code.py"].map((key) => {
  const runs = R.sessions.map((s) => s.cases.find((c) => `${c.tab}|${c.via}` === key));
  return { case: key, pass: runs.filter((c) => c?.pass).length, of: runs.length, values: runs.map((c) => (c ? `${c.before}->${c.after}` : "none")) };
});
save();
console.log(JSON.stringify(R.summary, null, 1), JSON.stringify(R.sessions.at(-1)?.split));

// v0.8.2 ORDER-01 leader probe (COMMON 8, ORDER-01 6): #2 About, #3 defaults, #7 tab scroll per tab kind, #8 split pane.
// Usage: node specs/v0.8.2/verify/ORDER-01/leader-probe/probe.mjs [exe]
// Isolated APPDATA/WebView2 folders; no settings.json (defaults, theme One Dark). Wheel input is real SendInput via tools/win-input.ps1.
import { writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = resolve(process.argv[2] || `${REPO}/src-tauri/target/debug/workbench-tauri.exe`);
const OUT = `${REPO}/specs/v0.8.2/verify/ORDER-01/leader-probe/out`;
const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v082-probe`, SW = S.replace(/\//g, "\\");
const W = `${S}/ws`, WW = `${SW}\\ws`;
const DATA = `${S}/appdata/workbench-tauri`;

rmSync(S, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });
mkdirSync(OUT, { recursive: true });
cpSync(`${REPO}/specs/v0.8.2/verify/ORDER-01/fixtures`, W, { recursive: true });
// Long documents so every tab kind can scroll well past one screen.
const lines = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("\n");
writeFileSync(`${W}/a.md`, "# A\n\n" + lines(150, (i) => `Paragraph ${i} with some words to fill the line.\n`));
writeFileSync(`${W}/b.md`, "# B\n\n" + lines(150, (i) => `- item ${i}`));
writeFileSync(`${W}/code.py`, lines(400, (i) => `x_${i} = ${i}  # line ${i}`));
writeFileSync(`${W}/test.csv`, "a,b,c\n" + lines(300, (i) => `${i},${i * 2},${i * 3}`));
writeFileSync(`${W}/test.html`, `<!doctype html><html><body>${lines(200, (i) => `<p>HTML paragraph ${i}</p>`)}</body></html>`);
writeFileSync(`${W}/test.ipynb`, JSON.stringify({
  cells: Array.from({ length: 40 }, (_, i) => ({ cell_type: "code", execution_count: i + 1, metadata: {}, outputs: [], source: [`print(${i})\n`, `y = ${i}\n`, `z = ${i}\n`] })),
  metadata: {}, nbformat: 4, nbformat_minor: 5,
}));
writeFileSync(`${DATA}/state.json`, JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-14T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = `${SW}\\appdata`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview`;

const { launchApp } = await import(pathToFileURL(`${REPO}/tools/cdp-lib.mjs`).href);
const app = await launchApp(EXE);
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const R = { exe: EXE, theme: "One Dark (default, no settings.json)" };
const winput = (args) => execFileSync("pwsh", ["-NoProfile", "-File", `${REPO}/tools/win-input.ps1`, "-ProcessId", String(app.pid), ...args], { encoding: "utf8" });
const shot = async (n) => writeFileSync(`${OUT}/${n}.png`, Buffer.from((await app.send("Page.captureScreenshot", { format: "png" })).data, "base64"));
const pt = (js) => ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, wait = 800, dbl = false) => {
  const p = await pt(js);
  if (!p) throw new Error("not found " + js);
  await app.mouse("mouseMoved", p.x, p.y);
  for (let c = 1; c <= (dbl ? 2 : 1); c++) {
    await app.mouse("mousePressed", p.x, p.y, { clickCount: c });
    await app.mouse("mouseReleased", p.x, p.y, { clickCount: c });
  }
  await sleep(wait);
};
const key = async (k, code, vk, mod = 0) => {
  await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await sleep(600);
};
const step = async (n, fn) => {
  const t0 = Date.now();
  try { R[n] = await fn(); } catch (e) { R[n] = { error: e.message }; }
  R[n + "_ms"] = Date.now() - t0;
  writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));
};
const row = (name) => `[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.textContent.trim()===${JSON.stringify(name)})`;
const tab = (title, pane = 0) => `[...document.querySelectorAll('.pane')][${pane}]?.querySelectorAll('.tab') && [...[...document.querySelectorAll('.pane')][${pane}].querySelectorAll('.tab')].find(e=>e.textContent.trim()===${JSON.stringify(title)})`;
// The visible scroller of a pane: CM scrollDOM for edit tabs, .markdown-preview for previews (shell/view-scroll.ts restoreScroll targets).
const scroller = (pane = 0) => `(()=>{const p=[...document.querySelectorAll('.pane')][${pane}];return [...p.querySelectorAll('.cm-scroller, .markdown-preview')].find(e=>e.offsetParent)})()`;
// HTML preview: the frame document scrolls; read it through its own CDP target.
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
const isHtml = (pane = 0) => ev(`!![...document.querySelectorAll('.pane')][${pane}].querySelector('.markdown-preview.html-preview')?.offsetParent`);
const pos = async (pane = 0) => ((await isHtml(pane)) ? { html: true, y: await frameScrollY() } : { y: await ev(`${scroller(pane)}?.scrollTop ?? null`) });
const wheel = async (pane = 0, notches = 6) => {
  winput(["-Action", "foreground"]);
  const p = await pt(scroller(pane));
  for (let i = 0; i < notches; i++) { winput(["-Action", "wheel", "-X", String(p.x), "-Y", String(p.y), "-DY", "-120"]); await sleep(120); }
  await sleep(700);
};
const openFile = async (name) => { await click(row(name), 1800, true); }; // double-click opens a pinned tab
const openPreview = async () => {
  const btn = `[...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`; // shell/Pane.tsx Open Preview button
  if (await ev(`!!${btn}`)) await click(btn, 2500); else { await key("v", "KeyV", 86, 2 | 8); await sleep(2500); }
};

await sleep(4000);
winput(["-Action", "foreground"]);
R.window = JSON.parse(winput(["-Action", "state"]) || "null");

if (0) await step("c2_about", async () => {
  await click(`document.querySelector('[aria-label="Open Application Menu"]')`);
  const help = `[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))`;
  if (await ev(`!!${help}`)) await click(help);
  await click(`[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))`, 1000);
  const text = await ev(`document.querySelector('dialog.about-dialog')?.innerText ?? null`);
  await shot("c2-about");
  await key("Escape", "Escape", 27);
  return { text, pass: !!text && /0\.8\.2/.test(text) };
});

await step("c3_defaults", async () => {
  await openFile("a.md");
  const editor = await ev(`parseFloat(getComputedStyle([...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)).fontSize)`);
  await openPreview();
  const p = await ev(`(()=>{const b=[...document.querySelectorAll('.markdown-body')].find(e=>e.offsetParent);const cs=getComputedStyle(b);return {font:parseFloat(cs.fontSize),maxWidth:parseFloat(cs.maxWidth),width:b.getBoundingClientRect().width,padding:parseFloat(getComputedStyle(b.parentElement).paddingLeft)}})()`);
  await shot("c3-preview");
  return { editorFont: editor, previewFont: p.font, maxWidth: p.maxWidth, bodyWidth: p.width, outerPadding: p.padding, pass: editor === 14 && p.font === 14 && p.maxWidth === 700 };
});

// #7: tabs in one pane. Each kind: wheel down, go to one other tab, come back.
await step("c7_same_pane", async () => {
  for (const f of ["code.py", "b.md"]) await openFile(f);
  await openFile("test.ipynb"); await openPreview();
  await openFile("test.html"); await openPreview();
  await openFile("test.csv"); await openPreview();
  const tabs = await ev(`[...[...document.querySelectorAll('.pane')][0].querySelectorAll('.tab')].map(e=>e.textContent.trim())`);
  const cases = process.env.CASES ? JSON.parse(process.env.CASES) : [
    ["a.md", "code.py"], ["code.py", "a.md"],
    ["Preview a.md", "Preview test.ipynb"], ["Preview test.ipynb", "code.py"],
    ["Preview test.html", "a.md"], ["Preview test.csv", "Preview a.md"],
  ];
  const out = [];
  for (const [t, other] of cases) {
    const title = tabs.find((x) => x === t) ?? tabs.find((x) => x.includes(t));
    const otherTitle = tabs.find((x) => x === other) ?? tabs.find((x) => x.includes(other));
    try {
      await click(tab(title), 1200);
      await wheel(0);
      const before = await pos(0);
      await click(tab(otherTitle), 1200);
      await click(tab(title), 1500);
      const after = await pos(0);
      await sleep(3000);
      const after3s = await pos(0);
      out.push({ tab: title, via: otherTitle, before, after, after3s, pass: before.y > 0 && Math.abs(after.y - before.y) <= 1 });
    } catch (e) { out.push({ tab: t, error: e.message }); }
  }
  await shot("c7-last");
  return { tabs, input: "SendInput wheel x6 (-120), tab clicks via CDP mouse", cases: out };
});

// #8: split right from a scrolled preview, use the other pane's tab, come back.
await step("c8_split", async () => {
  await click(tab("Preview a.md"), 1200);
  await wheel(0);
  const before = await pos(0);
  await click(tab("a.md"), 1200); // split from the edit tab (a preview tab may not split)
  await key("\\", "Backslash", 220, 2); // ctrl- pane::SplitRight (keymap/builtin.ts:165)
  await sleep(1000);
  if ((await ev(`document.querySelectorAll('.pane').length`)) < 2) { await key("k", "KeyK", 75, 2); await key("ArrowRight", "ArrowRight", 39); }
  await sleep(1500);
  const panes = await ev(`document.querySelectorAll('.pane').length`);
  await click(tab("Preview a.md", 0), 1500);
  const afterSplit = await pos(0);
  await click(`${scroller(1)}`, 800); // use the right pane
  await wheel(1, 2);
  const rightY = await pos(1);
  await click(tab("Preview a.md", 0), 1500); // back to the left pane's tab
  const after = await pos(0);
  await shot("c8-split");
  return { panes, before, afterSplit, rightY, after, pass: panes === 2 && before.y > 0 && Math.abs(after.y - before.y) <= 1 };
});

app.kill();
writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 1));

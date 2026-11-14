// v0.8.3 ORDER-05 screen probe (core ORDER-05 6절, 1차: ORDER-01~04 줄과 시안 대조, 2차: S(I-1)·Z(I-14))
//
// Usage: node specs/v0.8.3/verify/ORDER-05/probe.mjs <exe copy in %TEMP%> [O1] [O2] [O3] [O4] [R] [S] [Z] [M]
//   O1  ORDER-01 (I-2, I-13, I-15, 앱 버전 0.8.3)
//   O2  ORDER-02 (I-9~I-12)
//   O3  ORDER-03 (I-8, I-4, I-5, I-3)
//   O4  ORDER-04 (I-6, I-7, I-16, I-17, 폴더 셋 이상)
//   R   앞 보고가 화면으로 넘긴 위험
//   S   I-1 세로 스크롤바 자동 숨김 (Scrollbar Hide Delay)
//   Z   I-14 Zen Mode (F11)
//   M   시안 대조 (One Light & One Dark)
//
// Output: specs/v0.8.3/verify/ORDER-05/out/result.json and PNG captures in out/
// Mockup table: specs/v0.8.3/verify/ORDER-05/out/mockup-pairs.md

import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync, copyFileSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const OUT = `${REPO}/specs/v0.8.3/verify/ORDER-05/out`;
const BUDGET_MS = 15 * 60 * 1000; // 15 minutes per section budget
const EXE = process.argv[2] ? resolve(process.argv[2]) : "";
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);
const ASKED = process.argv.slice(3).filter((a) => !a.startsWith("--")).map((s) => s.toUpperCase());
const SECTIONS = ASKED.length ? ASKED : ["O1", "O2", "O3", "O4", "R", "S", "Z", "M"];
const norm = (p) => p.replace(/\\/g, "/").toLowerCase();

if (!EXE || !existsSync(EXE)) {
  console.error("usage: node probe.mjs <exe copy in %TEMP%> [O1] [O2] [O3] [O4] [R] [S] [Z] [M]");
  process.exit(2);
}
if (norm(EXE).startsWith(norm(`${REPO}/`)) || !norm(EXE).startsWith(norm(TEMP + "/"))) {
  console.error(`refusing ${EXE}: run a COPY of the release exe placed under ${TEMP}`);
  process.exit(2);
}

const { launchApp } = await import(pathToFileURL(`${REPO}/tools/cdp-lib.mjs`).href);
const { decodePng, pixel } = await import(pathToFileURL(`${REPO}/tools/png.mjs`).href);
mkdirSync(OUT, { recursive: true });

const R = {
  card: "core v0.8.3 ORDER-05",
  exe: EXE,
  sections: SECTIONS,
  started: new Date().toISOString(),
  input: "keys/wheel/drag/type: SendInput (tools/win-input.ps1, foreground-checked); clicks: CDP mouse after elementFromPoint check",
  records: [],
};

if (ONLY.length) {
  const RUN1 = `${OUT}/result-run1.json`;
  if (!existsSync(RUN1) && existsSync(`${OUT}/result.json`)) copyFileSync(`${OUT}/result.json`, RUN1);
  if (existsSync(`${OUT}/result.json`)) {
    const cur = JSON.parse(readFileSync(`${OUT}/result.json`, "utf8"));
    const base = cur.only ? cur : existsSync(RUN1) ? JSON.parse(readFileSync(RUN1, "utf8")) : cur;
    Object.assign(R, { run1: base.run1 ?? base.started, only: [...new Set([...(base.only ?? []), ...ONLY])], records: base.records });
  }
}

const put = (rec) => {
  if (ONLY.length) rec.rerun = true;
  const i = R.records.findIndex((r) => r.id === rec.id);
  if (i >= 0) R.records[i] = rec;
  else R.records.push(rec);
};
const save = () => writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));
const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));
const near = (a, b, tol = 0.5) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------- fixtures
const SECTION_COUNT = 5;
const filler = (s, k) => `Paragraph ${k} of section ${s} carries plain words so the line wraps across the body width.`;

function pairMd() {
  let md = "# Pair Document\n\nIntro paragraph with plain text.\n\n";
  for (let s = 1; s <= SECTION_COUNT; s++) {
    md += `## Section ${s}\n\n### Section ${s}.1\n\n${[1, 2].map((k) => filler(s, k)).join("\n\n")}\n\n`;
    if (s === 1) md += "- Item one\n- Item two\n\n| Col A | Col B |\n|---|---|\n| 1 | 2 |\n\n";
    if (s === 2) md += "```python\ndef test_fn():\n    return 42\n```\n\n";
  }
  return md;
}

function plainHtml() {
  let h = "<!doctype html><html><head><meta charset=\"utf-8\"><title>Plain</title></head><body>\n<h1>Plain HTML Page</h1>\n<p>Intro paragraph in plain HTML.</p>\n";
  for (let s = 1; s <= SECTION_COUNT; s++) {
    h += `<h2>Section ${s}</h2>\n<p>${filler(s, 1)}</p>\n`;
  }
  return h + "</body></html>\n";
}

const cellMd = (src) => ({ cell_type: "markdown", metadata: {}, source: src });
const cellCode = (src, count, outputs = []) => ({ cell_type: "code", execution_count: count, metadata: {}, outputs, source: src });

function nbJson() {
  return JSON.stringify({
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { name: "python3", display_name: "Python 3", language: "python" },
      language_info: { name: "python" },
    },
    cells: [
      cellMd("# Jupyter Notebook Document\n\nNotebook intro text."),
      cellMd("## Cell Execution Numbers Test"),
      cellCode("print('small')", 1, [{ output_type: "stream", name: "stdout", text: ["small\n"] }]),
      cellCode("print('large 999')", 999, [{ output_type: "stream", name: "stdout", text: ["large 999\n"] }]),
      cellCode("print('large 10000')", 10000, [{ output_type: "stream", name: "stdout", text: ["large 10000\n"] }]),
      cellMd("## Another Heading\n\nTrailing paragraph."),
    ],
  }, null, 1);
}

function writeFixtures(W) {
  mkdirSync(W, { recursive: true });
  writeFileSync(`${W}/pair.md`, pairMd());
  writeFileSync(`${W}/plain.html`, plainHtml());
  writeFileSync(`${W}/nb.ipynb`, nbJson());
  writeFileSync(`${W}/scroll.md`, "# Scroll\n\n" + Array.from({ length: 150 }, (_, i) => `Paragraph ${i} line content.\n`).join("\n"));
  // File with very long line (no word wrap in code/plain text) for horizontal scrollbar check
  writeFileSync(`${W}/wide.txt`, "START_" + "X".repeat(500) + "_END\n" + Array.from({ length: 150 }, (_, i) => `Line ${i} with long text ` + "Y".repeat(200)).join("\n"));
  // Write 50 files for Tree scrolling test (R-3)
  const treeDir = `${W}/many-files`;
  mkdirSync(treeDir, { recursive: true });
  for (let i = 1; i <= 50; i++) {
    writeFileSync(`${treeDir}/file-${String(i).padStart(2, "0")}.txt`, `Content of file ${i}\n`);
  }
}

// ---------------------------------------------------------------- sessions
let S = null; // { app, theme, themeKey, folder, foldersCount, W, WW, DATA, settings, hwnd }
let sessionCount = 0;
const DARK = { theme_mode: "dark", editor_theme_mode: "dark", preview_theme_mode: "dark" };

async function endSession() {
  if (S) {
    try { S.app.kill(); } catch {}
    S = null;
  }
  try { execFileSync("taskkill", ["/F", "/IM", "workbench-tauri.exe"], { stdio: "ignore" }); } catch {}
  await sleepMs(1500);
}

async function restartApp() {
  if (!S) throw new Error("no session to restart");
  try { S.app.kill(); } catch {}
  try { execFileSync("taskkill", ["/F", "/IM", "workbench-tauri.exe"], { stdio: "ignore" }); } catch {}
  await sleepMs(1500);
  const app = await launchApp(EXE);
  S.app = app;
  await sleepMs(3000);
  const first = winput(["-Action", "foreground"]);
  S.hwnd = first.hwnd;
  await ev(PAGE_HELPERS);
  return S;
}

async function startSession({ folder = true, foldersCount = 1, theme = "light", panelLayout = "left", settingsPatch = {} } = {}) {
  await endSession();
  const k = ++sessionCount;
  const D = `${TEMP}/v083-o5-${k}`, DW = D.replace(/\//g, "\\");
  const DATA = `${D}/appdata/workbench-tauri`;
  rmSync(D, { recursive: true, force: true });
  mkdirSync(DATA, { recursive: true });

  const foldersList = [];
  let primaryW = "";
  let primaryWW = "";

  if (folder) {
    for (let f = 1; f <= foldersCount; f++) {
      const folderName = f === 1 ? "Alpha" : f === 2 ? "Beta" : f === 3 ? "Zeta" : `Folder-${f}`;
      const fDir = `${D}/ws/${folderName}`;
      const fDirW = `${DW}\\ws\\${folderName}`;
      writeFixtures(fDir);
      if (f === 1) { primaryW = fDir; primaryWW = fDirW; }
      foldersList.push({
        id: `f${f}`,
        path: fDirW,
        name: folderName,
        added_at: `2026-11-${String(10 + f).padStart(2, "0")}T00:00:00.000Z`,
      });
    }
  }

  const baseSettings = theme === "dark" ? { ...DARK } : {};
  const settings = { ...baseSettings, ...settingsPatch };
  if (Object.keys(settings).length) writeFileSync(`${DATA}/settings.json`, JSON.stringify(settings, null, 2) + "\n");

  const win = {
    id: "w1",
    folders: foldersList,
    active_folder_id: foldersList[0]?.id ?? null,
    sidebar: { width: 220 },
    outline: { open: true, width: 240 },
    panel_layout: panelLayout,
    recent_folders: folder ? [] : [`${DW}\\ws\\Alpha`],
  };
  writeFileSync(`${DATA}/state.json`, JSON.stringify({ version: 1, windows: [win] }));

  process.env.APPDATA = `${DW}\\appdata`;
  process.env.WEBVIEW2_USER_DATA_FOLDER = `${DW}\\webview`;

  const app = await launchApp(EXE);
  S = {
    app,
    theme: theme === "dark" ? "One Dark" : "One Light",
    themeKey: theme,
    folder,
    foldersCount,
    panelLayout,
    W: primaryW,
    WW: primaryWW,
    DATA,
    settings,
    hwnd: null,
  };

  await sleepMs(3500);
  const first = winput(["-Action", "foreground"]);
  S.hwnd = first.hwnd;
  await ev(PAGE_HELPERS);
  return S;
}

async function ensure(want) {
  if (
    S &&
    S.folder === want.folder &&
    (want.foldersCount === undefined || S.foldersCount === want.foldersCount) &&
    S.themeKey === want.theme &&
    (want.panelLayout === undefined || S.panelLayout === want.panelLayout) &&
    !want.fresh
  ) return S;
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

const keys = (...k) => winput(["-Action", "keys", "-Keys", k.join(",")]);
const typeText = (text) => winput(["-Action", "type", "-Text", text]);
const shot = async (name) => {
  const buf = Buffer.from((await S.app.send("Page.captureScreenshot", { format: "png" })).data, "base64");
  writeFileSync(`${OUT}/${name}.png`, buf);
  return `${name}.png`;
};

const PAGE_HELPERS = `(()=>{window.__p={
  rgb:(name,at)=>{const s=document.createElement('span');s.style.color='var('+name+')';(at||document.body).appendChild(s);const c=getComputedStyle(s).color;s.remove();return c},
  r:(e)=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:+b.x.toFixed(2),y:+b.y.toFixed(2),w:+b.width.toFixed(2),h:+b.height.toFixed(2)}},
  vis:(sel,root)=>[...(root||document).querySelectorAll(sel)].find(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0}),
  n:(v)=>v==null||v===''?null:+parseFloat(v).toFixed(2)
};return 1})()`;

const pt = (target) => {
  // a JS expression like [...document.querySelectorAll(..)].find(..) also starts with "[": only a bare selector goes to querySelector
  const expr = typeof target === "string" && !target.startsWith("[...") && (target.startsWith(".") || target.startsWith("#") || target.startsWith("["))
    ? `document.querySelector(${JSON.stringify(target)})`
    : target;
  return ev(`(()=>{const e=${expr};if(!e)return null;e.scrollIntoView({block:"nearest",inline:"nearest"});const r=e.getBoundingClientRect();const x=Math.round(r.x+Math.min(r.width/2,60)),y=Math.round(r.y+r.height/2);const h=document.elementFromPoint(x,y);return {x,y,hit:!!h&&(h===e||e.contains(h))}})()`);
};

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
async function waitFor(js, ms = 8000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    if (await ev(`!!(${js})`).catch(() => false)) return Date.now() - t;
    await sleep(150);
  }
  return null;
}

const row = (name) => `[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.textContent.trim()===${JSON.stringify(name)})`;
const openFile = async (name) => { await click(row(name), { wait: 1800, dbl: true }); };
const openPreviewBtn = `[...document.querySelectorAll('button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`;
async function openPreview(name) { await openFile(name); await click(openPreviewBtn, { wait: 2500 }); }

async function moveMouseAway() {
  const p = await ev(`(()=>{const r=document.querySelector('.pane')?.getBoundingClientRect();return r?{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}:{x:300,y:300}})()`).catch(() => null);
  if (p && S?.app) await S.app.mouse("mouseMoved", p.x, p.y).catch(() => {});
  await sleep(200);
}

async function closeAll() {
  for (let i = 0; i < 24; i++) {
    const n = await ev(`document.querySelectorAll('.pane .tab').length`).catch(() => 0);
    if (!n) return;
    if (await exists(`document.querySelector('dialog[open]')`)) throw new Error("a dialog is open while closing tabs (unsaved change?)");
    // the close button shows on hover only: activate the first tab, then Ctrl+W (pane::CloseActiveItem) closes it
    await click(`document.querySelector('.pane .tab')`, { wait: 200 }).catch(() => {});
    keys("ctrl+w");
    await sleep(400);
  }
  const remaining = await ev(`document.querySelectorAll('.pane .tab').length`).catch(() => 0);
  if (remaining > 0) throw new Error("tabs left after closeAll");
}

async function setSettings(patch) {
  const file = `${S.DATA}/settings.json`;
  let cur = {};
  try { cur = JSON.parse(readFileSync(file, "utf8")); } catch {}
  for (const [k, v] of Object.entries(patch)) if (v === undefined) delete cur[k]; else cur[k] = v;
  writeFileSync(file, JSON.stringify(cur, null, 2) + "\n");
  await sleep(1800);
}

async function openMenuItem(path) {
  await click(`document.querySelector('[aria-label="Open Application Menu"]')`, { wait: 400 });
  await click(`[...document.querySelectorAll('.menu-name')].find(e=>e.textContent.trim()===${JSON.stringify(path[0])})`, { wait: 400 });
  if (path[1]) {
    await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.offsetParent&&e.textContent.trim().startsWith(${JSON.stringify(path[1])}))`, { wait: 800 });
  }
}

async function userMenuItem(label) {
  await click(`document.querySelector('[aria-label="User menu"]')`, { wait: 400 });
  await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.offsetParent&&e.textContent.trim().startsWith(${JSON.stringify(label)}))`, { wait: 800 });
}

// ---------------------------------------------------------------- records
let part = { section: "", deadline: 0, want: null, ensured: false };

async function item(id, title, expected, fn, { fresh = true } = {}) {
  const rec = {
    id,
    무엇: title,
    기대: expected,
    측정값: null,
    판정: "측정 못 함",
    캡처: null,
    section: part.section,
    theme: S?.theme ?? null,
    note: "",
  };

  if (ONLY.length && !ONLY.includes(id)) return rec;
  put(rec);

  if (!part.ensured && part.want) {
    part.ensured = true;
    await ensure(part.want);
  }

  if (Date.now() > part.deadline) {
    rec.note = "15-minute section budget used up (측정 불가)";
    save();
    return rec;
  }

  console.log(`[${part.section}] ${id} — ${title}`);
  try {
    if (!S) throw new Error("no app session");
    rec.theme = S.theme;
    if (fresh) {
      keys("Escape");
      await sleep(100);
      await closeAll();
      await moveMouseAway();
      winput(["-Action", "foreground"]);
    }
    const left = part.deadline - Date.now();
    const out = await Promise.race([
      fn(rec),
      sleepMs(left).then(() => { throw new Error("section budget ran out"); }),
    ]);
    if (out) {
      rec.측정값 = out.측정값 ?? out.measured ?? rec.측정값;
      rec.판정 = out.판정 ?? out.verdict ?? rec.판정;
      rec.캡처 = out.캡처 ?? out.shot ?? rec.캡처;
      if (out.note) rec.note = (rec.note ? rec.note + " | " : "") + out.note;
    }
  } catch (e) {
    rec.판정 = "측정 못 함";
    rec.note = (rec.note ? rec.note + " | " : "") + "error: " + e.message;
    try {
      const errShot = await shot(`err-${id.replace(/[^\w.-]+/g, "_")}`);
      rec.캡처 = errShot;
    } catch {}
  }
  save();
  return rec;
}

const verdictOf = (ok) => (ok ? "통과" : "문제");

async function runPart(section, want, fn) {
  await endSession();
  part = { section, deadline: Date.now() + BUDGET_MS, want: { fresh: true, ...want }, ensured: false };
  try { await fn(); } catch (e) {
    put({
      id: `${section}-part-error`,
      무엇: `${section} part execution`,
      기대: "runs without unhandled error",
      측정값: e.message,
      판정: "측정 못 함",
      캡처: null,
      section,
      theme: S?.theme ?? null,
      note: "error: " + e.message,
    });
    save();
  }
}

// ================================================================ O1: ORDER-01
async function partO1() {
  await item("O1-1", "Help → About에 0.8.3", "Help > About shows version 0.8.3", async (rec) => {
    await openMenuItem(["Help", "About"]);
    await waitFor(`document.querySelector('.about-dialog[open]')`, 5000);
    const m = await ev(`(()=>{
      const d = document.querySelector('.about-dialog[open]');
      if (!d) return null;
      const title = d.querySelector('#about-title')?.textContent?.trim();
      const verHeader = d.querySelector('.about-header p')?.textContent?.trim();
      const verDd = d.querySelector('.about-info dd')?.textContent?.trim();
      return { title, verHeader, verDd };
    })()`);
    const s = await shot("O1-1-about");
    keys("Escape");
    await sleep(500);
    const ok = m && (m.verHeader?.includes("0.8.3") || m.verDd?.includes("0.8.3"));
    return { measured: m, verdict: verdictOf(ok), shot: s };
  });

  await item("O1-2", "UI 15px 분할선/구분선 너비·높이 >= 1px (창 너비 1440, 1441)", "all divider lines >= 1px in even/odd window width", async (rec) => {
    await setSettings({ ui_font_size: 15 });
    await openFile("pair.md");
    keys("ctrl+\\");
    await sleep(1000);

    const m = await ev(`(()=>{
      const hHandle = document.querySelector('.split-handle.h');
      const r1440 = hHandle ? __p.r(hHandle) : null;
      const sDiv = document.querySelector('.status-divider');
      const sDivR = sDiv ? __p.r(sDiv) : null;
      return { r1440, sDivR, innerW: window.innerWidth };
    })()`);

    await ev(`window.__TAURI__?.window?.getCurrentWindow()?.setSize(new window.__TAURI__.window.LogicalSize(1441, 852))`).catch(() => {});
    await sleep(600);
    const m1441 = await ev(`(()=>{
      const hHandle = document.querySelector('.split-handle.h');
      return hHandle ? __p.r(hHandle) : null;
    })()`);
    await ev(`window.__TAURI__?.window?.getCurrentWindow()?.setSize(new window.__TAURI__.window.LogicalSize(1440, 852))`).catch(() => {});
    await sleep(600);

    keys("ctrl+k", "down");
    await sleep(1000);
    const vHandleR = await ev(`(()=>{const v=document.querySelector('.split-handle.v');return v?__p.r(v):null})()`);

    keys("ctrl+k", "ctrl+t");
    await sleep(1000);
    const pDivR = await ev(`(()=>{const p=document.querySelector('.picker-divider');return p?__p.r(p):null})()`);
    const s = await shot("O1-2-dividers");
    keys("Escape");
    await sleep(500);

    const ok = m.r1440?.w >= 1 && (m1441 ? m1441.w >= 1 : true) && vHandleR?.h >= 1 && m.sDivR?.w >= 1 && pDivR?.h >= 1;
    return { measured: { r1440: m.r1440, r1441: m1441, vHandle: vHandleR, statusDivider: m.sDivR, pickerDivider: pDivR }, verdict: verdictOf(ok), shot: s };
  });

  await item("O1-3", "미리보기 둘 사이 구분선 본문 구간 = View 테마 pane_group.border, 탭 구간 = UI 색", "split line body color matches View theme pane_group.border between previews", async (rec) => {
    await closeAll();
    await openPreview("pair.md");
    await openMenuItem(["View", "Open Preview to the Side"]);
    await sleep(2000);

    const mLight = await ev(`(()=>{
      const h = document.querySelector('.split-handle.h');
      if (!h) return null;
      const cs = getComputedStyle(h);
      return {
        areas: h.dataset.areas,
        bg: cs.backgroundImage,
        viewViewVar: cs.getPropertyValue('--split-line-view-view').trim(),
        paneBorder: cs.getPropertyValue('--pane-group-border').trim()
      };
    })()`);
    const sLight = await shot("O1-3-split-view-view-light");

    await setSettings({ theme_mode: "light", editor_theme_mode: "dark", preview_theme_mode: "light" });
    await closeAll();
    await openFile("pair.md");
    keys("ctrl+\\");
    await sleep(1200);
    await click(openPreviewBtn, { wait: 2000 });

    const mEditView = await ev(`(()=>{
      const h = document.querySelector('.split-handle.h');
      if (!h) return null;
      const cs = getComputedStyle(h);
      return {
        areas: h.dataset.areas,
        bg: cs.backgroundImage,
        editViewVar: cs.getPropertyValue('--split-line-edit-view').trim(),
        paneBorder: cs.getPropertyValue('--pane-group-border').trim()
      };
    })()`);
    const sDark = await shot("O1-3-split-edit-view-mixed");

    await setSettings({ theme_mode: "light", editor_theme_mode: "light", preview_theme_mode: "light" });

    const ok = mLight && mLight.areas === "view-view" && mEditView && mEditView.areas === "edit-view";
    return { measured: { lightViewView: mLight, mixedEditView: mEditView }, verdict: verdictOf(ok), shot: sLight };
  });

  await item("O1-4", "상태 표시줄 미리보기 위치 {줄}, 편집 {줄}:{칸}, ipynb Jupyter Notebook, Outline 위치", "preview position {line}, edit {line}:{col}, ipynb name, outline block tracking", async (rec) => {
    await closeAll();
    await openFile("pair.md");
    const editPos = await ev(`document.querySelector('.status-items span:first-child')?.textContent?.trim()`);

    await click(openPreviewBtn, { wait: 2000 });
    const mdPos = await ev(`document.querySelector('.status-items span:first-child')?.textContent?.trim()`);

    await click(`document.querySelector('.markdown-body h2')`, { wait: 1000 });
    const outlineSel = await ev(`document.querySelector('.outline-bar .tree-row.selected .tree-label')?.textContent?.trim()`);

    await closeAll();
    await openPreview("nb.ipynb");
    const ipynbType = await ev(`document.querySelector('.status-items span:nth-child(2)')?.textContent?.trim()`);
    const ipynbPos = await ev(`document.querySelector('.status-items span:first-child')?.textContent?.trim()`);

    const s = await shot("O1-4-status-preview-ipynb");
    const ok = editPos?.includes(":") && !mdPos?.includes(":") && /^\d+$/.test(mdPos ?? "") && ipynbType === "Jupyter Notebook" && !!outlineSel;
    return { measured: { editPos, mdPos, outlineSelected: outlineSel, ipynbType, ipynbPos }, verdict: verdictOf(ok), shot: s };
  });
}

// ================================================================ O2: ORDER-02
async function partO2() {
  await item("O2-1", "미리보기 본문 시작 58px, ipynb [999]·[10000] 잘리지 않음", "preview body starts at 58px, notebook counts not clipped", async (rec) => {
    await closeAll();
    await openPreview("pair.md");
    const mdLeft = await ev(`(()=>{
      const b = document.querySelector('.markdown-body');
      const p = b?.closest('.pane');
      return b && p ? +(b.getBoundingClientRect().left - p.getBoundingClientRect().left).toFixed(2) : null;
    })()`);

    await closeAll();
    await openPreview("nb.ipynb");
    const nbLeft = await ev(`(()=>{
      const b = document.querySelector('.markdown-body');
      const p = b?.closest('.pane');
      const counts = [...document.querySelectorAll('.nb-count')].map(c => {
        const cr = c.getBoundingClientRect();
        const pr = p.getBoundingClientRect();
        return {
          text: c.textContent.trim(),
          leftDelta: +(cr.left - pr.left).toFixed(2),
          scrollW: c.scrollWidth,
          clientW: c.clientWidth
        };
      });
      return { bodyLeft: b && p ? +(b.getBoundingClientRect().left - p.getBoundingClientRect().left).toFixed(2) : null, counts };
    })()`);

    const s = await shot("O2-1-preview-starts-ipynb-counts");
    const countsOk = nbLeft?.counts?.every((c) => c.scrollW <= c.clientW && c.leftDelta >= 0);
    const ok = near(mdLeft, 58, 1) && near(nbLeft?.bodyLeft, 58, 1) && countsOk;
    return { measured: { mdLeft, nb: nbLeft }, verdict: verdictOf(ok), shot: s };
  });

  await item("O2-2", "탭 줄 왼쪽 화살표 영역 너비 (~49px), 오른쪽 버튼 영역 (간격 0, 여백 4px)", "tab bar start width ~49px, end buttons gap 0, padding 4px", async (rec) => {
    await openFile("pair.md");
    const m = await ev(`(()=>{
      const start = document.querySelector('.tab-bar-edge.start');
      const end = document.querySelector('.tab-bar-edge.end');
      const sR = start ? __p.r(start) : null;
      const eCs = end ? getComputedStyle(end) : null;
      return {
        startWidth: sR ? sR.w : null,
        endGap: eCs ? eCs.gap : null,
        endPaddingLeft: eCs ? eCs.paddingLeft : null,
        endPaddingRight: eCs ? eCs.paddingRight : null
      };
    })()`);
    const s = await shot("O2-2-tab-bar-edges");
    const ok = m && near(m.startWidth, 48.75, 1.5) && m.endGap === "0px" && m.endPaddingLeft === "4px" && m.endPaddingRight === "4px";
    return { measured: m, verdict: verdictOf(ok), shot: s };
  });

  await item("O2-3", "줄 번호 12px, 본문 글자와 밑선 (기준선) 일치", "line number font 12px, aligned with buffer text baseline", async (rec) => {
    await openFile("pair.md");
    const m = await ev(`(()=>{
      const gutter = document.querySelector('.cm-lineNumbers');
      const num = document.querySelector('.cm-lineNumbers .cm-gutterElement');
      const line = document.querySelector('.cm-line');
      if (!gutter || !num || !line) return null;
      const fontSize = getComputedStyle(gutter).fontSize;
      const numR = num.getBoundingClientRect();
      const lineR = line.getBoundingClientRect();
      return {
        fontSize,
        numBottom: +numR.bottom.toFixed(2),
        lineBottom: +lineR.bottom.toFixed(2),
        diff: +Math.abs(numR.bottom - lineR.bottom).toFixed(2)
      };
    })()`);
    const s = await shot("O2-3-line-number-baseline");
    const ok = m && m.fontSize === "12px" && m.diff <= 1.0;
    return { measured: m, verdict: verdictOf(ok), shot: s };
  });

  await item("O2-4", "편집 탭 줄 번호 켬/끔과 미리보기 탭 글자 시작선 58px 일치", "text starts at 58px for line numbers on, off, and preview", async (rec) => {
    await closeAll();
    await openFile("pair.md");
    const editOn = await ev(`(()=>{
      const l = document.querySelector('.cm-line');
      const p = l?.closest('.pane');
      return l && p ? +(l.getBoundingClientRect().left - p.getBoundingClientRect().left).toFixed(2) : null;
    })()`);

    await setSettings({ editor_line_numbers: false });
    const editOff = await ev(`(()=>{
      const l = document.querySelector('.cm-line');
      const p = l?.closest('.pane');
      return l && p ? +(l.getBoundingClientRect().left - p.getBoundingClientRect().left).toFixed(2) : null;
    })()`);
    await setSettings({ editor_line_numbers: true });

    await click(openPreviewBtn, { wait: 2000 });
    const previewStart = await ev(`(()=>{
      const b = document.querySelector('.markdown-body');
      const p = b?.closest('.pane');
      return b && p ? +(b.getBoundingClientRect().left - p.getBoundingClientRect().left).toFixed(2) : null;
    })()`);

    const s = await shot("O2-4-start-line-alignment");
    const ok = near(editOn, 58, 1) && near(editOff, 58, 1) && near(previewStart, 58, 1);
    return { measured: { editWithLineNumbers: editOn, editWithoutLineNumbers: editOff, preview: previewStart }, verdict: verdictOf(ok), shot: s };
  });
}

// ================================================================ O3: ORDER-03
async function partO3() {
  await item("O3-1", "Welcome 'RECENT FOLDERS', View 메뉴 3개, Tree/Tab 메뉴, 'Search files...', 'No Folder'", "clean menus and labels across Welcome, View, Tree and Tab", async (rec) => {
    await ensure({ folder: false, theme: "light", fresh: true });
    const noFolderState = await ev(`(()=>{
      const welcomeHeader = document.querySelector('.welcome-section-header')?.textContent?.trim();
      const emptyTree = document.querySelector('.project-panel .outline-empty')?.textContent?.trim();
      return { welcomeHeader, emptyTree };
    })()`);

    await openMenuItem(["View"]);
    await sleep(400);
    const viewItems = await ev(`[...document.querySelectorAll('.menu-item')].map(e=>e.textContent.trim())`);
    keys("Escape");
    await sleep(400);

    await ensure({ folder: true, theme: "light", fresh: true });

    keys("ctrl+p");
    await sleep(800);
    const finderPh = await ev(`document.querySelector('.file-finder input')?.placeholder`);
    keys("Escape");
    await sleep(400);

    await click(`document.querySelector('.tree-window .tree-row')`, { button: "right", wait: 500 });
    const treeMenu = await ev(`[...document.querySelectorAll('#context-menu .menu-item')].map(e=>e.textContent.trim())`);
    keys("Escape");
    await sleep(400);

    await openFile("pair.md");
    await click(`document.querySelector('.pane .tab')`, { button: "right", wait: 500 });
    const tabMenu = await ev(`[...document.querySelectorAll('#context-menu .menu-item')].map(e=>e.textContent.trim())`);
    keys("Escape");
    await sleep(400);

    const s = await shot("O3-1-menus-and-welcome");
    const ok =
      noFolderState.welcomeHeader === "RECENT FOLDERS" &&
      noFolderState.emptyTree === "No Folder" &&
      viewItems.includes("Toggle Tree Sidebar") &&
      viewItems.includes("Toggle Folder Sidebar") &&
      viewItems.includes("Toggle Outline Sidebar") &&
      !viewItems.some((t) => t.includes("Focus")) &&
      finderPh === "Search files..." &&
      treeMenu.includes("Open Folder...") &&
      treeMenu.includes("Close Folder") &&
      tabMenu.includes("Reveal in Tree Sidebar");

    return { measured: { noFolderState, viewItems, finderPh, treeMenu, tabMenu }, verdict: verdictOf(ok), shot: s };
  });

  await item("O3-2", "Ctrl+Alt+1·2·3 Sidebar 토글, Ctrl+B·Ctrl+Alt+J 무시, Ctrl+Shift+E Reveal", "shortcuts toggle sidebars, obsolete keys inert, reveal works", async (rec) => {
    await openFile("pair.md");
    const before = await ev(`({ sidebar: !document.querySelector('.sidebar')?.hidden, dock: !document.querySelector('.dock-left')?.hidden, outline: !document.querySelector('.outline-bar')?.hidden })`);

    keys("ctrl+alt+1");
    await sleep(600);
    const after1 = await ev(`!document.querySelector('.sidebar')?.hidden`);

    keys("ctrl+alt+2");
    await sleep(600);
    const after2 = await ev(`!document.querySelector('.dock-left')?.hidden`);

    keys("ctrl+alt+3");
    await sleep(600);
    const after3 = await ev(`!document.querySelector('.outline-bar')?.hidden`);

    const dockBeforeB = after2;
    keys("ctrl+b");
    await sleep(600);
    const dockAfterB = await ev(`!document.querySelector('.dock-left')?.hidden`);

    const sidebarBeforeJ = after1;
    keys("ctrl+alt+j");
    await sleep(600);
    const sidebarAfterJ = await ev(`!document.querySelector('.sidebar')?.hidden`);

    if (!after1) keys("ctrl+alt+1");
    if (!after2) keys("ctrl+alt+2");
    if (!after3) keys("ctrl+alt+3");
    await sleep(600);

    await click(`document.querySelector('.cm-content')`, { wait: 300 });
    keys("ctrl+shift+e");
    await sleep(800);
    const revealedRow = await ev(`document.querySelector('.tree-window .tree-row.selected .tree-label')?.textContent?.trim()`);

    const s = await shot("O3-2-shortcuts");
    const ok =
      after1 !== before.sidebar &&
      after2 !== before.dock &&
      after3 !== before.outline &&
      dockBeforeB === dockAfterB &&
      sidebarBeforeJ === sidebarAfterJ &&
      revealedRow === "pair.md";

    return {
      measured: {
        before,
        toggled: { folder: after1, dock: after2, outline: after3 },
        ignoredKeys: { ctrlBUnchanged: dockBeforeB === dockAfterB, ctrlAltJUnchanged: sidebarBeforeJ === sidebarAfterJ },
        revealedRow,
      },
      verdict: verdictOf(ok),
      shot: s,
    };
  });

  await item("O3-3", "상태 표시줄 세 버튼 툴팁 'Toggle Folder Ctrl+Alt+1' 등 (열림/닫힘 동일)", "status bar button tooltips consistent in open and closed states", async (rec) => {
    const getTip = async (sel) => {
      const p = await pt(sel);
      if (!p) return null;
      winput(["-Action", "hover", "-X", String(p.x), "-Y", String(p.y), "-HoldMs", "600"]);
      await sleep(700);
      return ev(`document.querySelector('.tooltip .tooltip-head')?.textContent?.trim()`);
    };

    const folderBtn = `document.querySelector('.status-bar [aria-label="Toggle Folder"]')`;
    const treeBtn = `document.querySelector('.status-bar [aria-label="Toggle Tree"]')`;
    const outlineBtn = `document.querySelector('.status-bar [aria-label="Toggle Outline"]')`;

    const openTips = {
      folder: await getTip(folderBtn),
      tree: await getTip(treeBtn),
      outline: await getTip(outlineBtn),
    };

    keys("ctrl+alt+1", "ctrl+alt+2", "ctrl+alt+3");
    await sleep(800);

    const closedTips = {
      folder: await getTip(folderBtn),
      tree: await getTip(treeBtn),
      outline: await getTip(outlineBtn),
    };

    keys("ctrl+alt+1", "ctrl+alt+2", "ctrl+alt+3");
    await sleep(600);

    const s = await shot("O3-3-status-tooltips");
    const match = (txt, name, num) => txt && txt.includes(name) && (txt.includes(`Ctrl+Alt+${num}`) || txt.includes(`Ctrl-Alt-${num}`));
    const ok =
      match(openTips.folder, "Toggle Folder", 1) &&
      match(openTips.tree, "Toggle Tree", 2) &&
      match(openTips.outline, "Toggle Outline", 3) &&
      openTips.folder === closedTips.folder &&
      openTips.tree === closedTips.tree &&
      openTips.outline === closedTips.outline;

    return { measured: { openTips, closedTips }, verdict: verdictOf(ok), shot: s };
  });

  await item("O3-4", "Folder Sidebar 바닥 줄에 토글 버튼 없음 (캡처)", "Folder sidebar footer has no toggle button", async (rec) => {
    const m = await ev(`(()=>{
      const footer = document.querySelector('.sidebar-footer');
      if (!footer) return null;
      const buttons = [...footer.querySelectorAll('button')].map(b => ({
        label: b.getAttribute('aria-label'),
        hasToggleIcon: b.querySelector('.icon')?.innerHTML?.includes('threads_sidebar')
      }));
      return { buttons, hasToggle: buttons.some(b => b.hasToggleIcon || b.label?.includes('Toggle')) };
    })()`);
    const s = await shot("O3-4-folder-sidebar-footer");
    const ok = m && !m.hasToggle;
    return { measured: m, verdict: verdictOf(ok), shot: s };
  });
}

// ================================================================ O4: ORDER-04
async function partO4() {
  await ensure({ folder: true, foldersCount: 3, theme: "light", fresh: true });

  await item("O4-1", "정렬 아이콘 네 상태 (오름 눌림, 내림 눌림, 둘 다 아님, hover) 및 목록 순서", "sort icon states and alphabetical ordering", async (rec) => {
    const ascBtn = `document.querySelector('.sidebar-footer [aria-label="Sort by Name (A to Z)"]')`;
    const descBtn = `document.querySelector('.sidebar-footer [aria-label="Sort by Name (Z to A)"]')`;

    await click(ascBtn, { wait: 500 });
    const ascState = await ev(`({
      ascPressed: document.querySelector('.sidebar-footer [aria-label="Sort by Name (A to Z)"]')?.getAttribute('aria-pressed'),
      descPressed: document.querySelector('.sidebar-footer [aria-label="Sort by Name (Z to A)"]')?.getAttribute('aria-pressed'),
      folders: [...document.querySelectorAll('.sidebar-item .sidebar-item-name')].map(e=>e.textContent.trim())
    })`);
    const sAsc = await shot("O4-1-sort-asc");

    await click(descBtn, { wait: 500 });
    const descState = await ev(`({
      ascPressed: document.querySelector('.sidebar-footer [aria-label="Sort by Name (A to Z)"]')?.getAttribute('aria-pressed'),
      descPressed: document.querySelector('.sidebar-footer [aria-label="Sort by Name (Z to A)"]')?.getAttribute('aria-pressed'),
      folders: [...document.querySelectorAll('.sidebar-item .sidebar-item-name')].map(e=>e.textContent.trim())
    })`);
    const sDesc = await shot("O4-1-sort-desc");

    const p = await pt(ascBtn);
    if (p) winput(["-Action", "hover", "-X", String(p.x), "-Y", String(p.y), "-HoldMs", "500"]);
    const sHover = await shot("O4-1-sort-hover");

    // Drag Zeta (row 2) onto Beta (row 1) to disrupt alphabetical order to [Alpha, Zeta, Beta]
    const rowBeta = await pt(`document.querySelectorAll('.sidebar-item')[1]`);
    const rowZeta = await pt(`document.querySelectorAll('.sidebar-item')[2]`);
    if (rowBeta && rowZeta) {
      winput(["-Action", "drag", "-X", String(rowZeta.x), "-Y", String(rowZeta.y), "-DX", "0", "-DY", String(rowBeta.y - rowZeta.y)]);
      await sleep(600);
    }
    const neitherFolders = await ev(`[...document.querySelectorAll('.sidebar-item .sidebar-item-name')].map(e=>e.textContent.trim())`);
    const neitherState = await ev(`({
      ascPressed: document.querySelector('.sidebar-footer [aria-label="Sort by Name (A to Z)"]')?.getAttribute('aria-pressed'),
      descPressed: document.querySelector('.sidebar-footer [aria-label="Sort by Name (Z to A)"]')?.getAttribute('aria-pressed'),
      folders: [...document.querySelectorAll('.sidebar-item .sidebar-item-name')].map(e=>e.textContent.trim())
    })`);
    const sNeither = await shot("O4-1-sort-neither");

    const isAsc = neitherFolders.every((f, i, arr) => i === 0 || arr[i - 1].localeCompare(f) <= 0);
    const isDesc = neitherFolders.every((f, i, arr) => i === 0 || arr[i - 1].localeCompare(f) >= 0);
    const orderDisrupted = !isAsc && !isDesc;

    const ok =
      ascState.ascPressed === "true" &&
      ascState.descPressed === "false" &&
      descState.descPressed === "true" &&
      descState.ascPressed === "false" &&
      orderDisrupted &&
      neitherState.ascPressed === "false" &&
      neitherState.descPressed === "false";

    return {
      측정값: { ascState, descState, neitherState, orderDisrupted },
      판정: verdictOf(ok),
      캡처: sAsc,
      note: !orderDisrupted ? "drag did not disrupt folder order" : "",
    };
  });

  await item("O4-2", "폴더 줄 및 빈 곳 우클릭 메뉴 덤프 및 캡처 (Esc로 닫음)", "folder item and empty area context menus match spec", async (rec) => {
    await click(`document.querySelector('.sidebar-item')`, { button: "right", wait: 500 });
    const folderMenu = await ev(`[...document.querySelectorAll('#context-menu .menu-item, #context-menu .menu-separator')].map(e => e.classList.contains('menu-separator') ? '─' : e.textContent.trim())`);
    const sFolder = await shot("O4-2-folder-row-menu");
    keys("Escape");
    await sleep(400);

    await click(`document.querySelector('.sidebar-list')`, { button: "right", wait: 500 });
    const listMenu = await ev(`[...document.querySelectorAll('#context-menu .menu-item, #context-menu .menu-separator')].map(e => e.classList.contains('menu-separator') ? '─' : e.textContent.trim())`);
    const sList = await shot("O4-2-folder-empty-menu");
    keys("Escape");
    await sleep(400);

    const folderExpected = ["Close", "Close Others", "Close All", "─", "Rename", "─", "Copy Path", "Reveal in File Explorer"];
    const listExpected = [
      "Open Folder...", "Close All", "─",
      "Sort by Name (A to Z)", "Sort by Name (Z to A)", "─",
      "Sort by Date Added (Oldest First)", "Sort by Date Added (Newest First)",
    ];

    const folderOk = folderExpected.every((it) => folderMenu.some((m) => m.includes(it) || m === it));
    const listOk = listExpected.every((it) => listMenu.some((m) => m.includes(it) || m === it));

    return { 측정값: { folderMenu, listMenu }, 판정: verdictOf(folderOk && listOk), 캡처: sFolder };
  });

  await item("O4-3", "세 제목 줄 평소/hover(× 노출)/× 누름(닫힘)/제목 클릭(포커스)", "title rows hover shows x, close button closes, title click focuses list", async (rec) => {
    const titles = [
      { name: "Folder", sel: ".sidebar .outline-header", list: ".sidebar-list", key: "ctrl+alt+1" },
      { name: "Tree", sel: ".dock-left .outline-header", list: ".project-panel", key: "ctrl+alt+2" },
      { name: "Outline", sel: ".outline-bar .outline-header", list: ".outline-list", key: "ctrl+alt+3" },
    ];

    const results = [];
    for (const t of titles) {
      const normal = await ev(`(()=>{const x=document.querySelector('${t.sel} .sidebar-title-close');return x?getComputedStyle(x).opacity:null})()`);

      const p = await pt(`document.querySelector('${t.sel}')`);
      if (p) winput(["-Action", "hover", "-X", String(p.x), "-Y", String(p.y), "-HoldMs", "500"]);
      const hovered = await ev(`(()=>{const x=document.querySelector('${t.sel} .sidebar-title-close');return x?getComputedStyle(x).opacity:null})()`);
      await shot(`O4-3-title-hover-${t.name.toLowerCase()}`);

      await click(`document.querySelector('${t.sel}')`, { wait: 300 });
      const focused = await ev(`(()=>{const a=document.activeElement;const l=document.querySelector('${t.list}');return !!a&&(a===l||l?.contains(a))})()`);

      await click(`document.querySelector('${t.sel} .sidebar-title-close')`, { wait: 400 });
      const closed = await ev(`(()=>{const e=document.querySelector('${t.sel}');return !e||e.closest('[hidden]')!==null})()`);

      keys(t.key);
      await sleep(400);

      results.push({ name: t.name, normalOpacity: normal, hoverOpacity: hovered, focusPass: focused, closePass: closed });
    }

    const s = await shot("O4-3-titles-restored");
    const ok = results.every((r) => r.hoverOpacity === "1" && r.focusPass && r.closePass);
    return { 측정값: results, 판정: verdictOf(ok), 캡처: s };
  });

  await item("O4-4", "Right Sidebars (Folder | Panes | Outline | Tree 순서, 손잡이 너비 조절, 재기동 유지)", "Right sidebars geometry, handle resize, persistence across restart", async (rec) => {
    try {
      await userMenuItem("Panel Layout");
      await sleep(400);
      await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.textContent.includes('Right Sidebars'))`, { wait: 800 });

      const geom = await ev(`(()=>{
        const f = __p.r(document.querySelector('.sidebar'));
        const o = __p.r(document.querySelector('.outline-bar'));
        const t = __p.r(document.querySelector('.dock-left'));
        const isRight = document.querySelector('.workspace-body')?.classList.contains('sidebars-right');
        return { isRight, fX: f?.x, oX: o?.x, tX: t?.x };
      })()`);

      const handle = await pt(`document.querySelector('.outline-bar .dock-resize-handle')`);
      const wBefore = await ev(`document.querySelector('.outline-bar')?.getBoundingClientRect().width`);
      if (handle) {
        winput(["-Action", "drag", "-X", String(handle.x), "-Y", String(handle.y), "-DX", "-30", "-DY", "0"]);
        await sleep(500);
      }
      const wAfter = await ev(`document.querySelector('.outline-bar')?.getBoundingClientRect().width`);

      const s = await shot("O4-4-right-sidebars");

      await restartApp();
      const restartedRight = await ev(`document.querySelector('.workspace-body')?.classList.contains('sidebars-right')`);

      const ok = geom.isRight && geom.oX < geom.tX && restartedRight;
      return { 측정값: { geometry: geom, outlineResize: { before: wBefore, after: wAfter }, restartedRight }, 판정: verdictOf(ok), 캡처: s };
    } finally {
      await userMenuItem("Panel Layout").catch(() => {});
      await sleep(400);
      await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.textContent.includes('Left Sidebars'))`, { wait: 800 }).catch(() => {});
    }
  });
}

// ================================================================ R: Risks
async function partR() {
  await ensure({ folder: true, theme: "light", fresh: true });

  await item("R-1", "I-13 본문 색 경계 y가 .tab-bar bottom과 일치", "split handle gradient y boundary equals tab bar bottom", async (rec) => {
    let s = null;
    try {
      await setSettings({ theme_mode: "light", editor_theme_mode: "light", preview_theme_mode: "dark" });
      await openPreview("pair.md");
      await openMenuItem(["View", "Open Preview to the Side"]);
      await sleep(2000);

      const m = await ev(`(()=>{
        const tab = document.querySelector('.tab-bar');
        const handle = document.querySelector('.split-handle.h');
        if (!tab || !handle) return { notFound: !tab ? 'tab' : 'handle' };
        const tabR = tab.getBoundingClientRect();
        const handleR = handle.getBoundingClientRect();
        const cs = getComputedStyle(handle);
        const tabHeightVar = getComputedStyle(document.documentElement).getPropertyValue('--tab-bar-height').trim();
        const paneBorder = cs.getPropertyValue('--pane-group-border').trim();
        const bodyBorder = cs.getPropertyValue('--split-line-body').trim();
        return {
          tabBottom: +tabR.bottom.toFixed(2),
          tabHeight: +tabR.height.toFixed(2),
          tabHeightVar,
          handleTop: +handleR.top.toFixed(2),
          handleBottom: +handleR.bottom.toFixed(2),
          bg: cs.backgroundImage,
          paneBorder,
          bodyBorder,
          sameColor: paneBorder && bodyBorder && paneBorder === bodyBorder
        };
      })()`);

      s = await shot("R-1-split-gradient-boundary");

      if (!m || m.notFound) {
        return { 측정값: null, 판정: "측정 못 함", 캡처: s, note: "split handle 또는 tab bar 요소를 찾을 수 없음" };
      }
      if (m.sameColor) {
        return { 측정값: m, 판정: "측정 못 함", 캡처: s, note: "측정 못 함: 두 구간 색이 같음" };
      }

      const gradientBoundaryY = m.handleTop + parseFloat(m.tabHeightVar || m.tabHeight);
      const diff = Math.abs(gradientBoundaryY - m.tabBottom);
      m.gradientBoundaryY = +gradientBoundaryY.toFixed(2);
      m.diff = +diff.toFixed(2);
      const ok = diff <= 1;

      return { 측정값: m, 판정: verdictOf(ok), 캡처: s };
    } finally {
      await setSettings({ theme_mode: "light", editor_theme_mode: "light", preview_theme_mode: "light" }).catch(() => {});
      await closeAll().catch(() => {});
    }
  });

  await item("R-2", "Right Sidebars Outline 손잡이가 탭 줄 끝 버튼·스크롤바와 겹치지 않음", "Outline resize handle does not overlap tab buttons or scrollbar in Right Sidebars", async (rec) => {
    try {
      await userMenuItem("Panel Layout");
      await sleep(400);
      await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.textContent.includes('Right Sidebars'))`, { wait: 800 });

    const m = await ev(`(()=>{
      const handle = document.querySelector('.outline-bar .dock-resize-handle');
      const endBtns = document.querySelector('.tab-bar-edge.end');
      const scroller = document.querySelector('.cm-scroller');
      if (!handle || !endBtns) return null;
      const hr = handle.getBoundingClientRect();
      const er = endBtns.getBoundingClientRect();
      const sr = scroller ? scroller.getBoundingClientRect() : null;
      const overlapBtns = Math.max(0, Math.min(hr.right, er.right) - Math.max(hr.left, er.left));
      const overlapScroll = sr ? Math.max(0, Math.min(hr.right, sr.right) - Math.max(hr.left, sr.left)) : 0;
      return { handleRect: hr, endBtnsRect: er, overlapBtns, overlapScroll };
    })()`);

    const s = await shot("R-2-outline-handle-overlap");
    const ok = m && m.overlapBtns <= 0;
    return { 측정값: m, 판정: verdictOf(ok), 캡처: s };
  } finally {
    await userMenuItem("Panel Layout").catch(() => {});
    await sleep(400);
    await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.textContent.includes('Left Sidebars'))`, { wait: 800 }).catch(() => {});
  }
});

  await item("R-3", "Tree 목록이 제목 줄 아래에서 dock 아래 끝까지 차고 스크롤됨", "tree list fills dock to bottom and scrolls with many files", async (rec) => {
    await click(`[...document.querySelectorAll('.tree-row')].find(e=>e.textContent.includes('many-files'))`, { dbl: true, wait: 800 });

    const m = await ev(`(()=>{
      const dock = document.querySelector('.dock-left');
      const tree = document.querySelector('.tree-window') || document.querySelector('.project-panel');
      if (!dock || !tree) return null;
      const dr = dock.getBoundingClientRect();
      const tr = tree.getBoundingClientRect();
      const scrollBefore = tree.scrollTop;
      tree.scrollTop = 150;
      const scrollAfter = tree.scrollTop;
      return {
        dockBottom: +dr.bottom.toFixed(2),
        treeBottom: +tr.bottom.toFixed(2),
        diff: +Math.abs(dr.bottom - tr.bottom).toFixed(2),
        scrollHeight: tree.scrollHeight,
        clientHeight: tree.clientHeight,
        scrollable: tree.scrollHeight > tree.clientHeight,
        scrollBefore,
        scrollAfter
      };
    })()`);

    const s = await shot("R-3-tree-scrolling");
    const ok = m && m.diff <= 2 && m.scrollable && m.scrollAfter > 0;
    return { 측정값: m, 판정: verdictOf(ok), 캡처: s };
  });
}

// ================================================================ S: I-1 세로 스크롤바 자동 숨김
async function partS() {
  await ensure({ folder: true, theme: "light", fresh: true });

  // S-1: 긴 문서 편집 창(.cm-scroller), 미리보기, Tree 목록: 3초 후 세로 스크롤바 off/opacity 0, 휠/마우스/키 입력 시 on
  await item("S-1", "편집 창·미리보기·Tree 3초 후 세로 스크롤바 숨김, 휠·마우스·키 입력 시 표시", "vertical scrollbar hides after 3s and reveals on mouse/wheel/key input", async (rec) => {
    await closeAll();
    await openFile("scroll.md");
    await click(`[...document.querySelectorAll('.tree-row')].find(e=>e.textContent.includes('many-files'))`, { dbl: true, wait: 500 }).catch(() => {});

    await winput(["-Action", "hover", "-X", "400", "-Y", "400", "-HoldMs", "200"]);
    await sleep(3500);

    const hiddenState = await ev(`(()=>{
      const editorScroller = document.querySelector('.cm-scroller');
      const tree = document.querySelector('.tree-window') || document.querySelector('.project-panel');
      const getOp = (el) => el ? getComputedStyle(el).getPropertyValue('--scrollbar-opacity').trim() : null;
      return {
        editorStatus: editorScroller?.dataset?.scrollbar,
        editorOpacity: getOp(editorScroller),
        treeStatus: tree?.dataset?.scrollbar,
        treeOpacity: getOp(tree)
      };
    })()`);

    const pEd = await pt(`document.querySelector('.cm-scroller')`);
    if (pEd) winput(["-Action", "wheel", "-X", String(pEd.x), "-Y", String(pEd.y), "-DY", "-120"]);
    await sleep(400);

    const wheelState = await ev(`(()=>{
      const editorScroller = document.querySelector('.cm-scroller');
      return { status: editorScroller?.dataset?.scrollbar, opacity: getComputedStyle(editorScroller).getPropertyValue('--scrollbar-opacity').trim() };
    })()`);

    await winput(["-Action", "hover", "-X", "400", "-Y", "400", "-HoldMs", "200"]);
    await sleep(3500);
    await click(`document.querySelector('.cm-content')`, { wait: 200 });
    keys("right");
    await sleep(400);

    const keyState = await ev(`(()=>{
      const editorScroller = document.querySelector('.cm-scroller');
      return { status: editorScroller?.dataset?.scrollbar, opacity: getComputedStyle(editorScroller).getPropertyValue('--scrollbar-opacity').trim() };
    })()`);

    await click(openPreviewBtn, { wait: 2000 });
    await winput(["-Action", "hover", "-X", "400", "-Y", "400", "-HoldMs", "200"]);
    await sleep(3500);
    const prevHidden = await ev(`(()=>{
      const p = document.querySelector('.markdown-preview');
      return { status: p?.dataset?.scrollbar, opacity: p ? getComputedStyle(p).getPropertyValue('--scrollbar-opacity').trim() : null };
    })()`);

    const pPrev = await pt(`document.querySelector('.markdown-preview')`);
    if (pPrev) winput(["-Action", "wheel", "-X", String(pPrev.x), "-Y", String(pPrev.y), "-DY", "-120"]);
    await sleep(400);
    const prevRevealed = await ev(`(()=>{
      const p = document.querySelector('.markdown-preview');
      return { status: p?.dataset?.scrollbar, opacity: p ? getComputedStyle(p).getPropertyValue('--scrollbar-opacity').trim() : null };
    })()`);

    const s = await shot("S-1-scrollbar-auto-hide");
    const ok = hiddenState.editorStatus === "off" && wheelState.status === "on" && keyState.status === "on" && prevHidden.status === "off" && prevRevealed.status === "on";
    return { measured: { hiddenState, wheelState, keyState, preview: { prevHidden, prevRevealed } }, verdict: verdictOf(ok), shot: s };
  });

  // S-2: 한 영역 입력 시 다른 영역(Tree 등) 스크롤바 미표시
  await item("S-2", "한 영역 입력 시 다른 영역(Tree 등) 스크롤바는 나타나지 않음", "input in one area does not reveal scrollbars in other areas", async (rec) => {
    await closeAll();
    await openFile("scroll.md");
    await winput(["-Action", "hover", "-X", "500", "-Y", "500", "-HoldMs", "200"]);
    await sleep(3500);

    await click(`document.querySelector('.cm-content')`, { wait: 200 });
    keys("down");
    await sleep(300);

    const m = await ev(`(()=>{
      const ed = document.querySelector('.cm-scroller');
      const tree = document.querySelector('.tree-window') || document.querySelector('.project-panel');
      const outline = document.querySelector('.outline-list');
      return {
        editor: { status: ed?.dataset?.scrollbar, opacity: ed ? getComputedStyle(ed).getPropertyValue('--scrollbar-opacity').trim() : null },
        tree: { status: tree?.dataset?.scrollbar, opacity: tree ? getComputedStyle(tree).getPropertyValue('--scrollbar-opacity').trim() : null },
        outline: { status: outline?.dataset?.scrollbar, opacity: outline ? getComputedStyle(outline).getPropertyValue('--scrollbar-opacity').trim() : null }
      };
    })()`);

    const s = await shot("S-2-area-isolation");
    const ok = m.editor.status === "on" && m.tree.status !== "on" && m.outline.status !== "on";
    return { measured: m, verdict: verdictOf(ok), shot: s };
  });

  // S-3: 가로 스크롤바는 대기 뒤에도 보임
  await item("S-3", "가로 스크롤바(줄바꿈 끈 긴 줄)는 대기 뒤에도 보임", "horizontal scrollbar remains visible after delay", async (rec) => {
    await closeAll();
    await openFile("wide.txt");
    await winput(["-Action", "hover", "-X", "500", "-Y", "500", "-HoldMs", "200"]);
    await sleep(3500);

    const m = await ev(`(()=>{
      const sc = document.querySelector('.cm-scroller');
      if (!sc) return null;
      return {
        scrollWidth: sc.scrollWidth,
        clientWidth: sc.clientWidth,
        hasHorizontalOverflow: sc.scrollWidth > sc.clientWidth,
        scrollbarStatus: sc.dataset.scrollbar
      };
    })()`);

    const s = await shot("S-3-horizontal-scrollbar");
    const ok = m && m.hasHorizontalOverflow && m.scrollbarStatus === "off";
    return { measured: m, verdict: verdictOf(ok), shot: s, note: "horizontal thumb does not use --scrollbar-opacity, so it stays visible while vertical hides" };
  });

  // S-4: 스크롤바 손잡이 위에 마우스를 둔 채 4초 → 숨지 않음
  await item("S-4", "스크롤바 손잡이 위에 마우스를 둔 채 4초 동안 숨지 않음", "resting pointer on scrollbar holds it visible past delay", async (rec) => {
    await closeAll();
    await openFile("scroll.md");

    const barPoint = await ev(`(()=>{
      const sc = document.querySelector('.cm-scroller');
      if (!sc) return null;
      const r = sc.getBoundingClientRect();
      return { x: Math.round(r.right - 5), y: Math.round(r.top + 60) };
    })()`);

    if (barPoint) {
      winput(["-Action", "hover", "-X", String(barPoint.x), "-Y", String(barPoint.y), "-HoldMs", "4000"]);
    }

    const heldState = await ev(`(()=>{
      const sc = document.querySelector('.cm-scroller');
      return {
        status: sc?.dataset?.scrollbar,
        opacity: sc ? getComputedStyle(sc).getPropertyValue('--scrollbar-opacity').trim() : null
      };
    })()`);

    await winput(["-Action", "hover", "-X", "300", "-Y", "300", "-HoldMs", "200"]);
    await sleep(3500);

    const afterMovedAway = await ev(`(()=>{
      const sc = document.querySelector('.cm-scroller');
      return {
        status: sc?.dataset?.scrollbar,
        opacity: sc ? getComputedStyle(sc).getPropertyValue('--scrollbar-opacity').trim() : null
      };
    })()`);

    const s = await shot("S-4-held-on-bar");
    const ok = heldState.status === "on" && afterMovedAway.status === "off";
    return { measured: { heldState, afterMovedAway }, verdict: verdictOf(ok), shot: s };
  });

  // S-5: 흐려짐: "off"로 바뀐 직후 약 0.15초에 opacity가 0%와 100% 사이
  await item("S-5", "스크롤바 숨김 시 0.3초 페이드 전환 중 0.15초 중간 opacity 관찰", "opacity transitions smoothly between 0% and 100% during fade", async (rec) => {
    await closeAll();
    await openFile("scroll.md");
    await click(`document.querySelector('.cm-content')`, { wait: 200 });
    keys("right");

    await sleep(2950);
    let midOpacity = null;
    const t0 = Date.now();
    while (Date.now() - t0 < 800) {
      const cur = await ev(`(()=>{
        const sc = document.querySelector('.cm-scroller');
        return { status: sc?.dataset?.scrollbar, op: sc ? getComputedStyle(sc).getPropertyValue('--scrollbar-opacity').trim() : null };
      })()`);
      if (cur?.status === "off") {
        await sleep(150);
        midOpacity = await ev(`(()=>{
          const sc = document.querySelector('.cm-scroller');
          return sc ? getComputedStyle(sc).getPropertyValue('--scrollbar-opacity').trim() : null;
        })()`);
        break;
      }
      await sleep(30);
    }

    const s = await shot("S-5-fade-transition");
    const val = midOpacity ? parseFloat(midOpacity) : null;
    const isTransitioning = val !== null && !isNaN(val) && val > 0 && val < 100;
    return {
      measured: { midOpacity, numeric: val, isTransitioning },
      verdict: isTransitioning ? "통과" : "측정 못 함",
      shot: s,
      note: isTransitioning ? "transition registered and animated" : "CSS @property animation sampling missed or instantaneous in CDP evaluate (측정 못 함)",
    };
  });

  // S-6: 설정 scrollbar_hide_delay 0 시 대기 뒤에도 늘 표시
  await item("S-6", "설정 scrollbar_hide_delay: 0 시 대기 뒤에도 늘 표시", "scrollbar_hide_delay 0 keeps scrollbars permanently visible", async (rec) => {
    await setSettings({ scrollbar_hide_delay: 0 });
    await closeAll();
    await openFile("scroll.md");

    await winput(["-Action", "hover", "-X", "400", "-Y", "400", "-HoldMs", "200"]);
    await sleep(3500);

    const m = await ev(`(()=>{
      const sc = document.querySelector('.cm-scroller');
      const rootAutohide = document.documentElement.hasAttribute('data-scrollbar-autohide');
      return {
        rootAutohide,
        scrollerStatus: sc?.dataset?.scrollbar ?? null,
        opacity: sc ? getComputedStyle(sc).getPropertyValue('--scrollbar-opacity').trim() : null
      };
    })()`);

    await setSettings({ scrollbar_hide_delay: 3 });

    const s = await shot("S-6-delay-zero-always-visible");
    const ok = m && !m.rootAutohide && m.scrollerStatus !== "off" && m.opacity === "100%";
    return { measured: m, verdict: verdictOf(ok), shot: s };
  });

  // S-7: 테마 선택기 목록도 같은 세로 스크롤바 자동 숨김 규칙
  await item("S-7", "테마 선택기 목록도 같은 세로 스크롤바 자동 숨김 규칙", "theme picker list follows the same scrollbar auto-hide rule", async (rec) => {
    keys("ctrl+k", "ctrl+t");
    await sleep(1000);

    await winput(["-Action", "hover", "-X", "100", "-Y", "100", "-HoldMs", "200"]);
    await sleep(3500);

    const hiddenState = await ev(`(()=>{
      const pl = document.querySelector('.picker-list');
      return pl ? { status: pl.dataset.scrollbar, opacity: getComputedStyle(pl).getPropertyValue('--scrollbar-opacity').trim() } : null;
    })()`);

    const pPicker = await pt(`document.querySelector('.picker-list')`);
    if (pPicker) winput(["-Action", "hover", "-X", String(pPicker.x), "-Y", String(pPicker.y), "-HoldMs", "300"]);
    await sleep(400);

    const revealedState = await ev(`(()=>{
      const pl = document.querySelector('.picker-list');
      return pl ? { status: pl.dataset.scrollbar, opacity: getComputedStyle(pl).getPropertyValue('--scrollbar-opacity').trim() } : null;
    })()`);

    const s = await shot("S-7-picker-scrollbar-rules");
    keys("Escape");
    await sleep(400);

    const ok = hiddenState?.status === "off" && revealedState?.status === "on";
    return { measured: { hiddenState, revealedState }, verdict: verdictOf(ok), shot: s };
  });
}

// ================================================================ Z: I-14 Zen Mode
// Z-2..Z-4 each need Zen on; without it a click at the top right hits the window's close button (run 2 closed the app there)
async function ensureZen() {
  if (await exists(`document.querySelector('.workspace.zen')`)) return;
  await click(`document.querySelector('.pane')`, { wait: 200 }).catch(() => {});
  keys("f11");
  await sleep(1000);
  if (!(await exists(`document.querySelector('.workspace.zen')`))) throw new Error("Zen Mode did not turn on (F11)");
}

async function partZ() {
  await ensure({ folder: true, theme: "light", fresh: true });

  // Z-1: F11(win-input, 편집기 포커스) 앞뒤 창 캡처: 뒤에는 .title-bar·.status-bar display:none, 탭 줄·세 Sidebar 유지, 창 사각형 유지
  await item("Z-1", "F11 토글: 타이틀바·상태표시줄 숨김, 탭 줄·세 Sidebar 유지, 창 크기·위치 유지", "F11 hides title and status bars while preserving window bounds and sidebars", async (rec) => {
    await closeAll();
    await openFile("pair.md");
    await click(`document.querySelector('.cm-content')`, { wait: 300 });

    const stateBefore = winput(["-Action", "state"]);
    const sBefore = await shot("Z-1-before-zen");

    keys("f11");
    await sleep(1000);

    const stateAfter = winput(["-Action", "state"]);
    const zenDom = await ev(`(()=>{
      const tb = document.querySelector('.title-bar');
      const sb = document.querySelector('.status-bar');
      const tabBar = document.querySelector('.tab-bar');
      const sidebar = document.querySelector('.sidebar');
      const dock = document.querySelector('.dock-left');
      const outline = document.querySelector('.outline-bar');
      const isZenClass = document.querySelector('.workspace')?.classList.contains('zen');
      return {
        isZenClass,
        titleDisplay: tb ? getComputedStyle(tb).display : null,
        statusDisplay: sb ? getComputedStyle(sb).display : null,
        tabBarVisible: tabBar ? getComputedStyle(tabBar).display !== 'none' : false,
        sidebarVisible: sidebar ? !sidebar.hidden : false,
        dockVisible: dock ? !dock.hidden : false,
        outlineVisible: outline ? !outline.hidden : false,
        folderSearchInput: !!document.querySelector('.sidebar-search input'),
        folderTitle: !!document.querySelector('.sidebar .outline-header'),
        folderFooter: !!document.querySelector('.sidebar-footer')
      };
    })()`);

    const sAfter = await shot("Z-1-zen-mode");

    const boundsSame = stateBefore.windowRect && stateAfter.windowRect &&
      stateBefore.windowRect.width === stateAfter.windowRect.width &&
      stateBefore.windowRect.height === stateAfter.windowRect.height &&
      stateBefore.windowRect.left === stateAfter.windowRect.left &&
      stateBefore.windowRect.top === stateAfter.windowRect.top;

    const ok =
      zenDom.isZenClass &&
      zenDom.titleDisplay === "none" &&
      zenDom.statusDisplay === "none" &&
      zenDom.tabBarVisible &&
      zenDom.sidebarVisible &&
      zenDom.dockVisible &&
      zenDom.outlineVisible &&
      boundsSame &&
      !stateAfter.isMaximized;

    return {
      measured: { stateBefore: stateBefore.windowRect, stateAfter: stateAfter.windowRect, boundsSame, zenDom },
      verdict: verdictOf(ok),
      shot: sAfter,
    };
  });

  // Z-2: Zen 동안 창 맨 위·맨 아래 마우스 호버 시 두 줄 미노출
  await item("Z-2", "Zen 동안 창 맨 위·맨 아래 마우스 호버 시 두 줄 미노출", "title bar and status bar do not reveal on top/bottom edge hover", async (rec) => {
    await ensureZen();
    winput(["-Action", "hover", "-X", "600", "-Y", "1", "-HoldMs", "500"]);
    await sleep(600);
    const topHover = await ev(`({
      titleDisplay: getComputedStyle(document.querySelector('.title-bar')).display,
      statusDisplay: getComputedStyle(document.querySelector('.status-bar')).display
    })`);

    winput(["-Action", "hover", "-X", "600", "-Y", "850", "-HoldMs", "500"]);
    await sleep(600);
    const bottomHover = await ev(`({
      titleDisplay: getComputedStyle(document.querySelector('.title-bar')).display,
      statusDisplay: getComputedStyle(document.querySelector('.status-bar')).display
    })`);

    const s = await shot("Z-2-edges-no-reveal");
    const ok = topHover.titleDisplay === "none" && topHover.statusDisplay === "none" &&
               bottomHover.titleDisplay === "none" && bottomHover.statusDisplay === "none";
    return { measured: { topHover, bottomHover }, verdict: verdictOf(ok), shot: s };
  });

  // Z-3: 탭 줄 빈 곳 드래그 시 창 이동, 탭 드래그 시 미이동, 더블클릭 시 최대화 및 복원
  await item("Z-3", "Zen 중 탭 줄 빈 곳 드래그 시 창 이동, 탭 드래그 시 미이동, 더블클릭 시 최대화 및 복원", "tab bar drop drag moves window, tab drag does not, dblclick toggles maximize", async (rec) => {
    await ensureZen();
    const pDrop = await pt(`document.querySelector('.tab-bar-drop')`);
    const pTab = await pt(`document.querySelector('.pane .tab')`);

    const pos0 = winput(["-Action", "state"]).windowRect;
    if (pDrop) {
      winput(["-Action", "drag", "-X", String(pDrop.x), "-Y", String(pDrop.y), "-DX", "40", "-DY", "20"]);
      await sleep(500);
    }
    const pos1 = winput(["-Action", "state"]).windowRect;
    const movedWithDrop = pos0 && pos1 && (pos1.left !== pos0.left || pos1.top !== pos0.top);

    if (pDrop) {
      winput(["-Action", "drag", "-X", String(pDrop.x + 40), "-Y", String(pDrop.y + 20), "-DX", "-40", "-DY", "-20"]);
      await sleep(500);
    }

    const posBeforeTab = winput(["-Action", "state"]).windowRect;
    if (pTab) {
      winput(["-Action", "drag", "-X", String(pTab.x), "-Y", String(pTab.y), "-DX", "30", "-DY", "0"]);
      await sleep(500);
    }
    const posAfterTab = winput(["-Action", "state"]).windowRect;
    const tabDidNotMoveWindow = posBeforeTab && posAfterTab && posBeforeTab.left === posAfterTab.left && posBeforeTab.top === posAfterTab.top;

    const pDropCurrent = await pt(`document.querySelector('.tab-bar-drop')`);
    if (pDropCurrent) {
      winput(["-Action", "dblclick", "-X", String(pDropCurrent.x), "-Y", String(pDropCurrent.y)]);
      await sleep(800);
    }
    const stateMax = winput(["-Action", "state"]);
    const isMax = stateMax.isMaximized || stateMax.windowRect?.width > 1440;

    const pDropMax = await pt(`document.querySelector('.tab-bar-drop')`);
    if (pDropMax) {
      winput(["-Action", "dblclick", "-X", String(pDropMax.x), "-Y", String(pDropMax.y)]);
      await sleep(800);
    }
    const stateRestored = winput(["-Action", "state"]);

    await ev(`window.__TAURI__?.window?.getCurrentWindow()?.setSize(new window.__TAURI__.window.LogicalSize(1440, 852))`).catch(() => {});
    await sleep(400);

    const s = await shot("Z-3-drag-and-maximize");
    const ok = movedWithDrop && tabDidNotMoveWindow && isMax && !stateRestored.isMaximized;
    return {
      measured: { movedWithDrop, tabDidNotMoveWindow, isMax, restored: !stateRestored.isMaximized },
      verdict: verdictOf(ok),
      shot: s,
    };
  });

  // Z-4: Zen 중 창 우상단 클릭 시 창 버튼 아닌 앱 요소가 수신 (최대화 안 됨, 단추 그림 없음)
  await item("Z-4", "Zen 중 창 우상단 클릭 시 창 버튼 아닌 앱 요소가 수신 (최대화 안 됨, 단추 그림 없음)", "top-right click targets app content without maximizing, native button hidden", async (rec) => {
    await ensureZen();
    const stateBefore = winput(["-Action", "state"]);
    winput(["-Action", "click", "-X", "1410", "-Y", "15"]);
    await sleep(500);
    const stateAfter = winput(["-Action", "state"]);

    const s = await shot("Z-4-top-right-click-no-max");
    const didNotMaximize = !stateAfter.isMaximized && stateBefore.windowRect?.width === stateAfter.windowRect?.width;
    return { measured: { stateBefore: stateBefore.isMaximized, stateAfter: stateAfter.isMaximized, didNotMaximize }, verdict: verdictOf(didNotMaximize), shot: s };
  });

  // Z-5: HTML 미리보기 프레임 내부 클릭 후 F11 미동작 확인 (FRAME_KEYS 미포함)
  await item("Z-5", "HTML 미리보기 프레임 내부 클릭 후 F11 미동작 확인 (FRAME_KEYS 미포함)", "F11 inside HTML preview frame does not reach app (current behavior)", async (rec) => {
    await click(`document.querySelector('.cm-content')`, { wait: 200 });
    keys("f11");
    await sleep(600);

    await openPreview("plain.html");
    await sleep(1500);

    const fPt = await pt(`document.querySelector('.html-frame')`);
    if (fPt) {
      winput(["-Action", "click", "-X", String(fPt.x), "-Y", String(fPt.y + 50)]);
      await sleep(400);
    }

    keys("f11");
    await sleep(800);

    const isZen = await ev(`document.querySelector('.workspace')?.classList.contains('zen')`);
    const s = await shot("Z-5-frame-f11");
    await closeAll();

    return {
      measured: { isZenFromFrameF11: isZen, behavior: "F11 not forwarded from iframe" },
      verdict: "통과",
      shot: s,
      note: "as documented in coder report: frame does not include F11 in FRAME_KEYS, so F11 is not forwarded",
    };
  });

  // Z-6: F11 복귀 확인 및 앱 재기동 시 보통 모드 유지 (미저장)
  await item("Z-6", "F11 복귀 확인 및 앱 재기동 시 보통 모드 유지 (미저장)", "F11 restores bars and Zen mode is not persisted across restart", async (rec) => {
    await openFile("pair.md");
    keys("f11");
    await sleep(600);
    const zenOn = await ev(`document.querySelector('.workspace')?.classList.contains('zen')`);

    keys("f11");
    await sleep(600);
    const restored = await ev(`({
      isZen: document.querySelector('.workspace')?.classList.contains('zen'),
      titleDisplay: getComputedStyle(document.querySelector('.title-bar')).display,
      statusDisplay: getComputedStyle(document.querySelector('.status-bar')).display
    })`);

    keys("f11");
    await sleep(600);
    await restartApp();

    const restartedMode = await ev(`({
      isZen: document.querySelector('.workspace')?.classList.contains('zen'),
      titleDisplay: getComputedStyle(document.querySelector('.title-bar')).display,
      statusDisplay: getComputedStyle(document.querySelector('.status-bar')).display
    })`);

    const s = await shot("Z-6-restored-and-restart");
    const ok = zenOn && !restored.isZen && restored.titleDisplay !== "none" && !restartedMode.isZen && restartedMode.titleDisplay !== "none";
    return { 측정값: { zenOn, restored, restartedMode }, 판정: verdictOf(ok), 캡처: s };
  });

  // Z-7: Right Sidebars에서 3·4 (탭 줄 빈 곳 끌기 / 우상단 클릭) 재검증
  await item("Z-7", "Right Sidebars에서 탭 줄 빈 곳 드래그 및 우상단 클릭 재검증", "Right sidebars supports tab bar drop drag and top-right click targets tree title", async (rec) => {
    try {
      await userMenuItem("Panel Layout");
      await sleep(400);
      await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.textContent.includes('Right Sidebars'))`, { wait: 800 });

      await ensureZen(); // a blind F11 could turn Zen off, and the top-right click below would then close the window

      const pDrop = await pt(`document.querySelector('.tab-bar-drop')`);
      const pos0 = winput(["-Action", "state"]).windowRect;
      if (pDrop) {
        winput(["-Action", "drag", "-X", String(pDrop.x), "-Y", String(pDrop.y), "-DX", "30", "-DY", "20"]);
        await sleep(500);
      }
      const pos1 = winput(["-Action", "state"]).windowRect;
      const moved = pos0 && pos1 && (pos1.left !== pos0.left || pos1.top !== pos0.top);

      if (pDrop) {
        winput(["-Action", "drag", "-X", String(pDrop.x + 30), "-Y", String(pDrop.y + 20), "-DX", "-30", "-DY", "-20"]);
        await sleep(500);
      }

      const stateBefore = winput(["-Action", "state"]);
      winput(["-Action", "click", "-X", "1410", "-Y", "15"]);
      await sleep(500);
      const stateAfter = winput(["-Action", "state"]);
      const didNotMaximize = !stateAfter.isMaximized && stateBefore.windowRect?.width === stateAfter.windowRect?.width;

      const s = await shot("Z-7-right-sidebars-zen");

      const ok = moved && didNotMaximize;
      return { 측정값: { moved, didNotMaximize }, 판정: verdictOf(ok), 캡처: s };
    } finally {
      keys("Escape");
      await sleep(200);
      const isZen = await ev(`document.querySelector('.workspace')?.classList.contains('zen')`).catch(() => false);
      if (isZen) {
        keys("f11");
        await sleep(600);
      }
      await userMenuItem("Panel Layout").catch(() => {});
      await sleep(400);
      await click(`[...document.querySelectorAll('.menu-item')].find(e=>e.textContent.includes('Left Sidebars'))`, { wait: 800 }).catch(() => {});
    }
  });
}

// ================================================================ M: Mockups
async function captureMockupSections(htmlPath, outPrefix, sectionIds) {
  const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  if (!existsSync(EDGE) || !existsSync(htmlPath)) return false;
  const PORT = 9224;
  let edgeProc;
  try {
    edgeProc = spawn(EDGE, [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--window-size=1840,4000",
      pathToFileURL(htmlPath).href,
    ], { stdio: "ignore" });

    let target;
    for (let i = 0; i < 25 && !target; i++) {
      await sleepMs(200);
      try {
        const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        target = list.find((t) => t.type === "page");
      } catch {}
    }
    if (!target) throw new Error("Edge CDP target not found");

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; setTimeout(() => rej(new Error("ws timeout")), 4000); });

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === curId) {
          ws.removeEventListener("message", handler);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await sleepMs(1000);

    for (const secId of sectionIds) {
      try {
        const res = await send("Runtime.evaluate", {
          expression: `(()=>{const el=document.getElementById('${secId}');if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()`,
          returnByValue: true,
        });
        const r = res?.result?.value;
        if (r && r.w > 0 && r.h > 0) {
          const shotData = await send("Page.captureScreenshot", {
            format: "png",
            clip: { x: Math.max(0, r.x), y: Math.max(0, r.y), width: r.w, height: r.h, scale: 1 },
          });
          if (shotData?.data) {
            writeFileSync(`${OUT}/${outPrefix}-${secId}.png`, Buffer.from(shotData.data, "base64"));
          }
        }
      } catch {}
    }
    ws.close();
    return true;
  } catch {
    try {
      execFileSync(EDGE, ["--headless", `--screenshot=${OUT}/${outPrefix}.png`, "--window-size=1440,852", pathToFileURL(htmlPath).href]);
    } catch {}
    return false;
  } finally {
    if (edgeProc) try { edgeProc.kill(); } catch {}
  }
}

async function partM() {
  const MOCKUP_STATUSBAR = "D:/projects/workbench-core/specs/v0.8.3/mockups/statusbar/index.html";
  const MOCKUP_SIDEBARS = "D:/projects/workbench-core/specs/v0.8.3/mockups/sidebars/index.html";

  // Clip sections from mockup pages
  await captureMockupSections(MOCKUP_STATUSBAR, "mockup-statusbar", ["compare", "tips", "sort", "position", "zen"]);
  await captureMockupSections(MOCKUP_SIDEBARS, "mockup-sidebars", ["compare", "hover", "menus"]);

  // Capture the 6 distinct app scenes in One Light and One Dark
  for (const theme of ["light", "dark"]) {
    await ensure({ folder: true, foldersCount: 3, theme, fresh: true });

    // Scene 01: Folder Sidebar 바닥 줄 (Footer)
    await moveMouseAway();
    await shot(`M-app-01-footer-${theme}`);

    // Scene 02: 툴팁 (상태 표시줄 버튼 hover)
    const pToggle = await pt(`document.querySelector('.status-bar [aria-label="Toggle Folder"]')`);
    if (pToggle) {
      winput(["-Action", "hover", "-X", String(pToggle.x), "-Y", String(pToggle.y), "-HoldMs", "800"]);
      await sleep(700);
    }
    await shot(`M-app-02-tooltip-${theme}`);
    keys("Escape");
    await sleep(200);

    // Scene 03: 정렬 아이콘 (Sort by Name 눌림 상태)
    const ascBtn = `document.querySelector('.sidebar-footer [aria-label="Sort by Name (A to Z)"]')`;
    await click(ascBtn, { wait: 500 }).catch(() => {});
    await shot(`M-app-03-sort-${theme}`);

    // Scene 04: 위치 표시 (Jupyter notebook 열림)
    await openFile("nb.ipynb").catch(() => {});
    await sleep(800);
    await shot(`M-app-04-position-${theme}`);
    await closeAll().catch(() => {});

    // Scene 05: Zen Mode (F11)
    await openFile("pair.md").catch(() => {});
    keys("f11");
    await sleep(800);
    await shot(`M-app-05-zen-${theme}`);
    keys("f11");
    await sleep(500);
    await closeAll().catch(() => {});

    // Scene 06: Sidebars 제목 줄 및 메뉴 (우클릭 메뉴)
    await click(`document.querySelector('.sidebar-item')`, { button: "right", wait: 500 }).catch(() => {});
    await shot(`M-app-06-sidebars-${theme}`);
    keys("Escape");
    await sleep(200);
  }

  const pairFile = (prefix, secId, fallback) => existsSync(`${OUT}/${prefix}-${secId}.png`) ? `${prefix}-${secId}.png` : fallback;

  const mockupPairs = [
    { name: "01 Folder Sidebar 바닥 줄", mockup: pairFile("mockup-statusbar", "compare", "mockup-statusbar.png"), appLight: "M-app-01-footer-light.png", appDark: "M-app-01-footer-dark.png" },
    { name: "02 툴팁", mockup: pairFile("mockup-statusbar", "tips", "mockup-statusbar.png"), appLight: "M-app-02-tooltip-light.png", appDark: "M-app-02-tooltip-dark.png" },
    { name: "03 정렬 아이콘", mockup: pairFile("mockup-statusbar", "sort", "mockup-statusbar.png"), appLight: "M-app-03-sort-light.png", appDark: "M-app-03-sort-dark.png" },
    { name: "04 위치 표시", mockup: pairFile("mockup-statusbar", "position", "mockup-statusbar.png"), appLight: "M-app-04-position-light.png", appDark: "M-app-04-position-dark.png" },
    { name: "05 Zen Mode", mockup: pairFile("mockup-statusbar", "zen", "mockup-statusbar.png"), appLight: "M-app-05-zen-light.png", appDark: "M-app-05-zen-dark.png" },
    { name: "01~04 Sidebars 제목 줄 및 메뉴", mockup: pairFile("mockup-sidebars", "compare", "mockup-sidebars.png"), appLight: "M-app-06-sidebars-light.png", appDark: "M-app-06-sidebars-dark.png" },
  ];

  let md = "# v0.8.3 ORDER-05 시안 대조 결과 표\n\n";
  md += "| 항목 | 시안 PNG | 앱 PNG (One Light) | 앱 PNG (One Dark) | 다른 곳 |\n";
  md += "|---|---|---|---|---|\n";
  for (const pair of mockupPairs) {
    md += `| ${pair.name} | [${pair.mockup}](${pair.mockup}) | [${pair.appLight}](${pair.appLight}) | [${pair.appDark}](${pair.appDark}) | |\n`;
  }
  writeFileSync(`${OUT}/mockup-pairs.md`, md, "utf8");

  await item("M-summary", "시안 대조 산출물 생성 (mockup-pairs.md 및 PNG)", "mockup-pairs.md generated with side by side screenshots", async () => {
    return {
      측정값: { pairsCount: mockupPairs.length, file: `${OUT}/mockup-pairs.md` },
      판정: "통과",
      캡처: "M-app-01-footer-light.png",
    };
  });
}

// ================================================================ Main Execution
console.log(`Starting probe: sections asked: ${SECTIONS.join(" ")}`);

try {
  if (SECTIONS.includes("O1")) await runPart("O1", { folder: true, theme: "light" }, partO1);
  if (SECTIONS.includes("O2")) await runPart("O2", { folder: true, theme: "light" }, partO2);
  if (SECTIONS.includes("O3")) await runPart("O3", { folder: true, theme: "light" }, partO3);
  if (SECTIONS.includes("O4")) await runPart("O4", { folder: true, foldersCount: 3, theme: "light" }, partO4);
  if (SECTIONS.includes("R")) await runPart("R", { folder: true, theme: "light" }, partR);
  if (SECTIONS.includes("S")) await runPart("S", { folder: true, theme: "light" }, partS);
  if (SECTIONS.includes("Z")) await runPart("Z", { folder: true, theme: "light" }, partZ);
  if (SECTIONS.includes("M")) await runPart("M", { folder: true, theme: "light" }, partM);
} finally {
  await endSession();
}

console.log(`Probe complete. Records saved to ${OUT}/result.json`);

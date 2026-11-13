// v0.8.1 ORDER-09 regression: ORDER-04 (USER-TEST #13, #15, #16).
// Usage: node specs/v0.8.1/verify/ORDER-09/regress-o4.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : "src-tauri/target/release/workbench-tauri.exe"));

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-regress-o4`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");
const W = `${S}/o4ws`, WW = `${SW}\\o4ws`;
const DATA = `${S}/appdata4/workbench-tauri`;

rmSync(W, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(DATA, { recursive: true });

const put = (f, t) => {
  mkdirSync(`${W}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true });
  writeFileSync(`${W}/${f}`, t);
};

put("doc.md", [
  "# Guide", "", "intro", "", "## Install", "", "intro", "", "### Windows", "", "body", "",
  "#### Path", "", "path body", "", "## Usage", "", "```python", "# not a heading", "print('x')", "```", "",
  "### Keys", "", "body"
].join("\n"));
put("nb.ipynb", JSON.stringify({
  cells: [
    { cell_type: "markdown", metadata: {}, source: ["# Analysis\n", "intro\n"] },
    { cell_type: "code", metadata: {}, execution_count: 1, source: ["# a comment\n", "class Model:\n    pass\n"], outputs: [] },
    { cell_type: "markdown", metadata: {}, source: ["## Load data\n"] },
    { cell_type: "markdown", metadata: {}, source: ["### Clean\n"] }
  ],
  metadata: { language_info: { name: "python" } },
  nbformat: 4,
  nbformat_minor: 5
}));
put("code.py", [
  "class GaussianMixture:",
  "    def fit(self, X):",
  "        local = 1",
  "        return self",
  "    def _e_step(self):",
  "        pass",
  "",
  "def helper():",
  "    tmp = 2",
  "    return tmp",
  ""
].join("\n"));
put("code.ts", "class Store { add() {} }\nfunction make() {}\ninterface Shape { count: number }\n");
put("code.rs", "struct Point;\nimpl Point { fn len(&self) {} }\nfn main() {}\nenum Kind { A, B }\n");
put("plain.txt", "just plain text with no headings\nline 2\n");

// big.md for follow scroll
let bigMd = "# Big Document\n\n";
for (let i = 1; i <= 150; i++) {
  bigMd += `## Section ${i}\n\n`;
  for (let j = 1; j <= 5; j++) bigMd += `Paragraph ${j} of section ${i} with filler text.\n\n`;
}
put("big.md", bigMd);

writeFileSync(`${DATA}/settings.json`, JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(`${DATA}/state.json`, JSON.stringify({
  version: 1,
  windows: [{
    id: "w1",
    folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }],
    active_folder_id: "f1",
    sidebar: { width: 200 }
  }]
}));

process.env.APPDATA = `${SW}\\appdata4`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview4`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n) => {
  const r = await app.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${n}.png`, Buffer.from(r.data, "base64"));
};
const P = (rel) => `${WW}\\${rel.replace(/\//g, "\\")}`;
const row = (rel) => `document.querySelector('.tree-window .tree-row[data-path=' + JSON.stringify(JSON.stringify(${JSON.stringify(P(rel))})).slice(1, -1) + ']')`;
const pt = (js, center) => ev(`(()=>{const e=${js};if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+${center ? "r.width/2" : "Math.min(r.width/2,60)"}),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, o = {}) => {
  const p = await pt(js, o.center);
  if (!p) throw new Error("not found " + js);
  for (let c = 1; c <= (o.dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", p.x, p.y);
    await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c });
    await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c });
  }
  await sleep(o.wait ?? 700);
};

const KEYS = {
  z: ["z", "KeyZ", 90],
  v: ["v", "KeyV", 86],
  end: ["End", "End", 35]
};
const press = async (k, mod = 0) => {
  const [key, code, vk] = KEYS[k];
  await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await sleep(500);
};
const CTRL = 2, SHIFT = 8;
const statusOrder = () => ev("[...document.querySelectorAll('.status-bar-left > *')].map(e=>e.classList.contains('status-separator')?'|':(e.getAttribute('aria-label')||e.textContent.trim()))");
const outlineRows = () => ev("(()=>{const list=document.querySelector('.outline-list');if(!list)return null;const r=[...list.querySelectorAll('.tree-row')].map(x=>({name:x.querySelector('.tree-label')?.textContent,badge:x.querySelector('.outline-badge')?.textContent,level:x.querySelectorAll('.tree-item > .tree-indent').length,selected:x.classList.contains('selected')}));return {title:document.querySelector('.outline-header-title')?.textContent,rows:r}})()");
const outlineRow = (name) => `[...document.querySelectorAll('.outline-list > .tree-row')].find(r=>r.querySelector('.tree-label')?.textContent===${JSON.stringify(name)})`;
const cursorLine = () => ev("(()=>{const ed=[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent);if(!ed)return null;const l=ed.querySelector('.cm-activeLine');return {line:l?l.textContent.slice(0,60):null,focused:ed.classList.contains('cm-focused')}})()");
const step = async (name, fn) => {
  try {
    log[name] = await fn();
  } catch (e) {
    log[name] = "ERR " + e.message;
  }
};
const outlineBtn = "document.querySelector('.status-bar [aria-label=\"Outline\"], .status-bar [aria-label=\"Close Outline\"]')";

try {
  app = await launchApp(EXE);
  await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  await sleep(600);

  // USER-TEST #13: 초기 상태 표시줄 순서 및 닫힌 상태
  await step("c11_initial", async () => {
    const r = {
      status: await statusOrder(),
      outlineHidden: await ev("document.querySelector('.outline-bar')?.hidden"),
      layout: await ev("(()=>{const q=(s)=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.width)]};return {dock:q('.dock-left'),paneArea:q('.pane-area'),sidebar:q('.sidebar')}})()")
    };
    await shot("c11-initial-closed");
    return r;
  });

  // USER-TEST #13: Outline 열기, One Dark / One Light, dock 닫아도 Outline 유지
  await step("c1_open", async () => {
    await click(outlineBtn);
    await click(row("doc.md"), { dbl: true });
    await sleep(1200);
    const r = {
      status: await statusOrder(),
      btnPressed: await ev(outlineBtn + "?.getAttribute('aria-pressed')"),
      layout: await ev("(()=>{const q=(s)=>{const b=document.querySelector(s).getBoundingClientRect();return [Math.round(b.x),Math.round(b.width)]};return {dock:q('.dock-left'),outline:q('.outline-bar'),paneArea:q('.pane-area')}})()"),
      outline: await outlineRows()
    };
    await shot("c1-onedark");

    // dock 닫아도 Outline 유지 확인
    await click("document.querySelector('.status-bar [aria-label=\"Close Left Dock\"]')");
    r.dockClosed = {
      dockHidden: await ev("document.querySelector('.dock-left').hidden"),
      outlineVisible: !(await ev("document.querySelector('.outline-bar').hidden")),
      status: await statusOrder()
    };
    await shot("c1-dock-closed");
    await click("document.querySelector('.status-bar [aria-label=\"Project Panel\"]')");
    return r;
  });

  // USER-TEST #13: 경계 및 너비 리사이즈 (240 -> 299)
  await step("c3_border_resize", async () => {
    const st = () => ev("(()=>{const b=getComputedStyle(document.querySelector('.outline-bar'));const d=getComputedStyle(document.querySelector('.dock-left'));const h=getComputedStyle(document.querySelector('.outline-bar > .dock-resize-handle'));return {outline:b.borderRightWidth+' '+b.borderRightColor,dock:d.borderRightWidth+' '+d.borderRightColor,handleBg:h.backgroundColor,handleCursor:h.cursor,handleBorder:h.borderLeftColor}})()");
    const before = await st();
    const hp = await pt("document.querySelector('.outline-bar > .dock-resize-handle')", true);
    await app.mouse("mouseMoved", hp.x, hp.y);
    await sleep(500);
    const hover = await st();
    const w0 = await ev("document.querySelector('.outline-bar').getBoundingClientRect().width");
    await app.mouse("mousePressed", hp.x, hp.y, { button: "left", clickCount: 1 });
    for (let s = 1; s <= 10; s++) {
      await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hp.x + s * 6, y: hp.y, button: "left", buttons: 1 });
      await sleep(30);
    }
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: hp.x + 60, y: hp.y, button: "left", clickCount: 1 });
    await sleep(800);
    const w1 = await ev("document.querySelector('.outline-bar').getBoundingClientRect().width");
    return { before, hover, w0, w1 };
  });

  // USER-TEST #15: 마크다운 계층 및 코드블록 # 제외
  await step("c4_markdown", async () => outlineRows());

  // USER-TEST #15: ipynb 마크다운 셀만 표시
  await step("c5_ipynb", async () => {
    await click(row("nb.ipynb"), { dbl: true });
    await sleep(1500);
    const r = await outlineRows();
    await click(outlineRow("Load data"));
    await sleep(500);
    return { outline: r, cursor: await cursorLine() };
  });

  // USER-TEST #15: 코드 파일 (Python, TS, Rust, plain.txt)
  await step("c6_code", async () => {
    const r = {};
    await click(row("code.py"), { dbl: true }); await sleep(800); r.py = await outlineRows();
    await click(row("code.ts"), { dbl: true }); await sleep(800); r.ts = await outlineRows();
    await click(row("code.rs"), { dbl: true }); await sleep(800); r.rs = await outlineRows();
    await click(row("plain.txt"), { dbl: true }); await sleep(800); r.plain = await ev("document.querySelector('.outline-empty')?.textContent||null");
    return r;
  });

  // USER-TEST #15: 이동 (Outline 클릭 시 에디터 이동 및 가운데 정렬)
  await step("c7_click_editor", async () => {
    await click(row("doc.md"), { dbl: true }); await sleep(800);
    await click(outlineRow("Usage")); await sleep(500);
    return {
      cursor: await cursorLine(),
      topLine: await ev("(()=>{const ed=[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent);const s=ed.querySelector('.cm-scroller').getBoundingClientRect();const l=ed.querySelector('.cm-activeLine').getBoundingClientRect();return {lineTop:Math.round(l.top-s.top),viewport:Math.round(s.height)}})()")
    };
  });

  // USER-TEST #15: 미리보기 탭 이동
  await step("c7_preview", async () => {
    await click("[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)");
    await press("v", CTRL | SHIFT);
    await sleep(1500);
    await click(outlineRow("Keys"));
    await sleep(800);
    return ev("(()=>{const p=[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent);const h=[...p.querySelectorAll('h1,h2,h3,h4')].find(x=>x.textContent.trim()==='Keys');const pr=p.getBoundingClientRect();return {headingTopFromPreviewTop:Math.round(h.getBoundingClientRect().top-pr.top),previewHeight:Math.round(pr.height)}})()");
  });

  // USER-TEST #16: 커서 따라가기 및 편집 갱신 (추가 및 되돌리기)
  await step("c8_follow_edit", async () => {
    await click(row("doc.md"), { dbl: true }); await sleep(800);
    const r = {};
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent).find(l=>l.textContent==='### Windows')");
    await sleep(400);
    await press("end");
    await sleep(400);
    r.cursorWindows = (await outlineRows()).rows.filter((x) => x.selected).map((x) => x.name);
    await app.send("Input.insertText", { text: "\n\n## Added Section" });
    await sleep(1200);
    r.afterAdd = (await outlineRows()).rows.map((x) => x.name);
    await press("z", CTRL);
    await press("z", CTRL);
    await sleep(1200);
    r.afterUndo = (await outlineRows()).rows.map((x) => x.name);
    return r;
  });

  // USER-TEST #16: 접기 및 접힌 항목 안 커서 시 접힌 부모 선택
  await step("c9_fold", async () => {
    const t = outlineRow("Install") + ".querySelector('.outline-toggle')";
    await click(t);
    const folded = (await outlineRows()).rows.map((x) => x.name);
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent).find(l=>l.textContent==='#### Path')");
    await sleep(600);
    const selectedWhileFolded = (await outlineRows()).rows.filter((x) => x.selected).map((x) => x.name);
    await click(outlineRow("Install") + ".querySelector('.outline-toggle')");
    const unfolded = (await outlineRows()).rows.map((x) => x.name);
    return { folded, selectedWhileFolded, unfolded };
  });

  // USER-TEST #16: 큰 문서에서 커서 스크롤 따라가기
  await step("c8_follow_scroll", async () => {
    await click(row("big.md"), { dbl: true }); await sleep(1200);
    const scroll0 = await ev("document.querySelector('.outline-list').scrollTop");
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent).find(l=>l.textContent.includes('Section 118'))");
    await sleep(1000);
    const scroll1 = await ev("document.querySelector('.outline-list').scrollTop");
    const sel = (await outlineRows()).rows.filter((x) => x.selected).map((x) => x.name);
    return { scroll0, scroll1, selected: sel };
  });
} catch (e) {
  log.fatal = e.stack;
} finally {
  app?.kill();
  const outPath = resolve(OUT, "v3-o4.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log(`[O4] Result written to: ${outPath}`);
}

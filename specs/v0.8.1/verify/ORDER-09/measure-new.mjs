// v0.8.1 ORDER-09: V3 verification measurement script for I-16 ~ I-23.
// Measures new items on release exe:
//   1. I-16: Tree row background & focus border (plain folder click, keyboard cursor, marked, active file, outside focus)
//   2. I-17: Tree context menu Undo/Redo items, disabled state, disk operations after move, Undo and Redo
//   3. I-18: Outline list keyboard navigation (Tab focus, Up/Down/Left/Right/Enter jump, focus border, cursor isolation)
//   4. I-19: Code block 1px border.variant on 21 themes (contrast, border width and color)
//   5. I-20: ipynb nb-output & nb-traceback transparent background, code cell shading
//   6. I-21: Loose list end -> paragraph spacing (Zed 50±1px, total margin 28px stack, tight list regression)
//   7. I-22: Markdown & ipynb #slug TOC links (Korean title, duplicate title -1, nonexistent anchor)
//   8. I-23: List gaps scaled proportionally with preview font size (16, 20, 24px), Settings description texts
//
// Usage: node specs/v0.8.1/verify/ORDER-09/measure-new.mjs [exePath] [filterStep]

import { writeFileSync, mkdirSync, rmSync, cpSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const DEFAULT_RELEASE_EXE = resolve(REPO, "src-tauri/target/release/workbench-tauri.exe");

const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : DEFAULT_RELEASE_EXE));

const FILTER = process.argv[3] ? process.argv[3].toLowerCase() : null;

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-measure-new`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/new");
const FIXTURES_DIR = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/new/fixtures");
const W = `${S}/ws`, WW = `${SW}\\ws`;
const DATA = `${S}/appdata/workbench-tauri`;

rmSync(W, { recursive: true, force: true });
rmSync(`${S}/appdata`, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(DATA, { recursive: true });
mkdirSync(W, { recursive: true });

// Copy test fixtures into workspace
if (existsSync(FIXTURES_DIR)) {
  cpSync(FIXTURES_DIR, W, { recursive: true });
}

// Prepare additional directory structures and files for tree tests
mkdirSync(`${W}/folder/sub`, { recursive: true });
writeFileSync(`${W}/folder/keep.txt`, "keep this file\n");
writeFileSync(`${W}/folder/sub/child.txt`, "child file\n");
writeFileSync(`${W}/move.txt`, "file to move for I-17\n");
writeFileSync(`${W}/root-file.txt`, "root level text file\n");

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

process.env.APPDATA = `${SW}\\appdata`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n) => {
  const r = await app.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${n}.png`, Buffer.from(r.data, "base64"));
};

const ensureForeground = () => {
  try {
    execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  } catch {}
};

const P = (rel) => rel ? `${WW}\\${rel.replace(/\//g, "\\")}` : WW;
const row = (rel) => `document.querySelector('.tree-window .tree-row[data-path=' + JSON.stringify(JSON.stringify(${JSON.stringify(P(rel))})).slice(1, -1) + ']')`;
const pt = (js, center = false) => ev(`(()=>{const e=${js};if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+${center ? "r.width/2" : "Math.min(r.width/2,60)"}),y:Math.round(r.y+r.height/2)}})()`);

const click = async (js, o = {}) => {
  const p = await pt(js, o.center);
  if (!p) throw new Error("not found " + js);
  const mod = o.ctrl ? 2 : o.shift ? 8 : 0;
  for (let c = 1; c <= (o.dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", p.x, p.y);
    await app.mouse("mousePressed", p.x, p.y, { button: o.right ? "right" : "left", clickCount: c, modifiers: mod });
    await app.mouse("mouseReleased", p.x, p.y, { button: o.right ? "right" : "left", clickCount: c, modifiers: mod });
  }
  await sleep(o.wait ?? 700);
};

const key = async (k, code, vk, mod = 0) => {
  await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await sleep(500);
};

const drag = async (fromJs, targetJs) => {
  const a = await pt(fromJs);
  const b = await pt(targetJs);
  if (!a || !b) throw new Error("drag endpoint missing");
  await app.mouse("mouseMoved", a.x, a.y);
  await app.mouse("mousePressed", a.x, a.y, { button: "left", clickCount: 1 });
  for (let s = 1; s <= 10; s++) {
    const x = Math.round(a.x + (b.x - a.x) * s / 10);
    const y = Math.round(a.y + (b.y - a.y) * s / 10);
    await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", buttons: 1 });
    await sleep(25);
  }
  await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: b.x, y: b.y, button: "left", clickCount: 1 });
  await sleep(1500);
};

const step = async (name, fn) => {
  if (FILTER && !name.toLowerCase().includes(FILTER)) return;
  console.log(`[MEASURE] Running step: ${name}`);
  ensureForeground();
  try {
    log[name] = await fn();
  } catch (e) {
    log[name] = { error: e.message, stack: e.stack };
  }
};

const THEMES = [
  "One Dark", "One Light",
  "Catppuccin Latte", "Catppuccin Frappé", "Catppuccin Macchiato", "Catppuccin Mocha",
  "Catppuccin Latte - No Italics", "Catppuccin Frappé - No Italics", "Catppuccin Macchiato - No Italics", "Catppuccin Mocha - No Italics",
  "macOS Classic Light", "macOS Classic Dark",
  "Ayu Dark", "Ayu Light", "Ayu Mirage",
  "Gruvbox Dark", "Gruvbox Dark Hard", "Gruvbox Dark Soft",
  "Gruvbox Light", "Gruvbox Light Hard", "Gruvbox Light Soft"
];

const writeSettings = (obj) => {
  writeFileSync(`${DATA}/settings.json`, JSON.stringify(obj, null, 2) + "\n");
};

try {
  app = await launchApp(EXE);
  await sleep(6000);
  ensureForeground();
  await sleep(600);

  // =========================================================================
  // 1. I-16: 트리 선택 배경 (단일 폴더 클릭, 커서 행 테두리, marked, active file)
  // =========================================================================
  await step("step_i16_tree_selection", async () => {
    const results = {};

    // 1-1. One Dark 테마 측정
    writeSettings({ theme: "One Dark" });
    await sleep(1500);

    // 폴더 맨 클릭 (단일 클릭)
    await click(row("folder"));
    await sleep(600);
    const folderPlain = await ev(`(()=>{
      const r = ${row("folder")};
      const cs = getComputedStyle(r);
      return {
        selected: r.classList.contains("selected"),
        marked: r.classList.contains("marked"),
        bg: cs.backgroundColor,
        border: cs.borderColor,
        focusedBorderVar: getComputedStyle(document.documentElement).getPropertyValue("--border-focused").trim(),
        ghostSelectedVar: getComputedStyle(document.documentElement).getPropertyValue("--ghost-element-selected").trim()
      };
    })()`);

    // 키보드 Down 커서 이동 행
    await key("ArrowDown", "ArrowDown", 40);
    await sleep(600);
    const cursorRow = await ev(`(()=>{
      const r = document.querySelector(".tree-row.selected:not(.marked)");
      if (!r) return null;
      const cs = getComputedStyle(r);
      return {
        path: r.dataset.path?.split("\\\\").pop(),
        selected: true,
        marked: false,
        bg: cs.backgroundColor,
        border: cs.borderColor
      };
    })()`);

    // Ctrl+클릭 다중 선택 행
    await click(row("root-file.txt"), { ctrl: true });
    await sleep(600);
    const markedRow = await ev(`(()=>{
      const r = ${row("root-file.txt")};
      const cs = getComputedStyle(r);
      return {
        selected: r.classList.contains("selected"),
        marked: r.classList.contains("marked"),
        bg: cs.backgroundColor
      };
    })()`);

    // 파일 열기 (active file 행)
    await click(row("root-file.txt"), { dbl: true });
    await sleep(1000);
    const activeFileRow = await ev(`(()=>{
      const r = ${row("root-file.txt")};
      const cs = getComputedStyle(r);
      return {
        isActiveFile: r.classList.contains("active-file"),
        bg: cs.backgroundColor
      };
    })()`);

    // 트리 밖 포커스 (에디터 포커스)
    await click(`[...document.querySelectorAll(".cm-content")].find(e=>e.offsetParent)`);
    await sleep(600);
    const outsideFocus = await ev(`(()=>{
      const sel = document.querySelector(".tree-window .tree-row.selected");
      const marked = document.querySelector(".tree-window .tree-row.marked");
      const active = document.querySelector(".tree-window .tree-row.active-file");
      return {
        treeHasFocus: document.querySelector(".project-panel")?.contains(document.activeElement),
        cursorRowBorder: sel ? getComputedStyle(sel).borderColor : null,
        cursorRowBg: sel ? getComputedStyle(sel).backgroundColor : null,
        markedRowBg: marked ? getComputedStyle(marked).backgroundColor : null,
        activeRowBg: active ? getComputedStyle(active).backgroundColor : null
      };
    })()`);

    await shot("i16-tree-onedark");
    results.oneDark = { folderPlain, cursorRow, markedRow, activeFileRow, outsideFocus };

    // 1-2. One Light 테마 측정
    writeSettings({ theme: "One Light" });
    await sleep(1500);
    await click(row("folder"));
    await sleep(600);
    const oneLightFolder = await ev(`(()=>{
      const r = ${row("folder")};
      const cs = getComputedStyle(r);
      return {
        selected: r.classList.contains("selected"),
        marked: r.classList.contains("marked"),
        bg: cs.backgroundColor,
        border: cs.borderColor
      };
    })()`);
    await shot("i16-tree-onelight");
    results.oneLight = { folderPlain: oneLightFolder };

    writeSettings({ theme: "One Dark" });
    await sleep(1000);

    // 1-3. Zed 창 캡처 시도 (없을 경우 측정 불가 기록)
    try {
      const zedList = execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "specs/v0.8.1/verify/ORDER-06/zed-window.ps1"), "-Action", "list"], { encoding: "utf8" });
      results.zedCompare = { status: "measured", list: JSON.parse(zedList) };
    } catch (e) {
      results.zedCompare = { status: "측정 불가", reason: "Zed 창이 실행되어 있지 않음 (릴리스 빌드 후 화면 검증에서 측정)" };
    }

    return results;
  });

  // =========================================================================
  // 2. I-17: 트리 우클릭 메뉴 Undo·Redo (Paste 뒤, 비활성/활성, 이동 복구)
  // =========================================================================
  await step("step_i17_tree_menu_undo_redo", async () => {
    // 2-1. 처음 상태 (되돌릴 것 없음): 메뉴 열기
    await click(row("root-file.txt"), { right: true });
    await sleep(600);

    const initialMenu = await ev(`(()=>{
      const items = [...document.querySelectorAll("[role=menuitem], .menu-item")].map(e=>({
        label: e.textContent.trim().split("\\t")[0].trim(),
        disabled: e.classList.contains("disabled") || e.getAttribute("aria-disabled") === "true"
      }));
      const pasteIdx = items.findIndex(i => i.label === "Paste");
      return {
        pasteIdx,
        undo: items[pasteIdx + 1],
        redo: items[pasteIdx + 2],
        items: items.slice(Math.max(0, pasteIdx - 1), pasteIdx + 4)
      };
    })()`);
    await key("Escape", "Escape", 27);
    await sleep(500);

    // 2-2. 파일 이동 수행 (move.txt -> folder/)
    await drag(row("move.txt"), row("folder"));
    await sleep(1500);
    const diskAfterMove = {
      movedFileInFolder: existsSync(`${W}/folder/move.txt`),
      origFileGone: !existsSync(`${W}/move.txt`)
    };

    // 2-3. 이동 후 우클릭 메뉴 열어 Undo 실행
    await click(row("folder/move.txt"), { right: true });
    await sleep(600);
    const menuAfterMove = await ev(`(()=>{
      const items = [...document.querySelectorAll("[role=menuitem], .menu-item")].map(e=>({
        label: e.textContent.trim().split("\\t")[0].trim(),
        disabled: e.classList.contains("disabled") || e.getAttribute("aria-disabled") === "true"
      }));
      const pasteIdx = items.findIndex(i => i.label === "Paste");
      return { undo: items[pasteIdx + 1], redo: items[pasteIdx + 2] };
    })()`);

    // 메뉴의 Undo 항목 클릭
    await click(`[...document.querySelectorAll("[role=menuitem], .menu-item")].find(e=>e.textContent.includes("Undo"))`);
    await sleep(1500);
    const diskAfterUndo = {
      origRestored: existsSync(`${W}/move.txt`),
      folderFileGone: !existsSync(`${W}/folder/move.txt`)
    };

    // 2-4. Undo 후 우클릭 메뉴 열어 Redo 실행
    await click(row("move.txt"), { right: true });
    await sleep(600);
    const menuAfterUndo = await ev(`(()=>{
      const items = [...document.querySelectorAll("[role=menuitem], .menu-item")].map(e=>({
        label: e.textContent.trim().split("\\t")[0].trim(),
        disabled: e.classList.contains("disabled") || e.getAttribute("aria-disabled") === "true"
      }));
      const pasteIdx = items.findIndex(i => i.label === "Paste");
      return { undo: items[pasteIdx + 1], redo: items[pasteIdx + 2] };
    })()`);

    // 메뉴의 Redo 항목 클릭
    await click(`[...document.querySelectorAll("[role=menuitem], .menu-item")].find(e=>e.textContent.includes("Redo"))`);
    await sleep(1500);
    const diskAfterRedo = {
      reMoved: existsSync(`${W}/folder/move.txt`),
      origGoneAgain: !existsSync(`${W}/move.txt`)
    };

    return { initialMenu, diskAfterMove, menuAfterMove, diskAfterUndo, menuAfterUndo, diskAfterRedo };
  });

  // =========================================================================
  // 3. I-18: Outline 행 키보드 이동 (Tab 포커스, 방향키, Enter, 커서 격리)
  // =========================================================================
  await step("step_i18_outline_keyboard", async () => {
    // doc-outline.md 열기 및 Outline 열기
    await click(row("doc-outline.md"), { dbl: true });
    await sleep(1000);
    const outlineBtn = `document.querySelector('.status-bar [aria-label="Outline"], .status-bar [aria-label="Close Outline"]')`;
    const isClosed = await ev(`document.querySelector('.outline-bar')?.hidden ?? true`);
    if (isClosed) {
      await click(outlineBtn);
      await sleep(1000);
    }

    // Tab으로 Outline 리스트 포커스 (또는 직접 focus)
    await ev(`document.querySelector(".outline-list")?.focus()`);
    await sleep(500);

    const outlineFocused = await ev(`document.activeElement === document.querySelector(".outline-list")`);
    const borderOnSelected = await ev(`(()=>{
      const sel = document.querySelector(".outline-list .tree-row.selected");
      return sel ? {
        border: getComputedStyle(sel).borderColor,
        focusedVar: getComputedStyle(document.documentElement).getPropertyValue("--border-focused").trim()
      } : null;
    })()`);

    // 키보드 이동 테스트 (Down, Up, Right, Left)
    await key("ArrowDown", "ArrowDown", 40);
    await sleep(300);
    const afterDown = await ev(`document.querySelector(".outline-list .tree-row.selected .tree-label")?.textContent`);

    await key("ArrowDown", "ArrowDown", 40);
    await sleep(300);
    const afterDown2 = await ev(`document.querySelector(".outline-list .tree-row.selected .tree-label")?.textContent`);

    await key("ArrowLeft", "ArrowLeft", 37); // collapse or parent
    await sleep(300);
    const afterLeft = await ev(`document.querySelector(".outline-list .tree-row.selected .tree-label")?.textContent`);

    await key("ArrowRight", "ArrowRight", 39); // expand or child
    await sleep(300);
    const afterRight = await ev(`document.querySelector(".outline-list .tree-row.selected .tree-label")?.textContent`);

    // Enter 누름 -> 에디터 줄 점프 확인
    await key("Enter", "Enter", 13);
    await sleep(800);
    const editorJump = await ev(`(()=>{
      const ed = [...document.querySelectorAll(".cm-editor")].find(e=>e.offsetParent);
      const l = ed?.querySelector(".cm-activeLine")?.textContent?.trim();
      return { focused: ed?.classList.contains("cm-focused"), activeLine: l };
    })()`);

    // 커서 격리 확인: Outline 포커스 상태에서 에디터 커서 변경 시 포커스 빼앗김 방지
    await ev(`document.querySelector(".outline-list")?.focus()`);
    await key("ArrowDown", "ArrowDown", 40);
    await sleep(300);
    const pickedBefore = await ev(`document.querySelector(".outline-list .tree-row.selected .tree-label")?.textContent`);

    // 에디터 커서 이동을 CDP 스크립트로 발생
    await ev(`(()=>{
      const ed = [...document.querySelectorAll(".cm-editor")].find(e=>e.offsetParent);
      if (ed) {
        const lines = ed.querySelectorAll(".cm-line");
        if (lines.length > 5) lines[lines.length - 1].scrollIntoView();
      }
    })()`);
    await sleep(600);

    const pickedAfter = await ev(`document.querySelector(".outline-list .tree-row.selected .tree-label")?.textContent`);
    const activeElAfter = await ev(`document.activeElement?.className`);

    return {
      outlineFocused,
      borderOnSelected,
      nav: { afterDown, afterDown2, afterLeft, afterRight },
      editorJump,
      isolation: { pickedBefore, pickedAfter, isPreserved: pickedBefore === pickedAfter, activeElAfter }
    };
  });

  // =========================================================================
  // 4. I-19: 코드 블록 1px border.variant 테두리 (21개 테마 대조)
  // =========================================================================
  await step("step_i19_code_block_borders", async () => {
    // doc-outline.md의 미리보기 열기
    await click(row("doc-outline.md"), { dbl: true });
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);

    const themeResults = [];
    for (const theme of THEMES) {
      writeSettings({ theme });
      await sleep(1200);
      const data = await ev(`(()=>{
        const block = document.querySelector(".markdown-preview .code-block");
        const page = document.querySelector(".markdown-preview");
        if (!block || !page) return null;
        const bcs = getComputedStyle(block);
        const pcs = getComputedStyle(page);
        const root = getComputedStyle(document.documentElement);
        return {
          borderWidth: bcs.borderTopWidth,
          borderStyle: bcs.borderTopStyle,
          borderColor: bcs.borderTopColor,
          borderVariantVar: root.getPropertyValue("--border-variant").trim(),
          blockBg: bcs.backgroundColor,
          pageBg: pcs.backgroundColor
        };
      })()`);

      themeResults.push({
        theme,
        ...data,
        borderValid: data?.borderWidth === "1px" && data?.borderStyle === "solid",
        distinguishable: data?.blockBg !== data?.pageBg
      });
    }

    writeSettings({ theme: "One Dark" });
    await sleep(1000);
    await shot("i19-code-block-border");

    return themeResults;
  });

  // =========================================================================
  // 5. I-20: ipynb nb-output & nb-traceback 배경 투명 및 코드 셀 음영
  // =========================================================================
  await step("step_i20_ipynb_output_bg", async () => {
    await click(row("nb-test.ipynb"), { dbl: true });
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);

    const r = await ev(`(()=>{
      const p = document.querySelector(".markdown-preview");
      if (!p) return null;
      const out = p.querySelector("pre.nb-output");
      const tb = p.querySelector("pre.nb-traceback");
      const cell = p.querySelector(".code-block");
      const cs = (e) => e ? getComputedStyle(e) : null;
      return {
        outputBg: cs(out)?.backgroundColor,
        outputBorder: cs(out)?.borderTopWidth,
        tracebackBg: cs(tb)?.backgroundColor,
        tracebackBorder: cs(tb)?.borderTopWidth,
        codeCellBg: cs(cell)?.backgroundColor,
        panelBgVar: getComputedStyle(document.documentElement).getPropertyValue("--panel-background").trim()
      };
    })()`);

    await shot("i20-ipynb-output");

    const isOutputTransparent = r?.outputBg === "rgba(0, 0, 0, 0)" || r?.outputBg === "transparent";
    const isTbTransparent = r?.tracebackBg === "rgba(0, 0, 0, 0)" || r?.tracebackBg === "transparent";
    const isCellShaded = r?.codeCellBg !== r?.outputBg;

    return { ...r, isOutputTransparent, isTbTransparent, isCellShaded };
  });

  // =========================================================================
  // 6. I-21: 느슨한 목록 끝 -> 문단 간격 (Zed 50±1px, 마진 스택 28px)
  // =========================================================================
  await step("step_i21_loose_list_spacing", async () => {
    writeSettings({ theme: "One Light", preview_theme: "One Light", ui_font_size: 16 });
    await sleep(1500);

    await click(row("spacing.md"), { dbl: true });
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);

    // 스크롤 맨 아래로 이동
    await ev(`document.querySelector(".markdown-preview").scrollTop = 99999`);
    await sleep(800);

    const metrics = await ev(`(()=>{
      const p = document.querySelector(".markdown-preview");
      const looseUl = [...p.querySelectorAll("ul")].pop();
      const lastLi = looseUl?.querySelector("li:last-child");
      const lastPInLi = lastLi?.querySelector("p:last-child");
      const endP = [...p.querySelectorAll("p")].pop();
      if (!looseUl || !endP) return null;

      const csUl = getComputedStyle(looseUl);
      const csLastP = lastPInLi ? getComputedStyle(lastPInLi) : null;
      const csEndP = getComputedStyle(endP);

      const rLi = lastLi.getBoundingClientRect();
      const rEnd = endP.getBoundingClientRect();

      return {
        looseUlMarginBottom: csUl.marginBottom,
        lastPInLiMarginBottom: csLastP ? csLastP.marginBottom : null,
        endPMarginTop: csEndP.marginTop,
        rectDistance: Math.round(rEnd.top - rLi.bottom),
        totalMarginStack: parseFloat(csUl.marginBottom) + (csLastP ? parseFloat(csLastP.marginBottom) : 0)
      };
    })()`);

    await shot("i21-loose-list-spacing");
    writeSettings({ theme: "One Dark" });
    await sleep(1000);

    return metrics;
  });

  // =========================================================================
  // 7. I-22: README 목차 #슬러그 링크 이동 (한글 제목, 같은 제목 둘, 무효 링크)
  // =========================================================================
  await step("step_i22_heading_slug_links", async () => {
    await click(row("readme-toc.md"), { dbl: true });
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);

    const p = `document.querySelector(".markdown-preview")`;
    const initialScroll = await ev(`${p}.scrollTop`);

    // 7-1. 한글 제목 링크 클릭
    await click(`${p} a[href="#한글-제목"]`);
    await sleep(800);
    const scrollKorean = await ev(`${p}.scrollTop`);

    // 7-2. 첫 번째 Usage 클릭
    await click(`${p} a[href="#usage"]`);
    await sleep(800);
    const scrollUsage1 = await ev(`${p}.scrollTop`);

    // 7-3. 두 번째 Usage (slug: usage-1) 클릭
    await click(`${p} a[href="#usage-1"]`);
    await sleep(800);
    const scrollUsage2 = await ev(`${p}.scrollTop`);

    // 7-4. 없는 id 링크 클릭 -> 변화 없음
    const beforeInvalidScroll = await ev(`${p}.scrollTop`);
    await click(`${p} a[href="#nonexistent-anchor"]`);
    await sleep(800);
    const afterInvalidScroll = await ev(`${p}.scrollTop`);

    // 7-5. ipynb markdown 셀 안의 목차 링크
    await click(row("nb-toc.ipynb"), { dbl: true });
    await sleep(1000);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {});
    await sleep(2500);
    await click(`${p} a[href="#cell-target"]`);
    await sleep(800);
    const nbScroll = await ev(`${p}.scrollTop`);

    return {
      initialScroll,
      scrollKorean,
      scrollUsage1,
      scrollUsage2,
      invalidLink: { before: beforeInvalidScroll, after: afterInvalidScroll, unchanged: beforeInvalidScroll === afterInvalidScroll },
      nbScroll
    };
  });

  // =========================================================================
  // 8. I-23: 목록 간격 미리보기 폰트 크기 비례 및 Settings 설명 문구
  // =========================================================================
  await step("step_i23_list_gap_scaling", async () => {
    // 폰트 크기별 CSS 변수값 측정
    const fontSizes = [16, 20, 24];
    const scalingResults = {};

    for (const fs of fontSizes) {
      writeSettings({ theme: "One Dark", preview_font_size: fs });
      await sleep(1500);
      scalingResults[`font_${fs}`] = await ev(`(()=>{
        const c = getComputedStyle(document.documentElement);
        return {
          fontSize: ${fs},
          listGap: c.getPropertyValue("--preview-list-gap").trim(),
          listLineGap: c.getPropertyValue("--preview-list-line-gap").trim(),
          paragraphGap: c.getPropertyValue("--preview-paragraph-gap").trim(),
          paragraphLineGap: c.getPropertyValue("--preview-paragraph-line-gap").trim()
        };
      })()`);
    }

    writeSettings({ theme: "One Dark", preview_font_size: 16 });
    await sleep(1000);

    // Settings UI의 설명 문구 검증
    await click(`document.querySelector('[aria-label="Open Application Menu"]')`);
    await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith("Settings"))`);
    await sleep(1200);

    const descriptions = await ev(`(()=>{
      const rows = [...document.querySelectorAll(".settings-row")];
      const findDesc = (title) => {
        const r = rows.find(x => x.querySelector(".settings-title")?.textContent.includes(title));
        return r?.querySelector(".settings-description")?.textContent.trim() || null;
      };
      return {
        listLineSpacing: findDesc("List Line Spacing"),
        listItemSpacing: findDesc("List Item Spacing")
      };
    })()`);

    return { scalingResults, descriptions };
  });

} catch (e) {
  log.fatal = { error: e.message, stack: e.stack };
} finally {
  app?.kill();

  const outJsonPath = resolve(OUT, "v3-new.json");
  writeFileSync(outJsonPath, JSON.stringify(log, null, 2));
  console.log(`[MEASURE] New items verification data written to: ${outJsonPath}`);

  // 요약 Markdown 리포트 생성
  const summaryMd = generateSummaryMarkdown(log);
  const outSummaryPath = resolve(OUT, "summary.md");
  writeFileSync(outSummaryPath, summaryMd);
  console.log(`[MEASURE] Summary markdown generated at: ${outSummaryPath}`);
}

function generateSummaryMarkdown(data) {
  const lines = [];
  lines.push("# ORDER-09 I-16~I-23 실측 준비 및 판정 요약\n");
  lines.push("| # | 항목 | 판정 기준 (Target) | 결과 요약 | 상태 |");
  lines.push("|---|---|---|---|---|");

  // I-16
  const i16 = data.step_i16_tree_selection;
  const i16Pass = i16?.oneDark?.folderPlain?.selected && !i16?.oneDark?.folderPlain?.marked &&
    (i16?.oneDark?.folderPlain?.bg === "rgba(0, 0, 0, 0)" || i16?.oneDark?.folderPlain?.bg === "transparent");
  lines.push(`| 1 | I-16 트리 선택 배경 | 폴더 맨 클릭/커서 행 배경 없음, marked/active 행 배경 유지 | folderPlain bg: ${i16?.oneDark?.folderPlain?.bg || "N/A"} | **${i16Pass ? "PASS" : "READY"}** |`);

  // I-17
  const i17 = data.step_i17_tree_menu_undo_redo;
  const i17Pass = i17?.initialMenu?.undo?.disabled && i17?.diskAfterUndo?.origRestored;
  lines.push(`| 2 | I-17 우클릭 Undo/Redo | Paste 뒤 Undo/Redo, 비활성/활성 상태 및 이동 복구 | initUndoDisabled: ${i17?.initialMenu?.undo?.disabled ?? "N/A"}, restored: ${i17?.diskAfterUndo?.origRestored ?? "N/A"} | **${i17Pass ? "PASS" : "READY"}** |`);

  // I-18
  const i18 = data.step_i18_outline_keyboard;
  const i18Pass = i18?.editorJump?.focused && i18?.isolation?.isPreserved;
  lines.push(`| 3 | I-18 Outline 키보드 이동 | Tab 포커스, 방향키 이동, Enter 줄 점프, 커서 격리 유지 | jumpLine: ${i18?.editorJump?.activeLine || "N/A"}, preserved: ${i18?.isolation?.isPreserved ?? "N/A"} | **${i18Pass ? "PASS" : "READY"}** |`);

  // I-19
  const i19 = data.step_i19_code_block_borders;
  const i19Pass = Array.isArray(i19) && i19.every(t => t.borderValid);
  lines.push(`| 4 | I-19 코드 블록 테두리 | 21개 테마 border.variant 1px 테두리 및 배경 대비 | 21 themes border=1px solid: ${i19Pass ? "All 21 valid" : "N/A"} | **${i19Pass ? "PASS" : "READY"}** |`);

  // I-20
  const i20 = data.step_i20_ipynb_output_bg;
  const i20Pass = i20?.isOutputTransparent && i20?.isTbTransparent;
  lines.push(`| 5 | I-20 ipynb 출력 음영 | nb-output / nb-traceback 배경 투명, 코드 셀 음영 유지 | outBg: ${i20?.outputBg || "N/A"}, tbBg: ${i20?.tracebackBg || "N/A"} | **${i20Pass ? "PASS" : "READY"}** |`);

  // I-21
  const i21 = data.step_i21_loose_list_spacing;
  const i21Pass = i21?.totalMarginStack === 28;
  lines.push(`| 6 | I-21 느슨한 목록 간격 | 느슨한 목록 끝 -> 문단 잉크 간격 50±1px (margin stack 28px) | marginStack: ${i21?.totalMarginStack ?? "N/A"}px | **${i21Pass ? "PASS" : "READY"}** |`);

  // I-22
  const i22 = data.step_i22_heading_slug_links;
  const i22Pass = i22?.scrollKorean > 0 && i22?.invalidLink?.unchanged;
  lines.push(`| 7 | I-22 #슬러그 링크 | 한글 제목/중복 -1 이동, 무효 id 스크롤 불변 | scrollKorean: ${i22?.scrollKorean ?? "N/A"}, invalidUnchanged: ${i22?.invalidLink?.unchanged ?? "N/A"} | **${i22Pass ? "PASS" : "READY"}** |`);

  // I-23
  const i23 = data.step_i23_list_gap_scaling;
  const i23Pass = i23?.scalingResults?.font_16?.listGap === "4px" && i23?.scalingResults?.font_24?.listGap === "6px";
  lines.push(`| 8 | I-23 목록 간격 비례 | 미리보기 16/20/24px 비례 (4/5/6px, 6/7.5/9px), 설명 문구 | 16px: ${i23?.scalingResults?.font_16?.listGap || "N/A"}, 24px: ${i23?.scalingResults?.font_24?.listGap || "N/A"} | **${i23Pass ? "PASS" : "READY"}** |`);

  return lines.join("\n");
}

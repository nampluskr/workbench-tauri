// v0.8.1 ORDER-09 regression: ORDER-03 (USER-TEST #7 drop, #10, #11, I-13).
// Usage: node specs/v0.8.1/verify/ORDER-09/regress-o3.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : "src-tauri/target/release/workbench-tauri.exe"));

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-regress-o3`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");
const W = `${S}/o3ws`, WW = `${SW}\\o3ws`;
const DATA = `${S}/appdata3/workbench-tauri`;

rmSync(W, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(DATA, { recursive: true });

const put = (f, t) => {
  mkdirSync(`${W}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true });
  writeFileSync(`${W}/${f}`, t);
};

for (let i = 1; i <= 6; i++) {
  let md = `# Note ${i}\n\n`;
  for (let j = 1; j <= 8; j++) md += `## Section ${j}\n\nbody ${j}\n\n`;
  put(`md/m${i}.md`, md);
}
put("md/data.csv", "a,b\n1,2\n3,4\n");
put("md/nb.ipynb", JSON.stringify({
  cells: [{ cell_type: "markdown", metadata: {}, source: ["# nb"] }],
  metadata: {},
  nbformat: 4,
  nbformat_minor: 5
}));
for (let i = 1; i <= 16; i++) {
  put(`txt/long-file-name-${String(i).padStart(2, "0")}.txt`, `alpha beta gamma ${i}\nneedle${i % 3}\n`);
}

const state = (lock) => JSON.stringify({
  version: 1,
  windows: [{
    id: "w1",
    folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }],
    active_folder_id: "f1",
    sidebar: { width: 200 },
    lock_preview: lock
  }]
});

writeFileSync(`${DATA}/settings.json`, JSON.stringify({ theme: "One Dark" }) + "\n");
process.env.APPDATA = `${SW}\\appdata3`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview3`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (name) => {
  const r = await app.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
};
const P = (rel) => `${WW}\\${rel.replace(/\//g, "\\")}`;
const sel = (s) => JSON.stringify(s);
const row = (rel) => `([...document.querySelectorAll('.tree-window .tree-row')].find(e => (e.dataset.path || e.getAttribute('data-path')) === ${JSON.stringify(P(rel))}) || document.querySelector('.tree-window .tree-row[data-path=${JSON.stringify(JSON.stringify(P(rel))).slice(1, -1)}]'))`;
const pt = (js) => ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, o = {}) => {
  const p = await pt(js);
  if (!p) throw new Error("not found " + js);
  const button = o.right ? "right" : o.middle ? "middle" : "left";
  for (let c = 1; c <= (o.dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", p.x, p.y);
    await app.mouse("mousePressed", p.x, p.y, { button, clickCount: c });
    await app.mouse("mouseReleased", p.x, p.y, { button, clickCount: c });
  }
  await sleep(700);
};

const KEYS = {
  f: ["F", "KeyF", 70],
  v: ["V", "KeyV", 86],
  vl: ["v", "KeyV", 86],
  k: ["k", "KeyK", 75],
  enter: ["Enter", "Enter", 13],
  esc: ["Escape", "Escape", 27]
};
const press = async (k, mod = 0) => {
  const [key, code, vk] = KEYS[k];
  await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers: mod });
  if (k === "enter") await app.send("Input.dispatchKeyEvent", { type: "char", text: "\r", key, code, windowsVirtualKeyCode: vk });
  await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await sleep(700);
};
const CTRL = 2, SHIFT = 8;
const tabs = () => ev(`[...document.querySelectorAll('.pane')].map(p=>[...p.querySelectorAll('.tab')].map(t=>({title:t.querySelector('.tab-title')?.textContent.trim(),active:t.classList.contains('active'),preview:t.classList.contains('preview'),italic:getComputedStyle(t.querySelector('.tab-title')).fontStyle})))`);
const tabByTitle = (title, nth = 0) => `(()=>{const t=[...document.querySelectorAll('.pane .tab')].filter(t=>t.querySelector('.tab-title')?.textContent.trim()===${sel(title)})[${nth}];t?.scrollIntoView({inline:'nearest'});return t})()`;
const step = async (name, fn) => {
  try {
    log[name] = await fn();
  } catch (e) {
    log[name] = "ERR " + e.message;
  }
};
const appMenu = async (label) => {
  await click(`document.querySelector('[aria-label="Open Application Menu"]')`);
  await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith(${sel(label)}))`);
  await sleep(800);
};
const searchInput = `document.querySelector('.pane .tab.active') && [...document.querySelectorAll('.project-search')].find(e=>e.offsetParent)?.querySelector('input[aria-label="Search"]')`;
const visibleSearch = () => ev(`(()=>{const s=[...document.querySelectorAll('.project-search')].find(e=>e.offsetParent);if(!s)return null;const i=s.querySelector('input[aria-label="Search"]');return {value:i.value,focused:document.activeElement===i,count:s.querySelector('.project-search-count')?.textContent.trim()||null}})()`);
const clipCheck = () => ev(`(()=>{const p=document.querySelector('.pane');const edge=p.querySelector('.tab-bar-edge.end');const a=p.querySelector('.tab.active');const x=a?.querySelector('button[aria-label="Close Tab"]');const list=p.querySelector('.tab-list');return {active:a?.querySelector('.tab-title')?.textContent.trim(),closeRight:x?Math.round(x.getBoundingClientRect().right*10)/10:null,tabRight:a?Math.round(a.getBoundingClientRect().right*10)/10:null,edgeLeft:edge?Math.round(edge.getBoundingClientRect().left*10)/10:null,listRight:Math.round(list.getBoundingClientRect().right*10)/10,scrollLeft:Math.round(list.scrollLeft),scrollMax:list.scrollWidth-list.clientWidth,innerWidth}})()`);

const clickLastWithTreeFocus = async (shotName) => {
  await click(`document.querySelector('.pane .tab')`);
  await click(row("txt"));
  await click(row("txt"));
  await ev(`(()=>{const l=document.querySelector('.pane .tab-list');l.scrollLeft=l.scrollWidth})()`);
  await sleep(300);
  const before = await ev(`({focusInTree:!!document.activeElement?.closest('.project-panel'),edgeShown:!!document.querySelector('.pane .tab-bar-edge.end')})`);
  await click(`[...document.querySelector('.pane').querySelectorAll('.tab')].at(-1)`);
  await sleep(600);
  const r = { before, after: await clipCheck() };
  await shot(shotName);
  return r;
};

try {
  writeFileSync(`${DATA}/state.json`, state(true));
  app = await launchApp(EXE);
  await sleep(5000);
  execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  await sleep(600);

  log.window = await ev(`({w:outerWidth,h:outerHeight,dpr:devicePixelRatio})`);
  await click(row("md"));
  await click(row("txt"));

  // USER-TEST #10: Lock Preview 켬, m1/m2/m3 한 번씩 클릭 → 미리보기 탭 1개 교체 (이탤릭)
  await step("c1_temp_preview", async () => {
    const r = { lockPressed: await ev(`document.querySelector('.status-bar [aria-label="Lock Preview"]')?.getAttribute('aria-pressed')`) };
    for (const f of ["m1", "m2", "m3"]) {
      await click(row(`md/${f}.md`));
      r[f] = await tabs();
    }
    await shot("c1-three-clicks");
    return r;
  });

  // USER-TEST #10: 고정 (탭 제목 더블클릭, 가운데 클릭)
  await step("c2_keep", async () => {
    const r = {};
    await click(row("md/m3.md"));
    r.afterSecondClick = await tabs();
    await click(row("md/m4.md"));
    r.afterM4 = await tabs();
    await click(tabByTitle("Preview m4.md"), { dbl: true });
    r.afterTitleDblClick = await tabs();
    await click(row("md/m5.md"));
    r.afterM5 = await tabs();
    await click(row("md/m5.md"), { middle: true });
    r.afterM5Middle = await tabs();
    await shot("c2-kept");
    return r;
  });

  // USER-TEST #10: 다른 종류 (csv, ipynb)도 임시 미리보기 탭
  await step("c3_other_kinds", async () => {
    const r = {};
    await click(row("md/data.csv"));
    r.csv = await tabs();
    await click(row("md/nb.ipynb"));
    r.ipynb = await tabs();
    await shot("c3-csv-ipynb");
    return r;
  });

  // USER-TEST #10: Lock 끔, 명령(눈 버튼, 단축키, 메뉴)으로 열면 고정
  await step("c3_lock_off_and_commands", async () => {
    const r = {};
    await click(`document.querySelector('.status-bar [aria-label="Lock Preview"]')`);
    r.lockPressed = await ev(`document.querySelector('.status-bar [aria-label="Lock Preview"]')?.getAttribute('aria-pressed')`);
    await click(row("md/m6.md"));
    r.lockOffClick = await tabs();
    await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await press("v", CTRL | SHIFT);
    r.ctrlShiftV = await tabs();
    await click(tabByTitle("m6.md"));
    await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await press("k", CTRL);
    await press("vl");
    r.ctrlKV = await tabs();
    await click(tabByTitle("m6.md"));
    await click(`[...document.querySelectorAll('.pane .tab.active ~ * button[aria-label="Open Preview"], .pane button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`).catch((e) => (r.eyeErr = e.message));
    r.eyeButton = await tabs();
    await click(tabByTitle("m6.md"));
    await appMenu("View");
    await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith("Open Preview")&&!e.textContent.includes("Side"))`).catch((e) => (r.menuErr = e.message));
    r.viewMenu = await tabs();
    await shot("c3-commands");
    return r;
  });

  // USER-TEST #11: Search 버튼 및 Ctrl+Shift+F로 여러 Search 탭, 검색어 및 결과 유지
  await step("c4_c5_search", async () => {
    const r = { runs: [] };
    const queries = ["m1", "long-file-name-1", "data"];
    for (let i = 0; i < 3; i++) {
      if (i === 1) await press("f", CTRL | SHIFT);
      else await click(`document.querySelector('.status-bar [aria-label="Search"]')`);
      await sleep(500);
      const opened = {
        tabs: (await tabs()).flat().filter((t) => !t.title.startsWith("Preview") && !t.title.endsWith(".md")).map((t) => t.title),
        input: await visibleSearch()
      };
      await ev(`(()=>{const i=${searchInput};const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,${sel(queries[i])});i.dispatchEvent(new Event('input',{bubbles:true}))})()`);
      await press("enter");
      await sleep(1500);
      r.runs.push({ opened, after: await visibleSearch(), titles: (await tabs()).flat().map((t) => t.title) });
    }
    await shot("c4-three-searches");
    r.revisit = [];
    for (const q of queries) {
      await click(tabByTitle(q));
      await sleep(500);
      r.revisit.push({ q, view: await visibleSearch() });
    }
    const ext = async () => {
      await click(`document.querySelector('[aria-label="User menu"]')`);
      await click(`[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith("Extensions"))`);
      await sleep(800);
    };
    await ext();
    await ext();
    r.extensionsTabs = (await tabs()).flat().filter((t) => t.title === "Extensions").length;
    await shot("c5-titles");
    return r;
  });

  // USER-TEST #7 (drop on tab): 트리 파일 탭 바에 놓기
  await step("c8_drop", async () => {
    const dropOnTab = async (srcRel, targetTitle) => {
      const srcPt = await pt(row(srcRel));
      const targetPt = await pt(tabByTitle(targetTitle));
      await app.mouse("mouseMoved", srcPt.x, srcPt.y);
      await app.mouse("mousePressed", srcPt.x, srcPt.y, { button: "left", clickCount: 1 });
      for (let s = 1; s <= 10; s++) {
        const x = Math.round(srcPt.x + (targetPt.x - srcPt.x) * s / 10);
        const y = Math.round(srcPt.y + (targetPt.y - srcPt.y) * s / 10);
        await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", buttons: 1 });
        await sleep(25);
      }
      await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: targetPt.x, y: targetPt.y, button: "left", clickCount: 1 });
      await sleep(1500);
    };
    await dropOnTab("md/m2.md", "m6.md");
    const lockOffTabs = await tabs();
    await click(`document.querySelector('.status-bar [aria-label="Lock Preview"]')`);
    await dropOnTab("md/m3.md", "m2.md");
    const lockOnTabs = await tabs();
    return { lockOff: lockOffTabs, lockOn: lockOnTabs };
  });

  // ORDER-07 #11 (I-13 regression): 넘친 탭 줄의 마지막 탭 활성 시 닫기 x 버튼 영역 안 가림
  await step("c7_last_tab", async () => {
    for (let i = 1; i <= 10; i++) {
      await click(row(`txt/long-file-name-${String(i).padStart(2, "0")}.txt`), { dbl: true });
      await sleep(400);
    }
    return await clickLastWithTreeFocus("c7-last-tab");
  });
} catch (e) {
  log.fatal = e.stack;
} finally {
  app?.kill();
  const outPath = resolve(OUT, "v3-o3.json");
  writeFileSync(outPath, JSON.stringify(log, null, 2));
  console.log(`[O3] Result written to: ${outPath}`);
}

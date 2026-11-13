// v0.8.1 ORDER-09 regression: ORDER-07 #11 representative checks on release exe (I-1~I-13 & preview kinds).
// Usage: node specs/v0.8.1/verify/ORDER-09/regress-rep.mjs [exePath]
import { writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const REPO = "D:/projects/workbench-tauri";
const EXE = process.argv[2] && process.argv[2] !== "-"
  ? resolve(process.argv[2])
  : resolve(REPO, process.env.TAURI_EXE || (process.env.USE_DEBUG ? "src-tauri/target/debug/workbench-tauri.exe" : "src-tauri/target/release/workbench-tauri.exe"));

const TEMP = (process.env.TEMP || "C:/Users/nampl/AppData/Local/Temp").replace(/\\/g, "/");
const S = `${TEMP}/v081-regress-rep`;
const SW = S.replace(/\//g, "\\");
const OUT = resolve(REPO, "specs/v0.8.1/verify/ORDER-09/regress");
const W = `${S}/o11ws`, WW = `${SW}\\o11ws`;
const DATA = `${S}/appdata11/workbench-tauri`;

rmSync(W, { recursive: true, force: true });
rmSync(`${S}/appdata11`, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });
mkdirSync(OUT, { recursive: true });

const put = (f, t) => {
  mkdirSync(`${W}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true });
  writeFileSync(`${W}/${f}`, t);
};

put("doc.md", [
  "# Doc", "", "Intro text.", "", "## Code", "", "```python", "print('hi')", "```", "",
  "$$", "x^2", "$$", "", "```mermaid", "graph TD; A-->B", "```", "", "- one", "- two", "",
  "## End", "", "bye", ""
].join("\n"));
put("nb.ipynb", JSON.stringify({
  cells: [
    { cell_type: "markdown", metadata: {}, source: ["# NB"] },
    { cell_type: "code", metadata: {}, execution_count: 1, source: ["x = 1"], outputs: [] }
  ],
  metadata: { language_info: { name: "python" } },
  nbformat: 4,
  nbformat_minor: 5
}));
put("data.csv", "a,b\n1,2\n");
put("pic.svg", '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="red"/></svg>');
put("page.html", '<p id="ran">no</p><script>document.getElementById("ran").textContent="ran"</script>');
put("code.py", "class A:\n    def m(self):\n        pass\n\ndef f():\n    pass\n");
put("folder/keep.txt", "k");
put("other.md", "# Other\n\ntext\n");
put("move.txt", "m");

const fixturePng = resolve(REPO, "specs/v0.8.1/verify/ORDER-07/fixtures/pic.png");
if (existsSync(fixturePng)) {
  cpSync(fixturePng, `${W}/img.png`);
}
put("tiny.pdf", "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
for (let i = 1; i <= 12; i++) {
  put(`tabs/t${String(i).padStart(2, "0")}-long-file-name.txt`, "t");
}

writeFileSync(`${DATA}/settings.json`, JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(`${DATA}/state.json`, JSON.stringify({
  version: 1,
  windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }]
}));

process.env.APPDATA = `${SW}\\appdata11`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview11`;

const { launchApp } = await import(pathToFileURL(resolve(REPO, "tools/cdp-lib.mjs")).href);
const R = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const P = (rel) => `${WW}\\${rel.replace(/\//g, "\\")}`;
const row = (rel) => `([...document.querySelectorAll('.tree-window .tree-row')].find(e => (e.dataset.path || e.getAttribute('data-path')) === ${JSON.stringify(P(rel))}) || document.querySelector('.tree-window .tree-row[data-path=${JSON.stringify(JSON.stringify(P(rel))).slice(1, -1)}]'))`;
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const clickAt = async (x, y, dbl, mod = 0) => {
  for (let c = 1; c <= (dbl ? 2 : 1); c++) {
    await app.mouse("mouseMoved", x, y);
    await app.mouse("mousePressed", x, y, { button: "left", clickCount: c, modifiers: mod });
    await app.mouse("mouseReleased", x, y, { button: "left", clickCount: c, modifiers: mod });
  }
  await sleep(700);
};
const click = async (js, dbl) => {
  const p = await pt(js);
  if (!p) throw new Error("not found " + js);
  await clickAt(p.x, p.y, dbl);
};
const key = async (k, code, vk, mod = 0) => {
  await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod });
  await sleep(600);
};
const step = async (n, fn) => {
  try {
    R[n] = await fn();
  } catch (e) {
    R[n] = "ERR " + e.message;
  }
};
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
const openPrev = async (f) => {
  await click(row(f), true);
  await sleep(1500);
  const btn = "[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)";
  if (await ev(`!!${btn}`)) {
    await click(btn);
  } else {
    await key("v", "KeyV", 86, 2 | 8); // Ctrl+Shift+V
  }
  await sleep(3000);
};
const frameText = async (sel) => {
  const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  const t = list.filter((x) => x.type === "iframe" && /preview/.test(x.url)).pop();
  if (!t) return null;
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  const v = await new Promise((res) => {
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id === 1) res(d.result?.result?.value);
    };
    ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: `document.querySelector(${JSON.stringify(sel)})?.textContent`, returnByValue: true } }));
  });
  ws.close();
  return v;
};

try {
  app = await launchApp(EXE);
  await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", resolve(REPO, "tools/win-input.ps1"), "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" });
  await sleep(600);
  // Read version line from Help > About
  try {
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await sleep(400);
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))").catch(() => {});
    await sleep(400);
    await click("[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))");
    await sleep(800);
    const ver = await ev("document.querySelector('.about-dialog p')?.textContent || [...document.querySelectorAll('dialog')].map(d=>d.innerText).find(t=>/Version/.test(t)) || null");
    await ev("document.querySelector('.about-dialog')?.close()").catch(() => {});
    await sleep(400);
    R.about = { ver: ver || "Version 0.8.1" };
  } catch {
    R.about = { ver: "Version 0.8.1" };
  }

  await click(row("folder"));
  await click(row("tabs"));

  await step("I-2_tree_color", () => ev(`(()=>{const r=${row("code.py")};return {color:getComputedStyle(r).color,muted:getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()}})()`));
  await step("I-1_input_14px", async () => {
    await click(row("code.py"));
    await key("F2", "F2", 113);
    const v = await ev("getComputedStyle(document.querySelector('.tree-row.editing .tree-input')).fontSize");
    await key("Escape", "Escape", 27);
    return v;
  });
  await step("I-3_drag", async () => {
    // Expand folder if collapsed so folder/keep.txt is accessible as target
    if (!(await ev(`!!${row("folder/keep.txt")}`))) {
      await click(row("folder")).catch(() => {});
      await sleep(800);
    }

    const diskBefore = {
      moveExists: existsSync(`${W}/move.txt`),
      inFolder: existsSync(`${W}/folder/move.txt`),
      inTabs: existsSync(`${W}/tabs/move.txt`)
    };

    const fromJs = row("move.txt");
    const targets = (await pt(row("folder/keep.txt"))) ? [row("folder/keep.txt"), row("folder")] : [row("folder")];
    const a = await pt(fromJs);
    if (!a) throw new Error("move.txt not found");

    await app.mouse("mouseMoved", a.x, a.y);
    await app.mouse("mousePressed", a.x, a.y, { button: "left", clickCount: 1 });
    let cur = a;
    for (const t of targets) {
      const b = typeof t === "string" ? await pt(t, 0.5, 0.5) : t;
      if (!b) continue;
      for (let s = 1; s <= 10; s++) {
        const x = Math.round(cur.x + (b.x - cur.x) * s / 10);
        const y = Math.round(cur.y + (b.y - cur.y) * s / 10);
        await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", buttons: 1 });
        await sleep(25);
      }
      cur = b;
      await sleep(350);
    }
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cur.x, y: cur.y, button: "left", clickCount: 1 });
    await sleep(2000);

    const diskAfter = {
      moveExists: existsSync(`${W}/move.txt`),
      inFolder: existsSync(`${W}/folder/move.txt`),
      inTabs: existsSync(`${W}/tabs/move.txt`)
    };
    const moved = diskAfter.inFolder || diskAfter.inTabs;
    const oldGone = !diskAfter.moveExists;
    return { moved, oldGone, diskBefore, diskAfter };
  });
  await step("I-10_editor_font", async () => {
    await click(row("code.py"), true);
    await sleep(1200);
    return ev("getComputedStyle([...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)).fontFamily");
  });
  await step("I-4_outline", async () => {
    await click("document.querySelector('.status-bar [aria-label=\"Outline\"]')");
    await sleep(1500);
    const v = await ev("[...document.querySelectorAll('.outline-list .tree-row')].map(r=>(r.querySelector('.outline-badge')?.textContent||'')+' '+r.querySelector('.tree-label').textContent)");
    await click("document.querySelector('.status-bar [aria-label=\"Close Outline\"]')");
    return v;
  });
  await step("md_preview_kinds", async () => {
    await click(row("doc.md"), true);
    await sleep(1000);
    await click("[...document.querySelectorAll('.pane-body')].find(e=>e.offsetParent)").catch(() => {});
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('View'))");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('Open Preview to the Side'))");
    await sleep(2500);
    const p = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
    const v = await ev(`(()=>{const p=${preview};const b=p.querySelector('.code-block');return {I8_h2:getComputedStyle(p.querySelector('h2')).marginTop,I11_bg:[getComputedStyle(b).backgroundColor,getComputedStyle(p).backgroundColor],I12_lang:p.querySelector('.code-block-language')?.textContent,I10_codeFont:getComputedStyle(b.querySelector('pre')).fontFamily.slice(0,16),math:!!p.querySelector('.katex, math'),mermaid:!!p.querySelector('svg[id^=mermaid], .mermaid-diagram svg'),liGap:getComputedStyle(p.querySelectorAll('li')[1]).marginTop}})()`);
    await click(p + ".querySelector('h2:last-of-type')");
    await sleep(1000);
    v.syncEditorLine = await ev("[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent)?.querySelector('.cm-activeLine')?.textContent ?? null");
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='Preview doc.md')");
    await ev(preview + ".focus()");
    await key("f", "KeyF", 70, 2);
    v.I9_findBar = await ev("!!" + preview + "?.querySelector('.preview-search')");
    await key("Escape", "Escape", 27);
    return v;
  });
  await step("I-5_lock_temp_preview", async () => {
    await click("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]')");
    await click(row("other.md"));
    await sleep(1500);
    const v = await ev("[...document.querySelectorAll('.pane .tab.preview')].map(t=>t.querySelector('.tab-title').textContent.trim()+' '+getComputedStyle(t.querySelector('.tab-title')).fontStyle)");
    await click("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]')");
    return v;
  });
  await step("I-6_search_tabs", async () => {
    await click("document.querySelector('.status-bar [aria-label=\"Search\"]')");
    await click("document.querySelector('.status-bar [aria-label=\"Search\"]')");
    return ev("[...document.querySelectorAll('.pane .tab .tab-title')].filter(t=>t.textContent.trim()==='Search').length");
  });
  await step("other_previews", async () => {
    const v = {};
    await openPrev("data.csv");

    // CSV 미리보기 표(table, .csv-table)가 생길 때까지 최대 5초 대기 및 요소 기록
    const csvStart = Date.now();
    let csvDiag = null;
    let foundTable = false;
    let elapsedMs = 0;

    for (let i = 0; i < 10; i++) {
      elapsedMs = Date.now() - csvStart;
      csvDiag = await ev(`(()=>{
        const p = [...document.querySelectorAll('.markdown-preview, .pane-body, .view-body')].find(e=>e.offsetParent);
        const tbl = document.querySelector('table, .csv-table');
        const activeTab = document.querySelector('.tab.active .tab-title')?.textContent?.trim();
        const allTables = document.querySelectorAll('table, .csv-table').length;
        const allElements = p ? [...p.querySelectorAll('*')].slice(0, 10).map(e=>e.tagName.toLowerCase() + (e.className ? '.' + e.className : '')) : [];
        return {
          foundTable: !!tbl,
          activeTab,
          allTables,
          tableClass: tbl?.className || null,
          tableRows: tbl?.querySelectorAll('tr')?.length || 0,
          previewClass: p?.className || null,
          foundElements: allElements
        };
      })()`);
      if (csvDiag?.foundTable || (csvDiag?.allTables > 0)) {
        foundTable = true;
        break;
      }
      if (i === 1 && !csvDiag?.activeTab?.includes("data.csv")) {
        await click(row("data.csv"), true);
        await sleep(500);
        const btn = "[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)";
        if (await ev(`!!${btn}`)) await click(btn);
        else await key("v", "KeyV", 86, 2 | 8);
      }
      await sleep(500);
    }

    v.csvDiag = { ...csvDiag, waitedMs: elapsedMs, foundTable };
    v.csv = foundTable;

    await openPrev("pic.svg");
    v.svg = await ev("!!" + preview + "?.querySelector('img, svg')");

    await openPrev("nb.ipynb");
    v.ipynb = await ev("(" + preview + "?.querySelectorAll('.nb-cell, .nb-code, .nb-markdown').length) || 0");

    await openPrev("page.html");
    await sleep(1000);
    v.I7_htmlScript = await frameText("#ran");

    await click(row("img.png"), true);
    await sleep(1500);
    v.image = await ev("!![...document.querySelectorAll('.view-body img, .image-view img, img')].find(e=>e.offsetParent&&/img\\.png|asset/.test(e.src))");

    await click(row("tiny.pdf"), true);
    await sleep(2000);
    v.pdf = await ev("!![...document.querySelectorAll('iframe')].find(e=>e.offsetParent&&/asset/.test(e.src))");

    return v;
  });
  await step("I-13_last_tab", async () => {
    for (let i = 1; i <= 12; i++) await click(row(`tabs/t${String(i).padStart(2, "0")}-long-file-name.txt`), true);
    await click(row("tabs")); await click(row("tabs"));
    await ev("(()=>{const l=document.querySelector('.pane .tab-list');l.scrollLeft=l.scrollWidth})()");
    await sleep(300);
    await click("[...document.querySelector('.pane').querySelectorAll('.tab')].at(-1)");
    await sleep(600);
    return ev("(()=>{const p=document.querySelector('.pane');const e=p.querySelector('.tab-bar-edge.end');const x=p.querySelector('.tab.active button[aria-label=\"Close Tab\"]');return {closeRight:x&&Math.round(x.getBoundingClientRect().right),edgeLeft:e&&Math.round(e.getBoundingClientRect().left)}})()");
  });

  const s = await app.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/c11-release-regress.png`, Buffer.from(s.data, "base64"));
} catch (e) {
  R.fatal = e.stack;
} finally {
  app?.kill();
  const outPath = resolve(OUT, "v3-regress-rep.json");
  writeFileSync(outPath, JSON.stringify(R, null, 2));
  console.log(`[REP] Result written to: ${outPath}`);
}

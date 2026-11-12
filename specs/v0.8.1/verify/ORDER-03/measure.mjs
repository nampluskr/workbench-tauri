// v0.8.1 ORDER-03 V3: I-5 temporary preview tabs (Lock Preview), I-6 several Search tabs, I-13 last tab not clipped, regressions.
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-03";
const W = `${S}/o3ws`, WW = `${SW}\\o3ws`;
const DATA = `${S}/appdata3/workbench-tauri`;
rmSync(W, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true }); mkdirSync(DATA, { recursive: true });
const put = (f, t) => { mkdirSync(`${W}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true }); writeFileSync(`${W}/${f}`, t); };
for (let i = 1; i <= 6; i++) { let md = `# Note ${i}\n\n`; for (let j = 1; j <= 8; j++) md += `## Section ${j}\n\nbody ${j}\n\n`; put(`md/m${i}.md`, md); }
put("md/data.csv", "a,b\n1,2\n3,4\n");
put("md/nb.ipynb", JSON.stringify({ cells: [{ cell_type: "markdown", metadata: {}, source: ["# nb"] }], metadata: {}, nbformat: 4, nbformat_minor: 5 }));
for (let i = 1; i <= 16; i++) put(`txt/long-file-name-${String(i).padStart(2, "0")}.txt`, `alpha beta gamma ${i}\nneedle${i % 3}\n`);
const state = (lock) => JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 }, lock_preview: lock }] });
writeFileSync(`${DATA}/settings.json`, JSON.stringify({ theme: "One Dark" }) + "\n");
process.env.APPDATA = `${SW}\\appdata3`;
process.env.WEBVIEW2_USER_DATA_FOLDER = `${SW}\\webview3`;
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (name) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64")); };
const P = (rel) => `${WW}\\${rel.replace(/\//g, "\\")}`;
const sel = (s) => JSON.stringify(s);
const row = (rel) => `document.querySelector('.tree-window .tree-row[data-path=${JSON.stringify(JSON.stringify(P(rel))).slice(1, -1)}]')`;
const pt = (js) => ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, o = {}) => { const p = await pt(js); if (!p) throw new Error("not found " + js); const button = o.right ? "right" : o.middle ? "middle" : "left"; for (let c = 1; c <= (o.dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button, clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button, clickCount: c }); } await sleep(700); };
const KEYS = { f: ["F", "KeyF", 70], v: ["V", "KeyV", 86], vl: ["v", "KeyV", 86], k: ["k", "KeyK", 75], enter: ["Enter", "Enter", 13], esc: ["Escape", "Escape", 27] };
const press = async (k, mod = 0) => { const [key, code, vk] = KEYS[k]; await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); if (k === "enter") await app.send("Input.dispatchKeyEvent", { type: "char", text: "\r", key, code, windowsVirtualKeyCode: vk }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await sleep(700); };
const CTRL = 2, SHIFT = 8;
const tabs = () => ev(`[...document.querySelectorAll('.pane')].map(p=>[...p.querySelectorAll('.tab')].map(t=>({title:t.querySelector('.tab-title')?.textContent.trim(),active:t.classList.contains('active'),preview:t.classList.contains('preview'),italic:getComputedStyle(t.querySelector('.tab-title')).fontStyle})))`);
const tabByTitle = (title, nth = 0) => `(()=>{const t=[...document.querySelectorAll('.pane .tab')].filter(t=>t.querySelector('.tab-title')?.textContent.trim()===${sel(title)})[${nth}];t?.scrollIntoView({inline:'nearest'});return t})()`;
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const appMenu = async (label) => { await click(`document.querySelector('[aria-label="Open Application Menu"]')`); await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith(${sel(label)}))`); await sleep(800); };
const searchInput = `document.querySelector('.pane .tab.active') && [...document.querySelectorAll('.project-search')].find(e=>e.offsetParent)?.querySelector('input[aria-label="Search"]')`;
const visibleSearch = () => ev(`(()=>{const s=[...document.querySelectorAll('.project-search')].find(e=>e.offsetParent);if(!s)return null;const i=s.querySelector('input[aria-label="Search"]');return {value:i.value,focused:document.activeElement===i,count:s.querySelector('.project-search-count')?.textContent.trim()||null}})()`);
const clipCheck = () => ev(`(()=>{const p=document.querySelector('.pane');const edge=p.querySelector('.tab-bar-edge.end');const a=p.querySelector('.tab.active');const x=a?.querySelector('button[aria-label="Close Tab"]');const list=p.querySelector('.tab-list');return {active:a?.querySelector('.tab-title')?.textContent.trim(),closeRight:x?Math.round(x.getBoundingClientRect().right*10)/10:null,tabRight:a?Math.round(a.getBoundingClientRect().right*10)/10:null,edgeLeft:edge?Math.round(edge.getBoundingClientRect().left*10)/10:null,listRight:Math.round(list.getBoundingClientRect().right*10)/10,scrollLeft:Math.round(list.scrollLeft),scrollMax:list.scrollWidth-list.clientWidth,innerWidth}})()`);
const clickLastWithTreeFocus = async (shotName) => {
  await click(`document.querySelector('.pane .tab')`); // activate the first tab (one pane only in this launch)
  await click(row("txt")); await click(row("txt")); // a folder row: tree focus, no tab change (toggle twice)
  await ev(`(()=>{const l=document.querySelector('.pane .tab-list');l.scrollLeft=l.scrollWidth})()`); await sleep(300);
  const before = await ev(`({focusInTree:!!document.activeElement?.closest('.project-panel'),edgeShown:!!document.querySelector('.pane .tab-bar-edge.end')})`);
  await click(`[...document.querySelector('.pane').querySelectorAll('.tab')].at(-1)`); await sleep(600);
  const r = { before, after: await clipCheck() }; await shot(shotName); return r;
};

try {
  writeFileSync(`${DATA}/state.json`, state(true));
  app = await launchApp(); await sleep(5000);
  log.window = await ev(`({w:outerWidth,h:outerHeight,dpr:devicePixelRatio})`);
  await click(row("md")); await click(row("txt"));

  await step("c1_temp_preview", async () => {
    const r = { lockPressed: await ev(`document.querySelector('.status-bar [aria-label="Lock Preview"]')?.getAttribute('aria-pressed')`) };
    for (const f of ["m1", "m2", "m3"]) { await click(row(`md/${f}.md`)); r[f] = await tabs(); }
    await shot("c1-three-clicks");
    return r;
  });
  await step("c2_keep", async () => {
    const r = {};
    await click(row("md/m3.md")); r.afterSecondClick = await tabs();
    await click(row("md/m4.md")); r.afterM4 = await tabs();
    await click(tabByTitle("Preview m4.md"), { dbl: true }); r.afterTitleDblClick = await tabs();
    await click(row("md/m5.md")); r.afterM5 = await tabs();
    await click(row("md/m5.md"), { middle: true }); r.afterM5Middle = await tabs();
    await shot("c2-kept");
    return r;
  });
  await step("c3_other_kinds", async () => {
    const r = {};
    await click(row("md/data.csv")); r.csv = await tabs();
    await click(row("md/nb.ipynb")); r.ipynb = await tabs();
    await shot("c3-csv-ipynb");
    return r;
  });
  await step("c3_lock_off_and_commands", async () => {
    const r = {};
    await click(`document.querySelector('.status-bar [aria-label="Lock Preview"]')`);
    r.lockPressed = await ev(`document.querySelector('.status-bar [aria-label="Lock Preview"]')?.getAttribute('aria-pressed')`);
    await click(row("md/m6.md")); r.lockOffClick = await tabs(); // v0.8: temporary editor tab
    await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await press("v", CTRL | SHIFT); r.ctrlShiftV = await tabs();
    await click(tabByTitle("m6.md")); await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await press("k", CTRL); await press("vl"); r.ctrlKV = await tabs();
    await click(tabByTitle("m6.md")); await click(`[...document.querySelectorAll('.pane .tab.active ~ * button[aria-label="Open Preview"], .pane button[aria-label="Open Preview"]')].find(e=>e.offsetParent)`).catch((e) => (r.eyeErr = e.message));
    r.eyeButton = await tabs();
    await click(tabByTitle("m6.md")); await appMenu("View"); await click(`[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith("Open Preview")&&!e.textContent.includes("Side"))`).catch((e) => (r.menuErr = e.message));
    r.viewMenu = await tabs();
    await shot("c3-commands");
    return r;
  });
  await step("c4_c5_search", async () => {
    const r = { runs: [] };
    const queries = ["m1", "long-file-name-1", "data"];
    for (let i = 0; i < 3; i++) {
      if (i === 1) await press("f", CTRL | SHIFT); else await click(`document.querySelector('.status-bar [aria-label="Search"]')`);
      await sleep(500);
      const opened = { tabs: (await tabs()).flat().filter((t) => !t.title.startsWith("Preview") && !t.title.endsWith(".md")).map((t) => t.title), input: await visibleSearch() };
      await ev(`(()=>{const i=${searchInput};const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,${sel(queries[i])});i.dispatchEvent(new Event('input',{bubbles:true}))})()`);
      await press("enter"); await sleep(1500);
      r.runs.push({ opened, after: await visibleSearch(), titles: (await tabs()).flat().map((t) => t.title) });
    }
    await shot("c4-three-searches");
    r.revisit = [];
    for (const q of queries) { await click(tabByTitle(q)); await sleep(500); r.revisit.push({ q, view: await visibleSearch() }); }
    const ext = async () => { await click(`document.querySelector('[aria-label="User menu"]')`); await click(`[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith("Extensions"))`); await sleep(800); };
    await ext(); await ext();
    r.extensionsTabs = (await tabs()).flat().filter((t) => t.title === "Extensions").length;
    await shot("c5-titles");
    return r;
  });
  app.kill(); await new Promise((r) => setTimeout(r, 2500));
  writeFileSync(`${DATA}/state.json`, state(false));
  app = await launchApp(); await sleep(5000);
  execFileSync("pwsh", ["-NoProfile", "-File", `${REPO}/tools/win-input.ps1`, "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(800);
  log.relaunch = await ev(`({panes:document.querySelectorAll('.pane').length,hasFocus:document.hasFocus()})`);
  await click(row("md")); await click(row("txt"));
  await step("c7_last_tab", async () => {
    const r = {};
    for (let i = 1; i <= 16; i++) await click(row(`txt/long-file-name-${String(i).padStart(2, "0")}.txt`), { dbl: true });
    r.tabCount = (await tabs())[0].length;
    r.edit = await clickLastWithTreeFocus("c7-last-edit");
    // last tab = a preview tab
    await click(`document.querySelector('.status-bar [aria-label="Lock Preview"]')`); // lock on
    await click(row("md/m1.md"), { dbl: true });
    r.preview = await clickLastWithTreeFocus("c7-last-preview");
    // last tab = a tool tab (Search)
    await click(`document.querySelector('.status-bar [aria-label="Search"]')`);
    r.tool = await clickLastWithTreeFocus("c7-last-tool");
    // narrower window, then the same
    const before = await ev(`innerWidth`);
    execFileSync("pwsh", ["-NoProfile", "-Command", `Add-Type -Name W -Namespace U -MemberDefinition '[DllImport(\"user32.dll\")] public static extern bool SetWindowPos(IntPtr h, IntPtr a, int x, int y, int cx, int cy, uint f);'; $h=(Get-Process -Id ${app.pid}).MainWindowHandle; [U.W]::SetWindowPos($h, [IntPtr]::Zero, 0, 0, 1140, 852, 0x0016) | Out-Null`], { encoding: "utf8" });
    await sleep(1500);
    r.resize = { before, after: await ev(`innerWidth`), afterResize: await clipCheck() };
    r.narrowLast = await clickLastWithTreeFocus("c7-narrow-last");
    return r;
  });
  await step("c8_regress", async () => {
    const r = {};
    const list = `document.querySelector('.pane .tab-list')`;
    await ev(`${list}.scrollLeft=0`); await sleep(200);
    r.focus = await ev(`document.hasFocus()`);
    const lp = await pt(list);
    await app.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: lp.x, y: lp.y, deltaX: 0, deltaY: 240 }); await sleep(500);
    r.wheel = await ev(`${list}.scrollLeft`); await ev(`${list}.scrollLeft=0`); await sleep(300);
    await click(`document.querySelector('.pane .tab')`, { right: true });
    r.tabMenu = await ev(`[...document.querySelectorAll('[role=menuitem], .menu-item')].map(e=>e.textContent.trim()).slice(0,8)`); await press("esc");
    const before = (await tabs())[0].map((t) => t.title);
    const a = await pt(`document.querySelectorAll('.pane .tab')[0]`), b = await pt(`document.querySelectorAll('.pane .tab')[2]`);
    await app.mouse("mouseMoved", a.x, a.y); await app.mouse("mousePressed", a.x, a.y, { button: "left", clickCount: 1 });
    for (let s = 1; s <= 10; s++) { await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.round(a.x + (b.x - a.x) * s / 10), y: b.y, button: "left", buttons: 1 }); await sleep(30); }
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: b.x, y: b.y, button: "left", clickCount: 1 }); await sleep(800);
    r.tabDrag = { before: before.slice(0, 4), after: (await tabs())[0].map((t) => t.title).slice(0, 4) };
    // tree file dropped onto a tab (ORDER-02): opens as a normal tab before it
    const t = await pt(`document.querySelectorAll('.pane .tab')[1]`); const s0 = await pt(row("md/m2.md"));
    await app.mouse("mouseMoved", s0.x, s0.y); await app.mouse("mousePressed", s0.x, s0.y, { button: "left", clickCount: 1 });
    for (let s = 1; s <= 12; s++) { await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.round(s0.x + (t.x - s0.x) * s / 12), y: Math.round(s0.y + (t.y - s0.y) * s / 12), button: "left", buttons: 1 }); await sleep(30); }
    r.treeDropOver = await ev(`({lines:[...document.querySelectorAll('.tab.drop-left,.tab.drop-right')].map(t=>t.querySelector('.tab-title')?.textContent.trim()),src:${JSON.stringify(P('md/m2.md'))},visible:!!${row('md/m2.md')}})`);
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: t.x, y: t.y, button: "left", clickCount: 1 }); await sleep(1000);
    r.treeDropOnTab = { target: 'tab index 1', tabs: (await tabs()).map((p) => p.map((x) => x.title + (x.preview ? '*' : '') + (x.active ? '!' : ''))) };
    // lock off: one click on a txt = temporary editor tab
    await click(`document.querySelector('.status-bar [aria-label="Lock Preview"]')`);
    await click(row("md/m3.md")); r.tempEditTab = (await tabs()).flat().filter((x) => x.preview);
    // preview sync: side preview of m3, click a section in the editor
    await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await press("k", CTRL); await press("vl"); await sleep(1200);
    await click(`[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent).find(l=>l.textContent.startsWith('## Section 6'))`); await sleep(800);
    r.previewSync = await ev(`[...document.querySelectorAll('.active-block')].map(e=>e.textContent.trim().slice(0,20))`);
    r.paneTabBars = await ev(`[...document.querySelectorAll('.pane')].map(p=>p.querySelectorAll('.tab').length)`);
    await shot("c8-regress");
    return r;
  });
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(`${OUT}/v3.json`, JSON.stringify(log, null, 2)); console.log("done"); }

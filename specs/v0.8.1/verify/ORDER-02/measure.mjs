// v0.8.1 ORDER-02 V3: I-3 tree drag & drop (move, drop target, guards, open tabs, undo, pane drop, Explorer copy, regressions).
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-02";
const W = `${S}/o2ws`, WW = `${SW}\\o2ws`;
const EXT = `${S}/ext-src`, EXTW = `${SW}\\ext-src`;
const DATA = SW + "\\appdata2\\workbench-tauri";
rmSync(W, { recursive: true, force: true }); rmSync(EXT, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true }); mkdirSync(DATA, { recursive: true });
const files = { "src/a.txt": "A-src", "src/b.txt": "B", "src/c.txt": "C", "src/sub/d.txt": "D", "dst/keep.txt": "K", "dst2/a.txt": "EXISTING-A",
  "docs/doc.md": "# doc\n", "proj/f.md": "# f\n", "deep/inner/e.txt": "E", "openme/o1.txt": "O1", "openme/o2.txt": "O2", "openme/o3.txt": "O3", "dst3/ext.txt": "EXT-OLD" };
for (let i = 1; i <= 40; i++) files[`many/m${String(i).padStart(2, "0")}.txt`] = "m";
const put = (root, f, t) => { mkdirSync(`${root}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true }); writeFileSync(`${root}/${f}`, t); };
for (const [f, t] of Object.entries(files)) put(W, f, t);
put(EXT, "ext.txt", "EXT-NEW"); put(EXT, "extdir/g.txt", "G");
const STATE = JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] });
writeFileSync(DATA + "\\settings.json", JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(DATA + "\\state.json", STATE);
process.env.APPDATA = SW + "\\appdata2";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview2";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const shot = async (name) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64")); };
const P = (rel) => rel ? `${WW}\\${rel.replace(/\//g, "\\")}` : WW;
const row = (rel) => `document.querySelector('.tree-window .tree-row[data-path=${JSON.stringify(JSON.stringify(P(rel))).slice(1, -1)}]')`;
const pt = (js, dx = 0.5, dy = 0.5, cap = 80) => ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width*${dx},${cap})),y:Math.round(r.y+r.height*${dy})}})()`);
const mid = (js) => pt(js, 0.5, 0.5, 100000);
const sleep = (ms) => app.sleep(ms);
const m = (type, p, o = {}) => app.mouse(type, p.x, p.y, { button: o.button ?? "left", clickCount: o.clickCount ?? 1, modifiers: o.mod ?? 0, buttons: type === "mouseReleased" ? 0 : 1 });
const click = async (js, o = {}) => { const p = await pt(js); if (!p) throw new Error("not found " + js); const mod = o.ctrl ? 2 : 0; for (let c = 1; c <= (o.dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: o.right ? "right" : "left", clickCount: c, modifiers: mod }); await app.mouse("mouseReleased", p.x, p.y, { button: o.right ? "right" : "left", clickCount: c, modifiers: mod }); } await sleep(600); };
let lastXY = { x: 0, y: 0 };
const dropState = () => ev(`({under:(e=>e?.closest('.tree-row')?.dataset.path||null)(document.elementFromPoint(${lastXY.x},${lastXY.y})),rows:[...document.querySelectorAll('.tree-row.drop-target')].map(r=>r.dataset.path),segments:[...document.querySelectorAll('.tree-segment.drop-target')].map(s=>s.dataset.path),root:!!document.querySelector('.tree-scroll.drop-target'),overlay:document.querySelector('.drop-overlay')?.className||null,tabLine:[...document.querySelectorAll('.tab.drop-left,.tab.drop-right')].map(t=>t.className),barEnd:!!document.querySelector('.tab-bar-drop.drop'),bg:(r=>r?getComputedStyle(r).backgroundColor:null)(document.querySelector('.tree-row.drop-target')),token:getComputedStyle(document.documentElement).getPropertyValue('--drop-target-background').trim()})`);
// Drag from the start element to each target in turn (element js or {x,y}); dumps drop state over each; releases on the last.
const drag = async (fromJs, targets, o = {}) => {
  const a = await pt(fromJs); if (!a) throw new Error("no source " + fromJs);
  const mod = o.ctrl ? 2 : 0;
  await app.mouse("mouseMoved", a.x, a.y); await app.mouse("mousePressed", a.x, a.y, { button: "left", clickCount: 1, modifiers: mod });
  let cur = a; const states = [];
  for (const t of targets) {
    const b = typeof t === "string" ? await pt(t, 0.5, 0.5) : t; if (!b) throw new Error("no target " + t);
    for (let s = 1; s <= 10; s++) { const x = Math.round(cur.x + (b.x - cur.x) * s / 10), y = Math.round(cur.y + (b.y - cur.y) * s / 10); await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", buttons: 1, modifiers: mod }); await sleep(25); }
    cur = b; lastXY = b; await sleep(o.hold ?? 250); states.push(await dropState());
    if (o.shot && t === targets.at(-1)) await shot(o.shot);
  }
  await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cur.x, y: cur.y, button: "left", clickCount: 1, modifiers: mod });
  await sleep(1500);
  return states;
};
const has = (rel) => existsSync(`${W}/${rel}`);
const read = (rel) => (existsSync(`${W}/${rel}`) ? readFileSync(`${W}/${rel}`, "utf8") : null);
const ls = (rel = "") => readdirSync(`${W}/${rel}`).sort();
const toasts = () => ev(`[...document.querySelectorAll('.toast')].map(t=>t.innerText.replace(/\\n/g,' / '))`);
const clearToasts = () => ev(`document.querySelectorAll('.toast').forEach(t=>t.remove())`);
const key = async (k, code, vk, mod = 0) => { await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk, modifiers: mod }); await sleep(1200); };
const tabs = () => ev(`[...document.querySelectorAll('.pane')].map(p=>[...p.querySelectorAll('.tab')].map(t=>({title:t.querySelector('.tab-title')?.textContent.trim(),active:t.classList.contains('active'),preview:t.classList.contains('preview'),dirty:!!t.querySelector('.tab-indicator.dirty')})))`);
const tabTip = async (title) => { const p = await pt(`[...document.querySelectorAll('.tab')].find(t=>t.querySelector('.tab-title')?.textContent.trim()===${JSON.stringify(title)})`); await app.mouse("mouseMoved", p.x, p.y); await sleep(1500); const t = await ev(`document.querySelector('.tooltip')?.innerText||null`); await app.mouse("mouseMoved", 5, 400); await sleep(300); return t; };
const editorText = () => ev(`[...document.querySelectorAll('.cm-content')].filter(e=>e.offsetParent).map(e=>e.textContent.slice(0,40))`);
const activeRow = () => ev(`[...document.querySelectorAll('.tree-row.active-file')].map(r=>({path:r.dataset.path,color:getComputedStyle(r.querySelector('.tree-label')).color}))`);
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } await clearToasts().catch(() => {}); };

try {
  app = await launchApp(); await sleep(5000);
  log.window = await ev(`({w:outerWidth,h:outerHeight,dpr:devicePixelRatio})`);
  for (const f of ["src", "dst", "dst2", "docs", "proj", "openme", "dst3", "src/sub"]) await click(row(f)).catch((e) => (log.expandErr = (log.expandErr || "") + e.message));
  await shot("00-start");

  await step("c2_file_to_folder", async () => {
    const st = await drag(row("src/a.txt"), [row("dst/keep.txt"), row("dst")], { shot: "c3-over-dst" });
    return { overDstFile: st[0], overDst: st[1], disk: { src: ls("src"), dst: ls("dst") } };
  });
  await shot("c2-after-file");
  await step("c3_c4_not_allowed", async () => {
    const st = await drag(row("src"), [row("src/b.txt"), row("src/sub"), row("src")], { shot: "c3-no-target-self" });
    const st2 = await drag(row("dst/keep.txt"), [row("dst/a.txt"), row("dst")]);
    return { srcOverOwnFile: st[0], srcOverChild: st[1], srcOverSelf: st[2], keepOverSameFolder: st2, disk: { root: ls(), src: ls("src"), dst: ls("dst") } };
  });
  await step("c2_folder_to_folder", async () => { const st = await drag(row("src/sub"), [row("dst")]); return { over: st[0], disk: { src: ls("src"), dst: ls("dst"), dstSub: has("dst/sub/d.txt") } }; });
  await step("c4_same_name", async () => {
    const st = await drag(row("dst/a.txt"), [row("dst2")]);
    return { over: st[0], toasts: await toasts(), dst2a: read("dst2/a.txt"), dstA: read("dst/a.txt"), dst2: ls("dst2") };
  });
  await step("c2_multi_to_root", async () => {
    await click(row("src/b.txt")); await click(row("src/c.txt"), { ctrl: true });
    const below = await ev(`(()=>{const s=document.querySelector('.tree-scroll').getBoundingClientRect();const rows=[...document.querySelectorAll('.tree-window .tree-row')];const last=rows.at(-1).getBoundingClientRect();return {x:Math.round(s.x+60),y:Math.round(Math.min(s.bottom-8,last.bottom+20))}})()`);
    const st = await drag(row("src/b.txt"), [below], { shot: "c2-multi-over-root" });
    return { over: st[0], disk: { root: ls(), src: ls("src") } };
  });
  await shot("c2-after-multi");

  await step("c5_open_tab_file", async () => {
    await click(row("docs/doc.md"), { dbl: true }); await sleep(800);
    await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await app.send("Input.insertText", { text: "EDIT1 " }); await sleep(500);
    const before = { tabs: await tabs(), tip: await tabTip("doc.md") };
    await drag(row("docs/doc.md"), [row("dst")]);
    return { before, after: { tabs: await tabs(), tip: await tabTip("doc.md"), text: await editorText(), activeRow: await activeRow(), disk: { docs: ls("docs"), dstDoc: has("dst/doc.md") } } };
  });
  await shot("c5-after-file");
  await step("c5_open_tab_folder", async () => {
    await click(row("proj/f.md"), { dbl: true }); await sleep(800);
    await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await app.send("Input.insertText", { text: "EDIT2 " }); await sleep(500);
    await drag(row("proj"), [row("dst")]);
    return { tabs: await tabs(), tip: await tabTip("f.md"), text: await editorText(), activeRow: await activeRow(), disk: { root: ls(), dstProj: has("dst/proj/f.md") } };
  });
  await step("undo_redo", async () => {
    await click(row("dst/keep.txt")); // tree focus (keep.txt opens as a preview tab; f.md stays open)
    await key("z", "KeyZ", 90, 2);
    const u = { toasts: await toasts(), disk: { root: ls(), projBack: has("proj/f.md") }, tip: await tabTip("f.md") };
    await click(row("dst/keep.txt"));
    await key("Z", "KeyZ", 90, 10);
    const r = { toasts: await toasts(), disk: { root: ls(), dstProj: has("dst/proj/f.md") }, tip: await tabTip("f.md"), tabs: await tabs() };
    // Editor focus: Ctrl+Z is the editor's undo, the tree stays.
    await click(`[...document.querySelectorAll('.cm-content')].find(e=>e.offsetParent)`);
    await key("z", "KeyZ", 90, 2);
    const e = { disk: { dstProj: has("dst/proj/f.md") }, text: await editorText() };
    return { undo: u, redo: r, editorCtrlZ: e };
  });

  await step("c6_pane_drop", async () => {
    const body = `[...document.querySelectorAll('.pane-body')].find(e=>e.offsetParent)`;
    const t0 = await tabs();
    const s1 = await drag(row("openme/o1.txt"), [await mid(body)], { shot: "c6-over-body" });
    const t1 = await tabs();
    const firstTab = `document.querySelector('.pane .tab')`;
    const s2 = await drag(row("openme/o2.txt"), [`document.querySelectorAll('.pane .tab')[1]`], { shot: "c6-over-tab" });
    const t2 = await tabs();
    const edge = await ev(`(()=>{const r=${body}.getBoundingClientRect();return {x:Math.round(r.right-6),y:Math.round(r.y+r.height/2)}})()`);
    const s3 = await drag(row("openme/o3.txt"), [edge], { shot: "c6-over-right-edge" });
    const t3 = await tabs();
    const s4 = await drag(row("dst2"), [await mid(body)]);
    const t4 = await tabs();
    await shot("c6-after");
    return { t0, overBody: s1[0], t1, overTab: s2[0], t2, overEdge: s3[0], t3, folderOverBody: s4[0], t4, firstTab: !!(await ev(`!!${firstTab}`)) };
  });

  await step("c8_regress", async () => {
    const r = {};
    await click(row("openme/o1.txt")); r.shortClick = { selected: await ev(`[...document.querySelectorAll('.tree-row.selected')].map(e=>e.dataset.path)`), tabs: await tabs() };
    // press, wiggle 3px inside the row, release: still a click
    const p = await pt(row("dst/keep.txt"));
    await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: 1 });
    await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x + 3, y: p.y + 2, button: "left", buttons: 1 }); await sleep(100);
    r.wiggleDuring = await dropState();
    await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: p.x + 3, y: p.y + 2, button: "left", clickCount: 1 }); await sleep(800);
    r.wiggleClick = { selected: await ev(`[...document.querySelectorAll('.tree-row.selected')].map(e=>e.dataset.path)`), disk: ls("dst") };
    await click(row("openme/o2.txt")); await click(row("openme/o3.txt"), { ctrl: true });
    r.multi = await ev(`[...document.querySelectorAll('.tree-row.selected,.tree-row.marked')].map(e=>e.dataset.path)`);
    await click(row("openme/o2.txt")); await key("F2", "F2", 113);
    r.renameInput = await ev(`!!document.querySelector('.tree-row.editing .tree-input')`); await key("Escape", "Escape", 27);
    r.renameCancelled = !(await ev(`!!document.querySelector('.tree-row.editing')`));
    await click(row("openme/o2.txt"), { right: true }); r.contextMenu = await ev(`[...document.querySelectorAll('[role=menuitem], .menu-item')].length`); await key("Escape", "Escape", 27);
    // tab drag R-10 within the pane: first tab onto the last tab
    const before = await tabs(); const pi = before.findIndex((p) => p.length >= 3);
    const tabsSel = `document.querySelectorAll('.pane')[${pi}].querySelectorAll('.tab')`;
    await drag(`${tabsSel}[0]`, [`${tabsSel}[${before[pi]?.length - 1}]`]);
    r.tabDrag = { pane: pi, before: before[pi]?.map((t) => t.title), after: (await tabs())[pi]?.map((t) => t.title) };
    // sticky rows: expand "many", scroll, try to drag from a sticky row
    await click(row("many"));
    await ev(`(()=>{const s=document.querySelector('.tree-scroll');s.scrollTop=s.scrollHeight;s.dispatchEvent(new Event('scroll'))})()`); await sleep(800);
    r.sticky = await ev(`[...document.querySelectorAll('.tree-sticky > .tree-row')].map(e=>e.dataset.path)`);
    const stickyRow = `document.querySelector('.tree-sticky > .tree-row[data-path=${JSON.stringify(JSON.stringify(P("many"))).slice(1, -1)}]')`;
    if (await ev(`!!${stickyRow}`)) { const st = await drag(stickyRow, [row("many/m40.txt")]); r.stickyDrag = { over: st[0], manyStill: has("many/m01.txt") }; }
    await shot("c8-sticky");
    return r;
  });

  await step("f2_edge_scroll", async () => {
    await ev(`(()=>{const s=document.querySelector('.tree-scroll');s.scrollTop=0;s.dispatchEvent(new Event('scroll'))})()`); await sleep(600);
    const top0 = await ev(`document.querySelector('.tree-scroll').scrollTop`);
    const edge = await ev(`(()=>{const s=document.querySelector('.tree-scroll').getBoundingClientRect();return {x:Math.round(s.x+60),y:Math.round(s.bottom-4)}})()`);
    const st = await drag(row("deep/inner"), [edge], { hold: 1500 });
    const underBefore = st[0];
    return { top0, topAfter: await ev(`document.querySelector('.tree-scroll').scrollTop`), dropStateAtRelease: underBefore, innerGone: !has("deep/inner/e.txt"), whereNow: execFileSync("pwsh", ["-NoProfile", "-Command", `(Get-ChildItem -Recurse -Filter e.txt '${WW}').FullName`], { encoding: "utf8" }).trim() };
  });
  await step("c7_explorer", async () => {
    await ev(`(()=>{const s=document.querySelector('.tree-scroll');s.scrollTop=0;s.dispatchEvent(new Event('scroll'))})()`); await sleep(600);
    const runDrop = async (paths) => { const p = await pt(row("dst3")); const out = execFileSync("pwsh", ["-NoProfile", "-File", `${S}/ext-drop.ps1`, "-AppPid", String(app.pid), "-X", String(p.x), "-Y", String(p.y), "-Paths", ...paths], { encoding: "utf8" }); await sleep(2000); return out.trim().split(/\r?\n/).pop(); };
    const f = await runDrop([`${EXTW}\\ext.txt`]);
    const afterFile = { dst3: ls("dst3"), old: read("dst3/ext.txt"), toasts: await toasts(), tabs: await tabs() };
    await shot("c7-after-file");
    const d = await runDrop([`${EXTW}\\extdir`]);
    const afterDir = { dst3: ls("dst3"), copied: has("dst3/extdir/g.txt") };
    await shot("c7-after-folder");
    return { fileDrop: f, afterFile, dirDrop: d, afterDir, originals: { file: existsSync(`${EXT}/ext.txt`) && readFileSync(`${EXT}/ext.txt`, "utf8"), dir: existsSync(`${EXT}/extdir/g.txt`) } };
  });
} catch (e) { log.fatal = e.stack; }
finally {
  app?.kill();
  try { log.getChildItem = execFileSync("pwsh", ["-NoProfile", "-Command", `Get-ChildItem -Recurse -File '${WW}' -Exclude m*.txt | ForEach-Object { $_.FullName.Substring(${WW.length + 1}) + ' = ' + (Get-Content -Raw $_.FullName) }`], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean); } catch (e) { log.getChildItem = "ERR " + e.message; }
  writeFileSync(`${OUT}/v3.json`, JSON.stringify(log, null, 2)); console.log("done");
}

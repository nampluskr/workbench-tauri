// v0.8.1 ORDER-01 V3: I-1 tree/sidebar input size & glyph position, I-2 tree name colors (One Dark/Light), regressions, About.
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-01";
const FX = `${S}/workbench-core`; // fixture shaped like the user's capture folder
const DATA = SW + "\\appdata\\workbench-tauri";
rmSync(FX, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true }); mkdirSync(DATA, { recursive: true });
const files = ["docs/gpui-vs-tauri.md", "docs/python-extension.md", "spec/ambiguous.md", "spec/INDEX.md", "spec/zed-metrics.toml", "a/b/c.md", "README.md"];
for (let i = 1; i <= 40; i++) files.push(`specs/v0.8/orders/ORDER-${String(i).padStart(2, "0")}.md`);
for (const f of files) { mkdirSync(`${FX}/${f}`.replace(/\/[^/]+$/, ""), { recursive: true }); writeFileSync(`${FX}/${f}`, "x\n"); }
const STATE = JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: SW + "\\workbench-core", added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] });
const SETTINGS = DATA + "\\settings.json";
const setTheme = (t) => writeFileSync(SETTINGS, JSON.stringify({ theme: t }, null, 2) + "\n");
process.env.APPDATA = SW + "\\appdata";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const { decodePng } = await import(pathToFileURL(REPO + "/tools/png.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const shotBuf = async (clip) => Buffer.from((await app.send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) })).data, "base64");
const shot = async (name, clip) => { const b = await shotBuf(clip); writeFileSync(`${OUT}/${name}.png`, b); return b; };
const center = (js) => ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, o = {}) => { const p = await center(js); if (!p) throw new Error("not found " + js); const n = o.dbl ? 2 : 1; const button = o.right ? "right" : "left"; const modifiers = o.ctrl ? 2 : 0; for (let c = 1; c <= n; c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { clickCount: c, button, modifiers }); await app.mouse("mouseReleased", p.x, p.y, { clickCount: c, button, modifiers }); } await app.sleep(500); };
const hover = async (js) => { const p = await center(js); if (!p) return; await app.mouse("mouseMoved", p.x, p.y); await app.sleep(300); };
const KEYS = { down: ["ArrowDown", "ArrowDown", 40], f2: ["F2", "F2", 113], n: ["n", "KeyN", 78], esc: ["Escape", "Escape", 27], enter: ["Enter", "Enter", 13] };
const press = async (combo) => {
  const parts = combo.split("+"); const [key, code, vk] = KEYS[parts.pop()];
  const modifiers = (parts.includes("ctrl") ? 2 : 0) | (parts.includes("alt") ? 1 : 0);
  await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers });
  if (key === "Enter") await app.send("Input.dispatchKeyEvent", { type: "char", text: "\r", key, code, windowsVirtualKeyCode: vk });
  await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers });
  await app.sleep(500);
};
const type = async (t) => { await app.send("Input.insertText", { text: t }); await app.sleep(300); };
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const row = (n) => `[...document.querySelectorAll('.tree-window .tree-row')].find(r=>r.querySelector('.tree-label')?.textContent.trim()===${JSON.stringify(n)})`;
const editRow = `document.querySelector('.tree-row.editing')`;
const rowInfo = (js) => ev(`(()=>{const r=${js};if(!r)return null;const l=r.querySelector('.tree-label'),i=r.querySelector('.tree-input'),cs=getComputedStyle(r),t=l||i;return {cls:r.className,color:cs.color,textColor:getComputedStyle(t).color,bg:cs.backgroundColor,border:cs.borderTopColor,fontSize:getComputedStyle(t).fontSize,fontFamily:getComputedStyle(t).fontFamily,fontWeight:getComputedStyle(t).fontWeight,iconColor:getComputedStyle(r.querySelector('.icon')).color,rowRect:(b=>({x:b.x,y:b.y,w:b.width,h:b.height}))(r.getBoundingClientRect())}})()`);
// Ink box of the glyphs in a row screenshot: pixels that differ from the row background (sampled near the right end).
const ink = (buf, x0) => {
  const { w, h, data } = decodePng(buf);
  const px = (x, y) => data.subarray((y * w + x) * 4, (y * w + x) * 4 + 3);
  const bg = px(w - 4, Math.floor(h / 2));
  let top = h, bot = -1, left = w, right = -1;
  for (let y = 2; y < h - 2; y++) for (let x = x0; x < w - 8; x++) {
    const p = px(x, y);
    if (Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) > 90) { top = Math.min(top, y); bot = Math.max(bot, y); left = Math.min(left, x); right = Math.max(right, x); }
  }
  return { top, bottom: bot, left, right, height: bot - top + 1 };
};
const rowShot = async (name, js) => {
  const r = await ev(`(()=>{const e=${js};const b=e.getBoundingClientRect();const t=e.querySelector('.tree-label,.tree-input').getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,textX:t.x-b.x}})()`);
  const buf = await shot(name, { x: r.x, y: r.y, width: r.width, height: r.height });
  return { rowY: r.y, textX: r.textX, ink: ink(buf, Math.max(0, Math.floor(r.textX) - 1)) };
};
const treeClip = () => ev(`(()=>{const b=document.querySelector('.project-panel').getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:Math.min(b.height,420)}})()`);
const away = () => hover(`document.querySelector('.title-left')`);

async function colors(theme) {
  setTheme(theme); await app.sleep(2500);
  const r = {};
  await away();
  r.normalFile = await rowInfo(row("python-extension.md"));
  r.normalFolder = await rowInfo(row("spec"));
  await hover(row("ambiguous.md")); r.hoverFile = await rowInfo(row("ambiguous.md"));
  await hover(row("docs")); r.hoverFolder = await rowInfo(row("docs"));
  await click(row("INDEX.md")); await away(); r.selectedFileFocused = await rowInfo(row("INDEX.md"));
  await click(row("zed-metrics.toml"), { ctrl: true }); await away(); r.markedCtrl = await rowInfo(row("zed-metrics.toml")); r.firstAfterCtrl = await rowInfo(row("INDEX.md"));
  await shot(`tree-${theme.replace(" ", "")}-multi`, await treeClip());
  await click(row("docs")); await click(row("docs")); await away(); // collapse and reopen: folder selected by a plain click
  r.selectedFolder = await rowInfo(row("docs")); r.prevAfterPlainClick = await rowInfo(row("INDEX.md"));
  r.activeTab = await ev(`document.querySelector('.tab.active, [role=tab][aria-selected=true]')?.textContent.trim()`);
  await press("down"); r.keyboardCursor = await ev(`(()=>{const r=document.querySelector('.tree-window .tree-row.selected');return r?{name:r.textContent.trim(),cls:r.className,textColor:getComputedStyle(r.querySelector('.tree-label')).color}:null})()`);
  await shot(`tree-${theme.replace(" ", "")}-folder-keyboard`, await treeClip());
  r.collapsedPath = await ev(`(()=>{const l=[...document.querySelectorAll('.tree-window .tree-label')].find(l=>l.textContent.includes('\\\\'));return l?{text:l.textContent,segments:l.querySelectorAll('.tree-segment').length,color:getComputedStyle(l).color}:null})()`);
  await click(row("python-extension.md")); await away();
  r.selectedFileFocused2 = await rowInfo(row("python-extension.md"));
  await shot(`tree-${theme.replace(" ", "")}`, await treeClip());
  return r;
}

try {
  setTheme("One Dark"); writeFileSync(DATA + "\\state.json", STATE);
  app = await launchApp(); await app.sleep(5000);
  log.window = await ev(`({w:window.outerWidth,h:window.outerHeight,iw:innerWidth,ih:innerHeight,dpr:devicePixelRatio})`);
  log.rows0 = await ev(`[...document.querySelectorAll('.tree-window .tree-label')].map(l=>l.textContent.trim())`);
  for (const f of ["docs", "spec"]) await click(row(f)).catch(() => {});
  await step("colors_OneDark", () => colors("One Dark"));
  await step("colors_OneLight", () => colors("One Light"));
  setTheme("One Dark"); await app.sleep(2500);

  await step("i1_rename", async () => {
    await click(row("gpui-vs-tauri.md")); await away();
    const before = await rowShot("i1-rename-before", row("gpui-vs-tauri.md"));
    const info0 = await rowInfo(row("gpui-vs-tauri.md"));
    await press("f2");
    const during = await rowShot("i1-rename-input", editRow);
    const info1 = await rowInfo(editRow);
    await ev(`(()=>{const i=document.querySelector('.tree-input');i.setSelectionRange(i.value.length,i.value.length)})()`); await type("x");
    const typed = await rowShot("i1-rename-typed", editRow);
    const value = await ev(`document.querySelector('.tree-input').value`);
    await press("esc");
    const cancelled = await ev(`({editing:!!document.querySelector('.tree-row.editing'),exists:!!(${row("gpui-vs-tauri.md")})})`);
    return { before, info0, during, info1, typed, value, cancelled };
  });
  await step("i1_newFile", async () => {
    await click(row("python-extension.md")); await away();
    const ref = await rowShot("i1-newfile-ref-row", row("python-extension.md"));
    await press("ctrl+n");
    const empty = await rowInfo(editRow);
    await type("python-extension.md"); // name taken -> error
    const err = await rowInfo(editRow); const errShot = await rowShot("i1-newfile-typed-error", editRow);
    await shot("i1-newfile-error", await treeClip());
    await ev(`(()=>{const i=document.querySelector('.tree-input');i.select()})()`);
    await type(" new.md"); const warn = await rowInfo(editRow); await shot("i1-newfile-warning", await treeClip());
    await press("esc");
    const afterEsc = await ev(`!!document.querySelector('.tree-row.editing')`);
    await click(row("python-extension.md")); await press("ctrl+n"); await type("new.md"); await press("enter");
    return { ref, empty, err, errShot, warn, afterEsc, created: existsSync(`${FX}/docs/new.md`) };
  });
  await step("i1_newFolder_ime", async () => {
    await click(row("python-extension.md")); await press("alt+n");
    const empty = await rowInfo(editRow);
    await app.send("Input.imeSetComposition", { text: "한", selectionStart: 1, selectionEnd: 1 }); await app.sleep(300);
    const composing = { ...(await rowShot("i1-newfolder-composing", editRow)), value: await ev(`document.querySelector('.tree-input').value`), editing: await ev(`!!document.querySelector('.tree-row.editing')`) };
    await app.send("Input.insertText", { text: "한글" }); await app.sleep(300);
    const value = await ev(`document.querySelector('.tree-input').value`);
    await press("enter");
    return { empty, composing, value, created: existsSync(`${FX}/docs/한글`) };
  });
  await step("sidebar_input", async () => {
    const item = `document.querySelector('.sidebar-item')`;
    const normal = await ev(`(()=>({item:getComputedStyle(document.querySelector('.sidebar-item')).fontSize,name:getComputedStyle(document.querySelector('.sidebar-item-name')).fontSize}))()`);
    await click(item, { right: true });
    const menu = await ev(`[...document.querySelectorAll('[role=menuitem], .menu-item')].map(e=>e.textContent.trim())`);
    await click(`[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/Rename/.test(e.textContent))`);
    const input = await ev(`(()=>{const i=document.querySelector('.sidebar-item .tree-input');return i?{fontSize:getComputedStyle(i).fontSize,color:getComputedStyle(i).color}:null})()`);
    await shot("sidebar-rename-input", await ev(`(()=>{const b=document.querySelector('.sidebar-item').getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}})()`));
    await press("esc");
    return { normal, menu, input };
  });
  await step("regress", async () => {
    const r = {};
    await click(row("INDEX.md")); await click(row("ambiguous.md"), { ctrl: true }); await away();
    r.multi = await ev(`[...document.querySelectorAll('.tree-window .tree-row.selected, .tree-window .tree-row.marked')].map(e=>e.textContent.trim())`);
    r.focusBorder = (await rowInfo(row("ambiguous.md"))).border;
    r.guides = await ev(`document.querySelectorAll('.tree-window .tree-guide').length`);
    await click(row("ambiguous.md"), { right: true });
    r.contextMenu = await ev(`[...document.querySelectorAll('[role=menuitem], .menu-item')].map(e=>e.textContent.trim()).slice(0,14)`);
    await shot("regress-context-menu");
    await press("esc");
    await click(row("specs\\v0.8\\orders"));
    r.collapsedSpecs = await ev(`[...document.querySelectorAll('.tree-window .tree-label')].map(l=>l.textContent.trim()).filter(t=>t.includes('\\\\'))`);
    await ev(`(()=>{const s=document.querySelector('.tree-scroll');s.scrollTop=400;s.dispatchEvent(new Event('scroll'))})()`); await app.sleep(800);
    r.sticky = await ev(`[...document.querySelectorAll('.tree-sticky > .tree-row')].map(e=>({t:e.textContent.trim(),color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}))`);
    await shot("regress-sticky", await treeClip());
    return r;
  });
  await step("about", async () => {
    await click(`document.querySelector('[aria-label="Open Application Menu"]')`);
    const help = `[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))`;
    if (await ev(`!!${help}`)) await click(help);
    await click(`[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))`); await app.sleep(1000);
    const about = await ev(`[...document.querySelectorAll('dialog, [role=dialog], .about')].map(d=>d.innerText.trim().split('\\n').slice(0,3).join(' | ')).filter(Boolean)`);
    await shot("about");
    return about;
  });
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(`${OUT}/v3.json`, JSON.stringify(log, null, 2)); console.log("done"); }

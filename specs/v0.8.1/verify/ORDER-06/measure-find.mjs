// ORDER-06 V3: I-9 preview find (Ctrl+F) — open/close per preview kind, toggles and counts, Korean, excluded text, math and
// Mermaid, next/prev scroll, refresh on source edit, regressions (editor find/replace, link, Outline, copy).
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-06";
const W = S + "/o6ws", WW = SW + "\\o6ws";
const DATA = S + "/appdata6/workbench-tauri";
const put = (f, t) => { mkdirSync((W + "/" + f).replace(/\/[^/]+$/, ""), { recursive: true }); writeFileSync(W + "/" + f, t); };
let filler = ""; for (let i = 0; i < 60; i++) filler += `Filler line ${i} without the word.\n\n`;
put("find.md", ["# Find Test", "", "[jump](#far-section)", "", "Apple apple applesauce APPLE and pineapple.", "", "한글 검색 문장입니다. 한글은 두 번.", "", "Body mentions python once.", "", "```python", "def fruit():", "    return 'banana'", "```", "", "$$", "x^2+1", "$$", "", "```mermaid", "graph TD; Alpha-->Beta", "```", "", filler, "## Far Section", "", "last apple here", ""].join("\n"));
put("find.ipynb", JSON.stringify({ cells: [{ cell_type: "code", metadata: {}, execution_count: 7, source: ["x = 'kiwi'"], outputs: [{ output_type: "stream", name: "stdout", text: ["kiwi printed\n"] }] }, { cell_type: "markdown", metadata: {}, source: ["## Notes on kiwi"] }], metadata: { language_info: { name: "python" } }, nbformat: 4, nbformat_minor: 5 }));
put("data.csv", "name,fruit\nann,apple\nbob,pear\n");
put("data.tsv", "name\tfruit\nann\tapple\n");
put("page.html", "<p>apple html</p>");
put("pic.svg", '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="5" y="20">apple</text></svg>');
put("d.mmd", "graph TD; apple-->pear");
writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = SW + "\\appdata6";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview6";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/" + n + ".png", Buffer.from(r.data, "base64")); };
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel)).slice(1, -1) + "]')";
const pt = (js, center) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+" + (center ? "r.width/2" : "Math.min(r.width/2,60)") + "),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, o = {}) => { const p = await pt(js, o.center); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (o.dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await sleep(o.wait ?? 700); };
const KEYS = { f: ["f", "KeyF", 70], h: ["h", "KeyH", 72], enter: ["Enter", "Enter", 13], esc: ["Escape", "Escape", 27], f3: ["F3", "F3", 114] };
const press = async (k, mod = 0) => { const [key, code, vk] = KEYS[k]; await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); if (k === "enter") await app.send("Input.dispatchKeyEvent", { type: "char", text: "\r", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk, modifiers: mod }); await sleep(500); };
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
const bar = preview + "?.querySelector('.preview-search')";
const state = () => ev(`(()=>{const p=${preview};const b=p?.querySelector('.preview-search');return {open:!!b&&!!b.offsetParent,count:b?.querySelector('.document-search-count')?.textContent??null,focused:!!b&&b.contains(document.activeElement),hl:CSS.highlights?.get('preview-find')?.size??null,cur:CSS.highlights?.get('preview-find-current')?.size??null,scrollTop:p?Math.round(p.scrollTop):null}})()`);
const setQuery = async (q) => { await ev(`(()=>{const i=${bar}.querySelector('input');i.focus();const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,${JSON.stringify(q)});i.dispatchEvent(new Event('input',{bubbles:true}))})()`); await sleep(500); return state(); };
const toggle = async (label) => { await click(`[...${bar}.querySelectorAll('button[aria-pressed]')].find(b=>/${label}/i.test(b.getAttribute('aria-label')||b.title||''))`, { center: true }); return state(); };
const openPreview = async (f) => { await click(row(f), { dbl: true }); await sleep(1200); await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)").catch(() => {}); await sleep(2000); };
const focusPreview = async () => { await ev(preview + "?.focus()"); await sleep(300); };
try {
  app = await launchApp(); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  await openPreview("find.md");
  if (process.argv[2] === "pane") {
    await focusPreview(); await press("f", 2); log.before = await setQuery("apple");
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='find.md')");
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent)[0]");
    await app.send("Input.insertText", { text: " apple apple " }); await sleep(1500);
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='Preview find.md')"); await sleep(2000);
    log.after = await state();
    log.previewApples = await ev(preview + ".querySelector('.markdown-body').textContent.match(/apple/gi)?.length");
    await press("esc");
    execFileSync("pwsh", ["-NoProfile", "-Command", "Set-Clipboard -Value 'x'"]);
    await click(preview + ".querySelector('.code-block .code-block-copy')", { center: true }); await sleep(600);
    log.copyBarClosed = execFileSync("pwsh", ["-NoProfile", "-Command", "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-Clipboard -Raw"], { encoding: "utf8" }).trim();
    // Outline jump with the find bar open (INTENT.md: several headings)
    await openPreview("INTENT.md"); await focusPreview(); await press("f", 2); await setQuery("Zed");
    await click("document.querySelector('.status-bar [aria-label=\"Outline\"]')");
    const target = await ev("[...document.querySelectorAll('.outline-list .tree-label')].map(l=>l.textContent)[3]");
    await click("(()=>{const l=[...document.querySelectorAll('.outline-list .tree-label')][3];l?.scrollIntoView({block:'center'});return l})()"); await sleep(900);
    log.outlineWithBar = { target, ...(await ev(`(()=>{const p=${preview};const b=p.querySelector('.preview-search');const h=[...p.querySelectorAll('h1,h2,h3')].find(x=>x.textContent.trim()===${JSON.stringify("__T__")}.replace('__T__',''))||[...p.querySelectorAll('h1,h2,h3')].find(x=>x.textContent.trim()==='" + "' );return null})()`)) };
    log.outlineWithBar2 = await ev(`(()=>{const p=${preview};const b=p.querySelector('.preview-search').getBoundingClientRect();const hs=[...p.querySelectorAll('h1,h2,h3')];const h=hs.find(x=>x.textContent.trim()===${JSON.stringify(target ?? "")});const r=h?.getBoundingClientRect();return {barBottom:Math.round(b.bottom),headingTop:r?Math.round(r.top):null,scrollTop:Math.round(p.scrollTop),below:r?r.top>=b.bottom-1:null,gap:r?Math.round(r.top-b.bottom):null}})()`);
    await shot("c9-outline-with-bar");
    throw new Error("pane run done");
  }
  if (process.argv[2] === "hl") {
    const texts = () => ev("(()=>{const g=(n)=>[...(CSS.highlights.get(n)||[])].map(r=>r.toString());return {all:g('preview-find'),cur:g('preview-find-current'),labels:[...document.querySelectorAll('.preview-search button[aria-pressed]')].map(b=>b.getAttribute('aria-label')+'='+b.getAttribute('aria-pressed'))}})()");
    await focusPreview(); await press("f", 2);
    log.q1 = { s: await setQuery("apple"), t: await texts() };
    log.q2 = { s: await setQuery("python"), t: await texts() };
    await press("esc"); log.closed = { s: await state(), t: await texts() };
    // side by side: View menu Open Preview to the Side from the editor tab
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='find.md')");
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent)[0]");
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('View'))");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith('Open Preview to the Side'))"); await sleep(2000);
    log.panes = await ev("[...document.querySelectorAll('.pane')].map(p=>[...p.querySelectorAll('.tab .tab-title')].map(t=>t.textContent.trim()))");
    await focusPreview(); await press("f", 2); log.sideBefore = await setQuery("apple");
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent)[0]");
    await app.send("Input.insertText", { text: " apple apple " }); await sleep(2000);
    log.sideAfter = await state();
    await shot("c8-side-by-side");
    throw new Error("hl run done");
  }
  await step("c5_md_open", async () => { await focusPreview(); await press("f", 2); const s = await state(); await shot("c5-md-bar"); return s; });
  await step("c6_toggles", async () => {
    const r = { apple: await setQuery("apple") };
    r.matchCase = await toggle("case"); r.matchCaseOff = await toggle("case");
    r.word = await toggle("word"); r.wordOff = await toggle("word");
    r.regexOn = await toggle("Regular"); r.regexQuery = await setQuery("app.e"); r.regexOff = await toggle("Regular");
    r.korean = await setQuery("한글");
    await shot("c6-korean");
    return r;
  });
  await step("c7_scope", async () => ({ python: await setQuery("python"), banana: await setQuery("banana"), math: await setQuery("x2"), mermaid: await setQuery("Alpha"), mermaidSvgText: await ev(`${preview}.querySelectorAll('svg text, svg foreignObject').length`) }));
  await step("c6_next_prev", async () => {
    const r = { start: await setQuery("apple") };
    await ev(`${bar}.querySelector('input').focus()`);
    const seq = [];
    for (let i = 0; i < 6; i++) { await press("enter"); seq.push(await state()); }
    r.enterSeq = seq.map((s) => s.count + "@" + s.scrollTop);
    await press("enter", 8); r.shiftEnter = await state();
    await shot("c6-next-far");
    return r;
  });
  await step("c5_esc", async () => { await press("esc"); return state(); });
  await step("c8_refresh", async () => {
    // editor tab of find.md with the preview: type a new "apple" in the editor and look at the preview bar count
    await focusPreview(); await press("f", 2); const before = await setQuery("apple");
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='find.md')");
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent)[0]");
    await app.send("Input.insertText", { text: " apple apple " }); await sleep(1500);
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='Preview find.md')"); await sleep(1500);
    const after = await state();
    return { before, after };
  });
  if (process.argv[2] === "md") { log.skipKinds = true; } else await step("c5_kinds", async () => {
    const r = {};
    for (const f of ["find.ipynb", "data.csv", "data.tsv", "page.html", "pic.svg", "d.mmd"]) {
      await openPreview(f); await focusPreview().catch(() => {}); await press("f", 2); await sleep(400);
      r[f] = await state();
      if (f === "find.ipynb") { r.ipynbCount7 = await setQuery("[7]"); r.ipynbKiwi = await setQuery("kiwi"); }
      if (r[f].open) await press("esc");
    }
    return r;
  });
  await step("c9_regress", async () => {
    const r = {};
    // editor find + replace in the find.md editor tab
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='find.md')");
    await click("[...document.querySelectorAll('.cm-line')].filter(e=>e.offsetParent)[0]");
    await press("f", 2); r.editorFind = await ev("!!document.querySelector('.cm-panels-top .document-search')");
    await press("h", 2); r.editorReplace = await ev("!![...document.querySelectorAll('.cm-panels-top .document-search input')].find(i=>/replace/i.test(i.getAttribute('aria-label')||i.placeholder||''))");
    await press("esc");
    // link click in the preview
    await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title').textContent.trim()==='Preview find.md')");
    await ev(preview + ".scrollTop=0"); await sleep(300);
    await click(preview + ".querySelector('a[href=\"#far-section\"]')"); await sleep(1000);
    r.headingIds = await ev(`[...${preview}.querySelectorAll("h1,h2")].map(h=>h.id||"(no id)")`);
    r.linkScroll = await ev(`(()=>{const p=${preview};const h=[...p.querySelectorAll('h2')].find(x=>/Far Section/.test(x.textContent));return {top:Math.round(h.getBoundingClientRect().top-p.getBoundingClientRect().top),scrollTop:Math.round(p.scrollTop)}})()`);
    // Outline click with the find bar open: heading should stay visible under the bar
    await ev(preview + ".scrollTop=0"); await focusPreview(); await press("f", 2);
    await click("document.querySelector('.status-bar [aria-label=\"Outline\"]')");
    await click("(()=>{const l=[...document.querySelectorAll('.outline-list .tree-label')].find(l=>l.textContent==='Far Section');l?.scrollIntoView({block:'center'});return l})()"); await sleep(900);
    r.outlineWithBar = await ev(`(()=>{const p=${preview};const b=p.querySelector('.preview-search');const h=[...p.querySelectorAll('h2')].find(x=>/Far Section/.test(x.textContent));const hb=h.getBoundingClientRect(),bb=b?.getBoundingClientRect();return {headingTop:Math.round(hb.top),barBottom:bb?Math.round(bb.bottom):null,hiddenUnderBar:!!bb&&b.offsetParent&&hb.top<bb.bottom}})()`);
    await shot("c9-outline-with-bar");
    await click("document.querySelector('.status-bar [aria-label=\"Close Outline\"]')");
    // code block copy still works
    execFileSync("pwsh", ["-NoProfile", "-Command", "Set-Clipboard -Value 'x'"]);
    await click(preview + ".querySelector('.code-block .code-block-copy')", { center: true }); await sleep(600);
    r.copy = execFileSync("pwsh", ["-NoProfile", "-Command", "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-Clipboard -Raw"], { encoding: "utf8" }).trim();
    return r;
  });
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(OUT + "/v3-find" + (process.argv[2] ? "-" + process.argv[2] : "") + ".json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log).slice(0, 4000)); }

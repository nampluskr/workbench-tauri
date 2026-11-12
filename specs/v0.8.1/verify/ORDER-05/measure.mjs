// v0.8.1 ORDER-05 V3: code fonts and sizes (I-10), code block shading (I-11), header and copy (I-12), licenses.
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-05";
const W = S + "/o5ws", WW = SW + "\\o5ws";
const DATA = S + "/appdata5/workbench-tauri";
rmSync(W, { recursive: true, force: true }); rmSync(OUT, { recursive: true, force: true }); rmSync(S + "/appdata5", { recursive: true, force: true });
mkdirSync(OUT, { recursive: true }); mkdirSync(DATA, { recursive: true }); mkdirSync(OUT + "/themes", { recursive: true });
const put = (f, t) => { mkdirSync((W + "/" + f).replace(/\/[^/]+$/, ""), { recursive: true }); writeFileSync(W + "/" + f, t); };
const PY = "def greet(name):\n\t# 한글 주석입니다\n\treturn f\"hi {name}\"\n";
put("doc.md", ["# Code", "", "Inline `code` here.", "", "```python", PY + "```", "", "```", "plain fence", "```", "", "    indented block", "", "```mermaid", "graph TD; A-->B", "```", "", "$$", "x^2", "$$", "", "## Later", "", "end", ""].join("\n"));
put("nb.ipynb", JSON.stringify({ cells: [
  { cell_type: "code", metadata: {}, execution_count: 3, source: ["print('hi')\n", "# 주석"], outputs: [{ output_type: "stream", name: "stdout", text: ["hi\n"] }, { output_type: "error", ename: "ValueError", evalue: "bad", traceback: ["ValueError: bad"] }] },
], metadata: { kernelspec: { language: "python", name: "python3", display_name: "Python 3" }, language_info: { name: "python" } }, nbformat: 4, nbformat_minor: 5 }, null, 1));
put("long.ts", "const a = 1; // " + "x".repeat(70) + " end\nconst b = 2;\n");
const SETTINGS = DATA + "/settings.json";
const writeSettings = (obj) => writeFileSync(SETTINGS, JSON.stringify(obj, null, 2) + "\n");
writeSettings({ theme: "One Dark" });
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = SW + "\\appdata5";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview5";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const shot = async (n, clip) => { const r = await app.send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) }); writeFileSync(OUT + "/" + n + ".png", Buffer.from(r.data, "base64")); };
const P = (rel) => WW + "\\" + rel.replace(/\//g, "\\");
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(P(rel))).slice(1, -1) + "]')";
const pt = (js, center) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+" + (center ? "r.width/2" : "Math.min(r.width/2,60)") + "),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, o = {}) => { const p = await pt(js, o.center); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (o.dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await sleep(o.wait ?? 700); };
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
const fam = (js) => "(e=>e?getComputedStyle(e).fontFamily:null)(" + js + ")";
const size = (js) => "(e=>e?getComputedStyle(e).fontSize:null)(" + js + ")";
const editor = "[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent)";
const fonts = () => ev(`({editor:${fam(editor + "?.querySelector('.cm-content')")},pre:${fam(preview + "?.querySelector('.code-block > pre')")},preSize:${size(preview + "?.querySelector('.code-block > pre')")},body:${size(preview + "?.querySelector('p')")},inline:${fam(preview + "?.querySelector(':not(pre) > code')")},inlineSize:${size(preview + "?.querySelector(':not(pre) > code')")},var:getComputedStyle(document.documentElement).getPropertyValue('--preview-code-font-size').trim()})`);
const openPreviewBtn = "[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)";
const tabByTitle = (t) => "[...document.querySelectorAll('.pane .tab')].find(x=>x.querySelector('.tab-title').textContent.trim()===" + JSON.stringify(t) + ")";
// rendered font of a node: CSS.getPlatformFontsForNode
const platformFonts = async (js) => {
  await app.send("DOM.enable"); await app.send("CSS.enable");
  const { root } = await app.send("DOM.getDocument", { depth: -1 });
  const { result } = await app.send("Runtime.evaluate", { expression: js });
  if (!result.objectId) return null;
  const { nodeId } = await app.send("DOM.requestNode", { objectId: result.objectId });
  const r = await app.send("CSS.getPlatformFontsForNode", { nodeId });
  return r.fonts.map((f) => f.familyName + ":" + f.glyphCount);
};
const koreanSpan = (scope) => "(()=>{const w=document.createTreeWalker(" + scope + ",NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(/한글|주석/.test(n.textContent))return n.parentElement;return null})()";
try {
  app = await launchApp(); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  await app.send("Network.enable");
  const requests = []; app.on((m) => { if (m.method === "Network.requestWillBeSent") requests.push(m.params.request.url); });
  log.window = await ev("({w:outerWidth,h:outerHeight,dpr:devicePixelRatio})");
  await click(row("doc.md"), { dbl: true }); await sleep(1500);
  log.c2_defaults_editor = await ev(`({editor:${fam(editor + "?.querySelector('.cm-content')")}})`);
  await click(openPreviewBtn); await sleep(2000);
  await step("c2_defaults", () => fonts());
  await shot("c2-preview-default");
  await step("c4_scope", async () => {
    const r = { breadcrumb: await ev(fam("document.querySelector('.breadcrumbs, .breadcrumb')")) };
    await click(tabByTitle("doc.md")); await sleep(500);
    r.breadcrumbEditor = await ev(fam("[...document.querySelectorAll('.breadcrumbs, .breadcrumb')].find(e=>e.offsetParent)"));
    await click("document.querySelector('.status-bar [aria-label=\"Search\"]')"); await sleep(500);
    await ev("(()=>{const i=[...document.querySelectorAll('.project-search')].find(e=>e.offsetParent).querySelector('input[aria-label=\"Search\"]');const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,'doc');i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))})()"); await sleep(1500);
    r.searchName = await ev(fam("[...document.querySelectorAll('.search-file-name')].find(e=>e.offsetParent)"));
    r.searchDir = await ev(fam("[...document.querySelectorAll('.search-file-dir')].find(e=>e.offsetParent)"));
    return r;
  });
  await step("c4_ipynb", async () => {
    await click(row("nb.ipynb"), { dbl: true }); await sleep(1200);
    await click(openPreviewBtn); await sleep(2500);
    const r = await ev(`(()=>{const p=${preview};const q=(s)=>p.querySelector(s);return {cell:${fam("q('.nb-code .code-block > pre, .nb-code pre')")},cellSize:${size("q('.nb-code .code-block > pre, .nb-code pre')")},output:${fam("q('.nb-output pre, .nb-output')")},errorTitle:${fam("q('.nb-error-title')")},traceback:${fam("q('.nb-traceback')")},count:${fam("q('.nb-count')")},countText:q('.nb-count')?.textContent,header:!!q('.nb-code .code-block-header'),headerLang:q('.nb-code .code-block-language')?.textContent,outputHeaders:p.querySelectorAll('.nb-output .code-block-header').length}})()`);
    await shot("c4-ipynb");
    return r;
  });
  await step("c9_headers", async () => {
    await click(tabByTitle("Preview doc.md")); await sleep(800);
    return ev(`(()=>{const p=${preview};return {blocks:[...p.querySelectorAll('.code-block')].map(b=>({lang:b.querySelector('.code-block-language')?.textContent??null,copy:!!b.querySelector('.code-block-copy'),aria:b.querySelector('.code-block-copy')?.getAttribute('aria-label'),first:b.querySelector('pre')?.textContent.slice(0,15)})),mermaid:{svg:!!p.querySelector('.mermaid-diagram svg, svg[id^=mermaid]'),header:!!p.querySelector('.mermaid-diagram .code-block-header')},math:{rendered:!!p.querySelector('.katex, .math-display'),header:!!p.querySelector('.math-display .code-block-header')},headerBox:(h=>h?{h:h.getBoundingClientRect().height,font:getComputedStyle(h).fontSize,color:getComputedStyle(h).color}:null)(p.querySelector('.code-block-header'))}})()`);
  });
  await step("c10_copy", async () => {
    execFileSync("pwsh", ["-NoProfile", "-Command", "Set-Clipboard -Value 'before'"]);
    await click(preview + ".querySelector('.code-block .code-block-copy')", { center: true }); await sleep(600);
    const afterIcon = await ev(preview + ".querySelector('.code-block .code-block-copy').getAttribute('aria-label')");
    const clip = execFileSync("pwsh", ["-NoProfile", "-Command", "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-Clipboard -Raw"], { encoding: "utf8" }).replace(/\r?\n$/, "");
    await sleep(2300);
    const backIcon = await ev(preview + ".querySelector('.code-block .code-block-copy').getAttribute('aria-label')");
    // keyboard: focus the button, Enter
    execFileSync("pwsh", ["-NoProfile", "-Command", "Set-Clipboard -Value 'before2'"]);
    await ev(preview + ".querySelector('.code-block .code-block-copy').focus()");
    await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await app.send("Input.dispatchKeyEvent", { type: "char", text: "\r", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await sleep(800);
    const clipKey = execFileSync("pwsh", ["-NoProfile", "-Command", "[Console]::OutputEncoding=[Text.Encoding]::UTF8; Get-Clipboard -Raw"], { encoding: "utf8" }).replace(/\r?\n$/, "");
    const norm = (t) => t.replace(/\r\n/g, "\n");
    return { expected: PY, clip, equal: norm(clip) === PY || norm(clip) + "\n" === PY, afterIcon, backIcon, keyboardEqual: norm(clipKey) === norm(clip), clipKeyStart: clipKey.slice(0, 12) };
  });
  await step("c8_shading", async () => {
    const r = {};
    for (const t of ["One Dark", "One Light", "Catppuccin Latte", "Catppuccin Frappé", "Catppuccin Macchiato", "Catppuccin Mocha", "Catppuccin Latte - No Italics", "Catppuccin Frappé - No Italics", "Catppuccin Macchiato - No Italics", "Catppuccin Mocha - No Italics", "macOS Classic Light", "macOS Classic Dark", "Ayu Dark", "Ayu Light", "Ayu Mirage", "Gruvbox Dark", "Gruvbox Dark Hard", "Gruvbox Dark Soft", "Gruvbox Light", "Gruvbox Light Hard", "Gruvbox Light Soft"]) {
      writeSettings({ theme: t, preview_theme: t }); await sleep(1800);
      r[t] = await ev(`(()=>{const p=${preview};const b=p.querySelector('.code-block');return {block:getComputedStyle(b).backgroundColor,page:getComputedStyle(p).backgroundColor,body:getComputedStyle(p.querySelector('.markdown-body')||p).backgroundColor}})()`);
      const clip = await ev(`(()=>{const b=${preview}.querySelector('.code-block').getBoundingClientRect();return {x:Math.max(0,b.x-20),y:Math.max(0,b.y-30),width:Math.min(560,b.width+40),height:b.height+60}})()`);
      await shot("themes/" + t.replace(/[^A-Za-z0-9]+/g, "-"), clip);
    }
    writeSettings({ theme: "One Dark" }); await sleep(1800);
    return r;
  });
  await step("c3_fonts", async () => {
    const r = {};
    for (const f of ["JetBrains Mono", "Hack", "Ubuntu Mono", "D2Coding", "Lilex"]) {
      writeSettings({ theme: "One Dark", buffer_font_family: f, preview_code_font_family: f }); await sleep(2500);
      r[f] = { ...(await fonts()), previewKorean: await platformFonts(koreanSpan(preview + ".querySelector('.code-block pre')")) };
      await shot("c3-font-" + f.replace(/ /g, "-"));
    }
    writeSettings({ theme: "One Dark", preview_font_size: 20, preview_code_font_size: 85 }); await sleep(2000);
    r.previewSize20 = await fonts();
    writeSettings({ theme: "One Dark", preview_code_font_size: 120 }); await sleep(2000);
    r.code120 = await fonts();
    writeSettings({ theme: "One Dark" }); await sleep(2000);
    return r;
  });
  await step("c5_korean_editor", async () => {
    await click(tabByTitle("doc.md")); await sleep(800);
    const r = {};
    for (const f of ["JetBrains Mono", "D2Coding"]) { writeSettings({ theme: "One Dark", buffer_font_family: f }); await sleep(2500); r[f] = await platformFonts(koreanSpan(editor)); }
    writeSettings({ theme: "One Dark" }); await sleep(1500);
    return r;
  });
  await step("c6_long_line", async () => {
    await click(row("long.ts"), { dbl: true }); await sleep(1200);
    const r = {};
    for (const f of ["Ubuntu Mono", "JetBrains Mono"]) {
      writeSettings({ theme: "One Dark", buffer_font_family: f }); await sleep(2500);
      const line = await ev(`(()=>{const l=[...${editor}.querySelectorAll('.cm-line')][0];const rg=document.createRange();rg.selectNodeContents(l);const rs=rg.getClientRects();const last=rs[rs.length-1];return {x:Math.round(last.right-2),y:Math.round(last.top+last.height/2),len:l.textContent.length}})()`);
      await app.mouse("mouseMoved", line.x, line.y); await app.mouse("mousePressed", line.x, line.y, { button: "left", clickCount: 1 }); await app.mouse("mouseReleased", line.x, line.y, { button: "left", clickCount: 1 }); await sleep(500);
      r[f] = { ...line, status: await ev("document.querySelector('.status-items span')?.textContent"), gutter: await ev("getComputedStyle(document.documentElement).getPropertyValue('--editor-gutter-margin').trim()"), lineHeight: await ev(`getComputedStyle(${editor}.querySelector('.cm-line')).height`) };
    }
    writeSettings({ theme: "One Dark" }); await sleep(1500);
    r.fontRequests = requests.filter((u) => /font|woff|ttf/i.test(u)).map((u) => u.replace(/^.*?\/\/([^/]+).*\/([^/]+)$/, "$1 .../$2"));
    r.externalRequests = requests.filter((u) => !/^(https?:\/\/(tauri|ipc|asset)\.localhost|data:|blob:|about:)/.test(u));
    return r;
  });
  await step("c7_bad_values", async () => {
    writeSettings({ theme: "One Dark", buffer_font_family: "Comic Sans", preview_code_font_family: 42, preview_code_font_size: 999 }); await sleep(2500);
    await click(tabByTitle("Preview doc.md")); await sleep(800);
    return { ...(await fonts()), alive: await ev("1+1") };
  });
  await step("c11_regress", async () => {
    writeSettings({ theme: "One Dark" }); await sleep(1500);
    const r = {};
    r.syntaxSpans = await ev(preview + ".querySelectorAll('.code-block pre code span[class*=cm-syntax]').length");
    // outline click still puts the heading at the top: open Outline, click "Later"
    await click("document.querySelector('.status-bar [aria-label=\"Outline\"]')");
    await click("[...document.querySelectorAll('.outline-list .tree-label')].find(l=>l.textContent==='Later')"); await sleep(800);
    r.outlineHeading = await ev(`(()=>{const p=${preview};const h=[...p.querySelectorAll('h2')].find(x=>x.textContent.trim()==='Later');return {top:Math.round(h.getBoundingClientRect().top-p.getBoundingClientRect().top),scrollTop:Math.round(p.scrollTop),canScroll:p.scrollHeight>p.clientHeight}})()`);
    // block click -> editor line (preview block click moves the source cursor)
    await click(preview + ".querySelector('.code-block pre')"); await sleep(800);
    r.blockActive = await ev(preview + ".querySelector('.code-block')?.classList.contains('active-block')");
    await click(tabByTitle("doc.md")); await sleep(600);
    r.editorLine = await ev(`${editor}.querySelector('.cm-activeLine')?.textContent`);
    await click("document.querySelector('.status-bar [aria-label=\"Close Outline\"]')");
    return r;
  });
  await step("c12_licenses", async () => {
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))").catch(() => {});
    await click("[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))"); await sleep(1000);
    const list = await ev("[...document.querySelectorAll('.about-attributions li')].map(l=>l.textContent).filter(t=>/JetBrains|Hack|Ubuntu|D2Coding/.test(t))");
    await shot("c12-about");
    await click("[...document.querySelectorAll('.about-buttons button')].find(b=>b.textContent==='View All Licenses')"); await sleep(1500);
    const text = await ev("[...document.querySelectorAll('.cm-content, .licenses, pre')].map(e=>e.textContent).join('\\n')");
    return { aboutList: list, licensesHas: { jetbrains: /JetBrains Mono/.test(text), hack: /Hack/.test(text) && /Bitstream Vera/.test(text), ubuntu: /UBUNTU FONT LICENCE/.test(text), d2coding: /D2Coding/.test(text) }, licensesLen: text.length };
  });
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(OUT + "/v3.json", JSON.stringify(log, null, 2)); console.log("done"); }

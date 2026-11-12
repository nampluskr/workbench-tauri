// ORDER-05 V3 follow-up: editor font per choice (#3), Outline heading scroll with code block headers (#11), CSV/HTML/SVG
// previews and editor Ctrl+= (#11), View All Licenses text (#12).
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-05";
const W = S + "/o5ws", WW = SW + "\\o5ws";
const DATA = S + "/appdata5/workbench-tauri";
const put = (f, t) => { mkdirSync((W + "/" + f).replace(/\/[^/]+$/, ""), { recursive: true }); writeFileSync(W + "/" + f, t); };
let big = ""; for (let i = 0; i < 40; i++) big += `## Part ${i}\n\nSome text for part ${i}.\n\n\`\`\`js\nconst v${i} = ${i};\nconsole.log(v${i});\n\`\`\`\n\n`;
put("long.md", big);
put("data.csv", "a,b\n1,2\n3,4\n");
put("page.html", "<h1>Hello</h1><p>html</p>");
put("pic.svg", '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="red"/></svg>');
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
const shot = async (n) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/" + n + ".png", Buffer.from(r.data, "base64")); };
const P = (rel) => WW + "\\" + rel.replace(/\//g, "\\");
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(P(rel))).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, dbl) => { const p = await pt(js); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await sleep(700); };
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const editor = "[...document.querySelectorAll('.cm-editor')].find(e=>e.offsetParent)";
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
const openPreviewBtn = "[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)";
const tabByTitle = (t) => "[...document.querySelectorAll('.pane .tab')].find(x=>x.querySelector('.tab-title').textContent.trim()===" + JSON.stringify(t) + ")";
try {
  app = await launchApp(); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  await click(row("long.md"), true); await sleep(1500);
  await step("c3_editor_fonts", async () => {
    const r = {};
    for (const f of ["JetBrains Mono", "Hack", "Ubuntu Mono", "D2Coding", "Lilex"]) {
      writeSettings({ theme: "One Dark", buffer_font_family: f }); await sleep(2500);
      r[f] = await ev(`(()=>{const c=${editor}.querySelector('.cm-content');return {family:getComputedStyle(c).fontFamily,size:getComputedStyle(c).fontSize,lineHeight:getComputedStyle(c.querySelector('.cm-line')).height}})()`);
      await shot("c3-editor-" + f.replace(/ /g, "-"));
    }
    writeSettings({ theme: "One Dark" }); await sleep(1500);
    return r;
  });
  await step("c11_ctrl_plus", async () => {
    await click(editor + ".querySelector('.cm-line')");
    const before = await ev(`getComputedStyle(${editor}.querySelector('.cm-content')).fontSize`);
    await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "=", code: "Equal", windowsVirtualKeyCode: 187, modifiers: 2 }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: "=", code: "Equal", windowsVirtualKeyCode: 187, modifiers: 2 }); await sleep(800);
    const after = await ev(`getComputedStyle(${editor}.querySelector('.cm-content')).fontSize`);
    return { before, after, family: await ev(`getComputedStyle(${editor}.querySelector('.cm-content')).fontFamily`) };
  });
  await step("c11_outline_scroll", async () => {
    await click(openPreviewBtn); await sleep(2000);
    await click("document.querySelector('.status-bar [aria-label=\"Outline\"]')");
    const r = {};
    for (const h of ["Part 25", "Part 10"]) {
      await click("(()=>{const l=[...document.querySelectorAll('.outline-list .tree-label')].find(l=>l.textContent===" + JSON.stringify(h) + ");l?.scrollIntoView({block:'center'});return l})()"); await sleep(900);
      r[h] = await ev(`(()=>{const p=${preview};const x=[...p.querySelectorAll('h2')].find(e=>e.textContent.trim()===${JSON.stringify(h)});return {top:Math.round(x.getBoundingClientRect().top-p.getBoundingClientRect().top),scrollTop:Math.round(p.scrollTop),headers:p.querySelectorAll('.code-block-header').length}})()`);
    }
    await shot("c11-outline-scroll");
    await click("document.querySelector('.status-bar [aria-label=\"Close Outline\"]')");
    return r;
  });
  await step("c11_other_previews", async () => {
    const r = {};
    for (const f of ["data.csv", "page.html", "pic.svg"]) {
      await click(row(f), true); await sleep(1200);
      await click(openPreviewBtn).catch((e) => (r[f + "_err"] = e.message)); await sleep(2000);
      r[f] = await ev("(()=>{const p=" + preview + ";return p?{table:!!p.querySelector('table'),iframe:!!p.querySelector('iframe'),img:!!p.querySelector('img,svg'),headers:p.querySelectorAll('.code-block-header').length}:null})()");
    }
    await shot("c11-svg-preview");
    return r;
  });
  await step("c12_licenses_text", async () => {
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))").catch(() => {});
    await click("[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))"); await sleep(1000);
    await click("[...document.querySelectorAll('.about-buttons button')].find(b=>b.textContent==='View All Licenses')"); await sleep(2000);
    const text = await ev(`(()=>{const c=${editor}?.querySelector('.cm-content');const v=c?.cmView?.view;return v?v.state.doc.toString():(c?.textContent||'')})()`);
    const tab = await ev("document.querySelector('.pane .tab.active .tab-title')?.textContent.trim()");
    const lines = (re) => text.split("\n").filter((l) => re.test(l)).slice(0, 3);
    await shot("c12-licenses");
    return { tab, length: text.length, jetbrains: lines(/JetBrains Mono/), hack: lines(/Hack|Bitstream Vera/), ubuntu: lines(/UBUNTU FONT LICENCE/), d2coding: lines(/D2Coding/) };
  });
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(OUT + "/v3-b.json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log).slice(0, 3000)); }

// ORDER-05 V3 after K-05-R1: first code block margin 0 (M-1), header not selectable (R-2), font licenses in View All Licenses (#12).
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-05";
const W = S + "/o5ws", WW = SW + "\\o5ws";
const DATA = S + "/appdata5/workbench-tauri";
mkdirSync(W, { recursive: true });
writeFileSync(W + "/first.md", "```python\nprint('first')\n```\n\ntext\n\n```js\nlet second = 2;\n```\n");
writeFileSync(DATA + "/settings.json", JSON.stringify({ theme: "One Dark" }) + "\n");
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
process.env.APPDATA = SW + "\\appdata5";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview5";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const sleep = (ms) => app.sleep(ms);
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel)).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, dbl) => { const p = await pt(js); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await sleep(700); };
const step = async (name, fn) => { try { log[name] = await fn(); } catch (e) { log[name] = "ERR " + e.message; } };
const preview = "[...document.querySelectorAll('.markdown-preview')].find(e=>e.offsetParent)";
try {
  app = await launchApp(); await sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await sleep(600);
  await step("m1_first_block", async () => {
    await click(row("first.md"), true); await sleep(1200);
    await click("[...document.querySelectorAll('button[aria-label=\"Open Preview\"]')].find(e=>e.offsetParent)"); await sleep(2000);
    const r = await ev(`(()=>{const p=${preview};const b=[...p.querySelectorAll('.code-block')];const body=p.querySelector('.markdown-body');return {first:getComputedStyle(b[0]).marginTop,second:getComputedStyle(b[1]).marginTop,firstTopFromBody:Math.round(b[0].getBoundingClientRect().top-body.getBoundingClientRect().top),headerUserSelect:getComputedStyle(p.querySelector('.code-block-header')).userSelect}})()`);
    const s = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/m1-first-code-block.png", Buffer.from(s.data, "base64"));
    return r;
  });
  await step("c12_licenses_scan", async () => {
    await click("document.querySelector('[aria-label=\"Open Application Menu\"]')");
    await click("[...document.querySelectorAll('.menu-name, [role=menuitem]')].find(e=>/^Help/.test(e.textContent.trim()))").catch(() => {});
    await click("[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/About/.test(e.textContent))"); await sleep(1000);
    await click("[...document.querySelectorAll('.about-buttons button')].find(b=>b.textContent==='View All Licenses')"); await sleep(2500);
    const markers = { "/fonts/jetbrains-mono/OFL.txt": 0, "/fonts/hack/LICENSE.md": 0, "/fonts/ubuntu-mono/LICENCE.txt": 0, "/fonts/ubuntu-mono/copyright.txt": 0, "/fonts/d2coding/OFL.txt": 0, "JetBrains Mono Project Authors": 0, "Bitstream Vera": 0, "UBUNTU FONT LICENCE": 0, "NAVER Corporation": 0 };
    const scroller = "[...document.querySelectorAll('.cm-scroller')].find(e=>e.offsetParent)";
    const total = await ev(scroller + ".scrollHeight");
    for (let y = 0; y <= total; y += 500) {
      await ev(scroller + ".scrollTop=" + y); await sleep(40);
      const seen = await ev(`[...${scroller}.querySelectorAll('.cm-line')].map(l=>l.textContent).join('\\n')`);
      for (const m of Object.keys(markers)) if (seen.includes(m)) markers[m]++;
    }
    return { tab: await ev("document.querySelector('.pane .tab.active .tab-title')?.textContent.trim()"), scrollHeight: total, found: markers };
  });
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(OUT + "/v3-c.json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log)); }

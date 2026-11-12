// ORDER-03 #8 check: ORDER-02 tree file dropped onto a tab still opens before that tab (lock off and lock on).
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\"); const WW = SW + "\\o3ws"; const DATA = S + "/appdata3/workbench-tauri";
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-03";
process.env.APPDATA = SW + "\\appdata3"; process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview3";
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 }, lock_preview: false }] }));
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {}; let app;
const ev = (js) => app.evaluate(js);
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel.replace(/\//g, "\\"))).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, dbl) => { const p = await pt(js); for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await app.sleep(700); };
const tabs = () => ev("[...document.querySelectorAll('.pane')].map(p=>[...p.querySelectorAll('.tab')].map(t=>t.querySelector('.tab-title').textContent.trim()+(t.classList.contains('preview')?'*':'')+(t.classList.contains('active')?'!':'')))");
const drag = async (fromJs, toJs) => {
  const a = await pt(fromJs), b = await pt(toJs);
  await app.mouse("mouseMoved", a.x, a.y); await app.mouse("mousePressed", a.x, a.y, { button: "left", clickCount: 1, modifiers: 0 });
  for (let s = 1; s <= 10; s++) { await app.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: Math.round(a.x + (b.x - a.x) * s / 10), y: Math.round(a.y + (b.y - a.y) * s / 10), button: "left", buttons: 1, modifiers: 0 }); await app.sleep(25); }
  await app.sleep(250);
  const over = await ev("[...document.querySelectorAll('.tab.drop-left,.tab.drop-right')].map(t=>t.querySelector('.tab-title').textContent.trim())");
  await app.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: b.x, y: b.y, button: "left", clickCount: 1, modifiers: 0 }); await app.sleep(1500);
  return over;
};
try {
  app = await launchApp(); await app.sleep(7000);
  log.rows = await ev("[...document.querySelectorAll('.tree-window .tree-row')].map(r=>r.dataset.path)");
  await click(row("txt")); await click(row("md"));
  for (const i of ["01", "02", "03"]) await click(row("txt/long-file-name-" + i + ".txt"), true);
  log.start = await tabs();
  log.lockOff = { over: await drag(row("md/m2.md"), "document.querySelectorAll('.pane .tab')[1]"), tabs: await tabs() };
  await click("document.querySelector('.status-bar [aria-label=\"Lock Preview\"]')");
  log.lockOn = { over: await drag(row("md/m3.md"), "document.querySelectorAll('.pane .tab')[1]"), tabs: await tabs() };
  const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/c8-tree-drop-on-tab.png", Buffer.from(r.data, "base64"));
} catch (e) { log.fatal = e.stack; } finally { app?.kill(); writeFileSync(OUT + "/v3-c8-drop.json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log)); }

// ORDER-03 #7 extra (C-06): with the window in front, a new tab opened from outside the pane (status bar Search, User menu
// Extensions, View menu Open Preview) in an overflowing tab bar is fully visible (close button left of the button area).
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const WW = SW + "\\o3ws";
const DATA = S + "/appdata3/workbench-tauri";
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-03";
process.env.APPDATA = SW + "\\appdata3";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview3";
writeFileSync(DATA + "/state.json", JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 }, lock_preview: false }] }));
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const row = (rel) => "document.querySelector('.tree-window .tree-row[data-path=" + JSON.stringify(JSON.stringify(WW + "\\" + rel.replace(/\//g, "\\"))).slice(1, -1) + "]')";
const pt = (js) => ev("(()=>{const e=" + js + ";if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()");
const click = async (js, dbl) => { const p = await pt(js); if (!p) throw new Error("not found " + js); for (let c = 1; c <= (dbl ? 2 : 1); c++) { await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: c }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: c }); } await app.sleep(900); };
const clipCheck = () => ev("(()=>{const p=document.querySelector('.pane');const edge=p.querySelector('.tab-bar-edge.end');const a=p.querySelector('.tab.active');const x=a?.querySelector('button[aria-label=\"Close Tab\"]');return {active:a?.querySelector('.tab-title')?.textContent.trim(),closeRight:x?Math.round(x.getBoundingClientRect().right*10)/10:null,edgeLeft:edge?Math.round(edge.getBoundingClientRect().left*10)/10:null,focusInPane:!!document.activeElement?.closest('.pane'),hasFocus:document.hasFocus()}})()");
const shot = async (n) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(OUT + "/" + n + ".png", Buffer.from(r.data, "base64")); };
const menuItem = (label) => "[...document.querySelectorAll('.menu-name, [role=menuitem], .menu-item')].find(e=>e.textContent.trim().startsWith(" + JSON.stringify(label) + ")&&!e.textContent.includes('Side'))";
try {
  app = await launchApp(); await app.sleep(6000);
  execFileSync("pwsh", ["-NoProfile", "-File", REPO + "/tools/win-input.ps1", "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await app.sleep(800);
  log.hasFocus = await ev("document.hasFocus()");
  await click(row("txt")); await click(row("md"));
  for (let i = 1; i <= 16; i++) await click(row("txt/long-file-name-" + String(i).padStart(2, "0") + ".txt"), true);
  await click(row("md/m2.md"), true); // a pinned editor tab of m2.md, active, last
  // focus outside the pane: the tree
  await click(row("txt")); await click(row("txt"));
  log.statusSearch = { before: await clipCheck() };
  await click("document.querySelector('.status-bar [aria-label=\"Search\"]')");
  log.statusSearch.after = await clipCheck(); await shot("c7b-status-search");
  await click(row("txt")); await click(row("txt"));
  await click("document.querySelector('[aria-label=\"User menu\"]')"); await click(menuItem("Extensions"));
  log.userMenuExtensions = await clipCheck(); await shot("c7b-user-menu-extensions");
  // View menu Open Preview needs the m2.md editor tab active (it is the source); activate it, then focus the tree again
  await ev("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title')?.textContent.trim()==='m2.md')?.scrollIntoView({inline:'nearest'})");
  await click("[...document.querySelectorAll('.pane .tab')].find(t=>t.querySelector('.tab-title')?.textContent.trim()==='m2.md')");
  await click(row("txt")); await click(row("txt"));
  await click("document.querySelector('[aria-label=\"Open Application Menu\"]')"); await click(menuItem("View")); await click(menuItem("Open Preview"));
  log.viewMenuOpenPreview = await clipCheck(); await shot("c7b-view-menu-open-preview");
  // the last tab clicked while the tree has focus (activate the first tab first, then scroll the row to the end)
  await click("document.querySelector('.pane .tab')"); await click(row("txt")); await click(row("txt"));
  await ev("(()=>{const l=document.querySelector('.pane .tab-list');l.scrollLeft=l.scrollWidth})()"); await app.sleep(300);
  await click("[...document.querySelector('.pane').querySelectorAll('.tab')].at(-1)");
  log.lastTabFromTree = await clipCheck(); await shot("c7b-last-tab-from-tree");
  // R-1: wheel the row away from the active tab with the tree focused, then click the editor: the row stays where it was
  await click(row("txt")); await click(row("txt"));
  const lp = await pt("document.querySelector('.pane .tab-list')");
  for (let i = 0; i < 6; i++) { await app.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: lp.x, y: lp.y, deltaX: 0, deltaY: -240 }); await app.sleep(120); }
  await app.sleep(400);
  const wheeled = await ev("document.querySelector('.pane .tab-list').scrollLeft");
  await click("[...document.querySelectorAll('.pane-body')].find(e=>e.offsetParent)");
  log.r1 = { wheeled, afterEditorClick: await ev("document.querySelector('.pane .tab-list').scrollLeft"), edgeShown: await ev("!!document.querySelector('.pane .tab-bar-edge.end')") };
} catch (e) { log.fatal = e.stack; } finally { app?.kill(); writeFileSync(OUT + "/v3-c7b.json", JSON.stringify(log, null, 2)); console.log(JSON.stringify(log)); }

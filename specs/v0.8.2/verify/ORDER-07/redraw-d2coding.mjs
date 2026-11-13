// One-off check of O7-9.2-redraw-d2coding with a timeout on every CDP call (the probe hung without one).
import { launchApp } from "file:///D:/projects/workbench-tauri/tools/cdp-lib.mjs";
import { mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const T = process.env.TEMP.split("\\").join("/"), D = `${T}/v082-o7-d2`, DW = D.split("/").join("\\");
rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/appdata/workbench-tauri`, { recursive: true }); mkdirSync(`${D}/ws`);
copyFileSync(`${T}/v082-o7-dbg/ws/plain.html`, `${D}/ws/plain.html`);
writeFileSync(`${D}/appdata/workbench-tauri/settings.json`, JSON.stringify({ preview_code_font_family: "D2Coding" }));
writeFileSync(`${D}/appdata/workbench-tauri/state.json`, JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: `${DW}\\ws`, added_at: "2026-11-14T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 }, outline: { open: true, width: 240 } }] }));
process.env.APPDATA = `${DW}\\appdata`; process.env.WEBVIEW2_USER_DATA_FOLDER = `${DW}\\webview`;
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const app = await launchApp(process.argv[2]);
const ev = (js, ms = 8000) => Promise.race([app.evaluate(js), new Promise((_, r) => setTimeout(() => r(new Error("eval timeout")), ms))]);
const win = (...a) => execFileSync("pwsh", ["-NoProfile", "-File", "D:/projects/workbench-tauri/tools/win-input.ps1", "-ProcessId", String(app.pid), ...a], { encoding: "utf8", timeout: 30000 });
const clickXY = async (x, y, n = 1) => { await app.mouse("mouseMoved", x, y); for (let c = 1; c <= n; c++) { await app.mouse("mousePressed", x, y, { clickCount: c }); await app.mouse("mouseReleased", x, y, { clickCount: c }); } };
try {
  await app.sleep(4000);
  const p = await ev(`(()=>{const e=[...document.querySelectorAll('.tree-window .tree-row')].find(e=>e.textContent.trim()==='plain.html');const r=e.getBoundingClientRect();return {x:r.x+30,y:r.y+r.height/2}})()`);
  await clickXY(p.x, p.y, 2); await app.sleep(2000);
  const l = await ev(`(()=>{const l=[...document.querySelectorAll('.cm-line')][2];const r=l.getBoundingClientRect();const g=document.querySelector('.cm-gutters').getBoundingClientRect();return {x:Math.round(Math.max(r.left,g.right)+12),y:Math.round(r.top+10)}})()`);
  await clickXY(l.x, l.y); await app.sleep(300);
  win("-Action", "keys", "-Keys", "ctrl+k,v"); await app.sleep(4000);
  log("panes", await ev(`document.querySelectorAll('.pane').length`));
  await ev(`(()=>{window.__o7={loads:[],keys:[],ready:[]};const f=document.querySelectorAll('.pane')[1].querySelector('.html-frame');f.addEventListener('load',()=>__o7.loads.push(performance.now()));addEventListener('keydown',()=>__o7.keys.push(performance.now()),true);addEventListener('message',e=>{if(e.data?.previewReady===true)__o7.ready.push(performance.now())});return 1})()`);
  await clickXY(l.x, l.y); await app.sleep(300);
  log("typing"); win("-Action", "keys", "-Keys", "end,x"); log("typed");
  for (let i = 0; i < 40; i++) {
    await app.sleep(500);
    const r = await ev(`(()=>{const k=__o7.keys.at(-1);const l=__o7.loads.find(x=>x>k),r=__o7.ready.find(x=>x>k);return {l:l?+(l-k).toFixed(1):null,r:r?+(r-k).toFixed(1):null}})()`, 3000).catch((e) => e.message);
    log("poll", JSON.stringify(r));
    if (r?.l) break;
  }
  win("-Action", "keys", "-Keys", "ctrl+z,ctrl+s");
  log("after undo", await ev("1+1", 5000).catch((e) => e.message));
} catch (e) { log("ERR", e.message); } finally { app.kill(); log("killed"); }

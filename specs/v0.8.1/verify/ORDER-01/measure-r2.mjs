// v0.8.1 ORDER-01 V3 re-measure after K-01-R2: tree input color (One Dark/Light) and Sidebar rename input color/size.
import { writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\");
const OUT = REPO + "/specs/v0.8.1/verify/ORDER-01";
const DATA = SW + "\\appdata\\workbench-tauri";
mkdirSync(DATA, { recursive: true });
const STATE = JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: SW + "\\workbench-core", added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] });
const setTheme = (t) => writeFileSync(DATA + "\\settings.json", JSON.stringify({ theme: t }, null, 2) + "\n");
process.env.APPDATA = SW + "\\appdata";
process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {};
let app;
const ev = (js) => app.evaluate(js);
const shot = async (name, clip) => { const r = await app.send("Page.captureScreenshot", { format: "png", clip: { ...clip, scale: 1 } }); writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64")); };
const center = (js) => ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+Math.min(r.width/2,60)),y:Math.round(r.y+r.height/2)}})()`);
const click = async (js, right) => { const p = await center(js); if (!p) throw new Error("not found " + js); const button = right ? "right" : "left"; await app.mouse("mouseMoved", p.x, p.y); await app.mouse("mousePressed", p.x, p.y, { clickCount: 1, button }); await app.mouse("mouseReleased", p.x, p.y, { clickCount: 1, button }); await app.sleep(500); };
const key = async (k, code, vk) => { await app.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: k, code, windowsVirtualKeyCode: vk }); await app.send("Input.dispatchKeyEvent", { type: "keyUp", key: k, code, windowsVirtualKeyCode: vk }); await app.sleep(500); };
const row = (n) => `[...document.querySelectorAll('.tree-window .tree-row')].find(r=>r.querySelector('.tree-label')?.textContent.trim()===${JSON.stringify(n)})`;
const clipOf = (js) => ev(`(()=>{const b=${js}.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}})()`);
try {
  setTheme("One Dark"); writeFileSync(DATA + "\\state.json", STATE);
  app = await launchApp(); await app.sleep(5000);
  await click(row("docs")).catch(() => {});
  for (const theme of ["One Dark", "One Light"]) {
    setTheme(theme); await app.sleep(2500);
    const t = theme.replace(" ", "");
    await click(row("python-extension.md")); await key("F2", "F2", 113);
    const tree = await ev(`(()=>{const i=document.querySelector('.tree-row.editing .tree-input');return {fontSize:getComputedStyle(i).fontSize,color:getComputedStyle(i).color,rowColor:getComputedStyle(i.closest('.tree-row')).color}})()`);
    await shot(`r2-tree-input-${t}`, await clipOf(`document.querySelector('.tree-row.editing')`));
    await key("Escape", "Escape", 27);
    const normal = await ev(`(()=>({fontSize:getComputedStyle(document.querySelector('.sidebar-item-name')).fontSize,itemColor:getComputedStyle(document.querySelector('.sidebar-item')).color,text:getComputedStyle(document.documentElement).getPropertyValue('--text').trim()}))()`);
    await click(`document.querySelector('.sidebar-item')`, true);
    await click(`[...document.querySelectorAll('[role=menuitem], .menu-item')].find(e=>/Rename/.test(e.textContent))`);
    const sidebar = await ev(`(()=>{const i=document.querySelector('.sidebar-item .tree-input');return i?{fontSize:getComputedStyle(i).fontSize,color:getComputedStyle(i).color}:null})()`);
    await shot(`r2-sidebar-input-${t}`, await clipOf(`document.querySelector('.sidebar-item')`));
    await key("Escape", "Escape", 27);
    log[t] = { tree, sidebarNormal: normal, sidebarInput: sidebar };
  }
} catch (e) { log.fatal = e.stack; }
finally { app?.kill(); writeFileSync(`${OUT}/v3-r2.json`, JSON.stringify(log, null, 2)); console.log(JSON.stringify(log)); }

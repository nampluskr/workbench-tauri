// ORDER-02 #7 only: Explorer-like file drop onto tree folder dst3 (real OLE drag via ext-drop.ps1).
import { writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const REPO = "D:/projects/workbench-tauri";
const S = "C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/2dcc8c40-f3c7-4825-9532-571c138ca732/scratchpad";
const SW = S.replace(/\//g, "\\"); const OUT = REPO + "/specs/v0.8.1/verify/ORDER-02";
const W = `${S}/o2ws`, WW = `${SW}\\o2ws`, EXT = `${S}/ext-src`, EXTW = `${SW}\\ext-src`;
process.env.APPDATA = SW + "\\appdata2"; process.env.WEBVIEW2_USER_DATA_FOLDER = SW + "\\webview2";
const { launchApp } = await import(pathToFileURL(REPO + "/tools/cdp-lib.mjs").href);
const log = {}; let app;
const ev = (js) => app.evaluate(js);
const shot = async (n) => { const r = await app.send("Page.captureScreenshot", { format: "png" }); writeFileSync(`${OUT}/${n}.png`, Buffer.from(r.data, "base64")); };
const row = (rel) => `document.querySelector('.tree-window .tree-row[data-path=${JSON.stringify(JSON.stringify(`${WW}\\${rel}`)).slice(1, -1)}]')`;
const pt = (js) => ev(`(()=>{const r=${js}.getBoundingClientRect();return {x:Math.round(r.x+60),y:Math.round(r.y+r.height/2)}})()`);
const ls = (d) => readdirSync(`${W}/${d}`).sort();
try {
  writeFileSync(`${S}/appdata2/workbench-tauri/state.json`, JSON.stringify({ version: 1, windows: [{ id: "w1", folders: [{ id: "f1", path: WW, added_at: "2026-11-13T00:00:00.000Z" }], active_folder_id: "f1", sidebar: { width: 200 } }] }));
  app = await launchApp(); await app.sleep(7000);
  log.diag = await ev(`({url:location.href,panel:!!document.querySelector(".project-panel"),scroll:!!document.querySelector(".tree-scroll"),text:document.body.innerText.slice(0,300)})`);
  await ev(`(()=>{const s=document.querySelector(".tree-scroll");s.scrollTop=0;s.dispatchEvent(new Event("scroll"))})()`); await app.sleep(800);
  log.rowsTop = await ev(`[...document.querySelectorAll(".tree-window .tree-row")].slice(0,14).map(r=>r.dataset.path?.split("\\\\").slice(-2).join("/"))`);
  if (!(await ev(`!!${row("dst3\\ext.txt")}`))) { const p = await pt(row("dst3")); await app.mouse("mousePressed", p.x, p.y, { button: "left", clickCount: 1 }); await app.mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: 1 }); await app.sleep(800); }
  log.before = { dst3: ls("dst3"), old: readFileSync(`${W}/dst3/ext.txt`, "utf8") };
  const drop = async (paths) => { const p = await pt(row("dst3")); execFileSync("pwsh", ["-NoProfile", "-File", `${REPO}/tools/win-input.ps1`, "-ProcessId", String(app.pid), "-Action", "foreground"], { encoding: "utf8" }); await app.sleep(500); try { return JSON.parse(execFileSync("pwsh", ["-NoProfile", "-File", `${S}/ext-drop.ps1`, "-AppPid", String(app.pid), "-X", String(p.x), "-Y", String(p.y), "-Paths", ...paths], { encoding: "utf8" }).trim().split(/\r?\n/).pop()); } catch (e) { return "ERR " + e.message.slice(0, 400); } };
  log.fileDrop = await drop([`${EXTW}\\ext.txt`]); await app.sleep(2500);
  log.afterFile = { dst3: ls("dst3"), old: readFileSync(`${W}/dst3/ext.txt`, "utf8"), copies: ls("dst3").filter((n) => n !== "ext.txt").map((n) => [n, existsSync(`${W}/dst3/${n}`) && !n.endsWith("dir") ? readFileSync(`${W}/dst3/${n}`, "utf8") : "dir"]), toasts: await ev(`[...document.querySelectorAll('.toast')].map(t=>t.innerText)`), tabs: await ev(`[...document.querySelectorAll('.tab .tab-title')].map(t=>t.textContent.trim())`) };
  await shot("c7-after-file");
  log.dirDrop = await drop([`${EXTW}\\extdir`]); await app.sleep(2500);
  log.afterDir = { dst3: ls("dst3"), g: existsSync(`${W}/dst3/extdir/g.txt`) && readFileSync(`${W}/dst3/extdir/g.txt`, "utf8"), treeRows: await ev(`[...document.querySelectorAll('.tree-window .tree-row')].map(r=>r.dataset.path).filter(p=>p&&p.includes('dst3'))`) };
  await shot("c7-after-folder");
  log.originals = { file: readFileSync(`${EXT}/ext.txt`, "utf8"), dir: existsSync(`${EXT}/extdir/g.txt`), list: readdirSync(EXT) };
} catch (e) { log.fatal = e.stack; } finally { app?.kill(); writeFileSync(`${OUT}/v3-c7.json`, JSON.stringify(log, null, 2)); console.log(JSON.stringify(log)); }

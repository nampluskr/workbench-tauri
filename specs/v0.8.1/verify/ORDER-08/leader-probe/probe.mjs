import { pathToFileURL } from "node:url";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
const S = "C:/Users/nampl/AppData/Local/Temp/v081-probe"; rmSync(S,{recursive:true,force:true}); mkdirSync(S+"/ad/workbench-tauri",{recursive:true});
writeFileSync(S+"/ad/workbench-tauri/settings.json",'{"theme":"One Dark"}\n');
process.env.APPDATA=S+"/ad"; process.env.WEBVIEW2_USER_DATA_FOLDER=S+"/wv";
const { launchApp } = await import(pathToFileURL("D:/projects/workbench-tauri/tools/cdp-lib.mjs").href);
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const app = await launchApp(); await sleep(4000);
await app.send("Page.setBypassCSP",{enabled:true}); await app.send("Page.reload"); await sleep(4000);
const html='<!DOCTYPE html><title>OK</title><p>ok</p>';
for (const id of ["q1","q2","q3"]) await app.evaluate(`window.__TAURI_INTERNALS__.invoke("preview_set",{id:"${id}",html:${JSON.stringify(html)}})`);
const urls={q1:"http://preview.p1.localhost/q1",q2:"http://preview.localhost:10001/q2",q3:"http://preview.localhost/q3"};
for (const [id,u] of Object.entries(urls)) await app.evaluate(`(()=>{const f=document.createElement("iframe");f.id="${id}";f.src="${u}";document.body.append(f)})()`);
await sleep(2500);
const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
for (const t of list.filter(x=>x.type==="iframe")) {
  const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  const v=await new Promise(r=>{ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.id===1) r(d.result?.result?.value)}; ws.send(JSON.stringify({id:1,method:"Runtime.evaluate",params:{returnByValue:true,expression:`JSON.stringify({href:location.href,origin:location.origin,html:document.documentElement.outerHTML.slice(0,200),nav:performance.getEntriesByType("navigation")[0]?.responseStatus})`}}))});
  console.log(t.url, v); ws.close();
}
console.log(await app.evaluate(`[...document.querySelectorAll("iframe[id^=q]")].map(f=>f.id+":"+(f.contentWindow?.length))`));
app.kill();

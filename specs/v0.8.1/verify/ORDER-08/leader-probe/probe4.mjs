import { pathToFileURL } from "node:url";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
const S = "C:/Users/nampl/AppData/Local/Temp/v081-probe4"; rmSync(S,{recursive:true,force:true}); mkdirSync(S+"/ad/workbench-tauri",{recursive:true});
writeFileSync(S+"/ad/workbench-tauri/settings.json",'{"theme":"One Dark"}\n');
process.env.APPDATA=S+"/ad"; process.env.WEBVIEW2_USER_DATA_FOLDER=S+"/wv";
const { launchApp } = await import(pathToFileURL("D:/projects/workbench-tauri/tools/cdp-lib.mjs").href);
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const F="D:/projects/workbench-tauri/specs/v0.8.1/verify/ORDER-08/fixtures/";
const CSP="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' asset: http://asset.localhost; style-src 'unsafe-inline' asset: http://asset.localhost; img-src data: blob: asset: http://asset.localhost; font-src data: asset: http://asset.localhost; media-src asset: http://asset.localhost; connect-src 'none'; form-action 'none'; base-uri 'none'; webrtc 'block'";
const head=`<meta http-equiv="Content-Security-Policy" content="${CSP}"><script>addEventListener("message",e=>{if(e.source===parent&&e.data?.previewPing===true)parent.postMessage({previewPong:true},"*")})</script>`;
const app = await launchApp(); await sleep(4000);
await app.evaluate(`window.__pongs={};addEventListener("message",e=>{if(e.data?.previewPong){const f=[...document.querySelectorAll("iframe[id^=t]")].find(f=>f.contentWindow===e.source);if(f)window.__pongs[f.id]=(window.__pongs[f.id]||0)+1}})`);
const cases={t1:["__X__","preview"]};
for (const [id,[file,host]] of Object.entries(cases)) {
  const html=readFileSync("C:/Users/nampl/AppData/Local/Temp/claude/0b8282fad92e4259/02e2cb6f-ade2-49a1-a17e-d67cf80d59ec/scratchpad/escape.html","utf8").replace(/<head>/i,"<head>"+head);
  await app.evaluate(`window.__TAURI_INTERNALS__.invoke("preview_set",{id:"${id}",html:${JSON.stringify(html)}})`);
  await app.evaluate(`(()=>{const f=document.createElement("iframe");f.id="${id}";f.setAttribute("sandbox","allow-scripts");f.setAttribute("csp",${JSON.stringify(CSP)});f.src="http://${host}.localhost/${id}";document.body.append(f)})()`);
}
for (let i=0;i<8;i++){ await app.evaluate(`document.querySelectorAll("iframe[id^=t]").forEach(f=>f.contentWindow.postMessage({previewPing:true},"*"))`); await sleep(1000); }
console.log("pongs", JSON.stringify(await app.evaluate("window.__pongs")));
const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
for (const t of list.filter(x=>x.type==="iframe")) {
  const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  const v=await Promise.race([sleep(3000).then(()=>"TIMEOUT"),new Promise(r=>{ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.id===1) r(d.result?.result?.value ?? JSON.stringify(d))}; ws.send(JSON.stringify({id:1,method:"Runtime.evaluate",params:{returnByValue:true,expression:`document.body.innerText.slice(0,400)`}}))})]);
  console.log(t.url, JSON.stringify(v)); ws.close();
}
app.kill();

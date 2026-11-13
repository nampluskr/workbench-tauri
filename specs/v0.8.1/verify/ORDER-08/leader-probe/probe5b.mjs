// leader probe (ORDER-08 #6): one WebRTC escape path per frame, app-tree UDP endpoints before/after each, page result read.
import { pathToFileURL } from "node:url";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const S = "C:/Users/nampl/AppData/Local/Temp/v081-probe5"; rmSync(S,{recursive:true,force:true}); mkdirSync(S+"/ad/workbench-tauri",{recursive:true});
writeFileSync(S+"/ad/workbench-tauri/settings.json",'{"theme":"One Dark"}\n');
process.env.APPDATA=S+"/ad"; process.env.WEBVIEW2_USER_DATA_FOLDER=S+"/wv";
const { launchApp } = await import(pathToFileURL("D:/projects/workbench-tauri/specs/v0.8.1/verify/ORDER-08/leader-probe/cdp-lib-flags.mjs").href);
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const ps=(cmd)=>execFileSync("pwsh",["-NoProfile","-Command",cmd],{encoding:"utf8",windowsHide:true}).trim();
const CSP="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' asset: http://asset.localhost; style-src 'unsafe-inline' asset: http://asset.localhost; img-src data: blob: asset: http://asset.localhost; font-src data: asset: http://asset.localhost; media-src asset: http://asset.localhost; connect-src 'none'; form-action 'none'; base-uri 'none'; webrtc 'block'";
// same as K-08c headStart prefix
const head=`<meta http-equiv="Content-Security-Policy" content="${CSP}"><script>delete window.RTCPeerConnection;delete window.webkitRTCPeerConnection;</script>`;
const STUN=`{iceServers:[{urls:"stun:${process.env.STUN_HOST||"stun.l.google.com:19302"}"}]}`;
const tryPc=(W)=>`(function(W,tag){try{const C=W.RTCPeerConnection||W.webkitRTCPeerConnection;if(!C){out(tag+" | none | "+typeof C);return}const pc=new C(${STUN});let n=0;pc.onicecandidate=e=>{if(e.candidate){n++;out(tag+" | OPEN cand | "+e.candidate.candidate.split(" ").slice(4,8).join(" "))}};pc.createDataChannel("x");pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>out(tag+" | offer set"),e=>out(tag+" | offer err | "+e))}catch(e){out(tag+" | err | "+e)}})(${W},`;
const base=`const o=document.getElementById("o");function out(s){o.textContent+=s+String.fromCharCode(10)}`;
const ONLY=process.argv[2];
const paths={
  none:`out("baseline")`,
  direct:`${tryPc("window")}"direct")`,
  blank:`const f=document.createElement("iframe");document.body.append(f);try{${tryPc("f.contentWindow")}"blank")}catch(e){out("blank | err | "+e)}`,
  srcdoc:`const f=document.createElement("iframe");f.srcdoc='<script>try{const pc=new RTCPeerConnection(${STUN});pc.onicecandidate=e=>{if(e.candidate)parent.postMessage({c:e.candidate.candidate},"*")};pc.createDataChannel("x");pc.createOffer().then(o=>pc.setLocalDescription(o));parent.postMessage({s:"srcdoc pc created"},"*")}catch(e){parent.postMessage({s:"srcdoc err "+e},"*")}</'+'script>';addEventListener("message",e=>{if(e.data.s)out("srcdoc | "+e.data.s);if(e.data.c)out("srcdoc | OPEN cand | "+e.data.c.split(" ").slice(4,8).join(" "))});document.body.append(f);`,
  open:`try{const w=window.open("about:blank");out("open | "+(w===null?"null":"window"));if(w){${tryPc("w")}"open")}}catch(e){out("open | err | "+e)}`,
  worker:`try{const w=new Worker(URL.createObjectURL(new Blob(["postMessage(typeof RTCPeerConnection)"])));w.onmessage=e=>out("worker | "+e.data);w.onerror=e=>out("worker | onerror")}catch(e){out("worker | err | "+e)}`,
  proto:`const names=Object.getOwnPropertyNames(window).filter(n=>/^RTC|^webkitRTC/.test(n));out("proto | globals | "+names.join(","));let hit=0;for(const n of names){try{let p=window[n]&&window[n].prototype;while(p){const c=p.constructor;if(c&&c.name==="RTCPeerConnection"||c.name==="webkitRTCPeerConnection"){hit++;out("proto | OPEN | "+n+" -> "+c.name)}p=Object.getPrototypeOf(p)}}catch(e){}}out("proto | hits | "+hit)`,
};
const appTree=(pid)=>`$all=Get-CimInstance Win32_Process;$set=@(${pid});do{$n=$set.Count;$set=@($set+($all|?{$set -contains $_.ParentProcessId}|%{$_.ProcessId})|select -Unique)}while($set.Count -ne $n);`;
const udp=(pid)=>JSON.parse(ps(appTree(pid)+`$u=Get-NetUDPEndpoint|?{$set -contains $_.OwningProcess}|%{"$($_.OwningProcess):$($_.LocalAddress):$($_.LocalPort)"};ConvertTo-Json -Compress @($u)`)||"[]");
const types=(pid)=>ps(appTree(pid)+`$all|?{$set -contains $_.ProcessId}|%{"$($_.ProcessId) "+$_.Name+" "+([regex]::Match([string](Get-Process -Id $_.ProcessId -EA SilentlyContinue).CommandLine,'--type=\S+').Value)+" "+([regex]::Match([string](Get-Process -Id $_.ProcessId -EA SilentlyContinue).CommandLine,'--utility-sub-type=\S+').Value)}`);
import dgram from "node:dgram"; const stunHits=[]; const sock=dgram.createSocket("udp4"); sock.on("message",(m,r)=>stunHits.push(r.address+":"+r.port+" len "+m.length)); await new Promise(r=>sock.bind(3478,"0.0.0.0",r));
const app = await launchApp(); await sleep(4000);
const res={types:null,paths:{}};
let i=0;
for (const [name,code] of Object.entries(paths).filter(([n])=>!ONLY||ONLY.split(",").includes(n))) {
  const id="e"+(++i), host=["preview","preview1","preview2"][i%3];
  const before=udp(app.pid);
  const html=`<!DOCTYPE html><html><head>${head}<title>${name}</title></head><body><pre id="o"></pre><script>${base};${code}</script></body></html>`;
  await app.evaluate(`window.__TAURI_INTERNALS__.invoke("preview_set",{id:"${id}",html:${JSON.stringify(html)}})`);
  await app.evaluate(`(()=>{const f=document.createElement("iframe");f.id="${id}";f.setAttribute("sandbox","allow-scripts");f.setAttribute("csp",${JSON.stringify(CSP)});f.src="http://${host}.localhost/${id}";document.body.append(f)})()`);
  await sleep(5000); if(name==="srcdoc") res.typesDuring=execFileSync("pwsh",["-NoProfile","-ExecutionPolicy","Bypass","-File","D:/projects/workbench-tauri/specs/v0.8.1/verify/ORDER-08/leader-probe/tree-types.ps1","-RootPid",String(app.pid)],{encoding:"utf8",windowsHide:true});
  const after=udp(app.pid);
  const list = await (await fetch("http://127.0.0.1:9222/json/list")).json();
  const t=list.find(x=>x.type==="iframe"&&x.url.endsWith("/"+id));
  let text="noTarget";
  if (t){const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);text=await Promise.race([sleep(3000).then(()=>"TIMEOUT"),new Promise(r=>{ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id===1)r(d.result?.result?.value)};ws.send(JSON.stringify({id:1,method:"Runtime.evaluate",params:{returnByValue:true,expression:"document.getElementById('o').textContent + ' || ' + typeof out + ' || ' + [...document.scripts].map(s=>s.text).join(' / ').slice(0,400)"}}))})]);ws.close();}
  res.paths[name]={host,text,newUdp:after.filter(x=>!before.includes(x))};
  console.log(name, host, JSON.stringify(text), "newUDP", JSON.stringify(res.paths[name].newUdp));
  await app.evaluate(`document.getElementById("${id}").remove()`);
  await sleep(1500);
}
res.types=types(app.pid); console.log(res.types);
writeFileSync("D:/projects/workbench-tauri/specs/v0.8.1/verify/ORDER-08/leader-probe/probe5b.json", JSON.stringify(res,null,1));
console.log("STUN packets received:", stunHits.length, JSON.stringify(stunHits.slice(0,3))); sock.close();
app.kill();

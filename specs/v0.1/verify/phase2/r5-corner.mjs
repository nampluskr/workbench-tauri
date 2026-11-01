// checker script: dump a luminance grid of a window corner from a monitor capture (R-5 observation)
import fs from "node:fs"; import zlib from "node:zlib";
function loadPng(f){const b=fs.readFileSync(f);let p=8,w,h,ct;const idat=[];while(p<b.length){const l=b.readUInt32BE(p),t=b.toString("ascii",p+4,p+8);const d=b.subarray(p+8,p+8+l);if(t==="IHDR"){w=d.readUInt32BE(0);h=d.readUInt32BE(4);ct=d[9];}if(t==="IDAT")idat.push(d);p+=12+l;}
const raw=zlib.inflateSync(Buffer.concat(idat));const bpp=ct===6?4:3,stride=w*bpp,out=Buffer.alloc(h*stride);let q=0;
for(let y=0;y<h;y++){const f2=raw[q++];for(let x=0;x<stride;x++){const a=x>=bpp?out[y*stride+x-bpp]:0,up=y>0?out[(y-1)*stride+x]:0,c=x>=bpp&&y>0?out[(y-1)*stride+x-bpp]:0;let v=raw[q++];if(f2===1)v+=a;else if(f2===2)v+=up;else if(f2===3)v+=(a+up)>>1;else if(f2===4){const pp=a+up-c,pa=Math.abs(pp-a),pb=Math.abs(pp-up),pc=Math.abs(pp-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?up:c;}out[y*stride+x]=v&255;}}
return{w,h,bpp,data:out};}
const [,, file, x0, y0, x1, y1] = process.argv;
const im = loadPng(file);
const hx = (x, y) => { const i = (y * im.w + x) * im.bpp; return [0, 1, 2].map((k) => im.data[i + k].toString(16).padStart(2, "0")).join(""); };
for (let y = +y0; y <= +y1; y++) { let row = []; for (let x = +x0; x <= +x1; x++) row.push(hx(x, y)); console.log(String(y).padStart(4), row.join(" ")); }

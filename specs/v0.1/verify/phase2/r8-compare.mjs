// checker script: compare R-8 dumps with (a) original theme JSON, (b) 03-THEME-ICONS value tables, (c) T-26 rules.
import fs from "node:fs";
const root = "D:/projects/workbench-tauri";
const P = root + "/specs/v0.1/verify/phase2/";
const TARGET = ["background","border","border.variant","ghost_element.hover","ghost_element.active","text","title_bar.background","title_bar.inactive_background","status_bar.background","tab_bar.background","tab.active_background","tab.inactive_background","panel.background","scrollbar.thumb.background","scrollbar.thumb.hover_background","scrollbar.thumb.active_background","scrollbar.thumb.border","scrollbar.track.background","scrollbar.track.border","editor.background","editor.foreground","editor.gutter.background","editor.line_number","editor.active_line_number","editor.active_line.background","players[0].cursor","players[0].selection"];
const hex = (s) => { const h = s.replace("#",""); const n=(i)=>parseInt(h.slice(i,i+2),16); return [n(0),n(2),n(4),h.length===8?n(6):255]; };
const parseApplied = (s) => { s=s.trim(); if (s.startsWith("#")) return hex(s); const m=s.match(/rgba?\(([^)]+)\)/); const p=m[1].split(",").map(Number); return [p[0],p[1],p[2],Math.round((p.length>3?p[3]:1)*255)]; };
const diff = (a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
const getJson = (file, name) => { const j=JSON.parse(fs.readFileSync(file,"utf8")); return j.themes.find(t=>t.name===name).style; };
const jsonVal = (st, tok) => { if (tok==="players[0].cursor") return st.players?.[0]?.cursor; if (tok==="players[0].selection") return st.players?.[0]?.selection; return st[tok]; };
// doc table parse
const doc = fs.readFileSync("D:/projects/docs/guides/zed-like-editor/01-zed/03-THEME-ICONS.md","utf8").split("\n");
const docTab = {}; // token -> {col: value}
const cols = ["One Dark","One Light","Latte","Frappé","Macchiato","Mocha"];
for (const line of doc) {
  const m = line.match(/^\| (T-\d\d\.\d+) \| `([^`]+)` \|(.*)\|\s*$/);
  if (!m) continue;
  const cells = m[3].split("|").map(s=>s.trim().replace(/^`|`$/g,""));
  if (cells.length < 6) continue;
  const vals = cells.slice(0,6);
  if (!vals.every(v=>/^(#[0-9a-fA-F]{6,8}|null|—)$/.test(v))) continue;
  docTab[m[2]] = Object.fromEntries(cols.map((c,i)=>[c,vals[i]]));
}
const themes = [
  { dump:"r8-mocha.json", file:root+"/src/theme/assets/catppuccin/catppuccin-mauve.json", name:"Catppuccin Mocha", col:"Mocha" },
  { dump:"r8-latte.json", file:root+"/src/theme/assets/catppuccin/catppuccin-mauve.json", name:"Catppuccin Latte", col:"Latte" },
  { dump:"r8-one-light.json", file:root+"/src/theme/assets/one/one.json", name:"One Light", col:"One Light" },
];
const out = [];
for (const t of themes) {
  const dump = JSON.parse(fs.readFileSync(P+t.dump,"utf8")).value.dump;
  const st = getJson(t.file, t.name);
  const dtok = Object.fromEntries(dump.tokens.map(x=>[x.token,x]));
  const rows = [];
  for (const tok of TARGET) {
    const d = dtok[tok];
    const orig = jsonVal(st, tok);
    let expected, basis;
    if (orig != null) { expected = orig; basis = "json"; }
    else if (tok==="scrollbar.thumb.active_background") { expected = jsonVal(st,"scrollbar.thumb.background"); basis="T-26.3 (= scrollbar.thumb.background)"; }
    else if (tok==="scrollbar.thumb.border" && /Catppuccin/.test(t.name)) { expected="#3b3d45"; basis="T-26.8"; }
    else { expected=null; basis="no rule"; }
    const docv = docTab[tok]?.[t.col];
    let verdict = "충족", note = "";
    if (!d) { verdict="불충족"; note="덤프에 없음"; }
    else if (expected==null) { verdict="불충족"; note="원본 값 없음 + T-26 규칙 없음, 덤프 source="+d.source; }
    else {
      const e = hex(expected);
      const dv = diff(e, hex(d.value)), da = diff(e, parseApplied(d.applied));
      if (dv!==0 || da>1) { verdict="불충족"; note=`value diff ${dv}, applied diff ${da}`; }
      // source label check
      const wantSrc = basis==="json" ? "json" : "fallback";
      if (!d.source.startsWith(wantSrc)) { verdict="불충족"; note+=` source=${d.source}`; }
    }
    // doc table cross-check (only when doc has a hex value)
    let docNote = "";
    if (docv && /^#/.test(docv) && expected && basis==="json") docNote = diff(hex(docv),hex(expected))===0 ? "doc=json" : `DOC≠JSON(${docv})`;
    else if (docv) docNote = `doc:${docv}`;
    rows.push({ token:tok, basis, expected, dumpValue:d?.value, dumpApplied:d?.applied, dumpSource:d?.source, docTable:docv, docCheck:docNote, verdict, note });
  }
  out.push({ theme:t.name, count:rows.length, pass:rows.filter(r=>r.verdict==="충족").length, rows });
}
fs.writeFileSync(P+"r8-token-compare.json", JSON.stringify(out,null,1));
for (const o of out) { console.log(o.theme, o.pass+"/"+o.count); for (const r of o.rows.filter(r=>r.verdict!=="충족"||/DOC≠/.test(r.docCheck))) console.log("  ", r.token, r.verdict, r.note, r.docCheck); }
console.log("doc table tokens parsed:", Object.keys(docTab).length);

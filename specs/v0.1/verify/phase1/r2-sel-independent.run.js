(async()=>{
const fr=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
const store=await import('/src/poc/editorStore.ts?t=1793497368622');
const ed=document.querySelector('.cm-editor');
const view=['a','b','c'].map(t=>store.existingView(t)).find(v=>v&&v.dom.isConnected); if(!view) return {error:'no view'};
if(view.dom!==ed) return {error:'view mismatch', n:document.querySelectorAll('.cm-editor').length};
view.focus();
const doc=view.state.doc;
const L=n=>doc.line(n);
const dump=()=>{const paths=[...ed.querySelectorAll('.zl-selectionShape path')];return paths.map(p=>{const d=p.getAttribute('d');const arcs=[...d.matchAll(/A ([\d.]+) ([\d.]+) 0 0 ([01])/g)].map(m=>({rx:+m[1],ry:+m[2],sweep:+m[3]}));return {fill:getComputedStyle(p).fill,arcCount:arcs.length,arcs,d}})};
const out={lineHeight:view.defaultLineHeight};
view.dispatch({selection:{anchor:L(10).from+3,head:L(10).from+12}});await fr();await fr();
out.singleLine={zlActiveLines:ed.querySelectorAll('.zl-activeLine').length,paths:dump()};
view.dispatch({selection:{anchor:L(10).from+11,head:L(12).from+21}});await fr();await fr();
out.threeLine={zlActiveLines:ed.querySelectorAll('.zl-activeLine').length,paths:dump()};
view.dispatch({selection:{anchor:L(11).from+5}});await fr();await fr();
const al=[...ed.querySelectorAll('.zl-activeLine')];const ag=ed.querySelector('.zl-activeLineGutter');const sc=view.scrollDOM;
const g=ed.querySelector('.cm-gutters').getBoundingClientRect();
out.emptyCursor={activeLines:al.length,gutterCell:!!ag,lineBg:al[0]&&getComputedStyle(al[0]).backgroundColor,gutterBg:ag&&getComputedStyle(ag).backgroundColor,lineBox:al[0]&&al[0].getBoundingClientRect().toJSON(),gutterBox:ag&&ag.getBoundingClientRect().toJSON(),editorLeft:ed.getBoundingClientRect().left,gutterRight:g.right,scrollerInnerRight:sc.getBoundingClientRect().left+sc.clientWidth};
view.dispatch({selection:{anchor:L(11).from+2,head:L(11).from+8}});await fr();await fr();
out.nonEmptySelectionSameLine={activeLines:ed.querySelectorAll('.zl-activeLine').length,gutterCell:!!ed.querySelector('.zl-activeLineGutter')};
view.dispatch({selection:{anchor:0}});view.scrollDOM.scrollTop=0;
return out;})()

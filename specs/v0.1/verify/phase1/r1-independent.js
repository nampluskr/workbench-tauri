(async () => {
  const fr = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const lay0 = __poc.layout();
  // pick tab "b": make it active in its pane, give it scroll and selection
  const tab = "b";
  const pane0 = lay0.panes.find(p => p.tabs.includes(tab));
  [...document.querySelectorAll(`[data-poc-pane="${pane0.id}"] button`)].find(b => b.textContent === tab).click();
  await fr();
  const q = () => document.querySelector(`[data-poc-slot="${pane0.id}"] .cm-editor`);
  const el = q(); window.__tagged = el;
  el.dataset.checkerTag = "R1-INDEPENDENT";
  const sc = el.querySelector(".cm-scroller");
  sc.scrollTop = 900; await fr();
  const snapBefore = __poc.r1.snapshot(tab);
  const rawBefore = { scrollTop: sc.scrollTop, parentSlot: el.parentElement.dataset.pocSlot, instance: el.dataset.pocInstance, connected: el.isConnected };
  // real UI click on the move button next to tab b
  const grp = [...document.querySelectorAll(`[data-poc-pane="${pane0.id}"] button`)].find(b => b.textContent === tab).nextElementSibling;
  grp.click(); await fr(); await fr();
  const lay1 = __poc.layout();
  const pane1 = lay1.panes.find(p => p.tabs.includes(tab));
  const el2 = document.querySelector(`[data-poc-slot="${pane1.id}"] .cm-editor`);
  const sc2 = el2.querySelector(".cm-scroller");
  const snapAfter = __poc.r1.snapshot(tab);
  return { tab, from: pane0.id, to: pane1.id, sameObject: el2 === window.__tagged, tagSurvived: el2.dataset.checkerTag,
    rawBefore, rawAfter: { scrollTop: sc2.scrollTop, parentSlot: el2.parentElement.dataset.pocSlot, instance: el2.dataset.pocInstance, connected: el2.isConnected },
    snapBefore, snapAfter, editorCountInDoc: document.querySelectorAll(".cm-editor").length };
})()

export type Pane = { tabs: string[]; active: string | null };

/** Move tab `id` from pane `from` to pane `to`; the moved tab becomes active there. */
export function moveTab(panes: Pane[], id: string, from: number, to: number): Pane[] {
  const index = panes[from]?.tabs.indexOf(id) ?? -1;
  if (from === to || index < 0 || !panes[to]) return panes;
  return panes.map((pane, i) => {
    if (i === from) {
      const tabs = pane.tabs.filter((t) => t !== id);
      const active =
        pane.active === id ? (tabs[Math.min(index, tabs.length - 1)] ?? null) : pane.active;
      return { tabs, active };
    }
    if (i === to) return { tabs: [...pane.tabs, id], active: id };
    return pane;
  });
}

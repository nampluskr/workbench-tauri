import { createMemo, createRenderEffect, For } from "solid-js";
import { TAB_MAX_TITLE_CHARS } from "../spec/metrics.ts";
import { activateTab } from "../workspace/context.ts";
import { tabEdges } from "../workspace/tabs.ts";
import { baseName, truncateName } from "../workspace/paths.ts";
import { activeFolder, contextOf } from "../workspace/store.ts";

// The active folder's tabs (R-26, A-15.1): the tab list between the two end areas, and the active tab's editor.
const context = createMemo(() => {
  const folder = activeFolder();
  return folder ? contextOf(folder) : null;
});

export function TabList() {
  const tabs = () => context()?.tabs() ?? [];
  return (
    <div class="tab-list" role="tablist">
      <For each={tabs()}>
        {(tab, i) => {
          const edges = () => tabEdges(i(), tabs().length, context()?.active() ?? null);
          const active = () => i() === context()?.active();
          return (
            <div
              class="tab"
              classList={{ active: active(), preview: tab.preview, "edge-l": edges().left, "edge-r": edges().right, "edge-b": edges().bottom }}
              role="tab"
              aria-selected={active()}
              onClick={() => activateTab(context()!, i())}
            >
              <span class="tab-title">{truncateName(baseName(tab.path), TAB_MAX_TITLE_CHARS)}</span>
            </div>
          );
        }}
      </For>
    </div>
  );
}

export function PaneBody() {
  // The view of a tab is made once and moved in and out of the DOM, so scroll and selection stay. The effect is made in the
  // ref callback: a `let` ref is only set after the component body has run, and a render effect runs at once.
  return (
    <div
      class="pane-body"
      ref={(body) =>
        createRenderEffect(() => {
          const ctx = context();
          const tab = ctx?.tabs()[ctx.active() ?? -1];
          body.replaceChildren(...(tab?.view ? [tab.view.dom] : []));
        })
      }
    />
  );
}

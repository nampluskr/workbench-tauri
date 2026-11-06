import { createMemo, createRenderEffect, For } from "solid-js";
import { redo, undo } from "@codemirror/commands";
import { backtab, tab as indentTab } from "../editor/indent.ts";
import { commands } from "../keymap/keyboard.ts";
import { TAB_MAX_TITLE_CHARS } from "../spec/metrics.ts";
import { activateTab, closeTab, saveActive } from "../workspace/context.ts";
import { tabEdges } from "../workspace/tabs.ts";
import { baseName, truncateName } from "../workspace/paths.ts";
import { activeFolder, contextOf } from "../workspace/store.ts";
import Icon from "./Icon.tsx";
import { tooltip } from "./tooltip.ts";

// The active folder's tabs (R-26, A-15.1): the tab list between the two end areas, and the active tab's editor.
const context = createMemo(() => {
  const folder = activeFolder();
  return folder ? contextOf(folder) : null;
});

const activeTab = () => {
  const ctx = context();
  return ctx?.tabs()[ctx.active() ?? -1];
};
commands.set("workspace::Save", () => {
  const ctx = context();
  if (ctx) void saveActive(ctx);
});
// I-056: the keys match only with focus in the editor (Editor context), so the active tab's view is the one.
for (const [action, run] of [["editor::Undo", undo], ["editor::Redo", redo]] as const) {
  commands.set(action, () => {
    const view = activeTab()?.file.view;
    if (view) run(view);
  });
}
// I-059: Tab / Shift+Tab indent and outdent (the key is taken, so focus stays in the editor).
for (const [action, spec] of [["editor::Tab", indentTab],["editor::Backtab", backtab]] as const) {
  commands.set(action, () => {
    const view = activeTab()?.file.view;
    if (view && !view.state.readOnly) view.dispatch(spec(view.state));
  });
}
commands.set("pane::CloseActiveItem", () => {
  const tab = activeTab();
  if (tab) void closeTab(context()!, tab.file);
});

export function TabList() {
  const tabs = () => context()?.tabs() ?? [];
  return (
    <div class="tab-list" role="tablist">
      <For each={tabs()}>
        {(tab, i) => {
          const edges = () => tabEdges(i(), tabs().length, context()?.active() ?? null);
          const active = () => i() === context()?.active();
          const status = tab.file.status;
          return (
            <div
              class="tab"
              classList={{ active: active(), preview: tab.preview, "edge-l": edges().left, "edge-r": edges().right, "edge-b": edges().bottom }}
              role="tab"
              aria-selected={active()}
              onClick={() => activateTab(context()!, i())}
              onMouseDown={(e) => e.button === 1 && e.preventDefault()} // no autoscroll on a middle press
              onAuxClick={(e) => e.button === 1 && void closeTab(context()!, tab.file)} // I-075
            >
              {/* L-64, L-25: start slot with the modified dot (L-65, I-071), title, end slot with the close button. */}
              <span class="tab-slot-start">
                <span class="tab-indicator" classList={{ dirty: status().dirty, conflict: status().conflict }} />
              </span>
              <span class="tab-title" classList={{ deleted: status().deleted }}>
                {truncateName(baseName(tab.path), TAB_MAX_TITLE_CHARS)}
              </span>
              {/* I-073 / L-66: right side, shown on hover; it asks like every other close. L-240: the key only on the active tab. */}
              <button
                class="tab-close"
                aria-label="Close Tab"
                tabindex="-1"
                onClick={(e) => {
                  e.stopPropagation();
                  void closeTab(context()!, tab.file);
                }}
                ref={(el) => tooltip(el, () => (active() ? { title: "Close Tab", action: "pane::CloseActiveItem" } : { title: "Close Tab" }))}
              >
                <Icon name="close" />
              </button>
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
          const dom = activeTab()?.file.view?.dom;
          // Only when the shown view changes: every new tab array (promotion, rename, a view made) runs this, and taking the
          // same editor out and back in drops its focus mid-typing.
          if (dom ? body.firstChild !== dom || body.childNodes.length > 1 : body.firstChild) body.replaceChildren(...(dom ? [dom] : []));
        })
      }
    />
  );
}

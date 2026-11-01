// Phase 1 PoC screen: two panes with tabs whose editors are moved, not
// recreated (SPEC R-1). Layout uses CSSOM styles only (CSP: no inline <style>).
import { createEffect, For, Show, type JSX } from "solid-js";
import { attachView } from "./editorStore";
import { activateTab, layout, moveTab, type PaneState } from "./layout";
import { varRef } from "../theme/tokens";

const paneStyle: JSX.CSSProperties = {
  display: "flex",
  "flex-direction": "column",
  flex: "1 1 0",
  "min-width": "0",
  "min-height": "0",
  border: `1px solid ${varRef("border")}`,
};

const tabBarStyle: JSX.CSSProperties = {
  display: "flex",
  gap: "4px",
  padding: "4px",
  background: varRef("tab_bar.background"),
};

// Style objects are passed as variables, never as JSX literals: Solid compiles
// static literals into template `style="..."` attributes, which the CSP
// (no 'unsafe-inline') blocks. Variables are applied through CSSOM at runtime.
const tabGroupStyle: JSX.CSSProperties = { display: "flex", gap: "2px" };
const slotStyle: JSX.CSSProperties = { flex: "1 1 0", "min-height": "0", overflow: "hidden" };
const rootStyle: JSX.CSSProperties = {
  display: "flex",
  flex: "1 1 0",
  "min-width": "0",
  "min-height": "0",
  background: varRef("editor.background"),
};
const nestedRootStyle: JSX.CSSProperties = { ...rootStyle, "flex-direction": "column" };
const nestedWrapperStyle: JSX.CSSProperties = { display: "flex", flex: "1 1 0", "min-height": "0" };

function tabStyle(active: boolean): JSX.CSSProperties {
  return {
    padding: "2px 8px",
    color: varRef("text"),
    background: active ? varRef("tab.active_background") : varRef("tab.inactive_background"),
    border: `1px solid ${varRef("border")}`,
    cursor: "pointer",
  };
}

function Pane(props: { pane: PaneState; index: number }) {
  let slot: HTMLDivElement | undefined;

  createEffect(() => {
    const active = props.pane.active;
    if (!slot) return;
    if (active) attachView(active, slot);
    else slot.replaceChildren();
  });

  return (
    <div style={paneStyle} data-poc-pane={props.pane.id}>
      <div style={tabBarStyle}>
        <For each={props.pane.tabs}>
          {(tab) => (
            <span style={tabGroupStyle}>
              <button
                style={tabStyle(props.pane.active === tab)}
                data-active={String(props.pane.active === tab)}
                onClick={() => activateTab(tab)}
              >
                {tab}
              </button>
              <button
                style={tabStyle(false)}
                title="Move to the other pane"
                onClick={() => moveTab(tab, props.index === 0 ? 1 : 0)}
              >
                {"⇄"}
              </button>
            </span>
          )}
        </For>
      </div>
      <div
        ref={slot}
        data-poc-slot={props.pane.id}
        style={slotStyle}
      />
    </div>
  );
}

export default function PocApp() {
  return (
    <Show
      when={layout.structure === "row"}
      fallback={
        <div style={nestedRootStyle} data-poc-structure="nested">
          <For each={layout.panes}>
            {(pane, i) => (
              <div style={nestedWrapperStyle}>
                <Pane pane={pane} index={i()} />
              </div>
            )}
          </For>
        </div>
      }
    >
      <div style={rootStyle} data-poc-structure="row">
        <For each={layout.panes}>{(pane, i) => <Pane pane={pane} index={i()} />}</For>
      </div>
    </Show>
  );
}

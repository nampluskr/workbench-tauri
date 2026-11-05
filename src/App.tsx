import { For, createRenderEffect } from "solid-js";
import TitleBar from "./shell/TitleBar.tsx";
import { activate, moveToPane, panes, titles, views } from "./workbench/store.ts";

function Pane(props: { index: number }) {
  const pane = () => panes()[props.index];

  // Re-attach the existing EditorView DOM instead of rendering a new editor.
  const attach = (body: HTMLDivElement) =>
    createRenderEffect(() => {
      const id = pane().active;
      body.replaceChildren(...(id ? [views.get(id)!.dom] : []));
    });

  return (
    <section class="pane" data-keymap-context="Pane">
      <div class="tabs">
        <For each={pane().tabs}>
          {(id) => (
            <div class="tab" classList={{ active: id === pane().active }}>
              <button onClick={() => activate(props.index, id)}>{titles.get(id)}</button>
              <button
                aria-label="Move tab to the other pane"
                onClick={() => moveToPane(id, props.index, 1 - props.index)}
              >
                {props.index === 0 ? "→" : "←"}
              </button>
            </div>
          )}
        </For>
      </div>
      <div class="pane-body" ref={attach} />
    </section>
  );
}

export default function App() {
  return (
    <>
      <aside class="sidebar">
        {/* The header sits in the title bar row, so it drags the window too (L-12). */}
        <div class="sidebar-header" data-tauri-drag-region />
      </aside>
      <div class="workspace" data-keymap-context="Workspace">
        <TitleBar />
        <div class="workspace-body">
          <aside class="dock-left" />
          <div class="pane-group">
            <Pane index={0} />
            <Pane index={1} />
          </div>
        </div>
        <footer class="status-bar" />
      </div>
    </>
  );
}

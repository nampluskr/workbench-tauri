import { For, createRenderEffect } from "solid-js";
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
    <section class="pane">
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
      <Pane index={0} />
      <Pane index={1} />
    </>
  );
}

import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import Icon from "./Icon.tsx";
import { fuzzyFilter, moveSelection, pickerKey, type PickerConfig } from "./picker.ts";
import "./picker.css";

// One modal for the theme pickers (P-001..P-006, P-010). A native modal <dialog> gives the top layer, the inert page
// behind it, Escape as `cancel` and focus return. State is module level because keymap commands open and toggle it.
const [session, setSession] = createSignal<PickerConfig | null>(null);
let dismiss: (() => void) | undefined;

export const isPickerOpen = () => session() !== null;
/** Opens `config`; one that is already open closes first (reverting its preview). */
export function openPicker(config: PickerConfig): void {
  dismiss?.();
  setSession(config);
}
/** P-001: the same toggle key closes the modal. */
export const closePicker = () => dismiss?.();

export function PickerHost() {
  let dialog!: HTMLDialogElement;
  let list: HTMLDivElement | undefined;
  let returnTo: HTMLElement | null = null;
  const [query, setQuery] = createSignal("");
  const [selected, setSelected] = createSignal(0);
  const matches = createMemo(() => fuzzyFilter(session()?.items ?? [], query()));

  /** Move the selection and show that item (P-010 preview). */
  const select = (index: number) => {
    setSelected(index);
    const match = matches()[index];
    if (match) session()?.preview(match.item);
  };
  const finish = (then: (config: PickerConfig) => void) => {
    const config = session();
    if (!config) return;
    setSession(null);
    dialog.close();
    returnTo?.focus();
    then(config);
  };
  dismiss = () => finish((config) => config.revert());
  const confirm = (item: string) => finish((config) => void config.confirm(item));

  createEffect(() => {
    const config = session();
    if (!config || dialog.open) return;
    returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery("");
    setSelected(Math.max(0, config.items.indexOf(config.checked)));
    dialog.showModal();
    dialog.querySelector("input")?.focus();
  });
  createEffect(() => {
    selected();
    matches();
    list?.querySelector(".selected")?.scrollIntoView({ block: "nearest" });
  });

  const onKeyDown = (e: KeyboardEvent) => {
    const key = pickerKey(e);
    if (!key) return;
    e.preventDefault();
    const found = matches();
    if (key === "confirm") {
      if (found[selected()]) confirm(found[selected()].item);
    } else if (found.length) {
      select(key === "first" ? 0 : key === "last" ? found.length - 1 : moveSelection(found.length, selected(), key === "next" ? 1 : -1));
    }
  };

  return (
    <dialog
      class="picker"
      ref={dialog}
      aria-label={session()?.placeholder}
      onKeyDown={onKeyDown}
      onCancel={(e) => { e.preventDefault(); dismiss?.(); }}
      // P-001: a left press on the backdrop (the dialog box itself, outside its content) closes it.
      onMouseDown={(e) => { if (e.target === dialog && e.button === 0) dismiss?.(); }}
    >
      <Show when={session()}>{(config) => <>
        <div class="picker-input-row">
          <input
            class="picker-input"
            data-text-input
            role="combobox"
            aria-expanded="true"
            aria-controls="picker-list"
            aria-activedescendant={matches()[selected()] ? `picker-item-${selected()}` : undefined}
            placeholder={config().placeholder}
            value={query()}
            onInput={(e) => { setQuery(e.currentTarget.value); select(0); }}
          />
        </div>
        <div class="picker-list" id="picker-list" role="listbox" ref={list}>
          <Show when={matches().length} fallback={<div class="picker-empty">No matches</div>}>
            <For each={matches()}>{(match, i) =>
              <div
                class="picker-item"
                id={`picker-item-${i()}`}
                classList={{ selected: selected() === i() }}
                role="option"
                aria-selected={selected() === i()}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                onPointerMove={() => selected() !== i() && select(i())}
                onClick={() => confirm(match.item)}
              >
                <span class="picker-label">
                  <For each={match.item.split("")}>{(ch, k) => <span classList={{ match: match.positions.includes(k()) }}>{ch}</span>}</For>
                </span>
                <Show when={match.item === config().checked}><span class="picker-check"><Icon name="check" /></span></Show>
              </div>
            }</For>
          </Show>
        </div>
        <div class="picker-footer">
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => finish((c) => { c.revert(); c.footer.run(); })}>{config().footer.label}</button>
        </div>
      </>}</Show>
    </dialog>
  );
}

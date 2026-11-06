import { batch, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { shortcutFor } from "../keymap/display.ts";
import { commands, focusStack, hooks, keymap } from "../keymap/keyboard.ts";
import { MENU_POPUP_OFFSET, MENU_SHORTCUT_ACTIVATE_DELAY_MS } from "../spec/metrics.ts";
import { MENUS } from "./app-menus.ts";
import Icon from "./Icon.tsx";
import { cycle, first, last, placeMenu, step, type MenuEntry } from "./menu.ts";
import { tooltip } from "./tooltip.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";

// The one menu implementation (R-8, R-9): the title bar menu (a button, then a horizontal bar of menu names with the
// open menu below) and right-click menus (a popup at a point). State is module level because the keymap's menu::*
// actions and F10 act on it from outside the component.
type Point = { x: number; y: number };
type Keys = (string[] | undefined)[];

const [open, setOpen] = createSignal<number | null>(null); // title bar menu: index in MENUS
// right-click menu; `right`: `at` is the popup's top-right corner (I-706 split button), else its top-left
const [context, setContext] = createSignal<{ at: Point; list: MenuEntry[]; keys: Keys; right: boolean } | null>(null);
const [selected, setSelected] = createSignal<number | null>(null); // index in the shown entries
const [shortcuts, setShortcuts] = createSignal<Keys[]>([]); // title bar menu: per menu, per entry
let restore: HTMLElement | null = null; // focus before the menu opened (I-309)
// Where the pointer is, and where it was when the menu opened: a name under a pointer that has not moved since
// then (the bar appears under it) is not a hover switch (I-303).
let pointer: Point = { x: -1, y: -1 };
let pointerAtOpen = pointer;

export const isOpen = () => open() !== null || context() !== null;
const entries = (): MenuEntry[] => context()?.list ?? (open() === null ? [] : MENUS[open()!].entries);

/** Lookup of the shortcut of an entry in the context focused just before the menu opened (I-307). */
const keysOf = (list: MenuEntry[]): Keys => {
  const stack = focusStack();
  return list.map((e) => (e === "separator" || !e.action ? undefined : shortcutFor(keymap, e.action, stack)));
};

function remember(): void {
  restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  pointerAtOpen = pointer;
}

function openMenu(index: number): void {
  if (!isOpen()) {
    remember();
    setShortcuts(MENUS.map((m) => keysOf(m.entries)));
  }
  batch(() => {
    setContext(null);
    setOpen(index);
    setSelected(null);
  });
}

/** R-15, R-14 and later the project panel: a right-click menu at `at`. Entries run a function or a command. */
export function openContextMenu(at: Point, list: MenuEntry[], right = false): void {
  if (!isOpen()) remember();
  batch(() => {
    setOpen(null);
    setContext({ at, list, keys: keysOf(list), right });
    setSelected(null);
  });
}

function closeMenu(refocus: boolean): void {
  if (!isOpen()) return;
  batch(() => {
    setOpen(null);
    setContext(null);
    setSelected(null);
  });
  if (refocus) restore?.focus();
  restore = null;
}

function run(index: number): void {
  const entry = entries()[index];
  if (entry === undefined || entry === "separator" || entry.disabled) return;
  closeMenu(true); // I-309: the original focus is back before the command goes
  if (entry.run) entry.run();
  else if (entry.action) commands.get(entry.action)?.();
}

const switchTo = (index: number) => {
  if (open() !== index) openMenu(index);
};

// Actions of the `menu` key context (I-517). With no menu open they do nothing: the sidebar and the project
// panel bind the same names in their own contexts and put their handlers in front of these.
commands.set("menu::SelectNext", () => isOpen() && setSelected(step(entries(), selected(), 1)));
commands.set("menu::SelectPrevious", () => isOpen() && setSelected(step(entries(), selected(), -1)));
commands.set("menu::SelectFirst", () => isOpen() && setSelected(first(entries())));
commands.set("menu::SelectLast", () => isOpen() && setSelected(last(entries())));
commands.set("menu::Confirm", () => {
  const i = selected();
  if (isOpen() && i !== null) run(i);
});
commands.set("menu::Cancel", () => closeMenu(true));
// No submenus here (I-304), so Right / Left move along the bar (I-303).
commands.set("menu::SelectChild", () => open() !== null && openMenu(cycle(MENUS.length, open()!, 1)));
commands.set("menu::SelectParent", () => open() !== null && openMenu(cycle(MENUS.length, open()!, -1)));
commands.set("app_menu::Toggle", () => (isOpen() ? closeMenu(true) : openMenu(0)));

const appWindow = getCurrentWindow();
commands.set("zed::Quit", () => void appWindow.close()); // one window, so closing it ends the app
commands.set("workspace::CloseWindow", () => void appWindow.close());
commands.set("zed::Minimize", () => void appWindow.minimize());
commands.set("zed::Zoom", () => void appWindow.toggleMaximize());

// I-520: a shortcut pressed while the menu is open selects its item, then closes and runs it after a short delay.
hooks.beforeCommand = (name) => {
  if (!isOpen()) return false;
  const index = entries().findIndex((e) => e !== "separator" && e.action === name && !e.disabled);
  if (index < 0) return false;
  setSelected(index);
  const shown = entries();
  setTimeout(() => entries() === shown && run(index), MENU_SHORTCUT_ACTIVATE_DELAY_MS);
  return true;
};

const keepFocus = (e: MouseEvent) => e.preventDefault(); // a click must not take focus from the menu or the page

function Entries(props: { list: MenuEntry[]; keys: Keys }) {
  return (
    <For each={props.list}>
      {(entry, i) =>
        entry === "separator" ? (
          <div class="menu-separator" role="separator" />
        ) : (
          <div
            class="menu-item"
            classList={{ selected: selected() === i(), disabled: entry.disabled }}
            role="menuitem"
            aria-disabled={entry.disabled || undefined}
            onMouseDown={keepFocus}
            onClick={() => run(i())}
          >
            <span>{entry.label}</span>
            <Show when={props.keys[i()]}>
              {(chunks) => (
                <span class="menu-shortcut">
                  <For each={chunks()}>
                    {(chunk, k) => (
                      <>
                        {k() ? " " : ""}
                        <span>{chunk}</span>
                      </>
                    )}
                  </For>
                </span>
              )}
            </Show>
          </div>
        )
      }
    </For>
  );
}

export default function AppMenu() {
  let root!: HTMLDivElement;
  let bar: HTMLDivElement | undefined;
  let popup: HTMLDivElement | undefined;
  let contextPopup: HTMLDivElement | undefined;
  // Position goes through an adopted sheet, not an inline style (AGENTS 5).
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  /** Measure the popup at the origin, then put it where `anchor` says and keep it in the window (I-314, I-501). */
  const place = (el: HTMLElement, anchor: Point, right = false) => {
    sheet.replaceSync(".menu { left: 0px; top: 0px; }");
    const { width, height } = el.getBoundingClientRect();
    const at = placeMenu(right ? { x: anchor.x - width, y: anchor.y } : anchor, { w: width, h: height }, { w: innerWidth, h: innerHeight });
    sheet.replaceSync(`.menu { left: ${at.x}px; top: ${at.y}px; }`);
    el.focus({ preventScroll: true }); // so the menu keys work
  };

  onMount(() => {
    // I-519: a press outside the menu closes it.
    const outside = (e: PointerEvent) => isOpen() && !root.contains(e.target as Node) && closeMenu(false);
    const track = (e: PointerEvent) => (pointer = { x: e.clientX, y: e.clientY });
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("pointermove", track, true);
    onCleanup(() => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("pointermove", track, true);
    });
  });

  // After each open or switch: put the popup under the open menu's name.
  createEffect(() => {
    const index = open();
    if (index === null || !bar || !popup) return;
    const anchor = bar.children[index].getBoundingClientRect();
    place(popup, { x: anchor.left + MENU_POPUP_OFFSET.x, y: anchor.bottom + MENU_POPUP_OFFSET.y });
  });
  createEffect(() => {
    const c = context();
    if (c && contextPopup) place(contextPopup, c.at, c.right);
  });

  return (
    <div
      class="app-menu"
      ref={root}
      // I-519: losing focus (another window, a click elsewhere) closes the menu.
      onFocusOut={(e) => isOpen() && !root.contains(e.relatedTarget as Node | null) && closeMenu(false)}
    >
      <Show
        when={open() !== null}
        fallback={
          <button
            class="icon-button"
            aria-label="Open Application Menu"
            ref={(el) => tooltip(el, () => (isOpen() ? null : { title: "Open Application Menu" }))} // L-205, L-225
            onMouseDown={keepFocus}
            onClick={() => openMenu(0)}
          >
            <Icon name="menu" />
          </button>
        }
      >
        <div class="menu-bar" ref={bar}>
          <For each={MENUS}>
            {(menu, i) => (
              <button
                class="menu-name"
                classList={{ open: open() === i() }}
                onMouseDown={keepFocus}
                onClick={() => switchTo(i())}
                onPointerMove={(e) => (e.clientX !== pointerAtOpen.x || e.clientY !== pointerAtOpen.y) && switchTo(i())}
              >
                {menu.name}
              </button>
            )}
          </For>
        </div>
        <div class="menu" ref={popup} tabindex="-1" role="menu" data-keymap-context="menu">
          <Entries list={entries()} keys={shortcuts()[open() ?? 0] ?? []} />
        </div>
      </Show>
      <Show when={context()}>
        {(c) => (
          <div class="menu" ref={contextPopup} tabindex="-1" role="menu" data-keymap-context="menu">
            <Entries list={c().list} keys={c().keys} />
          </div>
        )}
      </Show>
    </div>
  );
}

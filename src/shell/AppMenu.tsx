import { batch, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { shortcutFor } from "../keymap/display.ts";
import { commands, focusStack, hooks, keymap } from "../keymap/keyboard.ts";
import { MENU_POPUP_OFFSET, MENU_SHORTCUT_ACTIVATE_DELAY_MS } from "../spec/metrics.ts";
import { MENUS } from "./app-menus.ts";
import Icon from "./Icon.tsx";
import { cycle, first, last, placeMenu, step, type MenuEntry } from "./menu.ts";
import { tooltip } from "./tooltip.ts";

// The title bar menu button (R-8, R-9): one button; open, a horizontal bar of menu names and the open menu below.
// State is module level because the keymap's menu::* actions and F10 act on it from outside the component.
const [open, setOpen] = createSignal<number | null>(null); // index in MENUS
const [selected, setSelected] = createSignal<number | null>(null); // index in the open menu's entries
const [shortcuts, setShortcuts] = createSignal<(string[] | undefined)[][]>([]); // per menu, per entry
let restore: HTMLElement | null = null; // focus before the menu opened (I-309)
// Where the pointer is, and where it was when the menu opened: a name under a pointer that has not moved since
// then (the bar appears under it) is not a hover switch (I-303).
let pointer = { x: -1, y: -1 };
let pointerAtOpen = pointer;

const entries = (): MenuEntry[] => (open() === null ? [] : MENUS[open()!].entries);

function openMenu(index: number): void {
  if (open() === null) {
    restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pointerAtOpen = pointer;
    // I-307: shortcuts come from the context focused just before the menu opened, else from the whole window.
    const stack = focusStack();
    setShortcuts(MENUS.map((m) => m.entries.map((e) => (e === "separator" ? undefined : shortcutFor(keymap, e.action, stack)))));
  }
  batch(() => {
    setOpen(index);
    setSelected(null);
  });
}

function closeMenu(refocus: boolean): void {
  if (open() === null) return;
  batch(() => {
    setOpen(null);
    setSelected(null);
  });
  if (refocus) restore?.focus();
  restore = null;
}

function run(index: number): void {
  const entry = entries()[index];
  if (entry === undefined || entry === "separator" || entry.disabled) return;
  closeMenu(true); // I-309: the original focus is back before the command goes
  commands.get(entry.action)?.();
}

const switchTo = (index: number) => {
  if (open() !== index) openMenu(index);
};

// Actions of the `menu` key context (I-517). With no menu open they do nothing: the sidebar and the project
// panel (Phase 4, 5) bind the same names and must chain their own handlers in front of these.
commands.set("menu::SelectNext", () => open() !== null && setSelected(step(entries(), selected(), 1)));
commands.set("menu::SelectPrevious", () => open() !== null && setSelected(step(entries(), selected(), -1)));
commands.set("menu::SelectFirst", () => open() !== null && setSelected(first(entries())));
commands.set("menu::SelectLast", () => open() !== null && setSelected(last(entries())));
commands.set("menu::Confirm", () => {
  const i = selected();
  if (open() !== null && i !== null) run(i);
});
commands.set("menu::Cancel", () => closeMenu(true));
// No submenus here (I-304), so Right / Left move along the bar (I-303).
commands.set("menu::SelectChild", () => open() !== null && openMenu(cycle(MENUS.length, open()!, 1)));
commands.set("menu::SelectParent", () => open() !== null && openMenu(cycle(MENUS.length, open()!, -1)));
commands.set("app_menu::Toggle", () => (open() === null ? openMenu(0) : closeMenu(true)));

const appWindow = getCurrentWindow();
commands.set("zed::Quit", () => void appWindow.close()); // one window, so closing it ends the app
commands.set("workspace::CloseWindow", () => void appWindow.close());
commands.set("zed::Minimize", () => void appWindow.minimize());
commands.set("zed::Zoom", () => void appWindow.toggleMaximize());

// I-520: a shortcut pressed while the menu is open selects its item, then closes and runs it after a short delay.
hooks.beforeCommand = (name) => {
  const menu = open();
  if (menu === null) return false;
  const index = entries().findIndex((e) => e !== "separator" && e.action === name && !e.disabled);
  if (index < 0) return false;
  setSelected(index);
  setTimeout(() => open() === menu && run(index), MENU_SHORTCUT_ACTIVATE_DELAY_MS);
  return true;
};

const keepFocus = (e: MouseEvent) => e.preventDefault(); // a click must not take focus from the menu or the page

export default function AppMenu() {
  let root!: HTMLDivElement;
  let bar: HTMLDivElement | undefined;
  let popup: HTMLDivElement | undefined;
  // Position goes through an adopted sheet, not an inline style (AGENTS 5).
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  onMount(() => {
    // I-519: a press outside the menu closes it.
    const outside = (e: PointerEvent) => open() !== null && !root.contains(e.target as Node) && closeMenu(false);
    const track = (e: PointerEvent) => (pointer = { x: e.clientX, y: e.clientY });
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("pointermove", track, true);
    onCleanup(() => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("pointermove", track, true);
    });
  });

  // After each open or switch: put the popup under the open menu's name, then focus it so the menu keys work.
  createEffect(() => {
    const index = open();
    if (index === null || !bar || !popup) return;
    const anchor = bar.children[index].getBoundingClientRect();
    sheet.replaceSync(".menu { left: 0px; top: 0px; }"); // measure at the origin, then place
    const { width, height } = popup.getBoundingClientRect();
    const at = placeMenu(
      { x: anchor.left + MENU_POPUP_OFFSET.x, y: anchor.bottom + MENU_POPUP_OFFSET.y },
      { w: width, h: height },
      { w: innerWidth, h: innerHeight },
    );
    sheet.replaceSync(`.menu { left: ${at.x}px; top: ${at.y}px; }`);
    popup.focus({ preventScroll: true });
  });

  return (
    <div
      class="app-menu"
      ref={root}
      // I-519: losing focus (another window, a click elsewhere) closes the menu.
      onFocusOut={(e) => open() !== null && !root.contains(e.relatedTarget as Node | null) && closeMenu(false)}
    >
      <Show
        when={open() !== null}
        fallback={
          <button
            class="icon-button"
            aria-label="Open Application Menu"
            ref={(el) => tooltip(el, () => (open() !== null ? null : { title: "Open Application Menu" }))} // L-205, L-225
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
          <For each={entries()}>
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
                  <Show when={shortcuts()[open() ?? 0]?.[i()]}>
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
        </div>
      </Show>
    </div>
  );
}

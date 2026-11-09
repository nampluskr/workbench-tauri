import { batch, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { commands, focusStack, hooks, keymap, onKeyDown } from "../keymap/keyboard.ts";
import { MENU_POPUP_OFFSET, MENU_SHORTCUT_ACTIVATE_DELAY_MS, USER_MENU_POPUP_OFFSET } from "../spec/metrics.ts";
import { APP_NAME, appMenus, userMenu } from "./app-menus.ts";
import { dockOpen, setDockOpen } from "./panels.ts";
import { dockWidth, resetDockWidth } from "./dock.ts";
import { isClassicLayout } from "./layout.ts";
import { activeTabOf, closeTab } from "../workspace/context.ts";
import { editorContext as activeContext } from "../workspace/store.ts";
import { openUrl } from "@tauri-apps/plugin-opener";
import { notify } from "./toast.ts";
import { FONT_LICENSES, licenseText } from "./licenses.ts";
import Icon from "./Icon.tsx";
import { closeOnFocusOut, cycle, first, hoverMenuItem, last, placeMenu, placeSubmenu, shortcutForEntry, step, type MenuEntry } from "./menu.ts";
import { tooltip } from "./tooltip.ts";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getVersion } from "@tauri-apps/api/app";

// The one menu implementation (R-8, R-9): the title bar menu (a button, then a horizontal bar of menu names with the
// open menu below) and right-click menus (a popup at a point). State is module level because the keymap's menu::*
// actions and F10 act on it from outside the component.
type Point = { x: number; y: number };
type Keys = (string[] | undefined)[];

const MENUS = appMenus(() => {
  const ctx = activeContext();
  const tab = ctx && activeTabOf(ctx.pane());
  return !tab || !!tab.markdown || !/\.(md|markdown)$/i.test(tab.path);
});

const [open, setOpen] = createSignal<number | null>(null); // title bar menu: index in MENUS
// right-click menu; `right`: `at` is the popup's top-right corner (I-706 split button), else its top-left
const [context, setContext] = createSignal<{ at: Point; list: MenuEntry[]; keys: Keys; right: boolean } | null>(null);
const [selected, setSelected] = createSignal<number | null>(null); // index in the shown entries
const [shortcuts, setShortcuts] = createSignal<Keys[]>([]); // title bar menu: per menu, per entry
const [child, setChild] = createSignal<{ parent: number; list: MenuEntry[]; keys: Keys; at: Point; left: number } | null>(null);
let rootPopup: HTMLDivElement | undefined;
let childPopup: HTMLDivElement | undefined;
let restore: HTMLElement | null = null; // focus before the menu opened (I-309)
let menuStack: ReturnType<typeof focusStack> = [];
// Where the pointer is, and where it was when the menu opened: a name under a pointer that has not moved since
// then (the bar appears under it) is not a hover switch (I-303).
let pointer: Point = { x: -1, y: -1 };
let pointerAtOpen = pointer;

export const isOpen = () => open() !== null || context() !== null;
export const isContextMenuOpen = (list: MenuEntry[]) => context()?.list === list;
export const appMenuExpanded = () => open() !== null;
const rootEntries = (): MenuEntry[] => context()?.list ?? (open() === null ? [] : MENUS[open()!].entries);
const entries = (): MenuEntry[] => child()?.list ?? rootEntries();

/** Lookup of the shortcut of an entry in the context focused just before the menu opened (I-307). */
const keysOf = (list: MenuEntry[]): Keys => {
  const stack = menuStack;
  return list.map((e) => shortcutForEntry(e, keymap, stack));
};

function remember(): void {
  restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  menuStack = focusStack();
  pointerAtOpen = pointer;
}

function openMenu(index: number): void {
  if (!isOpen()) {
    remember();
    setShortcuts(MENUS.map((m) => keysOf(m.entries)));
  }
  batch(() => {
    setContext(null);
    setChild(null);
    setOpen(index);
    setSelected(null);
  });
}

/** R-15, R-14 and later the project panel: a right-click menu at `at`. Entries run a function or a command. */
export function openContextMenu(at: Point, list: MenuEntry[], right = false): void {
  if (!isOpen()) remember();
  batch(() => {
    setOpen(null);
    setChild(null);
    setContext({ at, list, keys: keysOf(list), right });
    setSelected(null);
  });
}

function closeMenu(refocus: boolean): void {
  if (!isOpen()) return;
  batch(() => {
    setOpen(null);
    setContext(null);
    setChild(null);
    setSelected(null);
  });
  if (refocus) restore?.focus();
  restore = null;
}

function openChild(index: number): void {
  const entry = rootEntries()[index];
  if (!entry || entry === "separator" || entry.disabled || !entry.children) return;
  const row = rootPopup?.children[index]?.getBoundingClientRect();
  const parent = rootPopup?.getBoundingClientRect();
  if (!row || !parent) return;
  batch(() => {
    setChild({ parent: index, list: entry.children!, keys: keysOf(entry.children!), at: { x: parent.right, y: row.top }, left: parent.left });
    setSelected(null);
  });
}

function closeChild(): void {
  const parent = child()?.parent;
  setChild(null);
  setSelected(parent ?? null);
  rootPopup?.focus({ preventScroll: true });
}

function run(index: number, inChild = child() !== null): void {
  const entry = (inChild ? child()?.list : rootEntries())?.[index];
  if (entry === undefined || entry === "separator" || entry.disabled) return;
  if (entry.children) return openChild(index);
  closeMenu(true); // I-309: the original focus is back before the command goes
  if (entry.run) entry.run();
  else if (entry.url) void openUrl(entry.url).catch((error) => notify([String(error)]));
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
commands.set("menu::Cancel", () => child() ? closeChild() : closeMenu(true));
commands.set("menu::SelectChild", () => {
  if (child()) return;
  const i = selected();
  const entry = i === null ? undefined : rootEntries()[i];
  if (entry && entry !== "separator" && entry.children) openChild(i!);
  else if (open() !== null) openMenu(cycle(MENUS.length, open()!, 1));
});
commands.set("menu::SelectParent", () => child() ? closeChild() : open() !== null && openMenu(cycle(MENUS.length, open()!, -1)));
commands.set("app_menu::Toggle", () => (isOpen() ? closeMenu(true) : openMenu(0)));

const USER_MENU = userMenu(() => isClassicLayout(dockOpen(), dockWidth()));
commands.set("workspace::UseClassicLayout", () => { setDockOpen(true); resetDockWidth(); });
const appWindow = getCurrentWindow();
commands.set("zed::Quit", () => void appWindow.close()); // Main-window destruction also closes Settings after the save guard.
commands.set("workspace::CloseWindow", () => void appWindow.close());
commands.set("zed::Minimize", () => void appWindow.minimize());
commands.set("zed::Zoom", () => void appWindow.toggleMaximize());
commands.set("workspace::CloseActiveItem", () => {
  const ctx = activeContext();
  const tab = ctx && activeTabOf(ctx.pane());
  if (ctx && tab) void closeTab(ctx, tab.file, true);
});

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

function Entries(props: { list: MenuEntry[]; keys: Keys; child?: boolean }) {
  return (
    <For each={props.list}>
      {(entry, i) =>
        entry === "separator" ? (
          <div class="menu-separator" role="separator" />
        ) : (
          <div
            class="menu-item"
            id={`menu-${props.child ? "child" : "root"}-item-${i()}`}
            classList={{ selected: !props.child && child() ? child()!.parent === i() : selected() === i(), disabled: entry.disabled }}
            role={entry.checked !== undefined ? "menuitemcheckbox" : "menuitem"}
            aria-checked={entry.checked}
            aria-disabled={entry.disabled || undefined}
            aria-haspopup={entry.children ? "menu" : undefined}
            aria-expanded={entry.children ? child()?.parent === i() : undefined}
            onMouseDown={keepFocus}
            onPointerMove={() => {
              const hover = hoverMenuItem(entry, i(), child()?.parent ?? null, !!props.child);
              if (hover.closeChild) closeChild();
              if (hover.openChild) openChild(i());
              if (hover.select) setSelected(i());
            }}
            onClick={() => run(i(), !!props.child)}
          >
            <span><Show when={entry.checked}>✓ </Show>{entry.label}</span>
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
            <Show when={entry.children}><Icon name="chevron_right" /></Show>
          </div>
        )
      }
    </For>
  );
}

export default function AppMenu(props: { popupOnly?: boolean } = {}) {
  let root!: HTMLDivElement;
  let bar: HTMLDivElement | undefined;
  let popup: HTMLDivElement | undefined;
  let contextPopup: HTMLDivElement | undefined;
  let licenses!: HTMLDialogElement;
  let about!: HTMLDialogElement;
  let aboutFocus: HTMLElement | null = null;
  const [aboutVersion, setAboutVersion] = createSignal("");
  commands.set("zed::About", () => {
    void getVersion().then((version) => {
      aboutFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setAboutVersion(version);
      about.showModal();
    }).catch((error) => notify([String(error)]));
  });
  let licenseFocus: HTMLElement | null = null;
  const [notices, setNotices] = createSignal("");
  const copies = import.meta.glob<string>(["../assets/zed-icons/LICENSE*", "../theme/assets/**/LICENSE*", "../assets/icon-themes/**/LICENSE*", "../assets/zed-grammars/licenses/**/*", "../licenses/*.txt"], { query: "?raw", import: "default", eager: true });
  commands.set("zed::OpenLicenses", () => {
    licenseFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setNotices("Loading licenses…");
    licenses.showModal();
    const sources: Record<string, () => Promise<string>> = Object.fromEntries(Object.entries(copies).map(([name, text]) => [name, async () => text]));
    for (const name of ["LICENSES", "LICENSE-GPL", "LICENSE-APACHE"]) {
      const path = `../assets/zed-icons/${name}`;
      sources[path] ??= async () => { throw new Error("Missing copy"); };
    }
    for (const path of FONT_LICENSES) sources[path] = async () => {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Missing copy");
      return response.text();
    };
    void licenseText(sources).then(setNotices);
  });
  // Position goes through an adopted sheet, not an inline style (AGENTS 5).
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

  /** Measure the popup at the origin, then put it where `anchor` says and keep it in the window (I-314, I-501). */
  let rootRule = "";
  const place = (el: HTMLElement, anchor: Point, right = false, parentLeft?: number) => {
    const nested = parentLeft !== undefined;
    const selector = nested ? ".menu-child" : ".menu-root";
    sheet.replaceSync(`${nested ? rootRule : ""} ${selector} { left: 0px; top: 0px; }`);
    const { width, height } = el.getBoundingClientRect();
    const size = { w: width, h: height };
    const view = { w: innerWidth, h: innerHeight };
    const at = nested ? placeSubmenu({ left: parentLeft, right: anchor.x, top: anchor.y }, size, view)
      : placeMenu(right ? { x: anchor.x - width, y: anchor.y } : anchor, size, view);
    const rule = `${selector} { left: ${at.x}px; top: ${at.y}px; }`;
    if (!nested) { rootRule = rule; rootPopup = el as HTMLDivElement; }
    sheet.replaceSync(nested ? rootRule + rule : rule);
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
  createEffect(() => {
    const c = child();
    if (c && childPopup) place(childPopup, c.at, false, c.left);
  });

  return (
    <div
      class="app-menu"
      ref={root}
      onKeyDown={(event) => { if (props.popupOnly) onKeyDown(event); }}
      // I-519: check settled focus so removing a submenu does not close its replacement.
      onFocusOut={() => closeOnFocusOut(root, () => isOpen() && closeMenu(false))}
    >
      <Show when={!props.popupOnly}><Show
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
        <div class="menu menu-root" ref={popup} tabindex="-1" role="menu" data-keymap-context="menu">
          <Entries list={rootEntries()} keys={shortcuts()[open() ?? 0] ?? []} />
        </div>
      </Show></Show>
      <Show when={context()}>
        {(c) => (
          <div id="context-menu" class="menu menu-root" ref={contextPopup} tabindex="-1" role="menu" aria-label={props.popupOnly ? "Settings options" : undefined} aria-activedescendant={selected() !== null && !child() ? `menu-root-item-${selected()}` : undefined} data-keymap-context="menu">
            <Entries list={c().list} keys={c().keys} />
          </div>
        )}
      </Show>
      <Show when={child()}>{(c) => (
        <div class="menu menu-child" ref={childPopup} tabindex="-1" role="menu" data-keymap-context="menu">
          <Entries list={c().list} keys={c().keys} child />
        </div>
      )}</Show>
      <dialog class="about-dialog" ref={about} aria-label={`About ${APP_NAME}`} onClose={() => aboutFocus?.focus()}>
        <h1>{APP_NAME} {aboutVersion()}</h1>
      </dialog>
      <dialog class="license-dialog" ref={licenses} aria-label="Dependency Licenses" onClose={() => licenseFocus?.focus()}>
        <h1>Dependency Licenses</h1>
        <button onClick={() => licenses.close()}>Close</button>
        <pre>{notices()}</pre>
      </dialog>
    </div>
  );
}

export function UserMenuButton() {
  return <button class="icon-button user-menu-button" aria-label="User menu" aria-haspopup="menu" aria-expanded={context()?.list === USER_MENU}
    onMouseDown={keepFocus} onClick={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      openContextMenu({ x: r.right + USER_MENU_POPUP_OFFSET.x, y: r.bottom + USER_MENU_POPUP_OFFSET.y }, USER_MENU, true);
    }}><Icon name="chevron_down" /></button>;
}

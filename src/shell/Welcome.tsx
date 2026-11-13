import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import "./AppMenu.tsx"; // its menu::* handlers are registered first; the chains below sit over them
import Icon from "./Icon.tsx";
import { chain as chainWhen } from "./chain.ts";
import { commands, keymap } from "../keymap/keyboard.ts";
import { shortcutFor } from "../keymap/display.ts";
import { userKeymapText } from "../keymap/load.ts";
import { folders, openFolder, recentFolders } from "../workspace/store.ts";
import { RECENT_MAX, recentAction, stepRow, welcomeSections } from "../workspace/recent.ts";
import iconUrl from "../../src-tauri/icons/icon.png?no-inline"; // ?no-inline: CSP img-src 'self' blocks a data: URL (as About.tsx)

// core v0.8.2 I-3: the Welcome screen of a Pane with no folder open, after Zed's (crates/workspace/src/welcome.rs; no code taken).
// Keys are looked up where the screen sits, so they do not change with the focus.
const STACK = [new Set(["Workspace"]), new Set(["Pane"]), new Set(["Welcome", "menu"])];
const sections = () => welcomeSections(recentFolders(), (action) => shortcutFor(keymap, action, STACK));
const rows = () => sections().flatMap((section) => section.rows);
const run = (action: string) => commands.get(action)?.();

// The keyboard's row (Up / Down / Tab, Enter); -1 is none. Module level: the menu::* commands are, too.
const [selected, setSelected] = createSignal(-1);
const focused = () => !!document.activeElement?.closest(".welcome");
const chain = (name: string, handler: () => void) => chainWhen(name, focused, handler);
chain("menu::SelectNext", () => setSelected((i) => stepRow(rows().length, i, 1)));
chain("menu::SelectPrevious", () => setSelected((i) => stepRow(rows().length, i, -1)));
chain("menu::SelectFirst", () => setSelected(rows().length ? 0 : -1));
chain("menu::SelectLast", () => setSelected(rows().length - 1));
chain("menu::Confirm", () => { const row = rows()[selected()]; if (row) run(row.action); });
for (let i = 0; i < RECENT_MAX; i++) {
  commands.set(recentAction(i), () => { const path = recentFolders()[i]; if (path && folders().length === 0) void openFolder(path); });
}

export default function Welcome() {
  let el!: HTMLDivElement;
  const shown = createMemo(() => { userKeymapText(); return sections(); }); // a changed keymap.json shows its keys
  const offset = (section: number) => shown().slice(0, section).reduce((n, s) => n + s.rows.length, 0);
  onMount(() => {
    setSelected(-1);
    if (document.activeElement === document.body) el.focus(); // at startup, so the keys work; never taken from another area
  });
  return (
    <div class="welcome" ref={el} tabindex="-1" data-keymap-context="Welcome menu">
      <div class="welcome-content">
        <div class="welcome-header">
          <img class="welcome-logo" src={iconUrl} alt="" />
          <div>
            <h1>Welcome to Workbench</h1>
            <p>A compact, powerful editor</p>
          </div>
        </div>
        <For each={shown()}>{(section, s) => (
          <section aria-label={section.title}>
            <div class="welcome-section-header"><span>{section.title}</span><span class="welcome-rule" /></div>
            <For each={section.rows}>{(row, r) => (
              <button class="welcome-row" classList={{ selected: selected() === offset(s()) + r() }} tabindex="-1" onClick={() => run(row.action)}>
                <Icon name={row.icon} />
                <span class="welcome-label">{row.label}</span>
                <Show when={row.keys}>
                  <span class="tooltip-shortcut"><For each={row.keys}>{(key) => <span class="tooltip-key">{key}</span>}</For></span>
                </Show>
              </button>
            )}</For>
          </section>
        )}</For>
      </div>
    </div>
  );
}

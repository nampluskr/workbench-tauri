import { createEffect, createMemo, For, Show } from "solid-js";
import { commands } from "../keymap/keyboard.ts";
import { SIDEBAR_WIDTH } from "../spec/metrics.ts";
import { displayNames } from "../workspace/folders.ts";
import {
  activateFolder,
  activeId,
  addFolder,
  cursorId,
  folders,
  missingIds,
  moveCursor,
  moveFolder,
  removeFolder,
  setCursor,
  sidebarWidth,
} from "../workspace/store.ts";
import { openContextMenu } from "./AppMenu.tsx";
import Icon from "./Icon.tsx";
import type { MenuEntry } from "./menu.ts";

// The registered folders (R-11~R-16): one row each, a keyboard cursor apart from the active folder (D-8).

const sidebarFocused = () => !!document.querySelector(".sidebar-list")?.contains(document.activeElement);

/** The menu actions are shared by name with the app menu: act only with focus in the list, else hand on (P3-2). */
function chain(name: string, handler: () => void): void {
  const previous = commands.get(name);
  commands.set(name, () => (sidebarFocused() ? handler() : previous?.()));
}
chain("menu::SelectNext", () => moveCursor(1)); // A-17.3
chain("menu::SelectPrevious", () => moveCursor(-1));
chain("menu::Confirm", () => cursorId() && activateFolder(cursorId()!)); // A-17.4
chain("project_panel::RemoveFromProject", () => cursorId() && removeFolder(cursorId()!)); // A-17.5, A-13.4
commands.set("workspace::Open", () => void addFolder()); // A-13.1

/** I-667, I-934, I-935, I-940: Move Up / Move Down only with two or more folders; Remove always. */
function menuFor(id: string): MenuEntry[] {
  const list = folders();
  const index = list.findIndex((f) => f.id === id);
  const removeItem: MenuEntry = { label: "Remove", run: () => removeFolder(id) };
  if (list.length < 2) return [removeItem];
  return [
    { label: "Move Up", run: () => moveFolder(id, -1), disabled: index === 0 },
    { label: "Move Down", run: () => moveFolder(id, 1), disabled: index === list.length - 1 },
    "separator",
    removeItem,
  ];
}

export default function FolderList() {
  let list!: HTMLDivElement;
  const names = createMemo(() => displayNames(folders().map((f) => f.path)));
  // The width read from state.json; the default needs no rule (A-11.1).
  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  createEffect(() => sheet.replaceSync(sidebarWidth() === SIDEBAR_WIDTH.default ? "" : `.sidebar { width: ${sidebarWidth()}px; }`));
  // Keep the cursor row in view when the keys move it.
  createEffect(() => {
    cursorId();
    list.querySelector(".cursor")?.scrollIntoView({ block: "nearest" });
  });

  return (
    <div class="sidebar-list" ref={list} tabindex="0" role="listbox" data-keymap-context="Sidebar">
      <For each={folders()}>
        {(folder, i) => (
          <div
            class="sidebar-item"
            classList={{ active: activeId() === folder.id, cursor: cursorId() === folder.id, missing: missingIds().has(folder.id) }}
            role="option"
            aria-selected={activeId() === folder.id}
            onClick={() => activateFolder(folder.id)}
            onContextMenu={(e) => {
              setCursor(folder.id);
              openContextMenu({ x: e.clientX, y: e.clientY }, menuFor(folder.id));
            }}
          >
            <Icon name="folder" />
            <span class="sidebar-item-name">
              {names()[i()].name}
              <Show when={names()[i()].parent}>
                <span class="sidebar-item-parent"> · {names()[i()].parent}</span>
              </Show>
            </span>
          </div>
        )}
      </For>
    </div>
  );
}

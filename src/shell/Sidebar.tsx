import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { commands } from "../keymap/keyboard.ts";
import { chain as chainWhen } from "./chain.ts";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { displayNames, filterFolders, folderLabel, folderNameParts, isSorted, type Folder, type FolderSort } from "../workspace/folders.ts";
import { inputKeyAction } from "../workspace/names.ts";
import {
  activateFolder, activeId, addFolder, closeFolders, cursorId, folders, missingIds, moveCursor,
  moveFolder, removeFolder, renameFolder, setCursor, sortFolderList,
} from "../workspace/store.ts";
import { openContextMenu } from "./AppMenu.tsx";
import Icon from "./Icon.tsx";
import type { MenuEntry } from "./menu.ts";
import { focusSidebar, toggleSidebar } from "./panels.ts";
import SidebarTitle from "./SidebarTitle.tsx";

const listFocused = () => document.activeElement === document.querySelector(".sidebar-list");
const chain = (name: string, handler: () => void) => chainWhen(name, listFocused, handler);
chain("menu::Confirm", () => cursorId() && activateFolder(cursorId()!));
chain("project_panel::RemoveFromProject", () => cursorId() && removeFolder(cursorId()!));
commands.set("workspace::Open", () => void addFolder());

// core v0.8.3 I-7: the two right-click menus. Every row runs a function, so none shows a key: Copy Path and Reveal act on the
// folder, not on the open file their keys act on.
function folderMenu(folder: Folder, rename: () => void): MenuEntry[] {
  const ids = folders().map((f) => f.id);
  return [
    { label: "Close", run: () => void removeFolder(folder.id) },
    { label: "Close Others", disabled: ids.length < 2, run: () => void closeFolders(ids.filter((id) => id !== folder.id)) },
    { label: "Close All", run: () => void closeFolders(ids) },
    "separator",
    { label: "Rename", run: rename },
    "separator",
    { label: "Copy Path", run: () => void navigator.clipboard.writeText(folder.path).catch(() => {}) },
    { label: "Reveal in File Explorer", run: () => void revealItemInDir(folder.path).catch(() => {}) },
  ];
}

function listMenu(): MenuEntry[] {
  // Sorted once, as the footer's two buttons do; checked only while the list is in that order.
  const sort = (label: string, by: FolderSort): MenuEntry => ({ label, checked: isSorted(folders(), by), run: () => sortFolderList(by) });
  return [
    { label: "Open Folder...", run: () => void addFolder() },
    { label: "Close All", run: () => void closeFolders(folders().map((f) => f.id)) },
    "separator",
    sort("Sort by Name (A to Z)", "name"),
    sort("Sort by Name (Z to A)", "name-desc"),
    "separator",
    sort("Sort by Date Added (Oldest First)", "added"),
    sort("Sort by Date Added (Newest First)", "added-desc"),
  ];
}

/** Reuse ProjectTree's inline input and IME handling; only the saved display name changes. */
function NameInput(props: { name: string; commit: (name: string) => void; cancel: () => void }) {
  let input!: HTMLInputElement;
  let composedAt = -Infinity;
  let gone = false;
  onMount(() => { input.focus(); input.select(); });
  onCleanup(() => { gone = true; });
  return <input class="tree-input" ref={input} value={props.name} aria-label="Folder display name"
    data-text-input spellcheck={false} autocomplete="off"
    onCompositionEnd={(e) => { composedAt = e.timeStamp; }}
    onKeyDown={(e) => {
      const action = inputKeyAction(e, e.timeStamp - composedAt);
      if (!action) return;
      e.preventDefault();
      if (action === "commit") props.commit(input.value);
      else props.cancel();
    }}
    onBlur={() => { if (!gone && document.hasFocus()) props.commit(input.value); }}
    onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} />;
}

export default function FolderList() {
  let list!: HTMLDivElement;
  let search!: HTMLInputElement;
  const [query, setQuery] = createSignal("");
  const [editing, setEditing] = createSignal<string | null>(null);
  const [target, setTarget] = createSignal<string | null>(null);
  const visible = createMemo(() => filterFolders(folders(), query()));
  const names = createMemo(() => displayNames(folders().map((f) => f.path), folders().map(folderLabel)));
  chain("menu::SelectNext", () => moveCursor(1, visible()));
  chain("menu::SelectPrevious", () => moveCursor(-1, visible()));
  createEffect(() => {
    cursorId(); query();
    list.querySelector(".cursor")?.scrollIntoView({ block: "nearest" });
  });
  const finishRename = () => { setEditing(null); list.focus(); };

  // Follow the tab drag protocol: left pointer capture, first movement starts, Escape/lost capture cancels.
  let dragEnded = false;
  function startDrag(e: PointerEvent, id: string) {
    if (e.button !== 0 || (e.target as Element).closest("button, input")) return;
    const el = e.currentTarget as HTMLElement;
    const [x, y] = [e.clientX, e.clientY];
    let started = false;
    let done = false;
    el.setPointerCapture(e.pointerId);
    const move = (m: PointerEvent) => {
      if (!started && m.clientX === x && m.clientY === y) return;
      started = true;
      const row = document.elementFromPoint(m.clientX, m.clientY)?.closest<HTMLElement>(".sidebar-item");
      setTarget(row?.dataset.folderId ?? null);
    };
    const finish = (drop: boolean) => {
      if (done) return;
      done = true;
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("lostpointercapture", lost);
      window.removeEventListener("keydown", escape, true);
      const to = target();
      setTarget(null);
      if (!started) return;
      dragEnded = true;
      setTimeout(() => { dragEnded = false; });
      if (drop && to) moveFolder(id, to);
    };
    const up = () => finish(true);
    const lost = () => finish(false);
    const escape = (k: KeyboardEvent) => {
      if (k.key !== "Escape") return;
      k.preventDefault(); k.stopPropagation(); finish(false);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("lostpointercapture", lost);
    window.addEventListener("keydown", escape, true);
  }

  return <>
    <div class="sidebar-header" data-tauri-drag-region>
      <div class="sidebar-search"><Icon name="magnifying_glass" />
        <input ref={search} data-text-input aria-label="Search folders" placeholder="Search" value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)} />
        <Show when={query()}>
          <button class="icon-button sidebar-search-clear" aria-label="Clear folder search" onClick={() => { setQuery(""); search.focus(); }}><Icon name="close" /></button>
        </Show>
      </div>
    </div>
    <SidebarTitle icon="threads_sidebar_left_open" title="Folder" focus={focusSidebar} close={toggleSidebar} />
    <div class="sidebar-list" ref={list} tabindex="0" role="listbox" aria-label="Folders"
      onContextMenu={(e) => openContextMenu({ x: e.clientX, y: e.clientY }, listMenu())}>
      <For each={visible()}>{(folder) => {
        const name = () => names()[folders().findIndex((f) => f.id === folder.id)];
        return <div class="sidebar-item" data-folder-id={folder.id}
          classList={{ active: activeId() === folder.id, cursor: cursorId() === folder.id,
            missing: missingIds().has(folder.id), "drop-target": target() === folder.id }}
          role="option" aria-selected={activeId() === folder.id}
          onPointerDown={(e) => startDrag(e, folder.id)}
          onClick={(e) => { if (!dragEnded && !(e.target as Element).closest("button, input")) { list.focus(); activateFolder(folder.id); } }}
          onContextMenu={(e) => {
            setCursor(folder.id);
            e.stopPropagation(); // not the list's menu too
            openContextMenu({ x: e.clientX, y: e.clientY }, folderMenu(folder, () => setEditing(folder.id)));
          }}>
          <Icon name="folder" />
          <Show when={editing() === folder.id} fallback={<span class="sidebar-item-name">
            <For each={folderNameParts(name().name, query())}>{(part) => <span classList={{ "sidebar-match": part.match }}>{part.text}</span>}</For><Show when={name().parent}><span class="sidebar-item-parent"> · {name().parent}</span></Show>
          </span>}>
            <NameInput name={folderLabel(folder)} cancel={finishRename}
              commit={(value) => { renameFolder(folder.id, value); finishRename(); }} />
          </Show>
          <button class="tab-close" aria-label={`Remove ${folderLabel(folder)}`} onClick={(e) => {
            e.stopPropagation(); void removeFolder(folder.id);
          }}><Icon name="close" /></button>
        </div>;
      }}</For>
    </div>
  </>;
}

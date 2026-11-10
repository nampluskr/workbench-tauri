import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { commands, keymap } from "../keymap/keyboard.ts";
import { shortcutFor } from "../keymap/display.ts";
import { chain as chainWhen } from "./chain.ts";
import { displayNames, filterFolders, folderLabel, folderNameParts } from "../workspace/folders.ts";
import { inputKeyAction } from "../workspace/names.ts";
import {
  activateFolder, activeId, addFolder, cursorId, folders, missingIds, moveCursor,
  moveFolder, removeFolder, renameFolder, setCursor,
} from "../workspace/store.ts";
import { openContextMenu } from "./AppMenu.tsx";
import Icon from "./Icon.tsx";
import type { MenuEntry } from "./menu.ts";

const listFocused = () => document.activeElement === document.querySelector(".sidebar-list");
const chain = (name: string, handler: () => void) => chainWhen(name, listFocused, handler);
chain("menu::Confirm", () => cursorId() && activateFolder(cursorId()!));
chain("project_panel::RemoveFromProject", () => cursorId() && removeFolder(cursorId()!));
commands.set("workspace::Open", () => void addFolder());

function menuFor(rename: () => void): MenuEntry[] {
  return [{ label: "Rename", run: rename }];
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
  const searchCommand = () => { search.focus(); search.select(); };
  commands.set("sidebar::Search", searchCommand);
  chain("menu::SelectNext", () => moveCursor(1, visible()));
  chain("menu::SelectPrevious", () => moveCursor(-1, visible()));
  onCleanup(() => {
    if (commands.get("sidebar::Search") === searchCommand) commands.delete("sidebar::Search");
  });
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
        <Show when={query()} fallback={<span class="menu-shortcut">{shortcutFor(keymap, "sidebar::Search", [new Set(["Workspace"]), new Set(["Sidebar"])])?.map((chunk) => chunk.replaceAll("-", "+")).join(" ")}</span>}>
          <button class="icon-button" aria-label="Clear folder search" onClick={() => { setQuery(""); search.focus(); }}><Icon name="close" /></button>
        </Show>
      </div>
    </div>
    <div class="sidebar-list" ref={list} tabindex="0" role="listbox" aria-label="Folders">
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
            openContextMenu({ x: e.clientX, y: e.clientY }, menuFor(() => setEditing(folder.id)));
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

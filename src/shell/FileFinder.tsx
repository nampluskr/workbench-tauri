import { createEffect, createSignal, For, Show } from "solid-js";
import { commands } from "../keymap/keyboard.ts";
import { activeId, folders } from "../workspace/store.ts";
import { searchRoots } from "../workspace/folders.ts";
import { fileRow, type FileRow } from "../search/entries.ts";
import { openEntry, searchNames } from "../search/names.ts";
import FileIcon from "./FileIcon.tsx";
import { moveSelection, pickerKey } from "./picker.ts";
import "./picker.css";

// U-22 Open File (Zed file_finder::Toggle): a modal like the theme pickers (same dialog, classes and keys), listing the files
// whose name contains the typed text, searched with the Search tab's name search in the same folder.
const MAX_ROWS = 100; // shortcut: the first 100 files in path order, no ranking; raise or rank when a long result list matters
const SEARCH_DELAY_MS = 120; // a keystroke starts a new walk that cannot be cancelled in Rust, so wait for a pause

const [shown, setShown] = createSignal(false);
let dismiss: (() => void) | undefined;
commands.set("file_finder::Toggle", () => (shown() ? dismiss?.() : setShown(true)));

export function FileFinderHost() {
  let dialog!: HTMLDialogElement;
  let list: HTMLDivElement | undefined;
  let returnTo: HTMLElement | null = null;
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const [query, setQuery] = createSignal("");
  const [rows, setRows] = createSignal<FileRow[]>([]);
  const [selected, setSelected] = createSignal(0);
  const [root, setRoot] = createSignal("");

  const close = () => {
    if (!shown()) return;
    generation++;
    clearTimeout(timer);
    setShown(false);
    dialog.close();
    returnTo?.focus();
  };
  dismiss = close;
  const confirm = (row: FileRow) => { close(); openEntry(root(), { path: row.path, isDir: false }); };

  const search = (text: string) => {
    const id = ++generation;
    setRows([]);
    setSelected(0);
    if (!text) return;
    const folderRoot = root();
    const onEvent = (event: Parameters<Parameters<typeof searchNames>[1]>[0]) => {
      if (id !== generation || event.kind !== "entry") return;
      const row = fileRow(event.entry, folderRoot);
      if (row) setRows((old) => [...old, row]);
      if (rows().length >= MAX_ROWS) generation++;
    };
    void searchNames({ roots: [folderRoot], query: text, caseSensitive: false, wholeWord: false, all: false }, onEvent, () => id !== generation).catch(() => {});
  };

  createEffect(() => {
    if (!shown() || dialog.open) return;
    returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setRoot(searchRoots(folders(), activeId())[0] ?? "");
    setQuery("");
    setRows([]);
    setSelected(0);
    dialog.showModal();
    dialog.querySelector("input")?.focus();
  });
  createEffect(() => {
    selected();
    list?.querySelector(".selected")?.scrollIntoView({ block: "nearest" });
  });

  const onKeyDown = (e: KeyboardEvent) => {
    const key = pickerKey(e);
    if (!key) return;
    e.preventDefault();
    const found = rows();
    if (key === "confirm") {
      if (found[selected()]) confirm(found[selected()]);
    } else if (found.length) {
      setSelected(key === "first" ? 0 : key === "last" ? found.length - 1 : moveSelection(found.length, selected(), key === "next" ? 1 : -1));
    }
  };

  return (
    <dialog
      class="picker"
      ref={dialog}
      aria-label="Open File"
      onKeyDown={onKeyDown}
      onCancel={(e) => { e.preventDefault(); close(); }}
      onMouseDown={(e) => { if (e.target === dialog && e.button === 0) close(); }}
    >
      <Show when={shown()}>
        <div class="picker-input-row">
          <input
            class="picker-input"
            data-text-input
            role="combobox"
            aria-expanded="true"
            aria-controls="file-finder-list"
            aria-activedescendant={rows()[selected()] ? `file-finder-item-${selected()}` : undefined}
            placeholder="Search project files..."
            value={query()}
            onInput={(e) => {
              setQuery(e.currentTarget.value);
              clearTimeout(timer);
              timer = setTimeout(() => search(query()), SEARCH_DELAY_MS);
            }}
          />
        </div>
        <div class="picker-list" id="file-finder-list" role="listbox" ref={list}>
          <For each={rows()}>{(row, i) =>
            <div
              class="picker-item"
              id={`file-finder-item-${i()}`}
              classList={{ selected: selected() === i() }}
              role="option"
              aria-selected={selected() === i()}
              onMouseDown={(e) => e.preventDefault()}
              onPointerMove={() => selected() !== i() && setSelected(i())}
              onClick={() => confirm(row)}
            >
              <span class="picker-file">
                <FileIcon name={row.name} dir={false} />
                <span class="picker-file-name">{row.name}</span>
                <span class="picker-file-dir">{row.rel}</span>
              </span>
            </div>
          }</For>
        </div>
      </Show>
    </dialog>
  );
}

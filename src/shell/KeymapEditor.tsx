import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { render } from "solid-js/web";
import { invoke } from "@tauri-apps/api/core";
import { BUILTIN } from "../keymap/builtin.ts";
import { actionLabel, appendBinding, filterBindings, isUserKeymapPath, keymapRows, KEYMAP_EDITOR_BINDINGS, type BindingRow } from "../keymap/edit.ts";
import { displayChunks } from "../keymap/display.ts";
import { Keymap, strokeOf } from "../keymap/engine.ts";
import { commands } from "../keymap/keyboard.ts";
import { loadUserKeymap, userKeymapText } from "../keymap/load.ts";
import { allTabs, openFile, openTool } from "../workspace/context.ts";
import { eachContext, editorContext } from "../workspace/store.ts";
import { KEYMAP_RECORD_MAX_STROKES } from "../spec/metrics.ts";
import { SETTINGS_BINDINGS } from "../settings/model.ts";
import { EXTENSIONS_BINDINGS } from "../extensions/model.ts";
import { THEME_SELECTOR_BINDINGS } from "../theme/selector.ts";
import { notify } from "./toast.ts";
import Icon from "./Icon.tsx";
import "./keymap-editor.css";

const editors = new WeakMap<HTMLElement, { create: () => void }>();
commands.set("keymap_editor::CreateKeybinding", () => {
  const root = document.activeElement?.closest<HTMLElement>(".keymap-editor");
  if (root) editors.get(root)?.create();
});
commands.set("keymap_editor::EditInJson", () => void editJson());

async function editJson(): Promise<void> {
  try {
    const path = await invoke<string>("ensure_user_keymap");
    openFile(editorContext(), path, false, true);
  } catch (error) { notify([String(error)]); }
}

function KeymapEditor() {
  let root!: HTMLDivElement;
  let modal!: HTMLDialogElement;
  let recorder!: HTMLDivElement;
  const [filter, setFilter] = createSignal("");
  const [editing, setEditing] = createSignal<BindingRow | undefined>();
  const [action, setAction] = createSignal("");
  const [context, setContext] = createSignal("");
  const [keys, setKeys] = createSignal<string[]>([]);
  const [recording, setRecording] = createSignal(false);
  const [error, setError] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const actions = () => [...commands.keys()].sort();
  const loaded = createMemo(() => {
    try { return { rows: keymapRows([...BUILTIN, ...KEYMAP_EDITOR_BINDINGS, ...SETTINGS_BINDINGS, ...EXTENSIONS_BINDINGS, ...THEME_SELECTOR_BINDINGS], userKeymapText(), actions()), error: "" }; }
    catch (error) { return { rows: [], error: String(error) }; }
  });
  const rows = createMemo(() => filterBindings(loaded().rows, filter()));
  let expected: string | null = null;
  const begin = (row?: BindingRow) => {
    if (modal.open) return;
    if (Array.isArray(row?.action)) { notify(["Action arguments are not supported by this app. Edit this binding in JSON."]); return; }
    expected = userKeymapText();
    setEditing(row);
    setAction(row?.action === null ? "<null>" : typeof row?.action === "string" ? row.action : "");
    setContext(row?.context ?? "");
    setKeys(row?.keys ? row.keys.split(" ") : []);
    setRecording(false);
    setError("");
    modal.showModal();
  };
  const save = async () => {
    if (saving()) return;
    setError("");
    try {
      const target = action() === "<null>" ? null : action();
      if (target !== null && !commands.has(target)) throw new Error("Choose an action supported by this app.");
      const probe = new Keymap();
      probe.add("user", [{ context: context(), keys: keys().join(" "), action: target }]);
      let dirtyJson = false;
      eachContext((ctx) => { dirtyJson ||= allTabs(ctx).some((t) => isUserKeymapPath(t.path) && t.file.doc.dirty); });
      if (dirtyJson) throw new Error("Save the open keymap.json editor before changing bindings here.");
      const json = appendBinding(expected, context(), keys().join(" "), target, editing());
      setSaving(true);
      await invoke("write_user_keymap", { expected, json });
      await loadUserKeymap();
      modal.close();
    } catch (error) { setError(String(error)); await loadUserKeymap(); }
    finally { setSaving(false); }
  };
  onCleanup(() => editors.delete(root));
  return <div class="keymap-editor" tabindex="-1" data-keymap-context="KeymapEditor" ref={(el) => { root = el; editors.set(el, { create: () => begin() }); }}
    onKeyDown={(e) => {
      if (e.defaultPrevented || modal.open || !e.ctrlKey || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() === "k") { e.preventDefault(); begin(); }
      else if (e.key.toLowerCase() === "e") { e.preventDefault(); void editJson(); }
    }}>
    <div class="keymap-top">
      <input class="keymap-search" data-text-input aria-label="Filter action names" placeholder="Filter action names…" value={filter()} onInput={(e) => setFilter(e.currentTarget.value)} />
      <div class="keymap-buttons">
        <button onClick={() => void editJson()}>Edit in JSON <span>Ctrl-E</span></button>
        <button onClick={() => begin()}>Create Keybinding <span>Ctrl-K</span></button>
      </div>
    </div>
    <Show when={loaded().error}><div role="alert">{loaded().error}</div></Show>
    <div class="keymap-table-scroll">
      <table class="keymap-table">
        <colgroup><col class="keymap-col-icon" /><col class="keymap-col-action" /><col class="keymap-col-arguments" /><col class="keymap-col-keys" /><col class="keymap-col-context" /><col class="keymap-col-source" /></colgroup>
        <thead><tr><th aria-label="Edit" /><th>Action</th><th>Arguments</th><th>Keystrokes</th><th>Context</th><th>Source</th></tr></thead>
        <tbody><For each={rows()}>{(row) => <tr tabindex="0" onDblClick={() => begin(row)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); begin(row); } }}>
          <td><button aria-label={`Edit ${actionLabel(row.action)}`} onClick={() => begin(row)}><Icon name="pencil" /></button></td>
          <td>{actionLabel(row.action)}</td><td>{Array.isArray(row.action) ? JSON.stringify(row.action[1]) : row.action === null ? "<null>" : "<no arguments>"}</td>
          <td>{row.keys ? displayChunks(row.keys).join(" ") : ""}</td><td title={row.context}>{row.context || "<global>"}</td><td>{row.source}</td>
        </tr>}</For></tbody>
      </table>
    </div>
    <dialog class="keymap-modal" ref={modal} onClose={() => { setRecording(false); root.focus(); }} onCancel={(e) => { if (saving()) e.preventDefault(); }}>
      <form onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <header>{editing() ? actionLabel(editing()!.action) : "Create Keybinding"}</header>
        <label>Action<input data-text-input list="keymap-actions" placeholder="Type an action name" value={action()} onInput={(e) => setAction(e.currentTarget.value)} /></label>
        <datalist id="keymap-actions"><option value="<null>" /><For each={actions()}>{(name) => <option value={name}>{actionLabel(name)}</option>}</For></datalist>
        <label>Edit Keystroke</label>
        <div class="keymap-recorder" tabindex="0" ref={recorder} data-keymap-recording={recording() ? "" : undefined}
          onFocusOut={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setRecording(false); }} onKeyDown={(e) => {
            if (!recording()) return;
            e.preventDefault(); e.stopPropagation();
            const stroke = strokeOf(e);
            if (!stroke || e.repeat) return;
            const next = [...keys(), stroke];
            setKeys(next);
            if (next.length >= KEYMAP_RECORD_MAX_STROKES) setRecording(false);
          }}>
          <span>{recording() ? "REC" : ""}</span><span>{keys().map((key) => displayChunks(key).join(" ")).join(" ") || "No keystrokes"}</span>
          <button type="button" onClick={() => { setKeys([]); setRecording(true); recorder.focus(); }}>Record</button>
        </div>
        <label>Edit Context<input data-text-input placeholder="Keybinding Context" value={context()} onInput={(e) => setContext(e.currentTarget.value)} /></label>
        <Show when={error()}><div class="keymap-error" role="alert">{error()}</div></Show>
        <footer><button type="button" disabled={saving()} onClick={() => modal.close()}>Cancel</button><button type="submit" disabled={saving()}>Save</button></footer>
      </form>
    </dialog>
  </div>;
}

commands.set("zed::OpenKeymap", () => {
  openTool(editorContext(), "Keymap Editor", () => {
    const element = document.createElement("div");
    element.className = "keymap-tab";
    element.tabIndex = -1;
    element.onfocus = () => element.querySelector<HTMLElement>(".keymap-editor")?.focus();
    const dispose = render(() => <KeymapEditor />, element);
    return { element, dispose };
  });
});

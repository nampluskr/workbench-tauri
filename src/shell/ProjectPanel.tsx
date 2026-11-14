import { createMemo, Show } from "solid-js";
import { activeFolder, contextOf, folders, missingIds, removeFolder } from "../workspace/store.ts";
import ProjectTree from "./ProjectTree.tsx";

// The left Dock's content: the active folder's tree (R-18), or the states without one (R-16).
export default function ProjectPanel() {
  const gone = () => {
    const folder = activeFolder();
    return folder !== null && missingIds().has(folder.id) ? folder : null;
  };
  // One tree per folder: switching folders mounts the other folder's context (A-15.2).
  const tree = createMemo(() => {
    const folder = activeFolder();
    return folder && !missingIds().has(folder.id) ? contextOf(folder) : null;
  });
  const editing = () => !!tree()?.edit();
  // I-030: the panel is a `menu` context too, so Up / Down / Home / End are the menu actions (P-022: editing / not_editing).
  return (
    <div class="project-panel" tabindex="-1" data-keymap-context={`ProjectPanel menu ${editing() ? "editing" : "not_editing"}`}>
      <Show when={tree()} keyed>
        {(ctx) => <ProjectTree ctx={ctx} />}
      </Show>
      {/* core v0.8.2 I-3: one line, drawn as the Outline's "No outline"; folders are opened from the Welcome screen, the menu or the key */}
      <Show when={folders().length === 0}><div class="outline-empty">No Folder</div></Show>
      <Show when={gone()}>
        {(folder) => (
          <>
            <p>This folder no longer exists.</p>
            <button class="panel-button" onClick={() => removeFolder(folder().id)}>
              Remove
            </button>
          </>
        )}
      </Show>
    </div>
  );
}

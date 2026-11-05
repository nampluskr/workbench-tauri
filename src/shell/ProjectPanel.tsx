import { Show } from "solid-js";
import { activeFolder, addFolder, folders, missingIds, removeFolder } from "../workspace/store.ts";

// The left Dock's content. Only the states without a tree are here (R-16); the tree comes with Phase 5.
export default function ProjectPanel() {
  const gone = () => {
    const folder = activeFolder();
    return folder !== null && missingIds().has(folder.id) ? folder : null;
  };
  return (
    <div class="project-panel" tabindex="-1" data-keymap-context="ProjectPanel">
      <Show when={folders().length === 0}>
        <p>Choose one of the options below to use the Project Panel</p>
        <button class="panel-button" onClick={() => void addFolder()}>
          Open Project
        </button>
      </Show>
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

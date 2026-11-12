import { createMemo, For, Show } from "solid-js";
import TitleBar from "./shell/TitleBar.tsx";
import { IconButton } from "./shell/Icon.tsx";
import FolderList from "./shell/Sidebar.tsx";
import ProjectPanel from "./shell/ProjectPanel.tsx";
import OutlineBar from "./shell/Outline.tsx";
import { PaneArea } from "./shell/Pane.tsx";
import { resizeHandle } from "./shell/dock.ts";
import { dockOpen, sidebarOpen, toggleSidebar } from "./shell/panels.ts";
import { addFolder, editorContext, outlineOpen, sidebarWidth, resizeSidebar, toggleLockPreview } from "./workspace/store.ts";
import { activeTabOf, lockPreview } from "./workspace/context.ts";
import { statusButtons, statusItems } from "./shell/status.ts";
import { commands, focusStack } from "./keymap/keyboard.ts";
import { adjustFontSize, toggleViewOption } from "./settings/load.ts";
import { fontTarget } from "./editor/font-size.ts";
import { toggleApplies, type ToggleOption } from "./editor/view-options.ts";
import { PickerHost } from "./shell/Picker.tsx";
import { FileFinderHost } from "./shell/FileFinder.tsx";

commands.set("markdown::ToggleLockPreview", toggleLockPreview);
// I-1: one action each; the focused editor or preview is the target, anything else does nothing.
const zoom = (direction: -1 | 0 | 1) => () => { const target = fontTarget(focusStack()); if (target) adjustFontSize(target, direction); };
commands.set("zed::IncreaseBufferFontSize", zoom(1));
commands.set("zed::DecreaseBufferFontSize", zoom(-1));
commands.set("zed::ResetBufferFontSize", zoom(0));
// I-6 / I-7: a focused editor flips the option in every open editor (Markdown ones only for wrapping), unsaved.
const toggle = (option: ToggleOption) => () => { if (toggleApplies(focusStack(), option)) toggleViewOption(option); };
commands.set("editor::ToggleLineNumbers", toggle("lineNumbers"));
commands.set("editor::ToggleSoftWrap", toggle("wordWrap"));

// Core D-9 / I-18: icon names follow the pinned Zed sources (K-08 report).
export default function App() {
  const status = createMemo(() => statusItems(activeTabOf(editorContext().pane())));
  return (
    <>
      <aside class="sidebar" hidden={!sidebarOpen()} data-keymap-context="Sidebar">
        <div class="dock-resize-handle" ref={(el) => resizeHandle(el, { width: sidebarWidth, setWidth: resizeSidebar })} />
        <FolderList />
        {/* A-11.8 (sidebar open): toggle on the left, Add Project at the right end. */}
        <div class="sidebar-footer">
          <div class="group grow">
            {/* L-232: two rows, Toggle Sidebar and Focus Sidebar, each with its key. */}
            <IconButton
              name="threads_sidebar_left_open"
              label="Toggle Sidebar"
              onClick={toggleSidebar}
              tips={[
                { title: "Toggle Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar" },
                { title: "Focus Sidebar", action: "multi_workspace::FocusWorkspaceSidebar" },
              ]}
            />
          </div>
          <div class="group">
            <IconButton name="folder_add" label="Add Project" action="workspace::Open" onClick={() => void addFolder()} />
          </div>
        </div>
      </aside>
      <div class="workspace">
        <TitleBar />
        <div class="workspace-body">
          <aside class="dock-left" hidden={!dockOpen()}>
            <div class="dock-resize-handle" ref={resizeHandle} />
            <ProjectPanel />
          </aside>
          {/* core v0.8.1 I-4: between the left Dock and the Panes; it stays when the Dock is closed. */}
          <OutlineBar />
          {/* L-15 / D-8: the active folder's split tree of Panes (R-26, R-9). */}
          <PaneArea />
        </div>
        {/* I-22: the closed sidebar's toggle precedes the project panel, then the Outline (core v0.8.1 I-4) and search. */}
        <footer class="status-bar">
          <div class="group grow">
            <For each={statusButtons(sidebarOpen(), dockOpen(), lockPreview(), outlineOpen())}>{(button) => (<>
              <IconButton {...button} onClick={() => commands.get(button.action)?.()} />
              <Show when={button.dividerAfter}><span class={button.dividerAfter === "toggle" ? "status-divider toggle" : "status-divider"} aria-hidden="true" /></Show>
            </>)}</For>
          </div>
          <Show when={status()}>{(items) => (
            <div class="group status-items">
              <span>{items().position}</span>
              <Show when={items().filetype}><span>{items().filetype}</span></Show>
            </div>
          )}</Show>
        </footer>
      </div>
      <PickerHost />
      <FileFinderHost />
    </>
  );
}

import { createMemo, For, Show } from "solid-js";
import TitleBar from "./shell/TitleBar.tsx";
import { IconButton } from "./shell/Icon.tsx";
import FolderList from "./shell/Sidebar.tsx";
import ProjectPanel from "./shell/ProjectPanel.tsx";
import { PaneArea } from "./shell/Pane.tsx";
import { resizeHandle } from "./shell/dock.ts";
import { dockOpen, sidebarOpen, toggleSidebar } from "./shell/panels.ts";
import { addFolder, editorContext, sidebarWidth, resizeSidebar } from "./workspace/store.ts";
import { activeTabOf } from "./workspace/context.ts";
import { statusButtons, statusItems } from "./shell/status.ts";
import { commands } from "./keymap/keyboard.ts";
import { PickerHost } from "./shell/Picker.tsx";

// Core D-9 / I-18: icon names follow the pinned Zed sources (K-08 report).
export default function App() {
  const status = createMemo(() => statusItems(activeTabOf(editorContext().pane())));
  return (
    <>
      <aside class="sidebar" hidden={!sidebarOpen()} data-keymap-context="Sidebar">
        <div class="dock-resize-handle" ref={(el) => resizeHandle(el, { width: sidebarWidth, setWidth: resizeSidebar })} />
        {/* The header sits in the title bar row, so it drags the window too (L-12). */}
        <div class="sidebar-header" data-tauri-drag-region />
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
          {/* L-15 / D-8: the active folder's split tree of Panes (R-26, R-9). */}
          <PaneArea />
        </div>
        {/* I-22: the closed sidebar's toggle precedes the project panel and search. */}
        <footer class="status-bar">
          <div class="group grow">
            <For each={statusButtons(sidebarOpen(), dockOpen())}>{(button) => (<>
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
    </>
  );
}

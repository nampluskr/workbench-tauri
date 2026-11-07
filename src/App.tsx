import { createMemo, Show } from "solid-js";
import TitleBar from "./shell/TitleBar.tsx";
import { IconButton } from "./shell/Icon.tsx";
import FolderList from "./shell/Sidebar.tsx";
import ProjectPanel from "./shell/ProjectPanel.tsx";
import { PaneArea } from "./shell/Pane.tsx";
import { resizeHandle } from "./shell/dock.ts";
import { dockOpen, sidebarOpen, toggleDock, togglePanelFocus, toggleSidebar } from "./shell/panels.ts";
import { addFolder, editorContext } from "./workspace/store.ts";
import { activeTabOf } from "./workspace/context.ts";
import { statusItems } from "./shell/status.ts";
import { PickerHost } from "./shell/Picker.tsx";

// Core D-9 / I-18: icon names follow the pinned Zed sources (K-08 report).
export default function App() {
  const status = createMemo(() => statusItems(activeTabOf(editorContext().pane())));
  return (
    <>
      <aside class="sidebar" hidden={!sidebarOpen()}>
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
        {/* A-11.8 / A-11.9: with the sidebar closed its toggle and Add Project come to the left of the status bar. */}
        <footer class="status-bar">
          <div class="group grow">
            <Show when={!sidebarOpen()}>
              <IconButton
                name="threads_sidebar_left_closed"
                label="Open Folder Sidebar"
                action="multi_workspace::ToggleWorkspaceSidebar"
                onClick={toggleSidebar}
              />
              <IconButton name="folder_add" label="Add Project" action="workspace::Open" onClick={() => void addFolder()} />
            </Show>
            {/* L-253 / L-254: open and active it closes the Dock, otherwise it opens the panel. */}
            <Show
              when={dockOpen()}
              fallback={<IconButton name="file_tree" label="Project Panel" action="project_panel::ToggleFocus" onClick={togglePanelFocus} />}
            >
              <IconButton name="file_tree" label="Close Left Dock" action="workspace::ToggleLeftDock" onClick={toggleDock} />
            </Show>
          </div>
          <Show when={status()}>{(items) => (
            <div class="group status-items">
              <span>{items().position}</span>
              <span>{items().filetype}</span>
            </div>
          )}</Show>
        </footer>
      </div>
      <PickerHost />
    </>
  );
}

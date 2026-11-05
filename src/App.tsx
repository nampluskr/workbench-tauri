import TitleBar from "./shell/TitleBar.tsx";
import { IconButton } from "./shell/Icon.tsx";
import { resizeHandle } from "./shell/dock.ts";

// Icon choice per element follows workbench-gpui v0.3 src/ui/layout.rs (D-20).
export default function App() {
  return (
    <>
      <aside class="sidebar">
        {/* The header sits in the title bar row, so it drags the window too (L-12). */}
        <div class="sidebar-header" data-tauri-drag-region />
        <div class="sidebar-list" />
        {/* A-11.8 (sidebar open): toggle on the left, Add Project at the right end. */}
        <div class="sidebar-footer">
          <div class="group grow">
            {/* L-232: two rows, Toggle Sidebar and Focus Sidebar, each with its key. */}
            <IconButton
              name="panel-left"
              label="Toggle Sidebar"
              tips={[
                { title: "Toggle Sidebar", action: "multi_workspace::ToggleWorkspaceSidebar" },
                { title: "Focus Sidebar", action: "multi_workspace::FocusWorkspaceSidebar" },
              ]}
            />
          </div>
          <div class="group">
            <IconButton name="folder" label="Add Project" action="workspace::Open" />
          </div>
        </div>
      </aside>
      <div class="workspace">
        <TitleBar />
        <div class="workspace-body">
          <aside class="dock-left">
            <div class="dock-resize-handle" ref={resizeHandle} />
          </aside>
          {/* L-15: one Pane = tab bar + active item. No tabs at start (SPEC Q-A). */}
          <section class="pane" data-keymap-context="Pane">
            <div class="tab-bar">
              <div class="tab-bar-edge start">
                <IconButton name="arrow-left" label="Go Back" />
                <IconButton name="arrow-right" label="Go Forward" />
              </div>
              <div class="tab-bar-filler" />
              <div class="tab-bar-edge end">
                <IconButton name="plus" label="New…" />
                <IconButton name="panel-right" label="Split Pane" />
                <IconButton name="maximize" label="Zoom In" />
              </div>
            </div>
            <div class="pane-body" />
          </section>
        </div>
        {/* A-11.8 (sidebar open): the project panel toggle is the only left item. */}
        <footer class="status-bar">
          <div class="group grow">
            <IconButton name="folder-open" label="Close Left Dock" action="workspace::ToggleLeftDock" />
          </div>
        </footer>
      </div>
    </>
  );
}

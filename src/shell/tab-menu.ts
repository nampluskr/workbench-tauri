import { hasPreview } from "../editor/preview-kind.ts";
import type { KeymapSection } from "../keymap/engine.ts";
import type { CloseMode, TabInfo } from "../workspace/tabs.ts";
import type { MenuEntry, MenuItem } from "./menu.ts";

export const CLOSE_ACTIONS: Record<string, CloseMode> = {
  "pane::CloseOtherItems": "others",
  "pane::CloseItemsToTheLeft": "left",
  "pane::CloseItemsToTheRight": "right",
  "pane::CloseCleanItems": "clean",
  "pane::CloseAllItems": "all",
};

export const TAB_BINDINGS: KeymapSection[] = [{ context: "Pane", bindings: {
  "ctrl-alt-shift-t": "pane::CloseOtherItems",
  "ctrl-k e": "pane::CloseItemsToTheLeft",
  "ctrl-k t": "pane::CloseItemsToTheRight",
  "ctrl-k u": "pane::CloseCleanItems",
  "ctrl-k w": "pane::CloseAllItems",
  "ctrl-k p": "workspace::CopyPath",
  "ctrl-k r": "editor::RevealInFileManager",
  "ctrl-shift-e": "pane::RevealInProjectPanel",
  "ctrl-shift-v": "markdown::OpenPreview",
} }];

export type MenuTab = TabInfo & { dirty: boolean; readOnly: boolean };

/** I-9: the clicked tab determines the groups, labels and disabled states. */
export function tabMenu(tabs: MenuTab[], index: number): MenuEntry[] {
  const tab = tabs[index];
  const item = (label: string, action?: string, disabled = false): MenuItem => ({ label, action, disabled });
  const groups: MenuItem[][] = [
    [{ ...item("Close", "pane::CloseActiveItem"), shortcut: "" }, item("Close Others", "pane::CloseOtherItems", tabs.length === 1)],
    [item("Close Left", "pane::CloseItemsToTheLeft", index === 0), item("Close Right", "pane::CloseItemsToTheRight", index === tabs.length - 1)],
    [item("Close Clean", "pane::CloseCleanItems", !tabs.some((t) => !t.dirty)), item("Close All", "pane::CloseAllItems")],
  ];
  if (!tab.tool) groups.push([item(tab.readOnly ? "Make Tab Editable" : "Make Tab Read-Only", "pane::ToggleReadOnly")]);
  groups.push([item(tab.pinned ? "Unpin Tab" : "Pin Tab", "pane::TogglePinTab")]);
  if (tab.markdown) groups.push([item("Show Source", "markdown::CloseAndReturnToEditor")]);
  else if (!tab.tool) {
    groups.push(
      [item("Copy Path", "workspace::CopyPath"), { ...item("Copy Relative Path", "workspace::CopyRelativePath"), shortcut: "" }],
      [item("Reveal in File Explorer", "editor::RevealInFileManager"), item("Reveal in Tree Sidebar", "pane::RevealInProjectPanel")],
    );
    if (hasPreview(tab.path)) groups.push([item("Open Preview", "markdown::OpenPreview")]);
  }
  return groups.flatMap((group, i): MenuEntry[] => i ? ["separator", ...group] : group);
}

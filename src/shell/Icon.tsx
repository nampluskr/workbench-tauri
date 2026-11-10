// Core D-9: restore the ignored, pinned Zed copies with tools/fetch-zed-icons.ps1.
const svgs = import.meta.glob<string>("../assets/zed-icons/*.svg", { query: "?raw", import: "default", eager: true });
import searchSvg from "../assets/codicons/search.svg?raw";
import markdownSvg from "../assets/codicons/markdown.svg?raw";
import listSelectionSvg from "../assets/codicons/list-selection.svg?raw";

import { Show } from "solid-js";
import FileIcon from "./FileIcon.tsx";
import { tooltip, type Tip } from "./tooltip.ts";
import { iconMarkup, themedSvg } from "./icon-svg.ts";

export type IconName =
  | "folder" | "folder_open" | "folder_add" | "file_tree" | "threads_sidebar_left_open" | "threads_sidebar_left_closed"
  | "split" | "plus" | "maximize" | "arrow_left" | "arrow_right" | "menu" | "close" | "pin" | "minimize" | "eye" | "file_doc"
  | "file" | "check" | "chevron_down" | "chevron_right" | "chevron_up" | "chevron_up_down" | "magnifying_glass" | "search" | "pencil" | "github"
  | "chevron_down_up" | "zed_assistant" | "arrow_circle" | "warning" | "chevron_left" | "expand_up" | "expand_down" | "markdown"
  | "case_sensitive" | "whole_word" | "regex" | "replace" | "replace_next" | "replace_all" | "select_all" | "list_selection";

for (const [path, svg] of Object.entries(svgs)) iconMarkup[path.slice(path.lastIndexOf("/") + 1, -4)] = svg;
Object.assign(iconMarkup, { search: searchSvg, markdown: markdownSvg, list_selection: listSelectionSvg }); // codicons override same-named Zed copies

/** Missing Zed copies leave an empty slot with the existing spec dimensions. */
export default function Icon(props: { name: IconName }) {
  return <span class="icon" aria-hidden="true" innerHTML={themedSvg(iconMarkup[props.name])} />;
}

/**
 * Icon button: disabled until it gets an `onClick` (the tab bar end buttons stay that way, R-10). It has its
 * tooltip either way (8.1): the label with the shortcut of `action`, or the given rows.
 */
export function IconButton(props: { name: IconName; label: string; action?: string; tips?: Tip[]; toggled?: boolean; toggledFile?: string; onClick?: () => void }) {
  return (
    <button
      class="icon-button"
      aria-label={props.label}
      aria-pressed={props.toggled}
      disabled={!props.onClick}
      onClick={() => props.onClick?.()}
      ref={(el) => tooltip(el, () => props.tips ?? { title: props.label, action: props.action })}
    >
      {/* U-20: while toggled, the file icon the applied icon theme gives `toggledFile` (the Left Dock's icon for it) replaces the button icon. */}
      <Show when={props.toggled && props.toggledFile} fallback={<Icon name={props.name} />}>
        <FileIcon name={props.toggledFile!} dir={false} />
      </Show>
    </button>
  );
}

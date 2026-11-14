// Core D-9: restore the ignored, pinned Zed copies with tools/fetch-zed-icons.ps1.
const svgs = import.meta.glob<string>("../assets/zed-icons/*.svg", { query: "?raw", import: "default", eager: true });
import searchSvg from "../assets/codicons/search.svg?raw";
import listSelectionSvg from "../assets/codicons/list-selection.svg?raw";

import { tooltip } from "./tooltip.ts";
import { iconMarkup, scalable, themedSvg } from "./icon-svg.ts";

export type IconName =
  | "folder" | "folder_open" | "folder_add" | "file_tree" | "threads_sidebar_left_open" | "threads_sidebar_left_closed"
  | "split" | "plus" | "maximize" | "arrow_left" | "arrow_right" | "menu" | "close" | "pin" | "minimize" | "eye" | "file_doc"
  | "file" | "check" | "chevron_down" | "chevron_right" | "chevron_up" | "chevron_up_down" | "magnifying_glass" | "search" | "pencil" | "github"
  | "chevron_down_up" | "zed_assistant" | "arrow_circle" | "warning" | "chevron_left" | "expand_up" | "expand_down"
  | "case_sensitive" | "whole_word" | "regex" | "replace" | "replace_next" | "replace_all" | "select_all" | "list_selection" | "list_tree" | "sun" | "moon" | "settings"
  | "sort_name_asc" | "sort_name_desc";

for (const [path, svg] of Object.entries(svgs)) iconMarkup[path.slice(path.lastIndexOf("/") + 1, -4)] = svg;
// I-32: only the two find toggles that were cut; the other viewBox-less copies keep the look the earlier V3 runs measured.
for (const name of ["case_sensitive", "whole_word"]) iconMarkup[name] = scalable(iconMarkup[name]) ?? "";
Object.assign(iconMarkup, { search: searchSvg, list_selection: listSelectionSvg }); // codicons override same-named Zed copies
// core v0.8.2 I-2: the light / dark marks of the status bar's UI | Edit | View buttons; drawn here (the pinned Zed set has neither).
const ray = (turn: number) => `<path d="M8 1.6V3.2" transform="rotate(${turn * 45} 8 8)" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`;
Object.assign(iconMarkup, {
  sun: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="2.6" stroke="currentColor" stroke-width="1.2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(ray).join("")}</svg>`,
  moon: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 9.4A5.4 5.4 0 1 1 6.6 3A4.3 4.3 0 0 0 13 9.4Z" fill="currentColor"/></svg>`,
});
// core v0.8.3 I-6: the Folder Sidebar's name sort (mockup statusbar 03, variant C: lines of different length and an arrow); not in the Zed set either.
const sort = (d: string) => `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${d}" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
Object.assign(iconMarkup, {
  sort_name_asc: sort("M2 4H5M2 8H7M2 12H8M12 12V3M9.5 5.5L12 3L14.5 5.5"),
  sort_name_desc: sort("M2 4H8M2 8H7M2 12H5M12 3V12M9.5 9.5L12 12L14.5 9.5"),
});

/** Missing Zed copies leave an empty slot with the existing spec dimensions. */
export default function Icon(props: { name: IconName }) {
  return <span class="icon" aria-hidden="true" innerHTML={themedSvg(iconMarkup[props.name])} />;
}

/**
 * Icon button: disabled until it gets an `onClick` (the tab bar end buttons stay that way, R-10). It has its
 * tooltip either way (8.1): the label with the shortcut of `action`. `text` is drawn after the icon.
 */
export function IconButton(props: { name: IconName; label: string; text?: string; action?: string; toggled?: boolean; onClick?: () => void }) {
  return (
    <button
      class="icon-button"
      classList={{ labelled: !!props.text }}
      aria-label={props.label}
      aria-pressed={props.toggled}
      disabled={!props.onClick}
      onClick={() => props.onClick?.()}
      ref={(el) => tooltip(el, () => ({ title: props.label, action: props.action }))}
    >
      <Icon name={props.name} />
      {props.text}
    </button>
  );
}

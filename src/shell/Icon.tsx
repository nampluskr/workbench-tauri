// Core D-9: restore the ignored, pinned Zed copies with tools/fetch-zed-icons.ps1.
const svgs = import.meta.glob<string>("../assets/zed-icons/*.svg", { query: "?raw", import: "default", eager: true });

import { tooltip, type Tip } from "./tooltip.ts";
import { themedSvg } from "./icon-svg.ts";

export type IconName =
  | "folder" | "folder_open" | "folder_add" | "file_tree" | "threads_sidebar_left_open" | "threads_sidebar_left_closed"
  | "split" | "plus" | "maximize" | "arrow_left" | "arrow_right" | "menu" | "close" | "pin" | "minimize" | "eye" | "file_doc"
  | "file" | "check" | "chevron_down" | "chevron_right" | "chevron_up" | "chevron_up_down" | "magnifying_glass" | "pencil" | "github"
  | "filter" | "replace" | "regex" | "case_sensitive" | "whole_word"
  | "chevron_down_up" | "zed_assistant" | "arrow_circle" | "warning" | "chevron_left" | "expand_up" | "expand_down";

/** Missing Zed copies leave an empty slot with the existing spec dimensions. */
export default function Icon(props: { name: IconName }) {
  const svg = () => svgs[`../assets/zed-icons/${props.name}.svg`];
  return <span class="icon" aria-hidden="true" innerHTML={themedSvg(svg())} />;
}

/**
 * Icon button: disabled until it gets an `onClick` (the tab bar end buttons stay that way, R-10). It has its
 * tooltip either way (8.1): the label with the shortcut of `action`, or the given rows.
 */
export function IconButton(props: { name: IconName; label: string; action?: string; tips?: Tip[]; toggled?: boolean; onClick?: () => void }) {
  return (
    <button
      class="icon-button"
      aria-label={props.label}
      aria-pressed={props.toggled}
      disabled={!props.onClick}
      onClick={() => props.onClick?.()}
      ref={(el) => tooltip(el, () => props.tips ?? { title: props.label, action: props.action })}
    >
      <Icon name={props.name} />
    </button>
  );
}

import { Show } from "solid-js";
import Icon, { type IconName } from "./Icon.tsx";

/**
 * core v0.8.3 I-16: the title row of the Folder, Tree and Outline Sidebars (the Outline's row, now shared). Hovered, it shows an x at
 * the right end (no tooltip) that closes the Sidebar; a click anywhere else moves keyboard focus to the Sidebar's list.
 */
export default function SidebarTitle(props: { icon: IconName; title: string; detail?: string; focus: () => void; close: () => void }) {
  // The press keeps focus where it was, so `focus` and `close` still see where it came from (panels.ts gives it back later).
  return (
    <div class="outline-header" onMouseDown={(e) => e.preventDefault()} onClick={() => props.focus()}>
      <Icon name={props.icon} />
      <span>{props.title}</span>
      <Show when={props.detail}><span>·</span><span class="outline-doc">{props.detail}</span></Show>
      <button class="icon-button sidebar-title-close" tabindex="-1" aria-label={`Close ${props.title} Sidebar`}
        onClick={(e) => { e.stopPropagation(); props.close(); }}><Icon name="close" /></button>
    </div>
  );
}

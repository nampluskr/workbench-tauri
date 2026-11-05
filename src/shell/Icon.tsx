// D-20: Lucide SVGs from gpui-kit-assets 0.8.1 (src/assets/icons, ISC, LICENSE-LUCIDE there).
// File names are gpui's IconName in kebab case (FolderOpen -> folder-open.svg).
const svgs = import.meta.glob<string>("../assets/icons/*.svg", { query: "?raw", import: "default", eager: true });

import { tooltip, type Tip } from "./tooltip.ts";

export type IconName =
  | "folder" | "folder-open" | "panel-left" | "panel-right" | "plus" | "maximize" | "arrow-left" | "arrow-right" | "menu";

/** Inline SVG so `stroke="currentColor"` follows the theme text color; size comes from the container CSS. */
export default function Icon(props: { name: IconName }) {
  return <span class="icon" aria-hidden="true" innerHTML={svgs[`../assets/icons/${props.name}.svg`]} />;
}

/**
 * Icon button without an action yet (v0.2 Phase 1): disabled until its Phase wires it. It still has its
 * tooltip (8.1): the label with the shortcut of `action`, or the given rows.
 */
export function IconButton(props: { name: IconName; label: string; action?: string; tips?: Tip[] }) {
  return (
    <button
      class="icon-button"
      aria-label={props.label}
      disabled
      ref={(el) => tooltip(el, () => props.tips ?? { title: props.label, action: props.action })}
    >
      <Icon name={props.name} />
    </button>
  );
}

import { createMemo, Show } from "solid-js";
import Icon from "./Icon.tsx";
import { themedSvg } from "./icon-svg.ts";
import { dirIcon, fileIcon } from "../theme/icon-themes.ts";
import { appliedIconTheme, assetOf, iconThemes } from "../theme/icons.ts";

/**
 * A file or folder icon from the applied icon theme (I-3). With no icon theme copies it falls back to the plain
 * UI folder and file icons. `name` is the file name or the folder name (the last one when folded paths are shown).
 */
export default function FileIcon(props: { name: string; dir: boolean; expanded?: boolean }) {
  const asset = createMemo(() => {
    const path = props.dir ? dirIcon(iconThemes, appliedIconTheme(), props.name, !!props.expanded) : fileIcon(iconThemes, appliedIconTheme(), props.name);
    return path === undefined ? undefined : assetOf(path);
  });
  return (
    <Show when={asset()} keyed fallback={<Icon name={props.dir ? (props.expanded ? "folder_open" : "folder") : "file"} />}>
      {(a) => a.kind === "svg"
        ? <span class="icon" aria-hidden="true" innerHTML={themedSvg(a.text)} />
        : <span class="icon" aria-hidden="true"><img src={a.url} alt="" draggable={false} /></span>}
    </Show>
  );
}

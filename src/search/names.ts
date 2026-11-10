import { Channel, invoke } from "@tauri-apps/api/core";
import { openFile, reveal, setExpanded } from "../workspace/context.ts";
import { activateFolder, contextOf, flushWorkspaceState, folders } from "../workspace/store.ts";
import { pathKey } from "../workspace/paths.ts";
import { setDockOpen } from "../shell/panels.ts";
import type { SearchEntry, SearchEvent } from "./entries.ts";

/** The `search_names` call of the Search tab and of Open File (U-22). `stale` is checked once the workspace state is saved. */
export async function searchNames(
  options: { roots: string[]; query: string; caseSensitive: boolean; wholeWord: boolean; all: boolean },
  onEvent: (event: SearchEvent) => void,
  stale: () => boolean,
): Promise<void> {
  const channel = new Channel<SearchEvent>();
  channel.onmessage = onEvent;
  await flushWorkspaceState();
  if (stale()) return;
  await invoke("search_names", { options, onEvent: channel });
}

/** A result of the search of `root`: a folder is revealed in the tree, a file opens in the editor. */
export function openEntry(root: string, entry: SearchEntry): void {
  const folder = folders().find((folder) => pathKey(folder.path) === pathKey(root));
  if (!folder) return;
  activateFolder(folder.id);
  const ctx = contextOf(folder);
  if (entry.isDir) {
    setDockOpen(true);
    setExpanded(ctx, ctx.root, true);
    reveal(ctx, entry.path);
  } else openFile(ctx, entry.path, false, true);
}

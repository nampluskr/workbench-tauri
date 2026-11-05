import { homeDir } from "@tauri-apps/api/path";
import { normalizePath, tildePath } from "../workspace/paths.ts";

// The user's home folder, read once at start, for the `~` in project panel tooltips (L-247). Without it paths show whole.
let home: string | null = null;

export async function loadHome(): Promise<void> {
  try {
    home = normalizePath(await homeDir());
  } catch {
    home = null;
  }
}

export const homePrefix = (path: string): string => tildePath(path, home);

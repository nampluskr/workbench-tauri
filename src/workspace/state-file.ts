import { DOCK_MIN_WIDTH, SIDEBAR_WIDTH } from "../spec/metrics.ts";
import type { Folder } from "./folders.ts";

// state.json (A-22, A-24.7, D-11, R-18): folders, the active folder, sidebar width and preview lock are ours. The whole parsed
// object is kept and written back with those fields laid over it, so keys we do not know survive (A-20).
export const STATE_VERSION = 1;

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

export type Loaded = {
  raw: Json; // everything read, unknown keys included
  folders: Folder[];
  activeId: string | null;
  sidebarWidth: number;
  lockPreview: boolean;
  readOnly: boolean; // A-24.7: written by a newer app, never write it back
  invalid: boolean; // text that is not a JSON object
};

export function parseState(json: string | null): Loaded {
  const empty: Loaded = { raw: {}, folders: [], activeId: null, sidebarWidth: SIDEBAR_WIDTH.default, lockPreview: false, readOnly: false, invalid: false };
  if (json === null) return empty;
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return { ...empty, invalid: true };
  }
  if (!isObject(value)) return { ...empty, invalid: true };
  const window: Json = Array.isArray(value.windows) && isObject(value.windows[0]) ? value.windows[0] : {};
  const ids = new Set<string>();
  const folders = (Array.isArray(window.folders) ? window.folders : []).filter((f): f is Folder => {
    if (!isObject(f) || typeof f.id !== "string" || typeof f.path !== "string" || ids.has(f.id)) return false;
    ids.add(f.id);
    return true;
  });
  const width = isObject(window.sidebar) ? window.sidebar.width : undefined;
  return {
    raw: value,
    folders,
    // A-22.6: an id that is not in `folders` means the first folder; no folders, none.
    activeId: typeof window.active_folder_id === "string" && ids.has(window.active_folder_id) ? window.active_folder_id : (folders[0]?.id ?? null),
    // I-11: the maximum is the current container width, enforced by the shared Dock CSS rule.
    sidebarWidth: typeof width === "number" && Number.isFinite(width) && width >= DOCK_MIN_WIDTH ? width : SIDEBAR_WIDTH.default,
    lockPreview: window.lock_preview === true,
    readOnly: typeof value.version === "number" && value.version > STATE_VERSION,
    invalid: false,
  };
}

/** The text to write: the parsed object with our fields laid over it. */
export function serializeState(raw: Json, mem: { folders: Folder[]; activeId: string | null; sidebarWidth: number; lockPreview: boolean }): string {
  const out = structuredClone(raw);
  out.version ??= STATE_VERSION;
  const windows = Array.isArray(out.windows) ? out.windows : (out.windows = []);
  if (!isObject(windows[0])) windows[0] = { id: "w1" };
  const window = windows[0] as Json;
  window.folders = mem.folders;
  window.active_folder_id = mem.activeId;
  window.lock_preview = mem.lockPreview;
  window.sidebar = { ...(isObject(window.sidebar) ? window.sidebar : {}), width: mem.sidebarWidth };
  return JSON.stringify(out, null, 2);
}

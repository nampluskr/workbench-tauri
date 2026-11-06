import { Text } from "@codemirror/state";
import { decode, digest, type Format } from "../editor/text-io.ts";

// The file behind one tab (R-2~R-5, R-7, D-3~D-7): the save base (text, hash of the original bytes, format), whether the
// disk moved under it, and the order of its disk requests. No DOM, no Tauri: the editor and the disk come in from outside.

export type Disk = "ok" | "conflict" | "deleted";
export type Status = { dirty: boolean; conflict: boolean; deleted: boolean };
/** The editor of the tab, once it exists. `set` makes it, or replaces its text; `editable` is false for an unreadable file. */
export type Editor = { text(): Text | null; set(text: string, editable: boolean): void };
/** `read` gives null for a file that is gone and throws for one that cannot be read; `save` throws a SaveError. */
export type Io = { read(path: string): Promise<Bytes | null>; save(path: string, text: string, format: Format): Promise<Bytes> };
export type SaveError = { kind: "unmappable"; chars: string[] | string } | { kind: "io"; message: string; kept_tmp: string | null };
type Bytes = Uint8Array<ArrayBuffer>;
type Base = { text: Text; hash: string; format: Format };

/**
 * D-3 / D-7 (S-1, S-2): conflict counts as modified and undo does not clear it; a deleted file is modified while it has
 * text; otherwise the document differs from the save base.
 * shortcut: compares text, so deleting and retyping the same characters is clean here, while Zed (`has_unsaved_edits`)
 * stays dirty until undo returns to the saved version. Track the saved undo depth if Zed's rule is required.
 */
export function isDirty(disk: Disk, doc: Text, base: Text): boolean {
  if (disk === "conflict") return true;
  if (disk === "deleted") return doc.length > 0;
  return !doc.eq(base);
}

/** D-7: what a read of the disk means for the tab. Same bytes as the base are no change (also the app's own save). */
export function judgeDisk(dirty: boolean, baseHash: string, read: string | null): { disk: Disk; reload: boolean } {
  if (read === null) return { disk: "deleted", reload: false };
  if (read === baseHash) return { disk: "ok", reload: false };
  return dirty ? { disk: "conflict", reload: false } : { disk: "ok", reload: true };
}

export class Doc {
  path: string;
  closed = false;
  disk: Disk = "ok";
  base: Base | null = null; // null until the file was read once
  private seq = 0; // R-3: one number for opens, re-reads and saves; only the newest request's result counts
  private savedSeq = -1; // the number a finished save took
  private saving = false;
  private dropped = false; // a read finished while a save was running: read again after it
  private queue: Promise<unknown> = Promise.resolve();
  private status: Status = { dirty: false, conflict: false, deleted: false };
  private readonly editor: Editor;
  private readonly io: Io;
  private readonly onStatus: (status: Status) => void;

  constructor(path: string, editor: Editor, io: Io, onStatus: (status: Status) => void) {
    this.path = path;
    this.editor = editor;
    this.io = io;
    this.onStatus = onStatus;
  }

  get dirty(): boolean {
    return this.status.dirty;
  }

  /** Recompute after any change of the document or the disk state. */
  refresh(): void {
    const text = this.editor.text();
    const dirty = this.base !== null && text !== null && isDirty(this.disk, text, this.base.text);
    const next = { dirty, conflict: this.disk === "conflict", deleted: this.disk === "deleted" };
    if (next.dirty === this.status.dirty && next.conflict === this.status.conflict && next.deleted === this.status.deleted) return;
    this.status = next;
    this.onStatus(next);
  }

  /** Open, or follow the disk. `force` (Discard Edits, E-084) takes the disk text even over edits. */
  async read(force = false): Promise<void> {
    const mine = ++this.seq;
    let bytes: Bytes | null | undefined;
    try {
      bytes = await this.io.read(this.path);
    } catch {
      bytes = undefined; // cannot be read now (locked...): nothing is known
    }
    const hash = bytes ? await digest(bytes) : null;
    if (!this.current(mine)) return;
    if (bytes === undefined || (bytes === null && this.base === null)) {
      if (this.editor.text() === null) this.editor.set("", false); // v0.2: an unreadable file shows as an empty read-only tab
      return;
    }
    if (bytes === null) {
      this.disk = "deleted"; // E-087: the buffer stays
    } else if (this.base === null || force) {
      this.take(bytes, hash!);
    } else {
      const next = judgeDisk(this.dirty, this.base.hash, hash);
      if (next.reload) this.take(bytes, hash!);
      else this.disk = next.disk;
    }
    this.refresh();
  }

  private take(bytes: Bytes, hash: string): void {
    const decoded = decode(bytes);
    this.base = { text: Text.of(decoded.text.split("\n")), hash, format: decoded };
    this.disk = "ok";
    this.editor.set(decoded.text, true); // base first: the change it makes is not an edit
  }

  /** R-3: a result counts only if no later request started, no save ran meanwhile, and the tab is open. */
  private current(mine: number): boolean {
    if (this.closed) return false;
    if (this.saving) {
      this.dropped = true;
      return false;
    }
    if (mine === this.seq) return true;
    if (this.seq === this.savedSeq) void this.read(); // late only because a save finished: what it read may be stale
    return false;
  }

  /** R-4: write the document. Saves of one tab run one after another. */
  write(): Promise<{ ok: true } | { ok: false; error: SaveError }> {
    const run = async (): Promise<{ ok: true } | { ok: false; error: SaveError }> => {
      const base = this.base;
      const text = this.editor.text();
      if (this.closed || !base || !text) return { ok: true };
      const path = this.path;
      this.seq++; // reads that started before this save are older than it
      this.saving = true;
      let bytes: Bytes;
      try {
        bytes = await this.io.save(path, text.toString(), base.format);
      } catch (error) {
        this.end();
        return { ok: false, error: error as SaveError };
      }
      const hash = await digest(bytes);
      // D-4: renamed or moved while saving: the tab does not become clean (its file is not the one written).
      if (this.path === path) {
        this.base = { text, hash, format: base.format };
        this.disk = "ok";
      }
      this.end();
      this.refresh();
      return { ok: true };
    };
    const result = this.queue.then(run);
    this.queue = result;
    return result;
  }

  private end(): void {
    this.saving = false;
    this.savedSeq = ++this.seq;
    if (this.dropped && !this.closed) {
      this.dropped = false;
      void this.read();
    }
  }
}

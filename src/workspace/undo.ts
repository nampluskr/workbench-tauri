// core I-3: the project panel's undo history for drag and drop (Zed project_panel/src/undo.rs). A step is what one drop
// did. Undo takes the step before the cursor, runs its inverse and puts what that did back in its place; redo does the
// same at the cursor. A step whose inverse fails is dropped (Zed: it would stay stuck); a cancelled one stays.

/** One thing done: an item moved, a copy made, or a copy put in the Recycle Bin (`id`, so redo can put it back). */
export type Change =
  | { kind: "moved"; from: string; to: string }
  | { kind: "created"; path: string }
  | { kind: "trashed"; path: string; id: string };

/** Runs a step's inverse and returns what it did, or null when the user cancelled. It throws when it failed. */
export type Invert = (step: Change[]) => Promise<Change[] | null>;

export class UndoHistory {
  private steps: Change[][] = [];
  private cursor = 0;
  private queue: Promise<void> = Promise.resolve(); // one at a time, in the order asked (Zed: a channel)
  private readonly limit: number;
  constructor(limit: number) {
    this.limit = limit;
  }

  canUndo = () => this.cursor > 0;
  canRedo = () => this.cursor < this.steps.length;

  /** A new step drops what could still be redone; past the limit the oldest goes. */
  record(step: Change[]): void {
    if (step.length === 0) return;
    this.steps.splice(this.cursor);
    if (this.steps.length >= this.limit) this.steps.shift();
    else this.cursor++;
    this.steps.push(step);
  }

  undo(invert: Invert): Promise<void> {
    return this.run(async () => {
      if (!this.canUndo()) return;
      const at = --this.cursor; // back even when it fails, so the cursor stays inside the history
      const [step] = this.steps.splice(at, 1);
      const done = await invert(step);
      this.steps.splice(at, 0, done ?? step);
      if (!done) this.cursor++;
    });
  }

  redo(invert: Invert): Promise<void> {
    return this.run(async () => {
      if (!this.canRedo()) return;
      const at = this.cursor;
      const [step] = this.steps.splice(at, 1);
      const done = await invert(step);
      this.steps.splice(at, 0, done ?? step);
      if (done) this.cursor++;
    });
  }

  private run(job: () => Promise<void>): Promise<void> {
    const next = this.queue.then(job);
    this.queue = next.catch(() => {});
    return next;
  }
}

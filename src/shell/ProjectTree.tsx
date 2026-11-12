import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import {
  PROJECT_PANEL_DRAG_EXPAND_DELAY_MS,
  PROJECT_PANEL_DRAG_SCROLL,
  PROJECT_PANEL_ITEM_HEIGHT,
  PROJECT_PANEL_NAME_TOOLTIP_DELAY_MS,
  TREE_OVERSCAN_ROWS,
} from "../spec/metrics.ts";
import { cancelEdit, commitEdit, dropExternal, dropItems, revalidate } from "../workspace/actions.ts";
import { underOrSame } from "../workspace/changes.ts";
import { activeTabOf, dropEntry, NEW_ROW, readDir, setExpanded, type FolderContext } from "../workspace/context.ts";
import { inputKeyAction } from "../workspace/names.ts";
import { dragItems, dropJobs, targetDir } from "../workspace/ops.ts";
import { isDirPath, only, rowIndex, stickyRows, visibleRange, type Row } from "../workspace/tree.ts";
import { entryDropTarget } from "./Pane.tsx";
import FileIcon from "./FileIcon.tsx";
import { tooltip } from "./tooltip.ts";
import { pressMiddle, pressRow } from "./tree-commands.ts";
import { openTreeMenu } from "./tree-menu.ts";
import { homePrefix } from "./home.ts";

// shortcut: one span per ancestor level for guides and indent, so a very deep path draws as many spans as it is deep.
const H = PROJECT_PANEL_ITEM_HEIGHT;

/** P-019: the one-line input that takes the place of a name (R-20). It keeps its own keys: see keyboard.ts. */
function NameInput(props: { ctx: FolderContext }) {
  const ctx = props.ctx;
  let input!: HTMLInputElement;
  let composedAt = -Infinity; // when the last composition ended
  let gone = false; // the input is being taken out of the page: its blur is not a decision
  onMount(() => {
    const edit = ctx.edit()!;
    ctx.input = input;
    input.value = ctx.draft ?? edit.initial;
    input.focus();
    if (ctx.draft === null) input.setSelectionRange(edit.select[0], edit.select[1]); // a rename selects the name without its extension
    onCleanup(() => {
      gone = true;
      if (ctx.input === input) ctx.input = null;
    });
  });
  return (
    <input
      ref={input}
      class="tree-input"
      data-text-input
      spellcheck={false}
      autocomplete="off"
      onInput={() => {
        ctx.draft = input.value;
        void revalidate(ctx);
      }}
      onCompositionEnd={(e) => (composedAt = e.timeStamp)}
      onKeyDown={(e) => {
        // While an IME composes, Enter and Escape are its own (R-20, 03-tauri R-08).
        const action = inputKeyAction(e, e.timeStamp - composedAt);
        if (action === null) return;
        e.preventDefault();
        if (action === "commit") void commitEdit(ctx, false);
        else cancelEdit(ctx, true);
      }}
      // P-022: losing focus confirms if it can and drops the input if not; a window that was only deactivated does neither.
      onBlur={() => !gone && document.hasFocus() && void commitEdit(ctx, true)}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

// The project panel tree (R-18, D-9). Only the rows around the visible range are in the DOM; they sit in a window that is
// moved by a transform inside a spacer as tall as the whole list. Heights and offsets go through an adopted sheet.
export default function ProjectTree(props: { ctx: FolderContext }) {
  const ctx = props.ctx; // the panel mounts a new tree per folder, so this never changes
  let scroller!: HTMLDivElement;
  const built = createMemo(() => ctx.rows());
  const rows = () => built().rows;
  createEffect(() => built().needs.forEach((path) => void readDir(ctx, path)));

  const [scrollTop, setScrollTop] = createSignal(ctx.scrollTop);
  const [viewport, setViewport] = createSignal(0);
  const range = createMemo(() => visibleRange(scrollTop(), viewport(), H, rows().length, TREE_OVERSCAN_ROWS));
  const shown = createMemo(() => rows().slice(range().start, range().end));
  const sticky = createMemo(() => stickyRows(rows(), scrollTop(), viewport(), H));

  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  onCleanup(() => (document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet)));
  createEffect(() => sheet.replaceSync(`.tree-spacer { height: ${rows().length * H}px; } .tree-window { transform: translateY(${range().start * H}px); }
    ${sticky().map((item, i, all) => `.tree-sticky > :nth-child(${i + 1}) { top: ${item.top}px; z-index: ${all.length - i}; }`).join(" ")}`));

  // Bring a path into view once its row exists (it may still be being read), moving the least (R-24, keys).
  createEffect(() => {
    const target = ctx.scrollTarget();
    const index = target === null ? -1 : target === NEW_ROW ? rows().findIndex((r) => r.isNew) : rowIndex(rows(), target);
    if (index < 0) return;
    const [top, bottom] = [index * H, (index + 1) * H];
    const covered = sticky().length * H;
    if (top < scroller.scrollTop + covered) scroller.scrollTop = Math.max(0, top - covered);
    else if (bottom > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = bottom - scroller.clientHeight;
    ctx.setScrollTarget(null);
  });

  onMount(() => {
    scroller.scrollTop = ctx.scrollTop; // A-15.2: back to where this folder was left
    setViewport(scroller.clientHeight);
    const observer = new ResizeObserver(() => setViewport(scroller.clientHeight));
    observer.observe(scroller);
    onCleanup(() => observer.disconnect());
  });

  const onScroll = () => {
    ctx.scrollTop = scroller.scrollTop;
    setScrollTop(scroller.scrollTop);
  };
  const covers = (row: Row) => row.segments.some((s) => s.path === ctx.selection().selected);
  const marked = (row: Row) => ctx.selection().marked.includes(row.path);
  // I-2: Zed marks the active editor's file when it reveals it (project_panel.rs:7278-7281), so its name is not muted.
  const activeFile = (row: Row) => !row.isNew && activeTabOf(ctx.pane())?.path === row.path;
  const editing = (row: Row) => {
    const edit = ctx.edit();
    return !!edit && (edit.kind === "new" ? row.isNew : row.segments.some((s) => s.path === edit.path));
  };
  const mods = (e: MouseEvent) => ({ shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey });

  // --- core I-3: drag and drop (pointer events, like the tab drag; Tauri keeps HTML5 drops of files for itself) ---
  type Place = { dir: string; segment: boolean }; // segment: a folder piece of a folded path (Zed folded_directory_drag_target)
  const [dropOn, setDropOn] = createSignal<Place | null>(null);
  const highlighted = (row: Row) => { const on = dropOn(); return !!on && !on.segment && !row.isNew && underOrSame(on.dir, row.path); };
  /** The folder under a point of the window: a folder row, a file row's folder, a folded piece, or the root under the rows. */
  const placeAt = (x: number, y: number): Place | null => {
    const el = document.elementFromPoint(x, y);
    if (!el || !scroller.contains(el) || el.closest(".tree-sticky")) return null; // Zed: sticky rows take no drop
    const rowEl = el.closest<HTMLElement>(".tree-row");
    if (!rowEl) return { dir: ctx.root, segment: false }; // Zed DragTarget::Background
    const path = rowEl.dataset.path, piece = el.closest<HTMLElement>(".tree-segment")?.dataset.path;
    if (!path) return null;
    if (piece && piece !== path) return { dir: piece, segment: true };
    return { dir: targetDir(ctx.root, rows(), path), segment: false };
  };
  let expandTimer = 0, held: Place | null = null;
  const holdOver = (place: Place | null) => {
    if (place?.dir === held?.dir && place?.segment === held?.segment) return;
    held = place;
    clearTimeout(expandTimer);
    const row = place && !place.segment ? rows()[rowIndex(rows(), place.dir)] : undefined;
    if (row?.isDir && row.path === place!.dir && !row.expanded) expandTimer = setTimeout(() => setExpanded(ctx, row.path, true), PROJECT_PANEL_DRAG_EXPAND_DELAY_MS);
  };
  let scrollTimer = 0;
  /** Zed: near the top or bottom of the list it scrolls, faster closer to the edge. */
  const edgeScroll = (y: number) => {
    clearInterval(scrollTimer);
    const r = scroller.getBoundingClientRect();
    if (r.height <= 0 || y < r.top || y > r.bottom) return;
    const at = (y - r.top) / r.height, s = PROJECT_PANEL_DRAG_SCROLL;
    const step = at <= s.near ? -s.fast : at <= s.far ? -s.slow : at >= 1 - s.near ? s.fast : at >= 1 - s.far ? s.slow : 0;
    if (step) scrollTimer = setInterval(() => { scroller.scrollTop += step; onScroll(); }, s.tickMs);
  };

  /** Press on a row; the drag starts once the pointer leaves that row, so a press that stays on it is still a click. */
  const startDrag = (e: PointerEvent, row: Row) => {
    if (e.button !== 0 || row.isNew || ctx.edit()) return;
    const pressed = (e.target as Element).closest<HTMLElement>(".tree-segment")?.dataset.path ?? row.path;
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = e.pointerId;
    let items: string[] | null = null;
    let tree: Place | null = null, pane: ReturnType<typeof entryDropTarget> = null;
    const move = (m: PointerEvent) => {
      if (m.pointerId !== id) return;
      if (!items) {
        if (m.clientX >= box.left && m.clientX < box.right && m.clientY >= box.top && m.clientY < box.bottom) return;
        items = dragItems(ctx.root, ctx.selection().marked, pressed);
        if (items.length === 0) return finish(false, false);
        scroller.setPointerCapture(id); // keeps the drag when rows are redrawn, and the release is no row click
        scroller.addEventListener("lostpointercapture", lost);
        window.addEventListener("keydown", escape, true);
      }
      tree = placeAt(m.clientX, m.clientY);
      holdOver(tree);
      setDropOn(tree && dropJobs(items, tree.dir, false, ctx.root).length > 0 ? tree : null); // Zed: no mark where a move does nothing
      pane = tree ? entryDropTarget(ctx, null) : entryDropTarget(ctx, { x: m.clientX, y: m.clientY });
      edgeScroll(m.clientY);
    };
    const finish = (drop: boolean, copy: boolean) => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("keydown", escape, true);
      scroller.removeEventListener("lostpointercapture", lost);
      clearTimeout(expandTimer);
      clearInterval(scrollTimer);
      held = null;
      setDropOn(null);
      entryDropTarget(ctx, null);
      if (scroller.hasPointerCapture(id)) scroller.releasePointerCapture(id);
      if (!drop || !items) return;
      if (tree) void dropItems(ctx, items, tree.dir, copy); // Zed drops on a row even where it shows no mark (a Ctrl copy)
      else if (pane && !isDirPath(rows(), pressed)) dropEntry(ctx, pressed, pane.pane, pane.where); // Zed: a folder opens nothing
    };
    const up = (u: PointerEvent) => u.pointerId === id && finish(true, u.ctrlKey);
    const lost = () => finish(false, false);
    const escape = (k: KeyboardEvent) => {
      if (k.key !== "Escape") return;
      k.preventDefault();
      k.stopPropagation();
      finish(false, false);
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
  };

  // Files from Explorer: Tauri gives their paths and the point (physical pixels) of the window's webview.
  onMount(() => {
    const unlisten = getCurrentWebview().onDragDropEvent(({ payload }) => {
      if (payload.type === "leave") return setDropOn(null);
      const place = placeAt(payload.position.x / devicePixelRatio, payload.position.y / devicePixelRatio);
      if (payload.type !== "drop") return setDropOn(place);
      setDropOn(null);
      if (place && !ctx.edit()) void dropExternal(ctx, payload.paths, place.dir);
    });
    onCleanup(() => void unlisten.then((stop) => stop()));
  });

  const renderRow = (row: Row, stickyIndex?: number) => {
    const pinned = stickyIndex !== undefined;
    const isEditing = () => !pinned && editing(row);
    const click = (e: MouseEvent, path: string) => {
      if (!pinned) return pressRow(ctx, rows(), row, path, mods(e), e.detail);
      if (ctx.edit()) return;
      ctx.setSelection(only(row.path));
      // Zed's final 1px nudge moves the real row below its sticky slot.
      scroller.scrollTop = Math.max(0, (rows().indexOf(row) - stickyIndex) * H - 1);
      onScroll();
      scroller.closest<HTMLElement>(".project-panel")?.focus({ preventScroll: true });
    };
    return (
      <div
        class="tree-row"
        classList={{
          selected: covers(row),
          marked: marked(row),
          "active-file": activeFile(row),
          "drop-target": !pinned && highlighted(row), // Zed: the target folder and every row under it
          editing: isEditing(),
          warning: isEditing() && ctx.issue()?.kind === "warning",
          error: isEditing() && ctx.issue()?.kind === "error",
        }}
        role="treeitem"
        data-path={row.isNew ? undefined : row.path}
        aria-level={row.depth + 1}
        aria-expanded={row.isDir && !row.isNew ? row.expanded : undefined}
        aria-selected={covers(row) || marked(row)}
        ref={(el) => !row.isNew && tooltip(el, () => ({ title: homePrefix(row.path) }), PROJECT_PANEL_NAME_TOOLTIP_DELAY_MS)}
        onClick={(e) => click(e, row.path)}
        onPointerDown={(e) => !pinned && startDrag(e, row)}
        onContextMenu={(e) => {
          e.stopPropagation();
          if (pinned) { e.preventDefault(); return; }
          if (!row.isNew) openTreeMenu(ctx, { x: e.clientX, y: e.clientY }, row.path); // I-560
        }}
        onMouseDown={(e) => {
          if (pinned) { e.preventDefault(); e.stopPropagation(); return; }
          if (e.button !== 1) return;
          e.preventDefault(); // no autoscroll
          pressMiddle(ctx, row);
        }}
        onDragStart={(e) => pinned && e.preventDefault()}
        onDragOver={(e) => pinned && e.stopPropagation()}
        onDrop={(e) => { if (pinned) { e.preventDefault(); e.stopPropagation(); } }}
      >
        {/* L-38: one guide per ancestor folder, drawn over the row at depth x indent step + offset. */}
        <div class="tree-guides">
          <For each={row.guides}>{(guide) => <span class="tree-guide" classList={{ first: guide.first, last: guide.last }} />}</For>
        </div>
        <div class="tree-item">
          <For each={row.guides}>{() => <span class="tree-indent" />}</For>
          <div class="tree-main">
            <FileIcon name={row.segments.at(-1)?.name ?? ""} dir={row.isDir} expanded={row.expanded} />
            <Show
              when={isEditing()}
              fallback={
                <span class="tree-label">
                  <For each={row.segments}>
                    {(segment, i) => (
                      <>
                        {i() > 0 ? "\\" : ""}
                        <span
                          class="tree-segment"
                          classList={{
                            active: row.segments.length > 1 && ctx.selection().selected === segment.path,
                            "drop-target": !pinned && !!dropOn()?.segment && dropOn()?.dir === segment.path,
                          }}
                          data-path={segment.path}
                          onClick={(e) => {
                            e.stopPropagation();
                            click(e, segment.path);
                          }}
                        >
                          {segment.name}
                        </span>
                      </>
                    )}
                  </For>
                </span>
              }
            >
              <NameInput ctx={ctx} />
            </Show>
          </div>
        </div>
        {/* P-021: the check result hangs under the row being named. */}
        <Show when={isEditing() && ctx.issue()}>{(issue) => <div class="tree-banner" classList={{ warning: issue().kind === "warning", error: issue().kind === "error" }}>{issue().text}</div>}</Show>
      </div>
    );
  };

  return (
    // I-559: the empty area under the last row opens the menu of the root.
    <div
      class="tree-scroll"
      classList={{ "drop-target": dropOn()?.dir === ctx.root && !dropOn()?.segment }}
      ref={scroller}
      onScroll={onScroll}
      onContextMenu={(e) => openTreeMenu(ctx, { x: e.clientX, y: e.clientY }, ctx.root)}
      role="tree"
      aria-multiselectable="true"
    >
      <div class="tree-sticky">
        <For each={sticky()}>{(item, i) => renderRow(rows()[item.index], i())}</For>
      </div>
      <div class="tree-spacer">
        <div class="tree-window">
          <For each={shown()}>{(row) => renderRow(row)}</For>
        </div>
      </div>
    </div>
  );
}

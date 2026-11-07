import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { PROJECT_PANEL_ITEM_HEIGHT, PROJECT_PANEL_NAME_TOOLTIP_DELAY_MS, TREE_OVERSCAN_ROWS } from "../spec/metrics.ts";
import { cancelEdit, commitEdit, revalidate } from "../workspace/actions.ts";
import { NEW_ROW, readDir, type FolderContext } from "../workspace/context.ts";
import { inputKeyAction } from "../workspace/names.ts";
import { rowIndex, visibleRange, type Row } from "../workspace/tree.ts";
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

  const sheet = new CSSStyleSheet();
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  onCleanup(() => (document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet)));
  createEffect(() => sheet.replaceSync(`.tree-spacer { height: ${rows().length * H}px; } .tree-window { transform: translateY(${range().start * H}px); }`));

  // Bring a path into view once its row exists (it may still be being read), moving the least (R-24, keys).
  createEffect(() => {
    const target = ctx.scrollTarget();
    const index = target === null ? -1 : target === NEW_ROW ? rows().findIndex((r) => r.isNew) : rowIndex(rows(), target);
    if (index < 0) return;
    const [top, bottom] = [index * H, (index + 1) * H];
    if (top < scroller.scrollTop) scroller.scrollTop = top;
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
  const editing = (row: Row) => {
    const edit = ctx.edit();
    return !!edit && (edit.kind === "new" ? row.isNew : row.segments.some((s) => s.path === edit.path));
  };
  const mods = (e: MouseEvent) => ({ shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey });

  return (
    // I-559: the empty area under the last row opens the menu of the root.
    <div
      class="tree-scroll"
      ref={scroller}
      onScroll={onScroll}
      onContextMenu={(e) => openTreeMenu(ctx, { x: e.clientX, y: e.clientY }, ctx.root)}
      role="tree"
      aria-multiselectable="true"
    >
      <div class="tree-spacer">
        <div class="tree-window">
          <For each={shown()}>
            {(row) => (
              <div
                class="tree-row"
                classList={{
                  selected: covers(row),
                  marked: marked(row),
                  editing: editing(row),
                  warning: editing(row) && ctx.issue()?.kind === "warning",
                  error: editing(row) && ctx.issue()?.kind === "error",
                }}
                role="treeitem"
                data-path={row.isNew ? undefined : row.path}
                aria-level={row.depth + 1}
                aria-expanded={row.isDir && !row.isNew ? row.expanded : undefined}
                aria-selected={covers(row) || marked(row)}
                ref={(el) => !row.isNew && tooltip(el, () => ({ title: homePrefix(row.path) }), PROJECT_PANEL_NAME_TOOLTIP_DELAY_MS)}
                onClick={(e) => pressRow(ctx, rows(), row, row.path, mods(e), e.detail)}
                onContextMenu={(e) => {
                  e.stopPropagation();
                  if (!row.isNew) openTreeMenu(ctx, { x: e.clientX, y: e.clientY }, row.path); // I-560
                }}
                onMouseDown={(e) => {
                  if (e.button !== 1) return;
                  e.preventDefault(); // no autoscroll
                  pressMiddle(ctx, row);
                }}
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
                      when={editing(row)}
                      fallback={
                        <span class="tree-label">
                          <For each={row.segments}>
                            {(segment, i) => (
                              <>
                                {i() > 0 ? "\\" : ""}
                                <span
                                  class="tree-segment"
                                  classList={{ active: row.segments.length > 1 && ctx.selection().selected === segment.path }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    pressRow(ctx, rows(), row, segment.path, mods(e), e.detail);
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
                <Show when={editing(row) && ctx.issue()}>{(issue) => <div class="tree-banner" classList={{ warning: issue().kind === "warning", error: issue().kind === "error" }}>{issue().text}</div>}</Show>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

import { createMemo, createRenderEffect, createSignal, For, Show } from "solid-js";
import { redo, undo } from "@codemirror/commands";
import { backtab, tab as indentTab } from "../editor/indent.ts";
import { commands } from "../keymap/keyboard.ts";
import { PANE_DROP_TARGET_SIZE_RATIO, PANE_MIN_DRAG, TAB_MAX_TITLE_CHARS } from "../spec/metrics.ts";
import { bodyDrop, dropSide, lineSide } from "../workspace/drop.ts";
import {
  activatePane,
  activateTab,
  activeTabOf,
  closePreviewToSource,
  closeTab,
  dropTab,
  historyView,
  openPreview,
  paneElement,
  paneInDirection,
  focusPane,
  keepTab,
  panesOf,
  saveActive,
  splitPane,
  stepActiveTab,
  togglePinTab,
  type DropWhere,
  type FolderContext,
  type PaneState,
  type TabFile,
} from "../workspace/context.ts";
import { isGroup, minLength, resize, splitMode, toFlex, type Dir, type Group, type Node } from "../workspace/split.ts";
import { tabEdges } from "../workspace/tabs.ts";
import { baseName, truncateName } from "../workspace/paths.ts";
import { activeContext } from "../workspace/store.ts";
import { isOpen as menuOpen, openContextMenu } from "./AppMenu.tsx";
import Icon from "./Icon.tsx";
import { tooltip } from "./tooltip.ts";

// The active folder's center area (R-26, R-8, R-9, A-15.1): its split tree of Panes, each a tab bar and the active tab's
// editor. Keys act on the active Pane (the one focus was last in).
const context = createMemo(activeContext);
const activeTab = () => {
  const ctx = context();
  return ctx ? activeTabOf(ctx.pane()) : undefined;
};
const withCtx = (fn: (ctx: FolderContext) => void) => () => {
  const ctx = context();
  if (ctx) fn(ctx);
};

commands.set("workspace::Save", withCtx((ctx) => void saveActive(ctx)));
// I-056: the keys match only with focus in the editor (Editor context), so the active tab's file is the one. D-8: its
// one history is in the view that keeps it, whichever view the keys came from.
for (const [action, run] of [["editor::Undo", undo], ["editor::Redo", redo]] as const) {
  commands.set(action, () => {
    const file = activeTab()?.file;
    const view = file?.view && historyView(file);
    if (view) run(view);
  });
}
// I-059: Tab / Shift+Tab indent and outdent (the key is taken, so focus stays in the editor).
for (const [action, spec] of [["editor::Tab", indentTab], ["editor::Backtab", backtab]] as const) {
  commands.set(action, () => {
    const view = activeTab()?.file.view;
    if (view && !view.state.readOnly) view.dispatch(spec(view.state));
  });
}
commands.set("pane::CloseActiveItem", withCtx((ctx) => activeTab() && void closeTab(ctx, activeTab()!.file)));
commands.set("pane::TogglePinTab", withCtx((ctx) => activeTab() && togglePinTab(ctx, activeTab()!.file)));
commands.set("pane::ActivatePreviousItem", withCtx((ctx) => stepActiveTab(ctx, -1)));
commands.set("pane::ActivateNextItem", withCtx((ctx) => stepActiveTab(ctx, 1)));
// I-731 / I-711: explicit splits always clone (I-710); without an active item nothing is made (I-708).
for (const dir of ["up", "down", "left", "right"] as const) {
  const name = dir[0].toUpperCase() + dir.slice(1);
  commands.set(`pane::Split${name}`, withCtx((ctx) => splitPane(ctx, ctx.pane(), dir, "clone")));
  // I-732: the Pane past that edge gets focus.
  commands.set(`workspace::ActivatePane${name}`, withCtx((ctx) => {
    const next = paneInDirection(ctx, ctx.pane(), dir);
    if (!next) return;
    activatePane(ctx, next);
    focusPane(next);
  }));
}
// R-11: I-044 (the keys match only in a Markdown editor), I-045 / I-086 (in a preview).
const isMarkdown = (path: string) => /\.(md|markdown)$/i.test(path);
for (const [action, side] of [["markdown::OpenPreview", false], ["markdown::OpenPreviewToTheSide", true]] as const) {
  commands.set(action, withCtx((ctx) => {
    const tab = activeTab();
    if (tab && !tab.markdown && isMarkdown(tab.path)) openPreview(ctx, ctx.pane(), tab.path, side);
  }));
}
commands.set("markdown::CloseAndReturnToEditor", withCtx((ctx) => activeTab()?.markdown && closePreviewToSource(ctx, activeTab()!.file)));
// I-737: Shift+Escape zooms the active Pane in or out.
commands.set("workspace::ToggleZoom", withCtx((ctx) => ctx.setZoomed((z) => (z === ctx.pane() ? null : ctx.pane()))));

// I-706: the end buttons show on the Pane that has focus, or whose menu has it (focus inside a menu keeps the Pane).
const [focusedPane, setFocusedPane] = createSignal<number | null>(null);
window.addEventListener("focusin", (e) => {
  const el = e.target instanceof Element ? e.target : null;
  if (el?.closest(".menu")) return;
  const pane = el?.closest<HTMLElement>("[data-pane-id]");
  setFocusedPane(pane ? Number(pane.dataset.paneId) : null);
});
window.addEventListener("focusout", (e) => e.relatedTarget === null && setFocusedPane(null)); // focus left for nothing

// I-724 / I-726: child sizes of every group, as flex-grow rules (no inline style). Resizing changes `flex` in place.
const [flexVersion, bumpFlex] = createSignal(0);
const flexSheet = new CSSStyleSheet();
document.adoptedStyleSheets = [...document.adoptedStyleSheets, flexSheet];
function flexRules(node: Node<PaneState>, out: string[]): string[] {
  if (!isGroup(node)) return out;
  node.flex.forEach((f, k) => out.push(`.pane-group[data-group-id="${node.id}"] > .pane-group-child[data-child="${k}"] { flex-grow: ${f}; }`));
  node.children.forEach((child) => flexRules(child, out));
  return out;
}

// --- tab drag (R-10, D-9): pointer events only, no HTML5 drag and drop ---------------------------------------------

type Target = { pane: PaneState; where: DropWhere };
type Drag = { ctx: FolderContext; file: TabFile; from: PaneState; fromIndex: number; target: Target | null };
const [drag, setDrag] = createSignal<Drag | null>(null);
let dragEnded = false; // the click that follows a drag's pointerup is not a tab click

/** What is under the pointer: a tab (I-715), the tab bar's free end (I-716), or the body center or an edge (I-712, I-717). */
function hitTest(d: Drag, x: number, y: number): Target | null {
  const el = document.elementFromPoint(x, y);
  const paneEl = el?.closest<HTMLElement>("[data-pane-id]");
  const pane = paneEl && panesOf(d.ctx).find((p) => p.id === Number(paneEl.dataset.paneId));
  if (!el || !pane) return null;
  const tabEl = el.closest<HTMLElement>(".tab");
  if (tabEl) {
    const index = Number(tabEl.dataset.index);
    return dropSide(index, pane === d.from, d.fromIndex) ? { pane, where: { kind: "tab", index } } : null;
  }
  if (el.closest(".tab-bar-drop")) return { pane, where: { kind: "end" } };
  const body = el.closest<HTMLElement>(".pane-body");
  if (!body) return null;
  const r = body.getBoundingClientRect();
  const dir = bodyDrop(r.width, r.height, x - r.left, y - r.top, PANE_DROP_TARGET_SIZE_RATIO);
  if (!dir && pane === d.from) return null; // its own center: it is already there
  return { pane, where: dir ? { kind: "split", dir } : { kind: "center" } };
}

/**
 * Press on a tab, move, release. The drag starts on the first move (no threshold value in 01-zed). Ctrl held at the
 * release copies (I-718); Escape cancels.
 */
function startTabDrag(e: PointerEvent, ctx: FolderContext, pane: PaneState, file: TabFile): void {
  if (e.button !== 0 || (e.target as Element).closest(".tab-close")) return;
  const el = e.currentTarget as HTMLElement;
  const [x0, y0] = [e.clientX, e.clientY];
  let done = false;
  el.setPointerCapture(e.pointerId);
  const move = (m: PointerEvent) => {
    let d = drag();
    if (!d) {
      if (m.clientX === x0 && m.clientY === y0) return;
      d = { ctx, file, from: pane, fromIndex: pane.tabs().findIndex((t) => t.file === file), target: null };
      window.addEventListener("keydown", escape, true);
    }
    setDrag({ ...d, target: hitTest(d, m.clientX, m.clientY) });
  };
  const finish = (drop: boolean, copy: boolean) => {
    if (done) return;
    done = true;
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("lostpointercapture", lost);
    window.removeEventListener("keydown", escape, true);
    const d = drag();
    setDrag(null);
    if (!d) return;
    dragEnded = true;
    setTimeout(() => (dragEnded = false));
    if (drop && d.target) dropTab(d.ctx, d.file, d.target.pane, d.target.where, copy);
  };
  const up = (u: PointerEvent) => finish(true, u.ctrlKey);
  const lost = () => finish(false, false);
  const escape = (k: KeyboardEvent) => {
    if (k.key !== "Escape") return;
    k.preventDefault();
    k.stopPropagation();
    finish(false, false);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("lostpointercapture", lost);
}

/** The drop line side for tab `index` of `pane` while it is the target (I-715). */
const lineOn = (pane: PaneState, index: number): "left" | "right" | null => {
  const d = drag();
  return d ? lineSide(d.target, pane, index, d.from, d.fromIndex) : null;
};
/** The body overlay of `pane` while it is the target (I-714): "center" or a side. */
const overlayOn = (pane: PaneState | null): string | null => {
  const t = drag()?.target;
  if (!pane || !t || t.pane !== pane) return null;
  return t.where.kind === "center" ? "center" : t.where.kind === "split" ? t.where.dir : null;
};

/** S-7 / I-577: the tab's right-click menu has one entry, its key shown; closing the menu gives focus back (v0.2 R-9). */
function openTabMenu(e: MouseEvent, ctx: FolderContext, file: TabFile, pinned: boolean): void {
  e.preventDefault();
  openContextMenu({ x: e.clientX, y: e.clientY }, [{ label: pinned ? "Unpin Tab" : "Pin Tab", action: "pane::TogglePinTab", run: () => togglePinTab(ctx, file) }]);
}

function TabList(props: { ctx: FolderContext; pane: PaneState }) {
  const tabs = () => props.pane.tabs();
  return (
    <div class="tab-list" role="tablist">
      <For each={tabs()}>
        {(tab, i) => {
          const edges = () => tabEdges(i(), tabs().length, props.pane.active());
          const active = () => i() === props.pane.active();
          const status = tab.file.status;
          return (
            <div
              class="tab"
              classList={{
                active: active(),
                preview: tab.preview,
                pinned: tab.pinned,
                "edge-l": edges().left,
                "edge-r": edges().right,
                "edge-b": edges().bottom,
                "drop-left": lineOn(props.pane, i()) === "left",
                "drop-right": lineOn(props.pane, i()) === "right",
              }}
              role="tab"
              aria-selected={active()}
              data-index={i()}
              onPointerDown={(e) => startTabDrag(e, props.ctx, props.pane, tab.file)}
              // A press does not take focus to the Pane (nor autoscroll on a middle press): a click gives it to the tab's
              // editor, and the right-click menu gives focus back to that Pane's editor (I-610), not to the Pane.
              onMouseDown={(e) => {
                e.preventDefault();
                if (e.button === 2 && !paneElement(props.pane)?.contains(document.activeElement)) focusPane(props.pane);
              }}
              onClick={() => {
                if (dragEnded) return;
                activateTab(props.ctx, props.pane, i()); // one click does not promote a preview tab (I-063)
                focusPane(props.pane);
              }}
              onDblClick={() => keepTab(props.ctx, tab.file)} // I-063
              onAuxClick={(e) => e.button === 1 && void closeTab(props.ctx, tab.file)} // I-075 (a pinned tab is left alone, I-066)
              onContextMenu={(e) => openTabMenu(e, props.ctx, tab.file, !!tab.pinned)}
            >
              {/* L-64, L-25: start slot with the modified dot (L-65, I-071), title, end slot with the close button. */}
              <span class="tab-slot-start">
                <span class="tab-indicator" classList={{ dirty: status().dirty, conflict: status().conflict }} />
              </span>
              {/* L-69 / I-080: a preview tab always has the FileDoc icon and "Preview {file name}", cut at 24 characters. */}
              <Show when={tab.markdown}>
                <span class="tab-icon">
                  <Icon name="file_doc" />
                </span>
              </Show>
              <span class="tab-title" classList={{ deleted: status().deleted }}>
                {truncateName(tab.markdown ? `Preview ${baseName(tab.path)}` : baseName(tab.path), TAB_MAX_TITLE_CHARS)}
              </span>
              {/* I-073 / L-66: right side, shown on hover; it asks like every other close. A pinned tab has the Pin button
                  instead, which unpins (L-241). L-240 / L-241: the key only on the active tab. */}
              {tab.pinned ? (
                <button
                  class="tab-close"
                  aria-label="Unpin Tab"
                  tabindex="-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinTab(props.ctx, tab.file);
                  }}
                  ref={(el) => tooltip(el, () => (active() ? { title: "Unpin Tab", action: "pane::TogglePinTab" } : { title: "Unpin Tab" }))}
                >
                  <Icon name="pin" />
                </button>
              ) : (
                <button
                  class="tab-close"
                  aria-label="Close Tab"
                  tabindex="-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    void closeTab(props.ctx, tab.file);
                  }}
                  ref={(el) => tooltip(el, () => (active() ? { title: "Close Tab", action: "pane::CloseActiveItem" } : { title: "Close Tab" }))}
                >
                  <Icon name="close" />
                </button>
              )}
            </div>
          );
        }}
      </For>
      <div class="tab-bar-drop" classList={{ drop: drag()?.target?.pane === props.pane && drag()?.target?.where.kind === "end" }} />
    </div>
  );
}

function PaneBody(props: { pane: PaneState | null }) {
  // The view of a tab is made once and moved in and out of the DOM, so scroll and selection stay. The effect is made in the
  // ref callback: a `let` ref is only set after the component body has run, and a render effect runs at once.
  return (
    <div class="pane-body">
      <div
        class="pane-item"
        ref={(item) =>
          createRenderEffect(() => {
            const file = props.pane && activeTabOf(props.pane)?.file;
            const dom = file?.view?.dom ?? file?.element;
            // Only when the shown view changes: every new tab array (promotion, rename, a view made) runs this, and taking
            // the same editor out and back in drops its focus mid-typing.
            if (!(dom ? item.firstChild !== dom || item.childNodes.length > 1 : item.firstChild)) return;
            item.replaceChildren(...(dom ? [dom] : []));
            // 03-tauri R-01: CM6 keeps the last DOM selection it read, also one read while it was out of focus. Moved and
            // focused in one go (a tab dropped on another Pane), it took that copy for the selection still being there and
            // then read the browser's caret at the document start as a new selection. Its blur handler drops the copy.
            file?.view?.contentDOM.dispatchEvent(new FocusEvent("blur"));
          })
        }
      />
      <Show when={overlayOn(props.pane)}>{(side) => <div class={`drop-overlay ${side()}`} />}</Show>
    </div>
  );
}

/** I-706 / I-707: the split popup (Split Right, Left, Up, Down), anchored at its top right. */
function SplitButton(props: { ctx: FolderContext; pane: PaneState }) {
  // An editor can be split (clone); a Markdown preview cannot, so it moves when there are two tabs or more.
  const mode = () => splitMode(!!activeTabOf(props.pane), !activeTabOf(props.pane)?.markdown, props.pane.tabs().length);
  const open = (button: HTMLElement) => {
    const m = mode();
    if (!m) return;
    const r = button.getBoundingClientRect();
    const item = (label: string, dir: Dir) => ({ label, action: `pane::Split${label.slice(6)}`, run: () => splitPane(props.ctx, props.pane, dir, m) });
    openContextMenu({ x: r.right, y: r.bottom }, [item("Split Right", "right"), item("Split Left", "left"), item("Split Up", "up"), item("Split Down", "down")], true);
  };
  return (
    <button
      class="icon-button"
      aria-label="Split Pane"
      disabled={!mode()}
      onClick={(e) => open(e.currentTarget)}
      ref={(el) => tooltip(el, () => (menuOpen() ? null : { title: "Split Pane" }))} // L-244: text only, none while the menu is open
    >
      <Icon name="split" />
    </button>
  );
}

/** I-730 / L-245: Maximize icon, or Minimize and the selected look while zoomed. */
function ZoomButton(props: { ctx: FolderContext; pane: PaneState }) {
  const zoomed = () => props.ctx.zoomed() === props.pane;
  return (
    <button
      class="icon-button"
      classList={{ selected: zoomed() }}
      aria-label={zoomed() ? "Zoom Out" : "Zoom In"}
      onClick={() => props.ctx.setZoomed(zoomed() ? null : props.pane)}
      ref={(el) => tooltip(el, () => ({ title: zoomed() ? "Zoom Out" : "Zoom In", action: "workspace::ToggleZoom" }))}
    >
      <Icon name={zoomed() ? "minimize" : "maximize"} />
    </button>
  );
}

/** L-15: one Pane = tab bar + active item. tabindex: focus lands here when it has no editor (A-17). */
function PaneView(props: { ctx: FolderContext | null; pane: PaneState | null }) {
  return (
    <section
      class="pane"
      classList={{ zoomed: !!props.pane && props.ctx?.zoomed() === props.pane }}
      tabindex="-1"
      data-keymap-context="Pane"
      data-pane-id={props.pane?.id}
      onFocusIn={() => props.ctx && props.pane && activatePane(props.ctx, props.pane)}
    >
      <div class="tab-bar">
        <div class="tab-bar-edge start">
          <button class="icon-button" aria-label="Go Back" disabled ref={(el) => tooltip(el, () => ({ title: "Go Back" }))}>
            <Icon name="arrow_left" />
          </button>
          <button class="icon-button" aria-label="Go Forward" disabled ref={(el) => tooltip(el, () => ({ title: "Go Forward" }))}>
            <Icon name="arrow_right" />
          </button>
        </div>
        <Show when={props.ctx && props.pane}>
          <TabList ctx={props.ctx!} pane={props.pane!} />
        </Show>
        <Show when={props.ctx && props.pane && focusedPane() === props.pane.id}>
          <div class="tab-bar-edge end">
            <button class="icon-button" aria-label="New…" disabled ref={(el) => tooltip(el, () => (menuOpen() ? null : { title: "New…" }))}>
              <Icon name="plus" />
            </button>
            <SplitButton ctx={props.ctx!} pane={props.pane!} />
            <ZoomButton ctx={props.ctx!} pane={props.pane!} />
          </div>
        </Show>
      </div>
      {/* E-038 / E-039: the toolbar with the Markdown preview button. Only for a Markdown editor tab: the rest of the toolbar
          (breadcrumbs, buffer search, selection controls) is not in this version. */}
      <Show when={props.ctx && props.pane && activeTabOf(props.pane)}>
        {(tab) => (
          <Show when={!tab().markdown && isMarkdown(tab().path)}>
            <div class="editor-toolbar">
              <div class="toolbar-quick-actions">
                <button
                  class="icon-button"
                  aria-label="Preview Markdown"
                  onClick={(e) => openPreview(props.ctx!, props.pane!, tab().path, e.altKey)} // Alt: in a split (I-078)
                  ref={(el) => tooltip(el, () => ({ title: "Preview Markdown", action: "markdown::OpenPreview", meta: "Alt-Click to open in a split" }))}
                >
                  <Icon name="eye" />
                </button>
              </div>
            </div>
          </Show>
        )}
      </Show>
      <PaneBody pane={props.pane} />
    </section>
  );
}

/** I-726 / I-727: drag the line between child `index` and the next; a double click makes the group's children equal. */
function startResize(e: PointerEvent, group: Group<PaneState>, index: number): void {
  const handle = e.currentTarget as HTMLElement;
  const children = [...handle.parentElement!.children].filter((el) => el.classList.contains("pane-group-child"));
  const horizontal = group.axis === "h";
  const lengths = children.map((el) => (horizontal ? el.getBoundingClientRect().width : el.getBoundingClientRect().height));
  const mins = group.children.map((child) => minLength(child, group.axis, PANE_MIN_DRAG));
  const start = horizontal ? e.clientX : e.clientY;
  handle.setPointerCapture(e.pointerId);
  const move = (m: PointerEvent) => {
    group.flex = toFlex(resize(lengths, mins, index, (horizontal ? m.clientX : m.clientY) - start));
    bumpFlex((n) => n + 1);
  };
  const end = () => {
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", end);
    handle.removeEventListener("lostpointercapture", end);
  };
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", end);
  handle.addEventListener("lostpointercapture", end);
}

function GroupView(props: { ctx: FolderContext; group: Group<PaneState> }) {
  return (
    <div class="pane-group" classList={{ h: props.group.axis === "h", v: props.group.axis === "v" }} data-group-id={props.group.id}>
      <For each={props.group.children}>
        {(child, k) => (
          <>
            <Show when={k() > 0}>
              <div
                class="split-handle"
                classList={{ h: props.group.axis === "h", v: props.group.axis === "v" }}
                onPointerDown={(e) => e.button === 0 && startResize(e, props.group, k() - 1)}
                onDblClick={() => {
                  props.group.flex = props.group.children.map(() => 1);
                  bumpFlex((n) => n + 1);
                }}
              />
            </Show>
            <div class="pane-group-child" data-child={k()}>
              <NodeView ctx={props.ctx} node={child} />
            </div>
          </>
        )}
      </For>
    </div>
  );
}

function NodeView(props: { ctx: FolderContext; node: Node<PaneState> }) {
  return <>{isGroup(props.node) ? <GroupView ctx={props.ctx} group={props.node} /> : <PaneView ctx={props.ctx} pane={props.node} />}</>;
}

/** The center area: the active folder's split tree, or one empty Pane when no folder is active. */
export function PaneArea() {
  createRenderEffect(() => {
    flexVersion();
    const ctx = context();
    flexSheet.replaceSync(ctx ? flexRules(ctx.tree(), []).join("\n") : "");
  });
  return (
    <div class="pane-area">
      <Show when={context()} keyed fallback={<PaneView ctx={null} pane={null} />}>
        {(ctx) => <NodeView ctx={ctx} node={ctx.tree()} />}
      </Show>
    </div>
  );
}

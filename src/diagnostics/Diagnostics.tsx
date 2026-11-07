import { For } from "solid-js";
import { render } from "solid-js/web";
import { commands } from "../keymap/keyboard.ts";
import { openTool } from "../workspace/context.ts";
import { editorContext } from "../workspace/store.ts";
import { IconButton } from "../shell/Icon.tsx";
import { DIAGNOSTICS, DIAGNOSTICS_CONTROLS } from "./model.ts";
import "./diagnostics.css";

function Diagnostics() {
  return <section class="diagnostics" aria-label="Project Diagnostics" tabindex="-1">
    <div class="editor-toolbar diagnostics-toolbar">
      <IconButton {...DIAGNOSTICS_CONTROLS[0]} />
      <div class="toolbar-quick-actions"><For each={DIAGNOSTICS_CONTROLS.slice(1)}>{(control) =>
        <span classList={{ "diagnostics-warning": control.warning }}><IconButton {...control} /></span>
      }</For></div>
    </div>
    <div class="diagnostics-empty" role="status">{DIAGNOSTICS.message}</div>
  </section>;
}

commands.set("diagnostics::Deploy", () => {
  openTool(editorContext(), DIAGNOSTICS.key, () => {
    const element = document.createElement("div");
    element.className = "diagnostics-tab";
    element.tabIndex = -1;
    element.onfocus = () => element.querySelector<HTMLElement>(".diagnostics")?.focus();
    const dispose = render(() => <Diagnostics />, element);
    return { element, dispose, title: () => DIAGNOSTICS.title, icon: DIAGNOSTICS.icon, iconSuccess: DIAGNOSTICS.iconSuccess };
  });
});

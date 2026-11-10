import { createSignal, For, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import iconUrl from "../../src-tauri/icons/icon.png?no-inline"; // ?no-inline: CSP img-src 'self' blocks the data: URL Vite would make of a small file
import { APP_NAME } from "./app-menus.ts";
import { aboutText, attributions, entryLine, licenseCounts, osName, type AboutInfo } from "./about.ts";
import { notify } from "./toast.ts";

declare const __BUILD_DATE__: string; // vite.config.ts: the day `vite build` ran (the dev server: the day it started)

type UserAgentData = { getHighEntropyValues(hints: string[]): Promise<{ platformVersion?: string; architecture?: string; bitness?: string }> };

async function loadInfo(): Promise<AboutInfo> {
  const [version, host, data] = await Promise.all([
    getVersion(),
    invoke<{ tauri: string; webview2: string }>("about_info").catch(() => ({ tauri: "", webview2: "" })),
    ((navigator as { userAgentData?: UserAgentData }).userAgentData?.getHighEntropyValues(["platformVersion", "architecture", "bitness"]) ?? Promise.resolve(undefined)).catch(() => undefined),
  ]);
  return { name: APP_NAME, version, date: __BUILD_DATE__, host: host.tauri ? `Tauri ${host.tauri}` : "unknown", webview2: host.webview2 || "unknown", os: osName(navigator.userAgent, data) };
}

/**
 * I-29: Help > About. A modal <dialog>: the app's name and version, the technical lines, the main third-party libraries (read from the
 * Licenses data in `files`) and the buttons Copy, View All Licenses and OK. Escape closes it, OK has the focus.
 */
export function createAbout(files: Record<string, string>, viewLicenses: () => void) {
  let dialog!: HTMLDialogElement;
  let returnFocus: HTMLElement | null = null;
  const [info, setInfo] = createSignal<AboutInfo>();
  const [copied, setCopied] = createSignal(false);
  const list = attributions(files), counts = licenseCounts(files);

  const open = () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCopied(false);
    void loadInfo().then((loaded) => { setInfo(loaded); dialog.showModal(); }).catch((error) => notify([String(error)]));
  };
  const copy = () => {
    const current = info();
    if (!current) return;
    invoke("write_clipboard_text", { text: aboutText(current, list, counts) })
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })
      .catch((error) => notify([String(error)]));
  };
  const all = () => { returnFocus = null; dialog.close(); viewLicenses(); }; // the Licenses tab takes the focus, not the old place

  const Dialog = () => <dialog class="about-dialog" ref={dialog} aria-labelledby="about-title" onClose={() => returnFocus?.focus()}>
    <Show when={info()}>{(current) => <>
      <header class="about-header">
        <img class="about-icon" src={iconUrl} alt="" />
        <div><h1 id="about-title">{current().name}</h1><p>Version {current().version}</p></div>
      </header>
      <div class="about-body">
        <dl class="about-info">
          <dt>Version</dt><dd>{current().version}</dd>
          <dt>Date</dt><dd>{current().date}</dd>
          <dt>Host</dt><dd>{current().host}</dd>
          <dt>WebView2</dt><dd>{current().webview2}</dd>
          <dt>OS</dt><dd>{current().os}</dd>
        </dl>
        <h2>Third-Party Software &amp; Attributions</h2>
        <ul class="about-attributions">
          <For each={list}>{(entry) => <li>{entryLine(entry)}</li>}</For>
          <li>and {counts.rust} Rust crates and {counts.javascript} JavaScript packages, listed in full in Licenses</li>
        </ul>
      </div>
      <div class="about-buttons">
        <button onClick={copy}>{copied() ? "Copied" : "Copy"}</button>
        <button onClick={all}>View All Licenses</button>
        <button autofocus onClick={() => dialog.close()}>OK</button>
      </div>
    </>}</Show>
  </dialog>;
  return { open, Dialog };
}

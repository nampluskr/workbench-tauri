import { classifyLink, localImagePath, type LinkTarget } from "./markdown.ts";
import { FIND_BLOCKS, FIND_SKIP } from "./preview-find.ts";
import { CODE_BLOCK_COPIED_MS } from "../spec/metrics.ts";

// core v0.8 I-1 / v0.8.1 I-7: HTML preview. The page is its own document at `http://preview.localhost/<id>` (src-tauri
// preview.rs) in `<iframe sandbox="allow-scripts" csp=PREVIEW_CSP>`: its scripts run in an opaque origin (no parent DOM, no
// storage, no IPC origin), with no forms, popups, modals or top navigation. Every local file the page names is pointed at the
// asset protocol (M-8: relative to the HTML file, or absolute, anywhere); internet resources are dropped from the markup and
// PREVIEW_CSP blocks what scripts ask for (no request at all, I-7 condition 3).

type Convert = (path: string) => string; // local path -> asset URL (convertFileSrc), injected so this file runs under node

const clean = (value: string) => value.replace(/[\t\n\r]/g, "").trim();

/** The URL a resource attribute becomes: `#id` as it is, a local file as its asset URL, null (drop it) for anything else (any scheme, `//host`, javascript:, empty). */
export function resourceUrl(value: string, sourcePath: string, convert: Convert): string | null {
  const v = clean(value);
  if (v === "") return null;
  if (v.startsWith("#")) return v;
  const path = localImagePath(v, sourcePath);
  return path === null ? null : convert(path);
}

/**
 * CSS text with `@import` removed and every `url(...)` pointed at its asset URL (`url("")` for what is dropped).
 * shortcut: the inside of a linked CSS file is not rewritten (its relative url() cannot resolve against an asset URL, M-7);
 * add a read-and-rewrite step for linked CSS only if such pages must show their CSS images.
 */
export function rewriteCss(css: string, sourcePath: string, convert: Convert): string {
  return css
    .replace(/@import\b[^;{}]*;?/gi, "")
    .replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))\s*\)/gi, (_, a, b, c) => `url("${resourceUrl(a ?? b ?? c ?? "", sourcePath, convert) ?? ""}")`);
}

/** A `srcset` value with each candidate pointed at its asset URL; candidates that are dropped leave out. */
export function rewriteSrcset(value: string, sourcePath: string, convert: Convert): string {
  const kept: string[] = [];
  for (const candidate of value.split(",")) {
    const [url, ...descriptor] = candidate.trim().split(/\s+/);
    const to = url ? resourceUrl(url, sourcePath, convert) : null;
    if (to) kept.push([to, ...descriptor].join(" "));
  }
  return kept.join(", ");
}

/**
 * The frame document's policy, as its first `<meta>` and as the frame's `csp` attribute (the response must accept it, so the
 * frame cannot be navigated to an asset URL, which has no policy). No connect, frame or worker source and no internet source:
 * scripts, styles, images, fonts and media come inline or from local files only.
 * I-15: `webrtc 'block'` because WebRTC ICE/STUN traffic is not governed by connect-src; it blocks it in engines that honour
 * the directive (WebView2 does not: NO_WEBRTC).
 */
export const PREVIEW_CSP = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' asset: http://asset.localhost; style-src 'unsafe-inline' asset: http://asset.localhost; img-src data: blob: asset: http://asset.localhost; font-src data: asset: http://asset.localhost; media-src asset: http://asset.localhost; connect-src 'none'; form-action 'none'; base-uri 'none'; webrtc 'block'";

// I-15: WebView2 ignores the CSP `webrtc` directive (STUN went out, verify/ORDER-08/leader-probe), so the frame document's first
// script deletes these from `window`. A page cannot get them back from an about:blank child: that one is another opaque origin.
// A `srcdoc` child has them anew and no script can cover it, so WebRTC UDP is also off browser-wide (src-tauri lib.rs, I-15).
const NO_WEBRTC = ["RTCPeerConnection", "webkitRTCPeerConnection"];

const DROP_TAGS = "base, iframe, frame, frameset, embed, object, applet";
const URL_ATTRS = new Set(["src", "href", "xlink:href", "poster", "data", "background", "action", "formaction"]);
/**
 * An attribute that makes the preview navigate (a link, a form target): dropped whole, except a link's `#id`, which scrolls
 * within the page (the document has its own URL, so it no longer resolves against the app's). `#id` references that do not
 * navigate (`<use href="#id">`) are kept by resourceUrl.
 */
export const navigates = (tag: string, attr: string, value: string): boolean =>
  (attr === "href" || attr === "xlink:href") && (tag === "a" || tag === "area") ? !clean(value).startsWith("#") : attr === "action" || attr === "formaction";

// Not Zed values (K-07a-R1, tauri decision): a page may navigate its frame away this many times within the window and still be
// shown again. A user clicking through links stays far below it; a page navigating on a timer or on load reaches it in seconds.
export const PREVIEW_RECOVER_LIMIT = 5;
export const PREVIEW_RECOVER_WINDOW_MS = 5000;

/** The recovery times still inside the window plus `now`, or null when showing the page again once more would pass the limit. */
export function recordRecovery(times: readonly number[], now: number): number[] | null {
  const recent = times.filter((t) => now - t < PREVIEW_RECOVER_WINDOW_MS);
  return recent.length >= PREVIEW_RECOVER_LIMIT ? null : [...recent, now];
}

// I-14, not Zed values (K-08b, tauri decision): the parent pings a shown HTML frame every PREVIEW_PING_MS; no answer for
// PREVIEW_HANG_MS since the first unanswered ping means its renderer is stuck. The stuck host is then avoided for
// PREVIEW_HOST_AVOID_MS, twice the 5-10 s a renderer took to end after its frame was removed (verify/ORDER-08/m-host.json).
export const PREVIEW_PING_MS = 1000;
export const PREVIEW_HANG_MS = 5000;
export const PREVIEW_HOST_AVOID_MS = 20000;

/**
 * The preview scheme's hosts (src-tauri lib.rs): each is its own site, so its own renderer process. `preview` and `preview1`
 * draw ordinary previews; `preview2` only previews that were once stuck, so a page that loops again on its next render does not
 * take an ordinary host (and every ordinary preview drawn there) with it.
 */
export const PREVIEW_HOSTS = ["preview", "preview1", "preview2"] as const;
export type PreviewHost = (typeof PREVIEW_HOSTS)[number];
const ORDINARY_HOSTS = ["preview", "preview1"] as const;

/**
 * The host a preview is drawn on now, or the ms to wait before drawing it. An ordinary preview takes the first ordinary host
 * not avoided, or, when both are, the one whose avoidance ends first. A preview once stuck (`wasStuck`) draws on `preview2`
 * only, after its avoidance ends.
 * shortcut: ordinary previews stuck together on one host all become once-stuck and share `preview2`; two different looping pages
 * stuck on both ordinary hosts within PREVIEW_HOST_AVOID_MS cannot be avoided. Add schemes if that must work.
 */
export function previewHost(now: number, avoidUntil: Readonly<Record<PreviewHost, number>>, wasStuck: boolean): PreviewHost | number {
  if (wasStuck) return avoidUntil.preview2 <= now ? "preview2" : avoidUntil.preview2 - now;
  return ORDINARY_HOSTS.find((h) => avoidUntil[h] <= now) ?? ORDINARY_HOSTS.reduce((a, b) => (avoidUntil[b] < avoidUntil[a] ? b : a));
}

/**
 * core v0.8.1 I-24 / v0.8.2 I-20: a link the user clicked in an HTML preview, as every preview follows it (classifyLink), relative
 * to the HTML file. Null (nothing) for `#id` too: the page scrolls itself.
 */
export function classifyHtmlLink(href: string, sourcePath: string, alt: boolean): LinkTarget | null {
  const target = classifyLink(href, sourcePath, alt);
  return target?.kind === "anchor" ? null : target;
}

/** I-24: where a link's own target is kept in the frame document; its `href` becomes `#`, so the frame itself never navigates to it. */
export const PREVIEW_LINK_ATTR = "data-preview-href";

/** core v0.8.2 I-6: where a source heading's number is kept in the frame document: h1~h6 in document order, the Outline's count (syntax/outline.ts htmlOutline). */
export const PREVIEW_HEADING_ATTR = "data-preview-heading";

/** What an attribute becomes: its new value, null to drop it, undefined to keep it as it is (event handlers too: scripts run, I-7). */
export function attributeValue(tag: string, name: string, value: string, sourcePath: string, convert: Convert): string | null | undefined {
  if (name === "ping") return null;
  if (name === "style") return rewriteCss(value, sourcePath, convert);
  if (name === "srcset") return rewriteSrcset(value, sourcePath, convert) || null;
  if (!URL_ATTRS.has(name)) return undefined;
  return navigates(tag, name, value) ? null : resourceUrl(value, sourcePath, convert);
}

/** The applied Preview theme as the HTML preview needs it: the same tokens as the Markdown preview (text, L-108 link colour). */
export type PreviewLook = { appearance: "light" | "dark"; text: string; accent: string; /** core v0.8.2 I-14: the base look (frameBaseStyle, fonts), put after the defaults */ base?: string;
  /** core v0.8.2 I-19: the page zoom the document starts with (the Ctrl+= size over the Settings size) */ zoom?: number };

// core v0.8.2 I-14: what the Markdown preview gets from its containers and not from a `.markdown-body` rule, by the same variables:
// the container padding (L-102), the app's text font (app.css body), and which icon the Copy button shows (the head script sets data-copied).
const FRAME_GLUE = "html{padding:var(--markdown-preview-container-padding)}"
  + "body{font-family:var(--ui-font-family);font-weight:var(--font-weight-default);font-feature-settings:var(--ui-font-feature-settings)}"
  + ".code-block-copy:not([data-copied])>:nth-child(2),.code-block-copy[data-copied]>:first-child{display:none}";

/**
 * core v0.8.2 I-14: the Markdown preview's look for the frame document. `css` is the app's own preview rules as they are (the
 * `.markdown-body`, code block, icon and Preview theme syntax rules); `value` gives a variable's value at a preview. The page's
 * `<body>` stands for `.markdown-body` (each selector keeps its weight against the others), variables become their values (a frame
 * inherits none, and a page's own `--text` must not reach these rules; a variable the rules set themselves stays), and rem
 * lengths become the app's (the frame's root size is the page's). All of it is one cascade layer: any page rule, outside a layer,
 * wins whatever its specificity (M-7), so only what the page leaves unset shows it.
 */
export function frameBaseStyle(css: string, value: (name: string) => string): string {
  let out = (FRAME_GLUE + css)
    .replaceAll(".heading-colors .markdown-body", ":root:root body")
    .replaceAll(".markdown-body.left-margin", ":root body") // core v0.8.2 I-15: an HTML page gets the left margin too
    .replaceAll(".markdown-body", ":root body")
    .replaceAll(".markdown-preview ", ":root ");
  const own = new Set(Array.from(out.matchAll(/[{;]\s*(--[\w-]+)\s*:/g), (m) => m[1]));
  const inner = /var\(\s*(--[\w-]+)\s*(?:,([^()]*))?\)/g; // a var() with no var() inside: nested ones resolve from the inside out
  for (let last = ""; last !== out;) {
    last = out;
    out = out.replace(inner, (all, name: string, fallback?: string) => own.has(name) ? all.replace("var(", "var\0(") : value(name) || (fallback ?? "").trim());
  }
  const rem = value("--units-rem-size");
  return `@layer{${out.replaceAll("var\0(", "var(").replace(/(\d*\.?\d+)rem\b/g, `calc($1 * ${rem})`).replace(/<\//g, "<\\/")}}`;
}

/**
 * core v0.8.2 I-14: the text a frame asks the app to copy (its head script, on a click the user made on a code block's Copy
 * button), or null: not from this preview's frame, without the preview's token, or not a string. Writing that text to the
 * clipboard is all such a message can do.
 */
export function copyRequest(e: { source: unknown; data: unknown }, frameWindow: unknown, token: string): string | null {
  if (!frameWindow || e.source !== frameWindow) return null;
  const copy: unknown = (e.data as { previewCopy?: unknown } | null | undefined)?.previewCopy;
  return copy && typeof copy === "object" && "token" in copy && copy.token === token && "text" in copy && typeof copy.text === "string" ? copy.text : null;
}

// core v0.8.2 I-6 / I-7 / I-19 / I-25 (ORDER-07): the Outline, the font size keys and the find bar cross the frame's border by
// messages only. The frame asks for one of a fixed few things (frameRequest); the app tells it where to scroll, how far to zoom
// and what to mark (frameMessage).

/** The fixed things a key pressed inside the frame asks of the app. Nothing else is run for a frame: never an action by a name it sends. */
export const FRAME_KEYS = ["zoomIn", "zoomOut", "zoomReset", "find", "findNext", "findPrevious", "cancel"] as const;
export type FrameKey = (typeof FRAME_KEYS)[number];

/**
 * In the frame (put there by its source text, so it uses nothing outside itself): what a key press asks, by the physical key, or
 * null. The app's default keys for these (shell/status.ts, keymap/builtin.ts).
 * shortcut: a keymap.json rebinding of them does not reach inside the frame; send the app's bindings to the frame if that is wanted.
 */
export function frameKey(code: string, ctrl: boolean, shift: boolean, other: boolean): FrameKey | null {
  if (other) return null; // with Alt or the Windows key
  if (!ctrl) return code === "F3" ? (shift ? "findPrevious" : "findNext") : code === "Escape" && !shift ? "cancel" : null;
  if (code === "KeyF") return shift ? null : "find";
  return code === "Equal" || code === "NumpadAdd" ? "zoomIn" : code === "Minus" || code === "NumpadSubtract" ? "zoomOut" : code === "Digit0" || code === "Numpad0" ? "zoomReset" : null;
}

/**
 * In the frame (by its source text, as frameKey): the last of `count` things in document order that `atOrBefore` holds for, by
 * halving; -1 when it holds for none. The heading a click is under (I-7), the text node an offset is in (I-25).
 */
export function lastAtOrBefore(count: number, atOrBefore: (index: number) => boolean): number {
  let lo = -1, hi = count - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (atOrBefore(mid)) lo = mid; else hi = mid - 1;
  }
  return lo;
}

// Not a Zed value (K-08, tauri decision): the most text a frame hands over for the find bar; the app looks at no more than this.
export const PREVIEW_FIND_MAX_CHARS = 5_000_000;

/** What a frame may ask (frameRequest): a key's fixed action, the source heading a click was under (-1: before the first), or its text for the find bar. */
export type FrameRequest = { key: FrameKey } | { heading: number } | { text: string };

/**
 * A frame's request, or null: not from this preview's frame, without the preview's token (only the head script has it, and it
 * sends on what the user did or the app asked), or not exactly one of the three shapes. A request made up all the same can at
 * most change the preview font size, open or step or close this preview's find bar, move this preview's Outline mark, or change
 * the find bar's count.
 */
export function frameRequest(e: { source: unknown; data: unknown }, frameWindow: unknown, token: string): FrameRequest | null {
  if (!frameWindow || e.source !== frameWindow) return null;
  const act: unknown = (e.data as { previewAct?: unknown } | null | undefined)?.previewAct;
  if (!act || typeof act !== "object" || !("token" in act) || act.token !== token || Object.keys(act).length !== 2) return null;
  const { key, heading, text } = act as { key?: unknown; heading?: unknown; text?: unknown };
  if (typeof key === "string") return (FRAME_KEYS as readonly string[]).includes(key) ? { key: key as FrameKey } : null;
  if (typeof heading === "number") return Number.isInteger(heading) && heading >= -1 ? { heading } : null;
  return typeof text === "string" ? { text: text.slice(0, PREVIEW_FIND_MAX_CHARS) } : null;
}

/**
 * Every message the app sends its frame. A page script reads them all, so none carries the preview's token (I-24: the token is
 * what makes a link click the user's). `find`: `marks` is from-to pairs over the text the frame last handed over (null: as they
 * were), `at` the current pair (-1: none), brought into view with `scroll`.
 */
export const frameMessage = {
  ping: () => ({ previewPing: true }),
  scrollTo: (y: number) => ({ previewScrollTo: y }),
  zoom: (factor: number) => ({ previewZoom: factor }),
  reveal: (heading: number) => ({ previewReveal: heading }),
  findRead: () => ({ previewFindRead: true }),
  find: (marks: number[] | null, at: number, scroll: boolean) => ({ previewFind: marks ? { marks, at, scroll } : { at, scroll } }),
};

/**
 * The frame's side of those messages, a script of its own ahead of the link script. As that one it keeps the built-ins the token
 * passes through, removes itself, and listens in the capture phase to what the user did only (`isTrusted`).
 * - I-19 / I-25: the keys of frameKey are taken from the page (so WebView2's own find box does not open) and sent; Escape is sent
 *   and left to the page. The zoom is the root's `zoom`, so a page with font sizes of its own grows too.
 * - I-7: a click that is not on a link or a Copy button sends the source heading it is under (PREVIEW_HEADING_ATTR; a heading a
 *   page script made has no number and counts as text).
 * - I-6: previewReveal scrolls to the source heading of that number, when the page still has it.
 * - I-25: previewFindRead hands over the shown text (text nodes that are drawn, blocks on lines of their own, as the app's
 *   preview find reads its own); previewFind marks ranges of it with the CSS Custom Highlight API (the page's DOM is not changed).
 *   shortcut: text in a shadow tree, a canvas, a form field or generated content is not found; the marks follow the text as it
 *   was read, so text a script draws later is found on the next change of the query.
 */
function frameScript(token: string, zoom: number): string {
  return `<script>(()=>{const T=${JSON.stringify(token)},U=parent,A=Reflect.apply,P=U.postMessage,O=Object.getOwnPropertyDescriptor,D=Event.prototype.preventDefault,R=O(Event.prototype,"target").get,`
    + `[KC,KS,KH,KA,KM]=["code","ctrlKey","shiftKey","altKey","metaKey"].map(n=>O(KeyboardEvent.prototype,n).get),send=(k,v)=>A(P,U,[{previewAct:{token:T,[k]:v}},"*"]),`
    + `key=(${frameKey}),last=(${lastAtOrBefore}),Z=z=>{if(typeof z==="number"&&z>0)document.documentElement.style.zoom=z};document.currentScript.remove();Z(${Number.isFinite(zoom) ? zoom : 1});`
    + `addEventListener("keydown",e=>{if(!e.isTrusted)return;const k=key(A(KC,e,[]),A(KS,e,[]),A(KH,e,[]),A(KA,e,[])||A(KM,e,[]));if(!k)return;if(k!=="cancel")A(D,e,[]);send("key",k)},true);`
    + `addEventListener("click",e=>{if(!e.isTrusted)return;const t=A(R,e,[]);if(!(t instanceof Element)||t.closest("a,area,button.code-block-copy"))return;`
    + `const h=document.querySelectorAll("[${PREVIEW_HEADING_ATTR}]"),i=last(h.length,i=>h[i]===t||!!(h[i].compareDocumentPosition(t)&4));send("heading",i<0?-1:Number(h[i].getAttribute("${PREVIEW_HEADING_ATTR}")))},true);`
    + `let segs=[],marks=[];const H=[new Highlight,new Highlight];H[1].priority=1;CSS.highlights.set("preview-find",H[0]);CSS.highlights.set("preview-find-current",H[1]);`
    + `const read=()=>{segs=[];let text="",block;const w=document.createTreeWalker(document.documentElement,4);for(let n=w.nextNode();n&&text.length<${PREVIEW_FIND_MAX_CHARS};n=w.nextNode()){`
    + `const p=n.parentElement;if(!n.data||!p||p.closest(${JSON.stringify(FIND_SKIP)})||!p.checkVisibility({visibilityProperty:true}))continue;`
    + `const at=p.closest(${JSON.stringify(FIND_BLOCKS)});if(text&&at!==block)text+="\\n";block=at;segs.push([n,text.length]);text+=n.data.replace(/\\r/g," ")}return text},`
    + `range=(from,to)=>{const r=new Range,s=segs[last(segs.length,i=>segs[i][1]<=from)],e=segs[last(segs.length,i=>segs[i][1]<to)];r.setStart(s[0],from-s[1]);r.setEnd(e[0],Math.min(to-e[1],e[0].length));return r};`
    + `addEventListener("message",e=>{const d=e.data;if(e.source!==U||!d||typeof d!=="object")return;if("previewZoom" in d)Z(d.previewZoom);`
    + `if(Number.isInteger(d.previewReveal))document.querySelector('[${PREVIEW_HEADING_ATTR}="'+d.previewReveal+'"]')?.scrollIntoView({block:"start"});`
    + `if(d.previewFindRead===true)send("text",read());const f=d.previewFind;if(!f)return;`
    + `try{if(f.marks){marks=[];for(let i=0;i+1<f.marks.length;i+=2)marks.push(range(f.marks[i],f.marks[i+1]))}}catch{marks=[]}`
    + `H[0].clear();H[1].clear();marks.forEach((r,i)=>H[i===f.at?1:0].add(r));const r=f.scroll&&marks[f.at];if(!r)return;const b=r.getBoundingClientRect();`
    + `if(b.top<0||b.bottom>innerHeight)scrollBy(0,(b.top+b.bottom-innerHeight)/2);if(b.left<0||b.right>innerWidth)scrollBy((b.left+b.right-innerWidth)/2,0)})})()</script>`;
}

/**
 * core v0.8 I-11: page defaults from the Preview theme. Every selector is `:where()` (specificity 0), so any rule, `<link>`,
 * `<style>` or `style=` of the page wins (M-7); only the page's own absence of a value shows these. The background is not here:
 * it is the iframe element's (`.html-frame` in app.css), so a page `body { background }` still reaches the canvas. The
 * `color-scheme` must equal the element's (`--preview-color-scheme`), or Chromium paints an opaque canvas over that background.
 */
export function defaultStyle({ appearance, text, accent }: PreviewLook): string {
  return `:where(:root){color-scheme:${appearance}}:where(html){color:${text}}:where(a){color:${accent}}`;
}

/**
 * What goes first in the frame's `<head>`: the policy, the I-11 defaults, and a script that keeps the scroll across re-renders
 * (the parent cannot read a cross-origin frame's scroll: the frame reports it, and the next document starts at `scrollY`).
 * The script first tells the parent this is the preview's own document (previewReady), so its load is not taken for a
 * navigation away; an error page or the scheme's empty 204 document has no such script. It answers the parent's ping (I-14),
 * so a page stuck in a loop is found by its silence. Before all that it removes WebRTC (NO_WEBRTC).
 *
 * I-24: a second script follows clicked links (classifyHtmlLink in the parent). It runs before any page script, so it keeps the
 * built-ins it uses (a page may replace prototypes later), listens first in the window's capture phase, cancels every link click
 * (the frame never navigates), and reports only clicks the user made (`isTrusted` is an unforgeable own property). The report
 * carries `token`, a secret of the preview: the script removes itself first, so no page script can read the token, and a
 * `parent.postMessage` of the page (or of a document the frame was navigated to) without it is ignored.
 */
export function headStart(look: PreviewLook, scrollY: number, token: string): string {
  const top = Number.isFinite(scrollY) && scrollY > 0 ? Math.round(scrollY) : 0;
  return `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}"><style>${defaultStyle(look)}</style>${look.base ? `<style>${look.base}</style>` : ""}`
    + `<script>${NO_WEBRTC.map((name) => `delete window.${name};`).join("")}parent.postMessage({previewReady:true},"*");addEventListener("message",e=>{if(e.source!==parent)return;if(e.data?.previewPing===true)parent.postMessage({previewPong:true},"*");if(typeof e.data?.previewScrollTo==="number")scrollTo(0,e.data.previewScrollTo)});addEventListener("load",()=>scrollTo(0,${top}));addEventListener("scroll",()=>parent.postMessage({previewScrollY:scrollY},"*"),{passive:true})</script>`
    + frameScript(token, look.zoom ?? 1) // core v0.8.2 I-6 / I-7 / I-19 / I-25
    + `<script>(()=>{const T=${JSON.stringify(token)},U=parent,A=Reflect.apply,P=U.postMessage,E=Element.prototype,S=String.prototype,C=E.closest,G=E.getAttribute,M=S.trim,W=S.startsWith,D=Event.prototype.preventDefault,O=Object.getOwnPropertyDescriptor,R=O(Event.prototype,"target").get,K=O(MouseEvent.prototype,"altKey").get;`
    + `document.currentScript.remove();addEventListener("click",e=>{let a=null;try{a=A(C,A(R,e,[]),["a,area"])}catch{}if(!a)return;`
    + `const d=A(G,a,["${PREVIEW_LINK_ATTR}"]),h=d===null?A(G,a,["href"]):d;if(h===null||d===null&&A(W,A(M,h,[]),["#"]))return;`
    + `A(D,e,[]);if(e.isTrusted)A(P,U,[{previewLink:{token:T,href:h,alt:A(K,e,[])}},"*"])},true);`
    // core v0.8.2 I-14: a code block's Copy button (the app builds it, markdown-preview.ts frameBlocks): the block's text goes to
    // the app, which owns the clipboard. Only a click the user made, and with the token, as a link.
    + `const Q=E.querySelector,X=O(Node.prototype,"textContent").get,Y=E.setAttribute,Z=E.removeAttribute,N=setTimeout;`
    + `addEventListener("click",e=>{let b=null;try{b=A(C,A(R,e,[]),["button.code-block-copy"])}catch{}if(!b||!e.isTrusted)return;`
    + `const x=A(C,b,[".code-block"]),p=x&&A(Q,x,["pre"]);if(!p)return;A(P,U,[{previewCopy:{token:T,text:A(X,p,[])}},"*"]);`
    + `A(Y,b,["data-copied",""]);N(()=>A(Z,b,["data-copied"]),${CODE_BLOCK_COPIED_MS})},true)})()</script>`;
}

/** `serialized` (an `outerHTML` of a parsed document) with `html` as the first children of `<head>`, ahead of every page element. */
export function withHead(serialized: string, html: string): string {
  // The serializer writes attribute values in double quotes only, so a `>` inside one cannot end the tag early here.
  const head = /^<html(?:"[^"]*"|[^>"])*>\s*<head(?:"[^"]*"|[^>"])*>/i.exec(serialized);
  return head ? head[0] + html + serialized.slice(head[0].length) : html + serialized;
}

/**
 * The frame document: HTML `text` of the file at `sourcePath`, parsed and rewritten (the DOMParser tree is inert and never in the app).
 * shortcut: only the markup's URLs are rewritten; a relative URL a script builds resolves against the preview URL and gets
 * nothing (204). Serve local files from the preview scheme if scripted pages must load them.
 */
export async function htmlPreviewDoc(text: string, sourcePath: string, convert: Convert, look: PreviewLook, scrollY: number, token: string,
  decorate?: (doc: Document) => Promise<void>): Promise<string> {
  const doc = new DOMParser().parseFromString(text, "text/html");
  // core v0.8.2 I-6: the source's h1~h6 get their numbers before anything is dropped, so they count as the Outline counts them
  // (every heading element of the text, a <template>'s too). A number the page wrote itself goes first.
  // shortcut: where the HTML parser and the Outline's grammar read broken markup differently, the numbers part from the Outline's
  // from there on; number them from the Outline's own offsets if such pages show it.
  for (const el of doc.querySelectorAll(`[${PREVIEW_HEADING_ATTR}]`)) el.removeAttribute(PREVIEW_HEADING_ATTR);
  const headings = (root: ParentNode): Element[] => [...root.querySelectorAll("h1, h2, h3, h4, h5, h6, template")].flatMap((el) => el instanceof HTMLTemplateElement ? headings(el.content) : [el]);
  headings(doc).forEach((el, i) => el.setAttribute(PREVIEW_HEADING_ATTR, String(i)));
  for (const el of doc.querySelectorAll(DROP_TAGS)) el.remove();
  for (const el of doc.querySelectorAll('meta[http-equiv="refresh" i]')) el.remove();
  for (const link of doc.querySelectorAll("link")) {
    if (!link.relList.contains("stylesheet")) link.remove();
    else for (const name of ["crossorigin", "integrity"]) link.removeAttribute(name); // an asset URL is cross-origin: a CORS-mode request would fail
  }
  // shortcut: a module `<script src>` always loads in CORS mode and the asset protocol allows only the app's origin, so it does
  // not run; serve local files from the preview scheme if such pages must run.
  for (const script of doc.querySelectorAll("script")) for (const name of ["crossorigin", "integrity"]) script.removeAttribute(name);
  for (const style of doc.querySelectorAll("style")) style.textContent = rewriteCss(style.textContent ?? "", sourcePath, convert);
  for (const el of doc.querySelectorAll("*")) {
    for (const { name, value } of [...el.attributes]) {
      const lower = name.toLowerCase();
      const to = attributeValue(el.localName, lower, value, sourcePath, convert);
      if (to) el.setAttribute(name, to);
      else if (to !== undefined) {
        el.removeAttribute(name);
        // I-24: a link keeps its target for the head script; `href="#"` keeps it a focusable link that cannot leave the page.
        if (lower === "href" || lower === "xlink:href") if (navigates(el.localName, lower, value)) {
          el.setAttribute(PREVIEW_LINK_ATTR, value);
          if (lower === "href") el.setAttribute("href", "#");
        }
      }
    }
  }
  await decorate?.(doc); // core v0.8.2 I-14: the app's own blocks (table and code block boxes), after the page's attributes are rewritten
  return (doc.doctype ? "<!DOCTYPE html>" : "") + withHead(doc.documentElement.outerHTML, headStart(look, scrollY, token));
}

// Grammar + query loading for the PoC (SPEC R-10, D-8, D-9).
// Files come from the installed Zed HTML extension through the core's `zlext`
// protocol (src-tauri/src/ext_protocol.rs); nothing is copied (D-9).
import { Language, Parser, Query } from "web-tree-sitter";
import runtimeWasmUrl from "web-tree-sitter/web-tree-sitter.wasm?url";

/** Windows WebView2 URL of a file in an installed extension (custom scheme `zlext`). */
export function extUrl(id: string, rel: string): string {
  return `http://zlext.localhost/${encodeURIComponent(id)}/${rel
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

let initPromise: Promise<void> | null = null;

export function initParser(): Promise<void> {
  initPromise ??= Parser.init({
    // Only the runtime wasm is provided. Any other name (e.g. a "needed"
    // dynamic library such as "libc.so") deliberately resolves to nothing.
    locateFile: (name: string) =>
      name.endsWith("web-tree-sitter.wasm") ? runtimeWasmUrl : `/__not-provided__/${name}`,
  });
  return initPromise;
}

export interface DylinkInfo {
  hasDylink: boolean;
  needed: string[];
  /** Byte offset of the NEEDED subsection's type byte, if present. */
  neededTypeOffset: number | null;
}

/** Read the `dylink.0` custom section (it must be the first section). */
export function inspectDylink(bytes: Uint8Array): DylinkInfo {
  const info: DylinkInfo = { hasDylink: false, needed: [], neededTypeOffset: null };
  let p = 8;
  const leb = () => {
    let r = 0;
    let s = 0;
    let x: number;
    do {
      x = bytes[p++];
      r |= (x & 0x7f) << s;
      s += 7;
    } while (x & 0x80);
    return r >>> 0;
  };
  const str = () => {
    const n = leb();
    const t = new TextDecoder().decode(bytes.subarray(p, p + n));
    p += n;
    return t;
  };
  if (bytes[p++] !== 0) return info;
  const size = leb();
  const end = p + size;
  if (str() !== "dylink.0") return info;
  info.hasDylink = true;
  while (p < end) {
    const typePos = p;
    const type = bytes[p++];
    const len = leb();
    const start = p;
    if (type === 2) {
      info.neededTypeOffset = typePos;
      const n = leb();
      for (let i = 0; i < n; i++) info.needed.push(str());
    }
    p = start + len;
  }
  return info;
}

export interface ShimResult {
  bytes: Uint8Array;
  applied: boolean;
  removedNeeded: string[];
  note: string;
}

/**
 * Compatibility shim (finding of 03-tauri R-19, recorded in PROGRESS Phase 3):
 * Zed's grammar modules are dynamic-link side modules whose `dylink.0` lists
 * `libc.so` as a needed library. web-tree-sitter's runtime already exports the
 * libc symbols the grammar imports, but its loader tries to fetch `libc.so` as
 * a file. In an in-memory copy only, the NEEDED subsection's type byte is set
 * to an unused value, which the loader skips. Applied only when the needed
 * list is exactly ["libc.so"]; the file on disk is never changed.
 */
export function shimNeededLibc(original: Uint8Array): ShimResult {
  const info = inspectDylink(original);
  if (
    !info.hasDylink ||
    info.neededTypeOffset === null ||
    info.needed.length !== 1 ||
    info.needed[0] !== "libc.so"
  ) {
    return { bytes: original, applied: false, removedNeeded: [], note: "no libc.so NEEDED entry" };
  }
  const copy = new Uint8Array(original);
  copy[info.neededTypeOffset] = 0x7f;
  return {
    bytes: copy,
    applied: true,
    removedNeeded: info.needed,
    note: `dylink.0 NEEDED subsection type byte at offset ${info.neededTypeOffset} set to 0x7f (in memory)`,
  };
}

export const QUERY_NAMES = ["brackets", "highlights", "indents", "injections", "outline", "overrides"] as const;
export type QueryName = (typeof QUERY_NAMES)[number];

export interface QueryResult {
  name: QueryName;
  ok: boolean;
  error: string | null;
  patternCount: number;
  captureNames: string[];
  query: Query | null;
}

export interface HtmlGrammar {
  extension: "html";
  grammarUrl: string;
  bytes: number;
  dylink: DylinkInfo;
  rawLoad: { ok: boolean; error: string | null };
  shim: Omit<ShimResult, "bytes">;
  language: Language | null;
  abiVersion: number | null;
  loadError: string | null;
  queries: Record<QueryName, QueryResult>;
}

let htmlPromise: Promise<HtmlGrammar> | null = null;

async function fetchBytes(url: string): Promise<Uint8Array> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.headers.get("X-Zedlike-Denied") ?? ""} ${url}`);
  return new Uint8Array(await r.arrayBuffer());
}

async function loadHtmlOnce(): Promise<HtmlGrammar> {
  await initParser();
  const grammarUrl = extUrl("html", "grammars/html.wasm");
  const bytes = await fetchBytes(grammarUrl);
  const dylink = inspectDylink(bytes);
  // 1) Unmodified bytes first, so the finding is reproducible.
  let rawLoad: HtmlGrammar["rawLoad"];
  let language: Language | null = null;
  try {
    language = await Language.load(bytes);
    rawLoad = { ok: true, error: null };
  } catch (e) {
    rawLoad = { ok: false, error: String((e as Error)?.message ?? e) };
  }
  // 2) If that fails, the in-memory shim.
  let shim: Omit<ShimResult, "bytes"> = { applied: false, removedNeeded: [], note: "not needed" };
  let loadError: string | null = null;
  if (!language) {
    const s = shimNeededLibc(bytes);
    shim = { applied: s.applied, removedNeeded: s.removedNeeded, note: s.note };
    try {
      language = await Language.load(s.bytes);
    } catch (e) {
      loadError = String((e as Error)?.message ?? e);
    }
  }
  const queries = {} as Record<QueryName, QueryResult>;
  for (const name of QUERY_NAMES) {
    const res: QueryResult = { name, ok: false, error: null, patternCount: 0, captureNames: [], query: null };
    try {
      const src = new TextDecoder().decode(await fetchBytes(extUrl("html", `languages/html/${name}.scm`)));
      if (!language) throw new Error("language not loaded");
      const q = new Query(language, src);
      res.ok = true;
      res.query = q;
      res.patternCount = q.patternCount();
      res.captureNames = [...q.captureNames];
    } catch (e) {
      res.error = String((e as Error)?.message ?? e);
    }
    queries[name] = res;
  }
  return {
    extension: "html",
    grammarUrl,
    bytes: bytes.length,
    dylink,
    rawLoad,
    shim,
    language,
    abiVersion: language ? language.abiVersion : null,
    loadError,
    queries,
  };
}

export function loadHtml(): Promise<HtmlGrammar> {
  htmlPromise ??= loadHtmlOnce();
  return htmlPromise;
}

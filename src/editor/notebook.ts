// core v0.8 I-2: ipynb cell preview (nothing runs). This file is the pure part: notebook JSON -> cells and picked outputs,
// no DOM, so node can test it. The DOM part is in shell/markdown-preview.ts.

export type NotebookOutput =
  | { kind: "text"; text: string; stderr: boolean }
  | { kind: "image"; src: string }
  | { kind: "svg"; text: string }
  | { kind: "html"; html: string }
  | { kind: "error"; title: string; traceback: string }
  | { kind: "hidden"; mime: string };

export type NotebookCell =
  | { type: "markdown"; source: string }
  | { type: "raw"; source: string }
  | { type: "code"; source: string; count: number | null; outputs: NotebookOutput[] };

export type Notebook = { ok: true; language: string; cells: NotebookCell[] } | { ok: false; message: string };

/** Forbidden in an HTML output on top of DOMPurify's defaults (the Markdown preview's rules): a <style> would reach the whole app. */
export const NOTEBOOK_HTML_FORBID_TAGS = ["script", "iframe", "form", "style"];
export const NOTEBOOK_HTML_FORBID_ATTR = ["style"];

type Json = Record<string, unknown>;
const isObject = (value: unknown): value is Json => typeof value === "object" && value !== null && !Array.isArray(value);

/** `source`-like value: a string, or an array of strings (the lines, newlines included). */
export const joinSource = (value: unknown): string =>
  typeof value === "string" ? value : Array.isArray(value) ? value.filter((part) => typeof part === "string").join("") : "";

/** I-2: ANSI colour codes (`\x1b[31m`) are removed, the colours are not reproduced. */
export const stripAnsi = (text: string): string => text.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "");

/** `metadata.language_info.name`, then `metadata.kernelspec.language`, else python. */
export function notebookLanguage(metadata: unknown): string {
  const name = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);
  const meta = isObject(metadata) ? metadata : {};
  const info = isObject(meta.language_info) ? meta.language_info : {};
  const kernel = isObject(meta.kernelspec) ? meta.kernelspec : {};
  return name(info.name) ?? name(kernel.language) ?? "python";
}

/** The one thing an output shows: a picture, else HTML, else text (core v0.8 I-2); only unshowable kinds give `hidden`, null when there is no data. */
export function pickMime(data: unknown): NotebookOutput | null {
  if (!isObject(data)) return null;
  const mimes = Object.keys(data);
  if (mimes.length === 0) return null;
  for (const mime of ["image/png", "image/jpeg"]) {
    if (!(mime in data)) continue;
    const base64 = joinSource(data[mime]).replace(/\s+/g, "");
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return { kind: "image", src: `data:${mime};base64,${base64}` };
    return { kind: "hidden", mime };
  }
  if ("image/svg+xml" in data) return { kind: "svg", text: joinSource(data["image/svg+xml"]) };
  if ("text/html" in data) return { kind: "html", html: joinSource(data["text/html"]) };
  if ("text/plain" in data) return { kind: "text", text: stripAnsi(joinSource(data["text/plain"])), stderr: false };
  return { kind: "hidden", mime: mimes.join(", ") };
}

/** One entry of a code cell's `outputs`, null when it shows nothing. */
export function pickOutput(output: unknown): NotebookOutput | null {
  if (!isObject(output)) return null;
  switch (output.output_type) {
    case "stream":
      return { kind: "text", text: stripAnsi(joinSource(output.text)), stderr: output.name === "stderr" };
    case "execute_result":
    case "display_data":
      return pickMime(output.data);
    case "error": {
      const name = typeof output.ename === "string" ? output.ename : "";
      const value = typeof output.evalue === "string" ? output.evalue : "";
      const traceback = Array.isArray(output.traceback) ? output.traceback.filter((line) => typeof line === "string").join("\n") : "";
      return { kind: "error", title: name && value ? `${name}: ${value}` : name || value, traceback: stripAnsi(traceback) };
    }
    default:
      return null;
  }
}

/** Notebook text -> cells in file order, or why it is not a notebook ("Not a valid notebook" / "Unsupported notebook format"). */
export function parseNotebook(text: string): Notebook {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, message: "Not a valid notebook" };
  }
  if (!isObject(json)) return { ok: false, message: "Not a valid notebook" };
  // nbformat 3 has `worksheets`, not `cells`: the version is judged first.
  if ("nbformat" in json && json.nbformat !== 4) return { ok: false, message: "Unsupported notebook format" };
  if (!Array.isArray(json.cells)) return { ok: false, message: "Not a valid notebook" };
  if (json.nbformat !== 4) return { ok: false, message: "Unsupported notebook format" };
  const cells: NotebookCell[] = [];
  for (const cell of json.cells) {
    if (!isObject(cell)) continue;
    const source = joinSource(cell.source);
    if (cell.cell_type === "markdown") cells.push({ type: "markdown", source });
    else if (cell.cell_type === "raw") cells.push({ type: "raw", source });
    else if (cell.cell_type === "code") {
      const outputs = Array.isArray(cell.outputs) ? cell.outputs.map(pickOutput).filter((o): o is NotebookOutput => o !== null) : [];
      cells.push({ type: "code", source, count: typeof cell.execution_count === "number" ? cell.execution_count : null, outputs });
    }
  }
  return { ok: true, language: notebookLanguage(json.metadata), cells };
}

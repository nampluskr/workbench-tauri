// core v0.8 M-5: the one place that says which files have a preview. Later cards add kinds here, once they can draw them.
export type PreviewKind = "markdown" | "csv" | "tsv" | "svg" | "html" | "ipynb" | "mermaid";
/** core v0.8 I-8 / I-9: files that are only looked at: no editor tab, no source, no preview toggle; a tab of their own opens them. */
export type ViewKind = "image" | "pdf";

const KINDS = new Map<string, PreviewKind>([["md", "markdown"], ["markdown", "markdown"], ["csv", "csv"], ["tsv", "tsv"], ["svg", "svg"], ["html", "html"], ["htm", "html"], ["ipynb", "ipynb"], ["mmd", "mermaid"], ["mermaid", "mermaid"]]);
const VIEW_KINDS = new Map<string, ViewKind>([["png", "image"], ["jpg", "image"], ["jpeg", "image"], ["gif", "image"], ["webp", "image"], ["ico", "image"], ["pdf", "pdf"]]);

/** Extensions with a preview, lower case, for keymap contexts. */
export const PREVIEW_EXTENSIONS = [...KINDS.keys()];

const extensionOf = (path: string) => /\.([^.\/]*)$/.exec(path)?.[1]?.toLowerCase();

/** The preview kind of `path` by its extension, null when the file has none. */
export function previewKind(path: string): PreviewKind | null {
  const extension = extensionOf(path);
  return (extension !== undefined && KINDS.get(extension)) || null;
}

/** The view-only kind of `path` by its extension (such a file is never read as text), null when it is not one. */
export function viewKind(path: string): ViewKind | null {
  const extension = extensionOf(path);
  return (extension !== undefined && VIEW_KINDS.get(extension)) || null;
}

export const hasPreview = (path: string): boolean => previewKind(path) !== null;

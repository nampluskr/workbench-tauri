// core v0.8 M-5: the one place that says which files have a preview. Later cards add kinds here, once they can draw them.
export type PreviewKind = "markdown" | "csv" | "tsv" | "svg";

const KINDS = new Map<string, PreviewKind>([["md", "markdown"], ["markdown", "markdown"], ["csv", "csv"], ["tsv", "tsv"], ["svg", "svg"]]);

/** Extensions with a preview, lower case, for keymap contexts. */
export const PREVIEW_EXTENSIONS = [...KINDS.keys()];

/** The preview kind of `path` by its extension, null when the file has none. */
export function previewKind(path: string): PreviewKind | null {
  const extension = /\.([^.\\/]*)$/.exec(path)?.[1];
  return (extension !== undefined && KINDS.get(extension.toLowerCase())) || null;
}

export const hasPreview = (path: string): boolean => previewKind(path) !== null;

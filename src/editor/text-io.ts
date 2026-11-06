// D-5: what a file's bytes say about its text. Decoding happens here (WebView), encoding in the core (`save_text`).
// The rules (BOM -> valid UTF-8 -> CP949, UTF-16 only by BOM, line ending by majority) are gpui's text_io choices.

export type Encoding = "utf-8" | "utf-8-bom" | "utf-16le" | "utf-16be" | "cp949";
export type LineEnding = "lf" | "crlf";
export type Format = { encoding: Encoding; lineEnding: LineEnding };
export type Decoded = Format & { text: string };

const starts = (bytes: Uint8Array, ...prefix: number[]) => prefix.every((b, i) => bytes[i] === b);

/** The file's text with "\n" line breaks only, and the format it is saved back in. */
export function decode(bytes: Uint8Array): Decoded {
  const encoding = encodingOf(bytes);
  // TextDecoder drops the BOM it matches (ignoreBOM false). WHATWG euc-kr is Windows-949, the table of encoding_rs EUC_KR.
  const label = { "utf-8": "utf-8", "utf-8-bom": "utf-8", "utf-16le": "utf-16le", "utf-16be": "utf-16be", cp949: "euc-kr" }[encoding];
  const raw = new TextDecoder(label).decode(bytes);
  // shortcut: an edited file with mixed line endings is saved with the one found here; keep them per line if that is required.
  return { text: raw.replace(/\r\n?/g, "\n"), encoding, lineEnding: lineEndingOf(raw) };
}

function encodingOf(bytes: Uint8Array): Encoding {
  if (starts(bytes, 0xef, 0xbb, 0xbf)) return "utf-8-bom";
  if (starts(bytes, 0xff, 0xfe)) return "utf-16le";
  if (starts(bytes, 0xfe, 0xff)) return "utf-16be";
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return "utf-8";
  } catch {
    return "cp949";
  }
}

/** The most frequent line ending; on a tie the one that comes first; LF when there is none. A lone CR counts as neither. */
export function lineEndingOf(raw: string): LineEnding {
  let crlf = 0;
  let lf = 0;
  let first: LineEnding | null = null;
  for (let i = raw.indexOf("\n"); i >= 0; i = raw.indexOf("\n", i + 1)) {
    const kind: LineEnding = raw[i - 1] === "\r" ? "crlf" : "lf";
    kind === "crlf" ? crlf++ : lf++;
    first ??= kind;
  }
  return crlf > lf ? "crlf" : lf > crlf ? "lf" : (first ?? "lf");
}

/** D-7: the disk change test compares the hash of the original bytes, not the text. */
export async function digest(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
}

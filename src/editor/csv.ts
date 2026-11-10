// core v0.8 I-7: CSV / TSV for the table preview. The delimiter comes from the extension, never from the content.

/** I-7: only this many data rows are drawn. */
export const CSV_PREVIEW_MAX_ROWS = 1000;

/**
 * Records of `text`: a quote opens a quoted field only at the field's start, `""` inside one is a quote, and a quoted
 * field may hold the delimiter and line breaks. CR, LF and CRLF end a record.
 * shortcut: a record of one empty cell (a blank line) is dropped, so a one-column file loses its empty values; keep it if that matters.
 */
export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const endRow = () => {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
    row = [];
    field = "";
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c !== '"') field += c;
      else if (text[i + 1] === '"') { field += c; i++; }
      else quoted = false;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === delimiter) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      endRow();
    } else field += c;
  }
  if (field !== "" || row.length) endRow();
  return rows;
}

export type CsvTable = { header: string[]; rows: string[][]; note: string | null };

/** The first record is the header; `rows` holds at most CSV_PREVIEW_MAX_ROWS data records, `note` says when more were left out. */
export function csvTable(text: string, delimiter: string): CsvTable | null {
  const [header, ...data] = parseCsv(text, delimiter);
  if (!header) return null;
  const note = data.length > CSV_PREVIEW_MAX_ROWS
    ? `Showing first ${CSV_PREVIEW_MAX_ROWS.toLocaleString("en-US")} of ${data.length.toLocaleString("en-US")} rows`
    : null;
  return { header, rows: data.slice(0, CSV_PREVIEW_MAX_ROWS), note };
}

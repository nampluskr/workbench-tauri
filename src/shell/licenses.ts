export const FONT_LICENSES = ["/fonts/ibm-plex-sans/license.txt", "/fonts/lilex/OFL.txt"];

/** A missing ignored copy must not prevent the remaining notices from being read. */
export async function licenseText(sources: Record<string, () => Promise<string>>): Promise<string> {
  return (await Promise.all(Object.entries(sources).map(async ([name, read]) => {
    try { return `${name}\n\n${await read()}`; }
    catch { return `${name}\n\nLicense copy unavailable.`; }
  }))).join("\n\n");
}

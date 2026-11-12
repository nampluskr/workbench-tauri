export const FONT_LICENSES = ["/fonts/ibm-plex-sans/license.txt", "/fonts/lilex/OFL.txt", "/fonts/jetbrains-mono/OFL.txt", "/fonts/hack/LICENSE.md", "/fonts/ubuntu-mono/LICENCE.txt", "/fonts/ubuntu-mono/copyright.txt", "/fonts/d2coding/OFL.txt"];

/** A missing ignored copy must not prevent the remaining notices from being read. */
export async function licenseText(sources: Record<string, () => Promise<string>>): Promise<string> {
  return (await Promise.all(Object.entries(sources).map(async ([name, read]) => {
    try { return `${name}\n\n${await read()}`; }
    catch { return `${name}\n\nLicense copy unavailable.`; }
  }))).join("\n\n");
}

/** The Licenses text parts, in order: the bundled copies, the zed-icons notices that may be missing, then the font notices fetched at run time. */
export function licenseSources(copies: Record<string, string>): Record<string, () => Promise<string>> {
  const sources: Record<string, () => Promise<string>> = Object.fromEntries(Object.entries(copies).map(([name, text]) => [name, async () => text]));
  for (const name of ["LICENSES", "LICENSE-GPL", "LICENSE-APACHE"]) {
    const path = `../assets/zed-icons/${name}`;
    sources[path] ??= async () => { throw new Error("Missing copy"); };
  }
  for (const path of FONT_LICENSES) sources[path] = async () => {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Missing copy");
    return response.text();
  };
  return sources;
}

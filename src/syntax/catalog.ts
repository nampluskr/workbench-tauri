export type LanguageConfig = { id: string; name: string; grammar: string; suffixes: string[]; hidden: boolean; commentTokens?: { line?: string; block?: { open: string; close: string } } };

/** Read only the pinned config's string fields and suffix array; no general TOML parser is needed. */
export function languageConfigs(files: Record<string, string>): LanguageConfig[] {
  return Object.entries(files).flatMap(([path, source]) => {
    try {
      const text = (key: string) => JSON.parse(source.match(new RegExp(`^${key} = (".*")$`, "m"))?.[1] ?? '""') as string;
      const name = text("name"), grammar = text("grammar");
      if (!name || !grammar) return [];
      const suffixes = source.match(/^path_suffixes\s*=\s*\[([^\]]*)\]/m)?.[1] ?? "";
      const stringValue = '"(?:\\\\.|[^"\\\\])*"';
      const line = source.match(new RegExp(`^line_comments\\s*=\\s*\\[\\s*(${stringValue})`, "m"))?.[1];
      const block = source.match(/^block_comment\s*=\s*\{([^\n]*)\}/m)?.[1];
      const token = (key: string) => block?.match(new RegExp(`\\b${key}\\s*=\\s*(${stringValue})`))?.[1];
      const open = token("start"), close = token("end");
      return [{ id: path.split("/").at(-2)!, name, grammar: grammar === "jsonc" ? "json" : grammar,
        suffixes: [...suffixes.matchAll(/"(?:\\.|[^"\\])*"/g)].map(([value]) => JSON.parse(value)), hidden: /^hidden\s*=\s*true$/m.test(source),
        commentTokens: { ...(line ? { line: (JSON.parse(line) as string).trimEnd() } : {}),
          ...(open && close ? { block: { open: JSON.parse(open), close: JSON.parse(close) } } : {}) } }];
    } catch { return []; } // An incomplete local copy leaves this language plain.
  });
}

/** File matching is case-sensitive, with the longest complete name or dot suffix winning (Zed I-5). */
export function fileLanguage(configs: LanguageConfig[], path: string): LanguageConfig | undefined {
  const name = path.split(/[\\/]/).at(-1)!;
  let best: LanguageConfig | undefined;
  let length = 0;
  for (const config of configs) if (!config.hidden) for (const suffix of config.suffixes) {
    if (suffix.length > length && (name === suffix || name.endsWith(`.${suffix}`))) { best = config; length = suffix.length; }
  }
  return best;
}

/** Injection names/extensions are case-insensitive, including hidden languages and paths ending in an extension. */
export function injectionLanguage(configs: LanguageConfig[], name: string): LanguageConfig | undefined {
  const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return configs.find((config) => config.name.toLowerCase() === extension || config.suffixes.some((suffix) => suffix.toLowerCase() === extension));
}

import filetypes from "./filetypes.json" with { type: "json" };
import { baseName } from "../workspace/paths.ts";
import { fileLanguage, type LanguageConfig } from "../syntax/catalog.ts";

// The built-in names are data only: Zed 4304dec732a75505066de5ce2dbbfb2bec369498 crates/grammars/src/*/config.toml.
// "Jupyter Notebook" (ipynb) is not Zed's: core v0.8.3 I-15.
const builtin: LanguageConfig[] = filetypes.map((language) => ({ id: language.name, name: language.name, grammar: "", suffixes: language.path_suffixes, hidden: false }));

// K-56: the syntax catalog (src/syntax/assets.ts registers it) names the files it highlights, extension languages included
// (HTML, TOML, git-firefly); without its copies the built-in list above still names the 19 built-in languages.
let catalog: LanguageConfig[] = [];
export const useLanguageCatalog = (configs: LanguageConfig[]) => { catalog = configs; };

/** The status bar's file type: the catalog's rule (K-50: exact case, whole name or `.suffix`, longest wins) over catalog + built-in names. */
export function filetype(path: string, configs: LanguageConfig[] = catalog): string {
  const known = new Set(configs.map((config) => config.name));
  return fileLanguage([...configs, ...builtin.filter((language) => !known.has(language.name))], baseName(path))?.name ?? "Plain Text";
}

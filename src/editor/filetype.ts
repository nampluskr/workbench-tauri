import filetypes from "./filetypes.json" with { type: "json" };
import { baseName } from "../workspace/paths.ts";

// Data only: Zed 4304dec732a75505066de5ce2dbbfb2bec369498 crates/grammars/src/*/config.toml.
export function filetype(path: string): string {
  const name = baseName(path);
  let best = "";
  let type = "Plain Text";
  for (const language of filetypes) {
    for (const suffix of language.path_suffixes) {
      if (suffix.length > best.length && (name === suffix || name.endsWith(`.${suffix}`))) {
        best = suffix;
        type = language.name;
      }
    }
  }
  return type;
}

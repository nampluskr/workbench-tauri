import { Parser, type Language, type Query } from "web-tree-sitter";
import runtimeWasm from "web-tree-sitter/web-tree-sitter.wasm?url";
import { languageConfigs, type LanguageConfig } from "./catalog.ts";
import { compileQuery, loadLanguage } from "./grammar.ts";
import { useLanguageCatalog } from "../editor/filetype.ts";

const configs = import.meta.glob<string>("../assets/zed-grammars/languages/*/config.toml", { query: "?raw", import: "default", eager: true });
const queries = import.meta.glob<string>(["../assets/zed-grammars/languages/*/highlights.scm", "../assets/zed-grammars/languages/*/injections.scm"], { query: "?raw", import: "default" });
const outlines = import.meta.glob<string>("../assets/zed-grammars/languages/*/outline.scm", { query: "?raw", import: "default" });
const wasms = import.meta.glob<string>("../assets/zed-grammars/grammars/*.wasm", { query: "?url", import: "default" });
export const languages = languageConfigs(configs);
useLanguageCatalog(languages);
export type LoadedLanguage = { config: LanguageConfig; language: Language; highlights: Query; injections?: Query };
let runtime: Promise<void> | undefined;
const grammarCache = new Map<string, Promise<Language>>();
const languageCache = new Map<string, Promise<LoadedLanguage | undefined>>();

export function loadSyntax(config: LanguageConfig): Promise<LoadedLanguage | undefined> {
  let loaded = languageCache.get(config.id);
  if (!loaded) {
    loaded = (async () => {
      const wasm = wasms[`../assets/zed-grammars/grammars/${config.grammar}.wasm`];
      const highlight = queries[`../assets/zed-grammars/languages/${config.id}/highlights.scm`];
      if (!wasm || !highlight) return undefined;
      await (runtime ??= Parser.init({ locateFile: () => runtimeWasm }));
      let grammar = grammarCache.get(config.grammar);
      if (!grammar) {
        grammar = (async () => {
          const response = await fetch(await wasm());
          if (!response.ok) throw new Error(`Grammar ${config.grammar}: ${response.status}`);
          return loadLanguage(new Uint8Array(await response.arrayBuffer()));
        })();
        grammarCache.set(config.grammar, grammar);
      }
      const language = await grammar;
      const injection = queries[`../assets/zed-grammars/languages/${config.id}/injections.scm`];
      return { config, language, highlights: compileQuery(language, await highlight()), injections: injection ? compileQuery(language, await injection()) : undefined };
    })().catch((error: unknown) => { console.error(`Syntax ${config.id}`, error); return undefined; });
    languageCache.set(config.id, loaded);
  }
  return loaded;
}

const outlineCache = new Map<string, Promise<Query | undefined>>();
/** core v0.8.1 I-4: the language's outline.scm, compiled on first use; undefined for a language without one (empty Outline). */
export function outlineQuery(syntax: LoadedLanguage): Promise<Query | undefined> {
  let query = outlineCache.get(syntax.config.id);
  if (!query) {
    const source = outlines[`../assets/zed-grammars/languages/${syntax.config.id}/outline.scm`];
    query = source
      ? source().then((text) => compileQuery(syntax.language, text)).catch((error: unknown) => { console.error(`Outline ${syntax.config.id}`, error); return undefined; })
      : Promise.resolve(undefined);
    outlineCache.set(syntax.config.id, query);
  }
  return query;
}

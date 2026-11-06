// shortcut: only the markdown-it 15 API this app uses (the package ships no types and @types/markdown-it is not an
// approved dependency, D-2 / D-10). Add members here when more of it is used.
declare module "markdown-it" {
  export type Token = {
    type: string;
    tag: string;
    nesting: 1 | 0 | -1;
    map: [number, number] | null;
    attrGet(name: string): string | null;
    attrSet(name: string, value: string): void;
    attrs: [string, string][] | null;
  };
  type StateCore = { tokens: Token[] };
  export default class MarkdownIt {
    constructor(options?: { html?: boolean; linkify?: boolean; typographer?: boolean });
    core: { ruler: { push(name: string, fn: (state: StateCore) => void): void } };
    utils: { escapeHtml(text: string): string };
    render(src: string): string;
  }
}

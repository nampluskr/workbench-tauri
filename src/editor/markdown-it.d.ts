// shortcut: only the markdown-it 15 API this app uses (the package ships no types and @types/markdown-it is not an
// approved dependency, D-2 / D-10). Add members here when more of it is used.
declare module "markdown-it" {
  export type Token = {
    type: string;
    tag: string;
    nesting: 1 | 0 | -1;
    map: [number, number] | null;
    content: string;
    markup: string;
    attrGet(name: string): string | null;
    attrSet(name: string, value: string): void;
    attrs: [string, string][] | null;
  };
  type StateCore = { tokens: Token[] };
  type StateInline = { src: string; pos: number; posMax: number; push(type: string, tag: string, nesting: 1 | 0 | -1): Token };
  type StateBlock = {
    src: string;
    line: number;
    blkIndent: number;
    bMarks: number[];
    eMarks: number[];
    tShift: number[];
    sCount: number[];
    push(type: string, tag: string, nesting: 1 | 0 | -1): Token;
  };
  type Renderer = { renderAttrs(token: Token): string };
  export default class MarkdownIt {
    constructor(options?: { html?: boolean; linkify?: boolean; typographer?: boolean });
    core: { ruler: { push(name: string, fn: (state: StateCore) => void): void } };
    inline: { ruler: { before(before: string, name: string, fn: (state: StateInline, silent: boolean) => boolean): void } };
    block: { ruler: { before(before: string, name: string, fn: (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean): void } };
    renderer: { rules: Record<string, (tokens: Token[], index: number, options: unknown, env: unknown, self: Renderer) => string> };
    utils: { escapeHtml(text: string): string };
    use(plugin: (md: MarkdownIt) => void): this;
    render(src: string): string;
    parse(src: string, env: object): Token[];
  }
}

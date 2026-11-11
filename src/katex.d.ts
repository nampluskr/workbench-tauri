// katex ships no types (and @types/katex is not a dependency): only what rich-blocks.ts calls.
declare module "katex" {
  const katex: {
    renderToString(
      tex: string,
      options?: { displayMode?: boolean; output?: "html" | "mathml" | "htmlAndMathml"; throwOnError?: boolean; trust?: boolean; strict?: "ignore" | "warn" | "error" },
    ): string;
  };
  export default katex;
}

import { filetype } from "../editor/filetype.ts";
import type { Tab } from "../workspace/context.ts";

export function statusItems(tab: Tab | undefined): { position: string; filetype: string } | undefined {
  if (!tab || tab.tool || !tab.file.position) return;
  return { position: tab.file.position(), filetype: tab.markdown ? "Markdown" : filetype(tab.path) };
}

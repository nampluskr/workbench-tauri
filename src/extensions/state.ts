import { createSignal } from "solid-js";
import type { Category } from "./model.ts";

/** The Extensions tab's category filter. Module level so "Install Themes" can set it before opening the tab. */
export const [category, setCategory] = createSignal<Category>("All");

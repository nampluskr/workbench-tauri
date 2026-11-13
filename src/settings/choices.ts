import { iconThemeNames } from "../theme/icons.ts";
import { registry } from "../theme/themes.ts";
import type { Choices } from "./model.ts";

const named = (appearance: string) => registry.filter((t) => t.appearance === appearance).map((t) => t.name);
/** The theme (dark and light apart, core v0.8.2 I-2) and icon theme names the copied assets provide; settings validation and the dropdowns use them. */
export const choices: Choices = { dark_theme: named("dark"), light_theme: named("light"), icon_theme: iconThemeNames };

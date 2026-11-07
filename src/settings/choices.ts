import { iconThemeNames } from "../theme/icons.ts";
import { themeNames } from "../theme/themes.ts";
import type { Choices } from "./model.ts";

/** The theme and icon theme names the copied assets provide; settings validation and the dropdowns use them. */
export const choices: Choices = { theme: themeNames, icon_theme: iconThemeNames };

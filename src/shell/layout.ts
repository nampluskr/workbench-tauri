import { PROJECT_PANEL_DEFAULT_WIDTH } from "../spec/metrics.ts";

export const isClassicLayout = (open: boolean, width: number): boolean => open && width === PROJECT_PANEL_DEFAULT_WIDTH;

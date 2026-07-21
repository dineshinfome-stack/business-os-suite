export const THEME_STORAGE_KEY = "businessos.theme";
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = "system";

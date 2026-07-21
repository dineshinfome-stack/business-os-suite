import * as React from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "@/constants/theme";
import { applyThemeClass, resolveTheme } from "@/utils/theme";
import { storage } from "@/utils/storage";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(DEFAULT_THEME);
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  // Hydrate from storage after mount (SSR-safe, no hydration mismatch).
  React.useEffect(() => {
    const stored = storage.get<Theme>(THEME_STORAGE_KEY, DEFAULT_THEME) ?? DEFAULT_THEME;
    setThemeState(stored);
  }, []);

  // Apply resolved theme class + react to system changes when theme === "system".
  React.useEffect(() => {
    const r = resolveTheme(theme);
    setResolved(r);
    applyThemeClass(r);

    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const next = resolveTheme("system");
      setResolved(next);
      applyThemeClass(next);
    };
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    storage.set(THEME_STORAGE_KEY, t);
  }, []);

  const value = React.useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

import * as React from "react";
import { useHeader } from "@/contexts/header-context";

/**
 * Board Rec 5 — global keyboard shortcuts for header popovers.
 *   Ctrl/⌘ + Shift + F → Favorites
 *   Ctrl/⌘ + Shift + R → Recent
 *
 * `⌘K` is owned by CommandPalette. `/` is owned by NavigationSearch.
 * `Esc` closes the currently open popover.
 */
export function useHeaderShortcuts() {
  const header = useHeader();
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.shiftKey && !inField && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        header.toggle("favorites");
      } else if (mod && e.shiftKey && !inField && (e.key === "R" || e.key === "r")) {
        e.preventDefault();
        header.toggle("recent");
      } else if (e.key === "Escape" && header.openId) {
        header.close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [header]);
}

import { Search } from "lucide-react";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";

/**
 * SPR-PLT-0005 — Top-nav search trigger that opens the command palette.
 * Full pill on md+, icon-only on small screens.
 */
export function SearchTrigger() {
  const palette = useCommandPalette();
  return (
    <>
      <button
        type="button"
        onClick={() => palette.setOpen(true)}
        aria-label="Open search"
        className="hidden h-9 min-w-[240px] items-center gap-2 rounded-md border border-input bg-surface-2 px-3 text-left text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1">Search Business OS…</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => palette.setOpen(true)}
        aria-label="Open search"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent md:hidden"
      >
        <Search className="h-4 w-4" />
      </button>
    </>
  );
}

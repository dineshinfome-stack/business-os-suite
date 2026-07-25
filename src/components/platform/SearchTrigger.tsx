import { Search } from "lucide-react";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";

/**
 * SPR-PLT-0005 — Top-nav search trigger.
 * Icon-only button; clicking opens the global command palette (search bar).
 */
export function SearchTrigger() {
  const palette = useCommandPalette();
  return (
    <button
      type="button"
      onClick={() => palette.setOpen(true)}
      aria-label="Open global search"
      title="Search (⌘K)"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}

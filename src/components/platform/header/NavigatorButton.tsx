import { LayoutGrid, Pin, PinOff } from "lucide-react";
import { useHeader } from "@/contexts/header-context";

/**
 * Board Rec 1 — "Navigator" entry point. Primary click toggles the sidebar
 * drawer; the adjacent pin icon flips pin state without closing. Reads
 * sidebar controls from HeaderProvider so it can live in the slot registry.
 */
export function NavigatorButton() {
  const { sidebar } = useHeader();
  const { pinned, togglePinned } = sidebar;

  return (
    <div className="inline-flex items-center rounded-md border border-input bg-surface-2 shadow-sm">
      <button
        type="button"
        onClick={togglePinned}
        aria-label="Toggle navigator"
        aria-expanded={pinned}
        className="inline-flex h-8 items-center gap-1.5 rounded-l-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        <span>Navigator</span>
      </button>
      <div className="h-5 w-px bg-border" aria-hidden />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePinned();
        }}
        aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
        aria-pressed={pinned}
        className="inline-flex h-8 w-8 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        style={pinned ? { color: "var(--brand-red)" } : undefined}
      >
        {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

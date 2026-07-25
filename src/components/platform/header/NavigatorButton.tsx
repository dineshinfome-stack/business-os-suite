import { LayoutGrid } from "lucide-react";
import { useHeader } from "@/contexts/header-context";

/**
 * "All" entry point — matches the text-variant styling used by Favorites and
 * History popovers so the three start-area triggers form a consistent set.
 * Toggles the sidebar pin state.
 */
export function NavigatorButton() {
  const { sidebar } = useHeader();
  const { pinned, togglePinned } = sidebar;

  return (
    <button
      type="button"
      onClick={togglePinned}
      aria-label="Toggle all"
      aria-expanded={pinned}
      data-state={pinned ? "open" : "closed"}
      className="relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent"
    >
      <LayoutGrid className="h-3.5 w-3.5" />
      <span>All</span>
    </button>
  );
}

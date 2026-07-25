import { LayoutGrid } from "lucide-react";
import { useHeader } from "@/contexts/header-context";

/**
 * "All" entry point — opens the full navigation sidebar as a drawer overlay
 * (or closes it when already open). When the sidebar is pinned, this button
 * unpins so the drawer behavior remains predictable. Matches the text-variant
 * styling used by Favorites and History triggers.
 */
export function NavigatorButton() {
  const { sidebar } = useHeader();
  const { pinned, open, toggleOpen, togglePinned } = sidebar;
  const active = pinned || open;

  const handleClick = () => {
    if (pinned) {
      togglePinned();
      return;
    }
    toggleOpen();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Open all navigation"
      aria-expanded={active}
      data-state={active ? "open" : "closed"}
      className="relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent"
    >
      <LayoutGrid className="h-3.5 w-3.5" />
      <span>All</span>
    </button>
  );
}

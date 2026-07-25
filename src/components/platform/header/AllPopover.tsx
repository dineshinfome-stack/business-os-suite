import * as React from "react";
import { useRouterState } from "@tanstack/react-router";
import { LayoutGrid, RefreshCw, Pin, PinOff } from "lucide-react";
import { HeaderPopover } from "./HeaderPopover";
import { useHeader } from "@/contexts/header-context";
import { useNavigation } from "@/hooks/navigation/useNavigation";
import { useNavigationSearchIndex } from "@/hooks/navigation/useNavigationSearchIndex";
import { usePinnedNav } from "@/hooks/navigation/usePinnedNav";
import { useNavBadges } from "@/hooks/navigation/useNavBadges";
import { flatten } from "@/lib/navigation/tree";
import { NavigationSearch } from "@/components/platform/navigation/NavigationSearch";
import { NavigationTree } from "@/components/platform/navigation/NavigationTree";
import { NavigationEmptyState } from "@/components/platform/navigation/NavigationEmptyState";

/**
 * "All" popover — mirrors the sidebar navigation (search + full tree) so
 * users can jump anywhere without pinning the sidebar. Matches the
 * Favorites / History header popover pattern.
 */
export function AllPopover() {
  const header = useHeader();
  const open = header.isOpen("all");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tree = useNavigation();
  const { filter } = useNavigationSearchIndex();
  const { pinnedIds, togglePin } = usePinnedNav();
  const badges = useNavBadges();

  const [query, setQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) setQuery("");
    else setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  const filteredTree = React.useMemo(() => filter(tree, query), [filter, tree, query]);
  const flatCount = React.useMemo(() => flatten(filteredTree).length, [filteredTree]);

  return (
    <HeaderPopover
      id="all"
      label="All"
      icon={LayoutGrid}
      variant="text"
      align="start"
      contentClassName="w-[22rem] p-0"
    >
      <NavigationSearch
        value={query}
        onChange={setQuery}
        inputRef={searchRef}
        actions={
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Reset filter"
              onClick={() => {
                setQuery("");
                setTimeout(() => searchRef.current?.focus(), 0);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--nav-hover)]"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={header.sidebar.pinned ? "Unpin sidebar" : "Pin sidebar"}
              aria-pressed={header.sidebar.pinned}
              onClick={() => header.sidebar.togglePinned()}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--nav-hover)]"
              style={{ color: header.sidebar.pinned ? "var(--nav-fg-strong)" : "var(--nav-fg-muted)" }}
            >
              {header.sidebar.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
          </div>
        }
      />
      <div className="max-h-[70vh] overflow-y-auto">
        {flatCount === 0 ? (
          <NavigationEmptyState query={query} />
        ) : (
          <NavigationTree
            tree={filteredTree}
            pinnedIds={pinnedIds}
            onTogglePin={togglePin}
            badges={badges}
            pathname={pathname}
            forceExpanded={Boolean(query.trim())}
            onNavigate={() => header.close()}
          />
        )}
      </div>
    </HeaderPopover>
  );
}

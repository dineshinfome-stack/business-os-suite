import { Link } from "@tanstack/react-router";
import { Star, Pin } from "lucide-react";
import { HeaderPopover } from "./HeaderPopover";
import { usePinnedNav } from "@/hooks/navigation/usePinnedNav";
import { getNavItem } from "@/lib/navigation/registry";
import { useHeader } from "@/contexts/header-context";

export function FavoritesPopover() {
  const { pinnedIds } = usePinnedNav();
  const header = useHeader();
  const items = Array.from(pinnedIds)
    .map((id) => getNavItem(id))
    .filter((n): n is NonNullable<ReturnType<typeof getNavItem>> => Boolean(n))
    .filter((n) => n.route);

  return (
    <HeaderPopover id="favorites" label="Favorites" icon={Star} variant="text" align="start">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Pin className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium text-foreground">No pinned pages yet</div>
          <div className="text-xs text-muted-foreground">
            Star any item in All to pin it here.
          </div>
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto p-1">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <li key={it.id}>
                <Link
                  to={it.route!}
                  onClick={() => header.close()}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  {Icon ? (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  )}
                  <span className="truncate">{it.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </HeaderPopover>
  );
}

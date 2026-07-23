import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";
import { useCommandHistory } from "@/hooks/navigation/useCommandHistory";
import { useFavorites } from "@/hooks/navigation/useFavorites";
import { usePermissions } from "@/contexts/permissions-context";
import { useFeatureFlags } from "@/hooks/settings/useFeatureFlag";
import { searchNavigation } from "@/lib/navigation/search";
import { getNavItem } from "@/lib/navigation/registry";
import { Star, Clock } from "lucide-react";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const perms = usePermissions();
  const flags = useFeatureFlags();
  const { history, record } = useCommandHistory();
  const { favorites } = useFavorites();

  const enabledFlags = useMemo(
    () => new Set((flags.data ?? []).filter((f) => f.enabled).map((f) => f.key)),
    [flags.data],
  );

  const results = useMemo(
    () =>
      searchNavigation(query, {
        permissions: perms.permissions,
        featureFlags: enabledFlags,
        limit: 15,
      }),
    [query, perms.permissions, enabledFlags],
  );

  const go = (navId: string, route: string) => {
    setOpen(false);
    setQuery("");
    record(navId);
    navigate({ to: route });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search modules, pages, actions…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {query === "" && history.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {history.map((h) => {
                const item = getNavItem(h.nav_id);
                if (!item?.route) return null;
                return (
                  <CommandItem
                    key={h.nav_id}
                    value={`recent:${h.nav_id}`}
                    onSelect={() => go(item.id, item.route!)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {query === "" && favorites.length > 0 && (
          <CommandGroup heading="Favorites">
            {favorites.map((f) => {
              const item = getNavItem(f.nav_id);
              if (!item?.route) return null;
              return (
                <CommandItem
                  key={f.nav_id}
                  value={`fav:${f.nav_id}`}
                  onSelect={() => go(item.id, item.route!)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {query !== "" && (
          <CommandGroup heading="Navigation">
            {results.map(({ item }) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => go(item.id, item.route!)}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span>{item.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{item.module}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

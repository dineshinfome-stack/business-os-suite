import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Command,
} from "@/components/ui/command";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";
import { useCommandHistory } from "@/hooks/navigation/useCommandHistory";
import { useFavorites } from "@/hooks/navigation/useFavorites";
import { usePermissions } from "@/contexts/permissions-context";
import { useFeatureFlags } from "@/hooks/settings/useFeatureFlag";
import { searchNavigation } from "@/lib/navigation/search";
import { getNavItem } from "@/lib/navigation/registry";
import { Star, Clock } from "lucide-react";
import { useSearch, useRecentSearches } from "@/hooks/search";
import { SearchResults } from "@/components/search/SearchResults";
import { RecentSearches } from "@/components/search/RecentSearches";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import type { SearchResult } from "@/lib/search/types";

type Tab = "commands" | "search";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const [tab, setTab] = useState<Tab>("commands");
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const perms = usePermissions();
  const flags = useFeatureFlags();
  const { history, record } = useCommandHistory();
  const { favorites } = useFavorites();

  const canSearch = perms.has("search.global.use");
  const searchQ = useSearch(searchQuery);
  const recent = useRecentSearches();

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

  // Reset transient state when the dialog closes.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchQuery("");
    }
  }, [open]);

  const goto = (navId: string, route: string) => {
    setOpen(false);
    record(navId);
    navigate({ to: route });
  };

  const onSearchSelect = (r: SearchResult) => {
    recent.record({ query: searchQuery, resourceType: r.resource_type, resultId: r.id });
    setOpen(false);
    navigate({ to: r.route });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="w-full">
        <div className="border-b px-2 pt-2">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="search" disabled={!canSearch}>
              Search
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="commands" className="mt-0">
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
                        onSelect={() => goto(item.id, item.route!)}
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
                      onSelect={() => goto(item.id, item.route!)}
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
                    onSelect={() => goto(item.id, item.route!)}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.module}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </TabsContent>

        <TabsContent value="search" className="mt-0">
          {canSearch ? (
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search across your workspace…"
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  <SearchEmptyState query={searchQuery} />
                </CommandEmpty>
                {searchQuery.trim() === "" ? (
                  <RecentSearches
                    recent={recent.recent}
                    onSelect={setSearchQuery}
                    onClear={recent.clear}
                    isClearing={recent.isClearing}
                  />
                ) : (
                  <SearchResults
                    results={searchQ.data?.results ?? []}
                    onSelect={onSearchSelect}
                  />
                )}
              </CommandList>
            </Command>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              You don&apos;t have access to global search.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </CommandDialog>
  );
}

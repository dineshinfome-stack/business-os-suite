/**
 * Sprint 0.9 — Standalone <GlobalSearch/> composition.
 * Mounted inside the command palette's Search tab and reusable on a future
 * dedicated `/search` route.
 */
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command, CommandEmpty, CommandList } from "@/components/ui/command";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";
import { RecentSearches } from "./RecentSearches";
import { SearchEmptyState } from "./SearchEmptyState";
import { useSearch } from "@/hooks/search/useSearch";
import { useRecentSearches } from "@/hooks/search/useRecentSearches";
import type { SearchResult } from "@/lib/search/types";

interface Props {
  onNavigate?: () => void;
}

export function GlobalSearch({ onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const searchQ = useSearch(query);
  const recent = useRecentSearches();
  const navigate = useNavigate();

  const handleSelect = (r: SearchResult) => {
    recent.record({ query, resourceType: r.resource_type, resultId: r.id });
    onNavigate?.();
    navigate({ to: r.route });
  };

  const results = searchQ.data?.results ?? [];
  const showRecent = query.trim().length === 0;

  return (
    <Command shouldFilter={false}>
      <SearchInput value={query} onChange={setQuery} />
      <CommandList>
        <CommandEmpty>
          <SearchEmptyState query={query} />
        </CommandEmpty>
        {showRecent && (
          <RecentSearches
            recent={recent.recent}
            onSelect={setQuery}
            onClear={recent.clear}
            isClearing={recent.isClearing}
          />
        )}
        {!showRecent && <SearchResults results={results} onSelect={handleSelect} />}
      </CommandList>
    </Command>
  );
}

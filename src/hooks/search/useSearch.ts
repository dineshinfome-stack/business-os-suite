import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { queryKeys } from "@/lib/query-keys";
import { useOrg } from "@/contexts/org-context";
import { useAuth } from "@/contexts/auth-context";
import { searchGlobal, type SearchResponse } from "@/lib/search/service.functions";

const DEBOUNCE_MS = 200;

export function useSearch(query: string) {
  const { current } = useOrg();
  const auth = useAuth();
  const orgId = current?.organizationId ?? null;
  const userId = auth.user?.id ?? null;
  const searchFn = useServerFn(searchGlobal);

  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(h);
  }, [query]);

  const trimmed = debounced.trim();
  return useQuery<SearchResponse>({
    queryKey: queryKeys.search.results(orgId, userId, trimmed),
    queryFn: () => searchFn({ data: { query: trimmed } }),
    enabled: Boolean(orgId) && trimmed.length > 0,
    staleTime: 15_000,
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { queryKeys } from "@/lib/query-keys";
import { useOrg } from "@/contexts/org-context";
import { useAuth } from "@/contexts/auth-context";
import {
  clearSearchHistory,
  listRecentSearches,
  recordSearchSelection,
  type RecentSearchRow,
} from "@/lib/search/service.functions";

export function useRecentSearches() {
  const { current } = useOrg();
  const auth = useAuth();
  const orgId = current?.organizationId ?? null;
  const userId = auth.user?.id ?? null;
  const qc = useQueryClient();

  const listFn = useServerFn(listRecentSearches);
  const recordFn = useServerFn(recordSearchSelection);
  const clearFn = useServerFn(clearSearchHistory);

  const query = useQuery<RecentSearchRow[]>({
    queryKey: queryKeys.search.recent(orgId, userId),
    queryFn: () => listFn({ data: { limit: 10 } }),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.search.recent(orgId, userId) });

  const record = useMutation({
    mutationFn: (args: { query: string; resourceType?: string | null; resultId?: string | null }) =>
      recordFn({ data: args }),
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: () => clearFn(),
    onSuccess: invalidate,
  });

  return {
    recent: query.data ?? [],
    isLoading: query.isLoading,
    record: record.mutate,
    clear: clear.mutate,
    isClearing: clear.isPending,
  };
}

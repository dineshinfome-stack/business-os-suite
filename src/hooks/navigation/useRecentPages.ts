import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useOrg } from "@/contexts/org-context";
import { queryKeys } from "@/lib/query-keys";
import {
  listRecentPagesFn,
  recordRecentPageFn,
  type RecentPageRow,
} from "@/lib/navigation/recent-pages.functions";
import { findByRoute } from "@/lib/navigation/tree";

export function useRecentPages() {
  const { current } = useOrg();
  const orgId = current?.organizationId ?? null;
  const qc = useQueryClient();
  const listFn = useServerFn(listRecentPagesFn);
  const recordFn = useServerFn(recordRecentPageFn);

  const query = useQuery<RecentPageRow[]>({
    queryKey: queryKeys.navigation.recentPages(orgId),
    queryFn: () => listFn(),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });

  const record = useMutation({
    mutationFn: (input: { route: string; title: string | null }) =>
      recordFn({ data: input }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.navigation.recentPages(orgId) }),
  });

  // Auto-record navigation on route change (registry hits only).
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!orgId) return;
    const item = findByRoute(pathname);
    if (!item?.route) return;
    // Fire-and-forget; server drops routes that don't resolve.
    record.mutate({ route: item.route, title: item.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, orgId]);

  return {
    recent: query.data ?? [],
    isLoading: query.isLoading,
  };
}

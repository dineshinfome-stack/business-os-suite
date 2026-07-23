import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useOrg } from "@/contexts/org-context";
import { queryKeys } from "@/lib/query-keys";
import {
  getNavPreferencesFn,
  setNavPreferencesFn,
  DEFAULT_PREFS,
  type NavPreferences,
} from "@/lib/navigation/preferences.functions";

export function useNavPreferences() {
  const { current } = useOrg();
  const orgId = current?.organizationId ?? null;
  const qc = useQueryClient();
  const getFn = useServerFn(getNavPreferencesFn);
  const setFn = useServerFn(setNavPreferencesFn);

  const query = useQuery({
    queryKey: queryKeys.navigation.preferences(orgId),
    queryFn: () => getFn(),
    enabled: Boolean(orgId),
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: (preferences: NavPreferences) => setFn({ data: { preferences } }),
    onMutate: async (prefs) => {
      await qc.cancelQueries({ queryKey: queryKeys.navigation.preferences(orgId) });
      const prev = qc.getQueryData(queryKeys.navigation.preferences(orgId));
      qc.setQueryData(queryKeys.navigation.preferences(orgId), (old: unknown) => ({
        ...(old as object ?? DEFAULT_PREFS),
        ...prefs,
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.navigation.preferences(orgId), ctx.prev);
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.navigation.preferences(orgId) }),
  });

  const prefs = query.data ?? DEFAULT_PREFS;
  return {
    preferences: prefs,
    isLoading: query.isLoading,
    update: (patch: NavPreferences) => mutation.mutate(patch),
    toggleGroup: (groupId: string) => {
      const set = new Set(prefs.expanded_groups);
      if (set.has(groupId)) set.delete(groupId);
      else set.add(groupId);
      mutation.mutate({ expanded_groups: Array.from(set) });
    },
    setSidebarCollapsed: (collapsed: boolean) =>
      mutation.mutate({ sidebar_collapsed: collapsed }),
  };
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/contexts/org-context";
import { useAuth } from "@/contexts/auth-context";
import { queryKeys } from "@/lib/query-keys";
import {
  listFeatureFlagsFn,
  setFeatureFlagFn,
  type FeatureFlagState,
} from "@/lib/feature-flags.functions";

export function useFeatureFlags() {
  const { current } = useOrg();
  const { status } = useAuth();
  const isAuthed = status === "authenticated";
  const orgId = current?.organizationId ?? null;
  const listFn = useServerFn(listFeatureFlagsFn);
  return useQuery<FeatureFlagState[]>({
    queryKey: queryKeys.featureFlags.all(orgId),
    queryFn: () => listFn(),
    enabled: isAuthed && Boolean(orgId),
    staleTime: 60_000,
  });
}


export function useFeatureFlag(key: string): {
  enabled: boolean;
  isLoading: boolean;
  state: FeatureFlagState | undefined;
} {
  const q = useFeatureFlags();
  const state = q.data?.find((f) => f.key === key);
  return { enabled: state?.enabled ?? false, isLoading: q.isLoading, state };
}

export function useSetFeatureFlag() {
  const qc = useQueryClient();
  const { current } = useOrg();
  const orgId = current?.organizationId ?? null;
  const setFn = useServerFn(setFeatureFlagFn);
  return useMutation({
    mutationFn: (input: {
      key: string;
      scope: "platform" | "organization";
      enabled: boolean;
      rolloutStage?: "off" | "internal" | "beta" | "ga";
    }) => setFn({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.featureFlags.all(orgId) });
    },
  });
}

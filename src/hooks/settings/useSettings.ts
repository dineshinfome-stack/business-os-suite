/**
 * Sprint 0.6 — Settings React hooks.
 *
 * All hooks are org-aware: cache keys include the current organization id
 * so switching orgs shows the correct resolved values immediately.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useOrg } from "@/contexts/org-context";
import { queryKeys } from "@/lib/query-keys";
import {
  deleteSettingFn,
  listSettingDefinitionsFn,
  resolveSettingFn,
  resolveSettingsFn,
  revealSensitiveSettingFn,
  setSettingFn,
  type ResolvedSetting,
  type SettingDefinition,
} from "@/lib/settings.functions";

export function useSettingDefinitions() {
  const listFn = useServerFn(listSettingDefinitionsFn);
  return useQuery<SettingDefinition[]>({
    queryKey: queryKeys.settings.definitions(),
    queryFn: () => listFn(),
    staleTime: 5 * 60_000,
  });
}

export function useSettings(keys?: string[]) {
  const { current } = useOrg();
  const orgId = current?.id ?? null;
  const resolveFn = useServerFn(resolveSettingsFn);
  return useQuery<ResolvedSetting[]>({
    queryKey: queryKeys.settings.resolved(orgId, keys),
    queryFn: () => resolveFn({ data: keys ? { keys } : {} }),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}

export function useSetting(key: string) {
  const { current } = useOrg();
  const orgId = current?.id ?? null;
  const resolveOneFn = useServerFn(resolveSettingFn);
  return useQuery<ResolvedSetting | null>({
    queryKey: queryKeys.settings.one(orgId, key),
    queryFn: () => resolveOneFn({ data: { key } }),
    enabled: Boolean(orgId && key),
    staleTime: 60_000,
  });
}

export function useSetSetting() {
  const qc = useQueryClient();
  const { current } = useOrg();
  const orgId = current?.id ?? null;
  const setFn = useServerFn(setSettingFn);
  return useMutation({
    mutationFn: (input: { key: string; scope: "platform" | "organization"; value: unknown }) =>
      setFn({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.all(orgId) });
    },
  });
}

export function useDeleteSetting() {
  const qc = useQueryClient();
  const { current } = useOrg();
  const orgId = current?.id ?? null;
  const delFn = useServerFn(deleteSettingFn);
  return useMutation({
    mutationFn: (input: { key: string; scope: "platform" | "organization" }) =>
      delFn({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.all(orgId) });
    },
  });
}

export function useRevealSensitiveSetting() {
  const revealFn = useServerFn(revealSensitiveSettingFn);
  return useMutation({
    mutationFn: (input: { key: string; scope: "platform" | "organization" }) =>
      revealFn({ data: input }),
  });
}

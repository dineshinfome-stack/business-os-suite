/**
 * Gate 3.7 · Administration console data hooks.
 *
 * The console reads DTOs through the platform-admin facade only.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  exportPlatformAuditCsv,
  getPlatformAttention,
  getPlatformAudit,
  getPlatformFeatureControls,
  getPlatformHealthSections,
  getPlatformNotificationOperations,
  getPlatformOperationsSummary,
  getPlatformPolicies,
  getPlatformProviders,
  getPlatformSettingsList,
  getPlatformTenantOperations,
} from "@/lib/platform-admin/queries.functions";
import {
  acknowledgePlatformAttention,
  setPlatformFeatureControl,
  updatePlatformSetting,
} from "@/lib/platform-admin/commands.functions";
import { administrationKeys, invalidateAdministration } from "./query-keys";

export type AttentionQuery = {
  severity?: "all" | "critical" | "high" | "medium" | "low" | "info";
  type?: string;
  status?: "all" | "open" | "acknowledged";
  page?: number;
  pageSize?: number;
};

export type TenantOpsQuery = {
  search?: string;
  lifecycleState?: string;
  provisioningStatus?: string;
  region?: string;
  requiresAttention?: boolean;
  sortBy?: "displayName" | "createdAt" | "updatedAt" | "lifecycleState";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type AuditExplorerQuery = {
  search?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export function useOperationsSummary() {
  const fn = useServerFn(getPlatformOperationsSummary);
  return useQuery({
    queryKey: administrationKeys.summary(),
    queryFn: () => fn(),
    staleTime: 15_000,
  });
}

export function useHealthSections() {
  const fn = useServerFn(getPlatformHealthSections);
  return useQuery({
    queryKey: administrationKeys.health(),
    queryFn: () => fn(),
    staleTime: 30_000,
  });
}

export function useAttentionQueue(query: AttentionQuery) {
  const fn = useServerFn(getPlatformAttention);
  return useQuery({
    queryKey: administrationKeys.attention(query),
    queryFn: () => fn({ data: query }),
    staleTime: 10_000,
  });
}

export function useTenantOperations(query: TenantOpsQuery) {
  const fn = useServerFn(getPlatformTenantOperations);
  return useQuery({
    queryKey: administrationKeys.tenants(query),
    queryFn: () => fn({ data: query }),
    staleTime: 10_000,
  });
}

export function usePlatformProviders() {
  const fn = useServerFn(getPlatformProviders);
  return useQuery({
    queryKey: administrationKeys.providers(),
    queryFn: () => fn(),
    staleTime: 60_000,
  });
}

export function usePlatformSettings() {
  const fn = useServerFn(getPlatformSettingsList);
  return useQuery({ queryKey: administrationKeys.settings(), queryFn: () => fn() });
}

export function usePlatformPolicies() {
  const fn = useServerFn(getPlatformPolicies);
  return useQuery({ queryKey: administrationKeys.policies(), queryFn: () => fn() });
}

export function useFeatureControls() {
  const fn = useServerFn(getPlatformFeatureControls);
  return useQuery({ queryKey: administrationKeys.features(), queryFn: () => fn() });
}

export function useAuditExplorer(query: AuditExplorerQuery) {
  const fn = useServerFn(getPlatformAudit);
  return useQuery({
    queryKey: administrationKeys.audit(query),
    queryFn: () => fn({ data: query }),
    staleTime: 10_000,
  });
}

export function useNotificationOperations() {
  const fn = useServerFn(getPlatformNotificationOperations);
  return useQuery({
    queryKey: administrationKeys.notifications(),
    queryFn: () => fn(),
    staleTime: 60_000,
  });
}

export function useAuditExport() {
  const fn = useServerFn(exportPlatformAuditCsv);
  return useMutation({ mutationFn: (query: AuditExplorerQuery) => fn({ data: query }) });
}

export function useAdministrationCommands() {
  const queryClient = useQueryClient();
  const updateSetting = useServerFn(updatePlatformSetting);
  const setFeature = useServerFn(setPlatformFeatureControl);
  const acknowledge = useServerFn(acknowledgePlatformAttention);

  return {
    updateSetting: useMutation({
      mutationFn: (input: { key: string; value: string | number | boolean }) =>
        updateSetting({ data: input }),
      onSuccess: () => invalidateAdministration(queryClient),
    }),
    setFeature: useMutation({
      mutationFn: (input: { key: string; enabled: boolean }) =>
        setFeature({ data: input }),
      onSuccess: () => invalidateAdministration(queryClient),
    }),
    acknowledge: useMutation({
      mutationFn: (input: { itemId: string; note?: string }) =>
        acknowledge({ data: input }),
      onSuccess: () => invalidateAdministration(queryClient),
    }),
  };
}

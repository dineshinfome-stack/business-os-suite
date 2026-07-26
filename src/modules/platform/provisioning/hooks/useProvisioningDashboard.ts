/**
 * Gate 3.4 · Dashboard data hooks.
 *
 * The dashboard reads DTOs through the provisioning-admin facade only.
 */
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  exportProvisioningJobsCsv,
  getProviderHealth,
  getProvisioningJob,
  getProvisioningQueue,
  getProvisioningSummary,
  listFailedProvisioning,
  listProvisioningJobs,
} from "@/lib/provisioning-admin/queries.functions";
import {
  advanceProvisioning,
  cancelProvisioning,
  retryProvisioning,
  rollbackProvisioning,
  startTenantProvisioning,
} from "@/lib/provisioning-admin/commands.functions";
import type { ProvisioningListQueryDTO } from "../types";
import { invalidateAfterCommand, provisioningKeys } from "./query-keys";

export const DEFAULT_LIST_QUERY: ProvisioningListQueryDTO = {
  search: "",
  status: "all",
  providerKey: "all",
  region: "all",
  sortBy: "createdAt",
  sortDir: "desc",
  page: 1,
  pageSize: 20,
};

export function useProvisioningSummary() {
  const fn = useServerFn(getProvisioningSummary);
  return useQuery({
    queryKey: provisioningKeys.summary(),
    queryFn: () => fn(),
    staleTime: 15_000,
  });
}

export function useProvisioningJobs(query: ProvisioningListQueryDTO) {
  const fn = useServerFn(listProvisioningJobs);
  return useQuery({
    queryKey: provisioningKeys.list(query),
    queryFn: () => fn({ data: query }),
    staleTime: 10_000,
  });
}

export function useProvisioningQueue() {
  const fn = useServerFn(getProvisioningQueue);
  return useQuery({
    queryKey: provisioningKeys.queue(),
    queryFn: () => fn(),
    refetchInterval: (q) => q.state.data?.pollIntervalMs ?? 10_000,
  });
}

export function useFailedProvisioning() {
  const fn = useServerFn(listFailedProvisioning);
  return useQuery({ queryKey: provisioningKeys.failed(), queryFn: () => fn() });
}

export function useProviderHealth() {
  const fn = useServerFn(getProviderHealth);
  return useQuery({
    queryKey: provisioningKeys.health(),
    queryFn: () => fn(),
    staleTime: 60_000,
  });
}

export function useProvisioningJob(jobId: string, options?: { poll?: boolean }) {
  const fn = useServerFn(getProvisioningJob);
  return useQuery({
    queryKey: provisioningKeys.detail(jobId),
    queryFn: () => fn({ data: { jobId } }),
    refetchInterval: (q) =>
      options?.poll && q.state.data && !q.state.data.terminal
        ? q.state.data.pollIntervalMs
        : false,
  });
}

export function useProvisioningExport() {
  const fn = useServerFn(exportProvisioningJobsCsv);
  return useMutation({
    mutationFn: (query: ProvisioningListQueryDTO) => fn({ data: query }),
  });
}

export function useProvisioningCommands() {
  const queryClient = useQueryClient();
  const start = useServerFn(startTenantProvisioning);
  const retry = useServerFn(retryProvisioning);
  const advance = useServerFn(advanceProvisioning);
  const cancel = useServerFn(cancelProvisioning);
  const rollback = useServerFn(rollbackProvisioning);

  return {
    start: useMutation({
      mutationFn: (input: { tenantId: string; adminEmail: string }) =>
        start({ data: input }),
      onSuccess: (result) => invalidateAfterCommand(queryClient, "start", result.jobId),
    }),
    retry: useMutation({
      mutationFn: (jobId: string) => retry({ data: { jobId } }),
      onSuccess: (result) => invalidateAfterCommand(queryClient, "retry", result.jobId),
    }),
    advance: useMutation({
      mutationFn: (jobId: string) => advance({ data: { jobId } }),
      onSuccess: (result) => invalidateAfterCommand(queryClient, "advance", result.jobId),
    }),
    cancel: useMutation({
      mutationFn: (input: { jobId: string; reason: string }) => cancel({ data: input }),
      onSuccess: (result) => invalidateAfterCommand(queryClient, "cancel", result.jobId),
    }),
    rollback: useMutation({
      mutationFn: (jobId: string) => rollback({ data: { jobId } }),
      onSuccess: (result) =>
        invalidateAfterCommand(queryClient, "rollback", result.jobId),
    }),
  };
}

/** URL-free local filter state with a debounced search term. */
export function useProvisioningFilters(initial: ProvisioningListQueryDTO = DEFAULT_LIST_QUERY) {
  const [filters, setFilters] = React.useState<ProvisioningListQueryDTO>(initial);
  const [searchInput, setSearchInput] = React.useState(initial.search ?? "");

  React.useEffect(() => {
    const timer = setTimeout(
      () => setFilters((prev) => ({ ...prev, search: searchInput, page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const patch = React.useCallback(
    (next: Partial<ProvisioningListQueryDTO>) =>
      setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 })),
    [],
  );

  return { filters, patch, searchInput, setSearchInput, setFilters };
}

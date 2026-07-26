/**
 * Gate 3.4 · Query keys + documented cache invalidation sets.
 *
 * Commands invalidate exactly the sets listed in `INVALIDATION` so the
 * dashboard refreshes predictably without manual intervention.
 */
import type { QueryClient } from "@tanstack/react-query";
import type { ProvisioningListQueryDTO } from "../types";

export const provisioningKeys = {
  all: ["provisioning"] as const,
  summary: () => [...provisioningKeys.all, "summary"] as const,
  list: (query: ProvisioningListQueryDTO) =>
    [...provisioningKeys.all, "list", query] as const,
  lists: () => [...provisioningKeys.all, "list"] as const,
  detail: (jobId: string) => [...provisioningKeys.all, "detail", jobId] as const,
  failed: () => [...provisioningKeys.all, "failed"] as const,
  queue: () => [...provisioningKeys.all, "queue"] as const,
  health: () => [...provisioningKeys.all, "health"] as const,
};

type Command = "start" | "retry" | "cancel" | "rollback" | "advance";

export function invalidateAfterCommand(
  client: QueryClient,
  command: Command,
  jobId?: string | null,
) {
  const invalidate = (queryKey: readonly unknown[]) =>
    client.invalidateQueries({ queryKey });

  switch (command) {
    case "start":
      invalidate(provisioningKeys.summary());
      invalidate(provisioningKeys.lists());
      invalidate(provisioningKeys.queue());
      break;
    case "retry":
    case "advance":
    case "cancel":
      if (jobId) invalidate(provisioningKeys.detail(jobId));
      invalidate(provisioningKeys.lists());
      invalidate(provisioningKeys.summary());
      invalidate(provisioningKeys.queue());
      break;
    case "rollback":
      if (jobId) invalidate(provisioningKeys.detail(jobId));
      invalidate(provisioningKeys.failed());
      invalidate(provisioningKeys.summary());
      break;
  }
}

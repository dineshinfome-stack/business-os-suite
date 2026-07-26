/**
 * Gate 3.4 · Provisioning read DTOs — version 1.
 *
 * The ONLY provisioning shapes the dashboard (or any future mobile/external
 * consumer) may depend on. Internal persistence rows (`ProvisioningJobRow`,
 * `ProvisioningStepRow`) never cross this boundary.
 *
 * Types only. No runtime imports from the provisioning domain.
 */

export const PROVISIONING_DTO_VERSION = "v1" as const;

export type ProvisioningStatusDTO =
  | "not_started"
  | "in_progress"
  | "provisioned"
  | "failed";

export interface ProvisioningErrorDTO {
  code: string;
  kind: string;
  message: string;
  retryable: boolean;
}

export interface ProvisioningSummaryDTO {
  total: number;
  active: number;
  completed: number;
  failed: number;
  cancelled: number;
  rolledBack: number;
  successRate: number;
  /** Milliseconds; null when no completed job has both timestamps. */
  averageDurationMs: number | null;
  generatedAt: string;
}

export interface ProvisioningJobListItemDTO {
  jobId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  state: string;
  status: ProvisioningStatusDTO;
  currentStepKey: string | null;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  attemptCount: number;
  providerKey: string;
  region: string;
  correlationId: string;
  retryable: boolean;
  error: ProvisioningErrorDTO | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  lastTransitionAt: string;
}

export interface ProvisioningPageDTO<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ProvisioningStepDTO {
  stepKey: string;
  label: string;
  sequence: number;
  status: string;
  attemptCount: number;
  durationMs: number | null;
  startedAt: string | null;
  completedAt: string | null;
  error: ProvisioningErrorDTO | null;
}

export interface ProvisioningTimelineEntryDTO {
  id: string;
  at: string;
  label: string;
  description: string;
  tone: "neutral" | "success" | "warning" | "danger";
  stepKey: string | null;
  durationMs: number | null;
}

export interface ProvisioningJobDetailDTO extends ProvisioningJobListItemDTO {
  steps: ProvisioningStepDTO[];
  timeline: ProvisioningTimelineEntryDTO[];
  rollbackState: "none" | "partial" | "complete";
  resourceReferences: { kind: string; reference: string }[];
  /** Backend-declared polling cadence when live updates are unavailable. */
  pollIntervalMs: number;
  terminal: boolean;
}

export interface ProviderHealthDTO {
  providerKey: string;
  displayName: string;
  status: "healthy" | "degraded" | "unavailable" | "unknown";
  configured: boolean;
  capabilities: {
    supportsRollback: boolean;
    supportsSqlExecution: boolean;
    supportsAdminCreation: boolean;
  };
  statistics: {
    total: number;
    succeeded: number;
    failed: number;
    active: number;
    successRate: number;
  };
  message: string;
  checkedAt: string;
}

export interface ProvisioningQueueDTO {
  rows: ProvisioningJobListItemDTO[];
  queuedCount: number;
  runningCount: number;
  pollIntervalMs: number;
}

export interface ProvisioningFailureDTO extends ProvisioningJobListItemDTO {
  failedStepKey: string | null;
  rollbackState: "none" | "partial" | "complete";
}

export interface ProvisioningExportDTO {
  ok: boolean;
  /** Present when `ok`. */
  csv: string | null;
  rowCount: number;
  limit: number;
  /** Present when `!ok` — e.g. the result set exceeds `limit`. */
  message: string | null;
}

export interface ProvisioningCommandResultDTO {
  ok: boolean;
  jobId: string | null;
  state: string | null;
  message: string;
  error: ProvisioningErrorDTO | null;
}

export interface ProvisioningListQueryDTO {
  search?: string;
  status?: ProvisioningStatusDTO | "all";
  state?: string | "all";
  providerKey?: string | "all";
  region?: string | "all";
  retryableOnly?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt" | "lastTransitionAt" | "tenantName" | "state";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

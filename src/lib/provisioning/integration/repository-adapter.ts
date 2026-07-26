/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Repository adapter (read side).
 *
 * Implements the Gate 3.2.1 `JobRepository` port over the data client.
 * Mapping and ownership validation only — no lifecycle, retry or rollback
 * decisions, and no SQL.
 */
import { PROVISIONING_STEP_KEYS, PROVISIONING_STEP_SEQUENCE } from "../constants";
import { isProvisioningState } from "../lifecycle";
import type {
  Json,
  ProvisioningErrorRecord,
  ProvisioningJob,
  ProvisioningStep,
  ProvisioningStepKey,
} from "../types";
import type { JobRepository } from "../orchestrator/types";
import type {
  ProvisioningDataClient,
  ProvisioningJobRow,
  ProvisioningStepRow,
} from "./data-client";

export class ProvisioningDataIntegrityError extends Error {
  constructor(
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ProvisioningDataIntegrityError";
  }
}

const isStepKey = (value: string): value is ProvisioningStepKey =>
  (PROVISIONING_STEP_KEYS as readonly string[]).includes(value);

const asErrorRecord = (value: Json): ProvisioningErrorRecord | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as unknown as ProvisioningErrorRecord;
};

const asRecord = (value: Json): Record<string, Json> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};

export function mapJobRow(row: ProvisioningJobRow): ProvisioningJob {
  if (!isProvisioningState(row.state)) {
    throw new ProvisioningDataIntegrityError("Job carries an unknown lifecycle state.", {
      job_id: row.id,
      state: row.state,
    });
  }
  if (row.current_step_key !== null && !isStepKey(row.current_step_key)) {
    throw new ProvisioningDataIntegrityError("Job carries an unknown step key.", {
      job_id: row.id,
      step_key: row.current_step_key,
    });
  }

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    state: row.state,
    current_step_key: row.current_step_key,
    attempt_count: row.attempt_count,
    correlation_id: row.correlation_id,
    provider_key: row.provider_key,
    provider_resource_reference: asRecord(row.provider_resource_reference),
    last_error: asErrorRecord(row.last_error),
    started_at: row.started_at,
    last_transition_at: row.last_transition_at,
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    updated_by: row.updated_by,
  };
}

export function mapStepRow(row: ProvisioningStepRow): ProvisioningStep {
  if (!isStepKey(row.step_key)) {
    throw new ProvisioningDataIntegrityError("Step carries an unknown step key.", {
      job_id: row.job_id,
      step_key: row.step_key,
    });
  }
  return {
    id: row.id,
    job_id: row.job_id,
    step_key: row.step_key,
    sequence: row.sequence ?? PROVISIONING_STEP_SEQUENCE[row.step_key],
    status: row.status,
    attempt_count: row.attempt_count,
    correlation_id: row.correlation_id,
    error: asErrorRecord(row.error),
    started_at: row.started_at,
    completed_at: row.completed_at,
    duration_ms: row.duration_ms,
  };
}

export interface RepositoryAdapterOptions {
  dataClient: ProvisioningDataClient;
  /** Ownership guard — a job outside this tenant is never returned. */
  tenantId: string;
  /** Tracing guard — a job carrying a foreign correlation id is never returned. */
  correlationId: string;
}

export function createRepositoryAdapter(
  options: RepositoryAdapterOptions,
): JobRepository {
  const { dataClient, tenantId, correlationId } = options;

  return {
    async loadJob(jobId) {
      const row = await dataClient.selectJob(jobId);
      if (!row) return null;
      if (row.tenant_id !== tenantId) return null;
      if (row.correlation_id !== correlationId) return null;
      return mapJobRow(row);
    },

    async loadSteps(jobId) {
      const rows = await dataClient.selectSteps(jobId);
      return rows.map(mapStepRow).sort((a, b) => a.sequence - b.sequence);
    },

    async countActiveJobs(tenant) {
      return dataClient.countActiveJobs(tenant);
    },
  };
}

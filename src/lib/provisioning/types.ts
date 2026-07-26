/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Provisioning domain types (ADR-018).
 *
 * Type declarations only. `ProviderCapabilities` lives in `provider.ts` — it is
 * part of the provider contract, not the job model.
 */
import type { ProvisioningState } from "./lifecycle";
import type { ProvisioningStepKey } from "./constants";

export type { ProvisioningState } from "./lifecycle";
export type { ProvisioningStepKey } from "./constants";

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type ProvisioningStepStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped"
  | "rolled_back";

/** A provisioning job — the single source of truth for tenant provisioning state. */
export interface ProvisioningJob {
  id: string;
  tenant_id: string;
  state: ProvisioningState;
  current_step_key: ProvisioningStepKey | null;
  attempt_count: number;
  /** Mandatory on every job, event, step and audit record (ADR-018 tracing rule). */
  correlation_id: string;
  provider_key: string;
  provider_resource_reference: Record<string, Json>;
  last_error: ProvisioningErrorRecord | null;
  started_at: string | null;
  last_transition_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ProvisioningStep {
  id: string;
  job_id: string;
  step_key: ProvisioningStepKey;
  sequence: number;
  status: ProvisioningStepStatus;
  attempt_count: number;
  correlation_id: string;
  error: ProvisioningErrorRecord | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
}

/** Serializable error snapshot persisted on jobs and steps. */
export interface ProvisioningErrorRecord {
  kind: string;
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, Json>;
}

export interface StepResult {
  step_key: ProvisioningStepKey;
  status: ProvisioningStepStatus;
  correlation_id: string;
  attempt: number;
  duration_ms?: number;
  resources?: ProviderResource[];
  error?: ProvisioningErrorRecord;
}

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitterRatio: number;
}

export type OrphanHandling = "destroy" | "quarantine" | "ignore";

export interface RollbackPolicy {
  /** Steps that can be reversed by the provider. */
  reversibleSteps: readonly ProvisioningStepKey[];
  orphanHandling: OrphanHandling;
  /** When true, a rollback failure still moves the job to `rolled_back`. */
  continueOnStepFailure: boolean;
}

export interface RollbackAction {
  step_key: ProvisioningStepKey;
  sequence: number;
  reversible: boolean;
  orphanHandling: OrphanHandling;
}

export interface RollbackPlan {
  job_id: string;
  correlation_id: string;
  eligible: boolean;
  reason?: string;
  actions: RollbackAction[];
  orphans: OrphanedResource[];
}

export interface ProviderResource {
  kind: string;
  reference: string;
  step_key: ProvisioningStepKey;
  created_at?: string;
  metadata?: Record<string, Json>;
}

export interface OrphanedResource extends ProviderResource {
  detected_at: string;
  handling: OrphanHandling;
}

export interface MigrationRecord {
  version: string;
  name: string;
  checksum: string;
  applied_at: string | null;
  status: "pending" | "applied" | "failed";
}

/** A pointer to a secret. Never carries the secret value itself. */
export interface SecretReference {
  /** Logical name resolved by the secret store at execution time (Gate 3.3+). */
  name: string;
  scope: "platform" | "tenant";
  version?: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  checked_at: string;
  checks: Array<{ name: string; ok: boolean; detail?: string }>;
}

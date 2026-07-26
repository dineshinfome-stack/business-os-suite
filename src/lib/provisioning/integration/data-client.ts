/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Data client seam.
 *
 * A narrow row-access contract that the repository and writer adapters depend
 * on. One binding implements it over Supabase (`supabase-data-client.ts`);
 * tests supply an in-memory implementation. No business logic lives here.
 *
 * INVARIANT (Risk D1): no command in this contract targets
 * `tenants.provisioning_status`. That column is derived by a database trigger.
 */
import type { Json, ProvisioningState, ProvisioningStepStatus } from "../types";

/* -------------------------------------------------------------------------- */
/* Row shapes (storage representation)                                         */
/* -------------------------------------------------------------------------- */

export interface ProvisioningJobRow {
  id: string;
  tenant_id: string;
  state: ProvisioningState;
  current_step_key: string | null;
  attempt_count: number;
  correlation_id: string;
  provider_key: string;
  provider_resource_reference: Json;
  last_error: Json;
  started_at: string | null;
  last_transition_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ProvisioningStepRow {
  id: string;
  job_id: string;
  step_key: string;
  sequence: number;
  status: ProvisioningStepStatus;
  attempt_count: number;
  correlation_id: string;
  error: Json;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
}

/* -------------------------------------------------------------------------- */
/* Commands                                                                    */
/* -------------------------------------------------------------------------- */

/** Conditional job update — applied only when the row still holds `expectedState`. */
export interface JobUpdateCommand {
  jobId: string;
  expectedState: ProvisioningState;
  patch: {
    state: ProvisioningState;
    current_step_key: string | null;
    attempt_count?: number;
    correlation_id: string;
    last_error: Json;
    last_transition_at: string;
    started_at?: string;
    completed_at?: string | null;
    provider_resource_reference?: Json;
  };
}

/** Conditional step claim — applied only when the step is not already owned. */
export interface StepClaimCommand {
  jobId: string;
  stepKey: string;
  sequence: number;
  correlationId: string;
  attempt: number;
  at: string;
}

/** Terminal step outcome write (succeeded / failed / skipped / rolled_back). */
export interface StepOutcomeCommand {
  jobId: string;
  stepKey: string;
  sequence: number;
  status: ProvisioningStepStatus;
  correlationId: string;
  attempt: number;
  at: string;
  durationMs: number | null;
  error: Json;
}

export interface ProvisioningDataClient {
  selectJob(jobId: string): Promise<ProvisioningJobRow | null>;
  selectSteps(jobId: string): Promise<ProvisioningStepRow[]>;
  countActiveJobs(tenantId: string): Promise<number>;
  /** Returns the number of rows affected. `0` means the expected state was lost. */
  updateJobIfState(command: JobUpdateCommand): Promise<number>;
  /** `false` means another runner already owns or finished the step. */
  claimStepIfUnclaimed(command: StepClaimCommand): Promise<boolean>;
  writeStepOutcome(command: StepOutcomeCommand): Promise<void>;
}

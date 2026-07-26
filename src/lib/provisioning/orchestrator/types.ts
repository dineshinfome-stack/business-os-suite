/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Orchestrator ports and result model.
 *
 * Ports only. The orchestrator never imports a database client, HTTP client or
 * provider SDK — every side effect arrives through one of these interfaces.
 */
import type { ProvisioningState } from "../lifecycle";
import type { ProvisioningError } from "../errors";
import type { ProvisioningEventEnvelope } from "../events";
import type {
  ProviderResource,
  ProvisioningErrorRecord,
  ProvisioningJob,
  ProvisioningStep,
  ProvisioningStepKey,
  ProvisioningStepStatus,
  SecretReference,
  MigrationRecord,
} from "../types";

/* -------------------------------------------------------------------------- */
/* Ports                                                                       */
/* -------------------------------------------------------------------------- */

/** Read port. Implemented by Gate 3.2.2 against `provisioning_jobs`/`_steps`. */
export interface JobRepository {
  loadJob(jobId: string): Promise<ProvisioningJob | null>;
  loadSteps(jobId: string): Promise<ProvisioningStep[]>;
  countActiveJobs(tenantId: string): Promise<number>;
}

export interface TransitionInput {
  jobId: string;
  expectedState: ProvisioningState;
  nextState: ProvisioningState;
  correlationId: string;
  at: string;
  currentStepKey?: ProvisioningStepKey | null;
  attemptCount?: number;
  error?: ProvisioningErrorRecord | null;
  resources?: readonly ProviderResource[];
}

export interface StepWriteInput {
  jobId: string;
  stepKey: ProvisioningStepKey;
  sequence: number;
  status: ProvisioningStepStatus;
  correlationId: string;
  attempt: number;
  at: string;
  durationMs?: number;
  error?: ProvisioningErrorRecord | null;
  resources?: readonly ProviderResource[];
}

/**
 * Write port.
 *
 * INVARIANT (Risk D1): no method here may target `tenants.provisioning_status`.
 * That column is derived by `private.fn_sync_tenant_provisioning_status`.
 */
export interface JobWriter {
  /**
   * Optimistic-concurrency transition.
   * Returns `false` when the row no longer matches `expectedState`.
   */
  transitionState(input: TransitionInput): Promise<boolean>;
  /**
   * Claim a step for execution. Returns `false` when another runner already
   * claimed or completed it — the loser must not call the provider.
   */
  claimStep(input: StepWriteInput): Promise<boolean>;
  /** Record a terminal step outcome (succeeded / failed / skipped / rolled_back). */
  writeStep(input: StepWriteInput): Promise<void>;
}

export interface EventSink {
  emit(event: ProvisioningEventEnvelope): Promise<void>;
}

export interface Clock {
  /** ISO-8601 timestamp. */
  now(): string;
  /** Monotonic milliseconds, used only for durations. */
  monotonicMs(): number;
}

export interface OrchestratorLogFields {
  correlationId: string;
  tenantId: string;
  jobId: string;
  currentStep: ProvisioningStepKey | null;
  [key: string]: unknown;
}

export interface OrchestratorLogger {
  debug(message: string, fields: OrchestratorLogFields): void;
  info(message: string, fields: OrchestratorLogFields): void;
  warn(message: string, fields: OrchestratorLogFields): void;
  error(message: string, fields: OrchestratorLogFields): void;
}

/* -------------------------------------------------------------------------- */
/* Request configuration (provider-agnostic)                                   */
/* -------------------------------------------------------------------------- */

export interface ProvisioningRequest {
  readonly slug: string;
  readonly region: string;
  readonly credentials: SecretReference;
  readonly adminEmail: string;
  readonly migrations: readonly MigrationRecord[];
}

/* -------------------------------------------------------------------------- */
/* Layer 1 — ExecutionResult: what the step did                                */
/* -------------------------------------------------------------------------- */

export type ExecutionOutcome = "success" | "skipped" | "failure";

export interface ExecutionResult {
  outcome: ExecutionOutcome;
  stepKey: ProvisioningStepKey | null;
  attempt: number;
  durationMs: number;
  resources?: ProviderResource[];
  error?: ProvisioningError;
}

/* -------------------------------------------------------------------------- */
/* Layer 2 — OrchestratorDecision: what happens next                           */
/* -------------------------------------------------------------------------- */

export type OrchestratorAction =
  | "continue"
  | "retry"
  | "rollback"
  | "complete"
  | "fail"
  | "cancel"
  | "noop";

export interface OrchestratorDecision {
  action: OrchestratorAction;
  /** `null` when the action performs no state transition. */
  targetState: ProvisioningState | null;
  reason: string;
  /** Advisory backoff produced by `retry.ts`; the orchestrator never sleeps. */
  delayMs?: number;
  attempt?: number;
}

/* -------------------------------------------------------------------------- */
/* Public result envelope                                                      */
/* -------------------------------------------------------------------------- */

export interface OrchestrationSnapshot {
  jobId: string;
  tenantId: string;
  correlationId: string;
  fromState: ProvisioningState;
  toState: ProvisioningState;
  execution: ExecutionResult;
  decision: OrchestratorDecision;
}

export type OrchestratorResult<T> =
  | { ok: true; value: T; warnings: ProvisioningErrorRecord[] }
  | { ok: false; error: ProvisioningError; warnings: ProvisioningErrorRecord[] };

export const okResult = <T>(
  value: T,
  warnings: ProvisioningErrorRecord[] = [],
): OrchestratorResult<T> => ({ ok: true, value, warnings });

export const errResult = <T>(
  error: ProvisioningError,
  warnings: ProvisioningErrorRecord[] = [],
): OrchestratorResult<T> => ({ ok: false, error, warnings });

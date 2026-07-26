/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Persistence coordination.
 *
 * Thin coordination over the injected `JobWriter`.
 *
 * INVARIANT (Risk D1): nothing in this module writes `tenants.provisioning_status`.
 * The column is derived by a database trigger.
 */
import { toErrorRecord, validationError } from "../errors";
import type { ProvisioningError } from "../errors";
import type { ProvisioningState } from "../lifecycle";
import { validateStateTransition } from "../validators";
import type {
  ProviderResource,
  ProvisioningStepKey,
  ProvisioningStepStatus,
} from "../types";
import type { OrchestrationContext } from "./context";
import { sequenceForStep } from "./step-map";
import { errResult, okResult, type OrchestratorResult } from "./types";

export function concurrencyConflict(
  from: ProvisioningState,
  to: ProvisioningState,
): ProvisioningError {
  return validationError(
    "concurrency_conflict",
    "Job state changed underneath this orchestration attempt.",
    { expected_state: from, attempted_state: to },
  );
}

/**
 * Validate + persist one lifecycle transition using expected-state optimistic
 * concurrency. Returns a typed error when the transition is illegal or lost.
 */
export async function persistTransition(
  ctx: OrchestrationContext,
  input: {
    from: ProvisioningState;
    to: ProvisioningState;
    stepKey?: ProvisioningStepKey | null;
    attemptCount?: number;
    error?: ProvisioningError | null;
    resources?: readonly ProviderResource[];
  },
): Promise<OrchestratorResult<ProvisioningState>> {
  const legality = validateStateTransition(input.from, input.to);
  if (!legality.valid) {
    return errResult(legality.errors[0]);
  }

  const committed = await ctx.writer.transitionState({
    jobId: ctx.jobId,
    expectedState: input.from,
    nextState: input.to,
    correlationId: ctx.correlationId,
    at: ctx.clock.now(),
    currentStepKey: input.stepKey ?? null,
    attemptCount: input.attemptCount,
    error: input.error ? toErrorRecord(input.error) : null,
    resources: input.resources,
  });

  if (!committed) {
    return errResult(concurrencyConflict(input.from, input.to));
  }
  return okResult(input.to);
}

/** Attempt to claim a step. `false` means another runner owns it. */
export async function claimStep(
  ctx: OrchestrationContext,
  input: { stepKey: ProvisioningStepKey; attempt: number },
): Promise<boolean> {
  return ctx.writer.claimStep({
    jobId: ctx.jobId,
    stepKey: input.stepKey,
    sequence: sequenceForStep(input.stepKey),
    status: "running",
    correlationId: ctx.correlationId,
    attempt: input.attempt,
    at: ctx.clock.now(),
  });
}

export async function persistStepOutcome(
  ctx: OrchestrationContext,
  input: {
    stepKey: ProvisioningStepKey;
    status: ProvisioningStepStatus;
    attempt: number;
    durationMs?: number;
    error?: ProvisioningError | null;
    resources?: readonly ProviderResource[];
  },
): Promise<void> {
  await ctx.writer.writeStep({
    jobId: ctx.jobId,
    stepKey: input.stepKey,
    sequence: sequenceForStep(input.stepKey),
    status: input.status,
    correlationId: ctx.correlationId,
    attempt: input.attempt,
    at: ctx.clock.now(),
    durationMs: input.durationMs,
    error: input.error ? toErrorRecord(input.error) : null,
    resources: input.resources,
  });
}

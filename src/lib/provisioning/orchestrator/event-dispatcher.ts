/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Event dispatch.
 *
 * Reuses the Gate 3.1 envelope builders verbatim — no payload redesign.
 *
 * Rule: events are emitted only AFTER persistence commits, and a sink failure
 * is NOT an orchestration failure. Failures surface as typed warnings.
 */
import { providerError, toErrorRecord } from "../errors";
import type { ProvisioningState } from "../lifecycle";
import type { ProvisioningErrorRecord, ProvisioningStepKey } from "../types";
import {
  provisioningCancelled,
  provisioningCompleted,
  provisioningFailed,
  provisioningRolledBack,
  provisioningStarted,
  provisioningStepChanged,
  type ProvisioningEventEnvelope,
} from "../events";
import type { OrchestrationContext } from "./context";

interface DispatchInput {
  fromState?: ProvisioningState;
  toState?: ProvisioningState;
  stepKey?: ProvisioningStepKey;
  attempt?: number;
}

function base(ctx: OrchestrationContext, input: DispatchInput) {
  return {
    tenantId: ctx.tenantId,
    jobId: ctx.jobId,
    actorId: ctx.actorId,
    correlationId: ctx.correlationId,
    ...input,
  };
}

/**
 * Emit one envelope. Never throws: returns a warning record on sink failure so
 * the caller can attach it to an otherwise successful result.
 */
async function safeEmit(
  ctx: OrchestrationContext,
  envelope: ProvisioningEventEnvelope,
  currentStep: ProvisioningStepKey | null,
): Promise<ProvisioningErrorRecord | null> {
  try {
    await ctx.events.emit(envelope);
    return null;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    const record = toErrorRecord(
      providerError("event_sink_failed", `Event sink rejected ${envelope.event}: ${message}`, {
        retryable: true,
        details: { event: envelope.event },
      }),
    );
    ctx.logger.warn("provisioning event emission failed", {
      correlationId: ctx.correlationId,
      tenantId: ctx.tenantId,
      jobId: ctx.jobId,
      currentStep,
      event: envelope.event,
    });
    return record;
  }
}

export const dispatchStarted = (ctx: OrchestrationContext, input: DispatchInput) =>
  safeEmit(ctx, provisioningStarted(base(ctx, input)), input.stepKey ?? null);

export const dispatchStepChanged = (
  ctx: OrchestrationContext,
  input: DispatchInput & { stepKey: ProvisioningStepKey },
) => safeEmit(ctx, provisioningStepChanged(base(ctx, input) as never), input.stepKey);

export const dispatchCompleted = (ctx: OrchestrationContext, input: DispatchInput) =>
  safeEmit(ctx, provisioningCompleted(base(ctx, input)), input.stepKey ?? null);

export const dispatchFailed = (
  ctx: OrchestrationContext,
  input: DispatchInput & { error: ProvisioningErrorRecord },
) => safeEmit(ctx, provisioningFailed(base(ctx, input) as never), input.stepKey ?? null);

export const dispatchRolledBack = (ctx: OrchestrationContext, input: DispatchInput) =>
  safeEmit(ctx, provisioningRolledBack(base(ctx, input)), input.stepKey ?? null);

export const dispatchCancelled = (ctx: OrchestrationContext, input: DispatchInput) =>
  safeEmit(ctx, provisioningCancelled(base(ctx, input)), input.stepKey ?? null);

/** Collect non-null warnings into the result envelope. */
export function collectWarning(
  warnings: ProvisioningErrorRecord[],
  warning: ProvisioningErrorRecord | null,
): ProvisioningErrorRecord[] {
  if (warning) warnings.push(warning);
  return warnings;
}

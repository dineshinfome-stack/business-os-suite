/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Single-step executor.
 *
 * Executes EXACTLY ONE lifecycle step per invocation. No loops, no recursion,
 * no batching — a future worker simply calls this repeatedly.
 *
 * Flow: validate → load → determine step → claim → invoke provider interface →
 * persist → decide → transition → emit → return typed result.
 */
import { isTerminal, nextState } from "../lifecycle";
import { shouldRetry } from "../retry";
import { evaluateRollbackEligibility } from "../rollback";
import { toErrorRecord, validationError } from "../errors";
import type { ProvisioningStepKey } from "../types";
import type { OrchestrationContext } from "./context";
import { loadJob } from "./job-loader";
import { claimStep, persistStepOutcome, persistTransition } from "./job-persistence";
import { stepForState } from "./step-map";
import { runStep } from "./step-runner";
import {
  collectWarning,
  dispatchCompleted,
  dispatchFailed,
  dispatchStepChanged,
} from "./event-dispatcher";
import {
  errResult,
  okResult,
  type ExecutionResult,
  type OrchestrationSnapshot,
  type OrchestratorDecision,
  type OrchestratorResult,
} from "./types";

function log(
  ctx: OrchestrationContext,
  level: "info" | "warn" | "error",
  message: string,
  currentStep: ProvisioningStepKey | null,
  extra: Record<string, unknown> = {},
) {
  ctx.logger[level](message, {
    correlationId: ctx.correlationId,
    tenantId: ctx.tenantId,
    jobId: ctx.jobId,
    currentStep,
    ...extra,
  });
}

/** Derive the decision from an execution result. Delegates all policy. */
export function decide(
  ctx: OrchestrationContext,
  input: {
    state: Parameters<typeof nextState>[0];
    execution: ExecutionResult;
    attemptCount: number;
  },
): OrchestratorDecision {
  const { execution } = input;

  if (execution.outcome === "success" || execution.outcome === "skipped") {
    const target = nextState(input.state);
    if (!target) {
      return { action: "noop", targetState: null, reason: "No further happy-path state." };
    }
    return target === "completed"
      ? { action: "complete", targetState: target, reason: "Final step succeeded." }
      : { action: "continue", targetState: target, reason: "Step succeeded." };
  }

  const error = execution.error!;
  const retry = shouldRetry(error, input.attemptCount, ctx.retryPolicy, ctx.jitterSource);

  if (retry.retry) {
    return {
      action: "retry",
      targetState: "retrying",
      reason: retry.reason,
      delayMs: retry.delayMs,
      attempt: retry.attempt,
    };
  }

  return {
    action: "fail",
    targetState: "failed",
    reason: retry.reason,
    attempt: retry.attempt,
  };
}

export async function executeNextStep(
  ctx: OrchestrationContext,
): Promise<OrchestratorResult<OrchestrationSnapshot>> {
  const warnings = [] as ReturnType<typeof toErrorRecord>[];

  const loaded = await loadJob(ctx);
  if (!loaded.ok) return loaded as OrchestratorResult<OrchestrationSnapshot>;
  const { job, steps } = loaded.value;

  const from = job.state;
  const stepKey = stepForState(from);

  // Idempotency: terminal jobs are a no-op success.
  if (isTerminal(from)) {
    log(ctx, "info", "job is terminal; execution skipped", stepKey);
    return okResult({
      jobId: job.id,
      tenantId: job.tenant_id,
      correlationId: ctx.correlationId,
      fromState: from,
      toState: from,
      execution: { outcome: "skipped", stepKey, attempt: job.attempt_count, durationMs: 0 },
      decision: { action: "noop", targetState: null, reason: "Job already terminal." },
    });
  }

  // States with no provider step (pending, queued, retrying) are pure transitions.
  if (!stepKey) {
    const target = nextState(from);
    if (!target) {
      return errResult(
        validationError(
          "no_next_state",
          `State ${from} has no happy-path successor; use resume(), rollback() or cancel().`,
          { state: from },
        ),
      );
    }
    const moved = await persistTransition(ctx, { from, to: target });
    if (!moved.ok) return moved as OrchestratorResult<OrchestrationSnapshot>;

    log(ctx, "info", "transitioned without provider step", stepKey, { to: target });
    return okResult(
      {
        jobId: job.id,
        tenantId: job.tenant_id,
        correlationId: ctx.correlationId,
        fromState: from,
        toState: target,
        execution: { outcome: "skipped", stepKey: null, attempt: job.attempt_count, durationMs: 0 },
        decision: { action: "continue", targetState: target, reason: "Transition-only state." },
      },
      warnings,
    );
  }

  // Idempotency: an already-succeeded step is skipped, not re-run.
  const existing = steps.find((s) => s.step_key === stepKey);
  if (existing?.status === "succeeded") {
    const target = nextState(from);
    if (!target) {
      return errResult(validationError("no_next_state", `State ${from} has no successor.`));
    }
    const moved = await persistTransition(ctx, { from, to: target, stepKey });
    if (!moved.ok) return moved as OrchestratorResult<OrchestrationSnapshot>;
    collectWarning(warnings, await dispatchStepChanged(ctx, { fromState: from, toState: target, stepKey }));
    log(ctx, "info", "step already succeeded; skipped", stepKey);
    return okResult(
      {
        jobId: job.id,
        tenantId: job.tenant_id,
        correlationId: ctx.correlationId,
        fromState: from,
        toState: target,
        execution: {
          outcome: "skipped",
          stepKey,
          attempt: existing.attempt_count,
          durationMs: 0,
        },
        decision: { action: "continue", targetState: target, reason: "Step already succeeded." },
      },
      warnings,
    );
  }

  const attempt = (existing?.attempt_count ?? 0) + 1;

  // Duplicate-execution guard BEFORE any provider call.
  const claimed = await claimStep(ctx, { stepKey, attempt });
  if (!claimed) {
    log(ctx, "warn", "step already claimed by another runner", stepKey);
    return errResult(
      validationError("concurrency_conflict", "Step is already claimed by another runner.", {
        step_key: stepKey,
      }),
      warnings,
    );
  }

  const execution = await runStep(ctx, { job, stepKey, attempt });
  const decision = decide(ctx, { state: from, execution, attemptCount: attempt });

  await persistStepOutcome(ctx, {
    stepKey,
    status: execution.outcome === "success" ? "succeeded" : "failed",
    attempt,
    durationMs: execution.durationMs,
    error: execution.error ?? null,
    resources: execution.resources,
  });

  if (!decision.targetState) {
    return okResult(
      {
        jobId: job.id,
        tenantId: job.tenant_id,
        correlationId: ctx.correlationId,
        fromState: from,
        toState: from,
        execution,
        decision,
      },
      warnings,
    );
  }

  const moved = await persistTransition(ctx, {
    from,
    to: decision.targetState,
    stepKey,
    attemptCount: attempt,
    error: execution.error ?? null,
    resources: execution.resources,
  });
  if (!moved.ok) return { ...moved, warnings } as OrchestratorResult<OrchestrationSnapshot>;

  // Events only after the transition commits, in decision order.
  collectWarning(
    warnings,
    await dispatchStepChanged(ctx, {
      fromState: from,
      toState: decision.targetState,
      stepKey,
      attempt,
    }),
  );

  if (decision.action === "complete") {
    collectWarning(
      warnings,
      await dispatchCompleted(ctx, { fromState: from, toState: decision.targetState, stepKey }),
    );
  } else if (decision.action === "fail" && execution.error) {
    collectWarning(
      warnings,
      await dispatchFailed(ctx, {
        fromState: from,
        toState: decision.targetState,
        stepKey,
        attempt,
        error: toErrorRecord(execution.error),
      }),
    );
  }

  log(
    ctx,
    execution.outcome === "failure" ? "warn" : "info",
    `step ${execution.outcome}: ${decision.action}`,
    stepKey,
    { attempt, to: decision.targetState, reason: decision.reason },
  );

  // Rollback eligibility is evaluated, never executed, by the executor.
  if (decision.action === "fail") {
    const eligibility = evaluateRollbackEligibility(decision.targetState);
    log(ctx, "warn", "rollback eligibility evaluated", stepKey, {
      eligible: eligibility.eligible,
      reason: eligibility.reason,
    });
  }

  return okResult(
    {
      jobId: job.id,
      tenantId: job.tenant_id,
      correlationId: ctx.correlationId,
      fromState: from,
      toState: decision.targetState,
      execution,
      decision,
    },
    warnings,
  );
}

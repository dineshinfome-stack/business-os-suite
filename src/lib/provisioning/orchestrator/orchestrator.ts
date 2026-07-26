/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Provisioning Orchestrator (public API).
 *
 * Coordination only. Lifecycle rules live in `lifecycle.ts`, retry policy in
 * `retry.ts`, rollback planning in `rollback.ts`, validation in `validators.ts`,
 * event payloads in `events.ts`. Nothing is reimplemented here.
 *
 * Never touches a provider implementation, Supabase, HTTP, queues or workers.
 */
import { isTerminal } from "../lifecycle";
import { buildRollbackPlan, evaluateRollbackEligibility } from "../rollback";
import { toErrorRecord, validationError } from "../errors";
import { validateTenantEligible, type TenantFacts } from "../validators";
import type { RollbackPlan } from "../types";
import type { OrchestrationContext } from "./context";
import { loadJob } from "./job-loader";
import { persistStepOutcome, persistTransition } from "./job-persistence";
import { runRollbackAction } from "./step-runner";
import { executeNextStep } from "./executor";
import {
  collectWarning,
  dispatchCancelled,
  dispatchCompleted,
  dispatchFailed,
  dispatchRolledBack,
  dispatchStarted,
} from "./event-dispatcher";
import {
  errResult,
  okResult,
  type OrchestrationSnapshot,
  type OrchestratorResult,
  type ProvisioningRequest,
} from "./types";

export type { OrchestrationContext } from "./context";

export interface StartInput {
  tenant: TenantFacts;
  activeJobCount: number;
  providerConfig?: Parameters<typeof validateTenantEligible>[0]["providerConfig"];
}

export interface Orchestrator {
  start(input: StartInput): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  resume(): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  executeNextStep(): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  complete(): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  fail(reason: string): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  cancel(reason: string): Promise<OrchestratorResult<OrchestrationSnapshot>>;
  rollback(): Promise<OrchestratorResult<RollbackPlan>>;
}

export function createOrchestrator(ctx: OrchestrationContext): Orchestrator {
  const snapshot = (
    fromState: OrchestrationSnapshot["fromState"],
    toState: OrchestrationSnapshot["toState"],
    action: OrchestrationSnapshot["decision"]["action"],
    reason: string,
  ): OrchestrationSnapshot => ({
    jobId: ctx.jobId,
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    fromState,
    toState,
    execution: { outcome: "skipped", stepKey: null, attempt: 0, durationMs: 0 },
    decision: { action, targetState: toState, reason },
  });

  async function transitionTo(
    to: OrchestrationSnapshot["toState"],
    action: OrchestrationSnapshot["decision"]["action"],
    reason: string,
  ): Promise<OrchestratorResult<OrchestrationSnapshot>> {
    const loaded = await loadJob(ctx);
    if (!loaded.ok) return loaded as OrchestratorResult<OrchestrationSnapshot>;
    const from = loaded.value.job.state;

    // Idempotency: already in the requested terminal state.
    if (from === to) {
      return okResult(snapshot(from, to, "noop", `Job already in state ${to}.`));
    }

    const moved = await persistTransition(ctx, { from, to });
    if (!moved.ok) return moved as OrchestratorResult<OrchestrationSnapshot>;

    const warnings = [] as ReturnType<typeof toErrorRecord>[];
    if (to === "completed") {
      collectWarning(warnings, await dispatchCompleted(ctx, { fromState: from, toState: to }));
    } else if (to === "cancelled") {
      collectWarning(warnings, await dispatchCancelled(ctx, { fromState: from, toState: to }));
    } else if (to === "failed") {
      collectWarning(
        warnings,
        await dispatchFailed(ctx, {
          fromState: from,
          toState: to,
          error: toErrorRecord(validationError("orchestration_failed", reason)),
        }),
      );
    }

    ctx.logger.info(`orchestrator ${action}`, {
      correlationId: ctx.correlationId,
      tenantId: ctx.tenantId,
      jobId: ctx.jobId,
      currentStep: null,
      from,
      to,
      reason,
    });

    return okResult(snapshot(from, to, action, reason), warnings);
  }

  return {
    async start(input) {
      const loaded = await loadJob(ctx);
      if (!loaded.ok) return loaded as OrchestratorResult<OrchestrationSnapshot>;
      const job = loaded.value.job;

      // Idempotency: starting an already-started job is a validation failure.
      if (job.state !== "pending") {
        return errResult(
          validationError("job_already_started", "Provisioning job is not in a startable state.", {
            state: job.state,
          }),
        );
      }

      const eligibility = validateTenantEligible({
        tenant: input.tenant,
        activeJobCount: input.activeJobCount,
        providerConfig: input.providerConfig,
      });
      if (!eligibility.valid) {
        return errResult(eligibility.errors[0]);
      }

      const moved = await persistTransition(ctx, { from: "pending", to: "validating" });
      if (!moved.ok) return moved as OrchestratorResult<OrchestrationSnapshot>;

      const warnings = [] as ReturnType<typeof toErrorRecord>[];
      collectWarning(
        warnings,
        await dispatchStarted(ctx, { fromState: "pending", toState: "validating" }),
      );

      ctx.logger.info("provisioning started", {
        correlationId: ctx.correlationId,
        tenantId: ctx.tenantId,
        jobId: ctx.jobId,
        currentStep: null,
      });

      return okResult(
        snapshot("pending", "validating", "continue", "Job started."),
        warnings,
      );
    },

    async resume() {
      const loaded = await loadJob(ctx);
      if (!loaded.ok) return loaded as OrchestratorResult<OrchestrationSnapshot>;
      const from = loaded.value.job.state;

      if (isTerminal(from)) {
        return okResult(snapshot(from, from, "noop", "Job is terminal; nothing to resume."));
      }

      // `retrying` re-enters the step state it left; the executor then runs it.
      if (from === "retrying") {
        const stepKey = loaded.value.job.current_step_key;
        if (!stepKey) {
          return errResult(
            validationError(
              "resume_target_unknown",
              "Cannot resume: job is retrying with no recorded current step.",
            ),
          );
        }
        const { stateForStep } = await import("./step-map");
        const target = stateForStep(stepKey);
        const moved = await persistTransition(ctx, { from, to: target, stepKey });
        if (!moved.ok) return moved as OrchestratorResult<OrchestrationSnapshot>;
        return okResult(snapshot(from, target, "continue", "Resumed from retry."));
      }

      return executeNextStep(ctx);
    },

    executeNextStep: () => executeNextStep(ctx),

    complete: () => transitionTo("completed", "complete", "Provisioning complete."),

    fail: (reason: string) => transitionTo("failed", "fail", reason),

    cancel: (reason: string) => transitionTo("cancelled", "cancel", reason),

    async rollback(): Promise<OrchestratorResult<RollbackPlan>> {
      const loaded = await loadJob(ctx);
      if (!loaded.ok) return loaded as OrchestratorResult<RollbackPlan>;
      const { job, steps } = loaded.value;

      const eligibility = evaluateRollbackEligibility(job.state);
      const plan = buildRollbackPlan({
        jobId: job.id,
        correlationId: ctx.correlationId,
        state: job.state,
        steps,
        policy: ctx.rollbackPolicy,
      });

      if (!eligibility.eligible) {
        // Idempotency: an already rolled-back job is a no-op success.
        if (job.state === "rolled_back") return okResult(plan);
        return errResult(
          validationError("rollback_not_eligible", eligibility.reason ?? "Rollback not allowed.", {
            state: job.state,
          }),
        );
      }

      const warnings = [] as ReturnType<typeof toErrorRecord>[];

      // Coordination only: invoke the provider interface per planned action.
      for (const action of plan.actions) {
        if (!action.reversible) {
          await persistStepOutcome(ctx, {
            stepKey: action.step_key,
            status: "skipped",
            attempt: 0,
          });
          continue;
        }
        const result = await runRollbackAction(ctx, { job, stepKey: action.step_key });
        await persistStepOutcome(ctx, {
          stepKey: action.step_key,
          status: result.outcome === "failure" ? "failed" : "rolled_back",
          attempt: 0,
          durationMs: result.durationMs,
          error: result.error ?? null,
        });
        if (result.outcome === "failure" && !ctx.rollbackPolicy.continueOnStepFailure) {
          return errResult(result.error!, warnings);
        }
      }

      const moved = await persistTransition(ctx, { from: job.state, to: "rolled_back" });
      if (!moved.ok) return { ...moved, warnings } as OrchestratorResult<RollbackPlan>;

      collectWarning(
        warnings,
        await dispatchRolledBack(ctx, { fromState: job.state, toState: "rolled_back" }),
      );

      ctx.logger.warn("provisioning rolled back", {
        correlationId: ctx.correlationId,
        tenantId: ctx.tenantId,
        jobId: ctx.jobId,
        currentStep: job.current_step_key,
        actions: plan.actions.length,
      });

      return okResult(plan, warnings);
    },
  };
}

export type { ProvisioningRequest };

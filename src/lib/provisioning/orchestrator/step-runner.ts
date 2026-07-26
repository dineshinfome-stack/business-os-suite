/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Step runner.
 *
 * Maps exactly one canonical step key to exactly one `ProvisioningProvider`
 * method. Interface only — no SDK, no HTTP, no Supabase, no infrastructure.
 *
 * Every thrown value, rejected promise or non-Error throw is normalized into a
 * typed `ProviderError` before it can reach the orchestrator.
 */
import { isProvisioningError, providerError, type ProvisioningError } from "../errors";
import type { ProviderResource, ProvisioningJob, ProvisioningStepKey } from "../types";
import type { OrchestrationContext } from "./context";
import type { ExecutionResult } from "./types";

function normalize(cause: unknown, providerKey: string): ProvisioningError {
  if (isProvisioningError(cause)) return cause;
  const message =
    cause instanceof Error
      ? cause.message
      : typeof cause === "string"
        ? cause
        : JSON.stringify(cause);
  return providerError("provider_call_failed", message || "Provider call failed.", {
    retryable: true,
    providerKey,
  });
}

function projectReference(job: ProvisioningJob): string | null {
  const ref = job.provider_resource_reference?.project_reference;
  return typeof ref === "string" && ref.length > 0 ? ref : null;
}

function missingReference(providerKey: string): ProvisioningError {
  return providerError(
    "project_reference_missing",
    "No provider project reference recorded on the job.",
    { retryable: false, providerKey },
  );
}

/** Execute one step against the provider interface. Never throws. */
export async function runStep(
  ctx: OrchestrationContext,
  input: { job: ProvisioningJob; stepKey: ProvisioningStepKey; attempt: number },
): Promise<ExecutionResult> {
  const providerKey = ctx.provider.capabilities.key;
  const startedAt = ctx.clock.monotonicMs();
  const finish = (partial: Omit<ExecutionResult, "durationMs">): ExecutionResult => ({
    ...partial,
    durationMs: Math.max(0, ctx.clock.monotonicMs() - startedAt),
  });

  try {
    switch (input.stepKey) {
      case "validate": {
        // Pure precondition step — no provider call, no infrastructure.
        return finish({ outcome: "success", stepKey: input.stepKey, attempt: input.attempt });
      }

      case "create_project": {
        const result = await ctx.provider.createProject({
          tenantId: ctx.tenantId,
          correlationId: ctx.correlationId,
          slug: ctx.request.slug,
          region: ctx.request.region,
          credentials: ctx.request.credentials,
        });
        const resources: ProviderResource[] = [
          ...result.resources,
          {
            kind: "project",
            reference: result.reference,
            step_key: "create_project",
          },
        ];
        return finish({
          outcome: "success",
          stepKey: input.stepKey,
          attempt: input.attempt,
          resources,
        });
      }

      case "apply_migrations": {
        const reference = projectReference(input.job);
        if (!reference) {
          return finish({
            outcome: "failure",
            stepKey: input.stepKey,
            attempt: input.attempt,
            error: missingReference(providerKey),
          });
        }
        await ctx.provider.applyMigrations({
          correlationId: ctx.correlationId,
          projectReference: reference,
          migrations: ctx.request.migrations,
          credentials: ctx.request.credentials,
        });
        return finish({ outcome: "success", stepKey: input.stepKey, attempt: input.attempt });
      }

      case "seed_database": {
        const reference = projectReference(input.job);
        if (!reference) {
          return finish({
            outcome: "failure",
            stepKey: input.stepKey,
            attempt: input.attempt,
            error: missingReference(providerKey),
          });
        }
        await ctx.provider.seedDatabase({
          correlationId: ctx.correlationId,
          projectReference: reference,
          credentials: ctx.request.credentials,
        });
        return finish({ outcome: "success", stepKey: input.stepKey, attempt: input.attempt });
      }

      case "create_administrator": {
        const reference = projectReference(input.job);
        if (!reference) {
          return finish({
            outcome: "failure",
            stepKey: input.stepKey,
            attempt: input.attempt,
            error: missingReference(providerKey),
          });
        }
        await ctx.provider.createAdministrator({
          correlationId: ctx.correlationId,
          projectReference: reference,
          email: ctx.request.adminEmail,
          credentials: ctx.request.credentials,
        });
        return finish({ outcome: "success", stepKey: input.stepKey, attempt: input.attempt });
      }

      case "verify_health": {
        const reference = projectReference(input.job);
        if (!reference) {
          return finish({
            outcome: "failure",
            stepKey: input.stepKey,
            attempt: input.attempt,
            error: missingReference(providerKey),
          });
        }
        const health = await ctx.provider.verifyHealth(reference);
        if (!health.healthy) {
          return finish({
            outcome: "failure",
            stepKey: input.stepKey,
            attempt: input.attempt,
            error: providerError("health_check_failed", "Tenant health check did not pass.", {
              retryable: true,
              providerKey,
            }),
          });
        }
        return finish({ outcome: "success", stepKey: input.stepKey, attempt: input.attempt });
      }

      default: {
        const exhaustive: never = input.stepKey;
        return finish({
          outcome: "failure",
          stepKey: input.stepKey,
          attempt: input.attempt,
          error: providerError("unknown_step", `Unknown provisioning step: ${String(exhaustive)}`, {
            retryable: false,
            providerKey,
          }),
        });
      }
    }
  } catch (cause) {
    return finish({
      outcome: "failure",
      stepKey: input.stepKey,
      attempt: input.attempt,
      error: normalize(cause, providerKey),
    });
  }
}

/**
 * Rollback coordination call. Gate 3.2.1 invokes the interface only — it makes
 * no assumption about how a provider performs teardown (Gate 3.3 owns that).
 */
export async function runRollbackAction(
  ctx: OrchestrationContext,
  input: { job: ProvisioningJob; stepKey: ProvisioningStepKey },
): Promise<ExecutionResult> {
  const providerKey = ctx.provider.capabilities.key;
  const startedAt = ctx.clock.monotonicMs();
  const reference = projectReference(input.job);

  if (!reference) {
    return {
      outcome: "skipped",
      stepKey: input.stepKey,
      attempt: 0,
      durationMs: 0,
    };
  }

  try {
    await ctx.provider.destroyProject({
      correlationId: ctx.correlationId,
      projectReference: reference,
      credentials: ctx.request.credentials,
    });
    return {
      outcome: "success",
      stepKey: input.stepKey,
      attempt: 0,
      durationMs: Math.max(0, ctx.clock.monotonicMs() - startedAt),
    };
  } catch (cause) {
    return {
      outcome: "failure",
      stepKey: input.stepKey,
      attempt: 0,
      durationMs: Math.max(0, ctx.clock.monotonicMs() - startedAt),
      error: normalize(cause, providerKey),
    };
  }
}

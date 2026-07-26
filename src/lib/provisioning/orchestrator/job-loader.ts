/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Job loader.
 *
 * Repository abstraction only — no SQL, no client. Validates that the loaded
 * job is coherent with the orchestration context before anything executes.
 */
import { validationError } from "../errors";
import { isProvisioningState } from "../lifecycle";
import type { ProvisioningJob, ProvisioningStep } from "../types";
import type { OrchestrationContext } from "./context";
import { errResult, okResult, type OrchestratorResult } from "./types";

export interface LoadedJob {
  job: ProvisioningJob;
  steps: ProvisioningStep[];
}

export async function loadJob(
  ctx: OrchestrationContext,
): Promise<OrchestratorResult<LoadedJob>> {
  const job = await ctx.repository.loadJob(ctx.jobId);

  if (!job) {
    return errResult(
      validationError("job_not_found", "Provisioning job does not exist.", {
        job_id: ctx.jobId,
      }),
    );
  }
  if (job.tenant_id !== ctx.tenantId) {
    return errResult(
      validationError("job_tenant_mismatch", "Job does not belong to the context tenant.", {
        job_id: job.id,
      }),
    );
  }
  if (!job.correlation_id || job.correlation_id !== ctx.correlationId) {
    return errResult(
      validationError(
        "correlation_id_mismatch",
        "Job correlation_id does not match the orchestration context.",
        { job_id: job.id },
      ),
    );
  }
  if (!isProvisioningState(job.state)) {
    return errResult(
      validationError("job_state_invalid", "Job carries an unknown lifecycle state.", {
        state: job.state,
      }),
    );
  }

  const steps = await ctx.repository.loadSteps(job.id);
  const foreign = steps.find((s) => s.correlation_id !== ctx.correlationId);
  if (foreign) {
    return errResult(
      validationError(
        "step_correlation_id_mismatch",
        "A persisted step carries a different correlation_id.",
        { step_key: foreign.step_key },
      ),
    );
  }

  return okResult({ job, steps });
}

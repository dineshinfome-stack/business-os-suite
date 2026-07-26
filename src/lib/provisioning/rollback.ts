/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Rollback policy (pure).
 *
 * Planning only. No provider execution, no infrastructure calls.
 */
import { PROVISIONING_STEP_SEQUENCE } from "./constants";
import type { ProvisioningState } from "./lifecycle";
import type {
  OrphanedResource,
  ProviderResource,
  ProvisioningStep,
  ProvisioningStepKey,
  RollbackAction,
  RollbackPlan,
  RollbackPolicy,
} from "./types";

export const DEFAULT_ROLLBACK_POLICY: Readonly<RollbackPolicy> = Object.freeze({
  reversibleSteps: Object.freeze([
    "create_project",
    "apply_migrations",
    "seed_database",
    "create_administrator",
  ]) as readonly ProvisioningStepKey[],
  orphanHandling: "quarantine",
  continueOnStepFailure: true,
});

/** Only a failed (non-terminal) job may be rolled back. */
const ELIGIBLE_STATES: ReadonlySet<ProvisioningState> = new Set<ProvisioningState>([
  "failed",
  "retrying",
]);

export interface RollbackEligibility {
  eligible: boolean;
  reason?: string;
}

export function evaluateRollbackEligibility(state: ProvisioningState): RollbackEligibility {
  if (ELIGIBLE_STATES.has(state)) return { eligible: true };
  if (state === "rolled_back") {
    return { eligible: false, reason: "Job has already been rolled back." };
  }
  if (state === "completed") {
    return { eligible: false, reason: "Completed jobs are deprovisioned, not rolled back." };
  }
  if (state === "cancelled") {
    return { eligible: false, reason: "Cancelled jobs have no rollback path." };
  }
  return { eligible: false, reason: `Job is still in flight (state: ${state}).` };
}

/** Classify provider resources that survive a rollback. */
export function classifyOrphans(
  resources: readonly ProviderResource[],
  policy: RollbackPolicy = DEFAULT_ROLLBACK_POLICY,
  detectedAt: string = new Date().toISOString(),
): OrphanedResource[] {
  return resources
    .filter((r) => !policy.reversibleSteps.includes(r.step_key))
    .map((r) => ({ ...r, detected_at: detectedAt, handling: policy.orphanHandling }));
}

/**
 * Build a rollback plan: completed/failed steps reversed in strict descending
 * sequence order.
 */
export function buildRollbackPlan(input: {
  jobId: string;
  correlationId: string;
  state: ProvisioningState;
  steps: readonly ProvisioningStep[];
  resources?: readonly ProviderResource[];
  policy?: RollbackPolicy;
  detectedAt?: string;
}): RollbackPlan {
  const policy = input.policy ?? DEFAULT_ROLLBACK_POLICY;
  const eligibility = evaluateRollbackEligibility(input.state);

  const actions: RollbackAction[] = input.steps
    .filter((s) => s.status === "succeeded" || s.status === "failed")
    .map((s) => ({
      step_key: s.step_key,
      sequence: s.sequence || PROVISIONING_STEP_SEQUENCE[s.step_key],
      reversible: policy.reversibleSteps.includes(s.step_key),
      orphanHandling: policy.orphanHandling,
    }))
    .sort((a, b) => b.sequence - a.sequence);

  return {
    job_id: input.jobId,
    correlation_id: input.correlationId,
    eligible: eligibility.eligible,
    ...(eligibility.reason ? { reason: eligibility.reason } : {}),
    actions: eligibility.eligible ? actions : [],
    orphans: classifyOrphans(input.resources ?? [], policy, input.detectedAt),
  };
}

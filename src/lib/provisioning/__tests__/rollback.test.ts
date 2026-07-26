import { describe, expect, it } from "vitest";
import { PROVISIONING_STATES } from "../lifecycle";
import {
  DEFAULT_ROLLBACK_POLICY,
  buildRollbackPlan,
  classifyOrphans,
  evaluateRollbackEligibility,
} from "../rollback";
import type { ProvisioningStep } from "../types";

const step = (
  key: ProvisioningStep["step_key"],
  sequence: number,
  status: ProvisioningStep["status"],
): ProvisioningStep => ({
  id: `s-${key}`,
  job_id: "job-1",
  step_key: key,
  sequence,
  status,
  attempt_count: 1,
  correlation_id: "corr-1",
  error: null,
  started_at: null,
  completed_at: null,
  duration_ms: null,
});

describe("rollback eligibility", () => {
  it("is eligible only from failed and retrying", () => {
    for (const s of PROVISIONING_STATES) {
      const eligible = s === "failed" || s === "retrying";
      expect(evaluateRollbackEligibility(s).eligible, s).toBe(eligible);
      if (!eligible) expect(evaluateRollbackEligibility(s).reason).toBeTruthy();
    }
  });
});

describe("rollback planning", () => {
  it("reverses completed and failed steps in descending sequence", () => {
    const plan = buildRollbackPlan({
      jobId: "job-1",
      correlationId: "corr-1",
      state: "failed",
      steps: [
        step("validate", 1, "succeeded"),
        step("create_project", 2, "succeeded"),
        step("apply_migrations", 3, "failed"),
        step("seed_database", 4, "pending"),
      ],
    });
    expect(plan.eligible).toBe(true);
    expect(plan.actions.map((a) => a.step_key)).toEqual([
      "apply_migrations",
      "create_project",
      "validate",
    ]);
    expect(plan.actions[2].reversible).toBe(false); // validate is not reversible
    expect(plan.actions[1].reversible).toBe(true);
    expect(plan.correlation_id).toBe("corr-1");
  });

  it("produces an empty action list when ineligible", () => {
    const plan = buildRollbackPlan({
      jobId: "job-1",
      correlationId: "corr-1",
      state: "completed",
      steps: [step("create_project", 2, "succeeded")],
    });
    expect(plan.eligible).toBe(false);
    expect(plan.actions).toEqual([]);
    expect(plan.reason).toMatch(/deprovisioned/);
  });

  it("classifies orphans from non-reversible steps", () => {
    const orphans = classifyOrphans(
      [
        { kind: "log", reference: "r1", step_key: "verify_health" },
        { kind: "project", reference: "r2", step_key: "create_project" },
      ],
      DEFAULT_ROLLBACK_POLICY,
      "2026-07-26T00:00:00.000Z",
    );
    expect(orphans).toHaveLength(1);
    expect(orphans[0]).toMatchObject({
      reference: "r1",
      handling: "quarantine",
      detected_at: "2026-07-26T00:00:00.000Z",
    });
  });
});

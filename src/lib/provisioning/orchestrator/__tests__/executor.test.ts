import { describe, it, expect, vi } from "vitest";
import { createHarness, makeStep } from "./harness";
import { executeNextStep } from "../executor";
import { createOrchestrator } from "../orchestrator";

describe("executor · single step", () => {
  it("executes exactly one provider call per invocation", async () => {
    const h = createHarness({ job: { state: "provisioning_infrastructure" } });
    await executeNextStep(h.context);
    expect(h.provider.createProject).toHaveBeenCalledTimes(1);
    expect(h.provider.applyMigrations).not.toHaveBeenCalled();
  });

  it("treats transition-only states as skipped executions", async () => {
    const h = createHarness({ job: { state: "queued" } });
    const res = await executeNextStep(h.context);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.execution.outcome).toBe("skipped");
      expect(res.value.toState).toBe("provisioning_infrastructure");
    }
  });

  it("no-ops on a terminal job", async () => {
    const h = createHarness({ job: { state: "completed" } });
    const res = await executeNextStep(h.context);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.decision.action).toBe("noop");
  });
});

describe("executor · provider failure and retry", () => {
  it("moves to retrying with an advisory delay on a transient failure", async () => {
    const h = createHarness({
      job: { state: "provisioning_infrastructure" },
      provider: {
        createProject: vi.fn(async () => {
          throw new Error("boom");
        }),
      },
    });
    const res = await executeNextStep(h.context);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.execution.outcome).toBe("failure");
      expect(res.value.decision.action).toBe("retry");
      expect(res.value.decision.delayMs).toBeGreaterThan(0);
    }
    expect(h.job.state).toBe("retrying");
  });

  it("fails permanently when the error is not retryable", async () => {
    const h = createHarness({
      job: {
        state: "running_migrations",
        provider_resource_reference: {},
      },
    });
    const res = await executeNextStep(h.context);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.execution.error?.code).toBe("project_reference_missing");
      expect(res.value.decision.action).toBe("fail");
    }
    expect(h.job.state).toBe("failed");
  });

  it("fails when the retry budget is exhausted", async () => {
    const h = createHarness({
      job: { state: "verifying" },
      steps: [makeStep("verify_health", { status: "failed", attempt_count: 5 })],
      provider: {
        verifyHealth: vi.fn(async () => ({
          healthy: false,
          checked_at: "2026-07-26T00:00:00.000Z",
          checks: [],
        })),
      },
    });
    const res = await executeNextStep(h.context);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.decision.reason).toBe("budget_exhausted");
    expect(h.job.state).toBe("failed");
  });

  it("normalizes non-Error throws into a typed provider error", async () => {
    const h = createHarness({
      job: { state: "provisioning_infrastructure" },
      provider: {
        createProject: vi.fn(async () => {
          throw "string failure";
        }),
      },
    });
    const res = await executeNextStep(h.context);
    if (res.ok) {
      expect(res.value.execution.error?.kind).toBe("provider");
      expect(res.value.execution.error?.message).toBe("string failure");
    }
  });
});

describe("executor · rollback coordination", () => {
  it("builds a plan and invokes the provider interface only", async () => {
    const h = createHarness({
      job: {
        state: "failed",
        provider_resource_reference: { project_reference: "proj_mock_1" },
      },
      steps: [
        makeStep("create_project", { status: "succeeded" }),
        makeStep("apply_migrations", { status: "failed" }),
      ],
    });
    const res = await createOrchestrator(h.context).rollback();

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.eligible).toBe(true);
      expect(res.value.actions.map((a) => a.step_key)).toEqual([
        "apply_migrations",
        "create_project",
      ]);
    }
    expect(h.provider.destroyProject).toHaveBeenCalled();
    expect(h.job.state).toBe("rolled_back");
  });

  it("refuses rollback for an in-flight job", async () => {
    const h = createHarness({ job: { state: "seeding" } });
    const res = await createOrchestrator(h.context).rollback();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("rollback_not_eligible");
  });

  it("is idempotent once rolled back", async () => {
    const h = createHarness({ job: { state: "rolled_back" } });
    const res = await createOrchestrator(h.context).rollback();
    expect(res.ok).toBe(true);
  });
});

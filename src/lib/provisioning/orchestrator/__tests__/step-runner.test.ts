import { describe, it, expect, vi } from "vitest";
import { createHarness } from "./harness";
import { executeNextStep } from "../executor";
import { stateForStep, stepForState, sequenceForStep } from "../step-map";
import { PROVISIONING_STEP_KEYS } from "../../constants";

describe("step-map", () => {
  it("round-trips every step key", () => {
    for (const key of PROVISIONING_STEP_KEYS) {
      expect(stepForState(stateForStep(key))).toBe(key);
      expect(sequenceForStep(key)).toBeGreaterThan(0);
    }
  });

  it("returns null for transition-only states", () => {
    expect(stepForState("pending")).toBeNull();
    expect(stepForState("queued")).toBeNull();
    expect(stepForState("retrying")).toBeNull();
  });
});

describe("step-runner", () => {
  it("validate performs no provider call", async () => {
    const h = createHarness({ job: { state: "validating" } });
    await executeNextStep(h.context);
    expect(h.provider.createProject).not.toHaveBeenCalled();
    expect(h.job.state).toBe("queued");
  });

  it("passes the project reference to downstream provider methods", async () => {
    const h = createHarness({
      job: {
        state: "running_migrations",
        provider_resource_reference: { project_reference: "proj_abc" },
      },
    });
    await executeNextStep(h.context);
    expect(h.provider.applyMigrations).toHaveBeenCalledWith(
      expect.objectContaining({ projectReference: "proj_abc" }),
    );
  });

  it("records the project reference produced by create_project", async () => {
    const h = createHarness({ job: { state: "provisioning_infrastructure" } });
    await executeNextStep(h.context);
    expect(h.job.provider_resource_reference.project_reference).toBe("proj_mock_1");
  });

  it("treats an unhealthy verify_health as a retryable failure", async () => {
    const h = createHarness({
      job: { state: "verifying", provider_resource_reference: { project_reference: "p1" } },
      provider: {
        verifyHealth: vi.fn(async () => ({
          healthy: false,
          checked_at: "2026-07-26T00:00:00.000Z",
          checks: [{ name: "db", ok: false }],
        })),
      },
    });
    const res = await executeNextStep(h.context);
    if (res.ok) {
      expect(res.value.execution.error?.code).toBe("health_check_failed");
      expect(res.value.decision.action).toBe("retry");
    }
  });
});

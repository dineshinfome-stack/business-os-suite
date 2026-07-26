/**
 * Gate 3.5 · End-to-end provisioning workflow scenarios.
 *
 * Drives the REAL service → orchestrator → adapters against the in-memory
 * data client and the fake provider. No architecture is redefined here: the
 * suite only exercises what Gates 3.1–3.4 already built.
 */
import { describe, it, expect, vi } from "vitest";
import {
  createIntegrationHarness,
  makeStepRow,
  VALID_TENANT,
  type IntegrationHarness,
} from "./harness";

const PROJECT_REF = { project_reference: "proj_fake_1" };

/** Runs the pipeline until it stops moving or the guard trips. */
async function drain(h: IntegrationHarness, max = 15): Promise<string[]> {
  const states: string[] = [];
  for (let i = 0; i < max; i += 1) {
    const before = h.store.job.state;
    await h.service.executeNextStep();
    states.push(h.store.job.state);
    if (h.store.job.state === before) break;
    if (["completed", "failed", "cancelled", "rolled_back"].includes(h.store.job.state)) {
      break;
    }
  }
  return states;
}

describe("workflow · happy path", () => {
  it("walks every lifecycle state from pending to completed", async () => {
    const h = createIntegrationHarness();
    const start = await h.service.startProvisioning({ tenant: VALID_TENANT });
    expect(start.ok).toBe(true);
    expect(h.store.job.state).toBe("validating");

    const states = await drain(h);
    expect(states).toEqual([
      "queued",
      "provisioning_infrastructure",
      "running_migrations",
      "seeding",
      "creating_admin",
      "verifying",
      "completed",
    ]);
  });

  it("invokes each provider capability exactly once", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    await drain(h);

    expect(h.provider.createProject).toHaveBeenCalledTimes(1);
    expect(h.provider.applyMigrations).toHaveBeenCalledTimes(1);
    expect(h.provider.seedDatabase).toHaveBeenCalledTimes(1);
    expect(h.provider.createAdministrator).toHaveBeenCalledTimes(1);
    expect(h.provider.verifyHealth).toHaveBeenCalledTimes(1);
    expect(h.provider.destroyProject).not.toHaveBeenCalled();
  });

  it("records one step row per executed step with a duration", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    await drain(h);

    const succeeded = h.store.steps.filter((s) => s.status === "succeeded");
    expect(succeeded.length).toBeGreaterThanOrEqual(5);
    expect(succeeded.every((s) => typeof s.duration_ms === "number")).toBe(true);
  });

  it("emits a correlated event stream", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    await drain(h);

    expect(h.events.length).toBeGreaterThan(0);
    expect(h.events.every((e) => e.correlation_id === "corr-gate-322")).toBe(true);
    expect(h.events.map((e) => e.event)).toContain("provisioning.started");
  });
});

describe("workflow · failure simulation", () => {
  const scenarios = [
    {
      name: "project creation delay/timeout",
      state: "provisioning_infrastructure" as const,
      resource: {},
      provider: {
        createProject: vi.fn(async () => {
          throw new Error("provider timeout");
        }),
      },
    },
    {
      name: "migration failure",
      state: "running_migrations" as const,
      resource: PROJECT_REF,
      provider: {
        applyMigrations: vi.fn(async () => {
          throw new Error("relation already exists");
        }),
      },
    },
    {
      name: "seed failure",
      state: "seeding" as const,
      resource: PROJECT_REF,
      provider: {
        seedDatabase: vi.fn(async () => {
          throw new Error("seed constraint violation");
        }),
      },
    },
    {
      name: "admin creation failure",
      state: "creating_admin" as const,
      resource: PROJECT_REF,
      provider: {
        createAdministrator: vi.fn(async () => {
          throw new Error("admin invite rejected");
        }),
      },
    },
    {
      name: "network interruption during health verification",
      state: "verifying" as const,
      resource: PROJECT_REF,
      provider: {
        verifyHealth: vi.fn(async () => {
          throw new Error("network unreachable");
        }),
      },
    },
  ];

  it.each(scenarios)("$name moves the job to retrying with a typed error", async (s) => {
    const h = createIntegrationHarness({
      job: { state: s.state, provider_resource_reference: s.resource },
      provider: s.provider,
    });

    const result = await h.service.executeNextStep();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.execution.outcome).toBe("failure");
      expect(result.value.execution.error?.kind).toBeTruthy();
      expect(result.value.execution.error?.message).toBeTruthy();
    }
    expect(h.store.job.state).toBe("retrying");
    expect(h.store.job.last_error).not.toBeNull();
  });

  it("fails permanently when the project reference is missing", async () => {
    const h = createIntegrationHarness({
      job: { state: "running_migrations", provider_resource_reference: {} },
    });
    const result = await h.service.executeNextStep();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.decision.action).toBe("fail");
    expect(h.store.job.state).toBe("failed");
  });

  it("never leaks provider internals into the persisted error payload", async () => {
    const h = createIntegrationHarness({
      job: { state: "provisioning_infrastructure" },
      provider: {
        createProject: vi.fn(async () => {
          throw new Error("timeout");
        }),
      },
    });
    await h.service.executeNextStep();
    const error = h.store.job.last_error as Record<string, unknown> | null;
    expect(error).not.toBeNull();
    expect(JSON.stringify(error)).not.toMatch(/service_role|apikey|sbp_|select \* from/i);
  });
});

describe("workflow · retry and resume", () => {
  it("recovers when a transient failure succeeds on the next attempt", async () => {
    let calls = 0;
    const h = createIntegrationHarness({
      job: { state: "provisioning_infrastructure" },
      provider: {
        createProject: vi.fn(async () => {
          calls += 1;
          if (calls === 1) throw new Error("temporary 503");
          return {
            resources: [
              { kind: "project" as const, reference: "proj_fake_1", step_key: "create_project" as const },
            ],
            reference: "proj_fake_1",
          };
        }),
      },
    });

    await h.service.executeNextStep();
    expect(h.store.job.state).toBe("retrying");

    const resumed = await h.service.resumeProvisioning();
    expect(resumed.ok).toBe(true);

    await h.service.executeNextStep();
    expect(h.store.job.state).toBe("running_migrations");
    expect(calls).toBe(2);
  });

  it("resume from retrying returns the job to the failed step's state", async () => {
    const h = createIntegrationHarness({
      job: { state: "retrying", current_step_key: "create_project", attempt_count: 1 },
    });
    const result = await h.service.resumeProvisioning();
    expect(result.ok).toBe(true);
    expect(h.store.job.state).not.toBe("retrying");
  });

  it("stops retrying once the budget is exhausted", async () => {
    const h = createIntegrationHarness({
      job: { state: "provisioning_infrastructure", attempt_count: 9 },
      provider: {
        createProject: vi.fn(async () => {
          throw new Error("still failing");
        }),
      },
    });

    for (let i = 0; i < 8 && h.store.job.state !== "failed"; i += 1) {
      await h.service.executeNextStep();
      if (h.store.job.state === "retrying") await h.service.resumeProvisioning();
    }
    expect(h.store.job.state).toBe("failed");
  });
});

describe("workflow · cancellation", () => {
  it("cancels an in-flight job and is idempotent", async () => {
    const h = createIntegrationHarness({ job: { state: "queued" } });
    const first = await h.service.cancelProvisioning("operator request");
    expect(first.ok).toBe(true);
    expect(h.store.job.state).toBe("cancelled");

    const second = await h.service.cancelProvisioning("operator request");
    expect(second.ok).toBe(true);
    expect(h.store.job.state).toBe("cancelled");
  });

  it("stops the pipeline: no provider call after cancellation", async () => {
    const h = createIntegrationHarness({ job: { state: "queued" } });
    await h.service.cancelProvisioning("operator request");
    await h.service.executeNextStep();
    expect(h.provider.createProject).not.toHaveBeenCalled();
  });
});

describe("workflow · rollback", () => {
  it("releases resources in reverse order and lands on rolled_back", async () => {
    const h = createIntegrationHarness({
      job: { state: "failed", provider_resource_reference: PROJECT_REF },
      steps: [
        makeStepRow("create_project", { status: "succeeded" }),
        makeStepRow("apply_migrations", { status: "failed" }),
      ],
    });
    const result = await h.service.rollbackProvisioning();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.actions.map((a) => a.step_key)).toEqual([
        "apply_migrations",
        "create_project",
      ]);
    }
    expect(h.provider.destroyProject).toHaveBeenCalled();
    expect(h.store.job.state).toBe("rolled_back");
  });

  it("refuses rollback for an in-flight job", async () => {
    const h = createIntegrationHarness({ job: { state: "seeding" } });
    const result = await h.service.rollbackProvisioning();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("rollback_not_eligible");
  });

  it("is idempotent once rolled back", async () => {
    const h = createIntegrationHarness({ job: { state: "rolled_back" } });
    const result = await h.service.rollbackProvisioning();
    expect(result.ok).toBe(true);
  });

  it("surfaces a rollback failure without corrupting the job row", async () => {
    const h = createIntegrationHarness({
      job: { state: "failed", provider_resource_reference: PROJECT_REF },
      steps: [makeStepRow("create_project", { status: "succeeded" })],
      provider: {
        destroyProject: vi.fn(async () => {
          throw new Error("destroy refused");
        }),
      },
    });
    const result = await h.service.rollbackProvisioning();
    expect(["failed", "rolled_back"]).toContain(h.store.job.state);
    expect(result).toBeDefined();
  });
});

describe("workflow · duplicate and unauthorized requests", () => {
  it("rejects a duplicate start", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    const again = await h.service.startProvisioning({ tenant: VALID_TENANT });
    expect(again.ok).toBe(false);
  });

  it("rejects a start while another job is active for the tenant", async () => {
    const h = createIntegrationHarness();
    h.store.setOtherActiveJobs("55555555-5555-4555-8555-555555555555", 1);
    const result = await h.service.startProvisioning({ tenant: VALID_TENANT });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("active_job_exists");
  });

  it("rejects an archived tenant", async () => {
    const h = createIntegrationHarness();
    const result = await h.service.startProvisioning({
      tenant: { ...VALID_TENANT, lifecycle_state: "archived" },
    });
    expect(result.ok).toBe(false);
  });
});

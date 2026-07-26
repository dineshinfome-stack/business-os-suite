import { describe, it, expect, vi } from "vitest";
import { createHarness, makeStep } from "./harness";
import { executeNextStep } from "../executor";
import { createOrchestrator } from "../orchestrator";

describe("orchestrator · idempotency", () => {
  it("skips an already-succeeded step instead of re-running it", async () => {
    const h = createHarness({
      job: { state: "provisioning_infrastructure" },
      steps: [makeStep("create_project", { status: "succeeded", attempt_count: 1 })],
    });
    const res = await executeNextStep(h.context);

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.execution.outcome).toBe("skipped");
    expect(h.provider.createProject).not.toHaveBeenCalled();
    expect(h.job.state).toBe("running_migrations");
  });

  it("resume is a no-op on a terminal job", async () => {
    const h = createHarness({ job: { state: "cancelled" } });
    const res = await createOrchestrator(h.context).resume();
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.decision.action).toBe("noop");
  });

  it("resume re-enters the recorded step state after a retry", async () => {
    const h = createHarness({
      job: { state: "retrying", current_step_key: "seed_database" },
    });
    const res = await createOrchestrator(h.context).resume();
    expect(res.ok).toBe(true);
    expect(h.job.state).toBe("seeding");
  });

  it("resume rejects a retrying job with no recorded step", async () => {
    const h = createHarness({ job: { state: "retrying", current_step_key: null } });
    const res = await createOrchestrator(h.context).resume();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("resume_target_unknown");
  });

  it("repeated resume from mid-flight never re-runs completed work", async () => {
    const h = createHarness({
      job: { state: "seeding", provider_resource_reference: { project_reference: "p1" } },
      steps: [
        makeStep("create_project", { status: "succeeded" }),
        makeStep("apply_migrations", { status: "succeeded" }),
      ],
    });
    const o = createOrchestrator(h.context);
    await o.resume();
    await o.resume();

    expect(h.provider.createProject).not.toHaveBeenCalled();
    expect(h.provider.applyMigrations).not.toHaveBeenCalled();
    expect(h.provider.seedDatabase).toHaveBeenCalledTimes(1);
  });
});

describe("orchestrator · risk D1", () => {
  it("no write path targets tenants.provisioning_status", async () => {
    const h = createHarness({ job: { state: "provisioning_infrastructure" } });
    await executeNextStep(h.context);

    const payloads = JSON.stringify([h.transitions, h.stepWrites, h.claims]);
    expect(payloads).not.toContain("provisioning_status");
    expect(payloads).not.toContain("tenants");
  });

  it("never writes a step outcome for a step it did not claim", async () => {
    const h = createHarness({
      job: { state: "creating_admin", provider_resource_reference: { project_reference: "p1" } },
      provider: { createAdministrator: vi.fn(async () => ({ userId: "u" })) },
    });
    await executeNextStep(h.context);
    const claimed = new Set(h.claims.map((c) => c.stepKey));
    for (const w of h.stepWrites) expect(claimed.has(w.stepKey)).toBe(true);
  });
});

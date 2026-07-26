import { describe, it, expect } from "vitest";
import {
  CORRELATION_ID,
  JOB_ID,
  NOW,
  TENANT_ID,
  VALID_TENANT,
  createIntegrationHarness,
} from "./harness";

describe("integration · end-to-end orchestration", () => {
  it("drives a job from pending to completed through the real adapters", async () => {
    const h = createIntegrationHarness();

    const started = await h.service.startProvisioning({ tenant: VALID_TENANT });
    expect(started.ok).toBe(true);
    expect(h.store.job.state).toBe("validating");
    expect(h.store.job.started_at).toBe(NOW);

    for (let i = 0; i < 20 && h.store.job.state !== "completed"; i += 1) {
      const step = await h.service.executeNextStep();
      expect(step.ok, JSON.stringify(step)).toBe(true);
    }

    expect(h.store.job.state).toBe("completed");
    expect(h.store.job.completed_at).toBe(NOW);

    expect(h.provider.createProject).toHaveBeenCalledTimes(1);
    expect(h.provider.applyMigrations).toHaveBeenCalledTimes(1);
    expect(h.provider.seedDatabase).toHaveBeenCalledTimes(1);
    expect(h.provider.createAdministrator).toHaveBeenCalledTimes(1);
    expect(h.provider.verifyHealth).toHaveBeenCalledTimes(1);

    const succeeded = h.store.steps.filter((s) => s.status === "succeeded");
    expect(succeeded.length).toBeGreaterThanOrEqual(5);

    expect(h.events.map((e) => e.event)).toContain("provisioning.started");
    expect(h.events.map((e) => e.event)).toContain("provisioning.completed");
  });

  it("persists provider resources on the job without touching tenant status", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    for (let i = 0; i < 20 && h.store.job.state !== "completed"; i += 1) {
      await h.service.executeNextStep();
    }

    expect(h.store.job.provider_resource_reference).toMatchObject({
      project_reference: "proj_fake_1",
    });
    for (const update of h.store.updates) {
      expect(Object.keys(update.patch)).not.toContain("provisioning_status");
    }
  });

  it("commits persistence before emitting the matching event", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });

    const persistIndex = h.journal.findIndex((e) => e.startsWith("persist:pending->"));
    const eventIndex = h.journal.findIndex((e) => e === "event:provisioning.started");

    expect(persistIndex).toBeGreaterThanOrEqual(0);
    expect(eventIndex).toBeGreaterThan(persistIndex);
  });

  it("keeps persistence committed and returns a warning when events fail", async () => {
    const h = createIntegrationHarness({ failEvents: true });
    const started = await h.service.startProvisioning({ tenant: VALID_TENANT });

    expect(started.ok).toBe(true);
    expect(h.store.job.state).toBe("validating");
    if (started.ok) expect(started.warnings.length).toBeGreaterThan(0);
    expect(h.events).toHaveLength(0);
  });

  it("emits no event when nothing was persisted", async () => {
    const h = createIntegrationHarness({ job: { state: "cancelled" } });
    const noop = await h.service.cancelProvisioning("already cancelled");

    expect(noop.ok).toBe(true);
    expect(h.store.updates).toHaveLength(0);
    expect(h.events).toHaveLength(0);
  });

  it("cancels a job and emits provisioning.cancelled", async () => {
    const h = createIntegrationHarness({ job: { state: "provisioning_infrastructure" } });
    const result = await h.service.cancelProvisioning("operator abort");

    expect(result.ok).toBe(true);
    expect(h.store.job.state).toBe("cancelled");
    expect(h.store.job.completed_at).toBe(NOW);
    expect(h.events.map((e) => e.event)).toEqual(["provisioning.cancelled"]);
  });

  it("resumes a terminal job as a no-op", async () => {
    const h = createIntegrationHarness({ job: { state: "completed" } });
    const result = await h.service.resumeProvisioning();
    expect(result.ok).toBe(true);
    expect(h.store.updates).toHaveLength(0);
  });

  it("coordinates rollback through the provider and persists step outcomes", async () => {
    const h = createIntegrationHarness({ job: { state: "failed" } });
    const result = await h.service.rollbackProvisioning();

    expect(result.ok, JSON.stringify(result)).toBe(true);
    if (result.ok) {
      expect(result.value.job_id).toBe(JOB_ID);
      expect(result.value.correlation_id).toBe(CORRELATION_ID);
    }
    expect(h.store.job.state).toBe("rolled_back");
    expect(h.store.job.tenant_id).toBe(TENANT_ID);
    expect(h.events.map((e) => e.event)).toContain("provisioning.rolled_back");
  });
});

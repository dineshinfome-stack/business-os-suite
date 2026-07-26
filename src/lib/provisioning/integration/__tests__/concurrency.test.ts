import { describe, it, expect } from "vitest";
import { VALID_TENANT, createIntegrationHarness } from "./harness";

describe("integration · optimistic concurrency", () => {
  it("produces one winner and one OptimisticConcurrencyFailure for a shared transition", async () => {
    const h = createIntegrationHarness();

    const [a, b] = await Promise.all([
      h.service.startProvisioning({ tenant: VALID_TENANT }),
      h.service.startProvisioning({ tenant: VALID_TENANT }),
    ]);

    const winners = [a, b].filter((r) => r.ok);
    const losers = [a, b].filter((r) => !r.ok);

    expect(winners).toHaveLength(1);
    expect(losers).toHaveLength(1);
    const loser = losers[0];
    if (!loser.ok) {
      expect(["concurrency_conflict", "job_already_started"]).toContain(loser.error.code);
    }
    expect(h.store.job.state).toBe("validating");
    expect(h.store.updates).toHaveLength(1);
  });

  it("never invokes the provider twice for the same step", async () => {
    const h = createIntegrationHarness({ job: { state: "provisioning_infrastructure" } });

    const results = await Promise.all([
      h.service.executeNextStep(),
      h.service.executeNextStep(),
    ]);

    expect(h.provider.createProject).toHaveBeenCalledTimes(1);
    expect(h.store.claims.filter((c) => c.stepKey === "create_project")).toHaveLength(1);
    expect(results.filter((r) => r.ok).length).toBeGreaterThanOrEqual(1);
  });

  it("rejects a transition when the row moved underneath the orchestrator", async () => {
    const h = createIntegrationHarness({ job: { state: "verifying" } });
    h.store.setJobState("cancelled");

    const result = await h.service.executeNextStep();
    // Terminal job: execution is a no-op, no provider call, no writes.
    expect(result.ok).toBe(true);
    expect(h.provider.verifyHealth).not.toHaveBeenCalled();
    expect(h.store.updates).toHaveLength(0);
  });

  it("keeps step claims idempotent across repeated execution attempts", async () => {
    const h = createIntegrationHarness({ job: { state: "running_migrations" } });

    await h.service.executeNextStep();
    const stateAfterFirst = h.store.job.state;
    await h.service.executeNextStep();

    expect(stateAfterFirst).toBe("seeding");
    expect(h.provider.applyMigrations).toHaveBeenCalledTimes(1);
  });
});

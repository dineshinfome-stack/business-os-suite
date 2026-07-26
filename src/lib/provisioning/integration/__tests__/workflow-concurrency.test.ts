/**
 * Gate 3.5 · Operational validation — batches of concurrent provisioning jobs.
 *
 * Each job gets its own in-memory store and service instance, mirroring the
 * per-request composition the command facade performs. Nothing here changes
 * orchestration behaviour; it measures it.
 */
import { describe, it, expect } from "vitest";
import { createIntegrationHarness, VALID_TENANT, type IntegrationHarness } from "./harness";

const TERMINAL = ["completed", "failed", "cancelled", "rolled_back"];

async function runToCompletion(h: IntegrationHarness) {
  await h.service.startProvisioning({ tenant: VALID_TENANT });
  for (let i = 0; i < 12 && !TERMINAL.includes(h.store.job.state); i += 1) {
    await h.service.executeNextStep();
  }
  return h.store.job.state;
}

function batch(size: number): IntegrationHarness[] {
  return Array.from({ length: size }, (_, index) =>
    createIntegrationHarness({ job: { tenant_id: `tenant-${index}` } }),
  );
}

describe("operational · concurrent batches", () => {
  it.each([10, 20])("completes a batch of %i jobs", async (size) => {
    const jobs = batch(size);
    const started = Date.now();
    const states = await Promise.all(jobs.map(runToCompletion));
    const elapsed = Date.now() - started;

    expect(states.every((s) => s === "completed")).toBe(true);
    expect(jobs.every((h) => h.provider.createProject)).toBe(true);
    // Observation only — recorded in the completion report, not a hard gate.
    expect(elapsed).toBeLessThan(10_000);
  });

  it("keeps 50 queued jobs independent and ordered per job", async () => {
    const jobs = batch(50);
    await Promise.all(jobs.map(runToCompletion));

    for (const h of jobs) {
      const sequence = h.store.claims.map((c) => c.sequence);
      expect(sequence).toEqual([...sequence].sort((a, b) => a - b));
      expect(new Set(h.store.claims.map((c) => c.stepKey)).size).toBe(
        h.store.claims.length,
      );
    }
  });

  it("prevents duplicate actions when the same command is fired twice", async () => {
    const h = createIntegrationHarness({ job: { state: "provisioning_infrastructure" } });
    await Promise.all([
      h.service.executeNextStep(),
      h.service.executeNextStep(),
      h.service.executeNextStep(),
    ]);
    expect(h.provider.createProject).toHaveBeenCalledTimes(1);
    expect(h.store.claims.filter((c) => c.stepKey === "create_project")).toHaveLength(1);
  });

  it("produces exactly one cancellation write under concurrent cancels", async () => {
    const h = createIntegrationHarness({ job: { state: "queued" } });
    await Promise.all([
      h.service.cancelProvisioning("a"),
      h.service.cancelProvisioning("b"),
    ]);
    expect(h.store.job.state).toBe("cancelled");
    expect(h.store.updates.filter((u) => u.patch.state === "cancelled")).toHaveLength(1);
  });

  it("does not interleave state across jobs in a mixed batch", async () => {
    const healthy = batch(5);
    const failing = Array.from({ length: 5 }, () =>
      createIntegrationHarness({
        job: { state: "provisioning_infrastructure" },
        provider: {
          createProject: async () => {
            throw new Error("provider timeout");
          },
        },
      }),
    );

    await Promise.all([
      ...healthy.map(runToCompletion),
      ...failing.map((h) => h.service.executeNextStep()),
    ]);

    expect(healthy.every((h) => h.store.job.state === "completed")).toBe(true);
    expect(failing.every((h) => h.store.job.state === "retrying")).toBe(true);
  });
});

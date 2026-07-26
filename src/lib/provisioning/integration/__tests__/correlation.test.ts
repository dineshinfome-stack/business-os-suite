import { describe, it, expect } from "vitest";
import { CORRELATION_ID, JOB_ID, TENANT_ID, VALID_TENANT, createIntegrationHarness } from "./harness";

describe("integration · correlation propagation", () => {
  it("stamps correlation, tenant and job on every log entry", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    for (let i = 0; i < 20 && h.store.job.state !== "completed"; i += 1) {
      await h.service.executeNextStep();
    }

    expect(h.logs.length).toBeGreaterThan(0);
    for (const entry of h.logs) {
      expect(entry.fields.correlationId).toBe(CORRELATION_ID);
      expect(entry.fields.tenantId).toBe(TENANT_ID);
      expect(entry.fields.jobId).toBe(JOB_ID);
    }
  });

  it("stamps correlation on every event", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    for (let i = 0; i < 20 && h.store.job.state !== "completed"; i += 1) {
      await h.service.executeNextStep();
    }

    expect(h.events.length).toBeGreaterThan(0);
    for (const event of h.events) {
      expect(event.correlation_id).toBe(CORRELATION_ID);
      expect(event.tenant_id).toBe(TENANT_ID);
      expect(event.job_id).toBe(JOB_ID);
    }
  });

  it("stamps correlation on every persistence operation", async () => {
    const h = createIntegrationHarness();
    await h.service.startProvisioning({ tenant: VALID_TENANT });
    for (let i = 0; i < 20 && h.store.job.state !== "completed"; i += 1) {
      await h.service.executeNextStep();
    }

    expect(h.store.updates.length).toBeGreaterThan(0);
    for (const update of h.store.updates) {
      expect(update.patch.correlation_id).toBe(CORRELATION_ID);
    }
    for (const claim of h.store.claims) {
      expect(claim.correlationId).toBe(CORRELATION_ID);
      expect(claim.jobId).toBe(JOB_ID);
    }
    for (const outcome of h.store.outcomes) {
      expect(outcome.correlationId).toBe(CORRELATION_ID);
      expect(outcome.jobId).toBe(JOB_ID);
    }
  });

  it("refuses to operate on a job carrying a foreign correlation id", async () => {
    const h = createIntegrationHarness({ job: { correlation_id: "corr-other" } });
    const result = await h.service.startProvisioning({ tenant: VALID_TENANT });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("job_not_found");
    expect(h.store.updates).toHaveLength(0);
  });
});

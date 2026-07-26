import { describe, it, expect } from "vitest";
import {
  CORRELATION_ID,
  JOB_ID,
  TENANT_ID,
  createIntegrationHarness,
  createMemoryDataClient,
  createFakeProvider,
  makeStepRow,
} from "./harness";
import { createProvisioningService } from "../factory";
import { createRepositoryAdapter } from "../repository-adapter";

const request = {
  slug: "acme-corp",
  region: "eu-west-1",
  credentials: { name: "platform/provider", scope: "platform" as const },
  adminEmail: "admin@acme.test",
  migrations: [],
};

describe("integration · service construction & dependency injection", () => {
  it("assembles a service from injected dependencies", () => {
    const created = createProvisioningService({
      dataClient: createMemoryDataClient(),
      provider: createFakeProvider(),
      request,
      jobId: JOB_ID,
      tenantId: TENANT_ID,
      correlationId: CORRELATION_ID,
      actorId: "actor-1",
    });

    expect(created.ok).toBe(true);
    if (created.ok) {
      expect(created.service.identity).toEqual({
        jobId: JOB_ID,
        tenantId: TENANT_ID,
        correlationId: CORRELATION_ID,
        actorId: "actor-1",
      });
      expect(typeof created.service.startProvisioning).toBe("function");
      expect(typeof created.service.resumeProvisioning).toBe("function");
      expect(typeof created.service.executeNextStep).toBe("function");
      expect(typeof created.service.cancelProvisioning).toBe("function");
      expect(typeof created.service.rollbackProvisioning).toBe("function");
    }
  });

  it("rejects construction without a correlation id", () => {
    const created = createProvisioningService({
      dataClient: createMemoryDataClient(),
      provider: createFakeProvider(),
      request,
      jobId: JOB_ID,
      tenantId: TENANT_ID,
      correlationId: "",
      actorId: "actor-1",
    });
    expect(created.ok).toBe(false);
    if (!created.ok) expect(created.error.code).toBe("correlation_id_required");
  });

  it("rejects construction without an actor", () => {
    const created = createProvisioningService({
      dataClient: createMemoryDataClient(),
      provider: createFakeProvider(),
      request,
      jobId: JOB_ID,
      tenantId: TENANT_ID,
      correlationId: CORRELATION_ID,
      actorId: "",
    });
    expect(created.ok).toBe(false);
    if (!created.ok) expect(created.error.code).toBe("actor_required");
  });

  it("resolves the active job count from the repository when omitted", async () => {
    const h = createIntegrationHarness();
    h.store.setOtherActiveJobs(TENANT_ID, 1);

    const result = await h.service.startProvisioning({
      tenant: {
        id: TENANT_ID,
        slug: "acme-corp",
        code: "ACME",
        lifecycle_state: "active",
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("active_job_exists");
  });
});

describe("integration · repository adapter", () => {
  it("maps job and step rows into domain objects", async () => {
    const store = createMemoryDataClient({
      steps: [makeStepRow("create_project"), makeStepRow("validate")],
    });
    const repository = createRepositoryAdapter({
      dataClient: store,
      tenantId: TENANT_ID,
      correlationId: CORRELATION_ID,
    });

    const job = await repository.loadJob(JOB_ID);
    expect(job?.id).toBe(JOB_ID);
    expect(job?.state).toBe("pending");
    expect(job?.last_error).toBeNull();
    expect(job?.provider_resource_reference).toEqual({});

    const steps = await repository.loadSteps(JOB_ID);
    // Sorted by sequence, regardless of storage order.
    expect(steps.map((s) => s.step_key)).toEqual(["validate", "create_project"]);
  });

  it("returns null for an unknown job", async () => {
    const repository = createRepositoryAdapter({
      dataClient: createMemoryDataClient(),
      tenantId: TENANT_ID,
      correlationId: CORRELATION_ID,
    });
    expect(await repository.loadJob("00000000-0000-4000-8000-000000000000")).toBeNull();
  });

  it("refuses a job belonging to another tenant", async () => {
    const repository = createRepositoryAdapter({
      dataClient: createMemoryDataClient(),
      tenantId: "99999999-9999-4999-8999-999999999999",
      correlationId: CORRELATION_ID,
    });
    expect(await repository.loadJob(JOB_ID)).toBeNull();
  });

  it("refuses a job carrying a foreign correlation id", async () => {
    const repository = createRepositoryAdapter({
      dataClient: createMemoryDataClient(),
      tenantId: TENANT_ID,
      correlationId: "corr-other",
    });
    expect(await repository.loadJob(JOB_ID)).toBeNull();
  });

  it("rejects rows with an unknown lifecycle state", async () => {
    const store = createMemoryDataClient({
      job: { state: "not_a_state" as never },
    });
    const repository = createRepositoryAdapter({
      dataClient: store,
      tenantId: TENANT_ID,
      correlationId: CORRELATION_ID,
    });
    await expect(repository.loadJob(JOB_ID)).rejects.toThrow(/unknown lifecycle state/i);
  });
});

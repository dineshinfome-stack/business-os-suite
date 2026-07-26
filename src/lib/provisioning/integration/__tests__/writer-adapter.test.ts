import { describe, it, expect } from "vitest";
import {
  CORRELATION_ID,
  JOB_ID,
  NOW,
  TENANT_ID,
  createMemoryDataClient,
  createRecordingLogger,
  makeStepRow,
  type RecordedLog,
} from "./harness";
import { createWriterAdapter, foldResources } from "../writer-adapter";

const writer = (store = createMemoryDataClient(), logs: RecordedLog[] = []) =>
  createWriterAdapter({
    dataClient: store,
    tenantId: TENANT_ID,
    logger: createRecordingLogger(logs),
  });

describe("integration · writer adapter", () => {
  it("commits a transition when the expected state matches", async () => {
    const store = createMemoryDataClient();
    const ok = await writer(store).transitionState({
      jobId: JOB_ID,
      expectedState: "pending",
      nextState: "validating",
      correlationId: CORRELATION_ID,
      at: NOW,
    });

    expect(ok).toBe(true);
    expect(store.job.state).toBe("validating");
    expect(store.job.last_transition_at).toBe(NOW);
    expect(store.job.started_at).toBe(NOW);
  });

  it("refuses a transition when the expected state was lost", async () => {
    const store = createMemoryDataClient({ job: { state: "queued" } });
    const ok = await writer(store).transitionState({
      jobId: JOB_ID,
      expectedState: "pending",
      nextState: "validating",
      correlationId: CORRELATION_ID,
      at: NOW,
    });

    expect(ok).toBe(false);
    expect(store.job.state).toBe("queued");
    expect(store.updates).toHaveLength(0);
  });

  it("records a terminal completion timestamp when the job rolls back", async () => {
    const store = createMemoryDataClient({ job: { state: "failed" } });
    await writer(store).transitionState({
      jobId: JOB_ID,
      expectedState: "failed",
      nextState: "rolled_back",
      correlationId: CORRELATION_ID,
      at: NOW,
    });
    expect(store.job.completed_at).toBe(NOW);
  });

  it("persists attempt counts, errors and failure details", async () => {
    const store = createMemoryDataClient({ job: { state: "seeding" } });
    await writer(store).transitionState({
      jobId: JOB_ID,
      expectedState: "seeding",
      nextState: "failed",
      correlationId: CORRELATION_ID,
      at: NOW,
      attemptCount: 3,
      error: {
        kind: "provider",
        code: "provider_unavailable",
        message: "boom",
        retryable: true,
      },
    });

    expect(store.job.state).toBe("failed");
    expect(store.job.attempt_count).toBe(3);
    // `failed` is recoverable, not terminal — no completion timestamp yet.
    expect(store.job.completed_at).toBeNull();
    expect(store.job.last_error).toMatchObject({ code: "provider_unavailable" });
  });

  it("never writes tenants.provisioning_status", async () => {
    const store = createMemoryDataClient();
    await writer(store).transitionState({
      jobId: JOB_ID,
      expectedState: "pending",
      nextState: "validating",
      correlationId: CORRELATION_ID,
      at: NOW,
    });
    for (const update of store.updates) {
      expect(JSON.stringify(update.patch)).not.toContain("provisioning_status");
    }
  });

  it("claims a pending step and rejects a second claim", async () => {
    const store = createMemoryDataClient({ steps: [makeStepRow("create_project")] });
    const w = writer(store);
    const claim = {
      jobId: JOB_ID,
      stepKey: "create_project" as const,
      sequence: 2,
      status: "running" as const,
      correlationId: CORRELATION_ID,
      attempt: 1,
      at: NOW,
    };

    expect(await w.claimStep(claim)).toBe(true);
    expect(await w.claimStep({ ...claim, attempt: 2 })).toBe(false);
    expect(store.claims).toHaveLength(1);
  });

  it("re-claims a failed step for retry", async () => {
    const store = createMemoryDataClient({
      steps: [makeStepRow("create_project", { status: "failed" })],
    });
    const claimed = await writer(store).claimStep({
      jobId: JOB_ID,
      stepKey: "create_project",
      sequence: 2,
      status: "running",
      correlationId: CORRELATION_ID,
      attempt: 2,
      at: NOW,
    });
    expect(claimed).toBe(true);
  });

  it("writes terminal step outcomes with duration and error", async () => {
    const store = createMemoryDataClient();
    await writer(store).writeStep({
      jobId: JOB_ID,
      stepKey: "verify_health",
      sequence: 6,
      status: "failed",
      correlationId: CORRELATION_ID,
      attempt: 2,
      at: NOW,
      durationMs: 42,
      error: { kind: "provider", code: "unhealthy", message: "no", retryable: false },
    });

    const row = store.steps.find((s) => s.step_key === "verify_health");
    expect(row?.status).toBe("failed");
    expect(row?.duration_ms).toBe(42);
    expect(row?.attempt_count).toBe(2);
    expect(row?.error).toMatchObject({ code: "unhealthy" });
    expect(store.outcomes[0].correlationId).toBe(CORRELATION_ID);
  });

  it("persists rollback records as step outcomes", async () => {
    const store = createMemoryDataClient();
    await writer(store).writeStep({
      jobId: JOB_ID,
      stepKey: "create_project",
      sequence: 2,
      status: "rolled_back",
      correlationId: CORRELATION_ID,
      attempt: 0,
      at: NOW,
    });
    expect(store.steps.find((s) => s.step_key === "create_project")?.status).toBe(
      "rolled_back",
    );
  });

  it("folds provider resources into a reference map", () => {
    expect(foldResources(undefined)).toBeUndefined();
    expect(foldResources([])).toBeUndefined();
    expect(
      foldResources([
        { kind: "project", reference: "proj_1", step_key: "create_project" },
        { kind: "database", reference: "db_1", step_key: "create_project" },
      ]),
    ).toEqual({ project_reference: "proj_1", database_reference: "db_1" });

    // Existing references are preserved, not clobbered.
    expect(
      foldResources(
        [{ kind: "database", reference: "db_2", step_key: "create_project" }],
        { project_reference: "proj_1" },
      ),
    ).toEqual({ project_reference: "proj_1", database_reference: "db_2" });
  });

  it("logs every write with correlation, tenant and job context", async () => {
    const logs: RecordedLog[] = [];
    const store = createMemoryDataClient();
    await writer(store, logs).transitionState({
      jobId: JOB_ID,
      expectedState: "pending",
      nextState: "validating",
      correlationId: CORRELATION_ID,
      at: NOW,
    });

    expect(logs).not.toHaveLength(0);
    for (const entry of logs) {
      expect(entry.fields.correlationId).toBe(CORRELATION_ID);
      expect(entry.fields.tenantId).toBe(TENANT_ID);
      expect(entry.fields.jobId).toBe(JOB_ID);
    }
  });
});

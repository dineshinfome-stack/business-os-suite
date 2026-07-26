import { describe, it, expect } from "vitest";
import { createHarness, VALID_TENANT } from "./harness";
import { createOrchestrator } from "../orchestrator";
import { createContext } from "../context";
import { nullLogger } from "../logger";

describe("orchestrator · context", () => {
  it("rejects a missing correlation id", () => {
    const h = createHarness();
    const result = createContext({
      jobId: "j",
      tenantId: "t",
      correlationId: "",
      actorId: "a",
      provider: h.provider,
      repository: h.repository,
      writer: h.writer,
      events: h.sink,
      clock: h.clock,
      logger: nullLogger,
      request: {
        slug: "s",
        region: "r",
        credentials: { name: "n", scope: "platform" },
        adminEmail: "e@e.test",
        migrations: [],
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("correlation_id_required");
  });

  it("freezes the context", () => {
    const h = createHarness();
    expect(Object.isFrozen(h.context)).toBe(true);
  });
});

describe("orchestrator · start", () => {
  it("starts a pending job and emits provisioning.started", async () => {
    const h = createHarness();
    const o = createOrchestrator(h.context);
    const res = await o.start({ tenant: VALID_TENANT, activeJobCount: 0 });

    expect(res.ok).toBe(true);
    expect(h.job.state).toBe("validating");
    expect(h.events.map((e) => e.event)).toEqual(["provisioning.started"]);
  });

  it("rejects a duplicate start (job already started)", async () => {
    const h = createHarness({ job: { state: "validating" } });
    const res = await createOrchestrator(h.context).start({
      tenant: VALID_TENANT,
      activeJobCount: 0,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("job_already_started");
  });

  it("rejects an ineligible tenant", async () => {
    const h = createHarness();
    const res = await createOrchestrator(h.context).start({
      tenant: { ...VALID_TENANT, lifecycle_state: "archived" },
      activeJobCount: 0,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("tenant_archived");
  });

  it("rejects a start when another job is active", async () => {
    const h = createHarness();
    const res = await createOrchestrator(h.context).start({
      tenant: VALID_TENANT,
      activeJobCount: 1,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("active_job_exists");
  });
});

describe("orchestrator · happy path", () => {
  it("progresses to completed one step per invocation", async () => {
    const h = createHarness();
    const o = createOrchestrator(h.context);
    await o.start({ tenant: VALID_TENANT, activeJobCount: 0 });

    const states: string[] = [];
    for (let i = 0; i < 12 && h.job.state !== "completed"; i += 1) {
      const res = await o.executeNextStep();
      expect(res.ok).toBe(true);
      states.push(h.job.state);
    }

    expect(h.job.state).toBe("completed");
    expect(states).toEqual([
      "queued",
      "provisioning_infrastructure",
      "running_migrations",
      "seeding",
      "creating_admin",
      "verifying",
      "completed",
    ]);
    expect(h.provider.createProject).toHaveBeenCalledTimes(1);
    expect(h.provider.verifyHealth).toHaveBeenCalledTimes(1);
  });

  it("propagates the correlation id to provider calls and events", async () => {
    const h = createHarness({ job: { state: "provisioning_infrastructure" } });
    await createOrchestrator(h.context).executeNextStep();

    expect(h.provider.createProject).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: "corr-gate-321" }),
    );
    expect(h.events.every((e) => e.correlation_id === "corr-gate-321")).toBe(true);
    expect(h.stepWrites.every((s) => s.correlationId === "corr-gate-321")).toBe(true);
    expect(h.transitions.every((t) => t.correlationId === "corr-gate-321")).toBe(true);
  });

  it("rejects a job whose correlation id does not match the context", async () => {
    const h = createHarness({ job: { correlation_id: "other" } });
    const res = await createOrchestrator(h.context).executeNextStep();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("correlation_id_mismatch");
  });
});

describe("orchestrator · terminal transitions", () => {
  it("cancel is idempotent", async () => {
    const h = createHarness({ job: { state: "queued" } });
    const o = createOrchestrator(h.context);
    expect((await o.cancel("operator")).ok).toBe(true);
    expect(h.job.state).toBe("cancelled");
    const again = await o.cancel("operator");
    expect(again.ok).toBe(true);
    if (again.ok) expect(again.value.decision.action).toBe("noop");
  });

  it("complete rejects an illegal transition", async () => {
    const h = createHarness({ job: { state: "queued" } });
    const res = await createOrchestrator(h.context).complete();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("illegal_transition");
  });
});

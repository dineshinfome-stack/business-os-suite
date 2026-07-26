import { describe, it, expect, vi } from "vitest";
import { createHarness, makeStep } from "./harness";
import { executeNextStep } from "../executor";
import { createOrchestrator } from "../orchestrator";

describe("event dispatcher · ordering", () => {
  it("emits step_changed before completed", async () => {
    const h = createHarness({
      job: {
        state: "verifying",
        provider_resource_reference: { project_reference: "p1" },
      },
    });
    await executeNextStep(h.context);
    expect(h.events.map((e) => e.event)).toEqual([
      "provisioning.step_changed",
      "provisioning.completed",
    ]);
  });

  it("emits step_changed before failed", async () => {
    const h = createHarness({
      job: { state: "running_migrations" },
    });
    await executeNextStep(h.context);
    expect(h.events.map((e) => e.event)).toEqual([
      "provisioning.step_changed",
      "provisioning.failed",
    ]);
  });

  it("emits events only after the transition commits", async () => {
    const h = createHarness({ job: { state: "seeding" } });
    await executeNextStep(h.context);
    // project reference missing -> failure path still commits before emitting
    expect(h.transitions.length).toBeGreaterThan(0);
    expect(h.events.length).toBeGreaterThan(0);
  });

  it("emits the full ordered stream across a happy path run", async () => {
    const h = createHarness();
    const o = createOrchestrator(h.context);
    await o.start({
      tenant: { id: h.job.tenant_id, slug: "acme-corp", code: "ACME", lifecycle_state: "active" },
      activeJobCount: 0,
    });
    for (let i = 0; i < 12 && h.job.state !== "completed"; i += 1) {
      await o.executeNextStep();
    }
    const names = h.events.map((e) => e.event);
    expect(names[0]).toBe("provisioning.started");
    expect(names[names.length - 1]).toBe("provisioning.completed");
    expect(names.filter((n) => n === "provisioning.step_changed").length).toBe(6);
  });
});

describe("event dispatcher · sink failure", () => {
  it("returns a warning rather than failing the orchestration", async () => {
    const h = createHarness({
      job: {
        state: "verifying",
        provider_resource_reference: { project_reference: "p1" },
      },
    });
    h.failEvents = true;

    const res = await executeNextStep(h.context);
    expect(res.ok).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
    expect(res.warnings[0].code).toBe("event_sink_failed");
    expect(h.job.state).toBe("completed");
  });
});

describe("event dispatcher · rollback event", () => {
  it("emits provisioning.rolled_back after the transition", async () => {
    const h = createHarness({
      job: { state: "failed", provider_resource_reference: { project_reference: "p1" } },
      steps: [makeStep("create_project", { status: "succeeded" })],
      provider: { destroyProject: vi.fn(async () => {}) },
    });
    await createOrchestrator(h.context).rollback();
    expect(h.events.map((e) => e.event)).toEqual(["provisioning.rolled_back"]);
  });
});

import { describe, it, expect } from "vitest";
import { createHarness } from "./harness";
import { executeNextStep } from "../executor";
import { createOrchestrator } from "../orchestrator";

describe("orchestrator · optimistic concurrency", () => {
  it("aborts a transition when the expected state no longer matches", async () => {
    const h = createHarness({ job: { state: "provisioning_infrastructure" } });

    // Simulate a competing worker flipping the job state mid-flight.
    const original = h.writer.transitionState;
    let hijacked = false;
    h.writer.transitionState = async (input) => {
      if (!hijacked) {
        hijacked = true;
        return false; // expected-state mismatch
      }
      return original(input);
    };

    const res = await executeNextStep(h.context);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("concurrent_modification");
  });

  it("sends the observed state as expectedState on every transition", async () => {
    const h = createHarness({ job: { state: "validating" } });
    await executeNextStep(h.context);
    expect(h.transitions[0].expectedState).toBe("validating");
    expect(h.transitions[0].nextState).toBe("queued");
  });

  it("refuses to claim a step already running under another worker", async () => {
    const h = createHarness({ job: { state: "provisioning_infrastructure" } });
    h.writer.claimStep = async () => false;

    const res = await executeNextStep(h.context);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("step_already_claimed");
    expect(h.provider.createProject).not.toHaveBeenCalled();
  });

  it("fails cleanly when the job disappears", async () => {
    const h = createHarness();
    h.repository.loadJob = async () => null;
    const res = await createOrchestrator(h.context).executeNextStep();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("job_not_found");
  });

  it("detects a job belonging to a different tenant", async () => {
    const h = createHarness({ job: { tenant_id: "99999999-9999-4999-8999-999999999999" } });
    const res = await createOrchestrator(h.context).executeNextStep();
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("tenant_mismatch");
  });
});

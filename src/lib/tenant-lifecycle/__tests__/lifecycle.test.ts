import { describe, it, expect } from "vitest";
import {
  TENANT_LIFECYCLE_STATES,
  canTransition,
  assertTransition,
  nextStates,
  isTerminal,
  availableOperations,
  isOperationAvailable,
  OPERATION_SPECS,
  isLifecycleState,
} from "../lifecycle";
import { buildTimeline, mapAuditRow, mapProvisioningRow } from "../timeline";

describe("Gate 3.6 · lifecycle state machine", () => {
  it("exposes the seven operational states", () => {
    expect(TENANT_LIFECYCLE_STATES).toEqual([
      "created",
      "active",
      "suspended",
      "maintenance",
      "archived",
      "pending_deletion",
      "deleted",
    ]);
  });

  it("allows the documented transitions", () => {
    const legal: [string, string][] = [
      ["created", "active"],
      ["active", "suspended"],
      ["suspended", "active"],
      ["active", "archived"],
      ["suspended", "archived"],
      ["active", "maintenance"],
      ["maintenance", "active"],
      ["maintenance", "suspended"],
      ["maintenance", "archived"],
      ["archived", "active"],
      ["archived", "pending_deletion"],
      ["pending_deletion", "archived"],
      ["pending_deletion", "deleted"],
    ];
    for (const [from, to] of legal) {
      expect(canTransition(from as never, to as never)).toBe(true);
    }
  });

  it("rejects illegal transitions and self-transitions", () => {
    expect(canTransition("created", "deleted")).toBe(false);
    expect(canTransition("active", "deleted")).toBe(false);
    expect(canTransition("deleted", "active")).toBe(false);
    expect(canTransition("active", "active")).toBe(false);
    expect(() => assertTransition("active", "pending_deletion")).toThrow(/Illegal/);
  });

  it("treats deleted as terminal", () => {
    expect(isTerminal("deleted")).toBe(true);
    expect(nextStates("deleted")).toEqual([]);
    expect(isTerminal("archived")).toBe(false);
  });

  it("validates state strings", () => {
    expect(isLifecycleState("maintenance")).toBe(true);
    expect(isLifecycleState("purged")).toBe(false);
  });
});

describe("Gate 3.6 · operations", () => {
  it("offers maintenance only from active", () => {
    expect(isOperationAvailable("enter_maintenance", "active")).toBe(true);
    expect(isOperationAvailable("enter_maintenance", "suspended")).toBe(false);
    expect(isOperationAvailable("exit_maintenance", "maintenance")).toBe(true);
  });

  it("offers restore and deletion scheduling from archived", () => {
    const ops = availableOperations("archived").map((o) => o.operation);
    expect(ops).toContain("restore");
    expect(ops).toContain("schedule_deletion");
    expect(ops).not.toContain("delete");
  });

  it("offers delete and cancel only from pending_deletion", () => {
    const ops = availableOperations("pending_deletion").map((o) => o.operation);
    expect(ops.sort()).toEqual(["cancel_deletion", "delete"]);
  });

  it("offers nothing from the terminal state", () => {
    expect(availableOperations("deleted")).toEqual([]);
  });

  it("requires a reason for every destructive operation", () => {
    for (const spec of Object.values(OPERATION_SPECS)) {
      if (spec.destructive) expect(spec.requiresReason).toBe(true);
    }
  });

  it("targets a state reachable from every declared source state", () => {
    for (const spec of Object.values(OPERATION_SPECS)) {
      for (const from of spec.from) {
        expect(canTransition(from, spec.target)).toBe(true);
      }
    }
  });
});

describe("Gate 3.6 · unified timeline", () => {
  const audit = {
    id: "a1",
    action: "tenant.maintenance_entered",
    actor_id: "u1",
    created_at: "2026-07-20T10:00:00.000Z",
    new_values: { from_state: "active", to_state: "maintenance", reason: "patch" },
  };
  const job = {
    id: "j1",
    state: "completed",
    created_at: "2026-07-19T10:00:00.000Z",
    updated_at: "2026-07-21T10:00:00.000Z",
    requested_by: "u2",
    error_message: null,
  };

  it("maps audit rows into lifecycle entries", () => {
    const entry = mapAuditRow(audit);
    expect(entry.source).toBe("lifecycle");
    expect(entry.fromState).toBe("active");
    expect(entry.toState).toBe("maintenance");
    expect(entry.detail.reason).toBe("patch");
  });

  it("maps provisioning jobs using their latest timestamp", () => {
    const entry = mapProvisioningRow(job);
    expect(entry.source).toBe("provisioning");
    expect(entry.at).toBe("2026-07-21T10:00:00.000Z");
    expect(entry.action).toBe("provisioning.completed");
  });

  it("merges both sources newest-first", () => {
    const merged = buildTimeline([audit], [job]);
    expect(merged.map((e) => e.id)).toEqual(["job:j1", "audit:a1"]);
  });

  it("flattens non-scalar detail values so results stay serializable", () => {
    const entry = mapAuditRow({ ...audit, new_values: { extras: { a: 1 } } });
    expect(typeof entry.detail.extras).toBe("string");
  });

  it("tolerates empty sources", () => {
    expect(buildTimeline([], [])).toEqual([]);
  });
});

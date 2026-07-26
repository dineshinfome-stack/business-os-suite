import { describe, expect, it } from "vitest";
import { PROVISIONING_STATES } from "../lifecycle";
import {
  deriveTenantProvisioningStatus,
  isFailed,
  isProvisioned,
  isRunning,
  summarize,
  type TenantProvisioningStatus,
} from "../status";

/** Must stay identical to private.fn_derive_tenant_provisioning_status. */
const EXPECTED: Record<string, TenantProvisioningStatus> = {
  pending: "not_started",
  validating: "in_progress",
  queued: "in_progress",
  provisioning_infrastructure: "in_progress",
  running_migrations: "in_progress",
  seeding: "in_progress",
  creating_admin: "in_progress",
  verifying: "in_progress",
  retrying: "in_progress",
  completed: "provisioned",
  failed: "failed",
  rolled_back: "failed",
  cancelled: "not_started",
};

describe("provisioning status derivation (D1)", () => {
  it("maps every job state", () => {
    for (const s of PROVISIONING_STATES) {
      expect(deriveTenantProvisioningStatus(s), s).toBe(EXPECTED[s]);
    }
  });

  it("helpers agree with the mapping", () => {
    for (const s of PROVISIONING_STATES) {
      const status = deriveTenantProvisioningStatus(s);
      expect(isProvisioned(s)).toBe(status === "provisioned");
      expect(isFailed(s)).toBe(status === "failed");
      expect(isRunning(s)).toBe(status === "in_progress");
    }
  });

  it("summarizes state", () => {
    expect(summarize("completed")).toEqual({
      state: "completed",
      status: "provisioned",
      terminal: true,
      running: false,
    });
    expect(summarize("seeding")).toEqual({
      state: "seeding",
      status: "in_progress",
      terminal: false,
      running: true,
    });
  });
});

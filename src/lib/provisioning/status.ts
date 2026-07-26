/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Canonical provisioning status mapping.
 *
 * RISK D1 MITIGATION. `public.tenants.provisioning_status` is a DERIVED column.
 * This module is the TypeScript mirror of
 * `private.fn_derive_tenant_provisioning_status`; the database trigger is the
 * only writer. Application code must never write the column directly.
 */
import { isTerminal, type ProvisioningState } from "./lifecycle";

export type TenantProvisioningStatus =
  | "not_started"
  | "in_progress"
  | "provisioned"
  | "failed";

export function deriveTenantProvisioningStatus(
  state: ProvisioningState,
): TenantProvisioningStatus {
  switch (state) {
    case "completed":
      return "provisioned";
    case "failed":
    case "rolled_back":
      return "failed";
    case "pending":
    case "cancelled":
      return "not_started";
    default:
      return "in_progress";
  }
}

export function isProvisioned(state: ProvisioningState): boolean {
  return deriveTenantProvisioningStatus(state) === "provisioned";
}

export function isFailed(state: ProvisioningState): boolean {
  return deriveTenantProvisioningStatus(state) === "failed";
}

export function isRunning(state: ProvisioningState): boolean {
  return deriveTenantProvisioningStatus(state) === "in_progress";
}

export interface ProvisioningSummary {
  state: ProvisioningState;
  status: TenantProvisioningStatus;
  terminal: boolean;
  running: boolean;
}

export function summarize(state: ProvisioningState): ProvisioningSummary {
  return {
    state,
    status: deriveTenantProvisioningStatus(state),
    terminal: isTerminal(state),
    running: isRunning(state),
  };
}

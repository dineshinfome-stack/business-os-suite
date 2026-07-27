/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5 readiness contract tests.
 *
 * The DATABASE owns readiness truth. These tests assert the mapping layer
 * never invents, re-derives or widens it.
 */
import { describe, expect, it } from "vitest";

import {
  READINESS_CHECK_KEYS,
  READINESS_CONTRACT_VERSION,
  isActivationAllowed,
  requiresWarningAcknowledgement,
  toReadinessCheckDTO,
  toReadinessDTO,
} from "../readiness";

const checkOf = (over: Record<string, unknown> = {}) => ({
  checkKey: "primary_branch_exists",
  label: "Primary branch exists",
  classification: "mandatory",
  status: "pass",
  owningModule: "platform/branches",
  stepKey: "primary_branch",
  reasonCode: "primary_branch_present",
  reasonParams: { branchCount: 1 },
  explanation: "Primary branch exists",
  deepLink: null,
  evaluatedAt: "2026-07-27T10:00:00.000Z",
  ...over,
});

const envelope = (over: Record<string, unknown> = {}) => ({
  tenant_id: "11111111-1111-1111-1111-111111111111",
  evaluated_at: "2026-07-27T10:00:00.000Z",
  overall_status: "ready",
  contract_version: READINESS_CONTRACT_VERSION,
  observed_workflow_version: 7,
  checks: [checkOf()],
  blocking_count: 0,
  warning_count: 0,
  applicable_count: 13,
  warning_fingerprint: null,
  correlation_id: "corr-12345678",
  ...over,
});

describe("readiness contract", () => {
  it("defines exactly the 14 canonical readiness-matrix checks", () => {
    expect(READINESS_CHECK_KEYS).toHaveLength(14);
    expect(new Set(READINESS_CHECK_KEYS).size).toBe(14);
    /* Exact identifiers from PHASE3_GATE38_READINESS_MATRIX.md, in order. */
    expect([...READINESS_CHECK_KEYS]).toEqual([
      "tenant_exists",
      "provisioning_completed",
      "lifecycle_permits_onboarding",
      "organization_exists",
      "primary_branch_exists",
      "admin_invitation_valid",
      "admin_invitation_accepted",
      "admin_membership_exists",
      "admin_role_assigned",
      "required_settings_valid",
      "financial_year_present",
      "no_failed_or_blocked_step",
      "no_concurrent_activation",
      "no_data_integrity_conflict",
    ]);
  });

  it("maps the database envelope without recomputing counts", () => {
    const dto = toReadinessDTO(
      envelope({ blocking_count: 3, warning_count: 2, overall_status: "not_ready" }),
    );
    expect(dto.blockingCount).toBe(3);
    expect(dto.warningCount).toBe(2);
    expect(dto.overallStatus).toBe("not_ready");
    expect(dto.evaluationStatus).toBe("evaluated");
    expect(dto.observedWorkflowVersion).toBe(7);
    expect(dto.workflowVersion).toBe("v1");
  });

  it("falls back to not_evaluated for an unusable envelope", () => {
    const dto = toReadinessDTO(null);
    expect(dto.evaluationStatus).toBe("not_evaluated");
    expect(dto.overallStatus).toBeNull();
    expect(dto.checks).toEqual([]);
    expect(dto.applicableCount).toBe(0);
  });

  it("rejects an unknown overall status instead of widening the contract", () => {
    const dto = toReadinessDTO(envelope({ overall_status: "passed" }));
    expect(dto.overallStatus).toBeNull();
    expect(dto.evaluationStatus).toBe("not_evaluated");
  });

  it("pins an unknown check status to not_evaluated", () => {
    const check = toReadinessCheckDTO(checkOf({ status: "passed" }));
    expect(check?.status).toBe("not_evaluated");
  });

  it("drops non-scalar reason params", () => {
    const check = toReadinessCheckDTO(
      checkOf({ reasonParams: { branchCount: 1, secret: { token: "x" } } }),
    );
    expect(check?.reasonParams).toEqual({ branchCount: 1 });
  });

  it("nulls a step key that is not part of the onboarding registry", () => {
    expect(toReadinessCheckDTO(checkOf({ stepKey: "not_a_step" }))?.stepKey).toBeNull();
  });

  it("orders checks deterministically by the canonical sequence", () => {
    const dto = toReadinessDTO(
      envelope({
        checks: [
          checkOf({ checkKey: "no_data_integrity_conflict" }),
          checkOf({ checkKey: "primary_branch_exists" }),
          checkOf({ checkKey: "tenant_exists" }),
        ],
      }),
    );
    expect(dto.checks.map((c) => c.checkKey)).toEqual([
      "tenant_exists",
      "primary_branch_exists",
      "no_data_integrity_conflict",
    ]);
  });

  it("never reports negative counts", () => {
    const dto = toReadinessDTO(envelope({ blocking_count: -4, applicable_count: "x" }));
    expect(dto.blockingCount).toBe(0);
    expect(dto.applicableCount).toBe(0);
  });

  it("gates activation on blocking checks and warning acknowledgement", () => {
    const blocked = toReadinessDTO(
      envelope({ overall_status: "not_ready", blocking_count: 1 }),
    );
    const warned = toReadinessDTO(
      envelope({
        overall_status: "ready_with_warnings",
        warning_count: 1,
        warning_fingerprint: "a".repeat(64),
      }),
    );
    const ready = toReadinessDTO(envelope());

    expect(isActivationAllowed(blocked)).toBe(false);
    expect(isActivationAllowed(warned)).toBe(true);
    expect(requiresWarningAcknowledgement(warned)).toBe(true);
    expect(warned.warningFingerprint).toHaveLength(64);
    expect(requiresWarningAcknowledgement(ready)).toBe(false);
  });
});

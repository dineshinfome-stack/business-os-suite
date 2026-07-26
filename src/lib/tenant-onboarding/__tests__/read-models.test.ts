/**
 * Gate 3.8 · Pass 3.8.2 — read-model mapper assertions.
 *
 * Covers the synthetic-identity contract, registry-driven step projection,
 * readiness pinning, activity allow-listing and audit sanitization.
 */
import { describe, expect, it } from "vitest";

import { ONBOARDING_STEP_KEYS } from "@/lib/tenant-onboarding";
import {
  ONBOARDING_AUDIT_ACTIONS,
  isOnboardingAuditAction,
  mergeActivity,
  notEvaluatedReadiness,
  toAuditActivity,
  toAvailableActions,
  toDetailDTO,
  toProgressDTO,
  toStepActivity,
  toStepDTOs,
  toSummaryDTO,
  type OnboardingRowLike,
  type OnboardingStepRowLike,
  type TenantRowLike,
} from "@/lib/tenant-onboarding/server/mappers.server";

const tenant: TenantRowLike = {
  id: "11111111-1111-4111-8111-111111111111",
  display_name: "Acme Industries",
  slug: "acme",
  code: "ACME",
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-20T00:00:00.000Z",
};

const onboardingRow: OnboardingRowLike = {
  id: "22222222-2222-4222-8222-222222222222",
  tenant_id: tenant.id,
  state: "in_progress",
  version: 3,
  started_at: "2026-07-10T00:00:00.000Z",
  ready_at: null,
  activated_at: null,
  cancelled_at: null,
  blocked_at: null,
  blocked_reason_code: null,
  blocked_reason_summary: null,
  last_readiness_checked_at: "2026-07-19T00:00:00.000Z",
  last_correlation_id: null,
  created_at: "2026-07-10T00:00:00.000Z",
  updated_at: "2026-07-21T00:00:00.000Z",
};

function stepRow(
  step_key: string,
  status: string,
  overrides: Partial<OnboardingStepRowLike> = {},
): OnboardingStepRowLike {
  return {
    tenant_id: tenant.id,
    step_key,
    status,
    attempt_count: 1,
    started_at: "2026-07-11T00:00:00.000Z",
    completed_at: status === "completed" ? "2026-07-12T00:00:00.000Z" : null,
    blocked_at: null,
    failure_code: null,
    failure_summary: null,
    correlation_id: null,
    updated_at: "2026-07-12T00:00:00.000Z",
    ...overrides,
  };
}

describe("onboarding read-model mappers", () => {
  it("projects every registry step, defaulting absent rows to not_started", () => {
    const steps = toStepDTOs([]);
    expect(steps).toHaveLength(ONBOARDING_STEP_KEYS.length);
    expect(steps.map((s) => s.stepKey)).toEqual([...ONBOARDING_STEP_KEYS]);
    expect(steps.every((s) => s.status === "not_started")).toBe(true);
    expect(steps.every((s) => s.attemptCount === 0)).toBe(true);
    expect(steps.map((s) => s.sequence)).toEqual(
      steps.map((_, i) => i + 1),
    );
  });

  it("computes progress from settled steps and the first open step", () => {
    const steps = toStepDTOs([
      stepRow("provisioning_verified", "completed"),
      stepRow("organization_profile", "skipped"),
      stepRow("primary_branch", "blocked"),
    ]);
    const progress = toProgressDTO(steps);
    expect(progress.completedSteps).toBe(1);
    expect(progress.skippedSteps).toBe(1);
    expect(progress.blockedSteps).toBe(1);
    expect(progress.applicableSteps).toBe(ONBOARDING_STEP_KEYS.length);
    expect(progress.percent).toBe(20);
    expect(progress.currentStepKey).toBe("primary_branch");
  });

  it("fabricates no identity for a non-persisted workflow", () => {
    const detail = toDetailDTO(tenant, null, []);
    expect(detail.persisted).toBe(false);
    expect(detail.version).toBeNull();
    expect(detail.summary.state).toBe("not_started");
    expect(detail.summary.currentStepKey).toBeNull();
    expect(detail.summary.startedAt).toBeNull();
    expect(detail.summary.readyAt).toBeNull();
    expect(detail.summary.activatedAt).toBeNull();
    // Reuses the tenant's own persisted timestamp — never `new Date()`.
    expect(detail.summary.updatedAt).toBe(tenant.updated_at);
    expect(JSON.stringify(detail)).not.toContain(onboardingRow.id);
  });

  it("carries persisted workflow identity when the row exists", () => {
    const detail = toDetailDTO(tenant, onboardingRow, [
      stepRow("provisioning_verified", "completed"),
    ]);
    expect(detail.persisted).toBe(true);
    expect(detail.version).toBe(3);
    expect(detail.summary.state).toBe("in_progress");
    expect(detail.summary.updatedAt).toBe(onboardingRow.updated_at);
    expect(detail.summary.currentStepKey).toBe("organization_profile");
  });

  it("pins readiness to not_evaluated in this pass", () => {
    const readiness = notEvaluatedReadiness("2026-07-19T00:00:00.000Z");
    expect(readiness.evaluationStatus).toBe("not_evaluated");
    expect(readiness.overallStatus).toBeNull();
    expect(readiness.checks).toEqual([]);
    expect(readiness.blockingCount).toBe(0);
    expect(readiness.warningCount).toBe(0);

    const detail = toDetailDTO(tenant, onboardingRow, []);
    expect(detail.readiness.evaluationStatus).toBe("not_evaluated");
    expect(detail.summary.readinessOverallStatus).toBeNull();
    expect(detail.blockers).toEqual([]);
  });

  it("advertises legal transitions but enables no command", () => {
    const actions = toAvailableActions("in_progress", true);
    expect(actions.map((a) => a.intent).sort()).toEqual([
      "block",
      "cancel",
      "mark_ready",
    ]);
    expect(actions.every((a) => a.enabled === false)).toBe(true);
    expect(actions.every((a) => a.disabledReason !== null)).toBe(true);
    expect(toAvailableActions("activated", true)).toEqual([]);
  });

  it("keeps the summary free of invented blocker or invitation state", () => {
    const summary = toSummaryDTO(tenant, null, toProgressDTO(toStepDTOs([])));
    expect(summary.blockerCount).toBe(0);
    expect(summary.invitationStatus).toBe("none");
    expect(summary.readinessEvaluationStatus).toBe("not_evaluated");
    expect(summary.persisted).toBe(false);
  });

  it("drops audit rows outside the onboarding allow-list", () => {
    const entries = toAuditActivity([
      {
        id: "aaaaaaa1-0000-4000-8000-000000000001",
        action: "onboarding.activated",
        entity_type: "tenant",
        entity_id: tenant.id,
        actor_id: null,
        occurred_at: "2026-07-22T00:00:00.000Z",
        created_at: "2026-07-22T00:00:00.000Z",
      },
      {
        id: "aaaaaaa1-0000-4000-8000-000000000002",
        action: "auth.password.changed",
        entity_type: "user",
        entity_id: tenant.id,
        actor_id: null,
        occurred_at: "2026-07-23T00:00:00.000Z",
        created_at: "2026-07-23T00:00:00.000Z",
      },
    ]);
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe("onboarding.activated");
    expect(isOnboardingAuditAction("auth.password.changed")).toBe(false);
    expect(ONBOARDING_AUDIT_ACTIONS.every((a) => a.startsWith("onboarding."))).toBe(
      true,
    );
  });

  it("merges step and audit activity newest-first with stable ids", () => {
    const steps = toStepActivity([
      stepRow("organization_profile", "completed", {
        updated_at: "2026-07-15T00:00:00.000Z",
      }),
    ]);
    const audit = toAuditActivity([
      {
        id: "aaaaaaa1-0000-4000-8000-000000000003",
        action: "onboarding.readiness.evaluated",
        entity_type: "tenant",
        entity_id: tenant.id,
        actor_id: null,
        occurred_at: "2026-07-24T00:00:00.000Z",
        created_at: "2026-07-24T00:00:00.000Z",
      },
    ]);
    const merged = mergeActivity(steps, audit);
    expect(merged.map((e) => e.source)).toEqual(["audit_log", "onboarding_step"]);
    expect(merged[1].id).toBe(
      `onboarding_step:${tenant.id}:organization_profile`,
    );
    expect(merged.every((e) => !("metadata" in e))).toBe(true);
  });

  it("keeps step-only timelines available without audit entries", () => {
    const stepOnly = mergeActivity(
      toStepActivity([stepRow("primary_branch", "failed")]),
    );
    expect(stepOnly).toHaveLength(1);
    expect(stepOnly[0].tone).toBe("danger");
    expect(stepOnly[0].source).toBe("onboarding_step");
  });
});

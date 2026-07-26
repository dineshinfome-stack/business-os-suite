import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ONBOARDING_STEPS,
  ONBOARDING_STEP_KEYS,
  ONBOARDING_STEP_STATUSES,
  getOnboardingStep,
  isOnboardingStepKey,
  isOnboardingStepStatus,
} from "@/lib/tenant-onboarding/contracts";

const MATRIX = readFileSync(
  path.resolve(process.cwd(), "docs/60-engineering/PHASE3_GATE38_ONBOARDING_MATRIX.md"),
  "utf8",
);

describe("onboarding step contracts", () => {
  it("has unique step keys with contiguous sequences", () => {
    expect(new Set(ONBOARDING_STEP_KEYS).size).toBe(ONBOARDING_STEP_KEYS.length);
    expect(ONBOARDING_STEPS.map((s) => s.sequence)).toEqual(
      ONBOARDING_STEPS.map((_, i) => i + 1),
    );
  });

  it("defines the approved step-status union", () => {
    expect([...ONBOARDING_STEP_STATUSES]).toEqual([
      "not_started",
      "in_progress",
      "completed",
      "blocked",
      "failed",
      "skipped",
    ]);
    expect(isOnboardingStepStatus("failed")).toBe(true);
    expect(isOnboardingStepStatus("blocked")).toBe(true);
    expect(isOnboardingStepStatus("done")).toBe(false);
  });

  it("has no separate company step or company abstraction", () => {
    for (const key of ONBOARDING_STEP_KEYS) {
      expect(key).not.toContain("company");
    }
    expect(isOnboardingStepKey("primary_company")).toBe(false);
  });

  it("gives every step exactly one owning module and one pass", () => {
    for (const step of ONBOARDING_STEPS) {
      expect(step.owningModule.length).toBeGreaterThan(0);
      expect(step.owningModule).not.toContain(",");
      expect(step.implementationPass).toMatch(/^3\.8\.[2-7]$/);
    }
  });

  it("requires a policy reference for every non-mandatory step", () => {
    for (const step of ONBOARDING_STEPS) {
      if (step.requirement !== "mandatory") {
        expect(step.policyReference, step.key).toBeTruthy();
      }
    }
  });

  it("only allows skipping steps with a documented conditional policy", () => {
    for (const step of ONBOARDING_STEPS) {
      if (step.skippable) {
        expect(["conditional", "warning", "optional"]).toContain(step.requirement);
        expect(step.policyReference, step.key).toBeTruthy();
      }
    }
  });

  it("keeps invitation-dependent steps non-blocking before acceptance", () => {
    expect(getOnboardingStep("tenant_admin_invitation").requirement).toBe("mandatory");
    expect(getOnboardingStep("tenant_admin_membership").requirement).not.toBe("mandatory");
    expect(getOnboardingStep("roles_assigned").requirement).not.toBe("mandatory");
  });

  it("documents every step key in the onboarding matrix", () => {
    for (const key of ONBOARDING_STEP_KEYS) {
      expect(MATRIX, key).toContain(key);
    }
    expect(MATRIX).not.toContain("primary_company");
  });
});

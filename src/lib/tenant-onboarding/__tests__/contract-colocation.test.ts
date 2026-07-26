/**
 * Gate 3.8 · Pass 3.8.1 closure — contract co-location assertions.
 *
 * Verifies the two spec-named contracts are reachable from the PUBLIC module
 * barrel, and that the filter alias is type-identical to the canonical
 * declaration (no duplicate interface, no runtime artifact).
 */
import { describe, expect, it } from "vitest";

import type {
  OnboardingBlockerSeverity,
  OnboardingListFilterDTO,
  TenantOnboardingBlockerDTO,
  TenantOnboardingFilterDTO,
} from "@/lib/tenant-onboarding";
import * as onboarding from "@/lib/tenant-onboarding";

/* --------------------------------------------------- type-level assertions */

type Extends<A, B> = A extends B ? true : false;
type Mutual<A, B> = Extends<A, B> extends true
  ? Extends<B, A> extends true
    ? true
    : false
  : false;

// The spec-named alias and the canonical declaration are the same type.
const aliasIsCanonical: Mutual<
  TenantOnboardingFilterDTO,
  OnboardingListFilterDTO
> = true;

// Both spec-named contracts are importable from the public barrel.
const filter: TenantOnboardingFilterDTO = { page: 1, pageSize: 25 };
const canonicalFilter: OnboardingListFilterDTO = filter;

const severity: OnboardingBlockerSeverity = "blocker";
const blocker: TenantOnboardingBlockerDTO = {
  id: "financial_year:missing_financial_year",
  severity,
  stepKey: "financial_year",
  reasonCode: "missing_financial_year",
  reasonParams: {},
  explanation: "No open financial year exists for the organization.",
  owningModule: "financial-years",
  deepLink: null,
  detectedAt: "2026-07-26T00:00:00.000Z",
};

describe("contract co-location closure", () => {
  it("keeps the filter alias type-identical to the canonical DTO", () => {
    expect(aliasIsCanonical).toBe(true);
    expect(canonicalFilter).toBe(filter);
  });

  it("exposes both spec-named contracts through the public barrel", () => {
    expect(blocker.severity).toBe("blocker");
    expect(blocker.stepKey).toBe("financial_year");
  });

  it("introduces no runtime artifact for the alias", () => {
    expect(Object.keys(onboarding)).not.toContain("TenantOnboardingFilterDTO");
    expect(Object.keys(onboarding)).not.toContain("OnboardingListFilterDTO");
  });

  it("keeps the canonical filter schema single-sourced", () => {
    expect(typeof onboarding.onboardingListFilterSchema.parse).toBe("function");
  });
});

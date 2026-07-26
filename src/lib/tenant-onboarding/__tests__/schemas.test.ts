import { describe, expect, it } from "vitest";

import {
  ONBOARDING_REQUIRED_SETTINGS,
  onboardingSettingSpecSchema,
} from "@/lib/tenant-onboarding";
import {
  activateWorkspaceSchema,
  cancelOnboardingSchema,
  createOrSelectBranchSchema,
  initializeFinancialYearSchema,
  initializeSettingsSchema,
  onboardingListFilterSchema,
  onboardingPaginationSchema,
  saveOrganizationProfileSchema,
  startOnboardingSchema,
} from "@/lib/tenant-onboarding/schemas";

const TENANT = "11111111-2222-3333-4444-555555555555";
const ORG = "66666666-7777-8888-9999-000000000000";

describe("onboarding schemas", () => {
  it("accepts a valid filter set", () => {
    const parsed = onboardingListFilterSchema.parse({
      state: "in_progress",
      currentStep: "primary_branch",
      hasBlockers: true,
      page: 2,
      pageSize: 50,
    });
    expect(parsed.state).toBe("in_progress");
  });

  it("rejects invalid states and step keys", () => {
    expect(onboardingListFilterSchema.safeParse({ state: "done" }).success).toBe(false);
    expect(
      onboardingListFilterSchema.safeParse({ currentStep: "primary_company" }).success,
    ).toBe(false);
  });

  it("rejects unknown fields on strict schemas", () => {
    expect(
      onboardingListFilterSchema.safeParse({ state: "blocked", rogue: 1 }).success,
    ).toBe(false);
    expect(
      startOnboardingSchema.safeParse({ tenantId: TENANT, extra: true }).success,
    ).toBe(false);
  });

  it("rejects malformed tenant ids", () => {
    expect(startOnboardingSchema.safeParse({ tenantId: "nope" }).success).toBe(false);
    expect(startOnboardingSchema.safeParse({ tenantId: TENANT }).success).toBe(true);
  });

  it("rejects invalid pagination", () => {
    expect(onboardingPaginationSchema.safeParse({ page: 0, pageSize: 10 }).success).toBe(
      false,
    );
    expect(
      onboardingPaginationSchema.safeParse({ page: 1, pageSize: 500 }).success,
    ).toBe(false);
  });

  it("rejects inverted date ranges", () => {
    expect(
      onboardingListFilterSchema.safeParse({
        createdFrom: "2026-07-10T00:00:00+00:00",
        createdTo: "2026-07-01T00:00:00+00:00",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown setting keys", () => {
    const base = { tenantId: TENANT, organizationId: ORG };
    expect(
      initializeSettingsSchema.safeParse({
        ...base,
        values: [{ key: "platform.locale.default_timezone", value: "UTC" }],
      }).success,
    ).toBe(true);
    expect(
      initializeSettingsSchema.safeParse({
        ...base,
        values: [{ key: "totally.unknown.key", value: "x" }],
      }).success,
    ).toBe(false);
  });

  it("validates command inputs", () => {
    expect(
      saveOrganizationProfileSchema.safeParse({
        tenantId: TENANT,
        name: "Acme",
        slug: "Acme Corp",
      }).success,
    ).toBe(false);
    expect(
      createOrSelectBranchSchema.safeParse({ tenantId: TENANT, organizationId: ORG })
        .success,
    ).toBe(false);
    expect(
      initializeFinancialYearSchema.safeParse({
        tenantId: TENANT,
        organizationId: ORG,
        code: "FY26",
        startDate: "2026-04-01",
        endDate: "2026-03-31",
      }).success,
    ).toBe(false);
    expect(
      cancelOnboardingSchema.safeParse({ tenantId: TENANT, reason: "no" }).success,
    ).toBe(false);
    expect(
      activateWorkspaceSchema.parse({ tenantId: TENANT }).acknowledgeWarnings,
    ).toBe(false);
  });

  it("validates every registry entry against the registry schema", () => {
    for (const spec of ONBOARDING_REQUIRED_SETTINGS) {
      expect(onboardingSettingSpecSchema.safeParse(spec).success, spec.key).toBe(true);
    }
    expect(
      onboardingSettingSpecSchema.safeParse({
        ...ONBOARDING_REQUIRED_SETTINGS[0],
        requirement: "conditional",
      }).success,
    ).toBe(false);
  });
});

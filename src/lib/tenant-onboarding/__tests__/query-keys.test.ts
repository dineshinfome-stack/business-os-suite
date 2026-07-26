import { describe, expect, it } from "vitest";

import {
  normalizeOnboardingFilters,
  tenantOnboardingKeys,
} from "@/lib/tenant-onboarding/query-keys";

const TENANT = "11111111-2222-3333-4444-555555555555";

describe("tenant onboarding query keys", () => {
  it("is deterministic", () => {
    expect(tenantOnboardingKeys.detail(TENANT)).toEqual(
      tenantOnboardingKeys.detail(TENANT),
    );
    expect(tenantOnboardingKeys.platformList({ state: "blocked", page: 2 })).toEqual(
      tenantOnboardingKeys.platformList({ page: 2, state: "blocked" }),
    );
  });

  it("normalizes filters by dropping empties and sorting keys", () => {
    const normalized = normalizeOnboardingFilters({
      search: "",
      page: 1,
      state: "in_progress",
      hasBlockers: undefined,
    });
    expect(Object.keys(normalized)).toEqual(["page", "state"]);
  });

  it("includes the tenant id in every tenant-scoped key", () => {
    for (const key of [
      tenantOnboardingKeys.detail(TENANT),
      tenantOnboardingKeys.steps(TENANT),
      tenantOnboardingKeys.progress(TENANT),
      tenantOnboardingKeys.blockers(TENANT),
      tenantOnboardingKeys.readiness(TENANT),
      tenantOnboardingKeys.activity(TENANT),
      tenantOnboardingKeys.invitation(TENANT),
    ]) {
      expect(key).toContain(TENANT);
    }
  });

  it("keeps list and detail namespaces distinct", () => {
    expect(tenantOnboardingKeys.platformLists()[1]).toBe("platform-list");
    expect(tenantOnboardingKeys.details()[1]).toBe("detail");
    expect(JSON.stringify(tenantOnboardingKeys.platformList())).not.toBe(
      JSON.stringify(tenantOnboardingKeys.details()),
    );
  });

  it("produces serializable keys", () => {
    const key = tenantOnboardingKeys.platformList({ state: "blocked" });
    expect(JSON.parse(JSON.stringify(key))).toEqual(key);
  });
});

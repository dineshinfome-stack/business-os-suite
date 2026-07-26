import { describe, expect, it } from "vitest";
import {
  validateNoActiveJob,
  validateProviderConfiguration,
  validateSlug,
  validateStateTransition,
  validateTenantActive,
  validateTenantCode,
  validateTenantEligible,
  validateTenantExists,
  validateTenantNotArchived,
} from "../validators";

const tenant = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "acme-corp",
  code: "ACME",
  lifecycle_state: "active" as const,
};

describe("provisioning validators", () => {
  it("validates tenant existence", () => {
    expect(validateTenantExists(tenant).valid).toBe(true);
    expect(validateTenantExists(null).valid).toBe(false);
    expect(validateTenantExists({}).errors[0].code).toBe("tenant_not_found");
  });

  it("validates lifecycle state", () => {
    expect(validateTenantActive(tenant).valid).toBe(true);
    expect(validateTenantActive({ ...tenant, lifecycle_state: "created" }).errors[0].code).toBe(
      "tenant_not_active",
    );
    expect(validateTenantNotArchived({ ...tenant, lifecycle_state: "archived" }).valid).toBe(false);
    expect(validateTenantNotArchived(tenant).valid).toBe(true);
  });

  it("validates active job exclusivity", () => {
    expect(validateNoActiveJob(0).valid).toBe(true);
    expect(validateNoActiveJob(1).errors[0].code).toBe("active_job_exists");
  });

  it("validates slug and code", () => {
    expect(validateSlug("acme-corp").valid).toBe(true);
    expect(validateSlug("A").valid).toBe(false);
    expect(validateSlug(null).errors[0].code).toBe("invalid_slug");
    expect(validateTenantCode("ACME").valid).toBe(true);
    expect(validateTenantCode("acme").valid).toBe(false);
    expect(validateTenantCode(null).errors[0].code).toBe("invalid_tenant_code");
  });

  it("validates provider configuration", () => {
    expect(
      validateProviderConfiguration({
        providerKey: "supabase",
        region: "eu-west-1",
        supportedRegions: ["eu-west-1"],
        credentialsRef: { name: "PROVISIONING_TOKEN" },
      }).valid,
    ).toBe(true);

    const bad = validateProviderConfiguration({
      providerKey: null,
      region: "mars-1",
      supportedRegions: ["eu-west-1"],
      credentialsRef: null,
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.map((e) => e.code)).toEqual([
      "provider_missing",
      "provider_region_unsupported",
      "provider_credentials_missing",
    ]);
    expect(
      validateProviderConfiguration({ providerKey: "x", region: null, credentialsRef: { name: "n" } })
        .errors[0].code,
    ).toBe("provider_region_missing");
  });

  it("validates state transitions", () => {
    expect(validateStateTransition("pending", "validating").valid).toBe(true);
    expect(validateStateTransition("completed", "seeding").errors[0].code).toBe(
      "illegal_transition",
    );
  });

  it("aggregates eligibility", () => {
    expect(validateTenantEligible({ tenant, activeJobCount: 0 }).valid).toBe(true);
    expect(validateTenantEligible({ tenant: null, activeJobCount: 0 }).errors[0].code).toBe(
      "tenant_not_found",
    );
    const bad = validateTenantEligible({
      tenant: { id: "t", slug: "!", code: "bad", lifecycle_state: "archived" },
      activeJobCount: 2,
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.map((e) => e.code)).toEqual([
      "tenant_archived",
      "tenant_not_active",
      "invalid_slug",
      "invalid_tenant_code",
      "active_job_exists",
    ]);
  });
});

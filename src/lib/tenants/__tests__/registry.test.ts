import { describe, it, expect } from "vitest";
import {
  UpdateTenantMetadataSchema,
  SearchTenantsSchema,
  TenantCodeSchema,
  EmailSchema,
  DomainSchema,
  PhoneSchema,
  toTenantColumnPatch,
} from "../registry";

describe("TenantCodeSchema", () => {
  it.each(["ACME", "acme-01", "a.b_c", "A1"])("accepts %s", (v) => {
    expect(TenantCodeSchema.safeParse(v).success).toBe(true);
  });
  it.each(["a", "-abc", "abc-", "ab$cd", "x".repeat(33)])("rejects %s", (v) => {
    expect(TenantCodeSchema.safeParse(v).success).toBe(false);
  });
});

describe("EmailSchema", () => {
  it("accepts a well-formed address", () => {
    expect(EmailSchema.safeParse("ops@acme.io").success).toBe(true);
  });
  it("rejects malformed", () => {
    expect(EmailSchema.safeParse("nope").success).toBe(false);
  });
});

describe("DomainSchema", () => {
  it.each(["acme.io", "sub.acme.co.uk"])("accepts %s", (v) => {
    expect(DomainSchema.safeParse(v).success).toBe(true);
  });
  it.each(["http://acme.io", "acme", "a b.io"])("rejects %s", (v) => {
    expect(DomainSchema.safeParse(v).success).toBe(false);
  });
  it("lowercases input", () => {
    expect(DomainSchema.parse("ACME.io")).toBe("acme.io");
  });
});

describe("PhoneSchema", () => {
  it.each(["+1 555-123-4567", "(020) 7946 0000"])("accepts %s", (v) => {
    expect(PhoneSchema.safeParse(v).success).toBe(true);
  });
  it("rejects letters", () => {
    expect(PhoneSchema.safeParse("abc").success).toBe(false);
  });
});

describe("UpdateTenantMetadataSchema", () => {
  it("requires at least one field", () => {
    expect(UpdateTenantMetadataSchema.safeParse({}).success).toBe(false);
  });
  it("accepts a partial patch", () => {
    const r = UpdateTenantMetadataSchema.safeParse({
      displayName: "Acme Corp",
    });
    expect(r.success).toBe(true);
  });
  it("accepts explicit null to clear optional fields", () => {
    const r = UpdateTenantMetadataSchema.parse({ code: null });
    expect(r.code).toBeNull();
  });
  it("rejects unknown fields", () => {
    const r = UpdateTenantMetadataSchema.safeParse({
      displayName: "x",
      lifecycleState: "active",
    });
    expect(r.success).toBe(false);
  });
  it("rejects invalid nested types", () => {
    expect(
      UpdateTenantMetadataSchema.safeParse({ primaryContactEmail: "nope" })
        .success,
    ).toBe(false);
  });
});

describe("SearchTenantsSchema", () => {
  it("applies default pagination", () => {
    const r = SearchTenantsSchema.parse({});
    expect(r.limit).toBe(50);
    expect(r.offset).toBe(0);
  });
  it("caps limit", () => {
    expect(SearchTenantsSchema.safeParse({ limit: 500 }).success).toBe(false);
  });
  it("accepts lifecycle + provisioning filters", () => {
    const r = SearchTenantsSchema.parse({
      lifecycleState: "active",
      provisioningStatus: "provisioned",
    });
    expect(r.lifecycleState).toBe("active");
    expect(r.provisioningStatus).toBe("provisioned");
  });
  it("rejects unknown lifecycle state", () => {
    expect(SearchTenantsSchema.safeParse({ lifecycleState: "nope" }).success)
      .toBe(false);
  });
});

describe("toTenantColumnPatch", () => {
  it("maps camelCase → snake_case for provided fields only", () => {
    const out = toTenantColumnPatch({
      displayName: "Acme",
      primaryContactEmail: "ops@acme.io",
    });
    expect(out).toEqual({
      display_name: "Acme",
      primary_contact_email: "ops@acme.io",
    });
  });
  it("preserves explicit null", () => {
    const out = toTenantColumnPatch({ code: null });
    expect(out).toEqual({ code: null });
  });
});

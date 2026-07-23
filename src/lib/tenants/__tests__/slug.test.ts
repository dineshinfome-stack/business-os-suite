import { describe, it, expect } from "vitest";
import { normalizeSlug, isValidSlug } from "@/lib/tenants/slug";

describe("tenant slug normalization", () => {
  it("lowercases and dashes non-alnum", () => {
    expect(normalizeSlug("Acme Holdings!")).toBe("acme-holdings");
  });
  it("collapses runs of separators", () => {
    expect(normalizeSlug("acme---__ holdings")).toBe("acme-holdings");
  });
  it("trims edge dashes", () => {
    expect(normalizeSlug("--acme--")).toBe("acme");
  });
  it("validates format", () => {
    expect(isValidSlug("acme-holdings")).toBe(true);
    expect(isValidSlug("ac")).toBe(false); // too short
    expect(isValidSlug("-acme")).toBe(false); // edge dash
    expect(isValidSlug("acme-")).toBe(false);
    expect(isValidSlug("ACME")).toBe(false); // uppercase
  });
});

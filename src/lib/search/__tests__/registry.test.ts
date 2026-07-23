import { describe, it, expect } from "vitest";
import {
  SEARCH_REGISTRY,
  RESOURCE_TYPE_REGEX,
  listActiveSearchEntries,
  listReservedSearchEntries,
  getSearchEntry,
} from "@/lib/search/registry";

describe("search registry", () => {
  it("has no duplicate resourceType", () => {
    const seen = new Set<string>();
    for (const e of SEARCH_REGISTRY) {
      expect(seen.has(e.resourceType), `duplicate: ${e.resourceType}`).toBe(false);
      seen.add(e.resourceType);
    }
  });

  it("every resourceType matches the format", () => {
    for (const e of SEARCH_REGISTRY) {
      expect(RESOURCE_TYPE_REGEX.test(e.resourceType)).toBe(true);
    }
  });

  it("splits into active + reserved (no orphans)", () => {
    const total = SEARCH_REGISTRY.length;
    expect(listActiveSearchEntries().length + listReservedSearchEntries().length).toBe(total);
    expect(listActiveSearchEntries().length).toBeGreaterThan(0);
  });

  it("getSearchEntry returns known entries", () => {
    expect(getSearchEntry("setting")?.status).toBe("active");
    expect(getSearchEntry("customer")?.status).toBe("reserved");
    expect(getSearchEntry("__missing__")).toBeUndefined();
  });
});

import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  TENANT_LIFECYCLE_STATES,
} from "@/lib/tenants/lifecycle";

describe("tenant lifecycle transitions", () => {
  it("allows created → active", () => {
    expect(canTransition("created", "active")).toBe(true);
  });
  it("allows active ↔ suspended", () => {
    expect(canTransition("active", "suspended")).toBe(true);
    expect(canTransition("suspended", "active")).toBe(true);
  });
  it("allows active/suspended → archived", () => {
    expect(canTransition("active", "archived")).toBe(true);
    expect(canTransition("suspended", "archived")).toBe(true);
  });
  it("rejects archived → anything", () => {
    for (const to of TENANT_LIFECYCLE_STATES) {
      expect(canTransition("archived", to)).toBe(false);
    }
  });
  it("rejects self-transitions", () => {
    for (const s of TENANT_LIFECYCLE_STATES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });
  it("rejects created → suspended/archived directly", () => {
    expect(canTransition("created", "suspended")).toBe(false);
    expect(canTransition("created", "archived")).toBe(false);
  });
  it("assertTransition throws on illegal", () => {
    expect(() => assertTransition("archived", "active")).toThrow();
  });
});

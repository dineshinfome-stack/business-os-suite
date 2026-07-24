import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  COMPANY_LIFECYCLE_STATES,
} from "@/lib/organizations/lifecycle";

describe("company lifecycle transitions", () => {
  it("allows created → active", () => {
    expect(canTransition("created", "active")).toBe(true);
  });
  it("allows active ↔ inactive", () => {
    expect(canTransition("active", "inactive")).toBe(true);
    expect(canTransition("inactive", "active")).toBe(true);
  });
  it("allows active/inactive → archived", () => {
    expect(canTransition("active", "archived")).toBe(true);
    expect(canTransition("inactive", "archived")).toBe(true);
  });
  it("rejects created → inactive/archived directly", () => {
    expect(canTransition("created", "inactive")).toBe(false);
    expect(canTransition("created", "archived")).toBe(false);
  });
  it("rejects archived → anything", () => {
    for (const to of COMPANY_LIFECYCLE_STATES) {
      expect(canTransition("archived", to)).toBe(false);
    }
  });
  it("rejects self-transitions", () => {
    for (const s of COMPANY_LIFECYCLE_STATES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });
  it("assertTransition throws on illegal", () => {
    expect(() => assertTransition("archived", "active")).toThrow();
    expect(() => assertTransition("created", "archived")).toThrow();
  });
  it("assertTransition passes on legal", () => {
    expect(() => assertTransition("created", "active")).not.toThrow();
    expect(() => assertTransition("active", "archived")).not.toThrow();
  });
});

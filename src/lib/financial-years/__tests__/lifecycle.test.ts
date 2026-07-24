import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  FINANCIAL_YEAR_LIFECYCLE_STATES,
} from "@/lib/financial-years/lifecycle";

describe("financial-year lifecycle transitions", () => {
  it("allows created → open → closed → archived", () => {
    expect(canTransition("created", "open")).toBe(true);
    expect(canTransition("open", "closed")).toBe(true);
    expect(canTransition("closed", "archived")).toBe(true);
  });
  it("rejects skipping states", () => {
    expect(canTransition("created", "closed")).toBe(false);
    expect(canTransition("created", "archived")).toBe(false);
    expect(canTransition("open", "archived")).toBe(false);
  });
  it("rejects reverse transitions", () => {
    expect(canTransition("open", "created")).toBe(false);
    expect(canTransition("closed", "open")).toBe(false);
    expect(canTransition("archived", "closed")).toBe(false);
  });
  it("rejects archived → anything", () => {
    for (const to of FINANCIAL_YEAR_LIFECYCLE_STATES) {
      expect(canTransition("archived", to)).toBe(false);
    }
  });
  it("rejects self-transitions", () => {
    for (const s of FINANCIAL_YEAR_LIFECYCLE_STATES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });
  it("assertTransition throws on illegal", () => {
    expect(() => assertTransition("archived", "open")).toThrow();
    expect(() => assertTransition("created", "archived")).toThrow();
    expect(() => assertTransition("closed", "open")).toThrow();
  });
  it("assertTransition passes on legal", () => {
    expect(() => assertTransition("created", "open")).not.toThrow();
    expect(() => assertTransition("open", "closed")).not.toThrow();
    expect(() => assertTransition("closed", "archived")).not.toThrow();
  });
});

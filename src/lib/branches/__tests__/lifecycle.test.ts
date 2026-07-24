import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  BRANCH_LIFECYCLE_STATES,
} from "@/lib/branches/lifecycle";

describe("branch lifecycle transitions", () => {
  it("allows active → archived", () => {
    expect(canTransition("active", "archived")).toBe(true);
  });
  it("rejects archived → anything", () => {
    for (const to of BRANCH_LIFECYCLE_STATES) {
      expect(canTransition("archived", to)).toBe(false);
    }
  });
  it("rejects reverse archived → active", () => {
    expect(canTransition("archived", "active")).toBe(false);
  });
  it("rejects self-transitions", () => {
    for (const s of BRANCH_LIFECYCLE_STATES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });
  it("assertTransition throws on illegal", () => {
    expect(() => assertTransition("archived", "active")).toThrow();
    expect(() => assertTransition("active", "active")).toThrow();
  });
  it("assertTransition passes on legal", () => {
    expect(() => assertTransition("active", "archived")).not.toThrow();
  });
});

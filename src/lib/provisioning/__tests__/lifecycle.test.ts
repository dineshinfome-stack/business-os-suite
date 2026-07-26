import { describe, expect, it } from "vitest";
import {
  ALLOWED_TRANSITIONS,
  PROVISIONING_HAPPY_PATH,
  PROVISIONING_STATES,
  assertTransition,
  canTransition,
  isFailure,
  isProvisioningState,
  isTerminal,
  nextState,
  type ProvisioningState,
} from "../lifecycle";

const TERMINAL: ProvisioningState[] = ["completed", "rolled_back", "cancelled"];
const FAILURE: ProvisioningState[] = ["failed", "retrying", "rolled_back", "cancelled"];

describe("provisioning lifecycle", () => {
  it("declares 13 states", () => {
    expect(PROVISIONING_STATES).toHaveLength(13);
    expect(new Set(PROVISIONING_STATES).size).toBe(13);
  });

  it("exhaustively matches the allowed-transition matrix", () => {
    for (const from of PROVISIONING_STATES) {
      for (const to of PROVISIONING_STATES) {
        const expected = from !== to && ALLOWED_TRANSITIONS[from].has(to);
        expect(canTransition(from, to), `${from} -> ${to}`).toBe(expected);
        if (expected) {
          expect(() => assertTransition(from, to)).not.toThrow();
        } else {
          expect(() => assertTransition(from, to), `${from} -> ${to}`).toThrow(
            /Illegal provisioning lifecycle transition/,
          );
        }
      }
    }
  });

  it("rejects every self-transition", () => {
    for (const s of PROVISIONING_STATES) {
      expect(canTransition(s, s)).toBe(false);
    }
  });

  it("has no outgoing transitions from terminal states", () => {
    for (const s of PROVISIONING_STATES) {
      const terminal = TERMINAL.includes(s);
      expect(isTerminal(s), s).toBe(terminal);
      if (terminal) expect(ALLOWED_TRANSITIONS[s].size).toBe(0);
      else expect(ALLOWED_TRANSITIONS[s].size).toBeGreaterThan(0);
    }
  });

  it("classifies failure states", () => {
    for (const s of PROVISIONING_STATES) {
      expect(isFailure(s), s).toBe(FAILURE.includes(s));
    }
  });

  it("walks the happy path end to end", () => {
    let cursor: ProvisioningState | null = "pending";
    const walked: ProvisioningState[] = [];
    while (cursor) {
      walked.push(cursor);
      const next: ProvisioningState | null = nextState(cursor);
      if (next) expect(canTransition(cursor, next), `${cursor} -> ${next}`).toBe(true);
      cursor = next;
    }
    expect(walked).toEqual([...PROVISIONING_HAPPY_PATH]);
  });

  it("returns null for states off the happy path", () => {
    for (const s of ["failed", "retrying", "rolled_back", "cancelled", "completed"] as const) {
      expect(nextState(s)).toBeNull();
    }
  });

  it("guards unknown state strings", () => {
    expect(isProvisioningState("pending")).toBe(true);
    expect(isProvisioningState("nope")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  ONBOARDING_TRANSITION_INTENTS,
  TENANT_ONBOARDING_STATES,
  allowedIntents,
  applyOnboardingTransition,
  canApplyIntent,
  isTerminalOnboardingState,
  nextStateFor,
  type OnboardingTransitionIntent,
  type TenantOnboardingState,
} from "@/lib/tenant-onboarding/state-machine";

/** The complete approved transition table (state, intent) -> next state. */
const ALLOWED: Array<[TenantOnboardingState, OnboardingTransitionIntent, TenantOnboardingState]> = [
  ["not_started", "start", "in_progress"],
  ["in_progress", "block", "blocked"],
  ["in_progress", "mark_ready", "ready_for_activation"],
  ["in_progress", "cancel", "cancelled"],
  ["blocked", "resume", "in_progress"],
  ["blocked", "mark_ready", "ready_for_activation"],
  ["blocked", "cancel", "cancelled"],
  ["ready_for_activation", "invalidate_readiness", "in_progress"],
  ["ready_for_activation", "block", "blocked"],
  ["ready_for_activation", "activate", "activated"],
  ["ready_for_activation", "cancel", "cancelled"],
  ["cancelled", "restart", "in_progress"],
];

describe("tenant onboarding state machine", () => {
  it("accepts every allowed transition", () => {
    for (const [from, intent, to] of ALLOWED) {
      const result = applyOnboardingTransition(from, intent);
      expect(result.ok, `${from} --${intent}--> ${to}`).toBe(true);
      if (result.ok) {
        expect(result.previousState).toBe(from);
        expect(result.nextState).toBe(to);
        expect(result.intent).toBe(intent);
      }
    }
  });

  it("rejects every combination absent from the table", () => {
    const allowedPairs = new Set(ALLOWED.map(([f, i]) => `${f}|${i}`));
    for (const from of TENANT_ONBOARDING_STATES) {
      for (const intent of ONBOARDING_TRANSITION_INTENTS) {
        if (allowedPairs.has(`${from}|${intent}`)) continue;
        const result = applyOnboardingTransition(from, intent);
        expect(result.ok, `${from} --${intent}-->`).toBe(false);
        if (!result.ok) {
          expect(result.reasonCode).toBe(
            from === "activated" ? "terminal_state" : "intent_not_allowed_from_state",
          );
        }
      }
    }
  });

  it("treats activated as terminal", () => {
    expect(isTerminalOnboardingState("activated")).toBe(true);
    expect(allowedIntents("activated")).toEqual([]);
    for (const intent of ONBOARDING_TRANSITION_INTENTS) {
      expect(canApplyIntent("activated", intent)).toBe(false);
    }
  });

  it("permits no direct path to activated except activate from ready_for_activation", () => {
    const producers = ALLOWED.filter(([, , to]) => to === "activated");
    expect(producers).toEqual([["ready_for_activation", "activate", "activated"]]);
    expect(applyOnboardingTransition("not_started", "activate").ok).toBe(false);
    expect(applyOnboardingTransition("in_progress", "activate").ok).toBe(false);
    expect(applyOnboardingTransition("blocked", "activate").ok).toBe(false);
    expect(applyOnboardingTransition("cancelled", "activate").ok).toBe(false);
  });

  it("makes mark_ready the only producer of ready_for_activation", () => {
    const producers = ALLOWED.filter(([, , to]) => to === "ready_for_activation");
    expect(producers.every(([, intent]) => intent === "mark_ready")).toBe(true);
  });

  it("enforces intent exclusivity for each edge", () => {
    expect(nextStateFor("not_started", "resume")).toBeNull();
    expect(nextStateFor("blocked", "start")).toBeNull();
    expect(nextStateFor("blocked", "restart")).toBeNull();
    expect(nextStateFor("ready_for_activation", "resume")).toBeNull();
    expect(nextStateFor("cancelled", "start")).toBeNull();
    expect(nextStateFor("cancelled", "resume")).toBeNull();
    expect(nextStateFor("cancelled", "restart")).toBe("in_progress");
  });

  it("rejects unknown states and intents without throwing", () => {
    const badState = applyOnboardingTransition(
      "does_not_exist" as TenantOnboardingState,
      "start",
    );
    expect(badState.ok).toBe(false);
    if (!badState.ok) expect(badState.reasonCode).toBe("unknown_state");

    const badIntent = applyOnboardingTransition(
      "in_progress",
      "teleport" as OnboardingTransitionIntent,
    );
    expect(badIntent.ok).toBe(false);
    if (!badIntent.ok) expect(badIntent.reasonCode).toBe("unknown_intent");
  });

  it("is deterministic and does not mutate inputs", () => {
    const a = applyOnboardingTransition("in_progress", "mark_ready");
    const b = applyOnboardingTransition("in_progress", "mark_ready");
    expect(a).toEqual(b);

    const before = [...TENANT_ONBOARDING_STATES];
    applyOnboardingTransition("not_started", "start");
    expect([...TENANT_ONBOARDING_STATES]).toEqual(before);
    expect(Object.isFrozen(Object.freeze({ ...a }))).toBe(true);
  });
});

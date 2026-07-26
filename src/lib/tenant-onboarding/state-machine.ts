/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.1 (Architecture & Contracts)
 *
 * PURE tenant-onboarding workflow state machine.
 *
 * Purity contract: no database, no Supabase, no server-only imports, no audit
 * or notification calls, no query functions. Deterministic and side-effect
 * free. Readiness and activation LOGIC live elsewhere (Pass 3.8.5); this
 * module only accepts the corresponding intents.
 */

export const TENANT_ONBOARDING_STATES = [
  "not_started",
  "in_progress",
  "blocked",
  "ready_for_activation",
  "activated",
  "cancelled",
] as const;

export type TenantOnboardingState = (typeof TENANT_ONBOARDING_STATES)[number];

export const ONBOARDING_TRANSITION_INTENTS = [
  "start",
  "block",
  "resume",
  "mark_ready",
  "invalidate_readiness",
  "activate",
  "cancel",
  "restart",
] as const;

export type OnboardingTransitionIntent =
  (typeof ONBOARDING_TRANSITION_INTENTS)[number];

export const ONBOARDING_TRANSITION_REJECTION_CODES = [
  "unknown_state",
  "unknown_intent",
  "terminal_state",
  "intent_not_allowed_from_state",
] as const;

export type OnboardingTransitionRejectionCode =
  (typeof ONBOARDING_TRANSITION_REJECTION_CODES)[number];

/** `activated` is terminal — no outbound transitions. */
export const TERMINAL_ONBOARDING_STATES: ReadonlySet<TenantOnboardingState> =
  new Set(["activated"]);

/**
 * The COMPLETE allowed transition table, keyed by intent. Any (state, intent)
 * pair absent from this table yields a typed rejection.
 */
const TRANSITIONS: Readonly<
  Record<TenantOnboardingState, Partial<Record<OnboardingTransitionIntent, TenantOnboardingState>>>
> = {
  not_started: {
    start: "in_progress",
  },
  in_progress: {
    block: "blocked",
    mark_ready: "ready_for_activation",
    cancel: "cancelled",
  },
  blocked: {
    resume: "in_progress",
    mark_ready: "ready_for_activation",
    cancel: "cancelled",
  },
  ready_for_activation: {
    invalidate_readiness: "in_progress",
    block: "blocked",
    activate: "activated",
    cancel: "cancelled",
  },
  cancelled: {
    restart: "in_progress",
  },
  activated: {},
};

export type OnboardingTransitionResult =
  | {
      ok: true;
      previousState: TenantOnboardingState;
      nextState: TenantOnboardingState;
      intent: OnboardingTransitionIntent;
    }
  | {
      ok: false;
      previousState: TenantOnboardingState;
      requestedState?: TenantOnboardingState;
      intent: OnboardingTransitionIntent;
      reasonCode: OnboardingTransitionRejectionCode;
    };

export function isTenantOnboardingState(
  value: unknown,
): value is TenantOnboardingState {
  return (
    typeof value === "string" &&
    (TENANT_ONBOARDING_STATES as readonly string[]).includes(value)
  );
}

export function isOnboardingTransitionIntent(
  value: unknown,
): value is OnboardingTransitionIntent {
  return (
    typeof value === "string" &&
    (ONBOARDING_TRANSITION_INTENTS as readonly string[]).includes(value)
  );
}

export function isTerminalOnboardingState(state: TenantOnboardingState): boolean {
  return TERMINAL_ONBOARDING_STATES.has(state);
}

/** Intents that are legal from `state`, in declaration order. */
export function allowedIntents(
  state: TenantOnboardingState,
): readonly OnboardingTransitionIntent[] {
  const row = TRANSITIONS[state];
  return ONBOARDING_TRANSITION_INTENTS.filter((i) => row[i] !== undefined);
}

/** Target state for an intent, or `null` when the pair is not permitted. */
export function nextStateFor(
  state: TenantOnboardingState,
  intent: OnboardingTransitionIntent,
): TenantOnboardingState | null {
  return TRANSITIONS[state][intent] ?? null;
}

export function canApplyIntent(
  state: TenantOnboardingState,
  intent: OnboardingTransitionIntent,
): boolean {
  return nextStateFor(state, intent) !== null;
}

/**
 * Deterministic, side-effect-free transition. Never throws for an expected
 * invalid transition — it returns a typed rejection instead.
 */
export function applyOnboardingTransition(
  previousState: TenantOnboardingState,
  intent: OnboardingTransitionIntent,
): OnboardingTransitionResult {
  if (!isTenantOnboardingState(previousState)) {
    return {
      ok: false,
      previousState,
      intent,
      reasonCode: "unknown_state",
    };
  }
  if (!isOnboardingTransitionIntent(intent)) {
    return {
      ok: false,
      previousState,
      intent,
      reasonCode: "unknown_intent",
    };
  }

  const nextState = nextStateFor(previousState, intent);
  if (nextState === null) {
    return {
      ok: false,
      previousState,
      intent,
      reasonCode: isTerminalOnboardingState(previousState)
        ? "terminal_state"
        : "intent_not_allowed_from_state",
    };
  }

  return { ok: true, previousState, nextState, intent };
}

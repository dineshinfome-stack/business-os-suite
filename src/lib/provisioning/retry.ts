/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Retry policy (pure).
 *
 * Classification, budget and backoff arithmetic only. No timers, no scheduling,
 * no background execution — those belong to Gate 3.2.
 */
import {
  PROVISIONING_BACKOFF_BASE_MS,
  PROVISIONING_BACKOFF_JITTER_RATIO,
  PROVISIONING_BACKOFF_MAX_MS,
  PROVISIONING_BACKOFF_MULTIPLIER,
  PROVISIONING_MAX_ATTEMPTS,
} from "./constants";
import type { ProvisioningError } from "./errors";
import type { RetryPolicy } from "./types";

export const DEFAULT_RETRY_POLICY: Readonly<RetryPolicy> = Object.freeze({
  maxAttempts: PROVISIONING_MAX_ATTEMPTS,
  baseDelayMs: PROVISIONING_BACKOFF_BASE_MS,
  maxDelayMs: PROVISIONING_BACKOFF_MAX_MS,
  multiplier: PROVISIONING_BACKOFF_MULTIPLIER,
  jitterRatio: PROVISIONING_BACKOFF_JITTER_RATIO,
});

export type ErrorClassification = "transient" | "permanent";

/** Error kinds that are never worth retrying, regardless of the `retryable` flag. */
const PERMANENT_KINDS = new Set(["validation", "authorization", "retry"]);

export function classifyError(error: ProvisioningError): ErrorClassification {
  if (PERMANENT_KINDS.has(error.kind)) return "permanent";
  return error.retryable ? "transient" : "permanent";
}

export function isTransient(error: ProvisioningError): boolean {
  return classifyError(error) === "transient";
}

export function isPermanent(error: ProvisioningError): boolean {
  return classifyError(error) === "permanent";
}

/** Remaining attempts in the budget (never negative). */
export function remainingAttempts(
  attemptCount: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): number {
  return Math.max(0, policy.maxAttempts - attemptCount);
}

export function isBudgetExhausted(
  attemptCount: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): boolean {
  return remainingAttempts(attemptCount, policy) === 0;
}

export interface RetryDecision {
  retry: boolean;
  reason: "transient" | "permanent" | "budget_exhausted";
  attempt: number;
  delayMs: number;
}

export function shouldRetry(
  error: ProvisioningError,
  attemptCount: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  jitterSource: () => number = Math.random,
): RetryDecision {
  if (isPermanent(error)) {
    return { retry: false, reason: "permanent", attempt: attemptCount, delayMs: 0 };
  }
  if (isBudgetExhausted(attemptCount, policy)) {
    return { retry: false, reason: "budget_exhausted", attempt: attemptCount, delayMs: 0 };
  }
  return {
    retry: true,
    reason: "transient",
    attempt: attemptCount + 1,
    delayMs: calculateNextDelayMs(attemptCount, policy, jitterSource),
  };
}

/**
 * Exponential backoff with symmetric jitter.
 * `attemptCount` is the number of attempts already made (0 = first retry).
 * `jitterSource` returns a value in [0, 1); inject a constant for determinism.
 */
export function calculateNextDelayMs(
  attemptCount: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  jitterSource: () => number = Math.random,
): number {
  const exponent = Math.max(0, attemptCount);
  const raw = policy.baseDelayMs * Math.pow(policy.multiplier, exponent);
  const capped = Math.min(raw, policy.maxDelayMs);
  const jitterSpan = capped * policy.jitterRatio;
  const offset = (jitterSource() * 2 - 1) * jitterSpan;
  return Math.max(0, Math.min(policy.maxDelayMs, Math.round(capped + offset)));
}

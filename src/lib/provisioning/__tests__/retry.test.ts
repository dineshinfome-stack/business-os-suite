import { describe, expect, it } from "vitest";
import {
  DEFAULT_RETRY_POLICY,
  calculateNextDelayMs,
  classifyError,
  isBudgetExhausted,
  isPermanent,
  isTransient,
  remainingAttempts,
  shouldRetry,
} from "../retry";
import { providerError, retryError, validationError, type ProvisioningError } from "../errors";

const noJitter = () => 0.5; // maps to offset 0

describe("retry classification", () => {
  it("treats validation and authorization errors as permanent", () => {
    expect(classifyError(validationError("x", "y"))).toBe("permanent");
    expect(
      classifyError({ kind: "authorization", code: "a", message: "m", retryable: false }),
    ).toBe("permanent");
    expect(classifyError(retryError("exhausted", "m", 5))).toBe("permanent");
  });

  it("treats retryable provider errors as transient", () => {
    expect(isTransient(providerError("rate_limit", "slow down"))).toBe(true);
    expect(isPermanent(providerError("bad_request", "nope", { retryable: false }))).toBe(true);
  });

  it("classifies every non-permanent kind by its retryable flag", () => {
    const kinds: ProvisioningError[] = [
      { kind: "rollback", code: "c", message: "m", retryable: true },
      { kind: "migration", code: "c", message: "m", retryable: false },
      { kind: "secrets", code: "c", message: "m", retryable: true },
    ];
    expect(kinds.map(classifyError)).toEqual(["transient", "permanent", "transient"]);
  });
});

describe("retry budget", () => {
  it("counts down and exhausts", () => {
    expect(remainingAttempts(0)).toBe(DEFAULT_RETRY_POLICY.maxAttempts);
    expect(remainingAttempts(DEFAULT_RETRY_POLICY.maxAttempts)).toBe(0);
    expect(remainingAttempts(99)).toBe(0);
    expect(isBudgetExhausted(DEFAULT_RETRY_POLICY.maxAttempts)).toBe(true);
    expect(isBudgetExhausted(1)).toBe(false);
  });

  it("decides retry vs stop", () => {
    const transient = providerError("timeout", "timed out");
    expect(shouldRetry(transient, 0, DEFAULT_RETRY_POLICY, noJitter)).toMatchObject({
      retry: true,
      reason: "transient",
      attempt: 1,
    });
    expect(
      shouldRetry(transient, DEFAULT_RETRY_POLICY.maxAttempts, DEFAULT_RETRY_POLICY, noJitter),
    ).toMatchObject({ retry: false, reason: "budget_exhausted", delayMs: 0 });
    expect(shouldRetry(validationError("bad", "bad"), 0, DEFAULT_RETRY_POLICY, noJitter)).toMatchObject(
      { retry: false, reason: "permanent" },
    );
  });
});

describe("backoff", () => {
  it("is exponential and deterministic without jitter", () => {
    const delays = [0, 1, 2, 3].map((n) =>
      calculateNextDelayMs(n, DEFAULT_RETRY_POLICY, noJitter),
    );
    expect(delays).toEqual([1000, 2000, 4000, 8000]);
  });

  it("is monotonic and capped", () => {
    let prev = -1;
    for (let n = 0; n < 20; n++) {
      const d = calculateNextDelayMs(n, DEFAULT_RETRY_POLICY, noJitter);
      expect(d).toBeGreaterThanOrEqual(prev);
      expect(d).toBeLessThanOrEqual(DEFAULT_RETRY_POLICY.maxDelayMs);
      prev = d;
    }
    expect(calculateNextDelayMs(50, DEFAULT_RETRY_POLICY, noJitter)).toBe(
      DEFAULT_RETRY_POLICY.maxDelayMs,
    );
  });

  it("keeps jitter within the configured band and never negative", () => {
    for (const j of [0, 0.999]) {
      const d = calculateNextDelayMs(0, DEFAULT_RETRY_POLICY, () => j);
      expect(d).toBeGreaterThanOrEqual(800);
      expect(d).toBeLessThanOrEqual(1200);
    }
    expect(calculateNextDelayMs(-5, DEFAULT_RETRY_POLICY, () => 0)).toBeGreaterThanOrEqual(0);
  });
});

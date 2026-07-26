import { describe, expect, it } from "vitest";
import {
  PROVISIONING_DOMAIN_VERSION,
  PROVISIONING_STEP_KEYS,
  PROVISIONING_STEP_SEQUENCE,
  PROVISIONING_STEP_TIMEOUT_MS,
} from "../constants";
import {
  assertNeverProvisioningError,
  isAuthorizationError,
  isMigrationError,
  isProviderError,
  isProvisioningError,
  isRetryError,
  isRollbackError,
  isSecretsError,
  isValidationError,
  providerError,
  retryError,
  toErrorRecord,
  validationError,
  type ProvisioningError,
} from "../errors";
import {
  buildProvisioningEvent,
  provisioningCancelled,
  provisioningCompleted,
  provisioningFailed,
  provisioningRolledBack,
  provisioningStarted,
  provisioningStepChanged,
} from "../events";
import type { ProvisioningProvider } from "../provider";

const base = {
  tenantId: "t-1",
  jobId: "j-1",
  actorId: "a-1",
  correlationId: "corr-1",
};

describe("constants", () => {
  it("exposes a domain version and keyed step ordering", () => {
    expect(PROVISIONING_DOMAIN_VERSION).toBe(1);
    expect(PROVISIONING_STEP_KEYS[0]).toBe("validate");
    for (const [i, key] of PROVISIONING_STEP_KEYS.entries()) {
      expect(PROVISIONING_STEP_SEQUENCE[key]).toBe(i + 1);
      expect(PROVISIONING_STEP_TIMEOUT_MS[key]).toBeGreaterThan(0);
    }
  });
});

describe("errors", () => {
  it("guards every kind", () => {
    const all: ProvisioningError[] = [
      validationError("c", "m"),
      retryError("c", "m", 3),
      { kind: "rollback", code: "c", message: "m", retryable: false },
      { kind: "migration", code: "c", message: "m", retryable: true },
      providerError("c", "m"),
      { kind: "secrets", code: "c", message: "m", retryable: false },
      { kind: "authorization", code: "c", message: "m", retryable: false },
    ];
    const guards = [
      isValidationError,
      isRetryError,
      isRollbackError,
      isMigrationError,
      isProviderError,
      isSecretsError,
      isAuthorizationError,
    ];
    all.forEach((e, i) => {
      expect(guards[i](e), e.kind).toBe(true);
      expect(isProvisioningError(e)).toBe(true);
    });
    expect(isProvisioningError(null)).toBe(false);
    expect(isProvisioningError({ kind: "other" })).toBe(false);
  });

  it("switches exhaustively", () => {
    const describeError = (e: ProvisioningError): string => {
      switch (e.kind) {
        case "validation":
        case "retry":
        case "rollback":
        case "migration":
        case "provider":
        case "secrets":
        case "authorization":
          return e.kind;
        default:
          return assertNeverProvisioningError(e);
      }
    };
    expect(describeError(validationError("c", "m"))).toBe("validation");
    expect(() =>
      assertNeverProvisioningError({ kind: "bogus" } as unknown as never),
    ).toThrow(/Unhandled provisioning error kind/);
  });

  it("serializes to a persistable record", () => {
    expect(toErrorRecord(providerError("rate_limit", "slow", { details: { a: 1 } }))).toEqual({
      kind: "provider",
      code: "rate_limit",
      message: "slow",
      retryable: true,
      details: { a: 1 },
    });
  });
});

describe("events", () => {
  it("emits envelope v1 with mandatory correlation id", () => {
    const e = provisioningStarted({ ...base, toState: "validating" });
    expect(e).toMatchObject({
      event: "provisioning.started",
      version: 1,
      domain_version: 1,
      tenant_id: "t-1",
      job_id: "j-1",
      correlation_id: "corr-1",
    });
    expect(typeof e.emitted_at).toBe("string");
    expect(e.data.to_state).toBe("validating");
  });

  it("rejects a missing correlation id", () => {
    expect(() =>
      buildProvisioningEvent("provisioning.started", { ...base, correlationId: "" }),
    ).toThrow(/correlation_id is mandatory/);
  });

  it("covers every event name", () => {
    expect(provisioningStepChanged({ ...base, stepKey: "seed_database" }).data.step_key).toBe(
      "seed_database",
    );
    expect(provisioningCompleted(base).event).toBe("provisioning.completed");
    expect(provisioningRolledBack(base).event).toBe("provisioning.rolled_back");
    expect(provisioningCancelled(base).event).toBe("provisioning.cancelled");
    const failed = provisioningFailed({
      ...base,
      error: { kind: "provider", code: "boom", message: "nope", retryable: true },
    });
    expect(failed.data.error_code).toBe("boom");
  });
});

describe("provider contract", () => {
  it("is satisfiable by a type-only stub", () => {
    const stub = {} as ProvisioningProvider;
    expectTypeCheck(stub);
    expect(stub).toBeDefined();
  });
});

function expectTypeCheck(_p: ProvisioningProvider): void {
  /* compile-time conformance only */
}

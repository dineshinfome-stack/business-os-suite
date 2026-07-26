/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Provisioning Domain Foundation
 * Environment-agnostic domain constants (ADR-018).
 *
 * Pure values only. No environment reads, no I/O.
 */

/** Domain schema version — bump when the provisioning domain model changes shape. */
export const PROVISIONING_DOMAIN_VERSION = 1 as const;

/** Canonical, keyed step ordering. Never rely on array index as a stored value. */
export const PROVISIONING_STEP_KEYS = [
  "validate",
  "create_project",
  "apply_migrations",
  "seed_database",
  "create_administrator",
  "verify_health",
] as const;

export type ProvisioningStepKey = (typeof PROVISIONING_STEP_KEYS)[number];

/** Step sequence numbers (1-based), derived once from the canonical ordering. */
export const PROVISIONING_STEP_SEQUENCE: Readonly<Record<ProvisioningStepKey, number>> =
  Object.freeze(
    PROVISIONING_STEP_KEYS.reduce<Record<string, number>>((acc, key, i) => {
      acc[key] = i + 1;
      return acc;
    }, {}),
  ) as Readonly<Record<ProvisioningStepKey, number>>;

/** Per-step advisory timeouts (milliseconds). Enforcement belongs to Gate 3.2. */
export const PROVISIONING_STEP_TIMEOUT_MS: Readonly<Record<ProvisioningStepKey, number>> =
  Object.freeze({
    validate: 30_000,
    create_project: 600_000,
    apply_migrations: 600_000,
    seed_database: 300_000,
    create_administrator: 60_000,
    verify_health: 120_000,
  });

/** Retry budget. */
export const PROVISIONING_MAX_ATTEMPTS = 5;

/** Backoff parameters (milliseconds). */
export const PROVISIONING_BACKOFF_BASE_MS = 1_000;
export const PROVISIONING_BACKOFF_MAX_MS = 300_000;
export const PROVISIONING_BACKOFF_MULTIPLIER = 2;

/** Jitter ratio applied to the computed backoff (0 = none, 0.2 = ±20%). */
export const PROVISIONING_BACKOFF_JITTER_RATIO = 0.2;

/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Supabase provider error model.
 *
 * Every provider failure maps onto the existing `ProvisioningError` union.
 * No raw HTTP errors and no raw JSON escape the provider layer.
 */
import type {
  MigrationError,
  ProviderError,
  ProvisioningError,
  ValidationError,
} from "../../errors";
import type { Json } from "../../types";

export const SUPABASE_PROVIDER_KEY = "supabase";

type Details = Record<string, Json> | undefined;

const provider = (
  code: string,
  message: string,
  retryable: boolean,
  details?: Details,
): ProviderError => ({
  kind: "provider",
  code,
  message,
  retryable,
  providerKey: SUPABASE_PROVIDER_KEY,
  details,
});

/** 401 / 403 — never retried. */
export const authenticationError = (message: string, details?: Details): ProviderError =>
  provider("supabase_authentication_failed", message, false, details);

export const projectCreationError = (
  message: string,
  opts?: { retryable?: boolean; details?: Details },
): ProviderError =>
  provider("supabase_project_creation_failed", message, opts?.retryable ?? false, opts?.details);

export const projectTimeoutError = (message: string, details?: Details): ProviderError =>
  provider("supabase_project_timeout", message, true, details);

export const cancellationError = (message: string, details?: Details): ValidationError => ({
  kind: "validation",
  code: "supabase_operation_cancelled",
  message,
  retryable: false,
  details,
});

export const migrationError = (
  message: string,
  opts?: { version?: string; retryable?: boolean; details?: Details },
): MigrationError => ({
  kind: "migration",
  code: "supabase_migration_failed",
  message,
  retryable: opts?.retryable ?? false,
  version: opts?.version,
  details: opts?.details,
});

export const seedError = (message: string, details?: Details): ProviderError =>
  provider("supabase_seed_failed", message, false, details);

export const adminError = (message: string, details?: Details): ProviderError =>
  provider("supabase_administrator_failed", message, false, details);

export const healthError = (message: string, details?: Details): ProviderError =>
  provider("supabase_health_failed", message, true, details);

export const rollbackFailure = (message: string, details?: Details): ProvisioningError => ({
  kind: "rollback",
  code: "supabase_rollback_failed",
  message,
  retryable: true,
  details,
});

export const apiError = (
  message: string,
  opts: { status?: number; retryable: boolean; details?: Details },
): ProviderError =>
  provider("supabase_management_api_error", message, opts.retryable, {
    ...(opts.details ?? {}),
    ...(opts.status !== undefined ? { status: opts.status } : {}),
  });

/**
 * A typed provider failure carrier.
 *
 * Thrown so async provider methods can reject while still handing the
 * orchestrator a fully classified domain error.
 */
export class SupabaseProviderFailure extends Error {
  readonly provisioningError: ProvisioningError;
  /** Present when the API asked us to wait (Retry-After), in milliseconds. */
  readonly retryAfterMs?: number;

  constructor(error: ProvisioningError, retryAfterMs?: number) {
    super(error.message);
    this.name = "SupabaseProviderFailure";
    this.provisioningError = error;
    this.retryAfterMs = retryAfterMs;
  }
}

export function fail(error: ProvisioningError, retryAfterMs?: number): never {
  throw new SupabaseProviderFailure(error, retryAfterMs);
}

export function isProviderFailure(value: unknown): value is SupabaseProviderFailure {
  return value instanceof SupabaseProviderFailure;
}

/** Normalises anything thrown inside the provider into a typed failure. */
export function toProviderFailure(value: unknown, operation: string): SupabaseProviderFailure {
  if (isProviderFailure(value)) return value;
  const message = value instanceof Error ? value.message : String(value);
  return new SupabaseProviderFailure(
    provider("supabase_unexpected_error", `${operation}: ${message}`, true, { operation }),
  );
}

/**
 * HTTP status → retry classification.
 * 401/403 are permanent; 408/429 and 5xx (plus network failures) are transient.
 */
export function classifyStatus(status: number): { retryable: boolean } {
  if (status === 401 || status === 403) return { retryable: false };
  if (status === 408 || status === 429) return { retryable: true };
  if (status >= 500) return { retryable: true };
  return { retryable: false };
}

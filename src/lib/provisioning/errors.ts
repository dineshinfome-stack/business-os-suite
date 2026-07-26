/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Typed provisioning domain errors.
 *
 * Discriminated union (no class inheritance) so callers can switch exhaustively.
 */
import type { Json, ProvisioningErrorRecord } from "./types";

interface BaseError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, Json>;
}

export interface ValidationError extends BaseError {
  kind: "validation";
  retryable: false;
}
export interface RetryError extends BaseError {
  kind: "retry";
  attempts: number;
}
export interface RollbackError extends BaseError {
  kind: "rollback";
}
export interface MigrationError extends BaseError {
  kind: "migration";
  version?: string;
}
export interface ProviderError extends BaseError {
  kind: "provider";
  providerKey?: string;
}
export interface SecretsError extends BaseError {
  kind: "secrets";
}
export interface AuthorizationError extends BaseError {
  kind: "authorization";
  retryable: false;
}

export type ProvisioningError =
  | ValidationError
  | RetryError
  | RollbackError
  | MigrationError
  | ProviderError
  | SecretsError
  | AuthorizationError;

export type ProvisioningErrorKind = ProvisioningError["kind"];

export function isProvisioningError(value: unknown): value is ProvisioningError {
  if (typeof value !== "object" || value === null) return false;
  const k = (value as { kind?: unknown }).kind;
  return (
    typeof k === "string" &&
    ["validation", "retry", "rollback", "migration", "provider", "secrets", "authorization"].includes(k)
  );
}

export const isValidationError = (e: ProvisioningError): e is ValidationError =>
  e.kind === "validation";
export const isRetryError = (e: ProvisioningError): e is RetryError => e.kind === "retry";
export const isRollbackError = (e: ProvisioningError): e is RollbackError =>
  e.kind === "rollback";
export const isMigrationError = (e: ProvisioningError): e is MigrationError =>
  e.kind === "migration";
export const isProviderError = (e: ProvisioningError): e is ProviderError =>
  e.kind === "provider";
export const isSecretsError = (e: ProvisioningError): e is SecretsError =>
  e.kind === "secrets";
export const isAuthorizationError = (e: ProvisioningError): e is AuthorizationError =>
  e.kind === "authorization";

/** Compile-time exhaustiveness guard for `switch (error.kind)`. */
export function assertNeverProvisioningError(value: never): never {
  throw new Error(`Unhandled provisioning error kind: ${JSON.stringify(value)}`);
}

/** Serializable snapshot for persistence on jobs and steps. */
export function toErrorRecord(error: ProvisioningError): ProvisioningErrorRecord {
  return {
    kind: error.kind,
    code: error.code,
    message: error.message,
    retryable: error.retryable,
    ...(error.details ? { details: error.details } : {}),
  };
}

export function validationError(
  code: string,
  message: string,
  details?: Record<string, Json>,
): ValidationError {
  return { kind: "validation", code, message, retryable: false, details };
}

export function providerError(
  code: string,
  message: string,
  opts?: { retryable?: boolean; providerKey?: string; details?: Record<string, Json> },
): ProviderError {
  return {
    kind: "provider",
    code,
    message,
    retryable: opts?.retryable ?? true,
    providerKey: opts?.providerKey,
    details: opts?.details,
  };
}

export function retryError(code: string, message: string, attempts: number): RetryError {
  return { kind: "retry", code, message, retryable: false, attempts };
}

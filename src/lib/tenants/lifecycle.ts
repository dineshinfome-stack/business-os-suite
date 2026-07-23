/**
 * SPR-MOD-001-001 — Tenancy Foundation
 * Lifecycle state machine (pure).
 *
 * Mirrors `private.fn_assert_lifecycle_transition` — the DB is the ultimate
 * enforcer; this module lets client + server share one truth for UI gating.
 */

export const TENANT_LIFECYCLE_STATES = [
  "created",
  "active",
  "suspended",
  "archived",
] as const;

export type TenantLifecycleState = (typeof TENANT_LIFECYCLE_STATES)[number];

/** Allowed forward transitions per ADR-012. */
const ALLOWED: Record<TenantLifecycleState, ReadonlySet<TenantLifecycleState>> = {
  created: new Set(["active"]),
  active: new Set(["suspended", "archived"]),
  suspended: new Set(["active", "archived"]),
  archived: new Set(),
};

export function canTransition(
  from: TenantLifecycleState,
  to: TenantLifecycleState,
): boolean {
  if (from === to) return false;
  return ALLOWED[from].has(to);
}

export function assertTransition(
  from: TenantLifecycleState,
  to: TenantLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal tenant lifecycle transition: ${from} -> ${to}`);
  }
}

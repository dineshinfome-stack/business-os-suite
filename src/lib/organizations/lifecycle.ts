/**
 * SPR-MOD-001-002 — Company lifecycle state machine (pure).
 * Mirrors `private.fn_assert_company_lifecycle_transition`.
 */

export const COMPANY_LIFECYCLE_STATES = [
  "created",
  "active",
  "inactive",
  "archived",
] as const;

export type CompanyLifecycleState = (typeof COMPANY_LIFECYCLE_STATES)[number];

const ALLOWED: Record<CompanyLifecycleState, ReadonlySet<CompanyLifecycleState>> = {
  created: new Set(["active"]),
  active: new Set(["inactive", "archived"]),
  inactive: new Set(["active", "archived"]),
  archived: new Set(),
};

export function canTransition(
  from: CompanyLifecycleState,
  to: CompanyLifecycleState,
): boolean {
  if (from === to) return false;
  return ALLOWED[from].has(to);
}

export function assertTransition(
  from: CompanyLifecycleState,
  to: CompanyLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal company lifecycle transition: ${from} -> ${to}`);
  }
}

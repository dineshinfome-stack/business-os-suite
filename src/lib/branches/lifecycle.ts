/**
 * SPR-MOD-001-002 — Branch lifecycle state machine (pure).
 * Mirrors `private.fn_assert_branch_lifecycle_transition`.
 */

export const BRANCH_LIFECYCLE_STATES = ["active", "archived"] as const;

export type BranchLifecycleState = (typeof BRANCH_LIFECYCLE_STATES)[number];

const ALLOWED: Record<BranchLifecycleState, ReadonlySet<BranchLifecycleState>> = {
  active: new Set(["archived"]),
  archived: new Set(),
};

export function canTransition(
  from: BranchLifecycleState,
  to: BranchLifecycleState,
): boolean {
  if (from === to) return false;
  return ALLOWED[from].has(to);
}

export function assertTransition(
  from: BranchLifecycleState,
  to: BranchLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal branch lifecycle transition: ${from} -> ${to}`);
  }
}

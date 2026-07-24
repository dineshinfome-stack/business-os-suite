/**
 * SPR-MOD-001-002 — Financial-Year lifecycle state machine (pure).
 * Mirrors `private.fn_assert_financial_year_lifecycle_transition`.
 */

export const FINANCIAL_YEAR_LIFECYCLE_STATES = [
  "created",
  "open",
  "closed",
  "archived",
] as const;

export type FinancialYearLifecycleState =
  (typeof FINANCIAL_YEAR_LIFECYCLE_STATES)[number];

const ALLOWED: Record<
  FinancialYearLifecycleState,
  ReadonlySet<FinancialYearLifecycleState>
> = {
  created: new Set(["open"]),
  open: new Set(["closed"]),
  closed: new Set(["archived"]),
  archived: new Set(),
};

export function canTransition(
  from: FinancialYearLifecycleState,
  to: FinancialYearLifecycleState,
): boolean {
  if (from === to) return false;
  return ALLOWED[from].has(to);
}

export function assertTransition(
  from: FinancialYearLifecycleState,
  to: FinancialYearLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Illegal financial_year lifecycle transition: ${from} -> ${to}`,
    );
  }
}

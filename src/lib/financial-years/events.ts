/**
 * SPR-MOD-001-002 — financialyear.* event contracts (ADR-051 envelope).
 * Event names & payload shape derive authoritatively from PRD §11.
 */
import type { FinancialYearLifecycleState } from "./lifecycle";

export type FinancialYearEventName =
  | "financialyear.created"
  | "financialyear.opened"
  | "financialyear.closed";

type JsonPrimitive = string | number | boolean | null;
export type FinancialYearEventData = { [k: string]: JsonPrimitive | undefined };

export interface FinancialYearEventEnvelope {
  event: FinancialYearEventName;
  version: 1;
  emitted_at: string;
  financial_year_id: string;
  actor_id: string;
  correlation_id?: string;
  data: FinancialYearEventData;
}

export function buildFinancialYearEvent(
  event: FinancialYearEventName,
  input: {
    financialYearId: string;
    actorId: string;
    fromState?: FinancialYearLifecycleState;
    toState?: FinancialYearLifecycleState;
    data?: FinancialYearEventData;
    correlationId?: string;
  },
): FinancialYearEventEnvelope {
  return {
    event,
    version: 1,
    emitted_at: new Date().toISOString(),
    financial_year_id: input.financialYearId,
    actor_id: input.actorId,
    correlation_id: input.correlationId,
    data: {
      from_state: input.fromState,
      to_state: input.toState,
      ...(input.data ?? {}),
    },
  };
}

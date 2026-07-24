/**
 * SPR-MOD-001-002 — company.* event contracts (ADR-051 envelope).
 * Event names & payload shape derive authoritatively from PRD §11.
 */
import type { CompanyLifecycleState } from "./lifecycle";

export type CompanyEventName =
  | "company.created"
  | "company.updated"
  | "company.archived";

type JsonPrimitive = string | number | boolean | null;
export type CompanyEventData = { [k: string]: JsonPrimitive | undefined };

export interface CompanyEventEnvelope {
  event: CompanyEventName;
  version: 1;
  emitted_at: string;
  company_id: string;
  actor_id: string;
  correlation_id?: string;
  data: CompanyEventData;
}

export function buildCompanyEvent(
  event: CompanyEventName,
  input: {
    companyId: string;
    actorId: string;
    fromState?: CompanyLifecycleState;
    toState?: CompanyLifecycleState;
    data?: CompanyEventData;
    correlationId?: string;
  },
): CompanyEventEnvelope {
  return {
    event,
    version: 1,
    emitted_at: new Date().toISOString(),
    company_id: input.companyId,
    actor_id: input.actorId,
    correlation_id: input.correlationId,
    data: {
      from_state: input.fromState,
      to_state: input.toState,
      ...(input.data ?? {}),
    },
  };
}

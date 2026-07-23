/**
 * SPR-MOD-001-001 — tenant.* event contracts (ADR-051 envelope).
 * Payload builders — publishing is delegated to the notification service.
 */
import type { TenantLifecycleState } from "./lifecycle";

export type TenantEventName =
  | "tenant.created"
  | "tenant.activated"
  | "tenant.suspended"
  | "tenant.archived";

export interface TenantEventEnvelope {
  event: TenantEventName;
  version: 1;
  emitted_at: string;
  tenant_id: string;
  actor_id: string;
  correlation_id?: string;
  data: Record<string, unknown>;
}

export function buildTenantEvent(
  event: TenantEventName,
  input: {
    tenantId: string;
    actorId: string;
    fromState?: TenantLifecycleState;
    toState?: TenantLifecycleState;
    data?: Record<string, unknown>;
    correlationId?: string;
  },
): TenantEventEnvelope {
  return {
    event,
    version: 1,
    emitted_at: new Date().toISOString(),
    tenant_id: input.tenantId,
    actor_id: input.actorId,
    correlation_id: input.correlationId,
    data: {
      from_state: input.fromState,
      to_state: input.toState,
      ...(input.data ?? {}),
    },
  };
}

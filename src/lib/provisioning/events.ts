/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · provisioning.* event contracts.
 *
 * Reuses the ADR-051 envelope shape established by `src/lib/tenants/events.ts`.
 * The envelope is NOT redesigned; the only difference is that `correlation_id`
 * is mandatory for provisioning (ADR-018 tracing rule).
 */
import { PROVISIONING_DOMAIN_VERSION } from "./constants";
import type { ProvisioningState } from "./lifecycle";
import type { ProvisioningStepKey, ProvisioningErrorRecord } from "./types";

export type ProvisioningEventName =
  | "provisioning.started"
  | "provisioning.step_changed"
  | "provisioning.completed"
  | "provisioning.failed"
  | "provisioning.rolled_back"
  | "provisioning.cancelled";

type JsonPrimitive = string | number | boolean | null;
export type ProvisioningEventData = { [k: string]: JsonPrimitive | undefined };

export interface ProvisioningEventEnvelope {
  event: ProvisioningEventName;
  version: 1;
  domain_version: typeof PROVISIONING_DOMAIN_VERSION;
  emitted_at: string;
  tenant_id: string;
  job_id: string;
  actor_id: string;
  /** Mandatory — every provisioning event is traceable. */
  correlation_id: string;
  data: ProvisioningEventData;
}

interface BaseInput {
  tenantId: string;
  jobId: string;
  actorId: string;
  correlationId: string;
  fromState?: ProvisioningState;
  toState?: ProvisioningState;
  stepKey?: ProvisioningStepKey;
  attempt?: number;
  data?: ProvisioningEventData;
}

export function buildProvisioningEvent(
  event: ProvisioningEventName,
  input: BaseInput,
): ProvisioningEventEnvelope {
  if (!input.correlationId) {
    throw new Error("correlation_id is mandatory on provisioning events.");
  }
  return {
    event,
    version: 1,
    domain_version: PROVISIONING_DOMAIN_VERSION,
    emitted_at: new Date().toISOString(),
    tenant_id: input.tenantId,
    job_id: input.jobId,
    actor_id: input.actorId,
    correlation_id: input.correlationId,
    data: {
      from_state: input.fromState,
      to_state: input.toState,
      step_key: input.stepKey,
      attempt: input.attempt,
      ...(input.data ?? {}),
    },
  };
}

export const provisioningStarted = (input: BaseInput) =>
  buildProvisioningEvent("provisioning.started", input);

export const provisioningStepChanged = (input: BaseInput & { stepKey: ProvisioningStepKey }) =>
  buildProvisioningEvent("provisioning.step_changed", input);

export const provisioningCompleted = (input: BaseInput) =>
  buildProvisioningEvent("provisioning.completed", input);

export const provisioningFailed = (
  input: BaseInput & { error: ProvisioningErrorRecord },
) =>
  buildProvisioningEvent("provisioning.failed", {
    ...input,
    data: {
      ...(input.data ?? {}),
      error_kind: input.error.kind,
      error_code: input.error.code,
      error_message: input.error.message,
    },
  });

export const provisioningRolledBack = (input: BaseInput) =>
  buildProvisioningEvent("provisioning.rolled_back", input);

export const provisioningCancelled = (input: BaseInput) =>
  buildProvisioningEvent("provisioning.cancelled", input);

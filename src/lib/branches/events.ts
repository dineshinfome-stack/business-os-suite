/**
 * SPR-MOD-001-002 — branch.* event contracts (ADR-051 envelope).
 * Event names & payload shape derive authoritatively from PRD §11.
 * Archival is emitted as `branch.updated` per PRD §11 + §5.2.
 */
import type { BranchLifecycleState } from "./lifecycle";

export type BranchEventName = "branch.created" | "branch.updated";

type JsonPrimitive = string | number | boolean | null;
export type BranchEventData = { [k: string]: JsonPrimitive | undefined };

export interface BranchEventEnvelope {
  event: BranchEventName;
  version: 1;
  emitted_at: string;
  branch_id: string;
  actor_id: string;
  correlation_id?: string;
  data: BranchEventData;
}

export function buildBranchEvent(
  event: BranchEventName,
  input: {
    branchId: string;
    actorId: string;
    fromState?: BranchLifecycleState;
    toState?: BranchLifecycleState;
    data?: BranchEventData;
    correlationId?: string;
  },
): BranchEventEnvelope {
  return {
    event,
    version: 1,
    emitted_at: new Date().toISOString(),
    branch_id: input.branchId,
    actor_id: input.actorId,
    correlation_id: input.correlationId,
    data: {
      from_state: input.fromState,
      to_state: input.toState,
      ...(input.data ?? {}),
    },
  };
}

/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Immutable orchestration context.
 *
 * Everything the orchestrator needs is injected. Nothing global, no env reads,
 * no singletons.
 */
import type { ProvisioningProvider } from "../provider";
import type { RetryPolicy, RollbackPolicy } from "../types";
import { DEFAULT_RETRY_POLICY } from "../retry";
import { DEFAULT_ROLLBACK_POLICY } from "../rollback";
import { validationError, type ValidationError } from "../errors";
import type {
  Clock,
  EventSink,
  JobRepository,
  JobWriter,
  OrchestratorLogger,
  ProvisioningRequest,
} from "./types";

export interface OrchestrationContextInput {
  jobId: string;
  tenantId: string;
  correlationId: string;
  actorId: string;
  provider: ProvisioningProvider;
  repository: JobRepository;
  writer: JobWriter;
  events: EventSink;
  clock: Clock;
  logger: OrchestratorLogger;
  request: ProvisioningRequest;
  retryPolicy?: RetryPolicy;
  rollbackPolicy?: RollbackPolicy;
  /** Injectable for deterministic backoff in tests. */
  jitterSource?: () => number;
}

export type OrchestrationContext = Readonly<{
  jobId: string;
  tenantId: string;
  correlationId: string;
  actorId: string;
  provider: ProvisioningProvider;
  repository: JobRepository;
  writer: JobWriter;
  events: EventSink;
  clock: Clock;
  logger: OrchestratorLogger;
  request: Readonly<ProvisioningRequest>;
  retryPolicy: Readonly<RetryPolicy>;
  rollbackPolicy: Readonly<RollbackPolicy>;
  jitterSource: () => number;
}>;

export const systemClock: Clock = Object.freeze({
  now: () => new Date().toISOString(),
  monotonicMs: () => Date.now(),
});

export type ContextResult =
  | { ok: true; context: OrchestrationContext }
  | { ok: false; error: ValidationError };

export function createContext(input: OrchestrationContextInput): ContextResult {
  if (!input.correlationId) {
    return {
      ok: false,
      error: validationError(
        "correlation_id_required",
        "correlation_id is mandatory for every orchestration action.",
      ),
    };
  }
  if (!input.jobId || !input.tenantId) {
    return {
      ok: false,
      error: validationError(
        "context_incomplete",
        "Orchestration context requires both jobId and tenantId.",
      ),
    };
  }
  if (!input.actorId) {
    return {
      ok: false,
      error: validationError("actor_required", "Orchestration context requires an actor."),
    };
  }

  return {
    ok: true,
    context: Object.freeze({
      jobId: input.jobId,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
      actorId: input.actorId,
      provider: input.provider,
      repository: input.repository,
      writer: input.writer,
      events: input.events,
      clock: input.clock,
      logger: input.logger,
      request: Object.freeze({ ...input.request }),
      retryPolicy: Object.freeze({ ...(input.retryPolicy ?? DEFAULT_RETRY_POLICY) }),
      rollbackPolicy: Object.freeze({
        ...(input.rollbackPolicy ?? DEFAULT_ROLLBACK_POLICY),
      }),
      jitterSource: input.jitterSource ?? Math.random,
    }),
  };
}

/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Service factory (composition root).
 *
 * Assembles: repository adapter → writer adapter → event sink → provider
 * interface → logger → clock → orchestrator → application service.
 *
 * Everything is injected. No globals, no singletons, no env reads, no provider
 * implementation.
 */
import type { ProvisioningProvider } from "../provider";
import type { RetryPolicy, RollbackPolicy } from "../types";
import type { ValidationError } from "../errors";
import { createContext, systemClock } from "../orchestrator/context";
import { createOrchestrator } from "../orchestrator/orchestrator";
import { orchestratorLogger } from "../orchestrator/logger";
import type {
  Clock,
  OrchestratorLogger,
  ProvisioningRequest,
} from "../orchestrator/types";
import type { ProvisioningDataClient } from "./data-client";
import { createRepositoryAdapter } from "./repository-adapter";
import { createWriterAdapter } from "./writer-adapter";
import { createEventSink, type EventTransport } from "./event-sink";
import { createService, type ProvisioningService } from "./service";

export interface ProvisioningServiceInput {
  dataClient: ProvisioningDataClient;
  provider: ProvisioningProvider;
  request: ProvisioningRequest;
  jobId: string;
  tenantId: string;
  correlationId: string;
  actorId: string;
  clock?: Clock;
  logger?: OrchestratorLogger;
  eventTransport?: EventTransport;
  retryPolicy?: RetryPolicy;
  rollbackPolicy?: RollbackPolicy;
  jitterSource?: () => number;
}

export type ProvisioningServiceResult =
  | { ok: true; service: ProvisioningService }
  | { ok: false; error: ValidationError };

export function createProvisioningService(
  input: ProvisioningServiceInput,
): ProvisioningServiceResult {
  const logger = input.logger ?? orchestratorLogger;
  const clock = input.clock ?? systemClock;

  const repository = createRepositoryAdapter({
    dataClient: input.dataClient,
    tenantId: input.tenantId,
    correlationId: input.correlationId,
  });

  const writer = createWriterAdapter({
    dataClient: input.dataClient,
    tenantId: input.tenantId,
    logger,
  });

  const events = createEventSink({ logger, transport: input.eventTransport });

  const context = createContext({
    jobId: input.jobId,
    tenantId: input.tenantId,
    correlationId: input.correlationId,
    actorId: input.actorId,
    provider: input.provider,
    repository,
    writer,
    events,
    clock,
    logger,
    request: input.request,
    retryPolicy: input.retryPolicy,
    rollbackPolicy: input.rollbackPolicy,
    jitterSource: input.jitterSource,
  });

  if (!context.ok) return { ok: false, error: context.error };

  const service = createService({
    identity: {
      jobId: input.jobId,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
      actorId: input.actorId,
    },
    orchestrator: createOrchestrator(context.context),
    repository,
    logger,
  });

  return { ok: true, service };
}

/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Event sink.
 *
 * Implements the Gate 3.2.1 `EventSink` port. Events are dispatched in strict
 * emission order through a serialized chain, each entry structured-logged with
 * correlationId / tenantId / jobId.
 *
 * Rule: events are emitted only AFTER persistence commits. A transport failure
 * is surfaced (the orchestrator's dispatcher converts it into a warning) and
 * never invalidates committed persistence nor triggers rollback.
 */
import type { ProvisioningEventEnvelope } from "../events";
import type { EventSink, OrchestratorLogger } from "../orchestrator/types";
import { nullLogger } from "../orchestrator/logger";

/** Where events are handed off. Defaults to structured logging only. */
export type EventTransport = (event: ProvisioningEventEnvelope) => Promise<void>;

export interface EventSinkOptions {
  logger?: OrchestratorLogger;
  transport?: EventTransport;
  /** Observability hook — receives every event that was successfully dispatched. */
  onEmitted?: (event: ProvisioningEventEnvelope) => void;
}

export function createEventSink(options: EventSinkOptions = {}): EventSink {
  const logger = options.logger ?? nullLogger;
  const { transport, onEmitted } = options;

  // Serializes concurrent emits so ordering is preserved.
  let chain: Promise<void> = Promise.resolve();

  return {
    emit(event: ProvisioningEventEnvelope) {
      const run = chain.then(async () => {
        const fields = {
          correlationId: event.correlation_id,
          tenantId: event.tenant_id,
          jobId: event.job_id,
          currentStep: null,
          event: event.event,
          emitted_at: event.emitted_at,
        };

        try {
          if (transport) await transport(event);
          logger.info(`event ${event.event}`, fields);
          onEmitted?.(event);
        } catch (error) {
          logger.error(`event dispatch failed: ${event.event}`, {
            ...fields,
            reason: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      });

      // Keep the chain alive even when this emit rejects.
      chain = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
  };
}

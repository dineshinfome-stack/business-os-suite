/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.2 · Writer adapter (write side).
 *
 * Implements the Gate 3.2.1 `JobWriter` port over the data client using
 * expected-state optimistic concurrency.
 *
 * INVARIANT (Risk D1): this adapter never writes `tenants.provisioning_status`.
 * The column is derived by `private.fn_sync_tenant_provisioning_status`.
 */
import { isTerminal } from "../lifecycle";
import type { Json, ProvisioningErrorRecord, ProviderResource } from "../types";
import type {
  JobWriter,
  OrchestratorLogger,
  StepWriteInput,
  TransitionInput,
} from "../orchestrator/types";
import { nullLogger } from "../orchestrator/logger";
import type { ProvisioningDataClient } from "./data-client";

const asJson = (record: ProvisioningErrorRecord | null | undefined): Json =>
  record ? (record as unknown as Json) : null;

/**
 * Folds provider resources into the job's `provider_resource_reference` map.
 * Keys follow the `<kind>_reference` convention read by the step runner.
 */
export function foldResources(
  resources: readonly ProviderResource[] | undefined,
  existing?: Json,
): Json | undefined {
  if (!resources || resources.length === 0) return undefined;
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, Json>) }
      : {};
  for (const resource of resources) {
    base[`${resource.kind}_reference`] = resource.reference;
  }
  return base;
}


export interface WriterAdapterOptions {
  dataClient: ProvisioningDataClient;
  tenantId: string;
  logger?: OrchestratorLogger;
}

export function createWriterAdapter(options: WriterAdapterOptions): JobWriter {
  const { dataClient, tenantId } = options;
  const logger = options.logger ?? nullLogger;

  const fields = (input: { jobId: string; correlationId: string }, extra: object = {}) => ({
    correlationId: input.correlationId,
    tenantId,
    jobId: input.jobId,
    currentStep: null,
    ...extra,
  });

  return {
    async transitionState(input: TransitionInput) {
      const resourceReference = foldResources(input.resources);
      const affected = await dataClient.updateJobIfState({
        jobId: input.jobId,
        expectedState: input.expectedState,
        patch: {
          state: input.nextState,
          current_step_key: input.currentStepKey ?? null,
          ...(input.attemptCount !== undefined
            ? { attempt_count: input.attemptCount }
            : {}),
          correlation_id: input.correlationId,
          last_error: asJson(input.error),
          last_transition_at: input.at,
          ...(input.expectedState === "pending" ? { started_at: input.at } : {}),
          ...(isTerminal(input.nextState) ? { completed_at: input.at } : {}),
          ...(resourceReference !== undefined
            ? { provider_resource_reference: resourceReference }
            : {}),
        },
      });

      if (affected === 0) {
        logger.warn("transition lost optimistic concurrency", {
          ...fields(input, {
            expected_state: input.expectedState,
            next_state: input.nextState,
          }),
        });
        return false;
      }

      logger.info("transition committed", {
        ...fields(input, {
          from_state: input.expectedState,
          to_state: input.nextState,
        }),
      });
      return true;
    },

    async claimStep(input: StepWriteInput) {
      const claimed = await dataClient.claimStepIfUnclaimed({
        jobId: input.jobId,
        stepKey: input.stepKey,
        sequence: input.sequence,
        correlationId: input.correlationId,
        attempt: input.attempt,
        at: input.at,
      });

      logger[claimed ? "info" : "warn"](
        claimed ? "step claimed" : "step claim lost",
        fields(input, { step_key: input.stepKey, attempt: input.attempt }),
      );
      return claimed;
    },

    async writeStep(input: StepWriteInput) {
      await dataClient.writeStepOutcome({
        jobId: input.jobId,
        stepKey: input.stepKey,
        sequence: input.sequence,
        status: input.status,
        correlationId: input.correlationId,
        attempt: input.attempt,
        at: input.at,
        durationMs: input.durationMs ?? null,
        error: asJson(input.error),
      });

      logger.info("step outcome persisted", {
        ...fields(input, {
          step_key: input.stepKey,
          status: input.status,
          attempt: input.attempt,
        }),
      });
    },
  };
}

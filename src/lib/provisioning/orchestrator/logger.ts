/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Structured orchestrator logger.
 *
 * Reuses the existing Platform Logger. No console.log. Every entry carries
 * correlationId, tenantId, jobId and currentStep.
 */
import { platformLogger } from "@/lib/platform/logger";
import type { OrchestratorLogFields, OrchestratorLogger } from "./types";

const format = (message: string, fields: OrchestratorLogFields) => [
  `provisioning:orchestrator ${message}`,
  {
    correlation_id: fields.correlationId,
    tenant_id: fields.tenantId,
    job_id: fields.jobId,
    current_step: fields.currentStep,
    ...fields,
  },
];

export const orchestratorLogger: OrchestratorLogger = {
  debug: (m, f) => platformLogger.debug(...format(m, f)),
  info: (m, f) => platformLogger.info(...format(m, f)),
  warn: (m, f) => platformLogger.warn(...format(m, f)),
  error: (m, f) => platformLogger.error(...format(m, f)),
};

/** Discards all output — for tests and dry runs. */
export const nullLogger: OrchestratorLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

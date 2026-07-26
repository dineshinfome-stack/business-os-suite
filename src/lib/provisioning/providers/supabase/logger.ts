/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Provider logger adapter.
 *
 * Reuses the Platform Logger. Every entry carries correlationId, tenantId,
 * projectId and the current operation. No console.log.
 */
import { platformLogger } from "@/lib/platform/logger";
import type { ProviderLogFields, ProviderLogger } from "./types";

const format = (message: string, fields: ProviderLogFields) => [
  `provisioning:provider:supabase ${message}`,
  {
    ...fields,
    correlation_id: fields.correlationId,
    tenant_id: fields.tenantId ?? null,
    project_id: fields.projectId ?? null,
    operation: fields.operation,
  },
];


export const supabaseProviderLogger: ProviderLogger = {
  debug: (m, f) => platformLogger.debug(...format(m, f)),
  info: (m, f) => platformLogger.info(...format(m, f)),
  warn: (m, f) => platformLogger.warn(...format(m, f)),
  error: (m, f) => platformLogger.error(...format(m, f)),
};

/** Discards all output — for tests and dry runs. */
export const nullProviderLogger: ProviderLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

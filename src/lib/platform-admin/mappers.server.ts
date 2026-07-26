/**
 * Gate 3.7 · Platform administration mappers — server only.
 *
 * Row → DTO conversion, redaction and CSV rendering. Exports are produced from
 * the SAME mapper functions the screens use, so redaction rules are identical
 * in the UI and in the file (see PHASE3_GATE37_OPERATIONS_MATRIX.md).
 */
import { isSecretShapedKey } from "./validation";
import type {
  PlatformAuditEntryDTO,
  PlatformSeverity,
  PlatformTenantOperationsRowDTO,
} from "@/modules/platform/administration/types";

/** Shared export ceiling — mirrors the provisioning console. */
export const EXPORT_ROW_LIMIT = 5_000;

export interface AuditRowLike {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_id: string | null;
  occurred_at: string;
  created_at: string;
  old_values: unknown;
  new_values: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function scalar(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

/**
 * Drops every secret-shaped field and every non-scalar payload. Provider
 * payloads, stack traces and SQL never survive this function.
 */
export function redactValues(value: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(asRecord(value))) {
    if (isSecretShapedKey(k)) continue;
    const s = scalar(v);
    if (s == null) continue;
    if (s.length > 400) continue;
    out[k] = s;
  }
  return out;
}

export function toAuditEntryDTO(row: AuditRowLike): PlatformAuditEntryDTO {
  const next = redactValues(row.new_values);
  const prev = redactValues(row.old_values);
  return {
    id: row.id,
    occurredAt: row.occurred_at ?? row.created_at,
    actorId: row.actor_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    tenantId: row.entity_type === "tenant" ? row.entity_id : (next.tenant_id ?? null),
    previousState: prev.to_state ?? prev.state ?? next.from_state ?? null,
    newState: next.to_state ?? next.state ?? null,
    reason: next.reason ?? null,
    correlationId: next.correlation_id ?? null,
  };
}

/* --------------------------------------------------------------------- CSV */

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

type Column<T> = [string, (row: T) => unknown];

const AUDIT_COLUMNS: Column<PlatformAuditEntryDTO>[] = [
  ["id", (r) => r.id],
  ["occurredAt", (r) => r.occurredAt],
  ["actorId", (r) => r.actorId],
  ["action", (r) => r.action],
  ["entityType", (r) => r.entityType],
  ["entityId", (r) => r.entityId],
  ["tenantId", (r) => r.tenantId],
  ["previousState", (r) => r.previousState],
  ["newState", (r) => r.newState],
  ["reason", (r) => r.reason],
  ["correlationId", (r) => r.correlationId],
];

/** Exported column names — asserted equal to the DTO field set in tests. */
export const AUDIT_CSV_FIELDS = AUDIT_COLUMNS.map(([name]) => name);

export function auditToCsv(rows: PlatformAuditEntryDTO[]): string {
  const header = AUDIT_COLUMNS.map(([n]) => csvCell(n)).join(",");
  const body = rows
    .slice(0, EXPORT_ROW_LIMIT)
    .map((row) => AUDIT_COLUMNS.map(([, get]) => csvCell(get(row))).join(","));
  return [header, ...body].join("\n");
}

/* ------------------------------------------------------------- tenant rows */

export interface TenantRowLike {
  id: string;
  display_name: string;
  slug: string;
  code: string | null;
  region: string;
  plan_tier: string;
  lifecycle_state: string;
  provisioning_status: string;
  created_at: string;
  updated_at: string;
  maintenance_started_at: string | null;
  deletion_scheduled_at: string | null;
  purge_after: string | null;
}

export function toTenantOperationsRow(
  row: TenantRowLike,
  extras: {
    companyCount: number | null;
    lastActivityAt: string | null;
    attentionCount: number;
    highestSeverity: PlatformSeverity | null;
  },
): PlatformTenantOperationsRowDTO {
  return {
    id: row.id,
    displayName: row.display_name,
    slug: row.slug,
    code: row.code,
    region: row.region,
    planTier: row.plan_tier,
    lifecycleState: row.lifecycle_state,
    provisioningStatus: row.provisioning_status,
    companyCount: extras.companyCount,
    lastActivityAt: extras.lastActivityAt,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attentionCount: extras.attentionCount,
    highestSeverity: extras.highestSeverity,
  };
}

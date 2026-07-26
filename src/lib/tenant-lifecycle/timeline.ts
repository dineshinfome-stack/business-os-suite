/**
 * Gate 3.6 — Unified tenant lifecycle timeline (pure).
 *
 * Merges two independent sources into one chronological stream WITHOUT
 * coupling the two domains: lifecycle audit records and provisioning jobs.
 */

export type TimelineSource = "lifecycle" | "provisioning";

export interface TimelineEntry {
  readonly id: string;
  readonly source: TimelineSource;
  readonly at: string;
  readonly action: string;
  readonly fromState: string | null;
  readonly toState: string | null;
  readonly actorId: string | null;
  readonly detail: Record<string, string | number | boolean | null>;
}

export interface AuditRow {
  id: string;
  action: string;
  actor_id: string | null;
  created_at: string;
  new_values: unknown;
}

export interface ProvisioningJobRow {
  id: string;
  state: string;
  created_at: string;
  updated_at?: string | null;
  requested_by?: string | null;
  error_message?: string | null;
}

type Scalar = string | number | boolean | null;

/** Flattens an unknown JSON blob into serializable scalars. */
function asRecord(value: unknown): Record<string, Scalar> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, Scalar> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (raw === null) out[key] = null;
    else if (
      typeof raw === "string" ||
      typeof raw === "number" ||
      typeof raw === "boolean"
    )
      out[key] = raw;
    else out[key] = JSON.stringify(raw);
  }
  return out;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function mapAuditRow(row: AuditRow): TimelineEntry {
  const values = asRecord(row.new_values);
  return {
    id: `audit:${row.id}`,
    source: "lifecycle",
    at: row.created_at,
    action: row.action,
    fromState: str(values.from_state),
    toState: str(values.to_state),
    actorId: row.actor_id,
    detail: values,
  };
}

export function mapProvisioningRow(row: ProvisioningJobRow): TimelineEntry {
  return {
    id: `job:${row.id}`,
    source: "provisioning",
    at: row.updated_at ?? row.created_at,
    action: `provisioning.${row.state}`,
    fromState: null,
    toState: null,
    actorId: row.requested_by ?? null,
    detail: {
      job_id: row.id,
      job_state: row.state,
      error_message: row.error_message ?? null,
    },
  };
}

/** Newest first, stable for identical timestamps. */
export function buildTimeline(
  audit: readonly AuditRow[],
  jobs: readonly ProvisioningJobRow[],
): TimelineEntry[] {
  const entries = [...audit.map(mapAuditRow), ...jobs.map(mapProvisioningRow)];
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const delta = Date.parse(b.entry.at) - Date.parse(a.entry.at);
      if (delta !== 0) return delta;
      return a.index - b.index;
    })
    .map(({ entry }) => entry);
}

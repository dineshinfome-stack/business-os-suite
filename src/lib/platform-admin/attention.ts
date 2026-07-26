/**
 * Gate 3.7 · Attention derivation (pure).
 *
 * Severity, precedence and explanation are computed HERE, on the server, from
 * persisted values only. The UI renders them verbatim and never re-derives.
 *
 * Precedence policy (lower number sorts first). When several conditions apply
 * to the same tenant the operator sees the most actionable one first:
 *   1 provisioning_rollback_failed
 *   2 provisioning_retry_exhausted
 *   3 provisioning_failed
 *   4 deletion_purge_overdue
 *   5 pending_deletion
 *   6 job_exceeds_expected_duration
 *   7 maintenance_beyond_threshold
 *   8 configuration_validation_issue
 *   9 notification_delivery_issue
 * Ties break by severity, then oldest createdAt, then tenant id.
 * Items are deduplicated by `${type}:${tenantId}`.
 */
import type {
  PlatformAttentionItemDTO,
  PlatformAttentionType,
  PlatformSeverity,
} from "@/modules/platform/administration/types";

export const ATTENTION_PRECEDENCE: Record<PlatformAttentionType, number> = {
  provisioning_rollback_failed: 1,
  provisioning_retry_exhausted: 2,
  provisioning_failed: 3,
  deletion_purge_overdue: 4,
  pending_deletion: 5,
  job_exceeds_expected_duration: 6,
  maintenance_beyond_threshold: 7,
  configuration_validation_issue: 8,
  notification_delivery_issue: 9,
};

export const ATTENTION_SEVERITY: Record<PlatformAttentionType, PlatformSeverity> = {
  provisioning_rollback_failed: "critical",
  provisioning_retry_exhausted: "critical",
  provisioning_failed: "high",
  deletion_purge_overdue: "high",
  pending_deletion: "medium",
  job_exceeds_expected_duration: "medium",
  maintenance_beyond_threshold: "medium",
  configuration_validation_issue: "low",
  notification_delivery_issue: "low",
};

const SEVERITY_RANK: Record<PlatformSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export function daysBetween(fromIso: string, now: Date): number {
  const ms = now.getTime() - new Date(fromIso).getTime();
  return Math.floor(ms / 86_400_000);
}

export function minutesBetween(fromIso: string, now: Date): number {
  const ms = now.getTime() - new Date(fromIso).getTime();
  return Math.floor(ms / 60_000);
}

export interface AttentionSeed {
  type: PlatformAttentionType;
  tenantId: string | null;
  tenantName: string | null;
  source: PlatformAttentionItemDTO["source"];
  createdAt: string;
  lastUpdatedAt: string;
  correlationId: string | null;
  reasonParams: Record<string, string | number>;
  destination: string;
  destinationLabel: string;
}

const SUMMARIES: Record<PlatformAttentionType, string> = {
  provisioning_rollback_failed: "Provisioning rollback failed",
  provisioning_retry_exhausted: "Provisioning retry exhausted",
  provisioning_failed: "Provisioning failed",
  deletion_purge_overdue: "Deletion retention window elapsed",
  pending_deletion: "Tenant pending deletion",
  job_exceeds_expected_duration: "Provisioning job running longer than expected",
  maintenance_beyond_threshold: "Tenant in maintenance beyond threshold",
  configuration_validation_issue: "Configuration requires operator review",
  notification_delivery_issue: "Notification requires operator review",
};

/** Composes the operator-facing "why" string from persisted values only. */
export function explain(
  type: PlatformAttentionType,
  p: Record<string, string | number>,
): string {
  switch (type) {
    case "provisioning_rollback_failed":
      return `Rollback did not complete after ${p.attempts ?? 0} attempt(s); the job remains in "${p.state ?? "unknown"}".`;
    case "provisioning_retry_exhausted":
      return `Provisioning retry exhausted after ${p.attempts ?? 0} attempt(s); last transition ${p.age ?? "unknown"} ago.`;
    case "provisioning_failed":
      return `Provisioning failed at step "${p.step ?? "unknown"}" after ${p.attempts ?? 0} attempt(s).`;
    case "deletion_purge_overdue":
      return `Retention window elapsed ${p.overdueDays ?? 0} day(s) ago; the tenant is still awaiting operator action.`;
    case "pending_deletion":
      return `Deletion scheduled ${p.scheduledDays ?? 0} day(s) ago; purge is available after the retention window.`;
    case "job_exceeds_expected_duration":
      return `Running for ${p.runningMinutes ?? 0} minute(s), beyond the ${p.thresholdMinutes ?? 0}-minute threshold.`;
    case "maintenance_beyond_threshold":
      return `In maintenance for ${p.maintenanceDays ?? 0} day(s), beyond the ${p.thresholdDays ?? 0}-day threshold.`;
    case "configuration_validation_issue":
      return `${p.detail ?? "A platform configuration value needs review."}`;
    case "notification_delivery_issue":
      return `${p.detail ?? "A notification needs operator review."}`;
  }
}

export function buildAttentionItem(
  seed: AttentionSeed,
  acknowledged: Map<string, string>,
): PlatformAttentionItemDTO {
  const id = `${seed.type}:${seed.tenantId ?? "platform"}`;
  const acknowledgedAt = acknowledged.get(id) ?? null;
  return {
    id,
    type: seed.type,
    severity: ATTENTION_SEVERITY[seed.type],
    precedence: ATTENTION_PRECEDENCE[seed.type],
    tenantId: seed.tenantId,
    tenantName: seed.tenantName,
    source: seed.source,
    summary: SUMMARIES[seed.type],
    explanation: explain(seed.type, seed.reasonParams),
    reasonCode: seed.type,
    reasonParams: seed.reasonParams,
    createdAt: seed.createdAt,
    lastUpdatedAt: seed.lastUpdatedAt,
    correlationId: seed.correlationId,
    status: acknowledgedAt ? "acknowledged" : "open",
    acknowledgedAt,
    destination: seed.destination,
    destinationLabel: seed.destinationLabel,
  };
}

/** Deduplicates by id and applies the documented deterministic ordering. */
export function orderAttention(
  items: PlatformAttentionItemDTO[],
): PlatformAttentionItemDTO[] {
  const byId = new Map<string, PlatformAttentionItemDTO>();
  for (const item of items) {
    const existing = byId.get(item.id);
    if (!existing || item.lastUpdatedAt > existing.lastUpdatedAt) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort((a, b) => {
    if (a.precedence !== b.precedence) return a.precedence - b.precedence;
    const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (sev !== 0) return sev;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
    return (a.tenantId ?? "").localeCompare(b.tenantId ?? "");
  });
}

export function summarizeAttention(items: PlatformAttentionItemDTO[]) {
  const open = items.filter((i) => i.status === "open");
  return {
    total: open.length,
    critical: open.filter((i) => i.severity === "critical").length,
    high: open.filter((i) => i.severity === "high").length,
    medium: open.filter((i) => i.severity === "medium").length,
    low: open.filter((i) => i.severity === "low").length,
  };
}

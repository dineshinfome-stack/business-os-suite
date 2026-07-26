/**
 * Gate 3.7 · Platform Administration DTOs — v1.
 *
 * These are the ONLY shapes that cross the server-function boundary into the
 * browser. No database rows, provider objects, credentials, SQL, connection
 * handles or stack traces may appear here.
 *
 * Compatibility: additive fields stay in v1; breaking changes require v2.
 */

/* ------------------------------------------------------------------ shared */

export type PlatformSeverity = "critical" | "high" | "medium" | "low" | "info";

export type PlatformSurfaceOwner =
  | "provisioning"
  | "tenant-lifecycle"
  | "settings"
  | "feature-flags"
  | "audit"
  | "notifications"
  | "rbac"
  | "platform-admin";

export interface PlatformCountDTO {
  key: string;
  label: string;
  value: number;
}

/* ------------------------------------------------------------- summaries */

export interface PlatformTenantCountsDTO {
  total: number;
  created: number;
  active: number;
  suspended: number;
  maintenance: number;
  archived: number;
  pendingDeletion: number;
  deleted: number;
}

export interface PlatformProvisioningCountsDTO {
  queued: number;
  running: number;
  failed: number;
  retrying: number;
  rolledBack: number;
  completedRecently: number;
}

export interface PlatformAttentionCountsDTO {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface PlatformOperationsSummaryDTO {
  generatedAt: string;
  tenants: PlatformTenantCountsDTO;
  provisioning: PlatformProvisioningCountsDTO;
  attention: PlatformAttentionCountsDTO;
  providers: { configured: number; total: number };
  recentActivityCount: number;
}

export interface PlatformHealthSectionDTO {
  key: string;
  label: string;
  owner: PlatformSurfaceOwner;
  status: "ok" | "attention" | "unavailable";
  detail: string;
  /** Null when the underlying source does not persist a measurement. */
  measuredAt: string | null;
}

/* ------------------------------------------------------------- attention */

export type PlatformAttentionType =
  | "provisioning_rollback_failed"
  | "provisioning_retry_exhausted"
  | "provisioning_failed"
  | "deletion_purge_overdue"
  | "pending_deletion"
  | "job_exceeds_expected_duration"
  | "maintenance_beyond_threshold"
  | "configuration_validation_issue"
  | "notification_delivery_issue";

export interface PlatformAttentionItemDTO {
  /** Stable synthetic id: `${type}:${tenantId ?? sourceId}`. */
  id: string;
  type: PlatformAttentionType;
  severity: PlatformSeverity;
  /** Server-assigned ordering rank; lower sorts first. */
  precedence: number;
  tenantId: string | null;
  tenantName: string | null;
  source: PlatformSurfaceOwner;
  summary: string;
  /** Human-readable "why am I seeing this", composed from persisted values. */
  explanation: string;
  reasonCode: string;
  reasonParams: Record<string, string | number>;
  createdAt: string;
  lastUpdatedAt: string;
  correlationId: string | null;
  status: "open" | "acknowledged";
  acknowledgedAt: string | null;
  /** Destination inside an owning console. Never an external URL. */
  destination: string;
  destinationLabel: string;
}

export interface PlatformAttentionPageDTO {
  items: PlatformAttentionItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  generatedAt: string;
}

/* ------------------------------------------------- tenant operations grid */

export interface PlatformTenantOperationsRowDTO {
  id: string;
  displayName: string;
  slug: string;
  code: string | null;
  region: string;
  planTier: string;
  lifecycleState: string;
  provisioningStatus: string;
  companyCount: number | null;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
  attentionCount: number;
  highestSeverity: PlatformSeverity | null;
}

export interface PlatformTenantOperationsPageDTO {
  rows: PlatformTenantOperationsRowDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/* --------------------------------------------------- providers & regions */

export interface PlatformProviderSummaryDTO {
  providerKey: string;
  displayName: string;
  configured: boolean;
  configurationSource: "environment" | "database" | "code";
  mutable: boolean;
  capabilities: string[];
  supportedRegions: string[];
  defaultRegion: string | null;
  totalJobs: number;
  successCount: number;
  failureCount: number;
  successRate: number | null;
  averageDurationMs: number | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  /** Historical only — no live probe exists. */
  live: false;
  message: string;
}

export interface PlatformRegionSummaryDTO {
  region: string;
  tenantCount: number;
  activeTenantCount: number;
  failedProvisioningCount: number;
  isDefault: boolean;
}

/* ------------------------------------------------- settings & policies */

export type PlatformSettingMutability =
  | "editable"
  | "read-only-system"
  | "read-only-environment"
  | "engine-owned";

export interface PlatformSettingDTO {
  key: string;
  label: string;
  description: string;
  category: string;
  owner: PlatformSurfaceOwner;
  dataType: "string" | "number" | "boolean" | "enum";
  /** Redacted values never reach this field — sensitive keys are excluded. */
  value: string | number | boolean | null;
  defaultValue: string | number | boolean | null;
  allowedValues: string[] | null;
  min: number | null;
  max: number | null;
  mutability: PlatformSettingMutability;
  auditRequired: boolean;
  sourceOfTruth: string;
  updatedAt: string | null;
}

export interface PlatformOperationalPolicyDTO {
  key: string;
  label: string;
  description: string;
  owner: PlatformSurfaceOwner;
  effectiveValue: string;
  mutability: PlatformSettingMutability;
  sourceOfTruth: string;
  note: string | null;
}

/* ------------------------------------------------------ feature controls */

export interface PlatformFeatureControlDTO {
  key: string;
  displayName: string;
  description: string;
  scope: "platform";
  enabled: boolean;
  rolloutStage: string;
  source: "default" | "platform";
  mutability: PlatformSettingMutability;
  lastChangedAt: string | null;
  lastChangedBy: string | null;
}

/* ------------------------------------------------------------------ audit */

export interface PlatformAuditEntryDTO {
  id: string;
  occurredAt: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  tenantId: string | null;
  previousState: string | null;
  newState: string | null;
  reason: string | null;
  correlationId: string | null;
}

export interface PlatformAuditPageDTO {
  entries: PlatformAuditEntryDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/* ---------------------------------------------------------- notifications */

export interface PlatformNotificationTypeDTO {
  type: string;
  category: string;
  label: string;
  description: string;
  defaultSeverity: string;
}

export interface PlatformNotificationSummaryDTO {
  types: PlatformNotificationTypeDTO[];
  recent: Array<{
    id: string;
    type: string;
    category: string;
    severity: string;
    status: string;
    title: string;
    createdAt: string;
    readAt: string | null;
  }>;
  /** False — no per-channel delivery store exists (see discovery §5). */
  deliveryTrackingAvailable: boolean;
  limitation: string;
}

/* --------------------------------------------------------------- commands */

export interface PlatformAdminActionResultDTO {
  ok: boolean;
  key: string;
  previousValue: string | null;
  newValue: string | null;
  auditAction: string;
  correlationId: string;
  message: string;
}

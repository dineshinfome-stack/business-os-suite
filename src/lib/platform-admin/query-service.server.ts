/**
 * Gate 3.7 · Platform administration READ service — server only.
 *
 * Composition layer. It reads durable rows through the caller's RLS-scoped
 * client and maps them to versioned DTOs. It contains NO provisioning
 * decisions, NO lifecycle transition logic, NO provider logic and never
 * imports the orchestrator, retry engine, rollback engine, migration runner,
 * seed runner or the admin (service-role) client.
 */
import { TENANT_LIFECYCLE_STATES } from "@/lib/tenant-lifecycle/lifecycle";
import { NOTIFICATION_TYPES } from "@/lib/notifications/registry";
import {
  PLATFORM_FEATURE_REGISTRY,
  PLATFORM_SETTING_REGISTRY,
  POLICY_SPECS,
  type PlatformSettingSpec,
} from "./validation";
import {
  buildAttentionItem,
  daysBetween,
  minutesBetween,
  orderAttention,
  summarizeAttention,
  type AttentionSeed,
} from "./attention";
import {
  EXPORT_ROW_LIMIT,
  toAuditEntryDTO,
  toTenantOperationsRow,
  type AuditRowLike,
  type TenantRowLike,
} from "./mappers.server";
import type {
  PlatformAttentionItemDTO,
  PlatformAttentionPageDTO,
  PlatformAuditPageDTO,
  PlatformFeatureControlDTO,
  PlatformHealthSectionDTO,
  PlatformNotificationSummaryDTO,
  PlatformOperationalPolicyDTO,
  PlatformOperationsSummaryDTO,
  PlatformProviderSummaryDTO,
  PlatformRegionSummaryDTO,
  PlatformSettingDTO,
  PlatformSeverity,
  PlatformTenantOperationsPageDTO,
} from "@/modules/platform/administration/types";

export type AnyClient = { from: (table: string) => any };

export const ATTENTION_ACK_ACTION = "platform.attention.acknowledged";
export const SETTING_CHANGED_ACTION = "platform.setting.changed";
export const FEATURE_CHANGED_ACTION = "platform.feature.changed";

const TENANT_COLUMNS =
  "id, display_name, slug, code, region, plan_tier, lifecycle_state, provisioning_status, created_at, updated_at, maintenance_started_at, deletion_scheduled_at, purge_after";

const JOB_COLUMNS =
  "id, tenant_id, state, current_step_key, attempt_count, correlation_id, provider_key, started_at, last_transition_at, completed_at, created_at";

/* ------------------------------------------------------------- primitives */

async function loadTenants(client: AnyClient): Promise<TenantRowLike[]> {
  const { data, error } = await client
    .from("tenants")
    .select(TENANT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as TenantRowLike[];
}

interface JobRowLike {
  id: string;
  tenant_id: string;
  state: string;
  current_step_key: string | null;
  attempt_count: number;
  correlation_id: string | null;
  provider_key: string;
  started_at: string | null;
  last_transition_at: string;
  completed_at: string | null;
  created_at: string;
}

async function loadJobs(client: AnyClient): Promise<JobRowLike[]> {
  const { data, error } = await client
    .from("provisioning_jobs")
    .select(JOB_COLUMNS)
    .order("last_transition_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as JobRowLike[];
}

async function loadAcknowledgements(client: AnyClient): Promise<Map<string, string>> {
  const { data, error } = await client
    .from("audit_logs")
    .select("entity_id, occurred_at")
    .eq("action", ATTENTION_ACK_ACTION)
    .order("occurred_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ entity_id: string | null; occurred_at: string }>) {
    if (row.entity_id && !map.has(row.entity_id)) map.set(row.entity_id, row.occurred_at);
  }
  return map;
}

/** Reads a platform-scope setting value, falling back to the registry default. */
export async function loadPlatformSettingValues(
  client: AnyClient,
): Promise<Map<string, { value: unknown; updatedAt: string | null }>> {
  const { data: defs, error: defErr } = await client
    .from("setting_definitions")
    .select("id, key, scope, is_sensitive")
    .eq("scope", "platform");
  if (defErr) throw defErr;

  const rows = (defs ?? []) as Array<{
    id: string;
    key: string;
    is_sensitive: boolean;
  }>;
  const idToKey = new Map(rows.filter((r) => !r.is_sensitive).map((r) => [r.id, r.key]));
  const out = new Map<string, { value: unknown; updatedAt: string | null }>();
  if (idToKey.size === 0) return out;

  const { data: values, error: valErr } = await client
    .from("setting_values")
    .select("definition_id, value, updated_at, organization_id")
    .is("organization_id", null)
    .in("definition_id", [...idToKey.keys()]);
  if (valErr) throw valErr;

  for (const v of (values ?? []) as Array<{
    definition_id: string;
    value: unknown;
    updated_at: string | null;
  }>) {
    const key = idToKey.get(v.definition_id);
    if (key) out.set(key, { value: v.value, updatedAt: v.updated_at });
  }
  return out;
}

/* --------------------------------------------------------------- attention */

function thresholds(values: Map<string, { value: unknown }>) {
  const num = (key: string, fallback: number) => {
    const raw = values.get(key)?.value;
    return typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
  };
  return {
    maintenanceDays: num("platform.maintenance_display_threshold_days", 7),
    longRunningMinutes: num("platform.long_running_job_threshold_minutes", 30),
  };
}

export async function deriveAttention(
  client: AnyClient,
  now = new Date(),
): Promise<PlatformAttentionItemDTO[]> {
  const [tenants, jobs, acks, settings] = await Promise.all([
    loadTenants(client),
    loadJobs(client),
    loadAcknowledgements(client),
    loadPlatformSettingValues(client),
  ]);
  const t = thresholds(settings);
  const nameOf = new Map(tenants.map((x) => [x.id, x.display_name]));
  const seeds: AttentionSeed[] = [];

  for (const job of jobs) {
    const tenantName = nameOf.get(job.tenant_id) ?? null;
    const base = {
      tenantId: job.tenant_id,
      tenantName,
      source: "provisioning" as const,
      createdAt: job.created_at,
      lastUpdatedAt: job.last_transition_at,
      correlationId: job.correlation_id,
      destination: `/platform/provisioning/${job.id}`,
      destinationLabel: "Open provisioning job",
    };
    const ageMinutes = minutesBetween(job.last_transition_at, now);
    const age = ageMinutes >= 60 ? `${Math.floor(ageMinutes / 60)}h` : `${ageMinutes}m`;

    if (job.state === "rolled_back" && job.attempt_count > 0) {
      seeds.push({
        ...base,
        type: "provisioning_rollback_failed",
        reasonParams: { attempts: job.attempt_count, state: job.state },
      });
    } else if (job.state === "failed" && job.attempt_count >= 3) {
      seeds.push({
        ...base,
        type: "provisioning_retry_exhausted",
        reasonParams: { attempts: job.attempt_count, age },
      });
    } else if (job.state === "failed") {
      seeds.push({
        ...base,
        type: "provisioning_failed",
        reasonParams: {
          step: job.current_step_key ?? "unknown",
          attempts: job.attempt_count,
        },
      });
    }

    const active =
      !["completed", "failed", "cancelled", "rolled_back"].includes(job.state) &&
      job.started_at != null;
    if (active) {
      const running = minutesBetween(job.started_at as string, now);
      if (running > t.longRunningMinutes) {
        seeds.push({
          ...base,
          type: "job_exceeds_expected_duration",
          reasonParams: {
            runningMinutes: running,
            thresholdMinutes: t.longRunningMinutes,
          },
        });
      }
    }
  }

  for (const tenant of tenants) {
    const base = {
      tenantId: tenant.id,
      tenantName: tenant.display_name,
      source: "tenant-lifecycle" as const,
      correlationId: null,
      destination: "/platform/tenants/lifecycle",
      destinationLabel: "Open lifecycle console",
    };
    if (tenant.lifecycle_state === "maintenance" && tenant.maintenance_started_at) {
      const days = daysBetween(tenant.maintenance_started_at, now);
      if (days >= t.maintenanceDays) {
        seeds.push({
          ...base,
          type: "maintenance_beyond_threshold",
          createdAt: tenant.maintenance_started_at,
          lastUpdatedAt: tenant.updated_at,
          reasonParams: { maintenanceDays: days, thresholdDays: t.maintenanceDays },
        });
      }
    }
    if (tenant.lifecycle_state === "pending_deletion" && tenant.deletion_scheduled_at) {
      const overdue =
        tenant.purge_after && new Date(tenant.purge_after).getTime() < now.getTime();
      if (overdue) {
        seeds.push({
          ...base,
          type: "deletion_purge_overdue",
          createdAt: tenant.deletion_scheduled_at,
          lastUpdatedAt: tenant.updated_at,
          reasonParams: {
            overdueDays: daysBetween(tenant.purge_after as string, now),
          },
        });
      } else {
        seeds.push({
          ...base,
          type: "pending_deletion",
          createdAt: tenant.deletion_scheduled_at,
          lastUpdatedAt: tenant.updated_at,
          reasonParams: {
            scheduledDays: daysBetween(tenant.deletion_scheduled_at, now),
          },
        });
      }
    }
  }

  // Configuration validation: registry entries with no stored platform value.
  const missing = PLATFORM_SETTING_REGISTRY.filter(
    (s) => s.mutability === "editable" && !settings.has(s.key),
  );
  for (const spec of missing) {
    seeds.push({
      type: "configuration_validation_issue",
      tenantId: null,
      tenantName: null,
      source: "settings",
      createdAt: new Date(0).toISOString(),
      lastUpdatedAt: now.toISOString(),
      correlationId: null,
      reasonParams: {
        detail: `"${spec.label}" has no stored platform value; the registry default (${String(spec.defaultValue)}) is in effect.`,
      },
      destination: "/platform/admin/settings",
      destinationLabel: "Review platform settings",
    });
  }

  // One aggregate configuration item, not one per key, to avoid queue noise.
  const collapsed = seeds.filter((s) => s.type !== "configuration_validation_issue");
  if (missing.length > 0) {
    collapsed.push({
      type: "configuration_validation_issue",
      tenantId: null,
      tenantName: null,
      source: "settings",
      createdAt: new Date(0).toISOString(),
      lastUpdatedAt: now.toISOString(),
      correlationId: null,
      reasonParams: {
        detail: `${missing.length} platform setting(s) have no stored value and are running on registry defaults.`,
      },
      destination: "/platform/admin/settings",
      destinationLabel: "Review platform settings",
    });
  }

  return orderAttention(collapsed.map((seed) => buildAttentionItem(seed, acks)));
}

export async function getAttentionPage(
  client: AnyClient,
  query: {
    severity?: PlatformSeverity | "all";
    type?: string;
    status?: "all" | "open" | "acknowledged";
    page?: number;
    pageSize?: number;
  },
  now = new Date(),
): Promise<PlatformAttentionPageDTO> {
  const all = await deriveAttention(client, now);
  const filtered = all.filter((item) => {
    if (query.severity && query.severity !== "all" && item.severity !== query.severity)
      return false;
    if (query.type && query.type !== "all" && item.type !== query.type) return false;
    if (query.status && query.status !== "all" && item.status !== query.status)
      return false;
    return true;
  });
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    generatedAt: now.toISOString(),
  };
}

/* ----------------------------------------------------------------- summary */

export async function getOperationsSummary(
  client: AnyClient,
  providerConfigured: number,
  providerTotal: number,
  now = new Date(),
): Promise<PlatformOperationsSummaryDTO> {
  const [tenants, jobs, attention] = await Promise.all([
    loadTenants(client),
    loadJobs(client),
    deriveAttention(client, now),
  ]);

  const countState = (state: string) =>
    tenants.filter((t) => t.lifecycle_state === state).length;
  const countJob = (states: string[]) =>
    jobs.filter((j) => states.includes(j.state)).length;

  const dayAgo = now.getTime() - 86_400_000;
  const completedRecently = jobs.filter(
    (j) => j.state === "completed" && j.completed_at &&
      new Date(j.completed_at).getTime() >= dayAgo,
  ).length;

  return {
    generatedAt: now.toISOString(),
    tenants: {
      total: tenants.length,
      created: countState("created"),
      active: countState("active"),
      suspended: countState("suspended"),
      maintenance: countState("maintenance"),
      archived: countState("archived"),
      pendingDeletion: countState("pending_deletion"),
      deleted: countState("deleted"),
    },
    provisioning: {
      queued: countJob(["pending", "validating", "queued"]),
      running: countJob([
        "provisioning_infrastructure",
        "running_migrations",
        "seeding",
        "creating_admin",
        "verifying",
      ]),
      failed: countJob(["failed"]),
      retrying: countJob(["retrying"]),
      rolledBack: countJob(["rolled_back"]),
      completedRecently,
    },
    attention: summarizeAttention(attention),
    providers: { configured: providerConfigured, total: providerTotal },
    recentActivityCount: jobs.length,
  };
}

export async function getHealthSections(
  client: AnyClient,
  now = new Date(),
): Promise<PlatformHealthSectionDTO[]> {
  const summary = await getOperationsSummary(client, 0, 0, now);
  const iso = now.toISOString();
  return [
    {
      key: "provisioning",
      label: "Provisioning pipeline",
      owner: "provisioning",
      status: summary.provisioning.failed > 0 ? "attention" : "ok",
      detail: `${summary.provisioning.queued} queued · ${summary.provisioning.running} running · ${summary.provisioning.failed} failed`,
      measuredAt: iso,
    },
    {
      key: "lifecycle",
      label: "Tenant lifecycle",
      owner: "tenant-lifecycle",
      status:
        summary.tenants.maintenance + summary.tenants.pendingDeletion > 0
          ? "attention"
          : "ok",
      detail: `${summary.tenants.active} active · ${summary.tenants.maintenance} maintenance · ${summary.tenants.pendingDeletion} pending deletion`,
      measuredAt: iso,
    },
    {
      key: "infrastructure",
      label: "Infrastructure telemetry",
      owner: "platform-admin",
      status: "unavailable",
      detail: "No authoritative uptime, usage or capacity source is configured.",
      measuredAt: null,
    },
    {
      key: "notifications",
      label: "Notification delivery",
      owner: "notifications",
      status: "unavailable",
      detail: "Per-channel delivery outcomes are not persisted.",
      measuredAt: null,
    },
  ];
}

/* -------------------------------------------------------- tenant directory */

export interface TenantDirectoryQuery {
  search?: string;
  lifecycleState?: string;
  provisioningStatus?: string;
  region?: string;
  planTier?: string;
  requiresAttention?: boolean;
  hasFailedProvisioning?: boolean;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "displayName" | "createdAt" | "updatedAt" | "lifecycleState";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

const SEVERITY_ORDER: PlatformSeverity[] = ["critical", "high", "medium", "low", "info"];

export async function getTenantDirectory(
  client: AnyClient,
  query: TenantDirectoryQuery,
  now = new Date(),
): Promise<PlatformTenantOperationsPageDTO> {
  const [tenants, jobs, attention] = await Promise.all([
    loadTenants(client),
    loadJobs(client),
    deriveAttention(client, now),
  ]);

  const attentionByTenant = new Map<string, PlatformAttentionItemDTO[]>();
  for (const item of attention) {
    if (!item.tenantId || item.status !== "open") continue;
    const list = attentionByTenant.get(item.tenantId) ?? [];
    list.push(item);
    attentionByTenant.set(item.tenantId, list);
  }

  const lastJobByTenant = new Map<string, string>();
  const failedTenants = new Set<string>();
  for (const job of jobs) {
    if (!lastJobByTenant.has(job.tenant_id)) {
      lastJobByTenant.set(job.tenant_id, job.last_transition_at);
    }
    if (job.state === "failed" || job.state === "rolled_back") {
      failedTenants.add(job.tenant_id);
    }
  }

  const term = query.search?.trim().toLowerCase() ?? "";
  let rows = tenants.filter((t) => {
    if (term) {
      const haystack = [
        t.display_name,
        t.slug,
        t.code ?? "",
        t.id,
        t.region,
        t.lifecycle_state,
        t.provisioning_status,
        t.plan_tier,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (query.lifecycleState && query.lifecycleState !== "all" &&
      t.lifecycle_state !== query.lifecycleState) return false;
    if (query.provisioningStatus && query.provisioningStatus !== "all" &&
      t.provisioning_status !== query.provisioningStatus) return false;
    if (query.region && query.region !== "all" && t.region !== query.region) return false;
    if (query.planTier && query.planTier !== "all" && t.plan_tier !== query.planTier)
      return false;
    if (query.hasFailedProvisioning && !failedTenants.has(t.id)) return false;
    if (query.requiresAttention && !(attentionByTenant.get(t.id)?.length)) return false;
    if (query.createdFrom && t.created_at < query.createdFrom) return false;
    if (query.createdTo && t.created_at > query.createdTo) return false;
    return true;
  });

  const dir = query.sortDir === "asc" ? 1 : -1;
  const sortBy = query.sortBy ?? "createdAt";
  rows = [...rows].sort((a, b) => {
    const pick = (r: TenantRowLike) =>
      sortBy === "displayName"
        ? r.display_name
        : sortBy === "updatedAt"
          ? r.updated_at
          : sortBy === "lifecycleState"
            ? r.lifecycle_state
            : r.created_at;
    const av = pick(a);
    const bv = pick(b);
    return av === bv ? 0 : av < bv ? -dir : dir;
  });

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  const slice = rows.slice(start, start + pageSize);

  return {
    rows: slice.map((row) => {
      const items = attentionByTenant.get(row.id) ?? [];
      const highest =
        SEVERITY_ORDER.find((s) => items.some((i) => i.severity === s)) ?? null;
      return toTenantOperationsRow(row, {
        companyCount: null,
        lastActivityAt: lastJobByTenant.get(row.id) ?? row.updated_at,
        attentionCount: items.length,
        highestSeverity: highest,
      });
    }),
    total: rows.length,
    page,
    pageSize,
  };
}

/* ------------------------------------------------------ providers & regions */

export async function getProviderSummaries(
  client: AnyClient,
  runtime: {
    providerKey: string;
    displayName: string;
    configured: boolean;
    capabilities: Record<string, boolean>;
    defaultRegion: string | null;
    message: string;
  },
): Promise<PlatformProviderSummaryDTO[]> {
  const jobs = await loadJobs(client);
  const own = jobs.filter((j) => j.provider_key === runtime.providerKey);
  const success = own.filter((j) => j.state === "completed");
  const failure = own.filter((j) => j.state === "failed" || j.state === "rolled_back");

  const durations = success
    .filter((j) => j.started_at && j.completed_at)
    .map(
      (j) =>
        new Date(j.completed_at as string).getTime() -
        new Date(j.started_at as string).getTime(),
    );
  const avg =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  const tenants = await loadTenants(client);
  const regions = [...new Set(tenants.map((t) => t.region))].sort();

  return [
    {
      providerKey: runtime.providerKey,
      displayName: runtime.displayName,
      configured: runtime.configured,
      configurationSource: "environment",
      mutable: false,
      capabilities: Object.entries(runtime.capabilities)
        .filter(([, v]) => v)
        .map(([k]) => k),
      supportedRegions: regions,
      defaultRegion: runtime.defaultRegion,
      totalJobs: own.length,
      successCount: success.length,
      failureCount: failure.length,
      successRate: own.length > 0 ? success.length / own.length : null,
      averageDurationMs: avg,
      lastSuccessAt: success[0]?.completed_at ?? null,
      lastFailureAt: failure[0]?.last_transition_at ?? null,
      live: false,
      message: runtime.message,
    },
  ];
}

export async function getRegionSummaries(
  client: AnyClient,
  defaultRegion: string | null,
): Promise<PlatformRegionSummaryDTO[]> {
  const [tenants, jobs] = await Promise.all([loadTenants(client), loadJobs(client)]);
  const failedTenants = new Set(
    jobs.filter((j) => j.state === "failed").map((j) => j.tenant_id),
  );
  const byRegion = new Map<string, PlatformRegionSummaryDTO>();
  for (const t of tenants) {
    const entry = byRegion.get(t.region) ?? {
      region: t.region,
      tenantCount: 0,
      activeTenantCount: 0,
      failedProvisioningCount: 0,
      isDefault: t.region === defaultRegion,
    };
    entry.tenantCount += 1;
    if (t.lifecycle_state === "active") entry.activeTenantCount += 1;
    if (failedTenants.has(t.id)) entry.failedProvisioningCount += 1;
    byRegion.set(t.region, entry);
  }
  return [...byRegion.values()].sort((a, b) => a.region.localeCompare(b.region));
}

/* ------------------------------------------------------ settings & policies */

function specToDTO(
  spec: PlatformSettingSpec,
  stored: { value: unknown; updatedAt: string | null } | undefined,
): PlatformSettingDTO {
  const raw = stored?.value;
  const value =
    typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean"
      ? raw
      : spec.defaultValue;
  return {
    key: spec.key,
    label: spec.label,
    description: spec.description,
    category: spec.category,
    owner: spec.owner,
    dataType: spec.dataType,
    value,
    defaultValue: spec.defaultValue,
    allowedValues: spec.allowedValues ?? null,
    min: spec.min ?? null,
    max: spec.max ?? null,
    mutability: spec.mutability,
    auditRequired: spec.auditRequired,
    sourceOfTruth: spec.sourceOfTruth,
    updatedAt: stored?.updatedAt ?? null,
  };
}

export async function getPlatformSettings(
  client: AnyClient,
): Promise<PlatformSettingDTO[]> {
  const stored = await loadPlatformSettingValues(client);
  return PLATFORM_SETTING_REGISTRY.map((spec) => specToDTO(spec, stored.get(spec.key)));
}

export async function getOperationalPolicies(
  client: AnyClient,
  environment: { defaultRegion: string | null },
): Promise<PlatformOperationalPolicyDTO[]> {
  const stored = await loadPlatformSettingValues(client);
  return POLICY_SPECS.map((spec) => {
    let effective: string;
    if (spec.mutability === "read-only-environment") {
      effective = environment.defaultRegion ?? "not configured";
    } else if (spec.mutability === "engine-owned") {
      effective = "Owned by the provisioning engine";
    } else if (spec.key === "platform.export_row_limit") {
      effective = String(EXPORT_ROW_LIMIT);
    } else {
      const raw = stored.get(spec.key)?.value ?? spec.defaultValue;
      effective = String(raw);
    }
    return {
      key: spec.key,
      label: spec.label,
      description: spec.description,
      owner: spec.owner,
      effectiveValue: effective,
      mutability: spec.mutability,
      sourceOfTruth: spec.sourceOfTruth,
      note: spec.policyNote ?? null,
    };
  });
}

/* --------------------------------------------------------------- features */

export async function getFeatureControls(
  client: AnyClient,
): Promise<PlatformFeatureControlDTO[]> {
  const { data, error } = await client
    .from("feature_flags")
    .select("key, enabled, rollout_stage, updated_at, updated_by, organization_id")
    .is("organization_id", null);
  if (error) throw error;
  const rows = new Map(
    ((data ?? []) as Array<{
      key: string;
      enabled: boolean;
      rollout_stage: string;
      updated_at: string | null;
      updated_by: string | null;
    }>).map((r) => [r.key, r]),
  );

  return PLATFORM_FEATURE_REGISTRY.map((spec) => {
    const row = rows.get(spec.key);
    return {
      key: spec.key,
      displayName: spec.displayName,
      description: spec.description,
      scope: "platform" as const,
      enabled: row?.enabled ?? false,
      rolloutStage: row?.rollout_stage ?? "off",
      source: row ? ("platform" as const) : ("default" as const),
      mutability: spec.mutability,
      lastChangedAt: row?.updated_at ?? null,
      lastChangedBy: row?.updated_by ?? null,
    };
  });
}

/* ------------------------------------------------------------------ audit */

export interface AuditQuery {
  search?: string;
  action?: string;
  entityType?: string;
  actorId?: string;
  tenantId?: string;
  correlationId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function getAuditPage(
  client: AnyClient,
  query: AuditQuery,
): Promise<PlatformAuditPageDTO> {
  const page = query.page ?? 1;
  const pageSize = Math.min(query.pageSize ?? 25, 100);
  const rows = await queryAuditRows(client, query, pageSize * page + pageSize);
  const mapped = rows.map(toAuditEntryDTO).filter((entry) => {
    if (query.tenantId && entry.tenantId !== query.tenantId) return false;
    if (query.correlationId && entry.correlationId !== query.correlationId) return false;
    if (query.search) {
      const term = query.search.toLowerCase();
      const hay = [entry.action, entry.entityType, entry.entityId ?? "", entry.reason ?? ""]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });
  const start = (page - 1) * pageSize;
  return {
    entries: mapped.slice(start, start + pageSize),
    total: mapped.length,
    page,
    pageSize,
  };
}

async function queryAuditRows(
  client: AnyClient,
  query: AuditQuery,
  limit: number,
): Promise<AuditRowLike[]> {
  let q = client
    .from("audit_logs")
    .select(
      "id, action, entity_type, entity_id, actor_id, occurred_at, created_at, old_values, new_values",
    )
    .order("occurred_at", { ascending: false })
    .limit(Math.min(limit, EXPORT_ROW_LIMIT));
  if (query.action && query.action !== "all") q = q.eq("action", query.action);
  if (query.entityType && query.entityType !== "all")
    q = q.eq("entity_type", query.entityType);
  if (query.actorId) q = q.eq("actor_id", query.actorId);
  if (query.from) q = q.gte("occurred_at", query.from);
  if (query.to) q = q.lte("occurred_at", query.to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AuditRowLike[];
}

/** Export uses the same mapper + filters as the screen — identical redaction. */
export async function getAuditExportRows(client: AnyClient, query: AuditQuery) {
  const rows = await queryAuditRows(client, query, EXPORT_ROW_LIMIT);
  const mapped = rows.map(toAuditEntryDTO).filter((entry) => {
    if (query.tenantId && entry.tenantId !== query.tenantId) return false;
    if (query.correlationId && entry.correlationId !== query.correlationId) return false;
    return true;
  });
  return mapped.slice(0, EXPORT_ROW_LIMIT);
}

/* ---------------------------------------------------------- notifications */

export async function getNotificationOperations(
  client: AnyClient,
): Promise<PlatformNotificationSummaryDTO> {
  const { data, error } = await client
    .from("notifications")
    .select("id, type, category, severity, status, title, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  return {
    types: NOTIFICATION_TYPES.map((t) => ({
      type: t.type,
      category: t.category,
      label: t.label,
      description: t.description,
      defaultSeverity: t.defaultSeverity,
    })),
    recent: ((data ?? []) as Array<Record<string, string | null>>).map((row) => ({
      id: row.id as string,
      type: row.type as string,
      category: row.category as string,
      severity: row.severity as string,
      status: row.status as string,
      title: row.title as string,
      createdAt: row.created_at as string,
      readAt: row.read_at,
    })),
    deliveryTrackingAvailable: false,
    limitation:
      "Per-channel delivery outcomes are not persisted, and notification rows are visible to their recipient only. Retry of a delivery is deferred.",
  };
}

export const LIFECYCLE_STATE_OPTIONS = TENANT_LIFECYCLE_STATES;

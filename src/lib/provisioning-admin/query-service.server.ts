/**
 * Gate 3.4 · Provisioning read (query) service — server only.
 *
 * The dashboard's only source of provisioning reads. It maps durable rows to
 * versioned DTOs; it never touches the provider, orchestrator, retry or
 * rollback engines.
 */
import { PROVISIONING_STATES, isTerminal } from "@/lib/provisioning/lifecycle";
import type { ProvisioningState } from "@/lib/provisioning/lifecycle";
import type {
  ProvisioningFailureDTO,
  ProvisioningJobDetailDTO,
  ProvisioningJobListItemDTO,
  ProvisioningListQueryDTO,
  ProvisioningPageDTO,
  ProvisioningQueueDTO,
  ProvisioningSummaryDTO,
  ProviderHealthDTO,
} from "@/modules/platform/provisioning/types";
import {
  DEFAULT_POLL_INTERVAL_MS,
  summarize,
  toDetailDTO,
  toFailureDTO,
  toListItemDTO,
  type JobRowLike,
  type StepRowLike,
  type TenantFactsLike,
} from "./mappers.server";

type AnyClient = {
  from: (table: string) => any;
};

const JOB_COLUMNS =
  "id, tenant_id, state, current_step_key, attempt_count, correlation_id, provider_key, provider_resource_reference, last_error, started_at, last_transition_at, completed_at, created_at";

const ACTIVE_STATES = PROVISIONING_STATES.filter((s) => !isTerminal(s));
const QUEUE_STATES: ProvisioningState[] = ["pending", "validating", "queued"];

async function loadTenants(
  client: AnyClient,
  ids: string[],
): Promise<Map<string, TenantFactsLike>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();
  const { data, error } = await client
    .from("tenants")
    .select("id, display_name, slug, region")
    .in("id", unique);
  if (error) throw error;
  return new Map(
    (data ?? []).map((t: TenantFactsLike) => [t.id, t] as [string, TenantFactsLike]),
  );
}

async function loadSteps(
  client: AnyClient,
  jobIds: string[],
): Promise<Map<string, StepRowLike[]>> {
  if (jobIds.length === 0) return new Map();
  const { data, error } = await client
    .from("provisioning_steps")
    .select(
      "job_id, step_key, sequence, status, attempt_count, error, started_at, completed_at, duration_ms",
    )
    .in("job_id", jobIds)
    .order("sequence", { ascending: true });
  if (error) throw error;
  const map = new Map<string, StepRowLike[]>();
  for (const row of (data ?? []) as (StepRowLike & { job_id: string })[]) {
    const list = map.get(row.job_id) ?? [];
    list.push(row);
    map.set(row.job_id, list);
  }
  return map;
}

async function hydrate(
  client: AnyClient,
  jobs: JobRowLike[],
): Promise<ProvisioningJobListItemDTO[]> {
  const [tenants, steps] = await Promise.all([
    loadTenants(client, jobs.map((j) => j.tenant_id)),
    loadSteps(client, jobs.map((j) => j.id)),
  ]);
  return jobs.map((job) =>
    toListItemDTO(job, tenants.get(job.tenant_id), steps.get(job.id) ?? []),
  );
}

const SORT_COLUMN: Record<string, string> = {
  createdAt: "created_at",
  lastTransitionAt: "last_transition_at",
  state: "state",
  tenantName: "created_at",
};

const STATUS_STATES: Record<string, ProvisioningState[]> = {
  provisioned: ["completed"],
  failed: ["failed", "rolled_back"],
  not_started: ["pending", "cancelled"],
  in_progress: ACTIVE_STATES.filter((s) => s !== "pending") as ProvisioningState[],
};

export async function getSummary(client: AnyClient): Promise<ProvisioningSummaryDTO> {
  const { data, error } = await client
    .from("provisioning_jobs")
    .select("id, tenant_id, state, started_at, completed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return summarize((data ?? []) as JobRowLike[]);
}

export async function listJobs(
  client: AnyClient,
  query: ProvisioningListQueryDTO,
): Promise<ProvisioningPageDTO<ProvisioningJobListItemDTO>> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, query.pageSize ?? 20));
  const sortBy = SORT_COLUMN[query.sortBy ?? "createdAt"] ?? "created_at";
  const ascending = (query.sortDir ?? "desc") === "asc";

  let builder = client
    .from("provisioning_jobs")
    .select(JOB_COLUMNS, { count: "exact" });

  if (query.state && query.state !== "all") builder = builder.eq("state", query.state);
  else if (query.status && query.status !== "all") {
    builder = builder.in("state", STATUS_STATES[query.status] ?? []);
  }
  if (query.providerKey && query.providerKey !== "all") {
    builder = builder.eq("provider_key", query.providerKey);
  }
  if (query.createdFrom) builder = builder.gte("created_at", query.createdFrom);
  if (query.createdTo) builder = builder.lte("created_at", query.createdTo);

  const search = query.search?.trim();
  if (search) {
    const escaped = search.replace(/[%,]/g, "");
    builder = builder.or(
      `correlation_id.ilike.%${escaped}%,provider_key.ilike.%${escaped}%`,
    );
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await builder
    .order(sortBy, { ascending })
    .range(from, from + pageSize - 1);
  if (error) throw error;

  let rows = await hydrate(client, (data ?? []) as JobRowLike[]);
  if (query.retryableOnly) rows = rows.filter((r) => r.retryable);
  if (query.region && query.region !== "all") {
    rows = rows.filter((r) => r.region === query.region);
  }
  if ((query.sortBy ?? "createdAt") === "tenantName") {
    rows = [...rows].sort((a, b) =>
      ascending
        ? a.tenantName.localeCompare(b.tenantName)
        : b.tenantName.localeCompare(a.tenantName),
    );
  }

  const total = count ?? rows.length;
  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getJobDetail(
  client: AnyClient,
  jobId: string,
): Promise<ProvisioningJobDetailDTO | null> {
  const { data, error } = await client
    .from("provisioning_jobs")
    .select(JOB_COLUMNS)
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const job = data as JobRowLike;
  const [tenants, steps] = await Promise.all([
    loadTenants(client, [job.tenant_id]),
    loadSteps(client, [job.id]),
  ]);
  return toDetailDTO(job, tenants.get(job.tenant_id), steps.get(job.id) ?? []);
}

export async function listFailures(
  client: AnyClient,
): Promise<ProvisioningFailureDTO[]> {
  const { data, error } = await client
    .from("provisioning_jobs")
    .select(JOB_COLUMNS)
    .in("state", ["failed", "rolled_back"])
    .order("last_transition_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  const jobs = (data ?? []) as JobRowLike[];
  const [tenants, steps] = await Promise.all([
    loadTenants(client, jobs.map((j) => j.tenant_id)),
    loadSteps(client, jobs.map((j) => j.id)),
  ]);
  return jobs.map((job) =>
    toFailureDTO(job, tenants.get(job.tenant_id), steps.get(job.id) ?? []),
  );
}

export async function getQueue(client: AnyClient): Promise<ProvisioningQueueDTO> {
  const { data, error } = await client
    .from("provisioning_jobs")
    .select(JOB_COLUMNS)
    .in("state", ACTIVE_STATES as string[])
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw error;
  const rows = await hydrate(client, (data ?? []) as JobRowLike[]);
  return {
    rows,
    queuedCount: rows.filter((r) => QUEUE_STATES.includes(r.state as ProvisioningState))
      .length,
    runningCount: rows.filter(
      (r) => !QUEUE_STATES.includes(r.state as ProvisioningState),
    ).length,
    pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
  };
}

export async function getProviderHealthReport(
  client: AnyClient,
  input: {
    providerKey: string;
    displayName: string;
    configured: boolean;
    capabilities: ProviderHealthDTO["capabilities"];
    message: string;
  },
): Promise<ProviderHealthDTO> {
  const { data, error } = await client
    .from("provisioning_jobs")
    .select("state")
    .eq("provider_key", input.providerKey)
    .limit(1000);
  if (error) throw error;

  const states = ((data ?? []) as { state: string }[]).map((r) => r.state);
  const succeeded = states.filter((s) => s === "completed").length;
  const failed = states.filter((s) => s === "failed" || s === "rolled_back").length;
  const active = states.filter((s) => !isTerminal(s as ProvisioningState)).length;
  const terminal = succeeded + failed;
  const successRate = terminal === 0 ? 0 : Math.round((succeeded / terminal) * 100);

  const status: ProviderHealthDTO["status"] = !input.configured
    ? "unavailable"
    : terminal === 0
      ? "unknown"
      : successRate >= 80
        ? "healthy"
        : "degraded";

  return {
    providerKey: input.providerKey,
    displayName: input.displayName,
    status,
    configured: input.configured,
    capabilities: input.capabilities,
    statistics: { total: states.length, succeeded, failed, active, successRate },
    message: input.message,
    checkedAt: new Date().toISOString(),
  };
}

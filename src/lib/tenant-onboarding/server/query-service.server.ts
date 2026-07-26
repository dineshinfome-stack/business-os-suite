/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.2 (Workflow persistence & read models)
 *
 * READ-ONLY onboarding composition service. Server only.
 *
 * Authorization posture:
 *   - Every query runs through the CALLER-SCOPED Supabase client injected by
 *     `requireSupabaseAuth`. The service-role client is never imported here,
 *     so RLS (platform-admin only) is the enforcing authority in addition to
 *     the permission middleware in `queries.functions.ts`.
 *   - This module performs NO writes. No lazy seeding, no "ensure row"
 *     side effects, no audit emission.
 */
import {
  mergeActivity,
  notEvaluatedReadiness,
  toAuditActivity,
  toDetailDTO,
  toProgressDTO,
  toStepActivity,
  toStepDTOs,
  toSummaryDTO,
  ONBOARDING_AUDIT_ACTIONS,
  type AuditRowLike,
  type OnboardingRowLike,
  type OnboardingStepRowLike,
  type TenantRowLike,
} from "./mappers.server";
import type { OnboardingListFilterDTO } from "../types/v1";
import type {
  OnboardingPageDTO,
  TenantOnboardingActivityDTO,
  TenantOnboardingDetailDTO,
  TenantOnboardingProgressDTO,
  TenantOnboardingReadinessDTO,
  TenantOnboardingStepDTO,
  TenantOnboardingSummaryDTO,
} from "../types/v1";

export type AnyClient = { from: (table: string) => any };

/** Hard safety ceiling for the combined projection (platform-scale reads). */
export const ONBOARDING_QUEUE_SCAN_LIMIT = 1000;
export const ONBOARDING_ACTIVITY_LIMIT = 100;

const TENANT_COLUMNS = "id, display_name, slug, code, created_at, updated_at";
const ONBOARDING_COLUMNS =
  "id, tenant_id, state, version, started_at, ready_at, activated_at, cancelled_at, blocked_at, blocked_reason_code, blocked_reason_summary, last_readiness_checked_at, last_correlation_id, created_at, updated_at";
const STEP_COLUMNS =
  "tenant_id, step_key, status, attempt_count, started_at, completed_at, blocked_at, failure_code, failure_summary, correlation_id, updated_at";

function unwrapEmbedded(value: unknown): OnboardingRowLike | null {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as OnboardingRowLike) ?? null;
  return value as OnboardingRowLike;
}

function groupSteps(
  rows: readonly OnboardingStepRowLike[],
): Map<string, OnboardingStepRowLike[]> {
  const map = new Map<string, OnboardingStepRowLike[]>();
  for (const row of rows) {
    const list = map.get(row.tenant_id);
    if (list) list.push(row);
    else map.set(row.tenant_id, [row]);
  }
  return map;
}

/* -------------------------------------------------------------- queue read */

/**
 * The operator queue is a LEFT JOIN of tenants → onboarding: every tenant is
 * a queue row, whether or not a workflow row exists. The combined projection
 * is filtered, sorted and paginated as a whole, so synthetic `not_started`
 * rows page identically to persisted ones.
 */
export async function getOnboardingQueue(
  client: AnyClient,
  filters: OnboardingListFilterDTO,
): Promise<OnboardingPageDTO<TenantOnboardingSummaryDTO>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;

  const { data: tenantRows, error: tenantError } = await client
    .from("tenants")
    .select(`${TENANT_COLUMNS}, tenant_onboarding ( ${ONBOARDING_COLUMNS} )`)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(ONBOARDING_QUEUE_SCAN_LIMIT);
  if (tenantError) throw tenantError;

  const { data: stepRows, error: stepError } = await client
    .from("tenant_onboarding_steps")
    .select(STEP_COLUMNS);
  if (stepError) throw stepError;

  const stepsByTenant = groupSteps((stepRows ?? []) as OnboardingStepRowLike[]);

  let rows: TenantOnboardingSummaryDTO[] = ((tenantRows ?? []) as any[]).map(
    (raw) => {
      const tenant = raw as TenantRowLike;
      const onboarding = unwrapEmbedded(raw.tenant_onboarding);
      const steps = toStepDTOs(stepsByTenant.get(tenant.id) ?? []);
      return toSummaryDTO(tenant, onboarding, toProgressDTO(steps));
    },
  );

  /* ------------------------------------------- filters over the projection */

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    rows = rows.filter(
      (r) =>
        r.tenantName.toLowerCase().includes(search) ||
        r.tenantSlug.toLowerCase().includes(search) ||
        (r.tenantCode ?? "").toLowerCase().includes(search),
    );
  }
  if (filters.state && filters.state !== "all") {
    rows = rows.filter((r) => r.state === filters.state);
  }
  if (filters.currentStep && filters.currentStep !== "all") {
    rows = rows.filter((r) => r.currentStepKey === filters.currentStep);
  }
  if (filters.hasBlockers !== undefined) {
    rows = rows.filter((r) => (r.blockerCount > 0) === filters.hasBlockers);
  }
  if (filters.invitationStatus && filters.invitationStatus !== "all") {
    rows = rows.filter((r) => r.invitationStatus === filters.invitationStatus);
  }
  if (filters.readinessStatus && filters.readinessStatus !== "all") {
    rows = rows.filter((r) =>
      filters.readinessStatus === "not_evaluated"
        ? r.readinessEvaluationStatus === "not_evaluated"
        : r.readinessOverallStatus === filters.readinessStatus,
    );
  }
  if (filters.createdFrom) {
    const from = Date.parse(filters.createdFrom);
    rows = rows.filter((r) => Date.parse(r.updatedAt) >= from);
  }
  if (filters.createdTo) {
    const to = Date.parse(filters.createdTo);
    rows = rows.filter((r) => Date.parse(r.updatedAt) <= to);
  }

  /* ---------------------------------------------------------------- sorting */

  const dir = filters.sortDir === "asc" ? 1 : -1;
  const sortBy = filters.sortBy ?? "updatedAt";
  rows.sort((a, b) => {
    switch (sortBy) {
      case "tenantName":
        return a.tenantName.localeCompare(b.tenantName) * dir;
      case "state":
        return a.state.localeCompare(b.state) * dir;
      case "startedAt":
        return (
          ((a.startedAt ? Date.parse(a.startedAt) : 0) -
            (b.startedAt ? Date.parse(b.startedAt) : 0)) *
          dir
        );
      default:
        return (Date.parse(a.updatedAt) - Date.parse(b.updatedAt)) * dir;
    }
  });

  const total = rows.length;
  const start = (page - 1) * pageSize;
  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pageCount: pageSize === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

/* ------------------------------------------------------------- detail read */

async function loadTenant(
  client: AnyClient,
  tenantId: string,
): Promise<TenantRowLike> {
  const { data, error } = await client
    .from("tenants")
    .select(TENANT_COLUMNS)
    .eq("id", tenantId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Response("Not Found", { status: 404 });
  return data as TenantRowLike;
}

async function loadOnboarding(
  client: AnyClient,
  tenantId: string,
): Promise<OnboardingRowLike | null> {
  const { data, error } = await client
    .from("tenant_onboarding")
    .select(ONBOARDING_COLUMNS)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw error;
  return (data as OnboardingRowLike | null) ?? null;
}

async function loadSteps(
  client: AnyClient,
  tenantId: string,
): Promise<OnboardingStepRowLike[]> {
  const { data, error } = await client
    .from("tenant_onboarding_steps")
    .select(STEP_COLUMNS)
    .eq("tenant_id", tenantId);
  if (error) throw error;
  return (data ?? []) as OnboardingStepRowLike[];
}

/**
 * A tenant with no workflow row returns a fully-formed `not_started` detail —
 * no database error, no write, no fabricated identity.
 */
export async function getOnboardingDetail(
  client: AnyClient,
  tenantId: string,
): Promise<TenantOnboardingDetailDTO> {
  const [tenant, onboarding, steps] = await Promise.all([
    loadTenant(client, tenantId),
    loadOnboarding(client, tenantId),
    loadSteps(client, tenantId),
  ]);
  return toDetailDTO(tenant, onboarding, steps);
}

export async function getOnboardingSteps(
  client: AnyClient,
  tenantId: string,
): Promise<TenantOnboardingStepDTO[]> {
  return toStepDTOs(await loadSteps(client, tenantId));
}

export async function getOnboardingProgress(
  client: AnyClient,
  tenantId: string,
): Promise<TenantOnboardingProgressDTO> {
  return toProgressDTO(await getOnboardingSteps(client, tenantId));
}

export async function getOnboardingReadiness(
  client: AnyClient,
  tenantId: string,
): Promise<TenantOnboardingReadinessDTO> {
  const onboarding = await loadOnboarding(client, tenantId);
  return notEvaluatedReadiness(onboarding?.last_readiness_checked_at ?? null);
}

/* ----------------------------------------------------------- activity read */

/**
 * Composed timeline. `includeAuditEntries` is decided by the CALLER's audit
 * permission — the tenant-read permission never grants global audit access.
 * With it false, the timeline is the step-derived subset only.
 */
export async function getOnboardingActivity(
  client: AnyClient,
  tenantId: string,
  includeAuditEntries: boolean,
): Promise<TenantOnboardingActivityDTO[]> {
  const stepRows = await loadSteps(client, tenantId);
  const groups: TenantOnboardingActivityDTO[][] = [toStepActivity(stepRows)];

  if (includeAuditEntries) {
    const { data, error } = await client
      .from("audit_logs")
      .select("id, action, entity_type, entity_id, actor_id, occurred_at, created_at")
      .eq("entity_id", tenantId)
      .in("action", ONBOARDING_AUDIT_ACTIONS)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false })
      .limit(ONBOARDING_ACTIVITY_LIMIT);
    if (error) throw error;
    groups.push(toAuditActivity((data ?? []) as AuditRowLike[]));
  }

  return mergeActivity(...groups).slice(0, ONBOARDING_ACTIVITY_LIMIT);
}

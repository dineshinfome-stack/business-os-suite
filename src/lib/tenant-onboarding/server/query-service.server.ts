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
  envelopeOnboardingRow,
  envelopeTenantRow,
  mergeActivity,
  notEvaluatedReadiness,
  parseQueueEnvelope,
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

export type AnyClient = {
  from: (table: string) => any;
  rpc?: (...args: any[]) => any;
};

export const ONBOARDING_ACTIVITY_LIMIT = 100;

/** Canonical name of the exact-pagination queue routine (Pass 3.8.2R). */
export const ONBOARDING_QUEUE_RPC = "fn_tenant_onboarding_queue";

const TENANT_COLUMNS = "id, display_name, slug, code, created_at, updated_at";
const ONBOARDING_COLUMNS =
  "id, tenant_id, state, version, started_at, ready_at, activated_at, cancelled_at, blocked_at, blocked_reason_code, blocked_reason_summary, last_readiness_checked_at, last_correlation_id, created_at, updated_at";
const STEP_COLUMNS =
  "tenant_id, step_key, status, attempt_count, started_at, completed_at, blocked_at, failure_code, failure_summary, correlation_id, updated_at";

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
 * Pass 3.8.2 remediation (REM-382-002).
 *
 * Filtering, sorting, counting and paging all happen inside
 * `public.fn_tenant_onboarding_queue`, a SECURITY INVOKER routine. There is no
 * scan ceiling and no in-memory paging: the envelope always carries the EXACT
 * filtered total, computed from the SAME filtered snapshot as the page rows.
 *
 * Authorization is enforced twice and independently: the permission
 * middleware in `queries.functions.ts`, and the routine itself, which raises
 * SQLSTATE 42501 for a caller without `platform.tenant.read`. A denial is
 * therefore never confusable with an empty result.
 *
 * Step rows are loaded ONLY for the tenants on the returned page.
 */
export async function getOnboardingQueue(
  client: AnyClient,
  filters: OnboardingListFilterDTO,
): Promise<OnboardingPageDTO<TenantOnboardingSummaryDTO>> {
  if (typeof client.rpc !== "function") {
    throw new Error("Supabase client does not expose rpc()");
  }

  const { data, error } = await client.rpc(ONBOARDING_QUEUE_RPC, {
    _search: filters.search ?? null,
    _state: filters.state ?? null,
    _current_step: filters.currentStep ?? null,
    _has_blockers: filters.hasBlockers ?? null,
    _invitation_status: filters.invitationStatus ?? null,
    _readiness_status: filters.readinessStatus ?? null,
    _created_from: filters.createdFrom ?? null,
    _created_to: filters.createdTo ?? null,
    _sort_by: filters.sortBy ?? null,
    _sort_dir: filters.sortDir ?? null,
    _page: filters.page ?? null,
    _page_size: filters.pageSize ?? null,
  });
  if (error) throw error;

  const envelope = parseQueueEnvelope(data);

  const tenantIds = envelope.rows.map((r) => r.tenant_id);
  let stepsByTenant = new Map<string, OnboardingStepRowLike[]>();
  if (tenantIds.length > 0) {
    const { data: stepRows, error: stepError } = await client
      .from("tenant_onboarding_steps")
      .select(STEP_COLUMNS)
      .in("tenant_id", tenantIds);
    if (stepError) throw stepError;
    stepsByTenant = groupSteps((stepRows ?? []) as OnboardingStepRowLike[]);
  }

  const rows = envelope.rows.map((row) => {
    const tenant = envelopeTenantRow(row);
    const onboarding = envelopeOnboardingRow(row);
    const steps = toStepDTOs(stepsByTenant.get(tenant.id) ?? []);
    return toSummaryDTO(tenant, onboarding, toProgressDTO(steps));
  });

  const total = envelope.total_count;
  const pageSize = envelope.page_size;
  return {
    rows,
    total,
    page: envelope.page,
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

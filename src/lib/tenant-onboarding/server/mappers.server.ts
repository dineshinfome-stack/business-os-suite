/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.2 (Workflow persistence & read models)
 *
 * Row → DTO mappers. THE APPLICATION OWNS THE CONTRACT: no SQL view, no
 * PostgREST shape and no database row ever crosses the server-function
 * boundary. These functions are pure (no client, no I/O) so they are fully
 * unit-testable, and they are the single conversion point for the read layer.
 *
 * Synthetic identity contract (Pass 3.8.2 clarification #2):
 *   A tenant with no `tenant_onboarding` row is a legitimate, expected state.
 *   It is projected as a `not_started` workflow. NOTHING is fabricated:
 *   - no synthetic UUID (`persisted: false`, `version: null`),
 *   - no synthetic timestamps (`startedAt`/`readyAt`/`activatedAt` are null,
 *     `updatedAt` reuses the tenant's own persisted `updated_at`).
 *   Reads never write. There are no lazy-seed side effects in this pass.
 */
import {
  ONBOARDING_STEPS,
  TERMINAL_STEP_STATUSES,
  isOnboardingStepStatus,
  type OnboardingStepKey,
  type OnboardingStepStatus,
} from "../contracts";
import {
  allowedIntents,
  isTenantOnboardingState,
  type OnboardingTransitionIntent,
  type TenantOnboardingState,
} from "../state-machine";
import type {
  OnboardingAvailableActionDTO,
  TenantOnboardingActivityDTO,
  TenantOnboardingDetailDTO,
  TenantOnboardingProgressDTO,
  TenantOnboardingReadinessDTO,
  TenantOnboardingStepDTO,
  TenantOnboardingSummaryDTO,
} from "../types/v1";

/* ------------------------------------------------------------- row shapes */

export interface TenantRowLike {
  id: string;
  display_name: string;
  slug: string;
  code: string | null;
  updated_at: string;
  created_at: string;
}

export interface OnboardingRowLike {
  id: string;
  tenant_id: string;
  state: string;
  version: number;
  started_at: string | null;
  ready_at: string | null;
  activated_at: string | null;
  cancelled_at: string | null;
  blocked_at: string | null;
  blocked_reason_code: string | null;
  blocked_reason_summary: string | null;
  last_readiness_checked_at: string | null;
  last_correlation_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStepRowLike {
  tenant_id: string;
  step_key: string;
  status: string;
  attempt_count: number;
  started_at: string | null;
  completed_at: string | null;
  blocked_at: string | null;
  failure_code: string | null;
  failure_summary: string | null;
  correlation_id: string | null;
  updated_at: string;
}

export interface AuditRowLike {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  actor_id: string | null;
  occurred_at: string | null;
  created_at: string;
}

/** Deep links stay in-app; never an external URL. */
const STEP_DEEP_LINKS: Readonly<Record<OnboardingStepKey, string | null>> = {
  provisioning_verified: "/platform/provisioning",
  organization_profile: "/platform/companies",
  primary_branch: "/platform/companies",
  tenant_admin_invitation: null,
  tenant_admin_membership: null,
  roles_assigned: "/platform/admin",
  required_settings: "/platform/admin/settings",
  financial_year: "/platform/companies",
  readiness_validation: null,
  activation: "/platform/tenants",
};

const INTENT_LABELS: Readonly<Record<OnboardingTransitionIntent, string>> = {
  start: "Start onboarding",
  block: "Mark blocked",
  resume: "Resume",
  mark_ready: "Mark ready for activation",
  invalidate_readiness: "Invalidate readiness",
  activate: "Activate workspace",
  cancel: "Cancel onboarding",
  restart: "Restart onboarding",
};

/**
 * Audit actions that may appear in an onboarding timeline. Anything outside
 * this allow-list is dropped, so a global audit feed can never leak through
 * the onboarding surface.
 */
export const ONBOARDING_AUDIT_ACTIONS: readonly string[] = [
  "onboarding.step.verified",
  "onboarding.organization.saved",
  "onboarding.branch.saved",
  "onboarding.invitation.created",
  "onboarding.invitation.revoked",
  "onboarding.membership.observed",
  "onboarding.roles.assigned",
  "onboarding.settings.initialized",
  "onboarding.financial_year.initialized",
  "onboarding.readiness.evaluated",
  "onboarding.activated",
  "onboarding.cancelled",
  "onboarding.restarted",
];

const AUDIT_ACTION_SET = new Set(ONBOARDING_AUDIT_ACTIONS);

export function isOnboardingAuditAction(action: string): boolean {
  return AUDIT_ACTION_SET.has(action);
}

/* -------------------------------------------------------------- primitives */

export function toOnboardingState(value: unknown): TenantOnboardingState {
  return isTenantOnboardingState(value) ? value : "not_started";
}

function toStepStatus(value: unknown): OnboardingStepStatus {
  return isOnboardingStepStatus(value) ? value : "not_started";
}

/* ------------------------------------------------------------------ steps */

/**
 * Registry-driven projection. The canonical registry — not the table — is the
 * source of truth for which steps exist; absent rows read as `not_started`.
 */
export function toStepDTOs(
  rows: readonly OnboardingStepRowLike[],
): TenantOnboardingStepDTO[] {
  const byKey = new Map(rows.map((r) => [r.step_key, r]));
  return ONBOARDING_STEPS.map((spec) => {
    const row = byKey.get(spec.key);
    return {
      stepKey: spec.key,
      label: spec.label,
      sequence: spec.sequence,
      status: row ? toStepStatus(row.status) : "not_started",
      requirement: spec.requirement,
      attemptCount: row?.attempt_count ?? 0,
      startedAt: row?.started_at ?? null,
      completedAt: row?.completed_at ?? null,
      failureCode: row?.failure_code ?? null,
      failureSummary: row?.failure_summary ?? null,
      // Commands arrive in later passes; the read layer offers none.
      availableAction: null,
      deepLink: STEP_DEEP_LINKS[spec.key],
      implementationPass: spec.implementationPass,
    };
  });
}

export function toProgressDTO(
  steps: readonly TenantOnboardingStepDTO[],
): TenantOnboardingProgressDTO {
  const applicableSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const skippedSteps = steps.filter((s) => s.status === "skipped").length;
  const blockedSteps = steps.filter((s) => s.status === "blocked").length;
  const failedSteps = steps.filter((s) => s.status === "failed").length;
  const settled = completedSteps + skippedSteps;
  const percent =
    applicableSteps === 0 ? 0 : Math.round((settled / applicableSteps) * 100);
  const current =
    steps.find((s) => !TERMINAL_STEP_STATUSES.has(s.status))?.stepKey ?? null;

  return {
    completedSteps,
    applicableSteps,
    skippedSteps,
    blockedSteps,
    failedSteps,
    percent,
    currentStepKey: current,
  };
}

/* -------------------------------------------------------------- readiness */

/**
 * Readiness EVALUATION is owned by Pass 3.8.5. This pass is contractually
 * pinned to `not_evaluated` and never invents an overall status.
 */
export function notEvaluatedReadiness(
  lastCheckedAt: string | null = null,
): TenantOnboardingReadinessDTO {
  return {
    evaluationStatus: "not_evaluated",
    overallStatus: null,
    evaluatedAt: lastCheckedAt,
    workflowVersion: "v1",
    checks: [],
    blockingCount: 0,
    warningCount: 0,
    correlationId: null,
  };
}

/* ---------------------------------------------------------------- summary */

export function toSummaryDTO(
  tenant: TenantRowLike,
  onboarding: OnboardingRowLike | null,
  progress: TenantOnboardingProgressDTO,
): TenantOnboardingSummaryDTO {
  const state = onboarding ? toOnboardingState(onboarding.state) : "not_started";
  return {
    tenantId: tenant.id,
    tenantName: tenant.display_name,
    tenantSlug: tenant.slug,
    tenantCode: tenant.code,
    state,
    progressPercent: progress.percent,
    currentStepKey: state === "not_started" ? null : progress.currentStepKey,
    // Blocker evaluation is owned by Pass 3.8.5; the read layer asserts none.
    blockerCount: 0,
    blockerSummary: onboarding?.blocked_reason_summary ?? null,
    invitationStatus: "none",
    readinessEvaluationStatus: "not_evaluated",
    readinessOverallStatus: null,
    startedAt: onboarding?.started_at ?? null,
    // Persisted timestamp only — the tenant's own `updated_at` when the
    // workflow row does not exist. Nothing is fabricated.
    updatedAt: onboarding?.updated_at ?? tenant.updated_at,
    readyAt: onboarding?.ready_at ?? null,
    activatedAt: onboarding?.activated_at ?? null,
    persisted: onboarding !== null,
  };
}

/* ------------------------------------------------------- available actions */

export function toAvailableActions(
  state: TenantOnboardingState,
  persisted: boolean,
): OnboardingAvailableActionDTO[] {
  return allowedIntents(state).map((intent) => ({
    intent,
    label: INTENT_LABELS[intent],
    // Commands land in Passes 3.8.3–3.8.5. The read layer advertises the
    // legal transitions but never enables them.
    enabled: false,
    disabledReason: persisted
      ? "Onboarding commands are not available yet."
      : "Onboarding has not been started for this business yet.",
  }));
}

/* ----------------------------------------------------------------- detail */

export function toDetailDTO(
  tenant: TenantRowLike,
  onboarding: OnboardingRowLike | null,
  stepRows: readonly OnboardingStepRowLike[],
): TenantOnboardingDetailDTO {
  const steps = toStepDTOs(stepRows);
  const progress = toProgressDTO(steps);
  const summary = toSummaryDTO(tenant, onboarding, progress);

  return {
    summary,
    // Domain composition (organization, branch, invitation, membership) is
    // owned by Passes 3.8.3–3.8.4.
    organization: null,
    primaryBranch: null,
    adminInvitation: null,
    adminMembership: null,
    steps,
    progress,
    blockers: [],
    readiness: notEvaluatedReadiness(
      onboarding?.last_readiness_checked_at ?? null,
    ),
    availableActions: toAvailableActions(summary.state, summary.persisted),
    version: onboarding?.version ?? null,
    persisted: onboarding !== null,
  };
}

/* --------------------------------------------------------------- activity */

const STEP_TONE: Readonly<Record<OnboardingStepStatus, TenantOnboardingActivityDTO["tone"]>> =
  {
    not_started: "neutral",
    in_progress: "neutral",
    completed: "success",
    blocked: "warning",
    failed: "danger",
    skipped: "neutral",
  };

export function toStepActivity(
  rows: readonly OnboardingStepRowLike[],
): TenantOnboardingActivityDTO[] {
  const labels = new Map(ONBOARDING_STEPS.map((s) => [s.key, s.label]));
  return rows.map((row) => {
    const status = toStepStatus(row.status);
    const label = labels.get(row.step_key as OnboardingStepKey) ?? row.step_key;
    return {
      id: `onboarding_step:${row.tenant_id}:${row.step_key}`,
      source: "onboarding_step" as const,
      occurredAt: row.updated_at,
      action: `onboarding.step.${status}`,
      label,
      description:
        row.failure_summary ?? `Step "${label}" is ${status.replace(/_/g, " ")}.`,
      tone: STEP_TONE[status],
      stepKey: labels.has(row.step_key as OnboardingStepKey)
        ? (row.step_key as OnboardingStepKey)
        : null,
      actorId: null,
      correlationId: row.correlation_id,
    };
  });
}

/**
 * Audit → activity. Only allow-listed onboarding actions survive, and raw
 * `old_values` / `new_values` never cross this boundary.
 */
export function toAuditActivity(
  rows: readonly AuditRowLike[],
): TenantOnboardingActivityDTO[] {
  return rows
    .filter((row) => isOnboardingAuditAction(row.action))
    .map((row) => ({
      id: `audit_log:${row.id}`,
      source: "audit_log" as const,
      occurredAt: row.occurred_at ?? row.created_at,
      action: row.action,
      label: row.action,
      description: `Recorded ${row.action}.`,
      tone: "neutral" as const,
      stepKey: null,
      actorId: row.actor_id,
      correlationId: null,
    }));
}

export function mergeActivity(
  ...groups: readonly TenantOnboardingActivityDTO[][]
): TenantOnboardingActivityDTO[] {
  return groups
    .flat()
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

/* ------------------------------------------------- queue envelope (3.8.2R) */

/**
 * Pass 3.8.2 remediation (REM-382-002).
 *
 * `public.fn_tenant_onboarding_queue` returns a single envelope carrying an
 * EXACT filtered total plus the requested page, both derived from one
 * filtered snapshot. Nothing is cast: the raw jsonb is validated here before
 * a single field reaches a v1 DTO.
 *
 * `rows` is `z.array(...)`, so `rows: null` is a CONTRACT VIOLATION and is
 * rejected rather than coerced — the SQL side guarantees `[]` via COALESCE.
 */
const queueEnvelopeRowSchema = z
  .object({
    result_position: z.number().int().positive(),
    tenant_id: z.string(),
    display_name: z.string(),
    slug: z.string(),
    code: z.string().nullable(),
    tenant_created_at: z.string(),
    tenant_updated_at: z.string(),
    current_step_key: z.string().nullable(),
    onboarding: z
      .object({
        id: z.string(),
        tenant_id: z.string(),
        state: z.string(),
        version: z.number(),
        started_at: z.string().nullable(),
        ready_at: z.string().nullable(),
        activated_at: z.string().nullable(),
        cancelled_at: z.string().nullable(),
        blocked_at: z.string().nullable(),
        blocked_reason_code: z.string().nullable(),
        blocked_reason_summary: z.string().nullable(),
        last_readiness_checked_at: z.string().nullable(),
        last_correlation_id: z.string().nullable(),
        created_at: z.string(),
        updated_at: z.string(),
      })
      .nullable(),
  })
  .passthrough();

export const queueEnvelopeSchema = z.object({
  total_count: z.coerce.number().int().nonnegative(),
  rows: z.array(queueEnvelopeRowSchema),
  page: z.coerce.number().int().positive(),
  page_size: z.coerce.number().int().positive(),
});

export type QueueEnvelope = z.infer<typeof queueEnvelopeSchema>;
export type QueueEnvelopeRow = QueueEnvelope["rows"][number];

export function parseQueueEnvelope(raw: unknown): QueueEnvelope {
  return queueEnvelopeSchema.parse(raw);
}

/** Envelope row → the tenant row shape the DTO mappers already consume. */
export function envelopeTenantRow(row: QueueEnvelopeRow): TenantRowLike {
  return {
    id: row.tenant_id,
    display_name: row.display_name,
    slug: row.slug,
    code: row.code,
    created_at: row.tenant_created_at,
    updated_at: row.tenant_updated_at,
  };
}

/** Envelope row → the onboarding row shape the DTO mappers already consume. */
export function envelopeOnboardingRow(
  row: QueueEnvelopeRow,
): OnboardingRowLike | null {
  return (row.onboarding as OnboardingRowLike | null) ?? null;
}

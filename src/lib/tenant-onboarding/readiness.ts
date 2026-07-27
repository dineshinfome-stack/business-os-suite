/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5 (Readiness evaluation)
 *
 * PURE aggregation/mapping module. No database access, no environment access,
 * no server-only imports — safe to unit test and to import from either side.
 *
 * Authority boundary (G38-POL-009 + D1-A):
 *   - The DATABASE owns readiness truth: the check set, their statuses, the
 *     counts, the overall status and the warning fingerprint are computed by
 *     `private.fn_onboarding_evaluate_readiness_json`. This module NEVER
 *     re-derives them; it only validates the envelope and maps it into the
 *     frozen v1 DTO shape.
 *   - Required-settings readiness impact lives in
 *     `public.setting_definitions.readiness_impact`, not in the TypeScript
 *     registry.
 */
import type {
  ReadinessCheckClassification,
  ReadinessCheckStatus,
  ReadinessOverallStatus,
  TenantOnboardingReadinessCheckDTO,
  TenantOnboardingReadinessDTO,
} from "./types/v1";
import type { OnboardingStepKey } from "./contracts";
import { ONBOARDING_STEP_KEYS } from "./contracts";

export const ONBOARDING_EVALUATE_READINESS_RPC = "fn_onboarding_evaluate_readiness";
export const ONBOARDING_PERSIST_READINESS_RPC = "fn_onboarding_persist_readiness";
export const ONBOARDING_ACTIVATE_TENANT_RPC = "fn_onboarding_activate_tenant";

/** Contract version emitted by the database evaluator for this pass. */
export const READINESS_CONTRACT_VERSION = "3.8.5";

/** Frozen v1 status literals — no aliases are introduced. */
const CHECK_STATUSES: readonly ReadinessCheckStatus[] = [
  "not_evaluated",
  "pass",
  "warning",
  "blocked",
  "not_applicable",
];

const CLASSIFICATIONS: readonly ReadinessCheckClassification[] = [
  "mandatory",
  "conditional",
  "warning",
];

const OVERALL_STATUSES: readonly ReadinessOverallStatus[] = [
  "not_ready",
  "ready_with_warnings",
  "ready",
];

/**
 * The 14 canonical readiness checks, in the exact order and with the exact
 * identifiers defined by `docs/60-engineering/PHASE3_GATE38_READINESS_MATRIX.md`.
 * This list is a PRESENTATION ORDER only — the statuses, classifications,
 * counts and overall verdict are produced by the database evaluator.
 */
export const READINESS_CHECK_KEYS = [
  "tenant_exists",
  "provisioning_completed",
  "lifecycle_permits_onboarding",
  "organization_exists",
  "primary_branch_exists",
  "admin_invitation_valid",
  "admin_invitation_accepted",
  "admin_membership_exists",
  "admin_role_assigned",
  "required_settings_valid",
  "financial_year_present",
  "no_failed_or_blocked_step",
  "no_concurrent_activation",
  "no_data_integrity_conflict",
] as const;


export type ReadinessCheckKey = (typeof READINESS_CHECK_KEYS)[number];

const CHECK_ORDER = new Map<string, number>(
  READINESS_CHECK_KEYS.map((key, index) => [key, index]),
);

/* ------------------------------------------------------------- primitives */

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
}

function asOptionalInt(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function asStepKey(value: unknown): OnboardingStepKey | null {
  return typeof value === "string" &&
    (ONBOARDING_STEP_KEYS as readonly string[]).includes(value)
    ? (value as OnboardingStepKey)
    : null;
}

/** Only scalar, non-sensitive params survive the boundary. */
function asReasonParams(value: unknown): Record<string, string | number | boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (
      typeof raw === "string" ||
      typeof raw === "number" ||
      typeof raw === "boolean"
    ) {
      out[key] = raw;
    }
  }
  return out;
}

/* ---------------------------------------------------------------- mapping */

export function toReadinessCheckDTO(
  raw: unknown,
): TenantOnboardingReadinessCheckDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const checkKey = asString(row.checkKey);
  if (!checkKey) return null;

  const status = CHECK_STATUSES.includes(row.status as ReadinessCheckStatus)
    ? (row.status as ReadinessCheckStatus)
    : "not_evaluated";
  const classification = CLASSIFICATIONS.includes(
    row.classification as ReadinessCheckClassification,
  )
    ? (row.classification as ReadinessCheckClassification)
    : "mandatory";

  return {
    checkKey,
    label: asString(row.label) ?? checkKey,
    classification,
    status,
    owningModule: asString(row.owningModule) ?? "platform/onboarding",
    stepKey: asStepKey(row.stepKey),
    reasonCode: asString(row.reasonCode) ?? "unspecified",
    reasonParams: asReasonParams(row.reasonParams),
    explanation: asString(row.explanation) ?? (asString(row.label) ?? checkKey),
    deepLink: asString(row.deepLink),
    evaluatedAt: asString(row.evaluatedAt),
  };
}

/**
 * Maps the database envelope into the frozen v1 readiness DTO.
 * Counts and overall status are taken FROM the database, never recomputed.
 */
export function toReadinessDTO(raw: unknown): TenantOnboardingReadinessDTO {
  const row = (raw ?? {}) as Record<string, unknown>;

  const checks = Array.isArray(row.checks)
    ? (row.checks
        .map(toReadinessCheckDTO)
        .filter(Boolean) as TenantOnboardingReadinessCheckDTO[])
    : [];

  checks.sort(
    (a, b) =>
      (CHECK_ORDER.get(a.checkKey) ?? Number.MAX_SAFE_INTEGER) -
      (CHECK_ORDER.get(b.checkKey) ?? Number.MAX_SAFE_INTEGER),
  );

  const overallStatus = OVERALL_STATUSES.includes(
    row.overall_status as ReadinessOverallStatus,
  )
    ? (row.overall_status as ReadinessOverallStatus)
    : null;

  return {
    evaluationStatus: overallStatus ? "evaluated" : "not_evaluated",
    overallStatus,
    evaluatedAt: asString(row.evaluated_at),
    workflowVersion: "v1",
    checks,
    blockingCount: asCount(row.blocking_count),
    warningCount: asCount(row.warning_count),
    correlationId: asString(row.correlation_id),
    /* additive v1 fields (Pass 3.8.5) */
    tenantId: asString(row.tenant_id),
    applicableCount: asCount(row.applicable_count),
    warningFingerprint: asString(row.warning_fingerprint),
    observedWorkflowVersion: asOptionalInt(row.observed_workflow_version),
    contractVersion: asString(row.contract_version) ?? READINESS_CONTRACT_VERSION,
  };
}

/* ------------------------------------------------------------- predicates */

export function isActivationAllowed(readiness: TenantOnboardingReadinessDTO): boolean {
  return (
    readiness.evaluationStatus === "evaluated" && readiness.blockingCount === 0
  );
}

export function requiresWarningAcknowledgement(
  readiness: TenantOnboardingReadinessDTO,
): boolean {
  return isActivationAllowed(readiness) && readiness.warningCount > 0;
}

/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.1 (Architecture & Contracts)
 *
 * Canonical, PURE onboarding step registry. This file is the single
 * production owner of onboarding step keys, step statuses and step metadata.
 * Type unions, Zod schemas, DTOs and future persistence constraints MUST
 * derive from this registry rather than restating literal key lists.
 *
 * Purity contract: no I/O, no Supabase, no server-function framework, no
 * environment access, no UI imports.
 *
 * Terminology (G38-POL-001): `organizations` IS the company entity. There is
 * deliberately NO `primary_company` step.
 */

/* ----------------------------------------------------------- step statuses */

export const ONBOARDING_STEP_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
  "failed",
  "skipped",
] as const;

export type OnboardingStepStatus = (typeof ONBOARDING_STEP_STATUSES)[number];

/**
 * `failed` and `blocked` are distinct: `failed` records an attempted operation
 * that errored; `blocked` records an unmet precondition owned elsewhere.
 */
export const TERMINAL_STEP_STATUSES: ReadonlySet<OnboardingStepStatus> =
  new Set(["completed", "skipped"]);

/* --------------------------------------------------------------- step keys */

export const ONBOARDING_STEP_KEYS = [
  "provisioning_verified",
  "organization_profile",
  "primary_branch",
  "tenant_admin_invitation",
  "tenant_admin_membership",
  "roles_assigned",
  "required_settings",
  "financial_year",
  "readiness_validation",
  "activation",
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number];

export type OnboardingStepRequirement =
  | "mandatory"
  | "conditional"
  | "warning"
  | "optional";

/** Future implementation pass that owns the step's behaviour. */
export type OnboardingImplementationPass =
  | "3.8.2"
  | "3.8.3"
  | "3.8.4"
  | "3.8.5"
  | "3.8.6"
  | "3.8.7";

export interface OnboardingStepSpec {
  key: OnboardingStepKey;
  /** Operator-facing label. */
  label: string;
  sequence: number;
  /** Exactly one authoritative owning module. */
  owningModule: string;
  /** Owned | composed | coordinated — onboarding never owns domain data. */
  ownership: "owned" | "composed" | "coordinated";
  sourceOfTruth: string;
  requirement: OnboardingStepRequirement;
  /** Policy decision that justifies a conditional/warning/optional step. */
  policyReference: string | null;
  /** May a completed step legitimately be recorded as `skipped`? */
  skippable: boolean;
  implementationPass: OnboardingImplementationPass;
}

/**
 * The canonical registry. Order is the operator-facing sequence.
 */
export const ONBOARDING_STEPS: readonly OnboardingStepSpec[] = [
  {
    key: "provisioning_verified",
    label: "Provisioning verified",
    sequence: 1,
    owningModule: "provisioning",
    ownership: "composed",
    sourceOfTruth: "provisioning_jobs / provisioning_steps",
    requirement: "mandatory",
    policyReference: null,
    skippable: false,
    implementationPass: "3.8.3",
  },
  {
    key: "organization_profile",
    label: "Organization (company) profile",
    sequence: 2,
    owningModule: "organizations",
    ownership: "coordinated",
    sourceOfTruth: "organizations (public.fn_create_company)",
    requirement: "mandatory",
    policyReference: "G38-POL-001",
    skippable: false,
    implementationPass: "3.8.3",
  },
  {
    key: "primary_branch",
    label: "Primary branch",
    sequence: 3,
    owningModule: "branches",
    ownership: "coordinated",
    sourceOfTruth: "branches (is_default)",
    requirement: "mandatory",
    policyReference: null,
    skippable: false,
    implementationPass: "3.8.3",
  },
  {
    key: "tenant_admin_invitation",
    label: "First administrator invitation",
    sequence: 4,
    owningModule: "tenant/invitations",
    ownership: "coordinated",
    sourceOfTruth: "organization_invitations",
    requirement: "mandatory",
    policyReference: "G38-POL-003",
    skippable: false,
    implementationPass: "3.8.4",
  },
  {
    key: "tenant_admin_membership",
    label: "Administrator membership",
    sequence: 5,
    owningModule: "tenant/memberships",
    ownership: "composed",
    sourceOfTruth: "organization_members",
    // Invitation-dependent: cannot exist before acceptance, therefore never a
    // pre-acceptance activation blocker (G38-POL-003).
    requirement: "conditional",
    policyReference: "G38-POL-003",
    skippable: true,
    implementationPass: "3.8.4",
  },
  {
    key: "roles_assigned",
    label: "Administrator role assignment",
    sequence: 6,
    owningModule: "rbac",
    ownership: "coordinated",
    sourceOfTruth:
      "organization_invitations.role (pre-acceptance) / user_roles (post-acceptance)",
    requirement: "conditional",
    policyReference: "G38-POL-003, G38-POL-005",
    skippable: true,
    implementationPass: "3.8.4",
  },
  {
    key: "required_settings",
    label: "Required settings",
    sequence: 7,
    owningModule: "settings",
    ownership: "coordinated",
    sourceOfTruth: "setting_definitions / setting_values",
    requirement: "mandatory",
    policyReference: "G38-POL-010",
    skippable: false,
    implementationPass: "3.8.3",
  },
  {
    key: "financial_year",
    label: "Financial year",
    sequence: 8,
    owningModule: "financial-years",
    ownership: "coordinated",
    sourceOfTruth: "financial_years",
    requirement: "conditional",
    policyReference: "G38-POL-004",
    skippable: true,
    implementationPass: "3.8.3",
  },
  {
    key: "readiness_validation",
    label: "Readiness validation",
    sequence: 9,
    owningModule: "tenant-onboarding",
    ownership: "owned",
    sourceOfTruth: "tenant_onboarding_steps + readiness evaluation (Pass 3.8.5)",
    requirement: "mandatory",
    policyReference: "G38-POL-009",
    skippable: false,
    implementationPass: "3.8.5",
  },
  {
    key: "activation",
    label: "Workspace activation",
    sequence: 10,
    owningModule: "tenant-onboarding",
    ownership: "owned",
    sourceOfTruth: "tenant_onboarding.state + tenant lifecycle delegation",
    requirement: "mandatory",
    policyReference: "G38-POL-002",
    skippable: false,
    implementationPass: "3.8.5",
  },
] as const;

const STEP_INDEX: ReadonlyMap<OnboardingStepKey, OnboardingStepSpec> = new Map(
  ONBOARDING_STEPS.map((s) => [s.key, s]),
);

export function isOnboardingStepKey(value: unknown): value is OnboardingStepKey {
  return typeof value === "string" && STEP_INDEX.has(value as OnboardingStepKey);
}

export function getOnboardingStep(
  key: OnboardingStepKey,
): OnboardingStepSpec {
  const spec = STEP_INDEX.get(key);
  if (!spec) throw new Error(`Unknown onboarding step key: ${key}`);
  return spec;
}

export function isOnboardingStepStatus(
  value: unknown,
): value is OnboardingStepStatus {
  return (
    typeof value === "string" &&
    (ONBOARDING_STEP_STATUSES as readonly string[]).includes(value)
  );
}

/* --------------------------------------------------- step metadata contract */

/**
 * Contract only — Pass 3.8.2 owns persistence. `version` supports the
 * optimistic-concurrency rule documented in the migration design.
 */
export interface OnboardingStepMetadata {
  stepKey: OnboardingStepKey;
  status: OnboardingStepStatus;
  attemptCount: number;
  startedAt: string | null;
  completedAt: string | null;
  blockedAt: string | null;
  /** Stable machine code; never a raw exception. */
  failureCode: string | null;
  /** Sanitized operator-safe summary; never a stack trace or SQL. */
  failureSummary: string | null;
  correlationId: string | null;
  updatedBy: string | null;
  version: number;
}

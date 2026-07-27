/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.3 (Bootstrap commands)
 *
 * WRITE-side onboarding coordination service. Server only.
 *
 * Authorization / boundary posture:
 *   - Every statement runs on the CALLER-SCOPED Supabase client injected by
 *     `requireSupabaseAuth`. The service-role client is never imported here.
 *   - Onboarding tables stay SELECT-only for `authenticated`; all workflow
 *     writes go through the permission-gated routines
 *     `public.fn_onboarding_start` / `public.fn_onboarding_record_step`,
 *     which raise SQLSTATE 42501 without `platform.tenant.update`.
 *   - Onboarding NEVER owns domain data: organizations, branches, settings
 *     and financial years are written through their existing owning RPCs.
 *   - Errors are mapped to stable machine codes and operator-safe messages.
 *     A raw driver message, SQL fragment or stack trace is never returned.
 */
import { newCorrelationId } from "@/lib/correlation";
import { validateSettingValue } from "@/lib/settings-validation";

import {
  ONBOARDING_REQUIRED_SETTINGS,
} from "../required-settings.registry";
import type { OnboardingStepKey, OnboardingStepStatus } from "../contracts";
import type { TenantOnboardingState } from "../state-machine";
import {
  ONBOARDING_ACTIVATE_TENANT_RPC,
  ONBOARDING_PERSIST_READINESS_RPC,
  toReadinessDTO,
} from "../readiness";
import type {
  OnboardingActivationResultDTO,
  OnboardingBootstrapResultDTO,
  TenantOnboardingReadinessDTO,
} from "../types/v1";

export type AnyClient = {
  from: (table: string) => any;
  rpc: (...args: any[]) => any;
};

export interface OnboardingActor {
  userId: string;
}

export const ONBOARDING_START_RPC = "fn_onboarding_start";
export const ONBOARDING_RECORD_STEP_RPC = "fn_onboarding_record_step";

const SETTING_KEY_SET = new Set(ONBOARDING_REQUIRED_SETTINGS.map((s) => s.key));

/* ------------------------------------------------------- error sanitation */

const SAFE_MESSAGES: Record<string, string> = {
  permission_denied: "You do not have permission to perform this action.",
  version_conflict:
    "The workflow changed since it was loaded. Reload and try again.",
  invalid_input: "The submitted values were rejected by validation.",
  not_found: "The referenced record no longer exists.",
  already_activated: "This onboarding workflow is already activated.",
  conflict: "That value conflicts with an existing record.",
  command_failed: "The operation could not be completed.",
  /* Pass 3.8.4 — deterministic onboarding administrator conditions. */
  default_organization_missing: "The tenant has no default organization yet.",
  organization_not_default:
    "That record belongs to an organization that is not the tenant's default organization.",
  invitation_role_conflict:
    "A pending administrator invitation carries a different administrative role.",
  invitation_missing: "No matching administrator invitation exists for this tenant.",
  invitation_expired: "That administrator invitation has expired.",
  invitation_accepted: "That administrator invitation has already been accepted.",
  invitation_email_conflict:
    "A pending administrator invitation already exists for a different email address.",
  /* Pass 3.8.5 — readiness and guarded activation. */
  readiness_blocked:
    "The tenant is not ready for activation. Resolve the blocking checks and try again.",
  warning_acknowledgement_required:
    "Activation requires explicit acknowledgement of the outstanding warnings.",
  lifecycle_state_blocks:
    "The tenant lifecycle state does not allow activation.",
  workflow_not_started: "The onboarding workflow has not been started for this tenant.",
};

/**
 * SQLSTATE-only classification. Driver messages, SQL fragments and stack
 * traces never influence the outcome and never reach the transport layer.
 */
const SQLSTATE_REASONS: Record<string, keyof typeof SAFE_MESSAGES> = {
  "42501": "permission_denied",
  "40001": "version_conflict",
  "22023": "invalid_input",
  "23514": "invalid_input",
  P0002: "not_found",
  PGRST116: "not_found",
  "23505": "conflict",
  P3841: "default_organization_missing",
  P3842: "organization_not_default",
  P3843: "invitation_role_conflict",
  P3844: "invitation_missing",
  P3845: "invitation_expired",
  P3846: "invitation_accepted",
  P3847: "invitation_email_conflict",
  P3848: "readiness_blocked",
  P3849: "warning_acknowledgement_required",
  P384B: "lifecycle_state_blocks",
};

export function classifyError(error: unknown): {
  reasonCode: keyof typeof SAFE_MESSAGES;
  message: string;
} {
  const code = (error as { code?: string } | null)?.code ?? "";
  const reasonCode = SQLSTATE_REASONS[code] ?? "command_failed";
  return { reasonCode, message: SAFE_MESSAGES[reasonCode] };
}

/* ---------------------------------------------------------------- helpers */

interface StepRecordResult {
  state: TenantOnboardingState;
  status: OnboardingStepStatus;
  version: number;
}

async function callRpc<T>(
  client: AnyClient,
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await client.rpc(name, args as never);
  if (error) throw error;
  return data as T;
}

export async function startOnboardingWorkflow(
  client: AnyClient,
  tenantId: string,
  correlationId: string,
): Promise<{ state: TenantOnboardingState; version: number }> {
  const data = await callRpc<{ state: TenantOnboardingState; version: number }>(
    client,
    ONBOARDING_START_RPC,
    { _tenant_id: tenantId, _correlation_id: correlationId },
  );
  return { state: data.state, version: data.version };
}

export async function recordOnboardingStep(
  client: AnyClient,
  input: {
    tenantId: string;
    stepKey: OnboardingStepKey;
    status: OnboardingStepStatus;
    failureCode?: string | null;
    failureSummary?: string | null;
    correlationId: string;
    expectedVersion?: number | null;
  },
): Promise<StepRecordResult> {
  const data = await callRpc<StepRecordResult>(client, ONBOARDING_RECORD_STEP_RPC, {
    _tenant_id: input.tenantId,
    _step_key: input.stepKey,
    _status: input.status,
    _failure_code: input.failureCode ?? null,
    _failure_summary: input.failureSummary ?? null,
    _correlation_id: input.correlationId,
    _expected_version: input.expectedVersion ?? null,
  });
  return data;
}

/** Best-effort audit write; never fails the command. */
async function audit(
  client: AnyClient,
  actor: OnboardingActor,
  action: string,
  tenantId: string,
  extras: Record<string, unknown>,
): Promise<void> {
  try {
    await client.from("audit_logs").insert({
      action,
      entity_type: "tenant_onboarding",
      entity_id: tenantId,
      actor_id: actor.userId,
      created_by: actor.userId,
      updated_by: actor.userId,
      new_values: extras,
    });
  } catch {
    /* audit is observational — never blocks the workflow */
  }
}

function ok(
  tenantId: string,
  stepKey: OnboardingStepKey,
  step: StepRecordResult,
  correlationId: string,
  entityId: string | null,
  message: string,
): OnboardingBootstrapResultDTO {
  return {
    ok: true,
    tenantId,
    stepKey,
    state: step.state,
    reasonCode: null,
    message,
    correlationId,
    version: step.version,
    entityId,
    stepStatus: step.status,
  };
}

function failed(
  tenantId: string,
  stepKey: OnboardingStepKey,
  correlationId: string,
  reasonCode: string,
  message: string,
  state: TenantOnboardingState | null = null,
  stepStatus: OnboardingStepStatus | null = "failed",
): OnboardingBootstrapResultDTO {
  return {
    ok: false,
    tenantId,
    stepKey,
    state,
    reasonCode,
    message,
    correlationId,
    version: null,
    entityId: null,
    stepStatus,
  };
}

/**
 * Runs a domain write, then records the onboarding step. A domain failure is
 * recorded as a `failed` step with a stable code and returned as a typed
 * rejection — the exception never escapes to the transport layer.
 */
async function bootstrap(
  client: AnyClient,
  actor: OnboardingActor,
  args: {
    tenantId: string;
    stepKey: OnboardingStepKey;
    correlationId: string;
    auditAction: string;
    successMessage: string;
    run: () => Promise<{ entityId: string | null; extras: Record<string, unknown> }>;
  },
): Promise<OnboardingBootstrapResultDTO> {
  const { tenantId, stepKey, correlationId } = args;
  try {
    const { entityId, extras } = await args.run();
    const step = await recordOnboardingStep(client, {
      tenantId,
      stepKey,
      status: "completed",
      correlationId,
    });
    await audit(client, actor, args.auditAction, tenantId, {
      step_key: stepKey,
      entity_id: entityId,
      correlation_id: correlationId,
      ...extras,
    });
    return ok(tenantId, stepKey, step, correlationId, entityId, args.successMessage);
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    try {
      await recordOnboardingStep(client, {
        tenantId,
        stepKey,
        status: "failed",
        failureCode: reasonCode,
        failureSummary: message,
        correlationId,
      });
    } catch {
      /* the workflow row may itself be unreachable — surface the original */
    }
    return failed(tenantId, stepKey, correlationId, reasonCode, message);
  }
}

/* --------------------------------------------------------------- commands */

export async function startOnboardingCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: { tenantId: string; correlationId?: string },
): Promise<OnboardingBootstrapResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  try {
    const started = await startOnboardingWorkflow(client, input.tenantId, correlationId);
    await audit(client, actor, "onboarding.started", input.tenantId, {
      correlation_id: correlationId,
      state: started.state,
    });
    return {
      ok: true,
      tenantId: input.tenantId,
      stepKey: null,
      state: started.state,
      reasonCode: null,
      message: "Onboarding workflow started.",
      correlationId,
      version: started.version,
      entityId: null,
      stepStatus: null,
    };
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    return {
      ok: false,
      tenantId: input.tenantId,
      stepKey: null,
      state: null,
      reasonCode,
      message,
      correlationId,
      version: null,
      entityId: null,
      stepStatus: null,
    };
  }
}

/**
 * `provisioning_verified` is COMPOSED: provisioning owns the truth. Onboarding
 * only observes the latest job and records the observation.
 */
export async function verifyProvisioningCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: { tenantId: string; correlationId?: string },
): Promise<OnboardingBootstrapResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  const stepKey: OnboardingStepKey = "provisioning_verified";
  try {
    const { data, error } = await client
      .from("provisioning_jobs")
      .select("id, state")
      .eq("tenant_id", input.tenantId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    const job = ((data ?? []) as { id: string; state: string }[])[0] ?? null;
    const verified = job?.state === "completed";

    const step = await recordOnboardingStep(client, {
      tenantId: input.tenantId,
      stepKey,
      status: verified ? "completed" : "blocked",
      failureCode: verified ? null : job ? "provisioning_incomplete" : "provisioning_missing",
      failureSummary: verified
        ? null
        : job
          ? "Provisioning has not reached the completed state."
          : "No provisioning job exists for this tenant.",
      correlationId,
    });

    if (verified) {
      await audit(client, actor, "onboarding.step.verified", input.tenantId, {
        step_key: stepKey,
        provisioning_job_id: job?.id ?? null,
        correlation_id: correlationId,
      });
      return ok(
        input.tenantId,
        stepKey,
        step,
        correlationId,
        job?.id ?? null,
        "Provisioning verified.",
      );
    }

    return {
      ...failed(
        input.tenantId,
        stepKey,
        correlationId,
        job ? "provisioning_incomplete" : "provisioning_missing",
        job
          ? "Provisioning has not reached the completed state."
          : "No provisioning job exists for this tenant.",
        step.state,
        step.status,
      ),
      version: step.version,
    };
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    return failed(input.tenantId, stepKey, correlationId, reasonCode, message);
  }
}

export interface SaveOrganizationProfileInput {
  tenantId: string;
  organizationId?: string;
  name: string;
  legalName?: string;
  slug: string;
  region?: string;
  timezone?: string;
  defaultLocale?: string;
  correlationId?: string;
}

export async function saveOrganizationProfileCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: SaveOrganizationProfileInput,
): Promise<OnboardingBootstrapResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  return bootstrap(client, actor, {
    tenantId: input.tenantId,
    stepKey: "organization_profile",
    correlationId,
    auditAction: "onboarding.organization.saved",
    successMessage: "Organization profile saved.",
    run: async () => {
      if (input.organizationId) {
        // Adoption path: the organization already exists and is owned by the
        // organizations module — onboarding does not rewrite it.
        const { data, error } = await client
          .from("organizations")
          .select("id")
          .eq("id", input.organizationId)
          .eq("tenant_id", input.tenantId)
          .is("deleted_at", null)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw { code: "P0002" };
        return {
          entityId: input.organizationId,
          extras: { adopted: true, slug: input.slug },
        };
      }
      const organizationId = await callRpc<string>(client, "fn_create_company", {
        _tenant_id: input.tenantId,
        _slug: input.slug,
        _display_name: input.name,
        _region: input.region ?? "global",
        _default_locale: input.defaultLocale ?? "en",
        _timezone: input.timezone ?? "UTC",
        _legal_name: input.legalName ?? null,
      });
      return { entityId: organizationId, extras: { adopted: false, slug: input.slug } };
    },
  });
}

export interface SavePrimaryBranchInput {
  tenantId: string;
  organizationId: string;
  branchId?: string;
  name?: string;
  code?: string;
  timezone?: string;
  setAsDefault: boolean;
  correlationId?: string;
}

export async function savePrimaryBranchCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: SavePrimaryBranchInput,
): Promise<OnboardingBootstrapResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  return bootstrap(client, actor, {
    tenantId: input.tenantId,
    stepKey: "primary_branch",
    correlationId,
    auditAction: "onboarding.branch.saved",
    successMessage: "Primary branch saved.",
    run: async () => {
      let branchId = input.branchId ?? null;
      if (!branchId) {
        branchId = await callRpc<string>(client, "fn_create_branch", {
          _organization_id: input.organizationId,
          _code: input.code,
          _name: input.name,
          _address: {},
          _timezone: input.timezone ?? "UTC",
          _is_default: input.setAsDefault,
        });
      } else if (input.setAsDefault) {
        await callRpc(client, "fn_set_default_branch", { _id: branchId });
      }
      return {
        entityId: branchId,
        extras: {
          organization_id: input.organizationId,
          is_default: input.setAsDefault,
        },
      };
    },
  });
}

export interface InitializeSettingsInput {
  tenantId: string;
  organizationId: string;
  values: { key: string; value: string | number | boolean }[];
  correlationId?: string;
}

/**
 * Allow-listed by the repository-owned onboarding settings registry
 * (G38-POL-010). An unknown key, or a framework-owned definition, is rejected
 * before any write happens.
 */
export async function initializeSettingsCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: InitializeSettingsInput,
): Promise<OnboardingBootstrapResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  return bootstrap(client, actor, {
    tenantId: input.tenantId,
    stepKey: "required_settings",
    correlationId,
    auditAction: "onboarding.settings.initialized",
    successMessage: "Required settings initialized.",
    run: async () => {
      for (const entry of input.values) {
        if (!SETTING_KEY_SET.has(entry.key)) throw { code: "22023" };
      }

      const keys = input.values.map((v) => v.key);
      const { data, error } = await client
        .from("setting_definitions")
        .select("id, key, scope, data_type, validation_schema, is_system, is_sensitive")
        .in("key", keys);
      if (error) throw error;

      const defs = new Map(
        ((data ?? []) as Record<string, unknown>[]).map((row) => [row.key as string, row]),
      );

      for (const entry of input.values) {
        const def = defs.get(entry.key);
        if (!def) throw { code: "P0002" };
        if (def.is_system === true) throw { code: "22023" };

        const parsed = validateSettingValue(
          def.data_type as never,
          (def.validation_schema ?? {}) as never,
          entry.value,
        );
        const organizationId =
          def.scope === "platform" ? null : input.organizationId;

        const existingQuery = client
          .from("setting_values")
          .select("id")
          .eq("definition_id", def.id);
        const { data: existing, error: exErr } =
          organizationId === null
            ? await existingQuery.is("organization_id", null)
            : await existingQuery.eq("organization_id", organizationId);
        if (exErr) throw exErr;

        const payload = {
          definition_id: def.id,
          organization_id: organizationId,
          value: parsed,
          updated_by: actor.userId,
        };

        if (existing && (existing as { id: string }[]).length > 0) {
          const { error: upErr } = await client
            .from("setting_values")
            .update(payload)
            .eq("id", (existing as { id: string }[])[0].id);
          if (upErr) throw upErr;
        } else {
          const { error: insErr } = await client
            .from("setting_values")
            .insert(payload);
          if (insErr) throw insErr;
        }
      }

      // Sensitive values are never echoed into audit metadata.
      return { entityId: input.organizationId, extras: { keys } };
    },
  });
}

export interface InitializeFinancialYearInput {
  tenantId: string;
  organizationId: string;
  code: string;
  startDate: string;
  endDate: string;
  setAsDefault: boolean;
  correlationId?: string;
}

export async function initializeFinancialYearCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: InitializeFinancialYearInput,
): Promise<OnboardingBootstrapResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  return bootstrap(client, actor, {
    tenantId: input.tenantId,
    stepKey: "financial_year",
    correlationId,
    auditAction: "onboarding.financial_year.initialized",
    successMessage: "Financial year initialized.",
    run: async () => {
      const financialYearId = await callRpc<string>(
        client,
        "fn_create_financial_year",
        {
          _organization_id: input.organizationId,
          _code: input.code,
          _start_date: input.startDate,
          _end_date: input.endDate,
          _is_default: input.setAsDefault,
        },
      );
      return {
        entityId: financialYearId,
        extras: {
          organization_id: input.organizationId,
          code: input.code,
          start_date: input.startDate,
          end_date: input.endDate,
        },
      };
    },
  });
}

/* ------------------------------- Pass 3.8.5 readiness & guarded activation */

/**
 * EXPLICIT readiness persistence. Separate from the read path by design:
 * reading readiness never writes, and persisting a snapshot always requires
 * `platform.tenant.update` (enforced inside the RPC, not only in middleware).
 *
 * The snapshot, its counts, its overall status and its warning fingerprint
 * are all produced by the database. Nothing is recomputed here.
 */
export async function refreshOnboardingReadinessCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: { tenantId: string; correlationId?: string },
): Promise<TenantOnboardingReadinessDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  const data = await callRpc<unknown>(client, ONBOARDING_PERSIST_READINESS_RPC, {
    _tenant_id: input.tenantId,
    _correlation_id: correlationId,
  });
  const readiness = toReadinessDTO(data);
  await audit(client, actor, "tenant_onboarding.readiness_refreshed", input.tenantId, {
    overall_status: readiness.overallStatus,
    blocking_count: readiness.blockingCount,
    warning_count: readiness.warningCount,
    correlation_id: correlationId,
  });
  return readiness;
}

function activationFailure(
  tenantId: string,
  correlationId: string,
  reasonCode: string,
  message: string,
): OnboardingActivationResultDTO {
  return {
    ok: false,
    tenantId,
    state: null,
    activatedAt: null,
    lifecycleTransitionApplied: false,
    idempotentReplay: false,
    blockingCount: 0,
    warningCount: 0,
    reasonCode,
    message,
    correlationId,
    version: null,
    warningsAcknowledged: false,
    warningFingerprint: null,
  };
}

/**
 * Guarded tenant activation.
 *
 * The database routine is the CANONICAL activation writer: within one locked
 * transaction it re-evaluates readiness, refuses on any blocking check,
 * demands explicit warning acknowledgement, records the acknowledgement,
 * applies the `created → active` lifecycle transition through the shared
 * transition validator, marks the workflow activated and stores the snapshot.
 * Nothing about that decision is taken from the client.
 */
export async function activateTenantCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: {
    tenantId: string;
    acknowledgeWarnings?: boolean;
    expectedVersion?: number;
    correlationId?: string;
  },
): Promise<OnboardingActivationResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  try {
    const data = await callRpc<Record<string, unknown>>(
      client,
      ONBOARDING_ACTIVATE_TENANT_RPC,
      {
        _tenant_id: input.tenantId,
        _expected_version: input.expectedVersion ?? null,
        _acknowledge_warnings: input.acknowledgeWarnings ?? false,
        _correlation_id: correlationId,
      },
    );

    const idempotentReplay = data.idempotent_replay === true;
    const result: OnboardingActivationResultDTO = {
      ok: true,
      tenantId: input.tenantId,
      state: (data.state as TenantOnboardingState) ?? "activated",
      activatedAt: (data.activated_at as string | null) ?? null,
      lifecycleTransitionApplied: data.lifecycle_transition_applied === true,
      idempotentReplay,
      blockingCount: Number(data.blocking_count ?? 0),
      warningCount: Number(data.warning_count ?? 0),
      reasonCode: null,
      message: idempotentReplay
        ? "This tenant was already activated."
        : "The tenant was activated.",
      correlationId,
      version: data.version === null || data.version === undefined
        ? null
        : Number(data.version),
      warningsAcknowledged: data.warnings_acknowledged === true,
      warningFingerprint: (data.warning_fingerprint as string | null) ?? null,
    };

    if (!idempotentReplay) {
      await audit(client, actor, "tenant_onboarding.activation_requested", input.tenantId, {
        warning_count: result.warningCount,
        warnings_acknowledged: result.warningsAcknowledged,
        lifecycle_transition_applied: result.lifecycleTransitionApplied,
        correlation_id: correlationId,
      });
    }
    return result;
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    return activationFailure(input.tenantId, correlationId, reasonCode, message);
  }
}

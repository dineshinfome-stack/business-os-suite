/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.4
 * Tenant administrator invitation, membership observation and role assignment.
 *
 * Boundary posture (identical to Pass 3.8.3):
 *   - Everything runs on the CALLER-SCOPED Supabase client. The service-role
 *     client is never imported.
 *   - Onboarding never owns domain data. Invitations, memberships and role
 *     grants stay owned by their modules; the permission-gated routines
 *     `fn_onboarding_resolve_first_admin`, `fn_onboarding_invite_first_admin`,
 *     `fn_onboarding_revoke_invitation` and `fn_onboarding_assign_admin_role`
 *     re-check `platform.tenant.update` and raise SQLSTATE 42501 without it.
 *   - Membership is OBSERVED, never created here: the existing invitation
 *     acceptance flow materializes it.
 *   - Roles are ASSIGNED from the globally seeded catalogue, never created.
 *   - The one-time invitation secret is hashed before it leaves this module.
 *     It is never returned, logged, audited or persisted in plaintext.
 */
import { createHash, randomBytes } from "node:crypto";

import { newCorrelationId } from "@/lib/correlation";

import type { OnboardingStepKey } from "../contracts";
import type {
  OnboardingAdminActionResultDTO,
  OnboardingInvitationState,
  OnboardingMembershipState,
  OnboardingRoleGrantState,
  OnboardingRoleIntentState,
} from "../types/v1";
import {
  classifyError,
  recordOnboardingStep,
  startOnboardingWorkflow,
  type AnyClient,
  type OnboardingActor,
} from "./command-service.server";

export const RESOLVE_ADMIN_RPC = "fn_onboarding_resolve_first_admin";
/**
 * Atomic create/replay and resend. The legacy six-argument
 * `fn_onboarding_invite_first_admin` is retired and no longer executable by
 * `authenticated`; it must never be called from application code.
 */
export const INVITE_ADMIN_ATOMIC_RPC = "fn_onboarding_invite_first_admin_atomic";
export const RESEND_ADMIN_ATOMIC_RPC = "fn_onboarding_resend_first_admin_atomic";
export const REVOKE_INVITATION_RPC = "fn_onboarding_revoke_invitation";
export const ASSIGN_ADMIN_ROLE_RPC = "fn_onboarding_assign_admin_role";

/** Invitation lifetime, matching the existing organization invitation flow. */
const INVITE_TTL_HOURS = 168;

/** Administrative invitation roles. `member` is deliberately absent. */
export const ADMINISTRATIVE_INVITATION_ROLES = ["owner", "admin"] as const;
export type AdministrativeInvitationRole =
  (typeof ADMINISTRATIVE_INVITATION_ROLES)[number];

export function isAdministrativeInvitationRole(
  role: string | null | undefined,
): role is AdministrativeInvitationRole {
  return role === "owner" || role === "admin";
}

/* ------------------------------------------------------- secret handling */

function hashInvitationSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

function generateInvitationSecret(): string {
  return randomBytes(32).toString("base64url");
}

/* ------------------------------------------------------------ resolution */

export interface ResolvedAdminState {
  organizationId: string | null;
  invitation: {
    id: string;
    organizationId: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string | null;
    acceptedAt: string | null;
    acceptedBy: string | null;
    revokedAt: string | null;
    createdAt: string;
  } | null;
  membership: {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    status: string;
    joinedAt: string | null;
  } | null;
  roleGranted: boolean;
}

type RawResolve = {
  organization_id: string | null;
  invitation: Record<string, unknown> | null;
  membership: Record<string, unknown> | null;
  role_granted: boolean;
};

/**
 * Authoritative first-administrator resolution. The routine itself validates
 * tenant ↔ organization ownership; a caller-supplied organization can never
 * widen the scope.
 */
export async function resolveFirstAdministrator(
  client: AnyClient,
  tenantId: string,
  email?: string | null,
): Promise<ResolvedAdminState> {
  const { data, error } = await client.rpc(RESOLVE_ADMIN_RPC, {
    _tenant_id: tenantId,
    _email: email ?? null,
  } as never);
  if (error) throw error;
  const raw = (data ?? {}) as RawResolve;
  const inv = raw.invitation as Record<string, string | null> | null;
  const mem = raw.membership as Record<string, string | null> | null;
  return {
    organizationId: raw.organization_id ?? null,
    invitation: inv
      ? {
          id: String(inv.id),
          organizationId: String(inv.organization_id),
          email: String(inv.email),
          role: String(inv.role),
          status: String(inv.status),
          expiresAt: inv.expires_at ?? null,
          acceptedAt: inv.accepted_at ?? null,
          acceptedBy: inv.accepted_by ?? null,
          revokedAt: inv.revoked_at ?? null,
          createdAt: String(inv.created_at),
        }
      : null,
    membership: mem
      ? {
          id: String(mem.id),
          organizationId: String(mem.organization_id),
          userId: String(mem.user_id),
          role: String(mem.role),
          status: String(mem.status),
          joinedAt: mem.joined_at ?? null,
        }
      : null,
    roleGranted: raw.role_granted === true,
  };
}

function invitationState(
  invitation: ResolvedAdminState["invitation"],
): OnboardingInvitationState {
  if (!invitation) return "none";
  if (invitation.status === "accepted") return "accepted";
  if (invitation.status === "revoked") return "revoked";
  if (invitation.status === "expired") return "expired";
  if (
    invitation.expiresAt &&
    Date.parse(invitation.expiresAt) <= Date.now()
  ) {
    return "expired";
  }
  return "pending";
}

/* ----------------------------------------------------------- result shape */

interface ResultInit {
  tenantId: string;
  stepKey: OnboardingStepKey;
  correlationId: string;
  ok: boolean;
  message: string;
  reasonCode?: string | null;
  state?: OnboardingAdminActionResultDTO["state"];
  version?: number | null;
  stepStatus?: OnboardingAdminActionResultDTO["stepStatus"];
  invitationId?: string | null;
  organizationId?: string | null;
  invitationStatus?: OnboardingInvitationState;
  membershipStatus?: OnboardingMembershipState;
  roleIntentStatus?: OnboardingRoleIntentState;
  roleGrantStatus?: OnboardingRoleGrantState;
  idempotentReplay?: boolean;
  notificationQueued?: boolean;
  /** Ephemeral handoff; defaults to null so every failure path omits it. */
  oneTimeInvitationToken?: string | null;
}

function result(init: ResultInit): OnboardingAdminActionResultDTO {
  return {
    ok: init.ok,
    tenantId: init.tenantId,
    stepKey: init.stepKey,
    state: init.state ?? null,
    reasonCode: init.reasonCode ?? null,
    message: init.message,
    correlationId: init.correlationId,
    version: init.version ?? null,
    stepStatus: init.stepStatus ?? null,
    invitationId: init.invitationId ?? null,
    organizationId: init.organizationId ?? null,
    invitationStatus: init.invitationStatus ?? "none",
    membershipStatus: init.membershipStatus ?? "unknown",
    roleIntentStatus: init.roleIntentStatus ?? "unknown",
    roleGrantStatus: init.roleGrantStatus ?? "unknown",
    idempotentReplay: init.idempotentReplay ?? false,
    notificationQueued: init.notificationQueued ?? false,
    oneTimeInvitationToken: init.oneTimeInvitationToken ?? null,
  };
}

/** Best-effort, sanitized audit write; never blocks the workflow. */
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
    /* observational only */
  }
}

async function recordSafely(
  client: AnyClient,
  input: Parameters<typeof recordOnboardingStep>[1],
) {
  try {
    return await recordOnboardingStep(client, input);
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------- invite command */

/** Authoritative shape returned by both atomic routines. */
interface RawAtomicResult {
  organization_id: string;
  invitation_id: string;
  invitation_status: string;
  created?: boolean;
  replayed?: boolean;
  membership_status?: string;
  role_granted?: boolean;
  state?: string | null;
  step_status?: string | null;
  step_version?: number | null;
}

function membershipStateOf(raw: string | undefined): OnboardingMembershipState {
  switch (raw) {
    case "active":
      return "active";
    case "inactive":
      return "inactive";
    case "missing_after_acceptance":
      return "missing_after_acceptance";
    case "pending_acceptance":
      return "pending_acceptance";
    default:
      return "unknown";
  }
}

export interface InviteFirstAdministratorInput {
  tenantId: string;
  email: string;
  invitedRole: AdministrativeInvitationRole;
  expectedVersion?: number;
  correlationId?: string;
}

/**
 * Creates — or idempotently replays — the first administrator invitation.
 *
 * The whole operation is ONE database transaction: default-organization
 * resolution, organization-scoped serialization, replay-equivalence and the
 * `tenant_admin_invitation` step write all happen inside
 * `fn_onboarding_invite_first_admin_atomic`. The application therefore never
 * issues a follow-up invitation-step write on any path.
 *
 * The one-time secret is generated here and only its sha256 hash reaches the
 * database. The plaintext is handed back exactly once, on creation, and is
 * never persisted, audited or logged.
 */
export async function inviteFirstTenantAdministratorCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: InviteFirstAdministratorInput,
): Promise<OnboardingAdminActionResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  const stepKey: OnboardingStepKey = "tenant_admin_invitation";
  const base = { tenantId: input.tenantId, stepKey, correlationId };

  try {
    if (!isAdministrativeInvitationRole(input.invitedRole)) {
      const step = await recordSafely(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "blocked",
        failureCode: "invitation_role_not_administrative",
        failureSummary: "The invited role is not an administrative role.",
        correlationId,
      });
      return result({
        ...base,
        ok: false,
        reasonCode: "invitation_role_not_administrative",
        message: "The first administrator must be invited with an administrative role.",
        state: step?.state ?? null,
        stepStatus: step?.status ?? "blocked",
        version: step?.version ?? null,
        roleIntentStatus: "not_administrative",
      });
    }

    const secret = generateInvitationSecret();
    const expiresAt = new Date(
      Date.now() + INVITE_TTL_HOURS * 3600 * 1000,
    ).toISOString();

    const { data, error } = await client.rpc(INVITE_ADMIN_ATOMIC_RPC, {
      _tenant_id: input.tenantId,
      _email: input.email,
      _invited_role: input.invitedRole,
      _token_hash: hashInvitationSecret(secret),
      _expires_at: expiresAt,
      _correlation_id: correlationId,
      _expected_version: input.expectedVersion ?? null,
    } as never);
    if (error) throw error;

    const raw = (data ?? {}) as RawAtomicResult;
    const created = raw.created === true;
    const replay = raw.replayed === true;
    const status = (raw.invitation_status as OnboardingInvitationState) ?? "pending";
    const accepted = status === "accepted";
    const membershipStatus = membershipStateOf(raw.membership_status);

    // Sibling steps only. `tenant_admin_invitation` is already recorded, once,
    // inside the atomic routine — never re-record it here.
    //
    // Integrity rule: only a PRE-acceptance pending invitation may leave these
    // steps `skipped`. Once the invitation is accepted, a missing or inactive
    // membership, or an absent role grant, is a real integrity defect and is
    // recorded as `blocked` with a specific failure code.
    const membershipStep = !accepted
      ? {
          status: "skipped" as const,
          failureCode: "acceptance_pending",
          failureSummary:
            "Membership materializes when the administrator accepts the invitation.",
        }
      : membershipStatus === "active"
        ? { status: "completed" as const, failureCode: null, failureSummary: null }
        : membershipStatus === "missing_after_acceptance"
          ? {
              status: "blocked" as const,
              failureCode: "membership_missing_after_acceptance",
              failureSummary:
                "The invitation is accepted but no organization membership exists.",
            }
          : {
              status: "blocked" as const,
              failureCode: "membership_inactive_after_acceptance",
              failureSummary:
                "The invitation is accepted but the organization membership is not active.",
            };

    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey: "tenant_admin_membership",
      ...membershipStep,
      correlationId,
    });

    const roleStep = !accepted
      ? {
          status: "skipped" as const,
          failureCode: "role_grant_pending_acceptance",
          failureSummary:
            "The invited administrative role is recorded as intent until acceptance.",
        }
      : raw.role_granted === true
        ? { status: "completed" as const, failureCode: null, failureSummary: null }
        : {
            status: "blocked" as const,
            failureCode: "role_grant_missing",
            failureSummary:
              "The invitation is accepted but the administrative role grant is missing.",
          };

    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey: "roles_assigned",
      ...roleStep,
      correlationId,
    });


    await audit(
      client,
      actor,
      created ? "onboarding.invitation.created" : "onboarding.invitation.reused",
      input.tenantId,
      {
        organization_id: raw.organization_id,
        invitation_id: raw.invitation_id,
        role: input.invitedRole,
        invitation_status: status,
        correlation_id: correlationId,
        idempotent_replay: replay,
      },
    );

    return result({
      ...base,
      ok: true,
      message: created
        ? "Administrator invitation created."
        : "An equivalent administrator invitation already exists.",
      state: (raw.state as OnboardingAdminActionResultDTO["state"]) ?? null,
      version: raw.step_version ?? null,
      stepStatus:
        (raw.step_status as OnboardingAdminActionResultDTO["stepStatus"]) ?? "completed",
      invitationId: raw.invitation_id,
      organizationId: raw.organization_id,
      invitationStatus: status,
      membershipStatus,
      roleIntentStatus: "satisfied",
      roleGrantStatus: accepted
        ? raw.role_granted === true
          ? "granted"
          : "missing"
        : "pending_acceptance",
      idempotentReplay: replay,
      notificationQueued: false,
      oneTimeInvitationToken: created ? secret : null,
    });
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey,
      status: "failed",
      failureCode: reasonCode,
      failureSummary: message,
      correlationId,
    });
    return result({ ...base, ok: false, reasonCode, message, stepStatus: "failed" });
  }
}

/* ---------------------------------------------------------- resend command */

export interface ResendFirstAdministratorInvitationInput {
  tenantId: string;
  invitationId: string;
  expectedVersion?: number;
  correlationId?: string;
}

/**
 * Resend is atomic: revoking the superseded invitation, issuing the
 * replacement with a fresh secret and recording the invitation step all happen
 * in one transaction. A failure rolls back the revocation, so the tenant can
 * never be left with no valid administrator invitation.
 */
export async function resendFirstTenantAdministratorInvitationCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: ResendFirstAdministratorInvitationInput,
): Promise<OnboardingAdminActionResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  const stepKey: OnboardingStepKey = "tenant_admin_invitation";
  const base = { tenantId: input.tenantId, stepKey, correlationId };

  try {
    const secret = generateInvitationSecret();
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString();

    const { data, error } = await client.rpc(RESEND_ADMIN_ATOMIC_RPC, {
      _tenant_id: input.tenantId,
      _invitation_id: input.invitationId,
      _token_hash: hashInvitationSecret(secret),
      _expires_at: expiresAt,
      _correlation_id: correlationId,
      _expected_version: input.expectedVersion ?? null,
    } as never);
    if (error) throw error;

    const raw = (data ?? {}) as RawAtomicResult & { previous_invitation_id?: string };

    await audit(client, actor, "onboarding.invitation.resent", input.tenantId, {
      organization_id: raw.organization_id,
      invitation_id: raw.invitation_id,
      previous_invitation_id: raw.previous_invitation_id ?? input.invitationId,
      invitation_status: "pending",
      correlation_id: correlationId,
    });

    return result({
      ...base,
      ok: true,
      message: "Administrator invitation resent.",
      state: (raw.state as OnboardingAdminActionResultDTO["state"]) ?? null,
      version: raw.step_version ?? null,
      stepStatus:
        (raw.step_status as OnboardingAdminActionResultDTO["stepStatus"]) ?? "completed",
      invitationId: raw.invitation_id,
      organizationId: raw.organization_id,
      invitationStatus: "pending",
      membershipStatus: "pending_acceptance",
      roleIntentStatus: "satisfied",
      roleGrantStatus: "pending_acceptance",
      notificationQueued: false,
      oneTimeInvitationToken: secret,
    });
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey,
      status: "failed",
      failureCode: reasonCode,
      failureSummary: message,
      correlationId,
    });
    return result({ ...base, ok: false, reasonCode, message, stepStatus: "failed" });
  }
}

/* ----------------------------------------------------- membership observer */

export interface ObserveAdministratorMembershipInput {
  tenantId: string;
  invitationId?: string;
  expectedVersion?: number;
  correlationId?: string;
}

/**
 * Pure observation: this command never creates a membership and never changes
 * invitation acceptance. Acceptance stays owned by the invitation flow.
 */
export async function observeTenantAdministratorMembershipCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: ObserveAdministratorMembershipInput,
): Promise<OnboardingAdminActionResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  const stepKey: OnboardingStepKey = "tenant_admin_membership";
  const base = { tenantId: input.tenantId, stepKey, correlationId };

  try {
    const state = await resolveFirstAdministrator(client, input.tenantId);
    const invitation = state.invitation;
    const status = invitationState(invitation);

    if (
      !invitation ||
      status === "none" ||
      status === "revoked" ||
      status === "expired" ||
      !isAdministrativeInvitationRole(invitation.role) ||
      (input.invitationId && invitation.id !== input.invitationId)
    ) {
      const code =
        status === "expired"
          ? "invitation_expired"
          : status === "revoked"
            ? "invitation_revoked"
            : "invitation_missing";
      await recordSafely(client, {
        tenantId: input.tenantId,
        stepKey: "tenant_admin_invitation",
        status: "blocked",
        failureCode: code,
        failureSummary: "No valid first-administrator invitation exists.",
        correlationId,
      });
      const step = await recordSafely(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "blocked",
        failureCode: code,
        failureSummary: "Membership cannot be observed without a valid invitation.",
        correlationId,
      });
      return result({
        ...base,
        ok: false,
        reasonCode: code,
        message: "No valid first-administrator invitation exists for this tenant.",
        state: step?.state ?? null,
        version: step?.version ?? null,
        stepStatus: step?.status ?? "blocked",
        organizationId: state.organizationId,
        invitationId: invitation?.id ?? null,
        invitationStatus: status,
      });
    }

    if (status === "pending") {
      const step = await recordOnboardingStep(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "skipped",
        failureCode: "acceptance_pending",
        failureSummary: "The administrator has not accepted the invitation yet.",
        correlationId,
        expectedVersion: input.expectedVersion ?? null,
      });
      await audit(client, actor, "onboarding.membership.observed", input.tenantId, {
        organization_id: state.organizationId,
        invitation_id: invitation.id,
        invitation_status: status,
        membership_status: "pending_acceptance",
        correlation_id: correlationId,
      });
      return result({
        ...base,
        ok: true,
        message: "Membership is pending invitation acceptance.",
        state: step.state,
        version: step.version,
        stepStatus: step.status,
        organizationId: state.organizationId,
        invitationId: invitation.id,
        invitationStatus: status,
        membershipStatus: "pending_acceptance",
        roleIntentStatus: "satisfied",
        roleGrantStatus: "pending_acceptance",
      });
    }

    // Accepted.
    const membership = state.membership;
    const membershipStatus: OnboardingMembershipState = !membership
      ? "missing_after_acceptance"
      : membership.status === "active"
        ? "active"
        : "inactive";

    const failureCode =
      membershipStatus === "active"
        ? null
        : membershipStatus === "inactive"
          ? "membership_inactive_after_acceptance"
          : "membership_missing_after_acceptance";

    const step = await recordOnboardingStep(client, {
      tenantId: input.tenantId,
      stepKey,
      status: membershipStatus === "active" ? "completed" : "blocked",
      failureCode,
      failureSummary:
        membershipStatus === "active"
          ? null
          : "The accepted administrator does not have an active organization membership.",
      correlationId,
      expectedVersion: input.expectedVersion ?? null,
    });

    await audit(client, actor, "onboarding.membership.observed", input.tenantId, {
      organization_id: state.organizationId,
      invitation_id: invitation.id,
      invitation_status: status,
      membership_status: membershipStatus,
      correlation_id: correlationId,
    });

    return result({
      ...base,
      ok: membershipStatus === "active",
      reasonCode: failureCode,
      message:
        membershipStatus === "active"
          ? "Administrator membership is active."
          : "The accepted administrator does not have an active organization membership.",
      state: step.state,
      version: step.version,
      stepStatus: step.status,
      organizationId: state.organizationId,
      invitationId: invitation.id,
      invitationStatus: status,
      membershipStatus,
      roleIntentStatus: "satisfied",
      roleGrantStatus: state.roleGranted ? "granted" : "missing",
    });
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey,
      status: "failed",
      failureCode: reasonCode,
      failureSummary: message,
      correlationId,
    });
    return result({ ...base, ok: false, reasonCode, message, stepStatus: "failed" });
  }
}

/* ------------------------------------------------------- role assignment */

export interface AssignAdministratorRoleInput {
  tenantId: string;
  invitationId?: string;
  expectedVersion?: number;
  correlationId?: string;
}

/**
 * Before acceptance the invited role is INTENT only — no `user_roles` row is
 * written. After acceptance the organization-scoped grant becomes the
 * authoritative fact and is materialized once, idempotently, from the
 * globally seeded role catalogue.
 */
export async function assignTenantAdministratorRoleCommand(
  client: AnyClient,
  actor: OnboardingActor,
  input: AssignAdministratorRoleInput,
): Promise<OnboardingAdminActionResultDTO> {
  const correlationId = input.correlationId ?? newCorrelationId();
  const stepKey: OnboardingStepKey = "roles_assigned";
  const base = { tenantId: input.tenantId, stepKey, correlationId };

  try {
    const state = await resolveFirstAdministrator(client, input.tenantId);
    const invitation = state.invitation;
    const status = invitationState(invitation);

    if (
      !invitation ||
      status === "none" ||
      status === "revoked" ||
      status === "expired" ||
      (input.invitationId && invitation.id !== input.invitationId)
    ) {
      const step = await recordSafely(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "blocked",
        failureCode: "invitation_missing",
        failureSummary: "No valid first-administrator invitation exists.",
        correlationId,
      });
      return result({
        ...base,
        ok: false,
        reasonCode: "invitation_missing",
        message: "No valid first-administrator invitation exists for this tenant.",
        state: step?.state ?? null,
        version: step?.version ?? null,
        stepStatus: step?.status ?? "blocked",
        organizationId: state.organizationId,
        invitationId: invitation?.id ?? null,
        invitationStatus: status,
      });
    }

    if (!isAdministrativeInvitationRole(invitation.role)) {
      const step = await recordSafely(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "blocked",
        failureCode: "invitation_role_not_administrative",
        failureSummary: "The invitation does not carry an administrative role.",
        correlationId,
      });
      return result({
        ...base,
        ok: false,
        reasonCode: "invitation_role_not_administrative",
        message: "Onboarding cannot promote a non-administrative invitation.",
        state: step?.state ?? null,
        version: step?.version ?? null,
        stepStatus: step?.status ?? "blocked",
        organizationId: state.organizationId,
        invitationId: invitation.id,
        invitationStatus: status,
        roleIntentStatus: "not_administrative",
        roleGrantStatus: "missing",
      });
    }

    if (status === "pending") {
      const step = await recordOnboardingStep(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "skipped",
        failureCode: "role_grant_pending_acceptance",
        failureSummary: "The administrative role stays intent until acceptance.",
        correlationId,
        expectedVersion: input.expectedVersion ?? null,
      });
      return result({
        ...base,
        ok: true,
        message: "Administrative role intent recorded; the grant awaits acceptance.",
        state: step.state,
        version: step.version,
        stepStatus: step.status,
        organizationId: state.organizationId,
        invitationId: invitation.id,
        invitationStatus: status,
        membershipStatus: "pending_acceptance",
        roleIntentStatus: "satisfied",
        roleGrantStatus: "pending_acceptance",
      });
    }

    // Accepted: membership is a hard precondition for materialization.
    const membership = state.membership;
    if (!membership || membership.status !== "active") {
      const code = membership
        ? "membership_inactive_after_acceptance"
        : "membership_missing_after_acceptance";
      const step = await recordSafely(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "blocked",
        failureCode: code,
        failureSummary: "An active organization membership is required before assignment.",
        correlationId,
      });
      return result({
        ...base,
        ok: false,
        reasonCode: code,
        message: "An active organization membership is required before the role is granted.",
        state: step?.state ?? null,
        version: step?.version ?? null,
        stepStatus: step?.status ?? "blocked",
        organizationId: state.organizationId,
        invitationId: invitation.id,
        invitationStatus: status,
        membershipStatus: membership ? "inactive" : "missing_after_acceptance",
        roleIntentStatus: "satisfied",
        roleGrantStatus: "missing",
      });
    }

    const { data, error } = await client.rpc(ASSIGN_ADMIN_ROLE_RPC, {
      _tenant_id: input.tenantId,
      _invitation_id: invitation.id,
    } as never);
    if (error) throw error;
    const assignment = (data ?? {}) as { created?: boolean; role_key?: string };

    const step = await recordOnboardingStep(client, {
      tenantId: input.tenantId,
      stepKey,
      status: "completed",
      correlationId,
      expectedVersion: input.expectedVersion ?? null,
    });

    await audit(client, actor, "onboarding.roles.assigned", input.tenantId, {
      organization_id: state.organizationId,
      invitation_id: invitation.id,
      role: invitation.role,
      role_key: assignment.role_key ?? null,
      idempotent_replay: assignment.created !== true,
      correlation_id: correlationId,
    });

    return result({
      ...base,
      ok: true,
      message:
        assignment.created === true
          ? "Administrator role granted."
          : "Administrator role was already granted.",
      state: step.state,
      version: step.version,
      stepStatus: step.status,
      organizationId: state.organizationId,
      invitationId: invitation.id,
      invitationStatus: status,
      membershipStatus: "active",
      roleIntentStatus: "satisfied",
      roleGrantStatus: "granted",
      idempotentReplay: assignment.created !== true,
    });
  } catch (error) {
    const { reasonCode, message } = classifyError(error);
    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey,
      status: "failed",
      failureCode: reasonCode,
      failureSummary: message,
      correlationId,
    });
    return result({
      ...base,
      ok: false,
      reasonCode,
      message,
      stepStatus: "failed",
      roleGrantStatus: "failed",
    });
  }
}

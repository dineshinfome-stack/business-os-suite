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
export const INVITE_ADMIN_RPC = "fn_onboarding_invite_first_admin";
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

export interface InviteFirstAdministratorInput {
  tenantId: string;
  organizationId?: string;
  email: string;
  invitedRole: AdministrativeInvitationRole;
  expectedVersion?: number;
  correlationId?: string;
}

/**
 * Creates — or idempotently reuses — the first administrator invitation.
 *
 * The one-time secret is generated here, hashed, and only the hash is sent to
 * the database. No delivery channel for invitee email exists yet, so the
 * secret is discarded and `notificationQueued` is reported as `false`; a
 * resend issues a fresh secret.
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

    await startOnboardingWorkflow(client, input.tenantId, correlationId);

    const existing = await resolveFirstAdministrator(client, input.tenantId, input.email);
    const organizationId = input.organizationId ?? existing.organizationId;
    if (!organizationId) {
      const step = await recordSafely(client, {
        tenantId: input.tenantId,
        stepKey,
        status: "blocked",
        failureCode: "not_found",
        failureSummary: "The tenant has no default organization yet.",
        correlationId,
      });
      return result({
        ...base,
        ok: false,
        reasonCode: "not_found",
        message: "The tenant has no default organization yet.",
        state: step?.state ?? null,
        stepStatus: step?.status ?? "blocked",
        version: step?.version ?? null,
      });
    }

    const existingState = invitationState(existing.invitation);
    const reusable =
      existing.invitation &&
      isAdministrativeInvitationRole(existing.invitation.role) &&
      (existingState === "accepted" || existingState === "pending");

    let invitationId: string;
    let replay = false;
    let status: OnboardingInvitationState;

    if (reusable && existing.invitation) {
      invitationId = existing.invitation.id;
      status = existingState;
      replay = true;
    } else {
      const secret = generateInvitationSecret();
      const expiresAt = new Date(
        Date.now() + INVITE_TTL_HOURS * 3600 * 1000,
      ).toISOString();
      const { data, error } = await client.rpc(INVITE_ADMIN_RPC, {
        _tenant_id: input.tenantId,
        _organization_id: organizationId,
        _email: input.email,
        _invited_role: input.invitedRole,
        _token_hash: hashInvitationSecret(secret),
        _expires_at: expiresAt,
      } as never);
      if (error) throw error;
      invitationId = String((data as { invitation_id: string }).invitation_id);
      status = "pending";
    }

    const step = await recordOnboardingStep(client, {
      tenantId: input.tenantId,
      stepKey,
      status: "completed",
      correlationId,
      expectedVersion: input.expectedVersion ?? null,
    });

    const accepted = status === "accepted";
    const membershipStatus: OnboardingMembershipState = accepted
      ? existing.membership?.status === "active"
        ? "active"
        : existing.membership
          ? "inactive"
          : "missing_after_acceptance"
      : "pending_acceptance";

    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey: "tenant_admin_membership",
      status: accepted && membershipStatus === "active" ? "completed" : "skipped",
      failureCode: accepted ? null : "acceptance_pending",
      failureSummary: accepted
        ? null
        : "Membership materializes when the administrator accepts the invitation.",
      correlationId,
    });

    await recordSafely(client, {
      tenantId: input.tenantId,
      stepKey: "roles_assigned",
      status: accepted && existing.roleGranted ? "completed" : "skipped",
      failureCode: accepted ? null : "role_grant_pending_acceptance",
      failureSummary: accepted
        ? null
        : "The invited administrative role is recorded as intent until acceptance.",
      correlationId,
    });

    await audit(
      client,
      actor,
      replay ? "onboarding.invitation.reused" : "onboarding.invitation.created",
      input.tenantId,
      {
        organization_id: organizationId,
        invitation_id: invitationId,
        role: input.invitedRole,
        invitation_status: status,
        correlation_id: correlationId,
        idempotent_replay: replay,
      },
    );

    return result({
      ...base,
      ok: true,
      message: replay
        ? "An equivalent administrator invitation already exists."
        : "Administrator invitation created.",
      state: step.state,
      version: step.version,
      stepStatus: step.status,
      invitationId,
      organizationId,
      invitationStatus: status,
      membershipStatus,
      roleIntentStatus: "satisfied",
      roleGrantStatus: accepted
        ? existing.roleGranted
          ? "granted"
          : "missing"
        : "pending_acceptance",
      idempotentReplay: replay,
      notificationQueued: false,
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
 * No dedicated resend primitive exists: resend is revoke + create, so the old
 * secret is invalidated and a fresh one is issued. The unique pending-per
 * (organization, email) index keeps exactly one authoritative invitation.
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
    const existing = await resolveFirstAdministrator(client, input.tenantId);
    const invitation = existing.invitation;
    if (!invitation || invitation.id !== input.invitationId) {
      return result({
        ...base,
        ok: false,
        reasonCode: "invitation_missing",
        message: "That invitation is not the tenant's authoritative administrator invitation.",
        organizationId: existing.organizationId,
        invitationStatus: invitationState(invitation),
      });
    }
    if (invitationState(invitation) === "accepted") {
      return result({
        ...base,
        ok: false,
        reasonCode: "invitation_conflict",
        message: "An accepted invitation cannot be resent.",
        organizationId: existing.organizationId,
        invitationId: invitation.id,
        invitationStatus: "accepted",
      });
    }

    const { error: revokeError } = await client.rpc(REVOKE_INVITATION_RPC, {
      _tenant_id: input.tenantId,
      _invitation_id: invitation.id,
    } as never);
    if (revokeError) throw revokeError;

    await audit(client, actor, "invitation_revoked", input.tenantId, {
      organization_id: invitation.organizationId,
      invitation_id: invitation.id,
      correlation_id: correlationId,
    });

    const secret = generateInvitationSecret();
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString();
    const { data, error } = await client.rpc(INVITE_ADMIN_RPC, {
      _tenant_id: input.tenantId,
      _organization_id: invitation.organizationId,
      _email: invitation.email,
      _invited_role: invitation.role,
      _token_hash: hashInvitationSecret(secret),
      _expires_at: expiresAt,
    } as never);
    if (error) throw error;
    const invitationId = String((data as { invitation_id: string }).invitation_id);

    const step = await recordOnboardingStep(client, {
      tenantId: input.tenantId,
      stepKey,
      status: "completed",
      correlationId,
      expectedVersion: input.expectedVersion ?? null,
    });

    await audit(client, actor, "onboarding.invitation.resent", input.tenantId, {
      organization_id: invitation.organizationId,
      invitation_id: invitationId,
      previous_invitation_id: invitation.id,
      role: invitation.role,
      invitation_status: "pending",
      correlation_id: correlationId,
    });

    return result({
      ...base,
      ok: true,
      message: "Administrator invitation resent.",
      state: step.state,
      version: step.version,
      stepStatus: step.status,
      invitationId,
      organizationId: invitation.organizationId,
      invitationStatus: "pending",
      membershipStatus: "pending_acceptance",
      roleIntentStatus: "satisfied",
      roleGrantStatus: "pending_acceptance",
      notificationQueued: false,
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

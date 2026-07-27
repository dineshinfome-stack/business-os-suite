/**
 * Gate 3.8 · Pass 3.8.4 — administrator invitation / membership / role result
 * DTO (v1, additive).
 *
 * SECURITY: this DTO must never carry the one-time invitation secret, its
 * hash, or any URL that embeds it. Only identifiers and coarse status values
 * cross the transport boundary.
 */
import type { OnboardingActionResultDTO } from "./onboarding-action-result.dto";

export type OnboardingInvitationState =
  | "none"
  | "pending"
  | "accepted"
  | "expired"
  | "revoked";

export type OnboardingMembershipState =
  | "unknown"
  | "pending_acceptance"
  | "active"
  | "inactive"
  | "missing_after_acceptance";

export type OnboardingRoleIntentState = "unknown" | "satisfied" | "not_administrative";

export type OnboardingRoleGrantState =
  | "unknown"
  | "pending_acceptance"
  | "granted"
  | "missing"
  | "failed";

export interface OnboardingAdminActionResultDTO extends OnboardingActionResultDTO {
  invitationId: string | null;
  organizationId: string | null;
  invitationStatus: OnboardingInvitationState;
  membershipStatus: OnboardingMembershipState;
  roleIntentStatus: OnboardingRoleIntentState;
  roleGrantStatus: OnboardingRoleGrantState;
  /** True when an equivalent valid record was reused instead of created. */
  idempotentReplay: boolean;
  /** False while no invitee-facing delivery channel exists. */
  notificationQueued: boolean;
  stepStatus:
    | "not_started"
    | "in_progress"
    | "completed"
    | "blocked"
    | "failed"
    | "skipped"
    | null;
}

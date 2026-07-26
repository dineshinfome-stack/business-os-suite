/**
 * Gate 3.8 · Pass 3.8.1 — first administrator invitation DTO (v1).
 *
 * SECURITY: this DTO must NEVER carry the plaintext token, the token hash, or
 * any URL containing a token. The underlying `organization_invitations` row
 * stores `token_hash`; it stops at the mapper.
 */
export type OnboardingInvitationStatus =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired";

export interface TenantAdminInvitationDTO {
  invitationId: string;
  organizationId: string;
  /** Masked or permitted display form only. */
  email: string;
  /** Role SELECTED ON THE INVITATION — not a granted RBAC role. */
  invitedRole: string;
  status: OnboardingInvitationStatus;
  expiresAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
  /** Whether a resend action is currently offered to the operator. */
  resendAvailable: boolean;
  createdAt: string;
}

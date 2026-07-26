/**
 * Gate 3.8 · Pass 3.8.1 — administrator membership DTO (v1).
 *
 * Distinguishes the two concepts the readiness matrix keeps apart:
 *   - role SELECTED on the invitation (pre-acceptance), and
 *   - roles GRANTED to an accepted organization member (post-acceptance).
 */
export interface TenantAdminMembershipDTO {
  /** Null until the invitation is accepted. */
  membershipId: string | null;
  organizationId: string;
  /** Null until the invitation is accepted. */
  userId: string | null;
  /** Membership role recorded on `organization_members`. */
  membershipRole: string | null;
  status: "absent" | "pending_acceptance" | "active" | "inactive";
  joinedAt: string | null;
  /** Effective RBAC role names granted through `user_roles`. */
  grantedRoles: string[];
}

/**
 * Sprint 1.0 — MOD-001 Workspace Foundation: shared DTOs.
 */

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";
export type OrgRole = "owner" | "admin" | "member";

export interface OrganizationProfileRow {
  organizationId: string;
  legalName: string | null;
  displayName: string | null;
  businessType: string | null;
  industry: string | null;
  taxId: string | null;
  registrationNumber: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  currency: string;
  timezone: string;
  language: string;
}

export interface OrganizationBrandingRow {
  organizationId: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  theme: "light" | "dark" | "system";
}

export interface UserProfileRow {
  id: string;
  organizationId: string;
  userId: string;
  displayName: string | null;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string | null;
  phone: string | null;
  timezone: string | null;
  language: string | null;
}

export interface OrgMemberDirectoryRow {
  userId: string;
  role: OrgRole;
  status: "active" | "invited" | "suspended";
  joinedAt: string | null;
  displayName: string | null;
  jobTitle: string | null;
  department: string | null;
  avatarUrl: string | null;
}

export interface InvitationRow {
  id: string;
  organizationId: string;
  email: string;
  role: OrgRole;
  status: InvitationStatus;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

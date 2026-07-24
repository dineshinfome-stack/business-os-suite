export const tenantKeys = {
  all: (orgId: string | null) => ["tenant", orgId] as const,
  profile: (orgId: string | null) => ["tenant", orgId, "org-profile"] as const,
  branding: (orgId: string | null) => ["tenant", orgId, "branding"] as const,
  myProfile: (orgId: string | null) => ["tenant", orgId, "my-profile"] as const,
  members: (orgId: string | null) => ["tenant", orgId, "members"] as const,
  invitations: (orgId: string | null) => ["tenant", orgId, "invitations"] as const,
} as const;

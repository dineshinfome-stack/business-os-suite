export const workspaceKeys = {
  all: (orgId: string | null) => ["workspace", orgId] as const,
  profile: (orgId: string | null) => ["workspace", orgId, "org-profile"] as const,
  branding: (orgId: string | null) => ["workspace", orgId, "branding"] as const,
  myProfile: (orgId: string | null) => ["workspace", orgId, "my-profile"] as const,
  members: (orgId: string | null) => ["workspace", orgId, "members"] as const,
  invitations: (orgId: string | null) => ["workspace", orgId, "invitations"] as const,
} as const;

/**
 * AUTO-GENERATED — do not edit by hand.
 * Regenerate with `bun run gen:permissions` after editing
 * `docs/15-governance/permission-catalog.manifest.yaml`.
 */

export const PERMISSIONS = {
  PLATFORM_USERS_VIEW: "platform.users.view",
  PLATFORM_USERS_CREATE: "platform.users.create",
  PLATFORM_USERS_UPDATE: "platform.users.update",
  PLATFORM_USERS_DELETE: "platform.users.delete",
  PLATFORM_ORGANIZATIONS_VIEW: "platform.organizations.view",
  PLATFORM_ORGANIZATIONS_MANAGE: "platform.organizations.manage",
  PLATFORM_ROLES_VIEW: "platform.roles.view",
  PLATFORM_ROLES_ASSIGN: "platform.roles.assign",
  PLATFORM_AUDIT_VIEW: "platform.audit.view",
  SETTINGS_GENERAL_VIEW: "settings.general.view",
  SETTINGS_GENERAL_UPDATE: "settings.general.update",
  SETTINGS_SECURITY_MANAGE: "settings.security.manage",
  PLATFORM_SETTINGS_MANAGE: "platform.settings.manage",
  AUDIT_LOGS_VIEW: "audit.logs.view",
  NOTIFICATIONS_INBOX_READ: "notifications.inbox.read",
  NOTIFICATIONS_INBOX_CREATE: "notifications.inbox.create",
  NOTIFICATIONS_INBOX_MANAGE: "notifications.inbox.manage",
  SEARCH_GLOBAL_USE: "search.global.use",
  SEARCH_HISTORY_MANAGE: "search.history.manage",
  WORKSPACE_WORKSPACE_READ: "workspace.workspace.read",
  WORKSPACE_WORKSPACE_MANAGE: "workspace.workspace.manage",
  WORKSPACE_ORGANIZATION_READ: "workspace.organization.read",
  WORKSPACE_ORGANIZATION_UPDATE: "workspace.organization.update",
  WORKSPACE_BRANDING_READ: "workspace.branding.read",
  WORKSPACE_BRANDING_UPDATE: "workspace.branding.update",
  WORKSPACE_PROFILE_READ: "workspace.profile.read",
  WORKSPACE_PROFILE_UPDATE: "workspace.profile.update",
  WORKSPACE_MEMBER_READ: "workspace.member.read",
  WORKSPACE_MEMBER_INVITE: "workspace.member.invite",
  WORKSPACE_MEMBER_REMOVE: "workspace.member.remove",
  WORKSPACE_INVITATION_READ: "workspace.invitation.read",
  WORKSPACE_INVITATION_REVOKE: "workspace.invitation.revoke",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSION_KEYS: readonly PermissionKey[] = [
  "platform.users.view",
  "platform.users.create",
  "platform.users.update",
  "platform.users.delete",
  "platform.organizations.view",
  "platform.organizations.manage",
  "platform.roles.view",
  "platform.roles.assign",
  "platform.audit.view",
  "settings.general.view",
  "settings.general.update",
  "settings.security.manage",
  "platform.settings.manage",
  "audit.logs.view",
  "notifications.inbox.read",
  "notifications.inbox.create",
  "notifications.inbox.manage",
  "search.global.use",
  "search.history.manage",
  "workspace.workspace.read",
  "workspace.workspace.manage",
  "workspace.organization.read",
  "workspace.organization.update",
  "workspace.branding.read",
  "workspace.branding.update",
  "workspace.profile.read",
  "workspace.profile.update",
  "workspace.member.read",
  "workspace.member.invite",
  "workspace.member.remove",
  "workspace.invitation.read",
  "workspace.invitation.revoke",
] as const;

export const ROLE_KEYS = {
  PLATFORM_OWNER: "platform_owner",
  PLATFORM_ADMIN: "platform_admin",
  ORG_OWNER: "org_owner",
  ADMINISTRATOR: "administrator",
  MANAGER: "manager",
  SUPERVISOR: "supervisor",
  EMPLOYEE: "employee",
  READ_ONLY: "read_only",
} as const;

export type RoleKey = (typeof ROLE_KEYS)[keyof typeof ROLE_KEYS];

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

/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.3 (Bootstrap commands)
 *
 * Tenant-onboarding WRITE facade. Thin wrapper module: imports, Zod-validated
 * inputs and server-function declarations only.
 *
 * Authorization (G38-POL-005, reused keys only):
 *   - Workflow start / provisioning verification → `platform.tenant.update`.
 *   - Organization profile → `platform.tenant.update` + `platform.company.create`.
 *   - Primary branch → `platform.tenant.update` + `platform.branch.create`.
 *   - Required settings → `platform.tenant.update` + `platform.settings.manage`.
 *   - Financial year → `platform.tenant.update` + `platform.financial_year.create`.
 *
 * Every command executes on `context.supabase`, the caller-scoped client; the
 * database routines re-check `platform.tenant.update` independently, so a
 * denial can never be confused with a silent no-op.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireAllPermissions } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

import {
  assignTenantAdministratorRoleSchema,
  createOrSelectBranchSchema,
  initializeFinancialYearSchema,
  initializeSettingsSchema,
  inviteFirstTenantAdministratorSchema,
  observeTenantAdministratorMembershipSchema,
  resendFirstTenantAdministratorInvitationSchema,
  saveOrganizationProfileSchema,
  startOnboardingSchema,
} from "./schemas";
import {
  initializeFinancialYearCommand,
  initializeSettingsCommand,
  savePrimaryBranchCommand,
  saveOrganizationProfileCommand,
  startOnboardingCommand,
  verifyProvisioningCommand,
  activateTenantCommand,
  refreshOnboardingReadinessCommand,
} from "./server/command-service.server";
import {
  assignTenantAdministratorRoleCommand,
  inviteFirstTenantAdministratorCommand,
  observeTenantAdministratorMembershipCommand,
  resendFirstTenantAdministratorInvitationCommand,
} from "./server/admin-service.server";


export const startTenantOnboarding = createServerFn({ method: "POST" })
  .middleware([requireAllPermissions([PERMISSIONS.PLATFORM_TENANT_UPDATE])])
  .inputValidator((input: unknown) => startOnboardingSchema.parse(input))
  .handler(async ({ context, data }) =>
    startOnboardingCommand(context.supabase, { userId: context.userId }, {
      tenantId: data.tenantId,
    }),
  );

export const verifyTenantProvisioning = createServerFn({ method: "POST" })
  .middleware([requireAllPermissions([PERMISSIONS.PLATFORM_TENANT_UPDATE])])
  .inputValidator((input: unknown) => startOnboardingSchema.parse(input))
  .handler(async ({ context, data }) =>
    verifyProvisioningCommand(context.supabase, { userId: context.userId }, {
      tenantId: data.tenantId,
    }),
  );

export const saveOnboardingOrganizationProfile = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_COMPANY_CREATE,
    ]),
  ])
  .inputValidator((input: unknown) => saveOrganizationProfileSchema.parse(input))
  .handler(async ({ context, data }) =>
    saveOrganizationProfileCommand(context.supabase, { userId: context.userId }, data),
  );

export const saveOnboardingPrimaryBranch = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_BRANCH_CREATE,
    ]),
  ])
  .inputValidator((input: unknown) => createOrSelectBranchSchema.parse(input))
  .handler(async ({ context, data }) =>
    savePrimaryBranchCommand(context.supabase, { userId: context.userId }, data),
  );

export const initializeOnboardingSettings = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_SETTINGS_MANAGE,
    ]),
  ])
  .inputValidator((input: unknown) => initializeSettingsSchema.parse(input))
  .handler(async ({ context, data }) =>
    initializeSettingsCommand(context.supabase, { userId: context.userId }, data),
  );

export const initializeOnboardingFinancialYear = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_FINANCIAL_YEAR_CREATE,
    ]),
  ])
  .inputValidator((input: unknown) => initializeFinancialYearSchema.parse(input))
  .handler(async ({ context, data }) =>
    initializeFinancialYearCommand(context.supabase, { userId: context.userId }, data),
  );

/* ------------------------------------------------- Pass 3.8.4 administrator */

export const inviteFirstTenantAdministrator = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_INVITATIONS_MANAGE,
    ]),
  ])
  .inputValidator((input: unknown) => inviteFirstTenantAdministratorSchema.parse(input))
  .handler(async ({ context, data }) =>
    inviteFirstTenantAdministratorCommand(context.supabase, { userId: context.userId }, data),
  );

export const resendFirstTenantAdministratorInvitation = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_INVITATIONS_MANAGE,
    ]),
  ])
  .inputValidator((input: unknown) =>
    resendFirstTenantAdministratorInvitationSchema.parse(input),
  )
  .handler(async ({ context, data }) =>
    resendFirstTenantAdministratorInvitationCommand(
      context.supabase,
      { userId: context.userId },
      data,
    ),
  );

export const observeTenantAdministratorMembership = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_INVITATIONS_VIEW,
    ]),
  ])
  .inputValidator((input: unknown) =>
    observeTenantAdministratorMembershipSchema.parse(input),
  )
  .handler(async ({ context, data }) =>
    observeTenantAdministratorMembershipCommand(
      context.supabase,
      { userId: context.userId },
      data,
    ),
  );

export const assignTenantAdministratorRole = createServerFn({ method: "POST" })
  .middleware([
    requireAllPermissions([
      PERMISSIONS.PLATFORM_TENANT_UPDATE,
      PERMISSIONS.PLATFORM_INVITATIONS_VIEW,
      PERMISSIONS.PLATFORM_MEMBERSHIPS_MANAGE,
      PERMISSIONS.PLATFORM_ROLES_ASSIGN,
    ]),
  ])
  .inputValidator((input: unknown) => assignTenantAdministratorRoleSchema.parse(input))
  .handler(async ({ context, data }) =>
    assignTenantAdministratorRoleCommand(context.supabase, { userId: context.userId }, data),
  );

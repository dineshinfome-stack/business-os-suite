/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.2 (Workflow persistence & read models)
 *
 * Tenant-onboarding READ facade. Thin wrapper module: imports, Zod-validated
 * inputs and server-function declarations only.
 *
 * Authorization:
 *   - Core onboarding reads require `platform.tenant.read`.
 *   - Audit-derived activity ADDITIONALLY requires `platform.audit.view`.
 *     Global audit access is never granted through the tenant-read
 *     permission, and a caller without it still gets a working timeline
 *     (step-derived entries only) and a working detail read.
 *   - Every query executes on `context.supabase`, the caller-scoped client.
 */
import { createServerFn } from "@tanstack/react-start";

import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

import {
  onboardingDetailQuerySchema,
  onboardingListFilterSchema,
} from "./schemas";
import {
  getOnboardingActivity,
  getOnboardingDetail,
  getOnboardingProgress,
  getOnboardingQueue,
  getOnboardingReadiness,
  getOnboardingSteps,
} from "./server/query-service.server";

export const listTenantOnboarding = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => onboardingListFilterSchema.parse(input ?? {}))
  .handler(async ({ context, data }) => getOnboardingQueue(context.supabase, data));

export const getTenantOnboardingDetail = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => onboardingDetailQuerySchema.parse(input))
  .handler(async ({ context, data }) =>
    getOnboardingDetail(context.supabase, data.tenantId),
  );

export const getTenantOnboardingSteps = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => onboardingDetailQuerySchema.parse(input))
  .handler(async ({ context, data }) =>
    getOnboardingSteps(context.supabase, data.tenantId),
  );

export const getTenantOnboardingProgress = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => onboardingDetailQuerySchema.parse(input))
  .handler(async ({ context, data }) =>
    getOnboardingProgress(context.supabase, data.tenantId),
  );

export const getTenantOnboardingReadiness = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => onboardingDetailQuerySchema.parse(input))
  .handler(async ({ context, data }) =>
    getOnboardingReadiness(context.supabase, data.tenantId),
  );

export const getTenantOnboardingActivity = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => onboardingDetailQuerySchema.parse(input))
  .handler(async ({ context, data }) => {
    const includeAuditEntries = context.permissions.has(
      PERMISSIONS.PLATFORM_AUDIT_VIEW,
    );
    const entries = await getOnboardingActivity(
      context.supabase,
      data.tenantId,
      includeAuditEntries,
    );
    return { entries, includesAuditEntries: includeAuditEntries };
  });

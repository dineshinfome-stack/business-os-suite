/**
 * Gate 3.7 · Platform Administration Facade — READS.
 *
 * Thin wrapper module: imports + server-function declarations only
 * (server-fn split safety). All logic lives in `*.server.ts`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import {
  getAttentionPage,
  getAuditExportRows,
  getAuditPage,
  getFeatureControls,
  getHealthSections,
  getNotificationOperations,
  getOperationalPolicies,
  getOperationsSummary,
  getPlatformSettings,
  getProviderSummaries,
  getRegionSummaries,
  getTenantDirectory,
} from "./query-service.server";
import { auditToCsv, EXPORT_ROW_LIMIT } from "./mappers.server";
import {
  resolveSupabaseProviderRuntime,
  SUPABASE_PROVIDER_KEY,
  SUPABASE_PROVIDER_NAME,
} from "@/lib/provisioning-admin/provider-resolver.server";

const AttentionQuery = z.object({
  severity: z.enum(["all", "critical", "high", "medium", "low", "info"]).optional(),
  type: z.string().max(64).optional(),
  status: z.enum(["all", "open", "acknowledged"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(5).max(100).optional(),
});

const TenantQuery = z.object({
  search: z.string().max(200).optional(),
  lifecycleState: z.string().max(64).optional(),
  provisioningStatus: z.string().max(64).optional(),
  region: z.string().max(64).optional(),
  planTier: z.string().max(64).optional(),
  onboardingState: z.string().max(64).optional(),
  readinessStatus: z.string().max(64).optional(),
  invitationStatus: z.string().max(64).optional(),
  blockedOnly: z.boolean().optional(),
  requiresAttention: z.boolean().optional(),
  hasFailedProvisioning: z.boolean().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
  sortBy: z
    .enum([
      "displayName",
      "createdAt",
      "updatedAt",
      "lifecycleState",
      "onboardingProgress",
      "readinessBlockers",
    ])
    .optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(5).max(100).optional(),
});


const AuditQueryInput = z.object({
  search: z.string().max(200).optional(),
  action: z.string().max(128).optional(),
  entityType: z.string().max(128).optional(),
  actorId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  correlationId: z.string().max(128).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(5).max(100).optional(),
});

export const getPlatformOperationsSummary = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_DASHBOARD_VIEW)])
  .handler(async ({ context }) => {
    const runtime = resolveSupabaseProviderRuntime();
    return getOperationsSummary(context.supabase, runtime.configured ? 1 : 0, 1);
  });

export const getPlatformHealthSections = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_DASHBOARD_VIEW)])
  .handler(async ({ context }) => getHealthSections(context.supabase));

export const getPlatformAttention = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => AttentionQuery.parse(input ?? {}))
  .handler(async ({ context, data }) => getAttentionPage(context.supabase, data));

export const getPlatformTenantOperations = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => TenantQuery.parse(input ?? {}))
  .handler(async ({ context, data }) => getTenantDirectory(context.supabase, data));

export const getPlatformProviders = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .handler(async ({ context }) => {
    const runtime = resolveSupabaseProviderRuntime();
    const defaultRegion = process.env.SUPABASE_DEFAULT_REGION ?? null;
    const [providers, regions] = await Promise.all([
      getProviderSummaries(context.supabase, {
        providerKey: SUPABASE_PROVIDER_KEY,
        displayName: SUPABASE_PROVIDER_NAME,
        configured: runtime.configured,
        capabilities: runtime.capabilities,
        defaultRegion,
        message: runtime.message,
      }),
      getRegionSummaries(context.supabase, defaultRegion),
    ]);
    return { providers, regions };
  });

export const getPlatformSettingsList = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_SETTINGS_MANAGE)])
  .handler(async ({ context }) => getPlatformSettings(context.supabase));

export const getPlatformPolicies = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_POLICIES_VIEW)])
  .handler(async ({ context }) =>
    getOperationalPolicies(context.supabase, {
      defaultRegion: process.env.SUPABASE_DEFAULT_REGION ?? null,
    }),
  );

export const getPlatformFeatureControls = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_SETTINGS_MANAGE)])
  .handler(async ({ context }) => getFeatureControls(context.supabase));

export const getPlatformAudit = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_AUDIT_VIEW)])
  .inputValidator((input: unknown) => AuditQueryInput.parse(input ?? {}))
  .handler(async ({ context, data }) => getAuditPage(context.supabase, data));

export const exportPlatformAuditCsv = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_AUDIT_VIEW)])
  .inputValidator((input: unknown) => AuditQueryInput.parse(input ?? {}))
  .handler(async ({ context, data }) => {
    const rows = await getAuditExportRows(context.supabase, data);
    return {
      ok: true,
      csv: auditToCsv(rows),
      rowCount: rows.length,
      limit: EXPORT_ROW_LIMIT,
      message:
        rows.length >= EXPORT_ROW_LIMIT
          ? `Export truncated to the ${EXPORT_ROW_LIMIT}-row synchronous limit. Refine your filters.`
          : null,
    };
  });

export const getPlatformNotificationOperations = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_DASHBOARD_VIEW)])
  .handler(async ({ context }) => getNotificationOperations(context.supabase));

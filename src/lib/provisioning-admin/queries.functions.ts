/**
 * Gate 3.4 · Provisioning Admin Facade — READS.
 *
 * Thin wrapper module: imports + server-function declarations only (server-fn
 * split safety). All logic lives in `*.server.ts`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import {
  getJobDetail,
  getProviderHealthReport,
  getQueue,
  getSummary,
  listFailures,
  listJobs,
} from "./query-service.server";
import { EXPORT_ROW_LIMIT, toCsv } from "./mappers.server";
import {
  resolveSupabaseProviderRuntime,
  SUPABASE_PROVIDER_KEY,
  SUPABASE_PROVIDER_NAME,
} from "./provider-resolver.server";

const ListQuery = z.object({
  search: z.string().max(200).optional(),
  status: z
    .enum(["all", "not_started", "in_progress", "provisioned", "failed"])
    .optional(),
  state: z.string().max(64).optional(),
  providerKey: z.string().max(64).optional(),
  region: z.string().max(64).optional(),
  retryableOnly: z.boolean().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
  sortBy: z.enum(["createdAt", "lastTransitionAt", "tenantName", "state"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(5).max(100).optional(),
});

export const getProvisioningSummary = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .handler(async ({ context }) => getSummary(context.supabase));

export const listProvisioningJobs = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => ListQuery.parse(input ?? {}))
  .handler(async ({ context, data }) => listJobs(context.supabase, data));

export const getProvisioningJob = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => getJobDetail(context.supabase, data.jobId));

export const listFailedProvisioning = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .handler(async ({ context }) => listFailures(context.supabase));

export const getProvisioningQueue = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .handler(async ({ context }) => getQueue(context.supabase));

export const getProviderHealth = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .handler(async ({ context }) => {
    const runtime = resolveSupabaseProviderRuntime();
    return [
      await getProviderHealthReport(context.supabase, {
        providerKey: SUPABASE_PROVIDER_KEY,
        displayName: SUPABASE_PROVIDER_NAME,
        configured: runtime.configured,
        capabilities: runtime.capabilities,
        message: runtime.message,
      }),
    ];
  });

export const exportProvisioningJobsCsv = createServerFn({ method: "GET" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_READ)])
  .inputValidator((input: unknown) => ListQuery.parse(input ?? {}))
  .handler(async ({ context, data }) => {
    const page = await listJobs(context.supabase, {
      ...data,
      page: 1,
      pageSize: 100,
    });
    if (page.total > EXPORT_ROW_LIMIT) {
      return {
        ok: false,
        csv: null,
        rowCount: page.total,
        limit: EXPORT_ROW_LIMIT,
        message: `Result set of ${page.total} rows exceeds the ${EXPORT_ROW_LIMIT}-row synchronous export limit. Refine your filters.`,
      };
    }
    const rows = [...page.rows];
    for (let p = 2; p <= page.pageCount; p += 1) {
      const next = await listJobs(context.supabase, { ...data, page: p, pageSize: 100 });
      rows.push(...next.rows);
    }
    return {
      ok: true,
      csv: toCsv(rows),
      rowCount: rows.length,
      limit: EXPORT_ROW_LIMIT,
      message: null,
    };
  });

/**
 * Gate 3.6 — Tenant lifecycle operations (server functions).
 *
 * Thin RPC wrappers: every authorization decision is enforced in Postgres by
 * `private.fn_*` (platform-admin check + transition matrix). These functions
 * translate results into DTOs and write the lifecycle audit record.
 *
 * Independent of provisioning — no provisioning module is imported here.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logTenantEventFn } from "@/lib/tenants/audit";
import { buildTimeline, type TimelineEntry } from "./timeline";
import {
  DEFAULT_RETENTION_DAYS,
  TENANT_LIFECYCLE_STATES,
  type TenantLifecycleState,
} from "./lifecycle";

const TenantId = z.string().uuid();
const Reason = z.string().min(3).max(500);

const WithReason = z.object({
  tenantId: TenantId,
  reason: Reason,
  correlationId: z.string().min(1).optional(),
});

const WithoutReason = z.object({
  tenantId: TenantId,
  correlationId: z.string().min(1).optional(),
});

type RpcResult = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callRpc(supabase: any, fn: string, args: RpcResult) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return (data ?? {}) as RpcResult;
}

function fromState(result: RpcResult): TenantLifecycleState | null {
  const value = result.from_state;
  return typeof value === "string" &&
    (TENANT_LIFECYCLE_STATES as readonly string[]).includes(value)
    ? (value as TenantLifecycleState)
    : null;
}

// ── Reads ────────────────────────────────────────────────────────────────
export const listLifecycleTenants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        state: z.enum(TENANT_LIFECYCLE_STATES).optional(),
        search: z.string().max(200).optional(),
        includeDeleted: z.boolean().default(false),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("tenants")
      .select(
        "id, slug, display_name, region, plan_tier, lifecycle_state, created_at, activated_at, suspended_at, archived_at, maintenance_started_at, maintenance_reason, deletion_scheduled_at, deleted_at, deletion_reason, purge_after",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.state) query = query.eq("lifecycle_state", data.state);
    else if (!data.includeDeleted) query = query.neq("lifecycle_state", "deleted");

    if (data.search?.trim()) {
      const term = `%${data.search.trim()}%`;
      query = query.or(`display_name.ilike.${term},slug.ilike.${term}`);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getTenantTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ tenantId: TenantId }).parse(d))
  .handler(async ({ data, context }): Promise<TimelineEntry[]> => {
    const [audit, jobs] = await Promise.all([
      context.supabase
        .from("audit_logs")
        .select("id, action, actor_id, created_at, new_values")
        .eq("entity_type", "tenant")
        .eq("entity_id", data.tenantId)
        .order("created_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("provisioning_jobs")
        .select("id, state, created_at, updated_at, requested_by, error_message")
        .eq("tenant_id", data.tenantId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (audit.error) throw new Error(audit.error.message);
    // Provisioning history is supplementary — never fail the timeline on it.
    const jobRows = jobs.error ? [] : (jobs.data ?? []);

    return buildTimeline(
      (audit.data ?? []) as never,
      jobRows as never,
    );
  });

// ── Operations ───────────────────────────────────────────────────────────
export const enterMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => WithReason.parse(d))
  .handler(async ({ data, context }) => {
    const result = await callRpc(context.supabase, "fn_enter_maintenance", {
      _tenant: data.tenantId,
      _reason: data.reason,
    });
    const already = result.already_in_maintenance === true;
    if (!already) {
      await logTenantEventFn({
        data: {
          action: "tenant.maintenance_entered",
          tenantId: data.tenantId,
          fromState: fromState(result),
          toState: "maintenance",
          correlationId: data.correlationId,
          extras: { reason: data.reason },
        },
      });
    }
    return { tenantId: data.tenantId, alreadyApplied: already, toState: "maintenance" as const };
  });

export const exitMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => WithoutReason.parse(d))
  .handler(async ({ data, context }) => {
    const result = await callRpc(context.supabase, "fn_exit_maintenance", {
      _tenant: data.tenantId,
    });
    const already = result.already_active === true;
    if (!already) {
      await logTenantEventFn({
        data: {
          action: "tenant.maintenance_exited",
          tenantId: data.tenantId,
          fromState: "maintenance",
          toState: "active",
          correlationId: data.correlationId,
        },
      });
    }
    return { tenantId: data.tenantId, alreadyApplied: already, toState: "active" as const };
  });

export const restoreTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => WithoutReason.parse(d))
  .handler(async ({ data, context }) => {
    const result = await callRpc(context.supabase, "fn_restore_tenant", {
      _tenant: data.tenantId,
    });
    const already = result.already_active === true;
    if (!already) {
      await logTenantEventFn({
        data: {
          action: "tenant.restored",
          tenantId: data.tenantId,
          fromState: fromState(result),
          toState: "active",
          correlationId: data.correlationId,
        },
      });
    }
    return { tenantId: data.tenantId, alreadyApplied: already, toState: "active" as const };
  });

export const scheduleTenantDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    WithReason.extend({
      retentionDays: z.number().int().min(1).max(3650).default(DEFAULT_RETENTION_DAYS),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const result = await callRpc(context.supabase, "fn_schedule_tenant_deletion", {
      _tenant: data.tenantId,
      _reason: data.reason,
      _retention_days: data.retentionDays,
    });
    const already = result.already_scheduled === true;
    if (!already) {
      await logTenantEventFn({
        data: {
          action: "tenant.deletion_scheduled",
          tenantId: data.tenantId,
          fromState: fromState(result),
          toState: "pending_deletion",
          correlationId: data.correlationId,
          extras: {
            reason: data.reason,
            retention_days: data.retentionDays,
            purge_after: result.purge_after ?? null,
          },
        },
      });
    }
    return {
      tenantId: data.tenantId,
      alreadyApplied: already,
      toState: "pending_deletion" as const,
      purgeAfter: (result.purge_after as string | null) ?? null,
    };
  });

export const cancelTenantDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => WithReason.parse(d))
  .handler(async ({ data, context }) => {
    const result = await callRpc(context.supabase, "fn_cancel_tenant_deletion", {
      _tenant: data.tenantId,
      _reason: data.reason,
    });
    const already = result.already_cancelled === true;
    if (!already) {
      await logTenantEventFn({
        data: {
          action: "tenant.deletion_cancelled",
          tenantId: data.tenantId,
          fromState: "pending_deletion",
          toState: "archived",
          correlationId: data.correlationId,
          extras: { reason: data.reason },
        },
      });
    }
    return { tenantId: data.tenantId, alreadyApplied: already, toState: "archived" as const };
  });

/**
 * Soft delete. The tenant row, audit history and provisioning history are all
 * retained; `purge_after` marks the record for a separate, deferred physical
 * purge process. Blocked by the DB when members or in-flight jobs exist.
 */
export const deleteTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => WithReason.parse(d))
  .handler(async ({ data, context }) => {
    const result = await callRpc(context.supabase, "fn_delete_tenant", {
      _tenant: data.tenantId,
      _reason: data.reason,
    });
    const already = result.already_deleted === true;
    if (!already) {
      await logTenantEventFn({
        data: {
          action: "tenant.deleted",
          tenantId: data.tenantId,
          fromState: fromState(result),
          toState: "deleted",
          correlationId: data.correlationId,
          extras: { reason: data.reason, soft_delete: true },
        },
      });
    }
    return { tenantId: data.tenantId, alreadyApplied: already, toState: "deleted" as const };
  });

/**
 * SPR-MOD-001-001 — Tenancy Foundation server functions.
 *
 * Every function runs under requireSupabaseAuth. Lifecycle mutations require
 * the platform_admin role (enforced by DB RPCs `private.fn_*_tenant`, which
 * raise `insufficient_privilege` when the caller lacks the role).
 *
 * Idempotency: `activateTenant` returns `{ already_active: true }` when the
 * tenant is already active — no duplicate bootstrap, no new event, no fresh
 * audit record.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logTenantEventFn } from "./audit";
import { buildTenantEvent } from "./events";
import type { TenantLifecycleState } from "./lifecycle";
import { normalizeSlug, isValidSlug } from "./slug";
import {
  SearchTenantsSchema,
  UpdateTenantMetadataSchema,
  toTenantColumnPatch,
} from "./registry";

// ── Validators ──────────────────────────────────────────────────────────
const CreateInput = z.object({
  slug: z.string().min(3).max(64),
  displayName: z.string().min(1).max(200),
  region: z.string().min(1).max(64).default("global"),
  defaultLocale: z.string().min(2).max(16).default("en"),
  timezone: z.string().min(1).max(64).default("UTC"),
  planTier: z.string().min(1).max(32).default("standard"),
  correlationId: z.string().min(1).optional(),
});

const TenantIdInput = z.object({
  tenantId: z.string().uuid(),
  correlationId: z.string().min(1).optional(),
});

// ── Reads ───────────────────────────────────────────────────────────────
export const listTenants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tenants")
      .select(
        "id, slug, display_name, region, default_locale, timezone, plan_tier, lifecycle_state, created_at, activated_at, suspended_at, archived_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getTenant = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ tenantId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tenants")
      .select("*")
      .eq("id", data.tenantId)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

// ── Create ──────────────────────────────────────────────────────────────
export const createTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    // Normalize BEFORE the uniqueness check reaches the DB.
    const slug = normalizeSlug(data.slug);
    if (!isValidSlug(slug)) {
      throw new Error(
        `Invalid slug '${data.slug}' — must be 3–64 chars, [a-z0-9-], edges alphanumeric`,
      );
    }

    const { data: row, error } = await context.supabase
      .from("tenants")
      .insert({
        slug,
        display_name: data.displayName,
        region: data.region,
        default_locale: data.defaultLocale,
        timezone: data.timezone,
        plan_tier: data.planTier,
        lifecycle_state: "created",
        created_by: context.userId,
      })
      .select("id, slug, lifecycle_state")
      .single();
    if (error) throw error;

    await logTenantEventFn({
      data: {
        action: "tenant.created",
        tenantId: row.id,
        toState: "created",
        correlationId: data.correlationId,
      },
    });

    return {
      tenant: row,
      event: buildTenantEvent("tenant.created", {
        tenantId: row.id,
        actorId: context.userId,
        toState: "created",
        correlationId: data.correlationId,
      }),
    };
  });

// ── Activate (idempotent) ───────────────────────────────────────────────
export const activateTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TenantIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private schema RPC not in generated types
      "fn_activate_tenant",
      { _tenant: data.tenantId } as never,
    );
    if (error) throw error;

    const result = (rpcResult ?? {}) as {
      tenant_id: string;
      organization_id: string;
      branch_id: string;
      financial_year_id: string;
      already_active: boolean;
    };

    // Idempotent retry: do not re-audit, do not re-emit.
    if (!result.already_active) {
      await logTenantEventFn({
        data: {
          action: "tenant.activated",
          tenantId: result.tenant_id,
          fromState: "created" as TenantLifecycleState,
          toState: "active" as TenantLifecycleState,
          correlationId: data.correlationId,
          extras: {
            organization_id: result.organization_id,
            branch_id: result.branch_id,
            financial_year_id: result.financial_year_id,
          },
        },
      });
    }

    return {
      ...result,
      event: result.already_active
        ? null
        : buildTenantEvent("tenant.activated", {
            tenantId: result.tenant_id,
            actorId: context.userId,
            fromState: "created",
            toState: "active",
            correlationId: data.correlationId,
            data: {
              organization_id: result.organization_id,
              branch_id: result.branch_id,
              financial_year_id: result.financial_year_id,
            },
          }),
    };
  });

// ── Suspend ─────────────────────────────────────────────────────────────
export const suspendTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TenantIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private schema RPC not in generated types
      "fn_suspend_tenant",
      { _tenant: data.tenantId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as {
      tenant_id: string;
      already_suspended: boolean;
      from_state: TenantLifecycleState;
    };

    if (!result.already_suspended) {
      await logTenantEventFn({
        data: {
          action: "tenant.suspended",
          tenantId: result.tenant_id,
          fromState: result.from_state,
          toState: "suspended",
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_suspended
        ? null
        : buildTenantEvent("tenant.suspended", {
            tenantId: result.tenant_id,
            actorId: context.userId,
            fromState: result.from_state,
            toState: "suspended",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Archive ─────────────────────────────────────────────────────────────
export const archiveTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TenantIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private schema RPC not in generated types
      "fn_archive_tenant",
      { _tenant: data.tenantId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as {
      tenant_id: string;
      already_archived: boolean;
      from_state: TenantLifecycleState;
    };

    if (!result.already_archived) {
      await logTenantEventFn({
        data: {
          action: "tenant.archived",
          tenantId: result.tenant_id,
          fromState: result.from_state,
          toState: "archived",
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_archived
        ? null
        : buildTenantEvent("tenant.archived", {
            tenantId: result.tenant_id,
            actorId: context.userId,
            fromState: result.from_state,
            toState: "archived",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Update (registry metadata, no lifecycle change) ─────────────────────
export const updateTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        patch: UpdateTenantMetadataSchema,
        correlationId: z.string().min(1).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const columnPatch = toTenantColumnPatch(data.patch);

    const { data: row, error } = await context.supabase
      .from("tenants")
      .update(columnPatch)
      .eq("id", data.tenantId)
      .select("id, lifecycle_state")
      .single();
    if (error) throw error;

    await logTenantEventFn({
      data: {
        action: "tenant.updated",
        tenantId: row.id,
        toState: row.lifecycle_state as TenantLifecycleState,
        correlationId: data.correlationId,
        extras: { fields: Object.keys(columnPatch) },
      },
    });

    return {
      tenant: row,
      event: buildTenantEvent("tenant.updated", {
        tenantId: row.id,
        actorId: context.userId,
        toState: row.lifecycle_state as TenantLifecycleState,
        correlationId: data.correlationId,
      }),
    };
  });

// ── Search (server-side filter + pagination) ────────────────────────────
export const searchTenants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SearchTenantsSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("tenants")
      .select(
        "id, slug, code, display_name, region, default_locale, timezone, plan_tier, lifecycle_state, provisioning_status, primary_contact_email, primary_domain, created_at, activated_at, suspended_at, archived_at",
        { count: "exact" },
      );

    if (data.query && data.query.length > 0) {
      const term = data.query.toLowerCase();
      // Exact code match (case-insensitive) OR partial name/slug.
      // PostgREST or() uses commas; escape by wrapping values.
      const esc = term.replace(/[,()"]/g, "");
      q = q.or(
        `code.ilike.${esc},display_name.ilike.%${esc}%,slug.ilike.%${esc}%`,
      );
    }
    if (data.lifecycleState) q = q.eq("lifecycle_state", data.lifecycleState);
    if (data.provisioningStatus)
      q = q.eq("provisioning_status", data.provisioningStatus);

    q = q
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    const { data: rows, error, count } = await q;
    if (error) throw error;

    return {
      rows: rows ?? [],
      total: count ?? 0,
      limit: data.limit,
      offset: data.offset,
    };
  });

// ── Stats (counts per lifecycle_state) ──────────────────────────────────
export const getTenantRegistryStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tenants")
      .select("lifecycle_state, provisioning_status");
    if (error) throw error;

    const byLifecycle: Record<string, number> = {
      created: 0,
      active: 0,
      suspended: 0,
      archived: 0,
    };
    const byProvisioning: Record<string, number> = {
      not_started: 0,
      in_progress: 0,
      provisioned: 0,
      failed: 0,
    };
    for (const r of data ?? []) {
      const ls = String(r.lifecycle_state);
      const ps = String((r as { provisioning_status?: string }).provisioning_status ?? "not_started");
      byLifecycle[ls] = (byLifecycle[ls] ?? 0) + 1;
      byProvisioning[ps] = (byProvisioning[ps] ?? 0) + 1;
    }
    return {
      total: data?.length ?? 0,
      byLifecycle,
      byProvisioning,
    };
  });

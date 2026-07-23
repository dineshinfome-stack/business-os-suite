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

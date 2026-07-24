/**
 * SPR-MOD-001-002 — Company server functions.
 *
 * Every mutation delegates to a Phase 1 `private.fn_*_company` RPC; the DB
 * enforces the platform_admin gate and lifecycle guards. Idempotent no-op
 * branches (already_active / already_inactive / already_archived /
 * already_default) skip audit + return `event: null` per SPR-001 policy.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import { logCompanyEventFn } from "./audit";
import { buildCompanyEvent } from "./events";
import type { CompanyLifecycleState } from "./lifecycle";

// ── Validators ──────────────────────────────────────────────────────────
const CreateInput = z.object({
  tenantId: z.string().uuid(),
  slug: z.string().min(1).max(64),
  displayName: z.string().min(1).max(200),
  region: z.string().min(1).max(64).default("global"),
  defaultLocale: z.string().min(2).max(16).default("en"),
  timezone: z.string().min(1).max(64).default("UTC"),
  legalName: z.string().min(1).max(200).optional().nullable(),
  correlationId: z.string().min(1).optional(),
});

const CompanyIdInput = z.object({
  companyId: z.string().uuid(),
  correlationId: z.string().min(1).optional(),
});

const ListInput = z.object({
  tenantId: z.string().uuid().optional(),
});

// ── Read ────────────────────────────────────────────────────────────────
export const listCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_COMPANY_READ)])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("organizations")
      .select(
        "id, tenant_id, slug, name, legal_name, region, default_locale, timezone, lifecycle_state, is_default, activated_at, deactivated_at, archived_at, created_at",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (data.tenantId) q = q.eq("tenant_id", data.tenantId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

// ── Create ──────────────────────────────────────────────────────────────
export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_COMPANY_CREATE)])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: newId, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_create_company",
      {
        _tenant_id: data.tenantId,
        _slug: data.slug,
        _display_name: data.displayName,
        _region: data.region,
        _default_locale: data.defaultLocale,
        _timezone: data.timezone,
        _legal_name: data.legalName ?? null,
      } as never,
    );
    if (error) throw error;
    const companyId = newId as unknown as string;

    await logCompanyEventFn({
      data: {
        action: "company.created",
        companyId,
        toState: "created",
        correlationId: data.correlationId,
        extras: { tenant_id: data.tenantId, slug: data.slug },
      },
    });

    return {
      companyId,
      event: buildCompanyEvent("company.created", {
        companyId,
        actorId: context.userId,
        toState: "created",
        correlationId: data.correlationId,
        data: { tenant_id: data.tenantId, slug: data.slug },
      }),
    };
  });

// ── Activate ────────────────────────────────────────────────────────────
export const activateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_COMPANY_ACTIVATE)])
  .inputValidator((d: unknown) => CompanyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_activate_company",
      { _id: data.companyId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as {
      id: string;
      already_active: boolean;
      from_state: CompanyLifecycleState;
    };

    if (!result.already_active) {
      await logCompanyEventFn({
        data: {
          action: "company.activated",
          companyId: result.id,
          fromState: result.from_state,
          toState: "active",
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_active
        ? null
        : buildCompanyEvent("company.updated", {
            companyId: result.id,
            actorId: context.userId,
            fromState: result.from_state,
            toState: "active",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Deactivate ──────────────────────────────────────────────────────────
export const deactivateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_COMPANY_DEACTIVATE)])
  .inputValidator((d: unknown) => CompanyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_deactivate_company",
      { _id: data.companyId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as {
      id: string;
      already_inactive: boolean;
      from_state: CompanyLifecycleState;
    };

    if (!result.already_inactive) {
      await logCompanyEventFn({
        data: {
          action: "company.deactivated",
          companyId: result.id,
          fromState: result.from_state,
          toState: "inactive",
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_inactive
        ? null
        : buildCompanyEvent("company.updated", {
            companyId: result.id,
            actorId: context.userId,
            fromState: result.from_state,
            toState: "inactive",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Archive ─────────────────────────────────────────────────────────────
export const archiveCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_COMPANY_ARCHIVE)])
  .inputValidator((d: unknown) => CompanyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_archive_company",
      { _id: data.companyId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as {
      id: string;
      already_archived: boolean;
      from_state: CompanyLifecycleState;
    };

    if (!result.already_archived) {
      await logCompanyEventFn({
        data: {
          action: "company.archived",
          companyId: result.id,
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
        : buildCompanyEvent("company.archived", {
            companyId: result.id,
            actorId: context.userId,
            fromState: result.from_state,
            toState: "archived",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Set default ─────────────────────────────────────────────────────────
export const setDefaultCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_COMPANY_SET_DEFAULT)])
  .inputValidator((d: unknown) => CompanyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_set_default_company",
      { _id: data.companyId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as { id: string; already_default: boolean };

    if (!result.already_default) {
      await logCompanyEventFn({
        data: {
          action: "company.set_default",
          companyId: result.id,
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_default
        ? null
        : buildCompanyEvent("company.updated", {
            companyId: result.id,
            actorId: context.userId,
            correlationId: data.correlationId,
            data: { is_default: true },
          }),
    };
  });

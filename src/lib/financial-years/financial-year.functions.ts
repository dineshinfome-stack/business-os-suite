/**
 * SPR-MOD-001-002 — Financial-Year server functions.
 * Delegates to Phase 1 `private.fn_*_financial_year` RPCs. Non-overlap on
 * (organization_id, [start,end]) is enforced by the DB EXCLUDE constraint.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import { logFinancialYearEventFn } from "./audit";
import { buildFinancialYearEvent } from "./events";
import type { FinancialYearLifecycleState } from "./lifecycle";

const IsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD date");

const CreateInput = z.object({
  organizationId: z.string().uuid(),
  code: z.string().min(1).max(64),
  startDate: IsoDate,
  endDate: IsoDate,
  isDefault: z.boolean().default(false),
  correlationId: z.string().min(1).optional(),
});

const FyIdInput = z.object({
  financialYearId: z.string().uuid(),
  correlationId: z.string().min(1).optional(),
});

const ListInput = z.object({
  organizationId: z.string().uuid().optional(),
});

// ── Read ────────────────────────────────────────────────────────────────
export const listFinancialYears = createServerFn({ method: "GET" })
  .middleware([
    requireSupabaseAuth,
    requirePermission(PERMISSIONS.PLATFORM_FINANCIAL_YEAR_READ),
  ])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("financial_years")
      .select(
        "id, tenant_id, organization_id, code, start_date, end_date, lifecycle_state, is_default, opened_at, closed_at, archived_at, created_at",
      )
      .order("start_date", { ascending: false });
    if (data.organizationId) q = q.eq("organization_id", data.organizationId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

// ── Create ──────────────────────────────────────────────────────────────
export const createFinancialYear = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requirePermission(PERMISSIONS.PLATFORM_FINANCIAL_YEAR_CREATE),
  ])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: newId, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_create_financial_year",
      {
        _organization_id: data.organizationId,
        _code: data.code,
        _start_date: data.startDate,
        _end_date: data.endDate,
        _is_default: data.isDefault,
      } as never,
    );
    if (error) throw error;
    const financialYearId = newId as unknown as string;

    await logFinancialYearEventFn({
      data: {
        action: "financialyear.created",
        financialYearId,
        toState: "created",
        correlationId: data.correlationId,
        extras: {
          organization_id: data.organizationId,
          code: data.code,
          start_date: data.startDate,
          end_date: data.endDate,
          is_default: data.isDefault,
        },
      },
    });

    return {
      financialYearId,
      event: buildFinancialYearEvent("financialyear.created", {
        financialYearId,
        actorId: context.userId,
        toState: "created",
        correlationId: data.correlationId,
        data: {
          organization_id: data.organizationId,
          code: data.code,
          start_date: data.startDate,
          end_date: data.endDate,
        },
      }),
    };
  });

// ── Open ────────────────────────────────────────────────────────────────
export const openFinancialYear = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requirePermission(PERMISSIONS.PLATFORM_FINANCIAL_YEAR_OPEN),
  ])
  .inputValidator((d: unknown) => FyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_open_financial_year",
      { _id: data.financialYearId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as { id: string; already_open: boolean };

    const fromState: FinancialYearLifecycleState = "created";
    if (!result.already_open) {
      await logFinancialYearEventFn({
        data: {
          action: "financialyear.opened",
          financialYearId: result.id,
          fromState,
          toState: "open",
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_open
        ? null
        : buildFinancialYearEvent("financialyear.opened", {
            financialYearId: result.id,
            actorId: context.userId,
            fromState,
            toState: "open",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Close ───────────────────────────────────────────────────────────────
export const closeFinancialYear = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requirePermission(PERMISSIONS.PLATFORM_FINANCIAL_YEAR_CLOSE),
  ])
  .inputValidator((d: unknown) => FyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_close_financial_year",
      { _id: data.financialYearId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as { id: string; already_closed: boolean };

    const fromState: FinancialYearLifecycleState = "open";
    if (!result.already_closed) {
      await logFinancialYearEventFn({
        data: {
          action: "financialyear.closed",
          financialYearId: result.id,
          fromState,
          toState: "closed",
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_closed
        ? null
        : buildFinancialYearEvent("financialyear.closed", {
            financialYearId: result.id,
            actorId: context.userId,
            fromState,
            toState: "closed",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Archive ─────────────────────────────────────────────────────────────
export const archiveFinancialYear = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requirePermission(PERMISSIONS.PLATFORM_FINANCIAL_YEAR_ARCHIVE),
  ])
  .inputValidator((d: unknown) => FyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_archive_financial_year",
      { _id: data.financialYearId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as {
      id: string;
      already_archived: boolean;
    };

    const fromState: FinancialYearLifecycleState = "closed";
    if (!result.already_archived) {
      await logFinancialYearEventFn({
        data: {
          action: "financialyear.archived",
          financialYearId: result.id,
          fromState,
          toState: "archived",
          correlationId: data.correlationId,
        },
      });
    }

    return { ...result, event: null };
  });

// ── Set default ─────────────────────────────────────────────────────────
export const setDefaultFinancialYear = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requirePermission(PERMISSIONS.PLATFORM_FINANCIAL_YEAR_SET_DEFAULT),
  ])
  .inputValidator((d: unknown) => FyIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_set_default_financial_year",
      { _id: data.financialYearId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as {
      id: string;
      already_default: boolean;
    };

    if (!result.already_default) {
      await logFinancialYearEventFn({
        data: {
          action: "financialyear.set_default",
          financialYearId: result.id,
          correlationId: data.correlationId,
        },
      });
    }

    return { ...result, event: null };
  });

/**
 * SPR-MOD-001-002 — Branch server functions.
 * Delegates to Phase 1 `private.fn_*_branch` RPCs.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import type { Json } from "@/integrations/supabase/types";
import { logBranchEventFn } from "./audit";
import { buildBranchEvent } from "./events";
import type { BranchLifecycleState } from "./lifecycle";

const AddressSchema = z.record(z.string(), z.unknown()).optional();

const CreateInput = z.object({
  organizationId: z.string().uuid(),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  address: AddressSchema,
  timezone: z.string().min(1).max(64).default("UTC"),
  isDefault: z.boolean().default(false),
  correlationId: z.string().min(1).optional(),
});

const UpdateInput = z.object({
  branchId: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  address: AddressSchema,
  timezone: z.string().min(1).max(64).optional(),
  correlationId: z.string().min(1).optional(),
});

const BranchIdInput = z.object({
  branchId: z.string().uuid(),
  correlationId: z.string().min(1).optional(),
});

const ListInput = z.object({
  organizationId: z.string().uuid().optional(),
});

// ── Read ────────────────────────────────────────────────────────────────
export const listBranches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_BRANCH_READ)])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("branches")
      .select(
        "id, tenant_id, organization_id, code, name, address, timezone, lifecycle_state, is_default, archived_at, created_at",
      )
      .order("created_at", { ascending: false });
    if (data.organizationId) q = q.eq("organization_id", data.organizationId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

// ── Create ──────────────────────────────────────────────────────────────
export const createBranch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_BRANCH_CREATE)])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: newId, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_create_branch",
      {
        _organization_id: data.organizationId,
        _code: data.code,
        _name: data.name,
        _address: (data.address ?? {}) as Json,
        _timezone: data.timezone,
        _is_default: data.isDefault,
      } as never,
    );
    if (error) throw error;
    const branchId = newId as unknown as string;

    await logBranchEventFn({
      data: {
        action: "branch.created",
        branchId,
        toState: "active",
        correlationId: data.correlationId,
        extras: {
          organization_id: data.organizationId,
          code: data.code,
          is_default: data.isDefault,
        },
      },
    });

    return {
      branchId,
      event: buildBranchEvent("branch.created", {
        branchId,
        actorId: context.userId,
        toState: "active",
        correlationId: data.correlationId,
        data: {
          organization_id: data.organizationId,
          code: data.code,
          is_default: data.isDefault,
        },
      }),
    };
  });

// ── Update ──────────────────────────────────────────────────────────────
export const updateBranch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_BRANCH_UPDATE)])
  .inputValidator((d: unknown) => UpdateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_update_branch",
      {
        _id: data.branchId,
        _name: data.name ?? null,
        _address: (data.address ?? null) as Json | null,
        _timezone: data.timezone ?? null,
      } as never,
    );
    if (error) throw error;

    await logBranchEventFn({
      data: {
        action: "branch.updated",
        branchId: data.branchId,
        correlationId: data.correlationId,
        extras: {
          name: data.name ?? null,
          timezone: data.timezone ?? null,
        },
      },
    });

    return {
      branchId: data.branchId,
      event: buildBranchEvent("branch.updated", {
        branchId: data.branchId,
        actorId: context.userId,
        correlationId: data.correlationId,
        data: { name: data.name ?? null, timezone: data.timezone ?? null },
      }),
    };
  });

// ── Archive ─────────────────────────────────────────────────────────────
export const archiveBranch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_BRANCH_ARCHIVE)])
  .inputValidator((d: unknown) => BranchIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_archive_branch",
      { _id: data.branchId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as { id: string; already_archived: boolean };

    const fromState: BranchLifecycleState = "active";
    if (!result.already_archived) {
      await logBranchEventFn({
        data: {
          action: "branch.archived",
          branchId: result.id,
          fromState,
          toState: "archived",
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_archived
        ? null
        : buildBranchEvent("branch.updated", {
            branchId: result.id,
            actorId: context.userId,
            fromState,
            toState: "archived",
            correlationId: data.correlationId,
          }),
    };
  });

// ── Set default ─────────────────────────────────────────────────────────
export const setDefaultBranch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requirePermission(PERMISSIONS.PLATFORM_BRANCH_SET_DEFAULT)])
  .inputValidator((d: unknown) => BranchIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rpcResult, error } = await context.supabase.rpc(
      // @ts-expect-error — private-schema RPC not in generated types
      "fn_set_default_branch",
      { _id: data.branchId } as never,
    );
    if (error) throw error;
    const result = (rpcResult ?? {}) as { id: string; already_default: boolean };

    if (!result.already_default) {
      await logBranchEventFn({
        data: {
          action: "branch.set_default",
          branchId: result.id,
          correlationId: data.correlationId,
        },
      });
    }

    return {
      ...result,
      event: result.already_default
        ? null
        : buildBranchEvent("branch.updated", {
            branchId: result.id,
            actorId: context.userId,
            correlationId: data.correlationId,
            data: { is_default: true },
          }),
    };
  });

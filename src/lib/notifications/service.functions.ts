/**
 * Sprint 0.8 — Notifications Framework: server functions.
 *
 * All functions run under `requireSupabaseAuth`; RLS constrains rows to the
 * caller's memberships. Cross-user delivery (system fan-out) is not exposed
 * here — that goes through service_role providers not reachable from the
 * browser.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOrgContext } from "@/lib/organizations.functions";
import {
  NotificationChannel,
  NotificationSeverity,
  NotificationStatus,
} from "@/lib/notifications/constants";
import { getNotificationType } from "@/lib/notifications/registry";

async function resolveOrgId(explicit?: string | null): Promise<string> {
  if (explicit) return explicit;
  const ctx = await getOrgContext();
  if (!ctx.organizationId) throw new Error("No active organization");
  return ctx.organizationId;
}

// -- Reads ------------------------------------------------------------------

export interface NotificationRow {
  id: string;
  organizationId: string;
  type: string;
  category: string;
  title: string;
  message: string | null;
  severity: NotificationSeverity;
  status: NotificationStatus;
  actionUrl: string | null;
  actionLabel: string | null;
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
}

const ListInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  status: NotificationStatus.optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ListInput.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<NotificationRow[]> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    let q = context.supabase
      .from("notifications")
      .select(
        "id, organization_id, type, category, title, message, severity, status, action_url, action_label, created_at, read_at, archived_at",
      )
      .eq("organization_id", orgId)
      .eq("recipient_user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return (rows ?? []).map((r) => ({
      id: r.id,
      organizationId: r.organization_id,
      type: r.type,
      category: r.category,
      title: r.title,
      message: r.message,
      severity: r.severity as NotificationSeverity,
      status: r.status as NotificationStatus,
      actionUrl: r.action_url,
      actionLabel: r.action_label,
      createdAt: r.created_at,
      readAt: r.read_at,
      archivedAt: r.archived_at,
    }));
  });

export const getUnreadNotificationCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ organizationId: z.string().uuid().nullable().optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }): Promise<{ count: number }> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { count, error } = await context.supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("recipient_user_id", context.userId)
      .eq("status", "unread");
    if (error) throw error;
    return { count: count ?? 0 };
  });

// -- Mutations (recipient) --------------------------------------------------

const IdInput = z.object({ id: z.string().uuid() });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => IdInput.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("recipient_user_id", context.userId);
    if (error) throw error;
    return { ok: true as const };
  });

export const markNotificationArchived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => IdInput.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("recipient_user_id", context.userId);
    if (error) throw error;
    return { ok: true as const };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ organizationId: z.string().uuid().nullable().optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { error } = await context.supabase
      .from("notifications")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("organization_id", orgId)
      .eq("recipient_user_id", context.userId)
      .eq("status", "unread");
    if (error) throw error;
    return { ok: true as const };
  });

// -- Create (self-notification, e.g. for demo/manual testing) --------------

const CreateInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  type: z.string().min(1),
  title: z.string().min(1).max(200),
  message: z.string().max(2000).optional(),
  severity: NotificationSeverity.optional(),
  actionUrl: z.string().max(1000).optional(),
  actionLabel: z.string().max(80).optional(),
});

export const createSelfNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => CreateInput.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const def = getNotificationType(data.type);
    const category = def?.category ?? "system";
    const severity = data.severity ?? def?.defaultSeverity ?? "info";
    const { data: row, error } = await context.supabase
      .from("notifications")
      .insert({
        organization_id: orgId,
        recipient_user_id: context.userId,
        created_by: context.userId,
        type: data.type,
        category,
        title: data.title,
        message: data.message ?? null,
        severity,
        action_url: data.actionUrl ?? null,
        action_label: data.actionLabel ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });

// -- Preferences ------------------------------------------------------------

export interface NotificationPreferenceRow {
  id: string;
  channel: z.infer<typeof NotificationChannel>;
  category: string | null;
  enabled: boolean;
}

export const listMyNotificationPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ organizationId: z.string().uuid().nullable().optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }): Promise<NotificationPreferenceRow[]> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { data: rows, error } = await context.supabase
      .from("notification_preferences")
      .select("id, channel, category, enabled")
      .eq("organization_id", orgId)
      .eq("user_id", context.userId);
    if (error) throw error;
    return (rows ?? []).map((r) => ({
      id: r.id,
      channel: r.channel as z.infer<typeof NotificationChannel>,
      category: r.category,
      enabled: r.enabled,
    }));
  });

const UpsertPrefInput = z.object({
  organizationId: z.string().uuid().nullable().optional(),
  channel: NotificationChannel,
  category: z.string().min(1).nullable(),
  enabled: z.boolean(),
});

export const upsertNotificationPreference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpsertPrefInput.parse(data))
  .handler(async ({ data, context }) => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    // Manual upsert on (org, user, channel, category) — the unique index uses
    // COALESCE(category,'') so we replicate that here.
    const { data: existing, error: selErr } = await context.supabase
      .from("notification_preferences")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", context.userId)
      .eq("channel", data.channel)
      .is("category", data.category === null ? null : (undefined as never))
      .maybeSingle();
    let matchId = existing?.id ?? null;
    if (!matchId && data.category !== null) {
      const { data: match2, error: sel2Err } = await context.supabase
        .from("notification_preferences")
        .select("id")
        .eq("organization_id", orgId)
        .eq("user_id", context.userId)
        .eq("channel", data.channel)
        .eq("category", data.category)
        .maybeSingle();
      if (sel2Err) throw sel2Err;
      matchId = match2?.id ?? null;
    } else if (selErr) {
      throw selErr;
    }

    if (matchId) {
      const { error } = await context.supabase
        .from("notification_preferences")
        .update({ enabled: data.enabled })
        .eq("id", matchId);
      if (error) throw error;
      return { ok: true as const, id: matchId };
    }
    const { data: inserted, error } = await context.supabase
      .from("notification_preferences")
      .insert({
        organization_id: orgId,
        user_id: context.userId,
        channel: data.channel,
        category: data.category,
        enabled: data.enabled,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true as const, id: inserted.id };
  });

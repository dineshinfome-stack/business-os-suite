import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Verification probe — returns the authenticated user's id and roles as seen
 * by the server-side Supabase client (RLS scoped to auth.uid()). Used by the
 * verification report to prove middleware + authorization plumbing.
 */
export const getAuthContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .is("deleted_at", null);
    if (error) throw error;
    return {
      userId: context.userId,
      roles: (data ?? []).map((r) => r.role as string),
    };
  });

const AUDIT_ACTION_REGEX =
  /^[a-z]+(?:_[a-z]+)*_(in|out|requested|completed|created|updated|deleted|failed|granted|revoked)$/;

const AuditPayload = z.object({
  action: z.string().regex(AUDIT_ACTION_REGEX, "audit action must be past-tense verb form"),
  correlationId: z.string().min(1),
  entityId: z.string().uuid().optional(),
});

/**
 * Append an authentication audit event to public.audit_logs.
 *
 * Never store credentials, tokens, or session material. `old_values` /
 * `new_values` remain null for auth events — the action name plus actor id
 * and correlation id are the audit record.
 *
 * Runs under `requireSupabaseAuth` so the caller must present a valid bearer
 * token; the actor id is derived from the token, never from the caller's
 * request payload.
 */
export const logAuthEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => AuditPayload.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("audit_logs").insert({
      action: data.action,
      entity_type: "auth",
      entity_id: data.entityId ?? context.userId,
      actor_id: context.userId,
      created_by: context.userId,
      updated_by: context.userId,
      new_values: { correlation_id: data.correlationId },
    });
    if (error) throw error;
    return { ok: true as const };
  });

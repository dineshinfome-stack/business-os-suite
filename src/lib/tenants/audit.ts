/**
 * SPR-MOD-001-001 — Tenant lifecycle audit writer.
 * Writes to public.audit_logs under the caller's JWT (RLS-scoped).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TENANT_ACTIONS = [
  "tenant.created",
  "tenant.activated",
  "tenant.suspended",
  "tenant.archived",
] as const;

const Payload = z.object({
  action: z.enum(TENANT_ACTIONS),
  tenantId: z.string().uuid(),
  fromState: z.string().nullable().optional(),
  toState: z.string().nullable().optional(),
  correlationId: z.string().min(1).optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export const logTenantEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Payload.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("audit_logs").insert({
      action: data.action,
      entity_type: "tenant",
      entity_id: data.tenantId,
      actor_id: context.userId,
      created_by: context.userId,
      updated_by: context.userId,
      new_values: {
        from_state: data.fromState ?? null,
        to_state: data.toState ?? null,
        correlation_id: data.correlationId ?? null,
        ...(data.extras ?? {}),
      },
    });
    if (error) throw error;
    return { ok: true as const };
  });

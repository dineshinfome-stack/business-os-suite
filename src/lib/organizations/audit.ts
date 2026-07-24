/**
 * SPR-MOD-001-002 — Company lifecycle audit writer.
 * Mirrors src/lib/tenants/audit.ts (RLS-scoped under caller JWT).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const COMPANY_ACTIONS = [
  "company.created",
  "company.activated",
  "company.deactivated",
  "company.archived",
  "company.set_default",
] as const;

const Payload = z.object({
  action: z.enum(COMPANY_ACTIONS),
  companyId: z.string().uuid(),
  fromState: z.string().nullable().optional(),
  toState: z.string().nullable().optional(),
  correlationId: z.string().min(1).optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export const logCompanyEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Payload.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("audit_logs").insert({
      action: data.action,
      entity_type: "company",
      entity_id: data.companyId,
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

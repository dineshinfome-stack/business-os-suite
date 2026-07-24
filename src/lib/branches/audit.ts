/**
 * SPR-MOD-001-002 — Branch lifecycle audit writer.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BRANCH_ACTIONS = [
  "branch.created",
  "branch.updated",
  "branch.archived",
  "branch.set_default",
] as const;

const Payload = z.object({
  action: z.enum(BRANCH_ACTIONS),
  branchId: z.string().uuid(),
  fromState: z.string().nullable().optional(),
  toState: z.string().nullable().optional(),
  correlationId: z.string().min(1).optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
});

export const logBranchEventFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Payload.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("audit_logs").insert({
      action: data.action,
      entity_type: "branch",
      entity_id: data.branchId,
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

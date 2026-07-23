/**
 * Sprint 0.6 — Feature flags.
 *
 * Precedence: platform flag (organization_id = null) provides the default;
 * an organization row overrides it. Absent rows read as `disabled`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrgContext } from "@/integrations/supabase/org-middleware";
import { requireAnyPermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

export type FeatureFlagState = {
  key: string;
  enabled: boolean;
  source: "default" | "platform" | "organization";
  rolloutStage: "off" | "internal" | "beta" | "ga";
};

export const listFeatureFlagsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .handler(async ({ context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data, error } = await context.supabase
      .from("feature_flags")
      .select("*")
      .or(`organization_id.is.null,organization_id.eq.${orgId}`);
    if (error) throw error;
    const rows = (data ?? []) as Array<Record<string, unknown>>;

    const byKey = new Map<string, FeatureFlagState>();
    for (const r of rows) {
      const key = r.key as string;
      const isOrg = r.organization_id != null;
      const existing = byKey.get(key);
      const state: FeatureFlagState = {
        key,
        enabled: r.enabled as boolean,
        source: isOrg ? "organization" : "platform",
        rolloutStage: r.rollout_stage as FeatureFlagState["rolloutStage"],
      };
      if (!existing || (isOrg && existing.source !== "organization")) {
        byKey.set(key, state);
      }
    }
    return Array.from(byKey.values());
  });

const SetFlagInput = z.object({
  key: z.string().regex(/^[a-z0-9]+(\.[a-z0-9_]+)+$/),
  scope: z.enum(["platform", "organization"]),
  enabled: z.boolean(),
  rolloutStage: z.enum(["off", "internal", "beta", "ga"]).optional(),
});

export const setFeatureFlagFn = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requireOrgContext,
    requireAnyPermission([
      PERMISSIONS.SETTINGS_GENERAL_UPDATE,
      PERMISSIONS.PLATFORM_SETTINGS_MANAGE,
    ]),
  ])
  .inputValidator((data: unknown) => SetFlagInput.parse(data))
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    const organization_id = data.scope === "platform" ? null : orgId;

    const existingQ = context.supabase
      .from("feature_flags")
      .select("id")
      .eq("key", data.key);
    const { data: existing, error: exErr } =
      organization_id == null
        ? await existingQ.is("organization_id", null)
        : await existingQ.eq("organization_id", organization_id);
    if (exErr) throw exErr;

    const payload = {
      key: data.key,
      organization_id,
      enabled: data.enabled,
      rollout_stage: data.rolloutStage ?? (data.enabled ? "ga" : "off"),
      updated_by: context.userId,
    };

    if (existing && existing.length > 0) {
      const { error } = await context.supabase
        .from("feature_flags")
        .update(payload)
        .eq("id", existing[0].id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("feature_flags").insert(payload);
      if (error) throw error;
    }

    await context.supabase.from("audit_logs").insert({
      action: data.enabled ? "feature_flag_enabled" : "feature_flag_disabled",
      entity_type: "feature_flag",
      actor_id: context.userId,
      created_by: context.userId,
      updated_by: context.userId,
      new_values: { key: data.key, scope: data.scope, enabled: data.enabled },
    });
    return { ok: true as const };
  });

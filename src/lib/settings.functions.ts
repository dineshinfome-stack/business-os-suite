/**
 * Sprint 0.6 — Settings Foundation server functions.
 *
 * Resolution precedence:  system default  ->  platform value  ->  organization value.
 *
 * Framework-owned definitions (`is_system = true`) are read-only via this
 * API — they can only change through a migration.
 *
 * Sensitive definitions (`is_sensitive = true`) are redacted on every read
 * except `revealSensitiveSettingFn`, which requires `settings.security.manage`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrgContext } from "@/lib/org.middleware";
import { requirePermission, requireAnyPermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import {
  REDACTED_VALUE,
  validateSettingValue,
  type SettingDataType,
  type ValidationSchema,
} from "@/lib/settings-validation";

export type SettingScope = "platform" | "organization";

export type SettingDefinition = {
  id: string;
  key: string;
  category: string;
  scope: SettingScope;
  dataType: SettingDataType;
  defaultValue: unknown;
  validationSchema: ValidationSchema;
  description: string | null;
  isSystem: boolean;
  isSensitive: boolean;
  deprecatedAt: string | null;
};

export type ResolvedSetting = {
  key: string;
  value: unknown;
  source: "default" | "platform" | "organization";
  isSensitive: boolean;
  isSystem: boolean;
  scope: SettingScope;
};

function toDefinition(row: Record<string, unknown>): SettingDefinition {
  return {
    id: row.id as string,
    key: row.key as string,
    category: row.category as string,
    scope: row.scope as SettingScope,
    dataType: row.data_type as SettingDataType,
    defaultValue: row.default_value,
    validationSchema: (row.validation_schema ?? {}) as ValidationSchema,
    description: (row.description ?? null) as string | null,
    isSystem: row.is_system as boolean,
    isSensitive: row.is_sensitive as boolean,
    deprecatedAt: (row.deprecated_at ?? null) as string | null,
  };
}

/** List all setting definitions. Callers see the catalog; values load via resolve. */
export const listSettingDefinitionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("setting_definitions")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toDefinition);
  });

async function resolveWith(
  supabase: Awaited<
    ReturnType<typeof requireSupabaseAuth extends { server: infer S } ? never : never>
  > extends never
    ? any
    : any,
  orgId: string | null,
  keys?: string[],
): Promise<ResolvedSetting[]> {
  let defsQuery = supabase.from("setting_definitions").select("*").is("deprecated_at", null);
  if (keys && keys.length) defsQuery = defsQuery.in("key", keys);
  const { data: defs, error: defsErr } = await defsQuery;
  if (defsErr) throw defsErr;
  const definitions = (defs ?? []) as Record<string, unknown>[];
  if (definitions.length === 0) return [];

  const defIds = definitions.map((d) => d.id as string);
  let valsQuery = supabase.from("setting_values").select("*").in("definition_id", defIds);
  // We rely on RLS to filter values the caller cannot see; the resolver also
  // scopes explicitly to (platform=null) + current org.
  const { data: vals, error: valsErr } = await valsQuery;
  if (valsErr) throw valsErr;
  const values = (vals ?? []) as Array<Record<string, unknown>>;

  return definitions.map((raw) => {
    const def = toDefinition(raw);
    const platform = values.find(
      (v) => v.definition_id === def.id && v.organization_id == null,
    );
    const org =
      orgId != null
        ? values.find((v) => v.definition_id === def.id && v.organization_id === orgId)
        : undefined;

    let value: unknown = def.defaultValue;
    let source: ResolvedSetting["source"] = "default";
    if (platform) {
      value = platform.value;
      source = "platform";
    }
    if (org) {
      value = org.value;
      source = "organization";
    }

    if (def.isSensitive && typeof value === "string" && value.length > 0) {
      value = REDACTED_VALUE;
    }
    return {
      key: def.key,
      value,
      source,
      isSensitive: def.isSensitive,
      isSystem: def.isSystem,
      scope: def.scope,
    };
  });
}

/** Resolve a batch of settings for the current organization. */
export const resolveSettingsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) =>
    z.object({ keys: z.array(z.string()).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    return resolveWith(context.supabase, orgId, data.keys);
  });

/** Resolve a single setting. */
export const resolveSettingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) => z.object({ key: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    const results = await resolveWith(context.supabase, orgId, [data.key]);
    return results[0] ?? null;
  });

const SetSettingInput = z.object({
  key: z.string().min(1),
  scope: z.enum(["platform", "organization"]),
  value: z.unknown(),
});

/**
 * Set (upsert) a setting value. Validated server-side against the
 * definition's declared type and validation schema. Framework-owned
 * (`is_system`) definitions are rejected.
 */
export const setSettingFn = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requireOrgContext,
    requireAnyPermission([
      PERMISSIONS.SETTINGS_GENERAL_UPDATE,
      PERMISSIONS.PLATFORM_SETTINGS_MANAGE,
    ]),
  ])
  .inputValidator((data: unknown) => SetSettingInput.parse(data))
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;

    const { data: defRow, error: defErr } = await context.supabase
      .from("setting_definitions")
      .select("*")
      .eq("key", data.key)
      .maybeSingle();
    if (defErr) throw defErr;
    if (!defRow) throw new Response("Unknown setting", { status: 404 });
    const def = toDefinition(defRow as Record<string, unknown>);

    if (def.isSystem) {
      throw new Response("Framework-owned settings are read-only", { status: 403 });
    }
    if (def.scope === "platform" && data.scope !== "platform") {
      throw new Response("Setting only accepts platform scope", { status: 400 });
    }

    let parsed: unknown;
    try {
      parsed = validateSettingValue(def.dataType, def.validationSchema, data.value);
    } catch (err) {
      throw new Response(
        `Invalid value: ${err instanceof Error ? err.message : "validation failed"}`,
        { status: 400 },
      );
    }

    const organization_id = data.scope === "platform" ? null : orgId;

    // Upsert requires matching a UNIQUE index. Simulate via delete-then-insert
    // scoped to the exact (definition_id, organization_id) pair.
    const existingQ = context.supabase
      .from("setting_values")
      .select("id")
      .eq("definition_id", def.id);
    const { data: existing, error: exErr } =
      organization_id == null
        ? await existingQ.is("organization_id", null)
        : await existingQ.eq("organization_id", organization_id);
    if (exErr) throw exErr;

    const payload = {
      definition_id: def.id,
      organization_id,
      value: parsed as never,
      updated_by: context.userId,
    };

    if (existing && existing.length > 0) {
      const { error } = await context.supabase
        .from("setting_values")
        .update(payload)
        .eq("id", existing[0].id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("setting_values").insert(payload);
      if (error) throw error;
    }

    // Audit — never persist the raw value for sensitive settings.
    const auditValue = def.isSensitive ? REDACTED_VALUE : parsed;
    await context.supabase.from("audit_logs").insert({
      action: "setting_updated",
      entity_type: "setting",
      entity_id: def.id,
      actor_id: context.userId,
      created_by: context.userId,
      updated_by: context.userId,
      new_values: { key: def.key, scope: data.scope, value: auditValue },
    });

    return { ok: true as const };
  });

/** Delete a setting override, reverting the setting to the next-lower precedence. */
export const deleteSettingFn = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requireOrgContext,
    requireAnyPermission([
      PERMISSIONS.SETTINGS_GENERAL_UPDATE,
      PERMISSIONS.PLATFORM_SETTINGS_MANAGE,
    ]),
  ])
  .inputValidator((data: unknown) =>
    z
      .object({ key: z.string().min(1), scope: z.enum(["platform", "organization"]) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data: defRow, error: defErr } = await context.supabase
      .from("setting_definitions")
      .select("id,key,is_system")
      .eq("key", data.key)
      .maybeSingle();
    if (defErr) throw defErr;
    if (!defRow) throw new Response("Unknown setting", { status: 404 });
    if ((defRow as { is_system: boolean }).is_system) {
      throw new Response("Framework-owned settings are read-only", { status: 403 });
    }

    const q = context.supabase
      .from("setting_values")
      .delete()
      .eq("definition_id", (defRow as { id: string }).id);
    const { error } =
      data.scope === "platform"
        ? await q.is("organization_id", null)
        : await q.eq("organization_id", orgId);
    if (error) throw error;

    await context.supabase.from("audit_logs").insert({
      action: "setting_deleted",
      entity_type: "setting",
      entity_id: (defRow as { id: string }).id,
      actor_id: context.userId,
      created_by: context.userId,
      updated_by: context.userId,
      new_values: { key: data.key, scope: data.scope },
    });
    return { ok: true as const };
  });

/**
 * Reveal the raw value of a sensitive setting. Guarded by
 * `settings.security.manage`. Always audited.
 */
export const revealSensitiveSettingFn = createServerFn({ method: "POST" })
  .middleware([
    requireSupabaseAuth,
    requireOrgContext,
    requirePermission(PERMISSIONS.SETTINGS_SECURITY_MANAGE),
  ])
  .inputValidator((data: unknown) =>
    z
      .object({ key: z.string().min(1), scope: z.enum(["platform", "organization"]) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data: defRow, error: defErr } = await context.supabase
      .from("setting_definitions")
      .select("id,key,is_sensitive,default_value")
      .eq("key", data.key)
      .maybeSingle();
    if (defErr) throw defErr;
    if (!defRow) throw new Response("Unknown setting", { status: 404 });
    if (!(defRow as { is_sensitive: boolean }).is_sensitive) {
      throw new Response("Setting is not sensitive", { status: 400 });
    }

    const q = context.supabase
      .from("setting_values")
      .select("value")
      .eq("definition_id", (defRow as { id: string }).id);
    const { data: valRow, error: valErr } =
      data.scope === "platform"
        ? await q.is("organization_id", null).maybeSingle()
        : await q.eq("organization_id", orgId).maybeSingle();
    if (valErr) throw valErr;

    await context.supabase.from("audit_logs").insert({
      action: "setting_revealed",
      entity_type: "setting",
      entity_id: (defRow as { id: string }).id,
      actor_id: context.userId,
      created_by: context.userId,
      updated_by: context.userId,
      new_values: { key: data.key, scope: data.scope },
    });

    return {
      key: data.key,
      value: (valRow?.value ?? (defRow as { default_value: unknown }).default_value) ?? null,
    };
  });

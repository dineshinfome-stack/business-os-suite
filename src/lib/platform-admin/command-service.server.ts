/**
 * Gate 3.7 · Platform administration WRITE service — server only.
 *
 * Three narrow commands, all audited, all executed through the caller's
 * RLS-scoped client. No provider mutation, no lifecycle transition, no purge
 * execution — those remain owned by their existing consoles.
 */
import {
  findFeatureSpec,
  findSettingSpec,
  validateFeatureChange,
  validateSettingChange,
} from "./validation";
import {
  ATTENTION_ACK_ACTION,
  FEATURE_CHANGED_ACTION,
  SETTING_CHANGED_ACTION,
  type AnyClient,
} from "./query-service.server";
import type { PlatformAdminActionResultDTO } from "@/modules/platform/administration/types";

function newCorrelationId(): string {
  return crypto.randomUUID();
}

function fail(
  key: string,
  auditAction: string,
  message: string,
): PlatformAdminActionResultDTO {
  return {
    ok: false,
    key,
    previousValue: null,
    newValue: null,
    auditAction,
    correlationId: newCorrelationId(),
    message,
  };
}

async function writeAudit(
  client: AnyClient,
  input: {
    action: string;
    entityType: string;
    entityId: string;
    actorId: string;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
  },
): Promise<void> {
  const { error } = await client.from("audit_logs").insert({
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    actor_id: input.actorId,
    created_by: input.actorId,
    updated_by: input.actorId,
    old_values: input.oldValues,
    new_values: input.newValues,
  });
  if (error) throw error;
}

/* ---------------------------------------------------------------- settings */

export async function updatePlatformSettingCommand(
  client: AnyClient,
  actor: { userId: string },
  input: { key: string; value: unknown; reason?: string },
): Promise<PlatformAdminActionResultDTO> {
  const spec = findSettingSpec(input.key);
  const validation = validateSettingChange(input.key, input.value);
  if (!validation.ok) return fail(input.key, SETTING_CHANGED_ACTION, validation.error);
  if (!spec) return fail(input.key, SETTING_CHANGED_ACTION, "Unknown setting");

  const { data: def, error: defErr } = await client
    .from("setting_definitions")
    .select("id, key, is_system, is_sensitive")
    .eq("key", input.key)
    .eq("scope", "platform")
    .maybeSingle();
  if (defErr) throw defErr;
  if (!def) {
    return fail(
      input.key,
      SETTING_CHANGED_ACTION,
      `No platform setting definition is registered for ${input.key}.`,
    );
  }
  if (def.is_system) {
    return fail(
      input.key,
      SETTING_CHANGED_ACTION,
      `${input.key} is framework-owned and can only change through a migration.`,
    );
  }

  const { data: existing, error: readErr } = await client
    .from("setting_values")
    .select("id, value")
    .eq("definition_id", def.id)
    .is("organization_id", null)
    .maybeSingle();
  if (readErr) throw readErr;

  const previous = existing ? existing.value : spec.defaultValue;

  if (existing) {
    const { error } = await client
      .from("setting_values")
      .update({ value: validation.value, updated_by: actor.userId })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await client.from("setting_values").insert({
      definition_id: def.id,
      organization_id: null,
      value: validation.value,
      updated_by: actor.userId,
    });
    if (error) throw error;
  }

  const correlationId = newCorrelationId();
  await writeAudit(client, {
    action: SETTING_CHANGED_ACTION,
    entityType: "platform_setting",
    entityId: input.key,
    actorId: actor.userId,
    oldValues: { value: previous ?? null },
    newValues: {
      value: validation.value,
      reason: input.reason ?? null,
      correlation_id: correlationId,
    },
  });

  return {
    ok: true,
    key: input.key,
    previousValue: previous == null ? null : String(previous),
    newValue: String(validation.value),
    auditAction: SETTING_CHANGED_ACTION,
    correlationId,
    message: `${spec.label} updated.`,
  };
}

/* ---------------------------------------------------------------- features */

export async function setFeatureControlCommand(
  client: AnyClient,
  actor: { userId: string },
  input: { key: string; enabled: boolean; reason?: string },
): Promise<PlatformAdminActionResultDTO> {
  const spec = findFeatureSpec(input.key);
  const validation = validateFeatureChange(input.key, input.enabled);
  if (!validation.ok) return fail(input.key, FEATURE_CHANGED_ACTION, validation.error);
  if (!spec) return fail(input.key, FEATURE_CHANGED_ACTION, "Unknown feature control");

  const { data: existing, error: readErr } = await client
    .from("feature_flags")
    .select("id, enabled, rollout_stage")
    .eq("key", input.key)
    .is("organization_id", null)
    .maybeSingle();
  if (readErr) throw readErr;

  const previous = existing ? Boolean(existing.enabled) : false;

  if (existing) {
    const { error } = await client
      .from("feature_flags")
      .update({ enabled: input.enabled, updated_by: actor.userId })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await client.from("feature_flags").insert({
      key: input.key,
      organization_id: null,
      enabled: input.enabled,
      description: spec.description,
      updated_by: actor.userId,
    });
    if (error) throw error;
  }

  const correlationId = newCorrelationId();
  await writeAudit(client, {
    action: FEATURE_CHANGED_ACTION,
    entityType: "platform_feature_flag",
    entityId: input.key,
    actorId: actor.userId,
    oldValues: { enabled: previous },
    newValues: {
      enabled: input.enabled,
      reason: input.reason ?? null,
      correlation_id: correlationId,
    },
  });

  return {
    ok: true,
    key: input.key,
    previousValue: String(previous),
    newValue: String(input.enabled),
    auditAction: FEATURE_CHANGED_ACTION,
    correlationId,
    message: `${spec.displayName} ${input.enabled ? "enabled" : "disabled"}.`,
  };
}

/* -------------------------------------------------------------- attention */

export async function acknowledgeAttentionCommand(
  client: AnyClient,
  actor: { userId: string },
  input: { itemId: string; note?: string },
): Promise<PlatformAdminActionResultDTO> {
  const correlationId = newCorrelationId();
  await writeAudit(client, {
    action: ATTENTION_ACK_ACTION,
    entityType: "platform_attention_item",
    entityId: input.itemId,
    actorId: actor.userId,
    oldValues: { status: "open" },
    newValues: {
      status: "acknowledged",
      note: input.note ?? null,
      correlation_id: correlationId,
    },
  });

  return {
    ok: true,
    key: input.itemId,
    previousValue: "open",
    newValue: "acknowledged",
    auditAction: ATTENTION_ACK_ACTION,
    correlationId,
    message: "Attention item acknowledged.",
  };
}

/**
 * Gate 3.7 · Platform Administration Facade — COMMANDS.
 *
 * Thin wrapper module: imports + server-function declarations only.
 * Only three mutations exist in this gate; everything else is read-only or
 * deep-links into the owning console.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import {
  acknowledgeAttentionCommand,
  setFeatureControlCommand,
  updatePlatformSettingCommand,
} from "./command-service.server";

export const updatePlatformSetting = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_SETTINGS_MANAGE)])
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.string().min(1).max(128),
        value: z.union([z.string().max(200), z.number(), z.boolean()]),
        reason: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) =>
    updatePlatformSettingCommand(context.supabase, { userId: context.userId }, data),
  );

export const setPlatformFeatureControl = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_SETTINGS_MANAGE)])
  .inputValidator((input: unknown) =>
    z
      .object({
        key: z.string().min(1).max(128),
        enabled: z.boolean(),
        reason: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) =>
    setFeatureControlCommand(context.supabase, { userId: context.userId }, data),
  );

export const acknowledgePlatformAttention = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_UPDATE)])
  .inputValidator((input: unknown) =>
    z
      .object({
        itemId: z.string().min(1).max(200),
        note: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) =>
    acknowledgeAttentionCommand(context.supabase, { userId: context.userId }, data),
  );

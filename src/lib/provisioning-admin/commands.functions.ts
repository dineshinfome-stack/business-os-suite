/**
 * Gate 3.4 · Provisioning Admin Facade — COMMANDS.
 *
 * Thin wrapper module: imports + server-function declarations only.
 * Every command delegates to `ProvisioningService` via `command-service.server`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requirePermission } from "@/lib/authorization.server";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import {
  cancelProvisioningCommand,
  executeNextStepCommand,
  retryProvisioningCommand,
  rollbackProvisioningCommand,
  startProvisioningCommand,
} from "./command-service.server";

const JobInput = z.object({ jobId: z.string().uuid() });

export const startTenantProvisioning = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_CREATE)])
  .inputValidator((input: unknown) =>
    z
      .object({
        tenantId: z.string().uuid(),
        adminEmail: z.string().email(),
        providerKey: z.string().max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) =>
    startProvisioningCommand(context.supabase, { userId: context.userId }, data),
  );

export const retryProvisioning = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_UPDATE)])
  .inputValidator((input: unknown) => JobInput.parse(input))
  .handler(async ({ context, data }) =>
    retryProvisioningCommand(context.supabase, { userId: context.userId }, data.jobId),
  );

export const advanceProvisioning = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_UPDATE)])
  .inputValidator((input: unknown) => JobInput.parse(input))
  .handler(async ({ context, data }) =>
    executeNextStepCommand(context.supabase, { userId: context.userId }, data.jobId),
  );

export const cancelProvisioning = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_UPDATE)])
  .inputValidator((input: unknown) =>
    JobInput.extend({ reason: z.string().min(3).max(500) }).parse(input),
  )
  .handler(async ({ context, data }) =>
    cancelProvisioningCommand(
      context.supabase,
      { userId: context.userId },
      data.jobId,
      data.reason,
    ),
  );

export const rollbackProvisioning = createServerFn({ method: "POST" })
  .middleware([requirePermission(PERMISSIONS.PLATFORM_TENANT_ARCHIVE)])
  .inputValidator((input: unknown) => JobInput.parse(input))
  .handler(async ({ context, data }) =>
    rollbackProvisioningCommand(context.supabase, { userId: context.userId }, data.jobId),
  );

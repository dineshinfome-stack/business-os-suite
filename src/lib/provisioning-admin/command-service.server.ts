/**
 * Gate 3.4 · Provisioning command coordination — server only.
 *
 * A coordinator: it resolves inputs, composes `createProvisioningService`, and
 * maps orchestrator results to DTOs. No lifecycle, retry or rollback decisions
 * are made here — those belong to the orchestrator.
 */
import { createProvisioningService } from "@/lib/provisioning/integration/factory";
import { createSupabaseDataClient } from "@/lib/provisioning/integration/supabase-data-client";
import type { ProvisioningCommandResultDTO } from "@/modules/platform/provisioning/types";
import {
  resolveSupabaseProviderRuntime,
  SUPABASE_PROVIDER_KEY,
} from "./provider-resolver.server";

type AnyClient = { from: (table: string) => any };

export interface CommandActor {
  userId: string;
}

interface TenantRow {
  id: string;
  slug: string;
  display_name: string;
  region: string;
  lifecycle_state: string;
}

function failure(message: string, code = "command_failed"): ProvisioningCommandResultDTO {
  return {
    ok: false,
    jobId: null,
    state: null,
    message,
    error: { code, kind: "command", message, retryable: false },
  };
}

function newCorrelationId(): string {
  return `prov-${crypto.randomUUID()}`;
}

async function loadTenant(client: AnyClient, tenantId: string): Promise<TenantRow | null> {
  const { data, error } = await client
    .from("tenants")
    .select("id, slug, display_name, region, lifecycle_state")
    .eq("id", tenantId)
    .maybeSingle();
  if (error) throw error;
  return (data as TenantRow | null) ?? null;
}

async function loadJob(
  client: AnyClient,
  jobId: string,
): Promise<{ id: string; tenant_id: string; correlation_id: string; state: string } | null> {
  const { data, error } = await client
    .from("provisioning_jobs")
    .select("id, tenant_id, correlation_id, state")
    .eq("id", jobId)
    .maybeSingle();
  if (error) throw error;
  return (data as any) ?? null;
}

async function buildService(
  client: AnyClient,
  input: {
    jobId: string;
    tenant: TenantRow;
    correlationId: string;
    actorId: string;
    adminEmail: string;
  },
) {
  const runtime = resolveSupabaseProviderRuntime();
  if (!runtime.provider) {
    return { ok: false as const, message: runtime.message };
  }
  const built = createProvisioningService({
    dataClient: createSupabaseDataClient(client as never),
    provider: runtime.provider,
    request: {
      slug: input.tenant.slug,
      region: input.tenant.region ?? "us-east-1",
      credentials: runtime.credentials,
      adminEmail: input.adminEmail,
      migrations: [],
    },
    jobId: input.jobId,
    tenantId: input.tenant.id,
    correlationId: input.correlationId,
    actorId: input.actorId,
  });
  if (!built.ok) {
    return { ok: false as const, message: built.error.message };
  }
  return { ok: true as const, service: built.service };
}

export async function startProvisioningCommand(
  client: AnyClient,
  actor: CommandActor,
  input: { tenantId: string; adminEmail: string; providerKey?: string },
): Promise<ProvisioningCommandResultDTO> {
  const tenant = await loadTenant(client, input.tenantId);
  if (!tenant) return failure("Tenant not found.", "tenant_not_found");

  const { data: existing, error: existingError } = await client
    .from("provisioning_jobs")
    .select("id, state")
    .eq("tenant_id", tenant.id)
    .in("state", ["pending", "validating", "queued"])
    .limit(1);
  if (existingError) throw existingError;
  if (existing && existing.length > 0) {
    return {
      ok: true,
      jobId: existing[0].id,
      state: existing[0].state,
      message: "A provisioning job is already queued for this tenant.",
      error: null,
    };
  }

  const correlationId = newCorrelationId();
  const now = new Date().toISOString();
  const { data, error } = await client
    .from("provisioning_jobs")
    .insert({
      tenant_id: tenant.id,
      state: "pending",
      current_step_key: null,
      attempt_count: 0,
      correlation_id: correlationId,
      provider_key: input.providerKey ?? SUPABASE_PROVIDER_KEY,
      provider_resource_reference: {},
      last_error: null,
      last_transition_at: now,
      created_by: actor.userId,
      updated_by: actor.userId,
    })
    .select("id, state")
    .maybeSingle();
  if (error) throw error;
  if (!data) return failure("Provisioning job could not be created.");

  const service = await buildService(client, {
    jobId: data.id,
    tenant,
    correlationId,
    actorId: actor.userId,
    adminEmail: input.adminEmail,
  });
  if (!service.ok) {
    return {
      ok: true,
      jobId: data.id,
      state: data.state,
      message: `Job queued. ${service.message}`,
      error: null,
    };
  }

  const result = await service.service.startProvisioning({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      lifecycle_state: tenant.lifecycle_state as never,
    },
  });
  return mapResult(data.id, result, "Provisioning started.");
}

type OrchestratorResultLike =
  | { ok: true; value: unknown }
  | { ok: false; error: { code?: string; message: string; retryable?: boolean } };

function mapResult(
  jobId: string,
  result: OrchestratorResultLike,
  successMessage: string,
): ProvisioningCommandResultDTO {
  if (result.ok) {
    const snapshot = result.value as { state?: string } | undefined;
    return {
      ok: true,
      jobId,
      state: snapshot?.state ?? null,
      message: successMessage,
      error: null,
    };
  }
  return {
    ok: false,
    jobId,
    state: null,
    message: result.error.message,
    error: {
      code: result.error.code ?? "orchestrator_error",
      kind: "orchestrator",
      message: result.error.message,
      retryable: result.error.retryable === true,
    },
  };
}

async function withService(
  client: AnyClient,
  actor: CommandActor,
  jobId: string,
  run: (service: Awaited<ReturnType<typeof buildService>> extends { service: infer S }
    ? S
    : never) => Promise<OrchestratorResultLike>,
  successMessage: string,
): Promise<ProvisioningCommandResultDTO> {
  const job = await loadJob(client, jobId);
  if (!job) return failure("Provisioning job not found.", "job_not_found");
  const tenant = await loadTenant(client, job.tenant_id);
  if (!tenant) return failure("Tenant not found.", "tenant_not_found");

  const built = await buildService(client, {
    jobId: job.id,
    tenant,
    correlationId: job.correlation_id,
    actorId: actor.userId,
    adminEmail: `admin@${tenant.slug}.invalid`,
  });
  if (!built.ok) return failure(built.message, "provider_not_configured");

  return mapResult(job.id, await run(built.service as never), successMessage);
}

export function retryProvisioningCommand(
  client: AnyClient,
  actor: CommandActor,
  jobId: string,
) {
  return withService(
    client,
    actor,
    jobId,
    (service: any) => service.resumeProvisioning(),
    "Provisioning resumed.",
  );
}

export function executeNextStepCommand(
  client: AnyClient,
  actor: CommandActor,
  jobId: string,
) {
  return withService(
    client,
    actor,
    jobId,
    (service: any) => service.executeNextStep(),
    "Next step executed.",
  );
}

export function cancelProvisioningCommand(
  client: AnyClient,
  actor: CommandActor,
  jobId: string,
  reason: string,
) {
  return withService(
    client,
    actor,
    jobId,
    (service: any) => service.cancelProvisioning(reason),
    "Provisioning cancelled.",
  );
}

export function rollbackProvisioningCommand(
  client: AnyClient,
  actor: CommandActor,
  jobId: string,
) {
  return withService(
    client,
    actor,
    jobId,
    (service: any) => service.rollbackProvisioning(),
    "Rollback executed.",
  );
}

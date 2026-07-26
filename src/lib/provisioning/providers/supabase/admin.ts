/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Administrator creation.
 *
 * Idempotent: an existing user with the same email is adopted instead of
 * recreated. The service role key is fetched per call and never logged or
 * cached on the provider.
 */
import { adminError, cancellationError, fail } from "./errors";
import type { ManagementApi } from "./management-api";
import type {
  AuthAdminApi,
  FetchLike,
  ProviderCallContext,
  ProviderLogger,
} from "./types";

export interface AdminRunnerDeps {
  api: ManagementApi;
  authAdmin: AuthAdminApi;
  logger: ProviderLogger;
  signal?: AbortSignal;
}

export async function createAdministrator(
  deps: AdminRunnerDeps,
  input: { projectReference: string; email: string; ctx: ProviderCallContext },
): Promise<{ userId: string; created: boolean }> {
  if (deps.signal?.aborted) {
    fail(cancellationError("Administrator creation cancelled.", {
      project_reference: input.projectReference,
    }));
  }
  if (!input.email.includes("@")) {
    fail(adminError("Administrator email is not a valid address.", {
      project_reference: input.projectReference,
    }));
  }

  const keys = await deps.api.getApiKeys(input.projectReference, input.ctx);
  const call = {
    projectUrl: keys.projectUrl,
    serviceRoleKey: keys.serviceRoleKey,
    email: input.email,
    ...(deps.signal ? { signal: deps.signal } : {}),
  };

  const existing = await deps.authAdmin.findUserByEmail(call);
  if (existing) {
    deps.logger.info("administrator already present", {
      ...input.ctx,
      projectId: input.projectReference,
      idempotent: true,
    });
    return { userId: existing.userId, created: false };
  }

  const created = await deps.authAdmin.createUser(call);
  deps.logger.info("administrator created", {
    ...input.ctx,
    projectId: input.projectReference,
  });
  return { userId: created.userId, created: true };
}

/** Default Auth Admin API implementation over fetch. Injected, never global. */
export function createAuthAdminApi(fetchLike: FetchLike): AuthAdminApi {
  const headers = (serviceRoleKey: string) => ({
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  });

  return {
    async findUserByEmail(input) {
      const url = `${input.projectUrl}/auth/v1/admin/users?filter=${encodeURIComponent(input.email)}`;
      const res = await fetchLike(url, {
        method: "GET",
        headers: headers(input.serviceRoleKey),
        ...(input.signal ? { signal: input.signal } : {}),
      });
      if (!res.ok) {
        fail(adminError(`Auth Admin API lookup failed (${res.status}).`, { status: res.status }));
      }
      const body = await res.text();
      if (!body) return null;
      const parsed = JSON.parse(body) as { users?: Array<{ id?: string; email?: string }> };
      const match = parsed.users?.find(
        (u) => u.email?.toLowerCase() === input.email.toLowerCase(),
      );
      return match?.id ? { userId: match.id } : null;
    },

    async createUser(input) {
      const res = await fetchLike(`${input.projectUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: headers(input.serviceRoleKey),
        body: JSON.stringify({ email: input.email, email_confirm: true }),
        ...(input.signal ? { signal: input.signal } : {}),
      });
      if (!res.ok) {
        fail(adminError(`Auth Admin API user creation failed (${res.status}).`, {
          status: res.status,
        }));
      }
      const parsed = JSON.parse((await res.text()) || "{}") as { id?: string };
      if (!parsed.id) {
        fail(adminError("Auth Admin API returned no user id."));
      }
      return { userId: parsed.id };
    },
  };
}

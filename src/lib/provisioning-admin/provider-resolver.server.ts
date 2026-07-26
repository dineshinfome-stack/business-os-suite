/**
 * Gate 3.4 · Provider runtime resolution — server only.
 *
 * The dashboard never resolves a provider; the facade does, and only to run a
 * command or report configuration state. Missing credentials produce a typed
 * result, never a thrown provider error.
 */
import { buildSupabaseProvider } from "@/lib/provisioning/providers/supabase/factory";
import type { ProvisioningProvider } from "@/lib/provisioning/provider";
import type {
  MigrationSource,
  ProviderCallContext,
  SecretResolver,
  SeedSource,
  SupabaseCredentials,
} from "@/lib/provisioning/providers/supabase/types";
import type { SecretReference } from "@/lib/provisioning/types";

export const SUPABASE_PROVIDER_KEY = "supabase";
export const SUPABASE_PROVIDER_NAME = "Supabase";

export interface ProviderRuntime {
  configured: boolean;
  message: string;
  capabilities: {
    supportsRollback: boolean;
    supportsSqlExecution: boolean;
    supportsAdminCreation: boolean;
  };
  provider: ProvisioningProvider | null;
  credentials: SecretReference;
}

/** Static, deterministic sources. Real migration/seed catalogues land in 3.5. */
const emptyMigrations: MigrationSource = { list: async () => [] };
const emptySeeds: SeedSource = { list: async () => [] };

function credentialResolver(
  accessToken: string,
  organizationId: string,
): SecretResolver {
  return {
    async resolve(
      _reference: SecretReference,
      _ctx: ProviderCallContext,
    ): Promise<SupabaseCredentials> {
      return { accessToken, organizationId };
    },
  };
}

export function resolveSupabaseProviderRuntime(): ProviderRuntime {
  const accessToken = process.env.SUPABASE_MANAGEMENT_API_TOKEN ?? "";
  const organizationId = process.env.SUPABASE_ORGANIZATION_ID ?? "";
  const defaultRegion = process.env.SUPABASE_DEFAULT_REGION ?? "us-east-1";
  const credentials: SecretReference = {
    name: "supabase_management_api_token",
    scope: "platform",
  };

  if (!accessToken || !organizationId) {
    return {
      configured: false,
      message:
        "Supabase management credentials are not configured. Provisioning commands are unavailable.",
      capabilities: {
        supportsRollback: true,
        supportsSqlExecution: true,
        supportsAdminCreation: true,
      },
      provider: null,
      credentials,
    };
  }

  const provider = buildSupabaseProvider({
    organizationId,
    defaultRegion,
    secrets: credentialResolver(accessToken, organizationId),
    migrations: emptyMigrations,
    seeds: emptySeeds,
  });

  return {
    configured: true,
    message: "Supabase management credentials resolved.",
    capabilities: {
      supportsRollback: provider.capabilities.supportsRollback ?? false,
      supportsSqlExecution: provider.capabilities.supportsSqlExecution ?? false,
      supportsAdminCreation: provider.capabilities.supportsAdminCreation ?? false,
    },
    provider,
    credentials,
  };
}

/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Supabase provider assembly.
 *
 * Implements `ProvisioningProvider` by delegating to the focused modules. The
 * provider is STATELESS: credentials are resolved per call, no project status
 * or progress is cached, and every failure surfaces as a typed
 * `ProvisioningError` through `SupabaseProviderFailure`.
 */
import type {
  ApplyMigrationsInput,
  CreateAdministratorInput,
  CreateProjectInput,
  CreateProjectResult,
  DestroyProjectInput,
  ProviderCapabilities,
  ProvisioningProvider,
  SeedDatabaseInput,
} from "../../provider";
import type { HealthCheckResult, MigrationRecord, SecretReference } from "../../types";
import { createHttpClient } from "./client";
import { createManagementApi, type ManagementApi } from "./management-api";
import { createManagementSqlExecutor } from "./sql-executor";
import { buildProjectName, ensureProject, waitForProjectReady } from "./project";
import { applyMigrations } from "./migration";
import { runSeeds } from "./seed";
import { createAdministrator } from "./admin";
import { verifyHealth } from "./health";
import { destroyProject } from "./destroy";
import { SUPABASE_PROVIDER_KEY, toProviderFailure } from "./errors";
import type {
  ProviderCallContext,
  SqlExecutor,
  SupabaseCredentials,
  SupabaseProviderDeps,
} from "./types";

export const SUPABASE_REGIONS: readonly string[] = [
  "us-east-1",
  "us-west-1",
  "eu-west-1",
  "eu-central-1",
  "ap-south-1",
  "ap-southeast-1",
];

const capabilities: ProviderCapabilities = {
  key: SUPABASE_PROVIDER_KEY,
  supportsMigrations: true,
  supportsSeeding: true,
  supportsDestroy: true,
  supportsHealthCheck: true,
  supportsRollback: true,
  supportsSqlExecution: true,
  supportsAdminCreation: true,
  regions: SUPABASE_REGIONS,
};

const defaultPassword = (): string => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

export function createSupabaseProvider(deps: SupabaseProviderDeps): ProvisioningProvider {
  const { config, logger, clock } = deps;

  /** Per-call wiring — nothing is memoised between operations. */
  async function session(
    reference: SecretReference,
    ctx: ProviderCallContext,
  ): Promise<{ api: ManagementApi; sql: SqlExecutor; credentials: SupabaseCredentials }> {
    const credentials = await deps.secrets.resolve(reference, ctx);
    const http = createHttpClient({
      baseUrl: config.apiBaseUrl,
      credentials,
      fetch: deps.fetch,
      clock,
      logger,
      signal: deps.signal,
    });
    const api = createManagementApi({
      http,
      organizationId: credentials.organizationId || config.organizationId,
    });
    const sql = deps.createSqlExecutor
      ? deps.createSqlExecutor(credentials)
      : createManagementSqlExecutor({
          api,
          correlationId: ctx.correlationId,
          tenantId: ctx.tenantId,
          signal: deps.signal,
        });
    return { api, sql, credentials };
  }

  const guard = async <T>(operation: string, run: () => Promise<T>): Promise<T> => {
    try {
      return await run();
    } catch (cause) {
      throw toProviderFailure(cause, operation);
    }
  };

  return {
    capabilities,

    async createProject(input: CreateProjectInput): Promise<CreateProjectResult> {
      const ctx: ProviderCallContext = {
        correlationId: input.correlationId,
        tenantId: input.tenantId,
        operation: "create_project",
      };
      return guard("create_project", async () => {
        const { api } = await session(input.credentials, ctx);
        const name = buildProjectName(config.projectNamePrefix, input.slug);
        const region = SUPABASE_REGIONS.includes(input.region)
          ? input.region
          : config.defaultRegion;

        const ensured = await ensureProject(
          {
            api,
            clock,
            logger,
            readiness: config.readiness,
            region,
            passwordFactory: deps.passwordFactory ?? defaultPassword,
            signal: deps.signal,
          },
          { name, ctx },
        );

        const ready = await waitForProjectReady(
          {
            api,
            clock,
            logger,
            readiness: config.readiness,
            region,
            passwordFactory: deps.passwordFactory ?? defaultPassword,
            signal: deps.signal,
          },
          { reference: ensured.project.reference, ctx },
        );

        return {
          reference: ready.reference,
          resources: [
            {
              kind: "project",
              reference: ready.reference,
              step_key: "create_project",
              created_at: ready.createdAt ?? clock.nowIso(),
              metadata: {
                name: ready.name,
                region: ready.region,
                status: ready.status,
                adopted: !ensured.created,
              },
            },
          ],
        };
      });
    },

    async applyMigrations(input: ApplyMigrationsInput): Promise<MigrationRecord[]> {
      const ctx: ProviderCallContext = {
        correlationId: input.correlationId,
        projectId: input.projectReference,
        operation: "apply_migrations",
      };
      return guard("apply_migrations", async () => {
        const { sql } = await session(input.credentials, ctx);
        const result = await applyMigrations(
          { sql, source: deps.migrations, clock, logger, signal: deps.signal },
          { projectReference: input.projectReference, ctx, requested: input.migrations },
        );
        return [...result.applied, ...result.skipped];
      });
    },

    async seedDatabase(input: SeedDatabaseInput): Promise<void> {
      const ctx: ProviderCallContext = {
        correlationId: input.correlationId,
        projectId: input.projectReference,
        operation: "seed_database",
      };
      await guard("seed_database", async () => {
        const { sql } = await session(input.credentials, ctx);
        return runSeeds(
          { sql, source: deps.seeds, logger, signal: deps.signal },
          { projectReference: input.projectReference, ctx },
        );
      });
    },

    async createAdministrator(input: CreateAdministratorInput): Promise<{ userId: string }> {
      const ctx: ProviderCallContext = {
        correlationId: input.correlationId,
        projectId: input.projectReference,
        operation: "create_administrator",
      };
      return guard("create_administrator", async () => {
        const { api } = await session(input.credentials, ctx);
        const { userId } = await createAdministrator(
          { api, authAdmin: deps.authAdmin, logger, signal: deps.signal },
          { projectReference: input.projectReference, email: input.email, ctx },
        );
        return { userId };
      });
    },

    async verifyHealth(projectReference: string): Promise<HealthCheckResult> {
      const ctx: ProviderCallContext = {
        correlationId: `health:${projectReference}`,
        projectId: projectReference,
        operation: "verify_health",
      };
      return guard("verify_health", async () => {
        const { api, sql } = await session(
          { name: "SUPABASE_MANAGEMENT_TOKEN", scope: "platform" },
          ctx,
        );
        return verifyHealth({ api, sql, clock, logger }, { projectReference, ctx });
      });
    },

    async destroyProject(input: DestroyProjectInput): Promise<void> {
      const ctx: ProviderCallContext = {
        correlationId: input.correlationId,
        projectId: input.projectReference,
        operation: "destroy_project",
      };
      await guard("destroy_project", async () => {
        const { api } = await session(input.credentials, ctx);
        return destroyProject(
          { api, clock, logger, signal: deps.signal },
          { projectReference: input.projectReference, ctx },
        );
      });
    },
  };
}

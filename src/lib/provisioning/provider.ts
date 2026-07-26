/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Provider contract.
 *
 * INTERFACE ONLY. No SDK, no HTTP client, no implementation. Gate 3.3 supplies
 * the first concrete provider; the orchestrator (Gate 3.2) depends on this
 * interface, never on a vendor package (dependency inversion, ADR-018).
 */
import type {
  HealthCheckResult,
  MigrationRecord,
  ProviderResource,
  SecretReference,
} from "./types";

export interface ProviderCapabilities {
  /** Stable provider identifier persisted on the job. */
  key: string;
  supportsMigrations: boolean;
  supportsSeeding: boolean;
  supportsDestroy: boolean;
  supportsHealthCheck: boolean;
  regions: readonly string[];
}

export interface CreateProjectInput {
  tenantId: string;
  correlationId: string;
  slug: string;
  region: string;
  credentials: SecretReference;
}

export interface CreateProjectResult {
  resources: ProviderResource[];
  reference: string;
}

export interface ApplyMigrationsInput {
  correlationId: string;
  projectReference: string;
  migrations: readonly MigrationRecord[];
  credentials: SecretReference;
}

export interface SeedDatabaseInput {
  correlationId: string;
  projectReference: string;
  credentials: SecretReference;
}

export interface CreateAdministratorInput {
  correlationId: string;
  projectReference: string;
  email: string;
  credentials: SecretReference;
}

export interface DestroyProjectInput {
  correlationId: string;
  projectReference: string;
  credentials: SecretReference;
}

export interface ProvisioningProvider {
  readonly capabilities: ProviderCapabilities;
  createProject(input: CreateProjectInput): Promise<CreateProjectResult>;
  applyMigrations(input: ApplyMigrationsInput): Promise<MigrationRecord[]>;
  seedDatabase(input: SeedDatabaseInput): Promise<void>;
  createAdministrator(input: CreateAdministratorInput): Promise<{ userId: string }>;
  verifyHealth(projectReference: string): Promise<HealthCheckResult>;
  destroyProject(input: DestroyProjectInput): Promise<void>;
}

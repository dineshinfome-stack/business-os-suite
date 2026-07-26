/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Supabase provider composition root.
 *
 * The ONLY module allowed to supply defaults (base URL, clock, fetch). Nothing
 * below this file reads the environment.
 */
import { createAuthAdminApi } from "./admin";
import { supabaseProviderLogger } from "./logger";
import { createSupabaseProvider } from "./provider";
import type { ProvisioningProvider } from "../../provider";
import type {
  FetchLike,
  MigrationSource,
  ProviderClock,
  ProviderLogger,
  SecretResolver,
  SeedSource,
  SupabaseProviderConfig,
  SupabaseProviderDeps,
} from "./types";

export const DEFAULT_MANAGEMENT_API_URL = "https://api.supabase.com";

export const DEFAULT_READINESS = Object.freeze({
  maxAttempts: 40,
  baseDelayMs: 5_000,
  maxDelayMs: 30_000,
  multiplier: 1.5,
});

export const systemClock: ProviderClock = {
  nowMs: () => Date.now(),
  nowIso: () => new Date().toISOString(),
  sleep: (ms, signal) =>
    new Promise((resolve) => {
      if (signal?.aborted) return resolve();
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
    }),
};

const defaultFetch: FetchLike = (input, init) =>
  fetch(input, init as RequestInit) as unknown as ReturnType<FetchLike>;

export interface SupabaseProviderFactoryOptions {
  organizationId: string;
  defaultRegion: string;
  secrets: SecretResolver;
  migrations: MigrationSource;
  seeds: SeedSource;
  apiBaseUrl?: string;
  projectNamePrefix?: string;
  readiness?: SupabaseProviderConfig["readiness"];
  fetch?: FetchLike;
  clock?: ProviderClock;
  logger?: ProviderLogger;
  signal?: AbortSignal;
  passwordFactory?: () => string;
  createSqlExecutor?: SupabaseProviderDeps["createSqlExecutor"];
}

export function buildSupabaseProvider(
  options: SupabaseProviderFactoryOptions,
): ProvisioningProvider {
  const fetchImpl = options.fetch ?? defaultFetch;
  return createSupabaseProvider({
    config: {
      apiBaseUrl: options.apiBaseUrl ?? DEFAULT_MANAGEMENT_API_URL,
      organizationId: options.organizationId,
      defaultRegion: options.defaultRegion,
      readiness: options.readiness ?? DEFAULT_READINESS,
      projectNamePrefix: options.projectNamePrefix ?? "tenant-",
    },
    secrets: options.secrets,
    fetch: fetchImpl,
    clock: options.clock ?? systemClock,
    logger: options.logger ?? supabaseProviderLogger,
    migrations: options.migrations,
    seeds: options.seeds,
    authAdmin: createAuthAdminApi(fetchImpl),
    createSqlExecutor: options.createSqlExecutor ?? (() => {
      throw new Error("createSqlExecutor is resolved per session by the provider");
    }),
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.passwordFactory ? { passwordFactory: options.passwordFactory } : {}),
  });
}

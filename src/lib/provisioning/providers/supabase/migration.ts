/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Migration runner.
 *
 * Migration identity is version + checksum. A migration already recorded with
 * the same checksum is skipped; the same version with a DIFFERENT checksum is
 * a hard failure (drift), never a silent re-apply.
 *
 * Scripts arrive through the injected `MigrationSource` — no filesystem access
 * at runtime, so this works unchanged in a Worker.
 */
import { migrationError, fail, cancellationError } from "./errors";
import type { MigrationRecord } from "../../types";
import type {
  AppliedMigrations,
  MigrationScript,
  MigrationSource,
  ProviderClock,
  ProviderLogger,
  ProviderCallContext,
  SqlExecutor,
} from "./types";

const LEDGER_TABLE = "provisioning_migrations";

const CREATE_LEDGER_SQL = `
create schema if not exists platform;
create table if not exists platform.${LEDGER_TABLE} (
  version text primary key,
  name text not null,
  checksum text not null,
  applied_at timestamptz not null default now()
);
`;

const escape = (value: string) => value.replace(/'/g, "''");

export interface MigrationRunnerDeps {
  sql: SqlExecutor;
  source: MigrationSource;
  clock: ProviderClock;
  logger: ProviderLogger;
  signal?: AbortSignal;
}

interface LedgerEntry {
  version: string;
  checksum: string;
}

async function readLedger(
  deps: MigrationRunnerDeps,
  projectReference: string,
): Promise<Map<string, string>> {
  await deps.sql.execute({ projectReference, sql: CREATE_LEDGER_SQL, label: "ledger_init" });
  const result = await deps.sql.execute({
    projectReference,
    sql: `select version, checksum from platform.${LEDGER_TABLE};`,
    label: "ledger_read",
  });
  const entries = result.rows as unknown as LedgerEntry[];
  return new Map(entries.map((row) => [String(row.version), String(row.checksum)]));
}

const toRecord = (
  script: MigrationScript,
  status: MigrationRecord["status"],
  appliedAt: string | null,
): MigrationRecord => ({
  version: script.version,
  name: script.name,
  checksum: script.checksum,
  applied_at: appliedAt,
  status,
});

/**
 * Applies pending migrations in version order, one statement batch per script,
 * recording each in the ledger immediately after it succeeds so an interrupted
 * run resumes exactly where it stopped.
 */
export async function applyMigrations(
  deps: MigrationRunnerDeps,
  input: {
    projectReference: string;
    ctx: ProviderCallContext;
    /** Optional filter: only these versions are considered. */
    requested?: readonly MigrationRecord[];
  },
): Promise<AppliedMigrations> {
  const all = [...(await deps.source.list())].sort((a, b) => a.version.localeCompare(b.version));
  const requestedVersions = input.requested?.length
    ? new Set(input.requested.map((m) => m.version))
    : null;
  const scripts = requestedVersions ? all.filter((s) => requestedVersions.has(s.version)) : all;

  const ledger = await readLedger(deps, input.projectReference);
  const applied: MigrationRecord[] = [];
  const skipped: MigrationRecord[] = [];

  for (const script of scripts) {
    if (deps.signal?.aborted) {
      fail(cancellationError("Migration run cancelled.", { version: script.version }));
    }

    const recordedChecksum = ledger.get(script.version);
    if (recordedChecksum === script.checksum) {
      skipped.push(toRecord(script, "applied", null));
      continue;
    }
    if (recordedChecksum && recordedChecksum !== script.checksum) {
      fail(
        migrationError(
          `Migration ${script.version} was already applied with a different checksum (drift).`,
          {
            version: script.version,
            details: { recorded_checksum: recordedChecksum, script_checksum: script.checksum },
          },
        ),
      );
    }

    try {
      await deps.sql.execute({
        projectReference: input.projectReference,
        sql: script.sql,
        label: `migration_${script.version}`,
      });
      await deps.sql.execute({
        projectReference: input.projectReference,
        sql: `insert into platform.${LEDGER_TABLE} (version, name, checksum) values ('${escape(script.version)}', '${escape(script.name)}', '${escape(script.checksum)}') on conflict (version) do update set checksum = excluded.checksum, name = excluded.name, applied_at = now();`,
        label: `ledger_write_${script.version}`,
      });
    } catch (cause) {
      deps.logger.error("migration failed", {
        ...input.ctx,
        version: script.version,
        projectId: input.projectReference,
      });
      throw cause;
    }

    applied.push(toRecord(script, "applied", deps.clock.nowIso()));
    deps.logger.info("migration applied", {
      ...input.ctx,
      version: script.version,
      projectId: input.projectReference,
    });
  }

  return { applied, skipped };
}

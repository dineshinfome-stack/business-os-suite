/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Seed runner.
 *
 * Idempotent by verification query: a seed whose `verifySql` already returns
 * rows is skipped, so a retried step never duplicates baseline data.
 */
import { cancellationError, fail, seedError } from "./errors";
import type {
  ProviderCallContext,
  ProviderLogger,
  SeedResult,
  SeedSource,
  SqlExecutor,
} from "./types";

export interface SeedRunnerDeps {
  sql: SqlExecutor;
  source: SeedSource;
  logger: ProviderLogger;
  signal?: AbortSignal;
}

export async function runSeeds(
  deps: SeedRunnerDeps,
  input: { projectReference: string; ctx: ProviderCallContext },
): Promise<SeedResult> {
  const scripts = await deps.source.list();
  const executed: string[] = [];
  const skipped: string[] = [];

  for (const script of scripts) {
    if (deps.signal?.aborted) {
      fail(cancellationError("Seed run cancelled.", { seed: script.name }));
    }

    const check = await deps.sql.execute({
      projectReference: input.projectReference,
      sql: script.verifySql,
      label: `seed_verify_${script.name}`,
    });
    if (check.rows.length > 0) {
      skipped.push(script.name);
      continue;
    }

    await deps.sql.execute({
      projectReference: input.projectReference,
      sql: script.sql,
      label: `seed_${script.name}`,
    });

    const confirm = await deps.sql.execute({
      projectReference: input.projectReference,
      sql: script.verifySql,
      label: `seed_confirm_${script.name}`,
    });
    if (confirm.rows.length === 0) {
      fail(seedError(`Seed ${script.name} ran but its verification query returned no rows.`, {
        seed: script.name,
      }));
    }

    executed.push(script.name);
    deps.logger.info("seed applied", { ...input.ctx, seed: script.name });
  }

  return { executed, skipped };
}

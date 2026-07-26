/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Health verification.
 *
 * Health is more than "the API says ACTIVE_HEALTHY": it also proves the
 * database answers SQL and that the migration ledger exists.
 */
import type { HealthCheckResult } from "../../types";
import type { ManagementApi } from "./management-api";
import { isProviderFailure } from "./errors";
import type {
  ProviderCallContext,
  ProviderClock,
  ProviderLogger,
  SqlExecutor,
} from "./types";

export interface HealthDeps {
  api: ManagementApi;
  sql: SqlExecutor;
  clock: ProviderClock;
  logger: ProviderLogger;
}

type Check = HealthCheckResult["checks"][number];

const describe = (cause: unknown): string =>
  isProviderFailure(cause)
    ? cause.provisioningError.message
    : cause instanceof Error
      ? cause.message
      : String(cause);

export async function verifyHealth(
  deps: HealthDeps,
  input: { projectReference: string; ctx: ProviderCallContext },
): Promise<HealthCheckResult> {
  const checks: Check[] = [];

  let statusOk = false;
  try {
    const project = await deps.api.getProject(input.projectReference, input.ctx);
    statusOk = project?.status === "ACTIVE_HEALTHY";
    checks.push({
      name: "project_status",
      ok: statusOk,
      detail: project?.status ?? "missing",
    });
  } catch (cause) {
    checks.push({ name: "project_status", ok: false, detail: describe(cause) });
  }

  try {
    const probe = await deps.sql.execute({
      projectReference: input.projectReference,
      sql: "select 1 as ok;",
      label: "health_probe",
    });
    checks.push({ name: "database_query", ok: probe.rows.length > 0 });
  } catch (cause) {
    checks.push({ name: "database_query", ok: false, detail: describe(cause) });
  }

  try {
    const ledger = await deps.sql.execute({
      projectReference: input.projectReference,
      sql: "select to_regclass('platform.provisioning_migrations') is not null as present;",
      label: "health_ledger",
    });
    const present = ledger.rows[0]?.present === true;
    checks.push({ name: "migration_ledger", ok: present });
  } catch (cause) {
    checks.push({ name: "migration_ledger", ok: false, detail: describe(cause) });
  }

  const healthy = checks.every((c) => c.ok);
  deps.logger[healthy ? "info" : "warn"]("health check completed", {
    ...input.ctx,
    projectId: input.projectReference,
    healthy,
  });

  return { healthy, checked_at: deps.clock.nowIso(), checks };
}

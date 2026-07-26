/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · SQL executor over the Management API.
 *
 * Cloudflare Workers have no raw TCP, so the `pg` driver is unavailable at
 * runtime. This executor satisfies the `SqlExecutor` port through the
 * Management API SQL endpoint; a pg-based executor can replace it wherever a
 * Node runtime exists, with zero changes to the migration or seed runners.
 *
 * BOUNDARY: executes statements only — no ordering, no checksums, no
 * bookkeeping.
 */
import type { ManagementApi } from "./management-api";
import { cancellationError, fail } from "./errors";
import type { ProviderCallContext, SqlExecutor, SqlQueryInput, SqlResult } from "./types";

export interface ManagementSqlExecutorDeps {
  api: ManagementApi;
  correlationId: string;
  tenantId?: string | null;
  signal?: AbortSignal;
}

export function createManagementSqlExecutor(deps: ManagementSqlExecutorDeps): SqlExecutor {
  return {
    async execute(input: SqlQueryInput): Promise<SqlResult> {
      const signal = input.signal ?? deps.signal;
      if (signal?.aborted) {
        fail(cancellationError("SQL execution cancelled.", { label: input.label ?? null }));
      }
      const ctx: ProviderCallContext = {
        correlationId: deps.correlationId,
        tenantId: deps.tenantId ?? null,
        projectId: input.projectReference,
        operation: `sql:${input.label ?? "query"}`,
      };
      return deps.api.runQuery(input.projectReference, input.sql, ctx);
    },
  };
}

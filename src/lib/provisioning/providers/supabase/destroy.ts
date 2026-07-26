/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Destroy + rollback.
 *
 * Deletion is verified, not assumed: after the delete call the project is
 * re-read, and anything still present is reported as an orphan rather than
 * silently swallowed.
 */
import { cancellationError, fail, isProviderFailure, rollbackFailure } from "./errors";
import type { ManagementApi } from "./management-api";
import type {
  DestroyResult,
  ProviderCallContext,
  ProviderClock,
  ProviderLogger,
} from "./types";

export interface DestroyDeps {
  api: ManagementApi;
  clock: ProviderClock;
  logger: ProviderLogger;
  signal?: AbortSignal;
}

export async function destroyProject(
  deps: DestroyDeps,
  input: { projectReference: string; ctx: ProviderCallContext },
): Promise<DestroyResult> {
  if (deps.signal?.aborted) {
    fail(cancellationError("Destroy cancelled.", { project_reference: input.projectReference }));
  }

  const before = await deps.api.getProject(input.projectReference, input.ctx);
  if (!before || before.status === "REMOVED") {
    deps.logger.info("project already absent", {
      ...input.ctx,
      projectId: input.projectReference,
      idempotent: true,
    });
    return { deleted: true, verified: true, orphans: [] };
  }

  try {
    await deps.api.deleteProject(input.projectReference, input.ctx);
  } catch (cause) {
    const detail = isProviderFailure(cause) ? cause.provisioningError.message : String(cause);
    fail(
      rollbackFailure("Project deletion request failed.", {
        project_reference: input.projectReference,
        detail,
      }),
    );
  }

  const after = await deps.api.getProject(input.projectReference, input.ctx);
  const removed = !after || after.status === "REMOVED";
  if (!removed) {
    deps.logger.warn("project still present after deletion", {
      ...input.ctx,
      projectId: input.projectReference,
      status: after?.status,
    });
  }

  return {
    deleted: true,
    verified: removed,
    orphans: removed
      ? []
      : [
          {
            kind: "supabase_project",
            reference: input.projectReference,
            reason: `still_present:${after?.status ?? "unknown"}`,
          },
        ],
  };
}

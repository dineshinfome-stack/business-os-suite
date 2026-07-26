/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Project creation + readiness polling.
 *
 * Idempotent by deterministic project name: a retried step adopts the existing
 * project rather than creating a second one. Polling is abort-aware and
 * bounded; the provider stores no progress between calls.
 */
import { cancellationError, fail, projectCreationError, projectTimeoutError } from "./errors";
import type { ManagementApi } from "./management-api";
import type {
  ProjectInfo,
  ProviderCallContext,
  ProviderClock,
  ProviderLogger,
  ReadinessPolicy,
} from "./types";

/** Deterministic, collision-resistant and human-readable. */
export function buildProjectName(prefix: string, slug: string): string {
  const normalized = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  return `${prefix}${normalized}`.slice(0, 60);
}

export interface EnsureProjectDeps {
  api: ManagementApi;
  clock: ProviderClock;
  logger: ProviderLogger;
  readiness: ReadinessPolicy;
  region: string;
  passwordFactory: () => string;
  signal?: AbortSignal;
}

export interface EnsureProjectResult {
  project: ProjectInfo;
  created: boolean;
  databasePassword: string;
}

/** Find-or-create. The lookup runs first so retries never duplicate projects. */
export async function ensureProject(
  deps: EnsureProjectDeps,
  input: { name: string; ctx: ProviderCallContext },
): Promise<EnsureProjectResult> {
  const existing = (await deps.api.listProjects(input.ctx)).find((p) => p.name === input.name);
  if (existing) {
    deps.logger.info("adopting existing project", {
      ...input.ctx,
      projectId: existing.reference,
      idempotent: true,
    });
    return { project: existing, created: false, databasePassword: "" };
  }

  const databasePassword = deps.passwordFactory();
  const project = await deps.api.createProject(
    { name: input.name, region: deps.region, databasePassword },
    input.ctx,
  );
  if (project.status === "INIT_FAILED") {
    fail(projectCreationError("Supabase reported INIT_FAILED immediately after creation.", {
      details: { project_reference: project.reference },
    }));
  }
  deps.logger.info("project created", { ...input.ctx, projectId: project.reference });
  return { project, created: true, databasePassword };
}

const delayFor = (attempt: number, policy: ReadinessPolicy): number =>
  Math.min(policy.maxDelayMs, Math.round(policy.baseDelayMs * policy.multiplier ** attempt));

/**
 * Polls until the project is ACTIVE_HEALTHY.
 *
 * Cancellation raises a permanent cancellation error; exhausting the budget
 * raises a RETRYABLE timeout so the orchestrator can resume rather than
 * destroy a project that is merely slow.
 */
export async function waitForProjectReady(
  deps: EnsureProjectDeps,
  input: { reference: string; ctx: ProviderCallContext },
): Promise<ProjectInfo> {
  const { readiness, clock, logger, signal } = deps;

  for (let attempt = 0; attempt < readiness.maxAttempts; attempt += 1) {
    if (signal?.aborted) {
      fail(cancellationError("Readiness polling cancelled.", { project_reference: input.reference }));
    }

    const project = await deps.api.getProject(input.reference, input.ctx);
    if (!project) {
      fail(projectCreationError("Project disappeared while waiting for readiness.", {
        retryable: true,
        details: { project_reference: input.reference },
      }));
    }

    if (project.status === "ACTIVE_HEALTHY") {
      logger.info("project ready", { ...input.ctx, projectId: project.reference, attempt });
      return project;
    }
    if (project.status === "INIT_FAILED" || project.status === "REMOVED") {
      fail(projectCreationError(`Project entered terminal status ${project.status}.`, {
        details: { project_reference: input.reference, status: project.status },
      }));
    }

    logger.debug("project not ready", {
      ...input.ctx,
      projectId: input.reference,
      status: project.status,
      attempt,
    });
    await clock.sleep(delayFor(attempt, readiness), signal);
  }

  fail(
    projectTimeoutError("Project did not become healthy within the readiness budget.", {
      project_reference: input.reference,
      max_attempts: readiness.maxAttempts,
    }),
  );
}

/**
 * Gate 3.4 · Row → DTO mapping and server-side timeline derivation.
 *
 * Server-only helper module (imported by `*.functions.ts` handlers). Kept out
 * of the server-function module scope so the server-fn split transform cannot
 * strip these declarations.
 *
 * Orchestration events are NOT persisted (see `integration/event-sink.ts`), so
 * the timeline is derived here from the durable job + step records. The UI
 * renders the derived entries verbatim.
 */
import { PROVISIONING_STEP_KEYS } from "@/lib/provisioning/constants";
import { isTerminal, type ProvisioningState } from "@/lib/provisioning/lifecycle";
import { deriveTenantProvisioningStatus } from "@/lib/provisioning/status";
import type {
  ProvisioningErrorDTO,
  ProvisioningFailureDTO,
  ProvisioningJobDetailDTO,
  ProvisioningJobListItemDTO,
  ProvisioningStepDTO,
  ProvisioningSummaryDTO,
  ProvisioningTimelineEntryDTO,
} from "@/modules/platform/provisioning/types";

export const TOTAL_STEPS = PROVISIONING_STEP_KEYS.length;
export const DEFAULT_POLL_INTERVAL_MS = 5_000;
export const EXPORT_ROW_LIMIT = 5_000;

const STEP_LABELS: Record<string, string> = {
  validate: "Validate request",
  create_project: "Create project",
  apply_migrations: "Apply migrations",
  seed_database: "Seed database",
  create_administrator: "Create administrator",
  verify_health: "Verify health",
};

export function stepLabel(key: string): string {
  return STEP_LABELS[key] ?? key.replace(/_/g, " ");
}

export interface JobRowLike {
  id: string;
  tenant_id: string;
  state: string;
  current_step_key: string | null;
  attempt_count: number;
  correlation_id: string;
  provider_key: string;
  provider_resource_reference: unknown;
  last_error: unknown;
  started_at: string | null;
  last_transition_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface StepRowLike {
  step_key: string;
  sequence: number;
  status: string;
  attempt_count: number;
  error: unknown;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
}

export interface TenantFactsLike {
  id: string;
  display_name: string | null;
  slug: string | null;
  region: string | null;
}

export function toErrorDTO(raw: unknown): ProvisioningErrorDTO | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.message !== "string") return null;
  return {
    code: typeof e.code === "string" ? e.code : "unknown",
    kind: typeof e.kind === "string" ? e.kind : "unknown",
    message: e.message,
    retryable: e.retryable === true,
  };
}

export function toResourceReferences(
  raw: unknown,
): { kind: string; reference: string }[] {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string")
    .map(([k, v]) => ({ kind: k.replace(/_reference$/, ""), reference: v as string }));
}

function completedStepCount(steps: StepRowLike[]): number {
  return steps.filter((s) => s.status === "succeeded" || s.status === "skipped").length;
}

export function toListItemDTO(
  job: JobRowLike,
  tenant: TenantFactsLike | undefined,
  steps: StepRowLike[] = [],
): ProvisioningJobListItemDTO {
  const state = job.state as ProvisioningState;
  const error = toErrorDTO(job.last_error);
  const completed = completedStepCount(steps);
  return {
    jobId: job.id,
    tenantId: job.tenant_id,
    tenantName: tenant?.display_name ?? "Unknown tenant",
    tenantSlug: tenant?.slug ?? "",
    state,
    status: deriveTenantProvisioningStatus(state),
    currentStepKey: job.current_step_key,
    completedSteps: completed,
    totalSteps: TOTAL_STEPS,
    progressPercent:
      state === "completed"
        ? 100
        : Math.round((completed / TOTAL_STEPS) * 100),
    attemptCount: job.attempt_count,
    providerKey: job.provider_key,
    region: tenant?.region ?? "unknown",
    correlationId: job.correlation_id,
    retryable: error?.retryable ?? (state === "failed" || state === "retrying"),
    error,
    startedAt: job.started_at,
    completedAt: job.completed_at,
    createdAt: job.created_at,
    lastTransitionAt: job.last_transition_at,
  };
}

export function toStepDTOs(steps: StepRowLike[]): ProvisioningStepDTO[] {
  const known = new Map(steps.map((s) => [s.step_key, s]));
  return PROVISIONING_STEP_KEYS.map((key, index) => {
    const row = known.get(key);
    return {
      stepKey: key,
      label: stepLabel(key),
      sequence: row?.sequence ?? index + 1,
      status: row?.status ?? "pending",
      attemptCount: row?.attempt_count ?? 0,
      durationMs: row?.duration_ms ?? null,
      startedAt: row?.started_at ?? null,
      completedAt: row?.completed_at ?? null,
      error: toErrorDTO(row?.error),
    };
  });
}

const STATUS_TONE: Record<string, ProvisioningTimelineEntryDTO["tone"]> = {
  succeeded: "success",
  skipped: "neutral",
  failed: "danger",
  rolled_back: "warning",
  running: "neutral",
  pending: "neutral",
};

export function deriveTimeline(
  job: JobRowLike,
  steps: StepRowLike[],
): ProvisioningTimelineEntryDTO[] {
  const entries: ProvisioningTimelineEntryDTO[] = [
    {
      id: `${job.id}:created`,
      at: job.created_at,
      label: "Provisioning requested",
      description: `Job created with correlation ${job.correlation_id}.`,
      tone: "neutral",
      stepKey: null,
      durationMs: null,
    },
  ];

  if (job.started_at) {
    entries.push({
      id: `${job.id}:started`,
      at: job.started_at,
      label: "Provisioning started",
      description: `Provider ${job.provider_key} began execution.`,
      tone: "neutral",
      stepKey: null,
      durationMs: null,
    });
  }

  for (const step of [...steps].sort((a, b) => a.sequence - b.sequence)) {
    if (step.started_at) {
      entries.push({
        id: `${job.id}:${step.step_key}:started`,
        at: step.started_at,
        label: `${stepLabel(step.step_key)} started`,
        description: `Attempt ${step.attempt_count || 1}.`,
        tone: "neutral",
        stepKey: step.step_key,
        durationMs: null,
      });
    }
    if (step.completed_at) {
      const error = toErrorDTO(step.error);
      entries.push({
        id: `${job.id}:${step.step_key}:${step.status}`,
        at: step.completed_at,
        label: `${stepLabel(step.step_key)} ${step.status.replace(/_/g, " ")}`,
        description: error ? error.message : "Completed without errors.",
        tone: STATUS_TONE[step.status] ?? "neutral",
        stepKey: step.step_key,
        durationMs: step.duration_ms,
      });
    }
  }

  if (job.completed_at) {
    const error = toErrorDTO(job.last_error);
    entries.push({
      id: `${job.id}:terminal`,
      at: job.completed_at,
      label: `Job ${job.state.replace(/_/g, " ")}`,
      description: error ? error.message : "Job reached a terminal state.",
      tone: job.state === "completed" ? "success" : error ? "danger" : "warning",
      stepKey: null,
      durationMs: null,
    });
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}

export function rollbackStateOf(
  job: JobRowLike,
  steps: StepRowLike[],
): "none" | "partial" | "complete" {
  const rolled = steps.filter((s) => s.status === "rolled_back").length;
  if (rolled === 0) return "none";
  if (job.state === "rolled_back") return "complete";
  return "partial";
}

export function toDetailDTO(
  job: JobRowLike,
  tenant: TenantFactsLike | undefined,
  steps: StepRowLike[],
): ProvisioningJobDetailDTO {
  return {
    ...toListItemDTO(job, tenant, steps),
    steps: toStepDTOs(steps),
    timeline: deriveTimeline(job, steps),
    rollbackState: rollbackStateOf(job, steps),
    resourceReferences: toResourceReferences(job.provider_resource_reference),
    pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
    terminal: isTerminal(job.state as ProvisioningState),
  };
}

export function toFailureDTO(
  job: JobRowLike,
  tenant: TenantFactsLike | undefined,
  steps: StepRowLike[],
): ProvisioningFailureDTO {
  const failed = steps.find((s) => s.status === "failed");
  return {
    ...toListItemDTO(job, tenant, steps),
    failedStepKey: failed?.step_key ?? job.current_step_key,
    rollbackState: rollbackStateOf(job, steps),
  };
}

export function summarize(jobs: JobRowLike[]): ProvisioningSummaryDTO {
  let completed = 0;
  let failed = 0;
  let cancelled = 0;
  let rolledBack = 0;
  let active = 0;
  const durations: number[] = [];

  for (const job of jobs) {
    const state = job.state as ProvisioningState;
    if (state === "completed") {
      completed += 1;
      if (job.started_at && job.completed_at) {
        durations.push(Date.parse(job.completed_at) - Date.parse(job.started_at));
      }
    } else if (state === "failed") failed += 1;
    else if (state === "cancelled") cancelled += 1;
    else if (state === "rolled_back") rolledBack += 1;
    else active += 1;
  }

  const terminal = completed + failed + cancelled + rolledBack;
  return {
    total: jobs.length,
    active,
    completed,
    failed,
    cancelled,
    rolledBack,
    successRate: terminal === 0 ? 0 : Math.round((completed / terminal) * 100),
    averageDurationMs:
      durations.length === 0
        ? null
        : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    generatedAt: new Date().toISOString(),
  };
}

const CSV_COLUMNS: [string, (r: ProvisioningJobListItemDTO) => string][] = [
  ["Job ID", (r) => r.jobId],
  ["Tenant", (r) => r.tenantName],
  ["Slug", (r) => r.tenantSlug],
  ["State", (r) => r.state],
  ["Status", (r) => r.status],
  ["Progress", (r) => `${r.progressPercent}%`],
  ["Provider", (r) => r.providerKey],
  ["Region", (r) => r.region],
  ["Attempts", (r) => String(r.attemptCount)],
  ["Correlation ID", (r) => r.correlationId],
  ["Error", (r) => r.error?.message ?? ""],
  ["Created At", (r) => r.createdAt],
  ["Completed At", (r) => r.completedAt ?? ""],
];

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: ProvisioningJobListItemDTO[]): string {
  const header = CSV_COLUMNS.map(([name]) => csvCell(name)).join(",");
  const body = rows.map((row) =>
    CSV_COLUMNS.map(([, get]) => csvCell(get(row))).join(","),
  );
  return [header, ...body].join("\n");
}

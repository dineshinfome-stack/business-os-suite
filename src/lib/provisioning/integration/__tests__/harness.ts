/**
 * Gate 3.2.2 integration harness.
 *
 * An in-memory `ProvisioningDataClient` (the storage seam), a fake provider and
 * a deterministic clock. The adapters under test are the REAL ones — only the
 * row store and the provider are substituted. No infrastructure.
 */
import { vi } from "vitest";
import { PROVISIONING_STEP_SEQUENCE } from "../../constants";
import type { ProvisioningState } from "../../lifecycle";
import type { ProvisioningProvider } from "../../provider";
import type { ProvisioningEventEnvelope } from "../../events";
import type { OrchestratorLogFields, OrchestratorLogger } from "../../orchestrator/types";
import type { Clock } from "../../orchestrator/types";
import type {
  JobUpdateCommand,
  ProvisioningDataClient,
  ProvisioningJobRow,
  ProvisioningStepRow,
  StepClaimCommand,
  StepOutcomeCommand,
} from "../data-client";
import { createProvisioningService, type ProvisioningServiceInput } from "../factory";
import type { ProvisioningService } from "../service";

export const JOB_ID = "44444444-4444-4444-8444-444444444444";
export const TENANT_ID = "55555555-5555-4555-8555-555555555555";
export const ACTOR_ID = "66666666-6666-4666-8666-666666666666";
export const CORRELATION_ID = "corr-gate-322";
export const NOW = "2026-07-26T00:00:00.000Z";

export const VALID_TENANT = {
  id: TENANT_ID,
  slug: "acme-corp",
  code: "ACME",
  lifecycle_state: "active" as const,
};

export function makeJobRow(
  overrides: Partial<ProvisioningJobRow> = {},
): ProvisioningJobRow {
  return {
    id: JOB_ID,
    tenant_id: TENANT_ID,
    state: "pending",
    current_step_key: null,
    attempt_count: 0,
    correlation_id: CORRELATION_ID,
    provider_key: "fake",
    provider_resource_reference: {},
    last_error: null,
    started_at: null,
    last_transition_at: NOW,
    completed_at: null,
    created_at: NOW,
    updated_at: NOW,
    created_by: ACTOR_ID,
    updated_by: ACTOR_ID,
    ...overrides,
  };
}

export function makeStepRow(
  step_key: keyof typeof PROVISIONING_STEP_SEQUENCE,
  overrides: Partial<ProvisioningStepRow> = {},
): ProvisioningStepRow {
  return {
    id: `step-${step_key}`,
    job_id: JOB_ID,
    step_key,
    sequence: PROVISIONING_STEP_SEQUENCE[step_key],
    status: "pending",
    attempt_count: 0,
    correlation_id: CORRELATION_ID,
    error: null,
    started_at: null,
    completed_at: null,
    duration_ms: null,
    ...overrides,
  };
}

export interface MemoryStore extends ProvisioningDataClient {
  readonly job: ProvisioningJobRow;
  readonly steps: ProvisioningStepRow[];
  readonly updates: JobUpdateCommand[];
  readonly claims: StepClaimCommand[];
  readonly outcomes: StepOutcomeCommand[];
  /** Ordered log of every persistence/event operation, for ordering assertions. */
  readonly journal: string[];
  setJobState(state: ProvisioningState): void;
  setOtherActiveJobs(tenantId: string, count: number): void;
}

export function createMemoryDataClient(options: {
  job?: Partial<ProvisioningJobRow>;
  steps?: ProvisioningStepRow[];
  journal?: string[];
} = {}): MemoryStore {
  const state = {
    job: makeJobRow(options.job),
    steps: options.steps ? [...options.steps] : ([] as ProvisioningStepRow[]),
    updates: [] as JobUpdateCommand[],
    claims: [] as StepClaimCommand[],
    outcomes: [] as StepOutcomeCommand[],
    journal: options.journal ?? ([] as string[]),
    otherActiveJobs: new Map<string, number>(),
  };

  return {
    get job() {
      return state.job;
    },
    get steps() {
      return state.steps;
    },
    get updates() {
      return state.updates;
    },
    get claims() {
      return state.claims;
    },
    get outcomes() {
      return state.outcomes;
    },
    get journal() {
      return state.journal;
    },
    setJobState(next) {
      state.job = { ...state.job, state: next };
    },
    setOtherActiveJobs(tenantId, count) {
      state.otherActiveJobs.set(tenantId, count);
    },

    async selectJob(jobId) {
      return jobId === state.job.id ? { ...state.job } : null;
    },
    async selectSteps(jobId) {
      return state.steps.filter((s) => s.job_id === jobId).map((s) => ({ ...s }));
    },
    async countActiveJobs(tenantId) {
      // Counts OTHER active jobs for the tenant. The store holds only this job.
      return state.otherActiveJobs.get(tenantId) ?? 0;
    },

    async updateJobIfState(command) {
      if (state.job.id !== command.jobId) return 0;
      if (state.job.state !== command.expectedState) return 0;
      state.updates.push(command);
      state.journal.push(`persist:${command.expectedState}->${command.patch.state}`);
      state.job = {
        ...state.job,
        ...command.patch,
        provider_resource_reference:
          command.patch.provider_resource_reference ??
          state.job.provider_resource_reference,
        updated_at: command.patch.last_transition_at,
      };
      return 1;
    },

    async claimStepIfUnclaimed(command) {
      const existing = state.steps.find(
        (s) => s.job_id === command.jobId && s.step_key === command.stepKey,
      );
      if (existing && existing.status !== "pending" && existing.status !== "failed") {
        return false;
      }
      state.claims.push(command);
      state.journal.push(`claim:${command.stepKey}`);
      const claimed = makeStepRow(
        command.stepKey as keyof typeof PROVISIONING_STEP_SEQUENCE,
        {
          job_id: command.jobId,
          sequence: command.sequence,
          status: "running",
          attempt_count: command.attempt,
          correlation_id: command.correlationId,
          started_at: command.at,
        },
      );
      state.steps = [
        ...state.steps.filter(
          (s) => !(s.job_id === command.jobId && s.step_key === command.stepKey),
        ),
        claimed,
      ];
      return true;
    },

    async writeStepOutcome(command: StepOutcomeCommand) {
      state.outcomes.push(command);
      state.journal.push(`step:${command.stepKey}:${command.status}`);
      const written = makeStepRow(
        command.stepKey as keyof typeof PROVISIONING_STEP_SEQUENCE,
        {
          job_id: command.jobId,
          sequence: command.sequence,
          status: command.status,
          attempt_count: command.attempt,
          correlation_id: command.correlationId,
          completed_at: command.at,
          duration_ms: command.durationMs,
          error: command.error,
        },
      );
      state.steps = [
        ...state.steps.filter(
          (s) => !(s.job_id === command.jobId && s.step_key === command.stepKey),
        ),
        written,
      ];
    },
  };
}

export function createFakeProvider(
  overrides: Partial<ProvisioningProvider> = {},
): ProvisioningProvider {
  return {
    capabilities: {
      key: "fake",
      supportsMigrations: true,
      supportsSeeding: true,
      supportsDestroy: true,
      supportsHealthCheck: true,
      regions: ["eu-west-1"],
    },
    createProject: vi.fn(async () => ({
      resources: [
        {
          kind: "project",
          reference: "proj_fake_1",
          step_key: "create_project" as const,
        },
      ],
      reference: "proj_fake_1",
    })),
    applyMigrations: vi.fn(async () => []),
    seedDatabase: vi.fn(async () => {}),
    createAdministrator: vi.fn(async () => ({ userId: "user_fake_1" })),
    verifyHealth: vi.fn(async () => ({ healthy: true, checked_at: NOW, checks: [] })),
    destroyProject: vi.fn(async () => {}),
    ...overrides,
  };
}

export function createDeterministicClock(): Clock {
  let tick = 0;
  return {
    now: () => NOW,
    monotonicMs: () => (tick += 5),
  };
}

export interface RecordedLog {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  fields: OrchestratorLogFields;
}

export function createRecordingLogger(sink: RecordedLog[]): OrchestratorLogger {
  const record =
    (level: RecordedLog["level"]) => (message: string, fields: OrchestratorLogFields) => {
      sink.push({ level, message, fields });
    };
  return {
    debug: record("debug"),
    info: record("info"),
    warn: record("warn"),
    error: record("error"),
  };
}

export interface IntegrationHarness {
  store: MemoryStore;
  provider: ProvisioningProvider;
  service: ProvisioningService;
  events: ProvisioningEventEnvelope[];
  logs: RecordedLog[];
  journal: string[];
}

export function createIntegrationHarness(options: {
  job?: Partial<ProvisioningJobRow>;
  steps?: ProvisioningStepRow[];
  provider?: Partial<ProvisioningProvider>;
  failEvents?: boolean;
  overrides?: Partial<ProvisioningServiceInput>;
} = {}): IntegrationHarness {
  const journal: string[] = [];
  const store = createMemoryDataClient({
    job: options.job,
    steps: options.steps,
    journal,
  });
  const provider = createFakeProvider(options.provider);
  const events: ProvisioningEventEnvelope[] = [];
  const logs: RecordedLog[] = [];

  const created = createProvisioningService({
    dataClient: store,
    provider,
    jobId: JOB_ID,
    tenantId: TENANT_ID,
    correlationId: CORRELATION_ID,
    actorId: ACTOR_ID,
    clock: createDeterministicClock(),
    logger: createRecordingLogger(logs),
    jitterSource: () => 0.5,
    eventTransport: async (event) => {
      if (options.failEvents) {
        journal.push(`event-failed:${event.event}`);
        throw new Error("transport offline");
      }
      journal.push(`event:${event.event}`);
      events.push(event);
    },
    request: {
      slug: "acme-corp",
      region: "eu-west-1",
      credentials: { name: "platform/provider", scope: "platform" },
      adminEmail: "admin@acme.test",
      migrations: [],
    },
    ...options.overrides,
  });

  if (!created.ok) throw new Error(`harness service creation failed: ${created.error.code}`);

  return { store, provider, service: created.service, events, logs, journal };
}

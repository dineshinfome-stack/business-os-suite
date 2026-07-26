/**
 * Gate 3.2.1 test harness — in-memory ports and a mock provider.
 *
 * The provider is an interface mock only. No SDK, no HTTP, no infrastructure.
 */
import { vi } from "vitest";
import type { ProvisioningProvider } from "../../provider";
import type {
  ProvisioningJob,
  ProvisioningStep,
  ProvisioningStepKey,
} from "../../types";
import type { ProvisioningState } from "../../lifecycle";
import { PROVISIONING_STEP_SEQUENCE } from "../../constants";
import { createContext, type OrchestrationContext } from "../context";
import { nullLogger } from "../logger";
import type {
  Clock,
  EventSink,
  JobRepository,
  JobWriter,
  StepWriteInput,
  TransitionInput,
} from "../types";
import type { ProvisioningEventEnvelope } from "../../events";

export const JOB_ID = "11111111-1111-4111-8111-111111111111";
export const TENANT_ID = "22222222-2222-4222-8222-222222222222";
export const ACTOR_ID = "33333333-3333-4333-8333-333333333333";
export const CORRELATION_ID = "corr-gate-321";

export function makeJob(overrides: Partial<ProvisioningJob> = {}): ProvisioningJob {
  return {
    id: JOB_ID,
    tenant_id: TENANT_ID,
    state: "pending",
    current_step_key: null,
    attempt_count: 0,
    correlation_id: CORRELATION_ID,
    provider_key: "mock",
    provider_resource_reference: {},
    last_error: null,
    started_at: null,
    last_transition_at: "2026-07-26T00:00:00.000Z",
    completed_at: null,
    created_at: "2026-07-26T00:00:00.000Z",
    updated_at: "2026-07-26T00:00:00.000Z",
    created_by: ACTOR_ID,
    updated_by: ACTOR_ID,
    ...overrides,
  };
}

export function makeStep(
  step_key: ProvisioningStepKey,
  overrides: Partial<ProvisioningStep> = {},
): ProvisioningStep {
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

export interface Harness {
  job: ProvisioningJob;
  steps: ProvisioningStep[];
  events: ProvisioningEventEnvelope[];
  transitions: TransitionInput[];
  stepWrites: StepWriteInput[];
  claims: StepWriteInput[];
  repository: JobRepository;
  writer: JobWriter;
  sink: EventSink;
  clock: Clock;
  provider: ProvisioningProvider;
  context: OrchestrationContext;
  /** Set to make the event sink reject. */
  failEvents: boolean;
}

export function createHarness(options: {
  job?: Partial<ProvisioningJob>;
  steps?: ProvisioningStep[];
  provider?: Partial<ProvisioningProvider>;
} = {}): Harness {
  const state = {
    job: makeJob(options.job),
    steps: options.steps ? [...options.steps] : [],
    events: [] as ProvisioningEventEnvelope[],
    transitions: [] as TransitionInput[],
    stepWrites: [] as StepWriteInput[],
    claims: [] as StepWriteInput[],
    failEvents: false,
  };

  let tick = 0;
  const clock: Clock = {
    now: () => "2026-07-26T00:00:00.000Z",
    monotonicMs: () => (tick += 5),
  };

  const repository: JobRepository = {
    loadJob: async (id) => (id === state.job.id ? { ...state.job } : null),
    loadSteps: async () => state.steps.map((s) => ({ ...s })),
    countActiveJobs: async () => 0,
  };

  const writer: JobWriter = {
    transitionState: async (input) => {
      if (state.job.state !== input.expectedState) return false;
      state.transitions.push(input);
      state.job = {
        ...state.job,
        state: input.nextState as ProvisioningState,
        current_step_key: input.currentStepKey ?? state.job.current_step_key,
        attempt_count: input.attemptCount ?? state.job.attempt_count,
        last_error: input.error ?? null,
        provider_resource_reference: input.resources?.length
          ? {
              ...state.job.provider_resource_reference,
              project_reference:
                input.resources.find((r) => r.kind === "project")?.reference ??
                (state.job.provider_resource_reference.project_reference as string) ??
                null,
            }
          : state.job.provider_resource_reference,
      };
      return true;
    },
    claimStep: async (input) => {
      const existing = state.steps.find((s) => s.step_key === input.stepKey);
      if (existing && (existing.status === "running" || existing.status === "succeeded")) {
        return false;
      }
      state.claims.push(input);
      const next = makeStep(input.stepKey, {
        status: "running",
        attempt_count: input.attempt,
      });
      state.steps = [...state.steps.filter((s) => s.step_key !== input.stepKey), next];
      return true;
    },
    writeStep: async (input) => {
      state.stepWrites.push(input);
      const next = makeStep(input.stepKey, {
        status: input.status,
        attempt_count: input.attempt,
        duration_ms: input.durationMs ?? null,
        error: input.error ?? null,
      });
      state.steps = [...state.steps.filter((s) => s.step_key !== input.stepKey), next];
    },
  };

  const sink: EventSink = {
    emit: async (event) => {
      if (state.failEvents) throw new Error("sink offline");
      state.events.push(event);
    },
  };

  const provider: ProvisioningProvider = {
    capabilities: {
      key: "mock",
      supportsMigrations: true,
      supportsSeeding: true,
      supportsDestroy: true,
      supportsHealthCheck: true,
      regions: ["eu-west-1"],
    },
    createProject: vi.fn(async () => ({
      resources: [],
      reference: "proj_mock_1",
    })),
    applyMigrations: vi.fn(async () => []),
    seedDatabase: vi.fn(async () => {}),
    createAdministrator: vi.fn(async () => ({ userId: "user_1" })),
    verifyHealth: vi.fn(async () => ({
      healthy: true,
      checked_at: "2026-07-26T00:00:00.000Z",
      checks: [],
    })),
    destroyProject: vi.fn(async () => {}),
    ...options.provider,
  };

  const created = createContext({
    jobId: JOB_ID,
    tenantId: TENANT_ID,
    correlationId: CORRELATION_ID,
    actorId: ACTOR_ID,
    provider,
    repository,
    writer,
    events: sink,
    clock,
    logger: nullLogger,
    request: {
      slug: "acme-corp",
      region: "eu-west-1",
      credentials: { name: "platform/provider", scope: "platform" },
      adminEmail: "admin@acme.test",
      migrations: [],
    },
    jitterSource: () => 0.5,
  });

  if (!created.ok) throw new Error("harness context creation failed");

  return {
    get job() {
      return state.job;
    },
    get steps() {
      return state.steps;
    },
    get events() {
      return state.events;
    },
    get transitions() {
      return state.transitions;
    },
    get stepWrites() {
      return state.stepWrites;
    },
    get claims() {
      return state.claims;
    },
    set failEvents(v: boolean) {
      state.failEvents = v;
    },
    get failEvents() {
      return state.failEvents;
    },
    repository,
    writer,
    sink,
    clock,
    provider,
    context: created.context,
  };
}

export const VALID_TENANT = {
  id: TENANT_ID,
  slug: "acme-corp",
  code: "ACME",
  lifecycle_state: "active" as const,
};

# Phase 3 — Gate 3.2.2: Provisioning Orchestrator Integration

Integration layer only. No provider implementation, no UI, no server functions, no workers, no secrets. Gate 3.1 and 3.2.1 code is reused unmodified.

## What exists (verified)

- `src/lib/provisioning/orchestrator/types.ts` already defines every port needed: `JobRepository`, `JobWriter` (`transitionState`, `claimStep`, `writeStep`), `EventSink`, `Clock`, `OrchestratorLogger`.
- `context.ts` already performs full dependency injection (`createContext`) with retry/rollback policy defaults, `systemClock`, and correlation/actor validation.
- `orchestrator.ts` exposes `start / resume / executeNextStep / complete / fail / cancel / rollback`.
- `logger.ts` wraps `platformLogger`; `boundaries.test.ts` enforces purity.
- No `src/lib/provisioning/integration/` folder exists yet.

Conclusion: no new ports or orchestration logic are required — only concrete implementations plus assembly.

## New files

```
src/lib/provisioning/integration/
  data-client.ts        // narrow row-access interface + Supabase binding
  repository-adapter.ts // JobRepository over provisioning_jobs / provisioning_steps
  writer-adapter.ts     // JobWriter with expected-state optimistic concurrency
  event-sink.ts         // EventSink: ordered dispatch + structured logging
  factory.ts            // assembles adapters + orchestrator (no globals)
  service.ts            // ProvisioningService application service
  index.ts
  __tests__/
    harness.ts          // in-memory data client, fake provider, deterministic clock
    repository-adapter.test.ts
    writer-adapter.test.ts
    event-sink.test.ts
    service.test.ts
    concurrency.test.ts
    correlation.test.ts
```

## Design

**Data client seam.** Adapters talk to a small `ProvisioningDataClient` interface (select job, select steps, count active jobs, conditional update job, upsert/claim step, insert step outcome). One binding implements it with the existing Supabase client; the integration tests supply an in-memory implementation. This keeps adapters real (not mocks) while satisfying "no real infrastructure" in tests, and keeps Supabase out of the orchestrator's import graph.

**Repository adapter** — loads job and steps, maps rows to `ProvisioningJob` / `ProvisioningStep`, validates tenant ownership and correlation ID, returns typed objects or `null`. No lifecycle, retry, or rollback decisions.

**Writer adapter** — conditional updates keyed on `expectedState` (returns `false` when zero rows match → orchestrator raises `concurrency_conflict`); `claimStep` claims only when the step is unclaimed/pending (loser returns `false`, so the provider is never invoked twice); `writeStep` persists terminal status, attempt count, timestamps, duration, error record, and rollback records. Hard invariant (Risk D1): the adapter never touches `tenants.provisioning_status` — enforced by an assertion in the integration boundary test.

**Event sink** — emits envelopes sequentially (ordering preserved), logs each with `correlationId` / `tenantId` / `jobId`, and swallows failures into a returned warning path so a failed event never rolls back committed persistence. Persistence always commits before events (already the orchestrator's ordering; the integration tests assert it).

**Factory** — `createProvisioningService({ dataClient, provider, request, jobId, tenantId, correlationId, actorId, clock?, logger?, retryPolicy?, rollbackPolicy? })` builds repository → writer → event sink → context → orchestrator. Everything injected; no module-level singletons, no env reads.

**Application service** — thin pass-through owning startup and correlation propagation: `startProvisioning()`, `resumeProvisioning()`, `executeNextStep()`, `cancelProvisioning(reason)`, `rollbackProvisioning()`. Returns the existing `OrchestratorResult` envelope unchanged.

## Tests

Integration suite covers: service construction and DI wiring; repository load/ownership/correlation validation; writer transitions, attempt increments, timestamps; optimistic concurrency winner/loser; no duplicate provider invocation under concurrent `executeNextStep`; persistence-before-events ordering; event failure yields a warning with persistence intact; cancellation; rollback coordination; correlation ID present on every log, event, and write; and an integration boundary test asserting no `tenants.provisioning_status` write and no Supabase import from the orchestrator directory.

## Verification

`tsgo` typecheck, production build, full Vitest suite (existing 209 must stay green), boundary guard, new integration tests. Deliverable is a concise completion summary only — no extra engineering reports. Stop at Gate 3.3.

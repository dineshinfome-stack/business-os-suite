# Phase 3 — Gate 3.2.1: Provisioning Orchestrator Core (v2)

Implementation sprint. New code confined to `src/lib/provisioning/orchestrator/`. No provider implementation, no Supabase, no server functions, no UI, no workers.

## Design anchors (verified against Gate 3.1)

- Lifecycle: 13 states; happy path `pending → validating → queued → provisioning_infrastructure → running_migrations → seeding → creating_admin → verifying → completed`.
- Step keys: `validate, create_project, apply_migrations, seed_database, create_administrator, verify_health`.
- The orchestrator needs a **state ↔ step map** (e.g. `provisioning_infrastructure ↔ create_project`). This is coordination metadata, not new lifecycle rules; it lives in `orchestrator/step-map.ts`.
- All persistence sits behind injected ports — the orchestrator never imports a DB client.
- No raw `throw`. Every failure is a `ProvisioningError` union member inside a typed result.

## Files to create — `src/lib/provisioning/orchestrator/`

| File | Responsibility |
| --- | --- |
| `types.ts` | Ports (`JobRepository`, `JobWriter`, `EventSink`, `Clock`, `Logger`) and the two-layer result model (below) |
| `context.ts` | `OrchestrationContext` — deeply `Readonly<…>` typed **and** `Object.freeze`d at runtime; carries job, correlationId, actorId, provider, ports, retry/rollback policy, clock, logger. `createContext()` rejects a missing correlationId |
| `step-map.ts` | Bidirectional state ↔ step map: `stepForState`, `stateForStep`, `nextStepKey` (ordering delegated to `PROVISIONING_STEP_SEQUENCE`) |
| `job-loader.ts` | Loads job + steps via `JobRepository`; validates presence, shape, and correlation-id consistency. No SQL |
| `job-persistence.ts` | State transitions, step upserts, attempt counts, error records, timestamps via `JobWriter`. Guards: never targets `tenants.provisioning_status`; every transition passes `validateStateTransition` and uses expected-state optimistic concurrency |
| `event-dispatcher.ts` | Wraps `events.ts` builders; emits only after persistence commits, in sequence order. No payload redesign |
| `step-runner.ts` | Maps one step key to exactly one `ProvisioningProvider` method; returns `ExecutionResult` |
| `executor.ts` | Exactly one step per invocation. No loops, no recursion |
| `orchestrator.ts` | Public API: `start`, `resume`, `executeNextStep`, `complete`, `fail`, `cancel`, `rollback`. Coordination only |
| `index.ts` | Barrel; provider types re-exported as `type` only |

`src/lib/provisioning/index.ts` gains one re-export line — the only existing file touched.

## Two-layer result model (Recommendation 2)

Execution and decision are separate concerns:

```text
ExecutionResult          OrchestratorDecision        Persistence
  success            →     continue              →   transition + step write
  failure            →     retry | rollback | fail
  providerError      →     (classified by retry.ts)
                           complete | cancel
```

- `ExecutionResult` — what the step did: `{ outcome: "success" | "failure", stepKey, attempt, durationMs, resources?, error? }`.
- `OrchestratorDecision` — what happens next: `{ action: "continue" | "retry" | "rollback" | "complete" | "fail" | "cancel", targetState, delayMs?, reason }`, derived by delegating to `shouldRetry` / `evaluateRollbackEligibility` / `nextState`.
- Persistence consumes the decision; it never re-derives it.

## Rollback coordination (Recommendation 1)

Gate 3.2.1 **coordinates only**:

```text
rollback() → buildRollbackPlan() → invoke ProvisioningProvider interface → persist result
```

No provider-specific deletion semantics, no assumptions about how a provider performs teardown, no ordering knowledge beyond the plan produced by `rollback.ts`. Provider behaviour lands in Gate 3.3; tests exercise a mock implementing the interface.

## Behavioural rules

- **Idempotency** — every public method inspects current state first: terminal → no-op success; step already `succeeded` → skip and advance; duplicate `start` on an active job → validation failure `active_job_exists`.
- **Retry** — orchestrator decides *when* to consult `shouldRetry(error, attemptCount)`; `retry.ts` decides *if*. On `retry`, persist `retrying` + attempt count and return `delayMs` in the decision. The orchestrator never sleeps or schedules.
- **Step-runner normalization** — thrown values, rejected promises, and non-`Error` values are all normalized into `providerError(...)` before reaching the orchestrator.
- **Event-sink failures are not orchestration failures** — persistence has already committed. A sink failure produces a typed warning on the result (`warnings: ProvisioningErrorRecord[]`); the orchestration outcome stays successful and the warning is logged at `warn`.
- **Correlation ID** — required in context; asserted on job, every step write, every provider input, every event, every log line.
- **Logging** — `platformLogger` only, structured. Every entry carries `correlationId`, `tenantId`, `jobId`, `currentStep`. No `console.log`.
- **Executor** — exactly one step per invocation. No batching, no loops, no recursion, so a future worker can drive it trivially.

## Tests — `src/lib/provisioning/orchestrator/__tests__/`

In-memory fake repository/writer/event-sink, mock `ProvisioningProvider` (interface only), fixed clock, deterministic jitter.

Files: `orchestrator.test.ts`, `executor.test.ts`, `step-runner.test.ts`, `idempotency.test.ts`, `events.test.ts`, `concurrency.test.ts`.

Coverage: job start · resume · execute-next-step · full happy-path progression · validation failure · provider failure · retry decision · rollback decision (plan + interface invocation only) · idempotent resume · duplicate invocation · correlation-ID propagation · event ordering · event-sink failure yields warning not failure · assertion that no write path targets `tenants.provisioning_status` · **concurrency: two `executeNextStep()` calls against the same expected state — one commits, the other returns an optimistic-concurrency failure and performs no provider call**.

## Verification

`tsgo` typecheck, production build, full Vitest run. The existing 127 tests must remain green.

## Deliverable

A concise completion summary in chat: files created, files modified, tests added, known limitations, next gate. Then stop — no Gate 3.2.2, no provider, no dashboard.

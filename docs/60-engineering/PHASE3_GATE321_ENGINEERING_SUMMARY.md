---
id: PHASE3-GATE321-SUMMARY
title: Phase 3 — Gate 3.2.1 Engineering Summary (Provisioning Orchestrator Core)
sprint: SPR-MOD-001-003
status: Complete
date: 2026-07-26
adrs: [ADR-017, ADR-018, ADR-019]
---

# Phase 3 — Gate 3.2.1 · Provisioning Orchestrator Core

## 1. Objective

Implement the orchestration coordinate defined by ADR-019 on top of the Gate 3.1
domain foundation. Pure coordination only: no provider implementation, no
Supabase access, no server functions, no workers, no UI.

## 2. Delivered Artefacts

| File | Responsibility |
| --- | --- |
| `orchestrator/types.ts` | Ports (`JobRepository`, `JobWriter`, `EventSink`, `Clock`, `OrchestratorLogger`) and the two-layer result model |
| `orchestrator/step-map.ts` | Bidirectional lifecycle-state ↔ step-key mapping |
| `orchestrator/context.ts` | Frozen `OrchestrationContext`; mandatory correlation ID |
| `orchestrator/job-loader.ts` | Job/step load and coherence validation |
| `orchestrator/job-persistence.ts` | Expected-state transitions and step outcome writes |
| `orchestrator/event-dispatcher.ts` | Post-commit event emission; sink failures degrade to warnings |
| `orchestrator/step-runner.ts` | Step key → `ProvisioningProvider` method dispatch and error normalisation |
| `orchestrator/executor.ts` | Single-step pipeline: load → claim → run → persist → decide → transition → emit |
| `orchestrator/orchestrator.ts` | Public API: `start`, `resume`, `executeNextStep`, `complete`, `cancel`, `rollback` |
| `orchestrator/logger.ts` | Structured logger over the existing Platform Logger |
| `orchestrator/index.ts` | Module barrel, re-exported from `src/lib/provisioning/index.ts` |

## 3. Architectural Guarantees

- **Two-layer result model.** `ExecutionResult` records what happened;
  `OrchestratorDecision` records what to do next. The two are never conflated.
- **Ports and adapters.** Every side effect is injected. The core imports no
  SDK, no HTTP client and no Supabase module.
- **One step per invocation.** `executeNextStep` performs at most one provider
  call and never loops.
- **Optimistic concurrency.** Every transition supplies `expectedState`; a
  mismatch returns `concurrency_conflict` and performs no further writes.
- **Idempotency.** Succeeded steps are skipped, terminal jobs are no-ops, and
  `resume` re-enters the recorded step without re-running completed work.
- **Risk D1 honoured.** No write path references `tenants.provisioning_status`;
  it remains derived by the database trigger from Gate 3.1.
- **Advisory retry only.** The orchestrator returns a delay; it never sleeps,
  schedules or self-invokes.
- **Rollback is coordination.** The reverse-ordered plan is executed through the
  provider interface; no resource logic lives in the core.
- **Event ordering.** Events are emitted only after the state transition
  commits; a failing sink yields a warning, never an orchestration failure.

## 4. Verification

| Check | Result |
| --- | --- |
| Vitest (repository) | 172 tests / 23 files passing |
| Vitest (provisioning) | 83 tests / 12 files passing (56 new in Gate 3.2.1) |
| Typecheck | Clean |
| Build | Clean |
| Database changes | None |
| UI / route changes | None |

Test coverage spans the happy path, context validation, start guards,
concurrency conflicts, idempotency and resume, provider failure classification,
retry-budget exhaustion, rollback ordering and eligibility, event ordering and
sink degradation, and step-map round-tripping.

## 5. Out of Scope (deferred)

Provider implementations, persistence adapters, server functions, workers,
scheduling, and any operator UI. These belong to Gate 3.2.2 and beyond.

## 6. Status

**Gate 3.2.1 complete.** The orchestrator core is frozen pending authorisation
of the next gate.

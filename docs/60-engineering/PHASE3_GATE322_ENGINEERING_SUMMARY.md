# Phase 3 — Gate 3.2.2 Engineering Summary
**Sprint:** SPR-MOD-001-003 · **Gate:** 3.2.2 — Provisioning Orchestrator Integration
**Status:** COMPLETE · **Repository state:** `PHASE3_GATE322_FROZEN`

## 1. Objective

Connect the pure orchestrator core (Gate 3.2.1) to concrete persistence and
event adapters, keeping the provider mocked behind the `ProvisioningProvider`
interface. No new orchestration logic was introduced.

## 2. Delivered Components

| Layer | Module | Responsibility |
| --- | --- | --- |
| Seam | `integration/data-client.ts` | Narrow row-access contract (no business logic) |
| Infrastructure | `integration/supabase-data-client.ts` | Sole Supabase binding |
| Repository | `integration/repository-adapter.ts` | Row → domain mapping, tenant ownership validation |
| Writer | `integration/writer-adapter.ts` | Expected-state conditional writes, step claims, outcomes |
| Events | `integration/event-sink.ts` | Serialized, ordered event dispatch with structured logging |
| Application | `integration/service.ts` | `ProvisioningService` — startup and correlation propagation |
| Composition | `integration/factory.ts` | Dependency injection root |

## 3. Acceptance Criteria

| Criterion | Result |
| --- | --- |
| Repository adapters implemented | PASS |
| Writer adapters implemented | PASS |
| Event sink implemented | PASS |
| Application service assembled | PASS |
| Dependency injection complete | PASS |
| End-to-end orchestration flow operational | PASS — `pending → completed` through real adapters |
| Optimistic concurrency validated | PASS — one winner, one conflict; provider invoked once |
| Correlation IDs preserved | PASS — logs, events, and every write |
| Event ordering validated | PASS — serialized emission under concurrent emits |
| No architectural boundary violations | PASS — `integration/__tests__/boundaries.test.ts` |
| Existing functionality unchanged | PASS — full suite green |

## 4. Invariants Enforced

- **Risk D1** — no integration module references `tenants.provisioning_status`
  or the `tenants` table; the column stays trigger-derived. Guarded by test.
- **Infrastructure containment** — only `supabase-data-client.ts` may import
  Supabase; all other modules are infrastructure-free. Guarded by test.
- **Port reuse** — adapters implement the Gate 3.2.1 ports rather than
  redefining `JobRepository` / `JobWriter`. Guarded by test.
- **No environment access** — no `process.env` / `import.meta.env` / server
  functions inside the domain. Guarded by test.
- **Core purity** — the orchestrator core imports nothing from `integration/`.

## 5. Notable Corrections During Integration

1. **Provider resource key convention.** Resource folding now writes
   `<kind>_reference` keys (e.g. `project_reference`) to match the step
   runner's read path, and merges into the existing reference map instead of
   replacing it. Without this, `apply_migrations` failed with
   `project_reference_missing`.
2. **`failed` is not terminal.** Completion timestamps are written only for
   `completed`, `rolled_back`, and `cancelled`, preserving retry/rollback paths.

## 6. Verification

- Provisioning suite: **190 tests passing** (20 files).
- Full repository suite: **279 tests passing** (31 files).
- Typecheck clean; build green.

## 7. Next Gate

Gate 3.2.3 — replace the mocked provider with the first concrete provider
adapter and wire the application service into the platform surface.

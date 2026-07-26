---
title: "Phase 3 — Gate 3.2.0 Provisioning Orchestrator Readiness Report"
summary: "Repository discovery, reuse matrix, dependency validation, risk register, testing strategy and authorization recommendation for implementation of the Provisioning Orchestrator (Gates 3.2.1–3.2.4)."
layer: "engineering"
owner: "Platform Engineering"
status: "published"
updated: "2026-07-26"
version: "1.0"
tags: ["phase-3", "gate-3.2.0", "provisioning", "orchestrator", "readiness", "discovery"]
document_type: "Engineering Report"
category: "Engineering / Readiness"
related_adrs: ["ADR-017", "ADR-018", "ADR-019"]
sprint: "SPR-MOD-001-003"
---

# Phase 3 — Gate 3.2.0 · Provisioning Orchestrator Readiness Report

**Gate type:** Repository discovery and engineering validation — documentation only.
**Runtime changes:** none. **Schema changes:** none. **Implementation:** none.

---

## 1. Executive Summary

| Dimension | Result |
| --- | --- |
| Repository health | PASS |
| Architecture compliance (ADR-017/018/019) | PASS |
| Gate 3.1 completeness | PASS |
| Domain purity (no implementation leaks) | PASS |
| Database readiness (`provisioning_jobs` / `provisioning_steps`) | PASS — no schema change required |
| Dependency integrity (cycles / forbidden imports / duplication) | PASS |
| Test baseline | 17 files · 127 tests · all passing |
| Blockers | None |
| **Recommendation** | **GO WITH OBSERVATIONS** (4 observations, §9) |

---

## 2. Architecture Verification

| ADR | File | Front-matter status | Index status |
| --- | --- | --- | --- |
| ADR-017 Dedicated Database per Tenant | `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md` | `accepted` | Accepted |
| ADR-018 Tenant Provisioning Architecture | `docs/11-adrs/architecture/ADR-018-tenant-provisioning-architecture.md` | `accepted` | Accepted |
| ADR-019 Provisioning Orchestrator Architecture | `docs/11-adrs/architecture/ADR-019-provisioning-orchestrator-architecture.md` | `accepted` | Accepted |

Confirmed in `docs/11-adrs/ADR_INDEX.md` lines 69–71. All three are Accepted, none superseded. Architecture is authoritative and is not revisited by this gate.

## 3. Prior Engineering Reports

| Report | Status |
| --- | --- |
| `docs/60-engineering/PHASE3_DISCOVERY_REPORT.md` | Present — Gate 3.0 discovery, Risk D1 raised |
| `docs/60-engineering/PHASE3_IMPLEMENTATION_PLAN.md` | Present — gate sequencing for Phase 3 |
| `docs/60-engineering/PHASE3_GATE31_ENGINEERING_SUMMARY.md` | Present — Gate 3.1 closed and frozen |
| `docs/60-engineering/PHASE3_ADR018_ACCEPTANCE_SUMMARY.md` | Present |
| `docs/60-engineering/PHASE3_ADR019_ACCEPTANCE_SUMMARY.md` | Present |
| `docs/60-engineering/ADR019_AUTHORING_SUMMARY.md` | Present |

**Gate 3.1 is complete.** The domain foundation is frozen; Gate 3.2 consumes it without modification.

---

## 4. Provisioning Module Inspection — `src/lib/provisioning/`

| File | LOC | Role | Purity |
| --- | --- | --- | --- |
| `constants.ts` | 52 | Domain version, canonical step keys/sequence, timeouts, retry budget, backoff params | Pure values |
| `lifecycle.ts` | 146 | 13-state machine, transitions, terminality, happy path | Pure |
| `types.ts` | 150 | Job/step/resource/secret-reference/rollback interfaces | Types only |
| `errors.ts` | 117 | Discriminated `ProvisioningError` union + exhaustiveness guards | Pure |
| `retry.ts` | 101 | Exponential backoff with jitter, error classification | Pure |
| `rollback.ts` | 99 | Rollback eligibility, reverse-order plan generation | Pure |
| `validators.ts` | 149 | Tenant eligibility, slug/code, transition validation | Pure |
| `status.ts` | 60 | Canonical mapping job state → derived tenant `provisioning_status` (D1) | Pure |
| `events.ts` | 100 | `provisioning.*` envelope builders (v1) | Pure builders, no publisher |
| `provider.ts` | 72 | `ProvisioningProvider` + `ProviderCapabilities` interfaces | Interface only |
| `index.ts` | 25 | Barrel; re-exports all modules, provider exported as `type` only | Clean |

**Leak scan result — clean.** Every import inside the module is either intra-module (`./…`) or two pure imports from the tenants domain (`@/lib/tenants/slug`, `@/lib/tenants/lifecycle` — type only). There is:

- no provider SDK dependency,
- no `fetch` / HTTP client,
- no Supabase client import,
- no `createServerFn`, route, or React import,
- no `process.env` / `import.meta.env` read,
- no timer or I/O side effect at module scope.

`index.ts` exports the provider surface with `export type { … }`, so no runtime value from `provider.ts` can be pulled into a bundle. This is the correct dependency-inversion posture for Gate 3.2.

Tests: `src/lib/provisioning/__tests__/` — `lifecycle` (exhaustive 13×13 matrix), `status`, `retry`, `rollback`, `validators`, `domain`.

---

## 5. Database Review — no schema change required

### 5.1 Indexes

| Table | Index | Purpose |
| --- | --- | --- |
| `provisioning_jobs` | `provisioning_jobs_pkey` | PK |
| | `provisioning_jobs_tenant_id_idx` | Tenant lookup |
| | `provisioning_jobs_state_idx` | Queue / state scans |
| | `provisioning_jobs_correlation_id_idx` | Trace correlation |
| | `provisioning_jobs_one_active_per_tenant_idx` | **Partial UNIQUE on `tenant_id` WHERE `state NOT IN (completed, failed, rolled_back, cancelled)`** — DB-enforced single active job |
| `provisioning_steps` | `provisioning_steps_pkey` | PK |
| | `provisioning_steps_job_id_step_key_key` | **UNIQUE (job_id, step_key)** — idempotency anchor for step upserts |
| | `provisioning_steps_job_id_idx` | Step fetch by job |
| | `provisioning_steps_status_idx` | Status scans |
| | `provisioning_steps_correlation_id_idx` | Trace correlation |

### 5.2 Triggers

| Table | Trigger | Function |
| --- | --- | --- |
| `provisioning_jobs` | `trg_provisioning_jobs_sync_tenant_status` | `private.fn_sync_tenant_provisioning_status` — **derives `tenants.provisioning_status` (Risk D1 closed)** |
| `provisioning_jobs` | `trg_provisioning_jobs_updated_at` | `private.fn_set_updated_at` |
| `provisioning_steps` | `trg_provisioning_steps_duration` | `private.fn_provisioning_step_duration` — auto step timing |
| `provisioning_steps` | `trg_provisioning_steps_updated_at` | `private.fn_set_updated_at` |
| `tenants` | `trg_tenants_immutable` | `private.fn_tenants_guard_immutable` |

### 5.3 RLS

Both tables have RLS enabled with three policies each (SELECT / INSERT / UPDATE) for role `authenticated`, gated on platform-admin role check. **No DELETE policy** — provisioning history is append/update only, which is the intended audit posture.

**Conclusion:** the Gate 3.1 migration fully supports the orchestrator. Gate 3.2.1 must not alter this schema.

---

## 6. Reuse Matrix

| Asset | Path | Disposition | Notes |
| --- | --- | --- | --- |
| Provisioning lifecycle / retry / rollback / status / validators / events / errors / constants | `src/lib/provisioning/*` | **Reuse directly — frozen** | Gate 3.1 output. Orchestrator consumes; must not redefine. |
| Provider interface | `src/lib/provisioning/provider.ts` | **Reuse directly — frozen** | Orchestrator depends on the interface only. |
| Tenant lifecycle | `src/lib/tenants/lifecycle.ts` | **Reuse directly, read-only** | Already consumed by `validators.ts` for eligibility. |
| Tenant slug validation | `src/lib/tenants/slug.ts` | **Reuse directly, read-only** | Already consumed by `validators.ts`. |
| Tenant events | `src/lib/tenants/events.ts` | **Reuse pattern, not code** | ADR-051 envelope shape mirrored by `provisioning/events.ts`. Do not extend tenant events with provisioning names. |
| Tenant audit writer | `src/lib/tenants/audit.ts` | **Adapter required** | Server fn with `requireSupabaseAuth`, hard-coded `TENANT_ACTIONS` enum. Gate 3.2.2 needs a sibling provisioning audit writer — do **not** widen the tenant enum. |
| Tenant registry / server fns | `src/lib/tenants/registry.ts`, `tenants.functions.ts` | **Read-only reference** | Persistence + Zod validation patterns to mirror in the orchestrator persistence port. |
| Platform logger | `src/lib/platform/logger.ts` | **Reuse directly** | Tagged wrapper over `@/lib/logger`; suitable for correlation-ID-tagged orchestrator logging. |
| Platform config / constants / metadata / types | `src/lib/platform/*` | **Reuse directly, read-only** | Provider/region configuration surface. |
| Navigation registry | `src/lib/navigation/*` | **Must NOT modify** | No orchestrator navigation entries in Gate 3.2 (no dashboard, no routes). |
| Tenant registry UI + widget | `src/routes/_authenticated/platform/tenants/`, `src/dashboard/template/widgets/TenantRegistryWidget.tsx` | **Must NOT modify** | Presentation is out of scope until a later gate. |
| Supabase generated types | `src/integrations/supabase/types.ts` | **Read-only, generated** | Already contains provisioning tables. Never hand-edit. |

### 6.1 Correction to the gate brief

The brief lists `src/lib/events/` as an inspection target. **That directory does not exist.** Event contracts are domain-local by design: `src/lib/tenants/events.ts` and `src/lib/provisioning/events.ts`. This is intentional per ADR-051 (shared envelope, per-domain builders) and requires no remediation.

---

## 7. Dependency Validation

```text
             ┌────────────────────────────────┐
             │  src/lib/provisioning (pure)   │
             │                                │
             │  constants ─┬─> types          │
             │  lifecycle ─┘     │            │
             │      │            v            │
             │      ├─> status   errors       │
             │      ├─> rollback ──> constants│
             │      ├─> retry ────> errors    │
             │      └─> validators ──> errors │
             │                │               │
             │                v               │
             │        provider.ts             │
             │      (INTERFACE ONLY)          │
             └────────────┬───────────────────┘
                          │  type-only
                          v
                 (no implementation)
              Gate 3.3 supplies a concrete provider

  external, read-only, type/pure:
     validators.ts ──> @/lib/tenants/slug (isValidSlug)
     validators.ts ──> @/lib/tenants/lifecycle (type only)
```

| Check | Result |
| --- | --- |
| Circular dependencies | None — the intra-module graph is a DAG rooted at `constants`/`lifecycle` |
| Forbidden imports (Supabase client, server fn, route, React, env, HTTP) | None found |
| Provider implementation reachable from domain | No — `index.ts` re-exports provider as `export type` only |
| Duplicate lifecycle | None — tenant lifecycle (4 states) and provisioning lifecycle (13 states) are distinct concerns, no overlap |
| Duplicate retry | None — single implementation in `provisioning/retry.ts` |
| Duplicate rollback | None — single implementation in `provisioning/rollback.ts` |
| Duplicate status mapping | None — single mapping in `provisioning/status.ts`, mirrored by the DB trigger (intentional dual enforcement, documented in Gate 3.1) |
| Duplicate validators | None — `provisioning/validators.ts` delegates slug validation rather than reimplementing it |
| Orphan modules | None — all 11 files are reachable from `index.ts` |

---

## 8. Orchestrator Design Validation (ADR-019 assumptions)

### 8.1 Confirmed assumptions

| ADR-019 assumption | Repository evidence |
| --- | --- |
| Domain lifecycle exists and is authoritative | `lifecycle.ts`, 13 states, exhaustive test matrix |
| Exactly one active job per tenant is DB-enforced | `provisioning_jobs_one_active_per_tenant_idx` (partial unique) |
| Step identity is stable and keyed, not index-based | `PROVISIONING_STEP_KEYS` + `UNIQUE (job_id, step_key)` |
| Tenant status is derived, never orchestrator-written | `trg_provisioning_jobs_sync_tenant_status` |
| Provider is inverted (interface only) | `provider.ts`, type-only export |
| Retry/backoff is a pure function the orchestrator calls | `retry.ts` |
| Rollback plan generation is pure and reverse-ordered | `rollback.ts` |
| Correlation IDs are first-class | `correlation_id` columns + indexes on both tables; present in every provider input type |
| One DB transaction per step; no transaction across provider calls | Schema permits per-step commits; no long-lived locks required |

### 8.2 Orchestrator ownership boundary (confirmed)

**Owns:** job loading · pre-flight validation · step coordination and sequencing · state persistence · event emission · retry coordination · rollback coordination · completion/terminal transition.

**Does NOT own:** provider implementation · infrastructure · secrets material · dashboard · routes · server functions · workers · queues · cron · realtime.

---

## 9. Risk Register

| ID | Severity | Risk | Mitigation |
| --- | --- | --- | --- |
| R1 | **Critical** | Orchestrator writes `tenants.provisioning_status` directly, fighting the D1 trigger and producing divergent state. | Persistence port must exclude that column entirely. Add a Gate 3.2.2 test asserting no orchestrator write path targets `tenants.provisioning_status`. |
| R2 | **Critical** | A transaction held open across a provider call causes lock contention and orphaned infrastructure on crash. | ADR-019 rule: commit step intent → call provider outside the transaction → commit result. Enforce by keeping provider invocation out of any persistence helper. |
| R3 | **High** | Duplicate execution — two runners pick up the same job, double-creating infrastructure. | Rely on the partial unique index for job admission plus an optimistic-concurrency guard (`UPDATE … WHERE state = <expected>` returning row count) on every state transition. Test explicitly. |
| R4 | **High** | Non-idempotent step replay after a crash between provider success and persistence. | `UNIQUE (job_id, step_key)` upsert semantics + provider results recorded before advancing state; steps must be written to tolerate re-entry (check-then-act against recorded `provider_reference`). |
| R5 | **High** | Rollback leaves orphaned provider resources when the job fails after partial creation. | Use `rollback.ts` reverse-order plan; record every created resource on the step row before the next step begins; classify unrecoverable orphans and surface them rather than silently completing. |
| R6 | **Medium** | Correlation ID lost across step and event boundaries, breaking traceability. | Correlation ID is a required field on job, step, every provider input, and every event envelope. Add a test asserting propagation end-to-end. |
| R7 | **Medium** | Event ordering not monotonic, so consumers see completion before step events. | Emit only after the state-transition commit succeeds, in step-sequence order; include job state and step sequence in the envelope. |
| R8 | **Medium** | A provisioning audit action set is added to `src/lib/tenants/audit.ts`, coupling two domains. | Gate 3.2.2 creates a separate provisioning audit writer; the tenant `TENANT_ACTIONS` enum is frozen. |
| R9 | **Medium** | Orchestrator accidentally imports a Supabase client at module scope, dragging server-only code into the client bundle. | Persistence stays behind an injected port interface; the orchestrator core imports no client. Enforce with an import-guard test. |
| R10 | **Low** | Step timeouts in `constants.ts` are advisory and may never be enforced. | Gate 3.2.1 wires `PROVISIONING_STEP_TIMEOUT_MS` into step coordination and records timeout as a classified retryable error. |
| R11 | **Low** | No DELETE policy on provisioning tables blocks test cleanup in future integration tests. | Intentional. Integration tests use `service_role` fixtures, not user-context deletes. |

---

## 10. Implementation Checklist (Gates 3.2.1 – 3.2.4)

### Gate 3.2.1 — Orchestrator Core
- [ ] `orchestrator.ts` — pure coordinator; dependencies injected (persistence port, provider, clock, logger, event sink)
- [ ] `ports.ts` — `ProvisioningPersistencePort`, `EventSink`, `Clock` interfaces (no implementations)
- [ ] Job admission + pre-flight validation via existing `validators.ts`
- [ ] Step sequencing via `PROVISIONING_STEP_KEYS` / `PROVISIONING_STEP_SEQUENCE`
- [ ] Timeout enforcement using `PROVISIONING_STEP_TIMEOUT_MS`
- [ ] No new lifecycle, retry, rollback, or status logic

### Gate 3.2.2 — Persistence & Event Coordination
- [ ] Persistence adapter implementing the port (server-only module)
- [ ] Optimistic concurrency on every transition
- [ ] Step upsert on `(job_id, step_key)`
- [ ] Provisioning audit writer (separate from tenant audit)
- [ ] Event emission after commit, ordered
- [ ] Zero writes to `tenants.provisioning_status`

### Gate 3.2.3 — Retry & Rollback Coordination
- [ ] Retry loop driven by `retry.ts` classification + backoff
- [ ] Attempt/budget persistence on the step row
- [ ] Rollback driver executing the `rollback.ts` plan in reverse order
- [ ] Orphan classification and terminal `rolled_back` transition

### Gate 3.2.4 — Testing, Audit & Certification
- [ ] Full test suite green (see §11)
- [ ] Import-guard and dependency-cycle checks
- [ ] Engineering summary + certification report
- [ ] Repository freeze for Gate 3.2

---

## 11. Testing Checklist (required for Gate 3.2)

| # | Scenario | Assertion |
| --- | --- | --- |
| 1 | Happy path | All 6 steps run in sequence; job reaches `completed`; each step `succeeded` |
| 2 | Provider failure | Step marked failed with classified error; job does not advance |
| 3 | Retry | Retryable error retried up to `PROVISIONING_MAX_ATTEMPTS` with monotonic backoff; budget exhaustion is terminal |
| 4 | Rollback | Reverse-order plan executed; created resources destroyed; terminal `rolled_back` |
| 5 | Resume | Restart mid-job continues from the first non-succeeded step, never re-running succeeded steps |
| 6 | Idempotency | Re-executing a completed step produces no duplicate provider call and no duplicate step row |
| 7 | Correlation IDs | Same correlation ID on job, all steps, all provider inputs, all events |
| 8 | Event ordering | Events emitted post-commit, in step-sequence order, terminal event last |
| 9 | Concurrency | Second job admission for the same tenant is rejected while one is active |
| 10 | Duplicate execution prevention | Two concurrent runners on one job — exactly one transition wins, the other is a no-op |
| 11 | Derived status invariant | No orchestrator code path writes `tenants.provisioning_status` |
| 12 | Import guard | Orchestrator core imports no Supabase client, server function, route, or React module |

**Baseline (this gate):** 17 test files · 127 tests · 100 % passing. Gate 3.2 must not reduce this.

---

## 12. Definition of Done — Gate 3.2.0

| Criterion | Status |
| --- | --- |
| Repository discovery complete | ✓ |
| Reuse matrix complete | ✓ |
| Dependency validation complete | ✓ |
| Architecture validated against ADR-017/018/019 | ✓ |
| Risks documented with mitigations | ✓ (11 risks) |
| Testing strategy documented | ✓ (12 scenarios) |
| Readiness report published | ✓ (this document) |
| Repository otherwise unchanged | ✓ (docs-only, one new file) |

---

## 13. Observations

1. **O-1 — `src/lib/events/` does not exist.** Event builders are domain-local. Correct by design; the gate brief's path list should be updated for future gates.
2. **O-2 — Tenant audit writer is enum-bound.** `TENANT_ACTIONS` is a closed list; provisioning needs its own writer in Gate 3.2.2 rather than an extension.
3. **O-3 — Step timeouts are declared but unenforced.** `PROVISIONING_STEP_TIMEOUT_MS` is advisory until Gate 3.2.1 wires it in.
4. **O-4 — Dual status enforcement.** Status mapping exists both in `status.ts` and in the DB trigger. Intentional (defence in depth), but the two must be kept in lockstep; any change requires updating both plus `status.test.ts`.

None of these are blockers.

---

## 14. Authorization Recommendation

> **GO WITH OBSERVATIONS.**
>
> The repository is architecturally compliant, the Gate 3.1 domain foundation is pure and frozen, the database schema fully supports orchestration with no changes required, and no duplicate or orphan logic exists. Gate 3.2.1 (Orchestrator Core) may be authorized, subject to observations O-1 through O-4 and mitigation of risks R1–R5 within the implementing gates.

**Stop rule honoured:** no orchestrator, provider, execution engine, dashboard, route, server function, worker, or queue code was written. Awaiting authorization for Gate 3.2.1.

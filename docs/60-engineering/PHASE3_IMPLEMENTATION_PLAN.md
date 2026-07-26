---
title: "Phase 3 — Implementation Plan (Provisioning Engine)"
summary: "Gate-by-gate scope, Definition of Done, reuse matrix, stop rules, and risk register for the Provisioning Engine."
layer: "engineering"
owner: "Platform Engineering"
status: "final"
updated: "2026-07-26"
version: "1.0"
tags: ["phase-3", "provisioning", "plan", "gates", "gate-3.0"]
document_type: "Engineering Plan"
---

# Phase 3 — Provisioning Engine Implementation Plan

**Architectural contract:** `ADR-018 — Tenant Provisioning Architecture`
**Discovery basis:** `PHASE3_DISCOVERY_REPORT.md`
**Model:** the same gated workflow that certified Phase 2 (SPR-MOD-001-001).

---

## 1. Gate Sequence

| Gate | Name | Type | Authorization |
| --- | --- | --- | --- |
| 3.0 | Repository Discovery & Architecture Validation | Documentation | ✅ Complete |
| 3.1 | Provisioning Domain Foundation | Implementation | Required |
| 3.2 | Provisioning Orchestrator | Implementation | Required |
| 3.3 | Infrastructure Provider | Implementation | Required |
| 3.4 | Provisioning Dashboard | Implementation | Required |
| 3.5 | Verification & Certification | Audit | Required |

Each gate ends with an explicit **stop**. No gate may begin without written authorization naming that gate.

---

## 2. Gate Definitions

### Gate 3.1 — Provisioning Domain Foundation

**Goal:** model the provisioning lifecycle completely, with **zero** infrastructure calls.

Scope:
- `src/lib/provisioning/lifecycle.ts` — states and transitions per ADR-018 §2, mirroring the shape of `src/lib/tenants/lifecycle.ts` (R1).
- `src/lib/provisioning/types.ts` — provisioning job entity, step record, error shape, orphan record.
- `src/lib/provisioning/retry.ts` — bounded attempts, backoff schedule, retryable-vs-terminal classification per ADR-018 §3.
- `src/lib/provisioning/rollback.ts` — reverse-order destruction policy and orphan recording (policy only; no provider calls).
- `src/lib/provisioning/validators.ts` — pre-flight validation (tenant exists, tenant is in a provisionable state, no active job for the tenant, slug/name validity via `src/lib/tenants/slug.ts`).
- `src/lib/provisioning/events.ts` — `provisioning.*` envelope builders reusing the ADR-051 shape (R3).
- `src/lib/provisioning/provider.ts` — the `ProvisioningProvider` **interface only** (no implementation).
- Migration: provisioning job + step-log tables in the Platform database, with GRANTs, RLS scoped to platform administrators, and `updated_at` triggers per `DATABASE_STANDARD.md` (R12).
- Resolve risk **D1**: document and implement `tenants.provisioning_status` as *derived* from the job table, never independently written.
- Unit tests for the state machine, retry classification, and validators.

DoD: state machine has full test coverage of legal and illegal transitions; migration applied with GRANT + RLS; no vendor import anywhere; build, `tsgo --noEmit`, and full vitest suite green.

### Gate 3.2 — Provisioning Orchestrator

**Goal:** coordinate lifecycle advancement against the provider *interface*.

Scope: `startProvisioning`, `advanceProvisioning`, `getProvisioningJob`, `listProvisioningJobs`, `retryProvisioning`, `rollbackProvisioning`, `cancelProvisioning` as server functions under `src/lib/provisioning/provisioning.functions.ts`; every mutation gated by `requirePermission` (R4) over `requireSupabaseAuth` (R5); every transition audited (R2) and evented (R3); step-at-a-time advancement with persisted state to bound worker execution time (risk D5); redaction of error payloads before persistence (risk D3).

DoD: orchestrator tested against an in-memory fake provider; no vendor SDK import; all transitions audited; build/typecheck/tests green.

### Gate 3.3 — Infrastructure Provider

**Goal:** one concrete implementation behind the abstraction.

Scope: `SupabaseProvisioningProvider` implementing `createProject`, `applyMigrations`, `seedDatabase`, `createAdmin`, `verifyHealth`, `destroyProject`; every method idempotent (risk D4); credentials read from the secret store inside handlers only, per-tenant credentials written to the secret store and referenced by name (ADR-018 §5); tenant schema baseline applied with an in-tenant migration ledger (ADR-018 §6); backup policy verification before `completed` (ADR-018 §9).

DoD: provider is the **only** module importing the vendor management API; no credential value crosses the RPC boundary; secrets registered via the secrets tooling, never in source; build/typecheck/tests green.

### Gate 3.4 — Provisioning Dashboard

**Goal:** operator visibility and control, reusing the Phase 2 dashboard framework.

Scope: `ProvisioningQueueWidget` registered via `registerDashboardWidget` (R8) following `TenantRegistryWidget` (R9); a `/platform/provisioning` route under the existing platform shell (R11) registered in `NAV_REGISTRY` (R10); queue, active jobs, failed jobs, step progress, redacted logs, health indicators, orphaned-resource surface (risk D6); retry / rollback / cancel actions, permission-gated and confirmation-guarded.

DoD: widget permission-gated with loading and error states; colocated tests; no business logic in components; build/typecheck/tests green.

### Gate 3.5 — Verification & Certification

Scope: repository integrity audit, reuse audit against the matrix below, dependency-inversion audit (grep for vendor imports outside the provider module), security audit (secret handling, RLS, permission gating, payload redaction), build, `tsgo --noEmit`, full vitest suite, documentation completeness.

Outputs: `PHASE3_FINAL_CERTIFICATION.md`, `PHASE3_IMPLEMENTATION_AUDIT.md`, repository health summary, gate verification matrix, DoD checklist, Phase 4 readiness statement.

---

## 3. Reuse Matrix

| Ref | Asset | Reused in | Rule |
| --- | --- | --- | --- |
| R1 | `src/lib/tenants/lifecycle.ts` pattern | 3.1 | Mirror shape; no second pattern |
| R2 | `src/lib/tenants/audit.ts` | 3.1, 3.2 | Extend actions; no second writer |
| R3 | `src/lib/tenants/events.ts` | 3.1, 3.2 | Reuse envelope; add builders |
| R4 | `src/lib/authorization.server.ts` | 3.2, 3.4 | All mutations gated |
| R5 | `src/integrations/supabase/auth-middleware.ts` | 3.2, 3.3 | All server fns |
| R6 | `src/lib/platform/logger.ts` | 3.2, 3.3 | Step logging |
| R7 | `src/lib/platform/*` | all | Extend, don't fork |
| R8 | `src/dashboard/template/registry.ts` | 3.4 | Widget registration |
| R9 | `TenantRegistryWidget` pattern | 3.4 | Copy structure + test shape |
| R10 | `src/lib/navigation/registry.ts` | 3.4 | Single nav source |
| R11 | `src/routes/_authenticated/platform/` | 3.4 | Existing shell + gate |
| R12 | `DATABASE_STANDARD.md` conventions | 3.1 | GRANT, RLS, triggers |

---

## 4. Engineering Rules (carried forward)

1. **Repository-first** — inventory before writing.
2. **Reuse before build** — anything in the matrix above is mandatory reuse.
3. **Documentation-first** — ADR before implementation; ADR-018 must be `accepted` before Gate 3.1.
4. **Dependency inversion** — orchestration depends on the interface, never the vendor.
5. **No duplicate services** — one audit writer, one event envelope, one nav registry, one widget registry.
6. **No silent refactors** — Phase 2 assets are modified only with explicit justification recorded in the gate summary.
7. **No infrastructure secrets in source** — ever, in any form, including tests and fixtures.
8. **Explicit stop rule** — every gate ends and awaits authorization.

---

## 5. Risk Register

| # | Risk | Sev | Owning gate | Mitigation |
| --- | --- | --- | --- | --- |
| D1 | Duplicate provisioning-status source of truth | High | 3.1 | Derive registry column from job table |
| D2 | Vendor SDK leaking outside the provider | High | 3.3 / 3.5 | Interface-only dependency; import audit at 3.5 |
| D3 | Credential value reaching the browser | Critical | 3.2 / 3.3 | Handler-scoped reads; payload redaction; security audit |
| D4 | Non-idempotent step duplicating resources | High | 3.3 | Idempotency per step; recorded provider identifiers |
| D5 | Worker execution limit on long provisioning | Medium | 3.2 | Step-at-a-time advancement with persisted state |
| D6 | Orphaned resources after partial rollback | Medium | 3.2 / 3.4 | Orphan records + operator surface |
| D7 | Tenant lifecycle mutated by provisioning | Medium | 3.2 | Provisioning reports but never writes `lifecycle_state` |

---

## 6. Definition of Done — Phase 3

- [ ] ADR-018 accepted by the Architecture Board
- [ ] Gates 3.1–3.4 individually authorized, delivered, and summarized
- [ ] Provisioning state machine fully tested (legal + illegal transitions)
- [ ] Zero vendor imports outside the provider implementation module
- [ ] Zero credential values in source, tests, logs, events, audit rows, or client payloads
- [ ] All provisioning mutations permission-gated and audited
- [ ] Provisioning dashboard reuses the Phase 2 widget framework
- [ ] Build, typecheck, and full test suite green
- [ ] `PHASE3_FINAL_CERTIFICATION.md` and `PHASE3_IMPLEMENTATION_AUDIT.md` published
- [ ] Repository health: 0 Critical, 0 High

---

## 7. Stop Rule

Gate 3.0 is complete. **Do not begin Gate 3.1** until ADR-018 is moved to `accepted` and Gate 3.1 is explicitly authorized.

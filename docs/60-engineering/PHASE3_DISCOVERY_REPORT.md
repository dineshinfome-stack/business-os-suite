---
title: "Phase 3 — Discovery Report (Provisioning Engine)"
summary: "Repository discovery and architecture validation for the Provisioning Engine. Documentation-only gate; no code changes."
layer: "engineering"
owner: "Platform Engineering"
status: "final"
updated: "2026-07-26"
version: "1.0"
tags: ["phase-3", "provisioning", "discovery", "reuse", "gate-3.0"]
document_type: "Engineering Report"
---

# Phase 3 — Gate 3.0 Discovery Report

**Sprint:** SPR-MOD-001-002 (Provisioning Engine)
**Gate:** 3.0 of 3.5 — Repository Discovery & Architecture Validation
**Mode:** Documentation-only. **Zero** changes under `src/`, `supabase/migrations/`, or any runtime file.
**Architectural contract:** `ADR-018 — Tenant Provisioning Architecture` (Proposed, authored in this gate).

---

## 1. Finding: No Provisioning Implementation Exists

A repository-wide case-insensitive search for `provision` was executed across `src/` and `docs/`.

| Location | Matches | Nature |
| --- | --- | --- |
| `src/lib/tenants/tenants.functions.ts` | yes | `provisioning_status` **registry metadata column** only (Phase 2, Gate 2) |
| `src/lib/tenants/registry.ts` | yes | provisioning-status labels/filters for the registry list |
| `src/dashboard/template/widgets/TenantRegistryWidget.tsx` | yes | provisioning-status counts in registry stats |
| `src/routes/_authenticated/platform/tenants/index.tsx` | yes | provisioning-status filter control |
| `src/routes/_authenticated/platform/companies/index.tsx` | yes | status label reuse |
| `src/lib/platform/{index,constants,types}.ts` | yes | naming/labels only |
| `src/integrations/supabase/types.ts` | yes | generated column type |
| `docs/**` | yes | ADR-017, SPR-MOD-001-001, SPR-MOD-001-008 — specification text |

**Conclusion:** every existing match is either a Phase 2 *metadata field* or *documentation*. There is:

- no provisioning job entity,
- no provisioning state machine,
- no orchestrator,
- no provider abstraction,
- no vendor management-API call anywhere in the codebase,
- no `src/lib/provisioning/` directory.

Phase 3 is therefore greenfield implementation, not refactoring. **No duplicate-service risk was found**, and no silent refactor of Phase 2 assets is required.

> ⚠️ One naming collision to manage in Gate 3.1: the registry already exposes a column named `provisioning_status`. That column is *registry-facing summary metadata*, not the provisioning job state. Gate 3.1 must treat the job table as the source of truth and define explicitly how (and whether) the registry column is derived from it — it must not become a second, independently-written source of truth.

---

## 2. Tenant Lifecycle Code Inventory

| Asset | Path | Responsibility | Phase-3 relevance |
| --- | --- | --- | --- |
| Lifecycle state machine | `src/lib/tenants/lifecycle.ts` | Pure `created/active/suspended/archived` transitions, mirrors `private.fn_assert_lifecycle_transition` | **Pattern reference** for the provisioning state machine |
| Audit writer | `src/lib/tenants/audit.ts` | `logTenantEventFn` → `public.audit_logs` under caller JWT | **Extend**, do not duplicate |
| Event contracts | `src/lib/tenants/events.ts` | ADR-051 envelope builder for `tenant.*` events | **Extend** with `provisioning.*` |
| Registry service | `src/lib/tenants/registry.ts` | Labels, filters, status vocabulary | Read-only consumer |
| Tenant server functions | `src/lib/tenants/tenants.functions.ts` | CRUD, search, stats, lifecycle RPC calls | Integration point |
| Slug policy | `src/lib/tenants/slug.ts` | Tenant code/slug rules | Input to project naming |
| Tenant tests | `src/lib/tenants/__tests__/` | Registry + lifecycle coverage | Test pattern reference |

---

## 3. Reusable Platform Assets

Per the Reuse-Before-Build rule, the following are **mandatory reuse targets**. Building a parallel implementation of any of these in Phase 3 is a gate failure.

| # | Asset | Path | Reuse decision |
| --- | --- | --- | --- |
| R1 | Lifecycle state-machine pattern (pure module + DB assertion mirror) | `src/lib/tenants/lifecycle.ts` | **Mirror the pattern.** New `provisioning/lifecycle.ts` follows the identical shape: `const STATES`, `ALLOWED` map, `canTransition`, `assertTransition`. Do not invent a second pattern. |
| R2 | Audit writer | `src/lib/tenants/audit.ts` | **Reuse the mechanism** (server fn → `public.audit_logs` under caller JWT). Add provisioning actions to the action enum rather than creating a second audit table or writer. |
| R3 | Event envelope | `src/lib/tenants/events.ts` | **Reuse the envelope shape** (`event/version/emitted_at/tenant_id/actor_id/correlation_id/data`). Add a `provisioning.*` builder alongside the tenant one. |
| R4 | Permission middleware | `src/lib/authorization.server.ts` | **Reuse** `requirePermission` / `requireAllPermissions` for every provisioning mutation. No bespoke auth checks. |
| R5 | Supabase auth middleware | `src/integrations/supabase/auth-middleware.ts` | **Reuse** `requireSupabaseAuth` on all provisioning server functions. |
| R6 | Platform logger | `src/lib/platform/logger.ts` | **Reuse** for provisioning step logging. |
| R7 | Platform config/constants/types | `src/lib/platform/` | **Reuse**; extend rather than fork. |
| R8 | Dashboard widget framework | `src/dashboard/template/` (`registry.ts`, `types.ts`, `DashboardWidgets.tsx`) | **Reuse** `registerDashboardWidget` for the Gate 3.4 provisioning widget, exactly as `TenantRegistryWidget` does. |
| R9 | Widget reference implementation | `src/dashboard/template/widgets/TenantRegistryWidget.tsx` + its test | **Copy the pattern** (permission-gated entry, `useQuery` with `staleTime`, `.animate-pulse` loading state, colocated test). |
| R10 | Navigation registry | `src/lib/navigation/registry.ts` | **Reuse** for the `/platform/provisioning` entry; do not add a parallel nav source. |
| R11 | Route shell + auth gate | `src/routes/_authenticated/platform/` | **Reuse**; provisioning routes nest here. |
| R12 | Server-fn + migration conventions | `docs/15-governance/DATABASE_STANDARD.md`, existing `supabase/migrations/` | **Reuse** naming, GRANT, RLS, and `updated_at` trigger conventions. |

**Assets deliberately NOT reused:** none identified as unsuitable. No Phase 3 component requires a new cross-cutting service.

---

## 4. Provisioning Boundary Definition

### In scope for Phase 3

- Provisioning job domain model, state machine, retry policy, rollback policy, validators (Gate 3.1)
- Provisioning job persistence in the **Platform database** (Gate 3.1)
- Orchestration of the lifecycle against a provider **interface** (Gate 3.2)
- `ProvisioningProvider` abstraction + one Supabase implementation (Gate 3.3)
- Platform-facing dashboard, queue, and operator controls (Gate 3.4)
- Audit and event emission for every transition (Gates 3.1–3.2)

### Explicitly out of scope for Phase 3

- Tenant-database **business schema** authoring (that is the tenant schema baseline, owned separately)
- Per-request tenant connection routing at application runtime (ADR-017 defers this to a later sprint)
- Backup topology implementation and restore drills (Operations)
- Billing, licensing, or entitlement enforcement (Platform DB, separate capability)
- Any change to the Phase 2 tenant lifecycle state machine
- Cross-tenant reporting

### Boundary invariants

1. Provisioning writes **only** to the Platform database; it never writes tenant business data itself — it instructs the provider to create it.
2. Provisioning code never imports a vendor SDK outside the provider implementation module (ADR-018 §11).
3. Provisioning never reads or returns a credential value (ADR-018 §5).
4. Tenant lifecycle transitions remain owned by the registry; provisioning may report, but never mutate, `lifecycle_state`.

---

## 5. Architecture Validation Against ADR-017

| ADR-017 invariant | Phase 3 compliance |
| --- | --- |
| 1 — one dedicated DB per tenant | Provisioning creates exactly one; job uniqueness per tenant enforced in Gate 3.1 |
| 4 — Tenant is the persistence boundary | Honoured; provisioning does not create shared business tables |
| 6 — Platform DB stores platform metadata only | Job records are provisioning metadata, not tenant business data — compliant |
| 7 — business data only in tenant DBs | Honoured; no business tables added to the Platform DB |

No conflict with ADR-017 was identified. ADR-018 extends it without amending it.

---

## 6. Repository Health at Gate 3.0 Entry

Carried forward from `PHASE2_FINAL_CERTIFICATION.md` (Phase 2 closed clean):

| Metric | Value |
| --- | --- |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 (documentation-tracked, non-blocking) |
| Build / typecheck / tests | PASS / PASS / 89 passing |
| Gate 3.0 code changes | **0** |

Because Gate 3.0 changed no runtime file, the Phase 2 verification results remain valid without re-execution. Gate 3.5 re-runs the full suite.

---

## 7. Risks Identified in Discovery

| # | Risk | Severity | Mitigation (gate) |
| --- | --- | --- | --- |
| D1 | `provisioning_status` registry column becomes a second source of truth | High | Define derivation rule explicitly (3.1) |
| D2 | Vendor SDK leaks into orchestration or UI | High | Interface-only dependency; audit at 3.5 |
| D3 | Credential value reaching the browser via loader/event/audit payload | Critical | Redaction rule in ADR-018 §5; security audit at 3.5 |
| D4 | Non-idempotent step duplicating provider resources on retry | High | Idempotency requirement per step (3.1/3.3) |
| D5 | Long-running provisioning exceeding worker execution limits | Medium | Step-at-a-time advancement with persisted state (3.2) |
| D6 | Orphaned provider resources after partial rollback | Medium | Orphan recording + operator surface (3.2/3.4) |

---

## 8. Gate 3.0 Verdict

**PASS.** Discovery complete, no pre-existing provisioning implementation, reuse inventory established, boundaries defined, ADR-018 authored as the architectural contract.

**Stop rule engaged.** Gate 3.1 (Provisioning Domain Foundation) requires explicit authorization, and requires ADR-018 to be moved from `proposed` to `accepted` first.

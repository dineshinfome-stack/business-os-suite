---
document: Sprint Completion Report
sprint_id: SPR-MOD-001-002
module_id: MOD-001
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Governance / Sprint Closure
lifecycle_state: Issued
report_date: 2026-07-24
---

# SPR-MOD-001-002 — Sprint Completion Report

> Companion to `docs/50-audit-reports/SPR_MOD_001_002_ACCEPTANCE_REVIEW.md`. Structure mirrors `SPR_MOD_001_001_TENANCY_FOUNDATION_REPORT.md`.

## 1. Executive Summary

- **Sprint objective (PRD §1.1):** Deliver the foundational organizational hierarchy required by every downstream business module — company, branch, and financial-year lifecycles under a tenant; the `Tenant → Company → Branch → Financial Year` hierarchy; default selection at each level; validation rules; audit integration; and the `company.*`, `branch.*`, `financialyear.*` event contracts.
- **Overall outcome:** All approved SIP tasks are Complete except SIP-014 (formally Deferred as an architecture dependency) and SIP-019 / SIP-020 (Deferred as repository capability gaps — authenticated integration-test harness and Playwright authentication/session infrastructure).
- **Acceptance status:** **Complete (Acceptance Pending).** Sprint acceptance recommended; awaiting Architecture Board confirmation.

## 2. Delivered Scope

### 2.1 Database (Phase 1)
- Migration A — extends `companies`, `branches`, `financial_years` with `lifecycle_state` + `is_default`; introduces `EXCLUDE USING gist` non-overlap for open financial years (depends on `btree_gist`, present since Sprint 0.2); back-fills existing singleton rows to `is_default=true` and `active`/`open`.
- RLS policies for `companies`, `branches`, `financial_years` scoped to caller tenant.
- Migration B — `private.fn_*` lifecycle RPCs for company (5), branch (4), financial year (5), plus the three lifecycle-transition assert helpers.
- Migration C — 17 permission keys under `platform.company.*`, `platform.branch.*`, `platform.financial_year.*`.

### 2.2 Backend (Phase 2)
- 12 backend modules across `src/lib/organizations/`, `src/lib/branches/`, `src/lib/financial-years/` (`lifecycle.ts`, `events.ts`, `audit.ts`, `<domain>.functions.ts`, plus `permissions.ts` bindings).
- 17 server functions delegating all mutations to `private.fn_*` RPCs. Read paths use RLS-scoped `SELECT` only.
- Audit writer parity (structural + behavioral) with `src/lib/tenants/audit.ts`.
- Event builders emit ADR-051 envelopes; canonical names match PRD §11 verbatim (`company.created`, `company.updated`, `company.archived`, `branch.created`, `branch.updated`, `financialyear.created`, `financialyear.opened`, `financialyear.closed`).
- Domain events mapped to PRD §11 as the single source of truth.

### 2.3 UI & RBAC (Phase 3)
- `src/routes/_authenticated/platform/tenants/$tenantId.tsx` — Companies tab added with `DataGrid`, lifecycle action dialogs, permission gating via `<Can>` + `canTransition`.
- `src/routes/_authenticated/platform/companies/$companyId.tsx` — new route hosting Branches and Financial Years tabs; create/edit/lifecycle dialogs; current company derived client-side from `listCompanies` (no `getCompany` server function this sprint).
- `src/lib/navigation/registry.ts` — Companies, Branches, Financial Years nodes registered; deep-linked to the tenant list per approved directive.
- Static discipline: zero direct RPC calls, zero raw permission strings, zero `console.*` statements in sprint scope.

### 2.4 Testing (Phase 4)
- 21 new unit tests added: `src/lib/organizations/__tests__/lifecycle.test.ts` (8), `src/lib/branches/__tests__/lifecycle.test.ts` (6), `src/lib/financial-years/__tests__/lifecycle.test.ts` (7).
- Coverage: every valid/invalid state transition and `assertTransition` behavior for each domain.
- Full suite: `bunx vitest run` — 49/49 green.
- Typecheck: `bunx tsgo --noEmit` — clean.

## 3. Deferred Items

| ID | Item | Classification | Disposition |
|---|---|---|---|
| SIP-014 | Config namespace initialization on company activation / branch creation via ENG-005 | Architecture Dependency | Governance-only proposal at `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md`. No implementation introduced. No sprint identifier reserved. |
| SIP-019 → CF-6 | Authenticated integration-test harness | **Repository Capability Gap** | Recorded; no remediation proposed in this phase. |
| SIP-020 → CF-7 | Playwright authentication / session infrastructure | **Repository Capability Gap** | Recorded; no remediation proposed in this phase. |
| CF-A (this sprint) | Live per-entity lifecycle exercise against live database | Runtime environment | Same environmental limitation as SPR-001 CF-2. |
| CF-B (this sprint) | Authenticated UI capture of Companies / Branches / Financial Years views | Runtime environment | Same environmental limitation as SPR-001 CF-2. |

Capability gaps CF-6 and CF-7 are **not implementation defects** and are not scored against this sprint's acceptance.

## 4. Validation Summary

| Phase | Validation | Result |
|---|---|---|
| Phase 1 — Database | Schema + RLS + RPC + permissions migrations applied; RPC surface enumerated | ✅ Accepted |
| Phase 2 — Backend | V1 (RPC discipline), V2 (permission constants), V3 (audit parity structural + behavioral), V4 (event names match PRD §11), V5 (change control) | ✅ Accepted — 10/10 Board rating on all five criteria (see `PHASE2_SPR-MOD-001-002_CLOSEOUT.md`) — SIP-014 formally Deferred |
| Phase 3 — UI & RBAC | Route wiring, permission gating, static hygiene (`tsgo` clean; 0 direct RPC / raw permission / `console.*` hits) | ✅ Accepted |
| Phase 4 — Testing | `bunx vitest run` 49/49 green (21 new); `tsgo --noEmit` clean | ✅ Accepted with capability gaps CF-6 / CF-7 formally recorded |

## 5. Architecture Compliance

- Approved architecture (PRD, SD, ADR-011 / ADR-012 / ADR-014 / ADR-051, EEMP Ch 15 / Ch 17) maintained.
- Repository patterns followed: `private.fn_*` for all mutations; `PERMISSIONS.*` constants for authorization; audit writer parity with `src/lib/tenants/audit.ts`; event contracts sourced from PRD §11 as the single source of truth.
- No unauthorized abstractions introduced.
- No architectural violations. No new governance templates.

## 6. Acceptance Decision

- **Implementation team assessment:** Sprint acceptance recommended.
- **Formal decision:** Awaiting Architecture Board confirmation.

## 7. Stop Condition

Governance updates issued; sprint prepared for acceptance. **Do not begin SPR-MOD-001-003 until the Acceptance Review is countersigned by the Architecture Board.**

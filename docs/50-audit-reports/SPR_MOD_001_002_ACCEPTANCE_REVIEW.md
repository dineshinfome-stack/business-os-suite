---
document: Sprint Acceptance Review
sprint_id: SPR-MOD-001-002
module_id: MOD-001
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Governance / Sprint Closure
lifecycle_state: Issued
review_date: 2026-07-24
review_template_version: 1.2
---

# SPR-MOD-001-002 — Sprint Acceptance Review

> Documentation + verification pass. No feature code, schema, RPC, UI, or test changes were made by this review. Structure and terminology reused verbatim from `SPR_MOD_001_001_ACCEPTANCE_REVIEW.md` (v1.2).

## Evidence Discipline

Evidence in this review is drawn from committed repository artifacts: migrations, server-function modules, generated permission constants, Vitest suites, the Phase 2 Closeout Report (`docs/04_Program_Status/reports/PHASE2_SPR-MOD-001-002_CLOSEOUT.md`), and the SIP execution record (`docs/05_Sprint_Implementation_Plans/active/SIP-SPR-MOD-001-002.md`). The distinction between **implementation evidence** (code/migrations present), **automated test evidence** (Vitest suites green), and **runtime verification** (queries against a live database and authenticated UI capture) is preserved. Runtime items not producible in this environment are recorded as gaps, not simulated.

---

## 1. Acceptance Criteria Evidence

Acceptance Criteria are restated from Sprint PRD §5.1–§5.6 (`docs/30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md`).

| AC | Requirement (summary) | Implementation evidence | Automated test evidence | Runtime evidence | Verdict |
|---|---|---|---|---|---|
| 5.1 | Company lifecycle (create → active → inactive → archived; default company; hierarchy under tenant) | Migration A (companies extension: `lifecycle_state`, `is_default`, back-fill); `private.fn_create_company`, `fn_activate_company`, `fn_deactivate_company`, `fn_archive_company`, `fn_set_default_company`; `src/lib/organizations/*.functions.ts` | `src/lib/organizations/__tests__/lifecycle.test.ts` (8 tests) | Authenticated UI reachable at `/platform/tenants` → tenant detail → Companies tab; end-to-end lifecycle capture is deferred (see §7) | ⚠️ PASS (implementation + tests), runtime UI deferred |
| 5.2 | Branch lifecycle (create → active → archived; default branch per company; hierarchy) | Migration A (branches extension); `private.fn_create_branch`, `fn_update_branch`, `fn_archive_branch`, `fn_set_default_branch`; `src/lib/branches/*.functions.ts` | `src/lib/branches/__tests__/lifecycle.test.ts` (6 tests) | Branches tab wired on `/platform/companies/$companyId`; authenticated capture deferred | ⚠️ PASS (implementation + tests), runtime UI deferred |
| 5.3 | Financial-year lifecycle (created → open → closed → archived; non-overlap; default FY) | Migration A (`financial_years` extension, `EXCLUDE USING gist` non-overlap constraint, `btree_gist` dependency); `private.fn_create_financial_year`, `fn_open_financial_year`, `fn_close_financial_year`, `fn_archive_financial_year`, `fn_set_default_financial_year`; `src/lib/financial-years/*.functions.ts` | `src/lib/financial-years/__tests__/lifecycle.test.ts` (7 tests) | Financial Years tab wired on `/platform/companies/$companyId`; authenticated capture deferred | ⚠️ PASS (implementation + tests), runtime UI deferred |
| 5.4 | Hierarchy + defaults enforced tenant-scoped; single default at each level | RLS policies on `companies`, `branches`, `financial_years`; unique partial index on `is_default` scoped by parent; RPCs enforce hierarchy | Lifecycle suites exercise default-toggle transitions | Two-session cross-tenant RLS smoke discharged for tenancy in SPR-001 CF-1 scope; per-entity cross-tenant deny smoke for company/branch/FY not exercised in Vitest this sprint | ⚠️ PASS (implementation), runtime smoke deferred (see §6) |
| 5.5 | Every lifecycle transition produces an ENG-004 audit record | `src/lib/{organizations,branches,financial-years}/audit.ts` mirrors `src/lib/tenants/audit.ts`; call-site trace across 17 handlers confirms `action`, `entity_type`, `entity_id`, `actor_id`, `created_by`, `updated_by`, `new_values.correlation_id` populated | V3 (Phase 2 Closeout) confirms structural + behavioral parity | Live audit-row inspection not exercised this review | ⚠️ PASS (implementation + V3), runtime deferred |
| 5.6 | `company.*`, `branch.*`, `financialyear.*` events per PRD §11 published on transitions | `src/lib/{organizations,branches,financial-years}/events.ts` build ADR-051 envelope; V4 in Phase 2 Closeout matched every emitted literal to the PRD §11 canonical name | Event builder covered indirectly through handler tests | External event-bus delivery is ENG-024 concern (carried forward from SPR-001 CF-5) | ⚠️ PASS (contract shape), external delivery out of sprint scope |

**Summary:** 6 verified by implementation + tests with runtime demonstration partially deferred (⚠️). No AC failing. No blockers surfaced.

---

## 2. Traceability Matrix — SIP-001 … SIP-023

Symbol-based references. Status values match the Phase 2 Closeout Report §1 and the Phase 3 / Phase 4 execution record captured in `SIP-SPR-MOD-001-002.md`.

| Task ID | Phase | Status | Reference |
|---|---|---|---|
| SIP-001 | 1 | Complete | Migration A — `companies` extension (`lifecycle_state`, `is_default`) |
| SIP-002 | 1 | Complete | Migration A — `branches` extension |
| SIP-003 | 1 | Complete | Migration A — `financial_years` extension + `EXCLUDE USING gist` non-overlap constraint |
| SIP-004 | 1 | Complete | Migration B — `private.fn_assert_company_lifecycle_transition`, `fn_assert_branch_lifecycle_transition`, `fn_assert_financial_year_lifecycle_transition` |
| SIP-005 | 1 | Complete | Migration B — `fn_create_company`, `fn_activate_company`, `fn_deactivate_company`, `fn_archive_company`, `fn_set_default_company` |
| SIP-006 | 1 | Complete | Migration B — branch RPCs |
| SIP-007 | 1 | Complete | Migration B — financial-year RPCs |
| SIP-008 | 1 | Complete | Migration A — RLS policies (`companies_*`, `branches_*`, `financial_years_*`) |
| SIP-009 | 1 | Complete | Migration C — 17 permission keys under `platform.company.*`, `platform.branch.*`, `platform.financial_year.*` |
| SIP-010 | 2 | Complete | `src/lib/organizations/{companies.functions.ts,lifecycle.ts,events.ts,audit.ts}` — SIP-010 accepted by Board (10/10) |
| SIP-011 | 2 | Complete | `src/lib/organizations/companies.functions.ts` — server functions accepted |
| SIP-012 | 2 | Complete | `src/lib/branches/*` — server functions accepted |
| SIP-013 | 2 | Complete | `src/lib/financial-years/*` — server functions accepted |
| SIP-014 | 2 | **Deferred (Architecture Dependency)** | See §6 Deferred; proposal at `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md`. No sprint id reserved. |
| SIP-015 | 3 | Complete | `src/routes/_authenticated/platform/tenants/$tenantId.tsx` — Companies tab, DataGrid, lifecycle dialogs |
| SIP-016 | 3 | Complete | `src/routes/_authenticated/platform/companies/$companyId.tsx` — Branches + Financial Years tabs; create/edit/lifecycle dialogs |
| SIP-017 | 3 | Complete | `src/lib/navigation/registry.ts` — Companies / Branches / Financial Years nodes deep-linked to tenant list |
| SIP-018 | 4 | Complete (unit) | `src/lib/{organizations,branches,financial-years}/__tests__/lifecycle.test.ts` — 21 new tests (8 + 6 + 7); full suite 49/49 |
| SIP-019 | 4 | **Deferred (Repository Capability Gap)** | Authenticated integration-test harness absent — see §6 |
| SIP-020 | 4 | **Deferred (Repository Capability Gap)** | Playwright authentication/session infrastructure absent — see §6 |
| SIP-021 | — | Complete | Sprint-local observation recorded (no fabricated evidence) |
| SIP-022 | — | Complete | Static hygiene sweep: 0 direct RPC calls, 0 raw permission strings, 0 `console.*` in sprint scope |
| SIP-023 | — | Complete | This Acceptance Review + Sprint Completion Report |

Closure: **20 Complete**, **1 Deferred (architecture dependency, no id reserved)**, **2 Deferred (repository capability gaps)**.

---

## 3. Quality Gate

| Gate | Command / Source | Result |
|---|---|---|
| TypeScript | `bunx tsgo --noEmit` | ✅ exit 0 (Phase 3 + Phase 4 validation) |
| Test suite | `bunx vitest run` | ✅ 49/49 passing (21 new this sprint) |
| Security lint | `supabase--linter` | ⚠️ 1 WARN — R-074 Leaked Password Protection (Accepted Risk, unchanged) |
| Static review | `rg 'TODO\|FIXME\|console\.log' src/lib/{organizations,branches,financial-years} src/routes/_authenticated/platform/{companies,tenants}` | ✅ 0 hits |
| RPC discipline (V1) | `rg` for direct `.from(...).update|insert|delete|upsert` in the three domains | ✅ 0 hits — all mutations via `private.fn_*` |
| Permission discipline (V2) | `rg` for raw `"platform.company."` / `"platform.branch."` / `"platform.financial_year."` string literals | ✅ 0 hits — all handlers use `PERMISSIONS.*` constants |
| Audit parity (V3) | Structural + behavioral parity with `src/lib/tenants/audit.ts` | ✅ Confirmed in Phase 2 Closeout §V3 |
| Event contract (V4) | Every emitted literal matches PRD §11 canonical name | ✅ Confirmed in Phase 2 Closeout §V4 |
| Change control (V5) | Zero out-of-scope diffs beyond declared SIP tasks | ✅ Confirmed in Phase 2 Closeout §V5 |
| Live lifecycle exercise (per-entity) | Invoke `activateCompany`, `openFinancialYear`, etc. against live DB with audit-row inspection | ⚠️ Not executed (deferred — CF-A) |
| Authenticated UI evidence | Authenticated capture of tenant detail Companies tab and company detail Branches/FY tabs | ⚠️ Not executed (deferred — CF-B) |

**Gate decision:** Pass with two documented runtime deferrals; both are inherited from the same environmental limitation acknowledged in SPR-MOD-001-001.

---

## 4. Documentation Status

| Artifact | Status |
|---|---|
| Sprint Completion Report — `docs/50-audit-reports/SPR_MOD_001_002_ORGANIZATION_STRUCTURE_REPORT.md` | Issued (this turn) |
| Sprint Acceptance Review — this document | Issued (this turn) |
| Phase 2 Closeout — `docs/04_Program_Status/reports/PHASE2_SPR-MOD-001-002_CLOSEOUT.md` | Complete (prior turn, Board-accepted 10/10) |
| SIP Execution Metadata + §12 Sprint Outcome — `docs/05_Sprint_Implementation_Plans/active/SIP-SPR-MOD-001-002.md` | Populated (this turn) |
| SIP archived — `docs/05_Sprint_Implementation_Plans/archive/2026/SIP-SPR-MOD-001-002.md` | Copied per `SIP_LIFECYCLE.md` §Archival Procedure |
| Program Status — `docs/04_Program_Status/reports/PROGRAM_STATUS_20260724T024505Z.md` | Issued (this turn) |
| IMP CHANGELOG — `docs/03_Implementation_Master_Plan/CHANGELOG.md` | Entry v1.0.2 added (this turn) |
| Sprint Register / Index | **Not present in repository.** The active/archive folder pair under `docs/05_Sprint_Implementation_Plans/` is the sole convention; no separate index is invented. |
| Settings namespace bootstrap proposal — `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md` | Governance-only; unchanged (no sprint id reserved) |

---

## 5. Production Readiness

### Rollback characteristics

| Migration | Reversibility | Notes |
|---|---|---|
| A (organization schema extensions + back-fill) | **Partially reversible.** Column additions and constraints can be dropped, but the singleton back-fill setting `is_default=true` and `lifecycle_state='active'/'open'` on pre-existing rows is a one-way data transformation. Documented here rather than in a rollback script. | Aligned with SPR-001 Migration A convention. |
| B (organization lifecycle helpers + RPCs) | Reversible. All objects live in `private` schema. | — |
| C (organization permissions) | Reversible. `INSERT` into `public.permissions`; removable by targeted DELETE. | — |

### Configuration changes
None outside the migrations above.

### Feature flags
None introduced by this sprint. Company- and branch-scoped flag/config namespace seeds are gated by SIP-014 (deferred).

### Monitoring / audit
Audit writer wired for company, branch, and financial-year lifecycle transitions using the canonical `public.audit_logs` schema. Runtime confirmation deferred — see CF-A.

---

## 6. Outstanding Observations

### Resolved this sprint
- Company, branch, and financial-year schemas, RLS policies, lifecycle RPCs, and server functions shipped end-to-end.
- 17 permission keys added under `platform.{company,branch,financial_year}.*` and enforced via `PERMISSIONS.*` constants at every handler.
- Organization Structure UI wired: tenant detail Companies tab; company detail Branches + Financial Years tabs; create/edit/lifecycle dialogs.
- 21 new lifecycle unit tests added; full Vitest suite 49/49 passing; `tsgo` clean.
- Non-overlap of open financial years enforced at the database via `EXCLUDE USING gist`.

### Deferred

| ID | Item | Classification | Disposition |
|---|---|---|---|
| SIP-014 | Config namespace initialization on company activation / branch creation via ENG-005 | Architecture Dependency | Proposal at `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md`. No sprint identifier reserved. Architecture Board to decide at intake. |
| CF-A (this sprint) | Live per-entity lifecycle exercise (company/branch/FY) producing audit rows against the live database | Runtime environment | Deferred — same limitation as SPR-001 CF-2. |
| CF-B (this sprint) | Authenticated UI capture of Companies / Branches / Financial Years views | Runtime environment | Deferred — same limitation as SPR-001 CF-2. |
| CF-6 | Authenticated integration-test harness (repository-wide) | **Repository Capability Gap** | Recorded; no remediation proposed in this phase. Present-state disposition only. |
| CF-7 | Playwright authentication / session infrastructure (repository-wide) | **Repository Capability Gap** | Recorded; no remediation proposed in this phase. Present-state disposition only. |

### Carry-forwards from SPR-MOD-001-001

| ID | Item | Status after this sprint |
|---|---|---|
| CF-1 | Cross-tenant RLS deny smoke fixture (tenancy) | Static verification confirms policies present; automated two-session smoke remains deferred pending CF-6/CF-7. |
| CF-2 | Live activation exercise + authenticated UI evidence (tenancy) | Merged into CF-A / CF-B — same environmental constraint. |
| CF-3 | ENG-005 tenant-scoped config + flag namespace seed | Retained. Now coupled with SIP-014 for company/branch scopes. |
| CF-4 | Lifecycle observability | Retained — Platform Observability sprint. |
| CF-5 | External event-bus delivery per ADR-051 | Retained — ENG-024 sprint. |

### Accepted Risks
| ID | Item | Rationale |
|---|---|---|
| R-074 | Leaked Password Protection disabled | Accepted risk documented in `docs/01-master/risk-register.md`; unchanged by this sprint. |

---

## 7. UI Evidence — Runtime Gap

The sandbox remains `LOVABLE_BROWSER_AUTH_STATUS=external_unmanaged` (self-managed Supabase); no minted browser session is available. Authenticated capture of the Companies tab (tenant detail), the Branches tab, and the Financial Years tab is therefore **recorded as a gap** rather than simulated. Folded into CF-A / CF-B. Same disposition as SPR-MOD-001-001 §7.

---

## 8. Architecture Board Decision

**Decision:** _Pending._

Implementation team recommendation: **Approve with Conditions**, on the same terms used for SPR-MOD-001-001 §8:

1. CF-A + CF-B (live lifecycle exercise and authenticated UI capture) discharged in a subsequent sprint window when a platform-admin session becomes available.
2. CF-6 + CF-7 (repository capability gaps) acknowledged for standalone disposition — not a blocker to accepting this sprint.
3. SIP-014 remains proposal-only; no sprint identifier is created without explicit Board authorization.

**Rationale:** All acceptance criteria are met at the implementation + automated-test tier; the Phase 2 Closeout Report already carries a 10/10 governance rating on Governance Compliance, Phase Isolation, Verification Coverage, Traceability, and Change Control. No architectural deviation. No implementation defect surfaced during this review.

**Next-sprint recommendation:** Proceed to **SPR-MOD-001-003 — Users, Invitations, RBAC UI** subject to Board countersignature of this review.

---

## 9. Exit Criteria Assessment

| Criterion | Met? |
|---|---|
| All acceptance criteria verified with evidence (or gaps explicitly recorded per §1 discipline) | ✅ |
| All SIP tasks closed in the traceability matrix | ✅ (20 Complete, 1 Deferred with proposal, 2 Deferred as repository capability gaps) |
| Quality gate passed | ✅ (per §3, with two documented runtime deferrals) |
| Required documentation updated | ✅ (per §4) |
| Architecture Board decision recorded | ⏸ Pending countersignature |

**Sprint status:** **Complete (Acceptance Pending).**

---

## Sign-off

| Role | Name | Date |
|---|---|---|
| Program Delivery | Lovable Agent | 2026-07-24 |
| Architecture Board | Pending review | — |

## Stop Condition

Sprint acceptance recommended. Awaiting Architecture Board confirmation. **Do not begin SPR-MOD-001-003 until this Acceptance Review is countersigned by the Architecture Board.**

---
title: "MOD-008 Module Publication — Payroll"
summary: "GT-005 Module Publication for MOD-008 Payroll. Terminal governance artifact derived exclusively from MOD008_PAYROLL_BASELINE_v1 and MOD-008 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-008_MODULE_PUBLICATION"
publication_id: "MOD-008_MODULE_PUBLICATION"
module_id: "MOD-008"
module_name: "Payroll"
version: "1.0"
status: "Published"
owner: "People"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/payroll/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md"
source_module: "MOD-008"
source_sprints: ["SPR-MOD-008-001", "SPR-MOD-008-002", "SPR-MOD-008-003", "SPR-MOD-008-004", "SPR-MOD-008-005", "SPR-MOD-008-006"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-008", "payroll", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD008-20260720T090000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-015", "ENG-016", "ENG-017", "ENG-018", "ENG-019", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-007", "MOD-017"]
---

# MOD-008 Module Publication — Payroll

> **Reference publication only.** This publication is a faithful representation of [`MOD008_PAYROLL_BASELINE_v1`](../../40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md) and the [`MOD-008 Module PRD`](../../20-module-prds/payroll/MODULE_PRD.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-008
- **Module Name:** Payroll
- **Owner:** People
- **Publication ID:** MOD-008_MODULE_PUBLICATION
- **Source Baseline:** `MOD008_PAYROLL_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md`](../../30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-008-001` … `SPR-MOD-008-006`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Payroll is the authoritative bounded context for the Payroll and Compensation domain (Baseline §1; PRD §1). It owns the Salary Structure and Component masters, the Bank Mandate master, payroll operations configuration (pay cycles, rounding policy, numbering series), the Payroll Run lifecycle (including reversal via a reversing run), per-locale statutory computation within a run, Reimbursement and Advance transaction lifecycles, Payslip issuance for every completed run, disbursement file generation (immutable once generated) with bulk delivery to Bank via the Integration Engine, and the Payroll operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Downstream modules consume Payroll state and never redefine it. Employee master, org structure, attendance, and leave remain owned by MOD-007 HRMS; ledger posting of payroll obligations is produced by MOD-002 Accounting via `ENG-015` and `ENG-016`; identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration (Baseline §2).

## 3. Approved Scope

Restates the scope consolidated in `MOD008_PAYROLL_BASELINE_v1` §2 and the Module PRD §2. Payroll owns:

- Salary structures and components — Salary Structure and Component master lifecycles, Bank Mandate master, and payroll operations configuration (pay cycles, rounding policy, numbering series) (Baseline §2; PRD §2).
- Payroll cycles and runs — Payroll Run transaction lifecycle, input consumption from HRMS signals (attendance, leave, employee lifecycle), gross computation, approval routing, and run reversal (Baseline §2; PRD §2, §4).
- Statutory computations (per locale) — Statutory Setup master lifecycle, locale-scoped statutory component evaluation within a payroll run, and locale-scoped statutory report definitions (Baseline §2; PRD §2, §5).
- Reimbursements and advances — Reimbursement and Advance transaction lifecycles, approvals routing, receipt attachments, and adjustment against subsequent payroll runs (Baseline §2; PRD §2, §6).
- Payslip generation — Payslip transaction lifecycle and payslip issuance for every completed payroll run (Baseline §2; PRD §2, §6).
- Disbursement and posting — Bulk disbursement file generation (immutable once generated), delivery to Bank via `ENG-023` Integration Engine, and invocation of `ENG-015` Voucher and `ENG-016` Posting for payroll ledger effects (Baseline §2; PRD §2, §6, §7).
- Payroll Analytics & Compliance — read-model operational reports (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), dashboards, exports, and audit readiness (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Every authority is inherited verbatim from `MOD008_PAYROLL_BASELINE_v1` §7. This publication restates them for consumer convenience; the Module Baseline remains authoritative.

### 4.1 SPR-MOD-008-001 — Payroll Foundation & Salary Structures

- **Payroll Ownership Convention Authority** — MOD-008 Payroll owns the business semantics of the Salary Structure and Component master, Bank Mandate master, and payroll operations configuration (pay cycles, rounding policy, numbering series). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, currency, eventing) but MUST NOT redefine Payroll business rules. Employee master, attendance, and leave remain exclusive to MOD-007 HRMS; ledger posting remains exclusive to MOD-002 Accounting; identity, authentication, and permissions remain exclusive to MOD-001 Platform Administration.

### 4.2 SPR-MOD-008-002 — Payroll Cycles & Runs

- **Payroll Run Ownership Authority** — MOD-008 owns the Payroll Run transaction and its state machine (Inputs-to-run, Run-to-approval, reversal via a new reversing run). HRMS signals (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) are consumed read-only; HRMS transaction lifecycles are not redefined.

### 4.3 SPR-MOD-008-003 — Statutory Computations

- **Statutory Ownership Authority** — MOD-008 owns Statutory Setup master and per-locale statutory component evaluation within a payroll run, gated by the Module PRD §7 rule that a payroll run cannot be finalized until all statutory computations complete. Locale packs remain owned by `ENG-006` Localization; tax algorithms remain owned by `ENG-019` Tax Engine.

### 4.4 SPR-MOD-008-004 — Reimbursements & Advances

- **Reimbursement & Advance Ownership Authority** — MOD-008 owns the Reimbursement and Advance transaction lifecycles, receipt attachments (via `ENG-007`), and adjustment of approved balances against subsequent payroll runs. Approval routing remains owned by `ENG-011`.

### 4.5 SPR-MOD-008-005 — Payslip Generation & Disbursement

- **Payslip & Disbursement Ownership Authority** — MOD-008 owns the Payslip transaction lifecycle, payslip issuance for every completed payroll run, and the generation of disbursement files that are immutable once generated per Module PRD §7. Payroll ledger effects are produced by invoking `ENG-015` Voucher and `ENG-016` Posting; the posting logic itself remains exclusive to MOD-002 Accounting. Bulk disbursement delivery to Bank is performed via `ENG-023` Integration Engine.

### 4.6 SPR-MOD-008-006 — Payroll Analytics & Compliance

- **Payroll Analytics Ownership Authority** — MOD-008 owns operational Payroll reports, dashboards, exports, and the Payroll audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read Model Boundary Convention Authority** — Dashboards, filters, drill-down, and export operate over the Payroll read model; no transactional side effects and no new domain events published by Sprint 6.
- **Audit Readiness Boundary Convention Authority** — Audit readiness exposes prior-sprint Payroll events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-008-001` … `SPR-MOD-008-006`) as consolidated in `MOD008_PAYROLL_BASELINE_v1`. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 6. Business Rules

Business rules are inherited verbatim from the Module PRD §7 and the Sprint PRD family:

- A payroll run cannot be finalized until all statutory computations complete (PRD §7).
- Reversal of a finalized payroll run creates a new, reversing run (PRD §7).
- Disbursement files are immutable once generated (PRD §7).
- Payroll master and transaction lifecycles are Payroll-owned; no other module mutates Payroll state.
- Payroll consumes HRMS signals (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) read-only.
- Payroll does not implement double-entry posting; ledger effects are produced by invoking `ENG-015` and `ENG-016` (PRD §6).
- Analytics surfaces are read-only projections over the Payroll read model (Baseline §7).

## 7. Master Data Authorities

Inherited verbatim from Module PRD §5 and Baseline §4:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Salary Structure | SPR-MOD-008-001 |
| Component | SPR-MOD-008-001 |
| Bank Mandate | SPR-MOD-008-001 |
| Statutory Setup | SPR-MOD-008-003 |

## 8. Transaction Authorities

Inherited verbatim from Module PRD §6 and Baseline §4:

| Transaction | Originating Sprint |
| --- | --- |
| Payroll Run | SPR-MOD-008-002 |
| Reimbursement | SPR-MOD-008-004 |
| Advance | SPR-MOD-008-004 |
| Payslip | SPR-MOD-008-005 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by Payroll; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `PayrollProcessed` — SPR-MOD-008-005
- `PayrollPosted` — SPR-MOD-008-005
- `PayslipIssued` — SPR-MOD-008-005
- `DisbursementInitiated` — SPR-MOD-008-005

## 10. Consumed Events

Consumed from MOD-007 HRMS via `ENG-024`. Consumption is read-only; Payroll does not own the semantics of these events. Verbatim from Baseline §8:

- `EmployeeHired` (from MOD-007 HRMS) — SPR-MOD-008-002
- `EmployeeExited` (from MOD-007 HRMS) — SPR-MOD-008-002
- `AttendanceMarked` (from MOD-007 HRMS) — SPR-MOD-008-002
- `LeaveApproved` (from MOD-007 HRMS) — SPR-MOD-008-002

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-008 via their Capability Interfaces. Engine set is inherited verbatim from `MOD008_PAYROLL_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-008-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-008-001 |
| ENG-004 (Audit Engine) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-008-001, 002, 003 |
| ENG-006 (Localization Engine) | SPR-MOD-008-001, 003 |
| ENG-007 (Document Engine) | SPR-MOD-008-004, 005 |
| ENG-010 (Workflow Engine) | SPR-MOD-008-002, 004 |
| ENG-011 (Approval Engine) | SPR-MOD-008-002, 004 |
| ENG-012 (Rules Engine) | SPR-MOD-008-002, 003, 004 |
| ENG-014 (Scheduler Engine) | SPR-MOD-008-002 |
| ENG-015 (Voucher Engine) | SPR-MOD-008-005 |
| ENG-016 (Posting Engine) | SPR-MOD-008-005 |
| ENG-017 (Numbering Engine) | SPR-MOD-008-001, 002, 004, 005 |
| ENG-018 (Currency Engine) | SPR-MOD-008-001, 002, 004, 005 |
| ENG-019 (Tax Engine) | SPR-MOD-008-003 |
| ENG-021 (Reporting Engine) | SPR-MOD-008-003, 006 |
| ENG-022 (Dashboard Engine) | SPR-MOD-008-006 |
| ENG-023 (Integration Engine) | SPR-MOD-008-005 |
| ENG-024 (Event Engine) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-008-002, 004, 005 |
| ENG-027 (Export Engine) | SPR-MOD-008-005, 006 |

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC). `ENG-015` Voucher and `ENG-016` Posting are invoked by Payroll for payroll ledger effects; the posting logic itself remains exclusive to MOD-002 Accounting per the governance boundary (Baseline §5, §7).

## 12. Dependencies

Inherited verbatim from `MOD008_PAYROLL_BASELINE_v1` §9 and Module PRD §13:

**Upstream contracts consumed by Payroll:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD007_HRMS_BASELINE_v1` — Employee master, org assignments (read-only APIs); `EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved` events.
- `MOD002_ACCOUNTING_BASELINE_v1` — `ENG-015` Voucher and `ENG-016` Posting are invoked (not redefined) for payroll ledger effects.
- **External Bank systems** — bulk disbursement delivery via `ENG-023` Integration Engine.
- **External Statutory portals** — locale-scoped statutory reporting surfaces.

**Downstream consumers of Payroll:**

- `MOD-002 Accounting` — consumes `PayrollProcessed`, `PayrollPosted`, and `DisbursementInitiated` for payroll ledger effects and reconciliation.
- `MOD-007 HRMS` — consumes `PayrollProcessed` for HR cost-adjacent analytics and `PayslipIssued` for employee self-service.
- `MOD-017 Analytics` — consumes Payroll operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Inherited verbatim from Baseline §7 and §9:

- MOD-008 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own Payroll master data, redefine the Payroll Run / Payslip / Reimbursement / Advance / Statutory Computation lifecycles, or redefine Payroll analytics ownership.
- Employee master, attendance, and leave remain owned by MOD-007 HRMS; Payroll consumes HRMS signals read-only.
- Ledger posting for payroll obligations is produced by MOD-002 Accounting via `ENG-015` and `ENG-016`; Payroll invokes these engines but never redefines posting logic.
- Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration.
- `ENG-004` remains authoritative for audit collection; Payroll owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; Payroll owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md`](../../30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-008-001` … `SPR-MOD-008-006` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md`](../../40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Multi-country payroll harmonization (owned by a future baseline revision).
- AI anomaly detection on payroll inputs (owned by MOD-018 AI Workspace when introduced).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Locales not yet activated in `docs/14-localization/` (deferred until locale packs are extended).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 / MOD-007 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-008 → MOB-008 → API-008 → CPC-008 → VR-008`

- Next executable pass: **WEB-008 Payroll Web Solution Design**.
- Subsequent passes: MOB-008, API-008, CPC-008, VR-008.

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority enumerated in §4 is inherited verbatim from `MOD008_PAYROLL_BASELINE_v1`.
2. Engine and ADR sets in §11 match the Module Baseline §5–§6 exactly.
3. Downstream dependency set in §12 matches the Module Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD008-20260720T090000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD008_PUBLICATION_COMPLETE` → ready for `WEB-008 Payroll Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD008_PAYROLL_BASELINE_v2`).

## 19. Repository State Transition

`MOD008_BASELINE_FROZEN` → **`MOD008_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md`](../../40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- [`docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md`](../../30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md)
- [`docs/45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md`](../hrms/MOD-007_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)

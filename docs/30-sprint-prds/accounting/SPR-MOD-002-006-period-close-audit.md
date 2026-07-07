---
title: "SPR-MOD-002-006 — Period Close & Audit"
summary: "Sprint PRD for Period Close & Audit of MOD-002 Accounting: repository-standard accounting period lifecycle (Open / Soft Close / Close / Reopen), financial-year close, closing adjustment governance, opening balance preparation, accounting lock rules, and business-level accounting audit review, built exclusively on authoritative outputs of SPR-MOD-002-001…005. Consumes Platform Audit (ENG-004) infrastructure; never redefines voucher, journal, ledger, financial reporting, or taxation ownership."
layer: "delivery"
owner: "Accounting"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-002-006"
parent_module: "MOD-002"
parent_sprint_plan: "MOD-002_SPRINT_PLAN.md"
iteration: "Sprint 6"
stage: "2"
pass: "8.3.6"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-011", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-013", "ADR-014", "ADR-032", "ADR-051", "ADR-053"]
tags: ["sprint", "prd", "accounting", "mod-002", "period-close", "audit", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-002-006 — Period Close & Audit

> **Stage 2 deliverable.** Sixth and final authored Sprint PRD for **MOD-002 Accounting** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-002-006` (permanent) |
| Parent Module | `MOD-002` — Accounting |
| Parent Sprint Plan | [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) |
| Iteration | Sprint 6 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) through [`SPR-MOD-002-005`](./SPR-MOD-002-005-taxation-compliance-foundation.md) (all required) |
| Upstream Baseline | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Baseline | `MOD002_ACCOUNTING_BASELINE_v1` (frozen in the next Stage 3 pass) |
| Downstream Modules | MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018 |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **repository-standard Period Close & Audit layer** for BusinessOS — accounting period lifecycle (Open, Soft Closed, Closed, Reopened), financial-year close, closing adjustment governance, closing validation, opening balance preparation, accounting lock rules, and business-level accounting audit review — built **exclusively on authoritative outputs of `SPR-MOD-002-001` through `SPR-MOD-002-005`**. Period Close & Audit determines whether posting is permitted; it does not create vouchers, modify journals, mutate ledger state, calculate taxes, or generate financial statements.

> **Period Authority Convention.** The Accounting module exclusively owns accounting period lifecycle state — `Open`, `Soft Closed`, `Closed`, `Reopened`. No downstream module may redefine the accounting-period lifecycle.
>
> **Financial Year Ownership Convention.** Accounting owns fiscal year close, year-end carry forward, opening balance preparation, and closing adjustment governance. Business modules consume the resulting accounting state; they do not implement parallel year-end mechanics.
>
> **Period Close Boundary.** Period Close determines whether posting is permitted. It **MUST NOT** create vouchers, modify journals, modify ledger entries, calculate taxes, or generate financial statements. Those responsibilities remain owned by `SPR-MOD-002-002`, `SPR-MOD-002-003`, `SPR-MOD-002-005`, and `SPR-MOD-002-004` respectively.
>
> **Controlled Reopening Convention.** Closed periods MAY be reopened only through authorized accounting governance. Reopening is fully audited, preserves historical integrity, and never deletes accounting history.
>
> **Audit Review Boundary.** Accounting owns business-level accounting audit review. Platform Audit (`MOD-001` / `ENG-004`) remains authoritative for audit collection, storage, integrity, and lifecycle. Accounting consumes Platform audit services; it does not redefine them.
>
> **Financial Freeze Convention.** Once a financial period reaches `Closed` state, accounting movements are frozen for that period. Downstream modules consume the closed accounting state; subsequent corrections occur only through controlled reopening procedures.

These conventions **complement — and do not replace —** the Accounting Ownership Convention from [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md), the Accounting Voucher Ownership Convention from [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md), the Ledger Posting Ownership / Ledger Immutability / Balance Integrity / Accounting Period Authority / Ledger Access Boundary conventions from [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md), the Financial Reporting Ownership / Ledger Consumption / Report Determinism / Reporting Read Model / Financial Statement Boundary conventions from [`SPR-MOD-002-004`](./SPR-MOD-002-004-financial-statements.md), and the Tax Ownership / Tax Calculation Boundary / Tax Configuration Authority / Compliance Readiness / Tax Reporting Boundary conventions from [`SPR-MOD-002-005`](./SPR-MOD-002-005-taxation-compliance-foundation.md). Period Close & Audit **MUST NOT** redefine voucher, journal, ledger, financial reporting, or taxation ownership established by earlier Accounting Sprint PRDs.

### 1.2 In Scope

- **Accounting period lifecycle** — authoritative `Open`, `Soft Closed`, `Closed`, `Reopened` states with deterministic transition rules.
- **Financial-year close** — deterministic year-end process aggregating authoritative ledger state produced by `SPR-MOD-002-003`.
- **Closing adjustments (governance only)** — governance and approval semantics for adjustment entries; **journal creation and ledger posting remain owned by `SPR-MOD-002-003`**.
- **Closing validation** — deterministic checks against ledger balances, tax classifications, and financial-statement projections identifying unresolved accounting issues before close.
- **Closing checklist** — authoritative checklist of validations that must pass before Close.
- **Year-end carry forward readiness** — preparation of authoritative opening balances for the next financial year, derived exclusively from the closed ledger.
- **Opening balance preparation** — deterministic derivation of opening balances from closed prior-period ledger state.
- **Accounting lock rules** — deterministic rules that reject posting to `Closed` periods and honour `Soft Closed` gating.
- **Posting restrictions** — enforcement of lock rules against the `SPR-MOD-002-003` posting pipeline via consumption, not redefinition.
- **Audit review workflows** — business-level accounting audit review consuming Platform audit records via `ENG-004`.
- **Audit exports** — authoritative accounting audit exports derived from Platform audit records.
- **Accounting operational review** — business-level review surface over authoritative accounting state.
- **Period status visibility** — read-only surface exposing period state to downstream modules.
- **Close authorization** — authorized state-transition gating via `ENG-002`.
- **Accounting close events** — see §11 for the illustrative expected event surface and the Event Catalog governance rule.

### 1.3 Out of Scope

Reserved for other sprints and modules:

- **Voucher lifecycle** — owned by `SPR-MOD-002-002`.
- **Journal creation and ledger posting** — owned by `SPR-MOD-002-003`; this sprint prepares governance and validates state, never posts.
- **Financial statement calculation** — owned by `SPR-MOD-002-004`.
- **Tax determination and tax filing** — owned by `SPR-MOD-002-005` and future compliance work.
- **Statutory / government filing** — deferred to future compliance work.
- **External audit systems**, **SIEM**, **infrastructure monitoring**, **BI dashboards**, **AI accounting analysis**, **consolidation**.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-002-006`, the following will exist:

- **Business capabilities.**
  - Accounting period lifecycle (`Open`, `Soft Closed`, `Closed`, `Reopened`) can be operated per tenant × company × financial year.
  - Financial-year close deterministically prepares opening balances for the next financial year from authoritative closed-period ledger state.
  - Closing validation runs a deterministic checklist against ledger balances, tax classifications, and financial-statement projections before Close.
  - Posting to `Closed` periods is rejected deterministically; `Soft Closed` gating is honoured.
  - Controlled reopening of `Closed` periods is available only via authorized governance and is fully audited.
  - Business-level accounting audit review consumes Platform audit records via `ENG-004` without redefining Platform Audit.
- **Cross-module contract.**
  - Downstream modules consume period status and closed accounting state via a read-only surface; they MUST NOT alter period state or bypass posting restrictions.
  - Close/Audit paths MUST NOT post, modify journals, create vouchers, mutate ledger balances, calculate taxes, or generate financial statements.
- **Published events.** Close/Audit-lifecycle events per §11, published only for names present in the authoritative Event Catalog at authoring time.
- **Audit artifacts.** An audit record exists for every period state transition, every closing validation run, every controlled reopening, and every audit export, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-002-006`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

> **Traceability Requirement.** Every capability documented in this Sprint PRD MUST trace to one or more sections of [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md). No orphan requirements may be introduced. Consistent with Sprints 001–005.

| MOD-002 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Period close and audit | Accounting period lifecycle, financial-year close, business-level audit review |
| §4 Business Processes — Period close, year-end close | Deterministic close pipeline consuming Sprints 001–005 outputs |
| §5 Reports — Audit exports, closing checklist | Audit exports and closing validation surface |
| §7 Business Rules — Closed periods reject posting; reopening is controlled | Period Authority, Financial Freeze, Controlled Reopening (§1.1) |
| §7 Business Rules — Opening balances derive from prior-period closed state | Year-end carry forward, opening balance preparation |
| §10 Configuration — Fiscal year, periods, lock rules | Accounting lock rules; consumed from `SPR-MOD-002-001` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As an accountant, I want to transition an accounting period through `Open` → `Soft Closed` → `Closed`, so that posting eligibility is deterministic and auditable.*
- **US-002.** *As a controller, I want closing validation to detect unresolved accounting issues before Close, so that closed periods are trustworthy.*
- **US-003.** *As an accountant, I want financial-year close to deterministically prepare opening balances for the next year from authoritative closed-period ledger state, so that year-over-year continuity is preserved.*
- **US-004.** *As a controller, I want posting to `Closed` periods to be refused deterministically, so that the Financial Freeze Convention is enforced.*
- **US-005.** *As an accounting governance owner, I want reopening a `Closed` period to require authorized governance and to be fully audited, so that historical integrity is preserved.*
- **US-006.** *As an auditor, I want business-level accounting audit review that consumes Platform audit records via `ENG-004`, so that accounting-level review does not fork the audit trail.*
- **US-007.** *As an auditor, I want authoritative accounting audit exports, so that external review can be satisfied without bypassing Platform Audit.*
- **US-008.** *As a downstream module (system persona), I want a read-only period status surface, so that I never alter period state or bypass posting restrictions.*
- **US-009.** *As a security reviewer, I want every period state change, reopening, and audit export authorized via `ENG-002` and audited via `ENG-004`.*
- **US-010.** *As an accountant, I want tenant isolation enforced on every period/audit read/write, so that no cross-tenant leakage is possible.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Deterministic lifecycle transitions (US-001)

- **Given** an authoritative period in a defined state,
  **when** an authorized transition is requested,
  **then** the transition applies deterministically, produces an audit record via `ENG-004`, and rejects invalid transitions with a deterministic error.

### 5.2 Closing validation (US-002)

- **Given** a period ready for close,
  **when** closing validation runs,
  **then** it deterministically evaluates the closing checklist against ledger balances (Sprint 003), tax classifications (Sprint 005), and financial-statement projections (Sprint 004); unresolved issues block the transition to `Closed` and are surfaced with references to their source.

### 5.3 Financial-year close and opening balances (US-003)

- **Given** a financial year whose periods are all `Closed`,
  **when** financial-year close executes,
  **then** it deterministically produces opening balances for the next year derived exclusively from closed prior-period ledger state; the process never mutates the ledger.

### 5.4 Financial Freeze — posting to Closed periods (US-004)

- **Given** any posting attempt targeting a `Closed` period,
  **when** the attempt reaches the `SPR-MOD-002-003` posting pipeline gated by Period Close rules,
  **then** it is refused deterministically and audited via `ENG-004`; `Soft Closed` gating is honoured per configuration.

### 5.5 Controlled Reopening (US-005)

- **Given** an authorized reopening request against a `Closed` period,
  **when** it executes,
  **then** the period transitions to `Reopened`, historical audit records are preserved without deletion, and a full audit trail (actor, reason, before/after) is captured via `ENG-004`.
- **Given** an unauthorized reopening attempt,
  **when** it is evaluated,
  **then** it is refused deterministically and audited.

### 5.6 Audit Review Boundary (US-006, US-007)

- **Given** any accounting audit review or audit export,
  **when** it is generated,
  **then** every figure or entry references authoritative Platform audit records via `ENG-004`; no accounting audit path forks or redefines Platform Audit.

### 5.7 Read-only period status for downstream (US-008)

- **Given** a downstream module (system persona) attempting to alter period state or bypass posting restrictions,
  **when** the attempt occurs,
  **then** it is refused deterministically at the Accounting boundary.

### 5.8 Authorization and audit (US-009)

- **Given** any period state transition, reopening, closing validation run, or audit export,
  **when** it is submitted,
  **then** the request is authorized via `ENG-002` under the caller's tenant/company/role context and produces an audit record via `ENG-004`.

### 5.9 Events

- **Given** a period-close or audit lifecycle event whose name is registered in the authoritative Event Catalog at authoring time (see §11),
  **when** the corresponding transition completes,
  **then** the event is published via `ENG-024` conforming to the catalog's contract.
- **Given** an illustrative period-close or audit event listed in §11 that is **not** present in the Event Catalog,
  **when** the corresponding transition completes,
  **then** period close and audit events are published only using names present in the authoritative Event Catalog; the illustrative name is either substituted with the closest authoritative equivalent or deferred (see Risks R-EV-01).

### 5.10 Ownership-boundary preservation

- **Given** any interaction with the Period Close & Audit surface,
  **when** an attempt is made through this surface to create a voucher, modify a journal, mutate a ledger balance, calculate a tax, or generate a financial statement,
  **then** it is refused deterministically. Period Close & Audit MUST NOT redefine voucher, journal, ledger, financial reporting, or taxation ownership.

### 5.11 Isolation invariants (`ADR-011`) (US-010)

- **Given** any period or audit read/write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-002` — Accounting.
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2, §4, §5, §7, §10, §12. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-002` MODULE_PRD.
- **Upstream sprints:** **`SPR-MOD-002-001` through `SPR-MOD-002-005` (all required).**
  - [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) — Fiscal year, accounting periods, base accounting configuration.
  - [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md) — Voucher outputs consumed transitively through the ledger.
  - [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md) — Authoritative journals, ledger movements, ledger balances, Ledger Immutability, Ledger Access Boundary.
  - [`SPR-MOD-002-004`](./SPR-MOD-002-004-financial-statements.md) — Financial-statement projections consumed by closing validation.
  - [`SPR-MOD-002-005`](./SPR-MOD-002-005-taxation-compliance-foundation.md) — Tax classifications consumed by closing validation.
- **Upstream baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen). Individual Platform Sprint PRDs are cited only where sprint-level traceability is specifically required.
- **Downstream baseline:** `MOD002_ACCOUNTING_BASELINE_v1` — frozen in the subsequent Stage 3 pass (`Pass 8.3.Z`), following the Stage 3 baseline process established by `MOD001_PLATFORM_BASELINE_v1`.
- **Downstream modules:** MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018 — consume period status and closed accounting state via the read-only surface established here.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Audit Review Boundary in §1.1). Engine identifiers below match the authoritative entries in [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md) and [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md); no new identifiers are introduced here.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Authorizes every period state transition, closing validation run, controlled reopening, and audit export. |
| `ENG-004` Audit | Authoritative audit collection, storage, integrity, and lifecycle. Accounting audit review **consumes** it. |
| `ENG-011` Configuration | Provides authoritative configuration infrastructure consumed for accounting lock rules and closing-checklist configuration. |
| `ENG-018` Currency | Consumed where multi-currency opening balances or audit figures need currency semantics; not redefined. |
| `ENG-021` Reporting | Provides shared reporting infrastructure consumed by audit exports and operational review surfaces. |
| `ENG-024` Eventing | Publishes close/audit-lifecycle events per §11, subject to the Event Catalog governance rule. |

Engine identifiers listed above are treated as expected. If the authoritative catalog resolves any of them differently at authoring time (rename, split, merge), the catalog wins and this PRD is corrected in a subsequent authoring pass. Accounting period and audit-review business semantics (period authority, financial year ownership, period close boundary, controlled reopening, audit review boundary, financial freeze) are owned by this sprint and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every period/audit read/write. |
| `ADR-013` Persistence & Transactionality | Authoritative persistence contract for period state and configuration-change stream. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration; Accounting audit review consumes it. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to close/audit surface. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for close/audit-lifecycle events. |
| `ADR-053` Multi-Currency Handling | Authoritative multi-currency model consumed by opening balance and audit-figure presentation. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Accounting Period State | MOD-002 (this sprint) | Lifecycle state (`Open`, `Soft Closed`, `Closed`, `Reopened`) for an accounting period defined by `SPR-MOD-002-001`. |
| Period Transition | MOD-002 (this sprint) | Record of an authorized state transition (actor, from/to, reason, timestamp). |
| Closing Validation Run | MOD-002 (this sprint) | Deterministic evaluation of the closing checklist for a period, referencing ledger balances, tax classifications, and financial-statement projections. |
| Closing Checklist | MOD-002 (this sprint) | Configured set of validations that must pass before Close. |
| Financial Year Close | MOD-002 (this sprint) | Deterministic year-end process producing opening balances for the next financial year. |
| Opening Balance Set | MOD-002 (this sprint) | Deterministic opening balances derived exclusively from closed prior-period ledger state. |
| Controlled Reopening | MOD-002 (this sprint) | Authorized reopening record (actor, reason, before/after, audit references); preserves history. |
| Accounting Audit Review | MOD-002 (this sprint) | Business-level review surface over authoritative Platform audit records. |
| Audit Export | MOD-002 (this sprint) | Authoritative export derived from Platform audit records. |

### 10.2 Relationships

- An **Accounting Period State** belongs to exactly one period (owned by `SPR-MOD-002-001`) within one tenant × company × financial year.
- A **Period Transition** references exactly one Accounting Period State and produces an authoritative audit record via `ENG-004`.
- A **Closing Validation Run** references the period under evaluation and cites ledger balances (Sprint 003), tax classifications (Sprint 005), and financial-statement projections (Sprint 004).
- A **Financial Year Close** aggregates all Closed periods within a financial year and produces exactly one Opening Balance Set for the next year.
- An **Opening Balance Set** references closed prior-period ledger state and never mutates the ledger.
- A **Controlled Reopening** references the affected period, preserves history, and produces authoritative audit records.
- An **Accounting Audit Review** and **Audit Export** reference Platform audit records; they never redefine them.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-002` per the Period Authority Convention and Financial Year Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Ledger movements, ledger balances, and journal entries referenced by closing validation and opening-balance derivation are owned by `SPR-MOD-002-003`.
- Financial-statement projections consumed by closing validation are owned by `SPR-MOD-002-004`.
- Tax classifications consumed by closing validation are owned by `SPR-MOD-002-005`.
- Fiscal year and accounting period definitions are owned by `SPR-MOD-002-001`.
- Platform audit records consumed by accounting audit review are owned by `MOD-001` / `ENG-004`.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`.

**Event Catalog governance (architecture-doc immutability).** Sprint PRD authoring is documentation-only and MUST NOT modify `docs/02-architecture/event-catalog.md`. This Sprint PRD references only event names that exist in the authoritative Event Catalog at authoring time. Introduction of new event definitions requires a separate, explicitly authorized architecture pass — never this pass.

Expected event surface includes (**illustrative, not normative — subject to the authoritative Event Catalog**):

| Event Name (illustrative) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `accountingperiod.closed` | MOD-002 | SPR-MOD-002-006 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant (per `ADR-051`) |
| `accountingperiod.reopened` | MOD-002 | SPR-MOD-002-006 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant |
| `financialyear.closed` | MOD-002 | SPR-MOD-002-006 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant |
| `periodclose.completed` | MOD-002 | SPR-MOD-002-006 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `auditreview.generated` | MOD-002 | SPR-MOD-002-006 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |

The Event Catalog is the sole authoritative source of event names, envelopes, and delivery guarantees. For any illustrative name above that is not present in the Event Catalog at authoring time, implementation MUST either (a) reference the closest authoritative equivalent or (b) defer emission and record it under Risks R-EV-01. Consumer lists reflect **known** consumers at authoring time and MAY grow.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Accounting period lifecycle (`Open`, `Soft Closed`, `Closed`, `Reopened`) is deterministic and audited.
- [ ] Closing validation deterministically evaluates the closing checklist against ledger balances, tax classifications, and financial-statement projections.
- [ ] Financial-year close deterministically produces opening balances for the next year from closed prior-period ledger state; the ledger is never mutated.
- [ ] Posting to `Closed` periods is refused deterministically; `Soft Closed` gating is honoured.
- [ ] Controlled reopening requires authorized governance and preserves history; unauthorized reopening is refused and audited.
- [ ] Accounting audit review and audit exports consume Platform audit records via `ENG-004`; Platform Audit ownership is preserved.
- [ ] Downstream modules see a read-only period status surface; attempts to alter period state or bypass posting restrictions are refused deterministically.
- [ ] Period Close & Audit does NOT redefine voucher, journal, ledger, financial reporting, or taxation ownership from Sprints 002–005.
- [ ] Every period state transition, closing validation run, controlled reopening, and audit export is authorized via `ENG-002` and audited via `ENG-004`.
- [ ] Close/audit-lifecycle events registered in the Event Catalog are emitted per §11; deferred events are recorded as such in Risks/Assumptions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every period/audit read/write.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-002_SPRINT_PLAN.md` §2 (`SPR-MOD-002-006`):

- Accounting period lifecycle (`Open`, `Soft Closed`, `Closed`, `Reopened`) is authoritative per tenant × company × financial year.
- Closing validation, financial-year close, and opening-balance preparation are deterministic and derived exclusively from authoritative outputs of Sprints 001–005.
- Posting to `Closed` periods is refused deterministically via the Sprint 003 posting pipeline; controlled reopening is fully audited.
- Business-level accounting audit review and audit exports consume Platform audit records via `ENG-004`; Platform Audit ownership is preserved.
- Every period state transition, closing validation, reopening, and audit export is authorized via `ENG-002` and audited via `ENG-004`; close/audit-lifecycle events registered in the Event Catalog are emitted via `ENG-024`.
- No Period Close & Audit path performs voucher creation, journal mutation, ledger balance mutation, tax determination, or financial-statement generation.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable). Repository-wide ratification of this vocabulary is queued for a future governance pass and is not performed here.

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-002-001` through `SPR-MOD-002-005` all being `Done`.
  - **Impact:** Any regression in upstream ownership boundaries (voucher / journal / ledger / financial reporting / taxation) blocks this sprint.
  - **Mitigation:** Gate this sprint on Sprints 001–005; treat regressions as upstream defects.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** This sprint depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, users/roles/permissions, configuration hierarchy, and Platform Audit (`ENG-004`).
  - **Impact:** Any regression against the platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen baseline contract; treat regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Statutory / government filing, external audit systems, SIEM, BI dashboards, AI accounting analysis, and consolidation are deferred.
  - **Impact:** Silent absorption of deferred scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to future work.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** Platform Audit (`ENG-004`, `MOD-001`) is authoritative for audit collection, storage, integrity, and lifecycle; Accounting audit review MUST consume it and MUST NOT fork it.
  - **Impact:** A parallel accounting audit trail would fragment audit semantics.
  - **Mitigation:** Enforce the Audit Review Boundary; refuse patterns that fork Platform Audit; escalate weakening of `ENG-004` as a Platform defect.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Controlled reopening must never delete accounting history; historical audit records must be preserved.
  - **Impact:** History deletion would break audit traceability and the Financial Freeze Convention.
  - **Mitigation:** Enforce append-only semantics at the reopening boundary; refuse deletion deterministically and audit refusals.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-013`, `ADR-014`, `ADR-032`, `ADR-051`, `ADR-053`) are Accepted at authoring time.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Close/audit event definitions listed illustratively in §11 may not all be present in the authoritative Event Catalog.
  - **Impact:** Any illustrative event not yet in the catalog cannot be formally referenced or published.
  - **Mitigation:** Execute a dedicated Event Catalog governance pass before implementation or baseline freeze; this Sprint PRD MUST NOT edit `docs/02-architecture/event-catalog.md` (per §11); either reference the closest authoritative equivalent or defer.
  - **Status:** Deferred

- **Risk ID:** R-07
  - **Description:** Closing validation depends on financial-statement projections (Sprint 004) and tax classifications (Sprint 005) being available.
  - **Impact:** Missing upstream projections/classifications would block Close.
  - **Mitigation:** Consume upstream outputs; treat missing state as an upstream defect.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Downstream modules may attempt to alter period state or bypass posting restrictions.
  - **Impact:** Violates the Period Authority Convention and Financial Freeze Convention.
  - **Mitigation:** Expose read-only period status surface only; refuse write attempts deterministically and audit refusals.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** The `MOD002_ACCOUNTING_BASELINE_v1` freeze occurs in the subsequent Stage 3 pass and is out of scope here.
  - **Impact:** Stakeholders expecting a baseline freeze in this pass would be surprised.
  - **Mitigation:** Communicate the Stage 2 / Stage 3 boundary; queue baseline freeze as `Pass 8.3.Z`.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — deterministic period state transitions, closing checklist evaluation, financial-year close producing opening balances, Financial Freeze refusal of postings to `Closed` periods, controlled reopening preserving history, Audit Review Boundary refusal cases.
- **Integration** — period state persistence via `ADR-013`, authorization via `ENG-002`, audit via `ENG-004` (as consumer), configuration via `ENG-011`, event publication via `ENG-024` for events registered in the Event Catalog, closing validation against ledger balances (Sprint 003), financial-statement projections (Sprint 004), and tax classifications (Sprint 005).
- **Contract** — read-only period status surface consumed by downstream module system personas; refusal of write attempts through this surface; audit-export contract against Platform audit records.
- **End-to-end (smoke)** — voucher → journal → ledger → financial statements → tax classifications → closing validation → Close → year-end close → opening balances for the next year, under a two-tenant / two-company / multi-currency / multi-period smoke fixture to verify `ADR-011` isolation, Financial Freeze, Controlled Reopening, and Audit Review Boundary.

Sprint-specific fixtures: a two-company fixture with pre-seeded fiscal year, accounting periods spanning at least two years, closed and open periods, representative journal entries from Sprints 002–003, financial-statement projections from Sprint 004, and tax classifications from Sprint 005.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modelling the closing checklist declaratively under `ENG-011` Configuration so the validation set is versioned per tenant × company × financial year without redefining validation semantics.
- Consider expressing accounting lock rules as a boundary-time gate on the `SPR-MOD-002-003` posting pipeline so the Financial Freeze Convention is enforced by consumption, not duplication.
- Consider producing opening balances as a deterministic projection over closed prior-period ledger state, keyed idempotently, so re-running financial-year close under an unchanged closed state produces identical opening balances.
- Consider surfacing accounting audit review as a strict projection over Platform audit records (`ENG-004`), never as an independent audit store, so the Audit Review Boundary is enforced structurally.
- Consider surfacing the read-only period status surface for downstream modules as an explicit consumption-only interface, refusing writes deterministically.
- Consider deferring event emission per illustrative event name behind a feature check that reads the authoritative Event Catalog, so events for un-registered names are silently skipped until the catalog registers them (per R-EV-01).

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-002-006`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the repository-standard Period Close & Audit layer as an authoritative period lifecycle and business-level audit review consuming Sprints 001–005 outputs and Platform Audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every capability is tied to a `MOD-002` MODULE_PRD section. No orphan requirements are introduced.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Audit Review Boundary (§1.1) with "consumed, not redefined" language; engine identifiers match the authoritative catalog verbatim; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists voucher lifecycle (002), journal creation/posting (003), financial-statement calculation (004), tax determination/filing (005), statutory filing, external audit systems, SIEM, BI dashboards, AI analysis, and consolidation.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes covering deterministic transitions, closing validation, Financial Freeze, Controlled Reopening, Audit Review Boundary, and ownership-boundary preservation.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) each have a distinct role.
7. **Does the next reserved deliverable begin immediately after this one completes?**
   Yes. `MOD002_ACCOUNTING_BASELINE_v1` (Stage 3) is the immediate successor and depends on the Sprint 006 outputs. Baseline authoring is not performed in this pass.
8. **Is the architecture-doc immutability rule preserved?**
   Yes. This sprint MUST NOT modify `docs/02-architecture/event-catalog.md` or any other architecture document. Illustrative close/audit events not yet in the catalog are recorded in Risks (R-EV-01) and deferred to a dedicated architecture pass (§11).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-002-001-accounting-foundation.md`](./SPR-MOD-002-001-accounting-foundation.md), [`./SPR-MOD-002-002-voucher-framework.md`](./SPR-MOD-002-002-voucher-framework.md), [`./SPR-MOD-002-003-journal-ledger-posting.md`](./SPR-MOD-002-003-journal-ledger-posting.md), [`./SPR-MOD-002-004-financial-statements.md`](./SPR-MOD-002-004-financial-statements.md), [`./SPR-MOD-002-005-taxation-compliance-foundation.md`](./SPR-MOD-002-005-taxation-compliance-foundation.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

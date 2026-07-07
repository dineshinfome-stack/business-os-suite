---
title: "SPR-MOD-002-001 — Accounting Foundation"
summary: "Sprint PRD for the foundational accounting layer of MOD-002 Accounting: Chart of Accounts, ledger hierarchy, account classifications, fiscal year and accounting periods, base accounting configuration, currency foundation defaults, opening balance readiness, and accounting-foundation events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Accounting"
status: "Draft"
updated: "2026-07-06"
sprint_id: "SPR-MOD-002-001"
parent_module: "MOD-002"
parent_sprint_plan: "MOD-002_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "8.3.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-004", "ENG-005", "ENG-015", "ENG-016", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-032", "ADR-051"]
tags: ["sprint", "prd", "accounting", "mod-002", "foundation", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-002-001 — Accounting Foundation

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-002 Accounting** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-002-001` (permanent) |
| Parent Module | `MOD-002` — Accounting |
| Parent Sprint Plan | [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baseline | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-002-002` … `SPR-MOD-002-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Accounting Foundation** for BusinessOS: the Chart of Accounts (CoA), ledger hierarchy, account classifications and account types, fiscal year and accounting periods, base accounting configuration, currency foundation defaults, opening balance readiness, and audit integration for accounting-foundation lifecycle events. This foundation is the substrate that every subsequent Accounting sprint — vouchers, posting, financial statements, taxation, and period close — depends on.

> **Accounting Ownership Convention.** The Accounting module owns the business semantics of the Chart of Accounts, ledger hierarchy, account classifications, fiscal structure, and accounting master data. ERP Core Engines provide shared infrastructure (identity, audit, configuration, eventing, posting services where applicable) but **MUST NOT** redefine accounting business rules. Downstream modules consume Accounting master data and accounting services rather than introducing independent accounting structures. This complements — and does not replace — the Platform-side conventions established during MOD-001 (Tenant, Event, Configuration, Localization, Audit ownership).

### 1.2 In Scope

- Chart of Accounts (CoA) structure: account groups, ledger accounts, and their hierarchy.
- Account classifications: nature (Asset, Liability, Income, Expense, Equity) and account type taxonomy.
- Fiscal year definition and activation per company.
- Accounting periods: creation, sequencing, and activation within a fiscal year.
- Base accounting configuration: base currency, reporting currency defaults, accounting method, rounding profile — resolved via `ENG-005` under the tenant/company scope established by the Platform baseline.
- Currency foundation defaults: base and reporting currency association with the company.
- Opening balance readiness: the CoA and period structure are ready to receive opening balances (opening balance posting itself is delivered by later sprints, not here).
- Audit integration for every accounting-foundation lifecycle transition via `ENG-004`.
- Events published (see §11): `accountgroup.created`, `accountgroup.updated`, `ledger.created`, `ledger.updated`, `fiscalyear.created`, `accountingperiod.created` — delivered via `ENG-024`.

### 1.3 Out of Scope

Reserved for later Accounting sprints (see [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)):

- Voucher lifecycle, numbering series, approval hooks, and cancellation semantics — `SPR-MOD-002-002`.
- Double-entry posting into the general ledger, journal register, and trial-balance surface — `SPR-MOD-002-003`.
- Financial statements (Trial Balance, P&L, Balance Sheet, Cash Flow) and General Ledger reports — `SPR-MOD-002-004`.
- Tax code master data, tax posting, and compliance datasets — `SPR-MOD-002-005`.
- Period locking, reopening, closing adjustments, retained-earnings roll-forward, and audit review surface — `SPR-MOD-002-006`.
- Cost centres, budgets, sub-ledger reconciliation, and cross-company consolidation — deferred per Module PRD §14.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-002-001`, the following will exist:

- **Business capabilities.**
  - An accounting administrator can create, edit, and archive account groups and ledger accounts under a tenant/company, forming a coherent CoA hierarchy.
  - Account classifications (nature and type) are enforceable on every ledger account.
  - A fiscal year can be defined and activated for a company.
  - Accounting periods can be defined within a fiscal year and activated in sequence.
  - Base and reporting currencies are resolved deterministically per company through `ENG-005`.
  - The CoA and accounting-period structure are ready to receive opening balances (posting itself is out of scope).
- **Published events.** Six accounting-foundation event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions.
- **Configuration artifacts.** Accounting configuration namespace initialized for each company via `ENG-005` (base currency, reporting currency, accounting method, rounding profile). No module-specific keys are registered outside Accounting's own ownership boundary.
- **Audit artifacts.** An audit record exists for every accounting-foundation lifecycle transition, produced via `ENG-004`, in a form consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-002-001`.
  - Accounting-foundation event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-002 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Accounting primitives | Accounting foundation entities and ownership convention |
| §2 Business Scope — Chart of accounts, Period configuration | CoA, ledger hierarchy, account classifications, fiscal year, accounting periods |
| §5 Master Data — Chart of Accounts, Bank Account skeleton | CoA structure and lifecycle; ledger account ownership |
| §7 Business Rules — Account classification invariants | Enforceable account nature/type on every ledger account |
| §10 Configuration — Fiscal calendar, Base/reporting currencies | Accounting configuration namespace initialization via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As an accounting administrator, I want to create account groups and ledger accounts under a company, so that a coherent Chart of Accounts exists before any voucher is created.*
- **US-002.** *As an accounting administrator, I want every ledger account to carry an account nature (Asset, Liability, Income, Expense, Equity) and an account type, so that downstream posting and reporting can rely on deterministic classifications.*
- **US-003.** *As an accounting administrator, I want to define and activate a fiscal year for a company, so that accounting periods can be organized within it.*
- **US-004.** *As an accounting administrator, I want to define accounting periods within a fiscal year and activate them in sequence, so that the company has a valid time structure to post against in later sprints.*
- **US-005.** *As an accounting administrator, I want to configure base and reporting currencies and accounting defaults per company, so that later voucher, posting, and reporting sprints resolve currency and rounding deterministically.*
- **US-006.** *As an accounting administrator, I want to manage the CoA hierarchy (nest groups, move ledgers between groups within allowed rules), so that the structure can be maintained as the business evolves.*
- **US-007.** *As a downstream module (system persona), I want to receive `accountgroup.*`, `ledger.*`, `fiscalyear.*`, and `accountingperiod.*` events, so that I can react to accounting-foundation transitions in a decoupled way.*
- **US-008.** *As a security reviewer, I want every accounting-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the CoA and period history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Chart of Accounts creation (US-001, US-002, US-006)

- **Given** a valid account group creation request under a tenant/company,
  **when** an accounting admin submits it,
  **then** the account group is persisted with a stable identifier, and its name is unique within the company's CoA.
- **Given** a valid ledger account creation request naming a parent account group, an account nature, and an account type,
  **when** an accounting admin submits it,
  **then** the ledger account is persisted with a stable identifier under the specified group, and its classification is immutably attached.
- **Given** an attempt to create a ledger account without an account nature or an account type,
  **when** the request is submitted,
  **then** the request is rejected deterministically and no ledger account is persisted.
- **Given** a valid hierarchy edit that keeps every ledger account under a valid account group with a compatible classification,
  **when** an accounting admin submits it,
  **then** the change is persisted and audited.

### 5.2 Fiscal year (US-003)

- **Given** a valid fiscal year definition (company, start date, end date, label),
  **when** an accounting admin submits it,
  **then** the fiscal year is persisted, non-overlapping with any existing fiscal year for the same company, and a `fiscalyear.created` event is emitted via `ENG-024`.
- **Given** a fiscal year overlap or an invalid date range,
  **when** the request is submitted,
  **then** the request is rejected deterministically and no partial fiscal year state is left behind.

### 5.3 Accounting periods (US-004)

- **Given** an active fiscal year,
  **when** accounting periods are defined within it,
  **then** the periods partition the fiscal year without gaps or overlaps and are sequenced deterministically.
- **Given** a defined accounting period,
  **when** an accounting admin activates it,
  **then** the period becomes active and an `accountingperiod.created` event is emitted via `ENG-024`.

### 5.4 Base accounting configuration (US-005)

- **Given** a company under an active tenant,
  **when** base currency, reporting currency, accounting method, and rounding profile are configured,
  **then** the values resolve deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** an attempted change to base currency after any ledger account references it in a way that would create ambiguity,
  **when** the change is submitted,
  **then** the request is rejected deterministically (opening-balance and posting-time behavior are owned by later sprints and are not weakened here).

### 5.5 Audit integration (US-008)

- **Given** any accounting-foundation lifecycle transition (account group / ledger account / fiscal year / accounting period create or update),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.6 Events (US-007)

- **Given** an accounting-foundation lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any accounting-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-002` — Accounting.
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Chart of accounts, Period configuration), §5 (CoA, Bank Account skeleton), §7 (Classification invariants), §10 (Fiscal calendar, Base/reporting currencies), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-002` MODULE_PRD.
- **Upstream:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (which encapsulates Platform Sprints 001–006). Downstream Accounting sprints and other modules SHOULD reference the baseline rather than individual Platform Sprint PRDs unless sprint-level traceability is specifically required. This reinforces the Stage 3 baseline as the durable inter-module contract established during Pass 8.2.Z.
- **Downstream sprints:** `SPR-MOD-002-002` (Voucher Framework), `SPR-MOD-002-003` (Journal & Ledger Posting), `SPR-MOD-002-004` (Financial Statements), `SPR-MOD-002-005` (Taxation & Compliance Foundation), `SPR-MOD-002-006` (Period Close & Audit) — per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Accounting Ownership Convention in §1.1). See each engine's specification for capability details.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the accounting administrator identity used for foundation lifecycle actions. |
| `ENG-004` Audit | Records every accounting-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves accounting configuration (base currency, reporting currency, accounting method, rounding profile) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-015` Voucher | Read-only contextual reference; the voucher framework is delivered in `SPR-MOD-002-002`, not here. Consumed only for forward-compatibility of CoA references. |
| `ENG-016` Posting | Read-only contextual reference; posting is delivered in `SPR-MOD-002-003`, not here. Consumed only to ensure CoA and period structures are posting-ready. |
| `ENG-024` Eventing | Publishes accounting-foundation events with the contracts declared in §11. |

Accounting business semantics (CoA structure, classification rules, fiscal calendar semantics) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every accounting-foundation read and write. |
| `ADR-012` Tenant Lifecycle | Consumed indirectly via `MOD001_PLATFORM_BASELINE_v1`; accounting foundation lifecycle is scoped to `active` tenants. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to accounting-foundation actions. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for accounting-foundation events. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Account Group | MOD-002 (this sprint) | Node in the CoA hierarchy under a company; owns a set of child groups and/or ledger accounts. |
| Ledger Account | MOD-002 (this sprint) | Leaf posting target in the CoA hierarchy; carries account nature and account type. |
| Account Type | MOD-002 (this sprint) | Taxonomy classifying ledger accounts (e.g. Bank, Cash, Receivable, Payable, Revenue, Expense). |
| Fiscal Year | MOD-002 (this sprint) | Time container per company; owns a contiguous set of accounting periods. |
| Accounting Period | MOD-002 (this sprint) | Sub-interval of a fiscal year; sequencing target for later posting and close. |
| Currency Profile | MOD-002 (this sprint, configuration-scoped) | Base and reporting currency association per company resolved via `ENG-005`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns exactly one active **Chart of Accounts** during any given period.
- An **account group** owns zero or more child account groups and zero or more ledger accounts under the same company.
- A **ledger account** belongs to exactly one account group and carries exactly one account nature and one account type.
- A **fiscal year** belongs to exactly one company and owns a contiguous, non-overlapping set of **accounting periods**.
- A **currency profile** belongs to exactly one company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-002` per the Accounting Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The Bank Account skeleton referenced by MOD-002 MODULE_PRD §5 is owned by Accounting; full bank-reconciliation semantics are out of scope for this sprint.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `accountgroup.created` | MOD-002 | SPR-MOD-002-001 | MOD-002 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant (per `ADR-051`) |
| `accountgroup.updated` | MOD-002 | SPR-MOD-002-001 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `ledger.created` | MOD-002 | SPR-MOD-002-001 | MOD-002 (self), MOD-003 (Sales), MOD-004 (Purchase), MOD-008 (Payables/Receivables), MOD-017 | At-least-once, ordered per tenant |
| `ledger.updated` | MOD-002 | SPR-MOD-002-001 | MOD-002 (self), MOD-003, MOD-004, MOD-008, MOD-017 | At-least-once, ordered per tenant |
| `fiscalyear.created` | MOD-002 | SPR-MOD-002-001 | MOD-002 (self), all downstream modules that operate per fiscal year | At-least-once, ordered per tenant |
| `accountingperiod.created` | MOD-002 | SPR-MOD-002-001 | MOD-002 (self), all downstream modules that operate per accounting period | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Accounting-foundation events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every accounting-foundation read and write.
- [ ] Every accounting-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Accounting configuration namespace is initialized per company via `ENG-005` (base currency, reporting currency, accounting method, rounding profile).
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-002_SPRINT_PLAN.md` §2 (`SPR-MOD-002-001`):

- CoA, ledger hierarchy, and account classifications can be created, edited, and archived under a tenant/company.
- Accounting periods and a fiscal calendar can be defined and activated per company.
- All structural changes are audited via `ENG-004`.
- Base and reporting currencies resolve deterministically through `ENG-005` and `ENG-018`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable). Repository-wide ratification of this vocabulary is queued for a future governance pass and is not performed here.

- **Risk ID:** R-01
  - **Description:** MOD-002 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Vouchers, posting, financials, taxation, and period close are deferred to `SPR-MOD-002-002` … `SPR-MOD-002-006`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and pollute the Foundation.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-012`, `ADR-014`, `ADR-032`, `ADR-051`) are Accepted at authoring time.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Accounting-foundation events rely on `ENG-024` delivery guarantees stated in `ADR-051`.
  - **Impact:** Weakened delivery guarantees would break consumer contracts.
  - **Mitigation:** Consume `ENG-024` per `ADR-051` without redefining delivery semantics; escalate any weakening as an ADR / engine defect.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** The CoA and period structure are prepared to receive opening balances, but opening-balance posting is not delivered here.
  - **Impact:** If posting weakens classification invariants, foundation guarantees are undermined.
  - **Mitigation:** `SPR-MOD-002-003` delivers opening-balance posting on the structure defined here without weakening classification invariants.
  - **Status:** Deferred

- **Risk ID:** R-06
  - **Description:** Base currency changes are constrained deterministically (§5.4).
  - **Impact:** Loosening this constraint would compromise historical currency integrity.
  - **Mitigation:** Surface the constraint at the earliest boundary in implementation; treat any loosening as out of scope for this sprint.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — account group / ledger account validation, classification invariants, fiscal-year and accounting-period sequencing rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, event publication via `ENG-024`.
- **Contract** — accounting-foundation event contracts against the event catalog.
- **End-to-end (smoke)** — CoA creation, fiscal year and period activation, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture used to prove classification and isolation invariants across companies.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling account group and ledger account lifecycles as small state machines so audit emission (§5.5) and event publication (§5.6) are trivially satisfiable at every transition.
- Consider validating fiscal-year non-overlap and accounting-period gap/overlap invariants at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating accounting configuration initialization with company activation events emitted by MOD-001 so the accounting configuration namespace is ready before the first CoA action.
- Consider treating account nature and account type as immutable once any child artifact (voucher, posting) references the ledger — even though those references arrive in later sprints — so the invariant surfaces as a hard rule rather than a soft convention.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-002-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Accounting Foundation — CoA, ledger hierarchy, classifications, fiscal year, accounting periods, base configuration, currency defaults, opening-balance readiness, audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-002` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Accounting Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists vouchers, posting, financials, taxation, and period close, each linked to its owning sprint (`-002` … `-006`).
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-002-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-002-002 Voucher Framework` is the immediate successor per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) §2–§3 and depends only on `SPR-MOD-002-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

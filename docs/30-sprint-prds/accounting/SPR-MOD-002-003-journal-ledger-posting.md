---
title: "SPR-MOD-002-003 — Journal & Ledger Posting"
summary: "Sprint PRD for Journal & Ledger Posting of MOD-002 Accounting: journal entry creation from posted vouchers, ledger posting to General Ledger and sub-ledgers, ledger balance computation per account/tenant/currency/period, posting-time period-state validation (consume-only), and reversal posting semantics. Consumes the Voucher Framework and upstream layers; never redefines them."
layer: "delivery"
owner: "Accounting"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-002-003"
parent_module: "MOD-002"
parent_sprint_plan: "MOD-002_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "8.3.3"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-015", "ENG-016", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-013", "ADR-014", "ADR-015", "ADR-032", "ADR-051", "ADR-053"]
tags: ["sprint", "prd", "accounting", "mod-002", "journal", "ledger", "posting", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-002-003 — Journal & Ledger Posting

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-002 Accounting** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-002-003` (permanent) |
| Parent Module | `MOD-002` — Accounting |
| Parent Sprint Plan | [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Sprint | [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md) — Voucher Framework |
| Upstream Baseline | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-002-004` (Financial Statements), `SPR-MOD-002-005` (Taxation & Compliance), `SPR-MOD-002-006` (Period Close & Audit); every module that consumes accounting movements (MOD-003, MOD-004, MOD-008, MOD-015, MOD-017) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish **Journal & Ledger Posting** for BusinessOS: the canonical translation from a `Posted` accounting voucher (owned by `SPR-MOD-002-002`) into a balanced journal entry, deterministic posting of that journal entry to the General Ledger and applicable sub-ledgers, computation of ledger balances per account / tenant / currency / period, posting-time period-state validation, and reversal posting semantics that never mutate previously posted movements. Every subsequent Accounting sprint — Financial Statements, Taxation, and Period Close — reads the movements this sprint produces.

> **Ledger Posting Ownership Convention.** The Accounting module owns the business semantics of journal entries, ledger posting, and ledger balance computation. ERP Core Engines provide shared infrastructure (posting, currency, reporting, event, audit, authorization) but **MUST NOT** redefine journal or ledger business rules. All accounting movements are produced through this sprint's posting layer; downstream modules consume the resulting movements via authoritative events or repository-approved read services rather than by reading or writing ledger state directly.
>
> **Ledger Immutability Convention.** Posted journal entries and ledger rows are **immutable**. Corrections occur exclusively through reversal journals created via the Voucher Framework; the original journal entries and ledger rows are never mutated or deleted.
>
> **Balance Integrity Rule.** A journal entry is valid only if debits equal credits per tenant per currency. Multi-currency journal entries balance independently within each currency dimension; there is no implicit cross-currency netting at posting time.
>
> **Accounting Period Authority.** Journal & Ledger Posting **consumes** the accounting-period status established by `SPR-MOD-002-001` (Accounting Foundation) and later governed by `SPR-MOD-002-006` (Period Close & Audit). This sprint determines whether posting is permitted based on the current period state but **MUST NOT** define or modify period lifecycle semantics (open, close, reopen, lock). Period lifecycle ownership remains with `SPR-MOD-002-006`.
>
> **Ledger Access Boundary.** Downstream modules consume accounting movements either through authoritative accounting events emitted by this sprint or through repository-approved read services, but **MUST NOT** access or mutate ledger state directly. This preserves the Ledger Immutability Convention and keeps consumer coupling at the contract layer.

These conventions complement — and do not replace — the Accounting Ownership Convention from [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) and the Accounting Voucher Ownership Convention from [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md).

### 1.2 In Scope

- **Journal entry creation from posted vouchers** — every `voucher.posted` event (per `SPR-MOD-002-002` §11) results in exactly one balanced journal entry produced deterministically from the voucher header and lines.
- **Journal entry structure** — journal header (identity, tenant/company, journal date, source voucher reference, currency scope, lifecycle state) and journal lines (ledger account reference, direction, amount, currency, description).
- **Ledger posting** — posting balanced journal entries to the **General Ledger** and, where the ledger account participates in one, its **sub-ledger** (per the account classification established in `SPR-MOD-002-001`).
- **Ledger balance computation** — running balances per **account × tenant × company × currency × accounting period**, updated deterministically on every posting.
- **Posting-time period-state validation (consume-only)** — posting is refused if the target accounting period is not in an open state; period state is read from the source of truth established by `SPR-MOD-002-001` (Accounting Foundation).
- **Reversal posting semantics** — when a reversal voucher reaches `Posted` (per `SPR-MOD-002-002`), a new journal entry with reversed directions is produced and posted; the original journal entry and its ledger rows are never mutated. The Reversal Link established by `SPR-MOD-002-002` is preserved at the journal layer.
- **Multi-currency posting** — journal entries and ledger balances retain the source currency; conversion utilities are **consumed** via `ENG-018` and not redefined here.
- **Authorization** — every posting action is authorized via `ENG-002` under the caller's tenant/company/role context.
- **Audit** — every posting action produces an audit record via `ENG-004`.
- **Events published** (see §11) — `journal.created`, `journal.posted`, `journal.reversed`, `ledger.posted`, `ledger.reversed` — delivered via `ENG-024`. Names conform to the repository-wide Event Catalog and the single-entity dotted namespace precedent set by `SPR-MOD-002-002`.

### 1.3 Out of Scope

Reserved for later Accounting sprints (see [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)):

- **Financial statements** — Trial Balance, Profit & Loss, Balance Sheet, Cash Flow. Delivered by `SPR-MOD-002-004`.
- **Tax computation and tax posting** — tax lines on journal entries, tax accounts, and statutory tax reports. Delivered by `SPR-MOD-002-005`.
- **Period lifecycle** — opening, closing, locking, reopening, and closing adjustments for accounting periods. Delivered by `SPR-MOD-002-006`. This sprint reads period state and refuses posting into non-open periods but does not define lifecycle transitions.
- **Consolidation and cross-company reporting**, **cost centres, budgets, and sub-ledger reconciliation beyond posting** — deferred per Module PRD §14.
- **Voucher lifecycle, voucher types, numbering, approval, and reversal-voucher creation** — owned by `SPR-MOD-002-002`. This sprint reacts to voucher-lifecycle outcomes and does not re-declare them.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-002-003`, the following will exist:

- **Business capabilities.**
  - Every `Posted` voucher produces exactly one balanced journal entry.
  - Debits equal credits per tenant per currency for every journal entry.
  - Journal entries post deterministically to the General Ledger and, where applicable, to sub-ledgers.
  - Ledger balances are computed per account × tenant × company × currency × accounting period.
  - Posting is refused when the target period is not in an open state (consumed signal only).
  - Reversal vouchers produce reversal journals; original journal entries and ledger rows are never mutated.
- **Cross-module contract.**
  - Source-module documents continue to enter Accounting exclusively through the Voucher Framework (`SPR-MOD-002-002`). This sprint adds no alternative entry point.
  - **Downstream modules access accounting movements exclusively through the authoritative accounting events listed in §11 or through repository-approved read services. Direct access to or mutation of ledger state is refused deterministically at the Accounting boundary.**
- **Published events.** Five posting-lifecycle event contracts (see §11) registered in the event catalog and emitted by the corresponding transitions.
- **Audit artifacts.** An audit record exists for every posting action (journal creation, journal posting, ledger posting, reversal), produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-002-003`.
  - Posting-lifecycle event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-002 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — General ledger and journal posting | Journal entry creation and ledger posting from `Posted` vouchers |
| §4 Business Processes — Posting and ledger update | Deterministic posting pipeline and balance computation |
| §6 Transactions — Posting semantics | Balanced journal entry per posted voucher, immutable after posting |
| §7 Business Rules — Debit equals credit | Balance Integrity Rule enforced at the journal boundary |
| §7 Business Rules — Reversal creates a new entry; original never mutated | Reversal journal produced from reversal voucher; ledger rows immutable |
| §7 Business Rules — A closed period cannot be posted into | Posting-time period-state validation (consume-only) |
| §8 Multi-Currency | Journal entries and balances retain source currency; conversion via `ENG-018` |
| §10 Configuration — Accounts, periods, currency scope | Consumed from `SPR-MOD-002-001` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As an accountant, I want every `Posted` voucher to produce exactly one balanced journal entry, so that the ledger reflects every accounting transaction that entered through the Voucher Framework.*
- **US-002.** *As a controller, I want journal entries to be rejected when debits do not equal credits per tenant per currency, so that ledger integrity is preserved at the point of entry.*
- **US-003.** *As an accountant, I want journal entries to post deterministically to the General Ledger and to the appropriate sub-ledger where the ledger account participates in one, so that account movements are captured in the correct ledgers.*
- **US-004.** *As a controller, I want ledger balances computed per account × tenant × company × currency × accounting period, so that downstream reporting reads consistent movement totals.*
- **US-005.** *As an accountant, I want posting into a non-open accounting period to be refused deterministically, so that closed-period integrity is preserved without ambiguity.*
- **US-006.** *As a controller, I want a reversal voucher to produce a reversal journal that leaves the original journal entry and ledger rows unchanged, so that corrections are traceable and never destructive.*
- **US-007.** *As a downstream module (system persona), I want to consume accounting movements exclusively through authoritative events or approved read services, so that ledger state remains encapsulated inside the Accounting module.*
- **US-008.** *As a security reviewer, I want every posting action authorized via `ENG-002` and audited via `ENG-004`, so that ledger changes can be reconstructed from an authoritative log.*
- **US-009.** *As a platform administrator, I want posted journal entries and ledger rows to be immutable, so that ledger state cannot be silently altered outside the reversal path.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Journal creation from posted vouchers (US-001)

- **Given** a voucher that reaches the `Posted` state per `SPR-MOD-002-002`,
  **when** the posting pipeline runs,
  **then** exactly one journal entry is created with a stable identifier, header derived from the voucher, and lines derived deterministically from the voucher lines, and a `journal.created` event is emitted via `ENG-024`.

### 5.2 Balance integrity (US-002)

- **Given** any journal entry,
  **when** it is validated for posting,
  **then** the total debit equals the total credit **per tenant per currency**, and any imbalance results in a deterministic refusal with no ledger effect and no `journal.posted` event.

### 5.3 Ledger posting to General Ledger and sub-ledgers (US-003)

- **Given** a balanced journal entry,
  **when** it is posted,
  **then** each line produces exactly one General Ledger movement and, where the referenced ledger account participates in a sub-ledger per its classification (per `SPR-MOD-002-001`), exactly one corresponding sub-ledger movement, and a `ledger.posted` event is emitted for the journal.

### 5.4 Balance computation (US-004)

- **Given** a successful ledger posting,
  **when** it completes,
  **then** ledger balances are updated deterministically per **account × tenant × company × currency × accounting period**, and subsequent reads reflect the new balances.

### 5.5 Period-state validation (US-005)

- **Given** a posting request whose target accounting period is not in an **open** state,
  **when** it is submitted,
  **then** posting is refused deterministically, no journal is posted, no ledger row is written, and neither `journal.posted` nor `ledger.posted` is emitted.
- **Given** the same posting request,
  **when** posting is refused,
  **then** the refusal is audited via `ENG-004` with the actor, tenant/company scope, journal identifier, target period, and refusal reason; **period lifecycle is not modified**.

### 5.6 Reversal posting (US-006, US-009)

- **Given** a reversal voucher (per `SPR-MOD-002-002`) that reaches `Posted`,
  **when** the posting pipeline runs,
  **then** a **reversal journal** is created with reversed directions, posted to the ledger, and linked to the original journal via the Reversal Link, and events `journal.reversed` and `ledger.reversed` are emitted.
- **Given** the original journal entry and its ledger rows,
  **when** a reversal is posted,
  **then** the original journal entry and ledger rows are **not mutated** in any way.

### 5.7 Ledger immutability (US-009)

- **Given** a posted journal entry or ledger row,
  **when** any modification is attempted outside the reversal path,
  **then** the request is refused deterministically and no state change occurs.

### 5.8 Ledger access boundary (US-007)

- **Given** a downstream module (system persona) attempting to read or write ledger state directly,
  **when** the attempt occurs,
  **then** it is refused deterministically at the Accounting boundary. Downstream consumption is allowed only via the events in §11 or via repository-approved read services.

### 5.9 Authorization and audit (US-008)

- **Given** any posting action (`journal.created`, `journal.posted`, `journal.reversed`, `ledger.posted`, `ledger.reversed`),
  **when** it completes,
  **then** the action is authorized via `ENG-002` under the caller's tenant/company/role context and an audit record is produced via `ENG-004` containing the actor, tenant/company scope, journal identifier, action type, and timestamp.

### 5.10 Events

- **Given** a posting-lifecycle action listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog, using the names in §11.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any journal or ledger read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-002` — Accounting.
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (General ledger and journal posting), §4 (Posting and ledger update), §6 (Posting semantics), §7 (Debit-equals-credit, reversal, closed-period rules), §8 (Multi-currency), §10 (Configuration consumed), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-002` MODULE_PRD.
- **Upstream sprint:** [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md) — Voucher Framework. Required: canonical voucher lifecycle, voucher types, immutability after posting, reversal semantics, and voucher-lifecycle events.
- **Upstream sprint (transitive):** [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) — Accounting Foundation. Required master data: Chart of Accounts, ledger accounts, account classifications, fiscal year, accounting periods, base accounting configuration, and period state.
- **Upstream baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (which encapsulates Platform Sprints 001–006). Individual Platform Sprint PRDs are cited only where sprint-level traceability is specifically required. This reinforces the Stage 3 baseline as the durable inter-module contract established during Pass 8.2.Z.
- **Downstream sprints:** `SPR-MOD-002-004` (Financial Statements — reads ledger balances), `SPR-MOD-002-005` (Taxation & Compliance — reads posted journals and adds tax lines under its own scope), `SPR-MOD-002-006` (Period Close & Audit — governs period lifecycle consumed here) — per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Downstream modules:** MOD-003 Sales, MOD-004 Purchase, MOD-008 Payroll, MOD-015 POS, MOD-017 Analytics — all consume accounting movements via the events in §11 or approved read services.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Ledger Posting Ownership Convention in §1.1). Engine identifiers below match the authoritative entries in [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md) and [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md); no new identifiers are introduced here.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Authorizes every posting action against the actor's tenant/company/role context. |
| `ENG-004` Audit | Records every posting action, including refusals for period-state and immutability violations. |
| `ENG-015` Voucher | Provides the shared voucher abstraction whose `Posted` state triggers the posting pipeline. |
| `ENG-016` Posting | Provides the shared posting infrastructure consumed to produce journal and ledger movements. Accounting posting business semantics remain owned by this sprint. |
| `ENG-018` Currency | Provides currency scope handling and conversion utilities consumed by multi-currency posting; not redefined here. |
| `ENG-021` Reporting | Provides read-side infrastructure for balance queries used by approved read services. |
| `ENG-024` Eventing | Publishes posting-lifecycle events with the contracts declared in §11. |

Accounting posting business semantics (journal balance integrity, ledger immutability, reversal-creates-new-journal, period-state consumption, ledger access boundary) are owned by this sprint and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every journal and ledger read and write. |
| `ADR-013` Persistence & Transactionality | Authoritative persistence contract for atomic posting of journal and ledger effects. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-015` Idempotency | Authoritative idempotency model applied to posting from voucher-lifecycle events. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to posting actions. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for posting-lifecycle events. |
| `ADR-053` Multi-Currency Handling | Authoritative multi-currency model consumed by journal and ledger posting. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Journal Entry | MOD-002 (this sprint) | Canonical accounting movement record produced from a `Posted` voucher; carries identity, header metadata, source voucher reference, and lifecycle state. |
| Journal Line | MOD-002 (this sprint) | Line-level movement under a journal entry (ledger account reference, direction, amount, currency, description). |
| Ledger Movement | MOD-002 (this sprint) | Individual General Ledger row produced by posting a journal line. |
| Sub-Ledger Movement | MOD-002 (this sprint) | Sub-ledger row produced when the referenced ledger account participates in a sub-ledger per its classification. |
| Ledger Balance | MOD-002 (this sprint) | Running balance per account × tenant × company × currency × accounting period. |
| Journal Reversal Link | MOD-002 (this sprint) | Directed reference from a reversal journal to the original posted journal; preserves the Reversal Link established at the voucher layer. |

### 10.2 Relationships

- A **journal entry** references exactly one source voucher (from `SPR-MOD-002-002`) and belongs to exactly one tenant / company.
- A **journal entry** owns one or more **journal lines**.
- A **journal line** references exactly one ledger account owned by `SPR-MOD-002-001` and produces exactly one General Ledger **ledger movement** on posting, plus at most one **sub-ledger movement** where the ledger account participates in a sub-ledger.
- A **ledger balance** is uniquely identified by account × tenant × company × currency × accounting period and is updated by ledger movements.
- A **journal reversal link** references exactly one original posted journal and exactly one reversal journal.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-002` per the Ledger Posting Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Vouchers referenced by journal entries are owned by `SPR-MOD-002-002`.
- Ledger accounts, fiscal year, and accounting periods referenced here are owned by `SPR-MOD-002-001`.
- Period lifecycle (open, close, reopen, lock) is owned by `SPR-MOD-002-006`; this sprint consumes period state without modifying it.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`. Event names use the single-entity dotted namespace established by `SPR-MOD-002-002` (`voucher.created`, `voucher.posted`, `voucher.reversed`) so that the Accounting event vocabulary remains consistent across sprints. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `journal.created` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant (per `ADR-051`) |
| `journal.posted` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self), MOD-003, MOD-004, MOD-008, MOD-015, MOD-017 | At-least-once, ordered per tenant |
| `journal.reversed` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self), MOD-003, MOD-004, MOD-008, MOD-015, MOD-017 | At-least-once, ordered per tenant |
| `ledger.posted` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `ledger.reversed` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Exact event names are aligned with the authoritative event catalog; if the catalog uses a variant, the catalog wins and this PRD is corrected in the same change.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Every `Posted` voucher produces exactly one balanced journal entry.
- [ ] Debits equal credits per tenant per currency for every posted journal entry.
- [ ] Journal entries post deterministically to the General Ledger and, where applicable, to the correct sub-ledger.
- [ ] Ledger balances are computed per account × tenant × company × currency × accounting period.
- [ ] Posting into a non-open period is refused deterministically; period lifecycle is not modified.
- [ ] Posted journal entries and ledger rows are immutable; corrections occur exclusively through reversal journals.
- [ ] The Ledger Access Boundary is enforced: no module reads or writes ledger state directly.
- [ ] Posting-lifecycle events are registered in the event catalog with their contracts and are emitted on the corresponding transitions, using the names in §11.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every journal and ledger read and write.
- [ ] Every posting action produces an audit record via `ENG-004`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-002_SPRINT_PLAN.md` §2 (`SPR-MOD-002-003`):

- Every `Posted` voucher produces exactly one balanced journal entry with debits equal to credits per tenant per currency.
- Journal entries post to the General Ledger and, where applicable, to the correct sub-ledger, with ledger balances updated per account × tenant × company × currency × accounting period.
- Posting into a non-open accounting period is refused deterministically; period lifecycle is not modified by this sprint.
- Reversal vouchers produce reversal journals; original journal entries and ledger rows are never mutated.
- Posting-lifecycle events (§11) are emitted via `ENG-024`; every posting action is authorized via `ENG-002` and audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **R1 — Upstream sprint dependency.** This sprint assumes `SPR-MOD-002-002` (Voucher Framework) is `Done` and voucher-lifecycle events are emitted reliably. Any regression in voucher lifecycle or immutability blocks this sprint.
- **R2 — Transitive upstream dependency.** Assumes `SPR-MOD-002-001` (Accounting Foundation) master data — Chart of Accounts, account classifications, fiscal year, accounting periods, and period state — is available under every tenant / company that participates in this sprint's smoke fixtures.
- **R3 — Platform baseline dependency.** Assumes `MOD001_PLATFORM_BASELINE_v1` is frozen and available for tenancy, users/roles/permissions, configuration hierarchy, and audit review. Any regression against that baseline blocks this sprint.
- **R4 — Downstream deferrals.** Financial statements, tax computation and posting, and period lifecycle are deferred to `SPR-MOD-002-004`, `SPR-MOD-002-005`, and `SPR-MOD-002-006`. Assumption: these deferrals hold; this sprint does not silently absorb their scope. In particular, period-close semantics remain owned by `SPR-MOD-002-006`.
- **R5 — Posting engine contract.** `ENG-016` Posting is consumed as shared infrastructure. Assumption: its contract accepts the journal shape defined here without weakening immutability, balance integrity, or reversal semantics.
- **R6 — Currency engine contract.** `ENG-018` Currency is consumed for multi-currency conversion. Assumption: currency scope and conversion utilities are stable and do not implicitly cross-currency-net journal entries at posting time.
- **R7 — ADR acceptance.** All referenced ADRs (`ADR-011`, `ADR-013`, `ADR-014`, `ADR-015`, `ADR-032`, `ADR-051`, `ADR-053`) are Accepted at authoring time. If any becomes non-Accepted, this sprint is re-planned.
- **R8 — Event delivery.** Posting-lifecycle events rely on `ENG-024` delivery guarantees stated in `ADR-051`. Assumption: those guarantees hold; this sprint does not redefine them.
- **R9 — Ledger access boundary enforcement.** Downstream modules will consume accounting movements only via events or approved read services. Framework-level refusal of direct ledger access is required (§5.8).
- **R10 — Idempotency.** Posting is triggered by voucher-lifecycle events; delivery is at-least-once. Assumption: posting is idempotent per `ADR-015`, so retries produce no duplicate journal entries or ledger rows.

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — journal balance integrity, ledger immutability enforcement, reversal journal creation, period-state refusal logic, idempotency of posting-from-event.
- **Integration** — posting pipeline against `ENG-015`/`ENG-016`, multi-currency posting via `ENG-018`, audit emission via `ENG-004`, authorization via `ENG-002`, event publication via `ENG-024`.
- **Contract** — posting-lifecycle event contracts against the event catalog; Ledger Access Boundary against downstream module system personas.
- **End-to-end (smoke)** — voucher creation → validation → posting → journal posted → ledger balance updated → reversal voucher → reversal journal posted, under a two-tenant / two-company / multi-currency smoke fixture to verify `ADR-011` isolation, balance integrity per currency, and immutability.

Sprint-specific fixtures: a two-company fixture with pre-seeded CoA, ledger accounts with sub-ledger classifications, fiscal year, accounting periods in mixed open/closed states, and numbering series per voucher type (produced by `SPR-MOD-002-001` and `SPR-MOD-002-002` foundation seeds).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider driving journal creation from the `voucher.posted` event with idempotency keyed to the voucher identifier, so at-least-once delivery does not produce duplicate journal entries.
- Consider enforcing debit-equals-credit at the journal boundary before invoking `ENG-016`, so imbalance is refused before any ledger effect is attempted.
- Consider computing ledger balances as a projection over posted movements so the balance layer remains a strict function of the immutable ledger and requires no in-place updates.
- Consider consulting the period-state signal exactly once per posting transaction so decisions are consistent across the journal and ledger effects within a single atomic operation.
- Consider surfacing the Ledger Access Boundary as an explicit read/write gate so any caller attempting to bypass events or approved read services is refused with a deterministic error.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-002-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish Journal & Ledger Posting — journal creation from posted vouchers, ledger posting to GL and sub-ledgers, balance computation, period-state consumption, and reversal posting (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-002` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Ledger Posting Ownership Convention (§1.1) with "consumed, not redefined" language; engine identifiers match the authoritative catalog verbatim; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists financial statements, tax, period lifecycle, consolidation, and voucher lifecycle, each linked to its owning sprint (`-001`, `-002`, `-004`, `-005`, `-006`).
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes, including balance integrity, ledger immutability, reversal-creates-new-journal, period-state refusal, and Ledger Access Boundary enforcement.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-002-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-002-004 Financial Statements` is the immediate successor per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) §2–§3 and depends on the ledger balances this sprint produces.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-002-002-voucher-framework.md`](./SPR-MOD-002-002-voucher-framework.md)
- Transitive Upstream Sprint PRD — [`./SPR-MOD-002-001-accounting-foundation.md`](./SPR-MOD-002-001-accounting-foundation.md)
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

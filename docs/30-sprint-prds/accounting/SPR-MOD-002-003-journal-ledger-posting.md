---
title: "SPR-MOD-002-003 — Journal & Ledger Posting"
summary: "Sprint PRD for Journal & Ledger Posting of MOD-002 Accounting: canonical translation of Posted vouchers into balanced double-entry journal entries, idempotent ledger projection with running balances, multi-currency posting at the voucher's captured rate, reversal-produces-inverse semantics, ledger immutability, closed-period contract, and authoritative accounting-movement events. Consumes upstream layers; never redefines them."
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
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-015", "ENG-016", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-013", "ADR-014", "ADR-032", "ADR-051", "ADR-053"]
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
| Upstream Sprints | [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md), [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md) |
| Upstream Baseline | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-002-004` … `SPR-MOD-002-006`; all downstream financial reporting and analytics modules |

---

## 1. Objective and Scope

### 1.1 Objective

Define *what happens after a voucher is posted*: the canonical translation of every `Posted` voucher (produced by [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md)) into a balanced double-entry **journal entry**, its idempotent projection onto per-account **ledgers** with running balances, multi-currency posting at the voucher's captured exchange rate, reversal-produces-inverse semantics, ledger immutability, a read-only contract with the closed-period signal, and the authoritative accounting-movement events consumed by every downstream financial and reporting module.

> **Ledger Posting Ownership Convention.** The Accounting module owns the translation of `Posted` vouchers into journal entries and ledger movements. No other module may write to accounting ledgers directly. Downstream modules consume accounting movements by subscribing to the events published here (§11) or by reading through `ENG-021` Reporting; they MUST NOT project their own ledger state. This complements — and does not replace — the Accounting Ownership Convention (`SPR-MOD-002-001`) or the Accounting Voucher Ownership Convention and Sole Entry Point clause (`SPR-MOD-002-002`).
>
> **Balance Integrity Rule.** A journal entry is valid only if debits equal credits **per tenant per currency**. This invariant is a platform-wide accounting invariant and cannot be relaxed by any downstream Accounting sprint or by any consuming module.
>
> **Ledger Immutability Convention.** Once posted, ledger entries are immutable. Corrections flow exclusively through the reversal voucher path established by `SPR-MOD-002-002`, which produces new **inverse** ledger entries; historical entries are never mutated or deleted.
>
> **Authoritative Accounting Movement Events.** `journal.entry.created`, `ledger.posted`, and `ledger.reversed` are the authoritative accounting-movement events consumed by `SPR-MOD-002-004` Financial Statements, `SPR-MOD-002-005` Taxation & Compliance, `SPR-MOD-002-006` Period Close & Audit, and downstream reporting / analytics modules. Reporting consumes these events rather than source-document events.

### 1.2 In Scope

- **Journal Entry Model** — balanced debit/credit lines derived deterministically from a `Posted` voucher; tenant-scoped, company-scoped, and currency-aware; carries a stable reference back to the originating voucher.
- **Chart of Accounts consumption** — every journal line's account reference MUST resolve to an active ledger account owned by `SPR-MOD-002-001`. Unresolvable or inactive accounts cause posting to fail deterministically with no partial state.
- **Ledger Posting** — idempotent projection of journal entries onto per-account ledgers with running balances at the company / account / currency granularity.
- **Balance Integrity enforcement** — the Balance Integrity Rule is enforced at journal-entry creation; unbalanced entries are rejected with structured errors and no ledger state is written.
- **Posting Determinism & Idempotency** — repeating the posting request for the same `Posted` voucher (identified by its stable voucher identifier) produces the same journal entry and the same ledger state exactly once, per `ADR-053` idempotency.
- **Reversal Semantics** — reversal vouchers (defined in `SPR-MOD-002-002`) produce **inverse** journal entries and **inverse** ledger movements. The original journal entry and ledger entries remain immutable; a Reversal Link references the original.
- **Multi-Currency Posting** — foreign-currency vouchers post at the voucher's captured exchange rate; base-currency equivalents are **derived once** at posting via `ENG-018` and stored on the ledger movement. Reads never re-compute base-currency amounts at query time.
- **Period-Awareness (read-only)** — posting reads the open/closed period signal owned by `SPR-MOD-002-006`. A request to post into a closed period is refused deterministically at this sprint's boundary. Period close, lock, and reopening semantics are **not** owned here.
- **Cross-module refusal** — any attempt to write to accounting ledgers outside the Voucher → Journal → Ledger path is refused deterministically at this sprint's boundary, reinforcing the Sole Entry Point clause from `SPR-MOD-002-002`.
- **Audit integration** — every posting action (journal creation, ledger posting, ledger reversal) is audited via `ENG-004`.
- **Events published** (see §11) — `journal.entry.created`, `ledger.posted`, `ledger.reversed` — delivered via `ENG-024`.

### 1.3 Out of Scope

Reserved for later Accounting sprints (see [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)) and other modules:

- **Financial Statements** (Trial Balance, P&L, Balance Sheet, Cash Flow) — `SPR-MOD-002-004`.
- **Tax computation and jurisdictional rules on postings** — `SPR-MOD-002-005`. This sprint carries the tax amounts captured on voucher lines through to ledger lines but does not compute tax.
- **Period close, lock, reopening, and closing adjustments** — `SPR-MOD-002-006`. Only the read-only closed-period signal is consumed here.
- **Redefinition of voucher lifecycle, entry-point ownership, or the cross-module voucher contract** — owned by `SPR-MOD-002-002`.
- **Sub-ledger reconciliation, cost centres, budgets, cross-company consolidation** — deferred per Module PRD §14.
- **Downstream analytical projections** — reporting, dashboards, and analytics modules subscribe to the events in §11 but do not extend the ledger.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-002-003`, the following will exist:

- **Business capabilities.**
  - Every `Posted` voucher from `SPR-MOD-002-002` produces exactly one balanced journal entry and exactly one set of ledger movements per tenant per currency.
  - Ledger movements carry running balances at the company / account / currency granularity; base-currency equivalents are derived once at posting and stored on the movement.
  - Reversal vouchers produce inverse journal entries and inverse ledger movements; the original entries remain immutable.
  - Posting is idempotent per `ADR-053`: replaying the same request for the same voucher produces the same state exactly once.
  - Posting into a closed accounting period is refused deterministically, without partial state.
  - Any attempt to write to ledgers outside the Voucher → Journal → Ledger path is refused at this sprint's boundary.
- **Published events.** Three authoritative accounting-movement events (`journal.entry.created`, `ledger.posted`, `ledger.reversed`) registered in the event catalog and emitted on the corresponding transitions.
- **Audit artifacts.** An audit record exists for every posting action, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-002-003`.
  - Accounting-movement event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-002 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Journals, general ledger, running balances | Journal entry model + ledger projection |
| §6 Transactions — Posting outcome of every voucher type | Deterministic Voucher → Journal → Ledger translation |
| §7 Business Rules — Debits equal credits per tenant per currency | Balance Integrity Rule enforced at journal creation |
| §7 Business Rules — Reversal creates inverse entries; originals never mutated | Inverse posting and Ledger Immutability Convention |
| §7 Business Rules — A closed period cannot be posted into | Read-only closed-period contract at posting boundary |
| §7 Business Rules — Multi-currency uses the voucher's captured rate | FX handled via `ENG-018` at posting; base amount stored once |
| §10 Configuration — Base currency, fiscal year, accounting periods | Consumed via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As an accountant, I want a `Posted` voucher to produce a balanced journal entry automatically, so that the accounting effect of every transaction reaches the ledger without manual intervention.*
- **US-002.** *As a controller, I want unbalanced journal entries to be rejected outright, so that ledger integrity cannot be silently compromised.*
- **US-003.** *As an operator, I want repeating the same posting request to produce the same ledger state exactly once, so that retries and replays are safe.*
- **US-004.** *As an accountant, I want ledger movements to carry running balances at company / account / currency granularity, so that account balances are queryable without recomputing history.*
- **US-005.** *As a controller, I want a reversal voucher to produce inverse ledger movements rather than mutating the original entries, so that corrections preserve the historical record.*
- **US-006.** *As an accountant working in a foreign currency, I want each posting to record base-currency equivalents once at the voucher's captured rate, so that base-currency reads are deterministic and stable.*
- **US-007.** *As a controller, I want posting into a closed period to be refused deterministically, so that closed-period integrity is preserved regardless of the caller.*
- **US-008.** *As a downstream reporting module (system persona), I want to consume authoritative accounting-movement events, so that I never have to re-derive movements from source documents.*
- **US-009.** *As a security reviewer, I want every posting action to be audited via `ENG-004`, so that ledger history is reconstructible from an authoritative log.*
- **US-010.** *As a platform administrator, I want direct writes to accounting ledgers by any non-Accounting caller to be refused deterministically, so that the Sole Entry Point clause from `SPR-MOD-002-002` is enforced end-to-end.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Voucher → Journal translation (US-001)

- **Given** a `Posted` voucher whose lines reference active ledger accounts under `SPR-MOD-002-001` master data,
  **when** posting executes,
  **then** exactly one journal entry is produced, referencing the originating voucher, with debit and credit lines derived deterministically from the voucher lines.
- **Given** a `Posted` voucher whose lines reference an unknown or inactive ledger account,
  **when** posting executes,
  **then** the request is refused deterministically, no journal entry is created, and no ledger state is written.

### 5.2 Balance Integrity (US-002)

- **Given** a candidate journal entry,
  **when** its debit total does not equal its credit total per tenant per currency,
  **then** it is rejected with a structured error and no ledger state is written.
- **Given** any downstream sprint or module attempting to relax the Balance Integrity Rule,
  **when** it does so,
  **then** the framework refuses the operation; the rule is not configurable.

### 5.3 Idempotency and determinism (US-003)

- **Given** the same posting request for the same `Posted` voucher identifier repeated any number of times,
  **when** each replay executes,
  **then** the resulting journal entry and ledger movements are identical to the first successful execution and are applied exactly once, per `ADR-053`.
- **Given** two callers submitting the same posting request concurrently,
  **when** both execute,
  **then** at most one journal entry and one set of ledger movements exist for the voucher.

### 5.4 Ledger projection and running balances (US-004)

- **Given** a successful journal entry,
  **when** it is projected onto ledgers,
  **then** exactly one ledger movement is written per journal line, and the running balance at the company / account / currency granularity is updated deterministically.
- **Given** a ledger read at the company / account / currency granularity,
  **when** it executes,
  **then** it returns the last stored running balance without recomputing history.

### 5.5 Reversal semantics (US-005)

- **Given** a reversal voucher (produced by `SPR-MOD-002-002`) that references an original `Posted` voucher,
  **when** posting executes for the reversal,
  **then** an **inverse** journal entry and **inverse** ledger movements are produced, referencing the original journal entry via a Reversal Link, and the original entries remain unchanged.
- **Given** any request to mutate an existing ledger entry directly,
  **when** it occurs,
  **then** it is refused deterministically (Ledger Immutability Convention).

### 5.6 Multi-currency posting (US-006)

- **Given** a `Posted` voucher in a currency other than the company's base currency, with an exchange rate captured on the voucher,
  **when** posting executes,
  **then** every ledger movement stores both the transaction-currency amount and the base-currency amount derived via `ENG-018` using the voucher's captured rate.
- **Given** a subsequent read of the ledger movement,
  **when** it executes,
  **then** the stored base-currency amount is returned unchanged; base-currency amounts are not recomputed at read time.

### 5.7 Closed-period contract (US-007)

- **Given** a `Posted` voucher whose voucher date falls in a period marked closed by `SPR-MOD-002-006`,
  **when** posting executes,
  **then** the request is refused deterministically, no journal entry is created, and no ledger state is written.
- **Given** a request to reopen or close a period,
  **when** it occurs,
  **then** it is delegated to `SPR-MOD-002-006`; this sprint does not own period lifecycle.

### 5.8 Authoritative accounting-movement events (US-008)

- **Given** a successful journal entry creation,
  **when** it completes,
  **then** a `journal.entry.created` event is published via `ENG-024` per the contract in the event catalog.
- **Given** a successful ledger projection,
  **when** it completes,
  **then** a `ledger.posted` event is published.
- **Given** a successful reversal ledger projection,
  **when** it completes,
  **then** a `ledger.reversed` event is published, referencing the original journal entry via the Reversal Link.

### 5.9 Audit integration (US-009)

- **Given** any posting action (journal creation, ledger posting, ledger reversal, refusal),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant / company scope, voucher identifier, action, outcome, and timestamp.

### 5.10 Sole-entry-point enforcement (US-010)

- **Given** any caller attempting to write to accounting ledgers outside the Voucher → Journal → Ledger path,
  **when** the write is attempted,
  **then** it is refused deterministically at this sprint's boundary, reinforcing the Sole Entry Point clause established in `SPR-MOD-002-002`.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any journal or ledger read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant / company scope; no cross-tenant read or write can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-002` — Accounting.
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Journals and general ledger), §6 (Transactions — posting outcome), §7 (Business rules — balance integrity, reversal, closed-period, multi-currency), §10 (Configuration — base currency, fiscal year, accounting periods), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-002` MODULE_PRD.
- **Upstream sprints:**
  - [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) — Chart of Accounts, ledger accounts, account classifications, fiscal year, accounting periods, base currency, base accounting configuration.
  - [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md) — the Voucher Framework as the sole entry point; posted-voucher immutability; reversal semantics at voucher level.
- **Upstream baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), encapsulating Platform Sprints 001–006. Individual Platform Sprint PRDs are cited only where sprint-level traceability is specifically required.
- **Downstream sprints:** `SPR-MOD-002-004` (Financial Statements), `SPR-MOD-002-005` (Taxation & Compliance Foundation), `SPR-MOD-002-006` (Period Close & Audit) — per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Downstream modules:** reporting and analytics modules (MOD-017 Analytics) and every module that consumes accounting movements consume the events in §11 rather than the source documents that produced them.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Ledger Posting Ownership Convention in §1.1). See each engine's specification for capability details.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Authorizes every posting action against the actor's tenant / company / role context. |
| `ENG-004` Audit | Records every posting action (journal creation, ledger posting, ledger reversal, refusal). |
| `ENG-005` Configuration | Resolves tenant-scoped accounting configuration (base currency, fiscal year, accounting periods, closed-period signal). |
| `ENG-015` Voucher | Provides `Posted` vouchers as inputs; voucher business semantics remain owned by `SPR-MOD-002-002`. |
| `ENG-016` Posting | Provides the shared posting capability (balanced-entry construction, idempotent projection) consumed by this sprint. Accounting posting business semantics remain owned here. |
| `ENG-018` Currency | Applies the voucher's captured exchange rate to derive base-currency amounts once at posting. |
| `ENG-021` Reporting | Consumed on the **read side** by downstream sprints and modules for ledger reads; not extended here. |
| `ENG-024` Eventing | Publishes accounting-movement events with the contracts declared in §11. |

Accounting posting business semantics (Balance Integrity Rule, Ledger Immutability Convention, reversal-produces-inverse, closed-period contract at posting boundary, sole-entry-point enforcement) are owned by this sprint and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every journal and ledger read and write. |
| `ADR-013` Money Representation | Authoritative money-value contract for transaction-currency and base-currency amounts on journal and ledger entries. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every posting action. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for accounting-movement events. |
| `ADR-053` Idempotency | Authoritative idempotency contract; posting is idempotent per this ADR. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Journal Entry | MOD-002 (this sprint) | Balanced double-entry record derived from a `Posted` voucher; references the originating voucher. |
| Journal Line | MOD-002 (this sprint) | Debit or credit line on a journal entry; references exactly one ledger account. |
| Ledger Movement | MOD-002 (this sprint) | Per-account projection of a journal line, carrying transaction-currency and base-currency amounts and the running balance at the company / account / currency granularity. |
| Ledger Running Balance | MOD-002 (this sprint) | Deterministic running balance at company / account / currency granularity, updated on every ledger movement. |
| Reversal Link (Ledger) | MOD-002 (this sprint) | Directed reference from a reversal journal entry to the original journal entry; enables inverse posting without mutation. |
| Posting Idempotency Key | MOD-002 (this sprint) | Per-voucher key that guarantees exactly-once posting per `ADR-053`. |

### 10.2 Relationships

- A **journal entry** belongs to exactly one tenant / company and references exactly one originating voucher.
- A **journal entry** owns one or more **journal lines**; the entry is valid only if debits equal credits per tenant per currency.
- A **journal line** references exactly one ledger account owned by `SPR-MOD-002-001` master data.
- A **ledger movement** projects exactly one journal line onto exactly one ledger account.
- A **ledger running balance** exists at the company / account / currency granularity and is updated by ledger movements.
- A **reversal link (ledger)** references exactly one original journal entry and exactly one reversal journal entry.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-002` per the Ledger Posting Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Ledger accounts referenced by journal lines are owned by `SPR-MOD-002-001`.
- Vouchers referenced by journal entries are owned by `SPR-MOD-002-002`.
- The closed-period signal consulted at the posting boundary is owned by `SPR-MOD-002-006`.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`. Per the Event Ownership Convention established by MOD-001, each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `journal.entry.created` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self, Financial Statements / Taxation / Period Close), MOD-017 (Analytics) | At-least-once, ordered per tenant (per `ADR-051`) |
| `ledger.posted` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self), MOD-017, and downstream reporting modules | At-least-once, ordered per tenant |
| `ledger.reversed` | MOD-002 | SPR-MOD-002-003 | MOD-002 (self), MOD-017, and downstream reporting modules | At-least-once, ordered per tenant |

These three events are the **authoritative accounting-movement events** consumed by Financial Statements, Taxation, Period Close, and downstream reporting modules. Downstream modules consume these events rather than source-document events. Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Exact event names are aligned with the authoritative event catalog; if the catalog uses a variant, the catalog wins and this PRD is corrected in the same change.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Every `Posted` voucher produces exactly one balanced journal entry and exactly one set of ledger movements per tenant per currency.
- [ ] Unbalanced journal entries are refused deterministically; no partial ledger state is persisted.
- [ ] Posting is idempotent per `ADR-053`: replays produce identical state exactly once.
- [ ] Ledger movements carry both transaction-currency and derived base-currency amounts; base amounts are not recomputed at read time.
- [ ] Reversal vouchers produce inverse journal entries and inverse ledger movements via a Reversal Link; original entries remain immutable.
- [ ] Posting into a closed period is refused deterministically via the read-only period signal owned by `SPR-MOD-002-006`.
- [ ] `journal.entry.created`, `ledger.posted`, and `ledger.reversed` events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Any write to accounting ledgers outside the Voucher → Journal → Ledger path is refused deterministically at this sprint's boundary.
- [ ] Tenant / company isolation invariants (`ADR-011`) are enforced on every journal and ledger read and write.
- [ ] Every posting action produces an audit record via `ENG-004`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-002_SPRINT_PLAN.md` §2 (`SPR-MOD-002-003`):

- Every `Posted` voucher produces exactly one balanced journal entry and one set of ledger movements per tenant per currency.
- Ledger movements carry running balances at company / account / currency granularity, with base-currency amounts derived once at posting.
- Reversal vouchers produce inverse journal entries and inverse ledger movements; originals are never mutated.
- Posting is idempotent per `ADR-053`; posting into a closed period is refused deterministically.
- `journal.entry.created`, `ledger.posted`, `ledger.reversed` events are published on the corresponding transitions.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **R1 — Upstream sprint dependencies.** This sprint assumes `SPR-MOD-002-001` and `SPR-MOD-002-002` are `Done`, and that master data (CoA, ledger accounts, fiscal year, accounting periods, base currency) and the Voucher Framework are available under every tenant / company that participates in this sprint's smoke fixtures.
- **R2 — Platform baseline dependency.** Assumes `MOD001_PLATFORM_BASELINE_v1` is frozen and available for tenancy, users/roles/permissions, configuration hierarchy, and audit review. Any regression against that baseline blocks this sprint.
- **R3 — Closed-period signal not yet owned by an authored sprint.** `SPR-MOD-002-006` will formally own the closed-period lifecycle. This sprint consumes the closed-period signal **read-only** through `ENG-005` configuration; if the signal is unavailable at authoring time, every period is treated as `Open` and the refusal criterion (§5.7) becomes effective when `SPR-MOD-002-006` provides the signal.
- **R4 — ADR acceptance.** All referenced ADRs are Accepted at authoring time. If any becomes non-Accepted, this sprint is re-planned.
- **R5 — Event delivery.** Accounting-movement events rely on `ENG-024` delivery guarantees stated in `ADR-051`. Assumption: those guarantees hold; this sprint does not redefine them.
- **R6 — Sole entry point enforcement.** Assumption: downstream modules (MOD-003, MOD-004, MOD-008, MOD-015) consume the Voucher Framework and the events in §11 rather than attempting direct ledger writes. Framework-level refusal of direct ledger writes is required (§5.10).
- **R7 — Multi-currency captured rate.** Assumption: voucher lines carry a captured exchange rate at posting time (per `SPR-MOD-002-002`); this sprint does not re-derive rates from an external source at posting or at read time.
- **R8 — Downstream deferrals.** Financial statements, tax computation, and period-close lifecycle are deferred to `SPR-MOD-002-004` / `-005` / `-006`. Assumption: these deferrals hold; this sprint does not silently absorb their scope.

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — balanced-entry construction, unbalanced-entry rejection, running-balance update, inverse-entry generation for reversals, refusal of direct ledger writes, refusal of posting into a closed period.
- **Integration** — idempotent posting via `ENG-016`, base-currency derivation via `ENG-018`, configuration read via `ENG-005`, audit emission via `ENG-004`, event publication via `ENG-024`.
- **Contract** — accounting-movement event contracts against the event catalog; consumer contract with downstream reporting personas subscribing to the events in §11.
- **End-to-end (smoke)** — end-to-end voucher post → journal creation → ledger projection → reversal under a two-tenant / two-company / two-currency smoke fixture to verify `ADR-011` isolation, reversal semantics, and multi-currency behavior.

Sprint-specific fixtures: a two-company / two-currency fixture with pre-seeded CoA, ledger accounts, fiscal year, accounting periods, numbering series, and posted vouchers of every voucher type (produced by `SPR-MOD-002-001` and `SPR-MOD-002-002` seed data).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider deriving journal entries from `Posted` vouchers within the same transactional boundary that consumes the `voucher.posted` event, so idempotency (§5.3) can be anchored on the voucher identifier.
- Consider persisting the base-currency amount on the ledger movement at the moment of posting, so reads never re-compute FX and downstream reporting is stable.
- Consider representing running balances as an explicit projection updated within the same commit as the ledger movement, so §5.4 reads are strictly `O(1)`.
- Consider surfacing the sole-entry-point refusal (§5.10) as an explicit framework boundary check that any non-Accounting caller attempting a direct ledger write is refused with a deterministic error.
- Consider treating the closed-period signal as an explicit precondition on posting, so §5.7 refusal is uniform whether the period was already closed at voucher post time or was closed between voucher posting and journal projection.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-002-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Define what happens after a voucher is posted — the canonical translation of `Posted` vouchers into balanced journal entries and idempotent ledger movements, with reversal-produces-inverse semantics, ledger immutability, closed-period contract, and authoritative accounting-movement events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-002` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Ledger Posting Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists financial statements, tax computation, period-close lifecycle, and voucher-lifecycle redefinition, each linked to its owning sprint (`-002`, `-004`, `-005`, `-006`).
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes, including balance integrity, idempotency, reversal-inverse, closed-period refusal, and refusal of direct ledger writes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-002-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-002-004 Financial Statements` is the immediate successor per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) §2–§3 and depends on `SPR-MOD-002-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-002-001-accounting-foundation.md`](./SPR-MOD-002-001-accounting-foundation.md)
- Upstream Sprint PRD — [`./SPR-MOD-002-002-voucher-framework.md`](./SPR-MOD-002-002-voucher-framework.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

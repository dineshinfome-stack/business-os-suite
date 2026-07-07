---
title: "SPR-MOD-002-002 — Voucher Framework"
summary: "Sprint PRD for the Accounting Voucher Framework of MOD-002 Accounting: canonical voucher lifecycle, voucher types, numbering series binding, approval hooks, cancellation and reversal semantics, immutability after posting, cross-module voucher creation contract, and voucher-lifecycle events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Accounting"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-002-002"
parent_module: "MOD-002"
parent_sprint_plan: "MOD-002_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "8.3.2"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-011", "ENG-015", "ENG-017", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-051"]
tags: ["sprint", "prd", "accounting", "mod-002", "voucher", "framework", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-002-002 — Voucher Framework

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-002 Accounting** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-002-002` (permanent) |
| Parent Module | `MOD-002` — Accounting |
| Parent Sprint Plan | [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Sprint | [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) — Accounting Foundation |
| Upstream Baseline | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-002-003` … `SPR-MOD-002-006`; every module that creates accounting vouchers (MOD-003, MOD-004, MOD-008, MOD-015) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Accounting Voucher Framework** for BusinessOS: the canonical voucher lifecycle state machine (`Draft → Validated → Posted → Cancelled` with reversal), voucher types enumerated by the Accounting Module PRD, numbering series binding, approval hooks, cancellation and reversal semantics, immutability after posting, cross-module voucher creation contract, audit integration, and voucher-lifecycle events. Every subsequent Accounting sprint — ledger posting, financial statements, taxation, and period close — operates on the vouchers this framework produces.

> **Accounting Voucher Ownership Convention.** The Accounting module owns the business semantics of every accounting voucher: its lifecycle, types, numbering, approval, cancellation, reversal, and immutability after posting. ERP Core Engines provide shared infrastructure (voucher abstraction, numbering, approval, audit, eventing, document/attachment) but **MUST NOT** redefine accounting voucher business rules. Downstream modules (Sales, Purchase, Payroll, POS, Inventory, etc.) create accounting vouchers by consuming this framework rather than introducing independent voucher structures or posting semantics. A voucher is **immutable** once it reaches a `Posted` state; any correction is achieved through a reversal voucher that references the original without mutating it.
>
> **Sole entry point.** The Voucher Framework is the **sole authoritative entry point** into the Accounting transaction lifecycle. Future Accounting Sprint PRDs (`SPR-MOD-002-003` Journal & Ledger Posting, `SPR-MOD-002-004` Financial Statements, `SPR-MOD-002-005` Taxation & Compliance, `SPR-MOD-002-006` Period Close & Audit) extend this lifecycle but **MUST NOT** redefine voucher ownership or lifecycle semantics established here.

This complements — and does not replace — the Accounting Ownership Convention from [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md).

### 1.2 In Scope

- **Voucher types** per Accounting Module PRD §6: Journal Voucher, Payment Voucher, Receipt Voucher, Contra Voucher, Credit Note, Debit Note. Each voucher type is a first-class citizen of the framework, not a per-module variant.
- **Voucher lifecycle state machine** — `Draft → Validated → Posted → Cancelled`, with `Reversed` as a distinct terminal outcome achieved through a reversal voucher rather than a mutating transition.
- **Voucher identity and header** — stable voucher identifier, voucher type, tenant/company scope, voucher date, reference metadata, and lifecycle state.
- **Voucher lines** — line-level structure sufficient to describe the voucher's intent (ledger reference, direction, amount, description). Line-level content is defined at the framework level; ledger effects are produced in `SPR-MOD-002-003`, not here.
- **Numbering series binding** — each voucher type resolves a tenant-configured numbering series via `ENG-017` at creation time; numbering algorithms are not redefined here.
- **Approval hooks** — approval requests routed via `ENG-011` where the tenant configuration requires them; approval thresholds are resolved through `ENG-005` (established by the Platform baseline and consumed by `SPR-MOD-002-001` configuration namespace).
- **Cancellation semantics** — a voucher in `Draft` or `Validated` MAY be `Cancelled`; a `Posted` voucher MUST NOT be cancelled directly (see reversal).
- **Reversal semantics** — a `Posted` voucher MAY be reversed by creating a new voucher of the appropriate type that references the original via a Reversal Link entity; the original voucher is never mutated.
- **Immutability after posting** — the voucher header, lines, and numbering are immutable once the voucher enters `Posted`.
- **Cross-module voucher creation contract** (see §3 of this document, embedded in Deliverables): source-module documents MAY request creation of an accounting voucher through this framework but MUST NOT create ledger entries or accounting postings directly.
- **Audit integration** — every lifecycle transition is audited via `ENG-004`.
- **Attachment and document association** — vouchers MAY carry attachments and documents through `ENG-007` / `ENG-008`; attachment/document semantics are consumed, not redefined.
- **Events published** (see §11) — `voucher.created`, `voucher.updated`, `voucher.submitted`, `voucher.posted`, `voucher.cancelled`, `voucher.reversed` — delivered via `ENG-024`.

### 1.3 Out of Scope

Reserved for later Accounting sprints (see [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)):

- **Double-entry ledger posting** — production of balanced ledger effects from `Posted` vouchers is delivered by `SPR-MOD-002-003`. The framework here declares the balancing rule as a contract but does not enforce debit-equals-credit at ledger level.
- **Journal register, general ledger read models, and trial-balance surface** — `SPR-MOD-002-003`.
- **Tax computation and tax posting on vouchers** — `SPR-MOD-002-005`.
- **Financial statements (Trial Balance, P&L, Balance Sheet, Cash Flow)** — `SPR-MOD-002-004`.
- **Period locking, reopening, and closing adjustments** — `SPR-MOD-002-006`. This sprint declares that a closed period cannot accept new postings as a contract, but period-close enforcement is delivered later.
- **Cost centres, budgets, sub-ledger reconciliation, and cross-company consolidation** — deferred per Module PRD §14.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-002-002`, the following will exist:

- **Business capabilities.**
  - Every voucher type in Module PRD §6 can be created in `Draft`, validated, posted, and — where applicable — cancelled or reversed.
  - Voucher numbering is resolved via `ENG-017` under the tenant-configured hierarchy at voucher creation.
  - Approval hooks route to `ENG-011` where required by tenant configuration.
  - Posted vouchers are immutable; corrections occur exclusively through reversal vouchers linked to the original.
  - Downstream modules (system personas) can create accounting vouchers through the framework without touching ledger or posting internals.
- **Cross-module voucher creation contract.**
  - Downstream modules generate source documents (sales invoice, purchase invoice, payroll run, POS day-close) in their own bounded context.
  - **Source documents MAY request creation of an accounting voucher through the Voucher Framework, but MUST NOT create ledger entries or accounting postings directly. All accounting transactions enter the Accounting domain exclusively through the Voucher Framework.**
  - The Accounting module owns the resulting voucher lifecycle, numbering, and state; the originating module owns the source document lifecycle.
  - Events published by the Voucher Framework are authoritative for downstream financial reporting and period close.
- **Published events.** Six voucher-lifecycle event contracts (see §11) registered in the event catalog and emitted by the corresponding transitions.
- **Audit artifacts.** An audit record exists for every voucher lifecycle transition, produced via `ENG-004`, in a form consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-002-002`.
  - Voucher-lifecycle event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-002 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Journals and general ledger (voucher capture only) | Voucher lifecycle for every voucher type |
| §4 Business Processes — Journal capture and posting | `Draft → Validated → Posted` transitions and approval hooks |
| §6 Transactions — Journal / Payment / Receipt / Contra / Credit-Debit Note | First-class voucher types with shared lifecycle |
| §6 Transactions — Numbering | Numbering series binding via `ENG-017` at creation |
| §6 Transactions — Approvals | Approval hooks via `ENG-011` under tenant thresholds |
| §6 Transactions — Audit | Audit emission via `ENG-004` on every transition |
| §7 Business Rules — Voucher balancing (contract only) | Balancing declared as a framework contract; enforcement in `SPR-MOD-002-003` |
| §7 Business Rules — Reversal creates a new voucher; original never mutated | Reversal Link entity and immutability rule |
| §7 Business Rules — A closed period cannot be posted into (contract only) | Contract declared; enforcement in `SPR-MOD-002-006` |
| §10 Configuration — Numbering series, Approval thresholds | Consumed via `ENG-005` / `ENG-017` / `ENG-011` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As an accountant, I want to create a Journal, Payment, Receipt, Contra, Credit Note, or Debit Note voucher in `Draft`, so that I can capture an accounting transaction before submitting it for validation and posting.*
- **US-002.** *As an accountant, I want to submit a `Draft` voucher for validation, so that structural and configuration checks (numbering, approval routing) resolve deterministically before posting.*
- **US-003.** *As a controller, I want approval hooks to route through `ENG-011` when the tenant configuration requires them, so that voucher posting respects tenant-defined authorization boundaries.*
- **US-004.** *As an accountant, I want to post a `Validated` voucher, so that its accounting effects are ready to be produced by the posting engine in the next sprint, and downstream modules receive a `voucher.posted` event.*
- **US-005.** *As an accountant, I want to cancel a `Draft` or `Validated` voucher, so that I can discard an unposted transaction cleanly.*
- **US-006.** *As a controller, I want to reverse a `Posted` voucher by creating a new voucher that references the original, so that a correction is applied without mutating the posted record.*
- **US-007.** *As a downstream module (system persona), I want to request creation of an accounting voucher through the framework using my source-document context, so that all accounting transactions enter the Accounting domain through a single authoritative entry point.*
- **US-008.** *As a security reviewer, I want every voucher lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the voucher's history from an authoritative log.*
- **US-009.** *As a platform administrator, I want a `Posted` voucher's header, lines, and numbering to be immutable, so that ledger integrity cannot be silently altered.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Voucher creation and validation (US-001, US-002)

- **Given** a valid voucher creation request naming a voucher type, tenant/company scope, voucher date, and at least one line,
  **when** an accountant submits it,
  **then** a voucher is persisted in `Draft` with a stable identifier, a resolved numbering series binding, and a `voucher.created` event is emitted via `ENG-024`.
- **Given** a `Draft` voucher,
  **when** it is submitted for validation,
  **then** structural checks (numbering resolved, required fields present, line references to ledger accounts valid per `SPR-MOD-002-001` master data) pass or fail deterministically, and on success the voucher transitions to `Validated` and a `voucher.submitted` event is emitted.

### 5.2 Approvals (US-003)

- **Given** a `Validated` voucher whose tenant configuration requires approval,
  **when** the approval hook fires,
  **then** the approval request is routed via `ENG-011`, the voucher remains in `Validated` until the approval terminal state is reached, and the outcome is audited via `ENG-004`.
- **Given** an approval refusal,
  **when** it is recorded,
  **then** the voucher does not transition to `Posted` and remains in `Validated` or is `Cancelled` per tenant configuration.

### 5.3 Posting transition (US-004)

- **Given** a `Validated` voucher whose approval requirements are satisfied,
  **when** it is posted,
  **then** the voucher transitions to `Posted`, its header / lines / numbering become immutable, and a `voucher.posted` event is emitted via `ENG-024`.
- **Given** a `Posted` voucher,
  **when** any modification to header, lines, or numbering is attempted,
  **then** the request is rejected deterministically and no state change occurs.

### 5.4 Cancellation (US-005)

- **Given** a `Draft` or `Validated` voucher,
  **when** it is cancelled,
  **then** the voucher transitions to `Cancelled`, a `voucher.cancelled` event is emitted, and no further transitions are permitted.
- **Given** a `Posted` voucher,
  **when** cancellation is attempted,
  **then** the request is rejected deterministically (see §5.5 for the correct correction path).

### 5.5 Reversal (US-006, US-009)

- **Given** a `Posted` voucher,
  **when** a reversal is requested,
  **then** a new voucher of the appropriate type is created with a Reversal Link referencing the original, the original is not mutated, and a `voucher.reversed` event is emitted for the original.
- **Given** a reversal voucher,
  **when** it progresses through the standard lifecycle,
  **then** it is subject to the same rules as any other voucher (numbering, approval, immutability after posting).

### 5.6 Cross-module invocation (US-007)

- **Given** a downstream module (system persona) invoking the Voucher Framework with a valid source-document context,
  **when** the request is submitted,
  **then** a voucher is created through the framework's standard entry point and the framework rejects any request that attempts to write ledger entries or postings directly.
- **Given** an attempt by any module to create ledger entries or accounting postings outside the Voucher Framework,
  **when** it occurs,
  **then** it is refused deterministically at the framework boundary.

### 5.7 Numbering (US-001)

- **Given** a voucher creation request,
  **when** it succeeds,
  **then** the voucher's number is resolved via `ENG-017` under the tenant-configured series for its voucher type, and numbering algorithms are not redefined by this sprint.

### 5.8 Audit integration (US-008)

- **Given** any voucher lifecycle transition (`create`, `submit`, `approve`/`refuse`, `post`, `cancel`, `reverse`),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, voucher identifier, transition type, and timestamp.

### 5.9 Events

- **Given** a voucher lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog.

### 5.10 Isolation invariants (`ADR-011`)

- **Given** any voucher read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-002` — Accounting.
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Journals and general ledger — capture), §4 (Journal capture and posting), §6 (Transactions and their lifecycle, numbering, approvals, audit), §7 (Business rules — reversal, immutability, closed-period contract), §10 (Numbering series, approval thresholds), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-002` MODULE_PRD.
- **Upstream sprint:** [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) — Accounting Foundation. Required master data: Chart of Accounts, ledger accounts, account classifications, fiscal year, accounting periods, base accounting configuration.
- **Upstream baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (which encapsulates Platform Sprints 001–006). Individual Platform Sprint PRDs are cited only where sprint-level traceability is specifically required. This reinforces the Stage 3 baseline as the durable inter-module contract established during Pass 8.2.Z.
- **Downstream sprints:** `SPR-MOD-002-003` (Journal & Ledger Posting), `SPR-MOD-002-004` (Financial Statements), `SPR-MOD-002-005` (Taxation & Compliance Foundation), `SPR-MOD-002-006` (Period Close & Audit) — per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Downstream modules:** MOD-003 Sales, MOD-004 Purchase, MOD-008 Payroll, MOD-015 POS — all consume the Voucher Framework as the sole entry point for creating accounting vouchers.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Accounting Voucher Ownership Convention in §1.1). See each engine's specification for capability details.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Authorizes every voucher lifecycle action against the actor's tenant/company/role context. |
| `ENG-004` Audit | Records every voucher lifecycle transition. |
| `ENG-007` Document | Associates business documents with vouchers where applicable. |
| `ENG-008` Attachment | Attaches files to vouchers with metadata, classification, and retention policies. |
| `ENG-011` Approval | Routes approval requests for vouchers whose tenant configuration requires them. |
| `ENG-015` Voucher | Provides the shared voucher abstraction (header/lines/state) consumed by this framework. Accounting business semantics remain owned here. |
| `ENG-017` Numbering | Resolves the tenant-configured numbering series for each voucher type at creation. |
| `ENG-024` Eventing | Publishes voucher-lifecycle events with the contracts declared in §11. |

Accounting voucher business semantics (lifecycle rules, immutability after posting, reversal-creates-new-voucher, cross-module entry-point contract) are owned by this sprint and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every voucher read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to voucher lifecycle actions. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for voucher-lifecycle events. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Voucher | MOD-002 (this sprint) | Canonical accounting transaction record; carries voucher type, identity, header metadata, and lifecycle state. |
| Voucher Line | MOD-002 (this sprint) | Line-level intent under a voucher (ledger reference, direction, amount, description). Ledger effects are produced in `SPR-MOD-002-003`. |
| Voucher Type | MOD-002 (this sprint) | Enumeration of the voucher types listed in Module PRD §6 (Journal, Payment, Receipt, Contra, Credit Note, Debit Note). |
| Numbering Series Binding | MOD-002 (this sprint, configuration-scoped) | Association of a voucher type with a tenant-configured numbering series resolved via `ENG-017`. |
| Approval Context | MOD-002 (this sprint) | Reference to the `ENG-011` approval instance associated with a voucher, where required. |
| Reversal Link | MOD-002 (this sprint) | Directed reference from a reversal voucher to the original `Posted` voucher; enables correction without mutation. |

### 10.2 Relationships

- A **voucher** belongs to exactly one tenant / company (per baseline) and one voucher type.
- A **voucher** owns one or more **voucher lines**.
- A **voucher line** references exactly one ledger account owned by `SPR-MOD-002-001` master data.
- A **numbering series binding** associates a voucher type with a numbering series per company.
- An **approval context** belongs to exactly one voucher (where present).
- A **reversal link** references exactly one original `Posted` voucher and exactly one reversal voucher.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-002` per the Accounting Voucher Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Ledger accounts referenced by voucher lines are owned by `SPR-MOD-002-001`.
- Source documents (sales invoice, purchase invoice, payroll run, POS day-close) are owned by their originating modules and are not entities of this sprint.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `voucher.created` | MOD-002 | SPR-MOD-002-002 | MOD-002 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant (per `ADR-051`) |
| `voucher.updated` | MOD-002 | SPR-MOD-002-002 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `voucher.submitted` | MOD-002 | SPR-MOD-002-002 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `voucher.posted` | MOD-002 | SPR-MOD-002-002 | MOD-002 (self), MOD-003 (Sales), MOD-004 (Purchase), MOD-008 (Payroll), MOD-015 (POS), MOD-017 | At-least-once, ordered per tenant |
| `voucher.cancelled` | MOD-002 | SPR-MOD-002-002 | MOD-002 (self), MOD-003, MOD-004, MOD-008, MOD-015, MOD-017 | At-least-once, ordered per tenant |
| `voucher.reversed` | MOD-002 | SPR-MOD-002-002 | MOD-002 (self), MOD-003, MOD-004, MOD-008, MOD-015, MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Exact event names are aligned with the authoritative event catalog; if the catalog uses a variant, the catalog wins and this PRD is corrected in the same change.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Every voucher type in Module PRD §6 supports the full `Draft → Validated → Posted` lifecycle, with cancellation and reversal where allowed.
- [ ] Numbering series binding resolves deterministically for every voucher type via `ENG-017`.
- [ ] Approval hooks route via `ENG-011` where tenant configuration requires them.
- [ ] Posted vouchers are immutable; corrections occur exclusively through reversal vouchers linked via a Reversal Link.
- [ ] The cross-module voucher creation contract is enforced: no module can create ledger entries or accounting postings outside the Voucher Framework.
- [ ] Voucher-lifecycle events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every voucher read and write.
- [ ] Every voucher lifecycle transition produces an audit record via `ENG-004`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-002_SPRINT_PLAN.md` §2 (`SPR-MOD-002-002`):

- Every voucher type in §6 can be created in `Draft`, transitioned to `Posted`, and `Cancelled` where allowed.
- Numbering series resolve via `ENG-017` under the tenant-configured hierarchy.
- Approvals resolve via `ENG-011`; every state transition is audited via `ENG-004`.
- Reversal creates a new voucher; original vouchers are never mutated (per §7).

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable). Repository-wide ratification of this vocabulary is queued for a future governance pass and is not performed here.

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-002-001` (Accounting Foundation) being `Done` with CoA, ledger accounts, fiscal year, accounting periods, and base configuration available under every participating tenant / company.
  - **Impact:** Missing or incomplete foundation master data blocks voucher lifecycle exercises and smoke fixtures.
  - **Mitigation:** Gate this sprint's smoke fixtures on the foundation seed; treat missing foundation as an upstream defect.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** This sprint depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen baseline contract; treat regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Ledger posting, tax computation, financial statements, and period close are deferred to `SPR-MOD-002-003` … `SPR-MOD-002-006`. The debit-equals-credit rule is declared here as a contract but enforced at ledger level in `SPR-MOD-002-003`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; keep balance enforcement in `SPR-MOD-002-003`.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** `ENG-016` Posting is referenced by the framework only as a forward-compatibility contract.
  - **Impact:** If the posting engine's contract weakens immutability or reversal semantics, the framework's guarantees are undermined.
  - **Mitigation:** Consume `ENG-016` as a read-only contract in this sprint; require future posting work to accept the voucher shape without weakening immutability or reversal semantics.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`, `ADR-051`) are Accepted at authoring time.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Voucher-lifecycle events rely on `ENG-024` delivery guarantees stated in `ADR-051`.
  - **Impact:** Weakened delivery guarantees would break consumer contracts.
  - **Mitigation:** Consume `ENG-024` per `ADR-051` without redefining delivery semantics.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** The framework declares itself as the sole entry point to the Accounting transaction lifecycle; downstream modules (MOD-003, MOD-004, MOD-008, MOD-015) must consume it rather than attempt direct ledger writes.
  - **Impact:** Direct ledger writes by downstream modules would fracture the entry-point contract.
  - **Mitigation:** Framework-level refusal of direct ledger writes is required (§5.6).
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** `ENG-017` numbering series must be configured per voucher type by tenant configuration before the first voucher of that type is created.
  - **Impact:** Missing series would otherwise cause silent voucher creation defects.
  - **Mitigation:** Refuse voucher creation deterministically when a series is missing rather than silently generating a number.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — voucher lifecycle state machine transitions, immutability enforcement after `Posted`, reversal link creation, cancellation guards.
- **Integration** — numbering resolution via `ENG-017`, approval routing via `ENG-011`, audit emission via `ENG-004`, event publication via `ENG-024`.
- **Contract** — voucher-lifecycle event contracts against the event catalog; cross-module voucher creation contract against downstream module system personas.
- **End-to-end (smoke)** — end-to-end voucher creation → validation → approval → posting → reversal under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation and reversal semantics.

Sprint-specific fixtures: a two-company fixture with pre-seeded CoA, ledger accounts, fiscal year, accounting periods, and numbering series per voucher type (produced by `SPR-MOD-002-001` foundation seed).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling voucher lifecycle as an explicit state machine so audit emission (§5.8) and event publication (§5.9) are trivially satisfiable at every transition.
- Consider enforcing immutability at the earliest boundary (input validation layer) so any attempt to mutate a `Posted` voucher is refused before reaching persistence.
- Consider co-locating the Reversal Link with the reversal voucher's creation transaction so a partial state (reversal voucher without link) cannot occur.
- Consider surfacing the sole-entry-point contract as an explicit framework boundary check that any caller attempting to bypass the framework is refused with a deterministic error, so downstream modules cannot accidentally introduce direct ledger writes.
- Consider treating the debit-equals-credit contract as a declared invariant surfaced at the framework boundary, so `SPR-MOD-002-003` can enforce it without weakening the framework's own responsibilities.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-002-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Accounting Voucher Framework — canonical voucher lifecycle, types, numbering, approval, cancellation, reversal, immutability after posting, cross-module entry-point contract, audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-002` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Accounting Voucher Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists ledger posting, tax, financials, period close, and cost centres, each linked to its owning sprint (`-003` … `-006`).
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes, including immutability, reversal-creates-new-voucher, and refusal of direct ledger writes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-002-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-002-003 Journal & Ledger Posting` is the immediate successor per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) §2–§3 and depends only on `SPR-MOD-002-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-002-001-accounting-foundation.md`](./SPR-MOD-002-001-accounting-foundation.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

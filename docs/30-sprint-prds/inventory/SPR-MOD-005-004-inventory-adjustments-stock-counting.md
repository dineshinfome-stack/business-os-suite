---
title: "SPR-MOD-005-004 — Inventory Adjustments & Stock Counting"
summary: "Sprint PRD for the commercial Inventory Adjustment and Stock Counting lifecycle of MOD-005 Inventory: physical count, cycle count, scheduled count, blind count, recount, variance recording, variance review, stock adjustment request, adjustment approval, reconciliation request, adjustment status, count status, adjustment numbering, attachments, notifications, and inventory adjustment events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Inventory"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-005-004"
parent_module: "MOD-005"
parent_sprint_plan: "MOD-005_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "8.8.4"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "inventory", "adjustments", "stock-counting", "mod-005"]
document_type: "Sprint PRD"
---

# SPR-MOD-005-004 — Inventory Adjustments & Stock Counting

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-005 Inventory** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-005-004` (permanent) |
| Parent Module | `MOD-005` — Inventory |
| Parent Sprint Plan | [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md), [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (all frozen) |
| Upstream Sprints | [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md), [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md), [`SPR-MOD-005-003`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md) |
| Downstream Sprints | `SPR-MOD-005-005` … `SPR-MOD-005-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial Inventory Adjustment and Stock Counting lifecycle** for BusinessOS: the commercial Inventory Adjustment document lifecycle (including the Stock Adjustment Request, Adjustment Approval, and Reconciliation Request facets), the Physical Count, Cycle Count, Scheduled Count, Blind Count, and Recount execution lifecycles, variance recording and variance review, adjustment status, count status, adjustment numbering, attachments, notifications, and inventory adjustment events. The commercial Inventory Adjustment and the Stock Count are the substrates consumed by downstream Inventory sprints — valuation and replenishment, analytics — for authoritative adjustment activity.

> **Inventory Adjustment Ownership Convention.** The Inventory module owns the business semantics of the commercial Inventory Adjustment document, the Physical Count, Cycle Count, Scheduled Count, Blind Count, and Recount execution documents, variance recording, variance review, the Stock Adjustment Request facet, the Adjustment Approval facet, and the Reconciliation Request facet. ERP Core Engines provide shared infrastructure (authorization, audit, document, workflow, approval, rules, numbering, eventing, notification, attachment) but **MUST NOT** redefine inventory adjustment business rules. Downstream modules consume commercial Inventory Adjustment events and read APIs rather than introducing independent adjustment or count lifecycles. This complements — and does not redefine — the governance conventions established by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, `SPR-MOD-005-001`, `SPR-MOD-005-002`, and `SPR-MOD-005-003`.

#### 1.1.1 Inventory Adjustment Ownership

Inventory owns the commercial Inventory Adjustment lifecycle, including the Stock Adjustment Request, Adjustment Approval, and Reconciliation Request facets. No other module MAY create, edit, close, or independently maintain a parallel commercial Inventory Adjustment lifecycle. Downstream modules consume Inventory Adjustment events and read APIs; they MUST NOT redefine the commercial adjustment entity, its validation, or its status lifecycle.

#### 1.1.2 Stock Count Boundary

Inventory owns the commercial Physical Count, Cycle Count, Scheduled Count, Blind Count, and Recount execution documents, together with the variance recording and variance review facets that arise from those counts. Warehouse execution (physical counting on the shop floor, physical bin operations, physical scanning, physical stock verification) SHALL be consumed via approved repository contracts. Inventory SHALL NOT perform Warehouse operations directly.

#### 1.1.3 Warehouse Consumption Boundary

Warehouse SHALL remain authoritative for warehouse execution (physical count execution, physical bin operations, external 3PL integration, physical inventory verification). Inventory Adjustments & Stock Counting MAY request warehouse execution and MAY consume warehouse confirmation via approved repository contracts. Inventory Adjustments & Stock Counting SHALL NOT perform Warehouse operations directly, SHALL NOT redefine warehouse ownership, and SHALL NOT drive external WMS execution.

#### 1.1.4 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, valuation, costing, taxation, and financial reconciliation per `MOD002_ACCOUNTING_BASELINE_v1`. Inventory Adjustments & Stock Counting SHALL request downstream accounting processing through approved repository contracts. Inventory Adjustments & Stock Counting SHALL NOT create journals, SHALL NOT create vouchers, SHALL NOT perform valuation, SHALL NOT perform costing, SHALL NOT update ledgers, and SHALL NOT perform financial reconciliation. Any accounting effect of a completed commercial adjustment is delivered downstream by `SPR-MOD-005-005` via voucher-creation contracts consumed by Accounting.

#### 1.1.5 Adjustment Approval Boundary

Adjustment Approval delivered by this sprint is a **commercial approval** of an Inventory Adjustment (e.g. threshold-based approval as declared by Module PRD §7). Financial approval of any accounting posting that follows from an adjustment remains an Accounting responsibility per `MOD002_ACCOUNTING_BASELINE_v1`. Commercial Adjustment Approval SHALL NOT be confused with, and SHALL NOT redefine, financial approval semantics owned by Accounting.

#### 1.1.6 Inventory Transaction Boundary

Commercial adjustment completion SHALL request downstream inventory transaction processing (stock balance updates, inventory movement records) through approved repository contracts. Inventory Adjustments update Inventory state only and SHALL NOT carry financial ownership. Adjustment completion SHALL enforce the negative-stock policy defaults registered in `SPR-MOD-005-001` and SHALL NOT collapse commercial and transactional concerns into a single write path.

#### 1.1.7 Numbering Boundary

Commercial Inventory Adjustment numbers and Count execution numbers SHALL be generated by the repository-approved numbering capability (`ENG-017` per Sprint 4 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md)) from the numbering series registered in `SPR-MOD-005-001`. No numbering series are registered in this sprint.

#### 1.1.8 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md), [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md), and [`SPR-MOD-005-003`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md). Ownership established by those baselines and by Inventory Foundation, Inventory Receipts & Putaway, and Inventory Issues, Transfers & Reservations is consumed and preserved; it is not overridden here. Ownership boundaries SHALL NOT be redefined in downstream Inventory Sprint PRDs.

### 1.2 In Scope

Commercial Inventory Adjustment and Stock Counting lifecycle only:

- Inventory Adjustment creation under a tenant/company (adjustment against Item master, warehouse, and storage location).
- Stock Adjustment Request emission as the origination facet of the Inventory Adjustment.
- Adjustment validation (referential integrity against Item master, warehouse, storage location; tenancy; UoM consistency; quantity invariants; negative-stock policy consumption).
- Adjustment Approval — commercial multi-step approval driven by threshold policy declared in Module PRD §7 and configuration registered in `SPR-MOD-005-001`.
- Physical Count creation and execution under a tenant/company.
- Cycle Count creation and execution (scheduled or ad-hoc) under a tenant/company.
- Scheduled Count creation (recurring count schedule configuration surfaced as a Cycle Count schedule facet).
- Blind Count creation and execution (system-quantity blinding during count entry).
- Recount creation and execution against a completed Physical Count, Cycle Count, or Blind Count.
- Variance Recording at line level on completed count documents.
- Variance Review as a facet of the count document lifecycle.
- Reconciliation Request emission as the settlement facet linking a completed count to an Inventory Adjustment.
- Adjustment Status lifecycle (`Draft → Validated → Pending Approval → Approved → Applied → Closed`; `Rejected` and `Cancelled` as terminal negative transitions).
- Count Status lifecycle (`Draft → Planned → In Progress → Counted → Variance Recorded → Reviewed → Reconciled → Closed`; `Cancelled` as a terminal negative transition; Recount is entered from `Variance Recorded` or `Reviewed`).
- Adjustment Numbering via numbering series registered in `SPR-MOD-005-001` (Inventory Adjustment series and Count execution series).
- Attachments on Inventory Adjustment and count execution documents via `ENG-008` on the attachment surface declared in `SPR-MOD-005-001`.
- Notifications on adjustment and count lifecycle transitions via `ENG-025` against the notification surface declared in `SPR-MOD-005-001`.
- Inventory Adjustment Events emitted via `ENG-024`.

### 1.3 Out of Scope

Reserved for other sprints, upstream baselines, or explicit non-redefinition:

- Item Master, Item Category, Item Group, UoM, warehouse master, storage-location master — owned by `SPR-MOD-005-001`.
- Purchase ownership and Purchase Goods Receipt — owned by MOD-004 Purchase via `MOD004_PURCHASE_BASELINE_v1`.
- Sales ownership and Sales Delivery ownership — owned by MOD-003 Sales via `MOD003_SALES_BASELINE_v1`.
- Warehouse ownership (physical WMS, external 3PL, warehouse operational systems, physical count execution) — external ownership; consumed via approved warehouse contracts.
- Accounting ownership (accounting vouchers, journal posting, ledger posting, valuation, costing, financial reconciliation, receivables, payables, taxation) — owned by MOD-002 Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory Valuation (FIFO / moving average / standard) — `SPR-MOD-005-005`.
- Costing — deferred to `SPR-MOD-005-005` (valuation) and MOD-002 Accounting (accounting valuation ledger).
- Journal Posting, GL updates, and Financial Reconciliation — owned by MOD-002 Accounting.
- Payments and Receivables — owned by MOD-002 Accounting.
- Lot Control and Serial Control — not in the approved MOD-005 Module PRD; explicitly not authored here.
- Reorder policies and replenishment suggestions — `SPR-MOD-005-005`.
- Dashboards, KPIs, Analytics, and Reporting — `SPR-MOD-005-006` and MOD-017 Analytics.
- Inventory Receipt and Putaway — owned by `SPR-MOD-005-002`.
- Inventory Issues, Transfers, and Reservations — owned by `SPR-MOD-005-003`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-005-004`, the following will exist:

- **Physical Count.** Commercial Physical Count documents can be created, planned, executed, counted, variance-recorded, reviewed, reconciled, closed, and cancelled under a tenant/company.
- **Cycle Count.** Commercial Cycle Count documents (scheduled or ad-hoc) can be created and driven through the count lifecycle.
- **Blind Count.** Commercial Blind Count documents can be created with system-quantity blinding preserved during count entry.
- **Recount.** Commercial Recount documents can be created against a completed Physical Count, Cycle Count, or Blind Count and driven through the count lifecycle.
- **Inventory Adjustment.** Commercial Inventory Adjustment documents can be created, edited, validated, submitted for approval, approved, applied, closed, rejected, and cancelled.
- **Adjustment Approval.** Multi-step commercial approval on Inventory Adjustments is enforced via `ENG-011` per threshold configuration declared in Module PRD §7 and registered in `SPR-MOD-005-001`.
- **Variance Recording.** Line-level variance between counted quantity and system quantity is recorded deterministically on completed count documents.
- **Reconciliation Request.** A completed count with recorded variance can emit a Reconciliation Request that originates a linked Inventory Adjustment.
- **Adjustment Numbering.** Commercial Inventory Adjustment and count execution numbering resolves via `ENG-017` against the numbering series registered in `SPR-MOD-005-001`.
- **Attachments.** Attachment surfaces declared in `SPR-MOD-005-001` are consumed on Inventory Adjustment and count execution documents via `ENG-008`.
- **Notifications.** Notification surface declared in `SPR-MOD-005-001` is consumed via `ENG-025`.
- **Adjustment Events.** Event contracts for the commercial Inventory Adjustment and Stock Count lifecycles (see §11) are emitted via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-005-004`.
- **Forward references.** Downstream sprints `SPR-MOD-005-005` and `SPR-MOD-005-006` consume the commercial adjustment and count substrate established here.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Bidirectional Traceability

The following five invariants govern this section:

1. Every Module capability SHALL map to exactly one originating Sprint allocation.
2. Every Sprint capability SHALL trace back to exactly one approved Module capability.
3. No orphan Sprint capability.
4. No duplicate originating allocation.
5. No unallocated Module capability.

### 3.1 Forward Map — Module PRD Capability → Sprint 4 Deliverable

| MOD-005 MODULE_PRD Reference | Delivered By |
| --- | --- |
| §2 Business Scope — Stock movements and adjustments (adjustment half; submodule Movements — adjustments) | Inventory Adjustment (creation, validation, approval, application, status, numbering) |
| §2 Business Scope — Physical stock verification (submodule Physical Verification) | Physical Count + Cycle Count + Scheduled Count + Blind Count + Recount + Variance Recording + Variance Review |
| §4 Business Processes — Adjustment and write-off | Inventory Adjustment lifecycle + Adjustment Approval + Reconciliation Request |
| §4 Business Processes — Cycle count | Cycle Count lifecycle + Scheduled Count |
| §6 Transactions — Stock Adjustment | Inventory Adjustment document, Inventory Adjustment Line, Adjustment Status, Adjustment Approval |
| §6 Transactions — Physical Count | Physical Count document, Count Line, Blind Count, Recount, Count Status, Variance Recording, Variance Review |
| §6 Transactions — Numbering | Adjustment Numbering via `ENG-017` against series registered in `SPR-MOD-005-001` |
| §6 Transactions — Audit | Audit of every adjustment and count lifecycle transition via `ENG-004` |
| §7 Business Rules — Adjustments beyond a threshold require approval | Adjustment Approval via `ENG-011` against threshold policy declared in Module PRD §7 and configuration registered in `SPR-MOD-005-001` |
| §7 Business Rules — Physical count differences post to the configured variance account | Variance Recording + Reconciliation Request (Inventory-side; Accounting posting delivered downstream by `SPR-MOD-005-005`) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

### 3.2 Reverse Map — Sprint 4 Capability → Module PRD Reference

| Sprint 4 Capability | Module PRD Reference |
| --- | --- |
| Inventory Adjustment creation | §2 (Stock movements — adjustment half); §6 (Stock Adjustment) |
| Stock Adjustment Request | §4 (Adjustment and write-off); §6 (Stock Adjustment) |
| Adjustment validation | §6 (Stock Adjustment); §7 (Negative-stock policy consumption) |
| Adjustment Approval | §7 (Adjustments beyond a threshold require approval); §6 (Stock Adjustment) |
| Physical Count | §2 (Physical stock verification); §6 (Physical Count) |
| Cycle Count | §4 (Cycle count); §6 (Physical Count) |
| Scheduled Count | §4 (Cycle count); §10 (Configuration — reorder-like scheduling facet consumed) |
| Blind Count | §2 (Physical stock verification); §6 (Physical Count) |
| Recount | §2 (Physical stock verification); §6 (Physical Count) |
| Variance Recording | §7 (Physical count differences); §6 (Physical Count) |
| Variance Review | §7 (Physical count differences); §6 (Physical Count) |
| Reconciliation Request | §4 (Adjustment and write-off); §7 (Physical count differences) |
| Adjustment Status | §6 (Stock Adjustment lifecycle) |
| Count Status | §6 (Physical Count lifecycle) |
| Adjustment Numbering | §6 (Numbering); §10 (Numbering series) |
| Attachments | §12 (Optional engines — Attachment) |
| Notifications | §12 (Optional engines — Notification) |
| Inventory Adjustment Events | §8 (Integration Points — Events Published: adjustment surfaces) |

Sprint scope is bounded strictly by these references. **No capability introduced in this Sprint PRD is outside the approved Inventory Module PRD, and no Sprint 4 capability approved in `MOD-005_SPRINT_PLAN.md` is orphaned from this Sprint PRD.** Unique originating allocation is preserved.

---

## 4. User Stories

Every user story SHALL trace to exactly one Sprint Deliverable (§2).

- **US-001.** *As an inventory executive, I want a single authoritative Inventory Adjustment document across the enterprise, so that adjustment activity is recorded once and consumed by every downstream Inventory sprint.*  — Deliverable: Inventory Adjustment.
- **US-002.** *As an inventory executive, I want to submit a Stock Adjustment Request against Item master, warehouse, and storage-location master, so that only referentially consistent adjustments enter the lifecycle.*  — Deliverables: Inventory Adjustment, Adjustment Numbering.
- **US-003.** *As an inventory controller, I want commercial approval of Inventory Adjustments beyond a configured threshold, so that high-impact adjustments are governed per Module PRD §7 without redefining Accounting approval.*  — Deliverable: Adjustment Approval.
- **US-004.** *As a warehouse coordinator, I want to plan and execute a Physical Count under a tenant/company/branch scope, so that on-hand quantity is verified against Warehouse execution consumed through approved repository contracts.*  — Deliverable: Physical Count.
- **US-005.** *As an inventory auditor, I want to run scheduled Cycle Counts, so that Physical stock verification (Module PRD §4) is performed on a recurring cadence without redefining Warehouse ownership.*  — Deliverables: Cycle Count, Scheduled Count.
- **US-006.** *As an inventory auditor, I want Blind Count execution that suppresses system quantity during entry, so that counting is unbiased and variance is recorded truthfully.*  — Deliverable: Blind Count.
- **US-007.** *As an inventory auditor, I want to trigger a Recount against a completed count when variance exceeds a policy threshold, so that count accuracy can be re-verified before reconciliation.*  — Deliverable: Recount.
- **US-008.** *As an inventory controller, I want line-level Variance Recording between counted and system quantity, so that adjustment settlement is deterministic and audited.*  — Deliverable: Variance Recording.
- **US-009.** *As an operations manager, I want a Variance Review facet on completed counts, so that variance disposition is governed before an Inventory Adjustment is originated.*  — Deliverable: Variance Recording (Review facet).
- **US-010.** *As an inventory controller, I want to originate an Inventory Adjustment from a completed count via a Reconciliation Request, so that adjustment settlement is traceable end-to-end without redefining Accounting posting.*  — Deliverable: Reconciliation Request.
- **US-011.** *As an inventory administrator, I want commercial Inventory Adjustment and count execution numbers to be generated deterministically from the numbering series registered in `SPR-MOD-005-001`, so that document numbers are stable and non-colliding within a company.*  — Deliverable: Adjustment Numbering.
- **US-012.** *As a branch manager, I want Inventory Adjustments and counts scoped under the tenant/company/branch hierarchy established by the Platform baseline, so that adjustments remain isolated per tenant per `ADR-011`.*  — Deliverables: Inventory Adjustment, Physical Count.
- **US-013.** *As an inventory administrator, I want to attach evidence (photos, count sheets, sign-offs) to Inventory Adjustment and count execution documents, so that audit review has full context.*  — Deliverable: Attachments.
- **US-014.** *As an inventory administrator, I want notifications on adjustment and count lifecycle transitions, so that approvers and reviewers act in time.*  — Deliverable: Notifications.
- **US-015.** *As an inventory analyst, I want Inventory Adjustment and count events published so that downstream systems (valuation, analytics) can react without Inventory publishing directly to consuming modules.*  — Deliverable: Adjustment Events.
- **US-016.** *As a system administrator, I want every commercial Inventory Adjustment and count lifecycle transition to be audited via `ENG-004`, so that the adjustment history can be reconstructed from an authoritative log.*  — Deliverable: (audit thread across all deliverables).

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Inventory Adjustment creation (US-001, US-002)

- **Given** a valid Stock Adjustment Request under a tenant/company,
  **when** an inventory executive submits it,
  **then** an Inventory Adjustment is persisted in `Draft` with a stable identifier scoped to the company.

### 5.2 Adjustment validation (US-002)

- **Given** an Inventory Adjustment referencing an item, warehouse, and storage location,
  **when** validation runs,
  **then** referential integrity against the Item master, warehouse, and storage-location master (owned by `SPR-MOD-005-001`) is enforced via `ENG-012`; invalid references are rejected deterministically.
- **Given** an adjustment line with a UoM that is not an assigned UoM for the item,
  **when** validation runs,
  **then** the line is rejected with a deterministic UoM-consistency error.
- **Given** an adjustment line that would drive on-hand quantity negative,
  **when** validation runs,
  **then** the line is rejected or accepted deterministically per the negative-stock policy defaults registered in `SPR-MOD-005-001` via `ENG-012`.

### 5.3 Adjustment Approval (US-003)

- **Given** an Inventory Adjustment whose absolute impact meets or exceeds the threshold configured per Module PRD §7,
  **when** the adjustment is submitted,
  **then** it transitions to `Pending Approval` and is routed through `ENG-011` per the approval policy; approval or rejection is recorded deterministically and audited via `ENG-004`.

> **Inventory Adjustment SHALL NOT perform accounting posting.**

### 5.4 Physical Count execution (US-004)

- **Given** a valid Physical Count creation request under a tenant/company,
  **when** a warehouse coordinator plans and executes the count,
  **then** a Physical Count document is persisted and driven through `Planned → In Progress → Counted`, with Warehouse execution consumed through approved repository contracts.

> **Warehouse execution SHALL be consumed through approved repository contracts.**

### 5.5 Cycle Count and Scheduled Count (US-005)

- **Given** a Cycle Count schedule configured under a tenant/company,
  **when** the schedule fires,
  **then** a Cycle Count document is created in `Planned` and driven through the count lifecycle; the schedule facet does not redefine reorder or replenishment ownership.

### 5.6 Blind Count (US-006)

- **Given** a Blind Count document in execution,
  **when** count entry is performed,
  **then** the system quantity is suppressed from the count entry surface and is revealed only after count completion for the Variance Recording step.

### 5.7 Recount (US-007)

- **Given** a completed count document in `Variance Recorded` or `Reviewed` whose variance exceeds a configured threshold,
  **when** a Recount is initiated,
  **then** a Recount document is created linked to the source count and driven through the count lifecycle independently.

### 5.8 Variance Recording (US-008)

- **Given** a Physical Count, Cycle Count, Blind Count, or Recount in `Counted`,
  **when** variance recording runs,
  **then** line-level variance between counted quantity and system quantity is persisted deterministically and the document transitions to `Variance Recorded`.

### 5.9 Variance Review (US-009)

- **Given** a count document in `Variance Recorded`,
  **when** the reviewer disposes variance,
  **then** the document transitions to `Reviewed`; disposition is audited via `ENG-004`.

### 5.10 Reconciliation Request (US-010)

- **Given** a count document in `Reviewed` with non-zero recorded variance,
  **when** a Reconciliation Request is emitted,
  **then** an Inventory Adjustment is originated in `Draft` linked to the source count; the count document transitions to `Reconciled` when the linked Inventory Adjustment reaches `Applied`.

> **Inventory Adjustment completion MAY emit repository-defined events and SHALL request downstream accounting processing through approved repository contracts.**

### 5.11 Adjustment application (US-001, US-003)

- **Given** an Inventory Adjustment in `Approved` (or in `Validated` when below approval threshold),
  **when** the adjustment is applied,
  **then** the adjustment transitions to `Applied` and downstream inventory transaction processing is requested through approved repository contracts.

### 5.12 Adjustment Status (US-001, US-003, US-010)

- **Given** any commercial Inventory Adjustment,
  **when** a status transition is attempted,
  **then** only transitions consistent with the approved lifecycle (`Draft → Validated → Pending Approval → Approved → Applied → Closed`; `Rejected` and `Cancelled` as terminal negative transitions) are permitted; invalid transitions are rejected deterministically and audited via `ENG-004`.

### 5.13 Count Status (US-004, US-005, US-007, US-008, US-009, US-010)

- **Given** any Physical Count, Cycle Count, Blind Count, or Recount,
  **when** a status transition is attempted,
  **then** only transitions consistent with the approved lifecycle (`Draft → Planned → In Progress → Counted → Variance Recorded → Reviewed → Reconciled → Closed`; `Cancelled` as terminal negative; Recount originates from `Variance Recorded` or `Reviewed`) are permitted; invalid transitions are rejected deterministically and audited via `ENG-004`.

### 5.14 Adjustment Numbering (US-011)

- **Given** an Inventory Adjustment entering `Validated` or a count document entering `Planned`,
  **when** numbering resolution runs,
  **then** a commercial number is generated deterministically via `ENG-017` from the numbering series registered in `SPR-MOD-005-001`; numbers are unique and non-colliding within a company.

### 5.15 Attachments (US-013)

- **Given** an Inventory Adjustment or count execution document,
  **when** an attachment is uploaded,
  **then** the attachment is persisted via `ENG-008` against the attachment surface declared in `SPR-MOD-005-001`.

### 5.16 Notifications (US-014)

- **Given** an adjustment or count lifecycle transition,
  **when** the transition completes,
  **then** notification is emitted via `ENG-025` against the notification surface declared in `SPR-MOD-005-001`.

### 5.17 Authorization (US-002, US-003, US-004, US-010, US-011, ADR-032)

- **Given** any commercial Inventory Adjustment or count action,
  **when** it is attempted,
  **then** it is authorized under `ENG-002` per the RBAC + ABAC model authoritatively established by `ADR-032`.

### 5.18 Audit logging (US-016)

- **Given** any commercial Inventory Adjustment or count lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, document identifier, transition type, and timestamp.

### 5.19 Tenant isolation (`ADR-011`)

- **Given** any commercial Inventory Adjustment or count read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.20 Adjustment events (US-015)

- **Given** a commercial Inventory Adjustment or count lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are deferred under `R-EV-01`.

### 5.21 Ownership boundary invariants

- Inventory Adjustments SHALL NOT perform accounting posting.
- Warehouse execution SHALL be consumed through approved repository contracts.
- Inventory Adjustment completion MAY emit repository-defined events and SHALL request downstream accounting processing through approved repository contracts.
- Inventory Adjustments & Stock Counting SHALL NOT redefine Inventory Master ownership established by `SPR-MOD-005-001`, Inventory Receipt ownership established by `SPR-MOD-005-002`, or Inventory Issue / Transfer / Reservation ownership established by `SPR-MOD-005-003`.
- Commercial Adjustment Approval SHALL NOT be confused with, and SHALL NOT redefine, financial approval owned by Accounting.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-005` — Inventory.
- **Module PRD:** [`docs/20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 Business Scope (Stock movements and adjustments — adjustment half; Physical stock verification; submodule Physical Verification), §4 Business Processes (Adjustment and write-off, Cycle count), §6 Transactions (Stock Adjustment, Physical Count), §7 Business Rules (Adjustments beyond a threshold require approval; Physical count differences post to the configured variance account — Inventory-side; Accounting posting delivered downstream by `SPR-MOD-005-005`), §10 Configuration (Numbering series — consumed), §12 ERP Core Engine Consumption, §13 Dependencies. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-005` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — Accounting ownership boundaries. Inventory Adjustments & Stock Counting MUST NOT redefine Accounting ownership.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Sales ownership boundaries. Inventory Adjustments & Stock Counting MUST NOT redefine Sales ownership.
  - [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (frozen) — Purchase ownership boundaries. Inventory Adjustments & Stock Counting MUST NOT redefine Purchase ownership.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md) — Item master, warehouse master, storage-location master, UoM master, inventory configuration namespace, inventory-document numbering series, attachment surface, notification surface, negative-stock policy defaults, adjustment-threshold configuration.
  - [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md) — Commercial Inventory Receipt and Putaway substrate; on-hand quantity resulting from receipts is a precondition to physical counting and adjustments. Attachment engine (`ENG-008`) surface consumption originates from Sprint 2 and is consumed here.
  - [`SPR-MOD-005-003`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md) — Commercial Inventory Issue and Inventory Transfer substrate; on-hand quantity is affected by issues and transfers and is consumed read-only by adjustment validation.
- **Downstream sprints:** `SPR-MOD-005-005` (Inventory Valuation & Replenishment), `SPR-MOD-005-006` (Inventory Analytics & Operational Controls) — per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).

Warehouse ownership, Accounting ownership, Sales ownership, and Purchase ownership are consumed and SHALL NOT be redefined by this Sprint PRD. Module identifiers SHALL resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md). Warehouse and Accounting capabilities SHALL be consumed through approved repository contracts and SHALL NOT redefine ownership established by their originating modules.

> **Warehouse SHALL be treated as the originating supplier of warehouse execution capabilities.**
>
> **Accounting SHALL be treated as the originating supplier of accounting capabilities.**
>
> **Sprint 4 SHALL consume Warehouse and Accounting capabilities and SHALL NOT redefine their ownership.**

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see §1.1). Verbatim IDs SHALL resolve from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 4 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md); no placeholder, deprecated, undefined, duplicate, or additional identifiers.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every commercial Inventory Adjustment and count action per `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every commercial Inventory Adjustment and count lifecycle transition per `ADR-014`. |
| `ENG-007` Document | Provides the commercial Inventory Adjustment and count execution document infrastructure (versioning, header/line composition) consumed by this sprint. |
| `ENG-008` Attachment | Persists attachments on Inventory Adjustment and count execution documents against the attachment surface declared in `SPR-MOD-005-001`. |
| `ENG-010` Workflow | Drives adjustment and count status transitions and Reconciliation Request routing. |
| `ENG-011` Approval | Executes multi-step commercial approval of Inventory Adjustments beyond the threshold declared in Module PRD §7 and configured under `SPR-MOD-005-001`. |
| `ENG-012` Rules | Evaluates adjustment and count validation rules (referential integrity, tenancy, UoM consistency, quantity invariants, negative-stock defaults consumption, variance policy). |
| `ENG-017` Numbering | Generates commercial Inventory Adjustment and count execution numbers from the numbering series registered in `SPR-MOD-005-001`. |
| `ENG-024` Eventing | Publishes commercial Inventory Adjustment and count events with the contracts declared in §11. |
| `ENG-025` Notification | Emits notifications on adjustment and count lifecycle transitions against the notification surface declared in `SPR-MOD-005-001`. |

Inventory business semantics of the commercial Inventory Adjustment and Stock Count lifecycles (including Adjustment Approval, Variance Recording, Variance Review, and Reconciliation Request) are owned by this module and are not delegated to any engine.

Identity (`ENG-001`), Permission Management (`ENG-003`), Configuration (`ENG-005`), Localization (`ENG-006`), Voucher (`ENG-015`), Posting (`ENG-016`), Search (`ENG-020`), Reporting (`ENG-021`), Export (`ENG-027`), Automation (`ENG-013`), and Import (`ENG-026`) are NOT invoked here per the Sprint 4 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md). Their consumption is delivered by upstream (`SPR-MOD-005-001` … `SPR-MOD-005-003`) or downstream Inventory sprints (`SPR-MOD-005-005` … `SPR-MOD-005-006`).

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every commercial Inventory Adjustment and count read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration on every adjustment and count lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every commercial Inventory Adjustment and count action via `ENG-002`. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Inventory Adjustment | MOD-005 (this sprint) | Authoritative commercial Inventory Adjustment document owned by Inventory; carries identity, tenancy, status, and header-level references (warehouse, source Reconciliation Request read-only, source count reference read-only). |
| Inventory Adjustment Line | MOD-005 (this sprint) | Line-level record of items adjusted, UoM, adjusted quantities, storage-location reference. |
| Physical Count | MOD-005 (this sprint) | Authoritative Physical Count execution document; carries identity, tenancy, count status, warehouse and storage-location scope. |
| Cycle Count | MOD-005 (this sprint) | Authoritative Cycle Count execution document (scheduled or ad-hoc); shares the count-status lifecycle with Physical Count. |
| Blind Count | MOD-005 (this sprint) | Authoritative Blind Count execution document; system quantity is suppressed during entry. |
| Recount | MOD-005 (this sprint) | Authoritative Recount execution document originated from a completed Physical Count, Cycle Count, or Blind Count. |
| Inventory Variance | MOD-005 (this sprint) | Line-level variance state recorded on a completed count document; carries counted quantity, system quantity, and variance disposition. |
| Adjustment Approval | MOD-005 (this sprint) | Commercial approval state on an Inventory Adjustment driven by `ENG-011` per threshold configuration declared in Module PRD §7. |
| Adjustment Status | MOD-005 (this sprint) | Deterministic lifecycle state of an Inventory Adjustment (`Draft → Validated → Pending Approval → Approved → Applied → Closed`; `Rejected` and `Cancelled` terminal). |
| Count Status | MOD-005 (this sprint) | Deterministic lifecycle state of a Physical Count, Cycle Count, Blind Count, or Recount (`Draft → Planned → In Progress → Counted → Variance Recorded → Reviewed → Reconciled → Closed`; `Cancelled` terminal). |
| Adjustment Attachment | MOD-005 (this sprint) | Attachment record against Inventory Adjustment or count execution documents via `ENG-008` on the surface declared in `SPR-MOD-005-001`. |
| Adjustment Notification | MOD-005 (this sprint) | Notification record against Inventory Adjustment or count lifecycle transitions via `ENG-025` on the surface declared in `SPR-MOD-005-001`. |

### 10.2 Relationships

- An **Inventory Adjustment** belongs to exactly one **company** (owned by MOD-001) and references exactly one **warehouse** (owned by `SPR-MOD-005-001`).
- An **Inventory Adjustment** carries one or more **Inventory Adjustment Lines**.
- An **Inventory Adjustment Line** references exactly one **Item** (owned by `SPR-MOD-005-001`), one **UoM** consistent with the item's assigned UoMs (owned by `SPR-MOD-005-001`), and zero or one **Storage Location** (owned by `SPR-MOD-005-001`).
- An **Inventory Adjustment** MAY reference exactly one originating **Physical Count**, **Cycle Count**, **Blind Count**, or **Recount** via a Reconciliation Request (read-only).
- A **Physical Count**, **Cycle Count**, **Blind Count**, or **Recount** belongs to exactly one **company** and references exactly one **warehouse** and zero or more **Storage Locations** (owned by `SPR-MOD-005-001`).
- A **Recount** references exactly one source **Physical Count**, **Cycle Count**, or **Blind Count**.
- An **Inventory Variance** belongs to exactly one line of a **Physical Count**, **Cycle Count**, **Blind Count**, or **Recount**.
- An **Adjustment Approval** state belongs to exactly one **Inventory Adjustment**.
- An **Adjustment Attachment** belongs to exactly one **Inventory Adjustment**, **Physical Count**, **Cycle Count**, **Blind Count**, or **Recount**.
- An **Adjustment Notification** belongs to exactly one **Inventory Adjustment** or count lifecycle transition.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-005` per the Inventory Adjustment Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Item master, warehouse master, storage-location master, and UoM master remain owned by `SPR-MOD-005-001` and are consumed read-only.
- Inventory Receipt and Putaway remain owned by `SPR-MOD-005-002` and are consumed as substrate (on-hand quantity input) via approved repository contracts.
- Inventory Issue, Inventory Transfer, and Reservation remain owned by `SPR-MOD-005-003` and are consumed read-only.
- Warehouse execution (physical count execution, physical scanning, physical bin operations) remains external and is consumed via approved repository contracts.
- Accounting entities (voucher, journal, ledger, valuation ledger, receivable, payable) remain owned by MOD-002 Accounting and are not represented as Inventory-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. The authoritative event catalog is currently a stub (all sections marked *"content to be filled in a later pass"*); consequently, every commercial Inventory Adjustment event surface enumerated below is **deferred** as `R-EV-01` in §14 pending event-catalog registration. The Event Catalog is **not** modified by this sprint.

| Event Surface (deferred to catalog resolution under `R-EV-01`) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| Inventory Adjustment lifecycle surface (create / validate / submit / approve / reject / apply / close / cancel) | MOD-005 | SPR-MOD-005-004 | MOD-005 (self), MOD-002 (Accounting), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Physical / Cycle / Blind Count lifecycle surface (plan / start / count / variance-record / review / reconcile / close / cancel) | MOD-005 | SPR-MOD-005-004 | MOD-005 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Recount lifecycle surface (originate / count / variance-record / review / reconcile / close / cancel) | MOD-005 | SPR-MOD-005-004 | MOD-005 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Reconciliation Request surface (emit / linked / settled / cancelled) | MOD-005 | SPR-MOD-005-004 | MOD-005 (self), MOD-002 (Accounting via `SPR-MOD-005-005` voucher-creation contract), MOD-017 (Analytics) | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14 (see `R-EV-01`).

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial Inventory Adjustment and count event surfaces are registered in the event catalog with their contracts and are emitted on the corresponding transitions (or, if the catalog remains a stub, `R-EV-01` remains deferred with no active blocker for downstream Sprint 5 authoring).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every commercial Inventory Adjustment and count read and write.
- [ ] Every commercial Inventory Adjustment and count lifecycle transition produces an audit record via `ENG-004`.
- [ ] Commercial Inventory Adjustment and count execution numbering resolves via `ENG-017` against the series registered in `SPR-MOD-005-001`.
- [ ] Adjustment Approval is enforced via `ENG-011` against threshold configuration declared in Module PRD §7 and registered in `SPR-MOD-005-001`.
- [ ] Attachments and notifications are consumed against the surfaces declared in `SPR-MOD-005-001` via `ENG-008` and `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-005_SPRINT_PLAN.md` §2 (`SPR-MOD-005-004`):

- Stock adjustments can be created, approved, and driven through the adjustment lifecycle.
- Cycle counts and physical counts can be scheduled, executed, and reconciled; variances are recorded.
- Approval thresholds resolve via `ENG-005` configuration and route through `ENG-011`.
- Variance write-off contracts are produced for consumption by `MOD002_ACCOUNTING_BASELINE_v1`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risk Register

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open`, `Mitigated`, `Accepted`, `Deferred`, `Closed`.

- **Risk ID:** R-01
  - **Description:** Warehouse dependency. Physical Warehouse execution (physical count execution, physical scanning, physical bin operations) is external; Inventory only requests processing and consumes confirmation via approved contracts.
  - **Impact:** Silent absorption of warehouse execution into Inventory would violate the Warehouse Consumption Boundary (§1.1.3).
  - **Mitigation:** Enforce the Warehouse Consumption Boundary at sprint gates; do not implement physical counting inside Inventory.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Accounting dependency. Inventory Adjustments must not create journals, vouchers, valuation entries, ledger entries, or perform financial reconciliation.
  - **Impact:** Silent absorption of Accounting semantics into Inventory would violate `MOD002_ACCOUNTING_BASELINE_v1`.
  - **Mitigation:** Enforce the Accounting Boundary (§1.1.4) at sprint gates; downstream accounting effects delivered by `SPR-MOD-005-005` via voucher-creation contracts consumed by Accounting.
  - **Status:** Accepted

- **Risk ID:** R-03
  - **Description:** Inventory adjustment approval dependency. Approval thresholds are declared in Module PRD §7 and configured via `SPR-MOD-005-001`; drift in threshold configuration would silently bypass commercial approval.
  - **Impact:** High-impact adjustments could be applied without the intended governance.
  - **Mitigation:** Route every Inventory Adjustment through `ENG-011` per configured threshold policy; treat threshold-policy drift as a configuration defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Stock count accuracy. Physical, Cycle, and Blind Count outcomes are only as accurate as the Warehouse execution consumed at each count run.
  - **Impact:** Inaccurate counts would generate false variance and drive noisy Inventory Adjustments.
  - **Mitigation:** Support Recount from `Variance Recorded` and `Reviewed`; require variance disposition through the Variance Review facet before Reconciliation Request emission.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Variance approval dependency. Variance disposition on completed counts must be governed before an Inventory Adjustment is originated.
  - **Impact:** Uncontrolled variance disposition would corrupt on-hand quantity and downstream valuation.
  - **Mitigation:** Enforce Variance Review as a required transition (`Variance Recorded → Reviewed`) before Reconciliation Request emission; audit disposition via `ENG-004`.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Numbering dependency. Commercial Inventory Adjustment and count execution numbering consumes the numbering series registered in `SPR-MOD-005-001`. The repository-approved numbering engine (`ENG-017`) is present in Sprint 4 engine allocation per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) and in [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and is referenced by identifier accordingly.
  - **Impact:** Divergence from the registered numbering series would break document-number stability across the Inventory module.
  - **Mitigation:** Consume series registered in `SPR-MOD-005-001` via `ENG-017`; do not register new series here.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Event Catalog gaps. The authoritative event catalog (`docs/02-architecture/event-catalog.md`) is currently a stub; every commercial Inventory Adjustment and count event surface enumerated in §11 is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register commercial Inventory Adjustment and count events via the event catalog governance process before downstream Inventory sprints consume them.
  - **Status:** Deferred

- **Risk ID:** R-07
  - **Description:** Cross-module contracts. Inventory Adjustments and counts consume Warehouse execution via approved repository contracts; downstream consumers (Accounting via `SPR-MOD-005-005`, Analytics) depend on Inventory Adjustment events.
  - **Impact:** Ambiguous consumption contracts would encourage parallel adjustment lifecycles in consuming modules.
  - **Mitigation:** Expose Inventory Adjustment and count lifecycles exclusively via events and read APIs; enforce consumption boundaries at sprint gates.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Movement authorization dependency. All commercial Inventory Adjustment and count actions must be authorized under `ENG-002` per `ADR-032`. All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** Any bypass of `ENG-002`, or degradation of ADR acceptance status, would invalidate this sprint's contract.
  - **Mitigation:** Route every commercial Inventory Adjustment and count action through `ENG-002`; re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Reconciliation dependency. Reconciliation Request links a completed count to an Inventory Adjustment; the Accounting-side of reconciliation is delivered downstream by `SPR-MOD-005-005` via voucher-creation contracts consumed by Accounting.
  - **Impact:** Ambiguous split between Inventory-side reconciliation and Accounting-side reconciliation would blur the Inventory / Accounting boundary.
  - **Mitigation:** Constrain this sprint to Inventory-side reconciliation (Reconciliation Request emission, `Reconciled` count status upon linked Inventory Adjustment reaching `Applied`); defer accounting posting to `SPR-MOD-005-005`.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — adjustment and count validation rules (referential integrity, tenancy, UoM consistency, quantity invariants, negative-stock policy consumption, variance policy), adjustment approval threshold evaluation, adjustment and count status transitions, blind count suppression, recount origination invariants, reconciliation-request emission invariants.
- **Integration** — audit emission via `ENG-004`, workflow transitions via `ENG-010`, approval via `ENG-011`, rule evaluation via `ENG-012`, numbering via `ENG-017`, event publication via `ENG-024`, notifications via `ENG-025`, authorization via `ENG-002`, document composition via `ENG-007`, and attachment via `ENG-008`.
- **Contract** — commercial Inventory Adjustment and count event contracts against the event catalog (deferred under `R-EV-01`); Warehouse execution contract for count runs; voucher-creation contract handoff to `SPR-MOD-005-005`.
- **End-to-end (smoke)** — Physical Count → Counted → Variance Recorded → Reviewed → Reconciliation Request → Inventory Adjustment (Draft → Validated → Pending Approval → Approved → Applied → Closed) → count `Reconciled` → count `Closed`, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture used to prove tenancy and ownership invariants across companies, a fixture emulating Warehouse execution confirmation for a Physical Count, a fixture emulating a Cycle Count schedule firing under a tenant/company scope, and a fixture emulating a Blind Count entry surface that suppresses system quantity.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the commercial Inventory Adjustment lifecycle and each count lifecycle as small state machines so audit emission (§5.18) and event publication (§5.20) are trivially satisfiable at every transition.
- Consider modeling Adjustment Approval as an explicit sub-state on the Inventory Adjustment rather than as flags, so threshold-based routing through `ENG-011` remains observable.
- Consider modeling Reconciliation Request as its own small lifecycle rather than as flags on the count document, so the Inventory-side / Accounting-side split remains observable.
- Consider modeling Variance Review as a required transition between `Variance Recorded` and `Reconciled`, so variance disposition is never bypassed.
- Consider suppressing system quantity at the Blind Count entry boundary (input layer) so blinding is enforceable even under alternative surfaces (mobile, CSV import).
- Consider surfacing the Inventory Adjustment Ownership Convention as a hard boundary in downstream module gates so `SPR-MOD-005-005` and Analytics consume events rather than write commercial adjustment state.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-005-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial Inventory Adjustment and Stock Counting lifecycle (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix (forward and reverse); every feature is tied to a `MOD-005` MODULE_PRD reference. No orphan requirements. Bidirectional mapping preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Inventory Adjustment Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists Item Master, Purchase, Sales, Warehouse, Accounting, Valuation, Costing, Journal Posting, GL, Financial Reconciliation, Payments, Lot / Serial, Analytics, Reporting, Dashboards, Inventory Receipt & Putaway, and Inventory Issues / Transfers / Reservations, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and includes explicit ownership-boundary invariants (§5.21) and the three verbatim boundary statements.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-005-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-005-005 Inventory Valuation & Replenishment` is the immediate successor per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) §2 and depends on the commercial adjustment and count substrate delivered here.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-005-001-inventory-foundation.md`](./SPR-MOD-005-001-inventory-foundation.md), [`./SPR-MOD-005-002-inventory-receipts-putaway.md`](./SPR-MOD-005-002-inventory-receipts-putaway.md), [`./SPR-MOD-005-003-inventory-issues-transfers-reservations.md`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md)
- Platform Baseline (frozen) — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Accounting Baseline (frozen) — [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Sales Baseline (frozen) — [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Purchase Baseline (frozen) — [`../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)

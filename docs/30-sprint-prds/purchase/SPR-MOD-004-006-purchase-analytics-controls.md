---
title: "SPR-MOD-004-006 — Purchase Analytics & Controls"
summary: "Sprint PRD for the commercial Purchase Analytics and Operational Controls surface: purchase dashboards, procurement KPIs, spend analysis, vendor and buyer performance, cycle-time and exception analytics, return analytics, operational controls, audit readiness reporting, filters, exports, and scheduled reports over repository-approved read models. Consumes SPR-MOD-004-001..005 and upstream baselines; never redefines them; introduces no transactional functionality and does not own inventory transactions, accounting journals, ledger posting, payables, tax posting, or payment execution."
layer: "delivery"
owner: "Procurement"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-004-006"
parent_module: "MOD-004"
parent_sprint_plan: "MOD-004_SPRINT_PLAN.md"
iteration: "Sprint 6"
stage: "2"
pass: "8.6.6"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "purchase", "analytics", "controls", "dashboards", "mod-004", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-004-006 — Purchase Analytics & Controls

> **Stage 2 deliverable.** Terminal authored Sprint PRD for **MOD-004 Purchase** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines, Accepted ADRs, and every prior Purchase sprint (`SPR-MOD-004-001` … `SPR-MOD-004-005`), together with the ownership boundaries codified by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, and `MOD003_SALES_BASELINE_v1`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-004-006` (permanent) |
| Parent Module | `MOD-004` — Purchase |
| Parent Sprint Plan | [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) |
| Iteration | Sprint 6 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (all frozen) |
| Upstream Sprints | [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md), [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md), [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md), [`SPR-MOD-004-004`](./SPR-MOD-004-004-vendor-billing-3-way-match.md), [`SPR-MOD-004-005`](./SPR-MOD-004-005-purchase-returns-vendor-adjustments.md) (originating supplier of Purchase Return capabilities) |
| Downstream Sprints | *None — terminal sprint for MOD-004.* |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial Purchase Analytics and Operational Controls surface** for BusinessOS: purchase dashboards, procurement KPI dashboards, spend and spend-trend analysis, vendor and buyer performance analytics, purchase cycle-time and exception analytics, approval and return analytics, operational controls, audit-readiness reporting, filters, exports, scheduled reports, read-model-backed analytics, notifications, and reporting events. Sprint 6 is the terminal sprint of MOD-004; it introduces **no transactional functionality** and operates exclusively on repository-approved read models derived from documents authored by `SPR-MOD-004-001` … `SPR-MOD-004-005`.

> **Purchase Analytics Ownership Convention.** MOD-004 Purchase owns the business semantics of commercial procurement analytics — dashboards, KPIs, spend analytics, vendor/buyer performance, cycle-time and exception analytics, operational controls, and audit-readiness reporting — over the Purchase document surface. ERP Core Engines provide shared infrastructure (authorization, audit, search, reporting, eventing, notification, export) but **MUST NOT** redefine purchase analytics business rules. Sprint 6 SHALL NOT modify commercial Purchase documents authored by prior sprints, SHALL NOT perform accounting/inventory/warehouse transactions, and SHALL NOT own cross-module enterprise BI (owned by MOD-017 Analytics). This complements — and does not redefine — the ownership conventions established by `SPR-MOD-004-001` … `SPR-MOD-004-005`, `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, and `MOD003_SALES_BASELINE_v1`.

#### 1.1.1 Purchase Return Consumption (Upstream Dependency on SPR-MOD-004-005)

`SPR-MOD-004-005` SHALL be treated as the **originating supplier** of all Purchase Return, Replacement Request, Vendor Return Authorization, Debit Note Request, and Vendor Adjustment Request capabilities consumed by Sprint 6. Sprint 6 SHALL consume return volumes, adjustment volumes, and commercial return events originating from `SPR-MOD-004-005` and SHALL NOT redefine Purchase Return ownership or return lifecycle.

#### 1.1.2 Prior Sprint Consumption Boundary

Sprint 6 SHALL consume Purchase Requisitions, RFQs, Purchase Orders (`SPR-MOD-004-002`), Goods Receipts (`SPR-MOD-004-003`), Vendor Bills and Commercial 3-Way Match outcomes (`SPR-MOD-004-004`), Purchase Returns and adjustment requests (`SPR-MOD-004-005`), and Vendor / buyer / purchasing organization masters (`SPR-MOD-004-001`) via repository-approved read models and events, and SHALL NOT redefine their ownership.

#### 1.1.3 Reporting Consumption Boundary

Analytics SHALL consume repository-owned Purchase documents through the reporting surface exposed by `ENG-021` and search via `ENG-020`. Analytics SHALL NOT redefine the ownership of any consumed document.

#### 1.1.4 Operational Controls Boundary

Operational controls validate commercial procurement processes only (surface exceptions, produce control reports, produce audit-readiness summaries). No business transaction ownership changes: controls do not create, mutate, cancel, or finalize any commercial Purchase document.

#### 1.1.5 Inventory Consumption Boundary

Inventory information (item references, receipt volumes, return volumes) MAY be consumed via read models exposed by MOD-005 Inventory and by prior Purchase sprints. Inventory ownership SHALL remain with MOD-005 Inventory. Sprint 6 SHALL NOT perform inventory transactions, warehouse operations, or stock ledger writes.

#### 1.1.6 Accounting Consumption Boundary

Accounting information (voucher references, tax references, payables references, payment references) MAY be consumed via read models exposed by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`. Accounting SHALL remain authoritative for financial reporting. Sprint 6 SHALL NOT create accounting journals, ledger entries, payables records, tax postings, or payment records, and SHALL NOT publish financial-statement reports (owned by MOD-002 Accounting).

#### 1.1.7 Dashboard Read Model Boundary

Dashboards SHALL use repository-approved read models produced by prior Purchase sprints or by upstream modules. Dashboards SHALL NOT become transaction sources; a dashboard interaction MUST NOT mutate any commercial document.

#### 1.1.8 Analytics Event Boundary

Analytics MAY consume repository-defined events published by prior sprints. Analytics MAY publish reporting-lifecycle events (scheduled-report execution, control-report generation, KPI snapshot, exception surfacing) via `ENG-024`, subject to authoritative Event Catalog resolution (see §11 and `R-EV-01`). Analytics SHALL NOT redefine Event Catalog ownership.

#### 1.1.9 Governance Complement

This Sprint PRD complements but SHALL NOT redefine:

- [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md)
- [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md)
- [`SPR-MOD-004-004`](./SPR-MOD-004-004-vendor-billing-3-way-match.md)
- [`SPR-MOD-004-005`](./SPR-MOD-004-005-purchase-returns-vendor-adjustments.md)

### 1.2 In Scope

- **Purchase dashboards.** Configurable, tenant-scoped procurement dashboards over Purchase documents authored by prior sprints.
- **Procurement KPI dashboards.** KPI definitions and rendering for procurement — PO volume, PO ageing, cycle time, on-time delivery, 3-way match exception rate, return rate, approval-cycle time.
- **Spend analysis.** Spend by vendor, category, purchasing organization, buyer, period, currency (base-currency snapshot resolved from Vendor Bill data authored by `SPR-MOD-004-004`).
- **Spend trend analysis.** Period-over-period spend trend surfaces.
- **Vendor performance analytics.** Delivery accuracy, quality (via GRN acceptance/rejection), price variance (Commercial 3-Way Match outcomes), return rate.
- **Buyer performance analytics.** Buyer throughput, approval cycle time, exception incidence.
- **Purchase cycle-time analytics.** Requisition-to-PO, PO-to-GRN, GRN-to-Vendor-Bill, Vendor-Bill-to-Debit-Note cycle times.
- **Purchase exception analytics.** 3-way match exceptions, over-return exceptions, approval-override incidence, cancellation incidence, blocked-document surface.
- **Approval analytics.** Approval routing and outcome analytics over data emitted by `ENG-011` via prior sprints.
- **Return analytics.** Return volumes, adjustment volumes, replacement-request rates, debit-note-request rates, vendor-return-authorization coverage — sourced from `SPR-MOD-004-005` events and read models.
- **Purchase operational controls.** Control reports that surface exceptions (missing approvals, ageing at risk, unresolved 3-way match holds) without mutating source documents.
- **Audit-readiness reporting.** Cross-sprint audit summaries produced from `ENG-004` audit records, enabling downstream audit review under `MOD-001` Platform without redefining the audit engine.
- **Export.** Standard exports of dashboards and reports via `ENG-027`.
- **Filtering.** Standard filter surface over tenant/company, period, vendor, buyer, purchasing organization, purchase category, currency.
- **Scheduled reports.** Scheduled generation and dispatch of purchase reports and KPI snapshots via the repository-approved scheduling and reporting surfaces (consumed through `ENG-021` and dispatched via `ENG-025`).
- **Read-model analytics.** All analytics operate on repository-approved read models produced by prior Purchase sprints or by upstream modules.
- **Notifications.** Purchase-executive, procurement-manager, buyer, branch-manager, internal-auditor, and management notifications on scheduled-report delivery, control-report generation, KPI snapshot completion, and exception surfacing via `ENG-025`.
- **Reporting events.** Publication of reporting-lifecycle events via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).

### 1.3 Out of Scope

Reserved for other modules or explicitly not delivered:

- Transactional Purchase functionality — owned by `SPR-MOD-004-001` … `SPR-MOD-004-005`. Sprint 6 introduces no new commercial Purchase documents and no new document lifecycles.
- Vendor Master, buyer master, purchasing organization, T&C master, purchase price list master, purchase configuration namespace, purchase-document numbering series — `SPR-MOD-004-001`.
- Purchase Requisition, RFQ, Vendor Quotation, Quote Comparison, Purchase Order — `SPR-MOD-004-002`.
- Goods Receipt lifecycle, receipt validation, inspection, acceptance, rejection — `SPR-MOD-004-003`.
- Vendor Bill lifecycle, Commercial 3-Way Match, match-exception workflow — `SPR-MOD-004-004`.
- Purchase Returns, Replacement Requests, Vendor Return Authorizations, Debit Note Requests, Vendor Adjustment Requests — `SPR-MOD-004-005`.
- Inventory transactions, warehouse operations, stock ledger writes, cost-layer maintenance — MOD-005 Inventory.
- Accounting vouchers, journal posting, ledger posting, payables ledger maintenance, tax posting, payment execution, financial reporting — MOD-002 Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.
- GL, payables, tax, payments — MOD-002 Accounting.
- Financial reporting — MOD-002 Accounting.
- Cross-module enterprise BI, cross-module KPI definitions, cross-module analytics platform — MOD-017 Analytics.
- Predictive analytics, AI recommendations, machine learning, AI-driven supplier scoring — MOD-018 AI Workspace / MOD-017 Analytics.
- Budgeting — not in MOD-004 scope.

**No transactional functionality is introduced by this Sprint PRD.**

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-004-006`, the following will exist:

- **Business capabilities.**
  - Purchase Dashboards render tenant-scoped procurement views over Purchase documents authored by prior sprints.
  - Procurement KPI dashboards expose the KPI catalog (PO volume, PO ageing, cycle time, on-time delivery, 3-way match exception rate, return rate, approval-cycle time).
  - Spend analytics surface spend by vendor, category, purchasing organization, buyer, period, and currency; a spend-trend view surfaces period-over-period movement.
  - Vendor and buyer performance analytics render delivery accuracy, quality, price variance, return rate, buyer throughput, and approval-cycle time.
  - Purchase cycle-time and exception analytics render requisition→PO→GRN→Vendor Bill→Debit Note cycle times and 3-way match / over-return / cancellation exception surfaces.
  - Return analytics render return volumes, adjustment volumes, replacement-request rates, debit-note-request rates, and vendor-return-authorization coverage.
  - Purchase operational controls produce control reports that surface exceptions without mutating source documents.
  - Audit-readiness reporting produces cross-sprint audit summaries from `ENG-004` audit records.
  - Filters, exports, and scheduled reports are available across the surface.
- **Published events.** Reporting-lifecycle event contracts (see §11) registered in the event catalog and emitted by the corresponding transitions.
- **Audit artifacts.** An audit record exists for every dashboard configuration change, scheduled-report configuration change, and control-report generation, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-004-006`.
  - Reporting-lifecycle event entries in the event catalog referenced from §11.
- **Terminal sprint.** No downstream Sprint references — `SPR-MOD-004-006` is the terminal sprint for MOD-004 and closes Stage 2 for the Purchase module.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Bidirectional Sprint ↔ Module PRD Traceability

Bidirectional traceability. Every Sprint-6 capability traces back to an approved MOD-004 Module PRD section, and every relevant Module PRD section covered by Sprint 6 traces forward to a deliverable below. No Sprint-6 capability is orphaned from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-006`); unique originating allocation is preserved (no capability delivered here is also allocated as the originating allocation to another Purchase sprint).

**Traceability invariants:**

- Every Module PRD capability SHALL map to exactly one originating Sprint allocation.
- Every Sprint capability SHALL trace back to an approved Module PRD capability.
- No orphan Sprint capability.
- No unallocated Module PRD capability.
- No duplicate originating allocation.

### 3.1 Forward Map — Sprint 6 Capability → MOD-004 Module PRD Section

| Sprint 6 Capability | MOD-004 MODULE_PRD Section |
| --- | --- |
| Purchase dashboards | §9 Reports & Analytics — Purchase Register |
| Procurement KPI dashboards | §9 Reports & Analytics — Supplier Performance, PO Ageing, Price Variance, 3-Way Match Exceptions |
| Spend analysis and spend-trend analysis | §9 Reports & Analytics — Purchase Register (spend surface) |
| Vendor performance analytics | §9 Reports & Analytics — Supplier Performance |
| Buyer performance analytics | §9 Reports & Analytics — Supplier Performance (buyer-side extension) |
| Purchase cycle-time analytics | §9 Reports & Analytics — PO Ageing |
| Purchase exception analytics | §9 Reports & Analytics — 3-Way Match Exceptions |
| Approval analytics | §9 Reports & Analytics (approval outcomes over prior-sprint data) |
| Return analytics | §9 Reports & Analytics — Purchase Register (return surface) |
| Operational controls (control reports over exceptions) | §11 Non-functional — Audit readiness (control surface) |
| Audit-readiness reporting | §11 Non-functional — Audit readiness |
| Filters, exports, scheduled reports | §9 Reports & Analytics (delivery surface) |
| Reporting-lifecycle events | §8 Integration Points (reporting-lifecycle surface, subject to catalog resolution) |

### 3.2 Reverse Map — MOD-004 Module PRD Section → Sprint 6 Deliverable

| MOD-004 MODULE_PRD Section | Delivered By |
| --- | --- |
| §9 Reports & Analytics — Purchase Register | Purchase dashboards, spend analytics, return analytics (§1.2, §5) |
| §9 Reports & Analytics — PO Ageing | Purchase cycle-time analytics (§1.2, §5) |
| §9 Reports & Analytics — Supplier Performance | Vendor and buyer performance analytics (§1.2, §5) |
| §9 Reports & Analytics — Price Variance | Procurement KPI dashboards; vendor performance analytics (§1.2, §5) |
| §9 Reports & Analytics — 3-Way Match Exceptions | Purchase exception analytics; operational controls (§1.2, §5) |
| §11 Non-functional — Audit readiness | Audit-readiness reporting; operational controls (§1.2, §5) |
| §8 Integration Points (reporting-lifecycle surface, subject to catalog resolution) | Reporting-lifecycle events (§11) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

No Module PRD capability allocated to Sprint 6 in `MOD-004_SPRINT_PLAN.md` §2 sits outside the maps above. No capability appears as the originating allocation in more than one sprint. **No capability introduced in this Sprint PRD is outside the approved Purchase Module PRD, and no capability allocated to Sprint 6 in `MOD-004_SPRINT_PLAN.md` is orphaned from this Sprint PRD** (unique originating allocation preserved; no orphans; no duplicates).

---

## 4. User Stories

- **US-001.** *As a procurement director, I want a purchase dashboard scoped to my tenant/company, so that I can see overall procurement health at a glance without touching commercial documents.*
- **US-002.** *As a procurement director, I want procurement KPI dashboards (PO volume, PO ageing, cycle time, on-time delivery, 3-way match exception rate, return rate, approval-cycle time), so that operational health is quantifiable.*
- **US-003.** *As a procurement manager, I want spend analytics by vendor, category, purchasing organization, buyer, period, and currency, with a period-over-period trend view, so that spend can be reviewed operationally without depending on Accounting reports.*
- **US-004.** *As a procurement manager, I want vendor performance analytics (delivery accuracy, quality, price variance, return rate), so that vendor selection and negotiation are data-driven.*
- **US-005.** *As a procurement manager, I want buyer performance analytics (throughput, approval cycle time, exception incidence), so that operational load is visible.*
- **US-006.** *As a purchase executive, I want purchase cycle-time analytics (requisition→PO→GRN→Vendor Bill→Debit Note), so that pipeline bottlenecks are surfaced.*
- **US-007.** *As a buyer, I want purchase exception analytics (3-way match exceptions, over-return exceptions, approval overrides, cancellations, blocked documents), so that outliers are actionable.*
- **US-008.** *As a branch manager, I want operational control reports that surface exceptions in my branch without mutating source documents, so that governance stays clean.*
- **US-009.** *As an internal auditor, I want audit-readiness reporting that summarizes cross-sprint audit records from `ENG-004`, so that audit review is deterministic.*
- **US-010.** *As management, I want scheduled purchase reports and KPI snapshots delivered on a schedule, so that reviews happen without manual assembly.*
- **US-011.** *As a purchase executive, I want to filter and export purchase reports via `ENG-027`, so that downstream review and archiving are supported.*
- **US-012.** *As a system administrator, I want every dashboard configuration change, scheduled-report configuration change, and control-report generation to be audited via `ENG-004`, so that governance history can be reconstructed.*
- **US-013.** *As a downstream module (system persona), I want to receive reporting-lifecycle events (scheduled-report executed, control-report generated, KPI snapshot completed, exception surfaced), so that consumers can react deterministically through approved repository contracts.*

Each user story traces to at least one Sprint Deliverable in §2.

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

**Ownership invariants.** In addition to the scenario-level criteria below, the following invariants apply globally to every analytics and controls capability handled by this sprint:

- **Purchase Analytics SHALL operate on repository-approved read models.**
- **Purchase Analytics SHALL NOT modify commercial Purchase documents.**
- **Purchase Analytics SHALL NOT perform accounting, inventory, or warehouse transactions.**

### 5.1 Dashboard generation (US-001, US-002)

- **Given** a purchase dashboard configured under an active company,
  **when** a procurement director opens it,
  **then** it renders from repository-approved read models scoped to the caller's tenant/company, no commercial document is mutated, and the read is audited only insofar as `ENG-004` audit policy requires for dashboard reads.

### 5.2 KPI reporting (US-002)

- **Given** the procurement KPI catalog (PO volume, PO ageing, cycle time, on-time delivery, 3-way match exception rate, return rate, approval-cycle time),
  **when** a KPI dashboard is rendered,
  **then** every KPI is computed from repository-approved read models produced by `SPR-MOD-004-001` … `SPR-MOD-004-005`, no KPI computation mutates source documents, and the render is scoped to the caller's tenant/company.

### 5.3 Spend analysis (US-003)

- **Given** finalized Vendor Bills authored by `SPR-MOD-004-004` (and Purchase Returns / adjustment requests authored by `SPR-MOD-004-005`),
  **when** a procurement manager runs spend analytics by vendor, category, purchasing organization, buyer, period, or currency,
  **then** the analytics render from read models exposed by prior sprints, base-currency snapshots are resolved without redefining currency semantics, and no commercial document is mutated.

### 5.4 Vendor analytics (US-004)

- **Given** GRN acceptance/rejection data authored by `SPR-MOD-004-003`, 3-way match outcomes authored by `SPR-MOD-004-004`, and return volumes authored by `SPR-MOD-004-005`,
  **when** vendor performance analytics are rendered,
  **then** delivery accuracy, quality, price variance, and return rate render per vendor from read models, and no commercial document is mutated.

### 5.5 Buyer analytics (US-005)

- **Given** approval outcomes emitted through `ENG-011` and cycle-time data derived from prior-sprint state transitions,
  **when** buyer performance analytics are rendered,
  **then** throughput, approval cycle time, and exception incidence render per buyer from read models.

### 5.6 Purchase trends (US-003, US-006)

- **Given** period-scoped read models over prior-sprint documents,
  **when** a spend-trend or cycle-time-trend view is rendered,
  **then** period-over-period movement is computed deterministically from the read models and rendered scoped to the caller's tenant/company.

### 5.7 Operational controls (US-008)

- **Given** exceptions surfaced by prior sprints (missing approvals, ageing at risk, unresolved 3-way match holds, over-return),
  **when** a branch manager runs an operational control report,
  **then** the control report renders the exception set from read models, produces no side effects on source documents, and is audited via `ENG-004`.

### 5.8 Audit readiness (US-009)

- **Given** `ENG-004` audit records emitted by prior Purchase sprints,
  **when** an internal auditor runs the audit-readiness report,
  **then** it summarizes the audit surface without redefining audit semantics, scoped to the caller's tenant/company, and produces no mutations.

### 5.9 Filters (US-011)

- **Given** the standard filter surface (tenant/company, period, vendor, buyer, purchasing organization, purchase category, currency),
  **when** an actor applies filters to a dashboard or report,
  **then** the render is scoped to the applied filters and the caller's tenant, and no cross-tenant data leaks.

### 5.10 Export (US-011)

- **Given** a rendered dashboard or report,
  **when** an actor requests an export,
  **then** `ENG-027` produces the export in a supported standard format, the export is scoped to the applied filters and the caller's tenant, and the export request is audited via `ENG-004`.

### 5.11 Scheduled reports (US-010)

- **Given** a scheduled-report configuration under an active company,
  **when** the scheduler triggers execution,
  **then** the report is generated from read models via `ENG-021`, delivered per configuration via `ENG-025`, and the execution is audited via `ENG-004`.

### 5.12 Authorization and audit (US-012)

- **Given** any analytics or controls action (dashboard configuration change, scheduled-report configuration change, control-report generation, export request),
  **when** it is invoked,
  **then** authorization is enforced via `ENG-002` per `ADR-032` (RBAC + ABAC), unauthorized actions are rejected without side effects, and an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp, per `ADR-014`.

### 5.13 Tenant isolation (`ADR-011`)

- **Given** any analytics or controls read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.14 Reporting events (US-013)

- **Given** a reporting-lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are recorded as deferred `R-EV-*` risks in §14.

### 5.15 Read-model consumption invariants

- **Given** any Sprint-6 analytics or controls capability,
  **when** it renders or exports data,
  **then** it does so exclusively from repository-approved read models produced by `SPR-MOD-004-001` (masters), `SPR-MOD-004-002` (Requisition/RFQ/PO), `SPR-MOD-004-003` (GRN), `SPR-MOD-004-004` (Vendor Bill / 3-Way Match), and `SPR-MOD-004-005` (Purchase Returns / adjustment requests), or from read models exposed by upstream modules (MOD-001 Platform, MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`, MOD-005 Inventory). No parallel supplier, PO, GRN, Vendor Bill, or Purchase Return master is introduced here, no inventory transaction is authored here, and no accounting journal, ledger entry, tax posting, payables record, or payment record is authored here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-004` — Purchase.
- **Module PRD:** [`docs/20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §9 (Purchase Register, PO Ageing, Supplier Performance, Price Variance, 3-Way Match Exceptions), §11 (Audit readiness), §8 (reporting-lifecycle surface, subject to Event Catalog resolution), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-004` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership; Accounting remains authoritative for financial reporting. Sprint 6 MUST NOT create accounting journals, ledger entries, payables records, tax postings, or payment records, and MUST NOT publish financial-statement reports.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master ownership boundary. Sprint 6 MUST NOT reference customer entities on procurement analytics.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md) — Purchase Foundation (Vendor Master, buyer master, purchasing organization, purchase-document numbering series, purchase configuration namespace).
  - [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) — Requisitions, RFQs & Purchase Orders (read-model source).
  - [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md) — Goods Receipt & Inspection (read-model source).
  - [`SPR-MOD-004-004`](./SPR-MOD-004-004-vendor-billing-3-way-match.md) — Vendor Billing & Commercial 3-Way Match (read-model source).
  - [`SPR-MOD-004-005`](./SPR-MOD-004-005-purchase-returns-vendor-adjustments.md) — Purchase Returns & Vendor Adjustments. **`SPR-MOD-004-005` SHALL be treated as the originating supplier of Purchase Return capabilities. Sprint 6 SHALL consume Purchase commercial documents and SHALL NOT redefine their ownership.**
  - [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) — Sprint 6 allocation.
- **Downstream sprints:** *None — `SPR-MOD-004-006` is the terminal sprint for MOD-004.*
- **Downstream module consumers of Sprint-6 events:** `MOD-004` (self), `MOD-017` Analytics (may consume reporting-lifecycle events for cross-module dashboards), `MOD-001` Platform (audit review) — consuming exclusively via events and read APIs. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Purchase Analytics Ownership Convention in §1.1). See each engine's specification for capability details.

One-line usage note per engine. Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 6 allocation in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-006`). No placeholder, deprecated, undefined, duplicate, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every analytics and controls action (dashboard configuration, scheduled report, control report, export). |
| `ENG-004` Audit | Records every dashboard configuration change, scheduled-report configuration change, control-report generation, and export request with actor, tenant/company scope, entity identifier, transition type, and timestamp. |
| `ENG-020` Search | Provides scoped search over the purchase document surface for analytics filters and dashboards. |
| `ENG-021` Reporting | Provides report definition, rendering, and scheduling for purchase dashboards, KPI dashboards, spend/vendor/buyer analytics, cycle-time analytics, exception analytics, operational controls, and audit-readiness reports. |
| `ENG-024` Eventing | Publishes reporting-lifecycle events (scheduled-report executed, control-report generated, KPI snapshot completed, exception surfaced) with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches procurement-director, procurement-manager, buyer, branch-manager, internal-auditor, and management notifications on scheduled-report delivery, control-report generation, and exception surfacing. |
| `ENG-027` Export | Produces standard-format exports of dashboards and reports scoped to applied filters and the caller's tenant. |

Purchase analytics business semantics (dashboards, KPIs, spend/vendor/buyer performance, cycle-time and exception analytics, operational controls, audit-readiness reporting) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every analytics and controls read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for dashboard, scheduled-report, control-report, and export events. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to analytics and controls actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Purchase Dashboard | MOD-004 (this sprint) | Tenant-scoped procurement dashboard configuration over prior-sprint read models. |
| KPI Definition | MOD-004 (this sprint) | Definition of a procurement KPI (name, formula reference, filter surface, unit, granularity) grounded in prior-sprint read models. |
| Spend Metric | MOD-004 (this sprint) | Aggregated spend metric by vendor, category, purchasing organization, buyer, period, currency. |
| Vendor Performance Metric | MOD-004 (this sprint) | Aggregated per-vendor delivery accuracy, quality, price variance, and return-rate metric. |
| Buyer Performance Metric | MOD-004 (this sprint) | Aggregated per-buyer throughput, approval cycle time, and exception incidence metric. |
| Purchase Trend | MOD-004 (this sprint) | Period-over-period movement view over a spend, cycle-time, or exception series. |
| Operational Control | MOD-004 (this sprint) | Named control that surfaces a specific exception class over prior-sprint documents without mutating them. |
| Audit Report | MOD-004 (this sprint) | Cross-sprint audit-readiness summary derived from `ENG-004` audit records. |
| Analytics Filter | MOD-004 (this sprint) | Standard filter surface (tenant/company, period, vendor, buyer, purchasing organization, purchase category, currency) applied to dashboards and reports. |
| Scheduled Report | MOD-004 (this sprint) | Scheduled-report configuration (report reference, filter binding, schedule, recipients) executed via `ENG-021` and dispatched via `ENG-025`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Purchase Dashboards** and zero or more **Scheduled Reports**.
- A **Purchase Dashboard** references zero or more **KPI Definitions**, **Spend Metrics**, **Vendor Performance Metrics**, **Buyer Performance Metrics**, **Purchase Trends**, and **Operational Controls**.
- A **KPI Definition**, **Spend Metric**, **Vendor Performance Metric**, **Buyer Performance Metric**, **Purchase Trend**, **Operational Control**, and **Audit Report** are computed from repository-approved read models produced by `SPR-MOD-004-001` … `SPR-MOD-004-005` or by upstream modules; none carry commercial state of their own.
- A **Scheduled Report** references exactly one report configuration and zero or more **Analytics Filters**; execution is audited via `ENG-004`.
- Vendor references resolve against the Vendor Master owned by `SPR-MOD-004-001`; PO references resolve against `SPR-MOD-004-002`; GRN references resolve against `SPR-MOD-004-003`; Vendor Bill references resolve against `SPR-MOD-004-004`; Purchase Return / adjustment-request references resolve against `SPR-MOD-004-005`; item references resolve against the Inventory item master (MOD-005) transitively.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-004` per the Purchase Analytics Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **Commercial Purchase documents (Requisition, RFQ, PO, GRN, Vendor Bill, Purchase Return, adjustment requests) are NOT owned here** — owned by `SPR-MOD-004-001` … `SPR-MOD-004-005` and consumed read-only.
- **Inventory stock ledger, putaway, cost-layer maintenance, warehouse operations, and inventory transactions are NOT represented here** — owned by MOD-005 Inventory.
- **Accounting vouchers, journals, ledger entries, payables ledger balances, tax postings, payment records, and financial-statement reports are NOT represented here** — owned by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`.
- Customer master is NOT represented here — owned by MOD-003 Sales.
- Cross-module enterprise BI, cross-module KPI definitions, predictive analytics, AI-driven supplier scoring, and machine learning are NOT represented here — owned by MOD-017 Analytics / MOD-018 AI Workspace.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Every event name SHALL resolve verbatim from [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Any event that cannot be resolved SHALL NOT be invented and SHALL instead be recorded as a deferred `R-EV-*` risk in §14. No Event Catalog modifications are permitted by this sprint.

| Event Name (subject to catalog resolution) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `purchase-report.scheduled-report.executed` | MOD-004 | SPR-MOD-004-006 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchase-report.control-report.generated` | MOD-004 | SPR-MOD-004-006 | MOD-004 (self), MOD-001 (audit review), MOD-017 | At-least-once, ordered per tenant |
| `purchase-report.kpi-snapshot.completed` | MOD-004 | SPR-MOD-004-006 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchase-report.exception.surfaced` | MOD-004 | SPR-MOD-004-006 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Reporting-lifecycle events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every analytics and controls read and write.
- [ ] Every dashboard configuration change, scheduled-report configuration change, control-report generation, and export request produces an audit record via `ENG-004`.
- [ ] All analytics and controls capabilities operate on repository-approved read models; no commercial Purchase document is mutated by this sprint.
- [ ] No accounting, inventory, or warehouse transaction is authored by this sprint.
- [ ] Exports are produced via `ENG-027` scoped to applied filters and the caller's tenant.
- [ ] Scheduled reports execute via `ENG-021` and dispatch via `ENG-025` on their configured schedule.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-006`):

- Purchase reports and dashboards render from data produced by prior sprints.
- Purchasing KPIs and 3-way match exception reviews are available for operational review.
- Audit readiness surface exposes every Purchase event emitted during the sprint sequence.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** Reporting dependency — analytics are computed via the repository-approved reporting engine allocated to Sprint 6. `ENG-021` is cited by verbatim engine identifier because it appears in both the Sprint 6 allocation of [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-006`) and [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md) for MOD-004.
  - **Impact:** Regression in reporting-engine capability would block dashboard rendering, KPI computation, and scheduled-report execution.
  - **Mitigation:** Consume `ENG-021` per its specification; treat any regression as a reporting-engine defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Dashboard dependency — dashboards render exclusively from repository-approved read models produced by prior Purchase sprints.
  - **Impact:** Regression in a prior-sprint read-model contract would corrupt dashboard rendering.
  - **Mitigation:** Consume read models read-only; treat any regression as a prior-sprint defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Read-model dependency — every analytics and controls capability consumes read models produced by `SPR-MOD-004-001` … `SPR-MOD-004-005` (and upstream modules where applicable).
  - **Impact:** Contract drift on any consumed read model would cascade across the analytics surface.
  - **Mitigation:** Treat read-model contract changes as governance events; do not silently absorb regressions.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Accounting data dependency — accounting references (voucher, tax, payables, payment references) MAY be consumed via read models exposed by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`. Sprint 6 MUST NOT publish financial-statement reports.
  - **Impact:** Regression in Accounting read models would corrupt spend snapshots and audit-readiness reporting; publishing financial reports here would violate the Accounting ownership boundary.
  - **Mitigation:** Consume Accounting read models read-only; leave financial reporting to MOD-002 Accounting.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Inventory reporting dependency — inventory references (receipt volumes, return volumes) MAY be consumed via read models exposed by MOD-005 Inventory.
  - **Impact:** Regression in Inventory read models would corrupt receipt-based KPIs, vendor quality metrics, and return analytics.
  - **Mitigation:** Consume Inventory read models read-only; treat any regression as an MOD-005 defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Cross-module contract drift — MOD-017 Analytics and MOD-001 Platform consume Sprint-6 reporting-lifecycle events and read APIs.
  - **Impact:** Changes to event payloads or read-API contracts after Sprint 6 completes would ripple downstream.
  - **Mitigation:** Publish event contracts through the authoritative catalog; treat contract changes as catalog governance events.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** KPI governance — procurement KPI definitions MUST remain within MOD-004 scope; cross-module KPI definitions are owned by MOD-017 Analytics.
  - **Impact:** Defining cross-module KPIs here would violate MOD-017 ownership and produce duplicate definitions.
  - **Mitigation:** Keep KPI definitions scoped to procurement; delegate cross-module KPI definitions to MOD-017.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Audit reporting dependency — audit-readiness reporting summarizes `ENG-004` audit records emitted by prior Purchase sprints.
  - **Impact:** Missing or corrupted audit records from any prior sprint would corrupt audit-readiness reporting.
  - **Mitigation:** Consume `ENG-004` records read-only; treat any gap as a prior-sprint defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Analytics engine dependency — the analytics surface consumes the repository-approved reporting engine and search engine allocated to Sprint 6. `ENG-021` and `ENG-020` are cited by verbatim engine identifier because they appear in both the Sprint 6 allocation of [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-006`) and [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md) for MOD-004.
  - **Impact:** Regression in either engine's allocation would break analytics rendering.
  - **Mitigation:** Consume the repository-approved analytics engines only; treat any regression as an engine defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-10
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** The authoritative event catalog is currently a stub. Every reporting-lifecycle event name declared in §11 (`purchase-report.scheduled-report.executed`, `purchase-report.control-report.generated`, `purchase-report.kpi-snapshot.completed`, `purchase-report.exception.surfaced`) is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Stage 3 baseline capture. The Event Catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — KPI definition binding; spend/vendor/buyer metric aggregation logic; period-over-period trend computation; operational-control exception evaluation; audit-readiness summarization; scheduled-report configuration lifecycle.
- **Integration** — audit emission via `ENG-004`; search via `ENG-020`; reporting via `ENG-021`; event publication via `ENG-024`; notification dispatch via `ENG-025`; export via `ENG-027`.
- **Contract** — reporting-lifecycle event contracts against the event catalog for `purchase-report.scheduled-report.executed`, `purchase-report.control-report.generated`, `purchase-report.kpi-snapshot.completed`, `purchase-report.exception.surfaced`.
- **End-to-end (smoke)** — dashboard render → KPI snapshot → spend/vendor/buyer analytics render → cycle-time and exception analytics render → operational control report → audit-readiness report → scheduled report execution → export, executed under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation, filter scoping, and no-mutation invariants on prior-sprint documents.

Sprint-specific fixtures: a two-company smoke fixture with a pre-seeded Vendor Master (from `SPR-MOD-004-001`), open POs (from `SPR-MOD-004-002`), accepted GRNs (from `SPR-MOD-004-003`), finalized Vendor Bills and 3-way match outcomes (from `SPR-MOD-004-004`), and Purchase Returns / adjustment requests (from `SPR-MOD-004-005`), used to prove tenancy, filter scoping, no-mutation invariants, and export/schedule handoffs.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the KPI catalog as declarative KPI definitions bound to read models so that the "no mutation of commercial documents" invariant is enforced structurally.
- Consider isolating scheduled-report execution behind an explicit boundary that consumes `ENG-021` and `ENG-025`, so that scheduling drift never leaks into commercial document lifecycles.
- Consider mapping reporting-lifecycle events to authoritative catalog names as soon as `R-EV-01` is resolved.
- Consider treating operational control reports as pure read projections so that a control invocation cannot, by construction, mutate any prior-sprint document.
- Consider exposing the audit-readiness report as a projection over `ENG-004` records so that audit semantics remain owned by the audit engine.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-004-006`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial Purchase Analytics and Operational Controls surface: dashboards, KPIs, spend/vendor/buyer/cycle-time/exception/return analytics, operational controls, audit-readiness reporting, filters, exports, scheduled reports, and reporting-lifecycle events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 forward and reverse traceability tables; every feature is tied to a `MOD-004` MODULE_PRD section. No orphan requirements. Bidirectional mapping preserved; unique originating allocation preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Purchase Analytics Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists all transactional Purchase functionality (owned by `SPR-MOD-004-001` … `SPR-MOD-004-005`), Accounting/Inventory/Sales-owned scope, and cross-module analytics / predictive / AI scope, each linked to its owning sprint or module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and explicit ownership invariants.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint begin immediately after this one completes?**
   N/A — `SPR-MOD-004-006` is the terminal sprint for MOD-004. Stage 3 Module Baseline capture (`MOD004_PURCHASE_BASELINE_v1`) follows completion.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)
- Upstream Sprint — [`./SPR-MOD-004-001-purchase-foundation.md`](./SPR-MOD-004-001-purchase-foundation.md)
- Upstream Sprint — [`./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- Upstream Sprint — [`./SPR-MOD-004-003-goods-receipt-inspection.md`](./SPR-MOD-004-003-goods-receipt-inspection.md)
- Upstream Sprint — [`./SPR-MOD-004-004-vendor-billing-3-way-match.md`](./SPR-MOD-004-004-vendor-billing-3-way-match.md)
- Upstream Sprint — [`./SPR-MOD-004-005-purchase-returns-vendor-adjustments.md`](./SPR-MOD-004-005-purchase-returns-vendor-adjustments.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)

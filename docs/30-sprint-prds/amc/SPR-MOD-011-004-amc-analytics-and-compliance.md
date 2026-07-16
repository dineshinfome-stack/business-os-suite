---
title: "SPR-MOD-011-004 — AMC Analytics & Compliance"
summary: "Sprint PRD for the AMC Analytics & Compliance slice of MOD-011: AMC read model, operational reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability), dashboards, exports, and audit-readiness surface. Read-model only. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-011-004"
parent_module: "MOD-011"
parent_sprint_plan: "MOD-011_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "13.0.4"
size: "Small"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "amc", "mod-011", "analytics", "compliance", "read-model", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD011-004-20260716T004000Z-001"
parent_result_id: "GT003-MOD011-003-20260716T003000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-011-004 — AMC Analytics & Compliance

> **Stage 2 deliverable.** Fourth and final authored Sprint PRD for **MOD-011 AMC** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-011-004` (permanent) |
| Parent Module | `MOD-011` — AMC |
| Parent Sprint Plan | [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Small |
| Upstream Sprints | [`SPR-MOD-011-001`](./SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md), [`SPR-MOD-011-002`](./SPR-MOD-011-002-preventive-visit-scheduling.md), [`SPR-MOD-011-003`](./SPR-MOD-011-003-contract-billing-and-renewals.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | — (final AMC sprint) |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver **AMC Analytics & Compliance** for BusinessOS on top of the AMC transactional sprints (`SPR-MOD-011-001` … `SPR-MOD-011-003`): an AMC read model, operational reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability), dashboards, exports, and an audit-readiness surface. This sprint is **read-model only** — it does not author new business transactions, master data, or workflows and does not publish new AMC domain events.

> **AMC Ownership Convention.** The AMC module owns the business semantics of the read-model projections, operational reports, dashboards, exports, and audit-readiness surface surfaced by this sprint. ERP Core Engines provide shared infrastructure (authorization, audit, search, reporting, integration, eventing, notification, export) but **MUST NOT** redefine AMC business semantics. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**; this sprint surfaces AMC operational KPIs and does not redefine cross-module KPIs. Ledger posting, sales-originated invoicing, customer master, field-visit execution, service-desk closures, identity, authentication, and permissions remain exclusive to their owning modules per the AMC Module PRD §13.

#### 1.1.1 AMC Read Model & Report Authority

The **AMC read model** and the operational reports enumerated in §1.2 are authoritatively owned by MOD-011 AMC. No other module MAY publish an equivalent AMC-scoped operational report or dashboard. Cross-module KPIs referenced from these reports are defined once in **MOD-017 Analytics** and consumed here.

#### 1.1.2 AMC ↔ Analytics Boundary

- **MOD-017 Analytics** owns the cross-module KPI catalog. Any KPI referenced by more than one module is defined there.
- **MOD-011 AMC** surfaces AMC operational reports and dashboards within the AMC surface. Where an AMC report cites a cross-module KPI, it consumes the definition from MOD-017 and does not redefine it.

#### 1.1.3 AMC ↔ Transactional Sprints Boundary

- **`SPR-MOD-011-001`** owns Contract, Entitlement, Coverage masters, the Contract transaction lifecycle, AMC operations configuration (initial registration), and `ContractSigned` publication. This sprint reads them read-only and never redefines them.
- **`SPR-MOD-011-002`** owns Visit Schedule transaction, preventive schedule generation, entitlement-consumption tracking, `VisitScheduled` publication, and `FieldVisitCompleted` / `ServiceTicketClosed` consumption. This sprint reads them read-only and never redefines them.
- **`SPR-MOD-011-003`** owns Renewal Terms master, Contract Invoice transaction, Renewal transaction lifecycle, termination handling, auto-renewal rules, `ContractRenewed` publication, `ContractExpired` publication, and `SalesInvoiceIssued` consumption. This sprint reads them read-only and never redefines them.

#### 1.1.4 AMC ↔ Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. AMC consumes these read-only via `ENG-002` Authorization and the identity resolution inherited from `SPR-MOD-011-001`.

#### 1.1.5 Read-Model-Only Boundary

- This sprint MUST NOT create, edit, or void any Contract, Entitlement, Coverage, Visit Schedule, Renewal Terms, Contract Invoice, or Renewal record.
- This sprint MUST NOT publish any new AMC domain event. The AMC-published events (`ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`) are consumed here read-only for projection into the AMC read model.

Ownership boundaries SHALL NOT be redefined in downstream artifacts.

### 1.2 In Scope

- **AMC read model.** Projections that reconstruct AMC state (Contracts, Entitlements, Coverage, Visit Schedules, Renewal Terms, Contract Invoices, Renewals) from AMC-published events and read-only reads of upstream masters/transactions, scoped per tenant/company.
- **Operational reports** (per Module PRD §9 verbatim): **Active Contracts**, **Renewal Pipeline**, **Visit Compliance**, **Contract Profitability**. Rendered via `ENG-021` Reporting.
- **Operational dashboards** surfacing the reports above and AMC operational KPIs, rendered per the authoritative dashboard surface (Module PRD §9 — "Delivered via ENG-022 Dashboard Engine"). This sprint consumes the dashboard surface without redefining it; where `ENG-022` is not listed in the Module PRD engine union for this sprint (§12), dashboard rendering is delivered through `ENG-021` Reporting and the AMC surface without introducing new engine consumption.
- **KPI surfacing.** AMC operational KPIs surfaced in reports and dashboards. Cross-module KPI definitions are consumed from **MOD-017 Analytics** and not redefined here.
- **Exports.** Bulk export of AMC reports in standard formats via `ENG-027` Export.
- **Search.** AMC read-model search (Contracts, Renewals, Contract Invoices, Visit Schedules) via `ENG-020` Search.
- **Integration surface.** Read-only integration endpoints for AMC reports/exports exposed via `ENG-023` Integration, subject to `ENG-002` Authorization and `ADR-011` isolation.
- **Audit-readiness surface.** A read-only surface that exposes every AMC audit record (from `SPR-MOD-011-001` … `SPR-MOD-011-003`) via `ENG-004` for compliance review, filterable per tenant/company, entity, and time range. This sprint does not author audit records — it surfaces those already emitted upstream.
- **Consumption of AMC-published events.** `ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired` consumed via `ENG-024` for read-model projection.
- **Consumption of cross-module events already consumed upstream.** `FieldVisitCompleted`, `ServiceTicketClosed`, `SalesInvoiceIssued` are already consumed by `SPR-MOD-011-002` and `SPR-MOD-011-003` for transactional state; this sprint reflects their downstream effects (entitlement consumption, sales-invoice reconciliation) into the read model without redefining consumption.
- **Notification emission** on report generation completion (e.g. scheduled report runs) via `ENG-025` under the tenant's configured channels.
- **Authorization** on every read-model, report, dashboard, export, integration, and audit-readiness read via `ENG-002` per `ADR-032`.
- **Tenant isolation** on every projection, read, and export per `ADR-011`.

### 1.3 Out of Scope

- Contract, Entitlement, Coverage master data; Contract transaction lifecycle; AMC operations configuration *initial registration*; `ContractSigned` publication — `SPR-MOD-011-001` (this sprint consumes them read-only).
- Visit Schedule transaction, automated preventive schedule generation, entitlement-consumption tracking, `VisitScheduled` publication, `FieldVisitCompleted` / `ServiceTicketClosed` consumption for transactional state — `SPR-MOD-011-002`.
- Renewal Terms master, Contract Invoice transaction, Renewal transaction, termination handling, auto-renewal rules, `ContractRenewed` and `ContractExpired` publication, `SalesInvoiceIssued` consumption for transactional state — `SPR-MOD-011-003`.
- Cross-module KPI definitions — owned by **MOD-017 Analytics**.
- Ledger posting, tax computation, statutory compliance — owned by **MOD-002 Accounting**.
- Sales-originated invoicing lifecycle — owned by **MOD-003 Sales**.
- Customer master and CRM-originating lifecycle — owned by **MOD-006 CRM**.
- Field-visit execution — owned by **MOD-012 Field Service**.
- Service-desk closures — owned by **MOD-016 Service Desk**.
- Identity, authentication, and permission grants — owned by **MOD-001 Platform**.
- Any authoring of new AMC transactions, master data, workflows, or domain events.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-011-004`, the following will exist:

- **Business capabilities.**
  - An AMC read model is available under a tenant/company, projecting Contracts, Entitlements, Coverage, Visit Schedules, Renewal Terms, Contract Invoices, and Renewals from AMC-published events and upstream reads.
  - A Service Manager can view the **Active Contracts**, **Renewal Pipeline**, **Visit Compliance**, and **Contract Profitability** reports via `ENG-021` under a tenant/company.
  - A Service Manager can view AMC operational dashboards surfacing the reports above and AMC operational KPIs.
  - A Contracts Officer can search the AMC read model (Contracts, Renewals, Contract Invoices, Visit Schedules) via `ENG-020`.
  - A Finance user can export AMC reports in standard formats via `ENG-027`.
  - A compliance reviewer can access an audit-readiness surface exposing every AMC audit record (from `SPR-MOD-011-001` … `SPR-MOD-011-003`) via `ENG-004`, filterable per tenant/company, entity, and time range.
- **Domain events.**
  - `ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired` are consumed via `ENG-024` for read-model projection. Payload contracts are governed by the authoritative event catalog and not redefined here.
  - No new AMC domain events are published by this sprint.
- **Configuration artifacts.** *N/A at this sprint boundary.* Report definitions, dashboard bindings, and export presets consumed here reference the AMC configuration namespace registered in `SPR-MOD-011-001` and extended in `SPR-MOD-011-003` without further extension in this sprint.
- **Audit artifacts.** No new audit-producing state-changing transactions exist here. The audit-readiness surface exposes existing audit records via `ENG-004`; access to that surface itself is audited via `ENG-004` per the Platform audit contract.
- **Notification artifacts.** Report generation completions produce notifications via `ENG-025` under the tenant's configured channels.
- **Integration artifacts.** Read-only integration endpoints for AMC reports/exports are exposed via `ENG-023`, subject to `ENG-002` Authorization and `ADR-011` isolation.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-011-004`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema (read-model projections, materialized views, search indices) and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-011 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — all analytics-facing capabilities as read model | AMC read model, operational reports, dashboards, exports, search, audit-readiness surface |
| §3 Personas — Service Manager, Contracts Officer, Sales, Finance | User stories (§4) |
| §9 Reports & Analytics — Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability; Dashboards; KPIs (surfaced); Exports | Reports (§1.2), dashboards, exports via `ENG-027`, KPI surfacing consuming MOD-017 definitions |
| §11 Non-functional — Compliance; retention rules; regulated reports live in §9 | Audit-readiness surface exposing AMC audit records via `ENG-004` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved AMC Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) §4 allocates the AMC analytics read-model surface (Module PRD §9) to this sprint as its originating sprint. No other AMC sprint claims the AMC analytics read-model surface, the AMC operational reports, dashboards, exports, search, or audit-readiness surface as originating capabilities.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability, dashboards, KPIs, exports) and §11 (audit readiness) → this Sprint PRD → deliverables in §2 (AMC read model, four operational reports, dashboards, search, exports, integration, audit-readiness surface).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Service Manager, I want the **Active Contracts** report to list contracts in `active` state under a tenant/company with their coverage window, entitlements summary, and next renewal date, so that I can operate the active contract portfolio.*
- **US-002.** *As a Contracts Officer, I want the **Renewal Pipeline** report to list contracts with upcoming or in-flight renewals (renewal state, notice-period status, auto-renewal eligibility), so that I can drive the renewal cadence.*
- **US-003.** *As a Service Manager, I want the **Visit Compliance** report to compare Visit Schedules against completed field visits (via `FieldVisitCompleted` consumption reflected in upstream state), so that I can track SLA compliance against entitlements.*
- **US-004.** *As a Finance user, I want the **Contract Profitability** report to combine Contract Invoices, reconciled sales-originated invoices (via `SalesInvoiceIssued`), and consumed entitlements per Contract, so that I can review contract profitability.*
- **US-005.** *As a Service Manager, I want AMC operational dashboards that surface the four reports above and AMC operational KPIs, so that I have a single AMC operational surface.*
- **US-006.** *As a Contracts Officer, I want to search the AMC read model (Contracts, Renewals, Contract Invoices, Visit Schedules) via `ENG-020`, so that I can locate AMC records quickly.*
- **US-007.** *As a Finance user, I want to export AMC reports in standard formats via `ENG-027`, so that I can share AMC data with downstream systems and external stakeholders.*
- **US-008.** *As a downstream integrator, I want to read AMC reports and exports through the AMC integration surface via `ENG-023`, so that authorised external consumers can obtain AMC data without bypassing tenant isolation.*
- **US-009.** *As a compliance reviewer, I want an audit-readiness surface that exposes every AMC audit record emitted upstream via `ENG-004`, filterable per tenant/company, entity, and time range, so that I can reconstruct AMC history from an authoritative log.*
- **US-010.** *As a downstream subscriber, I want the AMC read model to project deterministically from `ContractSigned`, `VisitScheduled`, `ContractRenewed`, and `ContractExpired` consumed via `ENG-024`, so that read-model state converges to the authoritative transactional state.*
- **US-011.** *As a Service Manager, I want notifications on report generation completion via `ENG-025`, so that scheduled report runs are observable under the tenant's configured channels.*
- **US-012.** *As a security reviewer, I want every AMC read-model, report, dashboard, export, integration, and audit-readiness read gated by `ENG-002` under `ADR-032` and scoped by tenant per `ADR-011`, so that no cross-tenant access can occur.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Active Contracts report (US-001)

- **Given** a tenant/company with Contracts owned by `SPR-MOD-011-001` in state `active`,
  **when** a Service Manager requests the Active Contracts report via `ENG-021`,
  **then** the report lists exactly those `active` Contracts under the caller's tenant/company, with coverage window, entitlement summary, and next renewal date derived from the AMC read model.
- **Given** a Contract not in state `active` (e.g. `draft`, `signed`, `terminated`),
  **when** the Active Contracts report is requested,
  **then** it does not appear in the report.

### 5.2 Renewal Pipeline report (US-002)

- **Given** Contracts with Renewal Terms and Renewals owned by `SPR-MOD-011-003` under a tenant/company,
  **when** a Contracts Officer requests the Renewal Pipeline report via `ENG-021`,
  **then** the report lists Contracts with in-flight Renewals (`proposed`, `approved`) or with upcoming renewal windows, showing renewal state, notice-period status (evaluated against the notice-period rule owned by `SPR-MOD-011-003`), and auto-renewal eligibility.
- **Given** a Contract whose Renewal has already transitioned to `renewed`, `rejected`, or `lapsed`,
  **when** the Renewal Pipeline report is requested,
  **then** that Renewal does not appear as in-flight (it MAY appear as historical only if the report defines a historical view).

### 5.3 Visit Compliance report (US-003)

- **Given** Visit Schedules owned by `SPR-MOD-011-002` under a tenant/company and the entitlement-consumption state maintained by that sprint from `FieldVisitCompleted` and `ServiceTicketClosed`,
  **when** a Service Manager requests the Visit Compliance report via `ENG-021`,
  **then** the report reflects scheduled vs. completed visits per Contract, entitlement, and coverage window, derived from the AMC read model.
- **Given** a Contract outside its coverage window,
  **when** the Visit Compliance report is requested,
  **then** the coverage-window rule owned by `SPR-MOD-011-002` is not redefined; the report reflects the upstream-owned state exclusively.

### 5.4 Contract Profitability report (US-004)

- **Given** Contract Invoices owned by `SPR-MOD-011-003`, `SalesInvoiceIssued` reconciliations already applied by `SPR-MOD-011-003`, and entitlement-consumption state maintained by `SPR-MOD-011-002`,
  **when** a Finance user requests the Contract Profitability report via `ENG-021`,
  **then** the report combines invoiced revenue (AMC and reconciled sales-originated), consumed entitlement cost inputs, and Contract-level aggregation under the caller's tenant/company.
- **Given** a Contract in a different tenant/company than the caller,
  **when** the Contract Profitability report is requested,
  **then** that Contract does not appear (per `ADR-011`).

### 5.5 Dashboards (US-005)

- **Given** an AMC operational dashboard bound to the four reports and AMC operational KPIs,
  **when** a Service Manager opens it,
  **then** it surfaces the four reports and AMC operational KPIs under the caller's tenant/company via `ENG-021`.
- **Given** a KPI defined by **MOD-017 Analytics**,
  **when** the dashboard cites it,
  **then** it consumes the MOD-017 definition and does not redefine it.

### 5.6 Search (US-006)

- **Given** the AMC read model under a tenant/company,
  **when** a Contracts Officer issues a search via `ENG-020` on Contracts, Renewals, Contract Invoices, or Visit Schedules,
  **then** results are restricted to the caller's tenant/company per `ADR-011` and filtered by `ENG-002` authorization per `ADR-032`.

### 5.7 Exports (US-007)

- **Given** any of the four AMC reports for the caller's tenant/company,
  **when** a Finance user requests an export via `ENG-027`,
  **then** the export is produced in a standard format governed by `ENG-027` and no data outside the caller's tenant/company is included.

### 5.8 Integration surface (US-008)

- **Given** a downstream integrator authenticated per `ENG-002` under `ADR-032`,
  **when** the integrator requests an AMC report or export through the AMC integration surface via `ENG-023`,
  **then** the request is authorised, tenant-scoped per `ADR-011`, and served read-only.
- **Given** an unauthenticated or unauthorised integrator,
  **when** the request is submitted,
  **then** it is rejected deterministically.

### 5.9 Audit-readiness surface (US-009)

- **Given** AMC audit records emitted upstream by `SPR-MOD-011-001` … `SPR-MOD-011-003` via `ENG-004`,
  **when** a compliance reviewer queries the audit-readiness surface,
  **then** the surface returns those records filtered by tenant/company, entity, and time range per `ADR-011`.
- **Given** any access to the audit-readiness surface itself,
  **when** the access occurs,
  **then** it is audited via `ENG-004` per the Platform audit contract, without this sprint redefining audit semantics.

### 5.10 Read-model projection (US-010)

- **Given** an AMC-published event (`ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`) consumed via `ENG-024`,
  **when** it is applied to the AMC read model,
  **then** the resulting projection is deterministic, idempotent, and converges to the authoritative transactional state owned by the corresponding upstream sprint.
- **Given** an event whose tenant/company scope does not match a known AMC read-model partition,
  **when** it is delivered,
  **then** it is ignored deterministically (no projection change).

### 5.11 Notification emission (US-011)

- **Given** a scheduled report run completing,
  **when** it completes (success or failure),
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.12 Authorization and isolation (US-012)

- **Given** any AMC read-model, report, dashboard, export, integration, or audit-readiness read,
  **when** it executes,
  **then** authorization is enforced via `ENG-002` per `ADR-032` and tenant isolation is enforced per `ADR-011`; no cross-tenant read can succeed.

### 5.13 Read-model-only invariants

- **Given** any code path in this sprint,
  **when** it executes,
  **then** it MUST NOT create, edit, or void a Contract, Entitlement, Coverage, Visit Schedule, Renewal Terms, Contract Invoice, or Renewal record.
- **Given** any code path in this sprint,
  **when** it executes,
  **then** it MUST NOT publish any AMC domain event.

### 5.14 Ownership consumption invariants

- **Given** any read that requires Contract, Entitlement, Coverage, Visit Schedule, Renewal Terms, Contract Invoice, or Renewal state,
  **when** it executes,
  **then** it does so read-only against the masters/transactions owned by `SPR-MOD-011-001` … `SPR-MOD-011-003`; none of those entities are redefined here.
- **Given** any KPI cited by an AMC report or dashboard that is defined by **MOD-017 Analytics**,
  **when** it is surfaced,
  **then** the MOD-017 definition is consumed and not redefined.
- **Given** any AMC code path that would require ledger data, sales-invoice lifecycle, customer master, field-visit execution, service-desk closure semantics, or identity/authorization grants,
  **when** it needs that data,
  **then** it consumes the owning module's contract read-only and does not redefine it.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-011` — AMC.
- **Module PRD:** [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (analytics-facing capabilities as read model), §3 (Personas), §9 (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability; Dashboards; KPIs surfaced; Exports), §11 (Compliance; audit readiness), §12 (Engine consumption), §13 (Dependencies).

---

## 7. Dependencies

- **Parent:** `MOD-011` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master consumed read-only via Contract bindings owned by `SPR-MOD-011-001`.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-011-001`, `SPR-MOD-011-002`, `SPR-MOD-011-003`.
- **Cross-module consumption (events only, indirect):**
  - `FieldVisitCompleted` originated by **MOD-012 Field Service** — already consumed by `SPR-MOD-011-002`; this sprint reflects its downstream effect in the AMC read model without redefining consumption.
  - `ServiceTicketClosed` originated by **MOD-016 Service Desk** — already consumed by `SPR-MOD-011-002`; same treatment.
  - `SalesInvoiceIssued` originated by **MOD-003 Sales** — already consumed by `SPR-MOD-011-003`; same treatment.
- **Cross-module KPI consumption:** cross-module KPI definitions consumed from **MOD-017 Analytics**; not redefined here.
- **Downstream sprints:** none (final AMC sprint).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the AMC Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every read-model, report, dashboard, export, integration, and audit-readiness read per `ADR-032`. |
| `ENG-004` Audit | Surfaces AMC audit records emitted by `SPR-MOD-011-001` … `SPR-MOD-011-003` through the audit-readiness surface; access to that surface itself is audited via `ENG-004` per the Platform audit contract. |
| `ENG-020` Search | Indexes and searches the AMC read model (Contracts, Renewals, Contract Invoices, Visit Schedules). |
| `ENG-021` Reporting | Renders Active Contracts, Renewal Pipeline, Visit Compliance, and Contract Profitability reports, plus AMC operational dashboards. |
| `ENG-023` Integration | Exposes read-only AMC report/export integration endpoints. |
| `ENG-024` Eventing | Consumes `ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired` for read-model projection. No AMC event publication in this sprint. |
| `ENG-025` Notification | Emits notifications on report generation completion under the tenant's configured channels. |
| `ENG-027` Export | Produces bulk exports of AMC reports in standard formats. |

`ENG-016` Posting is **not** consumed by this sprint. AMC business semantics (read-model projection determinism, operational report definitions, audit-readiness surface, read-model-only invariants) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every read-model projection, report, dashboard, export, integration, and audit-readiness read, and on every event application. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every read-model, report, dashboard, export, integration, and audit-readiness read. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| AMC Read Model Projection | MOD-011 (this sprint) | A derived, tenant-scoped, read-only projection of Contracts, Entitlements, Coverage, Visit Schedules, Renewal Terms, Contract Invoices, and Renewals, converging to authoritative upstream state. |
| AMC Report Definition | MOD-011 (this sprint) | Report metadata for Active Contracts, Renewal Pipeline, Visit Compliance, and Contract Profitability, consumed by `ENG-021`. |
| AMC Dashboard Binding | MOD-011 (this sprint) | Binding of AMC reports and AMC operational KPIs into the AMC operational dashboard surface. |
| AMC Audit-Readiness View | MOD-011 (this sprint) | Read-only view over upstream AMC audit records, filterable per tenant/company, entity, and time range. |

### 10.2 Relationships

- The **AMC Read Model Projection** references, read-only, the Contracts, Entitlements, Coverage, Visit Schedules, Renewal Terms, Contract Invoices, and Renewals owned by `SPR-MOD-011-001` … `SPR-MOD-011-003`.
- **AMC Report Definitions** reference the AMC Read Model Projection and MOD-017-defined KPIs.
- **AMC Dashboard Bindings** reference AMC Report Definitions and AMC operational KPIs.
- **AMC Audit-Readiness View** references audit records produced by `ENG-004` for AMC entities.

### 10.3 Ownership Boundaries

- Entities listed here are owned by `MOD-011` per the AMC Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Contract**, **Entitlement**, **Coverage**, **Visit Schedule**, **Renewal Terms**, **Contract Invoice**, and **Renewal** entities are owned by `SPR-MOD-011-001` … `SPR-MOD-011-003` and are consumed read-only here.
- Cross-module KPI definitions are owned by **MOD-017 Analytics**; not redefined here.
- Audit records surfaced through the AMC Audit-Readiness View are owned by `ENG-004` per the Platform audit contract.

Physical schema (materialized views, projections, search indices) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **None.** Per Sprint Plan §2 (`SPR-MOD-011-004`), no domain events are originated by this sprint.

### 11.2 Consumed

- **`ContractSigned`** — originated by `SPR-MOD-011-001` (MOD-011), consumed read-only via `ENG-024` for read-model projection.
- **`VisitScheduled`** — originated by `SPR-MOD-011-002` (MOD-011), consumed read-only via `ENG-024` for read-model projection.
- **`ContractRenewed`** — originated by `SPR-MOD-011-003` (MOD-011), consumed read-only via `ENG-024` for read-model projection.
- **`ContractExpired`** — originated by `SPR-MOD-011-003` (MOD-011), consumed read-only via `ENG-024` for read-model projection.

Payload contracts for these events are declared in the event catalog; this PRD does not redefine them. Cross-module events (`FieldVisitCompleted`, `ServiceTicketClosed`, `SalesInvoiceIssued`) are already consumed by earlier AMC sprints; this sprint reflects their downstream effects in the read model without redefining consumption. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every read-model projection, report, dashboard, export, integration, and audit-readiness read, and on every event application.
- [ ] Authorization invariants (`ADR-032`) are enforced on every read-model, report, dashboard, export, integration, and audit-readiness read via `ENG-002`.
- [ ] The AMC read model projects deterministically and idempotently from `ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired` consumed via `ENG-024`.
- [ ] The four operational reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability) are rendered via `ENG-021` under a tenant/company.
- [ ] AMC operational dashboards surface the four reports and AMC operational KPIs.
- [ ] AMC read-model search is available via `ENG-020` on Contracts, Renewals, Contract Invoices, and Visit Schedules.
- [ ] Bulk export of AMC reports is available via `ENG-027` in standard formats.
- [ ] Read-only AMC integration endpoints are exposed via `ENG-023`, subject to `ENG-002` and `ADR-011`.
- [ ] The audit-readiness surface exposes upstream AMC audit records via `ENG-004`, filterable per tenant/company, entity, and time range; access to the surface itself is audited via `ENG-004`.
- [ ] Notifications on report generation completion are emitted via `ENG-025` under the tenant's configured channels.
- [ ] No new AMC transactions, master data, workflows, or domain events are authored by this sprint.
- [ ] `ENG-016` Posting is **not** invoked by AMC.
- [ ] Cross-module KPI definitions are consumed from MOD-017 Analytics and not redefined.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-011_SPRINT_PLAN.md` §2 (`SPR-MOD-011-004`):

- Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
- Reports render via `ENG-021`; exports via `ENG-027`.
- Audit readiness surface exposes every AMC event emitted during the sprint sequence.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-011 Sprint 4 depends on `SPR-MOD-011-001` … `SPR-MOD-011-003` being complete and the AMC transactional state (Contracts, Entitlements, Coverage, Visit Schedules, Renewal Terms, Contract Invoices, Renewals) plus the AMC-published events being available.
  - **Impact:** Any regression against `SPR-MOD-011-001` … `SPR-MOD-011-003` blocks this sprint.
  - **Mitigation:** Rely on the AMC transactional contracts authored in the three predecessor sprints; treat any regression as a foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-011 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen for tenancy, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Cross-module KPI definitions are owned by MOD-017 Analytics. If MOD-017 does not yet define a KPI cited by an AMC report or dashboard, that KPI cannot be surfaced without redefining it here.
  - **Impact:** AMC dashboards or reports that cite an undefined cross-module KPI would either omit it or violate the AMC ↔ Analytics boundary.
  - **Mitigation:** During implementation, gate any cross-module KPI reference against a MOD-017 producer-readiness contract; if the KPI is not defined, record it as a deferred item and omit it from the AMC surface until MOD-017 defines it. The AMC Sprint boundary is unchanged.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** The AMC read-model projection depends on AMC-published events (`ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`) being registered in the authoritative event catalog and delivered per `ENG-024`.
  - **Impact:** If any of these events is not registered, the corresponding projection path cannot be exercised end-to-end.
  - **Mitigation:** Confirm event catalog registration for all four consumed events before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** As the final AMC sprint, scope-creep into net-new AMC transactions, master data, workflows, or events would violate the read-model-only boundary of this sprint.
  - **Impact:** Silent absorption of transactional scope would break the read-model-only invariant (§5.13) and would require re-authoring an upstream sprint.
  - **Mitigation:** Enforce the §1.3 out-of-scope list and §5.13 read-model-only invariants at every implementation review gate.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** AMC reports, dashboards, exports, search, integration surface, and audit-readiness surface MUST NOT be redefined by downstream modules; MOD-017 Analytics KPI definitions MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment AMC analytics and break traceability.
  - **Mitigation:** Enforce the AMC Read Model & Report Authority (§1.1.1) and the AMC ↔ Analytics / Transactional / Platform boundaries (§1.1.2, §1.1.3, §1.1.4) at every downstream gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 4 consumes `ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`. Any event name not present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration for all four consumed AMC events before this sprint enters `In Progress`.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — read-model projection determinism per consumed event; report definition validation; dashboard binding validation; audit-readiness filter invariants.
- **Integration** — authorization via `ENG-002`; audit surfacing via `ENG-004`; search via `ENG-020`; report rendering via `ENG-021`; integration surface via `ENG-023`; event consumption via `ENG-024`; notification emission via `ENG-025`; export production via `ENG-027`.
- **Contract** — `ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired` consumption payload contracts per the authoritative event catalog (read-only consumption; no redefinition).
- **End-to-end (smoke)** — AMC read-model projection from a synthetic event stream converges to expected state → four reports render via `ENG-021` → dashboards surface the four reports and AMC operational KPIs → search on Contracts/Renewals/Invoices/Visit Schedules returns tenant-scoped results via `ENG-020` → export via `ENG-027` → integration surface serves reports/exports via `ENG-023` → audit-readiness surface returns upstream AMC audit records via `ENG-004`; two-tenant / two-company smoke fixture to verify `ADR-011` isolation on every read path.

Sprint-specific fixtures: a two-company smoke fixture, a synthetic AMC event-stream fixture spanning `SPR-MOD-011-001` … `SPR-MOD-011-003` outputs, and a MOD-017 KPI-definition fixture for KPI surfacing tests.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider projecting the AMC read model behind idempotent event handlers keyed by (event-id, projection-partition) so re-delivery cannot corrupt state.
- Consider centralizing the four report definitions behind a single AMC report registry so downstream refinements (e.g. new columns, new filters) touch a single authoritative binding.
- Consider tenancy-scoping the search index at the earliest boundary so §5.6 isolation is inherited by every downstream search without additional code.
- Consider routing every export request through a single `ENG-027` invocation point so authorization and tenancy filtering are enforced once per export.
- Consider modeling the audit-readiness surface as a read-only projection over `ENG-004` records rather than a re-emission of audits, so no audit duplication occurs.
- Consider gating any KPI reference against a MOD-017 KPI-registry lookup so KPIs undefined upstream fail closed rather than being redefined here.
- Consider making the integration surface (§5.8) a thin authorization + tenancy wrapper around the same read paths used by the AMC UI, so behaviour is uniform across surfaces.

These notes are **non-authoritative** and MAY be superseded by implementation decisions provided the acceptance criteria (§5), Definition of Done (§12), and Sprint Exit Criteria (§13) continue to hold.

---

## 17. Review Gate

This Sprint PRD MUST pass review against the released GT-003 Sprint Authoring template under Governance Framework v1.0 before it is registered in the Sprint Catalog. The Review Gate binds:

- Every canonical GT-003 section is present.
- Traceability to the Module PRD and Sprint Plan is bidirectional.
- Registration is limited to GT-003-declared surfaces.
- Ownership boundaries §1.1.1–§1.1.5 are preserved.
- Read-model-only invariants (§5.13) are stated as acceptance criteria.
- Acceptance criteria §5 cover every user story §4.
- Sprint Exit Criteria §13 are verbatim from the Sprint Plan.
- Governance Template Dependencies §7.1 are stated and resolved.

Failure at any binding blocks registration.

---

## 18. References

- [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md)
- [`docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md)
- [`docs/30-sprint-prds/amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](./SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md)
- [`docs/30-sprint-prds/amc/SPR-MOD-011-002-preventive-visit-scheduling.md`](./SPR-MOD-011-002-preventive-visit-scheduling.md)
- [`docs/30-sprint-prds/amc/SPR-MOD-011-003-contract-billing-and-renewals.md`](./SPR-MOD-011-003-contract-billing-and-renewals.md)
- [`docs/30-sprint-prds/amc/README.md`](./README.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- [`docs/DOCUMENT_INDEX.md`](../../DOCUMENT_INDEX.md)
- [`docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- [`docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`](../../15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)

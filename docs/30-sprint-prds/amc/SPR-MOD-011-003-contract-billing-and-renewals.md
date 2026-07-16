---
title: "SPR-MOD-011-003 — Contract Billing & Renewals"
summary: "Sprint PRD for the Contract Billing & Renewals slice of MOD-011: Renewal Terms master, Contract Invoice transaction (upfront and periodic), Renewal transaction lifecycle, termination handling, and auto-renewal rules. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-011-003"
parent_module: "MOD-011"
parent_sprint_plan: "MOD-011_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "13.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-015", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "amc", "mod-011", "billing", "renewals", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD011-003-20260716T003000Z-001"
parent_result_id: "GT003-MOD011-002-20260716T002000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-011-003 — Contract Billing & Renewals

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-011 AMC** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-011-003` (permanent) |
| Parent Module | `MOD-011` — AMC |
| Parent Sprint Plan | [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-011-001`](./SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-011-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver **Contract Billing & Renewals** for BusinessOS on top of the AMC Foundation authored in `SPR-MOD-011-001`: the Renewal Terms master, the Contract Invoice transaction (upfront and periodic) issued via `ENG-015` Voucher, the Renewal transaction lifecycle governed by `ENG-010` and `ENG-011`, termination handling, and auto-renewal rules driven by `ENG-014` Scheduler and `ENG-012` Rules. This sprint completes the Renewal cycle and Termination business processes owned by AMC.

> **AMC Ownership Convention.** The AMC module owns the business semantics of the Renewal Terms master, the Contract Invoice transaction (upfront and periodic), the Renewal transaction lifecycle, termination handling, auto-renewal rules, the notice-period rule, and the post-termination entitlement-block rule. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, workflow, approval, rules, scheduling, voucher, numbering, eventing, notification) but **MUST NOT** redefine AMC business rules. Ledger posting remains exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting; AMC issues Contract Invoices through `ENG-015` and never invokes `ENG-016` directly. Sales-originated invoicing remains exclusive to **MOD-003 Sales**; AMC consumes `SalesInvoiceIssued` read-only for reconciliation. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Customer master remains exclusive to **MOD-006 CRM**.

#### 1.1.1 Renewal Terms & Contract Invoice Transaction Authority

The **Renewal Terms** master and the **Contract Invoice** transaction are authoritatively owned by MOD-011 AMC. No other module MAY create, edit, void, or independently maintain a parallel Renewal Terms record or Contract Invoice. Downstream sprints and modules consume these entities through the AMC-owned events `ContractRenewed` and `ContractExpired` published in this sprint and the AMC read APIs authored here; they MUST NOT redefine the transaction or its lifecycle.

#### 1.1.2 Renewal Transaction Authority

The **Renewal** transaction lifecycle is authoritatively owned by MOD-011 AMC. Downstream modules react to renewal outcomes exclusively through `ContractRenewed` and `ContractExpired`; they MUST NOT re-implement renewal approval or auto-renewal semantics.

#### 1.1.3 AMC ↔ Accounting Boundary (Ledger Posting)

- **MOD-002 Accounting** owns the ledger effect of every Contract Invoice via `ENG-016` Posting and posting-rule bindings triggered by AMC-published events and `ENG-015` Voucher issuance.
- **MOD-011 AMC** issues Contract Invoices via `ENG-015` Voucher and publishes `ContractRenewed` and `ContractExpired`, but **MUST NOT** invoke `ENG-016` Posting directly and **MUST NOT** author journal entries. Tax computation and statutory compliance for Contract Invoices remain owned by MOD-002.

#### 1.1.4 AMC ↔ Sales Boundary (Sales Invoice Reconciliation)

- **MOD-003 Sales** originates `SalesInvoiceIssued` per the authoritative event catalog for sales-originated invoicing.
- **MOD-011 AMC** consumes `SalesInvoiceIssued` read-only to reconcile sales-originated contract invoicing against Contracts owned by `SPR-MOD-011-001`. Sales semantics are **not** redefined here.

#### 1.1.5 AMC ↔ Foundation Boundary

- The Contract, Entitlement, and Coverage masters remain owned by `SPR-MOD-011-001`. This sprint reads them read-only and writes Renewal Terms records scoped to a Contract without redefining the Contract lifecycle, coverage semantics, or entitlement definitions.
- AMC operations configuration (SLA definitions, escalation policies, numbering series) registered in `SPR-MOD-011-001` is **extended** here with billing- and renewal-specific keys (notice periods, auto-renewal rules) via `ENG-005`, using the same configuration namespace and precedence rules.

#### 1.1.6 AMC ↔ Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. AMC consumes these read-only via `ENG-002` Authorization and the identity resolution inherited from `SPR-MOD-011-001`.

Ownership boundaries SHALL NOT be redefined in downstream AMC Sprint PRDs.

### 1.2 In Scope

- Renewal Terms master (create, update, archive) scoped to a Contract under a tenant/company. Every Renewal Terms record references exactly one Contract owned by `SPR-MOD-011-001` within the same company.
- Contract Invoice transaction (upfront and periodic): create, issue, and void, referencing an `active` Contract under a tenant/company. Issuance occurs through `ENG-015` Voucher; document numbers issue through `ENG-017` Numbering.
- Contract Invoice lifecycle (`draft → issued → void`) enforced via `ENG-010` Workflow.
- Renewal transaction lifecycle (`proposed → approved → renewed | rejected | lapsed`) enforced via `ENG-010` Workflow and `ENG-011` Approval, driven by Renewal Terms and AMC configuration resolved via `ENG-005`.
- Termination handling: the Contract transition to `terminated` (owned by `SPR-MOD-011-001`) is orchestrated here through the Renewal outcome path and through explicit termination requests, with the post-termination entitlement-block rule enforced via `ENG-012`.
- Auto-renewal rules: automated Renewal proposal creation on schedule via `ENG-014` Scheduler, gated by tenant-configured auto-renewal rules resolved via `ENG-005` and evaluated via `ENG-012`.
- Enforcement of the Module PRD §7 rules: *"Renewal proposals must be issued before the notice period ends"* and *"Terminated contracts cannot accept new entitlements"*. Both enforced via `ENG-012` Rules.
- Extension of the AMC configuration namespace (registered in `SPR-MOD-011-001`) with Module PRD §10 keys **Notice periods** and **Auto-renewal rules** via `ENG-005`, using the same precedence and inheritance model.
- `ContractRenewed` and `ContractExpired` domain events published via `ENG-024` on the corresponding Renewal outcomes and Contract expiry transitions.
- Read-only consumption of `SalesInvoiceIssued` (originated by MOD-003 Sales) via `ENG-024` to reconcile sales-originated contract invoicing against the referenced Contract.
- Contract Invoice document artifact production via `ENG-007` Document (rendering only; posting is external).
- Notification emission on Renewal state transitions, Contract expiry, and Contract Invoice issuance via `ENG-025` under the tenant's configured channels.
- Structural validation (required fields, referential integrity, same-company invariants, contract-state invariants, notice-period rule, post-termination entitlement-block rule) via `ENG-012` at capture time.
- Audit emission via `ENG-004` for every Renewal Terms mutation, every Contract Invoice lifecycle transition, every Renewal lifecycle transition, and every Contract-expiry transition orchestrated by this sprint.

### 1.3 Out of Scope

- Contract, Entitlement, Coverage master data; Contract transaction lifecycle registration; AMC operations configuration *initial registration*; `ContractSigned` publication — `SPR-MOD-011-001` (this sprint consumes and extends them without redefining them).
- Visit Schedule transaction, automated preventive schedule generation, entitlement-consumption tracking, `VisitScheduled` publication, `FieldVisitCompleted` / `ServiceTicketClosed` consumption — `SPR-MOD-011-002`.
- AMC read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-011-004`.
- Ledger posting for Contract Invoices and Contract expiry: journal entries, tax computation, statutory compliance — owned by **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting.
- Sales-originated invoicing lifecycle and the origination of `SalesInvoiceIssued` — owned by **MOD-003 Sales**.
- Customer master and CRM-originating lifecycle — owned by **MOD-006 CRM**.
- Identity, authentication, and permission grants — owned by **MOD-001 Platform**.
- Cross-module KPI definitions — owned by **MOD-017 Analytics**.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-011-003`, the following will exist:

- **Business capabilities.**
  - A Contracts Officer can define Renewal Terms scoped to a Contract owned by `SPR-MOD-011-001` under a tenant/company.
  - A Billing Officer can create, issue, and void Contract Invoices (upfront and periodic) against an `active` Contract, with document numbers issued via `ENG-017` and issuance orchestrated via `ENG-015` Voucher.
  - A Contracts Officer can drive a Renewal through its lifecycle (`proposed → approved → renewed | rejected | lapsed`), enforced via `ENG-010` Workflow and `ENG-011` Approval.
  - Auto-renewal proposals are generated automatically on schedule via `ENG-014` Scheduler, gated by tenant-configured auto-renewal rules resolved via `ENG-005`.
  - Termination handling advances the Contract lifecycle transition to `terminated` (via the authority owned by `SPR-MOD-011-001`) through Renewal outcomes and explicit termination requests, with the post-termination entitlement-block rule enforced via `ENG-012`.
  - The notice-period rule is enforced deterministically via `ENG-012` at Renewal proposal capture time.
- **Domain events.**
  - `ContractRenewed` is published via `ENG-024` when a Renewal completes with a `renewed` outcome.
  - `ContractExpired` is published via `ENG-024` when a Contract expires (lapsed renewal or explicit termination path).
  - `SalesInvoiceIssued` is consumed via `ENG-024`. Payload contract is governed by the authoritative event catalog and not redefined here.
- **Configuration artifacts.** The AMC operations configuration namespace registered in `SPR-MOD-011-001` is extended, under the same namespace and precedence rules, with the Module PRD §10 keys **Notice periods** and **Auto-renewal rules** resolvable via `ENG-005`.
- **Document artifacts.** Contract Invoice documents are rendered via `ENG-007` Document.
- **Audit artifacts.** An audit record exists for every Renewal Terms mutation, every Contract Invoice lifecycle transition, every Renewal lifecycle transition, and every Contract-expiry transition orchestrated by this sprint, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Renewal state transitions, Contract expiry, and Contract Invoice issuance produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-011-003`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-011 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Contract billing (upfront/periodic); Renewals and terminations; submodules Billing, Renewals | Contract Invoice transaction, Renewal transaction, termination handling, auto-renewal rules |
| §3 Personas — Contracts Officer, Billing Officer, Service Manager; Customer | User stories (§4) |
| §4 Business Processes — Renewal cycle, Termination | End-to-end Renewal lifecycle and Contract termination path |
| §5 Master Data — Renewal Terms | Renewal Terms master authoring |
| §6 Transactions — Contract Invoice, Renewal | Contract Invoice and Renewal transaction lifecycles |
| §7 Business Rules — "Renewal proposals must be issued before the notice period ends"; "Terminated contracts cannot accept new entitlements" | Notice-period rule and post-termination entitlement-block rule enforced via `ENG-012` |
| §8 Integration Points — `ContractRenewed`, `ContractExpired` (published); `SalesInvoiceIssued` (consumed) | `ContractRenewed` and `ContractExpired` publication via `ENG-024`; consumption of `SalesInvoiceIssued` via `ENG-024` |
| §10 Configuration — Notice periods, Auto-renewal rules | Extension of the AMC configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved AMC Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Contract billing (upfront/periodic) (§2) | `SPR-MOD-011-003` |
| Renewals and terminations (§2) | `SPR-MOD-011-003` |

These allocations are unique; no other AMC sprint claims "Contract billing (upfront/periodic)" or "Renewals and terminations" as originating capabilities. The **Renewal Terms** master and the **Contract Invoice** and **Renewal** transactions are originating-allocated to this sprint per Sprint Plan §4.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Contract billing (upfront/periodic)* and *Renewals and terminations*, and submodules *Billing* and *Renewals* → this Sprint PRD → deliverables in §2 (Renewal Terms master, Contract Invoice lifecycle, Renewal lifecycle, termination handling, auto-renewal rules, notice-period rule enforcement, post-termination entitlement-block rule enforcement, `ContractRenewed` and `ContractExpired` publication, `SalesInvoiceIssued` consumption, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Contracts Officer, I want to define Renewal Terms scoped to a Contract under a company, so that renewal cadence, notice periods, and auto-renewal behaviour are captured authoritatively.*
- **US-002.** *As a Billing Officer, I want to create, issue, and void Contract Invoices (upfront and periodic) against an `active` Contract, so that AMC revenue is captured through `ENG-015` Voucher with deterministic numbering via `ENG-017`.*
- **US-003.** *As a Contracts Officer, I want to drive a Renewal through its lifecycle (`proposed → approved → renewed | rejected | lapsed`), so that renewal decisions are governed by workflow and approval.*
- **US-004.** *As a Service Manager, I want auto-renewal proposals to be generated automatically on schedule when tenant-configured auto-renewal rules permit, so that renewal cadence is deterministic and audit-traceable.*
- **US-005.** *As a Contracts Officer, I want the notice-period rule enforced at Renewal proposal capture time, so that no renewal proposal can be issued after the contract's notice period ends.*
- **US-006.** *As a Contracts Officer, I want a Contract to transition to `terminated` deterministically through Renewal outcomes and explicit termination requests, so that termination handling is coherent with the Contract lifecycle owned by `SPR-MOD-011-001`.*
- **US-007.** *As a Contracts Officer, I want the post-termination entitlement-block rule enforced, so that terminated contracts cannot accept new entitlements.*
- **US-008.** *As a downstream subscriber (Accounting, Analytics), I want `ContractRenewed` and `ContractExpired` to be published on the corresponding outcomes, so that downstream modules can react without polling AMC state.*
- **US-009.** *As a Billing Officer, I want Contract Invoices to be reconciled against `SalesInvoiceIssued` when the sales invoice references an AMC-covered Contract, so that sales-originated contract invoicing is reflected in AMC without redefining sales semantics.*
- **US-010.** *As a Billing Officer, I want Contract Invoice documents rendered via `ENG-007`, so that a document artifact exists per issued invoice under the tenant's configured document template.*
- **US-011.** *As a Contracts Officer, I want notifications on Renewal state transitions, Contract expiry, and Contract Invoice issuance, so that stakeholders are informed under the tenant's configured channels.*
- **US-012.** *As a security reviewer, I want every Renewal Terms mutation, Contract Invoice lifecycle transition, Renewal lifecycle transition, and Contract-expiry transition audited via `ENG-004`, so that I can reconstruct billing and renewal history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Renewal Terms authoring (US-001)

- **Given** a valid Renewal Terms request under a tenant/company referencing an existing Contract in the same company,
  **when** a Contracts Officer submits it,
  **then** the Renewal Terms record is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to bind Renewal Terms to a non-existent Contract, or to a Contract in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Contract Invoice authoring and lifecycle (US-002)

- **Given** a valid Contract Invoice request under a tenant/company referencing an `active` Contract in the same company,
  **when** a Billing Officer submits it,
  **then** the Contract Invoice is persisted in `draft`, receives a document number via `ENG-017`, and is audited.
- **Given** a Contract Invoice in `draft`,
  **when** a Billing Officer issues it,
  **then** it transitions to `issued` via `ENG-010` and `ENG-015` Voucher records the issuance; ledger posting occurs externally via MOD-002 posting-rule bindings (not authored here); the transition is audited.
- **Given** a Contract Invoice in `issued`,
  **when** a legitimate void is submitted,
  **then** it transitions to `void` via `ENG-010`, and the transition is audited.
- **Given** an attempt to bind a Contract Invoice to a Contract that is not `active`, or to a Contract in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.
- **Given** an attempt to transition a Contract Invoice along any path not declared by the lifecycle (e.g. `void → issued`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.3 Renewal lifecycle (US-003)

- **Given** a Renewal in `proposed` referencing a Contract and its Renewal Terms,
  **when** an approver approves it via `ENG-011`,
  **then** it transitions to `approved` via `ENG-010`, and the transition is audited.
- **Given** a Renewal in `approved`,
  **when** the renewal effective moment is reached,
  **then** it transitions to `renewed` deterministically, `ContractRenewed` is published via `ENG-024`, and the transition is audited.
- **Given** a Renewal in `proposed` or `approved`,
  **when** a legitimate rejection is submitted,
  **then** it transitions to `rejected` via `ENG-010`, and the transition is audited.
- **Given** a Renewal in `proposed` that is not approved before the associated Contract's expiry,
  **when** the expiry moment is reached,
  **then** it transitions to `lapsed`, `ContractExpired` is published via `ENG-024`, and the transition is audited.
- **Given** an attempt to transition a Renewal along any path not declared by the lifecycle (e.g. `rejected → renewed`, `lapsed → approved`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 Auto-renewal generation (US-004)

- **Given** an `active` Contract with Renewal Terms whose auto-renewal rule (resolved via `ENG-005`) permits auto-renewal,
  **when** the scheduling window advances (via `ENG-014` Scheduler),
  **then** a Renewal in `proposed` is generated deterministically for that Contract and the generation is audited.
- **Given** a Contract whose auto-renewal rule does not permit auto-renewal, or a Contract that is not `active`,
  **when** the scheduling window advances,
  **then** no Renewal is generated for that Contract.

### 5.5 Notice-period rule (US-005)

- **Given** a Renewal proposal request submitted after the Contract's notice-period end (resolved via `ENG-005`),
  **when** the request is submitted,
  **then** it is rejected deterministically via `ENG-012` (foundation enforcement of the Module PRD §7 "Renewal proposals must be issued before the notice period ends" rule).
- **Given** a Renewal proposal request submitted at or before the Contract's notice-period end,
  **when** the request is submitted,
  **then** the notice-period rule is satisfied and processing continues.

### 5.6 Termination handling (US-006)

- **Given** a Renewal in `lapsed` or an explicit termination request against an `active` Contract,
  **when** the termination path resolves,
  **then** the Contract transitions to `terminated` via the Contract lifecycle owned by `SPR-MOD-011-001`, `ContractExpired` is published via `ENG-024`, and the transition is audited.

### 5.7 Post-termination entitlement-block rule (US-007)

- **Given** an attempt to bind a new Entitlement to a Contract in state `terminated`,
  **when** the request is submitted,
  **then** it is rejected deterministically via `ENG-012` (foundation enforcement of the Module PRD §7 "Terminated contracts cannot accept new entitlements" rule).
- **Given** an attempt to bind a new Entitlement to an `active` Contract,
  **when** the request is submitted,
  **then** the post-termination entitlement-block rule is satisfied and processing continues (Entitlement master authority remains with `SPR-MOD-011-001`).

### 5.8 Event publication (US-008)

- **Given** a Renewal transitioning to `renewed`,
  **when** the transition completes,
  **then** `ContractRenewed` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.
- **Given** a Contract transitioning to `terminated` (from `lapsed` or explicit termination),
  **when** the transition completes,
  **then** `ContractExpired` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.9 `SalesInvoiceIssued` consumption (US-009)

- **Given** a `SalesInvoiceIssued` event whose payload references an AMC-covered Contract under the same tenant/company,
  **when** the event is delivered via `ENG-024`,
  **then** the referenced Contract's sales-originated invoicing state is reconciled deterministically and the reconciliation is audited.
- **Given** a `SalesInvoiceIssued` event that does not reference an AMC-covered Contract or references one in a different tenant/company,
  **when** the event is delivered,
  **then** it is ignored deterministically (no state change, no reconciliation).

### 5.10 Contract Invoice document rendering (US-010)

- **Given** a Contract Invoice transitioning to `issued`,
  **when** the transition completes,
  **then** a Contract Invoice document artifact is rendered via `ENG-007` Document under the tenant's configured document template.

### 5.11 Notification emission (US-011)

- **Given** any Renewal state transition, Contract-expiry transition, or Contract Invoice issuance,
  **when** it completes,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.12 Audit integration (US-012)

- **Given** any Renewal Terms mutation, Contract Invoice lifecycle transition, Renewal lifecycle transition, or Contract-expiry transition orchestrated by this sprint,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor (or automation identity), tenant/company scope, entity identifier, transition or mutation type, and timestamp.

### 5.13 Isolation invariants (`ADR-011`)

- **Given** any Renewal Terms, Contract Invoice, or Renewal read or write, or any consumption/reconciliation write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed. `SalesInvoiceIssued` events are only applied to Contracts within the same tenant/company as the event payload.

### 5.14 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Renewal or Contract Invoice data,
  **when** it reads or reacts to them,
  **then** it does so exclusively through the AMC-owned events `ContractRenewed` and `ContractExpired` and AMC read APIs. No downstream module creates an independent Renewal, Renewal Terms, or Contract Invoice record.
- **Given** any AMC code path that requires ledger posting for a Contract Invoice or Contract expiry,
  **when** posting is required,
  **then** it is produced by MOD-002 Accounting through posting-rule bindings triggered by `ENG-015` Voucher issuance and by `ContractRenewed` / `ContractExpired`; AMC MUST NOT invoke `ENG-016` Posting directly.
- **Given** any AMC code path that requires sales-originated invoice data,
  **when** it needs a sales invoice,
  **then** it consumes `SalesInvoiceIssued` read-only from MOD-003; sales-invoicing lifecycle is not redefined here.
- **Given** any AMC code path that requires Contract, Entitlement, or Coverage data,
  **when** it reads them,
  **then** it does so read-only against the masters owned by `SPR-MOD-011-001`; those masters are not redefined here. Contract lifecycle transitions (including to `terminated`) execute through the authority owned by `SPR-MOD-011-001`.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-011` — AMC.
- **Module PRD:** [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Contract billing (upfront/periodic); Renewals and terminations; submodules Billing, Renewals), §3 (Personas), §4 (Renewal cycle, Termination), §5 (Renewal Terms), §6 (Contract Invoice, Renewal), §7 (notice-period rule, post-termination entitlement-block rule), §8 (`ContractRenewed`, `ContractExpired` — published; `SalesInvoiceIssued` — consumed), §10 (Notice periods, Auto-renewal rules), §12 (Engine consumption), §13 (Dependencies).

---

## 7. Dependencies

- **Parent:** `MOD-011` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master consumed read-only via the Contract binding inherited from `SPR-MOD-011-001`.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-011-001` — AMC Foundation (Contracts & Entitlements).
- **Cross-module consumption (events only):**
  - `SalesInvoiceIssued` originated by **MOD-003 Sales**, consumed read-only via `ENG-024`.
- **Cross-module boundaries (no consumption authored here):**
  - Ledger effect of Contract Invoices and Contract expiry — owned by **MOD-002 Accounting** via `ENG-015` and `ENG-016`; produced through posting-rule bindings triggered by AMC-published events and `ENG-015` issuance.
- **Downstream sprints:** `SPR-MOD-011-004` (AMC Analytics & Compliance) — per [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).

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
| `ENG-002` Authorization | Enforces authorization on Renewal Terms, Contract Invoice, and Renewal actions. |
| `ENG-004` Audit | Records every Renewal Terms mutation, Contract Invoice lifecycle transition, Renewal lifecycle transition, and Contract-expiry transition orchestrated by this sprint. |
| `ENG-005` Configuration | Resolves the AMC operations configuration namespace extended by this sprint (Notice periods, Auto-renewal rules), plus keys registered in `SPR-MOD-011-001`. |
| `ENG-007` Document | Renders Contract Invoice document artifacts under the tenant's configured document template. |
| `ENG-010` Workflow | Enforces the Contract Invoice lifecycle (`draft → issued → void`) and the Renewal lifecycle (`proposed → approved → renewed | rejected | lapsed`). |
| `ENG-011` Approval | Enforces the Renewal approval step within the Renewal lifecycle. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, same-company invariants, contract-state invariants), the notice-period rule, and the post-termination entitlement-block rule at capture time. |
| `ENG-014` Scheduler | Triggers auto-renewal proposal generation on cadence and Contract-expiry transitions on schedule. |
| `ENG-015` Voucher | Records Contract Invoice issuance; ledger posting occurs externally via MOD-002 posting-rule bindings. |
| `ENG-017` Numbering | Issues Contract Invoice document numbers. |
| `ENG-024` Eventing | Publishes `ContractRenewed` and `ContractExpired`; consumes `SalesInvoiceIssued`. |
| `ENG-025` Notification | Emits notifications on Renewal state transitions, Contract expiry, and Contract Invoice issuance under the tenant's configured channels. |

`ENG-016` Posting is **not** consumed by this sprint; ledger effects are produced by MOD-002 Accounting through posting-rule bindings triggered by `ENG-015` issuance and by AMC-published events.

AMC business semantics (Renewal Terms master, Contract Invoice lifecycle, Renewal lifecycle, termination handling, auto-renewal rules, notice-period rule, post-termination entitlement-block rule) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Renewal Terms, Contract Invoice, and Renewal read/write and on every event application. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Renewal Terms, Contract Invoice, and Renewal actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Renewal Terms | MOD-011 (this sprint) | Scoped-to-Contract description of renewal cadence, notice period, and auto-renewal behaviour under a tenant/company. |
| Contract Invoice | MOD-011 (this sprint) | Upfront or periodic invoice issued against an `active` Contract; runs a lifecycle (`draft → issued → void`); issuance recorded via `ENG-015`. |
| Renewal | MOD-011 (this sprint) | Renewal transaction against a Contract using its Renewal Terms; runs a lifecycle (`proposed → approved → renewed | rejected | lapsed`). |

### 10.2 Relationships

- A **Contract** (owned by `SPR-MOD-011-001`) originates zero or more **Renewal Terms**, zero or more **Contract Invoices** while it is `active`, and zero or more **Renewals**, all within the same tenant/company.
- A **Renewal Terms** record references exactly one Contract within the same company.
- A **Contract Invoice** references exactly one Contract within the same company; document numbers issue via `ENG-017`; issuance is recorded via `ENG-015`.
- A **Renewal** references exactly one Contract and its Renewal Terms within the same company.

### 10.3 Ownership Boundaries

- Entities listed here are owned by `MOD-011` per the AMC Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Contract**, **Entitlement**, and **Coverage** entities are owned by `SPR-MOD-011-001` and are consumed read-only here. Contract lifecycle transitions (including to `terminated`) execute through the authority owned by `SPR-MOD-011-001`.
- The **Sales Invoice** entity is owned by MOD-003 Sales; only its issuance event is consumed.
- Ledger entries produced for Contract Invoices and Contract expiry are owned by MOD-002 Accounting.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`ContractRenewed`** — published via `ENG-024` when a Renewal transitions to `renewed`.
- **`ContractExpired`** — published via `ENG-024` when a Contract transitions to `terminated` from a `lapsed` renewal or an explicit termination request.

Per Sprint Plan §2 (`SPR-MOD-011-003`), these are the domain events originated by this sprint.

### 11.2 Consumed

- **`SalesInvoiceIssued`** — originated by MOD-003 Sales, consumed read-only via `ENG-024` to reconcile sales-originated contract invoicing against Contracts owned by `SPR-MOD-011-001`.

Payload contracts for these events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Renewal Terms, Contract Invoice, and Renewal read/write, and on every event application.
- [ ] Every Renewal Terms mutation, Contract Invoice lifecycle transition, Renewal lifecycle transition, and Contract-expiry transition produces an audit record via `ENG-004`.
- [ ] The Contract Invoice lifecycle (`draft → issued → void`) is enforced end-to-end via `ENG-010`, with issuance recorded via `ENG-015` and document numbers issued via `ENG-017`.
- [ ] The Renewal lifecycle (`proposed → approved → renewed | rejected | lapsed`) is enforced end-to-end via `ENG-010` with approval via `ENG-011`.
- [ ] Auto-renewal proposals are generated on cadence via `ENG-014`, gated by auto-renewal rules resolved via `ENG-005`.
- [ ] The notice-period rule and the post-termination entitlement-block rule are enforced end-to-end via `ENG-012`.
- [ ] `ContractRenewed` and `ContractExpired` are published via `ENG-024` on the corresponding transitions, exactly once each.
- [ ] `SalesInvoiceIssued` is consumed via `ENG-024` with tenancy filtering; out-of-scope events are ignored deterministically.
- [ ] Contract Invoice documents are rendered via `ENG-007` under the tenant's configured document template.
- [ ] Notifications are emitted on Renewal state transitions, Contract expiry, and Contract Invoice issuance via `ENG-025`.
- [ ] `ENG-016` Posting is **not** invoked by AMC; ledger effects for Contract Invoices and Contract expiry are produced externally by MOD-002.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-011_SPRINT_PLAN.md` §2 (`SPR-MOD-011-003`):

- Upfront and periodic Contract Invoices can be issued via `ENG-015` Voucher (posting effects owned by MOD-002).
- Renewal Terms can be defined per contract and Renewal transactions follow their approval lifecycle via `ENG-011`.
- The notice-period rule and post-termination entitlement-block rule are enforced via `ENG-012`.
- Contract expiry is triggered on schedule via `ENG-014`.
- `ContractRenewed` and `ContractExpired` events are published via `ENG-024`; `SalesInvoiceIssued` events are consumed.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-011 Sprint 3 depends on `SPR-MOD-011-001` being complete and the Contract, Entitlement, Coverage masters and AMC configuration namespace being available.
  - **Impact:** Any regression against `SPR-MOD-011-001` blocks this sprint.
  - **Mitigation:** Rely on the AMC Foundation contract authored in `SPR-MOD-011-001`; treat any regression as a foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-011 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen for tenancy, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Ledger posting for Contract Invoices and Contract expiry is owned by MOD-002 Accounting via `ENG-015` and `ENG-016`; AMC issues Contract Invoices via `ENG-015` and publishes `ContractRenewed` / `ContractExpired` but MUST NOT invoke `ENG-016` Posting directly.
  - **Impact:** If MOD-002 posting-rule bindings are not present for AMC-emitted events and voucher issuance, ledger effects will not be produced end-to-end.
  - **Mitigation:** During implementation, gate the posting path against a MOD-002 producer-readiness contract and record any gap as a deferred integration item; the AMC Sprint boundary is unchanged.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Consumption of `SalesInvoiceIssued` requires MOD-003 Sales to originate the event per the authoritative event catalog.
  - **Impact:** If the producer is not yet published in a corresponding module baseline, this sprint's consumption path cannot be exercised end-to-end.
  - **Mitigation:** During implementation, gate the consumption path against a producer-readiness contract and record any gap as a deferred integration item; the AMC Sprint boundary is unchanged.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** The remaining AMC sprint (`SPR-MOD-011-004`) is deferred; scope-creep back into this sprint would dilute Contract Billing & Renewals.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** AMC-owned Renewal Terms master, Contract Invoice transaction, and Renewal transaction MUST NOT be redefined by downstream modules; MOD-002 Accounting and MOD-003 Sales semantics MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment billing data and break traceability.
  - **Mitigation:** Enforce the Renewal Terms & Contract Invoice Transaction Authority (§1.1.1), Renewal Transaction Authority (§1.1.2), and AMC ↔ Accounting / Sales boundaries (§1.1.3, §1.1.4) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 3 publishes `ContractRenewed` and `ContractExpired`, and consumes `SalesInvoiceIssued`. Any event name not present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration for `ContractRenewed`, `ContractExpired`, and `SalesInvoiceIssued` before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Renewal Terms validation; Contract Invoice validation; Contract-state invariants; notice-period rule; post-termination entitlement-block rule; Contract Invoice and Renewal lifecycle transition invariants; auto-renewal-rule evaluation.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, document rendering via `ENG-007`, workflow via `ENG-010`, approval via `ENG-011`, rules evaluation via `ENG-012`, scheduler via `ENG-014`, voucher issuance via `ENG-015`, numbering via `ENG-017`, event publication and consumption via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `ContractRenewed` and `ContractExpired` payload contracts per the authoritative event catalog; `SalesInvoiceIssued` payload contract as consumed.
- **End-to-end (smoke)** — Renewal Terms authoring → auto-renewal proposal generation via `ENG-014` → Renewal approval via `ENG-011` → transition to `renewed` → `ContractRenewed` publication; separately, Renewal `lapsed` → Contract `terminated` → `ContractExpired` publication; separately, Contract Invoice creation → `issued` transition via `ENG-015` → document render via `ENG-007`; separately, `SalesInvoiceIssued` consumption reconciles against an AMC-covered Contract; two-tenant / two-company smoke fixture to verify `ADR-011` isolation on publication, issuance, and consumption paths.

Sprint-specific fixtures: a two-company smoke fixture, an auto-renewal-rule configuration fixture, a notice-period configuration fixture, and a MOD-003-produced `SalesInvoiceIssued` fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Contract Invoice and Renewal lifecycles as small state machines so audit emission (§5.12) is trivially satisfiable at every transition.
- Consider centralizing the notice-period rule (§5.5) and the post-termination entitlement-block rule (§5.7) behind single `ENG-012` predicates so both interactive capture and automation paths share identical semantics.
- Consider isolating the auto-renewal-generation loop (`ENG-014` → auto-renewal-rule evaluation → Renewal creation) behind an idempotent slot key derived from (Contract, renewal-window) so re-triggering does not double-generate proposals.
- Consider centralizing the `ContractRenewed` and `ContractExpired` publication paths so downstream sprints that add fields to their payload (per the authoritative event catalog) touch a single emission point per event.
- Consider tenancy-scoping the `SalesInvoiceIssued` consumer at the earliest boundary so §5.13 isolation is inherited by every downstream reconciliation update without additional code.
- Consider routing Contract Invoice issuance through a single `ENG-015` invocation point so posting-rule bindings owned by MOD-002 can be attached without leaking `ENG-016` Posting into AMC code.
- Consider deferring document rendering (§5.10) behind an idempotent artifact key so re-issuance never yields duplicate documents.

These notes are **non-authoritative** and MAY be superseded by implementation decisions provided the acceptance criteria (§5), Definition of Done (§12), and Sprint Exit Criteria (§13) continue to hold.

---

## 17. Review Gate

This Sprint PRD MUST pass review against the released GT-003 Sprint Authoring template under Governance Framework v1.0 before it is registered in the Sprint Catalog. The Review Gate binds:

- Every canonical GT-003 section is present.
- Traceability to the Module PRD and Sprint Plan is bidirectional.
- Registration is limited to GT-003-declared surfaces.
- Ownership boundaries §1.1.1–§1.1.6 are preserved.
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

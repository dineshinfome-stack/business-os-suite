---
title: "SPR-MOD-010-004 — Budgets, Costs & Project Billing"
summary: "Sprint PRD for the Milestone-to-invoice business process of MOD-010 Projects: project budgets and cost roll-up, T&M and fixed-price billing, and the Project Invoice transaction lifecycle. Consumes upstream layers; never redefines them. Ledger postings remain owned by MOD-002 Accounting."
layer: "delivery"
owner: "Delivery"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-010-004"
parent_module: "MOD-010"
parent_sprint_plan: "MOD-010_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "12.0.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-015", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "projects", "mod-010", "budgets", "costs", "billing", "invoice", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD010-004-20260715T001900Z-001"
parent_result_id: "GT003-MOD010-003-20260715T001800Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-010-004 — Budgets, Costs & Project Billing

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-010 Projects** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-010-004` (permanent) |
| Parent Module | `MOD-010` — Projects |
| Parent Sprint Plan | [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-010-002`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md) (Tasks, Milestones & Change Requests), [`SPR-MOD-010-003`](./SPR-MOD-010-003-timesheets-and-effort.md) (Timesheets & Effort) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-010-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Milestone-to-invoice** business process of MOD-010 Projects by authoring **Project Budgets**, **project-cost roll-up**, **T&M and fixed-price billing**, and the **Project Invoice** transaction lifecycle. Enforce the business rule *"Fixed-price billing is decoupled from timesheet totals"* via `ENG-012` Rules and `ENG-011` Approval. Publish the `ProjectInvoiceIssued` domain event on invoice issuance and consume `SalesOrderConfirmed` per Module PRD §8. Ledger postings remain owned by **MOD-002 Accounting**; this sprint emits `ProjectInvoiceIssued` and lets Accounting produce the ledger effect through its own posting-rule bindings.

> **Projects Ownership Convention (inherited from Sprints 001–003).** The Projects module owns the business semantics of Project Budgets, project-cost roll-up, billing modes, and the Project Invoice transaction. ERP Core Engines provide shared infrastructure but MUST NOT redefine Projects business rules. Financial posting remains exclusive to **MOD-002 Accounting**. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Employee master remains exclusive to **MOD-007 HRMS**. Payroll processing remains exclusive to **MOD-008 Payroll**. Tax computation and compliance remain exclusive to **MOD-002 Accounting**.

#### 1.1.1 Project Budget and Cost Roll-Up Authority

**Project Budget** and **project-cost roll-up** are authoritatively owned by MOD-010 Projects in this sprint. Budgets are resolved against Projects (owned by Sprint 1) and MAY be re-baselined by an approved Change Request (owned by Sprint 2). Cost roll-up aggregates approved Timesheets (owned by Sprint 3) and consumed cost signals (`PayrollProcessed` from MOD-008 Payroll, consumed by Sprint 3) into a Projects-owned, tenant-isolated read model. No other module MAY create or independently maintain a parallel Project Budget or cost-roll-up view.

#### 1.1.2 Project Invoice Transaction Authority

The **Project Invoice** transaction is authoritatively owned by MOD-010 Projects. No other module MAY create, edit, approve, or independently maintain a parallel Project Invoice transaction against a Project. Its lifecycle (draft → submitted → approved → issued → (or cancelled)) is governed by `ENG-010` Workflow and `ENG-011` Approval. Document numbers are issued via `ENG-017` under the numbering series registered by Sprint 1. Multi-currency handling is delegated to `ENG-018` Currency. Voucher generation is governed by `ENG-015` Voucher and is consumed as a Projects-owned invoice document; the resulting ledger posting is produced by **MOD-002 Accounting** through its own posting-rule bindings triggered by the emitted `ProjectInvoiceIssued` event. Downstream modules and sprints consume Project Invoice outcomes exclusively through the Projects-owned `ProjectInvoiceIssued` event and read APIs.

#### 1.1.3 Fixed-Price Decoupling Rule Boundary

The business rule "Fixed-price billing is decoupled from timesheet totals" (Module PRD §7) is declared and enforced in this sprint via `ENG-012` at Project-Invoice draft, submission, and approval. Fixed-price billing amounts are resolved from the Sprint-1-owned Rate Card and the milestone-completion state (owned by Sprint 2) — never from Timesheet totals. T&M billing amounts are resolved from approved Timesheets (owned by Sprint 3) and the applicable Rate Card. This sprint does not redefine milestone-completion or Timesheet-approval semantics.

#### 1.1.4 Projects ↔ HRMS / Payroll / Accounting / Sales / Platform Boundary (inherited)

Boundaries declared in Sprints 001–003 apply verbatim and are not redefined here. Identity is consumed read-only via `ENG-001` (established in Sprint 1). Employee master is consumed read-only from **MOD-007 HRMS** via Sprint-1-owned Resources. Payroll cost signals are consumed read-only from **MOD-008 Payroll** via `PayrollProcessed` handled by Sprint 3 and surfaced to cost roll-up here through Projects-owned read APIs. Sales-order confirmation is consumed read-only from **MOD-003 Sales** via `SalesOrderConfirmed`. Financial postings and tax computation remain exclusive to **MOD-002 Accounting**; no ledger effect and no tax computation is produced by this sprint.

#### 1.1.5 Event-Publication and Event-Consumption Authority

Sprint 4 originates the `ProjectInvoiceIssued` domain event per Module PRD §8 and Sprint Plan §2. Sprint 4 additionally consumes the `SalesOrderConfirmed` domain event per Module PRD §8. Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. This sprint does not redefine any event contract.

- `SalesOrderConfirmed` (consumed, owned by MOD-003 Sales): triggers Project-Invoice preparation for delivery-linked engagements where Sales has confirmed the underlying sales order. This sprint does not redefine sales-order semantics.

### 1.2 In Scope

- **Project Budget** authoring against a Project (owned by Sprint 1), with re-baseline via approved Change Request (owned by Sprint 2), governed by `ENG-012` structural validation and `ENG-004` audit.
- **Project-cost roll-up** aggregating approved Timesheets (Sprint 3) and consumed cost signals into a tenant-isolated read model, resolved deterministically via `ENG-012`.
- **T&M billing** amount derivation from approved Timesheets and the Sprint-1-owned Rate Card, governed by `ENG-012`.
- **Fixed-price billing** amount derivation from milestone-completion state (Sprint 2) and the Sprint-1-owned Rate Card, governed by `ENG-012`, **decoupled from Timesheet totals** per Module PRD §7.
- **Project Invoice transaction lifecycle**: draft → submitted → approved → issued → (or cancelled), governed by `ENG-010` Workflow and `ENG-011` Approval.
- **Multi-currency handling** on Project Invoice via `ENG-018` Currency; foreign-currency lines resolve to the Project's declared currency at the rate effective on the invoice date.
- **Numbering** on Project Invoice via `ENG-017` under the Projects numbering series registered by Sprint 1.
- **Voucher generation** for Project Invoice via `ENG-015`; the invoice is Projects-owned and its ledger effect is produced by MOD-002 through posting-rule bindings triggered by `ProjectInvoiceIssued`.
- **Structural validation** (required fields, referential integrity, milestone-invoiceable precondition owned by Sprint 2, non-negative amounts, single-project composition) via `ENG-012` at draft and submission.
- **Publication** of `ProjectInvoiceIssued` via `ENG-024` on transition to `issued`, per the authoritative event catalog contract.
- **Consumption** of `SalesOrderConfirmed` via `ENG-024` per §1.1.5.
- **Read-only consumption** of Sprint-1 masters (Project, Resource, Rate Card), Sprint-2 masters and transactions (Task, Milestone, Milestone Completion, Change Request), and Sprint-3 transactions (approved Timesheets).
- **Audit** emission via `ENG-004` for every Project Budget change, every cost-roll-up re-computation, and every Project Invoice lifecycle transition and approval decision.
- **Notification** of workflow / approval outcomes via `ENG-025` to relevant actors (Project Manager, Finance).
- **Configuration** read via `ENG-005` under the Projects configuration namespace registered by Sprint 1 (rate cards, approval hierarchy, billing type per project, numbering series).
- **Document generation** for Project Invoice via `ENG-007` Document.

### 1.3 Out of Scope

- Project, Resource, and Rate Card master lifecycles — `SPR-MOD-010-001`.
- Task and Milestone masters, Milestone Completion, Change Request, `ProjectCreated` / `MilestoneCompleted` publication — `SPR-MOD-010-002`.
- Timesheet transaction lifecycle, capacity-justification rule, `TimesheetApproved` publication, `EmployeeHired` and `PayrollProcessed` consumption — `SPR-MOD-010-003`.
- Projects read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-010-005`.
- Ledger posting for Project Invoice and cost accruals — MOD-002 Accounting via `ENG-016` Posting through posting-rule bindings.
- Tax computation, tax reporting, and tax compliance — MOD-002 Accounting.
- Sales-order authoring and confirmation — MOD-003 Sales.
- Payroll disbursement and payroll postings — MOD-008 Payroll.
- Employee master and HR-originating lifecycle — MOD-007 HRMS.
- Identity, authentication, and permission grants — MOD-001 Platform.
- Cross-module KPI definitions — MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-010-004`, the following will exist:

- **Business capabilities.**
  - A Project Manager can author and re-baseline a Project Budget against a Project; re-baseline is driven by an approved Change Request (owned by Sprint 2).
  - Project-cost roll-up produces a deterministic, tenant-isolated read model aggregating approved Timesheets (Sprint 3) and consumed payroll cost signals.
  - A Project Manager (and Finance where policy requires) can prepare, submit, approve, and issue a Project Invoice; approvals route through `ENG-010` Workflow and `ENG-011` Approval.
  - T&M billing amounts derive from approved Timesheets and the Rate Card. Fixed-price billing amounts derive from milestone-completion state and the Rate Card, decoupled from Timesheet totals.
  - Multi-currency Project Invoices resolve to the Project's declared currency via `ENG-018`; document numbers issue via `ENG-017`.
  - A downstream sprint (`SPR-MOD-010-005`) can query issued Project Invoices and budget/cost read models for analytics and compliance.
- **Event artifacts.**
  - `ProjectInvoiceIssued` event is published via `ENG-024` on transition to `issued`, per the authoritative event catalog contract, exactly once per issued transaction.
  - `SalesOrderConfirmed` is consumed via `ENG-024` per §1.1.5.
- **Configuration artifacts.** Billing-type-per-project, approval-hierarchy, and rate-card resolution consume the Projects configuration namespace registered by Sprint 1; no new namespace is introduced.
- **Audit artifacts.** An audit record exists for every Project Budget change, every cost-roll-up re-computation, and every Project Invoice lifecycle transition and approval decision, produced via `ENG-004`.
- **Notification artifacts.** Approval and workflow-outcome notifications are dispatched via `ENG-025` to the actors declared by the approval policy.
- **Document artifacts.** Project Invoice documents are generated via `ENG-007`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-010-004`.
- **Migration artifacts.** *N/A at PRD authoring time.*

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-010 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Project budgets and costs; Project billing (T&M and fixed-price); submodules Budgets, Billing | Project Budget authoring (§5.1), cost roll-up (§5.2), Project Invoice lifecycle (§5.3) |
| §3 Personas — Project Manager, Finance | User stories (§4) and approval routing (§5.4) |
| §4 Business Processes — Milestone-to-invoice | Project Invoice lifecycle (§5.3) and approval routing (§5.4) |
| §6 Transactions — Project Invoice | Project Invoice transaction (§5.3) |
| §7 Business Rules — "Fixed-price billing is decoupled from timesheet totals" | Fixed-price decoupling enforcement (§5.5) |
| §8 Integration Points — `ProjectInvoiceIssued` (published); `SalesOrderConfirmed` (consumed) | Event publication and consumption (§5.6, §11) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Projects Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Project budgets and costs (§2) | `SPR-MOD-010-004` |
| Project billing (T&M and fixed-price) (§2) | `SPR-MOD-010-004` |

Business-process origination allocated to this sprint per Sprint Plan §4.2:

| Business Process | Origin Sprint |
| --- | --- |
| Milestone-to-invoice | `SPR-MOD-010-004` |

Transaction Project Invoice is originating-allocated to this sprint per Sprint Plan §4.3. Event `ProjectInvoiceIssued` is originating-allocated to this sprint, and event consumption `SalesOrderConfirmed` is originating-allocated to this sprint per Sprint Plan §7. Allocations are unique; no other Projects sprint claims them.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Project budgets and costs* and *Project billing (T&M and fixed-price)*, §4 process *Milestone-to-invoice*, §6 transaction *Project Invoice*, §7 rule *Fixed-price decoupling*, §8 events *ProjectInvoiceIssued* (published) and *SalesOrderConfirmed* (consumed) → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Project Manager, I want to author a Project Budget against a Project, so that planned effort and cost are captured authoritatively.*
- **US-002.** *As a Project Manager, I want an approved Change Request (owned by Sprint 2) to re-baseline the Project Budget, so that budget adjustments follow the same governance path as the change itself.*
- **US-003.** *As a Project Manager, I want a deterministic project-cost roll-up aggregating approved Timesheets and consumed payroll cost signals, so that project performance is measurable without redefining upstream masters.*
- **US-004.** *As a Project Manager, I want to prepare a T&M Project Invoice whose amounts derive from approved Timesheets and the Rate Card, so that time-and-materials engagements bill deterministically.*
- **US-005.** *As a Project Manager, I want to prepare a fixed-price Project Invoice whose amounts derive from milestone-completion state and the Rate Card, decoupled from Timesheet totals, so that fixed-price engagements bill per the contract.*
- **US-006.** *As a Project Manager, I want to submit a Project Invoice for approval, so that it reaches a deterministic terminal state.*
- **US-007.** *As Finance, where the approval policy declares my involvement, I want to review and approve Project Invoices, so that off-policy invoicing is controlled before issuance.*
- **US-008.** *As a Project Manager, I want the issued Project Invoice to carry a number issued via `ENG-017` and to resolve foreign-currency lines via `ENG-018`, so that invoicing is deterministic and multi-currency-safe.*
- **US-009.** *As `SPR-MOD-010-005` (downstream analytics and compliance), I want to query issued Project Invoices and budget/cost read models, so that analytics uses authoritative data without redefining these entities.*
- **US-010.** *As MOD-002 Accounting, I want to subscribe to `ProjectInvoiceIssued`, so that ledger posting is produced through my posting-rule bindings without Projects invoking `ENG-016` directly.*
- **US-011.** *As Projects (this sprint), I want to react to `SalesOrderConfirmed`, so that delivery-linked engagements begin Project-Invoice preparation without redefining sales-order semantics.*
- **US-012.** *As a security reviewer, I want every Project Budget change, cost-roll-up re-computation, and Project Invoice lifecycle transition to be audited via `ENG-004`, so that I can reconstruct their history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Project Budget authoring and re-baseline (US-001, US-002)

- **Given** a valid Project Budget authoring request against an active Project in the caller's tenant/company,
  **when** the request is submitted,
  **then** the budget is persisted with a stable identifier unique per (Project, budget version), structural validation via `ENG-012` succeeds, and the change is audited via `ENG-004`.
- **Given** an approved Change Request (owned by Sprint 2) referencing a budget-impacting scope change,
  **when** the re-baseline is applied,
  **then** a new budget version is persisted deterministically, the prior version is retained, and the transition is audited.
- **Given** an attempt to author a budget against an archived Project or in a different company,
  **when** the request is submitted,
  **then** it is rejected deterministically.

### 5.2 Project-cost roll-up (US-003)

- **Given** approved Timesheets against a Project (owned by Sprint 3) and consumed payroll cost signals surfaced through Projects-owned read APIs,
  **when** the roll-up is computed,
  **then** the result is a deterministic, tenant-isolated read model scoped to the Project, and re-computation is idempotent.
- **Given** any change to the input set (new approved Timesheet, new payroll signal, budget re-baseline),
  **when** re-computation is executed,
  **then** the roll-up is refreshed deterministically and the re-computation is audited via `ENG-004`.

### 5.3 Project Invoice transaction lifecycle (US-004, US-005, US-006, US-008)

- **Given** a valid Project Invoice draft request under an active Project in the caller's tenant/company,
  **when** the Project Manager submits it,
  **then** the invoice is persisted with a stable identifier, transitions to `submitted`, is routed via `ENG-010` Workflow, and the transition is audited via `ENG-004`.
- **Given** a submitted Project Invoice routed to an approver declared by the approval policy,
  **when** the approver approves,
  **then** the invoice transitions to `approved`.
- **Given** an approved Project Invoice,
  **when** the issue action commits,
  **then** the invoice transitions to `issued`, a document number is issued via `ENG-017`, the invoice document is generated via `ENG-007`, foreign-currency lines are resolved via `ENG-018`, the voucher is generated via `ENG-015`, and `ProjectInvoiceIssued` is published via `ENG-024`.
- **Given** a submitted or approved Project Invoice,
  **when** it is cancelled per policy,
  **then** the invoice transitions to `cancelled` deterministically, `ProjectInvoiceIssued` is NOT published, and the transition is audited.
- **Given** an attempt to invoice against an archived Project or a Milestone that is not marked `completed` and `approved` (Sprint-2 precondition),
  **when** the request is submitted,
  **then** it is rejected deterministically via `ENG-012`.

### 5.4 Multi-step approval routing (US-006, US-007)

- **Given** the approval hierarchy configuration resolved via `ENG-005` under the Projects configuration namespace (registered by Sprint 1),
  **when** a Project Invoice is submitted,
  **then** it is routed through the declared steps via `ENG-011`, notifications are dispatched via `ENG-025`, and the routing decisions are audited via `ENG-004`.
- **Given** an approval policy that requires Finance participation for a defined invoice class,
  **when** such an invoice is submitted,
  **then** the Finance step is invoked deterministically and MUST terminate before the invoice reaches `approved`.

### 5.5 Fixed-price decoupling rule (US-005)

- **Given** a Project configured as fixed-price and a completed-and-approved Milestone (owned by Sprint 2) associated with that Project,
  **when** a fixed-price Project Invoice is drafted,
  **then** amounts derive exclusively from the Milestone and Rate Card via `ENG-012`, and Timesheet totals do NOT influence the invoice amount.
- **Given** a Project configured as T&M and approved Timesheets (owned by Sprint 3) against Tasks in that Project,
  **when** a T&M Project Invoice is drafted,
  **then** amounts derive from approved Timesheets and the applicable Rate Card via `ENG-012`.
- **Given** an attempt to draft a fixed-price invoice referencing Timesheet totals,
  **when** the draft is submitted,
  **then** it is rejected deterministically via `ENG-012` for violating the decoupling rule.
- **Given** an attempt to draft an invoice against a Milestone that is not marked `completed` and `approved`,
  **when** the draft is submitted,
  **then** it is rejected deterministically via `ENG-012` per the Module PRD §7 milestone-invoiceable precondition (owned by Sprint 2).

### 5.6 Event publication and consumption (US-010, US-011)

- **Given** a Project Invoice that transitions to `issued`,
  **when** the transition commits,
  **then** exactly one `ProjectInvoiceIssued` event is published via `ENG-024`, conforming to the authoritative event catalog envelope.
- **Given** a `SalesOrderConfirmed` domain event from MOD-003 Sales,
  **when** it is delivered via `ENG-024`,
  **then** Projects performs deterministic Project-Invoice preparation confined to Projects-owned surfaces; no sales-order field is created, edited, or archived here.

### 5.7 Downstream query surface (US-009)

- **Given** an issued Project Invoice and a computed budget/cost read model,
  **when** `SPR-MOD-010-005` (or any Projects-owned downstream) queries them scoped to the caller's tenant/company,
  **then** the result is deterministic and enforces tenant isolation.

### 5.8 Audit invariants (US-012)

- **Given** any Project Budget change, cost-roll-up re-computation, Project Invoice lifecycle transition, or approval decision,
  **when** it commits,
  **then** an audit record is produced via `ENG-004` capturing actor, action, subject, before-state, after-state, and timestamp.

### 5.9 Authorization invariants

- **Given** any Sprint-4 action (budget author/edit, cost-roll-up trigger, invoice draft/submit/approve/issue/cancel/query),
  **when** it is executed,
  **then** authorization is enforced via `ENG-002` per `ADR-032` (RBAC + ABAC); an unauthorized principal is rejected deterministically.

### 5.10 Tenant isolation invariants

- **Given** any Sprint-4 read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.11 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Project Invoice, Project Budget, or cost-roll-up data,
  **when** it reads or reacts,
  **then** it does so exclusively through Projects-owned events and read APIs. No downstream module redefines these entities or transitions their state independently. MOD-002 Accounting produces ledger effects through its own posting-rule bindings triggered by `ProjectInvoiceIssued`; this sprint does NOT invoke `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-010` — Projects.
- **Module PRD:** [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Project budgets and costs; Project billing (T&M and fixed-price); submodules Budgets, Billing), §3 (Project Manager, Finance), §4 (Milestone-to-invoice), §6 (Project Invoice), §7 (Fixed-price decoupling rule), §8 (`ProjectInvoiceIssued` published; `SalesOrderConfirmed` consumed), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-010` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2 and §3):** [`SPR-MOD-010-002`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md) (Tasks, Milestones & Change Requests) and [`SPR-MOD-010-003`](./SPR-MOD-010-003-timesheets-and-effort.md) (Timesheets & Effort). Sprint-1 masters (Project, Resource, Rate Card) and configuration namespace are consumed transitively.
- **Cross-module consumption (events only):** `SalesOrderConfirmed` (owned by MOD-003 Sales). `PayrollProcessed` (owned by MOD-008 Payroll) is consumed by Sprint 3 and surfaced to cost roll-up here through Projects-owned read APIs.
- **Downstream consumers:** `SPR-MOD-010-005` (Projects Analytics & Compliance — consumes budget/cost read models and `ProjectInvoiceIssued`); MOD-002 Accounting (consumes `ProjectInvoiceIssued` for ledger posting through its own posting-rule bindings); MOD-017 Analytics (consumes `ProjectInvoiceIssued`).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Projects Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Budget, cost-roll-up, and Project Invoice actions. |
| `ENG-004` Audit | Records Project Budget changes, cost-roll-up re-computations, and Project Invoice lifecycle transitions and approvals. |
| `ENG-005` Configuration | Resolves billing-type per project, approval hierarchy, rate cards, and numbering series under the Projects configuration namespace registered by Sprint 1. |
| `ENG-007` Document | Generates the Project Invoice document. |
| `ENG-010` Workflow | Governs Project Invoice transaction lifecycle. |
| `ENG-011` Approval | Governs multi-step approvals for Project Invoice. |
| `ENG-012` Rules | Evaluates structural validations, milestone-invoiceable precondition, fixed-price decoupling rule, and T&M/fixed-price amount derivation. |
| `ENG-015` Voucher | Generates the Projects-owned Project Invoice voucher (invoice document); ledger effect is produced by MOD-002 Accounting through posting-rule bindings triggered by `ProjectInvoiceIssued`. |
| `ENG-017` Numbering | Issues document numbers for Project Invoice under the Projects numbering series registered by Sprint 1. |
| `ENG-018` Currency | Resolves foreign-currency lines on Project Invoice to the Project's declared currency at the invoice-date rate. |
| `ENG-024` Eventing | Publishes `ProjectInvoiceIssued` on issued Project Invoice; consumes `SalesOrderConfirmed`. |
| `ENG-025` Notification | Dispatches approval and workflow-outcome notifications to policy-declared actors. |

`ENG-016` Posting is deliberately **not** consumed here; ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by `ProjectInvoiceIssued`, per Sprint Plan §5.

Projects business semantics (Project Budget, cost roll-up, T&M / fixed-price amount derivation, Project Invoice, fixed-price decoupling rule) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Sprint-4 read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Budget, cost-roll-up, and Project Invoice actions and to approval-role evaluation. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Workflow and approval contracts are governed by `ENG-010` and `ENG-011`. Voucher, numbering, and currency contracts are governed by `ENG-015`, `ENG-017`, and `ENG-018`.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Project Budget | MOD-010 (this sprint) | Versioned baseline of planned effort and cost against a Project; re-baselined by an approved Change Request. |
| Project Cost Roll-Up | MOD-010 (this sprint) | Deterministic, tenant-isolated read model aggregating approved Timesheets and consumed cost signals against a Project. |
| Project Invoice | MOD-010 (this sprint) | Transaction issuing a T&M or fixed-price invoice against a Project, routed through workflow/approval to a deterministic terminal state. |

### 10.2 Relationships

- A **Project Budget** references exactly one Sprint-1-owned **Project**; multiple budget versions MAY exist per Project, distinguished by version.
- A **Project Cost Roll-Up** is a read-model projection over approved **Timesheets** (Sprint 3) and consumed payroll cost signals, scoped to exactly one Sprint-1-owned **Project**.
- A **Project Invoice** references exactly one Sprint-1-owned **Project** and, for fixed-price billing, one or more Sprint-2-owned completed-and-approved **Milestones**; for T&M billing, it references one or more Sprint-3-owned approved **Timesheets**.
- A **Project Invoice** is scoped to a single tenant/company (`ADR-011`) and to a single Project's declared currency (`ENG-018` resolves foreign-currency lines).

### 10.3 Ownership Boundaries

- Project Budget, Project Cost Roll-Up, and Project Invoice are owned by `MOD-010` per the Projects Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Project, Resource, and Rate Card remain owned by Sprint 1; consumed read-only here.
- Task, Milestone, Milestone Completion, and Change Request remain owned by Sprint 2; consumed read-only here.
- Timesheet remains owned by Sprint 3; consumed read-only here.
- Employee entity remains owned by MOD-007 HRMS.
- Payroll-master entities remain owned by MOD-008 Payroll; `PayrollProcessed` is consumed read-only via Sprint 3 and surfaced through Projects-owned read APIs.
- Sales-order entity remains owned by MOD-003 Sales; `SalesOrderConfirmed` is consumed read-only.
- Financial-posting entities and tax entities remain owned by MOD-002 Accounting.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

| Event | Trigger | Contract Owner |
| --- | --- | --- |
| `ProjectInvoiceIssued` | Project Invoice transitions to `issued`. | MOD-010 |

Payload contracts are declared in the authoritative event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

### 11.2 Consumed

| Event | Producer | Effect in this sprint |
| --- | --- | --- |
| `SalesOrderConfirmed` | MOD-003 Sales | Triggers deterministic Project-Invoice preparation for delivery-linked engagements; no sales-order mutation. |

`EmployeeHired`, `PayrollProcessed`, `ProjectCreated`, `MilestoneCompleted`, and `TimesheetApproved` are consumed by other Projects sprints (Sprint 2 or Sprint 3) per Module PRD §8 and are out of scope here; their outputs are surfaced to this sprint through Projects-owned read APIs.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Sprint-4 read and write.
- [ ] Every Project Budget change, cost-roll-up re-computation, and Project Invoice lifecycle transition and approval decision produces an audit record via `ENG-004`.
- [ ] Project Invoice is routed via `ENG-010` Workflow and `ENG-011` Approval end-to-end.
- [ ] The fixed-price decoupling rule is enforced via `ENG-012` at draft, submission, and approval.
- [ ] Document numbers are issued via `ENG-017` and foreign-currency lines are resolved via `ENG-018`.
- [ ] Project Invoice voucher is generated via `ENG-015`; no direct invocation of `ENG-016` Posting is made by this sprint.
- [ ] Project Invoice documents are generated via `ENG-007`.
- [ ] `ProjectInvoiceIssued` is published via `ENG-024` per the authoritative event catalog envelope, exactly once per issued Project Invoice.
- [ ] `SalesOrderConfirmed` is consumed via `ENG-024` per §5.6 without mutating upstream masters.
- [ ] Billing-type-per-project, approval-hierarchy, rate-card, and numbering-series configuration resolve deterministically via `ENG-005` under the namespace registered by Sprint 1.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-010_SPRINT_PLAN.md` §2 (`SPR-MOD-010-004`):

- Project Budgets can be authored and re-baselined via approved Change Requests, and cost roll-up produces a deterministic tenant-isolated read model.
- T&M and fixed-price Project Invoices can be prepared, submitted, approved, and issued against a Project; the fixed-price decoupling rule is enforced via `ENG-012`.
- Project Invoice document numbers issue via `ENG-017`; foreign-currency lines resolve via `ENG-018`; the invoice voucher is generated via `ENG-015`.
- `ProjectInvoiceIssued` events are published via `ENG-024`; `SalesOrderConfirmed` events are consumed. Ledger posting is produced by MOD-002 Accounting through its own posting-rule bindings and is out of scope here.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 4 depends on Sprint 2 (Task, Milestone, Milestone Completion, Change Request) and Sprint 3 (approved Timesheets). Regression in either blocks Sprint 4.
  - **Impact:** Invoicing and cost roll-up would fail if Sprint-2 or Sprint-3 outputs regress.
  - **Mitigation:** Consume upstream outputs read-only; escalate defects to their owning sprints.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** `ENG-010`, `ENG-011`, `ENG-015`, `ENG-017`, `ENG-018`, and `ENG-024` contracts must be stable and available at Sprint-4 authoring/implementation time.
  - **Impact:** Instability in any of these engines would fragment invoice lifecycle, numbering, currency handling, or event publication.
  - **Mitigation:** Consume each engine per its authoritative contract; escalate defects to the engine owner.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** The fixed-price decoupling rule (Module PRD §7) MUST be enforced deterministically; any leakage of Timesheet totals into fixed-price invoice amounts would violate Module PRD §7 and Sprint-Plan boundaries.
  - **Impact:** Rule leakage would produce non-conforming invoices and blur T&M / fixed-price semantics.
  - **Mitigation:** Enforce via `ENG-012` at draft, submission, and approval; reject offending drafts deterministically.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** Ledger posting for Project Invoice is owned by MOD-002 Accounting via posting-rule bindings triggered by `ProjectInvoiceIssued`; direct invocation of `ENG-016` by this sprint would violate the Accounting boundary.
  - **Impact:** Direct posting would duplicate ledger effects and break Accounting ownership.
  - **Mitigation:** Restrict this sprint to `ENG-015` Voucher for invoice document; never invoke `ENG-016` here.
  - **Status:** Accepted

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Project Invoice, Project Budget, and cost-roll-up MUST NOT be redefined by downstream modules; Sprint-1 / Sprint-2 / Sprint-3 outputs MUST NOT be authored here; MOD-002 ledger postings, MOD-003 sales orders, MOD-007 employee master, MOD-008 payroll, and MOD-017 KPI definitions MUST NOT be authored here.
  - **Impact:** Blurring ownership boundaries would fragment domain data and break traceability.
  - **Mitigation:** Enforce §1.1.1–§1.1.5 boundaries at every downstream sprint gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** `ProjectInvoiceIssued` payload contract and the envelope for consumed `SalesOrderConfirmed` are governed by the authoritative event catalog. If any event name is not yet registered at Sprint-4 authoring time, it is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Sprint-4 implementation begins.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Project Budget validation and versioning; cost-roll-up idempotency; T&M and fixed-price amount derivation; fixed-price decoupling rule evaluation; milestone-invoiceable precondition; numbering and currency resolution invariants.
- **Integration** — Workflow orchestration via `ENG-010`; approval routing via `ENG-011`; audit emission via `ENG-004`; configuration resolution via `ENG-005`; document generation via `ENG-007`; voucher generation via `ENG-015`; numbering via `ENG-017`; currency resolution via `ENG-018`; notification dispatch via `ENG-025`; structural validation via `ENG-012`; event publication and consumption via `ENG-024`.
- **Contract** — `ProjectInvoiceIssued` payload conformance against the authoritative event catalog envelope; `SalesOrderConfirmed` consumer-side conformance.
- **End-to-end (smoke)** — Project Budget author → re-baseline via approved Change Request; cost roll-up over approved Timesheets; T&M Project Invoice draft → submit → approve → issue → `ProjectInvoiceIssued`; fixed-price Project Invoice against a completed-and-approved Milestone → issue → `ProjectInvoiceIssued`; attempted fixed-price invoice referencing Timesheet totals → rejected; attempted invoice against an incomplete Milestone → rejected; `SalesOrderConfirmed` triggers Project-Invoice preparation.

Sprint-specific fixtures: a Project fixture with both T&M and fixed-price configurations, a Milestone graph including completed-and-approved and incomplete states, a Timesheet fixture over approved and rejected paths, and an approval-policy fixture routed via `ENG-011` covering both baseline and Finance-required paths under a two-company smoke fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Project Budget as an immutable versioned record so re-baseline produces a new version rather than mutating the prior baseline.
- Consider computing project-cost roll-up as an idempotent projection keyed by Project so replays are safe.
- Consider enforcing the fixed-price decoupling rule via a single `ENG-012` predicate keyed by (Project, invoice mode) so draft, submission, and approval share the same evaluation path.
- Consider publishing `ProjectInvoiceIssued` as part of the issue commit transaction to guarantee "exactly once per issued Project Invoice" without a separate outbox.
- Consider deriving approval routing entirely from `ENG-005`-resolved approval-hierarchy configuration so no in-code policy is embedded.
- Consider surfacing consumed-event handlers (`SalesOrderConfirmed`) as idempotent projections so replays do not mutate authoritative Project Invoice state.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-010-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Milestone-to-invoice process with Project Budget, cost roll-up, T&M and fixed-price billing, Project Invoice lifecycle, fixed-price decoupling enforcement, `ProjectInvoiceIssued` publication, and `SalesOrderConfirmed` consumption (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Projects Ownership Convention with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, tasks/milestones, timesheets, analytics, MOD-002 postings and tax, MOD-003 sales orders, MOD-007 employee master, MOD-008 payroll, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-010-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-010-005` Projects Analytics & Compliance is the immediate successor per [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §2 and consumes outputs from Sprints 001–004.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md), [`./SPR-MOD-010-002-tasks-milestones-and-change-requests.md`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md), [`./SPR-MOD-010-003-timesheets-and-effort.md`](./SPR-MOD-010-003-timesheets-and-effort.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Precedent Sprint-4 PRDs — [`../manufacturing/SPR-MOD-009-004-sub-contracting-and-vendor-operations.md`](../manufacturing/SPR-MOD-009-004-sub-contracting-and-vendor-operations.md), [`../payroll/SPR-MOD-008-004-reimbursements-and-off-cycle-adjustments.md`](../payroll/SPR-MOD-008-004-reimbursements-and-off-cycle-adjustments.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)

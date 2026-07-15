---
title: "SPR-MOD-008-005 — Payslip Generation & Disbursement"
summary: "Sprint PRD for the Payslip Generation & Disbursement slice of MOD-008 Payroll: Payslip transaction lifecycle, payslip issuance, bulk disbursement file generation (immutable once generated), integration transport, and invocation of ENG-015 Voucher and ENG-016 Posting for payroll ledger effects. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-008-005"
parent_module: "MOD-008"
parent_sprint_plan: "MOD-008_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "10.0.5"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-015", "ENG-016", "ENG-017", "ENG-018", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "payroll", "mod-008", "payslips", "disbursement", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD008-005-20260715T000200Z-001"
parent_result_id: "GT003-MOD008-004-20260715T000100Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-008-005 — Payslip Generation & Disbursement

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-008 Payroll** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-008-005` (permanent) |
| Parent Module | `MOD-008` — Payroll |
| Parent Sprint Plan | [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Sprints | [`SPR-MOD-008-002`](./SPR-MOD-008-002-payroll-cycles-and-runs.md) (Draft), [`SPR-MOD-008-003`](./SPR-MOD-008-003-statutory-computations.md) (Draft), [`SPR-MOD-008-004`](./SPR-MOD-008-004-reimbursements-and-advances.md) (Draft) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) |
| Downstream Sprints | `SPR-MOD-008-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Payslip** transaction lifecycle and the **Approval-to-disbursement** and **Disbursement-to-posting** business processes for MOD-008 Payroll: issue a Payslip for every finalized Payroll Run, generate the bulk disbursement file (immutable once generated), transport the disbursement file to bank endpoints via `ENG-023` Integration, and invoke `ENG-015` Voucher plus `ENG-016` Posting for the payroll ledger effects owned by **MOD-002 Accounting**. Publish the Payroll-lifecycle domain events originating-allocated to this sprint (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) via `ENG-024`.

> **Payroll Ownership Convention (recapitulated).** The Payroll module owns the business semantics of Payslip issuance, disbursement file generation, and the invocation-time contract with `ENG-015` and `ENG-016`. ERP Core Engines provide shared infrastructure (authorization, audit, document, voucher, posting, numbering, currency, integration, eventing, notification, export) but **MUST NOT** redefine Payroll business rules. Employee master remains exclusive to **MOD-007 HRMS** and is consumed read-only. Double-entry posting logic and voucher construction remain exclusive to **MOD-002 Accounting**: this sprint **invokes** `ENG-015` and `ENG-016`; it does not redefine posting behavior. Analytics remains reserved for `SPR-MOD-008-006`.

#### 1.1.1 Payslip & Disbursement Authority

The **Payslip** transaction, the **Disbursement File** artifact, and the four payroll-lifecycle domain events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) are authoritatively owned by MOD-008 Payroll and originating-allocated to `SPR-MOD-008-005` per Sprint Plan §2 and §4. No other module MAY create, mutate, or reverse a Payslip or Disbursement File; no other sprint MAY publish these four events as an originating allocation.

#### 1.1.2 Payroll ↔ Accounting Boundary (Invocation-Only)

- Ledger effects of every finalized Payroll Run are produced by **`ENG-015` Voucher** and **`ENG-016` Posting**, invoked by this sprint on behalf of **MOD-002 Accounting**. Payroll assembles the invocation input (per-employee net-pay obligations, statutory obligations, reimbursement/advance adjustments) and passes it to the engines under Sprint-1-registered numbering series; the engines produce the vouchers and postings.
- This sprint **does not** implement double-entry logic, chart-of-accounts resolution, GL posting order, or period-end controls — those remain owned by MOD-002 Accounting via `ENG-015` / `ENG-016`.
- On invocation failure, the Payroll Run enters a corrective state defined by the Sprint-2 lifecycle; no Payslip can be marked `Posted` until the invocation is successfully retried.

#### 1.1.3 Disbursement File Immutability

- Once a Disbursement File is generated for a (tenant, company, payroll run), the artifact is **immutable** per Module PRD §7. Regeneration is expressed as a new Disbursement File that references and supersedes the original; the original artifact is retained.
- Transport of the Disbursement File to bank endpoints is delegated to `ENG-023` Integration. Bank endpoints are external; this sprint does not author bank-specific protocols.

#### 1.1.4 Payslip ↔ Payroll Run Binding

- Every Payslip is bound to exactly one finalized Payroll Run (owned by `SPR-MOD-008-002`) and to exactly one in-scope Employee (read-only from MOD-007). Payslips MAY reference approved Reimbursement or Advance transactions authored under `SPR-MOD-008-004`; those transactions remain immutable and are not re-authored here.
- The Module PRD §7 finalization gate authored in `SPR-MOD-008-003` (a Payroll Run cannot finalize until statutory completion) remains in force: Payslips are issued only for finalized Payroll Runs; this sprint does not weaken the finalization gate.

### 1.2 In Scope

- **Payslip** transaction lifecycle: issue, distribute (Employee-scoped attachment via `ENG-007`), reverse via a new reversing entry. Every transition is authorized via `ENG-002` under `ADR-032` and audited via `ENG-004` per `ADR-014`.
- **Disbursement File** generation, per (tenant, company, payroll run): immutable once generated per Module PRD §7; new file references and supersedes on regeneration.
- **Integration transport** of the Disbursement File to bank endpoints via `ENG-023` Integration.
- **Ledger effects** produced by invoking `ENG-015` Voucher and `ENG-016` Posting for every finalized Payroll Run. Payroll assembles the invocation input; the engines own the posting.
- **Numbering-series** allocation for Payslip identifiers and Disbursement File identifiers via `ENG-017` at transaction time using series registered in Sprint 1.
- **Denomination and rounding** via `ENG-018` under the Sprint-1 rounding policy.
- **Publication** via `ENG-024` of the four payroll-lifecycle domain events named in §11.1.
- **Notification** via `ENG-025` for payslip issuance, disbursement initiation, and reversal.
- **Export** via `ENG-027` of the Disbursement File in the standard bulk-export format used by transport.

### 1.3 Out of Scope

- Salary Structure, Component, Bank Mandate master, Payroll operations configuration — `SPR-MOD-008-001`.
- Payroll Run transaction lifecycle, input reconciliation, gross computation, approval routing, reversal — `SPR-MOD-008-002`.
- Statutory Setup, per-locale statutory evaluation, Module PRD §7 finalization gate — `SPR-MOD-008-003`.
- Reimbursement and Advance transaction lifecycles and their availability contract — `SPR-MOD-008-004`.
- Payroll read model, reports, dashboards, exports beyond disbursement, audit-readiness surface — `SPR-MOD-008-006`.
- Employee master, attendance, and leave — owned by MOD-007.
- Double-entry posting logic, chart-of-accounts resolution, voucher construction internals — owned by MOD-002 via `ENG-015` / `ENG-016`.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Bank-specific transport protocols — externalized to `ENG-023` Integration and to the Bank counterparty.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-008-005`, the following will exist:

- **Business capabilities.**
  - A Payroll administrator can issue a Payslip for every finalized Payroll Run under a (tenant, company, employee) scope, with the identifier allocated via `ENG-017` and amounts denominated and rounded via `ENG-018`.
  - A Payroll administrator can generate the Disbursement File for a (tenant, company, payroll run); once generated, the artifact is immutable per Module PRD §7.
  - The Disbursement File is transported to the tenant-configured bank endpoint via `ENG-023` Integration and exported in the standard bulk format via `ENG-027`.
  - Ledger effects for a finalized Payroll Run are produced by invoking `ENG-015` Voucher and `ENG-016` Posting; Payroll assembles the invocation input and does not redefine posting logic.
  - Reversal of a Payslip is supported via a new reversing entry; the original Payslip remains immutable, and its Disbursement File is superseded (not mutated) if disbursement had been initiated.
  - Notifications for payslip issuance, disbursement initiation, and reversal are emitted via `ENG-025`.
- **Domain events published (per §11.1).** `PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated` — via `ENG-024`.
- **Configuration artifacts.** No new configuration namespace is introduced; this sprint consumes the Payroll configuration namespace registered by Sprint 1 (numbering series, rounding policy) via `ENG-005` and `ENG-017`, plus bank endpoint configuration surfaced by MOD-001 Platform for `ENG-023` transport.
- **Audit artifacts.** An audit record exists for every Payslip and Disbursement File lifecycle transition (Payslip issue, Payslip distribute, Payslip reverse, Disbursement File generate, Disbursement File transport, `ENG-015`/`ENG-016` invocation, event publication), produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-008-005`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-008 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Payslip generation; Disbursement and posting | Payslip lifecycle; Disbursement File generation and transport; ledger invocation |
| §3 Personas — Payroll Officer, HR, Finance, Employee, Auditor, Bank | User stories (§4) |
| §4 Business Processes — Approval-to-disbursement; Disbursement-to-posting | Payslip issuance path; Disbursement generation, transport, and ledger invocation path |
| §6 Transactions — Payslip; Posting Behavior clause; Numbering clause; Audit clause | Payslip transaction lifecycle; `ENG-015`/`ENG-016` invocation; `ENG-017` allocation; `ENG-004` audit |
| §7 Business Rules — "Disbursement files are immutable once generated" | Disbursement File Immutability (§1.1.3, §5.4) |
| §8 Integration Points — Events Published (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`); Bank (external) | Event publication (§11.1); `ENG-023` transport to bank |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Payroll Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Payslip generation (§2) | `SPR-MOD-008-005` |
| Disbursement and posting (§2) | `SPR-MOD-008-005` |

Both allocations are unique. No other Payroll sprint claims either capability as its originating allocation. The Payroll-lifecycle domain events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) are originating-allocated to this sprint per Sprint Plan §2.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Payslip generation* and *Disbursement and posting*, §4 processes *Approval-to-disbursement* and *Disbursement-to-posting*, §6 transaction *Payslip* with Posting/Numbering/Audit clauses, §7 immutability rule, §8 events → this Sprint PRD → deliverables in §2 (Payslip lifecycle, Disbursement File generation, `ENG-023` transport, `ENG-015`/`ENG-016` invocation, event publication).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Payroll administrator, I want to issue a Payslip for every finalized Payroll Run under a (tenant, company, employee) scope, so that the employee's net-pay obligation is recorded and reviewable.*
- **US-002.** *As an Employee, I want my issued Payslip to be distributed to me via `ENG-007`, so that I can retrieve and review the artifact for a given period.*
- **US-003.** *As a Payroll administrator, I want to generate the Disbursement File for a (tenant, company, payroll run), so that all in-run net-pay obligations can be transported to the bank in a single, immutable artifact.*
- **US-004.** *As a Payroll administrator, I want the Disbursement File transported to the bank endpoint via `ENG-023`, so that the bank receives an authoritative, exported (`ENG-027`) payload without Payroll authoring bank-specific protocols.*
- **US-005.** *As a Finance user, I want the Payroll Run's ledger effects produced by invoking `ENG-015` Voucher and `ENG-016` Posting, so that MOD-002 Accounting owns and controls the posting.*
- **US-006.** *As a Payroll administrator, I want to reverse a Payslip via a new reversing entry, so that corrections are made without mutating the original Payslip and without mutating an already-generated Disbursement File.*
- **US-007.** *As a downstream module (MOD-002, MOD-017), I want the four payroll-lifecycle domain events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) published via `ENG-024`, so that I can consume them under the authoritative event catalog contract.*
- **US-008.** *As a participant, I want notifications for payslip issuance, disbursement initiation, and reversal via `ENG-025`, so that I can act on the current state.*
- **US-009.** *As an Auditor, I want every Payslip and Disbursement File lifecycle transition, engine invocation, and event publication to be audited via `ENG-004`, so that history is fully reconstructible.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Payslip issuance (US-001, US-002)

- **Given** a finalized Payroll Run (owned by Sprint 2, with statutory completion enforced per Sprint 3 §7 finalization gate),
  **when** a Payroll administrator issues Payslips for the run,
  **then** exactly one Payslip is produced per in-scope Employee, its identifier is allocated via `ENG-017`, amounts are denominated and rounded via `ENG-018` under the Sprint-1 rounding policy, distribution attachment is captured via `ENG-007`, and the transition is audited via `ENG-004`.
- **Given** a Payroll Run that is not finalized,
  **when** Payslip issuance is attempted,
  **then** the request is rejected deterministically and no Payslip is created.

### 5.2 Payslip reversal (US-006)

- **Given** an issued Payslip,
  **when** a Payroll administrator initiates reversal,
  **then** a new reversing Payslip is created that references the original; the original remains immutable; the transition is audited via `ENG-004`.
- **Given** the Disbursement File for the originating Payroll Run has already been generated,
  **when** the Payslip is reversed,
  **then** the existing Disbursement File is **not** mutated; if disbursement had been initiated, a superseding Disbursement File is authored per §5.4 and the reversal is reflected there.

### 5.3 Disbursement File generation (US-003)

- **Given** a Payroll Run with Payslips issued for every in-scope Employee,
  **when** the Disbursement File is generated,
  **then** the file is produced as a single artifact for the (tenant, company, payroll run) scope, its identifier is allocated via `ENG-017`, and generation is audited via `ENG-004`.
- **Given** a generated Disbursement File,
  **when** any mutation of the artifact is attempted,
  **then** the request is rejected deterministically; per Module PRD §7 the file is immutable.

### 5.4 Disbursement File supersession (US-003, US-006)

- **Given** a generated Disbursement File and a subsequent lawful reason to regenerate (for example, an approved Payslip reversal per §5.2),
  **when** regeneration is initiated,
  **then** a new Disbursement File is produced with a new identifier that **references and supersedes** the original; the original is retained and remains immutable; supersession is audited via `ENG-004`.

### 5.5 Integration transport to bank (US-004)

- **Given** a generated Disbursement File and a tenant-configured bank endpoint (surfaced by MOD-001 Platform for `ENG-023`),
  **when** transport is invoked,
  **then** the file is exported via `ENG-027` in the standard bulk format and delivered by `ENG-023`; delivery and any transport-layer acknowledgement are audited via `ENG-004`.
- **Given** transport failure under `ENG-023`,
  **when** the failure surfaces,
  **then** the Disbursement File remains valid and immutable; retry is attempted per the `ENG-023` contract; no Payroll-side mutation of the file occurs.

### 5.6 Ledger invocation via ENG-015 and ENG-016 (US-005)

- **Given** a finalized Payroll Run,
  **when** the Payroll ledger invocation is issued,
  **then** Payroll assembles the invocation input (per-employee net-pay obligations, statutory obligations, reimbursement/advance adjustments) and calls `ENG-015` Voucher and `ENG-016` Posting; the engines produce the vouchers and postings owned by MOD-002 Accounting; the invocation and its outcome are audited via `ENG-004`.
- **Given** invocation failure returned by `ENG-015` or `ENG-016`,
  **when** the failure surfaces,
  **then** no Payslip in the run is marked `Posted`; the run enters the corrective state defined by the Sprint-2 lifecycle; retry MUST succeed before `PayrollPosted` is published.

### 5.7 Event publication (US-007)

- **Given** a Payroll Run whose Payslips have been issued,
  **when** issuance completes for the run,
  **then** `PayrollProcessed` and `PayslipIssued` are published via `ENG-024` under the authoritative event catalog contract.
- **Given** a successful ledger invocation per §5.6,
  **when** the invocation completes,
  **then** `PayrollPosted` is published via `ENG-024`.
- **Given** a successful transport per §5.5,
  **when** transport completes,
  **then** `DisbursementInitiated` is published via `ENG-024`.

### 5.8 Notifications (US-008)

- **Given** a Payslip issuance, a disbursement initiation, or a Payslip reversal,
  **when** the transition completes,
  **then** the appropriate participants receive notifications via `ENG-025`.

### 5.9 Audit integration (US-009)

- **Given** any Payslip or Disbursement File lifecycle transition, `ENG-015`/`ENG-016` invocation, `ENG-023` transport, or `ENG-024` event publication,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, transaction/artifact identifier, transition type, referenced identifiers where applicable, and timestamp.

### 5.10 Isolation invariants (`ADR-011`)

- **Given** any Payslip, Disbursement File, ledger invocation, or event publication,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read, write, invocation, or publication can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-008` — Payroll.
- **Module PRD:** [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Payslip generation; Disbursement and posting), §3 (Payroll Officer, HR, Finance, Employee, Auditor, Bank), §4 (Approval-to-disbursement; Disbursement-to-posting), §6 (Payslip; Posting Behavior; Numbering; Audit), §7 (Disbursement files immutable), §8 (events; Bank external), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-008` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy (including bank endpoint configuration surfaced to `ENG-023`), audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — voucher and posting semantics invoked via `ENG-015` and `ENG-016`; not redefined here.
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) — Employee master consumed read-only.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-008-002` (Payroll Cycles & Runs) — provides finalized Payroll Runs; `SPR-MOD-008-003` (Statutory Computations) — provides the finalization gate enforcing statutory completion; `SPR-MOD-008-004` (Reimbursements & Advances) — provides approved Reimbursements and Advances consumed at gross computation and reflected in the Payslip and Disbursement File.
- **Downstream sprints:** `SPR-MOD-008-006` (Payroll Analytics & Compliance) — per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.0,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Payroll Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Payslip and Disbursement actions and on ledger invocation per `ADR-032`. |
| `ENG-004` Audit | Records every Payslip and Disbursement File lifecycle transition, engine invocation, transport, and event publication per `ADR-014`. |
| `ENG-007` Document | Captures Payslip distribution attachments and the Disbursement File artifact retention. |
| `ENG-015` Voucher | Invoked to produce vouchers for the finalized Payroll Run under MOD-002 ownership. |
| `ENG-016` Posting | Invoked to produce postings for the finalized Payroll Run under MOD-002 ownership. |
| `ENG-017` Numbering | Allocates Payslip and Disbursement File identifiers using series registered in Sprint 1. |
| `ENG-018` Currency | Denomination and rounding contract for Payslip amounts and Disbursement File totals under the Sprint-1 rounding policy. |
| `ENG-023` Integration | Transports the Disbursement File to tenant-configured bank endpoints. |
| `ENG-024` Eventing | Publishes `PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, and `DisbursementInitiated`. |
| `ENG-025` Notification | Delivers notifications for payslip issuance, disbursement initiation, and reversal. |
| `ENG-027` Export | Renders the Disbursement File in the standard bulk-export format used by transport. |

Payroll business semantics (Payslip lifecycle, Disbursement File generation and immutability, ledger-invocation input assembly, event publication timing) are owned by this module and are not delegated to any engine. Ledger construction (double-entry, chart-of-accounts resolution) remains owned by MOD-002 Accounting via `ENG-015` and `ENG-016`.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Payslip, Disbursement File, ledger invocation, transport, and event publication. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every lifecycle transition, engine invocation, transport, and event publication. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Payslip and Disbursement actions and to ledger-invocation authority. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Payslip | MOD-008 (this sprint) | Transaction representing the net-pay obligation for one Employee within one finalized Payroll Run. |
| Payslip Distribution Attachment | MOD-008 (this sprint, backed by `ENG-007`) | Association of the distributable Payslip artifact with a Payslip. |
| Payslip Reversal Link | MOD-008 (this sprint) | Association between an issued Payslip and its reversing entry. |
| Disbursement File | MOD-008 (this sprint) | Immutable artifact aggregating in-run net-pay obligations for transport to bank endpoints, scoped by (tenant, company, payroll run). |
| Disbursement File Supersession Link | MOD-008 (this sprint) | Association between an immutable Disbursement File and its lawful superseding file. |
| Ledger Invocation Record | MOD-008 (this sprint) | Record of an invocation of `ENG-015` and `ENG-016` for a given finalized Payroll Run, with input assembly summary and outcome. |

### 10.2 Relationships

- A **Payslip** references an in-scope **Employee** (HRMS read-only), is bound to exactly one finalized **Payroll Run** (owned by Sprint 2), and MAY reference approved **Reimbursement** and **Advance** transactions (owned by Sprint 4) as consumed inputs; those references are read-only.
- A **Payslip** aggregates zero or one **Payslip Distribution Attachment** captured via `ENG-007`, and MAY have a **Payslip Reversal Link** to a reversing entry; an entry MUST NOT be self-referential.
- A **Disbursement File** aggregates the in-run Payslips for its (tenant, company, payroll run) scope and MAY have a **Disbursement File Supersession Link** to a lawful superseding file; the original file remains immutable.
- A **Ledger Invocation Record** references exactly one finalized **Payroll Run** and records the outcome of the `ENG-015` and `ENG-016` calls; the vouchers and postings produced by the engines are **owned by MOD-002** and are not represented as MOD-008 entities.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-008` per the Payroll Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Employee** entity is owned by MOD-007 HRMS and consumed read-only.
- The **Payroll Run** entity is owned by MOD-008 Payroll and originated in Sprint 2; it is not redefined here.
- **Voucher** and **GL Entry** entities remain owned by MOD-002 Accounting via `ENG-015` and `ENG-016`; they are produced by invocation and are not represented as MOD-008 entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 5 is the originating sprint for the four Payroll-lifecycle domain events named in Module PRD §8:

| Event | Emitted When |
| --- | --- |
| `PayrollProcessed` | Payslips have been issued for every in-scope Employee of a finalized Payroll Run (per §5.7). |
| `PayslipIssued` | A Payslip is issued for one in-scope Employee (per §5.1 and §5.7). |
| `PayrollPosted` | `ENG-015` + `ENG-016` invocation for a finalized Payroll Run completes successfully (per §5.6 and §5.7). |
| `DisbursementInitiated` | `ENG-023` transport of the Disbursement File to the tenant-configured bank endpoint completes (per §5.5 and §5.7). |

All four events are published via `ENG-024` under the authoritative event catalog contract; envelope and delivery guarantees are not redefined here.

### 11.2 Consumed

Sprint 5 consumes no additional cross-module domain events beyond those already consumed by Sprint 2 for run inputs and Sprint 4 for reimbursement/advance availability. Any event name required by the event catalog contract at execution time that is not present is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Payslip, Disbursement File, ledger invocation, transport, and event publication.
- [ ] Every lifecycle transition, engine invocation, transport, and event publication produces an audit record via `ENG-004`.
- [ ] Payslip issuance is exercised end-to-end for a finalized Payroll Run and rejected for a non-finalized run.
- [ ] Disbursement File generation is exercised end-to-end and immutability per Module PRD §7 is enforced by construction.
- [ ] Disbursement File supersession is exercised end-to-end; the original artifact is retained.
- [ ] `ENG-023` Integration transport of the Disbursement File is exercised end-to-end; `ENG-027` export renders the standard bulk format.
- [ ] `ENG-015` Voucher and `ENG-016` Posting invocation is exercised end-to-end for a finalized Payroll Run; posting logic is not redefined by this sprint.
- [ ] Numbering-series allocation for Payslip and Disbursement File identifiers is exercised end-to-end via `ENG-017` using series registered in Sprint 1.
- [ ] Denomination and rounding via `ENG-018` uses the Sprint-1 rounding policy.
- [ ] `PayrollProcessed`, `PayslipIssued`, `PayrollPosted`, and `DisbursementInitiated` are published via `ENG-024` under the authoritative event catalog contract.
- [ ] Notifications for payslip issuance, disbursement initiation, and reversal are delivered via `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-008_SPRINT_PLAN.md` §2 (`SPR-MOD-008-005`):

- Payslips can be issued for every completed payroll run.
- Disbursement files are generated, delivered via `ENG-023`, and are immutable per §7 business rule.
- Payroll ledger effects are produced via `ENG-015` + `ENG-016` (invoked, not redefined).
- `PayslipIssued`, `DisbursementInitiated`, `PayrollProcessed`, and `PayrollPosted` are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 5 depends on `SPR-MOD-008-002` for finalized Payroll Runs, `SPR-MOD-008-003` for the statutory-completion finalization gate, and `SPR-MOD-008-004` for approved Reimbursement/Advance availability.
  - **Impact:** Any regression against Sprints 2–4 blocks Payslip issuance and Disbursement File generation.
  - **Mitigation:** Treat any regression as a Sprint 2/3/4 defect and re-plan; do not restate their semantics here.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Ledger construction is delegated to `ENG-015` and `ENG-016`; if MOD-002 posting semantics change, invocation input assembly may need to change without redefining posting logic.
  - **Impact:** Redefining posting or voucher construction inside Payroll would blur the Payroll ↔ Accounting boundary.
  - **Mitigation:** Confine this sprint to invocation-input assembly (§1.1.2, §5.6); treat any posting-semantic drift as a coordinated cross-module governance pass.
  - **Status:** Accepted

- **Risk ID:** R-03
  - **Description:** Disbursement File is immutable per Module PRD §7; any regeneration must go through supersession (§5.4) and not mutation.
  - **Impact:** Mutation of a generated Disbursement File would violate Module PRD §7 and break bank-side reconciliation.
  - **Mitigation:** Enforce immutability by construction; allow only supersession via new file with reference-link.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** Bank-specific transport protocols are external and are delegated to `ENG-023`; Payroll authors none of them here.
  - **Impact:** Encoding bank-specific behavior inside Payroll would blur the Integration boundary.
  - **Mitigation:** Confine Payroll to exporting the standard bulk format (`ENG-027`) and invoking `ENG-023`; treat any bank-specific quirk as an integration concern.
  - **Status:** Accepted

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Envelope and delivery guarantees for `PayrollProcessed`, `PayslipIssued`, `PayrollPosted`, `DisbursementInitiated` are governed by the authoritative event catalog; any drift MUST be reconciled through event-catalog governance, not by editing this sprint.
  - **Impact:** Locally editing event envelopes would violate the FROZEN Wrapper.
  - **Mitigation:** Defer any envelope change to a governance pass; keep publication under the authoritative catalog contract.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Payslip issuance preconditions (Payroll Run finalized); Disbursement File immutability by construction; supersession-link acyclicity; ledger-invocation input assembly invariants.
- **Integration** — `ENG-002` authorization; `ENG-004` audit emission on every transition, invocation, transport, and publication; `ENG-007` Payslip distribution and Disbursement File retention; `ENG-015` and `ENG-016` invocation contract (input in, outcome out; no double-entry logic in Payroll); `ENG-017` numbering allocation; `ENG-018` currency denomination; `ENG-023` transport; `ENG-024` event publication for all four events; `ENG-025` notification delivery; `ENG-027` export of the standard bulk format.
- **Contract** — Payroll Run finalization contract (Sprint 2); statutory-completion finalization gate (Sprint 3); Reimbursement/Advance availability (Sprint 4); authoritative event-catalog envelope for the four published events.
- **End-to-end (smoke)** — Finalize Payroll Run → issue Payslips → generate Disbursement File → transport via `ENG-023` → invoke `ENG-015`/`ENG-016` → publish four events, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation; plus a Payslip-reversal path that exercises Disbursement File supersession (§5.4).

Sprint-specific fixtures: a two-company smoke fixture, a bank-endpoint fixture for `ENG-023`, a voucher/posting invocation fixture for `ENG-015`/`ENG-016`, and an event-catalog conformance fixture for the four published events.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Payslip issuance as a per-run projection whose input is the finalized Payroll Run plus approved Reimbursement/Advance availability, so §5.1 rejection of unfinished runs falls out of the projection contract.
- Consider representing the Disbursement File as a write-once artifact with an explicit `supersedes` foreign key, so §5.3 immutability and §5.4 supersession are both structural.
- Consider issuing `PayrollProcessed` and `PayslipIssued` as sibling events emitted from the same projection so the four-event surface stays coherent under retry.
- Consider isolating the `ENG-015`/`ENG-016` invocation behind a Payroll-owned invocation record so audit replay and retry after failure are trivially reconstructible without leaking posting internals into Payroll.
- Consider deferring `DisbursementInitiated` publication until `ENG-023` acknowledges delivery, so downstream consumers see the event only when transport has succeeded.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-008-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver Payslip issuance, Disbursement File generation and transport, ledger invocation via `ENG-015`/`ENG-016`, and the four originating-allocated Payroll-lifecycle event publications (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-008 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Payroll Ownership Convention (§1.1) with "consumed, not redefined" language; ledger construction remains owned by MOD-002 via `ENG-015`/`ENG-016`.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation (Sprint 1), cycles & runs (Sprint 2), statutory (Sprint 3), reimbursements/advances (Sprint 4), analytics (Sprint 6), HRMS-owned entities, MOD-002-owned posting internals, MOD-001-owned identity, and bank-specific protocols — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-008-006`) begin immediately after this one completes?**
   Yes. `SPR-MOD-008-006` Payroll Analytics & Compliance is the immediate successor per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-008-001` … `SPR-MOD-008-005`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-008-002-payroll-cycles-and-runs.md`](./SPR-MOD-008-002-payroll-cycles-and-runs.md), [`./SPR-MOD-008-003-statutory-computations.md`](./SPR-MOD-008-003-statutory-computations.md), [`./SPR-MOD-008-004-reimbursements-and-advances.md`](./SPR-MOD-008-004-reimbursements-and-advances.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Authoritative Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)

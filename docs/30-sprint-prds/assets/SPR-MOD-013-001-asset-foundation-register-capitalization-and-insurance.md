---
title: "SPR-MOD-013-001 — Asset Foundation (Register, Capitalization & Insurance)"
summary: "Sprint PRD for the foundational Assets layer of MOD-013: Asset, Asset Class, Location, and Insurance Policy master data; the Capitalization transaction lifecycle; asset register and hierarchy; componentization; and insurance/warranty coverage. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-013-001"
parent_module: "MOD-013"
parent_sprint_plan: "MOD-013_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "15.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "assets", "mod-013", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD013-001-20260716T020000Z-001"
parent_result_id: "GT002-MOD013-20260716T019000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-013-001 — Asset Foundation (Register, Capitalization & Insurance)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-013 Assets** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-013-001` (permanent) |
| Parent Module | `MOD-013` — Assets |
| Parent Sprint Plan | [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-013-002` … `SPR-MOD-013-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Assets Foundation** for BusinessOS: the Asset, Asset Class, Location, and Insurance Policy master data; the Capitalization transaction lifecycle (draft → submitted → approved → capitalized → reversed) covering **asset register and hierarchy**, **capitalization and componentization**, and **insurance and warranty coverage**; and the Assets operations configuration (numbering series, componentization rules, insurance defaults) resolved through `ENG-005`. This foundation is the substrate on which every subsequent Assets sprint — Depreciation, Maintenance/Transfer/Disposal, and Assets Analytics & Compliance — depends.

> **Assets Ownership Convention.** The Assets module owns the business semantics of the Asset, Asset Class, Location, and Insurance Policy masters, the Capitalization transaction lifecycle, the asset register and hierarchy, componentization, and the Assets operations configuration (numbering series, componentization rules, insurance defaults). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, document, attachment, workflow, approval, rules, numbering, eventing, notification) but **MUST NOT** redefine Assets business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of capitalization, depreciation, and disposal remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no Assets sprint writes journal entries directly; MOD-002 consumes Assets-published events through its own posting-rule bindings.

#### 1.1.1 Asset, Asset Class, Location, and Insurance Policy Master Authority

The **Asset**, **Asset Class**, **Location**, and **Insurance Policy** masters are authoritatively owned by MOD-013 Assets. No other module MAY create, edit, archive, or independently maintain a parallel Asset, Asset Class, Location, or Insurance Policy master. Downstream sprints and modules consume these masters through Assets-owned events and read APIs authored in this and later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Capitalization Transaction Authority

The **Capitalization** transaction is authoritatively owned by MOD-013 Assets, in this sprint. The lifecycle (draft → submitted → approved → capitalized → reversed) is enforced via `ENG-010` Workflow and multi-step approval via `ENG-011` Approval. Downstream sprints consume Capitalization state; only the transitions declared in this lifecycle are legal. Once a Capitalization has reached `capitalized` and a Depreciation Run has been executed against the corresponding Asset (Sprint 2), the Capitalization amount MUST NOT be altered except via reversal — that invariant is originating-owned here and enforced through `ENG-012` Rules.

#### 1.1.3 Assets ↔ Platform, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Assets consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Assets sprint writes journal entries; downstream sprints emit events that Accounting consumes, but never redefine posting logic. `AssetCapitalized` published here is the sole capitalization-phase trigger consumed by MOD-002 posting-rule bindings.
- **MOD-004 Purchase** owns the Purchase Invoice transaction and emits `PurchaseInvoiceReceived`. Sprint 1 consumes `PurchaseInvoiceReceived` read-only to seed Capitalization candidates; MOD-004-owned entities are not redefined here.
- **MOD-017 Analytics** owns cross-module KPI definitions. Assets operational reports are surfaced by `SPR-MOD-013-004`; cross-module KPIs are never redefined by MOD-013.

Ownership boundaries SHALL NOT be redefined in downstream Assets Sprint PRDs.

#### 1.1.4 Assets Configuration Authority

Assets operations configuration — **numbering series**, **componentization rules**, and **insurance defaults** — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline; numbering-series resolution executes through `ENG-017` at Capitalization document issuance time. Depreciation methods per class are declared in the Module PRD §10 but their registration and evaluation are scoped to `SPR-MOD-013-002` per the Sprint Plan capability allocation. No module-specific configuration keys are registered outside Assets's own ownership boundary.

#### 1.1.5 Foundation Master Lifecycle Boundary

Assets owns the lifecycle of every foundation master (Asset, Asset Class, Location, Insurance Policy) and the Capitalization transaction lifecycle enforced through `ENG-010` Workflow with multi-step approval via `ENG-011` Approval. Downstream sprints (Depreciation; Maintenance, Transfer & Disposal; Analytics) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- Asset master: create, edit, activate, deactivate, archive under a tenant/company; per-Asset attributes include Asset Class binding, Location binding, parent-Asset binding for hierarchy/componentization, and optional Insurance Policy linkage.
- Asset Class master: create, edit, activate, deactivate, archive under a tenant/company; per-Class componentization policy resolvable through `ENG-005`.
- Location master: create, edit, activate, deactivate, archive under a tenant/company.
- Insurance Policy master: create, edit, activate, deactivate, archive under a tenant/company; per-Policy warranty terms and coverage window; Insurance-defaults resolvable through `ENG-005`.
- Asset register and hierarchy: parent/child relationships between Assets within the same company, supporting componentization.
- Capitalization transaction lifecycle (draft → submitted → approved → capitalized → reversed), enforced through `ENG-010` Workflow with multi-step approvals routed through `ENG-011` Approval.
- Assets operations configuration namespace initialized per company via `ENG-005`: numbering series, componentization rules, insurance defaults.
- Document numbers for Capitalization documents issued via `ENG-017`.
- `AssetCapitalized` domain event published via `ENG-024` when a Capitalization reaches `capitalized`.
- `PurchaseInvoiceReceived` domain event consumed via `ENG-024` to seed Capitalization candidates from MOD-004-owned Purchase Invoices.
- Notification emission on Capitalization state transitions via `ENG-025` under the tenant's configured channels.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Audit emission via `ENG-004` for every foundation lifecycle transition.
- Attachment support for Capitalization and Insurance Policy documents (invoices, certificates, photos) via `ENG-008`.
- Document classification for Assets artifacts via `ENG-007`.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company invariants) via `ENG-012` at capture time.

### 1.3 Out of Scope

- Depreciation methods per class, depreciation schedule generation, Depreciation Run transaction lifecycle, scheduled periodic runs, `DepreciationPosted` publication — `SPR-MOD-013-002`.
- Maintenance Order transaction, calibration tracking, asset transfer between locations, Disposal transaction, `AssetTransferred` and `AssetDisposed` publication, `MaintenanceCompleted` consumption — `SPR-MOD-013-003`.
- Assets read model, operational reports, dashboards, exports, audit-readiness surface — `SPR-MOD-013-004`.
- Financial postings for capitalization, depreciation, and disposal — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Purchase Invoice authoring and `PurchaseInvoiceReceived` publication — owned by MOD-004 Purchase.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-013-001`, the following will exist:

- **Business capabilities.**
  - An Asset Manager can create, edit, activate, deactivate, and archive Asset, Asset Class, Location, and Insurance Policy records under a tenant/company.
  - An Asset Manager can compose an asset register and hierarchy, including componentization (parent-Asset binding within the same company).
  - An Asset Manager can capture a Capitalization (draft) under a tenant/company, referencing an Asset, an Asset Class, and (optionally) a `PurchaseInvoiceReceived`-sourced Purchase Invoice reference; drive it through the lifecycle `draft → submitted → approved → capitalized → reversed`, enforced via `ENG-010` Workflow with multi-step approvals via `ENG-011` Approval.
  - Capitalization document numbers are issued deterministically at document issuance via `ENG-017` from the configured numbering series.
  - Assets operations configuration (numbering series, componentization rules, insurance defaults) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
- **Domain events.**
  - `AssetCapitalized` is published via `ENG-024` when a Capitalization reaches `capitalized`. Payload contract is governed by the authoritative event catalog and not redefined here.
  - `PurchaseInvoiceReceived` is consumed via `ENG-024` to seed Capitalization candidates from MOD-004-owned Purchase Invoices.
- **Configuration artifacts.** Assets configuration namespace initialized for each company via `ENG-005` (numbering series, componentization rules, insurance defaults). No module-specific keys are registered outside Assets's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Assets-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Capitalization state transitions produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-013-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-013 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Assets primitives and personas | Asset / Asset Class / Location / Insurance Policy masters and Assets Ownership Convention |
| §2 Business Scope — Asset register and hierarchy; Capitalization and componentization; Insurance and warranty; submodules Register, Insurance | Master data delivered here plus Capitalization transaction lifecycle |
| §3 Personas — Asset Manager, Finance, Maintenance; Auditor; Insurer, Vendor | User stories (§4) |
| §5 Master Data — Asset, Asset Class, Location, Insurance Policy | All four masters delivered in this sprint |
| §6 Transactions — Capitalization | Capitalization transaction lifecycle (draft → submitted → approved → capitalized → reversed) |
| §7 Business Rules — capitalization-amount immutability once a Depreciation Run has occurred (originating-owned here; enforced end-to-end from Sprint 2 onwards); foundation invariants (tenancy, referential integrity, same-company composition) | Enforceable rules via `ENG-012` |
| §8 Integration Points — `AssetCapitalized` (published); `PurchaseInvoiceReceived` (consumed) | `AssetCapitalized` publication and `PurchaseInvoiceReceived` consumption via `ENG-024` |
| §10 Configuration — numbering series; componentization rules; insurance defaults (in scope this sprint) | Assets configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Assets Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Asset register and hierarchy (§2) | `SPR-MOD-013-001` |
| Capitalization and componentization (§2) | `SPR-MOD-013-001` |
| Insurance and warranty (§2) | `SPR-MOD-013-001` |

These allocations are unique; no other Assets sprint claims "Asset register and hierarchy", "Capitalization and componentization", or "Insurance and warranty" as its originating capability. Master-data entities Asset, Asset Class, Location, and Insurance Policy, and the Capitalization transaction, are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Asset register and hierarchy*, *Capitalization and componentization*, *Insurance and warranty* and submodules *Register* and *Insurance* → this Sprint PRD → deliverables in §2 (Asset, Asset Class, Location, Insurance Policy masters, asset register/hierarchy, Capitalization transaction lifecycle, Assets configuration namespace, `AssetCapitalized` publication, `PurchaseInvoiceReceived` consumption, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an Asset Manager, I want to create, edit, activate, deactivate, and archive Assets under a company (including Asset Class binding, Location binding, and parent-Asset binding for componentization), so that a coherent asset register and hierarchy exists before any capitalization, depreciation, maintenance, or disposal.*
- **US-002.** *As an Asset Manager, I want to create, edit, activate, deactivate, and archive Asset Classes under a company (including componentization policy resolved via `ENG-005`), so that class-driven behavior in later sprints references an authoritative catalog.*
- **US-003.** *As an Asset Manager, I want to create, edit, activate, deactivate, and archive Locations under a company, so that Asset placement and later transfer semantics reference an authoritative catalog.*
- **US-004.** *As an Asset Manager, I want to create, edit, activate, deactivate, and archive Insurance Policies under a company (including warranty terms, coverage window, and insurance defaults), so that Asset insurance coverage is deterministic and audit-traceable.*
- **US-005.** *As an Asset Manager, I want to capture a Capitalization for an Asset under a company, referencing an Asset Class and (optionally) a `PurchaseInvoiceReceived`-sourced Purchase Invoice reference, so that capitalization intent is captured deterministically before approval.*
- **US-006.** *As an Asset Manager, I want to drive a Capitalization through its lifecycle (draft → submitted → approved → capitalized → reversed) via workflow and multi-step approval, so that state transitions are governed deterministically.*
- **US-007.** *As an Asset Manager, I want the Capitalization document number to be issued at document issuance via the configured numbering series, so that Capitalization identity is stable and audit-traceable.*
- **US-008.** *As an Asset Manager, I want to register Assets operations configuration (numbering series, componentization rules, insurance defaults) per company, so that Capitalization capture, componentization, and insurance defaulting resolve their configuration deterministically.*
- **US-009.** *As an Asset Manager, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while Assets captures the master relationships.*
- **US-010.** *As a downstream subscriber (Depreciation, Maintenance/Transfer/Disposal, Analytics, and cross-module consumers including MOD-002 Accounting), I want `AssetCapitalized` to be published when a Capitalization reaches `capitalized`, so that downstream sprints and modules can react without polling Assets state.*
- **US-011.** *As an Asset Manager, I want an MOD-004-published `PurchaseInvoiceReceived` event to be consumed to seed a Capitalization candidate, so that acquired assets flow into the capitalization queue without redefining MOD-004-owned Purchase Invoice entities.*
- **US-012.** *As a security reviewer, I want every Assets-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct Asset, Asset Class, Location, Insurance Policy, Capitalization, and configuration history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Asset master (US-001)

- **Given** a valid Asset creation request under a tenant/company referencing an active Asset Class and an active Location in the same company, and (optionally) an active parent Asset in the same company,
  **when** an Asset Manager submits it,
  **then** the Asset is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to bind an Asset to an archived Asset Class, a Location or parent Asset in a different company, or a parent Asset that would introduce a cycle in the register hierarchy,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Asset Class master (US-002)

- **Given** a valid Asset Class creation request under a tenant/company,
  **when** an Asset Manager submits it,
  **then** the Asset Class is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** a componentization-policy attribute on an Asset Class,
  **when** it is queried at Capitalization time,
  **then** it resolves deterministically via `ENG-005` under the caller's (tenant, company) scope.

### 5.3 Location master (US-003)

- **Given** a valid Location creation request under a tenant/company,
  **when** an Asset Manager submits it,
  **then** the Location is persisted with a stable identifier, uniquely identified within the company, and audited.

### 5.4 Insurance Policy master (US-004)

- **Given** a valid Insurance Policy creation request under a tenant/company (including warranty terms and coverage window),
  **when** an Asset Manager submits it,
  **then** the Insurance Policy is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to link an Insurance Policy to an Asset in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.5 Capitalization capture (US-005)

- **Given** a valid Capitalization capture request under a tenant/company referencing an active Asset and an active Asset Class in the same company, and (optionally) an active Purchase Invoice reference received via a consumed `PurchaseInvoiceReceived`,
  **when** an Asset Manager submits it,
  **then** the Capitalization is persisted as `draft` with a stable identifier, and the creation is audited via `ENG-004`.
- **Given** an attempt to bind a Capitalization to an archived Asset, an Asset in a different company, or a `PurchaseInvoiceReceived` reference that is not resolvable to an active MOD-004-owned Purchase Invoice in the same company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.6 Capitalization lifecycle (US-006)

- **Given** a Capitalization in `draft`,
  **when** it is submitted,
  **then** it transitions to `submitted` via `ENG-010`, its document number is allocated via `ENG-017`, and the transition is audited.
- **Given** a Capitalization in `submitted`,
  **when** the required approval chain completes via `ENG-011`,
  **then** it transitions to `approved` via `ENG-010`, and the transition is audited.
- **Given** a Capitalization in `approved`,
  **when** capitalization completion is confirmed,
  **then** it transitions to `capitalized` via `ENG-010`, `AssetCapitalized` is published via `ENG-024`, and the transition is audited.
- **Given** a Capitalization in `capitalized`,
  **when** a legitimate reversal request is submitted and approved via `ENG-011`,
  **then** it transitions to `reversed` via `ENG-010`, and the transition is audited.
- **Given** an attempt to transition a Capitalization along any path not declared by the lifecycle (e.g. `draft → approved` directly, or `capitalized → submitted`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.
- **Given** a Capitalization that has reached `capitalized` and against which a Depreciation Run has been executed (in `SPR-MOD-013-002`),
  **when** an edit request attempts to modify the capitalization amount other than via reversal,
  **then** the request is rejected deterministically via `ENG-012` under the capitalization-amount-immutability rule.

### 5.7 Numbering (US-007)

- **Given** a Capitalization submission,
  **when** the submission executes,
  **then** a Capitalization document number is allocated via `ENG-017` from the configured numbering series for that company; the allocated number is immutable thereafter.

### 5.8 Assets operations configuration (US-008)

- **Given** a company under an active tenant,
  **when** numbering series, componentization rules, and insurance defaults are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** for depreciation methods are out of scope here and are delivered by `SPR-MOD-013-002` per §1.1.4.

### 5.9 Identity consumption (US-009)

- **Given** any Assets-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by Assets.

### 5.10 Event publication (US-010)

- **Given** a Capitalization transition to `capitalized`,
  **when** the transition completes,
  **then** `AssetCapitalized` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.11 Purchase Invoice seeding via consumed event (US-011)

- **Given** an MOD-004-published `PurchaseInvoiceReceived` event received via `ENG-024`,
  **when** the payload references a company that hosts an active Assets configuration namespace,
  **then** a Capitalization candidate becomes available in the Capitalization queue for that company, and the seeding is audited. The MOD-004-owned Purchase Invoice entity is not redefined; only the reference is stored.

### 5.12 Audit integration (US-012)

- **Given** any Assets-foundation lifecycle transition (Asset / Asset Class / Location / Insurance Policy / configuration create, update, activate, deactivate, archive, and Capitalization state transition),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.13 Isolation invariants (`ADR-011`)

- **Given** any Assets-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.14 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Asset, Asset Class, Location, Insurance Policy, or Capitalization data,
  **when** it reads or reacts to these masters/transactions,
  **then** it does so exclusively through Assets-owned events (`AssetCapitalized` here; additional events in later sprints) and Assets read APIs. No downstream module creates an independent Asset, Asset Class, Location, Insurance Policy, or Capitalization master.
- **Given** any Assets code path that requires MOD-004 Purchase Invoice data,
  **when** it needs the linked Purchase Invoice,
  **then** it consumes the reference via the `PurchaseInvoiceReceived` payload only; the MOD-004-owned Purchase Invoice entity is not redefined here.
- **Given** any Assets code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any Capitalization state change that has ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through the published `AssetCapitalized` event; no Assets code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-013` — Assets.
- **Module PRD:** [`docs/20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Asset register and hierarchy; Capitalization and componentization; Insurance and warranty; submodules Register, Insurance), §3 (Asset Manager, Finance, Maintenance; Auditor; Insurer, Vendor), §5 (Asset, Asset Class, Location, Insurance Policy), §6 (Capitalization transaction), §7 (capitalization-amount immutability rule; foundation invariants), §8 (`AssetCapitalized` published; `PurchaseInvoiceReceived` consumed), §10 (numbering series, componentization rules, insurance defaults), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-013` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly via published `AssetCapitalized`, not invoked from Assets).
- **Upstream sprint dependencies (per Sprint Plan §2):** None (Assets sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and `MOD002_ACCOUNTING_BASELINE_v1`.
- **Cross-module consumption (events only):** `PurchaseInvoiceReceived` (from MOD-004) via `ENG-024` for optional Capitalization-candidate seeding.
- **Downstream sprints:** `SPR-MOD-013-002` (Depreciation: Methods & Runs), `SPR-MOD-013-003` (Maintenance, Transfer & Disposal), `SPR-MOD-013-004` (Assets Analytics & Compliance) — per [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Assets Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the Asset Manager / Finance / Maintenance identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on Assets-foundation actions. |
| `ENG-003` Permission Management | Registers Assets-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every Assets-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves Assets operations configuration (numbering series, componentization rules, insurance defaults) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Asset, Asset Class, Location, Insurance Policy, and Capitalization content where applicable. |
| `ENG-007` Document | Provides document classification for Capitalization and Insurance Policy artifacts. |
| `ENG-008` Attachment | Provides attachment binding for Capitalization and Insurance Policy documents (invoices, certificates, photos). |
| `ENG-010` Workflow | Enforces the Capitalization transaction lifecycle (draft → submitted → approved → capitalized → reversed). |
| `ENG-011` Approval | Routes multi-step approvals for Capitalization submission and reversal. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition, no-cycle hierarchy) at capture time, and the capitalization-amount-immutability rule after a Depreciation Run has occurred. |
| `ENG-017` Numbering | Allocates Capitalization document numbers at submission time from the configured numbering series. |
| `ENG-024` Eventing | Publishes `AssetCapitalized` on Capitalization → `capitalized`; consumes `PurchaseInvoiceReceived` for optional Capitalization-candidate seeding. |
| `ENG-025` Notification | Emits notifications on Capitalization state transitions under the tenant's configured channels. |

Assets business semantics (Asset, Asset Class, Location, Insurance Policy, Capitalization transaction lifecycle, asset register and hierarchy, componentization, Assets configuration namespace, Capitalization ↔ Purchase Invoice read-only linkage) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this or any Assets sprint per Sprint Plan §5 — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by `AssetCapitalized` and downstream Assets-published events.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Assets-foundation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Assets-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Asset | MOD-013 (this sprint) | Named fixed asset scoped to a tenant/company, referencing exactly one Asset Class, exactly one Location, optionally one parent Asset (for componentization), and zero or more Insurance Policies within the same company. |
| Asset Class | MOD-013 (this sprint) | Named classifier scoped to a tenant/company, carrying componentization policy resolved via `ENG-005`. |
| Location | MOD-013 (this sprint) | Named location scoped to a tenant/company, referenced by Assets. |
| Insurance Policy | MOD-013 (this sprint) | Insurance/warranty coverage record scoped to a tenant/company, referencing zero or more Assets in the same company; carries warranty terms, coverage window, and insurance defaults. |
| Capitalization | MOD-013 (this sprint) | Transaction scoped to a tenant/company, referencing exactly one Asset, exactly one Asset Class, and optionally exactly one MOD-004-owned Purchase Invoice reference (via consumed `PurchaseInvoiceReceived`); runs a lifecycle (draft → submitted → approved → capitalized → reversed). |
| Capitalization ↔ Purchase Invoice Binding | MOD-013 (this sprint) | Read-only reference from a Capitalization to an MOD-004-owned Purchase Invoice received via consumed `PurchaseInvoiceReceived` within the same company. |
| Assets Configuration | MOD-013 (this sprint, configuration-scoped) | Assets operations configuration namespace per company resolved via `ENG-005` (numbering series, componentization rules, insurance defaults). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Assets**, zero or more **Asset Classes**, zero or more **Locations**, zero or more **Insurance Policies**, zero or more **Capitalizations**, and one **Assets configuration** namespace.
- An **Asset** references exactly one **Asset Class**, exactly one **Location**, optionally one parent **Asset**, and zero or more **Insurance Policies**, all within the same company.
- The parent/child **Asset** graph MUST be acyclic; each Asset has at most one parent.
- A **Capitalization** references exactly one **Asset** and exactly one **Asset Class** within the same company, and optionally exactly one MOD-004-owned **Purchase Invoice** (via consumed `PurchaseInvoiceReceived`) within the same company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-013` per the Assets Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Purchase Invoice** entity is owned by MOD-004 Purchase and is referenced read-only via consumed `PurchaseInvoiceReceived`; it is not an Assets-owned entity.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not an Assets-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Assets-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`AssetCapitalized`** — published via `ENG-024` when a Capitalization reaches `capitalized`. Per Sprint Plan §2 (`SPR-MOD-013-001`), this is the single domain event originated by this sprint. Additional Assets-lifecycle events (`DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) are originated by later Assets sprints per Module PRD §8.

### 11.2 Consumed

- **`PurchaseInvoiceReceived`** (from MOD-004 Purchase) — consumed via `ENG-024` to seed Capitalization candidates from MOD-004-owned Purchase Invoices. MOD-004-owned entities are not redefined here; only the reference is stored.

Consumption of `MaintenanceCompleted` (from external maintenance systems / MOD-004) is scoped to `SPR-MOD-013-003` and does not occur in this sprint.

Payload contracts for Assets events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Assets-foundation read and write.
- [ ] Every Assets-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Assets configuration namespace is initialized per company via `ENG-005` (numbering series, componentization rules, insurance defaults).
- [ ] The Capitalization transaction lifecycle (draft → submitted → approved → capitalized → reversed) is enforced end-to-end via `ENG-010` with multi-step approvals via `ENG-011`.
- [ ] Capitalization document numbers are issued at submission via `ENG-017` from the configured numbering series.
- [ ] `AssetCapitalized` is published via `ENG-024` on every Capitalization → `capitalized`, exactly once.
- [ ] `PurchaseInvoiceReceived` (MOD-004) is consumed via `ENG-024` and stored as a read-only Capitalization ↔ Purchase Invoice linkage without redefining MOD-004-owned entities.
- [ ] Notifications are emitted on Capitalization state transitions via `ENG-025`.
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by Assets.
- [ ] No Assets code path writes to `ENG-015` Voucher or `ENG-016` Posting; ledger effects are consumed by MOD-002 exclusively via `AssetCapitalized`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-013_SPRINT_PLAN.md` §2 (`SPR-MOD-013-001`):

- Asset, Asset Class, Location, and Insurance Policy records can be created, edited, and archived under a tenant/company.
- Capitalization lifecycle (draft → submitted → approved → capitalized → reversed) is enforced via `ENG-010`/`ENG-011`.
- Componentization and insurance defaults resolve deterministically through `ENG-005`.
- Document numbers issue through `ENG-017`.
- `AssetCapitalized` events are published via `ENG-024`; `PurchaseInvoiceReceived` events are consumed to seed capitalization candidates.
- All state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-013 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-013 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen and stable, since ledger effects of Capitalization are produced by MOD-002 via posting-rule bindings triggered by `AssetCapitalized`. Any drift in the MOD-002 event-binding contract would break capitalization posting.
  - **Impact:** Any drift in MOD-002 posting-rule bindings would decouple Assets state from ledger effects.
  - **Mitigation:** Consume MOD-002 posting bindings per their authoritative contract; escalate any change as an Accounting defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-004 Purchase is not yet published as a frozen baseline at authoring time (per repository state). `PurchaseInvoiceReceived` consumption for Capitalization seeding assumes MOD-004 will publish this event authoritatively before `SPR-MOD-013-001` enters `In Progress`.
  - **Impact:** If `PurchaseInvoiceReceived` is not registered in the authoritative event catalog before this sprint executes, Capitalization-candidate seeding cannot function.
  - **Mitigation:** Treat `PurchaseInvoiceReceived` as a deferred event-catalog registration item (see R-EV-01); AC 5.11 is enforced only for the payload contract governed by the event catalog at execution time.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Later Assets sprints (`SPR-MOD-013-002` … `SPR-MOD-013-004`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Assets-owned entities (Asset, Asset Class, Location, Insurance Policy, Capitalization, Assets configuration) MUST NOT be redefined by downstream modules; MOD-004 Purchase Invoice and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Asset / Asset Class / Location / Insurance Policy Master Authority convention (§1.1.1), the Capitalization Transaction Authority (§1.1.2), and the cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-07
  - **Description:** Assets operations configuration registration is in scope here for numbering series, componentization rules, and insurance defaults; **evaluation** semantics for depreciation methods are in scope of `SPR-MOD-013-002`.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register only the numbering-series, componentization-rule, and insurance-default configuration via `ENG-005` in this sprint; do not expose evaluation paths for depreciation methods here.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes `AssetCapitalized` and consumes `PurchaseInvoiceReceived`. Downstream Assets sprints declare additional events (`DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) and consume additional cross-module events (`MaintenanceCompleted`). Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** For `AssetCapitalized` and consumption of `PurchaseInvoiceReceived` — confirm event catalog registration before this sprint enters `In Progress`. For later events — handle in each downstream sprint's own §14. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Asset, Asset Class, Location, Insurance Policy, and Capitalization validation; Asset ↔ Asset Class / Location / parent-Asset invariants (including no-cycle hierarchy); Capitalization ↔ Asset / Asset Class invariants; Capitalization ↔ Purchase Invoice read-only linkage invariants; Capitalization lifecycle transition invariants; capitalization-amount-immutability invariant post-Depreciation-Run.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, structural validation via `ENG-012`, attachment binding via `ENG-008`, workflow via `ENG-010`, approval routing via `ENG-011`, numbering allocation via `ENG-017`, event publication and consumption via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `AssetCapitalized` payload contract per the authoritative event catalog; `PurchaseInvoiceReceived` consumption contract per the authoritative event catalog.
- **End-to-end (smoke)** — Capitalization draft → submitted → approved → capitalized → reversed, including document-number allocation, `AssetCapitalized` publication, optional `PurchaseInvoiceReceived`-driven seeding, insurance-policy linkage, and audit emission at each step; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an MOD-004 `PurchaseInvoiceReceived` read-only fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Asset, Asset Class, Location, Insurance Policy, and Capitalization lifecycles as small state machines so audit emission (§5.12) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (Asset ↔ Asset Class / Location / parent-Asset binding, Capitalization ↔ Asset binding, Capitalization ↔ Purchase Invoice linkage, Insurance Policy ↔ Asset linkage) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating Assets configuration initialization with company activation events emitted by MOD-001 so the Assets configuration namespace is ready before the first Asset record.
- Consider centralizing the `AssetCapitalized` publication path so downstream sprints that add fields to the payload (per the authoritative event catalog) touch a single emission point.
- Consider a small idempotent `PurchaseInvoiceReceived`-consumption handler keyed by (tenant, company, purchase_invoice_id) so replays do not seed duplicate Capitalization candidates.
- Consider enforcing the no-cycle Asset-hierarchy invariant in a dedicated rule evaluated at Asset create/update time via `ENG-012` to keep hierarchy operations deterministic under concurrent edits.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-013-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Assets Foundation — Asset, Asset Class, Location, and Insurance Policy masters, Capitalization transaction lifecycle covering register/hierarchy/componentization and insurance/warranty coverage, Assets operations configuration (numbering series, componentization rules, insurance defaults), identity consumption, `AssetCapitalized` publication, `PurchaseInvoiceReceived` consumption, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-013 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Assets Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates depreciation, maintenance/transfer/disposal, analytics, MOD-002-owned ledger postings, MOD-004-owned Purchase Invoice authoring, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-013-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-013-002` Depreciation (Methods & Runs) is the immediate successor per [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-013-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](../field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md), [`../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md), [`../projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](../projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)

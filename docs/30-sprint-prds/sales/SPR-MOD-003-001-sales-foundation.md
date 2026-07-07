---
title: "SPR-MOD-003-001 — Sales Foundation"
summary: "Sprint PRD for the foundational sales layer of MOD-003 Sales: customer master, customer hierarchy, sales organization, territories, salespersons, sales teams, sales configuration, sales numbering readiness, and sales-foundation events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Sales"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-003-001"
parent_module: "MOD-003"
parent_sprint_plan: "MOD-003_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "8.4.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-017", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-032", "ADR-051"]
tags: ["sprint", "prd", "sales", "mod-003", "foundation", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-003-001 — Sales Foundation

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-003 Sales** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-003-001` (permanent) |
| Parent Module | `MOD-003` — Sales |
| Parent Sprint Plan | [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (both frozen) |
| Downstream Sprints | `SPR-MOD-003-002` … `SPR-MOD-003-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Sales Foundation** for BusinessOS: the customer master and its lifecycle, customer hierarchy and classification, sales organization structure (branches, regions, territories), salespersons and sales teams, sales configuration namespace, sales numbering readiness, and audit integration for sales-foundation lifecycle events. This foundation is the substrate that every subsequent Sales sprint — quotations, orders, delivery, invoicing, returns, and analytics — depends on, and it is also the authoritative source of Customer master data consumed by other commercial modules (Purchase, Inventory, CRM, Projects, POS, Payroll).

> **Sales Ownership Convention.** The Sales module owns the business semantics of the Customer master, customer hierarchy, sales organization, sales territories, salespersons, sales teams, and sales configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, numbering, eventing) but **MUST NOT** redefine sales business rules. Downstream modules consume Sales master data and sales services rather than introducing independent customer masters or parallel sales structures. This complements — and does not redefine — the Platform governance conventions and the Accounting ownership conventions established in MOD002_ACCOUNTING_BASELINE_v1.

#### 1.1.1 Customer Master Authority

The Customer master is authoritatively owned by MOD-003 Sales. No other module MAY create, edit, archive, or independently maintain a parallel Customer master. Downstream modules (Purchase where relevant, Inventory, CRM, Projects, POS, Payroll — as applicable) consume Customer master data via published events and read APIs; they MUST NOT redefine the customer entity, its hierarchy, or its lifecycle.

#### 1.1.2 Commercial Ownership Boundary (Sales ↔ Accounting ↔ Inventory ↔ CRM)

Ownership boundaries at the Sales Foundation layer:

- **Sales owns** the commercial customer, commercial organization structure, salespersons, sales teams, territories, and sales configuration; and, in downstream sprints, the commercial document lifecycle (quotations, orders, delivery, invoicing, returns).
- **Accounting owns** accounting vouchers, journal posting, ledger posting, taxation, financial reporting, receivables ledger, and accounting period governance. Sales MUST NOT create accounting journals, ledger entries, or independently manage accounting voucher lifecycles.
- **Inventory owns** item master, stock, and inventory reservation semantics. Sales consumes reservation contracts; it does not redefine inventory ownership.
- **CRM owns** lead, prospect, and opportunity lifecycles pre-conversion. Once a lead is converted into a customer, the Customer record becomes a Sales-owned entity.

Ownership boundaries SHALL NOT be redefined in downstream Sales Sprint PRDs.

#### 1.1.3 Sales Configuration Authority

Sales configuration (default price list defaults, approval thresholds, numbering series registration, return-window defaults, credit-limit policy defaults) is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. No module-specific configuration keys are registered outside Sales' own ownership boundary.

#### 1.1.4 Customer Lifecycle Boundary

Sales owns the customer lifecycle (create, activate, suspend, archive) and customer commercial classification (group, category, territory, salesperson assignment). Financial standing of a customer — outstanding receivables, credit exposure, dunning status — is **consumed** from Accounting; it is not redefined here.

### 1.2 In Scope

- Customer master: creation, editing, archival; customer identifiers; commercial classification.
- Customer hierarchy: parent/child customer relationships within a company.
- Customer categories and customer groups: classification taxonomy.
- Customer status: active, suspended, archived lifecycle transitions.
- Customer contacts and customer addresses (billing, shipping, and other business addresses).
- Sales organization: sales branches, sales regions, sales territories under the tenant/company hierarchy established by the Platform baseline.
- Salespersons and sales teams: definition, activation, and assignment to territories and customers.
- Customer ↔ territory ↔ salesperson assignment rules.
- Sales configuration: base sales settings, default price list references, approval thresholds, return-window defaults, credit-limit policy defaults — resolved via `ENG-005`.
- Sales numbering readiness: registration of the sales-document numbering series (quotation, sales order, delivery note, sales invoice, credit note, debit note) via `ENG-017`. Numbering *consumption* by those document types is delivered by downstream Sales sprints; only the series registration and resolution readiness are in scope here.
- Sales master validation invariants (uniqueness, referential integrity, tenancy).
- Audit integration for every sales-foundation lifecycle transition via `ENG-004`.
- Events published (see §11): `customer.created`, `customer.updated`, `customer.activated`, `customer.deactivated`, `salesperson.created`, `salesterritory.updated` — delivered via `ENG-024`.

### 1.3 Out of Scope

Reserved for later Sales sprints (see [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)):

- Quotation lifecycle, sales order lifecycle, pricing and discount evaluation, approval routing — `SPR-MOD-003-002`.
- Delivery orders, pick/pack, shipment readiness, fulfillment lifecycle, inventory reservation consumption — `SPR-MOD-003-003`.
- Sales invoice, credit note, debit note lifecycle, tax determination, receivables creation, invoice export, accounting voucher handoff — `SPR-MOD-003-004`.
- Sales returns and customer adjustments — `SPR-MOD-003-005`.
- Sales analytics, sales controls, credit-limit enforcement, sales reporting surfaces — `SPR-MOD-003-006`.
- Accounting vouchers, journal posting, ledger posting, taxation calculation, receivables ledger, sales revenue reporting — owned by MOD-002 Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory item master, stock, reservation semantics — owned by MOD-005 Inventory.
- CRM lead/prospect/opportunity lifecycles pre-conversion — owned by CRM.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-003-001`, the following will exist:

- **Business capabilities.**
  - A sales administrator can create, edit, and archive customers under a tenant/company, with a coherent customer hierarchy and commercial classification.
  - Customer contacts and customer addresses (billing, shipping, other) can be maintained on every customer.
  - A sales administrator can define sales branches, sales regions, and sales territories under the tenant/company hierarchy.
  - Salespersons and sales teams can be defined and assigned to territories and customers deterministically.
  - Sales configuration (defaults, thresholds, return-window, credit-limit policy) is resolved deterministically per company through `ENG-005`.
  - Sales-document numbering series are registered and resolvable via `ENG-017` (consumption by document types occurs in downstream sprints).
- **Published events.** Six sales-foundation event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions.
- **Configuration artifacts.** Sales configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside Sales' own ownership boundary.
- **Audit artifacts.** An audit record exists for every sales-foundation lifecycle transition, produced via `ENG-004`, in a form consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-003-001`.
  - Sales-foundation event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-003 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Sales primitives and personas | Customer master and sales-foundation ownership convention |
| §2 Business Scope — Customer management, Sales organization, Territories | Customer master, customer hierarchy, sales branches/regions/territories |
| §3 Personas — Sales Executive, Sales Manager, Order Desk | User stories (§4) |
| §5 Master Data — Customer, Sales Territory, Salesperson | Customer, hierarchy, contacts, addresses, territory, salesperson, sales team |
| §7 Business Rules — Customer commercial invariants | Enforceable classification, tenancy, and lifecycle invariants |
| §8 Integration Points — Customer master consumption | Downstream consumption contracts through `ENG-024` events |
| §10 Configuration — Default price list, Approval thresholds, Numbering series, Return window, Credit-limit policy | Sales configuration namespace via `ENG-005`; numbering series registration via `ENG-017` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Sales Module PRD.**

---

## 4. User Stories

- **US-001.** *As a sales administrator, I want to create, edit, and archive customers under a company, so that a coherent customer master exists before any quotation or order is created.*
- **US-002.** *As a sales administrator, I want to classify customers by group, category, and territory, so that downstream pricing, approval, and reporting sprints can rely on deterministic classifications.*
- **US-003.** *As a sales administrator, I want to maintain customer contacts and multiple addresses (billing, shipping, other), so that commercial documents can resolve the correct party addresses.*
- **US-004.** *As a sales manager, I want to define sales branches, regions, and territories, so that customers and salespersons can be assigned to a deterministic sales organization.*
- **US-005.** *As a sales manager, I want to define salespersons and sales teams and assign them to territories and customers, so that ownership of accounts is unambiguous.*
- **US-006.** *As an admin, I want to configure default sales settings, approval thresholds, return-window defaults, and credit-limit policy defaults per company, so that later Sales sprints resolve configuration deterministically.*
- **US-007.** *As an admin, I want sales-document numbering series to be registered and resolvable, so that downstream Sales sprints can consume them without redefining numbering.*
- **US-008.** *As a downstream module (system persona), I want to receive `customer.*`, `salesperson.*`, and `salesterritory.*` events, so that I can react to sales-foundation transitions in a decoupled way.*
- **US-009.** *As a security reviewer, I want every sales-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the customer master and sales-organization history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Customer master (US-001, US-002, US-003)

- **Given** a valid customer creation request under a tenant/company,
  **when** a sales admin submits it,
  **then** the customer is persisted with a stable identifier and its identifiers are unique within the company.
- **Given** a valid customer update that maintains referential integrity,
  **when** a sales admin submits it,
  **then** the update is persisted and audited.
- **Given** a customer with dependent commercial references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the customer lifecycle rules established here (dependent-reference semantics from later sprints do not weaken this rule).
- **Given** a valid customer contact or address (billing, shipping, other),
  **when** a sales admin submits it against an active customer,
  **then** the contact or address is persisted, uniquely identified within the customer, and audited.

### 5.2 Customer hierarchy and classification (US-002)

- **Given** a valid parent/child customer relationship within the same company,
  **when** a sales admin submits it,
  **then** the hierarchy is persisted deterministically without creating cycles.
- **Given** a valid customer group and customer category taxonomy,
  **when** a customer is classified against them,
  **then** the classification is persisted and consumable by downstream sprints.

### 5.3 Sales organization and territories (US-004)

- **Given** a valid sales branch, region, or territory definition under an active company,
  **when** a sales manager submits it,
  **then** the entity is persisted under the tenant/company hierarchy and is non-overlapping with existing sibling definitions in the sense established by the Platform baseline.
- **Given** an attempt to define a territory that violates tenancy or hierarchy invariants,
  **when** the request is submitted,
  **then** the request is rejected deterministically and no partial state is left behind.

### 5.4 Salespersons and sales teams (US-005)

- **Given** a valid salesperson or sales team definition,
  **when** a sales manager submits it,
  **then** the entity is persisted with a stable identifier and can be assigned to territories and customers.
- **Given** a customer without a salesperson assignment,
  **when** assignment is submitted,
  **then** the assignment is persisted deterministically and audited.

### 5.5 Sales configuration and numbering readiness (US-006, US-007)

- **Given** a company under an active tenant,
  **when** default sales settings, approval thresholds, return-window defaults, and credit-limit policy defaults are configured,
  **then** the values resolve deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a sales-document numbering series registered under a company,
  **when** it is queried by identifier,
  **then** it resolves deterministically via `ENG-017`. (Consumption by specific document types is delivered by downstream Sales sprints.)

### 5.6 Audit integration (US-009)

- **Given** any sales-foundation lifecycle transition (customer / contact / address / territory / salesperson / sales team / assignment / configuration create or update),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.7 Events (US-008)

- **Given** a sales-foundation lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used.

### 5.8 Isolation invariants (`ADR-011`)

- **Given** any sales-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.9 Ownership consumption invariants

- **Given** any downstream module (Purchase, Inventory, CRM, Projects, POS, Payroll) requiring customer data,
  **when** it reads or reacts to customer lifecycle,
  **then** it does so exclusively through Sales-owned events and read APIs. No downstream module creates an independent customer master.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-003` — Sales.
- **Module PRD:** [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Customer management, Sales organization, Territories), §3 (Sales Executive, Sales Manager, Order Desk), §5 (Customer, Sales Territory, Salesperson), §7 (Customer commercial invariants), §8 (Customer master consumption), §10 (Default price list, Approval thresholds, Numbering series, Return window, Credit-limit policy), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-003` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership conventions, ledger references consumed by later Sales sprints; not directly consumed at the Sales Foundation layer but declared as upstream to ensure ownership boundaries are respected.
  - Downstream Sales sprints and other modules SHOULD reference these baselines rather than individual upstream Sprint PRDs unless sprint-level traceability is specifically required.
- **Downstream sprints:** `SPR-MOD-003-002` (Quotations & Sales Orders), `SPR-MOD-003-003` (Delivery & Fulfillment), `SPR-MOD-003-004` (Sales Invoicing), `SPR-MOD-003-005` (Returns & Customer Adjustments), `SPR-MOD-003-006` (Sales Analytics & Controls) — per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Downstream module consumers of Customer master:** MOD-004 Purchase (where applicable), MOD-005 Inventory, MOD-CRM CRM, MOD-Projects, MOD-POS, MOD-Payroll — consuming exclusively via events and read APIs.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Sales Ownership Convention in §1.1). See each engine's specification for capability details.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the sales-administrator and sales-manager identity used for foundation lifecycle actions. |
| `ENG-002` Authorization | Enforces authorization on sales-foundation actions. |
| `ENG-003` Permission Management | Registers sales-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every sales-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves sales configuration (defaults, thresholds, return-window, credit-limit policy) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for sales master data where applicable. |
| `ENG-017` Numbering | Registers and resolves sales-document numbering series. Consumption by document types occurs in downstream sprints. |
| `ENG-024` Eventing | Publishes sales-foundation events with the contracts declared in §11. |

Sales business semantics (customer master, hierarchy, classification, sales-organization semantics, salesperson and territory assignment) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every sales-foundation read and write. |
| `ADR-012` Tenant Lifecycle | Consumed indirectly via `MOD001_PLATFORM_BASELINE_v1`; sales foundation lifecycle is scoped to `active` tenants. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to sales-foundation actions. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for sales-foundation events. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Customer | MOD-003 (this sprint) | Commercial party owned by Sales; carries commercial classification and lifecycle status. |
| Customer Group | MOD-003 (this sprint) | Classification grouping applied to customers. |
| Customer Category | MOD-003 (this sprint) | Taxonomy classifying customers for pricing/reporting downstream. |
| Customer Contact | MOD-003 (this sprint) | Named contact person on a customer. |
| Customer Address | MOD-003 (this sprint) | Billing, shipping, or other business address on a customer. |
| Sales Organization | MOD-003 (this sprint) | Commercial organization container under the tenant/company hierarchy. |
| Sales Branch | MOD-003 (this sprint) | Branch-level commercial container under a sales organization. |
| Sales Region | MOD-003 (this sprint) | Regional grouping of sales territories. |
| Sales Territory | MOD-003 (this sprint) | Territory used to assign customers and salespersons. |
| Salesperson | MOD-003 (this sprint) | Named seller associated with an identity. |
| Sales Team | MOD-003 (this sprint) | Group of salespersons owning a territory or customer set. |
| Sales Configuration | MOD-003 (this sprint, configuration-scoped) | Sales configuration namespace per company resolved via `ENG-005`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **customers**, **sales organizations**, and **sales territories**.
- A **customer** MAY have a parent customer within the same company (acyclic hierarchy) and belongs to zero or one **customer group** and zero or one **customer category**.
- A **customer** owns zero or more **customer contacts** and zero or more **customer addresses**.
- A **sales branch** belongs to exactly one **sales organization**; a **sales region** groups zero or more **sales territories**.
- A **customer** MAY be assigned to at most one **sales territory** and at most one **salesperson** or **sales team** per commercial context.
- A **sales configuration** belongs to exactly one company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-003` per the Sales Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Financial standing of a customer (receivables, credit exposure, dunning) is consumed from Accounting; it is not represented as a Sales-owned entity.
- Inventory item master, stock, and reservations are consumed from Inventory; they are not represented as Sales-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `customer.created` | MOD-003 | SPR-MOD-003-001 | MOD-003 (self), MOD-004 (Purchase where applicable), MOD-005 (Inventory), MOD-CRM, MOD-Projects, MOD-POS, MOD-017 (Analytics) | At-least-once, ordered per tenant (per `ADR-051`) |
| `customer.updated` | MOD-003 | SPR-MOD-003-001 | MOD-003 (self), MOD-004, MOD-005, MOD-CRM, MOD-Projects, MOD-POS, MOD-017 | At-least-once, ordered per tenant |
| `customer.activated` | MOD-003 | SPR-MOD-003-001 | MOD-003 (self), MOD-004, MOD-005, MOD-CRM, MOD-017 | At-least-once, ordered per tenant |
| `customer.deactivated` | MOD-003 | SPR-MOD-003-001 | MOD-003 (self), MOD-004, MOD-005, MOD-CRM, MOD-017 | At-least-once, ordered per tenant |
| `salesperson.created` | MOD-003 | SPR-MOD-003-001 | MOD-003 (self), MOD-017 | At-least-once, ordered per tenant |
| `salesterritory.updated` | MOD-003 | SPR-MOD-003-001 | MOD-003 (self), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Sales-foundation events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every sales-foundation read and write.
- [ ] Every sales-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Sales configuration namespace is initialized per company via `ENG-005` (defaults, thresholds, return-window, credit-limit policy).
- [ ] Sales-document numbering series are registered and resolvable via `ENG-017`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-003_SPRINT_PLAN.md` §2 (`SPR-MOD-003-001`):

- Customer, customer hierarchy, sales territory, and salesperson master data can be created, edited, and archived under a tenant/company.
- Sales organization and sales configuration resolve deterministically through `ENG-005`.
- Numbering series for sales documents are registered and resolve via `ENG-017`.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** MOD-003 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-003 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen so that Accounting ownership boundaries (vouchers, ledger, taxation, receivables) are stable and not redefined by Sales.
  - **Impact:** Any weakening of Accounting ownership boundaries would blur the Sales/Accounting split.
  - **Mitigation:** Rely on the frozen `MOD002_ACCOUNTING_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Quotations, orders, delivery, invoicing, returns, and analytics are deferred to `SPR-MOD-003-002` … `SPR-MOD-003-006`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and pollute the Foundation.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-012`, `ADR-014`, `ADR-032`, `ADR-051`) are Accepted at authoring time.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Sales-foundation events rely on `ENG-024` delivery guarantees stated in `ADR-051`.
  - **Impact:** Weakened delivery guarantees would break consumer contracts.
  - **Mitigation:** Consume `ENG-024` per `ADR-051` without redefining delivery semantics; escalate any weakening as an ADR / engine defect.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Any event name declared in §11 that is not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Map to an authoritative equivalent where one exists; otherwise register via the event catalog governance process before Sales Sprint 2 begins consuming those events.
  - **Status:** Deferred

- **Risk ID:** R-06
  - **Description:** Customer master ownership is exclusive to Sales; downstream modules MUST consume via events and read APIs.
  - **Impact:** Independent customer masters in downstream modules would fragment master data.
  - **Mitigation:** Enforce the Customer Master Authority convention (§1.1.1) at sprint gates for consuming modules.
  - **Status:** Accepted

- **Risk ID:** R-07
  - **Description:** Numbering series registration in scope here; consumption by document types is in scope of downstream Sales sprints.
  - **Impact:** Loose registration semantics would leak into downstream consumption.
  - **Mitigation:** Register series with deterministic identifiers via `ENG-017`; do not expose consumption paths in this sprint.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — customer, customer hierarchy, contact/address validation; territory and salesperson invariants; sales configuration resolution rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, numbering-series registration via `ENG-017`, event publication via `ENG-024`.
- **Contract** — sales-foundation event contracts against the event catalog.
- **End-to-end (smoke)** — customer creation, hierarchy assignment, territory/salesperson assignment, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture used to prove tenancy and ownership invariants across companies.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling customer lifecycle as a small state machine so audit emission (§5.6) and event publication (§5.7) are trivially satisfiable at every transition.
- Consider validating hierarchy-acyclicity and tenancy at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating sales configuration initialization with company activation events emitted by MOD-001 so the sales configuration namespace is ready before the first customer action.
- Consider registering all sales-document numbering series upfront in this sprint, even though only downstream sprints consume them, so numbering readiness is deterministic.
- Consider surfacing the Customer Master Authority convention as a hard boundary in downstream module gates.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-003-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Sales Foundation — customer master, hierarchy, sales organization, territories, salespersons, sales teams, sales configuration, numbering readiness, audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-003` MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Sales Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists quotations, orders, delivery, invoicing, returns, analytics, plus Accounting/Inventory/CRM-owned scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-003-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-003-002 Quotations & Sales Orders` is the immediate successor per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-003-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Precedent Sprint PRDs — [`../accounting/SPR-MOD-002-001-accounting-foundation.md`](../accounting/SPR-MOD-002-001-accounting-foundation.md), [`../accounting/SPR-MOD-002-002-voucher-framework.md`](../accounting/SPR-MOD-002-002-voucher-framework.md), [`../accounting/SPR-MOD-002-003-journal-ledger-posting.md`](../accounting/SPR-MOD-002-003-journal-ledger-posting.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

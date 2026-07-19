---
title: "API-003 — Sales API Solution Design Specification"
summary: "Phase 3 API Solution Design for MOD-003 Sales. Derived exclusively from MOD-003_MODULE_PUBLICATION with WEB-003 and MOB-003 referenced only to preserve cross-platform functional parity. Defines API design principles, resource model, functional operations, request/response models, authentication and authorization, validation, error semantics, integration touchpoints, event and synchronization model, versioning, idempotency and concurrency, cross-platform consistency including an API Capability Neutrality Clause, traceability, and design constraints. Introduces no new business requirements."
spec_id: "API-003_SOLUTION_DESIGN"
family: "API"
template: "API-003"
template_version: "v1.0"
governance_specification: "v1.0"
module: "MOD-003 Sales"
source_module: "MOD-003"
source_module_name: "Sales"
source_publication: "MOD-003_MODULE_PUBLICATION"
source_baseline: "MOD003_SALES_BASELINE_v1"
source_module_prd: "docs/20-module-prds/sales/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-003-001", "SPR-MOD-003-002", "SPR-MOD-003-003", "SPR-MOD-003-004", "SPR-MOD-003-005", "SPR-MOD-003-006"]
source_web_design: "WEB-003_SOLUTION_DESIGN"
source_mobile_design: "MOB-003_SOLUTION_DESIGN"
related_web_spec: "WEB-003"
related_mobile_spec: "MOB-003"
version: "1.0"
status: "Active"
lifecycle_state: "API003_SOLUTION_DESIGNED"
owner: "Sales"
layer: "delivery"
updated: "2026-07-19"
tags: ["solution-design", "api", "phase-3", "API-003", "MOD-003", "sales"]
document_type: "API Solution Design Specification"
frontmatter_standard: "GOVERNANCE_FRONTMATTER_STANDARD v1.0"
finding_severity_standard: "FINDING_SEVERITY_STANDARD v1.0"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-015", "ENG-017", "ENG-018", "ENG-019", "ENG-020", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# API-003 — Sales API Solution Design Specification

> **Reference derivation only.** API-003 is an API-surface projection of `MOD-003_MODULE_PUBLICATION`. It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. `WEB-003_SOLUTION_DESIGN` and `MOB-003_SOLUTION_DESIGN` are referenced only to preserve cross-platform terminology, workflow, and functional parity; they are not business sources. This specification is protocol-, transport-, endpoint-syntax-, database-, and infrastructure-agnostic. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and API-003 is corrected in the same change.

## 1. Identity & Traceability

- **Specification ID:** `API-003_SOLUTION_DESIGN`
- **Family:** API
- **Source Module:** MOD-003 Sales
- **Source Publication:** `MOD-003_MODULE_PUBLICATION`
- **Source Baseline:** `MOD003_SALES_BASELINE_v1`
- **Paired Web Design:** `WEB-003_SOLUTION_DESIGN` (parity reference only)
- **Paired Mobile Design:** `MOB-003_SOLUTION_DESIGN` (parity reference only)
- **Lifecycle State:** `API003_SOLUTION_DESIGNED`

Derivation chain:

```text
MOD003_SALES_BASELINE_v1
        ↓
Sales Sprint PRDs (SPR-MOD-003-001 … SPR-MOD-003-006)
        ↓
MOD-003_MODULE_PUBLICATION (GT-005)
        ↓
WEB-003 Solution Design ─┐
                         ├─→ Cross-platform functional parity
MOB-003 Solution Design ─┘
        ↓
API-003 Solution Design (this document)
```

Every operation and resource defined below MUST resolve to at least one authority in `MOD-003_MODULE_PUBLICATION` (§4, §7, §8, §9). Any operation lacking that anchor is a finding under §13.x — never a permitted addition.

## 2. API Design Principles

1. **Publication parity.** Every resource, operation, event, and validation traces to `MOD-003_MODULE_PUBLICATION`. No new authorities, master data, transactions, or events are introduced by this specification.
2. **Platform neutrality.** API-003 is a shared functional contract consumed by WEB-003, MOB-003, downstream Business OS modules, and approved external integrations. It contains no web-specific or mobile-specific capabilities. See §13.x.
3. **Stateless interaction.** Every request is self-describing. Caller identity, tenant scope, company scope, and permission scope resolve from credentials on every request (`ENG-001`, `ENG-002`, `ADR-032`). Long-running lifecycles (quotation approval, order amendment, delivery pick/pack, invoice approval, return validation) are represented as resource state — never transient session state.
4. **Backward-compatible evolution.** Changes are additive by default. Breaking changes require a new specification version and an explicit deprecation window (§11).
5. **Implementation independence.** API-003 defines *what* the API contract does in business terms. Transport, protocol, URI syntax, HTTP verb selection, wire encoding, database schema, and infrastructure remain out of scope (§15).
6. **Cross-platform equivalence.** Every functional capability required by WEB-003 or MOB-003 MUST be available on identical terms through API-003. Presentation adaptations remain in the client layer; business outcomes do not.
7. **Deterministic outcomes.** Given the same inputs, permissions, and system state, an operation MUST produce the same business outcome regardless of caller platform.
8. **Least-privilege authorization.** Every operation names its permission requirements; unauthorized outcomes never disclose protected content or existence.
9. **Audit completeness.** Every state-changing operation records audit context via `ENG-004`; audit collection is consumed, not redefined.
10. **Engine consumption.** Platform engines are consumed via their published capability interfaces (Publication §11). API-003 never redefines engine behavior.

## 3. Resource Model

Resources are inherited from `MOD-003_MODULE_PUBLICATION` §7 (Master Data) and §8 (Transactions). No new resources introduced. No wire schemas. Ownership and lifecycle only.

### 3.1 Master Data Resources

| Resource | Ownership | Lifecycle | Notes |
| --- | --- | --- | --- |
| **Customer** | MOD-003 (SPR-001) | Draft → Active → Inactive → Archived | Sales-owned master. Other modules reference by stable identifier only. |
| **Customer Hierarchy** | MOD-003 (SPR-001) | Draft → Active → Archived | Parent/child grouping over Customer. |
| **Sales Organization** | MOD-003 (SPR-001) | Draft → Active → Inactive → Archived | Organization scope for Sales operations. |
| **Sales Territory** | MOD-003 (SPR-001) | Draft → Active → Inactive → Archived | Territorial scope; ties to Salesperson. |
| **Salesperson** | MOD-003 (SPR-001) | Draft → Active → Inactive → Archived | Personnel binding for commercial ownership. |
| **Sales Configuration** | MOD-003 (SPR-001) | Consumed via `ENG-005` | Resolves through Platform configuration hierarchy. |
| **Numbering Series (Sales-owned)** | MOD-003 (SPR-001) | Draft → Active → Inactive → Archived | Consumed via `ENG-017`. |

### 3.2 Transaction Resources

| Resource | Ownership | Lifecycle | Notes |
| --- | --- | --- | --- |
| **Quotation** | MOD-003 (SPR-002) | Draft → Submitted → Approved → Issued → Won / Lost / Expired / Cancelled | Emits `QuotationIssued`. |
| **Sales Order** | MOD-003 (SPR-002) | Draft → Submitted → Approved → Confirmed → Fulfilled → Closed / Cancelled | Emits `SalesOrderConfirmed`. Credit-limit breach routes through `ENG-011`. |
| **Sales Order Amendment** | MOD-003 (SPR-002) | Draft → Submitted → Approved → Applied → Cancelled | Preserves original order lineage. |
| **Delivery Order** | MOD-003 (SPR-003) | Draft → Ready → In-Pick → Packed → Shipped → Completed / Cancelled | Consumes reservation contract owned by MOD-005. |
| **Pick / Pack** | MOD-003 (SPR-003) | Assigned → In-Progress → Complete → Cancelled | Sub-workflow of Delivery Order. |
| **Delivery Completion** | MOD-003 (SPR-003) | Immutable on completion | Commercial event; MUST NOT create accounting vouchers. Emits `DeliveryCompleted`. |
| **Sales Invoice** | MOD-003 (SPR-004) | Draft → Submitted → Approved → Issued → Cancelled / Amended | Emits `SalesInvoiceIssued`. Consumes voucher, tax, receivable contracts owned by MOD-002. |
| **Credit Note** | MOD-003 (SPR-004) | Draft → Submitted → Approved → Issued → Cancelled | Emits `CreditNoteIssued`. |
| **Debit Note** | MOD-003 (SPR-004) | Draft → Submitted → Approved → Issued → Cancelled | Consumes accounting voucher contract. |
| **Return Request** | MOD-003 (SPR-005) | Draft → Submitted → Approved → Validated → Received → Adjusted / Cancelled | Validates against original invoice lines. |
| **Return Receipt** | MOD-003 (SPR-005) | Draft → Confirmed → Adjusted | Precondition for customer adjustment. Emits `SalesReturnConfirmed`. |
| **Customer Adjustment** | MOD-003 (SPR-005) | Draft → Submitted → Approved → Applied → Cancelled | Prepares downstream MOD-002 and MOD-005 state; never mutates their ownership. |

### 3.3 Cross-Cutting Resources (Consumed, Not Owned)

| Resource | Owner | Consumed By |
| --- | --- | --- |
| **Attachment** | `ENG-008` | Quotation, Sales Order, Delivery, Invoice, Return |
| **Approval Instance** | `ENG-011` | Order credit-limit breach; Invoice / Credit Note / Return approval |
| **Audit Event** | `ENG-004` | Every state-changing operation |
| **Document Artifact** | `ENG-007` | Quotation PDF, Order confirmation, Delivery note, Invoice, Credit Note |
| **Notification** | `ENG-025` | Lifecycle notifications for all transactions |

### 3.4 Analytics Read Models (SPR-006)

Read-only projections consumed via `ENG-020`, `ENG-021`, `ENG-022`, `ENG-027`. Include: Sales Dashboard KPIs, Pipeline Report, Territory Performance, Salesperson Performance, Customer Sales Analytics, Margin Analytics, Approval Analytics. Analytics resources MUST NOT expose write operations under any circumstance. Portfolio KPIs remain owned by MOD-017; predictive analytics remain owned by MOD-018 (Publication §13).

## 4. Functional Operations

Business-level operations only. No URIs, HTTP methods, wire encodings, or status codes. Every operation MUST resolve to at least one authority in Publication §4. Operations are grouped by resource; each operation specifies purpose, preconditions, postconditions, permission requirements, and lifecycle transition where applicable.

### 4.1 Customer Master (SPR-001)

- **List Customers** — list customers within authorized scope. Purpose: master data discovery. Preconditions: authenticated principal with Customer read permission. Postconditions: no state change. Permission: `sales.customer.read`.
- **Retrieve Customer** — retrieve a customer by stable identifier. Preconditions: read permission on customer scope. Postconditions: none.
- **Create Customer** — create a customer in Draft. Preconditions: `sales.customer.create`; unique identifier by tenant + code. Postconditions: state Draft; audit written; numbering via `ENG-017`.
- **Update Customer** — modify a Draft or Active customer. Preconditions: `sales.customer.update`; not Archived. Postconditions: state preserved; audit written.
- **Transition Customer Lifecycle** — Draft → Active → Inactive → Archived. Preconditions: caller holds transition-specific permission; no open commercial documents when Archiving. Postconditions: lifecycle advanced; audit written; notifications via `ENG-025`.

### 4.2 Customer Hierarchy, Sales Organization, Sales Territory, Salesperson (SPR-001)

Each supports **List / Retrieve / Create / Update / Transition Lifecycle** operations mirroring §4.1 semantics. Preconditions and postconditions are inherited from Publication §4.1 authorities; no new business behavior introduced.

### 4.3 Sales Configuration & Numbering (SPR-001)

- **Retrieve Sales Configuration** — resolve effective configuration for a scope via `ENG-005`.
- **Update Sales Configuration** — write configuration at authorized scope. Permission: `sales.configuration.update`. Postconditions: `ENG-005` records versioned change; audit written.
- **List / Author Sales Numbering Series** — expose Sales-owned numbering; consumed via `ENG-017`. Sales never redefines numbering behavior.

### 4.4 Quotation (SPR-002)

- **List Quotations** — filter by customer, salesperson, status, period, territory. Permission: `sales.quotation.read`.
- **Retrieve Quotation** — including line items, pricing evaluation trace, approval history, lifecycle history.
- **Create Quotation Draft** — Preconditions: `sales.quotation.create`; customer exists and Active. Postconditions: state Draft; pricing evaluated via `ENG-005` and `ENG-012`; numbering allocated via `ENG-017`.
- **Update Quotation Draft** — permitted only in Draft. Re-evaluates pricing on relevant field changes.
- **Submit Quotation for Approval** — transitions Draft → Submitted. Routes via `ENG-011` when approval required by policy.
- **Approve / Reject Quotation** — transitions Submitted → Approved or back to Draft with rejection reason.
- **Issue Quotation** — transitions Approved → Issued. Emits `QuotationIssued` via `ENG-024`. Document artifact rendered via `ENG-007`.
- **Cancel Quotation** — permitted from Draft / Submitted / Approved / Issued (subject to policy). Records reason.
- **Mark Quotation Won / Lost / Expired** — terminal outcomes on Issued quotations.
- **Attach / List / Retrieve Attachments** — via `ENG-008`.

### 4.5 Sales Order & Order Amendment (SPR-002)

- **List Sales Orders / Retrieve Sales Order** — standard reads with authorization scope.
- **Create Sales Order Draft** — from scratch or by conversion from an Issued Quotation. Preconditions: `sales.order.create`; customer Active; every line item valid. Postconditions: state Draft; pricing evaluated (`ENG-005`, `ENG-012`).
- **Update Sales Order Draft** — permitted only in Draft.
- **Submit Sales Order** — transitions Draft → Submitted. If credit-limit breach detected, routes through `ENG-011` approval before Approved.
- **Approve / Reject Sales Order** — transitions Submitted → Approved. Approval instance owned by `ENG-011`.
- **Confirm Sales Order** — transitions Approved → Confirmed. Emits `SalesOrderConfirmed`. Reserves inventory through the MOD-005 reservation contract (consumed, not redefined).
- **Amend Sales Order** — create Sales Order Amendment against a Confirmed order. Lifecycle: Draft → Submitted → Approved → Applied. On Applied, order revision incremented; downstream deliveries reconciled.
- **Cancel Sales Order** — permitted subject to fulfillment state; releases outstanding reservations.
- **Close Sales Order** — transitions Fulfilled → Closed after full delivery and invoicing.
- **Attach / List / Retrieve Attachments** — via `ENG-008`.

### 4.6 Delivery, Pick/Pack, Completion (SPR-003)

- **List / Retrieve Delivery Order** — scoped by warehouse, salesperson, status, period.
- **Create Delivery Order** — from a Confirmed Sales Order. Preconditions: `sales.delivery.create`; reservation exists via MOD-005 contract. Postconditions: state Draft.
- **Assign Pick / Pack Task** — Draft → Ready; assigns to workforce role. Uses `ENG-010` workflow.
- **Record Pick / Pack Progress** — updates Pick / Pack sub-lifecycle. Field-executable on mobile.
- **Mark Packed** — Ready / In-Pick → Packed.
- **Mark Shipped** — Packed → Shipped.
- **Complete Delivery** — Shipped → Completed. Emits `DeliveryCompleted`. **MUST NOT** create accounting vouchers, journals, or ledger movements (Publication §4.3 Commercial Fulfillment Boundary).
- **Cancel Delivery** — permitted before Completed; releases reservation.
- **Attach Proof of Delivery** — via `ENG-008`; recorded on Completion.

### 4.7 Sales Invoice, Credit Note, Debit Note (SPR-004)

- **List / Retrieve Invoice / Credit Note / Debit Note** — with authorization scope.
- **Create Sales Invoice Draft** — from a Delivered or Confirmed Sales Order per configuration. Preconditions: `sales.invoice.create`; tax determination via MOD-002; period open per MOD-002 Period Authority. Postconditions: state Draft; numbering via `ENG-017`; tax lines materialized via `ENG-019`.
- **Update Invoice Draft** — permitted only in Draft.
- **Submit Invoice** — Draft → Submitted; routes via `ENG-011` when policy requires.
- **Approve / Reject Invoice** — Submitted → Approved.
- **Issue Invoice** — Approved → Issued. Emits `SalesInvoiceIssued`. Posts accounting voucher through the MOD-002 voucher contract (consumed, not redefined). Materializes receivable through the MOD-002 receivable contract.
- **Amend Invoice** — creates a Credit Note or Debit Note against the original; never mutates the original Issued invoice.
- **Cancel Invoice** — permitted only when accounting posting rules allow; consumes MOD-002 reversal contract.
- **Create Credit Note** — Draft → Submitted → Approved → Issued. Emits `CreditNoteIssued`. Consumes MOD-002 voucher and receivable-adjustment contracts.
- **Create Debit Note** — same lifecycle as Credit Note; opposite accounting direction via MOD-002 contract.
- **Attach Supporting Documents** — via `ENG-008`.

### 4.8 Return Request, Return Receipt, Customer Adjustment (SPR-005)

- **List / Retrieve Return Request** — scoped by customer, original invoice, status.
- **Create Return Request** — from an Issued Sales Invoice line reference. Preconditions: `sales.return.create`; original invoice line eligible; not previously fully returned.
- **Update Return Request Draft** — permitted only in Draft.
- **Submit / Approve / Reject Return Request** — standard approval semantics via `ENG-011`.
- **Validate Return Against Invoice Line** — hard precondition before Return Receipt; enforces line quantity, unit, and eligibility.
- **Confirm Return Receipt** — records physical receipt; Return Request → Received; Return Receipt state Confirmed. Emits `SalesReturnConfirmed`. Consumes MOD-005 inventory-receipt contract.
- **Create Customer Adjustment** — precondition: Return Receipt Confirmed. Draft → Submitted → Approved → Applied. On Applied, prepares MOD-002 Credit Note issuance (via §4.7) and never mutates MOD-002 or MOD-005 state directly.
- **Cancel Return / Cancel Adjustment** — permitted per state policy.

### 4.9 Sales Analytics & Dashboards (SPR-006)

- **List Available Dashboards / Reports** — via `ENG-022`.
- **Run Sales KPI Report** — parameters: scope, period, territory, salesperson, customer segment. Read-only. No side effects.
- **Run Pipeline / Territory / Salesperson / Customer / Margin / Approval Report** — read-only projections.
- **Retrieve Dashboard Read Model** — deterministic projection over authoritative Sales state (Publication §4.6 Analytics Read Model Convention).
- **Request Export** — via `ENG-027`. Export is deterministic and side-effect-free with respect to transactional state; only export-request state is created.

Analytics operations MUST NOT expose write, mutate, or lifecycle-transition operations over Sales master or transaction data. Any attempt to author such an operation is a finding under §13.x.

## 5. Request & Response Models

Functional shape only. No wire encoding, JSON schema, or protocol-level field definitions.

### 5.1 Request Semantics

Every request carries: authenticated caller identity (§6), tenant and company scope, resource identifiers or filter parameters, and — for state-changing operations — an idempotency key.

**Required data (per operation category):**

- **Create** operations require the minimum authoritative business fields declared by the Sprint PRDs (e.g., Customer creation requires legal name and primary tax identifier where jurisdictionally required).
- **Update** operations require the resource identifier plus the fields being changed. Fields not supplied are unchanged.
- **Transition** operations require the resource identifier and the target lifecycle state or transition intent.
- **Read** operations require the resource identifier (retrieve) or a filter definition (list). Filter fields are limited to authorized attributes.

**Optional data:** attachments, notes, tags, external references, notification preferences. Optional data MUST NOT alter business outcomes beyond metadata.

### 5.2 Response Semantics

Successful state-changing responses return: the resource identifier, current lifecycle state, revision indicator, and any authoritative derived fields (e.g., allocated number from `ENG-017`, computed price, computed tax lines). Successful read responses return the requested resource or filtered collection.

Business-error responses convey: the offending resource (when applicable), the business-rule identifier or authority reference, and a human-facing message suitable for surface by WEB-003 and MOB-003.

### 5.3 Validation Expectations

Every request is validated at three layers: (a) structural validity of input, (b) permission scope (§6), (c) business rules (§7). Failures at any layer are reported through §8 Error Semantics. Validation MUST NOT mutate state.

### 5.4 Success / Business-Error Outcomes

Outcomes are enumerated per operation in Publication §4/§6/§7 by inheritance. Illustrative categories:

- **Success — resource created / updated / transitioned.**
- **Success — read returned.**
- **Business error — precondition unmet** (e.g., quotation not yet Approved, delivery not fully picked).
- **Business error — permission denied** (per §6).
- **Business error — validation failed** (§7).
- **Business error — concurrency conflict** (§12).
- **Business error — cross-module contract unavailable** (§9).

## 6. Authentication & Authorization

- **Authenticated access only.** Every operation requires an authenticated principal established via `ENG-001` (Identity Engine). Authentication mechanics — SSO, MFA, identity federation — remain platform concerns and are not defined here.
- **Permission evaluation.** Every operation is authorized by `ENG-002` (Authorization Engine) under `ADR-032` (RBAC + ABAC). Evaluation considers role, tenant scope, company scope, sales organization, sales territory, customer scope, and attribute-based context.
- **Role mapping.** Named Sales roles include Salesperson, Sales Manager, Credit Controller, Delivery Coordinator, Warehouse Picker/Packer, Invoicing Clerk, Returns Officer, Sales Analyst, Sales Administrator. Concrete permission-to-role bindings are managed by MOD-001 grants and are not authored here.
- **Session / token expectations.** The API surface treats every request as stateless (§2.3). Long-lived caller identity is neither cached nor mutated by API-003.
- **Audit expectations.** Every state-changing operation writes to `ENG-004` including caller, tenant, resource, transition, and timestamp. Read operations write audit entries per the audit-collection policy owned by `ENG-004`; API-003 consumes that policy and never redefines it.
- **Unauthorized outcomes.** Unauthorized outcomes MUST NOT disclose the existence, content, or structure of protected resources beyond the caller's permitted view.

## 7. Validation Rules

- **Required-field validation.** Enforced at the request boundary against the operation's authoritative business fields.
- **Business validation.** Enforced against Publication §6 business-rule invariants — including customer-master ownership, pricing/discount evaluation authority, credit-limit approval routing, delivery-completion non-accounting invariant, invoice posting via MOD-002 contract, tax determination via MOD-002, return-receipt precondition, analytics read-only invariant.
- **Workflow validation.** Enforced against §3 lifecycle transitions. Transitions from an invalid source state are rejected.
- **Duplicate prevention.** Enforced via `ENG-017` numbering and via idempotency keys (§12). Duplicate customers by tenant + code, duplicate returns against the same invoice line beyond eligible quantity, and duplicate submissions of the same idempotency key are rejected.
- **Cross-resource validation.** Enforced across contract boundaries — e.g., a Sales Invoice referencing a nonexistent Sales Order, a Return Request referencing a nonexistent Sales Invoice line, an Order referencing an Inactive Customer.
- **Permission validation.** Enforced per §6.
- **Delegated validation.** Tax determination and pricing engine outcomes are delegated to the owning engines / modules (`ENG-005`, `ENG-012`, `ENG-019`, MOD-002 Tax Authority). API-003 consumes the result and never redefines the rule.

## 8. Error Semantics

Functional-outcome model only. No transport status codes, no wire error envelopes.

| Outcome Category | Cause | Handling |
| --- | --- | --- |
| **Validation failure** | Required data missing, malformed, or violates authoritative business fields | Caller-facing rejection carrying the offending field(s) and rule identifier. No state change. |
| **Authorization failure** | Caller lacks required permission for operation and scope | Non-disclosing rejection. No state change. Audit-logged as denied. |
| **Business-rule failure** | Publication §6 invariant violated | Rejection referencing the authority. No state change. |
| **Precondition failure** | Lifecycle source state, contract precondition, or configuration precondition unmet | Rejection referencing the precondition. No state change. |
| **Concurrency conflict** | Two callers attempted mutually exclusive transitions | Rejection with current revision indicator (§12). No state change. |
| **Contract unavailability** | Upstream engine or module contract unreachable (e.g., MOD-002 voucher contract, MOD-005 reservation contract, `ENG-011` approval) | Rejection with retry guidance. No state change. |
| **Duplicate submission** | Idempotency key replay of already-completed operation | Prior successful outcome is returned; no new state change. |
| **Unexpected failure** | Systemic or infrastructure error not attributable to any category above | Generic non-disclosing rejection; observability surfaces via `ENG-004` and platform telemetry. |

Client platforms (WEB-003, MOB-003) MUST render outcomes consistently: business-error messaging is the same regardless of surface (§13). Presentation styling may differ; the business meaning MUST NOT.

## 9. Integration Touchpoints

Integration surface is inherited from Publication §10 and §12. API-003 exposes only what Sales owns; it consumes contracts from other modules and never redefines them.

### 9.1 Consumed Contracts

- **MOD-001 Platform** — identity, authorization, permissions, configuration hierarchy, localization, audit collection.
- **MOD-002 Accounting** — voucher creation contract, tax determination contract, receivable creation contract, period authority for posting windows, financial reporting summaries. Consumed by §4.7 Invoicing operations.
- **MOD-005 Inventory** — inventory reservation contract and inventory receipt contract. Consumed by §4.6 Delivery operations and §4.8 Returns operations.
- **MOD-006 CRM** — qualified customer / opportunity handoff. Consumed by §4.1 Customer master and §4.4 Quotation operations.

### 9.2 Provided Contracts

- **Customer master reference** — stable identifier consumed by MOD-011 AMC, MOD-015 POS, MOD-017 Analytics, MOD-018 AI Workspace.
- **Commercial document reference** — Quotation, Sales Order, Delivery, Invoice, Credit Note, Debit Note, Return references consumed by MOD-011 AMC, MOD-015 POS.
- **Sales operational read model** — consumed by MOD-017 Analytics (portfolio KPIs) and MOD-018 AI Workspace (predictive analytics). Read-only. Ownership of downstream KPIs remains with MOD-017 / MOD-018.

Ownership boundaries listed in Publication §13 are preserved verbatim. API-003 exposes no operation that could redefine, override, or bypass any owning module's authority.

## 10. Event & Synchronization Model

Business-level only. Delivery infrastructure remains owned by `ENG-024`.

### 10.1 Emitted Business Events

Inherited verbatim from Publication §9:

- `QuotationIssued` — on Quotation transition to Issued.
- `SalesOrderConfirmed` — on Sales Order transition to Confirmed.
- `DeliveryCompleted` — on Delivery transition to Completed.
- `SalesInvoiceIssued` — on Sales Invoice transition to Issued.
- `CreditNoteIssued` — on Credit Note transition to Issued.
- `SalesReturnConfirmed` — on Return Receipt transition to Confirmed.

### 10.2 Consumed Business Events

Inherited verbatim from Publication §10:

- `CustomerQualified` (MOD-006) — enables customer master promotion.
- `InventoryReserved` / `InventoryReleased` (MOD-005) — reconciles Delivery reservation state.
- `VoucherPosted` / `ReceiptRecorded` (MOD-002) — reconciles Invoice posting confirmation.
- `PeriodClosed` (MOD-002) — locks invoice creation windows.

### 10.3 Notifications

Delivered via `ENG-025` under Sales business semantics: quotation issued, order confirmed, order awaiting approval, delivery scheduled, delivery completed, invoice issued, invoice awaiting approval, return submitted, return approved, adjustment applied.

### 10.4 Sync Triggers & Eventual Consistency

Downstream consumers reconcile from emitted events on an eventually-consistent basis. API-003 MUST NOT expose synchronous cross-module writes that bypass Publication §10 / §12 contracts. Read-your-own-writes semantics are guaranteed within a single Sales resource; cross-module consistency is eventual and governed by upstream engine behavior.

## 11. Versioning & Compatibility

- **Backward compatibility.** Additive changes — new resources, operations, optional fields, new event payload attributes — are permitted within the same specification version.
- **Additive evolution.** Deprecated fields or operations remain functional until an announced deprecation window elapses.
- **Deprecation policy.** Deprecations are announced in-spec (frontmatter and dedicated section) with an effective date. Client platforms (WEB-003, MOB-003) receive parallel deprecation notice.
- **Breaking-change policy.** Any breaking change requires a new specification version, a new lifecycle state, and an approved governance-evolution pass. Breaking changes MUST NOT be introduced by implementation.
- **Client compatibility.** WEB-003 and MOB-003 MUST target the same API-003 specification version at any given release. Cross-platform version skew is not permitted (§13).

## 12. Idempotency & Concurrency

- **Idempotency keys.** Every state-changing operation accepts a caller-supplied idempotency key. Replays of a completed operation with the same key return the original outcome and produce no new state change.
- **Duplicate submission handling.** Duplicate keys within a defined retention window are recognized as idempotent replays. Duplicate submissions without keys are still guarded by uniqueness constraints (numbering series, natural keys where declared).
- **Optimistic concurrency.** Every mutable resource exposes a revision indicator. Updates and lifecycle transitions require the caller to submit the last-known revision; mismatches produce a concurrency-conflict outcome (§8).
- **Replay protection.** Emitted events carry stable identifiers; downstream consumers deduplicate via `ENG-024`. API-003 does not redefine event delivery semantics.
- **Safe retry.** Read operations are inherently safe to retry. State-changing operations are safe to retry only when accompanied by an idempotency key.

## 13. Cross-Platform Consistency

`MOD-003_MODULE_PUBLICATION` is the sole functional authority. `WEB-003_SOLUTION_DESIGN` and `MOB-003_SOLUTION_DESIGN` are canonical interaction models; both MUST realize equivalent functional capabilities through API-003.

### 13.1 Terminology Parity

Resource names, lifecycle states, event names, and business-error identifiers are identical across API-003, WEB-003, and MOB-003.

### 13.2 Workflow Parity

Every workflow specified in WEB-003 §6 and MOB-003 §6 is realized end-to-end through operations defined in §4 above. No web-only or mobile-only workflow is permitted.

### 13.3 Authorization Parity

Permission checks are identical across platforms; role-scoped visibility is enforced server-side (§6) and never reintroduced client-side as a business gate.

### 13.4 Presentation Independence

WEB-003 and MOB-003 may adapt presentation (list vs. card, dialog vs. bottom sheet, FAB placement, offline queuing) without affecting API-003 semantics. Business outcomes and state transitions remain identical (MOB-003 §6.9).

### 13.x API Capability Neutrality Clause (Auditable Parity)

- **13.x.1 GT-005 Traceability Mandate.** Every API capability defined in API-003 — every resource in §3, every operation in §4, every event in §10, every validation rule in §7 — MUST be traceable to at least one requirement, authority, master data entity, transaction, or event declared in `MOD-003_MODULE_PUBLICATION`. Traceability is demonstrated by a non-empty GT-005 anchor in the §14 Traceability Matrix.
- **13.x.2 Shared Contract Invariant.** API-003 is a shared functional contract, not a web-centric or mobile-centric surface. It MUST NOT contain any capability that exists solely to satisfy WEB-003 or MOB-003 presentation needs. Presentation-only capabilities are prohibited.
- **13.x.3 Platform-Only Capabilities Prohibited.** Web-only capabilities and mobile-only capabilities are prohibited at the API surface. If a client platform requires a behavior that has no GT-005 anchor, the correct remediation is either (a) accept that the behavior is presentation-only and realize it within the client, or (b) raise a governance-evolution proposal against the Module Baseline. It is never (c) add the behavior to API-003.
- **13.x.4 Missing Anchor Is a Finding.** During §14 traceability verification, any operation row lacking a non-empty GT-005 anchor is recorded as a finding under `FINDING_SEVERITY_STANDARD v1.0`. Such findings MUST NOT be resolved by inventing anchors. They are resolved either by removing the offending operation or by governance-approved evolution of the source authority.
- **13.x.5 Audit Enforcement.** The §14 Traceability Matrix serves as the enforcement mechanism for this clause. Verification of API-003 (and any subsequent revision) MUST inspect every row of §14 for a non-empty GT-005 anchor before certifying PASS.

## 14. Traceability Matrix

Every row anchors an API-003 operation to a GT-005 requirement, a WEB-003 workflow reference, a MOB-003 journey reference, an API resource, and an operation identifier. Rows without a non-empty GT-005 anchor are prohibited (§13.x).

Legend: GT-005 § references target `MOD-003_MODULE_PUBLICATION`. WEB / MOB references target `WEB-003_SOLUTION_DESIGN` and `MOB-003_SOLUTION_DESIGN` §6 journey anchors.

| # | GT-005 Anchor | WEB-003 Workflow | MOB-003 Journey | API Resource (§3) | Operation (§4) |
| --- | --- | --- | --- | --- | --- |
| 1 | §4.1 Sales Ownership; §7 Customer Master | Customer master pages | Customer journeys | Customer | List / Retrieve / Create / Update / Transition Lifecycle (§4.1) |
| 2 | §4.1 Customer Hierarchy | Hierarchy screens | Hierarchy screens | Customer Hierarchy | List / Retrieve / Create / Update / Transition (§4.2) |
| 3 | §4.1 Sales Organization | Sales Org pages | Sales Org screens | Sales Organization | List / Retrieve / Create / Update / Transition (§4.2) |
| 4 | §4.1 Sales Territory | Territory pages | Territory screens | Sales Territory | List / Retrieve / Create / Update / Transition (§4.2) |
| 5 | §4.1 Salesperson | Salesperson pages | Salesperson screens | Salesperson | List / Retrieve / Create / Update / Transition (§4.2) |
| 6 | §4.1 Sales Configuration | Configuration pages | Settings screens | Sales Configuration | Retrieve / Update (§4.3) |
| 7 | §7 Numbering Series (Sales-owned) | Numbering configuration | Numbering configuration | Numbering Series | List / Author (§4.3) |
| 8 | §4.2 Quotation Ownership; §8 Quotation | Quotation workflows | Quotation journeys | Quotation | Full lifecycle operations (§4.4) |
| 9 | §4.2 Sales Order Ownership; §8 Sales Order | Sales Order workflows | Sales Order journeys | Sales Order | Full lifecycle operations (§4.5) |
| 10 | §4.2 Sales Order; §8 Sales Order Amendment | Amendment workflow | Amendment journey | Sales Order Amendment | Draft / Submit / Approve / Apply / Cancel (§4.5) |
| 11 | §4.2 Approval Boundary; §11 ENG-011 | Approval workflow | Approval journey | Approval Instance | Consumed via `ENG-011` (§4.5) |
| 12 | §4.2 Pricing Boundary; §11 ENG-005/ENG-012 | Pricing evaluation | Pricing evaluation | Quotation / Sales Order | Draft / Update (§4.4, §4.5) |
| 13 | §4.3 Delivery Ownership; §8 Delivery Order | Delivery workflow | Delivery journeys | Delivery Order | Full lifecycle operations (§4.6) |
| 14 | §4.3 Delivery; §8 Pick/Pack | Pick/Pack workflow | Pick/Pack journey (offline-capable) | Pick / Pack | Assign / Progress / Complete (§4.6) |
| 15 | §4.3 Commercial Fulfillment Boundary; §8 Delivery Completion | Completion workflow | Completion journey (offline-capable) | Delivery Completion | Complete Delivery (§4.6) |
| 16 | §4.3 Inventory Consumption Boundary; §12 MOD-005 | Reservation consumption | Reservation consumption | Delivery Order | Consumes MOD-005 reservation contract (§4.6) |
| 17 | §4.4 Commercial Invoice Ownership; §8 Sales Invoice | Invoice workflow | Invoice journey | Sales Invoice | Full lifecycle operations (§4.7) |
| 18 | §4.4 Accounting Consumption Boundary; §12 MOD-002 | Posting flow | Posting flow | Sales Invoice | Consumes MOD-002 voucher contract (§4.7) |
| 19 | §4.4 Tax Consumption Boundary; §11 ENG-019 | Tax evaluation | Tax evaluation | Sales Invoice | Consumes MOD-002 tax determination (§4.7) |
| 20 | §4.4 Receivable Boundary; §12 MOD-002 | Receivable creation | Receivable creation | Sales Invoice | Consumes MOD-002 receivable contract (§4.7) |
| 21 | §4.4 Credit Note; §8 Credit Note | Credit Note workflow | Credit Note journey | Credit Note | Full lifecycle operations (§4.7) |
| 22 | §4.4 Debit Note; §8 Debit Note | Debit Note workflow | Debit Note journey | Debit Note | Full lifecycle operations (§4.7) |
| 23 | §4.5 Return Ownership; §8 Return Request | Return workflow | Return journey | Return Request | Full lifecycle operations (§4.8) |
| 24 | §4.5 Return Ownership; §8 Return Receipt | Return receipt workflow | Return receipt journey | Return Receipt | Confirm Receipt (§4.8) |
| 25 | §4.5 Customer Adjustment Boundary; §8 Customer Adjustment | Adjustment workflow | Adjustment journey | Customer Adjustment | Full lifecycle operations (§4.8) |
| 26 | §4.6 Analytics Ownership; Analytics Read Model | Dashboards / Reports | Dashboards / Reports | Analytics Read Model | Read-only projections (§4.9) |
| 27 | §4.6 Dashboard Read Model | Dashboard filtering / drill-down / export | Dashboard filtering / drill-down / export | Analytics Read Model | Run / Retrieve / Export (§4.9) |
| 28 | §9 QuotationIssued; §11 ENG-024 | Event listeners | Event listeners | Quotation | Issue Quotation (§4.4) |
| 29 | §9 SalesOrderConfirmed; §11 ENG-024 | Event listeners | Event listeners | Sales Order | Confirm Sales Order (§4.5) |
| 30 | §9 DeliveryCompleted; §11 ENG-024 | Event listeners | Event listeners | Delivery Completion | Complete Delivery (§4.6) |
| 31 | §9 SalesInvoiceIssued; §11 ENG-024 | Event listeners | Event listeners | Sales Invoice | Issue Invoice (§4.7) |
| 32 | §9 CreditNoteIssued; §11 ENG-024 | Event listeners | Event listeners | Credit Note | Issue Credit Note (§4.7) |
| 33 | §9 SalesReturnConfirmed; §11 ENG-024 | Event listeners | Event listeners | Return Receipt | Confirm Return Receipt (§4.8) |
| 34 | §11 ENG-008 Attachment Engine | Attachments panel | Attachments sheet | Attachment | Attach / List / Retrieve (§4.4–§4.8) |
| 35 | §11 ENG-007 Document Engine | Rendered documents | Rendered documents | Document Artifact | Render (§4.4, §4.5, §4.6, §4.7) |
| 36 | §11 ENG-025 Notification Engine | Notification center | Push notifications | Notification | Delivered per §10.3 |
| 37 | §11 ENG-004 Audit Engine | Audit trail views | Audit trail views | Audit Event | Written per §6 |
| 38 | §11 ENG-002 / ADR-032; §13 Ownership | All authorized surfaces | All authorized surfaces | (All resources) | Permission evaluation per §6 |
| 39 | §11 ENG-011 Approval Engine | Approvals inbox | Approvals inbox | Approval Instance | Consumed (§4.5, §4.7, §4.8) |
| 40 | §11 ENG-017 Numbering Engine | Numbering allocation | Numbering allocation | Numbering Series | Consumed by §4.4–§4.8 |

Every row above carries a non-empty GT-005 anchor, satisfying §13.x.1 and §13.x.5.

## 15. Design Constraints

API-003 excludes the following (any inclusion is a finding, not an addition):

- Concrete transport protocol selection (REST, GraphQL, gRPC, etc.), endpoint URI syntax, HTTP verbs, path templates, path parameters, query-parameter syntax, and wire encoding.
- HTTP status codes, error response envelopes, response headers, pagination cursors, filter DSL, or sort DSL.
- JSON / Protobuf / XML schemas or field-level wire specifications.
- Database schemas, indexes, migration scripts, table names, or storage-tier decisions.
- Infrastructure decisions — hosting, edge caching, CDN, message-broker choice, queue configuration, scaling policy, deployment topology.
- Authentication mechanics — SSO configuration, MFA policy, identity-federation configuration, token issuance, session cookie behavior. Only authorization semantics are in scope (§6).
- Source code, service implementations, framework selection, ORM configuration, and package structure.
- Governance evolution — new authorities, new ownership boundaries, new engines, new ADRs, or amendments to existing Publication content.
- Cross-module ownership changes (e.g., moving voucher creation, tax determination, or inventory reservation ownership onto Sales).
- Web-only or mobile-only capabilities (per §13.x.3).

## 16. References

- [`docs/45-module-publications/sales/MOD-003_MODULE_PUBLICATION.md`](../../../45-module-publications/sales/MOD-003_MODULE_PUBLICATION.md) — sole functional authority.
- [`docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) — parent Module Baseline.
- [`docs/46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN.md`](../../web/sales/WEB-003_SOLUTION_DESIGN.md) — parity reference.
- [`docs/46-solution-design/mobile/sales/MOB-003_SOLUTION_DESIGN.md`](../../mobile/sales/MOB-003_SOLUTION_DESIGN.md) — parity reference.
- [`docs/60-solution-design/api/API-002_ACCOUNTING.md`](../../../60-solution-design/api/API-002_ACCOUNTING.md) — precedent pattern.
- [`docs/15-governance/FINDING_SEVERITY_STANDARD.md`](../../../15-governance/FINDING_SEVERITY_STANDARD.md).
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md).

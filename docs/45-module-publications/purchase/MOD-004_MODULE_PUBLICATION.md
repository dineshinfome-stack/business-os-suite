---
title: "MOD-004 Module Publication — Purchase"
summary: "GT-005 Module Publication for MOD-004 Purchase. Terminal governance artifact derived exclusively from MOD004_PURCHASE_BASELINE_v1 and MOD-004 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-004_MODULE_PUBLICATION"
publication_id: "MOD-004_MODULE_PUBLICATION"
module_id: "MOD-004"
module_name: "Purchase"
version: "1.0"
status: "Published"
owner: "Procurement"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/purchase/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md"
source_module: "MOD-004"
source_sprints: ["SPR-MOD-004-001", "SPR-MOD-004-002", "SPR-MOD-004-003", "SPR-MOD-004-004", "SPR-MOD-004-005", "SPR-MOD-004-006"]
layer: "delivery"
updated: "2026-07-21"
tags: ["publication", "module", "MOD-004", "purchase", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD004-20260721T030000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-015", "ENG-017", "ENG-018", "ENG-019", "ENG-020", "ENG-021", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-003", "MOD-005", "MOD-006", "MOD-011", "MOD-015", "MOD-017", "MOD-018"]
depends_on:
  - "docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md"
  - "docs/20-module-prds/purchase/MODULE_PRD.md"
---

# MOD-004 Module Publication — Purchase

> **Reference publication only.** This publication is a faithful representation of [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) and the [`MOD-004 Module PRD`](../../20-module-prds/purchase/MODULE_PRD.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Executive Summary

MOD-004 Purchase is the authoritative bounded context for the Procure-to-Pay lifecycle. It owns the enterprise vendor master, purchase organization and buyer assignment, purchase configuration, terms & conditions and purchase price-list master; the requisition, RFQ, and purchase-order lifecycles with approvals and amendments; the commercial goods-receipt lifecycle with inspection hold and tolerance validation; the vendor-billing lifecycle with commercial 3-way match; the purchase-returns and vendor-adjustment lifecycles; and the purchase analytics and operational-controls read-model surface. Downstream modules consume Purchase state and never redefine it. (Baseline §2; PRD §§1–2.)

## 2. Module Scope

Restates the scope consolidated in `MOD004_PURCHASE_BASELINE_v1` §2 and the Module PRD §2. Purchase owns:

- **Purchase Foundation** — vendor master, vendor categories, vendor groups, purchase organization, buyer assignment, purchase configuration, terms & conditions master, purchase price list master, and purchase numbering readiness. (Baseline §2; PRD §5, §10.)
- **Requisitions, RFQs & Purchase Orders** — purchase requisition lifecycle, requisition approval, RFQ lifecycle, supplier comparison, purchase-order lifecycle, purchase-order approval, purchase-order amendments, pricing and discount application, commercial-document numbering, attachments, notifications, and events. (Baseline §2; PRD §6.)
- **Goods Receipt & Inspection** — goods-receipt lifecycle (partial and complete), commercial inspection hold, tolerance validation against open PO quantity, warehouse handover contracts, attachments, notifications, and goods-receipt lifecycle events; consumes inventory ownership contracts owned by MOD-005 Inventory. (Baseline §2; PRD §6, §7.)
- **Vendor Billing & Commercial 3-Way Match** — vendor bill lifecycle, commercial 3-way match against PO and GRN, tolerance enforcement, tax determination inputs, payables creation contracts, attachments, notifications, and vendor-bill lifecycle events; consumes accounting voucher creation, tax determination, and payables creation contracts owned by MOD-002 Accounting. (Baseline §2; PRD §6, §7.)
- **Purchase Returns & Vendor Adjustments** — purchase return request, vendor return authorization, return approval, partial and complete returns, replacement requests, vendor adjustment requests, debit-note requests, return numbering, attachments, notifications, and commercial return lifecycle events. (Baseline §2; PRD §6.)
- **Purchase Analytics & Operational Controls** — purchase dashboards, KPI reporting, spend and ageing analytics, supplier and buyer performance, price variance, 3-way match exception review, purchasing KPIs, operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, and reporting events. (Baseline §2; PRD §9.)

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 3. Business Objectives

Inherited verbatim from Module PRD §1:

- Provide the authoritative business surface for the Procure-to-Pay bounded context.
- Deliver the capabilities enumerated in §2 to the personas in §6.
- Consume ERP Core Engines listed in §15 without redefining platform behavior.

**Success Criteria** (PRD §1):

- All in-scope capabilities are supported end-to-end with the declared engines.
- All state-changing transactions are audited (via `ENG-004`) and authorized (via `ENG-002`).
- Cross-module interactions occur only via published events, approved APIs, or shared master data.

## 4. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-004-001` … `SPR-MOD-004-006`) as consolidated in `MOD004_PURCHASE_BASELINE_v1` §§3–4. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 5. Business Capabilities

Inherited verbatim from `MOD004_PURCHASE_BASELINE_v1` §4 and PRD §2:

| Capability Area | Originating Sprint |
| --- | --- |
| Vendor master, vendor categories, vendor groups, buyer master, terms & conditions, purchase price list, purchase organization | SPR-MOD-004-001 |
| Purchase configuration, purchase numbering readiness | SPR-MOD-004-001 |
| Purchase requisition and approval | SPR-MOD-004-002 |
| Request for quotation and supplier comparison | SPR-MOD-004-002 |
| Purchase orders and amendments | SPR-MOD-004-002 |
| Goods receipt and inspection | SPR-MOD-004-003 |
| Supplier invoices and commercial 3-way match | SPR-MOD-004-004 |
| Purchase returns and vendor adjustments | SPR-MOD-004-005 |
| Purchase analytics, KPI/spend/ageing/supplier/buyer performance, operational controls, dashboards | SPR-MOD-004-006 |

## 6. Actors

Inherited verbatim from PRD §3.

- **Primary Users:** Buyer; Procurement Manager; Stores Officer.
- **Secondary Users:** Accountant; Auditor.
- **External Actors:** Supplier.

## 7. User Roles

Business-level roles named in PRD §3 and enforced via `ENG-002` Authorization and `ENG-003` Permission Management under ADR-032 (RBAC + ABAC). This publication names roles only; it does not redefine the authorization model.

- Buyer
- Procurement Manager
- Stores Officer
- Accountant (read-oriented)
- Auditor (read-only)
- Supplier (external, portal-scope only)

## 8. Workflows

Inherited verbatim from PRD §4 and consolidated in Baseline §§3–4:

- **Requisition-to-PO** — requisition capture → approval → PO issue.
- **PO-to-GRN** — PO issue → goods receipt (partial/complete) → inspection hold resolution.
- **GRN-to-Invoice** — GRN → vendor bill submission → commercial 3-way match → payables handover.
- **3-Way Match** — PO, GRN, and vendor bill matched with tolerance evaluation via `ENG-012`.
- **Return-to-Debit-Note** — purchase return request → vendor return authorization → approval → return execution → debit-note request.

Long-running orchestration uses `ENG-010`; multi-step approvals use `ENG-011`; rule evaluations use `ENG-012`. Business state machines are declared in Sprint PRDs; enforcement of transition legality is delegated to the workflow and rules engines.

## 9. Business Rules

Inherited verbatim from PRD §7 and Baseline §7:

- GRN quantity cannot exceed open PO quantity plus configured tolerance. (PRD §7)
- Invoice cannot exceed matched GRN plus configured tolerance without override. (PRD §7)
- Blocked suppliers cannot receive new POs. (PRD §7)
- Vendor master lifecycle (create, edit, archive) is Purchase-owned; no other module mutates vendor master state. (Baseline §7)
- Purchase configuration resolves through the Platform configuration hierarchy (`ENG-005`); Purchase never redefines the Configuration Engine. (Baseline §7)
- Approval thresholds resolve via `ENG-005` configuration and route through `ENG-011`; approval semantics are consumed, not redefined. (Baseline §7)
- Commercial inspection is a Purchase-owned state distinct from quality-management and warehouse-inspection states. (Baseline §7)
- Commercial 3-way match arithmetic across PO, GRN, and vendor bill is Purchase-owned; tolerance evaluation resolves via `ENG-012`. Accounting matching, payables reconciliation, and payment execution remain owned by MOD-002 Accounting. (Baseline §7)
- Purchase-return, replacement, vendor-adjustment, and debit-note requests are commercial; financial adjustments, accounting postings, payables adjustments, and payment reversals remain owned by MOD-002. Physical inventory reversal remains owned by MOD-005. (Baseline §7)
- Analytics and operational-controls surfaces are read-only projections over the Purchase read model. (Baseline §7)

## 10. Validation Rules

Inherited verbatim from PRD §5 (Master Data) and PRD §7 (Business Rules); enforced by `ENG-012` Rules Engine at capture time:

- Structural validations (required fields, referential integrity, uniqueness) are declarative and evaluated by `ENG-012`. (PRD §5)
- GRN tolerance validation against open PO quantity. (PRD §7)
- Vendor-bill tolerance validation against matched GRN with override control. (PRD §7)
- Blocked-supplier check on PO issue. (PRD §7)
- Commercial 3-way match tolerance evaluation across PO/GRN/Bill. (Baseline §7)

## 11. Security Requirements

Derived from ADRs (Baseline §6, §7):

- **Multi-Tenant Isolation** — `ADR-011`. Every Purchase entity is tenant-scoped; cross-tenant access is prohibited.
- **RBAC + ABAC** — `ADR-032`. Enforced via `ENG-002` and registered via `ENG-003`; Purchase does not redefine the authorization model.
- **Platform Policies** — Encryption, secrets management, and data classification are inherited from `MOD001_PLATFORM_BASELINE_v1`; Purchase does not redefine them.
- **Identity** — Purchase user identity is resolved through `ENG-001`; Purchase does not maintain a parallel identity store.

## 12. Audit Requirements

Inherited verbatim from PRD §6 and Baseline §6:

- Every state-changing Purchase operation is audited via `ENG-004` under `ADR-014` Audit Strategy. Purchase does not implement its own audit trail.
- Audit-readiness surface (Baseline §7) exposes prior-sprint events through the read model; audit collection remains owned by Platform.

## 13. Notifications

Delivered via `ENG-025` Notification Engine (Baseline §5). Notification surfaces are inherited from the Sprint PRD family:

- Requisition submission, approval, and rejection notifications. (SPR-MOD-004-002)
- Purchase-order issue, amendment, and cancellation notifications. (SPR-MOD-004-002)
- Goods-receipt confirmation and inspection-hold notifications. (SPR-MOD-004-003)
- Vendor-bill submission, match-exception, and approval notifications. (SPR-MOD-004-004)
- Purchase-return, replacement, and debit-note-request notifications. (SPR-MOD-004-005)
- Analytics / operational-control notifications for KPI breach and exception review. (SPR-MOD-004-006)

Purchase never redefines notification delivery infrastructure; it emits notification requests through `ENG-025`.

## 14. Reports

Inherited verbatim from PRD §9:

- Purchase Register
- PO Ageing
- Supplier Performance
- Price Variance
- 3-Way Match Exceptions

Dashboards are delivered via `ENG-022`; cross-module KPI definitions are maintained in **MOD-017 Analytics**. Bulk exports are handled by `ENG-027`.

## 15. Integration Requirements

### 15.1 Events Published

Inherited verbatim from PRD §8 and Baseline §8. Emitted via `ENG-024` under the Platform Event Ownership Convention:

- `RequisitionApproved`
- `PurchaseOrderIssued`
- `GoodsReceived`
- `PurchaseInvoiceReceived`
- `DebitNoteIssued`

### 15.2 Events Consumed

Inherited verbatim from PRD §8:

- `SupplierCreated`
- `InventoryLowStock` (MOD-005 Inventory)
- `PaymentSent`

### 15.3 External System Categories

Inherited verbatim from PRD §8 (business categories only):

- Supplier portals
- E-invoice inbound

### 15.4 Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-004 via their Capability Interfaces. Engine set is inherited verbatim from `MOD004_PURCHASE_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-004-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-004-001 |
| ENG-004 (Audit Engine) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-004-001, 002 |
| ENG-006 (Localization Engine) | SPR-MOD-004-001 |
| ENG-007 (Document Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-008 (Attachment Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-010 (Workflow Engine) | SPR-MOD-004-002, 003, 005 |
| ENG-011 (Approval Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-012 (Rules Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-015 (Voucher Engine) | SPR-MOD-004-004 |
| ENG-017 (Numbering Engine) | SPR-MOD-004-001, 002, 003, 004, 005 |
| ENG-018 (Currency Engine) | SPR-MOD-004-001, 002, 003, 004, 005 |
| ENG-019 (Tax Engine) | SPR-MOD-004-004 |
| ENG-020 (Search Engine) | SPR-MOD-004-006 |
| ENG-021 (Reporting Engine) | SPR-MOD-004-006 |
| ENG-024 (Event Engine) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-004-002, 003, 004, 005, 006 |
| ENG-027 (Export Engine) | SPR-MOD-004-006 |

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC).

### 15.5 Cross-Module Contracts

Inherited verbatim from Baseline §9:

- **Upstream contracts consumed by Purchase:** MOD-001 Platform Administration, MOD-002 Accounting, MOD-003 Sales, MOD-005 Inventory, MOD-006 CRM.
- **Downstream consumers of Purchase:** MOD-011 AMC, MOD-015 POS, MOD-017 Analytics, MOD-018 AI Workspace.

## 16. AI Requirements

The Baseline defers all AI-driven procurement capabilities. Per Baseline §11 (Deferred Items):

- AI-driven procurement recommendations and supplier-selection assistance — deferred.
- Predictive procurement analytics and ML-driven vendor scoring — deferred.

No AI capability is authored by this publication.

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority summarized in §§5–15 is inherited verbatim from `MOD004_PURCHASE_BASELINE_v1` and the MOD-004 Module PRD.
2. Engine and ADR sets in §15.4 match the Module Baseline §5–§6 exactly.
3. Cross-module dependency set in §15.5 matches the Module Baseline §9 exactly.
4. Traceability matrix in §18 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Traceability Matrix

| # | Publication Section | Requirement | Source | Section |
| --- | --- | --- | --- | --- |
| 1 | §1 Executive Summary | Procure-to-Pay ownership | PRD | §1 |
| 2 | §2 Module Scope — Purchase Foundation | Vendor/organization/config authority | Baseline | §2; §7 |
| 3 | §2 Module Scope — Requisitions/RFQs/POs | Requisition, RFQ, PO lifecycles | Baseline | §2; §7 |
| 4 | §2 Module Scope — GRN & Inspection | GRN lifecycle, commercial inspection | Baseline | §2; §7 |
| 5 | §2 Module Scope — Vendor Billing & 3-Way Match | Vendor bill lifecycle, 3-way match | Baseline | §2; §7 |
| 6 | §2 Module Scope — Purchase Returns | Return/adjustment/debit-note lifecycle | Baseline | §2; §7 |
| 7 | §2 Module Scope — Analytics & Controls | Read-model dashboards, KPIs | Baseline | §2; §7 |
| 8 | §3 Business Objectives | Objectives, success criteria | PRD | §1 |
| 9 | §5 Capabilities | Capability → Sprint map | Baseline | §4 |
| 10 | §6 Actors | Personas | PRD | §3 |
| 11 | §7 User Roles | Business roles | PRD | §3 |
| 12 | §8 Workflows | Process catalogue and engines | PRD | §4 |
| 13 | §9 Business Rules | Tolerance, blocked supplier, ownership | PRD | §7; Baseline §7 |
| 14 | §10 Validation Rules | Structural + business validations | PRD | §5, §7 |
| 15 | §11 Security | Multi-tenant + RBAC/ABAC | Baseline | §6 |
| 16 | §12 Audit | ENG-004 audit strategy | PRD | §6; Baseline §6 |
| 17 | §13 Notifications | Notification surfaces | Sprint PRDs | 002-006 |
| 18 | §14 Reports | Reports & dashboards | PRD | §9 |
| 19 | §15.1 Events Published | Published event set | PRD | §8; Baseline §8 |
| 20 | §15.2 Events Consumed | Consumed event set | PRD | §8 |
| 21 | §15.3 External Systems | External categories | PRD | §8 |
| 22 | §15.4 Engines | Engine consumption table | Baseline | §5 |
| 23 | §15.5 Cross-Module | Upstream / downstream contracts | Baseline | §9 |
| 24 | §16 AI | Deferred AI items | Baseline | §11 |
| 25 | §17 Acceptance | Publication acceptance | GT-005 template | v1.0 |

## 19. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD004-20260721T030000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD004_PUBLICATION_COMPLETE` → satisfies remediation finding `F-PRR-001`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD004_PURCHASE_BASELINE_v2`).

## 20. References

- [`docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- [`docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md`](../../30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md)
- [`docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md`](../crm/MOD-006_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)

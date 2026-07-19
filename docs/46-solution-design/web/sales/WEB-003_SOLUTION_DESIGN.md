---
title: "WEB-003 — Sales Web Solution Design Specification"
summary: "Phase 3 Web Solution Design for MOD-003 Sales. Derived exclusively from MOD-003_MODULE_PUBLICATION. Defines web information architecture, screen catalogue, page specifications, user flows, UI components, client-side validation, client state, error handling, permissions, accessibility, cross-module navigation, and traceability. Introduces no new business requirements."
spec_id: "WEB-003_SOLUTION_DESIGN"
family: "WEB"
template: "WEB-003"
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
related_mobile_spec: "MOB-003"
related_api_spec: "API-003"
version: "1.0"
status: "Active"
lifecycle_state: "WEB003_SOLUTION_DESIGNED"
owner: "Sales"
layer: "delivery"
updated: "2026-07-19"
tags: ["solution-design", "web", "phase-3", "WEB-003", "MOD-003", "sales"]
document_type: "Web Solution Design Specification"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-015", "ENG-017", "ENG-018", "ENG-019", "ENG-020", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# WEB-003 — Sales Web Solution Design Specification

> **Reference derivation only.** WEB-003 is a Web-surface projection of `MOD-003_MODULE_PUBLICATION`. It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and WEB-003 is corrected in the same change.

## 1. Identity & Traceability

- **Specification ID:** `WEB-003_SOLUTION_DESIGN`
- **Family:** WEB
- **Source Module:** MOD-003 Sales
- **Source Publication:** `MOD-003_MODULE_PUBLICATION`
- **Source Baseline:** `MOD003_SALES_BASELINE_v1`
- **Related Mobile Spec:** `MOB-003` (out of scope for this pass)
- **Related API Spec:** `API-003` (out of scope for this pass)
- **Lifecycle State:** `WEB003_SOLUTION_DESIGNED`

Derivation chain:

```text
MOD003_SALES_BASELINE_v1
        ↓
Sales Sprint PRDs (SPR-MOD-003-001 … SPR-MOD-003-006)
        ↓
MOD-003_MODULE_PUBLICATION (GT-005)
        ↓
WEB-003 Solution Design (this document)
```

## 2. Design Principles

- **Publication parity.** Every screen, workflow, and interaction traces to a capability, authority, master entity, or transaction declared in `MOD-003_MODULE_PUBLICATION`.
- **No business-rule authoring.** Business rules are surfaced (never redefined). Rule evaluation is delegated to backend engines (`ENG-011`, `ENG-012`, `ENG-019`) via the API surface owned by API-003.
- **Responsive-first.** The web surface targets desktop-first workstations for order-desk and back-office personas, and remains fully usable on tablet and mobile-browser breakpoints.
- **Accessibility-first.** Meets the platform accessibility baseline (ADR-081 as inherited via Publication engine consumption).
- **Reusable components.** Reuses the Business OS design-system primitives (data grid, filter panel, master form, lookup dialog, voucher grid, approval timeline, activity feed, attachment control) — see `docs/12-ui-components/`.
- **Consistent Business OS UX.** Navigation, action bars, workflow states, and audit surfaces mirror WEB-001 and WEB-002 conventions so users move between modules without relearning primitives.
- **Boundary conveyance.** Accounting, Inventory, CRM, and Analytics ownership boundaries (Publication §13) are conveyed as read-only handoffs; the web surface never offers actions that redefine them.

## 3. Information Architecture

### 3.1 Module Placement

Sales is a top-level workspace in the Business OS primary navigation, adjacent to Accounting, Inventory, CRM, and Analytics. Its landing route is the Sales Dashboard.

### 3.2 Workspace Organization

The Sales workspace is organized as six functional areas mapping 1:1 to the Sprint PRD scope in Publication §3:

```text
Sales
├── Dashboard                       (SPR-MOD-003-006)
├── Sell
│   ├── Quotations                  (SPR-MOD-003-002)
│   ├── Sales Orders                (SPR-MOD-003-002)
├── Fulfill
│   ├── Deliveries                  (SPR-MOD-003-003)
├── Bill
│   ├── Sales Invoices              (SPR-MOD-003-004)
│   ├── Credit Notes                (SPR-MOD-003-004)
│   ├── Debit Notes                 (SPR-MOD-003-004)
├── Returns
│   ├── Return Requests             (SPR-MOD-003-005)
│   ├── Customer Adjustments        (SPR-MOD-003-005)
├── Masters
│   ├── Customers                   (SPR-MOD-003-001)
│   ├── Customer Hierarchy          (SPR-MOD-003-001)
│   ├── Sales Organization          (SPR-MOD-003-001)
│   ├── Territories                 (SPR-MOD-003-001)
│   ├── Salespersons                (SPR-MOD-003-001)
│   ├── Pricing & Discounts         (SPR-MOD-003-002)
├── Reports                         (SPR-MOD-003-006)
└── Settings (Sales)                (SPR-MOD-003-001)
```

### 3.3 Menu Placement

- Primary nav: **Sales** workspace icon.
- Secondary nav (left rail): the seven groups above.
- Contextual actions: on each list and detail page via the action bar component.
- Global surfaces (search, notifications, approvals inbox, activity, help) remain platform-owned (MOD-001) and are consumed unchanged.

### 3.4 Page Hierarchy Pattern

Every functional area follows the platform pattern: **List → Detail → Sub-detail (line/child)** with an optional **Create / Amend / Cancel** flow driven by the master-form and voucher-grid primitives.

## 4. Screen Catalogue

Each screen is a functional surface, not an implementation artifact. Identifiers use `WEB-003-S<NN>` for stability across later phases.

| ID | Screen | Kind | Source Sprint |
| --- | --- | --- | --- |
| WEB-003-S01 | Sales Dashboard | Dashboard | SPR-MOD-003-006 |
| WEB-003-S02 | Quotations — List | List | SPR-MOD-003-002 |
| WEB-003-S03 | Quotation — Detail | Detail (voucher) | SPR-MOD-003-002 |
| WEB-003-S04 | Sales Orders — List | List | SPR-MOD-003-002 |
| WEB-003-S05 | Sales Order — Detail | Detail (voucher) | SPR-MOD-003-002 |
| WEB-003-S06 | Sales Order Amendment | Detail (voucher amendment) | SPR-MOD-003-002 |
| WEB-003-S07 | Deliveries — List | List | SPR-MOD-003-003 |
| WEB-003-S08 | Delivery Order — Detail | Detail (voucher) | SPR-MOD-003-003 |
| WEB-003-S09 | Pick / Pack Worksheet | Worksheet | SPR-MOD-003-003 |
| WEB-003-S10 | Delivery Completion | Confirmation | SPR-MOD-003-003 |
| WEB-003-S11 | Sales Invoices — List | List | SPR-MOD-003-004 |
| WEB-003-S12 | Sales Invoice — Detail | Detail (voucher) | SPR-MOD-003-004 |
| WEB-003-S13 | Credit Notes — List | List | SPR-MOD-003-004 |
| WEB-003-S14 | Credit Note — Detail | Detail (voucher) | SPR-MOD-003-004 |
| WEB-003-S15 | Debit Notes — List | List | SPR-MOD-003-004 |
| WEB-003-S16 | Debit Note — Detail | Detail (voucher) | SPR-MOD-003-004 |
| WEB-003-S17 | Return Requests — List | List | SPR-MOD-003-005 |
| WEB-003-S18 | Return Request — Detail | Detail (voucher) | SPR-MOD-003-005 |
| WEB-003-S19 | Return Receipt Confirmation | Confirmation | SPR-MOD-003-005 |
| WEB-003-S20 | Customer Adjustments — List | List | SPR-MOD-003-005 |
| WEB-003-S21 | Customer Adjustment — Detail | Detail | SPR-MOD-003-005 |
| WEB-003-S22 | Customers — List | Master list | SPR-MOD-003-001 |
| WEB-003-S23 | Customer — Detail | Master detail | SPR-MOD-003-001 |
| WEB-003-S24 | Customer Hierarchy | Tree master | SPR-MOD-003-001 |
| WEB-003-S25 | Sales Organization | Master | SPR-MOD-003-001 |
| WEB-003-S26 | Territories | Master | SPR-MOD-003-001 |
| WEB-003-S27 | Salespersons | Master | SPR-MOD-003-001 |
| WEB-003-S28 | Price Lists | Master | SPR-MOD-003-002 |
| WEB-003-S29 | Discount Schemes | Master | SPR-MOD-003-002 |
| WEB-003-S30 | Sales Reports | Report catalog | SPR-MOD-003-006 |
| WEB-003-S31 | Sales Settings | Configuration | SPR-MOD-003-001 |

No implementation details (layout grids, component libraries, framework choices) are declared here.

## 5. Page Specifications

For each screen: **Purpose · Entry Conditions · Exit Conditions · User Actions · Displayed Information · Navigation · Permission Requirements**. All permissions reference `ENG-002` and `ENG-003` per ADR-032; the tokens below are business-role tokens conveyed to the authorization surface, not new grants.

### 5.1 WEB-003-S01 — Sales Dashboard

- **Purpose.** Read-only operational overview per Publication §4.6 (Analytics Read Model Convention Authority).
- **Entry.** User is authenticated, has any Sales role, and has selected a tenant/company context.
- **Exit.** Navigation to a linked screen (drill-through) or workspace change.
- **User Actions.** Filter by period/territory/salesperson; drill through to underlying list; export via `ENG-027`.
- **Displayed Information.** KPI tiles (open quotations, order book, undelivered orders, unbilled deliveries, open returns), pipeline chart, top customers, discount impact, approval backlog. All values are read-model projections; no mutation.
- **Navigation.** Drill-through respects Ownership Boundaries: portfolio KPIs redirect to MOD-017; predictive analytics redirect to MOD-018.
- **Permissions.** `sales.dashboard.read`.

### 5.2 WEB-003-S02 — Quotations List

- **Purpose.** Discover and manage quotations across their lifecycle (Publication §8).
- **Entry.** `sales.quotation.read`.
- **Exit.** Open a quotation detail, or return to workspace.
- **User Actions.** Create quotation; filter, sort, search; bulk export; open detail.
- **Displayed Information.** Quotation number (from `ENG-017`), customer, currency, value, status, salesperson, territory, validity, workflow state.
- **Navigation.** Detail (S03); customer lookup opens S23.
- **Permissions.** `sales.quotation.read` for viewing; `sales.quotation.create` for new.

### 5.3 WEB-003-S03 — Quotation Detail

- **Purpose.** Author, review, submit for approval, revise, issue, or cancel a quotation.
- **Entry.** From S02 or workspace deep link; requires `sales.quotation.read` at minimum.
- **Exit.** Save draft, submit, cancel, or convert to Sales Order (initiates S05).
- **User Actions.** Edit header, edit line grid, apply pricing/discount (via `ENG-005` + `ENG-012` — evaluation only, no local rule authoring), attach documents (`ENG-008`), submit for approval (`ENG-011`), issue (emits `QuotationIssued`), cancel.
- **Displayed Information.** Header (customer, currency, validity, salesperson, territory), lines (item, qty, unit price, discount, tax indicator, line total), totals, attachments, activity timeline, approval banner when applicable.
- **Navigation.** Customer, item lookups; convert-to-order transition to S05.
- **Permissions.** `sales.quotation.read | create | edit | approve | issue | cancel` scoped by role and organizational context.

### 5.4 WEB-003-S04 / S05 — Sales Orders

- **Purpose.** Sales Order lifecycle end-to-end (Publication §4.2).
- **Entry.** From S02 (Convert to Order), from S04 (Create), or deep link.
- **Exit.** Confirm, cancel, amend (S06), or hand off to Deliveries (S08).
- **User Actions.** Author header and lines; run pricing/discount evaluation; capture credit-limit approval (routes via `ENG-011`) when triggered; confirm (emits `SalesOrderConfirmed`); amend; cancel; navigate to fulfillment.
- **Displayed Information.** Header, lines, pricing breakdown, credit status banner, approval banner, related quotation, related deliveries and invoices.
- **Navigation.** Bidirectional links to source Quotation and to child Deliveries and Invoices.
- **Permissions.** `sales.order.read | create | edit | approve-credit | confirm | amend | cancel`.

### 5.5 WEB-003-S06 — Sales Order Amendment

- **Purpose.** Governed amendment of a confirmed sales order.
- **Entry.** From S05 with `sales.order.amend`; only permitted when workflow permits (delegated to `ENG-010`).
- **Exit.** Submit amendment for approval or discard.
- **User Actions.** Propose changes to lines/quantities/prices; capture reason; submit; approve/reject via approval banner.
- **Displayed Information.** Original vs proposed values (diff view), reason, approver, audit trail.
- **Permissions.** `sales.order.amend`, `sales.order.approve-amendment`.

### 5.6 WEB-003-S07 / S08 / S09 / S10 — Deliveries

- **Purpose.** Delivery lifecycle (Publication §4.3).
- **Entry.** From confirmed Sales Order (S05) or from S07.
- **Exit.** Delivery Completion (S10) emits `DeliveryCompleted` (commercial event; MUST NOT create accounting vouchers or ledger movements — surfaced as a boundary banner on S10).
- **User Actions.** Create delivery order; run pick/pack worksheet (S09); mark shipment-ready; complete delivery.
- **Displayed Information.** Sales-order reference, items with reservation status (read-only from `MOD-005` via `InventoryReserved`/`InventoryReleased`), pick/pack progress, shipment-readiness state, completion capture (delivery date, receiver, notes).
- **Navigation.** Inventory reservation drill-through opens MOD-005 in read-only; return to Sales retained via breadcrumb.
- **Permissions.** `sales.delivery.read | create | pickpack | complete`.

### 5.7 WEB-003-S11 / S12 — Sales Invoices

- **Purpose.** Commercial invoice authoring, approval, issuance, amendment, cancellation (Publication §4.4).
- **Entry.** From S05 (confirmed order) or S08 (delivery) or S11.
- **Exit.** Issue (emits `SalesInvoiceIssued`), cancel, or amend (creates Credit/Debit Note).
- **User Actions.** Compose invoice; run tax determination (`ENG-019` — consume only); submit approval; issue; view accounting handoff status (read-only from `VoucherPosted`/`ReceiptRecorded`); cancel.
- **Displayed Information.** Header, lines with taxes, totals, related order/delivery, accounting handoff banner, payment status (read-model from MOD-002).
- **Boundary Conveyance.** Accounting handoff status is read-only. The screen never offers ledger-level actions.
- **Permissions.** `sales.invoice.read | create | approve | issue | cancel`.

### 5.8 WEB-003-S13 – S16 — Credit Notes / Debit Notes

- **Purpose.** Commercial credit-note and debit-note lifecycle (Publication §4.4).
- **Entry.** From S12 (invoice-driven), from S18 (return-driven), or from list.
- **Exit.** Issue (Credit Note emits `CreditNoteIssued`), cancel.
- **User Actions.** Compose against source invoice or return; run tax determination; submit approval; issue; cancel.
- **Displayed Information.** Header, lines, source reference, accounting handoff status.
- **Permissions.** `sales.creditnote.read | create | approve | issue | cancel`; `sales.debitnote.*` equivalents.

### 5.9 WEB-003-S17 – S21 — Returns & Customer Adjustments

- **Purpose.** Commercial return lifecycle and customer adjustments (Publication §4.5).
- **Entry.** From S12 (Return from Invoice) or S17.
- **Exit.** Return Receipt Confirmation (S19); Customer Adjustment (S21); Credit Note issuance handoff (S14).
- **User Actions.** Author return referencing original invoice lines; approve; confirm receipt; prepare customer adjustment (replacement/refund); handoff to Credit Note.
- **Displayed Information.** Reference invoice, eligible lines with remaining returnable quantity, receipt confirmation, adjustment type, refund preparation status.
- **Permissions.** `sales.return.read | create | approve | receive | adjust`.

### 5.10 WEB-003-S22 / S23 / S24 — Customers

- **Purpose.** Customer master authority (Publication §4.1).
- **Entry.** From workspace or from any transaction customer lookup.
- **Exit.** Save master, archive, or return to caller.
- **User Actions.** Create, edit, archive customer; manage hierarchy; view opportunities (drill-out to MOD-006 CRM).
- **Displayed Information.** Identity, addresses, contacts, tax classification, credit profile, hierarchy tree, related activity.
- **Boundary Conveyance.** CRM lead/opportunity ownership remains with MOD-006; the customer detail links out and never edits CRM state.
- **Permissions.** `sales.customer.read | create | edit | archive`.

### 5.11 WEB-003-S25 – S27 — Sales Organization / Territories / Salespersons

- **Purpose.** Sales-organization masters (Publication §7).
- **User Actions.** CRUD via master-form primitive; assign salesperson to territory; deactivate.
- **Permissions.** `sales.org.read | edit`, `sales.territory.read | edit`, `sales.salesperson.read | edit`.

### 5.12 WEB-003-S28 / S29 — Pricing & Discounts

- **Purpose.** Price list and discount scheme masters. Evaluation remains in `ENG-005` + `ENG-012`; the web surface only authors master values.
- **User Actions.** Author price list versions, effective dates, currency; author discount schemes; simulate against a sample line (evaluation only, no state change).
- **Permissions.** `sales.pricing.read | edit`.

### 5.13 WEB-003-S30 — Sales Reports

- **Purpose.** Operational report catalog for Sales (Publication §4.6).
- **User Actions.** Select report; parameterize; run; export via `ENG-027`.
- **Boundary Conveyance.** Portfolio KPIs redirect to MOD-017; predictive analytics redirect to MOD-018.
- **Permissions.** `sales.report.read | export`.

### 5.14 WEB-003-S31 — Sales Settings

- **Purpose.** Sales-level configuration surfaces (Publication §4.1).
- **User Actions.** View/edit sales-owned configuration keys resolved through `ENG-005` hierarchy; author sales-owned numbering series (`ENG-017`).
- **Permissions.** `sales.settings.read | edit`.

## 6. User Flows

Each flow enumerates screen transitions and workflow states. Enforcement of transition legality is delegated to `ENG-010` and `ENG-011`.

### 6.1 Quote → Order

```text
S02 → S03 (Draft → Submitted → Approved → Issued)
   → Convert to Order → S05 (Draft → Confirmed)
```

### 6.2 Order → Delivery

```text
S05 (Confirmed) → S07 → S08 (Draft) → S09 (Picked → Packed → Shipment-Ready) → S10 (Completed)
```

### 6.3 Delivery → Invoice

```text
S08 (Completed) → S11 → S12 (Draft → Submitted → Approved → Issued)
   → Accounting handoff banner reflects VoucherPosted (read-only)
```

### 6.4 Invoice → Return

```text
S12 (Issued) → S17 → S18 (Draft → Submitted → Approved)
   → S19 (Receipt Confirmed) → S21 (Adjustment Prepared)
   → S14 (Credit Note Draft → Approved → Issued)
```

### 6.5 Draft → Approval (cross-cutting)

Any voucher (Quotation, Sales Order, Invoice, Credit/Debit Note, Return, Adjustment) transitions via the approval banner: `Draft → Submitted → Approved | Rejected → Issued/Confirmed | Returned to Draft`. Approval routing is `ENG-011`-owned.

### 6.6 Cancel / Reject

Cancellation follows workflow rules: permitted from Draft freely; from Submitted with revoke privilege; from Approved via cancellation approval; from Issued only where governance permits (e.g. Sales Order cancellation before delivery start). Rejected artifacts return to Draft with reason captured on the activity timeline.

### 6.7 Reopen (where permitted)

Reopen is offered only for artifacts whose workflow permits it (currently: Quotation prior to expiry, Sales Order prior to delivery start). Reopen requires the corresponding `*.reopen` permission and captures reason and audit context.

## 7. UI Component Specifications

Behavioral specification only; no code, styling, or library commitments.

- **Data Grid.** Column visibility, sort, filter, group, pagination; row selection; bulk actions; server-driven paging expected via API-003.
- **Filter Panel.** Faceted filters (period, status, customer, territory, salesperson, currency); saved filter sets per user (persisted server-side).
- **Search.** Global search consumes `ENG-020`; scoped search within a list operates on the list's server query.
- **Master Form.** Field grouping, inline validation, dirty-state guard, cancel confirmation, autosave for drafts where declared.
- **Voucher Grid.** Header + lines pattern with grid-level totals, inline line editing, add/remove/reorder, per-line tax indicator (read-only from `ENG-019`).
- **Dialogs.** Modal confirmation for destructive actions; non-blocking side panels for lookups and quick-view.
- **Lookup Controls.** Server-backed pickers for customer, item, salesperson, territory, price list; keyboard-accessible; support "recent" and "starred".
- **Action Bar.** Contextual actions per workflow state, permission-filtered before render.
- **Approval Banner.** Surfaces the current `ENG-011` approval state, approver, elapsed time, and next action; read-only when the current user is not an approver.
- **Attachments.** Consumes `ENG-008`; supports upload, download, preview, remove (permission-gated); virus-scan status conveyed.
- **Activity Timeline.** Read-only projection of `ENG-004` audit + workflow + notification events for the artifact.

## 8. Client-side Validation

Client-side rules provide immediate feedback and prevent obviously-invalid submissions. Authoritative enforcement remains backend-owned.

- **Mandatory fields.** Every required field flagged in the Master Form / Voucher Grid schema.
- **Format validation.** Dates, currencies, numbers, quantities, tax identifiers — validated per locale (`ENG-006`).
- **Workflow validation.** Actions available only in permitted workflow states; unreachable transitions are hidden, not disabled.
- **Permission validation.** Actions hidden when the user lacks the corresponding permission; server re-authorizes on submit (defense in depth).
- **Duplicate prevention.** Client debounces submit; server-side idempotency is authoritative.
- **Business-rule delegation.** Pricing, discount evaluation, credit-limit checks, tax determination, workflow legality, return eligibility, and receivable state are backend-authoritative; the web surface displays the backend verdict and never re-implements the rule.

## 9. Client State Model

Behavioral shape only; no framework or store implementation is prescribed.

- **Page state.** Route parameters, filters, sort, pagination, selection.
- **Draft state.** Unsaved voucher/master edits held per-artifact; dirty flag drives cancel-confirmation.
- **Editing state.** Field-level pending values, inline validation errors, per-field disabled/enabled derived from workflow + permissions.
- **Approval state.** Read-only projection of `ENG-011` current state, refreshed on foreground focus and on server-push notifications.
- **Loading state.** Deterministic skeletons for list, detail, and grid; per-action pending indicators on the action bar.
- **Synchronization expectations.** Optimistic UI is permitted for masters where server response is fast; vouchers use pessimistic (server-confirmed) transitions.
- **Offline expectations.** Web surface is **online-first**; no offline capture is required on WEB-003. Transient network failures surface via the standard error patterns in §10. (Offline field flows belong to MOB-003 if declared.)

## 10. Error Handling

- **Validation failures.** Inline field errors + form-level summary; submit disabled until resolved.
- **Authorization failures.** 401 / 403 surface a non-technical "You don't have access" panel with the required permission token and a "request access" affordance.
- **Concurrency conflicts.** 409 / stale-write surface a "This record changed while you were editing" dialog with side-by-side diff and reload-or-overwrite (only when permission allows).
- **Unavailable resources.** 404 / soft-404 surface a "not found or no longer available" panel with a return-to-list affordance.
- **Unexpected failures.** 5xx surface a generic failure panel with a correlation ID (for support), retry, and a link to the notifications inbox.
- **Boundary handoff failures.** When Accounting / Inventory / CRM handoffs fail, the failure is surfaced on the source Sales artifact banner without exposing downstream implementation details; retry is offered where the downstream contract supports idempotent retry.

## 11. Roles & Permissions

Business-level role tokens (authoritative enforcement via `ENG-002` + `ENG-003` per ADR-032):

| Role | Scope |
| --- | --- |
| Sales Executive | Own quotations, orders, invoices for assigned customers/territory. Read own artifacts and dashboards. |
| Sales Manager | Read/act on team artifacts; approve within delegated thresholds; access management reports. |
| Order Desk | Create/edit quotations and orders; initiate delivery hand-off; no invoice issue rights unless delegated. |
| Delivery Coordinator | Manage deliveries (create, pick/pack, complete). |
| Billing Clerk | Manage invoices, credit notes, debit notes. |
| Returns Clerk | Manage return requests, receipts, adjustments. |
| Accountant (read-only from Sales) | Read invoices, credit/debit notes, receivable status. No Sales master or transaction mutation. |
| Warehouse Manager (scoped) | Read Sales orders/deliveries for planning. No Sales mutation. |
| Sales Administrator | Manage Sales masters (organization, territories, salespersons, pricing, discounts, settings). |

Permission tokens follow the pattern `sales.<artifact>.<action>` (e.g. `sales.order.confirm`). The token list is derived from Publication §4 and §11; no new authority is introduced by this specification.

## 12. Accessibility

- **Keyboard Navigation.** Every action reachable without a mouse; grid cell navigation, inline edit, and lookup pickers fully keyboard-operable.
- **Focus Management.** Focus moves to the first invalid field on validation failure; dialogs trap focus and restore it on close; action bar buttons announce their state.
- **Screen-Reader Support.** All primitives expose accessible name, role, and state; the approval banner and activity timeline are readable in linear order.
- **Color Independence.** Workflow states, approval states, and validation status are conveyed by shape/label in addition to color.
- **Responsive Behavior.** Desktop-first with tablet and mobile-browser breakpoints; the voucher grid degrades to a stacked-line layout on narrow viewports without losing behavior.
- **Localization.** All strings, dates, numbers, currencies routed through `ENG-006`.

## 13. Cross-Module Navigation

Sales surfaces cross-module handoffs while respecting Publication §13 ownership boundaries.

- **→ CRM (MOD-006).** Customer detail (S23) links to CRM opportunity views (read-only); return path preserved.
- **→ Inventory (MOD-005).** Delivery (S08, S09) links to Inventory reservation views (read-only).
- **→ Accounting (MOD-002).** Sales Invoice (S12), Credit/Debit Note (S14, S16) link to Accounting voucher / receivable views (read-only).
- **→ Analytics (MOD-017).** Portfolio KPIs and cross-module dashboards redirect to Analytics workspace.
- **→ AI Workspace (MOD-018).** Predictive prompts redirect to AI Workspace.

No cross-module surface allows mutation of the destination module's state.

## 14. Traceability Matrix

Illustrative mapping (complete matrix generated by the Solution Design Catalog on registration; each row here is authoritative in itself).

| GT-005 Requirement (Publication §) | WEB Screen(s) | Workflow (§6) | UI Component (§7) |
| --- | --- | --- | --- |
| Customer Master Authority (§4.1) | S22, S23, S24 | Draft → Approval | Master Form, Data Grid |
| Sales Configuration Authority (§4.1) | S31 | — | Master Form |
| Pricing / Discount Masters (§4.2) | S28, S29 | Draft → Approval | Master Form, Data Grid |
| Quotation Authority (§4.2) | S02, S03 | Quote → Order (§6.1) | Voucher Grid, Approval Banner |
| Sales Order Authority (§4.2) | S04, S05, S06 | Order → Delivery (§6.2) | Voucher Grid, Approval Banner |
| Delivery Authority (§4.3) | S07, S08, S09, S10 | Order → Delivery (§6.2) | Voucher Grid, Worksheet |
| Sales Invoice Authority (§4.4) | S11, S12 | Delivery → Invoice (§6.3) | Voucher Grid, Approval Banner |
| Credit / Debit Note Authority (§4.4) | S13, S14, S15, S16 | §6.3, §6.4 | Voucher Grid |
| Return Authority (§4.5) | S17, S18, S19 | Invoice → Return (§6.4) | Voucher Grid |
| Customer Adjustment Authority (§4.5) | S20, S21 | §6.4 | Master Form |
| Sales Analytics Authority (§4.6) | S01, S30 | — | Dashboard, Data Grid |
| Cross-cutting: `QuotationIssued`, `SalesOrderConfirmed`, `DeliveryCompleted`, `SalesInvoiceIssued`, `CreditNoteIssued`, `SalesReturnConfirmed` (§9) | S03, S05, S10, S12, S14, S19 | §6.1–§6.4 | Approval Banner, Activity Timeline |

## 15. Design Constraints

- **No backend architecture.** No server topology, runtime, or deployment content is authored here.
- **No API contracts.** Request/response shapes, endpoint URIs, authentication schemes, and error envelopes are owned by API-003 (out of scope).
- **No database schema.** Table structures, indices, constraints, and migrations remain out of scope.
- **No implementation.** No source code, framework selection, styling system, or component library is prescribed.
- **No governance evolution.** No new authorities, engines, ADRs, events, or ownership boundaries are introduced.
- **No mobile design.** Mobile-native surfaces belong to MOB-003.
- **No modification of MOD-001 or MOD-002 artifacts.**

## 16. References

- `docs/45-module-publications/sales/MOD-003_MODULE_PUBLICATION.md`
- `docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`
- `docs/20-module-prds/sales/MODULE_PRD.md`
- `docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md`
- `docs/60-solution-design/web/WEB-002_ACCOUNTING.md` (reference structure)
- `docs/60-solution-design/README.md`
- `docs/12-ui-components/`
- `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`
- `docs/15-governance/FINDING_SEVERITY_STANDARD.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`

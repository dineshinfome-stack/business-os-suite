---
title: "MOB-003 — Sales Mobile Solution Design Specification"
summary: "Phase 3 Mobile Solution Design for MOD-003 Sales. Derived exclusively from MOD-003_MODULE_PUBLICATION and paired with WEB-003 for functional parity. Defines mobile information architecture, screen catalogue, screen specifications, user journeys, UI components, offline/synchronization model, validation, error handling, roles, accessibility, cross-module navigation, and traceability. Introduces no new business requirements."
spec_id: "MOB-003_SOLUTION_DESIGN"
family: "MOB"
template: "MOB-003"
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
related_web_spec: "WEB-003"
related_api_spec: "API-003"
version: "1.0"
status: "Active"
lifecycle_state: "MOB003_SOLUTION_DESIGNED"
owner: "Sales"
layer: "delivery"
updated: "2026-07-19"
tags: ["solution-design", "mobile", "phase-3", "MOB-003", "MOD-003", "sales"]
document_type: "Mobile Solution Design Specification"
screen_identifier_standard: "SCREEN_IDENTIFIER_STANDARD v1.0"
finding_severity_standard: "FINDING_SEVERITY_STANDARD v1.0"
frontmatter_standard: "GOVERNANCE_FRONTMATTER_STANDARD v1.0"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-015", "ENG-017", "ENG-018", "ENG-019", "ENG-020", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-081", "ADR-083"]
---

# MOB-003 — Sales Mobile Solution Design Specification

> **Reference derivation only.** MOB-003 is a Mobile-surface projection of `MOD-003_MODULE_PUBLICATION`. It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. `WEB-003_SOLUTION_DESIGN` is referenced only to preserve functional parity of journeys, terminology, and navigation; it is not a business source. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and MOB-003 is corrected in the same change.

## 1. Identity & Traceability

- **Specification ID:** `MOB-003_SOLUTION_DESIGN`
- **Family:** MOB
- **Source Module:** MOD-003 Sales
- **Source Publication:** `MOD-003_MODULE_PUBLICATION`
- **Source Baseline:** `MOD003_SALES_BASELINE_v1`
- **Paired Web Design:** `WEB-003_SOLUTION_DESIGN` (parity reference only)
- **Related API Spec:** `API-003` (out of scope for this pass)
- **Lifecycle State:** `MOB003_SOLUTION_DESIGNED`

Derivation chain:

```text
MOD003_SALES_BASELINE_v1
        ↓
Sales Sprint PRDs (SPR-MOD-003-001 … SPR-MOD-003-006)
        ↓
MOD-003_MODULE_PUBLICATION (GT-005)
        ↓
WEB-003 Solution Design ──── parity reference ────►  MOB-003 Solution Design (this document)
```

## 2. Mobile Design Principles

- **Publication parity.** Every mobile screen, journey, and interaction traces to a capability, authority, master entity, or transaction declared in `MOD-003_MODULE_PUBLICATION`.
- **Functional parity with Web.** MOB-003 mirrors WEB-003 workflows without introducing new business behavior. See §6.9.
- **Touch-first ergonomics.** Minimum 44×44 CSS-px touch targets, gesture affordances (swipe, long-press), and thumb-reachable primary actions.
- **Offline-first for field flows.** Offline capture is permitted only for scopes the Module Publication and ADR-083 authorize (voucher draft capture, cached read-only viewing).
- **Progressive disclosure.** Condensed forms with section-by-section expansion suit small screens; no functional step is removed.
- **Accessibility-first.** Screen readers, dynamic type, color-independent state, and orientation adaptability per ADR-081 (inherited via Publication).
- **Boundary conveyance.** Accounting, Inventory, CRM, and Analytics ownership boundaries (Publication §13) are conveyed as read-only handoffs; mobile never redefines them.
- **No local rule authoring.** Pricing, discount, credit, tax, workflow legality, and return eligibility remain backend-authoritative via engines `ENG-005 / 010 / 011 / 012 / 019`.

## 3. Mobile Information Architecture

### 3.1 Module Placement

Sales is a top-level workspace in the Business OS mobile app, reachable from the primary launcher and from the global switcher.

### 3.2 Navigation Model

- **Bottom Navigation (5 slots):** Dashboard · Sell · Fulfill · Bill · More.
- **"More" Drawer:** Returns, Masters, Reports, Settings, Notifications, Pending Approvals, Offline Queue, Sync Status.
- **Contextual Actions:** Long-press on list rows and detail headers reveal context sheets; swipe-left/right expose row actions (approve, cancel, open, share) as permitted by workflow and permission.
- **Floating Action Button (FAB):** Primary create action on each list surface (New Quotation, New Order, New Delivery, New Invoice, New Return).
- **Global Surfaces:** Search, Notifications, Approvals inbox, and Help remain platform-owned (MOD-001).

### 3.3 Workspace Organization

```text
Sales (Mobile)
├── Dashboard                          (SPR-MOD-003-006)
├── Sell
│   ├── Quotations                     (SPR-MOD-003-002)
│   └── Sales Orders                   (SPR-MOD-003-002)
├── Fulfill
│   └── Deliveries                     (SPR-MOD-003-003)
├── Bill
│   ├── Sales Invoices                 (SPR-MOD-003-004)
│   ├── Credit Notes                   (SPR-MOD-003-004)
│   └── Debit Notes                    (SPR-MOD-003-004)
└── More
    ├── Returns / Adjustments          (SPR-MOD-003-005)
    ├── Masters                        (SPR-MOD-003-001, -002)
    ├── Reports                        (SPR-MOD-003-006)
    ├── Settings (Sales)               (SPR-MOD-003-001)
    ├── Pending Approvals              (cross-cutting)
    ├── Notifications                  (platform)
    ├── Offline Queue                  (cross-cutting)
    └── Sync Status                    (cross-cutting)
```

### 3.4 Page Hierarchy Pattern

Every functional area follows **List → Detail → Sub-detail (line/child)** with sheet-based **Create / Amend / Cancel** flows. Line editing uses a mobile-optimized stacked-line layout in place of the desktop grid.

## 4. Mobile Screen Catalogue

Identifiers use `MOB-003-S<NN>` for stability. Every screen has a parity anchor in WEB-003.

| ID | Screen | Kind | WEB Parity | Source Sprint |
| --- | --- | --- | --- | --- |
| MOB-003-S01 | Sales Dashboard | Dashboard | WEB-003-S01 | SPR-MOD-003-006 |
| MOB-003-S02 | Quotations — List | List | WEB-003-S02 | SPR-MOD-003-002 |
| MOB-003-S03 | Quotation — Detail | Detail (voucher) | WEB-003-S03 | SPR-MOD-003-002 |
| MOB-003-S04 | Sales Orders — List | List | WEB-003-S04 | SPR-MOD-003-002 |
| MOB-003-S05 | Sales Order — Detail | Detail (voucher) | WEB-003-S05 | SPR-MOD-003-002 |
| MOB-003-S06 | Sales Order Amendment | Detail (voucher amendment) | WEB-003-S06 | SPR-MOD-003-002 |
| MOB-003-S07 | Deliveries — List | List | WEB-003-S07 | SPR-MOD-003-003 |
| MOB-003-S08 | Delivery Order — Detail | Detail (voucher) | WEB-003-S08 | SPR-MOD-003-003 |
| MOB-003-S09 | Pick / Pack Worksheet | Worksheet | WEB-003-S09 | SPR-MOD-003-003 |
| MOB-003-S10 | Delivery Completion | Confirmation | WEB-003-S10 | SPR-MOD-003-003 |
| MOB-003-S11 | Sales Invoices — List | List | WEB-003-S11 | SPR-MOD-003-004 |
| MOB-003-S12 | Sales Invoice — Detail | Detail (voucher) | WEB-003-S12 | SPR-MOD-003-004 |
| MOB-003-S13 | Credit Notes — List | List | WEB-003-S13 | SPR-MOD-003-004 |
| MOB-003-S14 | Credit Note — Detail | Detail (voucher) | WEB-003-S14 | SPR-MOD-003-004 |
| MOB-003-S15 | Debit Notes — List | List | WEB-003-S15 | SPR-MOD-003-004 |
| MOB-003-S16 | Debit Note — Detail | Detail (voucher) | WEB-003-S16 | SPR-MOD-003-004 |
| MOB-003-S17 | Return Requests — List | List | WEB-003-S17 | SPR-MOD-003-005 |
| MOB-003-S18 | Return Request — Detail | Detail (voucher) | WEB-003-S18 | SPR-MOD-003-005 |
| MOB-003-S19 | Return Receipt Confirmation | Confirmation | WEB-003-S19 | SPR-MOD-003-005 |
| MOB-003-S20 | Customer Adjustments — List | List | WEB-003-S20 | SPR-MOD-003-005 |
| MOB-003-S21 | Customer Adjustment — Detail | Detail | WEB-003-S21 | SPR-MOD-003-005 |
| MOB-003-S22 | Customers — List | Master list | WEB-003-S22 | SPR-MOD-003-001 |
| MOB-003-S23 | Customer — Detail | Master detail | WEB-003-S23 | SPR-MOD-003-001 |
| MOB-003-S24 | Customer Hierarchy | Tree master | WEB-003-S24 | SPR-MOD-003-001 |
| MOB-003-S25 | Sales Organization | Master | WEB-003-S25 | SPR-MOD-003-001 |
| MOB-003-S26 | Territories | Master | WEB-003-S26 | SPR-MOD-003-001 |
| MOB-003-S27 | Salespersons | Master | WEB-003-S27 | SPR-MOD-003-001 |
| MOB-003-S28 | Price Lists | Master (read-mostly) | WEB-003-S28 | SPR-MOD-003-002 |
| MOB-003-S29 | Discount Schemes | Master (read-mostly) | WEB-003-S29 | SPR-MOD-003-002 |
| MOB-003-S30 | Sales Reports | Report catalog | WEB-003-S30 | SPR-MOD-003-006 |
| MOB-003-S31 | Sales Settings | Configuration (read-mostly) | WEB-003-S31 | SPR-MOD-003-001 |
| MOB-003-S32 | Pending Approvals | Inbox | — (cross-cutting) | SPR-MOD-003-002 – 005 |
| MOB-003-S33 | Offline Queue | System | — (cross-cutting) | SPR-MOD-003-002 – 005 |
| MOB-003-S34 | Sync Status | System | — (cross-cutting) | SPR-MOD-003-002 – 005 |

No implementation details (component libraries, framework choices, native SDKs) are declared here.

## 5. Screen Specifications

For each screen: **Purpose · Entry · Exit · Touch Interactions · Displayed Information · Navigation · Permissions · Responsive Behavior**. Permission tokens reference `ENG-002 / ENG-003` per ADR-032; no new grants are introduced.

### 5.1 MOB-003-S01 — Sales Dashboard

- **Purpose.** Read-only operational overview per Publication §4.6.
- **Entry.** Authenticated Sales role; tenant selected.
- **Exit.** Drill-through to a linked list, or workspace change.
- **Touch Interactions.** Tap KPI tile → drill; long-press tile → filter sheet; pull-to-refresh.
- **Displayed Information.** KPI tiles (open quotations, order book, undelivered orders, unbilled deliveries, open returns), condensed pipeline chart, approval backlog. All values are read-model projections; no mutation.
- **Navigation.** Portfolio KPIs redirect to MOD-017; predictive prompts redirect to MOD-018.
- **Permissions.** `sales.dashboard.read`.
- **Responsive.** Single-column phone; two-column tablet.

### 5.2 MOB-003-S02 — Quotations List

- **Purpose.** Discover and manage quotations (Publication §8).
- **Entry.** `sales.quotation.read`.
- **Exit.** Open detail (S03) or return to workspace.
- **Touch Interactions.** Tap row → detail; swipe-left → context actions (share, cancel where permitted); swipe-right → mark as favorite; FAB → new quotation sheet.
- **Displayed Information.** Number, customer, currency, value, status, salesperson, validity, workflow state.
- **Navigation.** Detail (S03); customer chip → S23.
- **Permissions.** `sales.quotation.read` (view), `sales.quotation.create` (FAB).
- **Responsive.** Compact card list on phone; two-column list on tablet.

### 5.3 MOB-003-S03 — Quotation Detail

- **Purpose.** Author, review, submit for approval, revise, issue, or cancel a quotation.
- **Entry.** From S02 or deep link; `sales.quotation.read` minimum.
- **Exit.** Save draft (foreground or backgrounded), submit, cancel, or convert to Sales Order (initiates S05 via bottom sheet).
- **Touch Interactions.** Edit header via section sheet (progressive disclosure); stacked-line editor with per-line "…" menu; primary actions on bottom action bar; approval banner tap → approval sheet.
- **Displayed Information.** Header (customer, currency, validity, salesperson, territory), lines (item, qty, unit price, discount, tax indicator, line total), totals, attachments, activity timeline, approval banner.
- **Navigation.** Customer/item lookups (bottom-sheet pickers); convert-to-order → S05.
- **Permissions.** `sales.quotation.read | create | edit | approve | issue | cancel`.
- **Responsive.** Sections collapse on phone; side-by-side header+lines on tablet landscape.

### 5.4 MOB-003-S04 / S05 — Sales Orders

- **Purpose.** Sales Order lifecycle end-to-end (Publication §4.2).
- **Entry.** From S02 (Convert to Order), from S04 (FAB), or deep link.
- **Exit.** Confirm, cancel, amend (S06), or hand off to Deliveries (S08).
- **Touch Interactions.** Same as S03; credit-status banner tap → detail sheet; approval banner drives approval sheet.
- **Displayed Information.** Header, lines, pricing breakdown, credit status banner, approval banner, related quotation, related deliveries and invoices.
- **Navigation.** Bidirectional to source Quotation, child Deliveries, and Invoices via chip stack.
- **Permissions.** `sales.order.read | create | edit | approve-credit | confirm | amend | cancel`.

### 5.5 MOB-003-S06 — Sales Order Amendment

- **Purpose.** Governed amendment of a confirmed sales order.
- **Entry.** From S05 with `sales.order.amend`; workflow permits (delegated to `ENG-010`).
- **Exit.** Submit for approval or discard.
- **Touch Interactions.** Diff-first stacked view; per-line "change" sheet; reason capture is mandatory.
- **Displayed Information.** Original vs proposed values, reason, approver, audit trail.
- **Permissions.** `sales.order.amend`, `sales.order.approve-amendment`.

### 5.6 MOB-003-S07 / S08 / S09 / S10 — Deliveries

- **Purpose.** Delivery lifecycle (Publication §4.3).
- **Entry.** From confirmed Sales Order (S05) or S07.
- **Exit.** Delivery Completion (S10) emits `DeliveryCompleted` (commercial event — no accounting/ledger movement; surfaced as a boundary banner on S10).
- **Touch Interactions.** Pick/Pack worksheet supports barcode/QR scan (functional expectation only; framework/SDK unspecified); tap-to-tick line items; long-press line → adjust quantity sheet; capture signature and photo on S10.
- **Displayed Information.** Sales-order reference, items with reservation status (read-only from `MOD-005`), pick/pack progress, shipment-readiness state, completion capture (delivery date, receiver, notes, signature, photo).
- **Navigation.** Inventory reservation drill-through opens MOD-005 in read-only; breadcrumb returns to Sales.
- **Permissions.** `sales.delivery.read | create | pickpack | complete`.
- **Offline.** S09 pick/pack ticks and S10 completion capture are offline-capable per ADR-083; queued for sync.

### 5.7 MOB-003-S11 / S12 — Sales Invoices

- **Purpose.** Commercial invoice lifecycle (Publication §4.4).
- **Entry.** From S05, S08, or S11.
- **Exit.** Issue (emits `SalesInvoiceIssued`), cancel, or amend (creates Credit/Debit Note).
- **Touch Interactions.** Compose invoice via section sheets; tax determination (`ENG-019`) consumed read-only; issue action gated by permission; accounting handoff status conveyed as a read-only banner.
- **Displayed Information.** Header, lines with taxes, totals, related order/delivery, accounting handoff banner, payment status (read-model from MOD-002).
- **Boundary Conveyance.** Ledger-level actions are never offered on mobile.
- **Permissions.** `sales.invoice.read | create | approve | issue | cancel`.

### 5.8 MOB-003-S13 – S16 — Credit / Debit Notes

- **Purpose.** Credit and debit note lifecycle (Publication §4.4).
- **Touch Interactions.** Source invoice or return selected via bottom-sheet picker; approval flow identical to invoice.
- **Displayed Information.** Header, lines, source reference, accounting handoff status.
- **Permissions.** `sales.creditnote.* | sales.debitnote.*` per token pattern.

### 5.9 MOB-003-S17 – S21 — Returns & Customer Adjustments

- **Purpose.** Return and adjustment lifecycle (Publication §4.5).
- **Entry.** From S12 (Return from Invoice) or S17 (FAB).
- **Exit.** Return Receipt Confirmation (S19); Customer Adjustment (S21); Credit Note handoff (S14).
- **Touch Interactions.** Eligible-line picker sheet; receipt confirmation captures photo/notes; adjustment type selected via segmented sheet.
- **Displayed Information.** Reference invoice, eligible lines with remaining returnable qty, receipt confirmation, adjustment type, refund preparation status.
- **Permissions.** `sales.return.read | create | approve | receive | adjust`.

### 5.10 MOB-003-S22 / S23 / S24 — Customers

- **Purpose.** Customer master authority (Publication §4.1).
- **Touch Interactions.** Search bar with typeahead; tap chip to filter; long-press → context sheet (archive, share); tree view (S24) uses expand/collapse and swipe-to-scroll horizontally.
- **Boundary Conveyance.** CRM opportunities open MOD-006 read-only.
- **Permissions.** `sales.customer.read | create | edit | archive`.

### 5.11 MOB-003-S25 – S27 — Sales Organization / Territories / Salespersons

- **Purpose.** Sales-organization masters (Publication §7).
- **Touch Interactions.** Master-form sheets; drag-to-reorder disabled where governance forbids reordering.
- **Permissions.** `sales.org.read | edit`, `sales.territory.read | edit`, `sales.salesperson.read | edit`.

### 5.12 MOB-003-S28 / S29 — Pricing & Discounts

- **Purpose.** Read-mostly on mobile. Authoring is web-primary; mobile authoring is optional and permission-gated.
- **Touch Interactions.** Simulation sheet reflects backend evaluation; no local rule.
- **Permissions.** `sales.pricing.read | edit`.

### 5.13 MOB-003-S30 — Sales Reports

- **Purpose.** Operational report catalog (Publication §4.6).
- **Touch Interactions.** Report list, parameter sheet, run, export request via `ENG-027`; results delivered to Notifications when generation is asynchronous.
- **Boundary Conveyance.** Portfolio KPIs redirect to MOD-017.
- **Permissions.** `sales.report.read | export`.

### 5.14 MOB-003-S31 — Sales Settings

- **Purpose.** Read-mostly. Sales-owned configuration and numbering series (`ENG-017`) view; edit is permission-gated and optional on mobile.
- **Permissions.** `sales.settings.read | edit`.

### 5.15 MOB-003-S32 — Pending Approvals

- **Purpose.** Consolidated approvals inbox scoped to Sales artifacts routed via `ENG-011`.
- **Touch Interactions.** Swipe-right → approve; swipe-left → reject (with mandatory reason sheet); tap → detail.
- **Permissions.** Enforced per artifact.

### 5.16 MOB-003-S33 — Offline Queue

- **Purpose.** Visibility of queued mutations captured while offline.
- **Touch Interactions.** Inspect queued item; retry (system-driven); discard (permission-gated).
- **Permissions.** `sales.offline.queue.read | manage`.

### 5.17 MOB-003-S34 — Sync Status

- **Purpose.** Visibility of last successful sync, in-progress sync, and conflicts.
- **Touch Interactions.** Manual sync; open conflict resolution sheet (server verdict authoritative).

## 6. Mobile User Journeys

Each journey enumerates screen transitions and workflow states. Transition legality is enforced by `ENG-010` and `ENG-011`. Every journey has a parity anchor in WEB-003 §6.

### 6.1 Quote → Order (parity: WEB-003 §6.1)

```text
S02 → S03 (Draft → Submitted → Approved → Issued)
   → Convert to Order sheet → S05 (Draft → Confirmed)
```

### 6.2 Order → Delivery (parity: WEB-003 §6.2)

```text
S05 (Confirmed) → S07 → S08 (Draft) → S09 (Picked → Packed → Shipment-Ready) → S10 (Completed)
```

### 6.3 Delivery → Invoice (parity: WEB-003 §6.3)

```text
S08 (Completed) → S11 → S12 (Draft → Submitted → Approved → Issued)
   → Accounting handoff banner reflects VoucherPosted (read-only)
```

### 6.4 Invoice → Return (parity: WEB-003 §6.4)

```text
S12 (Issued) → S17 → S18 (Draft → Submitted → Approved)
   → S19 (Receipt Confirmed) → S21 (Adjustment Prepared)
   → S14 (Credit Note Draft → Approved → Issued)
```

### 6.5 Draft → Approval (cross-cutting; parity: WEB-003 §6.5)

Any voucher transitions via the mobile approval banner and S32 inbox: `Draft → Submitted → Approved | Rejected → Issued/Confirmed | Returned to Draft`. Approval routing is `ENG-011`-owned.

### 6.6 Cancel / Reject / Reopen (parity: WEB-003 §6.6 – §6.7)

Behavior matches WEB-003 with identical governance gates; on mobile the actions are surfaced via context sheets and confirmation sheets rather than modal dialogs.

### 6.7 Offline Capture & Sync

```text
S03 / S05 / S09 / S10 / S18 / S19  (offline-capable per ADR-083)
   → drafts persist locally
   → mutations queued in S33
   → connectivity restored → automatic sync → S34 reflects status
   → server verdict authoritative; conflicts surfaced via S34 conflict sheet
```

### 6.8 Sync Recovery

```text
S34 → conflict list → per-conflict sheet
   → user chooses server-wins | discard-local | escalate (where permission allows)
   → resolution recorded in Activity Timeline (ENG-004)
```

### 6.9 Mobile–Web Functional Parity

For every mobile journey defined in this document, MOB-003 maintains **functional parity** with the corresponding workflow specified in `WEB-003 Solution Design` and the business authority established by `GT-005 Module Publication` (`MOD-003_MODULE_PUBLICATION`). Mobile adaptations optimize the user interaction model **without altering business behavior**.

**Permitted adaptations (presentation only).** Mobile MAY substitute the following interaction patterns for their desktop counterparts:

- Bottom sheets in place of desktop dialogs.
- Swipe actions for context-specific operations.
- Condensed forms using progressive disclosure.
- Floating Action Buttons (FABs) for primary actions.
- Native mobile pickers and selectors.
- Contextual action menus.
- Touch-optimized navigation patterns.
- Adaptive layouts for varying device sizes and orientations.

**Prohibited adaptations.** Mobile MUST NOT:

- introduce new business workflows;
- modify approval sequences;
- change business rules;
- alter validation logic;
- bypass permission enforcement;
- create mobile-only functional capabilities;
- remove mandatory functional steps defined in GT-005 or WEB-003.

**Invariant.** Where interaction patterns differ between Web and Mobile, the difference is **presentation-only** while preserving identical business outcomes, state transitions, traceability, and security semantics.

This principle ensures that:

- `GT-005` (`MOD-003_MODULE_PUBLICATION`) remains the **single functional authority**;
- `WEB-003` defines the **canonical web interaction model**;
- `MOB-003` defines an **equivalent mobile interaction model** with optimized mobile usability but identical business behavior.

Auditable parity: §14 traceability matrix links each Mobile Screen and Journey to its WEB-003 workflow and the underlying GT-005 requirement, making Mobile–Web parity verifiable on a per-row basis.

## 7. Mobile UI Components

Behavioral specification only; no code, styling, native SDK, or library commitments.

- **Card List.** Row cards with primary/secondary metadata; swipe-left/right for context actions; long-press for multi-select where permitted.
- **Search & Filter.** Persistent search bar; filter sheet with faceted chips; saved filter sets server-persisted.
- **Master Form (Sheet).** Section-by-section progressive disclosure; inline validation; dirty-state guard on back gesture; autosave for drafts where declared.
- **Stacked-line Voucher Editor.** Line cards with per-line "…" action menu; add/remove/reorder; totals bar pinned to the bottom.
- **Bottom Sheets.** Replace desktop dialogs for lookups, confirmations, and quick-view.
- **Confirmation Sheets.** Destructive actions require an explicit confirmation sheet with a summary line.
- **Lookup Pickers.** Server-backed bottom-sheet pickers for customer, item, salesperson, territory, price list; recent and starred sections.
- **Action Bar (bottom).** Contextual actions per workflow state, permission-filtered before render.
- **Approval Banner.** Surfaces the current `ENG-011` state, approver, elapsed time, and next action; tap opens approval sheet; read-only when the current user is not an approver.
- **Attachments.** Consumes `ENG-008`; supports capture-from-camera, gallery upload, download, preview, remove (permission-gated); virus-scan status conveyed.
- **Activity Timeline.** Read-only projection of `ENG-004` audit + workflow + notification events.
- **Barcode / QR Scan.** Functional expectation for delivery pick/pack and return receipt only; framework/SDK unspecified.
- **FAB.** Primary create action per list surface.

## 8. Offline & Synchronization Model

- **Offline-Capable Activities.** Only those authorized by ADR-083 opted-in field flows: quotation and sales-order draft capture (S03, S05), pick/pack ticks (S09), delivery completion capture (S10), return authoring and receipt (S18, S19), and read-only viewing of cached artifacts.
- **Queued Operations.** Displayed in S33; each queued item shows artifact type, target action, capture time, and last retry outcome.
- **Sync Expectations.** Automatic on connectivity restoration; user-initiated retry via S34; server verdict is authoritative.
- **Conflict Handling.** Server-wins by default. Where the user has authority to overwrite, the conflict sheet offers `server-wins | discard-local | escalate` with mandatory reason capture; resolution is written to the Activity Timeline.
- **Retry.** Exponential backoff with a visible next-retry indicator; permanent failures surfaced via Notifications.
- **Connectivity Indicator.** Global chip visible whenever offline capture is active.
- **Not Offline-Capable.** Approvals, invoice issuance, credit/debit note issuance, master data mutation on Pricing/Discounts/Settings, and any action that requires deterministic engine evaluation (`ENG-011 / 012 / 019`) at commit time.

## 9. Mobile Validation

Client-side validation provides immediate feedback and prevents obviously-invalid submissions. Authoritative enforcement remains backend-owned.

- **Field.** Mandatory, format (dates, currencies, numbers, tax identifiers) — routed through `ENG-006` locale rules.
- **Workflow Gating.** Actions available only in permitted workflow states; unreachable actions are hidden, not disabled.
- **Permission Gating.** Actions hidden when the user lacks the corresponding permission; server re-authorizes on submit.
- **Duplicate Prevention.** Client debounces submit and dedupes queued mutations by idempotency key; server-side idempotency is authoritative.
- **Deferred Validation.** For offline-captured drafts, backend validation runs on sync; failures surface in S34 with a resolvable-error sheet.
- **Business-Rule Delegation.** Pricing, discount evaluation, credit-limit checks, tax determination, workflow legality, return eligibility, and receivable state are backend-authoritative; mobile displays the backend verdict.

## 10. Error Handling

- **Connectivity Failures.** Offline-eligible actions are queued to S33; non-eligible actions surface a "requires connection" sheet.
- **Sync Failures.** Surfaced in S34 with correlation ID and retry.
- **Authorization Failures (401 / 403).** Non-technical "You don't have access" sheet with required permission token and "request access" affordance.
- **Validation Failures.** Inline field errors + form-level summary; submit disabled until resolved.
- **Concurrency Conflicts (409).** "This record changed while you were editing" sheet with diff and reload-or-overwrite (permission-gated).
- **Not Found (404).** "Not found or no longer available" sheet with return-to-list.
- **Unexpected Failures (5xx).** Generic failure sheet with correlation ID and retry.
- **Boundary Handoff Failures.** Accounting / Inventory / CRM handoff failures surface on the source Sales artifact banner; downstream implementation details are not exposed.

## 11. Roles & Permissions

Business-level role tokens (authoritative enforcement via `ENG-002` + `ENG-003` per ADR-032). Identical role set to WEB-003 §11 — no mobile-only roles.

| Role | Mobile Scope |
| --- | --- |
| Sales Executive | Own quotations, orders, invoices for assigned customers/territory; own dashboards. |
| Sales Manager | Read/act on team artifacts; approve within delegated thresholds; management reports. |
| Order Desk | Create/edit quotations and orders; initiate delivery hand-off. |
| Delivery Coordinator | Manage deliveries (create, pick/pack, complete) — offline-capable per §8. |
| Billing Clerk | Manage invoices, credit notes, debit notes (issue online-only). |
| Returns Clerk | Manage return requests, receipts, adjustments — offline-capable for capture. |
| Accountant (read-only from Sales) | Read invoices, credit/debit notes, receivable status. No Sales mutation. |
| Warehouse Manager (scoped) | Read Sales orders/deliveries for planning. No Sales mutation. |
| Sales Administrator | Manage Sales masters (read-mostly on mobile; edit permitted). |

Permission tokens follow the pattern `sales.<artifact>.<action>`, derived from Publication §4 and §11. No new authority is introduced.

## 12. Accessibility

- **Screen Readers.** All primitives (cards, sheets, action bar, approval banner, activity timeline) expose accessible name, role, and state.
- **Touch Target Sizing.** Minimum 44×44 CSS-px targets; primary actions positioned within thumb reach.
- **Focus Management.** Focus moves to the first invalid field on validation failure; sheets trap focus and restore it on dismissal.
- **Orientation.** Portrait-first; landscape supported for tablet flows (S09 pick/pack, S30 reports).
- **Color Independence.** Workflow, approval, and validation states conveyed by shape/label in addition to color.
- **Dynamic Text.** Respects OS text-size settings; layouts reflow.
- **Localization.** Strings, dates, numbers, currencies routed through `ENG-006`.

## 13. Cross-Module Navigation

MOB-003 surfaces cross-module handoffs while respecting Publication §13 ownership boundaries.

- **→ CRM (MOD-006).** Customer detail (S23) → CRM opportunity views (read-only).
- **→ Inventory (MOD-005).** Delivery (S08, S09) → Inventory reservation views (read-only).
- **→ Accounting (MOD-002).** Sales Invoice (S12), Credit/Debit Note (S14, S16) → Accounting voucher / receivable views (read-only).
- **→ Analytics (MOD-017).** Portfolio KPIs and cross-module dashboards → Analytics workspace.
- **→ AI Workspace (MOD-018).** Predictive prompts → AI Workspace.

No cross-module surface allows mutation of the destination module's state.

## 14. Traceability Matrix

Illustrative mapping (complete matrix generated by the Solution Design Catalog on registration). Extends WEB-003 §14 with an explicit Mobile column so that Mobile–Web parity per §6.9 is auditable on a per-row basis.

| GT-005 Requirement (Publication §) | WEB Screen(s) | WEB Workflow | Mobile Screen(s) | Mobile Journey | UI Component (§7) |
| --- | --- | --- | --- | --- | --- |
| Customer Master Authority (§4.1) | WEB-003-S22/S23/S24 | Draft → Approval | MOB-003-S22/S23/S24 | §6.5 | Master Form Sheet, Card List |
| Sales Configuration Authority (§4.1) | WEB-003-S31 | — | MOB-003-S31 | — | Master Form Sheet |
| Pricing / Discount Masters (§4.2) | WEB-003-S28/S29 | Draft → Approval | MOB-003-S28/S29 | §6.5 | Master Form Sheet |
| Quotation Authority (§4.2) | WEB-003-S02/S03 | §6.1 | MOB-003-S02/S03 | §6.1 | Stacked-line Editor, Approval Banner, FAB |
| Sales Order Authority (§4.2) | WEB-003-S04/S05/S06 | §6.2 | MOB-003-S04/S05/S06 | §6.2 | Stacked-line Editor, Approval Banner |
| Delivery Authority (§4.3) | WEB-003-S07/S08/S09/S10 | §6.2 | MOB-003-S07/S08/S09/S10 | §6.2, §6.7 | Worksheet, Barcode/QR, Attachments |
| Sales Invoice Authority (§4.4) | WEB-003-S11/S12 | §6.3 | MOB-003-S11/S12 | §6.3 | Stacked-line Editor, Approval Banner |
| Credit / Debit Note Authority (§4.4) | WEB-003-S13/S14/S15/S16 | §6.3, §6.4 | MOB-003-S13/S14/S15/S16 | §6.3, §6.4 | Stacked-line Editor |
| Return Authority (§4.5) | WEB-003-S17/S18/S19 | §6.4 | MOB-003-S17/S18/S19 | §6.4, §6.7 | Stacked-line Editor, Attachments |
| Customer Adjustment Authority (§4.5) | WEB-003-S20/S21 | §6.4 | MOB-003-S20/S21 | §6.4 | Master Form Sheet |
| Sales Analytics Authority (§4.6) | WEB-003-S01/S30 | — | MOB-003-S01/S30 | — | Dashboard, Card List |
| Cross-cutting Events (§9) | WEB-003-S03/S05/S10/S12/S14/S19 | §6.1 – §6.4 | MOB-003-S03/S05/S10/S12/S14/S19 | §6.1 – §6.4 | Approval Banner, Activity Timeline |
| Cross-cutting Approvals (`ENG-011`) | — | §6.5 | MOB-003-S32 | §6.5 | Approval Banner, Inbox |
| Cross-cutting Offline (ADR-083) | — | — | MOB-003-S33/S34 | §6.7, §6.8 | Sync Status, Offline Queue |

## 15. Design Constraints

- **No backend architecture.** No server topology, runtime, or deployment content is authored here.
- **No API contracts.** Request/response shapes, endpoint URIs, authentication schemes, and error envelopes are owned by API-003 (out of scope).
- **No database schema.** Out of scope.
- **No implementation.** No source code, framework selection, native SDK, styling system, or component library is prescribed.
- **No governance evolution.** No new authorities, engines, ADRs, events, or ownership boundaries are introduced.
- **No web design modification.** WEB-003 is referenced, not modified.
- **No modification of MOD-001 or MOD-002 artifacts.**

## 16. References

- `docs/45-module-publications/sales/MOD-003_MODULE_PUBLICATION.md`
- `docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`
- `docs/20-module-prds/sales/MODULE_PRD.md`
- `docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md`
- `docs/46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN.md` (parity reference)
- `docs/60-solution-design/mobile/MOB-002_ACCOUNTING.md` (reference structure)
- `docs/60-solution-design/README.md`
- `docs/12-ui-components/`
- `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`
- `docs/15-governance/FINDING_SEVERITY_STANDARD.md`
- `docs/15-governance/SCREEN_IDENTIFIER_STANDARD.md`
- `docs/11-adrs/ADR_INDEX.md` (ADR-083 offline field flows)
- `docs/10-erp-core/ENGINE_CATALOG.md`

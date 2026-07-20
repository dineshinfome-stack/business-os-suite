---
title: "WEB-015 — POS Web Solution Design"
summary: "Web Solution Design for MOD-015 POS. Derives all screens, forms, rules, and behaviors exclusively from MOD-015 Module Publication. Introduces no new capabilities."
spec_id: "WEB-015_SOLUTION_DESIGN"
module_id: "MOD-015"
module_name: "POS"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Revenue"
source_publication: "docs/45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/pos/MODULE_PRD.md", "docs/40-module-baselines/MOD015_POS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-015", "pos", "WEB-015"]
document_type: "Web Solution Design"
---

# WEB-015 — POS Web Solution Design

> **Source of Truth:** [`MOD-015 Module Publication`](../../../45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-015 POS for Cashiers, Store Managers, Accountants, Inventory Controllers, and Auditors on desktop, laptop, and tablet browsers: maintain Store / Counter / Offer / Loyalty Program masters and POS Configuration; compose Carts and complete POS Sales with multi-tender payments and receipts; capture Offers and Loyalty / gift-card redemption; process POS Returns; capture Cash Deposits; execute Day Close; and observe the POS operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Store, Counter, Offer, Loyalty Program).
- Web UI for every transaction in Publication §8 (POS Sale, POS Return, Cash Deposit, Day Close).
- Cart composition, pricing and discount evaluation, and supervisor-override capture (Publication §4.2, §6).
- Multi-tender payment capture, payment terminal integration, receipts, and reprints (Publication §4.3).
- Offer activation from consumed `OfferPublished`, Loyalty Program authoring, and gift-card issue/redeem (Publication §4.4, §10).
- Cash Deposit and Day Close with mismatched-cash approval (Publication §4.5, §6).
- POS Configuration surfaces authorized by Publication §3 (denominations, rounding, discount limits per role, offline mode policy, numbering series for POS documents).
- POS operational reports enumerated in Publication §3 (Day Sales, Cashier Report, Offer Impact, Returns Report), dashboards, exports, and audit-readiness surface (Publication §4.5).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** omni-channel receipts, AI upsell prompts, cross-module KPI authoring, ledger effects of POS transactions, and deferred Event Catalog items. Coverage includes only screens, workflows, and business capabilities defined in the Publication.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **POS Home** — landing dashboard (Publication §3, §4.5).
- **Counter** — active-shift cart workspace (Publication §4.2, §4.3, §4.4).
- **Stores & Counters** — Store / Counter master workspace and hierarchy (Publication §7, §4.1).
- **Offers & Loyalty** — Offer master, Loyalty Program master, and gift-card surface (Publication §7, §4.4).
- **POS Sales** — POS Sale transaction workspace (Publication §8, §4.2, §4.3).
- **POS Returns** — POS Return transaction workspace (Publication §8, §4.4).
- **Cash Deposits** — Cash Deposit transaction workspace (Publication §8, §4.5).
- **Day Close** — Day Close transaction workspace (Publication §8, §4.5).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.5.
- **POS Configuration** — denominations, rounding, discount limits per role, offline mode policy, numbering series (Publication §3, §4.1, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Store detail (Overview, Counters, Configuration, History), Counter detail (Overview, Shifts, Cash, History), POS Sale detail (Cart, Payments, Receipt, Approvals, History), and Day Close detail (Overview, Cash Reconciliation, Approvals, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Store | Store list, hierarchy, detail, create, edit |
| §7 Counter | Counter list, detail, create, edit; counter–store hierarchy |
| §7 Offer | Offer list, detail, create, edit; activation from consumed `OfferPublished` (§10) |
| §7 Loyalty Program | Loyalty Program list, detail, create, edit; gift-card issue/redeem |
| §8 POS Sale / §4.2, §4.3 | Cart composition; pricing/discount; supervisor override (§6); multi-tender payments; receipt; emits `POSSaleCompleted` (§9) |
| §8 POS Return / §4.4 | POS Return lifecycle; return-window rule (§6); emits `POSReturnProcessed` (§9) |
| §8 Cash Deposit / §4.5 | Cash Deposit capture |
| §8 Day Close / §4.5 | Day Close lifecycle; mismatched-cash approval (§6); emits `POSDayClosed` (§9) |
| §3 / §4.5 Reports | Day Sales, Cashier Report, Offer Impact, Returns Report |
| §3 POS Configuration | Denominations, rounding, discount limits, offline mode policy, numbering |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Cashier (primary)
- Store Manager (primary; supervisor for override + Day Close approval)
- Accountant (secondary)
- Inventory Controller (secondary)
- Customer (external actor; scoped receipt interactions where authorized)
- Payment Terminal (external actor; integration via `ENG-023` per §4.3)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | POS Home / Landing Dashboard | §3, §4.5 | Read-only |
| 2 | Counter Workspace — Active Cart | §4.2, §4.3, §4.4 | Cashier default surface |
| 3 | Counter Workspace — Shift Open | §7 Counter, §4.5 | Opening float |
| 4 | Counter Workspace — Shift Close | §4.5 | Precedes Day Close |
| 5 | Stores — List | §7 Store | |
| 6 | Store Hierarchy Tree | §7 Store, §4.1 | Counter–store hierarchy |
| 7 | Store Detail — Overview | §7 Store | |
| 8 | Store Detail — Counters | §7 Counter | |
| 9 | Store Detail — Configuration | §3, §4.1 | |
| 10 | Store Detail — History | §11 ENG-004 | |
| 11 | Store Create / Edit | §7 Store | |
| 12 | Counters — List | §7 Counter | |
| 13 | Counter Detail — Overview | §7 Counter | |
| 14 | Counter Detail — Shifts | §7 Counter, §4.5 | Read-only rollup |
| 15 | Counter Detail — Cash | §8 Cash Deposit + Day Close | Read-only rollup |
| 16 | Counter Detail — History | §11 ENG-004 | |
| 17 | Counter Create / Edit | §7 Counter | |
| 18 | Offers — List | §7 Offer | |
| 19 | Offer Detail | §7 Offer | Activation from consumed `OfferPublished` (§10) |
| 20 | Offer Create / Edit | §7 Offer | Via ENG-010/011 |
| 21 | Loyalty Programs — List | §7 Loyalty Program | |
| 22 | Loyalty Program Detail | §7 Loyalty Program | |
| 23 | Loyalty Program Create / Edit | §7 Loyalty Program | Via ENG-010/011 |
| 24 | Gift Cards Workspace | §4.4 | Issue / redeem within offers/loyalty |
| 25 | POS Sales — List | §8 POS Sale | |
| 26 | POS Sale Detail — Cart | §8, §4.2 | |
| 27 | POS Sale Detail — Payments | §8, §4.3 | Multi-tender |
| 28 | POS Sale Detail — Receipt | §4.3 | Reprint action |
| 29 | POS Sale Detail — Approvals | §11 ENG-010/011 | Supervisor override (§6) |
| 30 | POS Sale Detail — History | §11 ENG-004 | |
| 31 | POS Sale Create / Add Line | §8, §4.2 | Cart composition |
| 32 | POS Sale Apply Discount | §4.2, §6 | Beyond-threshold requires supervisor approval (§6) |
| 33 | POS Sale Apply Offer | §4.4, §10 | Activation from `OfferPublished` |
| 34 | POS Sale Apply Loyalty / Gift Card | §4.4 | |
| 35 | POS Sale Capture Payment (Cash) | §4.3 | |
| 36 | POS Sale Capture Payment (Card) | §4.3 | Via payment terminal (`ENG-023`) |
| 37 | POS Sale Capture Payment (Digital) | §4.3 | Via payment terminal (`ENG-023`) |
| 38 | POS Sale Capture Payment (Mixed / Split) | §4.3 | |
| 39 | POS Sale Complete Action | §8, §4.2, §4.3 | Emits `POSSaleCompleted` (§9) |
| 40 | POS Sale Reprint Receipt Action | §4.3 | Audited via ENG-004 (§11) |
| 41 | POS Sale Offline Capture | §4.2 | Deferred; reconciled on reconnect |
| 42 | POS Sale Offline Reconciliation Workspace | §4.2 | Deterministic reconciliation |
| 43 | POS Returns — List | §8 POS Return | |
| 44 | POS Return Detail — Overview | §8, §4.4 | |
| 45 | POS Return Create (reference original Sale) | §8, §4.4, §6 | Return-Window Rule enforced (§6) |
| 46 | POS Return Approve Action | §11 ENG-011 | |
| 47 | POS Return Complete Action | §8, §4.4 | Emits `POSReturnProcessed` (§9) |
| 48 | POS Return Detail — History | §11 ENG-004 | |
| 49 | Cash Deposits — List | §8 Cash Deposit | |
| 50 | Cash Deposit Detail | §8, §4.5 | |
| 51 | Cash Deposit Create | §8, §4.5 | |
| 52 | Cash Deposit Approve Action | §11 ENG-011 | |
| 53 | Day Close — List | §8 Day Close | |
| 54 | Day Close Detail — Overview | §8, §4.5 | |
| 55 | Day Close Detail — Cash Reconciliation | §4.5, §6 | Mismatched-Cash Approval Rule (§6) |
| 56 | Day Close Detail — Approvals | §11 ENG-011 | Mismatched cash → supervisor |
| 57 | Day Close Detail — History | §11 ENG-004 | |
| 58 | Day Close Start Action | §8, §4.5 | |
| 59 | Day Close Submit Action | §8, §4.5 | Mismatch triggers approval (§6) |
| 60 | Day Close Post Action | §8, §4.5 | Emits `POSDayClosed` (§9) |
| 61 | Reports — Day Sales | §3, §4.5 | |
| 62 | Reports — Cashier Report | §3, §4.5 | |
| 63 | Reports — Offer Impact | §3, §4.5 | |
| 64 | Reports — Returns Report | §3, §4.5 | |
| 65 | Inventory Low-Stock Alerts | §4.5, §10 | Read from consumed `InventoryLowStock` (§10) |
| 66 | Audit-Readiness Surface | §4.5 | Read-only over prior-sprint events |
| 67 | Configuration — Numbering Series | §3, §11 ENG-017 | |
| 68 | Configuration — Denominations | §3, §4.1 | |
| 69 | Configuration — Rounding | §3, §4.1 | |
| 70 | Configuration — Discount Limits per Role | §3, §4.1, §6 | |
| 71 | Configuration — Offline Mode Policy | §3, §4.1, §4.2 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard or tree), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Offer, Loyalty Program, POS Return, Cash Deposit, Day Close, and supervisor-override on POS Sale discount) are driven by ENG-010 / ENG-011 (Publication §11).
- Cart composition and discount evaluation run deterministically via ENG-012; tax evaluation via ENG-019; currency via ENG-018 (Publication §4.2, §11).
- Beyond-threshold discounts block sale completion until supervisor approval is captured (Publication §6).
- Multi-tender payments (cash, card, digital, mixed) capture via payment-terminal integration through ENG-023 (Publication §4.3).
- POS Sale Complete emits `POSSaleCompleted` (Publication §9); ledger effects produced by MOD-002 (Publication §13).
- POS Return Create requires reference to a valid POS Sale within the configured return window (Publication §6); Complete emits `POSReturnProcessed` (Publication §9).
- Day Close Submit compares physical vs. expected cash; mismatch (beyond configured tolerance from ENG-005) requires supervisor approval via ENG-011 (Publication §6); Post emits `POSDayClosed` (Publication §9).
- Receipts are generated via ENG-007; reprints preserve identity and are audited via ENG-004; notifications via ENG-025 (Publication §4.3).
- Offline sale capture is available on tablet browsers under the configured offline mode policy; sales reconcile deterministically on reconnect (Publication §4.2).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, hierarchy tree, approval-timeline, cart-line item, tender-capture card, receipt-preview panel, offer-badge, loyalty-badge, gift-card field, cash-denomination grid, cash-reconciliation panel, offline-status indicator, discount-override banner, sale-status badge, return-status badge, day-close-status badge, attachment tile. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-007 (Publication §11) on Store (documents), Offer (documents), POS Sale (receipt artifacts), POS Return (proof), and Day Close (deposit slips).
- Numbering series bindings via ENG-017 (Publication §11) on POS Sale, POS Return, Cash Deposit, and Day Close.
- Localization via ENG-006 (Publication §11).

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Counter → Store; POS Sale → Store + Counter + Items; POS Return → original POS Sale; Cash Deposit → Counter; Day Close → Counter + open Cash Deposits + POS Sales/Returns of the day).
- Uniqueness for POS Sale, POS Return, Cash Deposit, and Day Close numbers per ENG-017 numbering series (Publication §3, §11).
- Supervisor-Override Rule: POS Sale complete rejected when any applied discount exceeds the role-configured threshold without a captured supervisor approval (Publication §6).
- Return-Window Rule: POS Return create rejected when the referenced POS Sale is outside the configured return window (Publication §6).
- Mismatched-Cash Approval Rule: Day Close post rejected when physical cash mismatches expected beyond tolerance without a captured supervisor approval (Publication §6).
- Tender totals: sum of tenders must equal POS Sale total (net of rounding per ENG-005) (Publication §4.3).
- Consumed events (`OfferPublished`, `InventoryLowStock`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- A POS day cannot be closed with mismatched cash without approval.
- Discounts beyond a threshold require supervisor override.
- Returns must reference a valid POS Sale within the return window.
- POS master and transaction lifecycles are POS-owned; UI never permits mutation of externally-owned data.
- POS consumes `OfferPublished` and `InventoryLowStock` read-only.
- POS never renders or performs ledger posting; posting is owned by MOD-002 (Publication §11, §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Store code, Counter code, Offer code, Loyalty Program code, POS Sale number, POS Return number, Cash Deposit number, Day Close number). Item lookups on the cart consume MOD-005 Inventory read-only (Publication §12, §13).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (store, counter, cashier, offer, loyalty program, sale state, return state, day-close state, tender type, period). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs from the POS Analytics & Compliance surface (§4.5). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 (Day Sales, Cashier Report, Offer Impact, Returns Report) are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events), receipt-notification triggers (§4.3), and Inventory low-stock alerts consumed from `InventoryLowStock` (§10). The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-015). Payment-terminal errors surface with actionable retry paths bounded by ENG-023 (Publication §4.3).

## 21. Loading States

Skeleton loaders for lists, hierarchy trees, and detail pages. Cart composition, payment capture, and day-close reconciliation show inline progress. Offline sale reconciliation and read-model refresh are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (sale complete, return complete, day-close post, receipt reprint).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). The Counter Workspace (§8 #2) is tablet-first for on-counter use. Mobile portrait is served by MOB-015.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and cost-sensitive fields (payment PAN, cash denominations) handled per PCI-aware redaction and never persisted client-side beyond the transaction window.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Cart line-add, discount evaluation, and payment capture target sub-second server round-trip. Offline reconciliation, read-model refresh, and scheduled report runs execute within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history. Receipt reprints, discount overrides, and mismatched-cash approvals are audited.

## 28. Acceptance Criteria & Traceability Matrix

WEB-015 is Accepted when every screen in §8 maps to a Publication anchor, every business rule in §13 restates Publication §6 verbatim, every event referenced in §19 maps exactly to Publication §9 / §10, and no screen, form, rule, report, or notification exists outside the Publication surface.

| Publication § | Anchor | WEB-015 Section |
| --- | --- | --- |
| §2 Purpose | Purpose | §1 |
| §3 Scope | Scope | §2, §4, §8 |
| §4.1 Store/Counter/Config Authorities | Authorities | §8 #5–17, §8 #67–71 |
| §4.2 Cart/Sale/Offline Authorities | Authorities | §8 #2, §8 #25–42 |
| §4.3 Payments/Receipts Authorities | Authorities | §8 #27–28, §8 #35–40 |
| §4.4 Offers/Loyalty/Returns Authorities | Authorities | §8 #18–24, §8 #33–34, §8 #43–48 |
| §4.5 Day Close/Analytics Authorities | Authorities | §8 #4, §8 #49–66 |
| §6 Business Rules | Rules | §12, §13 |
| §7 Master Data | Entities | §8 #5–24 |
| §8 Transactions | Transactions | §8 #25–60 |
| §9 Published Events | Events | §9, §19 |
| §10 Consumed Events | Events | §12, §13, §19, §8 #33, §8 #65 |
| §11 Engines | Engine consumption | §9, §11, §12, §14, §16, §18, §19, §25, §27 |
| §12 Dependencies | Cross-module | §14 (Inventory lookups), §17 (KPI ownership), §19 (low-stock) |
| §13 Boundaries | Ownership | §13, §17 |
| §15 Non-Goals | Exclusions | §2 |

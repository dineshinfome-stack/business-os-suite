---
title: "API-015 — POS API Solution Design"
summary: "API Solution Design for MOD-015 POS. Derives every endpoint, request/response model, webhook, and event exclusively from MOD-015 Module Publication."
spec_id: "API-015_SOLUTION_DESIGN"
module_id: "MOD-015"
module_name: "POS"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Revenue"
source_publication: "docs/45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/pos/MODULE_PRD.md", "docs/40-module-baselines/MOD015_POS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-015", "pos", "API-015"]
document_type: "API Solution Design"
---

# API-015 — POS API Solution Design

> **Source of Truth:** [`MOD-015 Module Publication`](../../../45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md). Every endpoint, request/response model, webhook, and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint, model, webhook, or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the POS bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-015, MOB-015, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7 (Store, Counter, Offer, Loyalty Program); lifecycle operations on transactions in Publication §8 (POS Sale, POS Return, Cash Deposit, Day Close); POS Sale endpoints emitting `POSSaleCompleted` (Publication §9) with multi-tender payment capture (§4.3); POS Return endpoints emitting `POSReturnProcessed` (Publication §9) with return-window enforcement (§6); Cash Deposit and Day Close endpoints emitting `POSDayClosed` (Publication §9) with mismatched-cash approval enforcement (§6); read APIs for POS reports and dashboards (Publication §3, §4.5); event publication per Publication §9; event consumption per Publication §10 (`OfferPublished`, `InventoryLowStock`).

**Out of scope (Publication §15):** omni-channel receipts, AI upsell prompts, cross-module KPI authoring APIs, ledger-posting APIs (owned by MOD-002), and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-015 §7). Payment-terminal integration endpoints are further constrained to the counter/store context of the caller.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/pos/<resource>`.
- Idempotent methods use `Idempotency-Key`; POS Sale Complete and Day Close Post require an `Idempotency-Key` to prevent duplicate emission of `POSSaleCompleted` / `POSDayClosed`.
- Timestamps in RFC 3339 UTC; monetary fields typed via platform primitives; currency handling via ENG-018 (Publication §11).
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints, request models, response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. Event names shall be exactly those defined in the Publication (Publication §9). No endpoint or event below is invented; each cites the authorizing Publication section.

### 6.1 Store (Publication §7 Store, §4.1)

- `GET /stores` — list / hierarchy filter
- `POST /stores` — create
- `GET /stores/{id}` — read
- `PATCH /stores/{id}` — edit
- `POST /stores/{id}:archive` — lifecycle

### 6.2 Counter (Publication §7 Counter, §4.1)

- `GET /counters`, `POST /counters`, `GET /counters/{id}`, `PATCH /counters/{id}`, `POST /counters/{id}:archive`
- `GET /stores/{id}/counters` — counter–store hierarchy read (Publication §4.1).

### 6.3 Offer (Publication §7 Offer, §4.4)

- `GET /offers`, `POST /offers`, `GET /offers/{id}`, `PATCH /offers/{id}`, `POST /offers/{id}:archive`
- Lifecycle enforced via ENG-010 / ENG-011 (Publication §11). Activation from consumed `OfferPublished` (Publication §10) is idempotent.

### 6.4 Loyalty Program (Publication §7 Loyalty Program, §4.4)

- `GET /loyalty-programs`, `POST /loyalty-programs`, `GET /loyalty-programs/{id}`, `PATCH /loyalty-programs/{id}`, `POST /loyalty-programs/{id}:archive`
- `POST /loyalty-programs/{id}/gift-cards:issue` — issue a gift card under the program (Publication §4.4).
- `POST /loyalty-programs/{id}/gift-cards:redeem` — redeem a gift card (Publication §4.4).

### 6.5 POS Sale (Publication §8 POS Sale, §4.2, §4.3)

- `GET /pos-sales`, `GET /pos-sales/{id}`
- `POST /pos-sales` — create in `draft` (cart open)
- `PATCH /pos-sales/{id}` — cart edit while `draft`
- `POST /pos-sales/{id}/lines` — add line; pricing/discount evaluated via ENG-012, tax via ENG-019, currency via ENG-018 (Publication §4.2, §11).
- `POST /pos-sales/{id}:apply-discount` — server enforces Supervisor-Override Rule via ENG-012 (Publication §6); beyond-threshold requires captured supervisor approval via ENG-011 (Publication §11).
- `POST /pos-sales/{id}:apply-offer` — activation resolved against consumed `OfferPublished` (Publication §10).
- `POST /pos-sales/{id}:apply-loyalty` — loyalty/gift-card redemption (Publication §4.4).
- `POST /pos-sales/{id}/payments` — capture a tender line (cash / card / digital); card and digital tenders route through the payment terminal integration via ENG-023 (Publication §4.3, §11).
- `POST /pos-sales/{id}:complete` — server validates tender totals equal sale total (Publication §4.3) and that any beyond-threshold discount carries approval (Publication §6); emits `POSSaleCompleted` per Publication §9.
- `POST /pos-sales/{id}/receipt:generate` — generate receipt via ENG-007 (Publication §4.3, §11).
- `POST /pos-sales/{id}/receipt:reprint` — reprint; audited via ENG-004 (Publication §4.3, §11).
- `POST /pos-sales/{id}/receipt:notify` — dispatch receipt notification via ENG-025 (Publication §4.3, §11).
- `POST /pos-sales:offline-capture` — offline sale capture per configured offline mode policy (Publication §4.2).
- `POST /pos-sales:offline-reconcile` — deterministic reconciliation on reconnect (Publication §4.2); `POSSaleCompleted` emitted server-side on reconciliation (Publication §9).

### 6.6 POS Return (Publication §8 POS Return, §4.4)

- `GET /pos-returns`, `GET /pos-returns/{id}`
- `POST /pos-returns` — create referencing the original POS Sale; server enforces Return-Window Rule via ENG-012 (Publication §6).
- `PATCH /pos-returns/{id}` — edit while `draft`.
- `POST /pos-returns/{id}:approve` — via ENG-011 (Publication §11).
- `POST /pos-returns/{id}:complete` — emits `POSReturnProcessed` per Publication §9.

### 6.7 Cash Deposit (Publication §8 Cash Deposit, §4.5)

- `GET /cash-deposits`, `GET /cash-deposits/{id}`
- `POST /cash-deposits` — create
- `PATCH /cash-deposits/{id}` — edit while `draft`
- `POST /cash-deposits/{id}:submit`, `POST /cash-deposits/{id}:approve` — via ENG-010/011 (Publication §11).

### 6.8 Day Close (Publication §8 Day Close, §4.5)

- `GET /day-closes`, `GET /day-closes/{id}`
- `POST /day-closes` — create for a counter/day
- `POST /day-closes/{id}:submit` — capture cash counts; server evaluates Mismatched-Cash Approval Rule via ENG-012 against tolerance resolved from ENG-005 (Publication §6, §11).
- `POST /day-closes/{id}:approve` — supervisor approval via ENG-011 when mismatch beyond tolerance (Publication §6, §11).
- `POST /day-closes/{id}:post` — emits `POSDayClosed` per Publication §9.

### 6.9 Reports (Publication §3, §4.5)

- `GET /reports/day-sales`
- `GET /reports/cashier`
- `GET /reports/offer-impact`
- `GET /reports/returns`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.5).
- `GET /alerts/inventory-low-stock` — read-only over consumed `InventoryLowStock` events (Publication §4.5, §10).

### 6.10 POS Configuration (Publication §3, PRD §10)

- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).
- `GET/PUT /config/denominations`
- `GET/PUT /config/rounding`
- `GET/PUT /config/discount-limits-per-role`
- `GET/PUT /config/offline-mode-policy`
- `GET/PUT /config/day-close-cash-tolerance` — tolerance for Mismatched-Cash Approval Rule resolved read-only by ENG-012 (Publication §4.5, §6, §11).
- `GET/PUT /config/return-window` — return window used by ENG-012 for the Return-Window Rule (Publication §4.4, §6, §11).

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. Tender-line payloads include tender type (cash, card, digital) and amount; card/digital tenders reference a payment-terminal transaction handle produced by ENG-023 (Publication §4.3). No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Sales of a Counter, Returns of a Sale, Cash Deposits of a Counter, Day Close of a Counter/day, Counters of a Store, Gift Cards of a Loyalty Program). Receipt responses include the generated document reference from ENG-007 (Publication §4.3, §11).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Counter → Store; POS Sale → Store + Counter + Items (Items resolved read-only against MOD-005 Inventory per Publication §12); POS Return → original POS Sale; Cash Deposit → Counter; Day Close → Counter + open Cash Deposits + POS Sales/Returns of the day.
- Uniqueness for POS Sale, POS Return, Cash Deposit, and Day Close numbers per ENG-017 numbering series (Publication §3, §11).
- Supervisor-Override Rule: `POST /pos-sales/{id}:apply-discount` and `POST /pos-sales/{id}:complete` reject when any applied discount exceeds the role-configured threshold without captured supervisor approval (Publication §6).
- Return-Window Rule: `POST /pos-returns` rejects when the referenced POS Sale is outside the configured return window (Publication §6).
- Mismatched-Cash Approval Rule: `POST /day-closes/{id}:post` rejects when Submit reported cash mismatch beyond tolerance without a captured supervisor approval (Publication §6).
- Tender totals: sum of tenders equals sale total (net of rounding per ENG-005) at `POST /pos-sales/{id}:complete` (Publication §4.3).
- Consumed events (`OfferPublished`, `InventoryLowStock`) treated as read-only inputs; write endpoints on those event streams reject (Publication §10, §13).
- Numbering-series invariants per ENG-017 (Publication §11).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "POS.DISCOUNT_APPROVAL_REQUIRED", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `POS.DISCOUNT_APPROVAL_REQUIRED` — POS Sale discount exceeds role threshold; supervisor override required (§6).
- `POS.RETURN_WINDOW_EXPIRED` — POS Return blocked; original sale outside configured return window (§6).
- `POS.DAY_CLOSE_MISMATCH_APPROVAL_REQUIRED` — Day Close post blocked; cash mismatch beyond tolerance without supervisor approval (§6).
- `POS.TENDER_TOTAL_MISMATCH` — Sale complete blocked; sum of tenders does not equal sale total net of rounding (§4.3).
- `POS.OFFLINE_RECONCILIATION_CONFLICT` — offline sale reconciliation rejected due to conflicting server state (§4.2).
- `POS.LEDGER_OWNED_BY_ACCOUNTING` — posting attempted from POS; posting is owned by MOD-002 (§13).
- `POS.OFFER_EVENT_READ_ONLY` — write attempted on the consumed `OfferPublished` (§10, §13).
- `POS.INVENTORY_LOW_STOCK_EVENT_READ_ONLY` — write attempted on the consumed `InventoryLowStock` (§10, §13).
- `POS.CONSUMED_EVENT_READ_ONLY` — write attempted on any consumed event (§10, §13).
- `POS.KPI_OWNED_BY_MOD017` — cross-module KPI authoring attempted from POS; authority is with MOD-017 (§13).
- `POS.INVENTORY_ITEM_READ_ONLY` — write attempted on Item / price list / stock; ownership at MOD-005 (§13).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (store, counter, cashier, offer, loyalty program, sale state, return state, day-close state, tender type, period). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume POS state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-015.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11). Event names are exactly those defined in the Stage 0 Publication:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `POSSaleCompleted` | §9 | `POST /pos-sales/{id}:complete` (successful), including server-side emission after offline reconciliation (§4.2) |
| `POSReturnProcessed` | §9 | `POST /pos-returns/{id}:complete` (successful) |
| `POSDayClosed` | §9 | `POST /day-closes/{id}:post` (successful) |

Consumed events (read-only inbound; Publication §10): `OfferPublished` (activates offers at counters) and `InventoryLowStock` (from MOD-005 Inventory), all via ENG-024. POS-published events (`POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed`) are also consumed by the POS read model per Publication §10.

No event is introduced beyond Publication §9. Event names are exactly those defined in Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014. Discount overrides, receipt reprints, mismatched-cash approvals, and offline reconciliations are audited.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; supervisor-override and mismatched-cash-approval routes require the caller's role to hold the corresponding approver grant.
- Transport TLS ≥ 1.2.
- Payment card data (PAN / CVV) never accepted in POS payloads — card and digital tenders reference a payment-terminal transaction handle produced by ENG-023 (Publication §4.3).
- Cost-sensitive fields (cash denominations, deposit amounts) redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- `POST /pos-sales/{id}/lines`, `POST /pos-sales/{id}:apply-discount`, `POST /pos-sales/{id}/payments`, and `POST /pos-sales/{id}:complete` target sub-second server round-trip.
- Batch endpoints (offline reconciliation, read-model refresh) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-015 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.1 / §4.2 / §4.3 / §4.4 / §4.5 for cart / payments / offers-loyalty-returns / day-close-reports), every event in §15 maps exactly to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-015 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Store | Endpoints | §6.1 |
| §7 Master Data — Counter | Endpoints | §6.2 |
| §7 Master Data — Offer | Endpoints | §6.3 |
| §7 Master Data — Loyalty Program | Endpoints | §6.4 |
| §8 Transactions — POS Sale | Endpoints | §6.5 |
| §8 Transactions — POS Return | Endpoints | §6.6 |
| §8 Transactions — Cash Deposit | Endpoints | §6.7 |
| §8 Transactions — Day Close | Endpoints | §6.8 |
| §3 / §4.5 Reports & Audit Readiness | Endpoints | §6.9 |
| §3 POS Configuration | Endpoints | §6.10 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15, §6.5 (`OfferPublished` activation), §6.9 (`InventoryLowStock` alerts) |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §9 (Inventory read-only), §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

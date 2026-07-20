---
title: "API-013 — Assets API Solution Design"
summary: "API Solution Design for MOD-013 Assets. Derives every endpoint, request/response model, webhook, and event exclusively from MOD-013 Module Publication."
spec_id: "API-013_SOLUTION_DESIGN"
module_id: "MOD-013"
module_name: "Assets"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/assets/MODULE_PRD.md", "docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-013", "assets", "API-013"]
document_type: "API Solution Design"
---

# API-013 — Assets API Solution Design

> **Source of Truth:** [`MOD-013 Module Publication`](../../../45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md). Every endpoint, request/response model, webhook, and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint, model, webhook, or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the Assets bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-013, MOB-013, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; Capitalization endpoints emitting `AssetCapitalized` (Publication §9); Depreciation Run endpoints emitting `DepreciationPosted` (Publication §9); Maintenance Order endpoints with `MaintenanceCompleted` consumption (Publication §10); Asset Transfer endpoints emitting `AssetTransferred` (Publication §9); Disposal endpoints emitting `AssetDisposed` (Publication §9); read APIs for Assets reports and dashboards (Publication §3, §4.4); event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** digital twin integration, predictive maintenance, cross-module KPI authoring APIs, ledger-posting APIs (owned by MOD-002), and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-013 §7). External-actor endpoints (Insurer, Vendor) are scoped via ABAC to the caller's counterparty identity where authorized.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/assets/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints, request models, response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. Event names shall be exactly those defined in the Publication (Publication §9). No endpoint or event below is invented; each cites the authorizing Publication section.

### 6.1 Asset (Publication §7 Asset, §4.1)

- `GET /assets` — list / hierarchy filter
- `POST /assets` — create
- `GET /assets/{id}` — read
- `PATCH /assets/{id}` — edit (blocked when disposed except via Disposal Reverse per §6)
- `POST /assets/{id}:archive` — lifecycle

### 6.2 Asset Class (Publication §7 Asset Class)

- `GET /asset-classes`, `POST /asset-classes`, `GET /asset-classes/{id}`, `PATCH /asset-classes/{id}`, `POST /asset-classes/{id}:archive`

### 6.3 Location (Publication §7 Location)

- `GET /locations`, `POST /locations`, `GET /locations/{id}`, `PATCH /locations/{id}`, `POST /locations/{id}:archive`

### 6.4 Insurance Policy (Publication §7 Insurance Policy)

- `GET /insurance-policies`, `POST /insurance-policies`, `GET /insurance-policies/{id}`, `PATCH /insurance-policies/{id}`, `POST /insurance-policies/{id}:archive`

### 6.5 Capitalization (Publication §8 Capitalization, §4.1)

- `GET /capitalizations`, `GET /capitalizations/{id}`
- `POST /capitalizations` — create in `draft` (may be seeded from consumed `PurchaseInvoiceReceived`, §10)
- `PATCH /capitalizations/{id}` — edit while `draft`; blocked after any `DepreciationPosted` for the asset (§6)
- `POST /capitalizations/{id}:submit` — `draft → submitted`
- `POST /capitalizations/{id}:approve` — `submitted → approved` via ENG-011
- `POST /capitalizations/{id}:capitalize` — `approved → capitalized`; emits `AssetCapitalized` per Publication §9
- `POST /capitalizations/{id}:reverse` — `capitalized → reversed`
- Consumes `PurchaseInvoiceReceived` (from MOD-004) read-only per Publication §10.

### 6.6 Depreciation Method (Publication §3, §4.2)

- `GET /depreciation-methods`, `POST /depreciation-methods`, `GET /depreciation-methods/{id}`, `PATCH /depreciation-methods/{id}`, `POST /depreciation-methods/{id}:archive`
- Registered via ENG-005; evaluated via ENG-012 (Publication §11).

### 6.7 Depreciation Run (Publication §8 Depreciation Run, §4.2)

- `GET /depreciation-runs`, `GET /depreciation-runs/{id}`
- `POST /depreciation-runs` — create
- `POST /depreciation-runs/{id}:submit`, `POST /depreciation-runs/{id}:approve` — via ENG-010/011
- `POST /depreciation-runs/{id}:post` — server enforces Active-Asset-Only rule via ENG-012 (Publication §6); emits `DepreciationPosted` per Publication §9
- `GET /assets/{id}/depreciation-schedule` — deterministic schedule; immutable once locked (Publication §4.2)
- Scheduled runs execute via ENG-014 (Publication §11).

### 6.8 Maintenance Order (Publication §8 Maintenance Order, §4.3)

- `GET /maintenance-orders`, `POST /maintenance-orders`, `GET /maintenance-orders/{id}`, `PATCH /maintenance-orders/{id}`
- `POST /maintenance-orders/{id}:approve` — via ENG-011 (Publication §11)
- `POST /maintenance-orders/{id}:complete` — completed against active assets (Publication §4.3)
- Scheduled via ENG-014 (Publication §11).
- Consumes `MaintenanceCompleted` (from external maintenance providers) read-only per Publication §10 to close open orders.

### 6.9 Calibration (Publication §4.3)

- `GET /calibrations` — cadence and state (read).
- `GET /assets/{id}/calibration` — cadence and next-due for a specific asset; deterministic via ENG-005/012 (Publication §11).

### 6.10 Asset Transfer (Publication §8 Asset Transfer, §4.3)

- `GET /asset-transfers`, `GET /asset-transfers/{id}`
- `POST /asset-transfers` — identity-preserving; only Location may change per Publication §4.3; emits `AssetTransferred` per Publication §9.

### 6.11 Disposal (Publication §8 Disposal, §4.3)

- `GET /disposals`, `GET /disposals/{id}`
- `POST /disposals` — create
- `POST /disposals/{id}:approve` — via ENG-011
- `POST /disposals/{id}:post` — emits `AssetDisposed` per Publication §9; post-disposal edits to the asset are blocked except via `:reverse` (Publication §6).
- `POST /disposals/{id}:reverse` — only path to edit a disposed asset (Publication §6).

### 6.12 Reports (Publication §3, §4.4)

- `GET /reports/asset-register`
- `GET /reports/depreciation-schedule`
- `GET /reports/maintenance-history`
- `GET /reports/disposal-summary`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.4).

### 6.13 Assets Configuration (Publication §3, PRD §10)

- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).
- `GET/PUT /config/componentization-rules`
- `GET/PUT /config/insurance-defaults`
- `GET/PUT /config/depreciation-methods-per-class` — via ENG-005 / ENG-012 (Publication §11).

### 6.14 Import (Publication §11 ENG-026)

- `POST /imports/assets`, `POST /imports/asset-classes`, `POST /imports/locations`, `POST /imports/insurance-policies` — bounded to Publication §7 entities.

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Capitalizations of an Asset, Depreciation Runs of an Asset, Maintenance Orders of an Asset, Transfers of an Asset, Insurance Policies of an Asset, Depreciation Schedule of an Asset).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Asset → Asset Class + Location; Capitalization → Asset; Depreciation Run → Asset; Maintenance Order → Asset; Asset Transfer → Asset + Location; Disposal → Asset; Insurance Policy → Asset.
- Uniqueness for Capitalization, Depreciation Run, Maintenance Order, Asset Transfer, and Disposal numbers per ENG-017 numbering series (Publication §3, §11).
- Capitalization Immutability Rule: `PATCH /capitalizations/{id}` and re-submit blocked when a `DepreciationPosted` exists for the asset (Publication §6).
- Active-Asset-Only Rule: `POST /depreciation-runs/{id}:post` blocked when the asset is not active (Publication §6).
- Disposed-Asset Immutability Rule: `PATCH /assets/{id}` and any state-changing endpoint on a disposed asset blocked except via `POST /disposals/{id}:reverse` (Publication §6).
- Asset Transfer Rule: `POST /asset-transfers` rejects payloads that change any attribute other than Location (Publication §4.3).
- Consumed events treated as read-only inputs (Publication §10, §13).
- Numbering-series invariants per ENG-017 (Publication §11).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "AST.CAPITALIZATION_LOCKED", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `AST.CAPITALIZATION_LOCKED` — Capitalization amount edit blocked because a Depreciation Run has been posted (§6).
- `AST.DEPRECIATION_ASSET_NOT_ACTIVE` — Depreciation Run post blocked for a non-active asset (§6).
- `AST.DISPOSED_ASSET_IMMUTABLE` — mutation blocked on a disposed asset; use Disposal Reverse (§6).
- `AST.TRANSFER_ONLY_LOCATION_CHANGES` — Asset Transfer payload attempts to change an attribute other than Location (§4.3).
- `AST.LEDGER_OWNED_BY_ACCOUNTING` — posting attempted from Assets; posting is owned by MOD-002 (§13).
- `AST.PURCHASE_EVENT_READ_ONLY` — write attempted on the consumed `PurchaseInvoiceReceived` (§10, §13).
- `AST.MAINTENANCE_EVENT_READ_ONLY` — write attempted on the consumed `MaintenanceCompleted` (§10, §13).
- `AST.CONSUMED_EVENT_READ_ONLY` — write attempted on any consumed event (§10, §13).
- `AST.KPI_OWNED_BY_MOD017` — cross-module KPI authoring attempted from Assets; authority is with MOD-017 (§13).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (asset, asset class, location, capitalization state, depreciation period, maintenance state, transfer period, disposal state, insurance state). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume Assets state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-013.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11). Event names are exactly those defined in the Stage 0 Publication:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `AssetCapitalized` | §9 | `POST /capitalizations/{id}:capitalize` (successful) |
| `DepreciationPosted` | §9 | `POST /depreciation-runs/{id}:post` (successful), including scheduled runs |
| `AssetTransferred` | §9 | `POST /asset-transfers` (successful) |
| `AssetDisposed` | §9 | `POST /disposals/{id}:post` (successful) |

Consumed events (read-only inbound; Publication §10): `PurchaseInvoiceReceived` (from MOD-004 Purchase), `MaintenanceCompleted` (from external maintenance providers), all via ENG-024. Assets-published events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) are also consumed by the Assets read model per Publication §10.

No event is introduced beyond Publication §9. Event names are exactly those defined in Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; external-actor endpoints further scoped to caller's own counterparty identity where authorized.
- Transport TLS ≥ 1.2.
- Cost-sensitive fields (capitalization amount, depreciation basis, disposal proceeds) redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (scheduled depreciation, scheduled maintenance, read-model refresh, imports) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-013 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.1 / §4.2 / §4.3 / §4.4 for capitalization / depreciation / execution / reports), every event in §15 maps exactly to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-013 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Asset | Endpoints | §6.1 |
| §7 Master Data — Asset Class | Endpoints | §6.2 |
| §7 Master Data — Location | Endpoints | §6.3 |
| §7 Master Data — Insurance Policy | Endpoints | §6.4 |
| §8 Transactions — Capitalization | Endpoints | §6.5 |
| §8 Transactions — Depreciation Run | Endpoints | §6.7 |
| §8 Transactions — Maintenance Order | Endpoints | §6.8 |
| §8 Transactions — Asset Transfer | Endpoints | §6.10 |
| §8 Transactions — Disposal | Endpoints | §6.11 |
| §3 / §4.2 Depreciation Methods | Endpoints | §6.6 |
| §3 / §4.3 Calibration | Endpoints | §6.9 |
| §3 / §4.4 Reports & Audit Readiness | Endpoints | §6.12 |
| §3 Assets Configuration | Endpoints | §6.13 |
| §11 ENG-026 Import | Endpoints | §6.14 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

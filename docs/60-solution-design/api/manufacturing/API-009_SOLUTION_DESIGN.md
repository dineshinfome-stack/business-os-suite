---
title: "API-009 — Manufacturing API Solution Design"
summary: "API Solution Design for MOD-009 Manufacturing. Derives every endpoint, model, and event exclusively from MOD-009 Module Publication."
spec_id: "API-009_SOLUTION_DESIGN"
module_id: "MOD-009"
module_name: "Manufacturing"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/manufacturing/MOD-009_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/manufacturing/MODULE_PRD.md", "docs/40-module-baselines/MOD009_MANUFACTURING_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-009", "manufacturing", "API-009"]
document_type: "API Solution Design"
---

# API-009 — Manufacturing API Solution Design

> **Source of Truth:** [`MOD-009 Module Publication`](../../../45-module-publications/manufacturing/MOD-009_MODULE_PUBLICATION.md). Every endpoint and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the Manufacturing bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-009, MOB-009, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; production planning endpoints including material-availability confirmation and scheduling (Publication §4.2); read APIs for Manufacturing reports and dashboards (Publication §3, §4.6); event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** finite-scheduling APIs, AI-based yield prediction endpoints, real-time OEE feeds, cross-module KPI authoring, and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-009 §7). Sub-contractor (external actor) endpoints are scoped via ABAC to the caller's sub-contractor identity.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/manufacturing/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; quantity and unit-of-measure fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints are derived deterministically from Publication §7 (masters) and §8 (transactions). No endpoint below is invented; each cites the authorizing Publication section.

### 6.1 BOM (Publication §7 BOM)

- `GET /boms` — list
- `POST /boms` — create
- `GET /boms/{id}` — read
- `PATCH /boms/{id}` — edit
- `POST /boms/{id}:archive` — archive (lifecycle per Baseline §7 / PRD §5)

### 6.2 Routing (Publication §7 Routing)

- `GET /routings`, `POST /routings`, `GET /routings/{id}`, `PATCH /routings/{id}`, `POST /routings/{id}:archive`

### 6.3 Work Center (Publication §7 Work Center)

- `GET /work-centers`, `POST /work-centers`, `GET /work-centers/{id}`, `PATCH /work-centers/{id}`, `POST /work-centers/{id}:archive`

### 6.4 Machine (Publication §7 Machine)

- `GET /machines`, `POST /machines`, `GET /machines/{id}`, `PATCH /machines/{id}`, `POST /machines/{id}:archive`
- Linked to Work Center per Publication §7.

### 6.5 Operation (Publication §7 Operation)

- `GET /operations`, `POST /operations`, `GET /operations/{id}`, `PATCH /operations/{id}`, `POST /operations/{id}:archive`

### 6.6 Production Plan (Publication §4.2)

- `GET /production-plans`, `POST /production-plans`, `GET /production-plans/{id}`, `PATCH /production-plans/{id}`
- `POST /production-plans/{id}:confirm-material-availability` — enforces the material-availability rule via ENG-012 (Publication §6, §11); reads Item availability from MOD-005 (Publication §12).
- `POST /production-plans/{id}:schedule` — schedules onto work centers via ENG-014 (Publication §11).
- Consumes `SalesOrderConfirmed` and `InventoryLowStock` read-only per Publication §10.

### 6.7 Work Order (Publication §8 Work Order, §4.3)

- `GET /work-orders`, `POST /work-orders`, `GET /work-orders/{id}`, `PATCH /work-orders/{id}`
- `POST /work-orders/{id}:release` — server blocks release unless material availability is confirmed (Publication §6). Successful release emits `WorkOrderReleased` per Publication §9.
- `POST /work-orders/{id}:complete` — successful completion emits `ProductionCompleted` per Publication §9.
- `POST /work-orders/{id}:approve` — via ENG-011 (Publication §11).
- MES / SCADA / IoT invocation via ENG-023 (Publication §11); never redefined by MOD-009.

### 6.8 Production Entry (Publication §8 Production Entry, §4.3)

- `GET /production-entries`, `POST /production-entries`, `GET /production-entries/{id}`, `PATCH /production-entries/{id}`
- Bound to a Work Order (§6.7).

### 6.9 Sub-contract Challan (Publication §8 Sub-contract Challan, §4.4)

- `GET /sub-contract-challans`, `POST /sub-contract-challans`, `GET /sub-contract-challans/{id}`, `PATCH /sub-contract-challans/{id}`
- `POST /sub-contract-challans/{id}:dispatch` — emits `SubContractDispatched` per Publication §9.
- `POST /sub-contract-challans/{id}:receive-return` — reconciles the return leg.
- Return-window rule enforced via ENG-012 (Publication §6, §11); ageing flags exposed on `GET`.

### 6.10 Quality Inspection (Publication §8 Quality Inspection, §4.5)

- `GET /quality-inspections`, `POST /quality-inspections`, `GET /quality-inspections/{id}`, `PATCH /quality-inspections/{id}`
- `POST /quality-inspections/{id}:disposition` — accept / reject; on rejection emits `QualityRejected` per Publication §9. Quality-rejected output cannot be issued to finished-goods stock (Publication §6).

### 6.11 Yield & Scrap (Publication §4.5)

- `POST /work-orders/{id}/yield` — capture yield against a Work Order (§4.5).
- `POST /work-orders/{id}/scrap` — capture scrap against a Work Order (§4.5).

### 6.12 Reports (Publication §3, §4.6)

- `GET /reports/work-order-status`
- `GET /reports/oee`
- `GET /reports/yield-and-scrap`
- `GET /reports/sub-contract-ageing`
- `GET /reports/quality-reject-rate`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.6).

### 6.13 Manufacturing Configuration (Publication §3, PRD §10)

- `GET/PUT /config/default-routing`
- `GET/PUT /config/scrap-tolerance`
- `GET/PUT /config/approval-thresholds`
- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Production Entries of a Work Order, Sub-contract Legs of a Work Order, Quality Inspections of a Work Order, Yield/Scrap of a Work Order).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for BOM components → Item (from MOD-005), Routing operations → Operation, Machine → Work Center.
- Uniqueness where the Publication implies enterprise-single (BOM / Routing / Work Center / Machine / Operation codes; numbering series per PRD §10).
- Work Order release blocked unless material availability is confirmed (Publication §6).
- Quality-rejected disposition prohibits issuance to finished-goods stock (Publication §6).
- Sub-contract Challan return-window enforcement (Publication §6).
- Consumed events treated as read-only inputs (Publication §10, §13).
- Approval-routing invariants per Manufacturing operations configuration (Publication §3, §11 ENG-011).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "MFG.MATERIAL_UNAVAILABLE", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `MFG.MATERIAL_UNAVAILABLE` — Work Order release blocked pending material-availability confirmation (§6).
- `MFG.QUALITY_REJECTED_ISSUE_BLOCKED` — attempted issuance of quality-rejected output to finished-goods stock (§6).
- `MFG.SUBCONTRACT_RETURN_WINDOW_EXCEEDED` — sub-contract return outside configured window (§6).
- `MFG.CONSUMED_EVENT_READ_ONLY` — write attempted on a consumed event (§10, §13).
- `MFG.APPROVAL_ROUTING_UNRESOLVED` — approval routing returned zero approvers (§11 ENG-011).
- `MFG.LEDGER_OWNED_BY_ACCOUNTING` — posting attempted from Manufacturing; posting is owned by MOD-002 (§13).
- `MFG.STOCK_OWNED_BY_INVENTORY` — stock mutation attempted from Manufacturing; stock ledger is owned by MOD-005 (§13).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (item, work center, machine, operation, status, period, sub-contractor, disposition, ageing bucket). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume Manufacturing state via the platform Event Engine (§15). External MES / SCADA / IoT systems are integrated via ENG-023 (Publication §11 / §6.7). Webhooks are therefore **N/A** for API-009.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11) under ADR-051 outbox semantics:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `WorkOrderReleased` | §9 | `POST /work-orders/{id}:release` (successful release) |
| `ProductionCompleted` | §9 | `POST /work-orders/{id}:complete` (successful completion) |
| `QualityRejected` | §9 | `POST /quality-inspections/{id}:disposition` on rejection |
| `SubContractDispatched` | §9 | `POST /sub-contract-challans/{id}:dispatch` (successful dispatch) |

Consumed events (read-only inbound; Publication §10): `SalesOrderConfirmed` (from MOD-003 Sales), `InventoryLowStock` (from MOD-005 Inventory), `MaintenanceCompleted` (external), all via ENG-024.

No event is introduced beyond Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; Sub-contractor-scoped endpoints further scoped to caller's own sub-contractor identity.
- Transport TLS ≥ 1.2.
- Cost-sensitive fields (yield/scrap valuation) redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (scheduling, read-model refresh) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-009 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.2 / §4.3 / §4.4 / §4.5 / §4.6 for planning, work-order execution, sub-contract, quality/yield-scrap, and reports), every event in §15 maps to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-009 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — BOM | Endpoints | §6.1 |
| §7 Master Data — Routing | Endpoints | §6.2 |
| §7 Master Data — Work Center | Endpoints | §6.3 |
| §7 Master Data — Machine | Endpoints | §6.4 |
| §7 Master Data — Operation | Endpoints | §6.5 |
| §4.2 Production Planning | Endpoints | §6.6 |
| §8 Transactions — Work Order | Endpoints | §6.7 |
| §8 Transactions — Production Entry | Endpoints | §6.8 |
| §8 Transactions — Sub-contract Challan | Endpoints | §6.9 |
| §8 Transactions — Quality Inspection | Endpoints | §6.10 |
| §4.5 Yield & Scrap | Endpoints | §6.11 |
| §3 / §4.6 Reports & Audit Readiness | Endpoints | §6.12 |
| §3 Operations Config | Endpoints | §6.13 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (posting/stock ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

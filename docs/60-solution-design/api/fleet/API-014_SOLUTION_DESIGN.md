---
title: "API-014 — Fleet API Solution Design"
summary: "API Solution Design for MOD-014 Fleet. Derives every endpoint, request/response model, webhook, and event exclusively from MOD-014 Module Publication."
spec_id: "API-014_SOLUTION_DESIGN"
module_id: "MOD-014"
module_name: "Fleet"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/fleet/MOD-014_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/fleet/MODULE_PRD.md", "docs/40-module-baselines/MOD014_FLEET_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-014", "fleet", "API-014"]
document_type: "API Solution Design"
---

# API-014 — Fleet API Solution Design

> **Source of Truth:** [`MOD-014 Module Publication`](../../../45-module-publications/fleet/MOD-014_MODULE_PUBLICATION.md). Every endpoint, request/response model, webhook, and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint, model, webhook, or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the Fleet bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-014, MOB-014, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; Trip Sheet endpoints emitting `TripClosed` (Publication §9) and seeded from consumed `DeliveryDispatched` / `FieldTicketCreated` (Publication §10); Fuel Entry endpoints emitting `FuelRecorded` (Publication §9) with telematics reconciliation per §6; Maintenance Order endpoints emitting `MaintenanceCompleted` (Publication §9); Compliance & Insurance registration emitting `ComplianceExpiring` (Publication §9); read APIs for Fleet reports and dashboards (Publication §3, §4.4); event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** telematics-driven scoring, AI route optimization, cross-module KPI authoring APIs, ledger-posting APIs (owned by MOD-002), and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-014 §7). External-actor endpoints (Regulator, Insurer) are scoped via ABAC to the caller's counterparty identity where authorized.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/fleet/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints, request models, response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. Event names shall be exactly those defined in the Publication (Publication §9). No endpoint or event below is invented; each cites the authorizing Publication section.

### 6.1 Vehicle (Publication §7 Vehicle, §4.1)

- `GET /vehicles` — list / hierarchy filter
- `POST /vehicles` — create
- `GET /vehicles/{id}` — read
- `PATCH /vehicles/{id}` — edit
- `POST /vehicles/{id}:archive` — lifecycle

### 6.2 Driver (Publication §7 Driver, §4.1)

- `GET /drivers`, `POST /drivers`, `GET /drivers/{id}`, `PATCH /drivers/{id}`, `POST /drivers/{id}:archive`
- `GET /drivers/{id}/licenses` — driver–license linkage read (Publication §4.1).

### 6.3 License (Publication §7 License, §4.1)

- `GET /licenses`, `POST /licenses`, `GET /licenses/{id}`, `PATCH /licenses/{id}`, `POST /licenses/{id}:archive`
- Renewal reminders scheduled via ENG-014 (Publication §11).

### 6.4 Compliance & Insurance (Publication §3, §4.1)

- `GET /compliance-registrations`, `POST /compliance-registrations`, `GET /compliance-registrations/{id}`, `PATCH /compliance-registrations/{id}`, `POST /compliance-registrations/{id}:archive`
- `GET /insurance-registrations`, `POST /insurance-registrations`, `GET /insurance-registrations/{id}`, `PATCH /insurance-registrations/{id}`, `POST /insurance-registrations/{id}:archive`
- Scheduled reminders execute via ENG-014; `ComplianceExpiring` emitted via ENG-024 within the configured window (Publication §9, §4.1, §11).

### 6.5 Route (Publication §7 Route, §4.2)

- `GET /routes`, `POST /routes`, `GET /routes/{id}`, `PATCH /routes/{id}`, `POST /routes/{id}:archive`
- Lifecycle enforced via ENG-010 / ENG-011 (Publication §11).

### 6.6 Trip Sheet (Publication §8 Trip Sheet, §4.2)

- `GET /trip-sheets`, `GET /trip-sheets/{id}`
- `POST /trip-sheets` — create in `draft` (may be seeded from consumed `DeliveryDispatched` or `FieldTicketCreated`, §10; consumption is idempotent).
- `PATCH /trip-sheets/{id}` — edit while `draft` or `planned`.
- `POST /trip-sheets/{id}:plan` — `draft → planned` via ENG-010/011.
- `POST /trip-sheets/{id}:start` — `planned → in-progress`; server enforces Compliance-Blocks-Assignment Rule via ENG-012 (Publication §6).
- `POST /trip-sheets/{id}:close` — `in-progress → closed`; server enforces Odometer Capture Rule via ENG-012 (Publication §6); emits `TripClosed` per Publication §9.
- `POST /trip-sheets/{id}:reverse` — `closed → reversed`.
- Consumes `DeliveryDispatched` (from MOD-003) and `FieldTicketCreated` (from MOD-012) read-only per Publication §10.

### 6.7 Fuel Station (Publication §7 Fuel Station, §4.3)

- `GET /fuel-stations`, `POST /fuel-stations`, `GET /fuel-stations/{id}`, `PATCH /fuel-stations/{id}`, `POST /fuel-stations/{id}:archive`

### 6.8 Fuel Entry (Publication §8 Fuel Entry, §4.3)

- `GET /fuel-entries`, `GET /fuel-entries/{id}`
- `POST /fuel-entries` — create
- `PATCH /fuel-entries/{id}` — edit while `draft`
- `POST /fuel-entries/{id}:submit`, `POST /fuel-entries/{id}:approve` — via ENG-010/011
- `POST /fuel-entries/{id}:post` — server evaluates Telematics Reconciliation Rule via ENG-012 (Publication §6); emits `FuelRecorded` per Publication §9.
- `POST /fuel-entries/{id}:reverse` — reverse post.

### 6.9 Maintenance Order (Publication §8 Maintenance Order, §4.3)

- `GET /maintenance-orders`, `POST /maintenance-orders`, `GET /maintenance-orders/{id}`, `PATCH /maintenance-orders/{id}`
- `POST /maintenance-orders/{id}:approve` — via ENG-011 (Publication §11)
- `POST /maintenance-orders/{id}:complete` — emits `MaintenanceCompleted` per Publication §9.
- Scheduled preventive maintenance generated via ENG-014 from intervals configured via ENG-005 in the Fleet namespace (Publication §4.3, §11).

### 6.10 Telematics Reconciliation (Publication §4.3, §6)

- `GET /telematics/reconciliation` — read reconciliation status for the Fleet read model.
- `GET /fuel-entries/{id}/telematics` — reconciliation status for a specific Fuel Entry; absence of telematics data is returned as a documented fallback (Publication §6).

### 6.11 Reports (Publication §3, §4.4)

- `GET /reports/trip-sheet`
- `GET /reports/fuel-efficiency`
- `GET /reports/maintenance-cost`
- `GET /reports/compliance-calendar`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.4).

### 6.12 Fleet Configuration (Publication §3, PRD §10)

- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).
- `GET/PUT /config/compliance-reminder-windows`
- `GET/PUT /config/fuel-norms-per-vehicle`
- `GET/PUT /config/maintenance-intervals-defaults`

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Trips of a Vehicle, Fuel Entries of a Vehicle, Maintenance Orders of a Vehicle, Licenses of a Driver, Compliance and Insurance of a Vehicle).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Vehicle → hierarchy parent; Driver → License; Trip Sheet → Vehicle + Driver + Route; Fuel Entry → Vehicle + Fuel Station; Maintenance Order → Vehicle; Compliance/Insurance → Vehicle.
- Uniqueness for Trip Sheet, Fuel Entry, and Maintenance Order numbers per ENG-017 numbering series (Publication §3, §11).
- Odometer Capture Rule: `POST /trip-sheets/{id}:close` rejects payloads without opening + closing odometer or where `closing < opening` (Publication §6).
- Compliance-Blocks-Assignment Rule: `POST /trip-sheets/{id}:start` rejected when the assigned vehicle has expired critical compliance (Publication §6).
- Telematics Reconciliation Rule: `POST /fuel-entries/{id}:post` evaluates telematics reconciliation where available; absence recorded as documented fallback (Publication §6).
- Consumed events (`DeliveryDispatched`, `FieldTicketCreated`) treated as read-only inputs; write endpoints on those event streams reject (Publication §10, §13).
- Numbering-series invariants per ENG-017 (Publication §11).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "FLT.ODOMETER_REQUIRED", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `FLT.ODOMETER_REQUIRED` — Trip Sheet close blocked; opening or closing odometer missing (§6).
- `FLT.ODOMETER_INVALID` — Trip Sheet close blocked; `closing < opening` (§6).
- `FLT.VEHICLE_COMPLIANCE_EXPIRED` — Trip Sheet start blocked; vehicle has expired critical compliance (§6).
- `FLT.TELEMATICS_FALLBACK_RECORDED` — Fuel Entry post succeeded with telematics absent; fallback documented (§6). (Informational, not blocking.)
- `FLT.LEDGER_OWNED_BY_ACCOUNTING` — posting attempted from Fleet; posting is owned by MOD-002 (§13).
- `FLT.DELIVERY_EVENT_READ_ONLY` — write attempted on the consumed `DeliveryDispatched` (§10, §13).
- `FLT.FIELD_TICKET_EVENT_READ_ONLY` — write attempted on the consumed `FieldTicketCreated` (§10, §13).
- `FLT.CONSUMED_EVENT_READ_ONLY` — write attempted on any consumed event (§10, §13).
- `FLT.KPI_OWNED_BY_MOD017` — cross-module KPI authoring attempted from Fleet; authority is with MOD-017 (§13).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (vehicle, driver, route, fuel station, trip state, fuel-entry state, maintenance state, compliance state, insurance state, period). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume Fleet state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-014.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11). Event names are exactly those defined in the Stage 0 Publication:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `TripClosed` | §9 | `POST /trip-sheets/{id}:close` (successful) |
| `FuelRecorded` | §9 | `POST /fuel-entries/{id}:post` (successful) |
| `MaintenanceCompleted` | §9 | `POST /maintenance-orders/{id}:complete` (successful) |
| `ComplianceExpiring` | §9 | Scheduled by ENG-014 within the configured reminder window (Publication §4.1) |

Consumed events (read-only inbound; Publication §10): `DeliveryDispatched` (from MOD-003 Sales) and `FieldTicketCreated` (from MOD-012 Field Service), all via ENG-024. Fleet-published events (`TripClosed`, `FuelRecorded`, `MaintenanceCompleted`, `ComplianceExpiring`) are also consumed by the Fleet read model per Publication §10.

No event is introduced beyond Publication §9. Event names are exactly those defined in Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; external-actor endpoints further scoped to caller's own counterparty identity where authorized.
- Transport TLS ≥ 1.2.
- Cost-sensitive fields (fuel cost, maintenance cost) redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (scheduled preventive maintenance, scheduled compliance reminders, read-model refresh) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-014 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.1 / §4.2 / §4.3 / §4.4 for compliance / trip / fuel-maintenance / reports), every event in §15 maps exactly to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-014 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Vehicle | Endpoints | §6.1 |
| §7 Master Data — Driver | Endpoints | §6.2 |
| §7 Master Data — License | Endpoints | §6.3 |
| §7 Master Data — Route | Endpoints | §6.5 |
| §7 Master Data — Fuel Station | Endpoints | §6.7 |
| §3 / §4.1 Compliance & Insurance | Endpoints | §6.4 |
| §8 Transactions — Trip Sheet | Endpoints | §6.6 |
| §8 Transactions — Fuel Entry | Endpoints | §6.8 |
| §8 Transactions — Maintenance Order | Endpoints | §6.9 |
| §4.3 / §6 Telematics Reconciliation | Endpoints | §6.10 |
| §3 / §4.4 Reports & Audit Readiness | Endpoints | §6.11 |
| §3 Fleet Configuration | Endpoints | §6.12 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

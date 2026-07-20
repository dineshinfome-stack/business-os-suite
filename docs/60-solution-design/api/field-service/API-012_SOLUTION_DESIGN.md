---
title: "API-012 — Field Service API Solution Design"
summary: "API Solution Design for MOD-012 Field Service. Derives every endpoint, request/response model, webhook, and event exclusively from MOD-012 Module Publication."
spec_id: "API-012_SOLUTION_DESIGN"
module_id: "MOD-012"
module_name: "Field Service"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/field-service/MODULE_PRD.md", "docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-012", "field-service", "API-012"]
document_type: "API Solution Design"
---

# API-012 — Field Service API Solution Design

> **Source of Truth:** [`MOD-012 Module Publication`](../../../45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md). Every endpoint, request/response model, webhook, and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint, model, webhook, or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the Field Service bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-012, MOB-012, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; dispatch-strategy resolution and scheduled/automated dispatch endpoints (Publication §4.2); visit execution and completion endpoints with the signature/checklist rule (Publication §4.3, §6); Spare Consumption endpoints emitting `SpareConsumed` (Publication §9); Closure Report endpoints (Publication §8); SLA clock and escalation endpoints (Publication §3, §4.4); read APIs for Field Service reports and dashboards (Publication §3, §4.5); event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** offline-first mobile beyond platform baseline, AI dispatch optimization, predictive maintenance, cross-module KPI authoring APIs, ledger-posting APIs (owned by MOD-002), and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-012 §7). Customer (external actor) endpoints are scoped via ABAC to the caller's customer identity where authorized.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/field-service/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints, request models, response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. Event names shall be exactly those defined in the Publication (Publication §9). No endpoint or event below is invented; each cites the authorizing Publication section.

### 6.1 Field Ticket (Publication §7 Ticket Type, §8 Field Ticket, §4.1)

- `GET /tickets` — list
- `POST /tickets` — create; emits `FieldTicketCreated` per Publication §9
- `GET /tickets/{id}` — read
- `PATCH /tickets/{id}` — edit
- `POST /tickets/{id}:triage` — `open → triaged`
- `POST /tickets/{id}:cancel` — `* → cancelled`
- Consumes `ContractSigned` (from MOD-011) read-only per Publication §10 for optional AMC linkage.

### 6.2 Technician (Publication §7 Technician)

- `GET /technicians`, `POST /technicians`, `GET /technicians/{id}`, `PATCH /technicians/{id}`, `POST /technicians/{id}:archive`

### 6.3 Skill (Publication §7 Skill)

- `GET /skills`, `POST /skills`, `GET /skills/{id}`, `PATCH /skills/{id}`, `POST /skills/{id}:archive`

### 6.4 Territory (Publication §7 Territory)

- `GET /territories`, `POST /territories`, `GET /territories/{id}`, `PATCH /territories/{id}`, `POST /territories/{id}:archive`

### 6.5 Ticket Type (Publication §7 Ticket Type)

- `GET /ticket-types`, `POST /ticket-types`, `GET /ticket-types/{id}`, `PATCH /ticket-types/{id}`, `POST /ticket-types/{id}:archive`

### 6.6 SLA Policy (Publication §7 SLA Policy, §3, §4.4)

- `GET /sla-policies`, `POST /sla-policies`, `GET /sla-policies/{id}`, `PATCH /sla-policies/{id}`, `POST /sla-policies/{id}:archive`

### 6.7 Visit (Publication §8 Visit, §4.2, §4.3)

- `GET /visits`, `GET /visits/{id}`
- `POST /tickets/{id}/visits:assign` — dispatch-strategy resolution via ENG-005/ENG-012 (Publication §4.2, §11); emits `VisitAssigned` per Publication §9.
- `POST /visits/{id}:reassign` — automated re-dispatch via ENG-013 (Publication §4.2, §11); emits `VisitAssigned` per Publication §9.
- `POST /visits/{id}:start` — `assigned → en route`
- `POST /visits/{id}:arrive` — `en route → on site`
- `POST /visits/{id}:complete` — `on site → completed`; server enforces the signature/checklist rule via ENG-012 (Publication §6); emits `FieldVisitCompleted` per Publication §9.
- Consumes `VisitScheduled` (from MOD-011) read-only per Publication §10 to materialize AMC-driven visits.
- Scheduled dispatch runs via ENG-014 (Publication §11, §4.2).

### 6.8 Spare Consumption (Publication §8 Spare Consumption, §4.3)

- `GET /spare-consumptions`, `POST /spare-consumptions`, `GET /spare-consumptions/{id}`, `PATCH /spare-consumptions/{id}`
- Bound to a Visit per Publication §8; Item is read-only from MOD-005 (Publication §13). Successful create emits `SpareConsumed` per Publication §9; van-stock adjustment is effected by MOD-005 consuming that event (Publication §6, §13).

### 6.9 Closure Report (Publication §8 Closure Report, §4.3)

- `GET /closure-reports`, `POST /closure-reports`, `GET /closure-reports/{id}`, `PATCH /closure-reports/{id}`
- Attached via ENG-008 and rendered via ENG-007 (Publication §11).
- Consumes `ServiceTicketClosed` (from MOD-016) read-only per Publication §10 to reconcile ticket closure with visit completion.

### 6.10 SLA & Escalation (Publication §3, §4.4)

- `GET /sla-clocks` — current SLA clock state for tickets/visits (read).
- `GET /escalations`, `GET /escalations/{id}`
- `POST /escalations/{id}:acknowledge`, `POST /escalations/{id}:resolve` — via ENG-010 / ENG-011 (Publication §11).
- Scheduled SLA checks via ENG-014 and automated escalation via ENG-013 (Publication §11, §4.4). Breach notifications dispatch via ENG-025 (Publication §11).

### 6.11 Reports (Publication §3, §4.5)

- `GET /reports/ticket-ageing`
- `GET /reports/first-time-fix-rate`
- `GET /reports/technician-utilization`
- `GET /reports/sla-adherence`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.5).

### 6.12 Field Service Configuration (Publication §3, PRD §10)

- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).
- `GET/PUT /config/ticket-type-policies`
- `GET/PUT /config/dispatch-strategies` — via ENG-005 / ENG-012 (Publication §4.2, §11).
- `GET/PUT /config/sla-policies`
- `GET/PUT /config/territory-rules`
- `GET/PUT /config/mobile-app-settings`

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Visits of a Ticket, Spare Consumptions of a Visit, Closure Reports of a Visit, SLA clock of a Ticket/Visit).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Visit → Field Ticket; Spare Consumption → Visit + Item (read-only from MOD-005); Closure Report → Visit; SLA Policy → Ticket Type / Territory.
- Uniqueness for Field Ticket / Spare Consumption numbers per ENG-017 numbering series (Publication §3, §11).
- Signature/checklist rule: Visit `:complete` blocked when required signatures/checklists are missing (Publication §6).
- Van-stock rule: Spare Consumption create emits `SpareConsumed`; stock adjustment is effected by MOD-005 (Publication §6, §13). Field Service never mutates stock directly.
- SLA breach rule: SLA breach detection triggers escalation workflows per policy (Publication §6, §4.4).
- Dispatch-strategy rule: `:assign` respects skill × territory × availability resolved via ENG-005/ENG-012 (Publication §4.2).
- Consumed events treated as read-only inputs (Publication §10, §13).
- Escalation-routing invariants per SLA Policy (Publication §3, §11 ENG-011).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "FS.SIGNATURE_REQUIRED", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `FS.SIGNATURE_REQUIRED` — Visit `:complete` blocked when required signatures/checklists are missing (§6).
- `FS.STOCK_OWNED_BY_INVENTORY` — direct stock mutation attempted from Field Service; van-stock decrement is effected by MOD-005 consuming `SpareConsumed` (§6, §13).
- `FS.LEDGER_OWNED_BY_ACCOUNTING` — posting attempted from Field Service; posting is owned by MOD-002 (§13).
- `FS.ITEM_OWNED_BY_INVENTORY` — Item mutation attempted from Field Service; Item master is owned by MOD-005 (§13).
- `FS.AMC_OWNED_BY_MOD011` — AMC contract/entitlement mutation attempted from Field Service; authority is with MOD-011 (§13).
- `FS.SERVICE_DESK_TICKET_OWNED_BY_MOD016` — service-desk ticket master mutation attempted from Field Service; authority is with MOD-016 (§13).
- `FS.CONSUMED_EVENT_READ_ONLY` — write attempted on a consumed event (§10, §13).
- `FS.DISPATCH_STRATEGY_UNRESOLVED` — dispatch strategy resolved zero assignments (§4.2, §11 ENG-005/ENG-012).
- `FS.ESCALATION_ROUTING_UNRESOLVED` — escalation routing returned zero approvers (§11 ENG-010/ENG-011).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (ticket, ticket type, technician, territory, status, SLA state, escalation state, visit period, consumption period). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume Field Service state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-012.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11):

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `FieldTicketCreated` | §9 | `POST /tickets` (successful) |
| `VisitAssigned` | §9 | `POST /tickets/{id}/visits:assign` / `POST /visits/{id}:reassign` (successful) or scheduled/automated dispatch |
| `FieldVisitCompleted` | §9 | `POST /visits/{id}:complete` (successful) |
| `SpareConsumed` | §9 | `POST /spare-consumptions` (successful) |

Consumed events (read-only inbound; Publication §10): `ContractSigned` (from MOD-011 AMC), `VisitScheduled` (from MOD-011 AMC), `ServiceTicketClosed` (from MOD-016 Service Desk), all via ENG-024. Field Service-published events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) are also consumed by the Field Service read model per Publication §10.

No event is introduced beyond Publication §9. Event names are exactly those defined in Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; Customer-scoped endpoints further scoped to caller's own customer identity where authorized.
- Transport TLS ≥ 1.2.
- Cost-sensitive fields (labour rate, spare unit cost) redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (scheduled dispatch, scheduled SLA checks, read-model refresh) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-012 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.2 / §4.3 / §4.4 / §4.5 for dispatch / execution / SLA / reports), every event in §15 maps exactly to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-012 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Technician | Endpoints | §6.2 |
| §7 Master Data — Skill | Endpoints | §6.3 |
| §7 Master Data — Territory | Endpoints | §6.4 |
| §7 Master Data — Ticket Type | Endpoints | §6.5 |
| §7 Master Data — SLA Policy | Endpoints | §6.6 |
| §8 Transactions — Field Ticket | Endpoints | §6.1 |
| §8 Transactions — Visit | Endpoints | §6.7 |
| §8 Transactions — Spare Consumption | Endpoints | §6.8 |
| §8 Transactions — Closure Report | Endpoints | §6.9 |
| §3 / §4.4 SLA & Escalation | Endpoints | §6.10 |
| §3 / §4.5 Reports & Audit Readiness | Endpoints | §6.11 |
| §3 Field Service Configuration | Endpoints | §6.12 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

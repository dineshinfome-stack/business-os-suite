---
title: "API-006 — CRM API Solution Design"
summary: "API Solution Design for MOD-006 CRM. Derives every endpoint, model, and event exclusively from MOD-006 Module Publication."
spec_id: "API-006_SOLUTION_DESIGN"
module_id: "MOD-006"
module_name: "CRM"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Revenue"
source_publication: "docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/crm/MODULE_PRD.md", "docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-006", "crm", "API-006"]
document_type: "API Solution Design"
---

# API-006 — CRM API Solution Design

> **Source of Truth:** [`MOD-006 Module Publication`](../../../45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md). Every endpoint and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the CRM bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-006, MOB-006, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; read APIs for Customer 360 and CRM operational reports (Publication §3, §4.6); event publication per Publication §9.

**Out of scope:** ledger operations, statutory filing, AI scoring, social listening (Publication §15).

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-006 §7).

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/crm/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary and quantity fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints are derived deterministically from Publication §7 (masters) and §8 (transactions). No endpoint below is invented; each cites the authorizing Publication section.

### 6.1 Account (Publication §7 Account)

- `GET /accounts` — list
- `POST /accounts` — create
- `GET /accounts/{id}` — read
- `PATCH /accounts/{id}` — edit
- `POST /accounts/{id}:archive` — archive (lifecycle per Baseline §7 CRM authority)

### 6.2 Contact (Publication §7 Contact)

- `GET /contacts`, `POST /contacts`, `GET /contacts/{id}`, `PATCH /contacts/{id}`, `POST /contacts/{id}:archive`

### 6.3 Lead (Publication §7 Lead, §6 single-shot conversion)

- `GET /leads`, `POST /leads`, `GET /leads/{id}`, `PATCH /leads/{id}`
- `POST /leads/{id}:convert` — single-shot; server enforces idempotency and one-time semantics per Publication §6.

### 6.4 Opportunity (Publication §7, §6 win/loss terminal)

- `GET /opportunities`, `POST /opportunities`, `GET /opportunities/{id}`, `PATCH /opportunities/{id}`
- `POST /opportunities/{id}:advance-stage`
- `POST /opportunities/{id}:mark-won`
- `POST /opportunities/{id}:mark-lost`

### 6.5 Campaign & Segment (Publication §7)

- `GET /campaigns`, `POST /campaigns`, `GET /campaigns/{id}`, `PATCH /campaigns/{id}`
- `GET /segments`, `POST /segments`, `GET /segments/{id}`, `PATCH /segments/{id}`

### 6.6 Activity & Meeting (Publication §8)

- `GET /activities`, `POST /activities`, `GET /activities/{id}`, `PATCH /activities/{id}`
- `GET /meetings`, `POST /meetings`, `GET /meetings/{id}`, `PATCH /meetings/{id}`

### 6.7 Campaign Send (Publication §8, §6 consent rule)

- `POST /campaigns/{id}/sends` — server-enforced consent filter; response includes excluded recipients count.
- `GET /campaigns/{id}/sends/{sendId}`

### 6.8 Customer 360 & Reports (Publication §3, §4.6)

- `GET /customer-360/{accountId}`
- `GET /reports/pipeline`, `GET /reports/win-loss`, `GET /reports/activity`, `GET /reports/campaign-effectiveness`, `GET /reports/customer-360`

### 6.9 CRM Configuration (Publication §3 operations configuration)

- `GET/PUT /config/pipeline-stages`
- `GET/PUT /config/lead-scoring-model`
- `GET/PUT /config/assignment-rules`
- `GET/PUT /config/communication-templates`

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Contacts of an Account, Activities of an Opportunity, etc.).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Account/Contact identifiers.
- Uniqueness where Publication implies enterprise-single.
- Single-shot conversion for Leads (§6).
- Assignment resolution returns exactly one owner (§6).
- Consent filter on Campaign Send (§6).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "CRM.LEAD_ALREADY_CONVERTED", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `CRM.LEAD_ALREADY_CONVERTED` — single-shot rule violated (§6).
- `CRM.ASSIGNMENT_UNRESOLVED` — assignment rules returned 0 or >1 owner (§6).
- `CRM.CONSENT_MISSING` — recipient lacks consent for campaign inclusion (§6).
- `CRM.MASTER_IMMUTABLE` — mutation attempted on externally-owned master.
- `CRM.OPPORTUNITY_TERMINAL` — mutation attempted on won/lost opportunity (§6).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity attributes plus tenant-scoped date ranges. Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume CRM state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-006.

## 15. Event Publishing

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11) under ADR-051 outbox semantics:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `LeadCreated` | §9 | Successful `POST /leads` |
| `OpportunityWon` | §9 | `POST /opportunities/{id}:mark-won` |
| `OpportunityLost` | §9 | `POST /opportunities/{id}:mark-lost` |
| `ActivityLogged` | §9 | Successful `POST /activities` |
| `CampaignSent` | §9 | Successful send transition on `POST /campaigns/{id}/sends` |

Consumed events (read-only inbound; Publication §10): `CustomerCreated`, `SalesInvoiceIssued`, `ServiceTicketClosed`.

No event is introduced beyond Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route.
- Transport TLS ≥ 1.2.
- PII redaction on responses per consent state.
- Rate limiting per tenant and per token.

## 18. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (Campaign Send) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-028 (Publication §11).

## 19. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 20. Acceptance Criteria

API-006 is Accepted when:

1. Every endpoint in §6 maps to a Publication §7 or §8 anchor.
2. Every event in §15 maps to Publication §9 or §10.
3. Validation rules in §9 restate Publication §6 verbatim.
4. Audit, security, and rate-limit checks pass the platform baseline.
5. No endpoint or event outside the Publication exists in the surface.

## 21. Traceability Matrix

| Publication § | Anchor | API-006 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Account | Endpoints | §6.1 |
| §7 Master Data — Contact | Endpoints | §6.2 |
| §7 Master Data — Lead | Endpoints | §6.3 |
| §7 Master Data — Opportunity | Endpoints | §6.4 |
| §7 Master Data — Campaign/Segment | Endpoints | §6.5 |
| §8 Transactions — Activity/Meeting | Endpoints | §6.6 |
| §8 Transactions — Campaign Send | Endpoints | §6.7 |
| §3, §4.6 Reports & 360 | Endpoints | §6.8 |
| §3 Operations Config | Endpoints | §6.9 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §17, §18 |
| §12 Dependencies | Cross-module | §15 (events), §17 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope) |
| §15 Non-Goals | Exclusions | §2 |

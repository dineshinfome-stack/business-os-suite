---
title: "API-011 — AMC API Solution Design"
summary: "API Solution Design for MOD-011 AMC. Derives every endpoint, request/response model, webhook, and event exclusively from MOD-011 Module Publication."
spec_id: "API-011_SOLUTION_DESIGN"
module_id: "MOD-011"
module_name: "AMC"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/amc/MODULE_PRD.md", "docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-011", "amc", "API-011"]
document_type: "API Solution Design"
---

# API-011 — AMC API Solution Design

> **Source of Truth:** [`MOD-011 Module Publication`](../../../45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md). Every endpoint, request/response model, webhook, and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint, model, webhook, or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the AMC bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-011, MOB-011, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; preventive schedule generation endpoints (Publication §4.2); read APIs for AMC reports and dashboards (Publication §3, §4.4); event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** usage-based-contract APIs, cross-module KPI authoring, and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-011 §7). Customer (external actor) endpoints are scoped via ABAC to the caller's customer identity where authorized.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/amc/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints, request/response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. No endpoint below is invented; each cites the authorizing Publication section.

### 6.1 Contract (Publication §7 Contract, §8 Contract, §4.1)

- `GET /contracts` — list
- `POST /contracts` — create (Draft)
- `GET /contracts/{id}` — read
- `PATCH /contracts/{id}` — edit
- `POST /contracts/{id}:sign` — signs the contract; emits `ContractSigned` per Publication §9
- `POST /contracts/{id}:terminate` — terminates; blocks subsequent Entitlement create per Publication §6

### 6.2 Entitlement (Publication §7 Entitlement)

- `GET /entitlements`, `POST /entitlements`, `GET /entitlements/{id}`, `PATCH /entitlements/{id}`, `POST /entitlements/{id}:archive`
- Bound to a Contract per Publication §7. Post-termination-block rule enforced via ENG-012 (Publication §6, §11).
- Consumes `FieldVisitCompleted` (from MOD-012) and `ServiceTicketClosed` (from MOD-016) read-only per Publication §10 for consumption tracking.

### 6.3 Coverage (Publication §7 Coverage)

- `GET /coverages`, `POST /coverages`, `GET /coverages/{id}`, `PATCH /coverages/{id}`, `POST /coverages/{id}:archive`
- Bound to a Contract per Publication §7.

### 6.4 Renewal Terms (Publication §7 Renewal Terms)

- `GET /renewal-terms`, `POST /renewal-terms`, `GET /renewal-terms/{id}`, `PATCH /renewal-terms/{id}`, `POST /renewal-terms/{id}:archive`

### 6.5 Visit Schedule (Publication §8 Visit Schedule, §4.2)

- `GET /visit-schedules`, `POST /visit-schedules`, `GET /visit-schedules/{id}`, `PATCH /visit-schedules/{id}`
- `POST /visit-schedules/{id}:reschedule`, `POST /visit-schedules/{id}:cancel`
- `POST /contracts/{id}/visit-schedules:generate` — preventive schedule generation via ENG-013 / ENG-014 (Publication §11, §4.2).
- Server enforces the coverage-window rule via ENG-012 (Publication §6). Successful create/reschedule emits `VisitScheduled` per Publication §9.

### 6.6 Renewal (Publication §8 Renewal, §4.3)

- `GET /renewals`, `POST /renewals`, `GET /renewals/{id}`, `PATCH /renewals/{id}`
- `POST /renewals/{id}:propose` — server enforces the notice-period rule via ENG-012 (Publication §6).
- `POST /renewals/{id}:approve` — via ENG-011 (Publication §11). Successful approval emits `ContractRenewed` per Publication §9.
- Scheduled contract expiry via ENG-014 emits `ContractExpired` per Publication §9.

### 6.7 Contract Invoice (Publication §8 Contract Invoice, §4.3)

- `GET /contract-invoices`, `POST /contract-invoices`, `GET /contract-invoices/{id}`, `PATCH /contract-invoices/{id}`
- `POST /contract-invoices/{id}:issue` — issues the invoice via ENG-015 Voucher (Publication §11).
- Periodic invoice generation scheduled via ENG-014 (Publication §11, §4.3).
- Consumes `SalesInvoiceIssued` (from MOD-002) read-only per Publication §10.
- Ledger posting is owned by MOD-002 Accounting via `ENG-015` and `ENG-016` (Publication §11, §13).

### 6.8 Reports (Publication §3, §4.4)

- `GET /reports/active-contracts`
- `GET /reports/renewal-pipeline`
- `GET /reports/visit-compliance`
- `GET /reports/contract-profitability`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.4).

### 6.9 AMC Configuration (Publication §3, PRD §10)

- `GET/PUT /config/sla-definitions`
- `GET/PUT /config/escalation-policies`
- `GET/PUT /config/notice-periods`
- `GET/PUT /config/auto-renewal-rules`
- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Entitlements of a Contract, Coverages of a Contract, Visit Schedules of a Contract, Invoices of a Contract, Renewals of a Contract).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Entitlement/Coverage/Visit Schedule/Renewal/Contract Invoice → Contract; Renewal → Renewal Terms.
- Uniqueness for Contract / Contract Invoice / Renewal numbers per ENG-017 numbering series (Publication §3, §11).
- Coverage-window rule: Visit Schedule create/reschedule blocked outside the Contract's coverage window (Publication §6).
- Notice-period rule: Renewal propose blocked after the notice period has ended (Publication §6).
- Post-termination rule: Entitlement create blocked on a terminated Contract (Publication §6).
- Consumed events treated as read-only inputs (Publication §10, §13).
- Approval-routing invariants per AMC configuration (Publication §3, §11 ENG-011).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "AMC.VISIT_OUTSIDE_COVERAGE", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `AMC.VISIT_OUTSIDE_COVERAGE` — Visit Schedule create/reschedule blocked outside the contract's coverage window (§6).
- `AMC.RENEWAL_NOTICE_PERIOD_EXPIRED` — Renewal propose blocked after the notice period ended (§6).
- `AMC.CONTRACT_TERMINATED_ENTITLEMENT_BLOCKED` — Entitlement create attempted on a terminated Contract (§6).
- `AMC.CONSUMED_EVENT_READ_ONLY` — write attempted on a consumed event (§10, §13).
- `AMC.APPROVAL_ROUTING_UNRESOLVED` — approval routing returned zero approvers (§11 ENG-011).
- `AMC.LEDGER_OWNED_BY_ACCOUNTING` — posting attempted from AMC; posting is owned by MOD-002 (§13).
- `AMC.CUSTOMER_OWNED_BY_CRM` — Customer mutation attempted from AMC; Customer master is owned by MOD-006 (§13).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (contract, customer, status, coverage window, visit period, invoice period, renewal window, SLA status, escalation state). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume AMC state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-011.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11):

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `ContractSigned` | §9 | `POST /contracts/{id}:sign` (successful) |
| `VisitScheduled` | §9 | `POST /visit-schedules` / `:reschedule` (successful) or preventive generation |
| `ContractRenewed` | §9 | `POST /renewals/{id}:approve` (successful) |
| `ContractExpired` | §9 | Scheduled contract expiry via ENG-014 |

Consumed events (read-only inbound; Publication §10): `FieldVisitCompleted` (from MOD-012 Field Service), `ServiceTicketClosed` (from MOD-016 Service Desk), `SalesInvoiceIssued` (from MOD-002 Accounting), all via ENG-024.

No event is introduced beyond Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; Customer-scoped endpoints further scoped to caller's own customer identity where authorized.
- Transport TLS ≥ 1.2.
- Cost-sensitive fields (contract values, invoice amounts) redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (preventive schedule generation, periodic invoice generation, read-model refresh) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-011 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.2 / §4.3 / §4.4 for scheduling / billing & renewals / reports), every event in §15 maps to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-011 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Contract | Endpoints | §6.1 |
| §7 Master Data — Entitlement | Endpoints | §6.2 |
| §7 Master Data — Coverage | Endpoints | §6.3 |
| §7 Master Data — Renewal Terms | Endpoints | §6.4 |
| §8 Transactions — Contract | Endpoints | §6.1 |
| §8 Transactions — Visit Schedule | Endpoints | §6.5 |
| §8 Transactions — Renewal | Endpoints | §6.6 |
| §8 Transactions — Contract Invoice | Endpoints | §6.7 |
| §3 / §4.4 Reports & Audit Readiness | Endpoints | §6.8 |
| §3 AMC Configuration | Endpoints | §6.9 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (posting/CRM ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

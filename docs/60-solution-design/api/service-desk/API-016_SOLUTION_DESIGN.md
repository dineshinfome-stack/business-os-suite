---
title: "API-016 — Service Desk API Solution Design"
summary: "API Solution Design for MOD-016 Service Desk. Derives every endpoint, request/response model, webhook, and event exclusively from MOD-016 Module Publication."
spec_id: "API-016_SOLUTION_DESIGN"
module_id: "MOD-016"
module_name: "Service Desk"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/service-desk/MODULE_PRD.md", "docs/40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-016", "service-desk", "API-016"]
document_type: "API Solution Design"
---

# API-016 — Service Desk API Solution Design

> **Source of Truth:** [`MOD-016 Module Publication`](../../../45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md). Every endpoint, request/response model, webhook, and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint, model, webhook, or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the Service Desk bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-016, MOB-016, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7 (Ticket Category, SLA Policy, Knowledge Article); lifecycle operations on transactions in Publication §8 (Service Ticket, SLA Breach Event, CSAT Response) plus CSAT Survey issuance and Macro authoring/execution per Publication §4.4; Service Ticket endpoints emitting `ServiceTicketCreated` and `ServiceTicketClosed` (Publication §9) with multi-channel capture, categorization/routing execution, parent/child relations, and close-with-open-child-task enforcement (§6); SLA endpoints emitting `SLAPaused`, `SLAResumed`, `SLABreached`, and `EscalationTriggered` (§9); Knowledge Article endpoints emitting `KnowledgeArticlePublished` (§9) with review-before-publish enforcement (§6); Macro endpoints emitting `MacroExecuted` (§9); CSAT endpoints emitting `CSATSurveySent` and `CSATResponseReceived` (§9) with single-response enforcement (§6); read APIs for Service Desk reports and dashboards (Publication §3, §4.5) with analytics/compliance snapshot endpoints emitting `AnalyticsSnapshotGenerated` and `ComplianceReportGenerated` (§9); event publication per Publication §9; event consumption per Publication §10 (`FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`).

**Out of scope (Publication §15):** AI triage and suggested responses, community forums, cross-module KPI authoring APIs, ledger-posting APIs (MOD-016 declares no ledger effects), and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-016 §7). Multi-channel intake endpoints are further constrained by ENG-023 channel scope.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/service-desk/<resource>`.
- Idempotent methods use `Idempotency-Key`; Service Ticket Close, Knowledge Article Publish, CSAT Survey Dispatch, Analytics Snapshot, and Compliance Report Generate require an `Idempotency-Key` to prevent duplicate emission of the corresponding Publication §9 event.
- Timestamps in RFC 3339 UTC.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints, request models, response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. Event names shall be exactly those defined in the Publication (Publication §9). No endpoint or event below is invented; each cites the authorizing Publication section.

### 6.1 Ticket Category (Publication §7 Ticket Category, §4.1)

- `GET /ticket-categories`, `POST /ticket-categories`, `GET /ticket-categories/{id}`, `PATCH /ticket-categories/{id}`, `POST /ticket-categories/{id}:archive`

### 6.2 SLA Policy (Publication §7 SLA Policy, §4.1)

- `GET /sla-policies`, `POST /sla-policies`, `GET /sla-policies/{id}`, `PATCH /sla-policies/{id}`, `POST /sla-policies/{id}:archive`

### 6.3 Knowledge Article (Publication §7 Knowledge Article, §4.4)

- `GET /knowledge-articles`, `POST /knowledge-articles`, `GET /knowledge-articles/{id}`, `PATCH /knowledge-articles/{id}`, `POST /knowledge-articles/{id}:archive`
- `POST /knowledge-articles/{id}:submit-for-review` — via ENG-010/011 (Publication §11).
- `POST /knowledge-articles/{id}:approve` / `:reject` — via ENG-011 (Publication §11).
- `POST /knowledge-articles/{id}:publish` — server enforces Review-Before-Publish Rule via ENG-011/012 (Publication §6); emits `KnowledgeArticlePublished` per Publication §9.
- `GET /knowledge-articles:search` — via ENG-020 (Publication §4.4, §11).

### 6.4 Service Ticket (Publication §8 Service Ticket, §4.2)

- `GET /service-tickets`, `GET /service-tickets/{id}`
- `POST /service-tickets` — manual/agent create; emits `ServiceTicketCreated` per Publication §9.
- `POST /service-tickets:capture-email`, `:capture-chat`, `:capture-whatsapp`, `:capture-voice` — multi-channel capture routed through ENG-023 (Publication §4.2, §11); emits `ServiceTicketCreated` per Publication §9.
- `PATCH /service-tickets/{id}` — edit while open.
- `POST /service-tickets/{id}:categorize` / `:route` — deterministic evaluation via ENG-012 against Ticket Category and routing rules (Publication §4.2, §11).
- `POST /service-tickets/{id}:assign` / `:reassign` — Publication §4.2.
- `POST /service-tickets/{id}:reply` — Publication §4.2.
- `POST /service-tickets/{id}/child-tickets` / `POST /service-tickets/{id}:link-parent` — parent/child relations (Publication §4.2).
- `POST /service-tickets/{id}:apply-macro` — deterministic via ENG-012; ticket history unchanged (Publication §4.4); emits `MacroExecuted` per Publication §9.
- `POST /service-tickets/{id}:attach-knowledge-article` — Publication §4.4.
- `POST /service-tickets/{id}:close` — server enforces Close-with-Open-Child-Task Rule via ENG-012 (Publication §6); emits `ServiceTicketClosed` per Publication §9.
- `POST /service-tickets/{id}:reopen` — Publication §4.2.

### 6.5 SLA Clock & SLA Breach Event (Publication §8 SLA Breach Event, §4.3)

- `GET /sla-clocks` / `GET /sla-clocks/{ticket_id}` — read-only projection over Service Ticket SLA state (Publication §4.3).
- `POST /sla-clocks/{ticket_id}:evaluate` — server-driven evaluation via ENG-012 against SLA Policy + Business Hours (Publication §4.3, §11); emits `SLAPaused` or `SLAResumed` per Publication §9 when pause-on-customer-waiting state transitions.
- `GET /sla-breach-events`, `GET /sla-breach-events/{id}`
- `POST /sla-breach-events` — server-driven on breach detection; emits `SLABreached` per Publication §9.
- `POST /sla-breach-events/{id}:execute-escalation` — deterministic Escalation-Matrix execution via ENG-013 (Publication §4.3, §11); emits `EscalationTriggered` per Publication §9.
- `POST /sla-breach-events/{id}:approve` — via ENG-011 for approval-gated escalations (Publication §4.3, §11).

### 6.6 Macro (Publication §4.4)

- `GET /macros`, `POST /macros`, `GET /macros/{id}`, `PATCH /macros/{id}`, `POST /macros/{id}:archive`
- (Macro application on a Service Ticket is served by `POST /service-tickets/{id}:apply-macro` — see §6.4.)

### 6.7 CSAT Survey & CSAT Response (Publication §8 CSAT Response, §4.4)

- `GET /csat-surveys`, `POST /csat-surveys`, `GET /csat-surveys/{id}`
- `POST /csat-surveys/{id}:dispatch` — dispatches only after eligible ticket closure via ENG-025 (Publication §4.4, §11); emits `CSATSurveySent` per Publication §9.
- `GET /csat-responses`, `GET /csat-responses/{id}`
- `POST /csat-responses` — server enforces Single-Response Rule via ENG-012 (Publication §6); emits `CSATResponseReceived` per Publication §9.

### 6.8 Reports & Compliance (Publication §3, §4.5)

- `GET /reports/ticket-volume`
- `GET /reports/sla-adherence`
- `GET /reports/csat-trend`
- `GET /reports/agent-productivity`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.5).
- `POST /reports:snapshot` — emits `AnalyticsSnapshotGenerated` per Publication §9.
- `POST /reports:compliance` — generates from ENG-004 audit sources (Publication §4.5, §11); emits `ComplianceReportGenerated` per Publication §9.
- `GET /inbound/field-visits` / `GET /inbound/customers` / `GET /inbound/opportunities` — read-only projections over consumed `FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon` (Publication §10).

### 6.9 Service Desk Configuration (Publication §3, §4.1, PRD §10)

- `GET/PUT /config/routing-rules` — via ENG-005 (Publication §11).
- `GET/PUT /config/escalation-matrices` — via ENG-005 (Publication §11).
- `GET/PUT /config/business-hours` — via ENG-005 (Publication §11).
- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).
- `GET/PUT /config/customer-waiting-states` — states used by ENG-012 for the Pause-on-Customer-Waiting Rule (Publication §4.3, §6, §11).

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. Multi-channel capture payloads reference an ENG-023 channel transaction handle (Publication §4.2, §11). No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Tickets of a Category, Child Tickets of a Parent, SLA Clock of a Ticket, SLA Breach Events of a Ticket, CSAT Response of a Survey, Surveys of a Ticket, Knowledge Articles of a Category). Rendered document responses include the generated document reference from ENG-007 (Publication §11).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Service Ticket → Ticket Category + SLA Policy + Customer (Customer resolved read-only against MOD-006 CRM per Publication §12); Child Ticket → Parent Ticket; SLA Breach Event → Service Ticket + SLA Policy; CSAT Response → CSAT Survey → Service Ticket; Knowledge Article → owning Ticket Category.
- Uniqueness for Service Ticket, SLA Breach Event, and CSAT Response numbers per ENG-017 numbering series (Publication §3, §11).
- Close-with-Open-Child-Task Rule: `POST /service-tickets/{id}:close` rejects when any linked child task remains open (Publication §6).
- Review-Before-Publish Rule: `POST /knowledge-articles/{id}:publish` rejects without a captured review approval (Publication §6).
- Single-Response Rule: `POST /csat-responses` rejects when a response for the referenced CSAT Survey already exists (Publication §6).
- Pause-on-Customer-Waiting Rule: SLA Clock evaluations deterministically pause/resume based on configured customer-waiting states; write endpoints on clock state directly are rejected — evaluation is server-driven only (Publication §6, §4.3).
- Consumed events (`FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`) treated as read-only inputs; write endpoints on those event streams reject (Publication §10, §13).
- Numbering-series invariants per ENG-017 (Publication §11).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "SERVICE_DESK.CLOSE_BLOCKED_OPEN_CHILDREN", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `SERVICE_DESK.CLOSE_BLOCKED_OPEN_CHILDREN` — Service Ticket close blocked; one or more child tasks remain open (§6).
- `SERVICE_DESK.REVIEW_REQUIRED_BEFORE_PUBLISH` — Knowledge Article publish blocked without a captured review approval (§6).
- `SERVICE_DESK.CSAT_SINGLE_RESPONSE_VIOLATION` — CSAT Response create blocked; a response already exists for the referenced CSAT Survey (§6).
- `SERVICE_DESK.SLA_CLOCK_WRITE_NOT_PERMITTED` — direct write on SLA Clock state attempted; evaluations are server-driven (§4.3, §6).
- `SERVICE_DESK.MACRO_HISTORY_MUTATION_NOT_PERMITTED` — attempted mutation of ticket history via macro apply (§4.4).
- `SERVICE_DESK.FIELD_VISIT_EVENT_READ_ONLY` — write attempted on the consumed `FieldVisitCompleted` (§10, §13).
- `SERVICE_DESK.CUSTOMER_EVENT_READ_ONLY` — write attempted on the consumed `CustomerCreated` (§10, §13).
- `SERVICE_DESK.OPPORTUNITY_EVENT_READ_ONLY` — write attempted on the consumed `OpportunityWon` (§10, §13).
- `SERVICE_DESK.CONSUMED_EVENT_READ_ONLY` — write attempted on any consumed event (§10, §13).
- `SERVICE_DESK.KPI_OWNED_BY_MOD017` — cross-module KPI authoring attempted from Service Desk; authority is with MOD-017 (§13).
- `SERVICE_DESK.CUSTOMER_MASTER_READ_ONLY` — write attempted on Customer master; ownership at MOD-006 (§13).
- `SERVICE_DESK.FIELD_SERVICE_TRANSACTION_READ_ONLY` — write attempted on Field Service transaction; ownership at MOD-012 (§13).
- `SERVICE_DESK.LEDGER_NOT_APPLICABLE` — posting attempted from Service Desk; MOD-016 declares no ledger effects (§13).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (channel, category, SLA policy, priority, assignee, queue, state, breach status, article visibility, period). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume Service Desk state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-016.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11). Event names are exactly those defined in the Stage 0 Publication:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `ServiceTicketCreated` | §9 | `POST /service-tickets` (successful) and `POST /service-tickets:capture-{channel}` (successful) |
| `ServiceTicketClosed` | §9 | `POST /service-tickets/{id}:close` (successful) |
| `SLAPaused` | §9 | `POST /sla-clocks/{ticket_id}:evaluate` on pause-state transition (server-driven) |
| `SLAResumed` | §9 | `POST /sla-clocks/{ticket_id}:evaluate` on resume-state transition (server-driven) |
| `SLABreached` | §9 | `POST /sla-breach-events` (server-driven on breach detection) |
| `EscalationTriggered` | §9 | `POST /sla-breach-events/{id}:execute-escalation` (successful) |
| `KnowledgeArticlePublished` | §9 | `POST /knowledge-articles/{id}:publish` (successful) |
| `MacroExecuted` | §9 | `POST /service-tickets/{id}:apply-macro` (successful) |
| `CSATSurveySent` | §9 | `POST /csat-surveys/{id}:dispatch` (successful) |
| `CSATResponseReceived` | §9 | `POST /csat-responses` (successful) |
| `AnalyticsSnapshotGenerated` | §9 | `POST /reports:snapshot` (successful) |
| `ComplianceReportGenerated` | §9 | `POST /reports:compliance` (successful) |

Consumed events (read-only inbound; Publication §10): `FieldVisitCompleted` (from MOD-012 Field Service), `CustomerCreated` (from MOD-006 CRM), `OpportunityWon` (from MOD-006 CRM), all via ENG-024. Service-Desk-published events (`ServiceTicketCreated`, `ServiceTicketClosed`, `SLABreached`, `EscalationTriggered`, `KnowledgeArticlePublished`, `MacroExecuted`, `CSATResponseReceived`) are also consumed by the Service Desk read model per Publication §10.

No event is introduced beyond Publication §9. Event names are exactly those defined in Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014. Macro executions, knowledge-article publishes, escalation triggers, CSAT dispatches/receipts, and compliance snapshots are audited.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; approval routes (knowledge-article approve/reject/publish, escalation approve) require the caller's role to hold the corresponding approver grant.
- Transport TLS ≥ 1.2.
- Multi-channel intake payloads never accept a client-asserted originating identity — identity is resolved via ENG-001 and, for external customer channels, via the ENG-023 channel binding (Publication §4.2, §11).
- PII-aware redaction on customer-visible fields per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- `POST /service-tickets`, `POST /service-tickets/{id}:categorize`, `POST /service-tickets/{id}:reply`, and `POST /service-tickets/{id}:close` target sub-second server round-trip.
- Batch endpoints (snapshot, compliance) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-016 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.1 / §4.2 / §4.3 / §4.4 / §4.5 for configuration / capture-lifecycle / SLA-escalation / KB-macros-CSAT / analytics-compliance), every event in §15 maps exactly to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-016 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Ticket Category | Endpoints | §6.1 |
| §7 Master Data — SLA Policy | Endpoints | §6.2 |
| §7 Master Data — Knowledge Article | Endpoints | §6.3 |
| §8 Transactions — Service Ticket | Endpoints | §6.4 |
| §8 Transactions — SLA Breach Event | Endpoints | §6.5 |
| §4.4 Macros | Endpoints | §6.6 |
| §8 Transactions — CSAT Response (+ CSAT Survey per §4.4) | Endpoints | §6.7 |
| §3 / §4.5 Reports & Audit Readiness | Endpoints | §6.8 |
| §3 Service Desk Configuration | Endpoints | §6.9 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15, §6.8 (inbound projections) |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §9 (CRM read-only), §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

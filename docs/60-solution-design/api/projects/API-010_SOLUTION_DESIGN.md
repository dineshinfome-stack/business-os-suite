---
title: "API-010 — Projects API Solution Design"
summary: "API Solution Design for MOD-010 Projects. Derives every endpoint, request/response model, webhook, and event exclusively from MOD-010 Module Publication."
spec_id: "API-010_SOLUTION_DESIGN"
module_id: "MOD-010"
module_name: "Projects"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "Delivery"
source_publication: "docs/45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/projects/MODULE_PRD.md", "docs/40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-010", "projects", "API-010"]
document_type: "API Solution Design"
---

# API-010 — Projects API Solution Design

> **Source of Truth:** [`MOD-010 Module Publication`](../../../45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md). Every endpoint, request/response model, webhook, and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint, model, webhook, or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the Projects bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-010, MOB-010, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; project budgets and project-cost roll-up endpoints (Publication §4.4); read APIs for Projects reports and dashboards (Publication §3, §4.5); event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** portfolio-management APIs, AI resource-matching endpoints, predictive-overrun-alert feeds, cross-module KPI authoring, and deferred Event Catalog items.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-010 §7). Client (external actor) endpoints are scoped via ABAC to the caller's client identity where authorized.

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/projects/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary and effort fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints, request/response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. No endpoint below is invented; each cites the authorizing Publication section.

### 6.1 Project (Publication §7 Project)

- `GET /projects` — list
- `POST /projects` — create; emits `ProjectCreated` per Publication §9
- `GET /projects/{id}` — read
- `PATCH /projects/{id}` — edit
- `POST /projects/{id}:archive` — archive (lifecycle per Baseline §7 / PRD §5)

### 6.2 Task (Publication §7 Task)

- `GET /tasks`, `POST /tasks`, `GET /tasks/{id}`, `PATCH /tasks/{id}`, `POST /tasks/{id}:archive`
- Bound to a Project per Publication §7.

### 6.3 Milestone (Publication §7 Milestone)

- `GET /milestones`, `POST /milestones`, `GET /milestones/{id}`, `PATCH /milestones/{id}`, `POST /milestones/{id}:archive`
- Bound to a Project per Publication §7.

### 6.4 Resource (Publication §7 Resource)

- `GET /resources`, `POST /resources`, `GET /resources/{id}`, `PATCH /resources/{id}`, `POST /resources/{id}:archive`
- Employee reference resolved read-only against MOD-007 (Publication §12).

### 6.5 Rate Card (Publication §7 Rate Card)

- `GET /rate-cards`, `POST /rate-cards`, `GET /rate-cards/{id}`, `PATCH /rate-cards/{id}`, `POST /rate-cards/{id}:archive`
- Currency handled via ENG-018 (Publication §11).

### 6.6 Milestone Completion (Publication §8 Milestone Completion, §4.2)

- `GET /milestone-completions`, `POST /milestone-completions`, `GET /milestone-completions/{id}`, `PATCH /milestone-completions/{id}`
- `POST /milestone-completions/{id}:approve` — via ENG-011 (Publication §11). Successful completion emits `MilestoneCompleted` per Publication §9.

### 6.7 Change Request (Publication §8 Change Request, §4.2)

- `GET /change-requests`, `POST /change-requests`, `GET /change-requests/{id}`, `PATCH /change-requests/{id}`
- `POST /change-requests/{id}:approve` — via ENG-011 (Publication §11).

### 6.8 Timesheet (Publication §8 Timesheet, §4.3)

- `GET /timesheets`, `POST /timesheets`, `GET /timesheets/{id}`, `PATCH /timesheets/{id}`
- `POST /timesheets/{id}:submit` — server enforces capacity-justification rule via ENG-012 (Publication §6, §11).
- `POST /timesheets/{id}:approve` — via ENG-011 (Publication §11). Successful approval emits `TimesheetApproved` per Publication §9.
- Consumes `EmployeeHired` (from MOD-007) and `PayrollProcessed` (from MOD-008) read-only per Publication §10.

### 6.9 Project Budget & Cost Roll-up (Publication §3, §4.4)

- `GET /budgets`, `POST /budgets`, `GET /budgets/{id}`, `PATCH /budgets/{id}`
- `GET /projects/{id}/costs` — project-cost roll-up (Publication §4.4).
- `POST /projects/{id}/costs:refresh` — recomputes read-model cost roll-up; consumes `PayrollProcessed` read-only per Publication §10.

### 6.10 Project Invoice (Publication §8 Project Invoice, §4.4)

- `GET /project-invoices`, `POST /project-invoices`, `GET /project-invoices/{id}`, `PATCH /project-invoices/{id}`
- `POST /project-invoices/{id}:issue` — issues the invoice via ENG-015 Voucher (Publication §11); server enforces milestone-invoiceable and fixed-price-decoupling rules via ENG-012 (Publication §6). Successful issuance emits `ProjectInvoiceIssued` per Publication §9.
- Consumes `SalesOrderConfirmed` (from MOD-003) read-only per Publication §10.
- Ledger posting is owned by MOD-002 Accounting via `ENG-015` and `ENG-016` (Publication §11, §13).

### 6.11 Reports (Publication §3, §4.5)

- `GET /reports/project-pnl`
- `GET /reports/utilization`
- `GET /reports/burn-down`
- `GET /reports/milestone-status`
- `GET /reports/overrun-analysis`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.5).

### 6.12 Projects Configuration (Publication §3, PRD §10)

- `GET/PUT /config/rate-cards`
- `GET/PUT /config/approval-hierarchy`
- `GET/PUT /config/billing-type`
- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization.

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Tasks of a Project, Milestones of a Project, Timesheets of a Project, Invoices of a Project, Change Requests of a Project, Cost roll-up of a Project).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Task/Milestone → Project, Timesheet → Project + Task + Resource, Resource → Employee (from MOD-007), Rate Card → currency.
- Uniqueness where the Publication implies enterprise-single (Project / Resource / Rate Card codes; Task and Milestone codes within their parent project; numbering series per PRD §10).
- Timesheet capacity-justification required when capacity is exceeded (Publication §6).
- Project Invoice release blocked for T&M unless the milestone is completed and approved (Publication §6).
- Fixed-price Project Invoice release decoupled from timesheet totals (Publication §6).
- Consumed events treated as read-only inputs (Publication §10, §13).
- Approval-routing invariants per Projects configuration (Publication §3, §11 ENG-011).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "PRJ.MILESTONE_NOT_INVOICEABLE", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `PRJ.CAPACITY_JUSTIFICATION_REQUIRED` — Timesheet submit blocked pending capacity justification (§6).
- `PRJ.MILESTONE_NOT_INVOICEABLE` — T&M Project Invoice issuance attempted before milestone completion + approval (§6).
- `PRJ.FIXED_PRICE_TIMESHEET_COUPLED` — Fixed-price Project Invoice attempted with timesheet-coupled inputs (§6).
- `PRJ.CONSUMED_EVENT_READ_ONLY` — write attempted on a consumed event (§10, §13).
- `PRJ.APPROVAL_ROUTING_UNRESOLVED` — approval routing returned zero approvers (§11 ENG-011).
- `PRJ.LEDGER_OWNED_BY_ACCOUNTING` — posting attempted from Projects; posting is owned by MOD-002 (§13).
- `PRJ.EMPLOYEE_OWNED_BY_HRMS` — Employee mutation attempted from Projects; Employee master is owned by MOD-007 (§13).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (project, task, milestone, resource, status, period, billing type, approval state, currency). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume Projects state via the platform Event Engine (§15). Webhooks are therefore **N/A** for API-010.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11) under ADR-051 outbox semantics:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `ProjectCreated` | §9 | `POST /projects` (successful create) |
| `MilestoneCompleted` | §9 | `POST /milestone-completions/{id}:approve` (successful) |
| `TimesheetApproved` | §9 | `POST /timesheets/{id}:approve` (successful) |
| `ProjectInvoiceIssued` | §9 | `POST /project-invoices/{id}:issue` (successful) |

Consumed events (read-only inbound; Publication §10): `EmployeeHired` (from MOD-007 HRMS), `PayrollProcessed` (from MOD-008 Payroll), `SalesOrderConfirmed` (from MOD-003 Sales), all via ENG-024.

No event is introduced beyond Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; Client-scoped endpoints further scoped to caller's own client identity where authorized.
- Transport TLS ≥ 1.2.
- Cost-sensitive fields (rate cards, budgets, invoice amounts) redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (cost roll-up, read-model refresh) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-010 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.2 / §4.3 / §4.4 / §4.5 for milestone completion / timesheets / budgets & billing / reports), every event in §15 maps to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-010 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Project | Endpoints | §6.1 |
| §7 Master Data — Task | Endpoints | §6.2 |
| §7 Master Data — Milestone | Endpoints | §6.3 |
| §7 Master Data — Resource | Endpoints | §6.4 |
| §7 Master Data — Rate Card | Endpoints | §6.5 |
| §8 Transactions — Milestone Completion | Endpoints | §6.6 |
| §8 Transactions — Change Request | Endpoints | §6.7 |
| §8 Transactions — Timesheet | Endpoints | §6.8 |
| §3 / §4.4 Budgets & Cost Roll-up | Endpoints | §6.9 |
| §8 Transactions — Project Invoice | Endpoints | §6.10 |
| §3 / §4.5 Reports & Audit Readiness | Endpoints | §6.11 |
| §3 Projects Config | Endpoints | §6.12 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §10 (posting/HRMS ownership codes) |
| §15 Non-Goals | Exclusions | §2 |

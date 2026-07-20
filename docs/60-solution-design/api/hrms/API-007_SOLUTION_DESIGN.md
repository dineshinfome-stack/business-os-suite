---
title: "API-007 — HRMS API Solution Design"
summary: "API Solution Design for MOD-007 HRMS. Derives every endpoint, model, and event exclusively from MOD-007 Module Publication."
spec_id: "API-007_SOLUTION_DESIGN"
module_id: "MOD-007"
module_name: "HRMS"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "People"
source_publication: "docs/45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/hrms/MODULE_PRD.md", "docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-007", "hrms", "API-007"]
document_type: "API Solution Design"
---

# API-007 — HRMS API Solution Design

> **Source of Truth:** [`MOD-007 Module Publication`](../../../45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md). Every endpoint and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the HRMS bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-007, MOB-007, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; read APIs for HR reports and dashboards (Publication §3, §4.6); Self-Service read/initiation APIs authorized by Publication §4.5; biometric attendance ingestion endpoint authorized by Publication §4.3 / §11 ENG-023; event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** payroll computation, ledger posting, statutory filing, learning content authoring, AI attrition risk, skill graph.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-007 §7). Self-Service endpoints enforce employee-scoped ABAC (caller `employee_id` = resource owner).

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/hrms/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary and quantity fields typed via platform primitives.
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints are derived deterministically from Publication §7 (masters) and §8 (transactions). No endpoint below is invented; each cites the authorizing Publication section.

### 6.1 Employee (Publication §7 Employee)

- `GET /employees` — list
- `POST /employees` — create
- `GET /employees/{id}` — read
- `PATCH /employees/{id}` — edit
- `POST /employees/{id}:archive` — archive (lifecycle per Publication §4.1)
- `GET /employees/{id}/org-tree` — org-structure projection (Publication §4.1)

### 6.2 Position (Publication §7 Position)

- `GET /positions`, `POST /positions`, `GET /positions/{id}`, `PATCH /positions/{id}`, `POST /positions/{id}:archive`

### 6.3 Department (Publication §7 Department)

- `GET /departments`, `POST /departments`, `GET /departments/{id}`, `PATCH /departments/{id}`, `POST /departments/{id}:archive`

### 6.4 Grade (Publication §7 Grade)

- `GET /grades`, `POST /grades`, `GET /grades/{id}`, `PATCH /grades/{id}`, `POST /grades/{id}:archive`

### 6.5 Shift (Publication §7 Shift)

- `GET /shifts`, `POST /shifts`, `GET /shifts/{id}`, `PATCH /shifts/{id}`, `POST /shifts/{id}:archive`

### 6.6 Leave Type (Publication §7 Leave Type)

- `GET /leave-types`, `POST /leave-types`, `GET /leave-types/{id}`, `PATCH /leave-types/{id}`, `POST /leave-types/{id}:archive`

### 6.7 Onboarding Task (Publication §8, §4.2)

- `GET /onboarding-tasks`, `POST /onboarding-tasks`, `GET /onboarding-tasks/{id}`, `PATCH /onboarding-tasks/{id}`
- `POST /onboarding-tasks/{id}:complete` — completion triggers `EmployeeHired` on the associated employee record per Publication §9.
- `POST /onboarding-tasks/{id}:route-approval` — Approval routing via ENG-011.

### 6.8 Exit Clearance (Publication §8, §4.2)

- `GET /exit-clearances`, `POST /exit-clearances`, `GET /exit-clearances/{id}`, `PATCH /exit-clearances/{id}`
- `POST /exit-clearances/{id}:complete` — completion triggers `EmployeeExited` per Publication §9.
- `POST /exit-clearances/{id}:route-approval`

### 6.9 Attendance (Publication §8, §4.3)

- `GET /attendance`, `POST /attendance`, `GET /attendance/{id}`, `PATCH /attendance/{id}`
- `POST /attendance:ingest-biometric` — ingestion endpoint for biometric feeds via ENG-023 (Publication §4.3, §11).
- Successful attendance capture emits `AttendanceMarked` per Publication §9.

### 6.10 Leave Request (Publication §8, §6)

- `GET /leave-requests`, `POST /leave-requests`, `GET /leave-requests/{id}`, `PATCH /leave-requests/{id}`
- `POST /leave-requests/{id}:submit`
- `POST /leave-requests/{id}:approve` — server rejects self-approval per Publication §6.
- `POST /leave-requests/{id}:reject`
- Successful approval emits `LeaveApproved` per Publication §9.
- `GET /leave-balances?employee_id=` — leave balance projection (Publication §4.3).

### 6.11 Appraisal (Publication §8, §4.4)

- `GET /appraisals`, `POST /appraisals`, `GET /appraisals/{id}`, `PATCH /appraisals/{id}`
- `POST /appraisals/{id}:route-appraiser`
- `POST /appraisals/{id}:capture-ratings`
- `POST /appraisals/{id}:complete` — emits `AppraisalCompleted` per Publication §9.

### 6.12 Self-Service (Publication §4.5)

- `GET /self-service/profile` — current employee profile.
- `GET /self-service/attendance-summary`
- `GET /self-service/leave-balance`
- `POST /self-service/leave-requests` — alias into §6.10 scoped to current employee.
- `GET /self-service/hr-documents` — HR document list via ENG-007 (Publication §11).

### 6.13 L&D Consumption (Publication §4.5, §10)

- `GET /learning/records?employee_id=` — read-only projection of consumed `TrainingCompleted` events.

### 6.14 Reports (Publication §3, §4.6)

- `GET /reports/headcount`
- `GET /reports/attendance-summary`
- `GET /reports/leave-balance`
- `GET /reports/attrition`
- `GET /reports/performance-distribution`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.6).

### 6.15 HR Configuration (Publication §3, PRD §10)

- `GET/PUT /config/approval-hierarchies`
- `GET/PUT /config/shift-patterns`
- `GET/PUT /config/notice-periods`
- `GET/PUT /config/leave-policies`

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization. Sensitive fields respect data-classification (Publication §6).

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Attendance of an Employee, Leave Requests of an Employee, Appraisals of an Employee, Onboarding/Exit tasks of an Employee).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Employee → Position/Department/Grade/Shift identifiers.
- Uniqueness where Publication implies enterprise-single (employee code within tenant).
- Leave balance non-negative unless Leave Type permits negative (Publication §6).
- Leave self-approval prevention (Publication §6).
- Data-classification enforcement for sensitive employee fields (Publication §6).
- Approval-routing invariants per HR operations configuration (Publication §3, §11 ENG-011).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "HRMS.LEAVE_SELF_APPROVAL_FORBIDDEN", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `HRMS.LEAVE_SELF_APPROVAL_FORBIDDEN` — self-approval rule violated (§6).
- `HRMS.LEAVE_BALANCE_NEGATIVE_FORBIDDEN` — negative balance blocked when Leave Type does not permit (§6).
- `HRMS.EMPLOYEE_ARCHIVED` — mutation attempted on an archived employee.
- `HRMS.MASTER_IMMUTABLE` — mutation attempted on an externally-owned master.
- `HRMS.APPROVAL_ROUTING_UNRESOLVED` — approval routing returned zero approvers (§11 ENG-011).
- `HRMS.DATA_CLASSIFICATION_DENIED` — caller lacks clearance for a sensitive field (§6).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity attributes (department, grade, shift, employment status, date ranges). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume HRMS state via the platform Event Engine (§15). External biometric and learning platforms are ingested via ENG-023 (§6.9, §6.13). Webhooks are therefore **N/A** for API-007.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11) under ADR-051 outbox semantics:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `EmployeeHired` | §9 | `POST /onboarding-tasks/{id}:complete` (terminal onboarding) |
| `EmployeeExited` | §9 | `POST /exit-clearances/{id}:complete` (terminal exit clearance) |
| `AttendanceMarked` | §9 | Successful `POST /attendance` or successful biometric ingestion (§6.9) |
| `LeaveApproved` | §9 | `POST /leave-requests/{id}:approve` (approval terminal state) |
| `AppraisalCompleted` | §9 | `POST /appraisals/{id}:complete` |

Consumed events (read-only inbound; Publication §10): `TrainingCompleted` (external Learning, via ENG-023), `PayrollProcessed` (MOD-008 Payroll).

No event is introduced beyond Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; Self-Service further scoped to caller's own `employee_id`.
- Transport TLS ≥ 1.2.
- Data-classification-based redaction on sensitive employee responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch/ingestion endpoints (biometric ingestion) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-028 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-007 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.3 / §4.5 / §4.6 for reports/self-service/ingestion), every event in §15 maps to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-007 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Employee | Endpoints | §6.1 |
| §7 Master Data — Position/Department/Grade/Shift | Endpoints | §6.2–§6.5 |
| §7 Master Data — Leave Type | Endpoints | §6.6 |
| §8 Transactions — Onboarding Task | Endpoints | §6.7 |
| §8 Transactions — Exit Clearance | Endpoints | §6.8 |
| §8 Transactions — Attendance | Endpoints | §6.9 |
| §8 Transactions — Leave Request | Endpoints | §6.10 |
| §8 Transactions — Appraisal | Endpoints | §6.11 |
| §4.5 Self-Service | Endpoints | §6.12 |
| §4.5 / §10 L&D Consumption | Endpoints | §6.13 |
| §3 / §4.6 Reports & Audit Readiness | Endpoints | §6.14 |
| §3 Operations Config | Endpoints | §6.15 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope) |
| §15 Non-Goals | Exclusions | §2 |

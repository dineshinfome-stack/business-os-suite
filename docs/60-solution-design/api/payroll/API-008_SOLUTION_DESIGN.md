---
title: "API-008 — Payroll API Solution Design"
summary: "API Solution Design for MOD-008 Payroll. Derives every endpoint, model, and event exclusively from MOD-008 Module Publication."
spec_id: "API-008_SOLUTION_DESIGN"
module_id: "MOD-008"
module_name: "Payroll"
platform: "api"
version: "1.0"
status: "Design Complete"
owner: "People"
source_publication: "docs/45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/payroll/MODULE_PRD.md", "docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "api", "MOD-008", "payroll", "API-008"]
document_type: "API Solution Design"
---

# API-008 — Payroll API Solution Design

> **Source of Truth:** [`MOD-008 Module Publication`](../../../45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md). Every endpoint and event derives from the Publication's master data (§7), transactions (§8), events (§9–§10), and boundaries (§13). No endpoint or event is introduced that is absent from the Publication.

## 1. Purpose

Provide the machine interface for the Payroll bounded context — a consistent, versioned, tenant-isolated HTTP API and event surface consumed by WEB-008, MOB-008, and downstream modules (Publication §12).

## 2. API Scope

**In scope:** CRUD on entities in Publication §7; lifecycle operations on transactions in Publication §8; read APIs for Payroll reports and dashboards (Publication §3, §4.6); disbursement file generation and delivery status (Publication §4.5, §11 ENG-023); posting invocation via ENG-015 / ENG-016 (Publication §4.5, §11); event publication per Publication §9; event consumption per Publication §10.

**Out of scope (Publication §15):** multi-country payroll harmonization APIs, AI anomaly detection endpoints, cross-module KPI authoring, and locales not yet activated.

## 3. Authentication

Delegated to ENG-001 Identity Engine (Publication §11). All requests carry a platform-issued bearer token bound to `tenant_id` per ADR-011.

## 4. Authorization

Delegated to ENG-002/003 (Publication §11) under RBAC + ABAC (ADR-032). Every mutation and every read is authorized against the caller's business role (PRD §3, restated in Publication §7 / WEB-008 §7). Employee-scoped reads (own payslip, own reimbursement, own advance) enforce ABAC (caller `employee_id` = resource owner).

## 5. API Standards

- REST over HTTPS; JSON request/response.
- Resource URIs `/api/v1/payroll/<resource>`.
- Idempotent methods use `Idempotency-Key`.
- Timestamps in RFC 3339 UTC; monetary and quantity fields typed via platform primitives (ENG-018).
- `tenant_id` inferred from the token — never accepted from client payloads.
- Errors follow the platform error envelope (§10).

## 6. Endpoint Catalogue

Endpoints are derived deterministically from Publication §7 (masters) and §8 (transactions). No endpoint below is invented; each cites the authorizing Publication section.

### 6.1 Salary Structure (Publication §7 Salary Structure)

- `GET /salary-structures` — list
- `POST /salary-structures` — create
- `GET /salary-structures/{id}` — read
- `PATCH /salary-structures/{id}` — edit
- `POST /salary-structures/{id}:archive` — archive (lifecycle per Baseline §7 / PRD §5)

### 6.2 Component (Publication §7 Component)

- `GET /components`, `POST /components`, `GET /components/{id}`, `PATCH /components/{id}`, `POST /components/{id}:archive`

### 6.3 Bank Mandate (Publication §7 Bank Mandate)

- `GET /bank-mandates`, `POST /bank-mandates`, `GET /bank-mandates/{id}`, `PATCH /bank-mandates/{id}`, `POST /bank-mandates/{id}:archive`

### 6.4 Statutory Setup (Publication §7 Statutory Setup, §4.3)

- `GET /statutory-setups`, `POST /statutory-setups`, `GET /statutory-setups/{id}`, `PATCH /statutory-setups/{id}`, `POST /statutory-setups/{id}:archive`
- Locale scope enforced per Publication §4.3; locale packs read via ENG-006 (Publication §11).

### 6.5 Payroll Run (Publication §8 Payroll Run, §4.2)

- `GET /payroll-runs`, `POST /payroll-runs`, `GET /payroll-runs/{id}`, `PATCH /payroll-runs/{id}`
- `POST /payroll-runs/{id}:consume-inputs` — consumes HRMS signals (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) read-only per Publication §10.
- `POST /payroll-runs/{id}:compute-gross` — gross computation (batch envelope per PRD §11).
- `POST /payroll-runs/{id}:compute-statutory` — per-locale statutory evaluation via ENG-019 (Publication §11).
- `POST /payroll-runs/{id}:route-approval` — approval routing via ENG-011 (Publication §11).
- `POST /payroll-runs/{id}:finalize` — server blocks finalization unless all statutory computations complete (Publication §6).
- `POST /payroll-runs/{id}:reverse` — creates a new reversing run per Publication §6; does not mutate the original.
- Successful finalization emits `PayrollProcessed` per Publication §9.

### 6.6 Reimbursement (Publication §8 Reimbursement, §4.4)

- `GET /reimbursements`, `POST /reimbursements`, `GET /reimbursements/{id}`, `PATCH /reimbursements/{id}`
- `POST /reimbursements/{id}:submit`
- `POST /reimbursements/{id}:approve` — via ENG-011 (Publication §11).
- `POST /reimbursements/{id}:reject`

### 6.7 Advance (Publication §8 Advance, §4.4)

- `GET /advances`, `POST /advances`, `GET /advances/{id}`, `PATCH /advances/{id}`
- `POST /advances/{id}:submit`
- `POST /advances/{id}:approve`
- `POST /advances/{id}:reject`
- Approved balance is adjusted against subsequent payroll runs per Publication §4.4.

### 6.8 Payslip (Publication §8 Payslip, §4.5)

- `GET /payslips` — list
- `GET /payslips/{id}` — read
- Payslip issuance is triggered by successful Payroll Run finalization per Publication §4.5; the API does not expose a create endpoint (issuance is automatic per §4.5 / §6).
- Successful issuance emits `PayslipIssued` per Publication §9.

### 6.9 Disbursement (Publication §4.5, §11 ENG-023)

- `POST /disbursements` — generate disbursement file for a finalized run; file is immutable once generated per Publication §6.
- `GET /disbursements`, `GET /disbursements/{id}` — read
- `POST /disbursements/{id}:deliver` — delivery to Bank via ENG-023 (Publication §11).
- `GET /disbursements/{id}/status` — delivery status projection.
- Successful generation emits `DisbursementInitiated` per Publication §9.
- Any `PATCH` / mutation on `/disbursements/{id}` is rejected once generated (Publication §6 immutability).

### 6.10 Posting (Publication §4.5, §11 ENG-015 / ENG-016)

- `POST /payroll-runs/{id}:post` — invokes ENG-015 Voucher and ENG-016 Posting to produce payroll ledger effects (Publication §4.5, §11). Posting logic remains exclusive to MOD-002 Accounting per Publication §13.
- Successful posting emits `PayrollPosted` per Publication §9.

### 6.11 Reports (Publication §3, §4.6)

- `GET /reports/payroll-register`
- `GET /reports/statutory-reports` — per-locale (Publication §4.3, §4.6)
- `GET /reports/reimbursement-summary`
- `GET /reports/ctc-vs-take-home`
- `GET /reports/audit-readiness` — read-only over prior-sprint events (Publication §4.6).

### 6.12 Payroll Configuration (Publication §3, PRD §10)

- `GET/PUT /config/pay-cycles`
- `GET/PUT /config/rounding-policy`
- `GET/PUT /config/numbering-series` — via ENG-017 (Publication §11).
- `GET/PUT /config/statutory-settings` — per-locale (Publication §4.3).

## 7. Request Models

Each entity's request model contains only fields authorized by the Publication for that entity. Common envelope: `{ data: <resource>, meta?: {...} }`. No field is introduced beyond Publication authorization. Compensation fields respect role-based visibility (Publication §11 ENG-002/003).

## 8. Response Models

Standard collection envelope with pagination cursors. Single-resource responses include the resource plus `_links` for related reads (Payslips of a Payroll Run, Reimbursements/Advances applied to a Payroll Run, Disbursements of a Payroll Run).

## 9. Validation Rules

Server-side authoritative, executed via ENG-012 (Publication §11):

- Required-field and format checks per Publication entity.
- Referential integrity for Component → Salary Structure; Bank Mandate → Employee identifier read from MOD-007.
- Uniqueness where Publication implies enterprise-single (component code within tenant; numbering series per PRD §10).
- Payroll Run finalization blocked unless all statutory computations complete (Publication §6).
- Payroll Run reversal creates a new reversing run rather than mutating the original (Publication §6).
- Disbursement mutation rejected once file is generated (Publication §6 immutability).
- HRMS signals treated as read-only inputs (Publication §10, §13).
- Approval-routing invariants per payroll operations configuration (Publication §3, §11 ENG-011).

## 10. Error Codes

Envelope:

```
{ "error": { "code": "PAYROLL.STATUTORY_INCOMPLETE", "message": "...", "details": {...} } }
```

Representative codes derived from Publication rules:

- `PAYROLL.STATUTORY_INCOMPLETE` — finalization blocked until statutory computations complete (§6).
- `PAYROLL.RUN_ALREADY_FINALIZED` — mutation attempted on a finalized run; use `:reverse` instead (§6).
- `PAYROLL.RUN_REVERSAL_REQUIRED` — direct mutation blocked; reversing run required (§6).
- `PAYROLL.DISBURSEMENT_IMMUTABLE` — mutation attempted on a generated disbursement file (§6).
- `PAYROLL.HRMS_SIGNAL_READ_ONLY` — write attempted on a consumed HRMS signal (§10, §13).
- `PAYROLL.APPROVAL_ROUTING_UNRESOLVED` — approval routing returned zero approvers (§11 ENG-011).
- `PAYROLL.POSTING_ENGINE_UNAVAILABLE` — ENG-015 / ENG-016 invocation failed (§11, §13; MOD-002-owned).
- Standard platform codes (`AUTH.*`, `TENANT.*`, `RATE_LIMIT`).

## 11. Pagination

Cursor-based (`cursor`, `limit`, `next_cursor`) with default page size 50 and max 200.

## 12. Filtering

Filters map 1:1 to Publication-declared entity/transaction attributes (pay cycle, period, status, locale, employee reference, date ranges). Unauthorized filters are rejected.

## 13. Sorting

Whitelisted sort keys per entity, tied to Publication-declared attributes. Multi-key sort supported.

## 14. Webhooks

Not required by the Publication. Downstream modules consume Payroll state via the platform Event Engine (§15). External Bank and Statutory portals are integrated via ENG-023 (§6.9, §6.11). Webhooks are therefore **N/A** for API-008.

## 15. Event Catalogue

Events published verbatim from Publication §9, emitted via ENG-024 (Publication §11) under ADR-051 outbox semantics:

| Event | Publication Ref | Trigger |
| --- | --- | --- |
| `PayrollProcessed` | §9 | `POST /payroll-runs/{id}:finalize` (terminal finalization) |
| `PayrollPosted` | §9 | `POST /payroll-runs/{id}:post` (successful ENG-015/016 invocation) |
| `PayslipIssued` | §9 | Automatic payslip issuance on Payroll Run finalization (§4.5) |
| `DisbursementInitiated` | §9 | `POST /disbursements` (successful generation) |

Consumed events (read-only inbound; Publication §10): `EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved` (all from MOD-007 HRMS, via ENG-024).

No event is introduced beyond Publication §9.

## 16. Audit Logging

Every state-changing endpoint emits an audit record via ENG-004 (Publication §11) per ADR-014.

## 17. Versioning

URI-versioned (`/api/v1/...`). Breaking changes require a new version and a superseded Publication.

## 18. Security

- Tenant isolation (ADR-011) enforced at the query layer.
- RBAC + ABAC (ADR-032) enforced on every route; Self-Service (own payslip / own reimbursement / own advance) further scoped to caller's own `employee_id`.
- Transport TLS ≥ 1.2.
- Compensation-sensitive fields redacted per role on responses.
- Rate limiting per tenant and per token.

## 19. Performance

- P95 read latency within the platform interactive budget.
- Batch endpoints (gross computation, statutory computation, disbursement generation, delivery, posting invocation) run within the platform batch envelope (PRD §11).
- Reports served from the read model built by ENG-021 (Publication §11).

## 20. Acceptance Criteria & Traceability Matrix

API-008 is Accepted when every endpoint in §6 maps to a Publication §7 or §8 anchor (or §4.3 / §4.4 / §4.5 / §4.6 for statutory / reimbursements / disbursement-posting-payslip / reports), every event in §15 maps to Publication §9 or §10, validation rules in §9 restate Publication §6 verbatim, audit/security/rate-limit checks pass the platform baseline, and no endpoint or event outside the Publication exists in the surface.

| Publication § | Anchor | API-008 Section |
| --- | --- | --- |
| §3 Scope | Scope | §2, §6 |
| §6 Business Rules | Rules | §9, §10 |
| §7 Master Data — Salary Structure | Endpoints | §6.1 |
| §7 Master Data — Component | Endpoints | §6.2 |
| §7 Master Data — Bank Mandate | Endpoints | §6.3 |
| §7 Master Data — Statutory Setup | Endpoints | §6.4 |
| §8 Transactions — Payroll Run | Endpoints | §6.5 |
| §8 Transactions — Reimbursement | Endpoints | §6.6 |
| §8 Transactions — Advance | Endpoints | §6.7 |
| §8 Transactions — Payslip | Endpoints | §6.8 |
| §4.5 Disbursement | Endpoints | §6.9 |
| §4.5 Posting | Endpoints | §6.10 |
| §3 / §4.6 Reports & Audit Readiness | Endpoints | §6.11 |
| §3 Operations Config | Endpoints | §6.12 |
| §9 Published Events | Events | §15 |
| §10 Consumed Events | Events | §15 |
| §11 Engines | Engine consumption | §3, §4, §9, §16, §18, §19 |
| §12 Dependencies | Cross-module | §15 (events), §18 |
| §13 Boundaries | Ownership | §14 (no webhooks), §2 (out of scope), §6.10 (posting owned by MOD-002) |
| §15 Non-Goals | Exclusions | §2 |

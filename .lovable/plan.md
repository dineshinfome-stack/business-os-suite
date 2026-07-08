## Pass 8.4.4 — Author SPR-MOD-003-004 (Sales Invoicing) + Pass 8.4.4-V

Documentation-only. Stage 2 of MOD-003 Sales, Sprint 4. Authors the Sales Invoicing Sprint PRD and immediately verifies it with the repository-standard 10-item checklist established in Pass 8.4.3.

### Part A — Author SPR-MOD-003-004

**New file:** `docs/30-sprint-prds/sales/SPR-MOD-003-004-sales-invoicing.md`

- Uses `docs/99-templates/sprint-prd-template.md`; identical 18-section ordering, disclaimers, Review Gate, Definition of Done, Sprint Exit Criteria, Risk Register, References, and traceability conventions as SPR-MOD-002-001…006 and SPR-MOD-003-001…003.
- Frontmatter: `sprint_id: SPR-MOD-003-004`, `parent_module: MOD-003`, `iteration: Sprint 4`, `stage: 2`, `pass: 8.4.4`, `size: Large`, `status: Draft`, `owner: Sales`, `updated: 2026-07-07`, `document_type: Sprint PRD`, tags `[sprint, prd, sales, invoicing, mod-003]`.
- `related_engines` resolved verbatim from `ENGINE_USAGE_MATRIX.md` and must exactly match Sprint 4 allocation in `MOD-003_SPRINT_PLAN.md`.
- `related_adrs` — Accepted ADRs only, resolved verbatim from `ADR_INDEX.md`.

**Section content:**

- **§1 Objective & Scope** — commercial invoicing lifecycle: Sales Invoice, generation, validation, approval, cancellation, amendments, Credit Notes, Debit Notes, invoice numbering, attachments, notifications, lifecycle events. Explicit exclusions: payment collection, receipt allocation, receivables, journal/ledger posting, voucher ownership, tax engine implementation, accounting reports, financial statements, accounting periods, analytics, dashboards.
- **§1.1** Commercial Invoice Ownership — Sales owns the commercial invoice lifecycle.
- **§1.2** Accounting Consumption Boundary — voucher creation requested via MOD002_ACCOUNTING_BASELINE_v1 contracts; Sales MUST NOT create vouchers, own voucher lifecycle, journal, post ledgers, maintain receivables, or close periods.
- **§1.3** Tax Consumption Boundary — Sales consumes taxation via Accounting; may determine taxable transactions but MUST NOT redefine tax engine/config/calculation/reporting.
- **§1.4** Receivable Boundary — invoice completion MAY create downstream receivable requests; receivable ownership belongs to Accounting.
- **§1.5** Delivery Consumption Boundary — consumes completed deliveries from SPR-MOD-003-003; no redefinition of delivery ownership.
- **§1.6** Governance Complement — repository-standard closing wording referencing MOD001, MOD002, SPR-MOD-003-001, -002, -003.
- **§2 Sprint Deliverables** — enumerated list per prompt; forward reference SPR-MOD-003-005 and -006.
- **§3 Traceability** — bidirectional table; every deliverable traces to Sales MODULE_PRD sections; no orphans, no unallocated capabilities.
- **§4 User Stories** — Sales Executive, Billing Executive, Sales Manager, Finance Reviewer, Customer, System Administrator; each story linked to a Sprint Deliverable.
- **§5 Acceptance Criteria** — Given/When/Then across invoice creation, approval, amendment, cancellation, credit/debit notes, numbering, delivery validation, voucher request generation, tax consumption, receivable request, unauthorized modification rejection, audit logging, tenant isolation, invoice lifecycle events.
- **§6 Parent Module Reference** — MOD-003 Sales Module PRD with fulfilled sections.
- **§7 Dependencies** — Upstream: MOD001, MOD002 baselines, SPR-MOD-003-001, -002, -003. Downstream: SPR-MOD-003-005, -006. Consumers resolve module IDs verbatim from `docs/MODULE_CATALOG.md` (no hardcoded IDs).
- **§8 ERP Core Engine Consumption** — engines resolved verbatim from `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`, exactly matching Sprint 4 allocation in `MOD-003_SPRINT_PLAN.md`; one-line usage per engine; no engine behavior redefined.
- **§9 ADR Consumption** — Accepted ADRs from `ADR_INDEX.md`; one-line usage note per ADR.
- **§10 Data Model Impact** — conceptual entities only: Sales Invoice, Invoice Line, Credit Note, Debit Note, Invoice Approval, Invoice Attachment, Invoice Status; physical schema out of scope.
- **§11 Events** — only authoritative Event Catalog names; unknowns become deferred `R-EV-*` risks; Event Catalog NOT modified.
- **§12–§17** — Definition of Done, Sprint Exit Criteria, Normalized Risk Register (Risk ID, Description, Impact, Mitigation, Status ∈ {Open, Mitigated, Accepted, Deferred, Closed}) with risks covering Accounting dependency, Tax dependency, Delivery dependency, Event Catalog gaps, Voucher contract dependency; Test Strategy Summary; Implementation Notes; Review Gate.
- **§18 References** — Sales Module PRD, MOD-003 Sprint Plan, SPR-MOD-003-001/002/003, ERP Core Engines, Accepted ADRs, Event Catalog, MOD001 Baseline, MOD002 Baseline, MODULE_CATALOG.

### Part B — Governance Registrations (each edited exactly once)

- `docs/SPRINT_CATALOG.md` — register SPR-MOD-003-004.
- `docs/30-sprint-prds/sales/README.md` — flip Sprint 4 placeholder to Draft with link.
- `docs/DOCUMENT_INDEX.md` — add entry.
- `docs/_meta.json` — add entry.
- `.lovable/plan.md` — record pass and verification artifacts.

All with `updated: 2026-07-07`. No other governance files modified.

### Part C — Pass 8.4.4-V (10-item verification)

Authoritative sources: SPR-MOD-003-004, ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX, Event Catalog, Sales Module PRD, MOD-003 Sprint Plan, SPR-MOD-003-001/002/003, MOD001 Baseline, MOD002 Baseline, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW.

Checks:
1. Frontmatter completeness
2. 18-section structural conformance
3. Engine allocation matches ENGINE_USAGE_MATRIX + Sprint Plan
4. Accepted ADR validation
5. Event Catalog validation
6. Bidirectional traceability
7. Dependency resolution from MODULE_CATALOG
8. Governance registrations exactly once
9. Scope exclusions + Platform / Accounting / Delivery boundaries preserved
10. Cross-module ownership validation

On failure: minimum edit to SPR-MOD-003-004 only; rerun full 10-check; repeat until Failed = 0. Module PRDs, Sprint Plan, Baselines, Engine Catalog, ADRs, Event Catalog, MODULE_CATALOG, and MODULE_IMPLEMENTATION_WORKFLOW are NOT modified during remediation.

### Mandatory Closing Artifacts

Recorded in `.lovable/plan.md` and mirrored in chat:
1. Verification Metadata
2. Check / Result / Action table (10 rows)
3. Verification Summary

Invariants: `Passed + Remediated + Failed = 10`; `PASS ⇔ Failed = 0`; `Failed ≥ 1 ⇒ BLOCKED`.

### Not Modified

Sales Module PRD, MOD-003 Sprint Plan, previous Sprint PRDs, Module Baselines, ERP Core Engines, ADRs, Event Catalog, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, architecture docs, APIs, database, schema, UI, implementation code.

### Outcome

SPR-MOD-003-004-sales-invoicing.md becomes the authoritative Sprint PRD for the commercial invoicing lifecycle. MOD-003 complete through Sprint 4 with Repository Status = PASS. Repository ready for Pass 8.4.5 — SPR-MOD-003-005 (Returns & Customer Adjustments).
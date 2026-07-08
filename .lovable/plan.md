## Pass 8.4.5 — Author SPR-MOD-003-005 (Returns & Customer Adjustments) + Pass 8.4.5-V

Documentation-only. Stage 2 of MOD-003 Sales, Sprint 5. Authors the Sales Returns & Customer Adjustments Sprint PRD and verifies it using the repository-standard 10-item verification workflow.

---

### Part A — Author SPR-MOD-003-005

**New file:** `docs/30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md`

Template: `docs/99-templates/sprint-prd-template.md`. Identical 18-section ordering as SPR-MOD-002-001..006 and SPR-MOD-003-001..004.

**Frontmatter:** `sprint_id: SPR-MOD-003-005`, `parent_module: MOD-003`, `iteration: Sprint 5`, `stage: 2`, `pass: 8.4.5`, `size: Medium`, `status: Draft`, `owner: Sales`, `updated: 2026-07-07`, `document_type: Sprint PRD`, `related_engines` resolved verbatim from `ENGINE_USAGE_MATRIX.md` matching Sprint 5 allocation in `MOD-003_SPRINT_PLAN.md`, `related_adrs` (Accepted only) from `ADR_INDEX.md`, `tags: [sprint, prd, sales, returns, customer-adjustments, mod-003]`.

**§1 Objective & Scope:** commercial return lifecycle — Return Request, Approval, Validation, Receipt Confirmation, Customer Adjustments, Replacement Preparation, Refund Preparation, Status, Numbering, Attachments, Notifications, Events. Explicit exclusions: inventory movement, stock valuation, warehouse ownership, accounting vouchers, journals, ledgers, receivables, tax calculation, refund accounting, payment processing, financial reporting, analytics, dashboards.

**§1.1–§1.6 Governance Conventions:** Commercial Return Ownership; Inventory Consumption Boundary; Accounting Consumption Boundary; Customer Adjustment Boundary (Sales owns commercial; Accounting owns financial); Delivery/Invoice Consumption Boundary (consumes SPR-MOD-003-003 and SPR-MOD-003-004); Governance Complement clause complementing MOD001/MOD002 baselines and prior Sales sprints.

**§2 Deliverables:** Return Request, Return Authorization, Approval, Validation, Completion, Customer Adjustment, Replacement Preparation, Refund Request Contract, Numbering, Attachments, Notifications, Events. Forward-references SPR-MOD-003-006.

**§3 Traceability:** bidirectional matrix to Sales Module PRD sections; every Sprint 5 capability from MOD-003 Sprint Plan represented; no orphans.

**§4 User Stories:** Sales Executive, Customer Service Executive, Returns Coordinator, Sales Manager, Warehouse Coordinator, Customer — each traced to a deliverable.

**§5 Acceptance Criteria:** Given/When/Then for return request, approval, rejection, replacement, refund, customer adjustment, completion, invoice validation, delivery validation, unauthorized return rejection, audit logging, tenant isolation, lifecycle events.

**§6 Parent Module Reference:** MOD-003 Sales Module PRD, cite fulfilled sections.

**§7 Dependencies:** Upstream — MOD001/MOD002 baselines, SPR-MOD-003-001..004. Downstream — SPR-MOD-003-006. **Consumer module identifiers SHALL be resolved verbatim from `docs/MODULE_CATALOG.md` and MUST NOT be hardcoded anywhere in the Sprint PRD.**

**§8 Engines:** verbatim from ENGINE_CATALOG / ENGINE_USAGE_MATRIX matching Sprint 5 allocation in MOD-003 Sprint Plan. One-line usage note per engine. No engine behavior redefined.

**§9 ADRs:** Accepted only, verbatim from ADR_INDEX. One-line usage note per ADR.

**§10 Data Model:** conceptual only — Return Request, Return Authorization, Return Line, Customer Adjustment, Replacement Request, Refund Request, Return Status, Return Attachment. Physical schema out of scope.

**§11 Events:** Reference only event names that exist verbatim in `docs/02-architecture/event-catalog.md`. Any illustrative event that does not exist SHALL be replaced with the authoritative catalog name or deferred through an `R-EV-*` risk entry. The Event Catalog MUST NOT be modified by this pass.

**§12–§17:** Definition of Done, Sprint Exit Criteria, Risk Register (Risk ID, Description, Impact, Mitigation, Status ∈ {Open, Mitigated, Accepted, Deferred, Closed}) covering Accounting/Inventory/Delivery/Invoice/Event Catalog/Refund contract dependencies, Test Strategy Summary, Implementation Notes, Review Gate.

**§18 References:** Sales Module PRD, MOD-003 Sprint Plan, SPR-MOD-003-001..004, ERP Core Engines, Accepted ADRs, Event Catalog, MOD001/MOD002 Baselines, MODULE_CATALOG.

---

### Part B — Governance Registrations (each exactly once, `updated: 2026-07-07`)

- `docs/SPRINT_CATALOG.md`
- `docs/30-sprint-prds/sales/README.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`
- `.lovable/plan.md`

---

### Part C — Pass 8.4.5-V (10-item verification)

Checks: Frontmatter, 18-section conformance, Engine allocation vs ENGINE_USAGE_MATRIX + Sprint Plan, Accepted ADRs, Event Catalog, Bidirectional traceability, Dependencies from MODULE_CATALOG, Governance registrations exactly once, Scope exclusions & Platform/Accounting/Inventory/Delivery/Invoicing boundaries, Cross-module ownership validation.

On failure: minimum edit to SPR-MOD-003-005 only; rerun full checklist until Failed = 0. Do not modify Module PRDs, Sprint Plan, Baselines, ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX, Event Catalog, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW.

Invariants: `Passed + Remediated + Failed = 10`; `PASS ⇔ Failed = 0`; `Failed ≥ 1 ⇒ BLOCKED`. Record Verification Metadata, 10-row Check/Result/Action table, and Verification Summary in `.lovable/plan.md` and mirror in chat.

---

### Not Modified

Sales Module PRD, MOD-003 Sprint Plan, previous Sprint PRDs, Module Baselines, ERP Core Engines, ADRs, Event Catalog, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, architecture docs, APIs, database, schema, UI, implementation code.

---

### Outcome

SPR-MOD-003-005 becomes authoritative for the commercial returns & customer adjustments lifecycle, preserving three-way ownership between Sales, Inventory, and Accounting. MOD-003 complete through Sprint 5 with Repository Status = PASS. Repository ready for Pass 8.4.6 — SPR-MOD-003-006 (Sales Analytics & Controls).
---

## Pass 8.4.5-V — Verification Report

### Verification Metadata

- **Pass:** 8.4.5-V
- **Sprint under verification:** `SPR-MOD-003-005` — Returns & Customer Adjustments
- **File:** `docs/30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md`
- **Verification date:** 2026-07-07
- **Checklist standard:** Repository-standard 10-item verification (per `MODULE_IMPLEMENTATION_WORKFLOW.md`)
- **Invariants:** `Passed + Remediated + Failed = 10`; `PASS ⇔ Failed = 0`; `Failed ≥ 1 ⇒ BLOCKED`.

### 10-Item Verification Table

| # | Check | Result | Action |
| --- | --- | --- | --- |
| 1 | Frontmatter conformance (sprint_id, parent_module, iteration, stage, pass, size, status, owner, updated, related_engines, related_adrs, tags, document_type) | Passed | None. |
| 2 | 18-section conformance with `docs/99-templates/sprint-prd-template.md` ordering | Passed | None. |
| 3 | Engine allocation verbatim from `ENGINE_USAGE_MATRIX.md` matching Sprint 5 row of `MOD-003_SPRINT_PLAN.md` (`ENG-002, ENG-004, ENG-007, ENG-010, ENG-011, ENG-012, ENG-017, ENG-018, ENG-024, ENG-025`) | Passed | None. |
| 4 | Accepted-only ADR consumption (`ADR-011`, `ADR-014`, `ADR-032`) from `ADR_INDEX.md` | Passed | None. |
| 5 | Event Catalog compliance — illustrative event names in §11 flagged as subject to `R-EV-01`; event catalog not modified | Passed | None. Deferred via `R-EV-01`. |
| 6 | Bidirectional traceability to `MOD-003` MODULE_PRD (§3 matrix; no orphan requirements; no unallocated chartered capabilities) | Passed | None. |
| 7 | Dependencies resolved from `docs/MODULE_CATALOG.md` (consumer module IDs not hardcoded) | Passed | None. |
| 8 | Governance registrations exactly once (`SPRINT_CATALOG.md`, `README.md`, `DOCUMENT_INDEX.md`, `_meta.json`, `.lovable/plan.md`) | Passed | None. |
| 9 | Scope exclusions & Platform / Accounting / Inventory / Delivery / Invoicing / Tax boundaries preserved (§1.1.2–§1.1.6, §1.3, §5.11–§5.14, §5.19, §10.3) | Passed | None. |
| 10 | Cross-module ownership validation (Sales-Returns vs. Sales-Invoicing vs. Inventory vs. Accounting vs. Tax vs. Delivery) | Passed | None. |

### Verification Summary

- **Passed:** 10
- **Remediated:** 0
- **Failed:** 0
- **Repository Status:** **PASS**
- **Blocked:** No

MOD-003 Sales is complete through Sprint 5 with Repository Status = PASS. Repository ready for **Pass 8.4.6 — SPR-MOD-003-006 (Sales Analytics & Controls)**.

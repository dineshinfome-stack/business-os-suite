# Pass 8.6.6 — SPR-MOD-004-006 (Purchase Analytics & Controls) + 8.6.6-V

Documentation-only. Author MOD-004 Sprint 6 Sprint PRD following the established 18-section template and execute the 10-item repository verification.

## Part A — Author Sprint PRD

**File:** `docs/30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md`

**Title:** Purchase Analytics & Controls

**Frontmatter:**
- `sprint_id: SPR-MOD-004-006`, `parent_module: MOD-004`, `iteration: Sprint 6`
- `stage: 2`, `pass: 8.6.6`, `size: Medium`, `status: Draft`
- `owner: Purchase`, `updated: 2026-07-10`, `document_type: Sprint PRD`
- `related_engines`: verbatim from Sprint 6 allocation in `MOD-004_SPRINT_PLAN.md`, cross-checked against `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`
- `related_adrs`: Accepted-only, verbatim from `ADR_INDEX.md`
- `tags: [sprint, prd, purchase, analytics, controls, dashboards, mod-004]`

**Preflight reads (lock verbatim IDs before authoring):**
- `docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md` — Sprint 6 engine/ADR allocation
- `docs/10-erp-core/ENGINE_CATALOG.md` and `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md` — authoritative event names (else deferred `R-EV-*`)
- `docs/MODULE_CATALOG.md` — module ID resolution
- `docs/30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md` — structural template

**Sections 1–18:**
- §1 In-Scope (dashboards, KPIs, spend/vendor/buyer/cycle-time/exception/approval/return analytics, operational controls, audit readiness, export, filters, scheduled reports, read-model analytics, notifications, reporting events) / Out-of-Scope (transactional Purchase, Inventory, Accounting/GL/Payables/Tax/Payments, Enterprise BI, predictive/ML/AI, budgeting); no transactional functionality introduced
- §1.1–§1.8 Governance conventions: Analytics ownership; Reporting/Controls/Inventory/Accounting consumption boundaries; Dashboard read-model boundary; Analytics event boundary; Governance Complement clause
- §2 Deliverables — terminal Sprint for MOD-004; no downstream Sprint references
- §3 Bidirectional Sprint ↔ Module PRD traceability — explicit **forward** (Sprint → Module PRD) and **reverse** (Module PRD → Sprint) tables, with the five verbatim rules (exactly-one originating allocation, trace-back, no orphans, no unallocated, no duplicate)
- §4 User Stories (Procurement Director, Purchase Executive, Procurement Manager, Buyer, Branch Manager, Internal Auditor, Management, System Administrator) — each traces to a Deliverable
- §5 Acceptance Criteria (G/W/T) including three verbatim statements: read-model operation, no modification of Purchase documents, no accounting/inventory/warehouse transactions
- §6 Parent Module PRD reference with fulfilled sections
- §7 Dependencies with verbatim originating-supplier wording for SPR-MOD-004-005 and the "consume, not redefine" clause; no downstream Sprint dependencies
- §8 Engine consumption — verbatim IDs, one-line usage each
- §9 Accepted ADR consumption — verbatim IDs, one-line usage each
- §10 Conceptual entities (Purchase Dashboard, KPI Definition, Spend Metric, Vendor Performance Metric, Buyer Performance Metric, Purchase Trend, Operational Control, Audit Report, Analytics Filter, Scheduled Report)
- §11 Events — verbatim from `event-catalog.md`; unresolved names become deferred `R-EV-*`; no invented events; Event Catalog unmodified
- §12–§13 DoD / Exit Criteria (repository standard)
- §14 Risk Register covering all 10 required areas. **Analytics/numbering engine IDs cited only if present in Sprint 6 allocation of `MOD-004_SPRINT_PLAN.md` and `ENGINE_USAGE_MATRIX.md`; otherwise refer generically to the repository-approved analytics engine.**
- §15–§17 Test strategy, implementation notes, review gate
- §18 References (Purchase Module PRD, Sprint Plan, SPR-MOD-004-001..005, Engines, ADRs, Event Catalog, MOD001/002/003 Baselines, MODULE_CATALOG)

## Part B — Governance Registrations (updated: 2026-07-10, exactly once)

1. `docs/SPRINT_CATALOG.md` — add SPR-MOD-004-006 row (Draft, Procurement)
2. `docs/30-sprint-prds/purchase/README.md` — register Sprint 6
3. `docs/DOCUMENT_INDEX.md` — register new PRD
4. `docs/_meta.json` — register new PRD
5. `.lovable/plan.md` — append execution record

No edits to `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md` (pattern-based governance sufficient).

## Part C — Pass 8.6.6-V (10-item Verification)

1. Frontmatter completeness
2. 18-section structural conformance
3. Engine allocation parity — verbatim from `ENGINE_CATALOG.md`, matching `ENGINE_USAGE_MATRIX.md` and Sprint 6 allocation in `MOD-004_SPRINT_PLAN.md`; no placeholder, deprecated, undefined, duplicate, or additional identifiers
4. Bidirectional traceability with explicit forward + reverse tables; unique originating allocation
5. Accepted ADR validation (verbatim from `ADR_INDEX.md`)
6. Event Catalog validation (authoritative or deferred `R-EV-*`; no invented events; Event Catalog unmodified)
7. Dependencies verbatim from `MODULE_CATALOG.md` with explicit SPR-MOD-004-005 originating-supplier wording
8. Governance registrations completed exactly once across the five files
9. Cross-module ownership preserved (Platform, Accounting, Sales, Inventory, Purchase)
10. Stage 2 Sprint PRD requirements satisfied per `MODULE_IMPLEMENTATION_WORKFLOW.md`

Failure handling: minimum edits to the new PRD only; re-run until Failed = 0. No edits to Module PRD, Sprint Plan, prior Sprints, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, Baselines, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, or any architecture/code artifacts.

## Closing Artifacts (appended to `.lovable/plan.md` and mirrored in chat)

1. **Verification Metadata**: Target, Pass (8.6.6-V), Date (2026-07-10), Verifier, Authoritative Sources Checked
2. **Check / Result / Action table** — 10 rows
3. **Verification Summary**:

```text
Checklist Items: 10
Passed:
Remediated:
Failed:
Outstanding Risks:
Repository Status:
Next Pass:
```

Invariants: `Passed + Remediated + Failed = 10`; `Repository Status = PASS ⇔ Failed = 0`.

## Outcome

`SPR-MOD-004-006-purchase-analytics-controls.md` becomes the authoritative Sprint PRD for commercial Purchase Analytics & Controls, introducing dashboards, KPIs, operational controls, and audit-readiness on repository-approved read models with no transactional ownership. MOD-004 Purchase Stage 2 is complete. Repository ready for **Pass 8.7.0 — MOD004_PURCHASE_BASELINE_v1 (Stage 3 Module Baseline)**.
---

## Pass 8.6.6-V — Execution Record

### Verification Metadata

- **Target Artifact:** `docs/30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md`
- **Verification Pass:** 8.6.6-V
- **Verification Date:** 2026-07-10
- **Verifier:** Repository governance (Lovable agent)
- **Authoritative Sources Checked:**
  - `docs/20-module-prds/purchase/MODULE_PRD.md`
  - `docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-006`)
  - `docs/30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md`
  - `docs/30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`
  - `docs/30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md`
  - `docs/30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md`
  - `docs/30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md`
  - `docs/10-erp-core/ENGINE_CATALOG.md`
  - `docs/ENGINE_USAGE_MATRIX.md`
  - `docs/11-adrs/ADR_INDEX.md`
  - `docs/02-architecture/event-catalog.md`
  - `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`, `MOD002_ACCOUNTING_BASELINE_v1.md`, `MOD003_SALES_BASELINE_v1.md`
  - `docs/MODULE_CATALOG.md`
  - `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
  - `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, `docs/30-sprint-prds/purchase/README.md`

### Check / Result / Action Table

| # | Check | Result | Action |
| --- | --- | --- | --- |
| 1 | Frontmatter completeness (sprint_id, parent_module, iteration, stage, pass, size, status, owner, updated, related_engines, related_adrs, tags, document_type) | Pass | None |
| 2 | 18-section structural conformance vs prior Sprint PRD template (SPR-MOD-004-005) | Pass | None |
| 3 | Engine allocation parity — 7 engines (`ENG-002, ENG-004, ENG-020, ENG-021, ENG-024, ENG-025, ENG-027`) resolve verbatim from `ENGINE_CATALOG.md`, match `ENGINE_USAGE_MATRIX.md`, and exactly match Sprint 6 allocation in `MOD-004_SPRINT_PLAN.md` §2 (§5 engine table row for `SPR-MOD-004-006`); no placeholder, deprecated, undefined, duplicate, or additional identifiers | Pass | None |
| 4 | Bidirectional traceability — explicit §3.1 forward (Sprint → Module PRD) and §3.2 reverse (Module PRD → Sprint) tables; unique originating allocation; no orphans; no duplicates | Pass | None |
| 5 | Accepted ADR validation — `ADR-011`, `ADR-014`, `ADR-032` verbatim from `ADR_INDEX.md` | Pass | None |
| 6 | Event Catalog validation — `purchase-report.scheduled-report.executed`, `purchase-report.control-report.generated`, `purchase-report.kpi-snapshot.completed`, `purchase-report.exception.surfaced` deferred as `R-EV-01` (Event Catalog remains a stub); no invented events; Event Catalog unmodified | Pass | None |
| 7 | Dependencies verbatim from `MODULE_CATALOG.md`; explicit SPR-MOD-004-005 originating-supplier wording present in §1.1.1 and §7; consume-not-redefine wording present in §1.1.2 and §7 | Pass | None |
| 8 | Governance registrations completed exactly once across `SPRINT_CATALOG.md`, `purchase/README.md`, `DOCUMENT_INDEX.md`, `_meta.json`, `.lovable/plan.md` | Pass | None |
| 9 | Cross-module ownership preserved — Inventory (stock ledger, warehouse ops), Accounting (vouchers/ledger/payables/tax/payments/financial reporting), Sales (customer master), MOD-017 Analytics (cross-module BI / predictive), MOD-018 AI Workspace (AI/ML), MOD-001 Platform, and upstream Purchase sprints not redefined | Pass | None |
| 10 | Stage 2 Sprint PRD requirements per `MODULE_IMPLEMENTATION_WORKFLOW.md` (18 sections, ownership convention, DoD, Exit Criteria verbatim from Sprint Plan) | Pass | None |

### Verification Summary

```text
Checklist Items: 10
Passed: 10
Remediated: 0
Failed: 0
Outstanding Risks: R-EV-01 (Event Catalog stub — deferred per repository policy)
Repository Status: PASS
Next Pass: 8.7.0 — MOD004_PURCHASE_BASELINE_v1 (Stage 3 Module Baseline)
```

Invariants satisfied: `Passed + Remediated + Failed = 10`; `Failed = 0 ⇒ Repository Status: PASS`. MOD-004 Purchase Stage 2 is complete.

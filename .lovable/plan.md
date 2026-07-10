# Pass 8.5.0 — MOD003_SALES_BASELINE_v1 (Stage 3 Module Baseline)

Documentation-only. Freezes MOD-003 Sales by consolidating Sprint PRDs 001–006 into the authoritative Module Baseline, mirroring `MOD001_PLATFORM_BASELINE_v1` and `MOD002_ACCOUNTING_BASELINE_v1`.

---

## Part A — Create Baseline

**New file:** `docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`

Reference template: `MOD002_ACCOUNTING_BASELINE_v1.md` (exact section ordering, disclaimer wording, governance style, traceability conventions).

**Frontmatter:** `baseline_id: MOD003_SALES_BASELINE_v1`, `module_id: MOD-003`, `module_name: Sales`, `version: v1`, `status: Frozen`, `owner: Sales`, `workflow_stage: Stage 3`, `parent_module_prd`, `parent_sprint_plan`, `source_sprints: SPR-MOD-003-001..006`, `updated: 2026-07-07`, `document_type: Module Baseline`.

### Section Structure

- **3.1 Purpose** — Freezes MOD-003 post Sprints 001–006; authoritative repository-wide Sales contract.  
  **Baseline Authority clause (immediately after 3.1):** "This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-003. Sprint PRDs remain normative only for Sprint-level traceability and implementation history."

- **3.2 Scope** — Summarize (not redefine): Sales Foundation, Customer Master, Customer Hierarchy, Sales Organization, Quotations, Sales Orders, Delivery & Fulfillment, Sales Invoicing, Returns & Customer Adjustments, Sales Analytics, Operational Controls.

- **3.3 Sprint Consolidation** — One subsection per Sprint (001–006). Each: Purpose, Major Capabilities, Completion Status = Done.

- **3.4 Capability Matrix** — Table mapping Module PRD capabilities → Sprint(s).  
  **Traceability clause:** "Every capability defined by the Sales Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs." No orphans; no unallocated capabilities.

- **3.5 Governance Summary** — Summarize (do NOT redefine) all conventions from Sprints 001–006: Sales Ownership, Customer Master Authority, Commercial Ownership Boundary, Sales Configuration Authority, Customer Lifecycle Boundary, Quotation Ownership, Sales Order Ownership, Pricing Boundary, Approval Boundary, Delivery Ownership, Inventory Consumption Boundary, Shipment Readiness, Commercial Fulfillment Boundary, Commercial Invoice Ownership, Accounting Consumption Boundary, Tax Consumption Boundary, Receivable Boundary, Return Ownership, Customer Adjustment Boundary, Analytics Ownership, Reporting Consumption Boundary, Analytics Read Model, Operational Reporting Boundary, Dashboard Read Model, Governance Complement.  
  **Freeze clause (end of 3.5):** "Governance conventions summarized herein are frozen for MOD003_SALES_BASELINE_v1 and SHALL NOT be redefined except through a future baseline revision."

- **3.6 ERP Core Engine Consumption** — Union of engines across all six Sprints; identifiers verbatim from `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`; no behavior redefined.

- **3.7 ADR Consumption** — Union of Accepted ADRs only; identifiers verbatim from `ADR_INDEX.md`.

- **3.8 Event Consumption** — Only Event Catalog names; summarize deferred `R-EV-*` risks.  
  **Authority clause:** "No new event names SHALL be introduced by the Module Baseline." Event Catalog unchanged.

- **3.9 Cross-Module Contracts** — With MOD-001, MOD-002, MOD-005, MOD-006, MOD-011, MOD-015, MOD-017, MOD-018. **All module IDs and names resolved verbatim from `MODULE_CATALOG.md`** at authoring time (catalog is authoritative). Summarize Customer ownership, commercial document ownership, delivery ownership, accounting consumption, inventory consumption, reporting/analytics boundaries. No downstream module owns Sales assets.

- **3.10 Module Completion Criteria** — Six Sprint PRDs complete; verification complete; governance frozen; baseline frozen; downstream consumption directive.  
  **Versioning Policy clause:** "Future changes to MOD003_SALES_BASELINE_v1 SHALL be introduced only through a new baseline revision (e.g., MOD003_SALES_BASELINE_v2) and SHALL preserve backward traceability to this baseline."

- **3.11 Deferred Items** — Summarize only: AI sales forecasting, predictive analytics, budgeting, enterprise BI, advanced dashboards, ML recommendations, deferred `R-EV-*`. No roadmap expansion.

- **3.12 References** — Sales MODULE_PRD, MOD-003 Sprint Plan, SPR-MOD-003-001..006, ERP Core Engines, Accepted ADRs, `MODULE_IMPLEMENTATION_WORKFLOW.md`, `SPRINT_AUTHORING_GUIDE.md`.

---

## Part B — Governance Registrations

Exactly one update each, `updated: 2026-07-07`:

- `docs/MODULE_BASELINE_CATALOG.md`
- `docs/40-module-baselines/README.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`
- `docs/REPOSITORY_MAP.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md`
- `.lovable/plan.md`

---

## Part C — Sprint Status Finalization

`docs/SPRINT_CATALOG.md`: SPR-MOD-003-001…006 transition **Draft → Done**. No other rows changed.

---

## Part D — Repository Verification (13-item)

| # | Check |
|---|---|
| 1 | Exactly one baseline document created |
| 2 | Exactly one registration in each governance document |
| 3 | Sprint Catalog shows SPR-MOD-003-001…006 as Done |
| 4 | Every Sprint listed in §3.3 is represented exactly once and marked Completion Status = Done |
| 5 | Every Sales capability traces to ≥1 Sprint PRD (no orphans) |
| 6 | Bidirectional: every Sprint Plan allocation → exactly one Sprint PRD; every Sprint PRD capability → an approved Sprint Plan allocation |
| 7 | Every consumed Engine matches `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md` verbatim |
| 8 | Every consumed ADR is Accepted per `ADR_INDEX.md` |
| 9 | Every event references Event Catalog names or deferred `R-EV-*` risks; no new event names introduced |
| 10 | No governance convention redefined; §3.5 freeze clause present |
| 11 | Cross-module ownership preserved; §3.9 module IDs/names resolved verbatim from `MODULE_CATALOG.md` |
| 12 | Baseline marked Frozen; §3.10 versioning policy clause present |
| 13 | Baseline Authority clause present in §3.1: "MOD003_SALES_BASELINE_v1 is the authoritative repository-wide Sales contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability" (validates the clause exists and is correctly expressed; overlaps with §3.1 by design) |

On failure: minimal edit to baseline file only; rerun full checklist until Failed = 0. Forbidden to modify during remediation: Module PRDs, Sprint Plans, Sprint PRDs, ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX, Event Catalog, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, architecture docs, code.

**Invariants:** `Passed + Remediated + Failed = 13`; `PASS ⇔ Failed = 0`.

---

## Verification Report

Recorded in `.lovable/plan.md` and mirrored in chat:

- **Metadata:** Target, Pass (8.5.0), Date (2026-07-07), Verifier, Authoritative Sources Checked.
- **13-row table:** Check / Result (Pass|Fail|Remediated) / Action.
- **Summary:** Checklist Items, Passed, Remediated, Failed, Outstanding Risks, Repository Status (PASS|BLOCKED), Next Pass.

---

## Not Modified

Sales Module PRD, MOD-003 Sprint Plan, Sprint PRDs, ERP Core Engines, ADRs, Event Catalog, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, architecture docs, APIs, database, schema, UI, implementation code.

---

## Outcome

`MOD003_SALES_BASELINE_v1.md` becomes the authoritative frozen Stage 3 Module Baseline for MOD-003 Sales, superseding the Sprint PRD family as the primary repository-wide Sales reference for cross-module consumption while preserving Sprint-level traceability. Cross-module identifiers are resolved from `MODULE_CATALOG.md` as the authoritative source. An explicit versioning policy governs future evolution via successor baselines (v2+). MOD-003 becomes the third completed repository module after MOD-001 and MOD-002. Repository is ready for **Pass 8.6.0 — MOD-004 Purchase Sprint Planning (Stage 1)**.

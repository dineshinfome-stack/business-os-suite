# Pass 8.7.0 — MOD004_PURCHASE_BASELINE_v1 (Stage 3)

Documentation-only. Freezes MOD-004 Purchase, mirroring `MOD003_SALES_BASELINE_v1`.

## Part A — Author Baseline

Create `docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md` mirroring the exact numbering, section order, disclaimer, governance wording, authority clauses, traceability conventions, and versioning policy of `MOD003_SALES_BASELINE_v1.md`.

### Frontmatter

```yaml
baseline_id: MOD004_PURCHASE_BASELINE_v1
module_id: MOD-004
module_name: Purchase
version: v1
status: Frozen
owner: Purchase
workflow_stage: Stage 3
parent_module_prd: docs/20-module-prds/purchase/MODULE_PRD.md
parent_sprint_plan: docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md
source_sprints:
  - SPR-MOD-004-001
  - SPR-MOD-004-002
  - SPR-MOD-004-003
  - SPR-MOD-004-004
  - SPR-MOD-004-005
  - SPR-MOD-004-006
updated: 2026-07-10
document_type: Module Baseline
```

### Sections

- **3.1 Purpose** — freezes MOD-004; immediately followed by the Baseline Authority clause verbatim.
- **3.2 Scope** — summary only: Foundation, Vendor Master, Categories/Groups, Purchase Organization, Buyer Assignment, Configuration, Requisitions, RFQs, POs, GRN, Commercial Inspection, Vendor Billing, Commercial 3-Way Match, Returns, Vendor Adjustments, Analytics, Operational Controls, Audit Readiness.
- **3.3 Sprint Consolidation** — one subsection per sprint 001–006, each with Purpose, Major Capabilities, Completion Status = Done.
- **3.4 Capability Matrix** — TWO tables:
  1. **Module Capability → Originating Sprint** (forward).
  2. **Originating Sprint → Module Capability** (reverse).
  Include traceability clause verbatim. Enforce: no orphan capability, no duplicate originating allocation, no unallocated Module capability, no capability introduced beyond the Module PRD and Sprint PRD family.
- **3.5 Governance Summary** — summarize (do not redefine) governance from all six Sprint PRDs: Purchase Ownership, Vendor Master Authority, Purchase Configuration Authority, Supplier Boundary, Purchase Organization Authority, Requisition/RFQ/PO/GRN/Return Ownership, Commercial Inspection Boundary, Commercial 3-Way Match Boundary, Vendor Billing Ownership, Vendor Adjustment Boundary, Inventory/Warehouse/Accounting/Tax/Reporting Consumption Boundaries, Dashboard/Analytics Read Model, Operational Controls Boundary, Audit Readiness Boundary, Governance Complement. End with freeze clause verbatim.
- **3.6 ERP Core Engine Consumption** — union across sprints 001–006; identifiers verbatim from `ENGINE_CATALOG.md`; cross-checked against `ENGINE_USAGE_MATRIX.md`; no behavior redefinition.
- **3.7 ADR Consumption** — union of Accepted ADRs only, verbatim from `ADR_INDEX.md`.
- **3.8 Event Consumption** — summarize Event Catalog names only; unknown events deferred `R-EV-*`; include authority clause verbatim; Event Catalog unchanged.
- **3.9 Cross-Module Contracts** — MOD-001, MOD-002, MOD-003, MOD-005, MOD-006, MOD-011, MOD-015, MOD-017, MOD-018 (IDs/names verbatim from `MODULE_CATALOG.md`). Include the mirror clause verbatim:
  > "Purchase SHALL consume Inventory, Accounting, Reporting, Workflow and Notification services through approved repository contracts and SHALL NOT redefine ownership established by those modules."
- **3.10 Module Completion Criteria** — all six Sprint PRDs complete, verification complete, governance frozen, baseline frozen, downstream consumption directive; include Versioning Policy verbatim.
- **3.11 Deferred Items** — AI procurement recommendations, predictive procurement analytics, enterprise BI, advanced dashboards, budget forecasting, ML vendor scoring, deferred `R-EV-*`.
- **3.12 References** — Purchase Module PRD, MOD-004 Sprint Plan, SPR-MOD-004-001…006, ERP Core Engines, Accepted ADRs, `MODULE_IMPLEMENTATION_WORKFLOW.md`, `SPRINT_AUTHORING_GUIDE.md`.

## Part B — Governance Registration (`updated: 2026-07-10`)

1. `docs/MODULE_BASELINE_CATALOG.md`
2. `docs/40-module-baselines/README.md`
3. `docs/DOCUMENT_INDEX.md`
4. `docs/_meta.json`
5. `.lovable/plan.md`

No edits to `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md` (pattern-covered per Pass 8.5.0-V2).

## Part C — Sprint Status Finalization

In `docs/SPRINT_CATALOG.md`, transition SPR-MOD-004-001…006 Draft → Done. No other rows modified.

## Part D — Repository Verification (13-item, enumerated)

| # | Check |
|---|-------|
| 1 | Exactly one Module Baseline document created |
| 2 | Exactly one governance registration in each required governance file |
| 3 | SPR-MOD-004-001…006 marked Done in Sprint Catalog |
| 4 | Every Sprint represented exactly once in §3.3 with Completion Status = Done |
| 5 | Every Purchase Module capability traces to at least one Sprint PRD, and no capability appears in the baseline that is absent from both the Purchase Module PRD and the Sprint PRD family |
| 6 | Bidirectional traceability — every Module capability SHALL map to exactly one originating Sprint allocation; every Sprint capability SHALL trace back to exactly one approved Module capability unless explicitly marked as shared consumption; shared consumption SHALL NOT create duplicate originating allocations |
| 7 | Every Engine identifier resolves verbatim from `ENGINE_CATALOG.md` and matches `ENGINE_USAGE_MATRIX.md` |
| 8 | Every consumed ADR is Accepted per `ADR_INDEX.md` |
| 9 | Every Event references authoritative Event Catalog names or deferred `R-EV-*`; no invented Event names |
| 10 | Governance summarized only; freeze clause present; no governance redefinition |
| 11 | Cross-module ownership preserved (Platform, Accounting, Sales, Inventory, CRM, Analytics, AI Workspace, Workflow, Notifications) with module IDs resolved verbatim from `MODULE_CATALOG.md` |
| 12 | Baseline marked Frozen; Versioning Policy present in §3.10 |
| 13 | Baseline Authority clause present in §3.1 confirming MOD004_PURCHASE_BASELINE_v1 supersedes Sprint PRDs for repository-wide consumption while preserving Sprint-level traceability |

**Failure handling:** apply minimum edits to `MOD004_PURCHASE_BASELINE_v1.md` only; re-verify until Failed = 0. Do not modify Module PRD, Sprint Plan, Sprint PRDs, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, architecture, APIs, database, schema, UI, or implementation code.

Preflight reads (no writes): the six Purchase Sprint PRDs, `MOD003_SALES_BASELINE_v1.md`, `MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ENGINE_USAGE_MATRIX.md`, `ADR_INDEX.md`, `event-catalog.md`, `purchase/MODULE_PRD.md`.

## Closing Artifacts

Append to `.lovable/plan.md` and mirror in chat:

1. **Verification Metadata** — Target Artifact, Pass (8.7.0), Date (2026-07-10), Verifier, Authoritative Sources Checked.
2. **Check / Result / Action table** — 13 rows.
3. **Verification Summary**:

```text
Checklist Items: 13
Passed:
Remediated:
Failed:
Outstanding Risks:
Repository Status:
Next Pass:
```

Invariants: `Passed + Remediated + Failed = 13`; `Repository Status = PASS ⇔ Failed = 0`.

## Outcome

`MOD004_PURCHASE_BASELINE_v1.md` becomes the authoritative frozen Stage 3 baseline for MOD-004 Purchase, superseding the Sprint PRD family for repository-wide consumption while preserving Sprint-level traceability. Repository ready for **Pass 8.8.0 — MOD-005 Inventory Sprint Planning (Stage 1)**.

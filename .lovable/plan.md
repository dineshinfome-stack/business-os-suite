# Pass 8.3.Z — MOD002_ACCOUNTING_BASELINE_v1 (Stage 3 Module Baseline)

Documentation-only. Executes Stage 3 of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-002 Accounting. Consolidates the approved Accounting Module PRD and Sprint PRDs 001–006 into the frozen Module Baseline, mirroring `MOD001_PLATFORM_BASELINE_v1.md` in structure, tone, and governance style. No new business requirements, engines, ADRs, events, or architecture changes.

---

## 1. Create Baseline File

**Path:** `docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`

**Reference template:** `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` — mirror section ordering, disclaimer wording, traceability style, and governance summary format exactly.

### Frontmatter

```yaml
baseline_id: MOD002_ACCOUNTING_BASELINE_v1
module_id: MOD-002
module_name: Accounting
version: v1
status: Frozen
owner: Accounting
workflow_stage: Stage 3
parent_module_prd: docs/20-module-prds/accounting/MODULE_PRD.md
parent_sprint_plan: docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md
source_sprints:
  - SPR-MOD-002-001
  - SPR-MOD-002-002
  - SPR-MOD-002-003
  - SPR-MOD-002-004
  - SPR-MOD-002-005
  - SPR-MOD-002-006
updated: 2026-07-07
document_type: Module Baseline
```

### Baseline Sections (mirror MOD001 exactly)

- **3.1 Purpose** — Freezes MOD-002 after completion of Sprints 001–006; becomes the authoritative inter-module Accounting contract. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required.
- **3.2 Scope** — Chart of Accounts; Ledger hierarchy; Voucher Framework; Journal Posting; Ledger Posting; Financial Statements; Tax Foundation; Accounting Periods; Financial Year; Period Close; Audit Review. No new scope.
- **3.3 Sprint Consolidation** — One subsection per Sprint (001 Accounting Foundation; 002 Voucher Framework; 003 Journal & Ledger Posting; 004 Financial Statements; 005 Taxation & Compliance Foundation; 006 Period Close & Audit). Each subsection includes: purpose; major business capabilities; **completion status (Done)** — reflecting the Sprint Catalog transition performed in this pass.
- **3.4 Capability Matrix** — `| Capability | Sprint |` table. Every Accounting capability from the Module PRD maps to at least one Sprint. No orphan capabilities.
- **3.5 Governance Summary** — Summarize (do NOT redefine) **every governance convention established across Accounting Sprint PRDs 001–006**, including: Accounting Ownership, Voucher Ownership, Ledger Posting Ownership, Ledger Immutability, Balance Integrity, Ledger Access Boundary, Financial Reporting Ownership, Ledger Consumption, Report Determinism, Reporting Read Model, Financial Statement Boundary, Tax Ownership, Tax Calculation Boundary, Tax Configuration Authority, Compliance Readiness, Tax Reporting Boundary, Period Authority, Financial Year Ownership, Period Close Boundary, Controlled Reopening, Audit Review Boundary, and Financial Freeze. Ownership remains with the originating Sprint PRDs. (No numeric count is hardcoded — the list is resolved from the source Sprint PRDs at authoring time, so future v2 additions do not invalidate this section.)
- **3.6 ERP Core Engine Consumption** — Summarize consumed engines; identifiers match `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md` verbatim. No redefinition.
- **3.7 ADR Consumption** — Summarize Accepted ADRs consumed; identifiers match `ADR_INDEX.md`. No Proposed ADRs.
- **3.8 Event Consumption** — Reference only event names present in `docs/02-architecture/event-catalog.md`. List any `R-EV-*` deferred risks recorded in Sprints. Event Catalog NOT modified.
- **3.9 Cross-Module Contracts** — Repository-wide Accounting contracts to **MOD-003 Sales, MOD-004 Purchase, MOD-005 Inventory, MOD-008 Payroll, MOD-015 POS, MOD-017 Projects, MOD-018 Analytics** (module IDs used for repository-wide traceability consistency). No downstream module owns accounting master data, posts to ledgers directly, creates independent voucher lifecycle, redefines accounting reports, or redefines periods.
- **3.10 Module Completion Criteria** — All six Sprint PRDs completed; repository verification complete; governance frozen; baseline frozen; downstream modules consume the baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.
- **3.11 Deferred Items** — Statutory filing; government integrations; e-invoicing; e-way bill; consolidation; budgeting; forecasting; AI accounting; deferred Event Catalog items recorded as `R-EV-*`. No new roadmap.
- **3.12 References** — Accounting MODULE_PRD; Sprint Plan; Sprints 001–006; ERP Core Engines; Accepted ADRs; MODULE_IMPLEMENTATION_WORKFLOW.md; SPRINT_AUTHORING_GUIDE.md.

---

## 2. Governance Registrations (derived indexes only)

Exactly one entry per document:

- `docs/MODULE_BASELINE_CATALOG.md` — add `MOD002_ACCOUNTING_BASELINE_v1` row, status Frozen.
- `docs/40-module-baselines/README.md` — register Accounting baseline.
- `docs/DOCUMENT_INDEX.md` — one new entry.
- `docs/_meta.json` — one sidebar registration.
- `docs/REPOSITORY_MAP.md` — register new Stage 3 artifact.
- `docs/DOCUMENT_TRACEABILITY.md` — link chain: Accounting MODULE_PRD → Sprint Plan → Sprints 001–006 → MOD002_ACCOUNTING_BASELINE_v1.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — owner Accounting; status Frozen.
- `.lovable/plan.md` — append Pass 8.3.Z execution record.

---

## 3. Sprint Status Finalization

`docs/SPRINT_CATALOG.md` — transition SPR-MOD-002-001 through SPR-MOD-002-006 from **Draft** to **Done** (baseline is frozen). No other Sprint Catalog changes.

---

## 4. Repository Verification

Confirm:

- Exactly one baseline document created.
- Exactly one entry each in DOCUMENT_INDEX, _meta.json, MODULE_BASELINE_CATALOG, 40-module-baselines/README, REPOSITORY_MAP, TRACEABILITY, OWNERSHIP.
- Sprint Catalog shows SPR-MOD-002-001…006 as Done.
- Every Accounting capability traces to one or more Sprint PRDs.
- Every consumed Engine matches ENGINE_CATALOG verbatim.
- Every consumed ADR is Accepted.
- Every referenced event exists in Event Catalog or is deferred through an existing `R-EV-*` risk.
- No governance convention redefined; no architecture doc modified; no Module PRD modified.
- Baseline marked Frozen.
- MOD002_ACCOUNTING_BASELINE_v1 becomes the authoritative inter-module reference; downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required.

---

## 5. Not Changed

Module PRDs; Sprint PRDs; ERP Core Engines; ADRs; Event Catalog; architecture documents; APIs; database; schema; UI; implementation code.

---

## 6. Outcome

`MOD002_ACCOUNTING_BASELINE_v1.md` becomes the authoritative frozen Stage 3 baseline for MOD-002 Accounting, **superseding the Sprint PRD family as the primary inter-module reference while preserving Sprint PRDs for detailed implementation and traceability**. MOD-002 becomes the second completed repository module after `MOD001_PLATFORM_BASELINE_v1`. Repository is then ready for **Pass 8.4.0 — MOD-003 Sales Sprint Planning (Stage 1)**.

# Phase 4.5 — Core ERP Domain Architecture Validation

## Objective

Validate the functional boundaries of the Core ERP modules (MOD-002 Accounting, MOD-003 Sales, MOD-004 Purchase, MOD-005 Inventory, MOD-019 Warehouse) **before** authoring any new Solution Designs in Wave 1. This is a one-time architectural checkpoint to eliminate the risk of rework across PRDs, Publications, Web/Mobile/API SDs, and Cross-Platform Certifications.

## Guardrails (Non-Negotiable)

- No changes to repository navigation (`docs/_meta.json`).
- No changes to governance documents (`docs/15-governance/**`).
- No new Solution Designs authored in this phase.
- No production code.
- No repository restructuring.
- No module ID changes without explicit approval.
- Existing Module PRDs, Publications, and Baselines are treated as inputs, not rewritten in this phase. Any required corrections are captured as **follow-up work items**, not executed here.

## Inputs (Read-Only)

- `docs/20-module-prds/{accounting,sales,purchase,inventory,warehouse}/MODULE_PRD.md`
- `docs/20-module-prds/{...}/README.md`
- `docs/40-module-baselines/MOD00{2,3,4,5}_*_BASELINE_v1.md`, `MOD019_WAREHOUSE_BASELINE_v1.md`
- `docs/45-module-publications/` where present
- `docs/module-dependency-matrix.md`, `docs/MODULE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`
- `docs/02-architecture/domain-driven-design.md`, `domain-map.md`
- `docs/13-workflows/{sales,purchase,inventory}-workflow.md`

## Deliverables

All artifacts land under a new folder `docs/51-architecture-validation/` (created for this phase; sits alongside `50-audit-reports/`). Navigation is not touched in this phase — folder is discoverable via `docs/50-audit-reports/PHASE4_...` cross-links and the final report.

### 1. `PHASE4_5_CORE_ERP_DOMAIN_VALIDATION_<ts>.md` (single master report)

Sections:

1. **Scope & Method** — modules in scope, sources reviewed, evaluation criteria (single responsibility, single owner per capability, unambiguous master data ownership, acyclic dependencies).
2. **Domain Boundary Matrix** — one row per module: bounded context, primary domain, business responsibility statement, in-scope / out-of-scope summary.
3. **Capability Ownership Matrix** — one row per capability, exactly one owning module, with columns: Capability | Owner | Consumers | Source (PRD §). Covers at minimum: Item Master, Product Catalog, Warehouse Master, Bin Locations, Stock Ledger, Inventory Valuation, Goods Receipt, Goods Issue, Stock Transfer, Purchase Receipt, Sales Dispatch, Cycle Count, Physical Stock, Barcode/RFID, Put-away, Picking, Packing, Shipping, Multi-Warehouse, Batch/Serial Management.
4. **Master Data Ownership Table** — system of record per entity (Item, Warehouse, Bin, UoM, Customer, Supplier, GL Account, Stock Balance, Batch, Serial, etc.). Duplicate ownership flagged.
5. **Business Process Mapping** — end-to-end flows with per-step owning module: Procure-to-Pay, Order-to-Cash, Inventory Replenishment, Warehouse Operations (inbound + outbound), Inter-Warehouse Transfers.
6. **Dependency Validation** — confirm/adjust the declared order Accounting → Sales → Purchase → Inventory → Warehouse; check for cycles; verify each declared `depends_on` is actually used.
7. **Gap & Overlap Analysis** — table of findings, each classified as Duplication | Missing Capability | Ambiguous Owner | No Issue, with severity (INFO / MINOR / MAJOR / CRITICAL per `FINDING_SEVERITY_STANDARD.md`) and a recommended action (Confirm / Clarify PRD / Boundary Adjustment).
8. **Recommendations** — per finding: no-op, PRD clarification (follow-up work item), or boundary adjustment (requires ADR).
9. **Verification Summary** — standard Check / Result / Action table (repository verification standard), 16 checks, must be mathematically consistent.

### 2. `ADR-<next-id>-core-erp-module-boundaries.md`

Placed under the appropriate ADR category folder in `docs/11-adrs/` using the next unused ID. Records the final decision on the Inventory (MOD-005) vs Warehouse (MOD-019) split and any other boundary decisions surfaced. If no changes are required, the ADR explicitly states the current architecture is **confirmed as-is** and lists the evidence.

### 3. `PHASE4_5_VERIFICATION_<ts>.md`

Independent 16-check verification of the master report against its own claims and against source PRDs (every ownership assertion traceable to a PRD section; no duplicate owners; no orphan capabilities; dependency graph acyclic).

## Method

1. Read the 5 Module PRDs + Baselines + module dependency matrix in parallel.
2. Extract capabilities and master data claims verbatim into the Capability Ownership and Master Data tables.
3. Diff for duplicates, gaps, and ambiguity — do not rely on memory; every row cites a PRD section.
4. Walk the 5 end-to-end processes step-by-step, naming the owning module per step.
5. Classify findings; author the ADR reflecting the decision.
6. Run the verification pass.

## Exit Criteria

- Every Core ERP capability has exactly one owning module in the matrix.
- Inventory vs Warehouse responsibilities are unambiguous and recorded in the ADR.
- Purchase ↔ Inventory ↔ Warehouse interactions validated on Procure-to-Pay and Warehouse Operations flows.
- Implementation sequence Accounting → Sales → Purchase → Inventory → Warehouse either confirmed or updated with rationale.
- ADR is in `Accepted` status (or `Proposed` awaiting your sign-off if a real boundary change is proposed).
- Verification report is 16/16 PASS.

## Out of Scope (Explicit)

- Non-Core-ERP modules (CRM, HRMS, Payroll, Manufacturing, Projects, AMC, Field Service, Assets, Fleet, POS, Service Desk, Analytics, AI Workspace, Platform Admin) — validated in a later phase if needed.
- Wave 1 SD authoring — begins only after this phase exits and you approve the ADR.

## Technical Details

- New folder: `docs/51-architecture-validation/` (documents-only; no code, no navigation entry in this phase).
- ADR ID: next unused number in the appropriate category range per `docs/11-adrs/README.md` § ADR Number Ranges. Chosen at authoring time after reading the ADR index.
- Timestamp format: `YYYYMMDDTHHMMSSZ` matching existing audit reports.
- Verification format: existing repository Verification Reporting Standard (Metadata header + Check/Result/Action table + Verification Summary).
- If any finding requires a PRD or Baseline correction, it is logged as a follow-up work item inside the master report — not executed in this phase.

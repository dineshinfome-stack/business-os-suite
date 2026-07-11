# Pass 8.9.1 (Resolved) — MOD-019 Warehouse Module PRD (Stage 1)

## Preflight Result — Module ID Resolution

Read `docs/MODULE_CATALOG.md` (lines 38–55). Findings:

| Check | Result |
|---|---|
| Highest allocated Module ID | **MOD-018** (AI Workspace) |
| First unallocated Module ID | **MOD-019** |
| Warehouse already registered under any name (MOD-001…MOD-018)? | **No** — none of Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, Payroll, Manufacturing, Projects, AMC, Field Service, Assets, Fleet, POS, Service Desk, Analytics, AI Workspace is Warehouse |
| MOD-006 current assignment | **CRM** — preserved, never reassigned |
| Catalog range statement | Summary (line 3) currently reads `MOD-001..MOD-018` — must extend to `MOD-001..MOD-019` on registration |

**Selected Module ID: `MOD-019 Warehouse`.**

No existing Module ID is modified. CRM (MOD-006) is untouched. The "Module IDs are immutable and never reused" invariant is preserved.

## Scope Change vs Prior Plan

The previously finalized Pass 8.9.1 plan in `.lovable/plan.md` remains valid in structure, template, verification checklist (13 items), Cross-Sprint Coverage Gate, and Repository Audit Spec v1.0. The **only** change is the Module identifier:

- Every occurrence of `MOD-006 Warehouse` → `MOD-019 Warehouse`
- Sprint IDs: `SPR-MOD-019-001` … `SPR-MOD-019-006`
- Baseline (future Stage 3): `MOD019_WAREHOUSE_BASELINE_v1`
- Directory: `docs/20-module-prds/warehouse/` and `docs/30-sprint-prds/warehouse/` (name-based, unchanged)

## Part A — Governance Registration (First)

Before authoring the Module PRD, register the new identifier so downstream verification resolves cleanly:

1. `docs/MODULE_CATALOG.md`
   - Update summary line 3: `MOD-001..MOD-018` → `MOD-001..MOD-019`.
   - Append row: `| MOD-019 | Warehouse | Authored | Operations | docs/20-module-prds/warehouse/MODULE_PRD.md | See Section 12 of the PRD | Operations |`.
2. `docs/ENGINE_USAGE_MATRIX.md` — add MOD-019 Warehouse entry consistent with existing style (module list only; engine allocations follow when Sprints exist).
3. `docs/DOCUMENT_INDEX.md`, `docs/REPOSITORY_MAP.md`, `docs/_meta.json` — add entries for the new Module PRD and Sprint Plan paths.
4. `docs/20-module-prds/README.md` and `docs/30-sprint-prds/README.md` — add Warehouse rows.

## Part B — Authoring (Unchanged Template)

1. `docs/20-module-prds/warehouse/MODULE_PRD.md` — 23-section Stage 1 Module PRD, using MOD-019 throughout.
2. `docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md` — 6 Sprints with the 7-column Capability Allocation Matrix and deterministic engine/ADR allocation from the authoritative catalogs.

Normative Source Precedence, canonical ordering, and fixed-schema reports are inherited verbatim from the finalized Pass 8.9.1 plan.

## Part C — Verification (Pass 8.9.1-V)

Run the 13-item Stage 1 checklist unchanged. Metadata Consistency check now specifically verifies:
- `MOD-019` appears in `MODULE_CATALOG.md` with status `Authored`.
- `MOD-006` remains `CRM` (regression guard).
- Catalog summary range covers MOD-019.

## Part D — Cross-Sprint Coverage Gate

Emit the 5-column Cross-Sprint Coverage Report (Capability | Origin Sprint | Section | Exact Quote | Status). Gate must pass before Audit.

## Part E — Repository Audit (Spec v1.0)

Execute the 18-check audit with portable revision metadata. Additional Metadata Consistency assertions:
- No existing Module ID was renamed, merged, split, or transferred.
- MOD-006 = CRM (unchanged).
- MOD-019 = Warehouse (newly allocated, first unused ID).

## Files to Modify / Create

**Created:**
- `docs/20-module-prds/warehouse/MODULE_PRD.md`
- `docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`
- `docs/30-sprint-prds/warehouse/README.md`

**Modified (registration only):**
- `docs/MODULE_CATALOG.md`
- `docs/ENGINE_USAGE_MATRIX.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/REPOSITORY_MAP.md`
- `docs/_meta.json`
- `docs/20-module-prds/README.md`
- `docs/30-sprint-prds/README.md`
- `.lovable/plan.md` (record resolution)

**Not modified:** any existing Module PRD, Sprint PRD, Baseline, ADR, or the CRM (MOD-006) row.

## Reported Selection

**Selected Module ID for Warehouse: `MOD-019`** — first unallocated ID in `docs/MODULE_CATALOG.md`. Awaiting approval to proceed.

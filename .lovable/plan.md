# Pass 8.9.4 — SPR-MOD-019-003 Picking, Wave Planning & Dispatch

Author the third MOD-019 Warehouse Stage 2 Sprint PRD under frozen Governance Specification v1.0, reusing the canonical Stage 2 template from Passes 8.9.2 / 8.9.3 with sprint-specific substitutions only.

## Part 0 — Preflight (Read-Only)

Read verbatim from Tier A + Tier B + reference Sprint PRDs:

- Tier A: `MODULE_IMPLEMENTATION_WORKFLOW.md`, `MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ENGINE_USAGE_MATRIX.md`, `ADR_INDEX.md`, `event-catalog.md`, `SPRINT_AUTHORING_GUIDE.md`
- Tier B: `20-module-prds/warehouse/MODULE_PRD.md`, `30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`
- Reference: `SPR-MOD-019-001-warehouse-foundation.md`, `SPR-MOD-019-002-inbound-execution.md`

Resolve verbatim from Sprint Plan (no hard-coding): `owner`, `related_engines`, `related_adrs`, Sprint Exit Criteria, Sprint 003 capability rows.

**Event resolution rule (Refinement #1):** `related_events` SHALL resolve from the Event Catalog. If the Event Catalog does not yet publish Sprint 003 events, only the Sprint-Plan-allocated `R-EV-*` placeholders MAY be used. No other source is permitted.

## Part A — Sprint Capability Allocation Gate

Single authoritative source: Capability Allocation Matrix in `MOD-019_SPRINT_PLAN.md`. Module PRD used only to validate capability origin.

Build report: `| Module Capability | Sprint Allocation | Status | Evidence |`

Nine validations:
1. Every Sprint 003 capability originates from Module PRD.
2. Every allocated capability appears exactly once.
3. No Sprint 001–002 capability present.
4. No Sprint 004–006 capability present.
5. No duplicate originating allocation.
6. No orphan capability.
7. Engines identical to Sprint Plan.
8. ADRs identical to Sprint Plan.
9. Events from Event Catalog or Sprint-Plan-allocated `R-EV-*` only.

Fail → Repository Status = NOT READY, STOP.

## Part B — Author Sprint PRD

Create `docs/30-sprint-prds/warehouse/SPR-MOD-019-003-picking-wave-planning-dispatch.md` (kebab-case).

Frontmatter: `module_id: MOD-019`, `sprint_id: SPR-MOD-019-003`, `sprint_name: Picking, Wave Planning & Dispatch`, `stage: 2`, `pass: 8.9.4`, `version: v1.0`, `status: Draft`, `updated: 2026-07-11`, with `owner`, `size`, `related_engines`, `related_adrs`, `related_events` resolved verbatim per Preflight rules. Tags: `sprint-prd, warehouse, picking, wave, dispatch, mod-019`.

18 canonical sections:
1. Executive Summary
2. Sprint Scope — Included (Picking Execution, Pick Task Lifecycle, Wave Planning, Wave Release, Wave Optimization, Picking Confirmation, Dispatch Execution, Dispatch Confirmation, Shipment Staging, Dock Dispatch Coordination, Outbound Exception Handling) / Excluded (foundation masters, receiving, putaway, transfers, resource mgmt, scheduling, analytics, monitoring, inventory valuation, stock ledger, accounting, warehouse master, bin master)
3. Business Capabilities — Sprint 003 only
4. Functional Requirements — Pick Request, Pick Generation, Pick Assignment, Wave Planning, Wave Optimization, Pick Confirmation, Dispatch Validation, Dispatch Completion, Exception Resolution
5. Business Processes — Pick Planning, Wave Planning, Wave Release, Picking, Dispatch, Shipment Completion, Exception Processing
6. Governance — operational, wave lifecycle, dispatch lifecycle, config inheritance, audit
7. Ownership Boundaries — Owns: picking/wave/dispatch execution + outbound workflow. Consumes read-only: WH master, bin master, item master, inventory availability, sales shipment requests, tenant, branch, users. Does NOT own: inventory ledger/valuation, WH/bin masters, accounting, financial posting, sales commercial process. Invariant: Inventory mutations only via approved Inventory contracts; Warehouse emits events, never directly mutates inventory balances or valuation.
8. Dependencies — MOD-001, MOD-003, MOD-005, SPR-MOD-019-001, SPR-MOD-019-002
9. ERP Core Engine Consumption — verbatim from Sprint Plan (Purpose / Reason / Consumption boundary each)
10. ADR Consumption — Accepted only, verbatim
11. Data Model — Pick Request, Pick Task, Wave, Wave Line, Dispatch Task, Dispatch Confirmation, Shipment Stage, Dispatch Status (business entities only, no schemas)
12. Events — verbatim from Event Catalog or allocated `R-EV-*`; no invented IDs
13. Integration Contracts — outbound APIs, sales shipment interface, inventory availability, inventory reservation read, warehouse config, MDM
14. Security — ADR-011, ADR-014, ADR-032
15. Authorization — ENG-002, ENG-003, RBAC, ABAC
16. Operational Constraints — verbatim from Module PRD
17. Implementation Readiness — Sprint Exit Criteria verbatim from Sprint Plan
18. References

Ownership conventions established: Picking Execution Ownership, Wave Planning Ownership, Dispatch Execution Ownership, Inventory Ledger Boundary, Sales Commercial Boundary.

## Part C — Governance Registration (each modified exactly once)

1. `SPR-MOD-019-003-picking-wave-planning-dispatch.md` (new)
2. `30-sprint-prds/warehouse/README.md`
3. `SPRINT_CATALOG.md` — only if SPRINT_AUTHORING_GUIDE requires it; else record reason
4. `DOCUMENT_INDEX.md`
5. `_meta.json`
6. `.lovable/plan.md`

Must NOT modify: MODULE_PRD, Sprint Plan, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, ENGINE_CATALOG, ADR_INDEX, Event Catalog, Module Baselines.

## Part D — Stage 2 Verification (Pass 8.9.4-V)

15 checks; loop until Failed = 0; invariant Passed + Remediated + Failed = 15:

1 Frontmatter complete · 2 18 sections · 3 Capability completeness · 4 No capability outside Sprint 003 · 5 Engines identical · 6 ADRs Accepted only · 7 Events identical · 8 Ownership preserved · 9 Deps resolve from Module Catalog · 10 Registrations exactly once · 11 Repo consistency · 12 Metadata consistency · 13 Bidirectional capability completeness · 14 Cross-Sprint Leakage (no Sprint 001/002/004/005/006 capability) · 15 Ownership Preservation vs Module PRD.

## Part E — Repository Audit (Spec v1.0)

Mandatory Read Set: WORKFLOW, MODULE_PRD, Sprint Plan, SPR-001, SPR-002, ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX, event-catalog, SPRINT_AUTHORING_GUIDE, warehouse/README, DOCUMENT_INDEX, _meta.json, SPRINT_CATALOG.

Metadata: Spec v1.0, UTC timestamp, auditor, tool versions, repo revision (D3 waiver if unavailable), Declared Files Modified, Actual Change Set, SHA-256 hashes.

Determinism Invariant: Declared = Actual exactly; deviation = Major finding.

**Sprint PRD Semantic Invariants (7 — Refinement #2 adds #7):**
1. No capability added
2. No capability removed
3. No capability renamed
4. No capability merged
5. No capability split
6. No ownership transferred
7. No capability reallocated across Sprint boundaries

Evidence Table: Check | PASS/FAIL | Severity | Repository Evidence | Required Fix.

Coverage: Stage 2 Verification, Capability Allocation Integrity, Engine Authority, ADR Authority, Event Authority, Ownership Boundary, Cross-Sprint Leakage, Semantic Invariants, Repository Consistency, Metadata Consistency, Cross-Reference Validation, Artifact Integrity.

Confidence ∈ {HIGH, MEDIUM, LOW}. Repository Status READY ⇔ Critical = 0 ∧ Major = 0.

## Closing Artifacts (append to `.lovable/plan.md`)

1 Authoritative Source Resolution Log · 2 Sprint Capability Allocation Report · 3 Verification Metadata · 4 Verification Table (15 rows) · 5 Verification Summary · 6 Repository Audit Metadata · 7 Repository Audit Evidence Table · 8 Sprint PRD Semantic Invariants (7) · 9 Final Report. Mirror summary in chat.

## Outcome

Pass 8.9.4 complete only when: Allocation Gate = PASS ∧ Verification = 15/15 ∧ Audit = READY ∧ Confidence = HIGH (or MEDIUM solely under D3 environmental waiver).

Next: **Pass 8.9.5 — SPR-MOD-019-004 Warehouse Transfers & Task Management**.

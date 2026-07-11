# Pass 8.9.4 — SPR-MOD-019-003 Storage & Slotting (Stage 2 Sprint PRD)

Author the third MOD-019 Warehouse Stage 2 Sprint PRD under frozen Governance Specification v1.0, using the **authoritative sprint name from `MOD-019_SPRINT_PLAN.md`**: **Storage & Slotting**. No governance amendments. Sprint Plan is the sole allocation source. Sprints 004–007 remain: Outbound Execution → Yard, Dock & Load-Out → Warehouse Labor, Equipment & Analytics (numbering per existing plan).

## Part 0 — Preflight (Read-Only)

- Tier A: `MODULE_IMPLEMENTATION_WORKFLOW.md`, `MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ENGINE_USAGE_MATRIX.md`, `ADR_INDEX.md`, `event-catalog.md`, `SPRINT_AUTHORING_GUIDE.md`
- Tier B: `20-module-prds/warehouse/MODULE_PRD.md`, `30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`
- Reference: `SPR-MOD-019-001-warehouse-foundation.md`, `SPR-MOD-019-002-inbound-execution.md`

Resolve verbatim from Sprint Plan §2/§4.1 Sprint 003 row: `sprint_name`, `owner`, `size`, `related_engines`, `related_adrs`, capabilities, Sprint Exit Criteria.

**Event resolution rule:** verbatim from Event Catalog; if Sprint-003 events are not yet published there, only Sprint-Plan-allocated `R-EV-*` placeholders MAY be used. No invention.

## Part A — Sprint Capability Allocation Gate

Single authoritative source: Capability Allocation Matrix in `MOD-019_SPRINT_PLAN.md`. Module PRD used only to validate capability origin.

Report shape: `| Module Capability | Sprint Allocation | Status | Evidence |`

Nine validations:
1. Every Sprint 003 capability originates from Module PRD.
2. Every allocated capability appears exactly once in Sprint 003.
3. No Sprint 001–002 capability present.
4. No Sprint 004+ capability present.
5. No duplicate originating allocation.
6. No orphan capability.
7. Engines identical to Sprint Plan.
8. ADRs identical to Sprint Plan (Accepted only).
9. Events from Event Catalog or Sprint-Plan-allocated `R-EV-*` only.

Fail → Repository Status = NOT READY, STOP.

## Part B — Author Sprint PRD

Create `docs/30-sprint-prds/warehouse/SPR-MOD-019-003-storage-slotting.md` (kebab-case).

Frontmatter: `module_id: MOD-019`, `sprint_id: SPR-MOD-019-003`, `sprint_name: Storage & Slotting`, `stage: 2`, `pass: 8.9.4`, `version: v1.0`, `status: Draft`, `updated: 2026-07-11`, with `owner`, `size`, `related_engines`, `related_adrs`, `related_events` resolved verbatim from Sprint Plan. Tags: `sprint-prd, warehouse, storage, slotting, mod-019`.

18 canonical sections (scope reflects Storage & Slotting only; exact capability list resolved verbatim from Sprint Plan §4.1 at execution):

1. Executive Summary
2. Sprint Scope — Included: storage strategy, bin/location assignment, slotting rules, storage optimization, re-slotting, location capacity/occupancy, storage constraint enforcement (per Sprint Plan) / Excluded: foundation masters (SPR-001), inbound/putaway execution (SPR-002), outbound/picking/wave/dispatch (SPR-004+), yard/dock/load-out (SPR-005+), labor/equipment/analytics (SPR-006+), inventory ledger/valuation (MOD-005), item/bin/warehouse master ownership (MOD-005)
3. Business Capabilities — Sprint 003 only, verbatim
4. Functional Requirements — storage assignment, slotting evaluation, re-slotting recommendation, capacity/occupancy checks, constraint enforcement
5. Business Processes — Slotting Planning, Storage Assignment, Re-slotting, Capacity Review, Constraint Resolution
6. Governance — operational, slotting lifecycle, configuration inheritance, audit
7. Ownership Boundaries — Owns: storage strategy + slotting rules + location assignment logic. Consumes read-only: WH master, bin master, item master, inventory availability, tenant/branch/users. Does NOT own: inventory ledger/valuation, WH/bin/item masters, putaway execution, picking, accounting. **Invariant: Warehouse SHALL NOT directly mutate inventory balances or valuation; storage/slotting effects propagate via events consumed by MOD-005.**
8. Dependencies — MOD-001, MOD-003 (as applicable), MOD-005, SPR-MOD-019-001, SPR-MOD-019-002
9. ERP Core Engine Consumption — verbatim from Sprint Plan (Purpose / Reason / Consumption boundary)
10. ADR Consumption — Accepted only, verbatim
11. Data Model — Storage Strategy, Slotting Rule, Slotting Recommendation, Location Assignment, Capacity Snapshot, Occupancy Record (business entities only, no schemas)
12. Events — verbatim from Event Catalog or allocated `R-EV-*`; no invented IDs
13. Integration Contracts — inventory availability read, warehouse config, MDM, inbound event subscriptions (putaway completion), outbound event subscriptions (pick issuance) as slotting inputs — read-only
14. Security — ADR-011, ADR-014, ADR-032
15. Authorization — ENG-002, ENG-003, RBAC, ABAC
16. Operational Constraints — verbatim from Module PRD
17. Implementation Readiness — Sprint Exit Criteria verbatim from Sprint Plan
18. References

Ownership conventions established: **Storage Strategy Ownership**, **Slotting Rule Ownership**, **Location Assignment Ownership**, **Inventory Ledger Boundary**, **Master Data Consumption Boundary**.

## Part C — Governance Registration (each modified exactly once)

1. `SPR-MOD-019-003-storage-slotting.md` (new)
2. `30-sprint-prds/warehouse/README.md`
3. `SPRINT_CATALOG.md` — per `SPRINT_AUTHORING_GUIDE.md` §5 (Stage 2 mandatory)
4. `DOCUMENT_INDEX.md`
5. `_meta.json`
6. `.lovable/plan.md`

Must NOT modify: MODULE_PRD, Sprint Plan, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, ENGINE_CATALOG, ADR_INDEX, Event Catalog, Module Baselines.

## Part D — Stage 2 Verification (Pass 8.9.4-V)

15 checks; loop until Failed = 0; invariant Passed + Remediated + Failed = 15:

1 Frontmatter complete · 2 18 sections · 3 Capability completeness · 4 No capability outside Sprint 003 · 5 Engines identical · 6 ADRs Accepted only · 7 Events identical · 8 Ownership preserved · 9 Deps resolve from Module Catalog · 10 Registrations exactly once · 11 Repo consistency · 12 Metadata consistency · 13 Bidirectional capability completeness · 14 Cross-Sprint Leakage (no Sprint 001/002/004+ capability) · 15 Ownership Preservation vs Module PRD.

## Part E — Repository Audit (Spec v1.0)

Mandatory Read Set: WORKFLOW, MODULE_PRD, Sprint Plan, SPR-001, SPR-002, ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX, event-catalog, SPRINT_AUTHORING_GUIDE, warehouse/README, DOCUMENT_INDEX, _meta.json, SPRINT_CATALOG.

Metadata: Spec v1.0, UTC timestamp, auditor, tool versions, repo revision (D3 waiver if unavailable), Declared Files Modified, Actual Change Set, SHA-256 hashes.

**Determinism Invariant:** Declared = Actual exactly; deviation = Major finding.

**Sprint PRD Semantic Invariants (7):**
1. No capability added · 2 removed · 3 renamed · 4 merged · 5 split · 6 ownership transferred · 7 reallocated across Sprint boundaries.

Evidence Table: Check | PASS/FAIL | Severity | Repository Evidence | Required Fix.

Coverage: Stage 2 Verification, Capability Allocation Integrity, Engine Authority, ADR Authority, Event Authority, Ownership Boundary, Cross-Sprint Leakage, Semantic Invariants, Repository Consistency, Metadata Consistency, Cross-Reference Validation, Artifact Integrity.

Confidence ∈ {HIGH, MEDIUM, LOW}. Repository Status READY ⇔ Critical = 0 ∧ Major = 0.

## Closing Artifacts (append to `.lovable/plan.md`)

1 Authoritative Source Resolution Log · 2 Sprint Capability Allocation Report · 3 Verification Metadata · 4 Verification Table (15 rows) · 5 Verification Summary · 6 Repository Audit Metadata · 7 Repository Audit Evidence Table · 8 Sprint PRD Semantic Invariants (7) · 9 Final Report. Mirror summary in chat.

## Outcome

Pass 8.9.4 complete only when: Allocation Gate = PASS ∧ Verification = 15/15 ∧ Audit = READY ∧ Confidence = HIGH (or MEDIUM solely under D3 environmental waiver).

Next: **Pass 8.9.5 — SPR-MOD-019-004 Outbound Execution** (per frozen Sprint Plan sequence).

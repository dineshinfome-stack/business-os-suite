# Pass 8.9.0 — MOD-005 Inventory Baseline (Stage 3)

Authoritative Stage 3 consolidation for MOD-005 Inventory. No new capabilities. No Sprint PRD modifications (governance registrations only).

---

## Part 0 — Preflight (Read-Only)

Read verbatim, resolve identifiers, capture line ranges for evidence:

**Stage 2 Sources**
- `docs/20-module-prds/inventory/MODULE_PRD.md`
- `docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md`
- `SPR-MOD-005-001` … `SPR-MOD-005-006`

**Governance**
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md`
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
- `docs/SPRINT_AUTHORING_GUIDE.md`

**Reference Baselines**
- `MOD001_*`, `MOD002_*`, `MOD003_SALES_BASELINE_v1.md`, `MOD004_PURCHASE_BASELINE_v1.md` (structure template)

No writes in Preflight.

---

## Part A — Cross-Sprint Coverage Validation (Entry Gate)

Build the Coverage Report by extracting the Module PRD capability list and mapping each to exactly one originating Sprint via the Sprint Plan; confirm each Sprint PRD implements only its allocated capabilities.

Validations (10):
1. Every Module capability appears exactly once in Sprint Plan.
2. Each allocation lands in exactly one Sprint PRD.
3. Sprints 001–006 collectively cover 100%.
4. No omissions.
5. No duplicates.
6. No Sprint introduces capabilities absent from the Module PRD.
7. Forward + reverse traceability complete.
8. No orphan Sprint capability.
9. No duplicate originating allocation.
10. Emit **Cross-Sprint Coverage Report** table with columns:
    `Module Capability | Sprint Allocation | Sprint PRD | Section | Status`
    (Section = exact heading/anchor in the Sprint PRD where the capability is implemented, to serve as direct audit evidence.)

**Gate rule:** any FAIL → STOP, do not author Baseline, emit `Repository Status = NOT READY`, `Confidence = HIGH`, remediation list.

---

## Part B — Author Baseline

Create `docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`, mirroring the MOD-004 Baseline structure.

**Frontmatter**
```yaml
module_id: MOD-005
module_name: Inventory
document_type: Module Baseline
stage: 3
pass: 8.9.0
version: v1.0
status: Draft
owner: Inventory
updated: 2026-07-10
source_stage: Stage 2 Sprint PRDs
size: Large
related_engines: <deterministic set union — see rule below>
related_adrs:    <deterministic set union — see rule below>
```

**Deterministic Union Rules**
- **Engines:** `related_engines` SHALL be the set union of authoritative engine identifiers allocated across Sprints 001–006 in `MOD-005_SPRINT_PLAN.md`, resolved verbatim from `ENGINE_CATALOG.md`, duplicates removed, preserving the canonical ordering defined by `ENGINE_CATALOG.md` where that ordering is normative.
- **ADRs:** `related_adrs` SHALL be the set union of Accepted ADRs referenced by Sprint PRDs 001–006, resolved verbatim from `ADR_INDEX.md`, duplicates removed, preserving canonical ordering defined by `ADR_INDEX.md`.

**18 Sections**
1. Purpose
2. Module Scope
3. Business Capabilities (consolidated Sprint 1–6, no additions)
4. Business Processes
5. Governance (Inventory Master, Item Master, Receipt, Movement, Adjustment, Stock Count Boundary, Valuation, Replenishment, Analytics, Read Model, Operational Control — carried verbatim from Sprints)
6. Ownership Boundaries (Accounting, Warehouse, Purchase, Sales, MDM)
7. Dependencies (from `MODULE_CATALOG.md` verbatim)
8. ERP Core Engine Consumption (deterministic union; verbatim IDs)
9. ADR Consumption (Accepted only; deterministic union)
10. Data Model Overview
11. Events (verbatim from `event-catalog.md` or `R-EV-*`)
12. Integration Contracts
13. Security
14. Authorization
15. Operational Constraints
16. Traceability Matrix (Capability ↔ Sprint ↔ Engine ↔ ADR ↔ Event)
17. Implementation Readiness (per `MODULE_IMPLEMENTATION_WORKFLOW.md`)
18. References

**Baseline Semantic Invariants (Consolidation Integrity)**
- No capability **added**
- No capability **removed**
- No capability **renamed**
- No capability **merged**
- No capability **split**
- No **ownership transferred** or otherwise redefined

---

## Part C — Governance Registration (exactly once each)

Update:
1. `docs/MODULE_BASELINE_CATALOG.md`
2. `docs/40-module-baselines/README.md`
3. `docs/DOCUMENT_INDEX.md`
4. `docs/_meta.json`
5. `.lovable/plan.md`

**Do NOT modify:** `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md`, any Sprint PRD, Sprint Plan, or Module PRD.

**Declared Files Modified (change set)**
1. `docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md` (new)
2. `docs/MODULE_BASELINE_CATALOG.md`
3. `docs/40-module-baselines/README.md`
4. `docs/DOCUMENT_INDEX.md`
5. `docs/_meta.json`
6. `.lovable/plan.md`

---

## Part D — Stage 3 Verification (8.9.0-V)

Emit Verification Metadata, Check/Result/Action table, Verification Summary, Repository Status.

Checks:
1. Frontmatter completeness
2. Stage 3 structure — 18 required sections
3. Business capability completeness
4. Cross-Sprint Coverage revalidation
5. Engine IDs identical across `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`; deterministic-union rule respected
6. ADR IDs Accepted only; deterministic-union rule respected
7. Events verbatim from `event-catalog.md` or `R-EV-*`
8. Dependencies verbatim from `MODULE_CATALOG.md`
9. Governance registrations completed exactly once
10. Baseline consistency — no capability added, removed, renamed, merged, or split; no ownership transferred
11. Implementation readiness per `MODULE_IMPLEMENTATION_WORKFLOW.md`
12. Repository consistency — no duplicate IDs, no broken references

Invariant: `Passed + Remediated + Failed = Checks`. Failure → minimum edits to Baseline only; re-run until `Failed = 0`.

---

## Part E — Repository Audit (Spec v1.0)

Apply the Access Guard Clause exactly as defined in `MODULE_IMPLEMENTATION_WORKFLOW.md`.

**Audit Metadata:** Repository Audit Specification Version 1.0, UTC timestamp, Auditor, Tool Versions, Repository Revision Identifier, Change Tracking Mechanism, Declared vs Actual change set, Mandatory Read Set opened.

**Evidence Table:** `Check | PASS/FAIL | Severity | Repository Evidence (path + line range or unique heading + exact quote) | Required Fix`.

Coverage:
- All Stage 3 Verification checks
- **Metadata Consistency** — Baseline metadata (module_id, module_name, version, status, owner, updated, path) SHALL match exactly across `MODULE_BASELINE_CATALOG.md`, `docs/40-module-baselines/README.md`, `docs/DOCUMENT_INDEX.md`, and `docs/_meta.json`.
- Repository Consistency
- Cross-Sprint Coverage Validation
- Authoritative Source Integrity (Sprint PRDs, Sprint Plan, Module PRD, ENGINE_CATALOG, ADR_INDEX, MODULE_CATALOG, event-catalog untouched)
- Cross-reference validation
- Artifact integrity

**Final Report:** Passed / Remediated / Failed; Critical / Major / Minor; Repository Status; Confidence; Revision; SHA-256 artifact hashes.

**Invariants**
- `Passed + Remediated + Failed = Checks`
- `READY ⇔ Critical = 0 ∧ Major = 0`
- `Proceed ⇔ READY ∧ HIGH`

---

## Closing Artifacts

Append to `.lovable/plan.md` and mirror in chat: Cross-Sprint Coverage Report, Verification Metadata, Verification Table, Repository Audit, Final Report.

---

## Stage 3 Completion Statement

MOD-005 SHALL be considered **Stage 3 Complete** only after the Repository Audit reports `Repository Status = READY` at `Confidence = HIGH`. Upon completion, `MOD005_INVENTORY_BASELINE_v1.md` becomes the **sole authoritative Stage 3 consolidation** for MOD-005 Inventory, while Sprint PRDs 001–006 remain the **authoritative implementation records**. Neither role supersedes the other; they operate at distinct governance layers.

## Outcome

Stage 3 completes only when Coverage = PASS, Verification = PASS, Audit = READY, Confidence = HIGH. Next: **Pass 8.9.1 — MOD-006 Warehouse Module PRD (Stage 1)**.

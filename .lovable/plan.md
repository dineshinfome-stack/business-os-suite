# Pass 8.6.5 — SPR-MOD-004-005 (Purchase Returns & Vendor Adjustments) + 8.6.5-V

Documentation-only. Author MOD-004 Sprint 5 Sprint PRD following the established 18-section template and execute the 10-item repository verification.

## Part A — Author Sprint PRD

**File:** `docs/30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md`

**Title:** Purchase Returns & Vendor Adjustments

**Frontmatter:**
- `sprint_id: SPR-MOD-004-005`, `parent_module: MOD-004`, `iteration: Sprint 5`
- `stage: 2`, `pass: 8.6.5`, `size: Medium`, `status: Draft`
- `owner: Purchase`, `updated: 2026-07-10`, `document_type: Sprint PRD`
- `related_engines`: resolved verbatim from Sprint 5 allocation in `MOD-004_SPRINT_PLAN.md`, cross-checked against `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`
- `related_adrs`: Accepted-only, verbatim from `ADR_INDEX.md`
- `tags: [sprint, prd, purchase, returns, vendor-adjustments, mod-004]`

**Preflight reads (lock verbatim IDs before authoring):**
- `docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md` — Sprint 5 engine/ADR allocation
- `docs/10-erp-core/ENGINE_CATALOG.md` and `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md` — authoritative event names (else deferred `R-EV-*`)
- `docs/MODULE_CATALOG.md` — module ID resolution
- `docs/30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md` — structural template reference

**Sections 1–18:**
- §1 In-Scope / Out-of-Scope (commercial return lifecycle; excludes inventory transactions, accounting/tax postings, payables, payments, analytics)
- §1.1–§1.8 Governance conventions: Purchase Return ownership; PO/GRN/Vendor Billing consumption boundaries (SPR-MOD-004-002/003/004 as originating suppliers); Inventory + Accounting consumption boundaries; Vendor Adjustment boundary; Governance Complement clause
- §2 Deliverables with forward reference to SPR-MOD-004-006
- **§3 Bidirectional Sprint ↔ Module PRD Traceability** — include explicit **forward** (Sprint capability → Module PRD capability) and **reverse** (Module PRD capability → originating Sprint allocation) tables, with these rules stated verbatim:
  - Every Module PRD capability SHALL map to exactly one originating Sprint allocation.
  - Every Sprint capability SHALL trace back to an approved Module PRD capability.
  - No orphan Sprint capability.
  - No unallocated Module PRD capability.
  - No duplicate originating allocation.
- §4 User Stories (Purchase Executive, Procurement Manager, Buyer, Vendor Coordinator, Branch Manager, Accounts Liaison, System Administrator) — each traces to a Deliverable
- §5 Acceptance Criteria (Given/When/Then) including the three verbatim inventory/accounting non-modification statements
- §6 Parent Module PRD reference with fulfilled sections
- §7 Dependencies with verbatim originating-supplier wording for PO/GRN/Vendor Billing
- §8 Engine consumption — verbatim IDs, one-line usage each
- §9 Accepted ADR consumption — verbatim IDs, one-line usage each
- §10 Conceptual entities (Purchase Return, Return Line, Return Status, Vendor Return Authorization, Replacement Request, Vendor Adjustment Request, Debit Note Request, Return Attachment)
- **§11 Events** — Every event name SHALL resolve verbatim from `docs/02-architecture/event-catalog.md`. Any event that cannot be resolved SHALL NOT be invented and SHALL instead be recorded as a deferred `R-EV-*` risk. No Event Catalog modifications are permitted.
- §12–§13 DoD / Exit Criteria (repository standard)
- **§14 Risk Register** covering all 10 required risk areas. **Numbering engine SHALL be cited by verbatim engine identifier only if that identifier appears in both the Sprint 5 allocation of `MOD-004_SPRINT_PLAN.md` and `ENGINE_USAGE_MATRIX.md`; otherwise refer only to the repository-approved numbering engine without introducing an engine ID.**
- §15–§17 Test strategy, implementation notes, review gate
- §18 References (Purchase Module PRD, Sprint Plan, SPR-MOD-004-001..004, Engines, ADRs, Event Catalog, MOD001/002/003 Baselines, MODULE_CATALOG)

## Part B — Governance Registrations (updated: 2026-07-10, exactly once)

1. `docs/SPRINT_CATALOG.md` — add SPR-MOD-004-005 row (Draft, Procurement)
2. `docs/30-sprint-prds/purchase/README.md` — register Sprint 5
3. `docs/DOCUMENT_INDEX.md` — register new PRD
4. `docs/_meta.json` — register new PRD
5. `.lovable/plan.md` — append execution record

No edits to `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md` (pattern-based governance sufficient).

## Part C — Pass 8.6.5-V (10-item Verification)

1. Frontmatter completeness
2. 18-section structural conformance
3. **Engine allocation parity** — every engine identifier SHALL resolve verbatim from `ENGINE_CATALOG.md`, SHALL match `ENGINE_USAGE_MATRIX.md`, and SHALL exactly match the Sprint 5 allocation in `MOD-004_SPRINT_PLAN.md`; no placeholder, deprecated, undefined, duplicate, or additional engine identifiers are permitted
4. Bidirectional traceability with explicit forward + reverse tables and unique originating allocation
5. Accepted ADR validation (verbatim from `ADR_INDEX.md`)
6. Event Catalog validation (authoritative names or deferred `R-EV-*`; no invented events; Event Catalog unmodified)
7. Dependencies resolve verbatim from `MODULE_CATALOG.md` with explicit PO (SPR-MOD-004-002), GRN (SPR-MOD-004-003), Vendor Billing (SPR-MOD-004-004) originating-supplier wording
8. Governance registrations completed exactly once across the five files
9. Cross-module ownership preserved (Platform, Accounting, Sales, Inventory, Purchase)
10. Stage 2 Sprint PRD requirements satisfied per `MODULE_IMPLEMENTATION_WORKFLOW`

Failure handling: minimum edits to the new PRD only; re-run until Failed = 0. No edits to Module PRD, Sprint Plan, prior Sprints, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, Baselines, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, or any architecture/code artifacts.

## Closing Artifacts (appended to `.lovable/plan.md` and mirrored in chat)

1. **Verification Metadata**: Target, Pass (8.6.5-V), Date (2026-07-10), Verifier, Authoritative Sources Checked
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

`SPR-MOD-004-005-purchase-returns-vendor-adjustments.md` becomes the authoritative Sprint PRD for the commercial Purchase Returns and Vendor Adjustments lifecycle. Inventory transactions remain owned by Inventory; accounting/tax/payables/financial postings remain owned by MOD002 Accounting via approved contracts. Repository ready for **Pass 8.6.6 — SPR-MOD-004-006 (Purchase Analytics & Controls)**.

# Pass 8.8.3 — SPR-MOD-005-003 (Inventory Issues, Transfers & Reservations) + 8.8.3-V

## Objective
Author MOD-005 Sprint 3 Sprint PRD covering commercial inventory movement — Stock Issues, Internal Issues, Branch/Warehouse Transfers, Transfer Requests, Reservations, and Allocations — register it in governance, and execute the repository-standard 10-item Stage 2 verification. Preserve Sales, Purchase, Warehouse, and Accounting ownership through approved repository contracts.

## Preflight (read-only)
Resolve identifiers verbatim from:
- `docs/20-module-prds/inventory/MODULE_PRD.md` — §2 capabilities, §12 engines, §13 dependencies
- `docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md` — Sprint 3 allocation
- `docs/30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md` and `SPR-MOD-005-002-inventory-receipts-putaway.md` — template + governance parity
- `docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`, `MOD004_PURCHASE_BASELINE_v1.md` — Sales/Purchase ownership references
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md` (stub → defer as `R-EV-*`)
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`

No authoritative source is modified.

## Part A — Author Sprint PRD
Create `docs/30-sprint-prds/inventory/SPR-MOD-005-003-inventory-issues-transfers-reservations.md` using the exact 18-section template, disclaimer, numbering, governance wording, review gate, references, and traceability conventions used by SPR-MOD-005-001 and SPR-MOD-005-002.

### Frontmatter
`sprint_id: SPR-MOD-005-003`, `parent_module: MOD-005`, `iteration: Sprint 3`, `stage: 2`, `pass: 8.8.3`, `size: Large`, `status: Draft`, `owner: Inventory`, `updated: 2026-07-10`, `document_type: Sprint PRD`, `related_engines` and `related_adrs` resolved verbatim from Sprint 3 allocation, tags `[sprint, prd, inventory, issues, transfers, reservations, mod-005]`.

### Sections
1. **Objective & Scope** — In Scope: Stock Issue, Internal Issue, Branch Transfer, Warehouse Transfer Request, Inter-Branch Transfer Request, Stock Reservation, Inventory Allocation, availability/transfer/reservation validation, movement status, numbering, attachments, notifications, movement events. Out of Scope: Item Master, Purchase/Sales/Warehouse/Accounting ownership, Valuation, Costing, Posting, Physical Count, Adjustment, Lot/Serial, Analytics.
1.1–1.8. **Governance Conventions** (verbatim) — Inventory Movement Ownership; Sales Consumption Boundary; Warehouse Consumption Boundary; Reservation Boundary; Accounting Boundary; Transfer Coordination Boundary; Inventory Transaction Boundary; Governance Complement to MOD001/002/003/004 baselines and SPR-MOD-005-001/002.
2. **Sprint Deliverables** — with forward references to SPR-MOD-005-004/005/006.
3. **Bidirectional Traceability** — Forward + Reverse tables + five verbatim invariance statements.
4. **User Stories** — Inventory Executive, Warehouse Coordinator, Dispatch Officer, Branch Manager, Sales Liaison, Inventory Controller, System Administrator; each maps to a Deliverable.
5. **Acceptance Criteria** — Given/When/Then across all Sprint 3 topics + three verbatim ownership statements (Sales-order ownership preserved; Warehouse execution via approved contracts; downstream posting via Accounting contracts).
6. **Parent Module Reference** — Inventory Module PRD sections fulfilled.
7. **Dependencies** — Upstream (MOD001–004 baselines, SPR-MOD-005-001/002, Sprint Plan) with verbatim clauses; Downstream (SPR-MOD-005-004/005/006).
8. **ERP Core Engine Consumption** — engines verbatim from ENGINE_CATALOG + ENGINE_USAGE_MATRIX + Sprint 3 allocation; one-line usage each; no placeholders / deprecated / undefined / duplicate / additional IDs.
9. **ADR Consumption** — Accepted ADRs only, verbatim.
10. **Data Model Impact** — conceptual entities only, fully qualified: Inventory Issue, Inventory Issue Line, Inventory Transfer, Inventory Transfer Line, Transfer Request, Inventory Reservation, Inventory Allocation, Movement Status, Reservation Status, Movement Attachment, Movement Notification.
11. **Events** — verbatim from Event Catalog or deferred as `R-EV-*`; catalog unchanged.
12. **Definition of Done**; 13. **Sprint Exit Criteria**; 14. **Risk Register** (10 mandatory risks, status enum); 15. **Test Strategy**; 16. **Implementation Notes**; 17. **Review Gate**; 18. **References**.

## Part B — Governance Registration (exactly once each)
1. `docs/SPRINT_CATALOG.md` — add SPR-MOD-005-003 (Draft).
2. `docs/30-sprint-prds/inventory/README.md` — link new Sprint PRD.
3. `docs/DOCUMENT_INDEX.md` — register document.
4. `docs/_meta.json` — add entry.
5. `.lovable/plan.md` — append Pass 8.8.3 record.

Do NOT modify REPOSITORY_MAP.md, DOCUMENT_TRACEABILITY.md, DOCUMENT_OWNERSHIP_MATRIX.md.

## Part C — Pass 8.8.3-V Repository Verification (10 items)
1. **Frontmatter completeness** — all required keys present and typed per prior Sprint PRDs.
2. **18-section structural conformance** — parity with SPR-MOD-005-001 and SPR-MOD-005-002.
3. **Engine authority** — every engine ID resolves verbatim from ENGINE_CATALOG.md, matches ENGINE_USAGE_MATRIX.md, exactly matches Sprint 3 allocation in MOD-005_SPRINT_PLAN.md; no placeholder / deprecated / undefined / duplicate / additional IDs.
4. **Bidirectional traceability** — forward + reverse tables validate; every Module capability allocated exactly once; every Sprint capability traces back; no orphan; no duplicate originating allocation; no unallocated Module capability.
5. **ADR authority** — Accepted ADRs only, verbatim from ADR_INDEX.md.
6. **Event authority** — every event resolves verbatim from Event Catalog OR is deferred as `R-EV-*`; no invented events.
7. **Dependency authority** — module identifiers SHALL resolve verbatim from MODULE_CATALOG.md; Sales, Purchase, Warehouse, and Accounting capabilities SHALL be consumed through approved repository contracts and SHALL NOT redefine ownership established by their originating modules.
8. **Governance registration** — the five required files updated exactly once each; no modification to REPOSITORY_MAP.md, DOCUMENT_TRACEABILITY.md, or DOCUMENT_OWNERSHIP_MATRIX.md.
9. **Stage 2 workflow conformance** — Stage 2 Sprint PRD requirements per MODULE_IMPLEMENTATION_WORKFLOW.md satisfied.
10. **Capability completeness (bidirectional)** — No Sprint capability SHALL appear unless it exists in `docs/20-module-prds/inventory/MODULE_PRD.md`; every Inventory Module PRD capability SHALL be allocated exactly once to an originating Sprint in `MOD-005_SPRINT_PLAN.md`; no extra capabilities, no omissions, and no duplicate originating allocations.

On failure: minimum edits ONLY to the new Sprint PRD; re-run until Failed = 0. Do NOT modify Module PRD, Sprint Plan, Baselines, prior Sprint PRDs, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, MODULE_CATALOG, architecture, APIs, database, schema, UI, or code.

## Closing Artifacts (appended to `.lovable/plan.md` and mirrored in chat)
- **Verification Metadata**: Target Artifact, Pass 8.8.3-V, Date 2026-07-10, Verifier, Authoritative Sources Checked.
- **Check / Result / Action Table** (10 rows).
- **Verification Summary**:
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
`SPR-MOD-005-003-inventory-issues-transfers-reservations.md` becomes the authoritative Sprint PRD for Inventory Issues, Transfers & Reservations. Sales, Purchase, Warehouse, and Accounting ownership preserved via approved contracts. Repository ready for **Pass 8.8.4 — SPR-MOD-005-004 (Inventory Adjustments & Stock Counting)**.

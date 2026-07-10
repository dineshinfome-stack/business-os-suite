# Pass 8.8.1 — SPR-MOD-005-001 (Inventory Foundation) + 8.8.1-V

Author MOD-005 Sprint 1 Sprint PRD following the established 18-section template, register in governance, and execute the 10-item repository verification.

## Preflight Reads (no writes)

- `docs/20-module-prds/inventory/MODULE_PRD.md`
- `docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md`
- `docs/30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md` (template parity)
- `docs/MODULE_CATALOG.md`, `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`, `docs/02-architecture/event-catalog.md`
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`

## Part A — Author Sprint PRD

Create `docs/30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md` mirroring MOD-004-001 structure. Frontmatter per spec; `related_engines` / `related_adrs` resolved verbatim from authoritative sources and matched to Sprint 1 allocations in the Sprint Plan.

18 sections as specified:
- §1 Objective & Scope (in-scope / excluded lists verbatim)
- §1.1–§1.7 Governance conventions (Inventory Master, Item Master, Purchase/Warehouse/Accounting consumption boundaries, Configuration authority, governance complement)
- §2 Sprint Deliverables with forward references to Sprints 2–6
- §3 Bidirectional traceability (forward + reverse tables, verbatim invariants)
- §4 User Stories across 6 personas, each tracing to one Sprint Deliverable
- §5 Acceptance Criteria (Given/When/Then) with explicit "SHALL NOT" statements
- §6 Parent Module Reference
- §7 Dependencies (upstream MOD001–MOD004 baselines + Sprint Plan; downstream Sprints 2–6)
- §8 Engine Consumption (verbatim, matched to Sprint Plan allocation)
- §9 Accepted ADRs only
- §10 Data Model Impact (conceptual)
- §11 Events — verbatim from Event Catalog or deferred `R-EV-*`
- §12–§13 DoD / Sprint Exit
- §14 Risk Register (Open/Mitigated/Accepted/Deferred/Closed)
- §15–§17 Test Strategy / Implementation Notes / Review Gate
- §18 References

## Part B — Governance Registration (updated: 2026-07-10)

Update exactly once:
1. `docs/SPRINT_CATALOG.md` — register SPR-MOD-005-001
2. `docs/30-sprint-prds/inventory/README.md` — link Sprint PRD
3. `docs/DOCUMENT_INDEX.md` — append entry
4. `docs/_meta.json` — add nav item
5. `.lovable/plan.md` — append execution record

Skip REPOSITORY_MAP / DOCUMENT_TRACEABILITY / DOCUMENT_OWNERSHIP_MATRIX per Pass 8.5.0-V2 precedent.

## Part C — Pass 8.8.1-V Verification

Execute the 10-item repository-standard checklist:

1. Frontmatter completeness
2. 18-section structural conformance
3. Engine identifiers verbatim from ENGINE_CATALOG.md, matching ENGINE_USAGE_MATRIX.md, and exactly matching Sprint 1 allocation in MOD-005_SPRINT_PLAN.md; no placeholder/deprecated/undefined/duplicate/additional IDs
4. Bidirectional traceability using both forward and reverse tables; no orphan; no duplicate originating allocation
5. Accepted ADRs only, verbatim from ADR_INDEX.md
6. Events verbatim from Event Catalog or deferred `R-EV-*`; no invented events
7. Dependencies SHALL resolve verbatim from MODULE_CATALOG.md; Purchase, Warehouse, and Accounting ownership SHALL be consumed and SHALL NOT be redefined
8. Governance registrations completed exactly once across five target files
9. Stage 2 Sprint PRD requirements per MODULE_IMPLEMENTATION_WORKFLOW.md
10. No Sprint capability absent from Inventory Module PRD; every Module capability allocated exactly once

**Failure handling:** apply minimum edits only to the Sprint PRD; re-run until Failed = 0. Do not modify upstream authoritative documents.

## Closing Artifacts

Append to `.lovable/plan.md` and mirror in chat:
- Verification Metadata (Target Artifact, Pass 8.8.1-V, 2026-07-10, Verifier, Sources)
- Check / Result / Action table (10 rows)
- Verification Summary block with invariants `Passed + Remediated + Failed = 10` and `PASS ⇔ Failed = 0`

## Outcome

`SPR-MOD-005-001-inventory-foundation.md` becomes the authoritative Sprint PRD for Inventory Foundation. Repository ready for **Pass 8.8.2 — SPR-MOD-005-002 (Inventory Receipts & Putaway)**.

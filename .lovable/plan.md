# Pass 8.6.2 — SPR-MOD-004-002 (Requisitions, RFQs & Purchase Orders) + 8.6.2-V

Documentation-only. Stage 2 authoring of MOD-004 Sprint 2, followed by the repository-standard 10-item verification.

## Part A — Author Sprint PRD

Create `docs/30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md` using the identical 18-section template established by SPR-MOD-003-001..006, SPR-MOD-002-001..006, and SPR-MOD-004-001.

**Frontmatter** — `sprint_id: SPR-MOD-004-002`, `parent_module: MOD-004`, `iteration: Sprint 2`, `stage: 2`, `pass: 8.6.2`, `size: Large`, `status: Draft`, `owner: Purchase`, `updated: 2026-07-10`, `document_type: Sprint PRD`. Resolve `related_engines` verbatim from `ENGINE_CATALOG.md` + `ENGINE_USAGE_MATRIX.md`, exactly matching MOD-004 Sprint Plan Sprint 2 allocation. Resolve `related_adrs` verbatim from `ADR_INDEX.md` (Accepted only). Tags: `[sprint, prd, purchase, requisitions, rfq, purchase-order, mod-004]`.

**Sections 1–18:**
- §1 Objective & Scope — in-scope (Requisitions, RFQ lifecycle, PO commercial lifecycle, amendments, pricing, discounts, terms, attachments, notifications, events); exclusions (Vendor Master, GRN, Inventory, Warehouse, Billing, Returns, Accounting, Payables, Payments, Tax, Analytics, Dashboards).
- §1.1–§1.7 Governance conventions: Requisition/RFQ/PO ownership; Inventory, Accounting, Pricing boundaries; complement (not redefine) MOD001/002/003 baselines.
- §2 Deliverables + forward references to SPR-MOD-004-003..006.
- §3 Bidirectional traceability (no orphans, unique originating allocation).
- §4 User stories — Purchase Executive, Procurement Manager, Buyer, Dept Manager, Vendor, Sys Admin.
- §5 Acceptance criteria (Given/When/Then) — full requisition→PO lifecycle, amendments, cancellation, attachments, notifications, audit, authorization, tenancy, events.
- §6 Parent Module PRD reference.
- §7 Dependencies — upstream: MOD001/002/003 baselines, **SPR-MOD-004-001** (with explicit originating-supplier language), MOD-004 Sprint Plan; downstream: SPR-MOD-004-003..006. Module IDs resolve verbatim from `MODULE_CATALOG.md`.
  - **Explicit dependency wording (mirroring Sales Foundation→Orders→Delivery→Invoicing chain):**
    - "SPR-MOD-004-001 SHALL be treated as the originating supplier of all Vendor Master capabilities consumed by Sprint 2."
    - "Sprint 2 SHALL consume, and SHALL NOT redefine, Vendor Master ownership established by SPR-MOD-004-001."
- §8 Engine consumption (verbatim IDs, one-line note each, no redefinition).
- §9 ADR consumption (Accepted only, verbatim).
- §10 Conceptual data model — Purchase Requisition, Requisition Line, RFQ, RFQ Vendor, Vendor Quotation, Quote Comparison, Purchase Order, PO Line, Purchase Approval, **Purchase Approval Stage** (multi-stage approval decisions), Purchase Attachment. Physical schema out of scope.
- §11 Events — only authoritative names from `event-catalog.md`; unknowns become deferred `R-EV-*` risks.
- §12 DoD; §13 Sprint Exit Criteria.
- §14 Risk Register — columns (Risk ID, Description, Impact, Mitigation, Status ∈ {Open, Mitigated, Accepted, Deferred, Closed}); covers Inventory dependency, Accounting dependency, Vendor quotation governance, Purchase approval workflow, Event Catalog gaps, Cross-module contracts, Supplier commercial pricing governance.
- §15 Test Strategy; §16 Implementation Notes; §17 Review Gate; §18 References.

## Part B — Governance Registrations (exactly once, `updated: 2026-07-10`)

1. `docs/SPRINT_CATALOG.md`
2. `docs/30-sprint-prds/purchase/README.md`
3. `docs/DOCUMENT_INDEX.md`
4. `docs/_meta.json`
5. `.lovable/plan.md`

`REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md` — no edits (pattern-covered per Pass 8.5.0-V2 precedent).

## Part C — Pass 8.6.2-V (10-item verification)

1. Frontmatter completeness
2. 18-section structural conformance
3. Engine allocation matches ENGINE_USAGE_MATRIX + Sprint Plan Sprint 2 (verbatim; no placeholder/deprecated/undefined/additional IDs)
4. Bidirectional traceability with unique originating allocation
5. Accepted ADR validation (verbatim from ADR_INDEX)
6. Event Catalog validation (authoritative names or deferred `R-EV-*`)
7. Dependencies resolve verbatim from MODULE_CATALOG; explicit SPR-MOD-004-001 originating-supplier language present
8. Governance registrations completed exactly once across 5 files
9. Cross-module ownership preserved (Platform, Accounting, Sales, Inventory, Purchase)
10. Stage-2 requirements per MODULE_IMPLEMENTATION_WORKFLOW satisfied

**Failure handling:** minimum edits to the Sprint PRD only; re-run until Failed = 0. Do not modify Module PRD, Sprint Plan, prior Sprint PRDs, Engine Catalog/Matrix, ADR Index, Event Catalog, Baselines, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, architecture/API/DB/schema/UI/code.

## Closing Artifacts (append to `.lovable/plan.md` and mirror in chat)

1. **Verification Metadata** — Target, Pass (8.6.2-V), Date (2026-07-10), Verifier, Authoritative Sources Checked.
2. **Check / Result / Action** — 10 rows.
3. **Verification Summary** — Checklist Items=10, Passed, Remediated, Failed, Outstanding Risks, Repository Status, Next Pass.

Invariants: `Passed + Remediated + Failed = 10`; `Status = PASS iff Failed = 0`.

## Outcome

SPR-MOD-004-002 becomes the authoritative Sprint PRD for Purchase Requisitions, RFQs, and Purchase Orders. MOD-004 Sprint 2 complete with `Repository Status = PASS`. Repository ready for **Pass 8.6.3 — SPR-MOD-004-003 (Goods Receipt)**.

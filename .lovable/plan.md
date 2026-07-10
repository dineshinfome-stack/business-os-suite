# Pass 8.6.3 — SPR-MOD-004-003 (Goods Receipt & Inspection) + 8.6.3-V

Documentation-only. Stage 2 authoring of MOD-004 Sprint 3, followed by 10-item repository-standard verification.

## Part A — Author Sprint PRD

Create `docs/30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md` using the same 18-section template as prior Sprint PRDs.

**Frontmatter**: `sprint_id: SPR-MOD-004-003`, `parent_module: MOD-004`, `iteration: Sprint 3`, `stage: 2`, `pass: 8.6.3`, `size: Large`, `status: Draft`, `owner: Purchase`, `updated: 2026-07-10`, `document_type: Sprint PRD`. `related_engines` resolved verbatim from `ENGINE_CATALOG.md` + `ENGINE_USAGE_MATRIX.md` and matching Sprint 3 allocation in `MOD-004_SPRINT_PLAN.md`. `related_adrs` verbatim from `ADR_INDEX.md`. Tags: `[sprint, prd, purchase, goods-receipt, inspection, mod-004]`.

**§1 Objective & Scope** — In scope: Goods Receipt lifecycle (partial/complete), Receipt Validation, Quantity Verification, Damage Recording, Inspection Hold, Acceptance, Rejection, Status, Numbering, Attachments, Notifications, Commercial Receipt Events. Excluded: Vendor Master, RFQ, POs, Warehouse, Inventory, Stock Valuation, Bin Mgmt, Inventory Movements, Accounting Vouchers, Journals, Ledgers, Payables, Payments, Tax, Analytics, Dashboards.

**§1.1–§1.7 Governance Conventions**: Goods Receipt ownership; PO consumption boundary (SPR-MOD-004-002 remains originating supplier of PO capabilities); Inventory consumption boundary (Purchase requests via repository contracts; no stock/warehouse/valuation ownership); Warehouse boundary (consumes confirmation only); Accounting boundary (no vouchers/journals/ledgers/payables/postings); Inspection boundary (commercial decisions only); Governance complement clause referencing MOD001/MOD002/MOD003 baselines + SPR-MOD-004-001/002.

**§2 Deliverables**: All listed items + forward references to SPR-MOD-004-004/005/006.

**§3 Traceability**: Bidirectional Sprint↔Module PRD capability mapping; unique originating allocation; no orphans.

**§4 User Stories**: Purchase Executive, Procurement Manager, Receiving Officer, Warehouse Coordinator, Inspection Officer, Branch Manager, System Administrator — each trace to one deliverable.

**§5 Acceptance Criteria**: Given/When/Then covering GR creation, partial/complete receipt, inspection hold, acceptance, rejection, damage recording, quantity variance, PO validation, receipt completion, attachments, notifications, authorization, audit logging, tenant isolation, commercial receipt events. Explicit language:
- "Commercial receipt SHALL NOT modify inventory ownership."
- "Commercial receipt completion MAY emit repository-defined receipt completion events and SHALL request downstream inventory receipt through approved repository contracts, but SHALL NOT perform inventory transactions directly."

**§6 Parent Module Reference**: `docs/20-module-prds/purchase/MODULE_PRD.md`; fulfilled sections identified.

**§7 Dependencies**: Upstream — MOD001/002/003 baselines, SPR-MOD-004-001/002, MOD-004 Sprint Plan. Explicit wording: "SPR-MOD-004-002 SHALL be treated as the originating supplier of Purchase Order capabilities" and "Sprint 3 SHALL consume POs and SHALL NOT redefine PO ownership". Downstream — SPR-MOD-004-004/005/006. All module IDs verbatim from `MODULE_CATALOG.md`.

**§8 Engine Consumption**: Verbatim IDs matching Sprint 3 allocation; one-line usage each; no redefinition.

**§9 ADR Consumption**: Accepted ADRs verbatim from `ADR_INDEX.md`; one-line usage each.

**§10 Data Model Impact** (conceptual): Goods Receipt, Goods Receipt Line, Receipt Status, Inspection Result, Inspection Hold, Quantity Variance, Damage Record, Receipt Attachment.

**§11 Events**: Only authoritative names from `event-catalog.md`; unknowns become deferred `R-EV-*` risks; Event Catalog NOT modified.

**§12 DoD / §13 Exit Criteria / §15 Test Strategy / §16 Implementation Notes / §17 Review Gate**: Repository standard.

**§14 Risk Register**: Columns (Risk ID, Description, Impact, Mitigation, Status ∈ {Open, Mitigated, Accepted, Deferred, Closed}); risks for:
- Inventory dependency
- Warehouse dependency
- Accounting dependency
- Purchase Order dependency
- Inspection governance
- Event Catalog gaps
- Cross-module contracts
- **Supplier shipment discrepancy dependency** (variances between supplier despatch and physical arrival affecting commercial receipt decisions)
- **Receiving document numbering dependency** — cite the numbering engine ID **only if** it appears in the SPR-MOD-004-003 row of `ENGINE_USAGE_MATRIX.md` and Sprint Plan Sprint 3 allocation; otherwise phrase as "reliance on the repository-approved numbering engine" without inventing an engine ID. Verification Item 3 catches any mismatch.

**§18 References**: Purchase Module PRD, MOD-004 Sprint Plan, SPR-MOD-004-001/002, ERP Core Engines, Accepted ADRs, Event Catalog, MOD001/002/003 baselines, MODULE_CATALOG.

## Part B — Governance Registrations (updated: 2026-07-10, exactly once each)

1. `docs/SPRINT_CATALOG.md`
2. `docs/30-sprint-prds/purchase/README.md`
3. `docs/DOCUMENT_INDEX.md`
4. `docs/_meta.json`
5. `.lovable/plan.md`

No edits to `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md` (pattern-based coverage per Pass 8.5.0-V2 precedent).

## Part C — Pass 8.6.3-V (10-item verification)

1. Frontmatter completeness
2. 18-section structural conformance
3. Engine allocation verbatim + matches Sprint Plan Sprint 3 (no placeholders/deprecated/undefined/additional)
4. Bidirectional traceability + unique originating allocation
5. Accepted ADR validation (verbatim from ADR_INDEX)
6. Event Catalog validation (authoritative or `R-EV-*`)
7. Dependencies verbatim from MODULE_CATALOG; explicit SPR-MOD-004-002 originating PO dependency wording
8. Governance registrations completed once across 5 files
9. Cross-module ownership preserved (Platform, Accounting, Sales, Inventory, Purchase)
10. Stage 2 Sprint PRD requirements satisfied per MODULE_IMPLEMENTATION_WORKFLOW

Remediation: minimum edits to the new Sprint PRD only; re-run until Failed = 0. Do not modify Module PRD, Sprint Plan, prior Sprint PRDs, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, Baselines, MODULE_CATALOG, workflow, architecture, APIs, DB, schema, UI, or code.

## Closing Artifacts

Append to `.lovable/plan.md` and mirror in chat:

1. Verification Metadata (Target, Pass 8.6.3-V, Date 2026-07-10, Verifier, Authoritative Sources Checked)
2. Check/Result/Action table (10 rows)
3. Verification Summary block

```
Checklist Items: 10
Passed:
Remediated:
Failed:
Outstanding Risks:
Repository Status:
Next Pass:
```

Invariants: `Passed + Remediated + Failed = 10`; `Repository Status = PASS` iff `Failed = 0`.

## Outcome

`SPR-MOD-004-003-goods-receipt-inspection.md` is authoritative for the commercial Goods Receipt & Inspection lifecycle. Repository ready for **Pass 8.6.4 — SPR-MOD-004-004 (Vendor Billing)**.

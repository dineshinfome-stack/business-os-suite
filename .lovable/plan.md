# Pass 8.6.4 — SPR-MOD-004-004 (Vendor Billing & Commercial 3-Way Match) + 8.6.4-V

Documentation-only. Author MOD-004 Sprint 4 Sprint PRD and execute the 10-item repository verification.

## Part A — Author Sprint PRD

Create `docs/30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md` using the 18-section template established by prior Sprint PRDs (SPR-MOD-002/003/004 series). Use the explicit title **"Vendor Billing & Commercial 3-Way Match"** to reinforce the commercial boundary asserted in §1 and §1.5.

**Frontmatter**
- `sprint_id: SPR-MOD-004-004`, `parent_module: MOD-004`, `iteration: Sprint 4`, `stage: 2`, `pass: 8.6.4`, `size: Large`, `status: Draft`, `owner: Purchase`, `updated: 2026-07-10`, `document_type: Sprint PRD`.
- `related_engines`: resolved verbatim from `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`, matching Sprint 4 allocation in `MOD-004_SPRINT_PLAN.md`.
- `related_adrs`: Accepted ADRs only, verbatim from `ADR_INDEX.md`.
- Tags: `[sprint, prd, purchase, vendor-billing, three-way-match, mod-004]`.

**Sections 1–18**
- §1 Objective & Scope. In-scope = commercial Vendor Bill lifecycle (creation, drafts, validation, amendments, approval, cancellation, finalization, debit/credit note requests, attachments, numbering, **Commercial 3-Way Match** comparing PO ↔ GRN ↔ Vendor Bill, exception identification/resolution, notifications, audit, billing events). Out-of-scope = journals, vouchers, ledger posting, payables, GL, tax posting, GST/VAT computation, payments, payment runs, bank integration, inventory valuation/transactions, warehouse operations, purchase returns, analytics, dashboards.
- §1.1–§1.8 Governance Conventions:
  - 1.1 Vendor Billing Ownership (Purchase owns commercial Bill lifecycle).
  - 1.2 PO Consumption Boundary (SPR-MOD-004-002 originating supplier).
  - 1.3 GRN Consumption Boundary (SPR-MOD-004-003 originating supplier).
  - 1.4 Accounting Consumption Boundary (journals/vouchers/ledger/payables/tax/statements owned by Accounting).
  - 1.5 **Commercial** 3-Way Match Boundary (commercial comparison, exception identification, commercial approval only; no accounting reconciliation).
  - 1.6 Tax Boundary (MOD002 owns tax; Purchase may consume calculated values).
  - 1.7 Commercial Billing Boundary (MAY emit billing events; SHALL request downstream accounting via approved contracts; SHALL NOT post).
  - 1.8 Governance Complement (complements MOD001/002/003 Baselines and SPR-MOD-004-001..003).
- §2 Sprint Deliverables: Vendor Bills, Validation, Approval, Amendments, DN/CN Requests, Commercial 3-Way Match, Match Exceptions, Exception Workflow, Vendor Bill Numbering, Attachments, Notifications, Audit, Billing Events. Forward references to SPR-MOD-004-005/006.
- §3 Traceability: bidirectional Sprint ↔ Module PRD; unique originating allocation; no orphans/duplicates.
- §4 User Stories: Purchase Executive, Procurement Manager, Accounts Liaison, Branch Manager, Purchase Controller, Finance Reviewer, System Administrator. Each traces to one Sprint Deliverable.
- §5 Acceptance Criteria: G/W/T scenarios covering all in-scope items plus qty/price/receipt mismatches, exception workflow, authz, tenant isolation, events. Include verbatim:
  - "Commercial 3-Way Match SHALL compare commercial documents only."
  - "Commercial Billing SHALL NOT create accounting journals."
  - "Vendor Bill completion MAY emit repository-defined billing events and SHALL request downstream accounting processing through approved repository contracts."
- §6 Parent Module Reference to `docs/20-module-prds/purchase/MODULE_PRD.md` with fulfilled sections listed.
- §7 Dependencies: upstream MOD001/002/003 Baselines, SPR-MOD-004-001/002/003, MOD-004 Sprint Plan; downstream SPR-MOD-004-005/006. Include explicit wording:
  - "SPR-MOD-004-002 SHALL be treated as the originating supplier of Purchase Order capabilities."
  - "SPR-MOD-004-003 SHALL be treated as the originating supplier of Goods Receipt capabilities."
  - "Sprint 4 SHALL consume Purchase Orders and Goods Receipts and SHALL NOT redefine their ownership."
  Module IDs resolved verbatim from `MODULE_CATALOG.md`.
- §8 ERP Core Engine Consumption: one-line usage per engine; IDs verbatim from `ENGINE_CATALOG.md`; matches `ENGINE_USAGE_MATRIX.md` and Sprint Plan Sprint 4 allocation; no placeholders/deprecated/undefined/extra IDs; no behavior redefinition.
- §9 ADR Consumption: Accepted ADRs only, verbatim from `ADR_INDEX.md`, one-line usage each.
- §10 Data Model Impact (conceptual only): Vendor Bill, Vendor Bill Line, Bill Status, Bill Amendment, Three-Way Match, Match Result, Match Exception, Debit Note Request, Credit Note Request, Bill Attachment. No physical schema.
- §11 Events: only names present in `docs/02-architecture/event-catalog.md`; unknowns deferred as `R-EV-*`. Event Catalog NOT modified.
- §12 Definition of Done — repository standard.
- §13 Sprint Exit Criteria — repository standard.
- §14 Risk Register (Risk ID, Description, Impact, Mitigation, Status ∈ Open/Mitigated/Accepted/Deferred/Closed) covering: Accounting dependency, GRN dependency, PO dependency, Commercial 3-Way Match governance, Accounting contract dependency, Tax dependency, Event Catalog gaps, Cross-module contracts, Vendor billing approval dependency, Bill numbering dependency. Cite numbering engine ID only if present in Sprint 4 allocation; otherwise refer generically to the repository-approved numbering engine.
- §15 Test Strategy Summary — repository standard.
- §16 Implementation Notes — repository standard.
- §17 Review Gate — repository standard.
- §18 References: Purchase Module PRD, MOD-004 Sprint Plan, SPR-MOD-004-001/002/003, ERP Core Engines, Accepted ADRs, Event Catalog, MOD001/002/003 Baselines, MODULE_CATALOG.

## Part B — Governance Registrations (updated: 2026-07-10; each edited once)

1. `docs/SPRINT_CATALOG.md`
2. `docs/30-sprint-prds/purchase/README.md`
3. `docs/DOCUMENT_INDEX.md`
4. `docs/_meta.json`
5. `.lovable/plan.md`

No edits to `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md` (pattern-based coverage sufficient per Pass 8.5.0-V2 precedent).

## Part C — Pass 8.6.4-V (10-item Verification)

1. Frontmatter completeness
2. 18-section structural conformance
3. Engine allocation parity (verbatim vs ENGINE_USAGE_MATRIX + Sprint Plan Sprint 4; no placeholder/deprecated/undefined/extra IDs)
4. Bidirectional traceability with unique originating allocation
5. Accepted ADR validation (verbatim from ADR_INDEX)
6. Event Catalog validation (authoritative names or deferred `R-EV-*`)
7. Dependencies verbatim from MODULE_CATALOG with explicit PO (SPR-MOD-004-002) and GRN (SPR-MOD-004-003) originating-supplier wording
8. Governance registrations completed exactly once across the five files
9. Cross-module ownership preserved (Platform, Accounting, Sales, Inventory, Purchase)
10. Stage 2 Sprint PRD requirements per MODULE_IMPLEMENTATION_WORKFLOW

Failure handling: minimum edits to the new Sprint PRD only; re-run until Failed = 0. Do NOT modify Module PRD, Sprint Plan, prior Sprint PRDs, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, Baselines, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, architecture, APIs, DB, schema, UI, or code.

## Closing Artifacts (appended to `.lovable/plan.md` and mirrored in chat)

1. **Verification Metadata**: Target, Pass (8.6.4-V), Date (2026-07-10), Verifier, Authoritative Sources Checked.
2. **Check / Result / Action table** — 10 rows.
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

`SPR-MOD-004-004-vendor-billing-3-way-match.md` — titled **"Vendor Billing & Commercial 3-Way Match"** — becomes the authoritative Sprint PRD for the commercial Vendor Billing and Commercial 3-Way Match lifecycle. Accounting posting, payables, taxation, and financial processing remain exclusively owned by MOD002 Accounting through approved repository contracts. Repository ready for **Pass 8.6.5 — SPR-MOD-004-005 (Purchase Returns & Vendor Adjustments)**.

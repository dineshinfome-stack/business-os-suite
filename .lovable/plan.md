# Pass 8.6.1 — SPR-MOD-004-001 (Purchase Foundation) + Pass 8.6.1-V

Documentation-only. Stage 2 authoring of MOD-004 Sprint 1, followed by the repository-standard 10-item verification. No code, schema, engine, ADR, Event Catalog, Module PRD, Sprint Plan, or Baseline is modified.

## Part A — Author SPR-MOD-004-001

**Create** `docs/30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md` using the 18-section template established by SPR-MOD-003-001…006 and SPR-MOD-002-001…006.

### Frontmatter
- `sprint_id: SPR-MOD-004-001`, `parent_module: MOD-004`, `iteration: Sprint 1`, `stage: 2`, `pass: 8.6.1`, `size: Large`, `status: Draft`, `owner: Purchase`, `updated: 2026-07-10`, `document_type: Sprint PRD`
- `related_engines`: resolve verbatim from `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`; must exactly match Sprint 1 allocation in `MOD-004_SPRINT_PLAN.md` (no placeholders).
- `related_adrs`: Accepted ADRs only, verbatim from `ADR_INDEX.md`.
- `tags: [sprint, prd, purchase, foundation, mod-004]`

### Sections
1. **§1 Objective & Scope** — In scope: Vendor Master, Categories, Groups, Contacts, Addresses, Status, Lifecycle, Purchase Organization, Buyer Assignment, Branch Assignment, Purchase Configuration, Vendor Numbering Preparation, Attachments, Notifications, Events. Explicit exclusions per prompt (RFQ, PO, GR, Billing, Returns, Inventory Movement, Warehouse, Accounting, Payables, Payments, Tax, Analytics, Dashboards).
2. **§1.1–§1.6 Governance Conventions** — Vendor Master Ownership; Supplier Boundary; Inventory Consumption Boundary; Accounting Consumption Boundary; Purchase Configuration Authority; Governance Complement (complements MOD001/002/003 baselines).
3. **§2 Sprint Deliverables** — Enumerate deliverables; forward-reference SPR-MOD-004-002…006.
4. **§3 Traceability** — Bidirectional; unique originating allocation; no orphans; no unallocated Sprint-1 capabilities.
5. **§4 User Stories** — Purchase Executive, Procurement Manager, Buyer, Branch Manager, Vendor Administrator, System Administrator. Each story traces to a Sprint Deliverable.
6. **§5 Acceptance Criteria** — Given/When/Then for creation, modification, activation, suspension, lifecycle, categorization, buyer assignment, org assignment, numbering, attachments, notifications, audit, authorization, tenant isolation, events.
7. **§6 Parent Module Reference** — Cite `docs/20-module-prds/purchase/MODULE_PRD.md` and identify fulfilled sections.
8. **§7 Dependencies** — Upstream: MOD001/002/003 baselines + MOD-004 Sprint Plan. Downstream: SPR-MOD-004-002…006. Consumer module IDs resolved verbatim from `MODULE_CATALOG.md`.
9. **§8 ERP Core Engine Consumption** — One-line usage note per engine. Every engine identifier SHALL resolve verbatim from `ENGINE_CATALOG.md`, SHALL match `ENGINE_USAGE_MATRIX.md`, and SHALL exactly match the Sprint 1 allocation in `MOD-004_SPRINT_PLAN.md`. No placeholder, deprecated, undefined, or additional engine identifiers are permitted.
10. **§9 ADR Consumption** — Accepted ADRs only; one-line usage note each.
11. **§10 Data Model Impact** — Conceptual entities: Vendor, Vendor Category, Vendor Group, Vendor Contact, Vendor Address, Purchase Organization, Buyer Assignment, Vendor Status, Vendor Attachment. Physical schema out of scope.
12. **§11 Events** — Only authoritative names from `docs/02-architecture/event-catalog.md`; any illustrative event that does not resolve is either replaced with the authoritative name or deferred as `R-EV-*`. Event Catalog is not modified.
13. **§12 Definition of Done**
14. **§13 Sprint Exit Criteria**
15. **§14 Risk Register** — Columns: Risk ID, Description, Impact, Mitigation, Status (Open|Mitigated|Accepted|Deferred|Closed). Cover Inventory dependency, Accounting dependency, Event Catalog gaps, Vendor master governance, Cross-module contracts, and Supplier data governance / master-data quality dependency.
16. **§15 Test Strategy Summary**
17. **§16 Implementation Notes**
18. **§17 Review Gate**
19. **§18 References** — Purchase Module PRD, MOD-004 Sprint Plan, ERP Core Engines, Accepted ADRs, Event Catalog, MOD001/002/003 Baselines, MODULE_CATALOG.

## Part B — Governance Registrations (each updated exactly once, `updated: 2026-07-10`)

1. `docs/SPRINT_CATALOG.md` — register SPR-MOD-004-001.
2. `docs/30-sprint-prds/purchase/README.md` — flip SPR-MOD-004-001 row from Planned → Draft; link the new file.
3. `docs/DOCUMENT_INDEX.md` — register the new Sprint PRD row.
4. `docs/_meta.json` — register under `30-sprint-prds/purchase`.
5. `.lovable/plan.md` — append full execution record (metadata, table, summary).

`REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md` remain covered by their pattern-based registrations (per Pass 8.5.0-V2 precedent). No edits.

## Part C — Pass 8.6.1-V (10-item verification)

1. Frontmatter completeness
2. 18-section structural conformance vs. template + MOD-003 sprint PRDs
3. Engine allocation matches `ENGINE_USAGE_MATRIX.md` and Sprint Plan Sprint 1 row (verbatim resolution; no placeholders/deprecated/undefined/additional)
4. Bidirectional traceability with unique originating allocation
5. Accepted ADRs only (verbatim from `ADR_INDEX.md`)
6. Event Catalog validation (authoritative names or `R-EV-*` deferrals)
7. Dependencies resolve verbatim from `MODULE_CATALOG.md`
8. Governance registrations completed exactly once across the five files
9. Cross-module ownership preserved (Platform, Accounting, Sales, Inventory, Purchase)
10. Stage-2 Sprint PRD requirements per `MODULE_IMPLEMENTATION_WORKFLOW.md`

Failure handling: minimum edits to `SPR-MOD-004-001-purchase-foundation.md` only; re-run until Failed = 0.

## Closing Artifacts

Append to `.lovable/plan.md` and mirror in chat:
- **Verification Metadata** — Target, Pass, Date (2026-07-10), Verifier, Authoritative Sources.
- **Check / Result / Action** — 10 rows.
- **Verification Summary** — Checklist Items, Passed, Remediated, Failed, Outstanding Risks, Repository Status, Next Pass.

Invariants: `Passed + Remediated + Failed = 10`; `Repository Status = PASS ⇔ Failed = 0`.

## Outcome

MOD-004 Sprint 1 authored and verified. Repository ready for **Pass 8.6.2 — SPR-MOD-004-002 (RFQ & Purchase Orders)**.

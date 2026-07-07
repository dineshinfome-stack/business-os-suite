## Pass 8.4.1 — Author SPR-MOD-003-001 (Sales Foundation)

Documentation-only. Stage 2 of the Module Implementation Workflow for MOD-003 Sales. Authors the first Sales Sprint PRD with strict structural parity to the Accounting Sprint PRDs (SPR-MOD-002-001/002/003).

### 1. Create Sprint PRD

**File:** `docs/30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md`

- Follow `docs/99-templates/sprint-prd-template.md`.
- **Maintain the identical 18-section ordering used by the Accounting Sprint PRDs (SPR-MOD-002-001/002/003).** The content requirements below map into those existing sections and MUST NOT change the section sequence or numbering. Preserve disclaimer wording, traceability style, Definition of Done, Sprint Exit Criteria, normalized Risk Register, Review Gate, and References verbatim in structural form.
- Canonical 18-section order (from Accounting Sprint PRDs):
  1. Objective & Scope
  2. Sprint Deliverables
  3. Traceability
  4. User Stories
  5. Acceptance Criteria
  6. Parent Module Reference
  7. Dependencies
  8. ERP Core Engine Consumption
  9. ADR Consumption
  10. Data Model Impact
  11. Events
  12. Definition of Done
  13. Sprint Exit Criteria
  14. Risks & Assumptions
  15. Test Strategy Summary
  16. Implementation Notes
  17. Review Gate
  18. References
- Frontmatter as specified (sprint_id `SPR-MOD-003-001`, parent `MOD-003`, iteration Sprint 1, stage 2, pass 8.4.1, size Medium, status Draft, owner Sales, updated 2026-07-07, document_type Sprint PRD; tags sprint, prd, sales, foundation, mod-003).
- Resolve `related_engines` verbatim from `docs/10-erp-core/ENGINE_CATALOG.md` and `docs/ENGINE_USAGE_MATRIX.md`, scoped to what the Sales Foundation actually consumes (Identity, Authorization, Permission Management, Audit, Configuration, Localization, Numbering, Event, Notification, Rules, Search — resolved to the exact `ENG-NNN` identifiers found in the catalog).
- Resolve `related_adrs` to Accepted ADRs only, from `docs/11-adrs/ADR_INDEX.md`, restricted to those actually referenced in body copy (e.g. multi-tenant isolation, UUID PKs, audit strategy, soft delete, RBAC + ABAC, authentication model, secrets, configuration hierarchy, event bus, error envelope, coding/documentation standards).

### 2. Content Mapping (into the fixed 18-section order)

- **§1 Objective & Scope:** Establish repository-standard Sales Foundation — Sales master data and organizational configuration only. Explicitly excludes quotations, orders, delivery, invoicing, returns, accounting posting, taxation, analytics, reporting.
- **§2 Sprint Deliverables (In-Scope):** Customer master, hierarchy, categories, groups, status, contacts, addresses; sales organization, branches, regions, territories; salespersons, sales teams, customer assignment; sales configuration; sales numbering preparation; default sales settings; customer lifecycle governance; sales master validation; sales master events.
  - **Governance Conventions §1.1–§1.5** appear as subsections of §1/§2 (matching where MOD-002 places governance conventions):
    - 1.1 Sales ownership convention.
    - 1.2 Customer master authority.
    - 1.3 Commercial ownership boundary (Sales ↔ Accounting ↔ Inventory ↔ CRM).
    - 1.4 Sales configuration authority.
    - 1.5 Customer lifecycle boundary (financial standing consumed from Accounting).
    - Closing sentence: *"These conventions complement — and do not redefine — the Platform governance conventions and the Accounting ownership conventions established in MOD002_ACCOUNTING_BASELINE_v1."*
  - **Out-of-Scope forward-references** to SPR-MOD-003-002…006 (quotations, orders, delivery/shipment/fulfilment, invoices/credit/debit notes/returns, accounting vouchers, ledger posting, tax calculation, receivables, sales reporting, analytics).
- **§3 Traceability:** Every capability traces to sections of `docs/20-module-prds/sales/MODULE_PRD.md` (2, 3, 5, 7, 8, 10, 12, 13). No orphan requirements.
- **§4 User Stories:** Standard "As a … I want … so that …" for Sales Executive, Sales Manager, Order Desk, Admin — each traced to a §2 deliverable.
- **§5 Acceptance Criteria:** Business-observable — customer master configurable; hierarchy deterministic; org configurable; territory assignment deterministic; lifecycle governed; unauthorized changes rejected; changes audited; events use authoritative Event Catalog names only; customer consumed by downstream modules; no downstream module creates independent customer master.
- **§6 Parent Module Reference:** `MOD-003`, link to `MODULE_PRD.md`, cite Module PRD sections fulfilled.
- **§7 Dependencies:** Upstream — MOD001_PLATFORM_BASELINE_v1, MOD002_ACCOUNTING_BASELINE_v1. Downstream — SPR-MOD-003-002…006 plus Purchase, Inventory, CRM, Projects, POS, Payroll consuming Customer Master.
- **§8 ERP Core Engine Consumption:** Bulleted `ENG-NNN — name — usage` list resolved from ENGINE_CATALOG; no engine behavior redefined.
- **§9 ADR Consumption:** Accepted-only ADRs from ADR_INDEX; each with a one-line application note.
- **§10 Data Model Impact:** Conceptual entities only (Customer, Customer Group, Category, Address, Contact, Sales Territory, Region, Salesperson, Sales Team, Sales Organization, Sales Configuration) with the standard disclaimer that physical schema is out of scope.
- **§11 Events:** Reference only names present in `docs/02-architecture/event-catalog.md`; illustrative list (customer.created, customer.updated, customer.activated, customer.deactivated, salesperson.created, salesterritory.updated). Any missing name is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk. Event Catalog is NOT modified.
- **§12 Definition of Done, §13 Sprint Exit Criteria:** Structurally identical to Accounting Sprint PRDs.
- **§14 Risks & Assumptions:** Normalized Risk Register table (Risk ID, Description, Impact, Mitigation, Status ∈ Open/Mitigated/Accepted/Deferred/Closed). Include upstream baseline dependency (MOD001, MOD002), customer ownership dependency, any `R-EV-*` for Event Catalog gaps.
- **§15 Test Strategy Summary, §16 Implementation Notes, §17 Review Gate, §18 References:** Structurally identical to Accounting Sprint PRDs.

### 3. Governance Registrations (each updated exactly once)

- `docs/SPRINT_CATALOG.md` — add Draft row for SPR-MOD-003-001.
- `docs/30-sprint-prds/sales/README.md` — link the new PRD, update Sprint 1 placeholder row.
- `docs/DOCUMENT_INDEX.md` — one entry.
- `docs/_meta.json` — one sidebar registration.
- `.lovable/plan.md` — record Pass 8.4.1.

No other governance files touched.

### 4. Not Changed

Sales Module PRD, MOD-003 Sprint Plan, ERP Core Engines, ADRs, Event Catalog, architecture docs, Module Baselines, APIs, database, schema, UI, implementation code.

### 5. Verification

- One DOCUMENT_INDEX entry; one README link; one `_meta.json` registration; one Draft Sprint Catalog row.
- Strict 18-section parity with SPR-MOD-002-001/002/003 (order and numbering unchanged).
- Every capability traces to `docs/20-module-prds/sales/MODULE_PRD.md`.
- **No capability introduced in this Sprint PRD is outside the approved Sales Module PRD (no orphan requirements).**
- Accepted ADRs only; engine IDs match ENGINE_CATALOG verbatim.
- Every event name exists in Event Catalog or is deferred via `R-EV-*`.
- Customer ownership not redefined elsewhere; Accounting / Inventory / CRM ownership boundaries preserved.

### 6. Outcome

`SPR-MOD-003-001-sales-foundation.md` becomes the authoritative Sales Foundation Sprint PRD, preparing MOD-003 for **Pass 8.4.2 — SPR-MOD-003-002 (Quotations & Sales Orders)**.
# Pass 8.3.5 — Author SPR-MOD-002-005 (Taxation & Compliance Foundation)

Documentation-only. Fifth Accounting Sprint PRD, structurally identical to SPR-MOD-002-001…004. No architecture, engine, ADR, or Event Catalog edits.

## 1. Create Sprint PRD

**File:** `docs/30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md`

Template: `docs/99-templates/sprint-prd-template.md`, 18-section structure matching Sprints 001–004 verbatim (section ordering, governance callouts, dependency block, ERP Core Engine consumption, ADR consumption, Events, Acceptance Criteria, DoD, Sprint Exit Criteria, Risks & Assumptions using the normalized 5-field Risk Register, Test Strategy, Implementation Notes, Review Gate, References).

Frontmatter:
- `sprint_id: SPR-MOD-002-005`
- `parent_module: MOD-002`
- `iteration: Sprint 5`
- `status: Draft`
- `owner: Accounting`
- `updated: 2026-07-07`
- `related_engines` / `related_adrs` populated by reading `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`, and `docs/11-adrs/ADR_INDEX.md` during authoring; only Accepted ADRs; engine IDs verbatim.

### Governance conventions (§1.1–§1.5)

1. **Tax Ownership Convention** — Accounting owns tax semantics, master data, applicability, determination, classifications, reporting semantics, and posting preparation. No downstream module redefines.
2. **Tax Calculation Boundary** — Business modules determine commercial transactions; Accounting determines taxation; downstream modules consume Accounting taxation services.
3. **Tax Configuration Authority** — Tax Codes, Groups, Rates, Classifications, Jurisdictions, Applicability Rules are authoritative Accounting master data.
4. **Compliance Readiness Convention** — Establishes repository-standard readiness only; statutory submission deferred to a future compliance sprint.
5. **Tax Reporting Boundary** — Tax reporting consumes authoritative ledger movements + tax classifications; never derives taxation directly from source documents.

### Traceability Requirement

Every capability documented in this Sprint PRD MUST trace to one or more sections of `docs/20-module-prds/accounting/MODULE_PRD.md`. No orphan requirements may be introduced. (Consistent with Sprints 001–004.)

### Scope

**In scope:** tax master configuration; GST/VAT framework; tax classifications, codes, groups, rates; input/output tax classification; tax applicability rules; reverse charge readiness; tax determination inputs; jurisdiction-aware configuration; tax calculation boundaries; **tax posting preparation metadata and posting inputs only — journal creation and ledger posting remain owned by SPR-MOD-002-003**; tax reconciliation readiness; compliance reporting prerequisites; tax audit traceability; tax events; tax configuration versioning; tax reporting parameterization; cross-module tax consumption contracts.

**Out of scope:** statutory return filing; government integrations; e-invoicing; e-way bill; country-specific compliance; tax payment workflow; financial statement generation; period close; payroll taxation; budgeting; forecasting; BI; AI compliance analysis.

### Dependencies

- **Upstream:** `MOD001_PLATFORM_BASELINE_v1`; **SPR-MOD-002-001 through SPR-MOD-002-004 (all required)**.
- **Downstream:** SPR-MOD-002-006 Period Close & Audit; consumers MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018.

### Engines & ADRs

Consume only engines already required by the Accounting Module PRD, resolved verbatim against ENGINE_CATALOG / ENGINE_USAGE_MATRIX. Expected engine surface: Configuration, Rules, Currency, Audit, Event, Authorization, Reporting. No new ENG IDs. Only Accepted ADR IDs.

### Events

Reference only names already in `docs/02-architecture/event-catalog.md`. The Event Catalog is the sole authoritative source; the following list is **illustrative, not normative**:

> Expected event surface includes (subject to the authoritative Event Catalog): `taxcode.created`, `taxcode.updated`, `taxrate.created`, `taxrate.updated`, `taxclassification.updated`, `taxconfiguration.changed`.

For any illustrative name absent from the Event Catalog, either reference the closest authoritative equivalent or record a deferred `R-EV-*` risk. **Event Catalog is not edited in this pass.**

### Acceptance Criteria

Business-observable outcomes covering: configurable tax masters; deterministic applicability resolution; version-aware rates; authoritative jurisdiction config; ledger-based tax reporting; deterministic tax posting preparation (inputs/metadata only); audited tax config changes; rejection of unauthorized changes; ledger traceability; authoritative-only event names; downstream consumption (no independent tax engines).

### Risks & Assumptions

Normalized 5-field register (Risk ID, Description, Impact, Mitigation, Status) with working vocabulary preamble (`Open`, `Mitigated`, `Accepted`, `Deferred`, `Closed`). Include `R-EV-01` (Deferred) if any illustrative tax event is absent from the Event Catalog.

## 2. Governance registrations (derived indexes only)

- `docs/SPRINT_CATALOG.md` — one new Draft row for SPR-MOD-002-005.
- `docs/30-sprint-prds/accounting/README.md` — link Sprint 005.
- `docs/DOCUMENT_INDEX.md` — one new entry.
- `docs/_meta.json` — one registration.
- `.lovable/plan.md` — Pass 8.3.5 execution record.

## 3. Repository verification (SPRINT_AUTHORING_GUIDE §13)

Confirm:

- Single DOCUMENT_INDEX entry; single Draft SPRINT_CATALOG row; README link; single _meta.json entry.
- Structural parity with Sprints 001–004.
- Every capability traces to Accounting MODULE_PRD.
- Accepted ADRs only; engine IDs match catalog verbatim.
- Every referenced event exists in the Event Catalog or is recorded as a deferred `R-EV-*` risk.
- Taxation consumes authoritative ledger state, not source documents.
- **Tax semantics introduced here do NOT redefine voucher ownership, journal ownership, ledger ownership, financial reporting ownership, or period ownership established by earlier Accounting Sprint PRDs.**
- No architecture documents modified.

## 4. Future (out of scope for this pass)

Repository-wide standardization of governance convention identifiers using a **module-prefixed registry format** (e.g., `GOV-ACC-001` Accounting Ownership, `GOV-ACC-002` Voucher Ownership, `GOV-ACC-003` Ledger Posting Ownership, `GOV-ACC-004` Financial Reporting Ownership, `GOV-ACC-005` Tax Ownership) would improve cross-baseline referenceability and avoid collisions with Platform and future modules. Requires a repository-wide governance pass touching Sprints 001–004 and downstream module references. **Explicitly deferred**; not introduced in Pass 8.3.5.

## 5. Not changed

MOD-002 Sprint Plan; Sprints 001–004; SPR-MOD-002-006; Module Baselines; Engines; ADRs; architecture docs; Event Catalog; APIs; database; schema; UI; implementation code.

## 6. Outcome

SPR-MOD-002-005 becomes the fifth Accounting Sprint PRD, establishing the repository-standard Taxation & Compliance Foundation and positioning MOD-002 for **Pass 8.3.6 — SPR-MOD-002-006 (Period Close & Audit)**.

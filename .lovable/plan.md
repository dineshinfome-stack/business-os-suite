# Pass 8.3.4 — Author SPR-MOD-002-004 (Financial Statements)

Documentation-only. Fourth Accounting Sprint PRD. Continues Stage 2 of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-002 Accounting. Extends Journal & Ledger Posting (SPR-MOD-002-003) into the repository-standard financial reporting layer without redefining voucher, journal, ledger, or period ownership.

## 1. Create Sprint PRD

`docs/30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md`, using `docs/99-templates/sprint-prd-template.md`.

**Structural Parity Requirement.** Maintain the identical 18-section structure established by SPR-MOD-002-001, SPR-MOD-002-002, and SPR-MOD-002-003. Section ordering, governance callouts, dependency block, traceability matrix, engine consumption, ADR consumption, events, acceptance criteria, DoD, Exit Criteria, Risks, Test Strategy, Implementation Notes, Review Gate, and References remain structurally identical. Scope below defines section **content only**.

### In Scope

Trial Balance; General Ledger report; Profit & Loss; Balance Sheet; Cash Flow; account activity reporting; comparative reporting across accounting periods; opening/closing balance presentation; report parameterization (period, branch, company, financial year); multi-company reporting boundaries; multi-currency presentation using stored accounting values; report export readiness; audit traceability from report line back to ledger entries; financial reporting events.

### Out of Scope

Tax reports (Sprint 005); period close (Sprint 006); consolidation; budgeting; forecasting; analytics dashboards; BI cubes; regulatory reporting; AI insights; custom report designer.

## 2. Governance Conventions Introduced

- **§1.1 Financial Reporting Ownership Convention** — Accounting owns semantics of Trial Balance, GL, P&L, Balance Sheet, Cash Flow. No downstream module may redefine accounting report calculations.
- **§1.2 Ledger Consumption Convention** — Reports consume authoritative ledger movements from SPR-MOD-002-003. Reports MUST NOT reconstruct transactions from vouchers or source documents. Ledger is the single authoritative source.
- **§1.3 Report Determinism Rule** — Identical parameters against an unchanged ledger MUST produce identical output. Reports are deterministic projections of ledger state.
- **§1.4 Reporting Read Model Convention** — Reports expose repository-approved read models. Read models MAY optimize performance but MUST NOT become independent sources of accounting truth; ledger remains authoritative.
- **§1.5 Financial Statement Boundary** — Reports describe position only. They MUST NOT post, modify journals, create vouchers, reopen periods, calculate taxes, or change ledger balances.

## 3. Dependencies

- **Upstream:** MOD001_PLATFORM_BASELINE_v1; SPR-MOD-002-001; SPR-MOD-002-002; SPR-MOD-002-003 (direct predecessor).
- **Downstream:** SPR-MOD-002-005 (Taxation & Compliance); SPR-MOD-002-006 (Period Close & Audit). Consumer modules: MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018.

## 4. Engine & ADR References

Consume only the engines required by the Accounting Module PRD, using the exact identifiers from `docs/10-erp-core/ENGINE_CATALOG.md` and `docs/ENGINE_USAGE_MATRIX.md`. No new engine identifiers introduced. Expected consumption spans Reporting, Currency, Audit, Event, Authorization, and Configuration engines — resolved to authoritative ENG identifiers at authoring time.

Only Accepted ADRs referenced; identifiers match the ADR catalog verbatim.

## 5. Events

Financial reporting events follow the repository-wide Event Catalog and the single-entity dotted namespace precedent from Sprints 002/003. Expected event surface:

- `financialstatement.generated`
- `trialbalance.generated`
- `balancesheet.generated`
- `profitloss.generated`
- `cashflow.generated`

**Event Catalog governance (architecture-doc immutability preserved).** Sprint PRD authoring is documentation-only and MUST NOT modify `docs/02-architecture/event-catalog.md`. The Sprint PRD references only event names that already exist in the authoritative Event Catalog at authoring time. If any of the expected events above is not present in the catalog, the Sprint PRD either (a) references the closest authoritative equivalent that already exists, or (b) records the gap in Risks/Assumptions and defers publication of that specific event until a dedicated Event Catalog governance pass introduces it. New event definitions require a separate, explicitly authorized architecture pass — never this pass.

## 6. Acceptance Criteria (observable, business-outcome only)

- Trial Balance balances to zero.
- Balance Sheet satisfies Assets = Liabilities + Equity.
- P&L derives exclusively from posted ledger movements.
- General Ledger reconciles exactly with account balances.
- Cash Flow derives from authoritative accounting movements.
- Reports generated twice against identical ledger state produce identical output (determinism).
- Reports respect tenant, company, branch, and financial-year boundaries.
- Report output is fully traceable back to journal entries.
- Unauthorized report access is rejected.
- Report generation is audited.
- Reporting events are emitted per the Event Catalog, using only names that exist in the authoritative catalog at authoring time.

## 7. Governance Registrations (derived indexes only)

- `docs/SPRINT_CATALOG.md` — replace Sprint 004 planned row with Draft.
- `docs/30-sprint-prds/accounting/README.md` — replace Sprint 004 placeholder with authored PRD link.
- `docs/DOCUMENT_INDEX.md` — exactly one entry.
- `docs/_meta.json` — exactly one registration.
- `.lovable/plan.md` — append Pass 8.3.4 execution record.

No architecture documents modified. No category-level registrations. `docs/02-architecture/event-catalog.md` is **not** edited in this pass.

## 8. Repository Verification (per `docs/SPRINT_AUTHORING_GUIDE.md` §13)

- Exactly one `DOCUMENT_INDEX.md` entry.
- Exactly one Draft row in `SPRINT_CATALOG.md`.
- Exactly one `_meta.json` registration.
- Accounting README links Sprint 004.
- Structural parity with SPR-MOD-002-001/002/003.
- Every capability traces to `docs/20-module-prds/accounting/MODULE_PRD.md`.
- Only Accepted ADRs referenced.
- Engine IDs match `ENGINE_CATALOG.md`/`ENGINE_USAGE_MATRIX.md` verbatim.
- Every event name referenced in the Sprint PRD already exists in `docs/02-architecture/event-catalog.md`; any gap is recorded in Risks/Assumptions rather than resolved by editing the catalog.
- Financial Statements consume ledger state only.
- No content redefines voucher, journal, ledger, or period ownership.
- No architecture documents modified by this pass.

## 9. Not Changed

Module PRDs, MOD-002 Sprint Plan, SPR-MOD-002-001, SPR-MOD-002-002, SPR-MOD-002-003, SPR-MOD-002-005, SPR-MOD-002-006, Module Baselines, ERP Core Engines, ADRs, architecture documentation (including `event-catalog.md`), APIs, database, schema, UI, implementation code.

## 10. Outcome

`SPR-MOD-002-004-financial-statements.md` becomes the fourth Accounting Sprint PRD, establishing the repository-standard financial reporting layer built exclusively on authoritative ledger movements while preserving ownership boundaries established by Sprints 001–003 and the architecture-doc immutability rule for Sprint PRD authoring. Positions MOD-002 for **Pass 8.3.5 — SPR-MOD-002-005 (Taxation & Compliance Foundation)**.

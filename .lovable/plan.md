# Pass 8.3.6 — Author SPR-MOD-002-006 (Period Close & Audit)

Documentation-only. Sixth and final MOD-002 Sprint PRD, structurally identical to SPR-MOD-002-001…005. No architecture, engine, ADR, Event Catalog, Module PRD, or previous Sprint PRD is modified.

## 1. Create Sprint PRD

**File:** `docs/30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md`

Template: `docs/99-templates/sprint-prd-template.md`. Full 18-section structure matching Sprints 001–005 verbatim (Objective & Scope; Deliverables; Traceability; User Stories; Acceptance Criteria; Parent Module; Dependencies; ERP Core Engine Consumption; ADR Consumption; Data Model Impact; Events; Definition of Done; Sprint Exit Criteria; Risks & Assumptions with normalized 5-field register; Test Strategy; Implementation Notes; Review Gate; References).

Frontmatter:
- `sprint_id: SPR-MOD-002-006`
- `parent_module: MOD-002`
- `iteration: Sprint 6`
- `status: Draft`
- `owner: Accounting`
- `updated: 2026-07-07`
- `size: Medium`
- `related_engines` populated by reading `docs/10-erp-core/ENGINE_CATALOG.md` + `docs/ENGINE_USAGE_MATRIX.md` at authoring time; no hardcoded IDs.
- `related_adrs` populated from `docs/11-adrs/ADR_INDEX.md`; Accepted only.

### Governance Conventions (§1.1–§1.6)

1. **Period Authority Convention** — Accounting exclusively owns period lifecycle states (Open, Soft Closed, Closed, Reopened). No downstream redefinition.
2. **Financial Year Ownership Convention** — Accounting owns fiscal year close, year-end carry forward, opening balance preparation, closing adjustment governance. Business modules consume resulting state.
3. **Period Close Boundary** — Period Close determines whether posting is permitted; MUST NOT create vouchers, modify journals, modify ledger entries, calculate taxes, or generate financial statements. Those remain owned by Sprints 002–005.
4. **Controlled Reopening Convention** — Closed periods may be reopened only through authorized accounting governance; fully audited; preserves historical integrity; never deletes accounting history.
5. **Audit Review Boundary** — Accounting owns business-level accounting audit review. Platform Audit (MOD-001 / `ENG-004`) remains authoritative for audit collection, storage, integrity, and lifecycle. Accounting consumes Platform audit services.
6. **Financial Freeze Convention** — Once a period reaches Closed, accounting movements are frozen; downstream modules consume the closed state; subsequent corrections occur only through controlled reopening.

All six complement — and do not replace — the Accounting Ownership (001), Voucher Ownership (002), Ledger Posting Ownership / Immutability / Balance Integrity / Ledger Access Boundary (003), Financial Reporting Ownership / Ledger Consumption / Report Determinism / Reporting Read Model / Financial Statement Boundary (004), and Tax Ownership / Tax Calculation Boundary / Tax Configuration Authority / Compliance Readiness / Tax Reporting Boundary (005) conventions.

### Traceability Requirement

Every capability MUST trace to one or more sections of `docs/20-module-prds/accounting/MODULE_PRD.md`. No orphan requirements.

### Scope

**In scope:** accounting period lifecycle; Open / Soft Close / Close / Reopen transitions; financial-year close; closing adjustments (governance only — journal creation stays in Sprint 003); closing validation; closing checklist; year-end carry forward readiness; opening balance preparation; accounting lock rules; posting restrictions enforced against Sprint 003 posting pipeline; audit review workflows; audit exports; accounting operational review; period status visibility; close authorization; accounting close events.

**Out of scope:** voucher lifecycle (002); journal creation and ledger posting (003); financial statement calculation (004); tax determination and tax filing (005); statutory/government filing; external audit systems; SIEM; infrastructure monitoring; BI dashboards; AI accounting analysis; consolidation.

### Dependencies

- **Upstream:** `MOD001_PLATFORM_BASELINE_v1`; **SPR-MOD-002-001 through SPR-MOD-002-005 (all required)**.
- **Downstream:** `MOD002_ACCOUNTING_BASELINE_v1` (frozen in the next Stage 3 pass); consumer modules MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018.

### Engines & ADRs

Consume only engines already required by the Accounting Module PRD, resolved verbatim against ENGINE_CATALOG / ENGINE_USAGE_MATRIX. Expected engine surface: Configuration, Authorization, Audit, Event, Reporting, Currency. No new ENG IDs. Only Accepted ADRs from `ADR_INDEX.md`.

### Events

Reference only names already present in `docs/02-architecture/event-catalog.md`. Event Catalog is the sole authoritative source; the following list is **illustrative, not normative**:

> Expected event surface includes (subject to the authoritative Event Catalog): `accountingperiod.closed`, `accountingperiod.reopened`, `financialyear.closed`, `periodclose.completed`, `auditreview.generated`.

For any illustrative name absent from the catalog, reference the closest authoritative equivalent or record a deferred `R-EV-*` risk. **Event Catalog is not edited.**

### Acceptance Criteria (Given/When/Then, observable only)

Includes: closed periods reject posting deterministically; authorized reopening succeeds and is audited; unauthorized reopening is refused and audited; financial-year close prepares opening balances deterministically; closing validation detects unresolved accounting issues before Close; accounting audit review is fully traceable to Platform audit records; audit exports reflect authoritative accounting state; every period state change is authorized via `ENG-002` and audited via `ENG-004`; **period close and audit events are published only using names present in the authoritative Event Catalog**; downstream modules consume closed accounting state without redefining it; tenant isolation (`ADR-011`) enforced on every period/audit read/write; ownership-boundary preservation — no path performs voucher, journal, ledger, tax, or financial-statement mutation through the close/audit surface.

### Risks & Assumptions

Normalized 5-field register (Risk ID, Description, Impact, Mitigation, Status) with working vocabulary preamble (`Open`, `Mitigated`, `Accepted`, `Deferred`, `Closed`). Include `R-EV-01` (Deferred) if any illustrative close/audit event is absent from the Event Catalog. Include explicit risks for upstream Sprint 001–005 dependency, Platform baseline dependency, deferred statutory/consolidation scope, Audit Review Boundary (Platform audit ownership preserved), and Controlled Reopening governance.

## 2. Governance registrations (derived indexes only)

- `docs/SPRINT_CATALOG.md` — one new Draft row for SPR-MOD-002-006.
- `docs/30-sprint-prds/accounting/README.md` — link Sprint 006 (replace the existing Planned placeholder row).
- `docs/DOCUMENT_INDEX.md` — one new entry.
- `docs/_meta.json` — one registration entry.
- `.lovable/plan.md` — Pass 8.3.6 execution record.

Exactly one registration per document; no new repository categories.

## 3. Repository verification

Confirm:

- Single DOCUMENT_INDEX entry; single Draft SPRINT_CATALOG row; single README link; single `_meta.json` registration.
- Structural parity with Sprints 001–005.
- Every capability traces to Accounting MODULE_PRD.
- Accepted ADRs only; engine IDs match catalog verbatim.
- Every referenced event exists in the Event Catalog or is recorded as a deferred `R-EV-*` risk.
- Period Close & Audit ownership does NOT redefine voucher, journal, ledger, financial reporting, or taxation ownership from Sprints 002–005.
- Platform Audit ownership (`ENG-004`, MOD-001) remains unchanged; Accounting consumes Platform audit services.
- No architecture documents modified.

## 4. Future (out of scope for this pass)

Baseline creation is NOT performed here. It occurs in the subsequent Stage 3 pass **Pass 8.3.Z — MOD002_ACCOUNTING_BASELINE_v1**, following the Stage 3 baseline process established by `MOD001_PLATFORM_BASELINE_v1`. No repository-wide governance-identifier standardization is introduced here.

## 5. Not changed

MOD-002 Sprint Plan; Accounting Sprints 001–005; Module PRDs; Module Baselines; ERP Core Engines; ADRs; Event Catalog; architecture documentation; APIs; database; schema; UI; implementation code.

## 6. Outcome

`SPR-MOD-002-006-period-close-audit.md` becomes the sixth and final Accounting Sprint PRD, completing Stage 2 of MOD-002. The Accounting Sprint family (001–006) is complete and ready for **Pass 8.3.Z — MOD002_ACCOUNTING_BASELINE_v1**, which freezes the Accounting module as the second repository Module Baseline.

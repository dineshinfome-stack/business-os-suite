# Pass 8.3.3 — Author SPR-MOD-002-003 (Journal & Ledger Posting)

Documentation-only. Third Accounting Sprint PRD. Extends the Voucher Framework (Sprint 002) into the Journal & Ledger posting layer. Incorporates the two prior refinements plus event-naming consistency and explicit structural parity.

## 1. Create Sprint PRD

`docs/30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md`, using `docs/99-templates/sprint-prd-template.md`.

**Structural Parity Requirement.** Maintain the identical section structure established by SPR-MOD-002-001 and SPR-MOD-002-002; the scope below defines section *content* only. Section ordering, governance blocks, dependency block, engines block, ADR block, events block, acceptance criteria block, and traceability block must match verbatim.

### Scope

- Journal entry creation from posted vouchers.
- Ledger posting to General Ledger and applicable sub-ledgers.
- Ledger balance computation per account / tenant / currency / period.
- Posting-time period-state validation (consume-only).
- Reversal posting semantics paired with Sprint 002 reversal model (no mutation).

### Out of Scope

Financial statements, tax computation, period close lifecycle, consolidation, statutory reports.

## 2. Governance Conventions Introduced

**§1.1 Ledger Posting Ownership Convention.** The Accounting module owns journal entry semantics, ledger posting semantics, and ledger balance semantics. ERP Core Engines provide infrastructure; they never redefine posting business rules.

**§1.2 Ledger Immutability Convention.** Posted journal entries and ledger rows are immutable. Corrections occur only through reversal journals created via the Voucher Framework; original rows are never mutated or deleted.

**§1.3 Balance Integrity Rule.** A journal entry is valid only if debits equal credits per tenant per currency. Multi-currency entries balance independently within each currency dimension.

**§1.4 Accounting Period Authority.** Journal & Ledger Posting consumes the accounting-period status established by the Accounting Foundation and Period Close capabilities. This sprint determines whether posting is permitted based on the current period state but MUST NOT define or modify period lifecycle semantics.

**§1.5 Ledger Access Boundary.** Downstream modules consume accounting movements either through authoritative accounting events or through repository-approved read services, but MUST NOT access or mutate ledger state directly.

## 3. Dependencies

- **Upstream:** `MOD001_PLATFORM_BASELINE_v1` (frozen), `SPR-MOD-002-001` (foundation), `SPR-MOD-002-002` (voucher framework — direct predecessor).
- **Downstream:** SPR-MOD-002-004 (Financial Statements), 005 (Tax), 006 (Period Close), plus voucher-consuming modules (MOD-003, MOD-004, MOD-008, MOD-015, MOD-017).

## 4. Engine & ADR References

Engine identifiers MUST match the authoritative identifiers already defined in `docs/10-erp-core/ENGINE_CATALOG.md` and `docs/ENGINE_USAGE_MATRIX.md`. No new identifiers may be introduced in this Sprint PRD.

Engines: ENG-002 Authorization, ENG-004 Audit, ENG-015 Voucher, ENG-016 Posting, ENG-018 Currency, ENG-021 Reporting, ENG-024 Event.

ADRs (Accepted only): ADR-011, ADR-013, ADR-014, ADR-015, ADR-032, ADR-051, ADR-053.

## 5. Events

Event names MUST follow the repository-wide convention already established by the Event Catalog and the Sprint 002 voucher events (`voucher.created`, `voucher.posted`, `voucher.reversed`). Using the same single-entity dotted namespace:

- `journal.created`
- `journal.posted`
- `journal.reversed`
- `ledger.posted`
- `ledger.reversed`

Names must be validated against `docs/02-architecture/event-catalog.md` at authoring time; any mismatch is resolved in favor of the Event Catalog and this Sprint PRD is corrected in the same change. Ownership registered under Accounting.

## 6. Acceptance Criteria (observable, no implementation leakage)

- Every posted voucher produces exactly one balanced journal entry.
- Debits equal credits per tenant per currency for every journal entry.
- Posted ledger rows are immutable; reversals produce new rows.
- Posting is rejected when the target period is not in an open state (consumed signal only).
- Every posting operation is authorized and audited.
- Accounting events are emitted for every posting state change, using the naming convention in §5.
- Downstream modules access accounting movements exclusively via events or approved read services.

## 7. Governance Registrations

- `docs/SPRINT_CATALOG.md` — add Sprint 003 row, status Draft.
- `docs/30-sprint-prds/accounting/README.md` — replace Sprint 003 placeholder with link.
- `docs/DOCUMENT_INDEX.md` — exactly one entry.
- `docs/_meta.json` — exactly one registration.
- `.lovable/plan.md` — append Pass 8.3.3 execution record.

## 8. Verification

- One `DOCUMENT_INDEX.md` entry, one `_meta.json` entry, one Draft row in `SPRINT_CATALOG.md`.
- Structural parity with SPR-MOD-002-001 and SPR-MOD-002-002 (identical section structure).
- Every capability traces to `docs/20-module-prds/accounting/MODULE_PRD.md`.
- Only Accepted ADRs referenced.
- Engine IDs match `ENGINE_CATALOG.md` / `ENGINE_USAGE_MATRIX.md` verbatim.
- Event names match `docs/02-architecture/event-catalog.md` convention and Sprint 002 precedent.
- ERP Core Engines consumed, never redefined.
- No content redefines period-close lifecycle.

## 9. Not Changed

Module PRDs, MOD-002 Sprint Plan, SPR-MOD-002-001, SPR-MOD-002-002, other Accounting Sprint PRDs, Module Baseline Catalog, ERP Core Engines, ADRs, architecture, code, database, APIs, UI.

## 10. Outcome

`SPR-MOD-002-003-journal-ledger-posting.md` becomes the third Accounting Sprint PRD, establishing Journal & Ledger Posting as the canonical accounting movement layer built on the Voucher Framework, with ledger immutability, balance integrity, clean period-authority boundaries, and event names consistent with the repository-wide Event Catalog. Positions MOD-002 for **Pass 8.3.4 — SPR-MOD-002-004 (Financial Statements)**.

---

## Execution Record — Pass 8.3.3

**Executed:** 2026-07-07
**Outcome:** Authored `SPR-MOD-002-003-journal-ledger-posting.md` as the third Accounting Sprint PRD, establishing Journal & Ledger Posting with the Ledger Posting Ownership, Ledger Immutability, Balance Integrity, Accounting Period Authority, and Ledger Access Boundary conventions. Event names use the single-entity dotted namespace (`journal.created`, `journal.posted`, `journal.reversed`, `ledger.posted`, `ledger.reversed`) consistent with Sprint 002 and the repository-wide Event Catalog. Engine IDs match the authoritative `ENGINE_CATALOG.md`/`ENGINE_USAGE_MATRIX.md` verbatim. Structural parity with SPR-MOD-002-001 and SPR-MOD-002-002 maintained (identical 18-section structure).

**Files created:**
- `docs/30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md`

**Files edited (registrations):**
- `docs/SPRINT_CATALOG.md` — added SPR-MOD-002-003 row (Draft)
- `docs/30-sprint-prds/accounting/README.md` — Sprint 3 placeholder replaced with link, status Draft
- `docs/DOCUMENT_INDEX.md` — one authoritative entry added
- `docs/_meta.json` — one registration added

**Positions MOD-002 for:** Pass 8.3.4 — SPR-MOD-002-004 (Financial Statements).

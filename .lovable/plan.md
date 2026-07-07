# Pass 8.3.3 — Author SPR-MOD-002-003 (Journal & Ledger Posting)

Documentation-only. Continues Stage 2 of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-002 Accounting. Produces the third Accounting Sprint PRD, building directly on the Voucher Framework established in SPR-MOD-002-002.

## 1. Create Sprint PRD

File: `docs/30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md`

Authored using `docs/99-templates/sprint-prd-template.md`, mirroring the structural gold standard of SPR-MOD-002-001 and SPR-MOD-002-002 (same section order, same governance blocks, same acceptance-criteria style expressed as observable business outcomes).

## 2. Sprint Scope

The sprint defines *what happens after a voucher is posted* — the canonical translation of posted vouchers into balanced double-entry ledger movements and the resulting account balances. It does **not** redefine voucher ownership, lifecycle, or entry-point rules established in Sprint 002; it consumes them.

In scope:

- **Journal Entry Model** — balanced debit/credit lines derived from a posted voucher, tenant-scoped, currency-aware.
- **Chart of Accounts Consumption** — accounts referenced by journal lines must resolve to the CoA established in SPR-MOD-002-001; posting fails deterministically on invalid or inactive accounts.
- **Ledger Posting** — idempotent projection of journal entries onto per-account ledgers with running balances.
- **Balance Integrity Rules** — every journal entry balances to zero per tenant per currency; unbalanced entries are rejected with structured errors.
- **Posting Determinism & Idempotency** — repeating the same posting request for the same voucher produces the same ledger state exactly once.
- **Reversal Semantics** — reversal vouchers (defined in Sprint 002) produce inverse journal entries; original entries remain immutable.
- **Multi-Currency Posting** — foreign-currency vouchers post at the voucher's captured exchange rate; base-currency equivalents are derived, not re-computed at read time.
- **Period Awareness (read-only)** — posting respects the open/closed period signal but does not own period close (that is Sprint 006).
- **Events** — `journal.entry.created`, `ledger.posted`, `ledger.reversed` published as the authoritative accounting-movement events for downstream consumers.

Out of scope (explicit non-goals):

- Financial statements (Sprint 004).
- Tax computation and jurisdictional rules (Sprint 005).
- Period close, lock, and audit trail consolidation (Sprint 006).
- Any redefinition of voucher lifecycle, entry-point ownership, or cross-module voucher contract (owned by Sprint 002).

## 3. Governance Conventions Introduced

Stated once, in the Sprint PRD, and never redefined later:

1. **Ledger Posting Ownership Convention.** The Accounting module owns the translation of posted vouchers into journal entries and ledger movements. No other module may write to accounting ledgers directly; downstream modules read via the Reporting Engine or subscribe to accounting events.
2. **Balance Integrity Rule.** A journal entry is valid only if debits equal credits per tenant per currency. This invariant is a platform-wide accounting invariant and cannot be relaxed by any downstream sprint or module.
3. **Ledger Immutability Convention.** Once posted, ledger entries are immutable. Corrections flow through reversal vouchers (Sprint 002) which produce new inverse ledger entries; historical entries are never mutated or deleted.
4. **Authoritative Accounting Movement Events.** `journal.entry.created`, `ledger.posted`, and `ledger.reversed` are the authoritative accounting-movement events consumed by Financial Statements, Taxation, Period Close, and downstream reporting modules. Reporting consumes these events rather than source-document events.

## 4. Traceability

Each capability traces to specific sections of `docs/20-module-prds/accounting/MODULE_PRD.md`:

- §2 Business Scope
- §6 Transactions
- §7 Business Rules
- §10 Configuration
- §12 Engine Consumption

## 5. Dependencies

- **Upstream (authoritative):** `MOD001_PLATFORM_BASELINE_v1` (frozen; encapsulates Platform Sprints 001–006).
- **Upstream (sprint-level):** `SPR-MOD-002-001` (Accounting Foundation — CoA, accounting periods, base currency), `SPR-MOD-002-002` (Voucher Framework — sole entry point, posted-voucher immutability, reversal semantics).
- **Downstream:** `SPR-MOD-002-004` (Financial Statements), `SPR-MOD-002-005` (Taxation & Compliance Foundation), `SPR-MOD-002-006` (Period Close & Audit), and all reporting/analytics modules that consume accounting movements.

## 6. Engines Consumed (never redefined)

Listed as consumption only — canonical semantics remain in each engine's spec:

- ENG — Posting Engine, Voucher Engine, Currency Engine, Numbering Engine, Event Engine, Audit Engine, Authorization Engine, Configuration Engine, Reporting Engine (read side).

Exact engine identifiers are filled in by referencing `docs/10-erp-core/ENGINE_CATALOG.md` and `docs/ENGINE_USAGE_MATRIX.md` when authoring, matching the identifier style used in SPR-MOD-002-002.

## 7. ADRs Referenced (Accepted only)

Referenced, not redefined:

- ADR-013 Money Representation
- ADR-014 Audit Strategy
- ADR-032 RBAC/ABAC
- ADR-051 Transactional Outbox
- ADR-053 Idempotency
- ADR-011 Multi-Tenant Isolation

Only Accepted ADRs are referenced; no new ADRs are proposed.

## 8. Acceptance Criteria (observable business outcomes)

- A posted voucher produces exactly one balanced journal entry per tenant per currency.
- An unbalanced journal entry is rejected; no partial ledger state is persisted.
- Posting the same voucher twice yields the same ledger state exactly once (idempotency).
- Ledger entries are immutable after posting; direct mutation attempts are rejected.
- A reversal voucher produces inverse ledger entries; the original entries remain unchanged.
- Foreign-currency postings preserve the voucher's captured exchange rate and derived base-currency amount.
- `journal.entry.created`, `ledger.posted`, and `ledger.reversed` events are emitted for every relevant state transition.
- Attempts to write to ledgers outside the Voucher → Journal → Ledger path are rejected.

## 9. Governance Registrations

- `docs/SPRINT_CATALOG.md` — replace the planned row for SPR-MOD-002-003 with a Draft row linking the new file (exactly one row).
- `docs/30-sprint-prds/accounting/README.md` — convert the Sprint 3 placeholder into a link to the new PRD.
- `docs/DOCUMENT_INDEX.md` — register the new file exactly once.
- `docs/_meta.json` — register the doc route exactly once.
- `.lovable/plan.md` — append an execution record for Pass 8.3.3.

No new category-level registrations. No changes to `MODULE_BASELINE_CATALOG.md`.

## 10. Repository Verification

- Exactly one `DOCUMENT_INDEX.md` entry.
- Exactly one Draft row in `SPRINT_CATALOG.md`.
- Accounting README links Sprint 3.
- Exactly one `_meta.json` registration.
- Structural parity with SPR-MOD-002-001 and SPR-MOD-002-002.
- Every capability traces to a specific section of `docs/20-module-prds/accounting/MODULE_PRD.md`.
- Only Accepted ADRs referenced.
- ERP Core Engines consumed, never redefined.
- Voucher ownership and entry-point conventions from Sprint 002 are referenced, not restated.

## 11. Not Changed

Module PRDs, `MOD-002_SPRINT_PLAN.md`, `SPR-MOD-002-001`, `SPR-MOD-002-002`, other Accounting Sprint PRDs, `MODULE_BASELINE_CATALOG.md`, ERP Core Engines, ADRs, architecture documentation, code, database schema, APIs, UI.

## Outcome

`SPR-MOD-002-003-journal-ledger-posting.md` becomes the third Accounting Sprint PRD, establishing the canonical translation of posted vouchers into balanced, immutable ledger movements and defining the authoritative accounting-movement events consumed by downstream financial and reporting modules. Positions MOD-002 for **Pass 8.3.4 — SPR-MOD-002-004 (Financial Statements)**.

---

## Execution Record — Pass 8.3.3 (2026-07-07)

- Created `docs/30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md` mirroring the SPR-MOD-002-001 / -002 gold standard. Introduces four Accounting-scope governance conventions: Ledger Posting Ownership, Balance Integrity Rule, Ledger Immutability, and Authoritative Accounting Movement Events. Consumes SPR-MOD-002-001 (CoA, periods, base currency) and SPR-MOD-002-002 (Voucher Framework as sole entry point) upstream; MOD001_PLATFORM_BASELINE_v1 as authoritative platform source. Declares closed-period contract as read-only (owned by SPR-MOD-002-006). Publishes `journal.entry.created`, `ledger.posted`, `ledger.reversed` as the authoritative accounting-movement events for Financial Statements, Taxation, Period Close, and downstream reporting.
- Registered in `docs/SPRINT_CATALOG.md` (Draft), `docs/30-sprint-prds/accounting/README.md` (Sprint 3 row linked, status Draft), `docs/DOCUMENT_INDEX.md`, and `docs/_meta.json` (sidebar).
- Not changed: Module PRDs, `MOD-002_SPRINT_PLAN.md`, SPR-MOD-002-001, SPR-MOD-002-002, other Accounting Sprint PRDs, `MODULE_BASELINE_CATALOG.md`, ERP Core Engines, ADRs, architecture, code, database, APIs, UI.

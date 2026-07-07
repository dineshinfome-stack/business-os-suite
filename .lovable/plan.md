# Pass 8.4.0-R — Clarify Sales → Accounting Ownership Boundary (Documentation Refinement)

Documentation-only micro-pass. Refines the Stage 1 Sprint Planning document for MOD-003 Sales by explicitly aligning Sales with the ownership boundaries established by `MOD002_ACCOUNTING_BASELINE_v1`. No Sprint sequencing, scope, registrations, or governance documents are modified.

## 1. Refine Sprint Planning Document

**File:** `docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md`

The plan is updated in place from the approved Pass 8.4.0 baseline with one ownership-boundary clarification and one cross-module dependency note. All other Pass 8.4.0 content (Sprint sequence, frontmatter, governance maps, completion criteria, non-goals) remains unchanged.

### 1.1 SPR-MOD-003-004 — Sales Invoicing Description

Update the description of **SPR-MOD-003-004 — Sales Invoicing** to include the following ownership-boundary statement, replacing the prior Accounting dependency wording:

> **Accounting Voucher Creation Contract** — Sales produces commercial documents (Sales Invoice, Credit Note, Debit Note) and requests accounting voucher creation by consuming `MOD002_ACCOUNTING_BASELINE_v1`. Sales MUST NOT create accounting journals, ledger entries, or independently manage accounting voucher lifecycles. Accounting remains the authoritative owner of accounting vouchers, journal posting, ledger posting, taxation, financial reporting, and accounting period governance.

This clarification documents consumption of the Accounting baseline only; it introduces no new business capability.

### 1.2 Cross-Module Dependency Note

Within the Sprint Dependency / Cross-Sprint Dependency section, add one repository-standard note:

> **Accounting Dependency.** All accounting behavior required by MOD-003 is consumed through `MOD002_ACCOUNTING_BASELINE_v1`. Sales owns commercial document lifecycle; Accounting owns accounting lifecycle. Ownership boundaries established by the Accounting baseline SHALL NOT be redefined in Sales Sprint PRDs.

## 2. Not Changed

- Sprint sequencing (linear 001 → 002 → 003 → 004 → 005 → 006).
- Sprint IDs, sizes, and objectives.
- Sprint scopes and out-of-scope items.
- ERP Core Engine consumption map.
- ADR consumption map.
- Cross-Sprint dependency matrix (other than the single Accounting dependency note).
- Risks, assumptions, module completion criteria, and non-goals.
- Sales README (`docs/30-sprint-prds/sales/README.md`).
- Governance registrations (`DOCUMENT_INDEX.md`, `_meta.json`, `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md`, `.lovable/plan.md`).
- Module PRDs, Sprint Catalog, Module Baseline Catalog, Module Baselines, ERP Core Engines, ADRs, Event Catalog, architecture documents, APIs, database, schema, UI, code.

## 3. Verification

- No Sprint sequencing changes.
- No Sprint scope changes.
- No new Sprint IDs.
- No new governance conventions.
- No changes to Module PRDs.
- No changes to `MOD002_ACCOUNTING_BASELINE_v1`.
- No changes to ERP Core Engines, ADRs, Event Catalog, or architecture documents.
- Diff confined to wording within `MOD-003_SPRINT_PLAN.md`.
- `MOD-003_SPRINT_PLAN.md` appears exactly once in `DOCUMENT_INDEX.md`.
- `_meta.json` contains exactly one sidebar registration.
- Sales README still links the Sprint Plan and lists SPR-MOD-003-001 through SPR-MOD-003-006.

## 4. Outcome

`MOD-003_SPRINT_PLAN.md` explicitly reflects the repository-wide Accounting ownership model before Sprint PRDs are authored, reducing the possibility of ownership drift during Stage 2 while preserving the existing Sales Sprint Plan. This wording provides a reusable pattern for future commercial modules (Purchase, POS, Payroll, Projects, CRM, etc.) when consuming `MOD002_ACCOUNTING_BASELINE_v1`; formal repository-wide standardization, if desired, remains a future governance decision. MOD-003 remains prepared for **Pass 8.4.1 — SPR-MOD-003-001 (Sales Foundation)**.

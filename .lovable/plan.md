# Pass 8.3.0 — MOD-002 Accounting Sprint Planning (Stage 1)

Documentation-only. Executes Stage 1 of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-002 Accounting. No Sprint PRDs are authored in this pass; Sprint IDs are reserved as planning-only.

## 1. Create `docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`

Follow the structure and section ordering of `MOD-001_SPRINT_PLAN.md` (repository-standard Stage 1 template). Planning artifact only — no new business requirements beyond the approved Accounting Module PRD.

**Frontmatter**

```yaml
module_id: MOD-002
module_name: Accounting
status: Planning
owner: Accounting
parent_module_prd: docs/20-module-prds/accounting/MODULE_PRD.md
workflow_stage: Stage 1
updated: 2026-07-06
```

**Sections** (mirror MOD-001 plan)

1. **Purpose & Scope** — reference the approved Accounting Module PRD; state the plan decomposes MOD-002 into independently deliverable Sprint PRDs.

2. **Proposed Sprint Sequence** — reserve six Sprint IDs:
   - `SPR-MOD-002-001` Accounting Foundation — CoA, ledger hierarchy, account classifications, accounting periods, fiscal setup. Size: **Medium**.
   - `SPR-MOD-002-002` Voucher Framework — voucher lifecycle, numbering, posting workflow, Draft/Posted/Cancelled. Size: **Large**.
   - `SPR-MOD-002-003` Journal & Ledger Posting — double-entry engine consumption, journals, ledger posting, trial balance foundation. Size: **Large**.
   - `SPR-MOD-002-004` Financial Statements — Trial Balance, P&L, Balance Sheet, Cash Flow, General Ledger. Size: **Large**.
   - `SPR-MOD-002-005` Taxation & Compliance Foundation — GST framework, tax configuration, tax posting, compliance readiness. Size: **Medium**.
   - `SPR-MOD-002-006` Period Close & Audit — FY close, locking, reopening, closing adjustments, audit support. Size: **Medium**.

   Each entry lists objective, boundaries (in/out), parent Module PRD sections covered, engines consumed (`ENG-NNN`), ADRs consumed (`ADR-NNN`), intra-module dependencies, and Sprint Exit Criteria.

   **Planning Flexibility.** The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

3. **Sprint Dependency Graph** — ASCII:

   ```text
   001 Accounting Foundation
             │
             ▼
   002 Voucher Framework
             │
             ▼
   003 Journal & Ledger Posting
            ├──────────┐
            ▼          ▼
   004 Financials   005 Tax
            └──────┬───┘
                   ▼
   006 Period Close
   ```

4. **Engine Consumption Map** — matrix Sprint × ERP Core Engine, drawn from Accounting Module PRD §12 (Required: ENG-001..008, 011, 015..019, 021, 024, 026, 027; Optional: ENG-010, 012, 020, 022, 023, 025, 028). No engine behavior redefined.

5. **ADR Consumption Map** — matrix Sprint × Accepted ADR (per Module PRD: ADR-011, ADR-014, ADR-032, plus supporting Accepted ADRs referenced by engines consumed). Accepted ADRs only.

6. **Cross-Sprint Dependency Matrix** — shared events (VoucherPosted, PeriodClosed, PaymentRecorded, ReceiptRecorded, BankReconciled), shared master data (CoA, Tax Codes, Bank Accounts), shared configuration (fiscal calendar, currency, numbering series), shared migrations, shared posting workflow.

7. **Risks & Assumptions** — dependency on MOD-001 Platform Baseline (v1, frozen), dependency on ERP Core Engines, dependency on Accepted ADRs. Assumptions only; no new requirements.

8. **Module Completion Criteria** — objective, baseline-terminated conditions:
   - all reserved Accounting Sprint PRDs authored and completed;
   - `MOD002_ACCOUNTING_BASELINE_v1` authored under `docs/40-module-baselines/`;
   - repository verification complete;
   - downstream modules (MOD-003 Sales, MOD-004 Purchase, MOD-008 Payroll, MOD-015 POS, MOD-017 Analytics) may consume the frozen Accounting baseline.

9. **Non-Goals** — no Sprint PRDs authored; no Module PRD, Engine, or ADR changes; no code, schema, APIs, or UI.

## 2. Update `docs/30-sprint-prds/accounting/README.md`

- Add "Stage 1 — Sprint Planning" section linking `MOD-002_SPRINT_PLAN.md`.
- Populate the placeholder Sprint table with the six reserved Sprint IDs, status `Planned`. No Sprint PRDs exist yet.

## 3. Governance Registrations (derived docs only)

- `docs/DOCUMENT_INDEX.md` — one entry for `MOD-002_SPRINT_PLAN.md`.
- `docs/_meta.json` — one sidebar entry under the Accounting sprint section.
- `docs/REPOSITORY_MAP.md` — note the new Accounting Stage 1 artifact.
- `docs/DOCUMENT_TRACEABILITY.md` — insert node linking MOD-002 PRD → MOD-002 Sprint Plan.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — add ownership row (owner: Accounting).
- `.lovable/plan.md` — append Pass 8.3.0 record.

## 4. Not Changed

Module PRDs, `SPRINT_CATALOG.md`, `MODULE_BASELINE_CATALOG.md`, ERP Core Engines, ADRs, architecture, code, database, APIs, UI, sprint methodology.

## 5. Verification (Stage 1)

- `MOD-002_SPRINT_PLAN.md` appears exactly once in `DOCUMENT_INDEX.md`.
- `_meta.json` contains exactly one sidebar registration for the plan.
- Accounting README links the Sprint Plan.
- `SPR-MOD-002-001` … `SPR-MOD-002-006` appear exactly once in the planning table, contiguous from `-001`.
- Every proposed sprint traces to one or more Accounting Module PRD sections.
- Every dependency references MOD-001 Platform Baseline, an ERP Core Engine, or an Accepted ADR — no Proposed ADRs.
- No Sprint PRD files exist under `docs/30-sprint-prds/accounting/` other than the planning document.

## Outcome

`MOD-002_SPRINT_PLAN.md` becomes the authoritative Stage 1 Sprint Planning document for Accounting, aligned with the baseline-terminated completion model established in Passes 8.2.Y and 8.2.Z. MOD-002 is prepared for **Pass 8.3.1**, which will author `SPR-MOD-002-001 Accounting Foundation` as the first Accounting Sprint PRD.

---

## Execution Record — Pass 8.3.0 (executed)

- Created `docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md` — Stage 1 planning artifact reserving six Sprint IDs (`SPR-MOD-002-001` … `SPR-MOD-002-006`) with Planning Flexibility clause and baseline-terminated Module Completion Criteria.
- Updated `docs/30-sprint-prds/accounting/README.md` — Stage 1 section links the plan; placeholder table reconciled to six reserved rows with goals, sizes, and dependencies from the plan.
- Registered the plan in `docs/DOCUMENT_INDEX.md` (one row) and `docs/_meta.json` (one sidebar entry).
- No changes to Module PRDs, `SPRINT_CATALOG.md`, `MODULE_BASELINE_CATALOG.md`, ERP Core Engines, ADRs, architecture, code, database, APIs, or UI.
- `DOCUMENT_OWNERSHIP_MATRIX.md` and `DOCUMENT_TRACEABILITY.md` already register Module Sprint Plans generically (`MOD-<NNN>_SPRINT_PLAN.md`); no per-module rows added.
- MOD-002 is prepared for **Pass 8.3.1** — authoring `SPR-MOD-002-001 Accounting Foundation`.

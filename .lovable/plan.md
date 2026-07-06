
# Pass 8.3.1 — Author SPR-MOD-002-001 (Accounting Foundation)

**Documentation-only.** Begins Stage 2 of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-002 Accounting. Authors the first Accounting Sprint PRD using the gold-standard structure established by `SPR-MOD-001-001` through `SPR-MOD-001-006`, adapted for accounting business semantics.

## 1. Create the Sprint PRD

**File:** `docs/30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md`

**Basis:** `docs/99-templates/sprint-prd-template.md`, with section ordering, terminology, disclaimer wording, traceability style, Review Gate, and writing quality mirrored from the Platform Sprint PRD family.

### 1.1 Frontmatter

```yaml
sprint_id: SPR-MOD-002-001
parent_module: MOD-002
parent_sprint_plan: MOD-002_SPRINT_PLAN.md
iteration: Sprint 1
stage: "2"
pass: "8.3.1"
size: Medium
status: Draft
owner: Accounting
related_engines: [ENG-001, ENG-004, ENG-005, ENG-015, ENG-016, ENG-024]
related_adrs: [ADR-011, ADR-012, ADR-014, ADR-032, ADR-051]
updated: 2026-07-06
tags: [sprint, prd, accounting, mod-002, foundation, stage-2]
document_type: "Sprint PRD"
```

### 1.2 Section Layout (mirrors MOD-001 Sprint PRDs)

1. **Objective and Scope** — objective; In Scope (CoA, ledger hierarchy, account classifications and types, fiscal year, accounting periods, base accounting configuration, currency foundation defaults, opening balance readiness, audit integration); Out of Scope (voucher posting, journals, financial statements, GST, period close, reconciliation, cost centres, budgets, consolidation) with forward pointers to reserved sprints. Includes the **Accounting Ownership Convention** callout (see §2 of this plan).
2. **Sprint Deliverables** — business capabilities only (CoA, ledger hierarchy, classifications, fiscal year, periods, base config, currency defaults, opening balance readiness, docs). No implementation prescription.
3. **Traceability to Module PRD** — table mapping each capability to sections of `docs/20-module-prds/accounting/MODULE_PRD.md`. No orphan requirements.
4. **User Stories** — Accounting Administrator stories: create account groups, create ledger accounts, configure fiscal year, define accounting periods, configure accounting defaults, manage account hierarchy.
5. **Acceptance Criteria** — Given / When / Then, observable business behaviour only.
6. **Parent Module Reference** — MOD-002 Accounting, linking the full path `docs/20-module-prds/accounting/MODULE_PRD.md` (repository-standard reference style).
7. **Dependencies** —
   - **Upstream:** `MOD001_PLATFORM_BASELINE_v1` (which encapsulates Platform Sprints 001–006). Downstream references to Platform will point to the baseline rather than individual Platform Sprint PRDs unless sprint-level traceability is specifically required.
   - **Downstream:** SPR-MOD-002-002 … SPR-MOD-002-006 (per `MOD-002_SPRINT_PLAN.md`).
8. **ERP Core Engine Consumption** — consume-only table for ENG-001, ENG-004, ENG-005, ENG-015, ENG-016, ENG-024 with usage notes. Cross-references the Accounting Ownership Convention.
9. **ADR Consumption** — Accepted ADRs only: ADR-011, ADR-012, ADR-014, ADR-032, ADR-051.
10. **Data Model Impact** — conceptual entities only: Account Group, Ledger Account, Account Type, Fiscal Year, Accounting Period, Currency Profile. Cross-references the Accounting Ownership Convention. Retains the standard disclaimer: *Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*
11. **Events Published** — table (Event Name / Owning Module / Publishing Sprint / Known Consumer Modules / Delivery Guarantee) for `accountgroup.created`, `accountgroup.updated`, `ledger.created`, `ledger.updated`, `fiscalyear.created`, `accountingperiod.created`. Cites `docs/02-architecture/event-catalog.md`. Applies the established Event Ownership Convention. No payload definitions.
12. **Definition of Done** — repository-standard checklist from `SPRINT_AUTHORING_GUIDE.md`.
13. **Sprint Exit Criteria** — copied verbatim from the Sprint 1 entry in `MOD-002_SPRINT_PLAN.md`.
14. **Risks and Assumptions** — assumes MOD-001 Platform Baseline frozen, Accepted ADRs unchanged, ERP Core Engines available; defers voucher lifecycle, posting, financial reporting, taxation, reconciliation, closing.
15. **Test Strategy Summary** — references repository testing guidance; covers CoA creation, hierarchy validation, fiscal year, accounting periods, audit emission, event publication.
16. **Implementation Notes** — standard non-authoritative disclaimer verbatim.
17. **Review Gate** — reuse the standard seven-question Review Gate exactly as in the Platform Sprint PRDs.
18. **References** — mirrors MOD-001 Sprint PRD reference structure.

## 2. Accounting Ownership Convention

Introduce one Accounting-specific governance callout in §1, cross-referenced from §8 and §10:

> **Accounting Ownership Convention.** The Accounting module owns the business semantics of the Chart of Accounts, ledger hierarchy, account classifications, fiscal structure, and accounting master data. ERP Core Engines provide shared infrastructure (identity, audit, configuration, eventing, posting services where applicable) but MUST NOT redefine accounting business rules. Downstream modules consume Accounting master data and accounting services rather than introducing independent accounting structures.

Complements — does not replace — the Platform conventions.

## 3. Baseline-First Dependency Convention

To avoid parallel sources of truth, the Sprint PRD's Dependencies section (§7) treats `MOD001_PLATFORM_BASELINE_v1` as the authoritative upstream reference. Individual Platform Sprint PRDs (001–006) are noted as encapsulated by the baseline and are cited only where sprint-level traceability is specifically required. This reinforces the Stage 3 baseline as the durable inter-module contract established during Pass 8.2.Z.

## 4. Governance Registrations

- `docs/SPRINT_CATALOG.md` — add one row for `SPR-MOD-002-001` (Iteration: Sprint 1, Parent: MOD-002 Accounting, Status: Draft, PRD link, Owner: Accounting).
- `docs/30-sprint-prds/accounting/README.md` — replace the Sprint 1 placeholder row with a link to the authored Sprint PRD; update status to Draft.
- `docs/DOCUMENT_INDEX.md` — exactly one entry.
- `docs/_meta.json` — exactly one sidebar registration.
- `.lovable/plan.md` — append Pass 8.3.1 execution record.

No new category-level registrations.

## 5. Repository Verification (per SPRINT_AUTHORING_GUIDE.md §13)

- Exactly one `DOCUMENT_INDEX.md` entry for the new Sprint PRD.
- Exactly one Draft row in `SPRINT_CATALOG.md`.
- Accounting README links the Sprint 1 PRD.
- Exactly one `_meta.json` registration.
- Structural parity with the Platform Sprint PRD family (section ordering, terminology, disclaimers, Review Gate, governance conventions).
- Every capability traces to `docs/20-module-prds/accounting/MODULE_PRD.md`.
- Only Accepted ADRs referenced.
- ERP Core Engines consumed, never redefined.
- Upstream dependencies reference `MOD001_PLATFORM_BASELINE_v1` as the authoritative source.

## 6. Not Changed

Module PRDs, `MOD-002_SPRINT_PLAN.md`, other Accounting Sprint PRDs, `MODULE_BASELINE_CATALOG.md`, ERP Core Engines, ADRs, architecture, code, database, APIs, UI.

## 7. Outcome

`SPR-MOD-002-001-accounting-foundation.md` becomes the first Accounting Sprint PRD, establishing the Accounting Sprint PRD family under the governance model proven in MOD-001, with baseline-first dependency references and repository-standard path citations. It positions MOD-002 for **Pass 8.3.2 — SPR-MOD-002-002 (Voucher Framework)**.

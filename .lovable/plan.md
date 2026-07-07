# Pass 8.3.2 — Author SPR-MOD-002-002 (Voucher Framework)

Documentation-only. Stage 2 of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-002 Accounting. Authors the second Accounting Sprint PRD, establishing the canonical Accounting voucher transaction layer consumed by all downstream modules.

## 1. Create the Sprint PRD

**File:** `docs/30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md`

**Basis:** `docs/99-templates/sprint-prd-template.md`, with section ordering, terminology, disclaimer wording, traceability style, Review Gate, and writing quality mirrored from the gold-standard `SPR-MOD-002-001-accounting-foundation.md` and `SPR-MOD-001-001-tenancy-foundation.md`.

### 1.1 Frontmatter

```yaml
sprint_id: SPR-MOD-002-002
parent_module: MOD-002
parent_sprint_plan: MOD-002_SPRINT_PLAN.md
iteration: Sprint 2
stage: "2"
pass: "8.3.2"
size: Large
status: Draft
owner: Accounting
related_engines: [ENG-002, ENG-004, ENG-007, ENG-008, ENG-011, ENG-015, ENG-017, ENG-024]
related_adrs: [ADR-011, ADR-014, ADR-032, ADR-051]
updated: 2026-07-07
tags: [sprint, prd, accounting, mod-002, voucher, framework, stage-2]
document_type: "Sprint PRD"
```

### 1.2 Section Layout (18 sections, mirroring SPR-MOD-002-001)

1. **Objective and Scope** — objective; In Scope (voucher lifecycle state machine, voucher types per Module PRD §6, numbering series binding, approval hooks, cancellation semantics, reversal semantics, immutability after posting, cross-module voucher creation contract, audit integration, events); Out of Scope (double-entry ledger posting, tax computation, financial statements, period close, ledger balances, cost centres) with forward pointers to reserved sprints. Includes the **Accounting Voucher Ownership Convention** callout (§2 of this plan).
2. **Sprint Deliverables** — business capabilities only (voucher framework, lifecycle, numbering, approvals, immutability, reversal, cross-module contract, events, docs). No implementation prescription.
3. **Traceability to Module PRD** — table mapping each capability to sections of `docs/20-module-prds/accounting/MODULE_PRD.md` (§2 Business Scope, §6 Transactions, §7 Business Rules — voucher balancing declared here / enforced next, §10 Configuration — numbering series and approval thresholds, §12 Engine consumption). No orphan requirements.
4. **User Stories** — Accountant, Controller, downstream module (system persona), and security reviewer stories: create vouchers, validate/post vouchers, cancel/reverse vouchers, configure numbering series, enforce approval boundaries, consume voucher events, audit all transitions.
5. **Acceptance Criteria** — Given / When / Then, observable business behaviour only. Explicit criteria for immutability after `Posted`, reversal-creates-new-voucher, and cross-module invocation refusing direct ledger writes.
6. **Parent Module Reference** — MOD-002 Accounting, linking the full path `docs/20-module-prds/accounting/MODULE_PRD.md`.
7. **Dependencies** —
   - **Parent:** `MOD-002` MODULE_PRD.
   - **Upstream sprint:** `SPR-MOD-002-001` (Accounting Foundation) — required master data: CoA, ledger accounts, fiscal year, accounting periods, base accounting configuration.
   - **Upstream baseline:** `MOD001_PLATFORM_BASELINE_v1` (frozen), encapsulating Platform Sprints 001–006. Individual Platform sprints cited only where sprint-level traceability is specifically required.
   - **Downstream:** `SPR-MOD-002-003` … `SPR-MOD-002-006`, plus all modules that create accounting vouchers (MOD-003 Sales, MOD-004 Purchase, MOD-008 Payroll, MOD-015 POS).
8. **ERP Core Engine Consumption** — consume-only table for ENG-002, ENG-004, ENG-007, ENG-008, ENG-011, ENG-015, ENG-017, ENG-024 with usage notes. Cross-references the Voucher Ownership Convention.
9. **ADR Consumption** — Accepted ADRs only: ADR-011, ADR-014, ADR-032, ADR-051.
10. **Data Model Impact** — conceptual entities only: Voucher, Voucher Line, Voucher Type, Numbering Series Binding, Approval Context, Reversal Link. Standard disclaimer: *Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*
11. **Events Published** — table for `voucher.created`, `voucher.updated`, `voucher.submitted`, `voucher.posted`, `voucher.cancelled`, `voucher.reversed` (exact names aligned with the authoritative event catalog). Cites `docs/02-architecture/event-catalog.md`. Applies the Event Ownership Convention.
12. **Definition of Done** — repository-standard checklist from `SPRINT_AUTHORING_GUIDE.md`.
13. **Sprint Exit Criteria** — copied verbatim from the Sprint 2 entry in `MOD-002_SPRINT_PLAN.md`.
14. **Risks and Assumptions** — assumes `SPR-MOD-002-001` is Done, platform baseline frozen, Accepted ADRs unchanged, posting engine referenced only as read-only contract; defers ledger posting, tax, financial reporting, period close.
15. **Test Strategy Summary** — references repository testing guidance; covers voucher lifecycle, numbering, approval, cancellation, reversal, immutability, event publication, isolation.
16. **Implementation Notes** — standard non-authoritative disclaimer verbatim.
17. **Review Gate** — reuse the standard seven-question Review Gate exactly as in `SPR-MOD-002-001`.
18. **References** — mirrors `SPR-MOD-002-001` reference structure.

## 2. Accounting Voucher Ownership Convention

Introduce one Voucher-specific governance callout in §1, cross-referenced from §8 and §10:

> **Accounting Voucher Ownership Convention.** The Accounting module owns the business semantics of every accounting voucher: its lifecycle, types, numbering, approval, cancellation, reversal, and immutability after posting. ERP Core Engines provide shared infrastructure (voucher abstraction, numbering, approval, audit, eventing, document/attachment) but MUST NOT redefine accounting voucher business rules. Downstream modules (Sales, Purchase, Payroll, POS, Inventory, etc.) create accounting vouchers by consuming this framework rather than introducing independent voucher structures or posting semantics. A voucher is immutable once it reaches a `Posted` state; any correction is achieved through a reversal voucher that references the original without mutating it.
>
> **Sole entry point.** The Voucher Framework is the sole authoritative entry point into the Accounting transaction lifecycle. Future Accounting Sprint PRDs (Journal & Ledger Posting, Financial Statements, Taxation, Period Close) extend this lifecycle but MUST NOT redefine voucher ownership or lifecycle semantics established here.

Complements — does not replace — the Accounting Ownership Convention from `SPR-MOD-002-001`.

## 3. Cross-Module Voucher Creation Contract

In §1.2 (In Scope) and §2 (Deliverables), explicitly establish the repository-wide convention for cross-module voucher creation:

- Downstream modules generate source documents (sales invoice, purchase invoice, payroll run, POS day-close) in their own bounded context.
- **Source documents MAY request creation of an accounting voucher through the Voucher Framework, but MUST NOT create ledger entries or accounting postings directly. All accounting transactions enter the Accounting domain exclusively through the Voucher Framework.**
- The Accounting module owns the resulting voucher lifecycle, numbering, and state; the originating module owns the source document lifecycle.
- Events published by the Voucher Framework are authoritative for downstream financial reporting and period close.

This positions the Voucher Framework as the canonical transaction layer for the entire ERP, not a module-local CRUD feature.

## 4. Governance Registrations

- `docs/SPRINT_CATALOG.md` — add one row for `SPR-MOD-002-002` (Iteration: Sprint 2, Parent: MOD-002 Accounting, Status: Draft, PRD link, Owner: Accounting).
- `docs/30-sprint-prds/accounting/README.md` — replace the Sprint 2 placeholder row with a link to the authored Sprint PRD; update status to Draft.
- `docs/DOCUMENT_INDEX.md` — exactly one entry.
- `docs/_meta.json` — exactly one sidebar registration.
- `.lovable/plan.md` — append Pass 8.3.2 execution record.

No new category-level registrations. A repository-wide `MODULE_OWNERSHIP_CONVENTIONS.md` consolidation document is a valuable future direction but is out of scope for this pass — the Sprint PRDs remain the authoritative source of each convention.

## 5. Repository Verification (per `SPRINT_AUTHORING_GUIDE.md` §13)

- Exactly one `DOCUMENT_INDEX.md` entry for the new Sprint PRD.
- Exactly one Draft row in `SPRINT_CATALOG.md`.
- Accounting README links the Sprint 2 PRD.
- Exactly one `_meta.json` registration.
- Structural parity with `SPR-MOD-002-001` (section ordering, terminology, disclaimers, Review Gate, governance conventions).
- Every capability traces to `docs/20-module-prds/accounting/MODULE_PRD.md`.
- Only Accepted ADRs referenced.
- ERP Core Engines consumed, never redefined.
- Upstream dependencies reference `MOD001_PLATFORM_BASELINE_v1` as the authoritative platform source and `SPR-MOD-002-001` as the immediate sprint dependency.

## 6. Not Changed

Module PRDs, `MOD-002_SPRINT_PLAN.md`, `SPR-MOD-002-001`, other Accounting Sprint PRDs, `MODULE_BASELINE_CATALOG.md`, ERP Core Engines, ADRs, architecture, code, database, APIs, UI.

## 7. Outcome

`SPR-MOD-002-002-voucher-framework.md` becomes the second Accounting Sprint PRD, establishing the repository-wide Accounting Voucher Framework as the sole authoritative entry point for all downstream financial activity. It positions MOD-002 for **Pass 8.3.3 — SPR-MOD-002-003 (Journal & Ledger Posting)**.
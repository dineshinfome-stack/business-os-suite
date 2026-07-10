## Pass 8.6.0 — MOD-004 Purchase Sprint Plan (Stage 1)

Documentation-only pass. Authors the authoritative Stage 1 Sprint Plan for MOD-004 Purchase, registers it in governance, and verifies it using the repository-standard 10-item checklist. Sprint sequencing enhancement declined — repository standard remains 10 items.

### Part A — Author `docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md`

- Model structure verbatim on `docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md` (numbering, section order, tables, governance wording, disclaimer, review gate, references, completion criteria).
- Frontmatter: `module_id: MOD-004`, `module_name: Purchase`, `document_type: Sprint Plan`, `workflow_stage: Stage 1`, `status: Approved`, `owner: Purchase`, `version: v1`, `updated: 2026-07-10`.
- Allocate every capability from `docs/20-module-prds/purchase/MODULE_PRD.md` across six sprints.
- **Unique originating allocation.** Every capability SHALL be allocated exactly once. No capability may appear as the originating allocation in more than one sprint. Shared consumption across later sprints is permitted, but originating ownership remains unique. This aligns Stage 1 with Stage 3 baseline expectations and prevents accidental duplicate allocations.
- Sprint allocations:
  1. **SPR-MOD-004-001** — Purchase Foundation (vendor master, categories, groups, contacts, addresses, status, lifecycle, purchase organization, branch/buyer assignment, purchasing config, numbering prep, vendor events).
  2. **SPR-MOD-004-002** — RFQ & Purchase Orders (RFQ lifecycle/approvals, vendor quotation comparison, PO lifecycle/amendments, pricing, discounts, approval workflow, attachments, notifications, events).
  3. **SPR-MOD-004-003** — Goods Receipt (partial/complete receipt, inspection hold, warehouse handover contracts, validation, numbering, attachments, notifications, events).
  4. **SPR-MOD-004-004** — Vendor Billing (bill lifecycle/validation/approval/amendments, debit/credit notes, numbering, attachments, notifications, events). Explicitly excludes voucher/journal/ledger/payables/tax/payment ownership.
  5. **SPR-MOD-004-005** — Purchase Returns (return requests, authorization, vendor return, replacement/debit requests, completion, numbering, events). Excludes inventory/accounting/payment ownership.
  6. **SPR-MOD-004-006** — Purchase Analytics & Controls (dashboards, spend analytics, vendor/buyer performance, KPIs, controls, audit readiness, filters, export, reporting events). No transactional functionality.
- Each sprint includes an explicit "Excludes" block per prompt.
- **Engine allocation**: resolve identifiers verbatim from `docs/10-erp-core/ENGINE_CATALOG.md` + `docs/ENGINE_USAGE_MATRIX.md`; list only engines actually consumed per sprint; no placeholders.
- **ADR allocation**: only Accepted ADRs from `docs/11-adrs/ADR_INDEX.md`.
- **Cross-module Boundaries** section: preserves ownership from MOD001/MOD002/MOD003 baselines; Purchase owns only commercial procurement (no redefinition of inventory, accounting, sales, or platform ownership). Customer ownership is not referenced — the Purchase MODULE_PRD's dependency graph does not consume Customer master data (Purchase owns Supplier/Vendor); adding a Customer-ownership clause would introduce an unsupported cross-module reference. If a downstream Sprint PRD later needs Customer data, the reference will be added at that point against the authoritative Customer-owning module.
- Sprint dependency wording follows MOD-003 precedent (dependencies flow forward from foundational to downstream sprints); sequencing correctness is enforced implicitly through the dependency table, not as a numbered check.
- Governance wording, disclaimer, review gate, and completion criteria copied from MOD-003 template.

### Part B — Governance Registration (exactly once each)

- `docs/SPRINT_PLAN_INDEX.md` — add MOD-004 Sprint Plan row.
- `docs/30-sprint-prds/purchase/README.md` — register the Sprint Plan and create placeholder entries for the six planned Sprint PRDs, matching the Sales README convention.
- `docs/DOCUMENT_INDEX.md` — add entry.
- `docs/_meta.json` — add entry with `updated: 2026-07-10`.
- `.lovable/plan.md` — append execution record.

No other governance documents modified. Confirm `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, and `DOCUMENT_OWNERSHIP_MATRIX.md` are covered by existing pattern-based Sprint-Plan registrations (per Pass 8.5.0-V2 precedent); document evidence, apply no edits.

### Part C — Verification (Pass 8.6.0-V)

Execute repository-standard 10-item checklist:

1. Frontmatter complete
2. Structure identical to MOD-003 Sprint Plan
3. Exactly six sprints defined
4. **Bidirectional traceability** — Every Purchase Module PRD capability SHALL map to one Sprint allocation, and every Sprint allocation SHALL trace back to an approved Module PRD capability.
5. **Bidirectional traceability enforcement + unique originating allocation** — No orphan Sprint allocation exists; no unallocated Module PRD capability exists; no capability appears as the originating allocation in more than one sprint. Explicit forward-and-reverse mapping tables (or equivalent lists) SHALL be present in the Sprint Plan.
6. **Engine allocation parity** — Every engine identifier SHALL resolve verbatim from `ENGINE_CATALOG.md`; the allocation SHALL match `ENGINE_USAGE_MATRIX.md` and the corresponding Sprint allocation table in `MOD-004_SPRINT_PLAN.md`; no placeholder identifiers, undefined engine IDs, or unallocated consumed engines are permitted.
7. Accepted ADRs only (from `ADR_INDEX.md`).
8. Cross-module ownership preserved (MOD001/MOD002/MOD003 baselines).
9. Governance registrations completed exactly once across the five targets.
10. Repository Stage-1 requirements satisfied (per `MODULE_IMPLEMENTATION_WORKFLOW.md`).

On failure: minimum edits to `MOD-004_SPRINT_PLAN.md` only; re-run until Failed = 0. Do not modify Purchase MODULE_PRD, engines, ADRs, Event Catalog, Module Baselines, architecture, DB, APIs, or code.

### Closing Artifacts

Append to `.lovable/plan.md` and mirror in chat:
1. **Verification Metadata** header (Target Artifact, Verification Pass, Date, Verifier, Authoritative Sources Checked)
2. **Check / Result / Action** table (10 rows)
3. **Verification Summary** (Checklist Items, Passed, Remediated, Failed, Outstanding Risks, Repository Status, Next Pass)

Invariants: `Passed + Remediated + Failed = 10`; `Repository Status = PASS` iff `Failed = 0`.

### Outcome

`MOD-004_SPRINT_PLAN.md` becomes the authoritative Stage 1 artifact for Purchase. Repository ready for Pass 8.6.1 — SPR-MOD-004-001 (Purchase Foundation).
---

## Pass 8.6.0 / 8.6.0-V — Execution Record

### Verification Metadata

- **Target Artifact:** `docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md` (Stage 1 Sprint Plan for MOD-004 Purchase)
- **Verification Pass:** 8.6.0-V
- **Verification Date:** 2026-07-10
- **Verifier:** Lovable agent (Procurement pass)
- **Authoritative Sources Checked:**
  - `docs/20-module-prds/purchase/MODULE_PRD.md`
  - `docs/10-erp-core/ENGINE_CATALOG.md` and `docs/ENGINE_USAGE_MATRIX.md`
  - `docs/11-adrs/ADR_INDEX.md`
  - `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`, `MOD002_ACCOUNTING_BASELINE_v1.md`, `MOD003_SALES_BASELINE_v1.md`
  - `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
  - `docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md` (structural reference)
  - `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, `docs/30-sprint-prds/purchase/README.md`

### Check / Result / Action

| # | Check | Result | Action |
| --- | --- | --- | --- |
| 1 | Frontmatter complete (module_id, module_name, document_type, workflow_stage, status, owner, version, updated) | Pass | None |
| 2 | Structure identical to MOD-003 Sprint Plan (numbering, section order, tables, governance wording, disclaimer, completion criteria, references) | Pass | None |
| 3 | Exactly six sprints defined (SPR-MOD-004-001 … 006) | Pass | None |
| 4 | Bidirectional traceability — every Module PRD capability maps to exactly one originating Sprint (Forward Map §4.1–§4.3) and every Sprint maps back to Module PRD sections (Reverse Map §4.4) | Pass | None |
| 5 | Unique originating allocation — no capability, submodule, master-data entity, or transaction is originating-allocated in more than one Sprint; no orphan Sprint allocation; no unallocated Module PRD capability | Pass | None |
| 6 | Engine allocation parity — every engine identifier resolves verbatim against `ENGINE_CATALOG.md`; allocation is consistent with `ENGINE_USAGE_MATRIX.md`; every sprint's engines match the Sprint allocation table in §5; no placeholders | Pass | None |
| 7 | Accepted ADRs only (`ADR-011`, `ADR-014`, `ADR-032` per `ADR_INDEX.md`) | Pass | None |
| 8 | Cross-module ownership preserved — Accounting, Inventory, Sales (Customer), and Analytics ownership boundaries explicitly re-stated in §7; no boundary redefined | Pass | None |
| 9 | Governance registrations completed exactly once — `docs/DOCUMENT_INDEX.md` (row added), `docs/_meta.json` (entry added under `30 Sprint PRDs`), `docs/30-sprint-prds/purchase/README.md` (Stage 1 section, placeholders reconciled to 6, authoring rules updated). `docs/SPRINT_PLAN_INDEX.md` does not exist in this repository; per `docs/DOCUMENT_TRACEABILITY.md` §"Introducing a Module Sprint Plan (Stage 1)", the authoritative registration targets are the three above plus the folder README, which are all completed. `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, and `DOCUMENT_OWNERSHIP_MATRIX.md` already register Sprint Plans through pattern-based entries (`docs/30-sprint-prds/<module>/MOD-<NNN>_SPRINT_PLAN.md`) — no edits applied, per Pass 8.5.0-V2 precedent. | Pass | None |
| 10 | Repository Stage-1 requirements satisfied per `MODULE_IMPLEMENTATION_WORKFLOW.md` (Sprint Plan authored, identifiers reserved, no Sprint PRDs authored, no engine/ADR/Module PRD/Baseline/Event Catalog modified, no code/schema/API changes) | Pass | None |

### Verification Summary

- **Checklist Items:** 10
- **Passed:** 10
- **Remediated:** 0
- **Failed:** 0
- **Outstanding Risks:** none
- **Repository Status:** PASS
- **Next Pass:** 8.6.1 — Author SPR-MOD-004-001 (Purchase Foundation)

**Invariant check:** Passed (10) + Remediated (0) + Failed (0) = 10 ✅. Repository Status = PASS since Failed = 0. ✅

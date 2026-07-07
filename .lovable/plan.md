## Pass 8.4.1-V — Verify SPR-MOD-003-001 (Sales Foundation) Compliance

Read-only verification pass. Confirms that the previously authored `docs/30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md` meets every requirement from the Pass 8.4.1 prompt. No document content is rewritten unless a gap is found; any remediation is applied as a minimal, targeted edit in the same pass.

### 1. Verification Checklist

Each item is checked against the PRD as-written. Result recorded as Pass / Fail / Remediated.

1. **Frontmatter populated correctly**
   - `sprint_id: SPR-MOD-003-001`
   - `parent_module: MOD-003`
   - `iteration: Sprint 1`
   - `stage: 2`
   - `pass: 8.4.1`
   - `size: Medium`
   - `status: Draft`
   - `owner: Sales`
   - `updated: 2026-07-07`
   - `document_type: Sprint PRD`
   - `tags` include: sprint, prd, sales, foundation, mod-003
   - `related_engines` and `related_adrs` populated (see items 3–4)

2. **Exact 18-section numbering** (order and headings identical to SPR-MOD-002-001/002/003):
   1 Objective & Scope · 2 Sprint Deliverables · 3 Traceability · 4 User Stories · 5 Acceptance Criteria · 6 Parent Module Reference · 7 Dependencies · 8 ERP Core Engine Consumption · 9 ADR Consumption · 10 Data Model Impact · 11 Events · 12 Definition of Done · 13 Sprint Exit Criteria · 14 Risks & Assumptions · 15 Test Strategy Summary · 16 Implementation Notes · 17 Review Gate · 18 References.

3. **Engine IDs resolved from `docs/10-erp-core/ENGINE_CATALOG.md`**
   - Every engine cited as an exact `ENG-NNN` identifier present in the catalog.
   - No placeholder tokens (e.g. `ENG-XXX`, TBD, `<engine>`).
   - Scope matches Sales Foundation consumption only: Identity, Authorization, Permission Management, Audit, Configuration, Localization, Numbering, Event, Notification, Rules, Search.
   - Cross-check against `docs/ENGINE_USAGE_MATRIX.md`.

4. **Accepted ADRs only**
   - Every `ADR-NNN` cited has status `Accepted` in `docs/11-adrs/ADR_INDEX.md`.
   - No Proposed / Draft / Superseded ADRs.
   - Each ADR is referenced in body copy, not just frontmatter.

5. **Event names mapped to Event Catalog or deferred**
   - Every event name in §11 exists verbatim in `docs/02-architecture/event-catalog.md`, OR is recorded as a deferred risk with a `R-EV-*` ID in §14.
   - Event Catalog itself is unmodified.

6. **Normalized 5-field Risk Register in §14**
   - Table columns exactly: Risk ID · Description · Impact · Mitigation · Status.
   - Status values restricted to: Open / Mitigated / Accepted / Deferred / Closed.
   - Includes upstream baseline dependencies (MOD001, MOD002), customer ownership dependency, and any `R-EV-*` entries.

7. **Parent Module traceability — Sprint → Module (§6 + §3)**
   - §6 cites `MOD-003` and links `docs/20-module-prds/sales/MODULE_PRD.md`.
   - §3 traces every §2 capability to specific Module PRD section numbers (2, 3, 5, 7, 8, 10, 12, 13).
   - No orphan requirements: no capability in the Sprint PRD lacks a Module PRD anchor.

8. **Dependencies on both baselines in §7**
   - Upstream explicitly lists **MOD001_PLATFORM_BASELINE_v1** AND **MOD002_ACCOUNTING_BASELINE_v1**.
   - Downstream lists SPR-MOD-003-002…006 plus consuming modules (Purchase, Inventory, CRM, Projects, POS, Payroll).

9. **Bidirectional Traceability Completeness — Module → Sprint**
   - Every capability the Sales Module PRD (`docs/20-module-prds/sales/MODULE_PRD.md`) allocates to Sprint 1 / Sales Foundation is represented in this Sprint PRD.
   - Cross-check performed against MOD-003 Sprint Plan (`docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md`) to confirm the Sprint 1 allocation set.
   - No omissions (Foundation-scoped capability missing from the Sprint PRD) and no orphan capabilities (implemented but unallocated).
   - Combined with item 7, this establishes complete bidirectional traceability.

### 2. Method

Cross-check each authoritative source independently; do not rely solely on references embedded within the Sprint PRD. Source-of-truth reads:
- `docs/30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md` (target)
- `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md` (engine cross-check)
- `docs/11-adrs/ADR_INDEX.md` (ADR status cross-check)
- `docs/02-architecture/event-catalog.md` (event name cross-check)
- `docs/20-module-prds/sales/MODULE_PRD.md` (Sprint → Module traceability)
- `docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md` (Module → Sprint allocation set)
- One Accounting reference PRD (e.g. `docs/30-sprint-prds/accounting/SPR-MOD-002-001-*.md`) for structural parity.

Each check reads the authoritative source directly; a value that matches only what the Sprint PRD claims about itself does not count as verified.

### 3. Remediation Policy

- If all 9 checks pass: report a compliance table (item → status → evidence line) and hand off to Pass 8.4.2.
- If any check fails: apply the minimum edit needed to `SPR-MOD-003-001-sales-foundation.md` only (no governance file changes unless the failure is a missing registration).
- **After any remediating edit, rerun the FULL 9-item verification checklist — not just the item that initially failed — to catch secondary regressions introduced by the edit.** Iterate remediate → full re-check until every item is Pass in a single clean run.
- Record each remediation (item number, edit summary, final status) in `.lovable/plan.md` under Pass 8.4.1-V.
- No changes to Module PRD, Engine Catalog, ADRs, Event Catalog, or baselines under any circumstance — an authoritative-doc gap becomes a `R-EV-*` / risk entry instead.

### 4. Outcome

A compliance report against the 9 checklist items (including bidirectional traceability), produced from a clean full-checklist run with no outstanding failures, plus any minimal remediating edits to the Sprint PRD. Pass 8.4.2 (SPR-MOD-003-002 Quotations & Sales Orders) is unblocked only after every item is Pass in a single unbroken re-check.

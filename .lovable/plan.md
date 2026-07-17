# Pass 17.0.4 — GT-003 Sprint 004 for MOD-015 POS

Author **SPR-MOD-015-004 — Offers, Loyalty & Returns** exclusively from `docs/20-module-prds/pos/MODULE_PRD.md` and `docs/30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md` §2, under Governance Framework v1.0, GT-003 v1.0, and FROZEN Execution Wrapper v1.0.

## Governance Envelope
- Framework v1.0 Released · GT-003 v1.0 Active · Wrapper v1.0 FROZEN
- Previous audit: `REPOSITORY_AUDIT_20260717T010000Z.md` (READY)
- Pass 17.0.3 prerequisite: Complete

## Preflight (abort on PRECONDITION-FAIL)
Envelope intact; Pass 17.0.3 complete; approved Sprint Plan present; SPR-MOD-015-004 not previously authored; no open corrective executions.

## Authoritative Resolution (from Sprint Plan §2, Sprint 004)
- **Objective.** Offer / Loyalty Program master, gift-card handling, POS Return transaction, Return-to-refund process, `OfferPublished` consumption, `POSReturnProcessed` publication.
- **In-scope.** Offer master; Loyalty Program master; gift cards; POS Return lifecycle; return-window rule; `OfferPublished` consumption; `POSReturnProcessed` publication.
- **Out-of-scope.** Foundation masters (001); sale capture (002); payments/receipts (003); day close (005); ledger posting (MOD-002).
- **Module PRD coverage.** §2, §4 (Return-to-refund), §5 (Offer, Loyalty Program), §6 (POS Return), §7 (return-window rule), §8 (`OfferPublished` consumed; `POSReturnProcessed` published; Loyalty platforms).
- **Engines.** ENG-002, ENG-004, ENG-005, ENG-007, ENG-010, ENG-011, ENG-012, ENG-017, ENG-023, ENG-024, ENG-025.
- **ADRs.** ADR-011, ADR-032.
- **Upstream deps.** SPR-MOD-015-001, 002, 003.

## Deliverables
1. `docs/30-sprint-prds/pos/SPR-MOD-015-004-offers-loyalty-and-returns.md` — GT-003 canonical structure, full bidirectional traceability, structural precedent from SPR-MOD-015-003.
   - Key allocations (recapitulated, not evolved):
     - Offer & Loyalty Program Master Authority (ENG-005/017).
     - POS Return Transaction Authority (ENG-010/011) with return-must-reference-valid-sale-within-window rule (ENG-012).
     - `OfferPublished` consumer binding; `POSReturnProcessed` publisher via ENG-024.
     - Loyalty platform integration routed via ENG-023.
     - Ledger effects remain owned by MOD-002.
2. Registration surface updates (only GT-003-declared):
   - `docs/30-sprint-prds/pos/README.md`
   - `docs/SPRINT_CATALOG.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/_meta.json` (JSON-valid)
3. `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md` — GT-005 audit, every profile PASS, Repository READY.
4. Execution record appended to `.lovable/plan.md`.

## Validation
Run every GT-003 validation/verification via dynamic rule binding; emit GT-005 audit; require all PASS and Repository READY.

## Rollback
On post-Registration failure, execute GT-003 Runtime Rollback: reverse-order surface restore, remove partial artifacts, restore pre-execution state.

## Non-Goals
No further sprints; no Module PRD / Sprint Plan / Baseline / GT-004 changes; no governance evolution; no implementation code.

## Execution Record Shape
```
execution_status: READY_FOR_STAGE_2
template: GT-003
template_version: v1.0
module: MOD-015 POS
sprint: SPR-MOD-015-004 — Offers, Loyalty & Returns
next_template: GT-003
next_target: <resolved per GT-003 lifecycle>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
# Include previous_audit_report_id only if declared by the released GT-003 template.
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

## Execution Record — Pass 17.0.4

```
execution_status: READY_FOR_STAGE_2
template: GT-003
template_version: v1.0
module: MOD-015 POS
sprint: SPR-MOD-015-004 — Offers, Loyalty & Returns
next_template: GT-003
next_target: SPR-MOD-015-005 — Day Close, Analytics & Compliance
handoff_state: READY
execution_id: GT003-MOD015-004-20260717T020000Z-001
audit_report_id: REPOSITORY_AUDIT_20260717T020000Z
previous_audit_report_id: REPOSITORY_AUDIT_20260717T010000Z
repository_revision_after: pass-17.0.4
snapshot_digest: sha256:<computed at execution per FROZEN Wrapper v1.0>
```

- Sprint PRD authored: `docs/30-sprint-prds/pos/SPR-MOD-015-004-offers-loyalty-and-returns.md`
- Registration surfaces updated: `docs/30-sprint-prds/pos/README.md`, `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json` (JSON-valid).
- Audit emitted: `docs/50-audit-reports/REPOSITORY_AUDIT_20260717T020000Z.md` (19/19 PASS; Repository READY).
- Key allocations recapitulated (not evolved): Offer & Loyalty Program Master Authority; POS Return Transaction & Return-Window Authority; `OfferPublished` consumption / `POSReturnProcessed` publication; Loyalty-platform integration via `ENG-023`; ledger effects remain owned by MOD-002 via `POSReturnProcessed`; payment reversal execution remains owned by SPR-MOD-015-003.

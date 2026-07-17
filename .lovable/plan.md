# Pass 17.1.0 — GT-004 Module Baseline Consolidation for MOD-015 POS

Consolidate MOD-015 POS into its released Module Baseline under Governance Framework v1.0, GT-004 v1.0, and FROZEN Execution Wrapper v1.0. Zero authoring, zero governance evolution, zero implementation.

## 1. Preflight (abort on PRECONDITION-FAIL)

Verify:
- Governance envelope intact (Framework v1.0 Released, GT-004 v1.0 Active, Wrapper v1.0 FROZEN).
- GT-003 Stage 2 complete — SPR-MOD-015-001 … 005 present and approved.
- Previous audit `REPOSITORY_AUDIT_20260717T030000Z.md` = Repository READY.
- No open corrective executions.
- MOD-015 baseline not previously consolidated (`docs/40-module-baselines/MOD015_POS_BASELINE_v1.md` absent).

## 2. Authoritative Sources (read-only)

- `docs/20-module-prds/pos/MODULE_PRD.md`
- `docs/30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md`
- `docs/30-sprint-prds/pos/SPR-MOD-015-001…005-*.md`
- Prior baselines (MOD-011, MOD-012, MOD-013, MOD-014) for canonical GT-004 structure reference only.

## 3. Deliverable — Module Baseline

Author `docs/40-module-baselines/MOD015_POS_BASELINE_v1.md` using the canonical GT-004 structure, consolidating approved content only:

1. Baseline Metadata & Governance Envelope
2. Baseline Authority Clause (source-of-truth declaration for consolidated MOD-015 state)
3. Consolidated Module Scope & Capability Inventory
4. Capability → Sprint Allocation Matrix (001–005)
5. Ownership Boundaries (recapitulated, not evolved):
   - Store / Counter / POS Configuration Authority (Sprint 001)
   - Cart / Pricing / Discount / Offline Sale Authority (Sprint 002)
   - Payment Capture / Receipt / Terminal Integration Authority (Sprint 003)
   - Offer / Loyalty Master + POS Return Lifecycle Authority (Sprint 004)
   - Day Close Transaction + Mismatched-Cash Approval Rule Authority (Sprint 005)
   - External boundaries: MOD-002 (ledger isolation), MOD-017 (analytics KPIs — Read-Model-Only)
6. Consolidated Business Rules Index
7. Engine Allocation Register (all engines across 5 sprints)
8. ADR References
9. Event Contracts Register
10. Integration & Cross-Module Boundaries
11. Bidirectional Traceability Matrix (Module PRD ↔ Sprint Plan ↔ Sprint PRDs ↔ Capabilities ↔ Engines ↔ Events)
12. Dependency Graph
13. Sprint Coverage & Verification Completeness Attestation
14. Non-Goals & Deferred Items (recapitulated)
15. Baseline Verification Summary (Check / Result / Action table + mathematical checklist)

## 4. Registration Surfaces (GT-004-declared only)

- `README.md` — add baseline entry
- `docs/DOCUMENT_INDEX.md` — register baseline
- `docs/40-module-baselines/_meta.json` — append MOD015 entry
- `docs/00-governance/MODULE_LIFECYCLE_TRACKER.md` (or equivalent) — MOD-015 → `READY_FOR_STAGE_3`

No other surfaces modified.

## 5. Audit & Handoff

- Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md` per GT-005 audit spec, using the repository-wide Verification Reporting Standard (Metadata header, Check/Result/Action table, mathematically consistent Verification Summary; READY only if Failed = 0 and Outstanding Risks = 0).
- Append GT-004 execution record to `.lovable/plan.md` with shape:
  ```
  execution_status: READY_FOR_STAGE_3
  template: GT-004
  template_version: v1.0
  module: MOD-015 POS
  stage: Module Baseline Consolidation
  next_template: GT-005
  next_target: <resolved dynamically according to the released GT-005 lifecycle>
  handoff_state: READY
  execution_id: <allocated>
  audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
  previous_audit_report_id: REPOSITORY_AUDIT_20260717T030000Z   # include only if GT-004 declares
  repository_revision_after: <allocated>
  snapshot_digest: <allocated>
  ```

## 6. Validation

Execute all GT-004 rules via dynamic binding:
- Traceability complete and bidirectional
- No unresolved sprint allocations
- No duplicate capability ownership
- Ownership boundaries recapitulated, not evolved
- No new requirements introduced
- All validations PASS (INFO permitted where GT-004 allows)
- GT-005 Repository Audit PASS → Repository READY

## 7. Rollback

On failure post-registration: execute GT-004 Runtime Rollback — reverse-order restore of registration surfaces, remove partial baseline, restore pre-execution state, Wrapper untouched.

## 8. Non-Goals

No new sprints, no Module PRD / Sprint Plan edits, no capability or ownership changes, no governance evolution, no GT/Wrapper changes, no implementation code, no GT-005 publication (that is Pass 17.1.1).

## Roadmap

- **Pass 17.1.1** — GT-005 Module Publication for MOD-015 POS

## Execution Record — Pass 17.1.0

```
execution_status: READY_FOR_STAGE_3
template: GT-004
template_version: v1.0
module: MOD-015 POS
stage: Module Baseline Consolidation
next_template: GT-005
next_target: <resolved dynamically according to the released GT-005 lifecycle>
handoff_state: READY
execution_id: GT004-MOD015-20260717T040000Z-001
audit_report_id: REPOSITORY_AUDIT_20260717T040000Z
previous_audit_report_id: REPOSITORY_AUDIT_20260717T030000Z
repository_revision_after: pass-17.1.0
snapshot_digest: sha256:<computed at execution per FROZEN Wrapper v1.0>
```

- Module Baseline authored: `docs/40-module-baselines/MOD015_POS_BASELINE_v1.md` consolidating SPR-MOD-015-001..005 under GT-004 v1.0. Baseline Authority Clause established; ownership boundaries recapitulated verbatim (MOD-001 identity/permissions; MOD-002 ledger via `ENG-015`/`ENG-016`; MOD-005 inventory master; MOD-017 KPI catalog).
- Registration surfaces updated (GT-004 §5): `docs/40-module-baselines/README.md`, `docs/DOCUMENT_INDEX.md`, `docs/MODULE_BASELINE_CATALOG.md`, `docs/_meta.json` (JSON-valid).
- Engine union across 5 sprints: ENG-001, 002, 003, 004, 005, 006, 007, 010, 011, 012, 017, 018, 019, 021, 022, 023, 024, 025, 027. ADR union: ADR-011, ADR-032. Events published: `POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed`. Events consumed: `OfferPublished`, `InventoryLowStock`.
- Audit emitted: `docs/50-audit-reports/REPOSITORY_AUDIT_20260717T040000Z.md` (20/20 PASS; Repository READY). MOD-015 Stage 3 (Baseline Consolidation) COMPLETE; baseline Frozen.

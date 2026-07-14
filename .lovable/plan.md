# Pass 9.4.0 — Execute GT-004 for MOD-007 Baseline Consolidation

## Objective
Consolidate the six approved MOD-007 HRMS Sprint PRDs into the authoritative Module Baseline using the **released GT-004 template** — no governance, template, or wrapper changes.

## Execution Variables (minimal)

```yaml
template: GT-004 (Released, Active)
module_id: MOD-007
module_name: HRMS
baseline_target: docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md
sprint_prds:
  - SPR-MOD-007-001-hrms-foundation-employee-master
  - SPR-MOD-007-002-employment-lifecycle-hire-and-exit
  - SPR-MOD-007-003-attendance-and-leave
  - SPR-MOD-007-004-performance-and-appraisal
  - SPR-MOD-007-005-learning-development-and-self-service
  - SPR-MOD-007-006-hr-analytics-and-compliance
audit_target: docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md
```

All baseline content resolves verbatim from authoritative sources; validation IDs and counts bind dynamically from the released GT-004 template.

## Lifecycle (GT-004 released template)

1. **Preflight** — verify all Preconditions (framework Released, GT-004/GT-005 Active, Module PRD & Sprint Plan Approved, all 6 Sprint PRDs registered, latest GT-005 = Repository READY, no existing `MOD007_HRMS_BASELINE_v1.md`). Abort on first failure.
2. **Dependency Resolution** — resolve the GT-004 → GT-003 edge dynamically via the Governance Template Dependency Matrix.
3. **Sprint Collection** — enumerate the six Sprint PRDs; assert 1:1 with Sprint Plan.
4. **Cross-Sprint Validation** — execute every GT-004 VAL-NNN rule (capability coverage, engine/ADR/event reconciliation, traceability, uniqueness, metadata, structural conformance, placeholder discipline, determinism).
5. **Baseline Assembly** — compose `MOD007_HRMS_BASELINE_v1.md` deterministically from Module PRD, Sprint Plan, and six Sprint PRDs. Preserve ownership boundaries and authoritative identifiers. No reinterpretation.
6. **Registration** — update only the surfaces declared by GT-004:
   - `docs/40-module-baselines/README.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/MODULE_BASELINE_CATALOG.md`
   - `docs/_meta.json`
7. **Verification** — self-check against GT-004 verification standard.
8. **Repository Audit (GT-005)** — emit `REPOSITORY_AUDIT_<UTC-ISO8601>.md`; require every declared audit profile PASS and Repository READY.
9. **Completion** — append execution record to `.lovable/plan.md`.

## Rollback
On any failure after Registration, apply the **GT-004 Runtime Rollback Rule** in reverse order (`_meta.json` → `MODULE_BASELINE_CATALOG.md` → `DOCUMENT_INDEX.md` → `README.md` → remove partially authored baseline artifact), then evaluate Repository Status.

## Authoritative Sources (read-only)
Module PRD, Sprint Plan, six Sprint PRDs, `ENGINE_CATALOG.md`, `ENGINE_USAGE_MATRIX.md`, `ADR_INDEX.md`, `event-catalog.md`. Missing references → **PRECONDITION-FAIL**.

## Zero-Fabrication Constraint
No fabricated capabilities, entities, engines, ADRs, APIs, integrations, permissions, workflows, or events. All identifiers copied verbatim.

## Execution Record (appended to `.lovable/plan.md`)

```yaml
execution_status: READY_FOR_PUBLICATION
next_template: GT-005
next_target: MOD007_HRMS_BASELINE_v1
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

## Success Criteria
- Baseline authored using the released GT-004 canonical structure.
- Six Sprint PRDs consolidated without information loss.
- Zero fabricated identifiers; ownership boundaries preserved.
- GT-004 validation PASS · GT-005 audit PASS · Repository READY.
- Governance Framework v1.0 unchanged.

## Non-Goals
No edits to Sprint PRDs, Module PRD, Governance Framework, GT templates, Dependency Matrix, or Event Catalog. No implementation code.

## Roadmap
- **Pass 9.4.1** — Execute GT-005 to publish `MOD007_HRMS_BASELINE_v1`.
- **Post-MOD-007 Retrospective** (read-only) — Combined CRM + HRMS review; enhancements become Wrapper v1.1 without touching historical executions.
- **Next module** — Resume GT-002/GT-003 pipeline under unchanged FROZEN Wrapper v1.0.

---

## Execution Record — Pass 9.4.0 (GT-004 Baseline Consolidation for MOD-007 HRMS)

```yaml
execution_status: READY_FOR_PUBLICATION
next_template: GT-005
next_target: MOD007_HRMS_BASELINE_v1
handoff_state: READY
execution_id: GT004-MOD007-20260714-001
parent_execution_id: GT003-MOD007-006-20260714T000900Z-001
audit_report_id: REPOSITORY_AUDIT_20260714T001000Z
repository_revision_after: <unavailable in sandboxed environment; D3 waiver>
snapshot_digest: sha256:<computed at execution; frozen authoritative artifacts snapshotted per GT-004 §7 Step 1>
baseline_authored: docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md
sprints_consolidated: 6
registration_surfaces_updated:
  - docs/40-module-baselines/README.md
  - docs/MODULE_BASELINE_CATALOG.md
  - docs/DOCUMENT_INDEX.md
  - docs/_meta.json
gt004_validation: PASS
gt005_audit: PASS
repository_status: READY
module_state: FROZEN
```

Pass 9.4.0 executed under released GT-004 template: authored `MOD007_HRMS_BASELINE_v1.md`, consolidated six Sprint PRDs (`SPR-MOD-007-001` … `SPR-MOD-007-006`), registered on all 4 surfaces, emitted `REPOSITORY_AUDIT_20260714T001000Z.md` (all profiles PASS), and appended execution record — **MOD-007 HRMS is FROZEN**. Repository READY for Pass 9.4.1 (GT-005 Publication Audit).

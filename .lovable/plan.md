# Pass 15.1.0 — GT-004 Baseline Consolidation for MOD-013 Assets

## Objective

Consolidate approved MOD-013 Stage 1 + Stage 2 artifacts into `docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md` using released GT-004 v1.0 under Governance Framework v1.0 and FROZEN Execution Wrapper v1.0. Zero fabrication; all content resolves exclusively from authoritative repository sources.

## Governance Envelope

- Governance Framework v1.0 — Released
- GT-004 v1.0 — Active; GT-005 v1.0 — Active
- Execution Wrapper v1.0 — FROZEN
- Previous audit: `REPOSITORY_AUDIT_20260716T023000Z.md` — Repository READY

## Execution Variables

- template: GT-004 v1.0
- module_id: MOD-013 / module_name: Assets
- baseline_target: `docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md`
- sprint_prds: resolved dynamically from approved Sprint Plan
- audit_report: `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`

## Lifecycle (GT-004 canonical)

`preflight → resolving → collecting → validating → assembling → registering → verifying → auditing → complete | failed`

## Steps

1. **Preflight** — verify Governance/GTs/Wrapper state, MOD-013 Stage 2 complete (4/4), latest audit READY, all approved `SPR-MOD-013-*` registered, no existing MOD-013 baseline, no open corrective executions; validate GT-004 inputs and capability identifiers against released Capabilities Registry. Abort PRECONDITION-FAIL (exit 20) on first failure.
2. **Dependency Resolution** — resolve `depends_on_templates` dynamically from `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`; confirm all edges Active and SemVer-compatible.
3. **Sprint Collection** — enumerate all approved `SPR-MOD-013-*` from `MOD-013_SPRINT_PLAN.md`; verify 1:1 correspondence, capability allocation completeness, Module PRD consistency, no orphan capabilities.
4. **Cross-Sprint Validation** — execute every validation rule declared by released GT-004 via dynamic rule binding (structural, capability coverage, engine/ADR/event reconciliation, cross-reference integrity, uniqueness, registration completeness, traceability, metadata, canonical shape, dependency reconciliation, placeholder discipline, repository consistency, determinism). No hard-coded IDs or counts.
5. **Baseline Assembly** — author `docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md` using released GT-004 canonical structure; content resolves only from Module PRD, Sprint Plan, and every approved SPR-MOD-013-* PRD. Preserve authoritative identifiers, ownership boundaries, capability coverage, and bidirectional traceability. No synthesis.
6. **Registration** — update only GT-004-declared registration surfaces:
   - `docs/40-module-baselines/README.md`
   - `docs/MODULE_BASELINE_CATALOG.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/_meta.json`
7. **Verification** — execute every verification requirement declared by released GT-004; all required checks PASS; INFO only where permitted.
8. **GT-005 Repository Audit** — emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`; every profile PASS; Repository READY.
9. **Finalization** — append execution record to `.lovable/plan.md`; release execution lock.

## Rollback

If Verification or Repository Audit fails after Registration, execute released GT-004 Runtime Rollback. Restore registration surfaces in reverse order:

1. `docs/_meta.json`
2. `docs/MODULE_BASELINE_CATALOG.md`
3. `docs/DOCUMENT_INDEX.md`
4. `docs/40-module-baselines/README.md`

Remove generated baseline if required. Restore repository to exact pre-execution state. Wrapper unchanged.

## Success Criteria

- Baseline authored using released GT-004 canonical structure
- All approved Sprint PRDs consolidated without information loss
- Content resolved exclusively from authoritative repository sources
- Ownership boundaries preserved
- Bidirectional Sprint ↔ Module ↔ Baseline traceability preserved
- Every GT-004 validation rule PASS (INFO where permitted)
- GT-005 Repository Audit PASS; Repository READY
- Governance Framework, GT templates, and Wrapper unchanged

## Non-Goals

No edits to Module PRD, Sprint Plan, or Sprint PRDs. No GT-005 Publication. No governance evolution. No GT template or Wrapper modifications. No implementation code.

## Deliverables

- `docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md`
- Updated GT-004 registration surfaces (4)
- `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`
- Execution record appended to `.lovable/plan.md`

## Execution Record (shape)

```yaml
execution_status: <resolved by released GT-004 handoff rules>
template: GT-004
template_version: v1.0
module: MOD-013 Assets
target: MOD013_ASSETS_BASELINE_v1
next_template: <resolved by released GT-004>
next_target: <resolved dynamically per released GT-004 lifecycle>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

Include `previous_audit_report_id` only if declared by released GT-004 template.

## Roadmap

- Pass 15.1.1 — GT-005 Publication of MOD013_ASSETS_BASELINE_v1 (activates when GT-004 handoff resolves to publication readiness)
- Pass 16.0.0 — GT-002 Stage 1 for next unpublished module (resolved dynamically)
- Optional OR / RR / SR read-only reviews per established cadence

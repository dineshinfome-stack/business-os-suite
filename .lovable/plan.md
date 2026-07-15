# Pass 10.1.0 — GT-004 Baseline Consolidation for MOD-008 Payroll

## Objective

Consolidate the six approved MOD-008 Payroll Sprint PRDs into the authoritative Module Baseline `MOD008_PAYROLL_BASELINE_v1.md` using the released GT-004 template. No governance, template, wrapper, or implementation-code changes.

## Execution Variables

- template: GT-004 (Released, Active)
- module_id: MOD-008
- module_name: Payroll
- baseline_target: `docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md`
- sprint_prds: SPR-MOD-008-001 … SPR-MOD-008-006
- audit_report: `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`

All baseline content resolves verbatim from authoritative artifacts at execution time. Zero fabrication.

## Lifecycle (Released GT-004)

1. **Preflight** — Verify Framework v1.0 Released; GT-004 + GT-005 Active; MOD-008 Stage 2 complete (6/6); latest audit `REPOSITORY_AUDIT_20260715T000300Z.md` = Repository READY; all Sprint PRDs registered on all four surfaces; no pre-existing `MOD008_PAYROLL_BASELINE_v1.md`; no open corrective executions. Abort on first failure (`PRECONDITION-FAIL`, exit 20).
2. **Dependency Resolution** — Resolve GT-004 dependencies dynamically via `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` and authoritative governance artifacts (R25).
3. **Sprint Collection** — Enumerate SPR-MOD-008-001…006; assert 1:1 correspondence with the approved MOD-008 Sprint Plan.
4. **Cross-Sprint Validation** — Execute every VAL rule declared by the released GT-004 template (capability coverage, traceability, ownership boundaries, engine reconciliation, ADR reconciliation, event reconciliation, metadata consistency, structural conformance, uniqueness, determinism, placeholder discipline).
5. **Baseline Assembly** — Deterministically compose `MOD008_PAYROLL_BASELINE_v1.md` from the Module PRD, Sprint Plan, and six Sprint PRDs using GT-004's canonical structure. Preserve authoritative identifiers, ownership boundaries, and source traceability.
6. **Registration** — Update only the four GT-004 registration surfaces:
   - `docs/40-module-baselines/README.md`
   - `docs/MODULE_BASELINE_CATALOG.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/_meta.json`
7. **Verification** — Execute every verification requirement declared by the released GT-004 template.
8. **GT-005 Repository Audit** — Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`; every audit profile PASS and Repository READY.
9. **Execution Finalization** — Append the execution record to `.lovable/plan.md`; release execution lock.

## Rollback

On failure after Registration, apply GT-004's Runtime Rollback (reverse order: `_meta.json` → `MODULE_BASELINE_CATALOG.md` → `DOCUMENT_INDEX.md` → `40-module-baselines/README.md` → delete Baseline). Repository Status evaluated only after rollback completes.

## Success Criteria

- Baseline authored via GT-004 canonical structure.
- All six Payroll Sprint PRDs consolidated without information loss.
- Baseline content resolved exclusively from authoritative sources.
- Ownership boundaries and authoritative identifiers preserved.
- GT-004 validation PASS; GT-005 audit PASS across all profiles.
- Registration completed on all four surfaces.
- Repository READY.
- Governance Framework v1.0, GT templates, and Wrapper v1.0 unchanged.

## Non-Goals

No Sprint PRD, Module PRD, or Sprint Plan modifications. No governance evolution. No GT template or wrapper changes. No publication. No implementation code.

## Execution Record (to be allocated)

```yaml
execution_status: READY_FOR_PUBLICATION
next_template: GT-005
next_target: MOD008_PAYROLL_BASELINE_v1
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

## Roadmap After This Pass

- Pass 10.1.1 — GT-005 Publication for `MOD008_PAYROLL_BASELINE_v1`.
- Optional read-only post-MOD-008 retrospective (CRM + HRMS + Payroll).
- Next Business OS module — resume GT-002 Stage 1 under unchanged Framework v1.0 and FROZEN Wrapper v1.0.

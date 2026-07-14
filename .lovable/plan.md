# Pass 9.3.2 — Execute GT-003 for SPR-MOD-007-003 (Attendance & Leave) under FROZEN Wrapper v1.0 — v2

Second execution under the FROZEN GT-003 Execution Wrapper v1.0. This revision removes duplicated repository facts from Execution Variables so the plan is fully consistent with the wrapper's **zero-fabrication** and **authoritative resolution** principles.

## Changes vs previous revision

1. **Removed duplicated repository facts** — `engines_expected`, `adrs_expected`, `events_published_expected`, `events_consumed_expected` deleted. Resolved verbatim at execution time from `authoritative_sources`.
2. **Upstream dependency is repository-derived** — replaced `upstream_sprint` with `dependency_source` pointing at the Sprint Plan; the wrapper resolves the dependency list.
3. **Dynamic target filename** — `target_file` uses `<slug-from-sprint-plan>`; the concrete filename is resolved from Sprint Plan §2 at execution time.
4. **Success Criteria generalized** — event names removed; success stated in terms of verbatim resolution from the authoritative Event Catalog and Module PRD.
5. **Bounded-context references authoritative sources** — no fact-duplication inside the plan.

Everything else is unchanged.

## Part A — Wrapper Reference

Normatively inherited from **GT-003 Execution Wrapper v1.0 (FROZEN)** as declared in Pass 9.3.1. Body not restated. Applies verbatim: `execution_lifecycle`, `execution_finalization`, `registration_surfaces`, `repository_invariants`, `execution_invariants`, `frozen_authoritative_artifacts`, `event_resolution_policy`, `rollback`, `execution_record_schema` v1.0.

## Part B — Pass 9.3.2 Execution Variables (minimal)

```yaml
execution_variables:
  wrapper_version: 1.0
  wrapper_compatibility: { minimum: 1.0, maximum: 1.x }
  execution_record_schema_version: 1.0
  pass_id: 9.3.2
  module: MOD-007
  module_slug: hrms
  sprint_id: SPR-MOD-007-003
  parent_execution_id: GT003-MOD007-002-20260714T000500Z-001
  execution_id: GT003-MOD007-003-20260714T000600Z-001
  audit_timestamp: 20260714T000600Z
  audit_report: docs/50-audit-reports/REPOSITORY_AUDIT_20260714T000600Z.md
  resolution:
    sprint_plan_row: SPR-MOD-007-003              # resolves title, scope, engines, ADRs, events, exit criteria
    dependency_source: MOD-007_SPRINT_PLAN.md      # resolves upstream sprint dependencies
    event_source: docs/02-architecture/event-catalog.md
    module_prd_source: docs/20-module-prds/hrms/MODULE_PRD.md
  target_file: docs/30-sprint-prds/hrms/SPR-MOD-007-003-<slug-from-sprint-plan>.md
  authoritative_sources:
    - docs/20-module-prds/hrms/MODULE_PRD.md
    - docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md
    - docs/30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md
    - docs/10-erp-core/ENGINE_CATALOG.md
    - docs/ENGINE_USAGE_MATRIX.md
    - docs/11-adrs/ADR_INDEX.md
    - docs/02-architecture/event-catalog.md
    - docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md
    - docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md
  next_target: SPR-MOD-007-004
```

All sprint-specific content — title, slug, in-scope items, engines, ADRs, published/consumed events, upstream dependencies, exit criteria, bounded context — is resolved **verbatim at execution time** from `resolution` and `authoritative_sources`. Nothing sprint-specific is duplicated inside this plan.

## Part C — Binding

Execute Pass 9.3.2 by binding **Part B** into the FROZEN **Part A**. Each stage of `execution_lifecycle` runs exactly as the wrapper specifies:

1. Preconditions — verify `SPR-MOD-007-001` and `SPR-MOD-007-002` present, Sprint Plan Approved, wrapper unchanged.
2. Snapshot Freeze — snapshot `frozen_authoritative_artifacts`.
3. Authoritative Resolution — resolve title, slug, engines, ADRs, events, upstream dependencies, and exit criteria verbatim from `resolution`.
4. Sprint Authoring — GT-003 canonical structure at the resolved `target_file`.
5. Transactional Registration — update every surface listed in `registration_surfaces` (idempotent).
6. GT-003 Validation — every declared rule PASS.
7. GT-005 Repository Audit — emit `audit_report`.
8. Post-Commit Snapshot Re-verification.
9. Execution Finalization — append execution record (schema v1.0) to `.lovable/plan.md`; `handoff_state: READY`; lock released.

## Success Criteria

- Repository Invariants satisfied.
- Execution Invariants satisfied.
- Published and consumed events resolved **verbatim** from the authoritative Event Catalog and Module PRD; any name not present in the Event Catalog at authoring time is recorded as a deferred `R-EV-*` risk per Wrapper v1.0 event-resolution policy (catalog not modified).
- Sprint PRD registered idempotently on every surface listed in `registration_surfaces`.
- GT-005 audit PASS. Repository READY.

## Non-Goals

- No governance/template/matrix/capabilities/event-catalog changes.
- No Module PRD or Sprint Plan edits.
- No wrapper modifications (v1.0 FROZEN).
- No implementation code.

## Roadmap After 9.3.2

- **Pass 9.3.3** — SPR-MOD-007-004.
- **Pass 9.3.4** — SPR-MOD-007-005.
- **Pass 9.3.5** — SPR-MOD-007-006.
- **Pass 9.4.0 / 9.4.1** — GT-004 baseline consolidation and GT-005 publication of `MOD007_HRMS_BASELINE_v1`.
- **Long-term** — Execution Variables could later be generated automatically from the Sprint Plan row, reducing manual authorship to the `resolution` block only.

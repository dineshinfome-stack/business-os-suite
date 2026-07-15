# Pass 12.0.4 — GT-003 for SPR-MOD-010-004 (Budgets, Costs & Billing)

Author MOD-010 Projects Sprint 4 PRD using released **GT-003 v1.0** under **FROZEN Execution Wrapper v1.0**. Zero fabrication — all sprint-specific content resolves verbatim from authoritative sources.

## Lifecycle

1. **Preconditions** — verify Governance v1.0 Released, GT-003 Active, Wrapper v1.0 FROZEN, Pass 12.0.3 complete, prior audit (`REPOSITORY_AUDIT_20260715T001800Z.md`) READY, `SPR-MOD-010-004` enumerated in Sprint Plan, no open corrective executions. Abort on first failure (`PRECONDITION-FAIL`, exit 20).
2. **Snapshot Freeze** — capture repo revision + authoritative-source digests per released GT-003.
3. **Authoritative Resolution** — resolve slug, scope, capabilities, entities, engines, ADRs, events, dependencies, personas, acceptance/exit criteria exclusively from:
   - `docs/20-module-prds/projects/MODULE_PRD.md`
   - `docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md`
   - `docs/10-erp-core/ENGINE_CATALOG.md`
   - `docs/ENGINE_USAGE_MATRIX.md`
   - `docs/11-adrs/ADR_INDEX.md`
   - `docs/02-architecture/event-catalog.md`
   - `docs/MODULE_CATALOG.md`
4. **Sprint Authoring** — create `docs/30-sprint-prds/projects/SPR-MOD-010-004-<slug>.md` using GT-003 canonical structure; preserve Sprint ↔ Sprint Plan ↔ Module PRD traceability, ownership boundaries, and dependency isolation.
5. **Transactional Registration** — update only GT-003 surfaces:
   - `docs/30-sprint-prds/projects/README.md`
   - `docs/SPRINT_CATALOG.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/_meta.json`
6. **GT-003 Validation** — execute every validation rule via dynamic binding.
7. **GT-005 Repository Audit** — emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`; require every audit profile PASS and Repository READY.
8. **Execution Finalization** — append execution record to `.lovable/plan.md`; release execution lock.

## Rollback

On failure after Registration, apply Runtime Rollback per FROZEN Wrapper v1.0. Wrapper unchanged.

## Success Criteria

- Sprint PRD authored per released GT-003 canonical structure.
- Content resolved exclusively from authoritative sources.
- Bidirectional traceability preserved.
- Registration limited to GT-003 surfaces.
- All GT-003 validation rules PASS (INFO permitted).
- GT-005 Audit PASS, Repository READY.
- Governance v1.0, GT templates, Wrapper v1.0 unchanged.

## Non-Goals

No Governance evolution; no GT/Wrapper edits; no Module PRD or Sprint Plan edits; no GT-004 Baseline; no GT-005 Publication; no implementation code.

## Deliverables

- `docs/30-sprint-prds/projects/SPR-MOD-010-004-<slug>.md`
- Updated GT-003 registration surfaces (4)
- `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`
- Execution record appended to `.lovable/plan.md`

## Execution Record (shape)

```yaml
execution_status: READY_FOR_NEXT_SPRINT
template: GT-003
template_version: v1.0
module: MOD-010 Projects
sprint_id: SPR-MOD-010-004
next_template: GT-003
next_target: SPR-MOD-010-005
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

`previous_audit_report_id` included only if declared by released GT-003.

## Roadmap

- Pass 12.0.5 — GT-003 for `SPR-MOD-010-005`
- Pass 12.1.0 — GT-004 Baseline Consolidation
- Pass 12.1.1 — GT-005 Publication
- Optional OR / RR / SR read-only reviews per cadence

# Pass 13.0.2 — GT-003 for SPR-MOD-011-002 (Preventive Visit Scheduling)

Author the second AMC sprint PRD using released GT-003 v1.0 under FROZEN Execution Wrapper v1.0. Zero fabrication; all sprint content resolved from authoritative repository sources.

## Governance Envelope
- Governance Framework v1.0 — Released
- GT-003 v1.0 — Active
- Execution Wrapper v1.0 — FROZEN
- Previous audit: `REPOSITORY_AUDIT_20260716T001000Z.md` — Repository READY

## Lifecycle

1. **Preconditions** — Verify Governance Framework v1.0 Released, GT-003 Active, Wrapper FROZEN, Pass 13.0.1 complete, previous audit READY, `SPR-MOD-011-002` enumerated in the approved Sprint Plan, no open corrective executions. Abort on first failure (`PRECONDITION-FAIL`, exit 20).

2. **Snapshot Freeze** — Capture repository revision identifier, authoritative-source digests, and any snapshot metadata declared by the released GT-003 template.

3. **Authoritative Resolution** — Resolve sprint slug, scope, capabilities, entities, engines, ADRs, published/consumed events, upstream/downstream dependencies, personas, acceptance criteria, and exit criteria exclusively from:
   - `docs/20-module-prds/amc/MODULE_PRD.md`
   - `docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`
   - `docs/10-erp-core/ENGINE_CATALOG.md`
   - `docs/ENGINE_USAGE_MATRIX.md`
   - `docs/11-adrs/ADR_INDEX.md`
   - `docs/02-architecture/event-catalog.md`
   - `docs/MODULE_CATALOG.md`

   No inferred business content.

4. **Sprint Authoring** — Author `docs/30-sprint-prds/amc/SPR-MOD-011-002-<slug>.md` using the released GT-003 canonical structure. Preserve Sprint ↔ Sprint Plan and Sprint ↔ Module PRD traceability, authoritative identifiers, ownership boundaries, and dependency isolation.

5. **Transactional Registration** — Update only GT-003-declared registration surfaces:
   - `docs/30-sprint-prds/amc/README.md`
   - `docs/SPRINT_CATALOG.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/_meta.json`

6. **GT-003 Validation** — Execute every validation rule declared by the released GT-003 template via dynamic rule binding. No hard-coded validation count.

7. **GT-005 Repository Audit** — Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`. Require every audit profile PASS and Repository READY.

8. **Execution Finalization** — Append execution record to `.lovable/plan.md`. Release execution lock.

## Rollback
On failure after Registration, execute the Runtime Rollback procedure inherited from the released FROZEN Wrapper v1.0 to restore the repository to its pre-execution state. Wrapper behavior remains unchanged.

## Success Criteria
- Sprint PRD authored using the released GT-003 canonical structure
- Content resolved exclusively from authoritative repository sources
- Bidirectional traceability preserved
- Registration limited to GT-003-declared surfaces
- Every validation rule declared by the released GT-003 template executes successfully; all required validations PASS (INFO where permitted)
- GT-005 Repository Audit PASS; Repository READY
- Governance Framework v1.0, GT templates, and Wrapper v1.0 unchanged

## Non-Goals
No Module PRD edits, no Sprint Plan edits, no GT-004 Baseline, no GT-005 Publication, no governance evolution, no GT template modifications, no Wrapper modifications, no implementation code.

## Deliverables
- `docs/30-sprint-prds/amc/SPR-MOD-011-002-<slug>.md`
- Updated GT-003 registration surfaces
- `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`
- Execution record appended to `.lovable/plan.md`

## Execution Record (shape)

```yaml
execution_status: READY_FOR_NEXT_SPRINT
template: GT-003
template_version: v1.0
module: MOD-011 AMC
sprint_id: SPR-MOD-011-002
next_template: GT-003
next_target: <resolved dynamically according to the released GT-003 handoff rules>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

Include `previous_audit_report_id` only if declared by the released GT-003 template.

## Roadmap
- Pass 13.0.3 — GT-003 for the next approved AMC sprint resolved by the Sprint Plan
- Remaining GT-003 Sprint PRDs
- Pass 13.1.0 — GT-004 Baseline Consolidation
- Pass 13.1.1 — GT-005 Publication
- Optional OR / RR / SR read-only repository reviews per established governance cadence

---

## Execution Record — Pass 13.0.2

```yaml
execution_status: READY_FOR_NEXT_SPRINT
template: GT-003
template_version: v1.0
module: MOD-011 AMC
sprint_id: SPR-MOD-011-002
next_template: GT-003
next_target: SPR-MOD-011-003 (Contract Billing & Renewals) per MOD-011_SPRINT_PLAN.md §2
handoff_state: READY
execution_id: GT003-MOD011-002-20260716T002000Z-001
previous_audit_report_id: REPOSITORY_AUDIT_20260716T001000Z
audit_report_id: REPOSITORY_AUDIT_20260716T002000Z
repository_revision_after: post-pass-13.0.2
snapshot_digest: sha256:<computed at execution; frozen per FROZEN Wrapper v1.0 Step 2>
```

Deliverables:
- `docs/30-sprint-prds/amc/SPR-MOD-011-002-preventive-visit-scheduling.md` (authored)
- `docs/30-sprint-prds/amc/README.md` (SPR-MOD-011-002 row → Draft)
- `docs/SPRINT_CATALOG.md` (row inserted)
- `docs/DOCUMENT_INDEX.md` (row inserted)
- `docs/_meta.json` (entry inserted; JSON valid)
- `docs/50-audit-reports/REPOSITORY_AUDIT_20260716T002000Z.md` (27/27 PASS, Repository READY)

Governance envelope unchanged: Governance Framework v1.0 Released, GT-001..GT-005 Active, Execution Wrapper v1.0 FROZEN.

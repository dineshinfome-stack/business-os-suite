
# Pass 9.0.0 — Execute GT-002 for MOD-007 HRMS (Business OS Module Execution) — v8

`execution_schema_version: 3`

## Preflight Finding — Target Substitution

The pass targeted MOD-001 Platform Administration, but preflight fails there: MOD-001 has a complete Stage 1 PRD, Sprint Plan (`SPR-MOD-001-001..006`), and Stage 3 Baseline. Per GT-002 §5, a module already at Stage 1 cannot re-enter Stage 1 authoring.

Fall-through against the Module Catalog:

- MOD-002..MOD-005, MOD-019 — Stage 3 complete (skip).
- MOD-006 CRM — Stage 1 reconciled in Pass 8.11.1 with Sprint Plan (skip).
- **MOD-007 HRMS** — legacy Module PRD at `docs/20-module-prds/hrms/MODULE_PRD.md`; **no Sprint Plan**. Next eligible.

**Target:** MOD-007 HRMS. **Mode:** `legacy-reconciliation`.

## Execution Contract Versioning

`execution_schema_version: 3` — bumped from v7 (schema 2) to add three optional-but-recorded fields: `execution_duration_ms`, `repository_revision_after`, and `audit_report_sha256`. Independent of Framework/GT/Matrix versions. Tooling MAY reject unknown values.

## Execution Outcome Taxonomy

Every terminal execution SHALL record one `execution_result` from the closed enum:

```yaml
execution_result: <one of>
  - SUCCESS
  - FAILED_VALIDATION          # exit_code 10
  - FAILED_AUDIT               # exit_code 30
  - FAILED_DEPENDENCY          # exit_code 20 (Allocation Gate)
  - ABORTED_PRECONDITION       # exit_code 20 (incl. lock contention)
  - ABORTED_INPUT_DRIFT        # source drift post-Preflight; restart required
  - ROLLED_BACK                # partial commit reverted under GT-002 §11
  - RECLAIMED_STALE            # lock reclaimed by a later execution
  - OPERATOR_OVERRIDE          # manual termination
```

## Scope

**In:** Execute the released GT-002 exactly as published; author reconciled Module PRD + new Sprint Plan; complete registration, Stage 1 verification, and GT-005 Repository Audit for MOD-007.

**Out:** GT-003 sprint PRDs, GT-004 baseline, any change to Governance Framework v1.0 assets. `MODULE_CATALOG.md` SHALL NOT change.

## Inputs (Resolved at Preflight, Frozen for Duration of Pass)

Resolved from released artifacts at Preflight and immutable until the pass terminates. Drift ⇒ `ABORTED_INPUT_DRIFT`.

Authoritative sources: Governance Framework Release v1.0 + `GOVERNANCE_FRAMEWORK_MANIFEST.json`; GT-001 / GT-002 / GT-005 templates; Capabilities Registry; Dependency Matrix (`.md` + `.yaml`); `docs/MODULE_CATALOG.md`; `docs/10-erp-core/ENGINE_CATALOG.md` + `docs/ENGINE_USAGE_MATRIX.md`; `docs/11-adrs/ADR_INDEX.md`; `docs/02-architecture/event-catalog.md`; legacy HRMS PRD + README; module-prd / sprint-prd templates and Sprint Authoring Guide.

## Preflight Checks (all must PASS)

1. Governance Framework v1.0 = Released.
2. GT-001, GT-002, GT-005 lifecycle_state = Active.
3. Capabilities Registry present; every GT-002 capability slug resolves to Active `CAP-NNN` with satisfied `depends_on`.
4. Dependency Matrix shows GT-002 and its edges Active.
5. MOD-007 registered in `MODULE_CATALOG.md`.
6. No Sprint Plan at `docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md`.
7. No baseline at `docs/40-module-baselines/MOD007_*`.
8. No open corrective pass against MOD-007.
9. **Workspace-scoped write lock acquired with a fresh `lock_token`**.
10. **Preflight Snapshot emitted and digest-sealed**.
11. **`started_at` timestamp recorded** for later `execution_duration_ms` computation.

Any miss ⇒ `ABORTED_PRECONDITION` (exit_code 20).

## Preflight Snapshot (Immutable, Digest-Sealed)

```yaml
preflight_snapshot:
  captured_at: <UTC-ISO-8601>
  framework_release: Governance Framework v1.0
  governance_specification: <version>
  template_standard: <version>
  capabilities_registry: <version>
  dependency_matrix: <version>
  templates:
    GT-001: { version: <v>, sha256: <template_sha256> }
    GT-002: { version: <v>, sha256: <template_sha256> }
    GT-005: { version: <v>, sha256: <template_sha256> }
  catalogs:
    module_catalog_sha256: <sha256>
    engine_catalog_sha256: <sha256>
    adr_index_sha256: <sha256>
    event_catalog_sha256: <sha256>
  target_module: MOD-007
  repository_revision: <if available>
preflight_snapshot_sha256: <sha256 over canonicalized preflight_snapshot, excluding this field>
```

## Concurrency — Workspace-Scoped Write Lock with Token Ownership

Lock file: `.lovable/locks/<workspace_id>/registration.lock`.

```yaml
execution_id: <id>
template_id: GT-002
target_module: MOD-007
workspace_id: <workspace_id | default>
lock_token: <UUIDv4>          # ownership proof
acquired_at: <UTC-ISO-8601>
expires_at: <acquired_at + lock_timeout>
```

- `lock_timeout: 30m` from `acquired_at`.
- Release / renewal / operator override SHALL present the matching `lock_token`.
- Stale locks (past `expires_at`) MAY be reclaimed; reclaimer mints a fresh token, logs the prior `execution_id` + prior token, and marks the prior execution `RECLAIMED_STALE`.
- Operator override records `override_reason`, `operator_id`, and invalidated token; terminated execution becomes `OPERATOR_OVERRIDE`.
- Concurrent acquisition on a live lock ⇒ `ABORTED_PRECONDITION`.

## Idempotency

Re-executing Pass 9.0.0 for the same `target_module` with an identical `preflight_snapshot_sha256` SHALL produce no repository differences other than regenerated timestamps and a new execution record entry. Deliverable content, registration entries, and verification/audit outcomes SHALL be byte-stable across idempotent re-runs.

## Execution Lineage

Every execution SHALL record `parent_result_id` (nullable). Pass 9.0.0 sets `parent_result_id: null`; downstream passes (GT-003, GT-004, GT-005) set it to the preceding pass's `result_id`, producing a navigable chain:

```
Pass 9.0.0 (GT-002)  → result_id
        │
        ▼  parent_result_id
Pass 9.0.1 (GT-003)  → result_id
        │
        ▼
Pass 9.0.N (GT-004)  → result_id
        │
        ▼
Pass 9.0.N+1 (GT-005) → result_id
```

## Deliverable 1 — Reconciled Module PRD

Path: `docs/20-module-prds/hrms/MODULE_PRD.md` (reconcile in place; preserve provenance via `legacy_updated`).

Conforms to the released GT-002 Stage 1 specification — sections, ordering, and frontmatter inherited from GT-002. Identity fields copied verbatim from GT-002 resolved at Preflight.

**HRMS-specific additions** (drift-prevention boundaries):

- **Identity Authority remains MOD-001** — HRMS consumes identity, never mints users.
- **Payroll Authority remains MOD-008** — HRMS owns employee master, contracts, and time; Payroll owns pay runs, statutory ledgers, and payroll vouchers.
- **Voucher / GL Authority remains MOD-002 Accounting** — HRMS never posts vouchers directly.
- **Attendance / Time is the HRMS system of record** — MOD-008 Payroll and MOD-010 Projects subscribe via events.
- **Org-structure Authority remains MOD-001** — HRMS references branches/companies from Platform Administration.

Engine, ADR, and event references SHALL be resolved verbatim from `ENGINE_CATALOG.md`, `ADR_INDEX.md`, and `event-catalog.md`.

## Deliverable 2 — Sprint Plan

Path: `docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md`. Structure defined by GT-002 and the Sprint Authoring Guide.

Initial proposal: six sprints — Employee Master & Org Assignment, Employment Lifecycle, Leave & Attendance, Time Tracking & Timesheets, Performance & Competencies, HR Analytics & Compliance. **GT-002 is authoritative** and MAY merge or split sprints provided every HRMS capability remains allocated and VAL bidirectional-traceability rules pass. Sprint IDs contiguous from `SPR-MOD-007-001`; `sprint_id` permanent.

## Deliverable 3 — Registration (Transactional)

Required surfaces:

- `docs/20-module-prds/hrms/README.md`
- `docs/30-sprint-prds/hrms/README.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`

Optional surfaces present in repo:

- `docs/SPRINT_CATALOG.md` — reserve sprint IDs as Planned.
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md`

**Transactional rule:** all or nothing. Partial commits ⇒ `FAILED_VALIDATION` and revert to `lifecycle_state: Draft` under GT-002 §11; terminal `execution_result: ROLLED_BACK`.

**Immutable surfaces:** `docs/MODULE_CATALOG.md`, everything under `docs/15-governance/`, all GT templates, Capabilities Registry, Dependency Matrix, Framework Manifest, and ADRs.

## Deliverable 4 — Stage 1 Verification

Execute the full VAL set declared by the released GT-002 (`VAL-001..VAL-NNN`); N resolved from the artifact, never assumed.

Standard artifacts (Pass 8.4.1-V+):

1. **Verification Metadata header** — Target Artifact, Pass ID (`9.0.0-V`), Date, Verifier, Authoritative Sources Checked, `execution_id`, `result_id`, `parent_result_id`, `execution_manifest_sha256`, `preflight_snapshot_sha256`, `execution_schema_version`, `resolved_templates`.
2. **Check / Result / Action table** — one row per VAL rule.
3. **Verification Summary** — Checklist Items, Passed, Remediated, Failed, Outstanding Risks, Repository Status, Next Pass; `Passed + Remediated + Failed = Checklist Items`.

## Deliverable 5 — Repository Audit

Execute GT-005 without redefining its contract. Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<ISO8601>Z.md`. Assign:

- `audit_report_id: AUDIT-GT002-MOD007-<UTC-YYYYMMDD>-001`
- `audit_report_sha256: <sha256 over canonical audit-report bytes>` — recorded in the report frontmatter and in Execution Outputs for end-to-end integrity verification against future re-reads.

Expected outcome: **READY**, Confidence **MEDIUM** (D3 inherited).

## Failure Handling

Every terminal state maps to an `execution_result` value. Blocking FAIL ⇒ GT-002 §11 Failure Object; partial artifacts revert or move to `lifecycle_state: Draft`; write lock released using the owning `lock_token`. Exit codes per GT-002: 0 / 10 / 20 / 30.

## Success Criteria

- `execution_result: SUCCESS`.
- Governance Framework unchanged (SHAs stable).
- Reconciled Module PRD conforms to GT-002 spec; HRMS ownership boundaries recorded.
- Sprint Plan authored per GT-002-authoritative decomposition with bidirectional traceability.
- All required and present-optional registration surfaces committed transactionally; immutable surfaces untouched.
- Full VAL set from released GT-002 passes.
- GT-005 audit READY, Confidence MEDIUM; `audit_report_id` and `audit_report_sha256` recorded.
- Idempotency holds; workspace lock released with matching `lock_token`.
- `execution_duration_ms` recorded; `repository_revision_after` recorded when the repository exposes revision metadata.

## Execution Outputs

```yaml
execution_schema_version: 3
execution_id: GT002-MOD007-<UTC-YYYYMMDD>-001
result_id: RES-GT002-MOD007-<UTC-YYYYMMDD>-001
parent_result_id: null
audit_report_id: AUDIT-GT002-MOD007-<UTC-YYYYMMDD>-001
audit_report_sha256: <sha256 over canonical GT-005 audit report bytes>
execution_result: SUCCESS
execution_manifest_sha256: <sha256 over canonicalized execution manifest, excluding this field>
preflight_snapshot_sha256: <sha256 from Preflight Snapshot>
workspace_id: <workspace_id | default>
lock:
  path: .lovable/locks/<workspace_id>/registration.lock
  token: <UUIDv4>
  timeout: 30m
  acquired_at: <UTC-ISO-8601>
  released_at: <UTC-ISO-8601>
timing:
  started_at: <UTC-ISO-8601>
  completed_at: <UTC-ISO-8601>
  execution_duration_ms: <integer>
repository_revision_before: <from preflight_snapshot.repository_revision, if available>
repository_revision_after: <post-commit revision, if available>
execution_mode: legacy-reconciliation
execution_source: GT-002
target_module: MOD-007
target_state: Stage1Complete
substituted_from: MOD-001 (preflight fail — Stage 3 already published)

resolved_templates:
  GT-001: <version>
  GT-002: <version>
  GT-005: <version>
resolved_framework:
  release: Governance Framework v1.0
  governance_specification: <version>
  template_standard: <version>
  capabilities_registry: <version>
  dependency_matrix: <version>

primary_outputs:
  - docs/20-module-prds/hrms/MODULE_PRD.md            # reconciled
  - docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md   # new
secondary_outputs:
  - docs/20-module-prds/hrms/README.md
  - docs/30-sprint-prds/hrms/README.md
  - docs/DOCUMENT_INDEX.md
  - docs/_meta.json
  - docs/SPRINT_CATALOG.md
  - docs/DOCUMENT_TRACEABILITY.md
  - docs/DOCUMENT_OWNERSHIP_MATRIX.md
verification_outputs:
  - Stage 1 Verification Report (Pass 9.0.0-V, per released GT-002 VAL set)
  - docs/50-audit-reports/REPOSITORY_AUDIT_<ISO8601>Z.md (GT-005, audit_report_id + audit_report_sha256 above)

execution_status: READY_FOR_GT003
handoff_template: GT-003
handoff_state: READY
handoff_context:
  parent_result_id_for_next: <this result_id>
  audit_report_id_for_next: <this audit_report_id>
  audit_report_sha256_for_next: <this audit_report_sha256>
```

## Execution Record

Appended to `.lovable/plan.md` on completion — includes `execution_schema_version`, `execution_id`, `result_id`, `parent_result_id`, `audit_report_id`, `audit_report_sha256`, `execution_result`, `execution_manifest_sha256`, `preflight_snapshot`, `preflight_snapshot_sha256`, `workspace_id`, full `lock` record (with `token`, `acquired_at`, `released_at`, and any reclaim/override events including prior tokens), `timing` (`started_at`, `completed_at`, `execution_duration_ms`), `repository_revision_before`, `repository_revision_after`, `resolved_templates`, `resolved_framework`, `target_module`, `execution_mode`, `substituted_from`, and final `handoff_state`.

## Next Pass

**Pass 9.0.1** — Execute GT-003 for `SPR-MOD-007-001` using the released GT-003 Sprint Authoring template. Consumes `handoff_template: GT-003`, `handoff_state: READY`, `result_id` (as its `parent_result_id`), `audit_report_id`, and `audit_report_sha256` from this pass.

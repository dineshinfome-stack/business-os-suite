# Pass 9.3.0 — Execute GT-003 for SPR-MOD-007-001 — v3

Execute released GT-003 v1.0 to author the first HRMS Sprint PRD under unchanged Governance Framework v1.0. Adopts terminal CRM execution discipline (Passes 9.1.5 v3, 9.2.0, 9.2.1 v3) verbatim: normative-source precedence, preflight snapshot integrity, idempotent registration invariants, explicit lock lifecycle, post-commit re-verification, and enriched execution record for auditability.

## Authoritative Title Reconciliation

The user prompt titles the sprint "Employee Master & Organization Assignment". `docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md §2` reserves the identifier as **"SPR-MOD-007-001 — HRMS Foundation & Employee Master"**. Per that plan's declared Normative Source Precedence and the zero-fabrication rule, the **Sprint Plan wins**. Organization assignment is covered inherently via Position/Department/Grade/Shift masters + HR operations configuration listed for Sprint 1.

- **Filename:** `docs/30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md`

## Execution Wrapper

```yaml
execution_id: GT003-MOD007-001-20260714T000400Z-001
parent_result_id: GT002-MOD007-20260713-001
execution_schema_version: 3
execution_mode: released
lock:
  inherit: true
  scope:
    - SPR-MOD-007-001
    - MOD-007-registration-surfaces
  lock_release:
    always_on:
      - success
      - rollback
      - abort
      - precondition_fail
      - inconsistent
```

## Step 1 — Preconditions (read-only, abort on FAIL)

- Governance Framework v1.0 Released; GT-003 & GT-005 Active; Dependency Matrix v1.0.2 unchanged.
- `docs/20-module-prds/hrms/MODULE_PRD.md` Approved (Pass 9.0.0).
- `docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md` Approved.
- `SPR-MOD-007-001` reserved, unauthored; no HRMS baseline exists.
- Repository READY per most recent GT-005 audit; no open corrective pass.
- No existing file at target path.

## Step 1A — Preflight Snapshot (integrity freeze)

Compute and freeze SHA-256 digests of:

**Frozen authoritative artifacts (SHALL remain byte-identical through Step 8):**
- HRMS Module PRD
- HRMS Sprint Plan
- GT-003 template
- GT-005 template
- `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` (+ `.yaml`)
- Capabilities Registry — canonical path `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` (single artifact; this name is used consistently throughout this plan)

**Registration surfaces (expected to change only at Step 5 commit):**
- `docs/30-sprint-prds/hrms/README.md`
- `docs/SPRINT_CATALOG.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`

Re-verify all digests immediately before Step 5 commit. If any frozen authoritative digest changes → **PRECONDITION-FAIL**, roll back, release lock, abort.

## Step 2 — Authoritative Resolution (zero fabrication)

Read only:
- HRMS Module PRD; HRMS Sprint Plan (§2 SPR-MOD-007-001 row, §4 allocation, §5 engines)
- `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`, `docs/02-architecture/event-catalog.md`
- `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` (upstream)
- Capabilities Registry (`docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md`)

All capabilities, engines (`ENG-001..008, 012, 024`), ADRs (`ADR-011, 014, 032`), personas, master data (Employee, Position, Department, Grade, Shift), and configuration items resolve verbatim from the Sprint Plan row. Sprint 1 publishes no new events (Sprint Plan §2 lists none for 001). Any missing reference → **PRECONDITION-FAIL**; no substitutions.

## Step 3 — Bounded Context Enforcement

- **HRMS owns:** Employee Master, Employment Profile, Position, Department, Grade, Shift masters, org assignment, HR operations configuration (approval hierarchies, shift patterns, notice periods).
- **Consumes read-only:** Identity/Authorization/Permission Management (`ENG-001..003`, MOD-001).
- **Forbidden and asserted absent:** payroll processing (MOD-008), accounting/GL posting or voucher creation (MOD-002 via `ENG-015`/`ENG-016`), project resource allocation, CRM customer records.

## Step 4 — Deliverable (Sprint PRD)

Author `docs/30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md` conforming exactly to released GT-003 v1.0 structure and frontmatter (governance metadata, `related_engines`, `related_adrs`, `dependencies`, capabilities, boundaries, exit criteria, published/consumed events). Frontmatter records `execution_id`, `parent_result_id`, and `preflight_snapshot_digest`.

## Step 5 — Transactional Registration (idempotent)

Update exclusively:
- `docs/30-sprint-prds/hrms/README.md`
- `docs/SPRINT_CATALOG.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`

Rollback SHALL follow the **GT-003 Runtime Rollback Rule** exactly.

Idempotency invariants:
- Exactly one row per surface for `SPR-MOD-007-001`.
- `_meta.json` remains valid JSON; no duplicate sidebar entries.
- Parent module = `MOD-007`; status = `Draft`.

`DOCUMENT_TRACEABILITY.md` remains N/A by design.

## Step 6 — GT-003 Validation (dynamically bound)

Execute every validation rule declared by released GT-003; identifiers and count bound dynamically. Abort on any FAIL. No hardcoded counts.

## Step 7 — GT-005 Repository Audit

Emit `docs/50-audit-reports/REPOSITORY_AUDIT_20260714T000400Z.md`. Expected: Repository READY, Confidence MEDIUM (D3 inherited), every declared audit rule PASS (dynamically bound).

## Step 8 — Post-Commit Snapshot Re-verification

Re-compute Step 1A digests. **Only registration surfaces are expected to change. All frozen authoritative artifacts SHALL remain byte-identical.** Any drift in a frozen artifact → mark pass **INCONSISTENT**, roll back registration via GT-003 Runtime Rollback Rule, release lock, abort.

## Step 9 — Execution Record & Handoff

Append to `.lovable/plan.md`:

```yaml
execution_id: GT003-MOD007-001-20260714T000400Z-001
execution_status: READY_FOR_NEXT_SPRINT
snapshot_digest: <sha256 of concatenated frozen-artifact digests>
repository_revision_after: <post-commit repo revision marker>
audit_report_id: REPOSITORY_AUDIT_20260714T000400Z
next_template: GT-003
next_target: SPR-MOD-007-002
handoff_state: READY
handoff_contract:
  upstream_pass: 9.3.0
  downstream_requires:
    - SPR-MOD-007-001 registered on 4 surfaces (idempotent)
    - GT-003 validation PASS (dynamically bound)
    - GT-005 audit PASS (dynamically bound)
    - Preflight snapshot verified pre- and post-commit
    - Frozen authoritative artifacts byte-identical
    - Repository READY
```

## Success Criteria

- Sprint PRD title/slug/scope match `MOD-007_SPRINT_PLAN.md §2 SPR-MOD-007-001` verbatim.
- Zero fabricated identifiers.
- Ownership boundaries preserved; no forbidden concerns present.
- Transactional registration across the 4 GT-003 surfaces.
- **Execution is idempotent.**
- Preflight snapshot verified pre- and post-commit; frozen artifacts byte-identical.
- Every declared GT-003 & GT-005 rule PASS (dynamically bound).
- Lock released on every terminal state per `lock_release.always_on`.
- Repository READY; Governance Framework unchanged.

## Roadmap

- **Pass 9.3.1** — GT-003 for `SPR-MOD-007-002` (Employment Lifecycle).
- **Pass 9.3.2 … 9.3.5** — Sprints 003..006 per HRMS Sprint Plan §2.
- **Pass 9.4.0** — GT-004 MOD-007 Baseline Consolidation.
- **Pass 9.4.1** — GT-005 publication of `MOD007_HRMS_BASELINE_v1`.

## Non-Goals

- No governance/template/matrix/capabilities-registry changes.
- No Module PRD or Sprint Plan edits.
- No implementation code.
- No changes to unrelated modules or CRM artifacts.

## Changes vs v2

1. **Capabilities Registry naming** — unified to `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` everywhere (Step 1A, Step 2).
2. **Step 8 wording** hardened: "Only registration surfaces are expected to change. All frozen authoritative artifacts SHALL remain byte-identical."
3. **Lock release semantics** — added `lock_release.always_on: [success, rollback, abort, precondition_fail, inconsistent]` to the execution wrapper.
4. **Rollback inheritance** — Step 5 now explicitly inherits the **GT-003 Runtime Rollback Rule** rather than restating mechanics.
5. **Idempotency as success criterion** — "Execution is idempotent" added to Success Criteria.
6. **Execution record enriched** with `snapshot_digest`, `repository_revision_after`, and `audit_report_id` at the top level; handoff contract now asserts frozen-artifact byte-identity.

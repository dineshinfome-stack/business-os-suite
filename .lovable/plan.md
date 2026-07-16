# Pass 13.1.1 — GT-005 Publication for MOD-011 AMC Baseline v1

Publish `MOD011_AMC_BASELINE_v1` as Released under the GT-005 v1.0 lifecycle, following precedent set by MOD-008/009/010. Baseline body remains byte-identical; only publication metadata and registration surfaces change.

## Steps

1. **Preconditions** — Verify Governance Framework v1.0 Released, GT-001..GT-005 Active, Wrapper v1.0 FROZEN, MOD-011 Stage 3 complete, latest audit `REPOSITORY_AUDIT_20260716T005000Z.md` READY, baseline file exists and is in pre-publication state, no open corrective executions. Abort on first failure (`PRECONDITION-FAIL`, exit 20).

2. **Dependency Resolution** — Resolve GT-005 depends_on edges (GT-001..GT-004) dynamically from `GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md/.yaml`. Confirm all edges Active and SemVer-compatible.

3. **Validation** — Execute every validation rule declared by the released GT-005 template via dynamic rule binding against baseline metadata, publication metadata, lifecycle state, registration surfaces, traceability, and repository consistency. No hard-coded validation identifiers or counts.

4. **Baseline Freeze / Publication Metadata** — In `docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md`, update only the publication metadata fields declared by the released GT-005 template (lifecycle_state → Released, publication timestamp, publication identifiers as declared). Baseline body, capabilities, traceability, and ownership remain byte-identical.

5. **Publication Registration** — Update only surfaces required by GT-005 and established publication precedent:
   - `docs/40-module-baselines/README.md` — status column Baseline → Released
   - `docs/MODULE_BASELINE_CATALOG.md` — status column Baseline → Released
   - `docs/DOCUMENT_INDEX.md` — status column Frozen → Released (or per GT-005 contract)
   - `docs/_meta.json` — validate JSON remains parseable
   - `docs/MODULE_CATALOG.md` — update only if the released GT-005 template or prior precedent requires it.

6. **Verification** — Run every verification requirement declared by the released GT-005 template. All required checks PASS; INFO permitted only where defined by GT-005.

7. **GT-005 Repository Audit** — Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`. Every audit profile PASS; Repository READY.

8. **Execution Finalization** — Append execution record to `.lovable/plan.md` with the shape declared in the pass brief; release execution lock.

## Rollback

On failure after Step 5, restore publication metadata to pre-publication state, revert registration surfaces, remove partial audit report, and restore repository to exact pre-publication state per the released GT-005 Runtime Rollback procedure. Wrapper behavior unchanged.

## Non-Goals

No Module PRD / Sprint Plan / Sprint PRD / baseline body edits. No governance evolution. No GT or Wrapper modifications. No implementation code. No manifest, bootstrap, or dashboard generation.

## Deliverables

- Published `docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md` (metadata-only diff)
- Updated GT-005 publication registration surfaces
- `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md` (all profiles PASS, Repository READY)
- Execution record appended to `.lovable/plan.md` with `handoff_state: READY`

## Success Criteria

- `MOD011_AMC_BASELINE_v1` published under GT-005 v1.0 lifecycle
- Publication metadata inherited exclusively from GT-005
- Baseline body byte-identical to pre-publication state
- Registration limited to GT-005 publication surfaces
- All GT-005 validations PASS (INFO where permitted)
- GT-005 Repository Audit PASS; Repository READY
- Governance Framework v1.0, GT templates, and Wrapper v1.0 unchanged

## Roadmap After This Pass

- Pass 14.0.0 — GT-002 Stage 1 for the next unpublished Business OS module (resolved dynamically)
- Pass 14.0.1…N — GT-003 Sprint Authoring
- Pass 14.1.0 — GT-004 Baseline Consolidation
- Pass 14.1.1 — GT-005 Publication
- Optional OR / RR / SR read-only reviews per governance cadence

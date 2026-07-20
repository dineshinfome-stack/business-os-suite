## Objective
Audit every `MOD-XXX` sidebar group in `docs/_meta.json` against actual disk contents, remove any contract items whose target file is missing, and record all detected gaps in a persistent documentation-gap report. Navigation must always mirror what exists on disk — no placeholders, no dead links.

## Scope
- `docs/_meta.json` — module groups only (MOD-001 through MOD-019). Other groups (Dashboard, Foundation, Architecture, Delivery, IRR, Sprint PRDs) are out of scope for this pass.
- Contract items audited per module (Repository Navigation Standard v2.0 §2): Overview, Baseline, Publication, WEB-XXX, MOB-XXX, API-XXX, CPC-XXX, VR-XXX, Sprint Plan, Sprint PRDs.

## Availability Matrix (produced from disk)
For each MOD-001..MOD-019, resolve each contract item's `path` to `docs/<path>.md` and mark PRESENT / MISSING. Items already absent from the current sidebar are also inspected on disk and recorded so the gap report is disk-truth, not sidebar-truth.

The preliminary scan indicates that all currently listed module-group paths resolve successfully. The full audit is authoritative and may identify additional discrepancies before changes are applied.

Known gap already visible: MOD-002 has no VR document on disk and no VR entry in the sidebar → correctly absent; will be logged.

## Change
Edit only `docs/_meta.json`:
- Remove any module-group item whose resolved `.md` file does not exist.
- Do not add anything. Do not create placeholders. Do not touch non-module groups.

If the full audit finds zero dead links, `docs/_meta.json` is left unchanged and the pass produces only the gap report.

## Execution Report — Persistent Governance Artifact
Author `docs/50-audit-reports/NAVIGATION_AVAILABILITY_AUDIT_v2.0.md` (stable, non-timestamped name; superseded in place by future audits under the same versioned filename convention, e.g. `_v2.1.md`).

Contents:
1. Scope and method.
2. Availability Matrix — one row per module, one column per contract item, values PRESENT / MISSING (Sprint PRDs summarized as `N present`).
3. Documentation Gaps — flat list of every MISSING item, e.g.:
   ```
   MOD-002
   - Verification Report (VR-002): Missing
   ```
4. Navigation Changes — list of items removed from `docs/_meta.json` (or "None — sidebar already matches disk").
5. Validation — confirms every remaining module-group `path` resolves; no placeholder created; no cross-module duplicates; IRR entries still centralized.

## Validation Rules
- Any contract item not present on disk MUST NOT appear in `docs/_meta.json`.
- Every remaining module-group `path` resolves to an existing `.md` file.
- Item order inside each module group still matches §2 of the Navigation Standard.
- No IRR document appears inside any `MOD-XXX` group.
- No document `path` appears inside more than one module group.

## Non-Goals
- No new documents authored (missing VRs, SDs, etc. are reported, not created).
- No changes to Delivery, IRR, Sprint PRDs, or any non-module group.
- No file renames, moves, or content edits outside `docs/_meta.json` and the audit report.
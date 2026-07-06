# Plan: Elevate Sprint PRD Verification Pattern to Governance

## Context

The Pass 8.2.2 verification checklist proved useful for `SPR-MOD-001-002` and mirrored the checks already used for `SPR-MOD-001-001`. The user wants to make this the standard repository closure pattern for all future Sprint PRD authoring passes, but to place it in a central governance document rather than inside `.lovable/plan.md`.

## Target Document

- `docs/SPRINT_AUTHORING_GUIDE.md` — the authoritative document for Sprint PRD authoring methodology. It already defines the Sprint Traceability Rule, Acceptance Criteria standards, and Definition of Done. Adding a repository verification closure pattern here is the most natural fit and makes it applicable to every future Sprint PRD across all modules.

## Change to Make

Add a new **Section 13 — Sprint PRD Repository Verification Pattern** immediately after the existing **Section 12 — Sprint Completion Rule**, without renumbering any existing sections. The existing **Section 13 — Sprint Sequencing Rules** and **Section 14 — References** keep their current numbers.

### New Section 13 Content

```text
## 13. Sprint PRD Repository Verification Pattern

After a Sprint PRD is authored and before the authoring pass is considered complete, perform a lightweight repository consistency check to ensure the Sprint PRD library remains synchronized, traceable, and internally consistent.

This verification pattern applies to every Sprint PRD authoring pass (Pass 8.x onward) and is independent of any specific module or sprint.

### 13.1 Verification Checklist

For the newly authored Sprint PRD (`SPR-MOD-NNN-NNN`):

1. **Document Index**
   - Verify the new Sprint PRD appears exactly once in `docs/DOCUMENT_INDEX.md`.
   - `grep -c "SPR-MOD-NNN-NNN" docs/DOCUMENT_INDEX.md` must return `1`.

2. **Sprint Catalog**
   - Verify the Sprint PRD is registered exactly once in `docs/SPRINT_CATALOG.md` with the correct parent module and status `Draft` at the time of authoring.
   - `grep -n "SPR-MOD-NNN-NNN" docs/SPRINT_CATALOG.md` must return exactly one row.

3. **Sidebar Registration**
   - Verify `docs/_meta.json` contains a single registration entry for the new Sprint PRD title and path.
   - No duplicate sidebar entries.

4. **Structural Consistency**
   - Compare the section headings of the new Sprint PRD with the most recent approved Sprint PRD in the same module. Where no prior Sprint PRD exists, compare against the repository's established gold-standard Sprint PRD.
   - Verify identical section ordering, identical governance sections, consistent terminology, and consistent traceability conventions.
   - If the reference Sprint PRD contains an additional section, the new Sprint PRD MUST contain the same-named section in the corresponding location.

5. **Traceability and Governance Cross-Checks**
   - Verify every feature in the Sprint PRD traces back to the parent Module PRD (Section 8 / Section 11).
   - Verify only Accepted ADRs are consumed (Section 7 / Section 9).
   - Verify ERP Core Engines are consumed, not redefined (Section 6 / Section 8).
   - Verify the module subfolder README (`docs/30-sprint-prds/<module>/README.md`) links to the new Sprint PRD and reflects its current status.

### 13.2 Acceptance of the Verification Pattern

A Sprint PRD authoring pass is considered complete only if:

- `DOCUMENT_INDEX.md` contains exactly one entry for the new Sprint PRD.
- `SPRINT_CATALOG.md` contains exactly one row for the new Sprint PRD with the correct parent module and status.
- `_meta.json` registers the new Sprint PRD exactly once.
- The new Sprint PRD is structurally consistent with the most recent approved Sprint PRD in the same module, or the repository's established gold-standard Sprint PRD if no prior Sprint PRD exists.
- All upstream traceability and governance cross-checks pass.

### 13.3 Purpose

These checks are intentionally lightweight and serve as a repository hygiene gate before the next Sprint PRD authoring pass begins. They help prevent duplicate registrations, documentation drift, and structural inconsistencies as the Sprint PRD library grows across all modules.

```

## Why This Placement

The logical flow of the guide becomes:

- Section 11 — Definition of Done (when a sprint is considered Done)
- Section 12 — Sprint Completion Rule (when a Sprint PRD is considered complete)
- Section 13 — Sprint PRD Repository Verification Pattern (verify repository consistency before moving on)
- Section 14 — Sprint Sequencing Rules (how to order the next sprint)
- Section 15 — References

This preserves the natural progression: finish the sprint → determine it is complete → verify repository consistency → move to the next sprint.

## Frontmatter Update

- Update the `updated` date from `2026-07-05` to `2026-07-06`.

## Files Modified

- `docs/SPRINT_AUTHORING_GUIDE.md` — only file changed.

## Not Modified

- No Sprint PRDs, Module PRDs, ADRs, ERP Core Engines, or workflow documents.
- `DOCUMENT_INDEX.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md`, and `REPOSITORY_MAP.md` remain unchanged; the updated document is already registered generically in those indexes.
- No code, schema, API, or UI changes.
- No section renumbering in any existing document.

## Verification

- `grep -c "Sprint PRD Repository Verification Pattern" docs/SPRINT_AUTHORING_GUIDE.md` returns `1`.
- `grep -c "## 13\. Sprint PRD Repository Verification Pattern" docs/SPRINT_AUTHORING_GUIDE.md` returns `1`.
- `grep -c "A Sprint PRD authoring pass is considered complete only if" docs/SPRINT_AUTHORING_GUIDE.md` returns `1`.
- `grep -c "most recent approved Sprint PRD in the same module" docs/SPRINT_AUTHORING_GUIDE.md` returns `1`.
- The existing `## 14. References` heading remains unchanged (no renumbering).

## Outcome

The repository verification pattern becomes a documented, repeatable standard for every future Sprint PRD authoring pass (e.g., Pass 8.2.3 onward), ensuring the Sprint PRD library remains consistent, traceable, and synchronized as it grows across all modules.

## Goal

Reorganize `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md` so specifications are grouped by family (WEB, MOB, API) in ascending numeric order, and Cross-Platform Certifications live in their own section placed after the API section. Correct the misplacement so MOB-003 sits under MOB (not API), and add the missing MOD-003 rows plus the two MOD-003 certification artifacts.

## Scope

Registration/catalog edit only. No specification, audit report, or governance content is changed. Single file touched: `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`.

## Target Structure

Replace the single flat "Registration Table" with four ordered sections:

1. **WEB Specifications** — WEB-001, WEB-002, WEB-003 (46-), WEB-017, WEB-018
2. **MOB Specifications** — MOB-001, MOB-002, MOB-003 (46-), MOB-017, MOB-018
3. **API Specifications** — API-001, API-002, API-003 (46-), API-017, API-018
4. **Cross-Platform Certifications** — placed after API, ordered by artifact type (not numerically):
   1. Certification Report — MOD-003 Sales Cross-Platform Certification Report → `docs/50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z.md`
   2. Certification Verification Report — MOD-003 Cross-Platform Certification Verification Report → `docs/50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_VERIFICATION_20260719T210500Z.md`

### Row rules

- Specification rows preserve existing columns: Spec ID, Source Module, Source Publication, Lifecycle State, Owner, Updated.
- The MOD-003 specification rows shall reference the canonical documents under `docs/46-solution-design/{web,mobile,api}/sales/`, while retaining the `(46-)` indicator in the Spec ID column to reflect the documented `46-`/`60-` surface duality (INFO-01). No path migration or repository restructuring is implied — the catalog indexes existing canonical documents; the `(46-)` label is informational.
- All spec sections sorted strictly ascending by numeric suffix (001, 002, 003, 017, 018).
- Cross-Platform Certifications table columns: Module, Artifact Type, Report, Path, Date. Rows ordered by artifact type: Certification Report first, Certification Verification Report second.

### Ordering rules (added to Notes)

Two short explicit rules so future edits stay consistent:

> "Rows within each specification family (WEB, MOB, API) are sorted in ascending order of the numeric suffix of the Spec ID."
>
> "The Cross-Platform Certifications section is grouped separately, placed after the API family, and is ordered by artifact type — Certification Report, then Certification Verification Report — not by numeric suffix."

## Preserved Content

- Frontmatter kept intact; `updated` bumped to `2026-07-19`.
- "Planned Coverage Rule", "Notes" (with the new ordering rules appended), and "References" retained verbatim, positioned after the four tables.
- References section extended with a link to `docs/46-solution-design/README.md` so the 46- surface is discoverable from the catalog.

## Consistency Check

After the edit, read the file back to confirm:

- MOB-003 no longer appears in the API section.
- API-003 appears only in the API section.
- Both MOD-003 certification artifacts appear only in the Cross-Platform Certifications section, ordered Report → Verification Report.
- Spec IDs within each specification section are strictly ascending: 001 → 002 → 003 → 017 → 018.

## Out of Scope

- No changes to specifications, audit reports, `SOLUTION_STATUS.md`, `DOCUMENT_INDEX.md`, `_meta.json`, or the `46-`/`60-` README indexes.
- No reconciliation of the `46-` vs `60-` surface duality (still deferred to a future governance-evolution pass).
- No new verification report or lifecycle state transition — this is a registration cleanup, not a lifecycle pass.

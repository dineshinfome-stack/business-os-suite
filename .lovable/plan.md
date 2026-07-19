## Diagnosis

The sidebar is generated from `docs/_meta.json` (consumed by `src/lib/docs.ts` as `nav`), not from headings inside `SOLUTION_DESIGN_CATALOG.md`. The catalog markdown was reorganized correctly in the previous pass, but `_meta.json` still lists the MOD-003 (46-) specs at the end of each family group:

- WEB group ends with `WEB-003 — Sales (46-)` after WEB-018
- MOB group has no MOB-003 entry at all (it lives in the API group)
- API group ends with `MOB-003 — Sales (46-)` then `API-003 — Sales (46-)` after API-018

## Change

Single file: `docs/_meta.json`. No document content, no route code, no other registry changes.

Reorder the three "60 Solution Design" subgroups so each family is strictly ascending by numeric suffix (001 → 002 → 003 → 017 → 018), and move MOB-003 out of the API subgroup into the MOB subgroup:

- **WEB Specifications**: WEB-001, WEB-002, **WEB-003 (46-)**, WEB-017, WEB-018
- **MOB Specifications**: MOB-001, MOB-002, **MOB-003 (46-)** (moved from API group), MOB-017, MOB-018
- **API Specifications**: API-001, API-002, **API-003 (46-)** (moved up from bottom), API-017, API-018

Titles, paths, and all other groups remain unchanged. Cross-Platform Certification artifacts are not sidebar entries and are unaffected.

## Verification

After the edit:
1. `grep` the three subgroup slices of `_meta.json` and confirm ascending numeric order in each.
2. Confirm MOB-003 appears exactly once (in the MOB group) and API group no longer contains MOB-003.
3. Reload `/docs` in preview and confirm the sidebar mirrors the intended order.

## Out of Scope

- No changes to `SOLUTION_DESIGN_CATALOG.md` (already correct).
- No changes to route files, `src/lib/docs.ts`, `DOCUMENT_INDEX.md`, or `SOLUTION_STATUS.md`.
- No lifecycle transition — this is a navigation registration fix only.

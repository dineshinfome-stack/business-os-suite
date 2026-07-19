## Diagnosis (confirmed)

`src/routes/docs.tsx` renders one sidebar heading per `NavGroup.label` and lists the group's `items` as flat rows. The current `docs/_meta.json` has a single `"60 Solution Design"` group containing README, Catalog, three family "Index" rows, 15 spec rows, and the 2 certification rows — so no matter how those items are ordered, the sidebar can only ever show one heading. To get four distinct headings (WEB / MOB / API / Cross-Platform), the single group must be split into sibling groups.

## Decision on landing documents

Per the design consideration raised in the review, keep the Solution Design landing documents visible in the sidebar. They move into a small retained container group instead of being deleted.

## Change

Single file: `docs/_meta.json`. No renderer changes, no document moves, no catalog/content edits.

Replace the current single `"60 Solution Design"` group with **five** consecutive sibling groups, in this order:

1. **`60 Solution Design`** — landing entries only:
   - `README` → `60-solution-design/README`
   - `Solution Design Catalog` → `60-solution-design/SOLUTION_DESIGN_CATALOG`

2. **`WEB Specifications`** — 6 items in ascending numeric order:
   - `Index` → `60-solution-design/web/README`
   - `001` → `60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION`
   - `002` → `60-solution-design/web/WEB-002_ACCOUNTING`
   - `003` → `46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN`
   - `017` → `60-solution-design/web/WEB-017_ANALYTICS`
   - `018` → `60-solution-design/web/WEB-018_AI_WORKSPACE`

3. **`MOB Specifications`** — 6 items in ascending numeric order:
   - `Index` → `60-solution-design/mobile/README`
   - `001` → `60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION`
   - `002` → `60-solution-design/mobile/MOB-002_ACCOUNTING`
   - `003` → `46-solution-design/mobile/sales/MOB-003_SOLUTION_DESIGN` (moved out of the API block, where it was incorrectly listed)
   - `017` → `60-solution-design/mobile/MOB-017_ANALYTICS`
   - `018` → `60-solution-design/mobile/MOB-018_AI_WORKSPACE`

4. **`API Specifications`** — 6 items in ascending numeric order:
   - `Index` → `60-solution-design/api/README`
   - `001` → `60-solution-design/api/API-001_PLATFORM_ADMINISTRATION`
   - `002` → `60-solution-design/api/API-002_ACCOUNTING`
   - `003` → `46-solution-design/api/sales/API-003_SOLUTION_DESIGN`
   - `017` → `60-solution-design/api/API-017_ANALYTICS`
   - `018` → `60-solution-design/api/API-018_AI_WORKSPACE`

5. **`Cross-Platform Certifications`** — ordered by artifact type (Report, then Verification Report):
   - `Certification Report` → `50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z`
   - `Certification Verification Report` → `50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_VERIFICATION_20260719T210500Z`

Notes on titles:
- In the three spec groups, leaf titles are the numeric suffix only (`001`, `002`, …) to match the target sidebar shape exactly.
- The `(46-)` informational label used in the catalog is not repeated in the sidebar; the paths still point at the canonical `46-solution-design/**/sales/**` documents.
- No path or file is renamed; catalog rows and cross-references remain valid.

All other groups in `_meta.json` above and below this block are left untouched.

## Verification

1. `_meta.json` shows five new `"label"` entries in order: `60 Solution Design`, `WEB Specifications`, `MOB Specifications`, `API Specifications`, `Cross-Platform Certifications`, with item counts 2 / 6 / 6 / 6 / 2.
2. `MOB-003` path appears exactly once and only inside the `MOB Specifications` group; no `MOB-003` entry remains under `API Specifications`.
3. Reload `/docs` in preview and confirm the sidebar renders five headings in the specified order, with the exact leaf labels listed above.

## Out of Scope

- No changes to `SOLUTION_DESIGN_CATALOG.md`, `SOLUTION_STATUS.md`, spec content, or certification content.
- No renderer/schema changes in `src/lib/docs.ts` or `src/routes/docs.tsx` (no nested-group support introduced).
- No lifecycle transition — this is a sidebar-navigation presentation fix only.

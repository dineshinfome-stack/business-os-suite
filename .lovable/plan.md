## Goal

Update the Solution Design sidebar so leaf entries display full descriptive titles instead of numeric-only labels, keeping the five-group structure already in place.

## Diagnosis (confirmed)

- `src/routes/docs.tsx` renders one heading per `NavGroup.label` and lists `items` flat, using `item.title` as the visible label.
- `docs/_meta.json` currently splits the Solution Design block into five sibling groups (`60 Solution Design`, `WEB Specifications`, `MOB Specifications`, `API Specifications`, `Cross-Platform Certifications`) but leaf `title` values in the three spec groups are numeric-only (`001`, `002`, …), and the certification entries are `Certification Report` / `Certification Verification Report`.
- Because the renderer reads `item.title` verbatim, the fix is a pure `_meta.json` label update.

## Change

Single file: `docs/_meta.json`. No renderer changes, no document moves, no catalog/content edits, no path changes.

Rewrite the leaf `title` fields inside the five Solution Design groups. Paths, ordering, and group structure are preserved exactly.

### 1. `60 Solution Design` (unchanged)
- `README` → `60-solution-design/README`
- `Solution Design Catalog` → `60-solution-design/SOLUTION_DESIGN_CATALOG`

### 2. `WEB Specifications`
| Sidebar Label | Path |
| --- | --- |
| `Index` | `60-solution-design/web/README` |
| `WEB-001 — Platform Administration Web Solution Design Specification` | `60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION` |
| `WEB-002 — Accounting Web Solution Design Specification` | `60-solution-design/web/WEB-002_ACCOUNTING` |
| `WEB-003 — Sales Web Solution Design Specification` | `46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN` |
| `WEB-017 — Analytics Web Solution Design Specification` | `60-solution-design/web/WEB-017_ANALYTICS` |
| `WEB-018 — AI Workspace Web Solution Design Specification` | `60-solution-design/web/WEB-018_AI_WORKSPACE` |

### 3. `MOB Specifications`
| Sidebar Label | Path |
| --- | --- |
| `Index` | `60-solution-design/mobile/README` |
| `MOB-001 — Platform Administration Mobile Solution Design Specification` | `60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION` |
| `MOB-002 — Accounting Mobile Solution Design Specification` | `60-solution-design/mobile/MOB-002_ACCOUNTING` |
| `MOB-003 — Sales Mobile Solution Design Specification` | `46-solution-design/mobile/sales/MOB-003_SOLUTION_DESIGN` |
| `MOB-017 — Analytics Mobile Solution Design Specification` | `60-solution-design/mobile/MOB-017_ANALYTICS` |
| `MOB-018 — AI Workspace Mobile Solution Design Specification` | `60-solution-design/mobile/MOB-018_AI_WORKSPACE` |

### 4. `API Specifications`
| Sidebar Label | Path |
| --- | --- |
| `Index` | `60-solution-design/api/README` |
| `API-001 — Platform Administration API Solution Design Specification` | `60-solution-design/api/API-001_PLATFORM_ADMINISTRATION` |
| `API-002 — Accounting API Solution Design Specification` | `60-solution-design/api/API-002_ACCOUNTING` |
| `API-003 — Sales API Solution Design Specification` | `46-solution-design/api/sales/API-003_SOLUTION_DESIGN` |
| `API-017 — Analytics API Solution Design Specification` | `60-solution-design/api/API-017_ANALYTICS` |
| `API-018 — AI Workspace API Solution Design Specification` | `60-solution-design/api/API-018_AI_WORKSPACE` |

### 5. `Cross-Platform Certifications`
| Sidebar Label | Path |
| --- | --- |
| `MOD-003 — Sales Cross-Platform Certification Report` | `50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z` |
| `MOD-003 — Cross-Platform Certification Verification Report` | `50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_VERIFICATION_20260719T210500Z` |

Notes:
- Family `Index` rows retain the short `Index` label (already unambiguous within their headed group).
- No paths change; every entry still resolves to the same document.
- The `(46-)` surface duality is not surfaced in the sidebar label; canonical paths already point at `46-solution-design/**/sales/**` for MOD-003 entries.

## Navigation Rules (recorded for future passes)

- **Section order:** Solution Design → WEB → MOB → API → Cross-Platform Certifications.
- **Spec order within a family:** ascending numeric (`001`, `002`, `003`, `017`, `018`).
- **Spec label format:** `<Spec ID> — <Document Title>`.
- **Certification label format:** `<Module ID> — <Artifact Title>`.
- Sidebar labels are presentation-only and never affect canonical paths, registration, lifecycle state, cross-references, or the 46-/60- surface duality.

## Verification

1. `docs/_meta.json` shows the five Solution Design groups in the specified order with item counts 2 / 6 / 6 / 6 / 2.
2. Every leaf label in WEB / MOB / API groups follows `<Spec ID> — <Title>` (except the family `Index` row).
3. Both Cross-Platform Certifications rows use `MOD-003 — …` labels.
4. MOB-003 appears only in the MOB group; API-003 appears only in the API group.
5. Reload `/docs` in preview and confirm the sidebar renders the descriptive labels and that each entry navigates to the correct document.

## Out of Scope

- No changes to `SOLUTION_DESIGN_CATALOG.md`, `SOLUTION_STATUS.md`, specifications, or certification documents.
- No renderer/schema changes in `src/lib/docs.ts` or `src/routes/docs.tsx`.
- No lifecycle transition, registration change, path change, or repository state advance.

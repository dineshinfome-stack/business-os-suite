---
document: IMP Chapter 02 — Repository Discovery Summary
version: 1.0.0
owner: Program Delivery
approval_status: Draft
---

# 02 — Repository Discovery Summary

## Discovery Order (Mandatory)
Architecture → Governance → ADRs → PRDs → Solution Designs → Sprint Plans → EEMP → Module Publications → Release Readiness → Roadmaps → Dependency documentation.

## Repository Inventory (approximate, derived from scan performed 2026-07-23)

| Source Area | Path | Approx. Count | Confidence |
|---|---|---|---|
| Vision | `docs/00-vision/` | 1 tree | High |
| Master governance | `docs/01-master/` | 1 tree (incl. risk register) | High |
| Architecture | `docs/02-architecture/` | 1 tree | High |
| ADRs | `docs/11-adrs/` | 8 categories | High |
| Module PRDs | `docs/20-module-prds/` | 19 modules | High |
| Solution Designs (Web/Mobile/API) | `docs/60-solution-design/` | ≈ 51 files (17 modules × 3 surfaces, plus MOD-001 partial) | High |
| Sprint PRDs | `docs/30-sprint-prds/` | 102 sprint files across 19 modules | High |
| Module Publications | `docs/45-module-publications/` | 19 modules | High |
| Governance standards | `docs/15-governance/` | 11+ standards | High |
| EEMP | `docs/02_Engineering_Execution_Master_Plan/` | 21 chapters + templates/checklists/examples | High |
| Audit reports | `docs/50-audit-reports/` | growing | High |
| Total markdown files | (repo) | ≈ 900 | High |

## Documents Referenced by the IMP
Every IMP chapter references only authoritative sources listed above. See `indexes/dependency_index.md` for the complete cross-reference index.

## Implementation Sources (per module)
For each module MOD-00N: `docs/20-module-prds/<slug>/MODULE_PRD.md`, `docs/60-solution-design/{web,mobile,api}/<file>`, `docs/30-sprint-prds/<slug>/SPR-*.md`, `docs/45-module-publications/<slug>/MOD-00N_MODULE_PUBLICATION.md`.

## Confidence Levels
- **High**: file existence and IDs verified via direct listing.
- **Medium**: aggregate counts derived from directory listings without full frontmatter parsing.
- **Low**: none.

## Repository Health Summary
Observations carried forward from EEMP Appendix (`docs/02_Engineering_Execution_Master_Plan/20_Appendix.md`):
- **C-001** Database standards duplication — accepted observation.
- **C-002** Solution Design catalog fragmentation between `docs/46-solution-design/` (legacy sales-only) and `docs/60-solution-design/` (current) — accepted observation. IMP references the current catalog.

## Evidence
| Source | Path | Authority | Confidence |
|---|---|---|---|
| EEMP Appendix | `docs/02_Engineering_Execution_Master_Plan/20_Appendix.md` | Approved | High |
| Module PRDs listing | `docs/20-module-prds/` | Approved | High |
| Sprint PRDs listing | `docs/30-sprint-prds/` | Approved | High |

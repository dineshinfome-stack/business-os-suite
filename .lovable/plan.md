
# Workflow-Based Sidebar Reorganization — Revision 3.1

**Primary Objective:** Optimize documentation navigation for Lovable AI–driven implementation while preserving the repository as the single source of truth. Only `docs/_meta.json` changes; no repository restructuring.

## Scope

- **Change:** `docs/_meta.json` only.
- **No change:** markdown files, folders, filenames, document IDs, routes, frontmatter, renderer (`src/lib/docs.ts`, `src/routes/docs.tsx`), or search index.
- Reuse the existing flat `NavGroup` model. No renderer changes.

## Top-Level Order

```text
Dashboard
Execution Workspace
Implementation Roadmap
Foundation
Architecture
Design System
Modules — MOD-001 Platform Administration
Modules — MOD-002 Accounting
Modules — MOD-003 Sales
…
Modules — MOD-019 Warehouse
Sprint PRDs
AI Development
Platform Services
Governance
Delivery — Implementation Planning
Delivery — Engineering
Delivery — Verification
Delivery — User Acceptance
Delivery — Release
Delivery — Production
Delivery — Post Release
Project Management
Reference
Archive
```

## Modules — Simplified for Lovable AI

Each module exposes only implementation **inputs** plus Sprints. Execution/history artifacts live in the global `Delivery — <Phase>` sections. No `Ready for Build` row (status, not a document).

### Per-Module Row Order (emit only rows whose file exists)

```text
Overview (Module PRD)
Baseline
Publication
WEB Solution Design
Mobile Solution Design
API Solution Design
Cross-Platform Certification
Sprints  →  Sprint Plan + each SPR-… file (siblings)
```

Solution Design paths resolve via `MIGRATION_REGISTRY`: `46-solution-design/…` primary; `60-solution-design/…` fallback for un-migrated originals.

Current fill:
- MOD-001, MOD-002 → rows 1–7
- MOD-003 → rows 1–8
- MOD-004…MOD-019 → rows 1–2 (+ Sprints where present)

## Other Groups (existing paths only)

- **Dashboard** — `SOLUTION_STATUS`, `50-audit-reports/BUSINESS_OS_EXECUTION_ROADMAP`, `50-audit-reports/REPOSITORY_INVENTORY_REPORT_20260720T020000Z`, `MODULE_CATALOG`, `MODULE_BASELINE_CATALOG`, `MODULE_PUBLICATION_CATALOG`.
- **Execution Workspace** *(renamed from Current Build)* — rows: Current Wave / Current Module / Current Sprint / Next Action → `SOLUTION_STATUS`; Ready Modules / Blocked Modules / Build Readiness / Current Risks → `BUSINESS_OS_EXECUTION_ROADMAP`. Same paths as before; alternate entry points into the same documents (see Duplication Policy below).
- **Implementation Roadmap** — `SPRINT_ROADMAP`, `SPRINT_DEPENDENCY_MATRIX`, `SPRINT_AUTHORING_GUIDE`, `SPRINT_ESTIMATION_GUIDE`, `MODULE_IMPLEMENTATION_WORKFLOW`, `FOUNDATION_FREEZE_v1`, `PRODUCT_DOCUMENTATION_BASELINE_v1`.
- **Foundation** — merges `00 Vision` + `01 Master`.
- **Architecture** — `02 Architecture` + promoted `performance`, `migration-strategy`.
- **Design System** — merges `03 Design` + `12 UI Components`.
- **Sprint PRDs** — global group mirroring `30 Sprint PRDs` (intentional duplication with per-module Sprints rows).
- **AI Development** — `20-module-prds/ai/…`, `45-module-publications/ai/…`, all `09-ai/*`.
- **Platform Services** — `10 ERP Core` (sub-sections encoded as `Platform Services — ERP Core — …` sibling groups), `06 Integrations`, `08 Business Rules`, `07 Reports`, `13 Workflows`, `14 Localization`, `11 ERDs`.
- **Governance** — `governance`, `decision-register`, all `15-governance/*`, `99-templates/*`, active `11 ADRs`. Legacy ADRs excluded.
- **Delivery — <Phase>** — phase-grouped, cross-module, sole home for execution artifacts:
  ```text
  Implementation Planning → 55-implementation-planning/*
  Engineering             → 56-engineering-execution/* + 57-engineering-completion/*
  Verification            → 58-system-verification/*
  User Acceptance         → 59-user-acceptance/*
  Release                 → 60-release-readiness/*
  Production              → 61-production-release/*
  Post Release            → 62-post-release-verification/*
  ```
  MOD-003 files appear here only — never inside `Modules — MOD-003 Sales`.
- **Project Management** — remaining `50-audit-reports/*`, `ADR_IMPACT_MATRIX`, `DOCUMENT_TRACEABILITY`, `DOCUMENT_OWNERSHIP_MATRIX`, `ENGINE_USAGE_MATRIX`, `15-governance/MIGRATION_REGISTRY`.
- **Reference** — `canon`, `glossary`, `GLOSSARY_INDEX`, `REPOSITORY_MAP`, `MODULE_PUBLICATION_CATALOG`, `module-dependency-matrix`, `04 Domains — Foundation`, `04 Domains — Other`.
- **Archive** — `05 ADRs (Legacy — Superseded)` only.

## Technical Details

- Renderer contract unchanged: `NavGroup = { label, items: NavItem[] }`. Pseudo-hierarchy (`Modules — …`, `Platform Services — ERP Core — …`, `Delivery — …`) is encoded via label prefixes.
- Every `NavItem.path` verified against `allDocs()` before write. No dead links, no placeholders.

## Execution Steps

1. Enumerate live routes via `allDocs()` to build an allow-list.
2. Draft new `docs/_meta.json` with the sections and per-module groups above.
3. Validate: every path exists; no duplicate rows within a single group; MOD-003 delivery files appear only under `Delivery — …`.
4. Replace `docs/_meta.json` in a single write.
5. Reload preview and walk each group.

## Success Criteria

- Sidebar renders sections in the specified order with **Execution Workspace** as the second group.
- Each module group contains at most 8 rows; no lifecycle/execution artifacts.
- All execution artifacts appear only under `Delivery — <Phase>`.
- Zero dead links, zero repository changes, zero renderer changes.

---

# Revision 3.1 Addendum — Governance & Maintenance Guidance

Appended as an addendum, not merged into the core spec. Applies to `docs/_meta.json` only; no repository, renderer, or document changes.

## A. Rename — "Current Build" → "Execution Workspace"

Applied in the top-level order above. Broader label covers active sprint, release prep, parallel streams, and ongoing delivery — not tied to a single build. Same item paths reused; no new documents.

## B. Navigation Duplication Policy

Recorded as a `_comment` field at the top of `docs/_meta.json` (JSON has no native comments; the renderer already ignores unknown keys). Verbatim text:

> Some documents intentionally appear in multiple navigation groups. These are alternate navigation entry points — not duplicate documentation. Examples: `SOLUTION_STATUS`, `BUSINESS_OS_EXECUTION_ROADMAP`, individual Sprint PRDs. The repository remains the single source of truth. Navigation duplication is permitted only when it improves usability. Document duplication is never permitted.

Sanctioned duplicates in this revision:
- `SOLUTION_STATUS` — Dashboard + Execution Workspace (4 rows).
- `BUSINESS_OS_EXECUTION_ROADMAP` — Dashboard + Execution Workspace (4 rows).
- Each `SPR-…` file — global `Sprint PRDs` group + owning `Modules — MOD-… › Sprints`.

## C. Future Module Navigation Standard

Recorded as a second `_comment` block in `docs/_meta.json` and cross-referenced from `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` in a later governance pass (not this one). Verbatim text:

> Every future module (MOD-020+, future AI modules, plug-ins, industry extensions) shall expose only: Overview, Baseline, Publication, WEB Solution Design, Mobile Solution Design, API Solution Design, Cross-Platform Certification, Sprints. Execution artifacts (Implementation Planning, Engineering, Verification, User Acceptance, Release, Production, Post Release) shall never appear inside module navigation and must remain centralized under the global `Delivery — <Phase>` sections. Module navigation contains implementation inputs; Delivery navigation contains implementation history. No exceptions unless the navigation architecture is formally revised.

## Out of Scope

- Any file move/rename/create under `/docs`.
- Nested/collapsible sidebar UI or renderer changes.
- Lifecycle state transitions or `SOLUTION_STATUS` updates.
- Editing `MODULE_IMPLEMENTATION_WORKFLOW.md` to reference the standard (deferred to a future governance pass).

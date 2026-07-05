# Pass 7 — Domain / Module PRDs

Documentation-only. Architecture (Passes 1–6.5) stays frozen. Module PRDs
consume Foundation, Architecture, ERP Core Engines, and Accepted ADRs
without redefining them.

## Scope

Create a new documentation layer `docs/20-module-prds/` containing one
folder per bounded context, each with a `README.md` and `MODULE_PRD.md`,
plus a top-level `README.md` for the layer. Register the new group in
`docs/_meta.json`.

No code, routes, packages, schemas, APIs, UI, or edits to Passes 1–6.5
documents. `src/routeTree.gen.ts` is not touched — the existing `docs/$`
route renders any new markdown automatically.

## Deliverables

### 1. Layer README — `docs/20-module-prds/README.md`

Sections: Module Architecture · Reading Order · Module Dependency
Philosophy · Relationship to ERP Core Engines · Relationship to ADRs ·
Relationship to Sprint PRDs · Module Lifecycle · Module Dependency Rules
(may depend on Engines / Accepted ADRs / Foundation / Architecture; MUST
NOT redefine any of them; cross-module communication only via published
events, approved APIs, or shared master data; no cyclic dependencies) ·
Module Identifier Registry (canonical `MOD-NNN` → folder → sidebar-label
table) · References.

### 2. Module folders (18)

Stable identifier assignments (permanent for the project's lifetime):

| ID | Folder | Sidebar Label |
| --- | --- | --- |
| MOD-001 | `platform` | Platform Administration |
| MOD-002 | `accounting` | Accounting |
| MOD-003 | `sales` | Sales |
| MOD-004 | `purchase` | Purchase |
| MOD-005 | `inventory` | Inventory |
| MOD-006 | `crm` | CRM |
| MOD-007 | `hrms` | HRMS |
| MOD-008 | `payroll` | Payroll |
| MOD-009 | `manufacturing` | Manufacturing |
| MOD-010 | `projects` | Projects |
| MOD-011 | `amc` | AMC |
| MOD-012 | `field-service` | Field Service |
| MOD-013 | `assets` | Assets |
| MOD-014 | `fleet` | Fleet |
| MOD-015 | `pos` | POS |
| MOD-016 | `service-desk` | Service Desk |
| MOD-017 | `analytics` | Analytics |
| MOD-018 | `ai` | AI Workspace |

Each folder contains `README.md` and `MODULE_PRD.md`.

### 3. Module README (lightweight, per folder)

Sections: Purpose · Business Scope · Primary Users · Business
Capabilities · ERP Core Engines Consumed · Related Modules (by
`MOD-NNN`) · Related ADRs · Reading Order. Informational only. Header
displays the module's `MOD-NNN` identifier.

### 4. MODULE_PRD.md standard structure (identical across all 18)

Frontmatter:

```yaml
title:
summary:
layer: business
owner:
status: approved
updated: 2026-07-05
module_id: MOD-NNN
module:
domain:
bounded_context:
depends_on:
related_engines:
related_adrs:
related_modules:
referenced_by:
document_type: Module PRD
```

Body sections (exact order, all present):

1. Module Overview — Purpose, Business Objectives, Success Criteria, Out of Scope
2. Business Scope — Capabilities, Submodules, Business Responsibilities, Business Ownership
3. Personas — Primary / Secondary / External actors, business-level permissions
4. Business Processes — Catalogue, high-level workflows, lifecycle, state transitions
5. Master Data — Entities, ownership, relationships, lifecycle, validation
6. Transactions — Lifecycle, approvals; Posting references Posting Engine,
   Numbering references Numbering Engine, Audit references Audit Engine
7. Business Rules — Module-specific only; MUST NOT redefine security,
   audit, workflow, numbering, authorization, permissions, notifications,
   search, or AI (those belong to ERP Core Engines)
8. Integration Points — Inbound, outbound, events published/consumed,
   external system categories
9. Reports & Analytics — Operational, management, dashboards, KPIs, exports
10. Configuration — Business config, defaults, business-level feature
    toggles, localization
11. Non-functional Considerations — Module-specific quality; MUST
    reference `docs/02-architecture/quality-attributes.md`
12. ERP Core Engine Consumption — Required / Optional engines with
    reasons; no engine behavior redefined
13. Dependencies — Depends On / Provides To modules (by `MOD-NNN`),
    shared master data, shared transactions
14. Future Enhancements — Roadmap, deferred features
15. Conforms to Canon — References Foundation, Canon, Architecture, ERP
    Core, Accepted ADRs
16. Decisions Pending — ADR placeholders only
17. References

### 5. Sidebar registration — `docs/_meta.json`

Append a new group `20 Module PRDs` in this exact order: README →
Platform Administration → Accounting → Sales → Purchase → Inventory →
CRM → HRMS → Payroll → Manufacturing → Projects → AMC → Field Service →
Assets → Fleet → POS → Service Desk → Analytics → AI Workspace. Each
entry points at the folder README path; the existing `docs/$` splat
route resolves it through the docs registry.

## Authoring Rules

- Each MODULE_PRD references consumed engines by ID from
  `docs/10-erp-core/ENGINE_CATALOG.md` (`ENG-001..ENG-028`) and never
  restates their behavior.
- Related ADRs cite only **Accepted** ADRs from
  `docs/11-adrs/ADR_INDEX.md`. A Proposed ADR may only be referenced
  when explicitly flagged as an awaited dependency.
- Cross-module dependency graph is acyclic; each PRD's "Depends On" and
  "Provides To" are consistent (mirrored) and expressed as `MOD-NNN`.
- No source code, DB schemas, API contracts, UI mockups, or test cases
  in any file.
- Standard frontmatter present on every PRD; module READMEs use the
  standard lightweight frontmatter used elsewhere in `docs/`.
- **Stable Module Identifiers** — Every module MUST have a permanent
  identifier (`MOD-001` … `MOD-018`). Folder names, module names, and
  sidebar labels MAY evolve for business clarity, but the module
  identifier MUST remain unchanged throughout the project's lifetime.
  Module identifiers MUST be used for cross-references in ADRs, Sprint
  PRDs, traceability documents, dependency matrices, and AI-generated
  documentation. Identifiers are never reused, even if a module is
  renamed, merged, split, or retired. The canonical registry lives in
  `docs/20-module-prds/README.md` § Module Identifier Registry.
- **Identifier Cross-Reference Rule** — Whenever an ERP Core Engine,
  ADR, or Module is referenced in documentation, its stable identifier
  (`ENG-NNN`, `ADR-NNN`, or `MOD-NNN`) SHOULD accompany the
  human-readable name on first reference within a document. Subsequent
  references in the same document may use either the identifier or the
  name where context is unambiguous. Examples: *Accounting (MOD-002)*,
  *Posting Engine (ENG-027)*, *RBAC + ABAC (ADR-032)*. This keeps
  documents readable for humans while preserving precise traceability
  for AI, search, and future tooling.

## Derived Document Refresh

After Pass 7 the following derived indexes (created in Pass 6.5) are
regenerated as part of this pass so they reflect the new module layer
and the `MOD-NNN` identifier scheme:

- `docs/MODULE_CATALOG.md` — flip planned rows to authored, add
  `MOD-NNN` column, link each module's PRD path.
- `docs/ENGINE_USAGE_MATRIX.md` — populate "Typical Consumers" columns
  by `MOD-NNN` from each PRD's Section 12.
- `docs/DOCUMENT_INDEX.md` and `docs/REPOSITORY_MAP.md` — add the new
  layer and 37 new files.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — mark Module PRDs family as
  populated.
- `docs/DOCUMENT_TRACEABILITY.md` — no structural change; verify the
  Module PRD node reflects reality.

No authoritative document from Passes 1–6.5 is edited.

## Non-goals

Sprint planning, user stories, DB schema, API contracts, source code,
UI implementation, test cases, deployment, engine redesign, architecture
changes, new ADRs.

## Acceptance Criteria

- `docs/20-module-prds/README.md` exists with all required sections
  including the dependency rules and the Module Identifier Registry.
- 18 module folders exist, each with `README.md` and `MODULE_PRD.md`,
  each carrying its permanent `MOD-NNN` identifier in frontmatter and
  header.
- Every `MODULE_PRD.md` uses the standard 17-section structure and
  frontmatter shown above.
- Each PRD lists consumed engines (`ENG-NNN`) and Accepted ADRs
  (`ADR-NNN`) without redefining them; Section 11 references
  `quality-attributes.md`. First-reference identifier convention is
  applied throughout.
- Module dependency graph across all PRDs is acyclic, mirrored, and
  expressed exclusively via `MOD-NNN` identifiers.
- `docs/_meta.json` registers the new "20 Module PRDs" group in the
  specified order and renders in the docs sidebar.
- Derived indexes listed above are refreshed and include `MOD-NNN`; no
  Passes 1–6.5 files are modified.
- No implementation artifacts (code, schemas, API specs, UI) introduced.

## File Count

37 new files (1 layer README + 18 × 2 per module) + edits to 5 derived
docs and `docs/_meta.json`.

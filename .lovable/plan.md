## Pass 6.5 — Documentation Traceability & Navigation Layer

Documentation-only. Creates eight derived index/catalog/matrix guides and registers them in the docs portal sidebar. No code, packages, config, routes, architecture, engine, or ADR changes.

### Deliverables

**1. `docs/DOCUMENT_TRACEABILITY.md`** — Master traceability guide.
Sections: Purpose · Documentation Hierarchy · Reading Order · Document Dependency Chain · Authoritative Document Rules · Change Propagation Rules · Traceability Examples · References. Includes a Mermaid `graph TD` dependency diagram: Foundation Freeze → Canon → Business Blueprint → Architecture → ERP Core Engines → ADRs → Module PRDs → Sprint PRDs → Implementation.

**2. `docs/ENGINE_USAGE_MATRIX.md`** — Engine usage matrix.
One row per ERP Core Engine (`ENG-001..ENG-028` from `docs/10-erp-core/ENGINE_CATALOG.md`). Columns: Engine · Category · Typical Consumers · Required · Optional · Notes. Consumers drawn from the 17 planned modules (Accounting, Sales, Inventory, HRMS, Payroll, CRM, Manufacturing, Projects, AMC, Field Service, Assets, Fleet, POS, Service Desk, Analytics, AI, Platform). Informational only; authoritative dependencies land in Module PRDs.

**3. `docs/ADR_IMPACT_MATRIX.md`** — ADR impact-analysis matrix.
Rows: each ADR ID from `docs/11-adrs/ADR_INDEX.md`. Columns: Architecture Documents · ERP Core Engines · Module PRDs (placeholder) · Coding Standards · Design Standards. Derived from each ADR's `affected_documents` plus explicit engine cross-references. Header states: on conflict, the ADR file wins.

**4. `docs/MODULE_CATALOG.md`** — Placeholder catalog for Pass 7.
Columns: Module Name · Status (all `Planned`) · Primary Domain · Planned PRD path · Expected Engine Dependencies · Planned Owner. One row per planned BusinessOS module or bounded context currently in scope. Planning metadata only.

**5. `docs/GLOSSARY_INDEX.md`** — Master alphabetical glossary index.
Columns: Term · Definition Source · Canon · Architecture · Data Dictionary · Module PRD (future). Points to authoritative locations (`docs/glossary.md`, `docs/canon.md`, `docs/02-architecture/data-dictionary.md`, etc.). Index-only; definitions remain in source documents.

**6. `docs/REPOSITORY_MAP.md`** — Complete repository map.
Sections: Overview · Foundation · Canon · Business Blueprint · Architecture · ERP Core Engines · ADRs · Design Standards · Module PRDs · Sprint PRDs · Reference Documents. For each layer: folder hierarchy tree, ownership, document purpose, and document authority (authoritative vs derived).

**7. `docs/DOCUMENT_INDEX.md`** — Master alphabetical inventory of every repository document.
Columns: Document · Layer · Status · Authority (`Authoritative` | `Derived`) · Path. Complements — does not replace — `_meta.json` (portal sidebar) and `REPOSITORY_MAP.md` (hierarchy). Serves as a searchable inventory for humans and AI retrieval.

**8. `docs/DOCUMENT_OWNERSHIP_MATRIX.md`** — Governance ownership index.
Purely additive derived governance document; introduces no new rules or ownership changes. Sections:

- **Purpose** — one paragraph describing this file as the governance ownership index for the documentation repository.
- **Ownership Matrix** — columns: Documentation Family · Primary Owner · Approval Authority · Change Mechanism · Authoritative Documents. Rows: Foundation Freeze · Canon · Business Blueprint · Architecture · ERP Core Engines · Architecture Decision Records · Documentation Traceability · Module PRDs · Sprint PRDs · Coding Standards · Design Standards.
- **Change Authority** — Canon → Architecture Governance; Business Blueprint → Product Governance; Architecture → ADR process; ERP Core Engines → ADR + Architecture Governance; ADRs → ADR lifecycle; Module PRDs → Product + Architecture review; Sprint PRDs → Engineering; Documentation indexes → Documentation Governance.
- **References** — `FOUNDATION_FREEZE_v1.md`, `DOCUMENT_TRACEABILITY.md`, `REPOSITORY_MAP.md`, `docs/11-adrs/README.md`, `docs/10-erp-core/ENGINE_CATALOG.md`.

Header states this is a derived document; source files win on conflict.

### Sidebar registration — `docs/_meta.json`

Add the eight guides under the existing Overview/Documentation top-level group in this order:

1. Repository Map → `REPOSITORY_MAP`
2. Document Index → `DOCUMENT_INDEX`
3. Document Ownership Matrix → `DOCUMENT_OWNERSHIP_MATRIX`
4. Document Traceability → `DOCUMENT_TRACEABILITY`
5. Glossary Index → `GLOSSARY_INDEX`
6. Engine Usage Matrix → `ENGINE_USAGE_MATRIX`
7. ADR Impact Matrix → `ADR_IMPACT_MATRIX`
8. Module Catalog → `MODULE_CATALOG`

No other `_meta.json` structural changes.

### Technical Notes

- All eight files live at `docs/` root — cross-cutting derived indexes matching `docs/canon.md`, `docs/glossary.md`, `docs/decision-register.md`.
- Every file uses standard markdown frontmatter (`title`, `summary`, `layer: platform`, `owner: Platform`, `status: approved`, `updated`, `tags`, `document_type: Governance Guide`) and closes with a `## References` section.
- Every matrix/catalog/index header states it is a **derived document**; source files win on conflict.
- All derived documents SHOULD be regenerated or reviewed whenever an authoritative document is added, removed, renamed, or materially changed. They MUST NOT become independent sources of truth.
- Mermaid diagram in `DOCUMENT_TRACEABILITY.md` uses plain `graph TD` — no custom colors, no emojis.
- No edits to Passes 1–6 documents. `src/routeTree.gen.ts`, route files, styles, and packages remain untouched.

### Non-goals

No architecture changes, no engine changes, no ADR edits, no Module or Sprint PRDs, no new governance rules, no ownership changes, no business logic, no code or route changes.

### Acceptance Criteria

- Eight new files exist at `docs/` root with correct frontmatter.
- `DOCUMENT_TRACEABILITY.md` contains the Mermaid dependency diagram and all required sections.
- `ENGINE_USAGE_MATRIX.md` covers every engine in `ENGINE_CATALOG.md`.
- `ADR_IMPACT_MATRIX.md` covers every ADR in `ADR_INDEX.md`.
- `MODULE_CATALOG.md` lists every planned BusinessOS module or bounded context currently in scope, each with status `Planned`.
- `GLOSSARY_INDEX.md` is alphabetical and index-only (no new definitions).
- `REPOSITORY_MAP.md` covers every documentation layer with folder tree, ownership, purpose, authority.
- `DOCUMENT_INDEX.md` is an alphabetical inventory of every repository document with Layer, Status, Authority, and Path.
- `DOCUMENT_OWNERSHIP_MATRIX.md` contains one ownership row per documentation family, a Change Authority section, and a derived-document disclaimer.
- Each derived document includes the regeneration/review statement under a maintenance note.
- `docs/_meta.json` registers the eight guides in the specified order; no other structural changes.
- No source, config, schema, ADR, engine, or Passes 1–6 documents modified.

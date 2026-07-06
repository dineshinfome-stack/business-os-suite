## Pass 8.2.1 — Author SPR-MOD-001-001 (Tenancy Foundation) — COMPLETED

Stage 2 of the repository-wide `MODULE_IMPLEMENTATION_WORKFLOW.md`, applied to MOD-001. Produce the first implementation-ready Sprint PRD as a **gold-standard reference** for every subsequent sprint across all 18 modules.

## Scope (narrow and complete)

`SPR-MOD-001-001 Tenancy Foundation` covers only the foundational tenancy layer that every downstream sprint depends on:

- Tenant lifecycle: create, activate, suspend, archive
- Tenant identity (stable tenant ID, slug, display name)
- Tenant metadata (region, locale default, timezone, plan tier)
- Initial organization bootstrap (single seed company + default branch + default financial year placeholder)
- Tenant isolation enforcement (consumes ADR-011; not redefined)
- Audit integration for all tenant lifecycle transitions (consumes ENG-004)
- Tenant-scoped configuration initialization (consumes ENG-005)
- Feature flag initialization for the new tenant (consumes ENG-005)
- Events published: `tenant.created`, `tenant.activated`, `tenant.suspended`, `tenant.archived` (consumes ENG-024)

**Explicitly out of scope** (reserved for `-002` through `-006`): user management, RBAC, organization hierarchy management, localization pack activation, audit review UI.

## Deliverable

Create `docs/30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md` from `docs/99-templates/sprint-prd-template.md`, containing (in order):

1. **Frontmatter** — sprint_id, module_id `MOD-001`, size, status `Draft`, parent plan link.
2. **Objective and Scope** — one-paragraph objective; explicit in-scope / out-of-scope lists.
3. **Sprint Deliverables** *(new section, immediately after Objective and Scope)* — summarizes tangible outputs expected on completion: business capabilities delivered, documentation updates, published events, configuration artifacts, and any migration artifacts. Opens with the rule: *"Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done."*
4. **Traceability** — every feature mapped to a specific section of `MOD-001 MODULE_PRD.md` (Tenancy submodule).
5. **User Stories** — platform admin flows for each lifecycle transition and bootstrap.
6. **Acceptance Criteria** — Given/When/Then, observable and testable.
7. **Engine Consumption** — ENG-001, ENG-004, ENG-005, ENG-024 (required); ENG-002 read-only for context. No redefinition.
8. **ADR Consumption** — ADR-011, ADR-012, ADR-014, ADR-051. Accepted only.
9. **Data Model Impact** — conceptual entities, ownership, and relationships only. Includes the explicit sentence: *"Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs."*
10. **Events Published** — a table with columns **Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee**, referencing `docs/02-architecture/event-catalog.md`. Establishes event ownership up front.
11. **Definition of Done** — objective, checkbox-style, satisfies Sprint Authoring Guide §11.
12. **Sprint Exit Criteria** — copied verbatim from `MOD-001_SPRINT_PLAN.md` for `SPR-MOD-001-001`.
13. **Risks and Assumptions** — deferrals to `-002`–`-006` traced explicitly.
14. **Dependencies** — parent Module PRD `MOD-001`; prior sprints: none.
15. **Implementation Notes** *(bounded section, immediately before Review Gate)* — optional, non-authoritative. Opens with the rule: *"Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria."*
16. **Review Gate** — the seven-question self-validation block, each answered inline. Reusable pattern for future sprints.

## Governance Updates

- `docs/SPRINT_CATALOG.md` — register `SPR-MOD-001-001` with status `Draft` (first authored Sprint PRD registered in the Sprint Catalog).
- `docs/30-sprint-prds/platform/README.md` — link the Sprint PRD; update the placeholder table row for `-001`.
- `docs/DOCUMENT_INDEX.md`, `docs/DOCUMENT_TRACEABILITY.md`, `docs/DOCUMENT_OWNERSHIP_MATRIX.md`, `docs/_meta.json`, `docs/REPOSITORY_MAP.md` — register the new file.
- `.lovable/plan.md` — log Pass 8.2.1.

## Non-Goals

- No code, routes, packages, schemas, migrations, or UI changes.
- No changes to ADRs, engines, Module PRDs, `SPRINT_ROADMAP.md`, `SPRINT_DEPENDENCY_MATRIX.md`, `SPRINT_ESTIMATION_GUIDE.md`, `SPRINT_AUTHORING_GUIDE.md`, or `MODULE_IMPLEMENTATION_WORKFLOW.md`.
- No Sprint PRDs beyond `-001`; `-002` through `-006` remain planning reservations.
- No Module Baseline (Stage 3, Pass 8.2.Z).
- No physical schema (SQL, table DDL, index design) in the Sprint PRD.

## Sequencing After This Pass

- **Pass 8.2.2** — `SPR-MOD-001-002` (Organization Structure), reusing this gold-standard pattern (including Sprint Deliverables and Implementation Notes sections).
- **Pass 8.2.3–8.2.6** — Remaining Platform sprints.
- **Pass 8.2.Z** — `MOD001_PLATFORM_BASELINE_v1.md`.
- **Pass 8.3.0** — Stage 1 for MOD-002 Accounting.

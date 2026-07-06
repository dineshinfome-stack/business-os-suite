
# Pass 8.2.2 — Author SPR-MOD-001-002 (Organization Structure)

Stage 2 continuation of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-001. Produces the second implementation-ready Sprint PRD using the gold-standard structure established by `SPR-MOD-001-001`. Documentation-only pass.

## Deliverable

Create `docs/30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md` from `docs/99-templates/sprint-prd-template.md`, mirroring the 15-section body structure of Sprint 001 (numbered sections 1–15 below, preceded by frontmatter).

> The level of detail, terminology, section ordering, traceability conventions, and writing style SHOULD remain consistent with SPR-MOD-001-001 so that all Sprint PRDs evolve as a uniform documentation family. Improvements MAY be introduced where they clearly improve clarity or maintainability, but established governance patterns, document structure, and traceability conventions MUST remain consistent across authored Sprint PRDs.

### Frontmatter
- `sprint_id: SPR-MOD-001-002`, `module_id: MOD-001`, `iteration: Sprint 2`, `size: Medium`, `status: Draft`, `owner: Platform`
- `parent_module`, `parent_sprint_plan`, `related_engines: [ENG-001, ENG-004, ENG-005, ENG-024]`, `related_adrs: [ADR-011, ADR-012, ADR-014, ADR-051]`
- `updated: 2026-07-06`

### Section contents (15 sections, matching Sprint 001)

1. **Sprint Deliverables** — business capabilities expected at completion (org hierarchy Tenant→Company→Branch→FY, company/branch/FY lifecycles, default org + default FY, org-scoped configuration initialization, audit integration, published events). No implementation prescription.
2. **Objective and Scope** — one-paragraph objective; In Scope / Out of Scope subsections per the user's scope list (out-of-scope items reserved for later Platform sprints: user mgmt, roles, permissions, RBAC, auth, feature admin UI, localization activation, audit review UI, advanced company config, inter-company processing).
3. **Traceability** — table mapping each capability to Organization Structure section(s) of `docs/20-module-prds/platform/MODULE_PRD.md`. No orphans.
4. **User Stories** — Platform Administrator personas: company creation, branch creation, FY management (create/open/close/archive), hierarchy administration, default org and default FY setup.
5. **Acceptance Criteria** — Given/When/Then; observable, testable, business-focused.
6. **Engine Consumption** — ENG-001, ENG-004, ENG-005, ENG-024 (ENG-002 optional contextual). Consumption only; no engine behavior redefined.
7. **ADR Consumption** — ADR-011, ADR-012, ADR-014, ADR-051 (all Accepted).
8. **Data Model Impact** — conceptual entities (Company, Branch, FinancialYear, org-scoped configuration) with ownership and relationships. Include the verbatim disclaimer that physical schema design is out of scope.
9. **Events Published** — table with columns `Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee` for the 8 events (`company.created/updated/archived`, `branch.created/updated`, `financialyear.created/opened/closed`). Reference `docs/02-architecture/event-catalog.md`. No payloads/schemas.

   > **Event Ownership Convention** — The sprint that first introduces an event becomes the authoritative owner of that event. Subsequent Sprint PRDs MAY reference or consume the event but MUST NOT redefine its business meaning, ownership, or delivery guarantees. Any evolution of an existing event MUST be documented by updating the owning Sprint PRD (or its successor baseline), not by redefining the event in consuming Sprint PRDs.

10. **Definition of Done** — objective checklist per `SPRINT_AUTHORING_GUIDE.md`.
11. **Sprint Exit Criteria** — copied verbatim from `MOD-001_SPRINT_PLAN.md` for SPR-MOD-001-002.
12. **Risks and Assumptions** — deferred capabilities traced to reserved Platform sprints. Dependency assumption: *SPR-MOD-001-001 MUST be in the Done lifecycle state before implementation of this sprint begins. Documentation authoring may proceed while Sprint 001 is still in Draft or Planned, but implementation sequencing follows the dependency graph.*
13. **Dependencies** — Parent Module MOD-001; depends on SPR-MOD-001-001; no later-sprint dependencies.
14. **Implementation Notes** — optional, prefixed with the verbatim non-authoritative disclaimer.
15. **Review Gate** — reuse the seven-question Review Gate from Sprint 001.

If Sprint 001 on disk turns out to include a 16th section, add the same-named section to Sprint 002 verbatim so both PRDs remain structurally identical.

## Governance Updates

- `docs/SPRINT_CATALOG.md` — register `SPR-MOD-001-002 — Organization Structure` with status `Draft` (second authored Sprint PRD registered in the Sprint Catalog).
- `docs/30-sprint-prds/platform/README.md` — update the Platform sprint planning table so Sprint 002 links to the authored Sprint PRD.
- `docs/DOCUMENT_INDEX.md` — add exactly one entry in the S block for the new Sprint PRD (verify alphabetical placement; no duplicates).
- `docs/DOCUMENT_TRACEABILITY.md` — add row linking SPR-MOD-001-002 to MOD-001, consumed engines, and consumed ADRs.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — add ownership row for the new Sprint PRD.
- `docs/REPOSITORY_MAP.md` — add the file under the Platform sprint folder listing.
- `docs/_meta.json` — register the new document.
- `.lovable/plan.md` — append the Pass 8.2.2 execution record (preserves the historical execution log from prior passes).

## Not Changed

No code, schema, SQL, API contracts, or UI. No changes to ADRs, ERP Core Engines, Module PRDs, or the MOD-001 Sprint Plan. No Sprint PRDs beyond SPR-MOD-001-002. No Module Baseline.

## Verification

- Sprint PRD mirrors the gold-standard section structure of SPR-MOD-001-001 (15 sections, or matched section-for-section if Sprint 001 contains additional sections on disk).
- Every capability traces to the Platform Module PRD Organization Structure section(s).
- Only Accepted ADRs referenced.
- Engine behavior consumed, never redefined.
- All 8 events registered with ownership metadata and conform to the Event Ownership Convention (SPR-MOD-001-002 is the authoritative owner of the newly introduced events).
- Org hierarchy is independently demonstrable without later Platform sprints.
- `grep -n "SPR-MOD-001-002" docs/SPRINT_CATALOG.md` shows the new Draft row; both 001 and 002 listed.
- `grep -c "SPR-MOD-001-002" docs/DOCUMENT_INDEX.md` returns exactly 1 (in the S block).
- No authoritative document outside the Sprint PRD layer is modified except the required derived indexes.

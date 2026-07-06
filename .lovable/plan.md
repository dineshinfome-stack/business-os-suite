# Pass 8.2.4 — Author SPR-MOD-001-004 (Configuration Hierarchy)

Stage 2 continuation of `MODULE_IMPLEMENTATION_WORKFLOW.md` for MOD-001. Documentation-only pass producing the fourth Sprint PRD for the Platform module, structurally uniform with SPR-MOD-001-001, -002, and -003.

## 1. Author New Sprint PRD

**Create** `docs/30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md` using `docs/99-templates/sprint-prd-template.md` and mirroring the section ordering, terminology, tone, and traceability conventions of the prior three Platform Sprint PRDs.

### Frontmatter
```yaml
sprint_id: SPR-MOD-001-004
module_id: MOD-001
iteration: Sprint 4
size: Medium
status: Draft
owner: Platform
parent_module: MOD-001
parent_sprint_plan: MOD-001_SPRINT_PLAN.md
related_engines: [ENG-001, ENG-004, ENG-005, ENG-024]
related_adrs: [ADR-011, ADR-012, ADR-014, ADR-051]
updated: 2026-07-06
```

### Sections (identical structure to Sprint 003)
1. **Objective and Scope** — one-paragraph objective; explicit In Scope (tenant / company / branch / FY configuration, inheritance, override precedence, feature-flag configuration, business defaults, activation, version tracking, audit) / Out of Scope (localization packs, translation, audit review UI, advanced policy engine, dynamic scripting, workflow/notification/AI configuration, module-specific business settings).
2. **Sprint Deliverables** — configuration hierarchy at tenant/company/branch/FY scopes, inheritance model, override rules, feature-flag lifecycle, business preference management, effective-config resolution surface, audit artifacts, event contracts, documentation updates.
3. **Traceability to Module PRD** — map to MOD-001 MODULE_PRD §2 (Configuration), §5 (Configuration Setting), §6 (Configuration Change transaction), §7 (tenant-scoped versioning rule), §8 (ConfigurationChanged event), §10 (Configuration), §12 (Engine consumption).
4. **User Stories** — Platform Admin stories: configure defaults at each scope, override inherited settings, enable/disable feature flags, restore defaults, view effective configuration, audit configuration changes.
5. **Acceptance Criteria** — Given/When/Then covering hierarchy, inheritance precedence (Tenant → Company → Branch → FY), override behavior, defaults, feature-flag toggles, audit emission, and effective-configuration visibility.
6. **Parent Module Reference**.
7. **Dependencies** — upstream: SPR-MOD-001-001..003; downstream: -005, -006 and all later modules registering their own keys or reading effective configuration.
8. **ERP Core Engine Consumption** — ENG-001 (actor identity), ENG-004 (audit), ENG-005 (configuration store, inheritance, override resolution, and effective-configuration computation — authoritative, consumed), ENG-024 (eventing).
9. **ADR Consumption** — ADR-011, ADR-012, ADR-014, ADR-051 (Accepted only).
10. **Data Model Impact** — conceptual entities: Configuration Profile, Configuration Scope, Configuration Override, Business Preference, Feature Flag, Effective Configuration. Standard "physical schema is implementation work" disclaimer.
11. **Events Published** — table `Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee`. Events: `configuration.created`, `configuration.updated`, `configuration.deleted`, `configuration.overridden`, `configuration.inherited`, `featureflag.enabled`, `featureflag.disabled`. Event Ownership Convention block applied.
12. **Definition of Done** — objective checklist per SPRINT_AUTHORING_GUIDE.md.
13. **Sprint Exit Criteria** — copied verbatim from `MOD-001_SPRINT_PLAN.md` §2 (SPR-MOD-001-004).
14. **Risks and Assumptions** — upstream sprints Done; ADRs Accepted; module-owned keys remain in their owning modules; localization/workflow/notification/AI config deferred; version-tracking and override precedence enforced atomically.
15. **Test Strategy Summary** — references authoritative testing standard; unit, integration, contract, end-to-end smoke covering hierarchy resolution.
16. **Implementation Notes** — non-authoritative guidance disclaimer retained.
17. **Review Gate** — reusable self-validation block, answers inline to Sprint 004.
18. **References**.

### Boundary Preservation
- ADR-025 (Feature Flags) and ADR-026 (Configuration Hierarchy) are **Proposed** per the Stage 1 plan and are NOT referenced. Sprint 004 relies only on Accepted ADRs listed in the frontmatter, matching the pattern used by Sprint 003.
- `ENG-005` is consumed as the authoritative configuration engine; hierarchy semantics are not redefined here.

### Governance Callouts (added in §1 / §8, cross-referenced from §10)
Two governance callouts — modeled on the established "Event Ownership Convention" pattern — placed in the Objective and Scope section and cross-referenced from §8 Engine Consumption and §10 Data Model Impact:

> **Effective Configuration Convention.** *Sprint 004 defines the business hierarchy and ownership of configuration scopes (Tenant → Company → Branch → Financial Year). The algorithm used to resolve the **effective configuration value** across these scopes is owned by the Configuration Engine (`ENG-005`) and is consumed by this Sprint PRD without redefinition. Downstream modules MUST read effective configuration through `ENG-005` and MUST NOT re-implement hierarchy resolution locally.*

> **Configuration Ownership Convention.** *Each business module owns the definition of its configuration keys and their business semantics, while `ENG-005` owns storage, inheritance, override resolution, and effective-configuration computation. Business modules own **what a setting means**; `ENG-005` owns **how configuration values are stored and resolved**.*

Together these callouts complement the Event Ownership Convention without introducing any new governance model, and prevent documentation drift as later modules (Accounting, Inventory, HRMS, Payroll, Projects, …) register keys and consume effective configuration.

## 2. Governance Registrations (derived docs)

- **`docs/SPRINT_CATALOG.md`** — append one Draft row for SPR-MOD-001-004.
- **`docs/30-sprint-prds/platform/README.md`** — replace Sprint 004 "Planned" placeholder row with a link to the authored PRD; status `Draft (authored, Stage 2)`.
- **`docs/DOCUMENT_INDEX.md`** — exactly one entry in the S block.
- **`docs/_meta.json`** — register the document exactly once under the platform sprint folder.
- **`.lovable/plan.md`** — append Pass 8.2.4 execution record (preserving prior 8.2.2 / 8.2.2.1 / 8.2.3 history).

Note on `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md`, `REPOSITORY_MAP.md`: these describe Sprint PRDs as a **category** (no per-sprint rows for Sprint 001/002/003 exist). Following the established pattern for the Sprint PRD family, no per-sprint entry is added; the category rows already cover Sprint 004.

## 3. Repository Verification (SPRINT_AUTHORING_GUIDE.md §13)

Run all five gates:
1. **Document Index** — exactly one entry for SPR-MOD-001-004.
2. **Sprint Catalog** — exactly one Draft row with parent MOD-001.
3. **Sidebar / module README** — Sprint 004 links to authored PRD.
4. **Structural Consistency** — matches Sprint 003 (heading count, ordering, disclaimer text, Event Ownership Convention block, Review Gate). The two new governance callouts follow the same style as the Event Ownership Convention and do not alter structural counts.
5. **Traceability & Governance Cross-Checks** — Module PRD, Sprint Plan, `_meta.json`, and category rows in Ownership Matrix / Traceability / Repository Map all synchronized.

## Not Changed

No code, schema, SQL, migrations, APIs, UI, Module PRDs, ERP Core Engines, ADRs, Sprint Plans, or workflow documents.

## Outcome

SPR-MOD-001-004 authored as a Draft Sprint PRD in the Platform Sprint PRD family, with the Effective Configuration Convention and the Configuration Ownership Convention preventing downstream hierarchy-resolution drift and clarifying separation of responsibilities between business modules and `ENG-005`. All derived indexes synchronized and §13 verification gates passing. Positions MOD-001 to proceed to Pass 8.2.5 (Sprint 005 — Localization Packs).

---

## Execution Record — Pass 8.2.4

**Completed:** 2026-07-06.

**Files created:**
- `docs/30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md` — includes the two new governance callouts (Effective Configuration Convention, Configuration Ownership Convention) in §1, cross-referenced from §8 and §10.

**Files edited (governance sync):**
- `docs/SPRINT_CATALOG.md` — added Draft row for SPR-MOD-001-004.
- `docs/DOCUMENT_INDEX.md` — added S-block entry for SPR-MOD-001-004.
- `docs/30-sprint-prds/platform/README.md` — Sprint 004 row now links to the authored PRD; status Draft (authored, Stage 2).
- `docs/_meta.json` — registered document exactly once under the platform sprint folder.

**Repository Verification (SPRINT_AUTHORING_GUIDE.md §13):**
- DOCUMENT_INDEX.md — 1 entry for SPR-MOD-001-004.
- SPRINT_CATALOG.md — 1 Draft row with parent MOD-001.
- Module README — Sprint 004 row updated with authored link.
- Structural consistency — mirrors SPR-MOD-001-003 (Frontmatter Summary + 18 top-level sections, identical ordering, same disclaimers, same Event Ownership Convention, same Review Gate). The two new governance callouts follow the Event Ownership Convention style and do not alter structural counts.
- Traceability / governance cross-checks — Module PRD §§2, 5, 6, 7, 8, 10, 12 all mapped in §3; Sprint Plan §2 exit criteria copied verbatim into §13; ownership, traceability, and repository map already handle Sprint PRDs as a category.

**Not changed:** No code, schema, SQL, migrations, APIs, UI, Module PRDs, ERP Core Engines, ADRs, Sprint Plans, or workflow documents.

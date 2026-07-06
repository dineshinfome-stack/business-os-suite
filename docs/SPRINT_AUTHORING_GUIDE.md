---
title: "Sprint Authoring Guide"
summary: "Authoritative methodology for authoring Sprint PRDs — decomposition, vertical slicing, traceability, sizing, sequencing, and completion rules that every Pass 8.x Sprint PRD MUST follow."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-06"
tags: ["sprint", "prd", "authoring", "methodology", "governance"]
document_type: "Sprint Layer Guide"
---

# Sprint Authoring Guide

> **Authoritative for Sprint PRD authoring.** This guide defines *how* Sprint PRDs are written. It does not define *what* they contain — the Sprint PRD template (`docs/99-templates/sprint-prd-template.md`) does. This guide **consumes** upstream layers (Canon, Architecture, ERP Core Engines, ADRs, Module PRDs) and never redefines them. On any conflict, the upstream authoritative document wins.

## 1. Purpose

Every Sprint PRD across every module MUST be authored using the methodology defined here. The goal is consistency: sprints authored by different teams, at different times, should look and behave the same way. This guide is the bridge between the frozen Module PRD layer (Pass 7) and implementation execution (Pass 8.x and beyond).

## 2. Sprint Decomposition Philosophy

A Module PRD (`MOD-NNN`) describes an entire business capability. A Sprint PRD (`SPR-MOD-NNN-NNN`) delivers an implementation-ready slice of that capability.

Decomposition rules:

- Start from the parent Module PRD's Sections (features, user stories, acceptance criteria).
- Group requirements that together form a **complete usable capability**.
- Prefer *narrow-and-complete* over *broad-and-partial*. Multiple small sprints that each deliver end-to-end value beat one large sprint that delivers half of everything.
- A Sprint PRD MUST NOT introduce business requirements that are not already captured in the parent Module PRD.

## 3. Vertical Slice Principles

Every Sprint PRD SHOULD deliver a **vertical slice**:

- UI (screens, components, flows) where the capability is user-facing.
- Server logic (server functions, server routes) implementing the capability.
- Data model changes (migrations, RLS, grants) required by the capability.
- Tests (unit, integration, and where relevant end-to-end) validating the capability.
- Observability hooks (logs, metrics, audit events) consistent with the platform standard.

Horizontal-only sprints (schema-only, UI-only, refactor-only) are permitted only when they are prerequisites for an immediately-following vertical sprint and are explicitly justified in the Sprint PRD's "Risks and Assumptions" section.

## 4. Sprint Sizing Guidelines

Sprint size categories (Small / Medium / Large) are defined in `docs/SPRINT_ESTIMATION_GUIDE.md`. That document is the single source of truth for sizing criteria. Do not introduce story points, hours, or team-velocity estimates in a Sprint PRD.

## 5. Dependency Handling

A Sprint PRD MUST declare its upstream dependencies explicitly:

- **Parent Module PRD** (exactly one, referenced by `MOD-NNN`).
- **ERP Core Engines** consumed, each referenced by `ENG-NNN`.
- **ADRs** consumed, each referenced by `ADR-NNN`.
- **Preceding Sprint PRDs** whose output the sprint depends on, referenced by `SPR-MOD-NNN-NNN`.

Cross-module dependencies MUST already exist in `docs/module-dependency-matrix.md`. If a required cross-module dependency is not present there, the sprint cannot proceed — the dependency graph is updated through governance, not through a Sprint PRD.

## 6. Engine Consumption Rules

ERP Core Engines are consumed, never redefined:

- Sprint PRDs invoke engines through their published contracts.
- A Sprint PRD MAY specify additional configuration values or event subscriptions consistent with the engine's contract.
- A Sprint PRD MUST NOT extend, override, or restate engine behavior. If new engine behavior is required, that is an upstream change (new/revised `ENG-NNN`) done through governance, not through a sprint.

## 7. ADR Reference Rules

- Sprint PRDs reference only **Accepted** ADRs.
- A **Proposed** ADR MAY be referenced only when it is explicitly listed as an *awaited dependency* of the sprint; the sprint cannot enter `In Progress` until that ADR is Accepted.
- Sprint PRDs never propose new ADRs. If the sprint reveals a new architectural decision, pause the sprint and raise the ADR through governance.

## 8. Module Traceability Rules

Every feature in a Sprint PRD MUST trace back to specific sections of the parent Module PRD. Use explicit references (module section headings or requirement IDs) so a reviewer can validate scope alignment without guessing.

## 9. Sprint Traceability Rule

Every Sprint PRD SHOULD trace each feature back to exactly one parent Module PRD section. A sprint MAY implement multiple related requirements from the same Module PRD but SHOULD avoid spanning unrelated module capabilities. If a sprint must satisfy requirements from multiple modules, the dependency MUST already exist in the Module Dependency Graph (`docs/module-dependency-matrix.md`).

## 10. Acceptance Criteria Writing Standards

- Use **Given / When / Then** phrasing.
- Every acceptance criterion MUST be **observable** — a reviewer or automated test can determine pass/fail from external behavior alone.
- Avoid implementation-language criteria ("uses X library", "calls Y function"). Describe outcomes.
- Every user story MUST have at least one acceptance criterion.

## 11. Definition of Done

A sprint is `Done` when:

- All acceptance criteria pass, verified by tests wherever automatable.
- Code merged behind any required feature flags with rollout plan captured in the Sprint PRD.
- Observability requirements (logs, metrics, audit events) met per the platform standard.
- Documentation (user-facing and developer-facing) updated where the sprint changes behavior.
- Security review completed for any sprint touching authentication, RLS, sensitive data, or public endpoints.
- Sprint PRD's own "Definition of Done" section (per the template) is fully satisfied.

Authoritative testing and observability standards live in the Architecture and Foundation layers; do not restate them in a Sprint PRD, reference them.

## 12. Sprint Completion Rule

A Sprint PRD SHOULD implement one or more complete business capabilities within its declared scope. A sprint MAY leave future enhancements for subsequent sprints, but it SHOULD NOT intentionally leave partially implemented functionality that cannot be exercised or validated independently. If unavoidable due to external dependencies, the incomplete capability MUST be explicitly documented under "Risks and Assumptions" and traced to the planned follow-up Sprint PRD.

## 13. Sprint PRD Repository Verification Pattern

After a Sprint PRD is authored and before the authoring pass is considered complete, perform a lightweight repository consistency check to ensure the Sprint PRD library remains synchronized, traceable, and internally consistent.

This verification pattern applies to every Sprint PRD authoring pass (Pass 8.x onward) and is independent of any specific module or sprint.

### 13.1 Verification Checklist

For the newly authored Sprint PRD (`SPR-MOD-NNN-NNN`):

1. **Document Index**
   - Verify the new Sprint PRD appears exactly once in `docs/DOCUMENT_INDEX.md`.
   - `grep -c "SPR-MOD-NNN-NNN" docs/DOCUMENT_INDEX.md` must return `1`.

2. **Sprint Catalog**
   - Verify the Sprint PRD is registered exactly once in `docs/SPRINT_CATALOG.md` with the correct parent module and status `Draft` at the time of authoring.
   - `grep -n "SPR-MOD-NNN-NNN" docs/SPRINT_CATALOG.md` must return exactly one row.

3. **Sidebar Registration**
   - Verify `docs/_meta.json` contains a single registration entry for the new Sprint PRD title and path.
   - No duplicate sidebar entries.

4. **Structural Consistency**
   - Compare the section headings of the new Sprint PRD with the most recent approved Sprint PRD in the same module. Where no prior Sprint PRD exists, compare against the repository's established gold-standard Sprint PRD.
   - Verify identical section ordering, identical governance sections, consistent terminology, and consistent traceability conventions.
   - If the reference Sprint PRD contains an additional section, the new Sprint PRD MUST contain the same-named section in the corresponding location.

5. **Traceability and Governance Cross-Checks**
   - Verify every feature in the Sprint PRD traces back to the parent Module PRD (Section 8 / Section 11).
   - Verify only Accepted ADRs are consumed (Section 7 / Section 9).
   - Verify ERP Core Engines are consumed, not redefined (Section 6 / Section 8).
   - Verify the module subfolder README (`docs/30-sprint-prds/<module>/README.md`) links to the new Sprint PRD and reflects its current status.

### 13.2 Acceptance of the Verification Pattern

A Sprint PRD authoring pass is considered complete only if:

- `DOCUMENT_INDEX.md` contains exactly one entry for the new Sprint PRD.
- `SPRINT_CATALOG.md` contains exactly one row for the new Sprint PRD with the correct parent module and status.
- `_meta.json` registers the new Sprint PRD exactly once.
- The new Sprint PRD is structurally consistent with the most recent approved Sprint PRD in the same module, or the repository's established gold-standard Sprint PRD if no prior Sprint PRD exists.
- All upstream traceability and governance cross-checks pass.

### 13.3 Purpose

These checks are intentionally lightweight and serve as a repository hygiene gate before the next Sprint PRD authoring pass begins. They help prevent duplicate registrations, documentation drift, and structural inconsistencies as the Sprint PRD library grows across all modules.

## 14. Sprint Sequencing Rules

Sprint ordering follows the allowable implementation order defined in `docs/SPRINT_DEPENDENCY_MATRIX.md`. Within a module, sprints proceed sequentially by `SPR-MOD-NNN-NNN` unless the Sprint PRDs themselves declare a compatible parallelism (independent slices, no shared migrations).

Cross-module rule: a Sprint PRD in module *A* that depends on module *B* MUST NOT enter `In Progress` before the required Sprint PRDs in module *B* are `Done`.

## 14. References

- `docs/30-sprint-prds/README.md`
- `docs/99-templates/sprint-prd-template.md`
- `docs/SPRINT_ROADMAP.md`
- `docs/SPRINT_ESTIMATION_GUIDE.md`
- `docs/SPRINT_DEPENDENCY_MATRIX.md`
- `docs/SPRINT_CATALOG.md`
- `docs/MODULE_CATALOG.md`
- `docs/module-dependency-matrix.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md`

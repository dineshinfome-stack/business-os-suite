# Revision 3.2 — Repository Navigation Standard (Formal Adoption)

## Objective

Formally adopt the current Business OS workflow-based navigation architecture as the official repository navigation standard. Governance-only pass — no sidebar, renderer, route, or document changes. Governance is written as a timeless standard; the Revision 3.1 pass is cited only as the initial implementation.

## Scope

- **Change:** Author one new governance document. Append a short pointer to `.lovable/plan.md`.
- **No change:** `docs/_meta.json`, any existing markdown document, `src/lib/docs.ts`, routes, search index, module content, `SOLUTION_STATUS.md`.

## Deliverables

### A. New governance document

`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`

Filename chosen to make clear this governs repository documentation navigation, not application/UI navigation.

Frontmatter aligned with `GOVERNANCE_FRONTMATTER_STANDARD.md`: title, summary, layer=platform, owner=Platform, status=approved, updated=2026-07-19, version=1.0, supersedes=[], tags=["governance","navigation","standard"].

Body sections — written as an enduring standard, not tied to a revision number:

1. **Purpose & Authority** —
   > "This document formally adopts the current Business OS workflow-based navigation architecture as the approved repository navigation standard. The initial implementation of this standard was completed under Workflow-Based Sidebar Reorganization (Revision 3.1). Future refinements do not invalidate this standard unless it is formally revised through governance."
   Positioned as part of the Business OS governance framework.
2. **Mandatory Navigation Contract** — 8-row module contract (Overview → Baseline → Publication → WEB SD → Mobile SD → API SD → Cross-Platform Certification → Sprints). "Only documents that exist shall appear; no placeholder entries."
3. **Delivery Standard** — 8 execution artifacts (Implementation Planning, Engineering Execution, Engineering Completion, System Verification, User Acceptance, Release Readiness, Production Release, Post-Release Verification) remain centralized under global `Delivery — <Phase>` groups. Inputs vs. history distinction.
4. **Applicability** — MOD-001..MOD-019, MOD-020+, AI modules, industry extensions, plug-ins, all future documentation additions.
5. **Governance Rule** — Any deviation requires formal governance approval before navigation architecture changes. Individual documents may evolve; architecture stays stable unless formally revised.
6. **Repository Principles** — Repository is single source of truth. Navigation never duplicates documentation. Sanctioned duplicate nav entry points: `SOLUTION_STATUS`, `BUSINESS_OS_EXECUTION_ROADMAP`, Sprint PRDs.
7. **Future Module Standard** — Future modules shall not introduce additional lifecycle sections, execution history, duplicate engineering artifacts, or module-specific navigation structures without governance approval.
8. **Stability Policy** — Navigation architecture remains stable across releases; new modules integrate into the existing model. Ensures consistent DX, predictable Lovable AI workflow, simpler onboarding, long-term maintainability.
9. **Cross-References** — `docs/_meta.json` (current implementation), `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`, `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json`, `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`. Historical note referencing Revision 3.1 as the initial implementation only.
10. **Success Criteria** — Standard exists; sidebar unchanged; future modules inherit the contract; delivery artifacts remain centralized.

### B. Sidebar exposure — deferred

Adding a nav entry would touch `docs/_meta.json`, which this revision forbids. Document reachable via its `/docs/...` route and via later cross-references from `MODULE_IMPLEMENTATION_WORKFLOW.md` (future pass).

### C. Plan log

Append a short "Revision 3.2 Addendum — Repository Navigation Standard" section to `.lovable/plan.md` pointing to the new document. No structural rewrite.

## Out of Scope

- Any change to `docs/_meta.json` (sidebar remains byte-identical).
- Edits to `MODULE_IMPLEMENTATION_WORKFLOW.md`, module PRDs, publications, solution designs.
- Repository restructuring, renaming, or route change.
- `SOLUTION_STATUS.md` update (this is governance registration, not a lifecycle state change).

## Success Criteria

- `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` exists with conforming frontmatter and timeless wording (no hardcoded dependency on Revision 3.1 in the normative sections).
- Revision 3.1 sidebar remains byte-identical.
- Standard is discoverable via direct route and `.lovable/plan.md` addendum.
- Governance layering: Governance Framework → Repository Navigation Standard → Workflow-Based Sidebar → Modules.

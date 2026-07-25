# Plan B1 — MOD-001 Platform Foundation PRD Authoring

Documentation-only phase. No source code, migrations, Solution Design, Sprint Plan, or Baseline changes. All three PRDs inherit ADR-017 by reference, never restate it.

## 0. Precondition Verification (read-only)

Before authoring, read and confirm each is current/approved:

1. `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md` (accepted)
2. `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md` (active)
3. `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md` (active)
4. `docs/50-audit-reports/ARCHITECTURE_BASELINE_SYNC_ADR017_REPORT.md` (freeze approved)
5. `docs/15-governance/TENANCY_STANDARD.md` v2.0
6. `docs/50-audit-reports/MOD001_V2_ARCHITECTURE_REFRESH_REPORT.md`

Also review for reuse (no duplication):
- `docs/99-templates/sprint-prd-template.md`
- `docs/SPRINT_AUTHORING_GUIDE.md`, `SPRINT_ESTIMATION_GUIDE.md`, `SPRINT_DEPENDENCY_MATRIX.md`
- `docs/30-sprint-prds/platform/README.md` and existing v1 PRDs `SPR-MOD-001-001..003-*.md`
- `docs/20-module-prds/platform/MODULE_PRD.md`
- `docs/glossary.md`, `docs/GLOSSARY_INDEX.md`, `docs/ADR_IMPACT_MATRIX.md`
- `docs/module-dependency-matrix.md`, capability registry, EEMP, IMP indexes

If any precondition fails → STOP and escalate; do not author.

## 1. Repository Reuse Review (Mandatory)

Before authoring each Sprint PRD, perform an explicit reuse assessment against:

- Corresponding v1 Sprint PRD
- MODULE_PRD (MOD-001)
- MOD-001 Baseline v2
- ADR-017
- TENANCY_STANDARD v2.0
- Capability Registry
- EEMP
- IMP

For every major section of each new PRD, record exactly one outcome: **Reused unchanged**, **Updated from existing content**, or **Newly authored**. Capture the outcomes in a "Reuse Provenance" table inside each PRD and aggregate them in the Phase B1 Authoring Report. Duplicated repository standards or governance text already published elsewhere are forbidden — reference by ID instead.

## 2. Deliverables (5 files)

New files under `docs/30-sprint-prds/platform/`:

1. `SPR-MOD-001-001-platform-and-tenant-provisioning.md` (v2)
2. `SPR-MOD-001-002-workspace-and-organization-foundation.md` (v2)
3. `SPR-MOD-001-003-identity-and-access-foundation.md` (v2)
4. `MOD-001_PHASE_B1_CROSS_PRD_CONSISTENCY_MATRIX.md`

New audit report:

5. `docs/50-audit-reports/MOD001_PHASE_B1_PRD_AUTHORING_REPORT.md`

Existing v1 PRDs are **not** deleted or edited beyond the "superseded by v2" banners added in Plan A. New v2 files use the filenames above so v1 identifiers remain permanent per Sprint Authoring Guide; Sprint Plan v2 already maps SPR-MOD-001-001..003 to the v2 scope.

## 3. Common PRD Structure

Each Sprint PRD follows `docs/99-templates/sprint-prd-template.md` and contains the 12 sections in the request: Overview, Scope, Functional Requirements, NFRs, UX, Technical Design Considerations, Security, Acceptance Criteria, Testing Strategy, Deliverables, Completion Criteria, Traceability.

Additional mandatory sections:

- **Change Log from v1** — explicit diff summary vs. corresponding v1 PRD, with ADR-017 rationale.
- **Reuse Provenance** — outcomes from §1 per major section.

Requirement numbering: `FR-<sprint>-NNN`, `NFR-<sprint>-NNN`, `AC-<sprint>-NNN`.

Common inheritance block references ADR-017, TENANCY_STANDARD v2.0, and Baseline v2 by ID only; does not restate invariants.

## 4. Sprint-Specific Scope

### SPR-MOD-001-001 — Platform & Tenant Provisioning
Tenant lifecycle states, tenant registration intake, dedicated-DB provisioning workflow, schema + migration bootstrap, initial configuration, license initialization (Platform DB), logical Workspace bootstrap, default Company + Financial Year seeding in the new Tenant DB, Tenant Admin creation, provisioning orchestration, failure recovery / retry, provisioning audit + events, decommissioning prerequisites (planning-only). Explicitly cites R6 (no cross-tenant queries) and Platform-vs-Tenant DB split.

### SPR-MOD-001-002 — Workspace & Organization Foundation
Logical Workspace surface (no `workspaces` table, no `workspace_id`), Company/Branch/Financial Year lifecycles inside the Tenant DB, hierarchy + ownership rules, navigation model, configuration inheritance Tenant → Company → Branch, org boundary rules, audit + event model.

### SPR-MOD-001-003 — Identity & Access Foundation
Platform Super Admin (Platform DB), Tenant Admin / Company Admin / Employee (Tenant DB), identity + membership models, roles, permissions, permission inheritance, authentication flow with tenant resolution before DB connection, authorization model, session model, audit events, future SSO / MFA considerations (planning only).

## 5. Cross-PRD Consistency Matrix

`MOD-001_PHASE_B1_CROSS_PRD_CONSISTENCY_MATRIX.md` verifies across the three PRDs: terminology identical, architecture identical, lifecycle consistent, event naming consistent, dependency ordering correct, no duplicated standards, no conflicting ownership, identical ADR references, valid capability references, no shared-database wording remains. Table with pass/fail per axis per PRD pair.

## 6. Phase B1 Authoring Report

`MOD001_PHASE_B1_PRD_AUTHORING_REPORT.md` contains: repository discovery summary, documents reviewed, reuse-provenance rollup (§1), PRDs authored, traceability summary, cross-PRD consistency results, traceability coverage results (§7), PRD dependency validation results (§7), risks, outstanding decisions, recommendations for Phase B2 (SPR-MOD-001-004..007).

## 7. Verification Checklist (in audit report)

- ADR-017 inherited unchanged; Baseline Freeze respected.
- No implementation guidance contradicts ADR-017.
- No source / SQL / Solution Design / Sprint Plan / Baseline changes.
- No governance regressions; no `workspaces` table proposed; no shared-DB wording.
- Every business-data statement lives inside the Tenant DB.
- **PRD Traceability Coverage:** every `FR-*` traces to at least one Capability, ADR, Module objective, and Acceptance Criterion. **Zero orphan Functional Requirements permitted.** Per-PRD FR-count-vs-linked-count table with orphan list (must be empty to pass).
- **PRD Dependency Validation:** every dependency declared by SPR-MOD-001-001/-002/-003 is satisfied by an approved Architecture artifact, an approved Module Baseline, or an earlier Sprint PRD. No Sprint PRD may depend on functionality first introduced in a later sprint. Report: (a) dependency graph across the three PRDs and their upstream artifacts, (b) cyclic dependency check — must be zero, (c) forward dependency check — must be zero.
- Reuse Provenance recorded for every major section of every PRD.

## 8. Stop Rule

After all 5 deliverables are published: STOP. Do not begin Phase B2 (SPR-MOD-001-004..007). Await Architecture Board approval.

## Technical Notes

- Files only under `docs/`. No `src/`, `supabase/`, `scripts/` touched.
- Sprint filenames use v2-scope slugs listed in §2; v1 files retained with existing superseded banners.
- Each PRD stays within repository PRD length norms; deep specifics defer to Solution Design (Phase C, not authorized here).

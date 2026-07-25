# Phase 0 (v4) — Engineering Readiness + Reuse-Before-Build Rule

**Mode:** Documentation-only. No code, schema, migration, route, component, ADR, PRD, or baseline changes. Publishes the "Reuse Before Build" governance standard and six evidence-backed engineering-readiness documents preceding SPR-MOD-001-001.

## Objective

1. Codify **Reuse Before Build** as a permanent global engineering rule.
2. Publish Phase 0 readiness reports (health, technical debt, checklist, summary).
3. Publish the **Reuse Inventory**, **Duplicate/Superseded Detection**, **Engineering Blockers**, and **Dependency Readiness** reviews so SPR-MOD-001-001 begins with an actionable, traceable map.

## New Governance Standard

`docs/15-governance/REUSE_BEFORE_BUILD_STANDARD.md` — permanent global rule:

- Priority order: **Reuse → Extend → Refactor → Defer → Create**.
- Mandatory pre-implementation discovery (Layouts, Pages, Components, Auth, Services, Hooks, Utilities, Styling).
- Every sprint publishes a Reuse Analysis using the fixed inventory schema below.
- Restrictions: no duplicate sidebar, dashboard layout, auth system, Supabase client, services, hooks, or UI primitives.
- Every `CREATE`, `REFACTOR`, and `DEFER` decision requires written justification.
- Acceptance criteria reused as sprint DoD addendum; sprint audit reports must cite this standard.
- Cross-refs: EEMP Ch. 03 & 04, REPOSITORY_NAVIGATION_STANDARD, FINDING_SEVERITY_STANDARD.
- Frontmatter v1.0.0, Approved, Active + Revision History.

## Terminology (consistent across all Phase 0 documents)

- **Finding fields:** Severity · Evidence · Impact · Recommendation · **Disposition** (Blocker / Pre-Phase-2 Recommendation / Future Improvement / Technical Debt).
- **Duplicate Detection Classification:** Active / Legacy / Superseded / Duplicate / Unknown.
- **Reuse Confidence:** High / Medium / Low (see schema).
- **Dependency Implementation Risk:** Low / Medium / High.

## Discovery Order (read-only)

1. `docs/11-adrs/architecture/ADR-017`
2. `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`
3. `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md` + `SPR-MOD-001-001` PRD
4. `docs/15-governance/*`
5. Prior audit reports under `docs/50-audit-reports/`, `docs/51-architecture-validation/`, `docs/57-…`, `docs/58-…`, `docs/60-release-readiness/`, `docs/62-post-release-verification/` — reused as sources of existing finding IDs (see Cross-Reference rule below).
6. Repo surface: `src/router.tsx`, `src/routes/**`, `src/components/**`, `src/dashboard/template/**`, `src/contexts/**`, `src/hooks/**`, `src/lib/**`, `src/integrations/supabase/**`, `src/config/**`, `src/utils/**`
7. Build tooling: `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `playwright.config.ts`

## Validation Coverage (12 areas)

Repository Health · Folder Structure · Tech Stack · Environment · Authentication · Routing · UI Framework · Supabase · Security · Code Quality · Testing · Build. Each finding records: **Severity · Evidence · Impact · Recommendation · Disposition**. No fixes.

## Reuse Inventory — Fixed Schema

| Field | Description |
|---|---|
| Component | Item being reviewed |
| Repository Evidence | File path(s) |
| Current Capability | What it already does |
| Gap | What's missing for SPR-MOD-001-001 |
| Recommendation | REUSE / EXTEND / REFACTOR / DEFER / CREATE |
| Reuse Confidence | High / Medium / Low |
| Justification | Required for REFACTOR, DEFER, CREATE |
| Suggested Owner | Platform UI / Security / Platform Backend / Infrastructure / Data — **advisory only; does not modify repository ownership or governance responsibilities** |

Decision definitions (also codified in the standard):
- **REUSE** — use as-is (typically High confidence).
- **EXTEND** — add functionality without altering existing behavior.
- **REFACTOR** — improve without changing behavior.
- **DEFER** — exists, not needed for SPR-MOD-001-001, remains untouched.
- **CREATE** — no reusable asset exists.

Categories: Layouts · Navigation · Pages · Shared Components · Dashboard Template · Auth · Supabase Integration · Services / Server Functions · Hooks · Contexts · Utilities · Styling.

## Duplicate & Superseded Detection

Record every occurrence and classify without deleting anything in Phase 0. Scope: duplicate pages, layouts, navigation entries, hooks, services, dashboard widgets, obsolete/orphaned components. Fields: item · evidence · **Classification** (Active / Legacy / Superseded / Duplicate / Unknown) · successor pointer where known · **existing finding reference** (see below).

## Dependency Readiness

For each shared platform dependency required by MOD-001, record two fields:

- **Availability:** Exists / Missing / Partial / Not Required
- **Implementation Risk:** Low / Medium / High

Dependencies: authentication · RBAC · navigation · configuration · logging · notifications · feature flags · audit infrastructure · error handling.

## Engineering Blockers

Rolled up from finding **Dispositions** across all Phase 0 documents into a single verdict in the Readiness Report: **GO / GO WITH OBSERVATIONS / BLOCKED**.

## Cross-Reference Rule

If Phase 0 identifies a duplicate, technical debt, or blocker item already documented in an existing audit report, **reference the existing finding ID** instead of assigning a new one. Only genuinely new items get Phase 0 identifiers (format `PH0-<AREA>-<NNN>`).

## Deliverables (1 governance standard + 6 Phase 0 documents)

1. `docs/15-governance/REUSE_BEFORE_BUILD_STANDARD.md`
2. `docs/60-engineering/PHASE0_ENGINEERING_READINESS_REPORT.md` — exec summary, verdict, exit-criteria matrix, cross-refs, **and a single-page Implementation Readiness Summary table** with the following rows: Repository Health · Architecture Alignment · Authentication · Navigation · Supabase · Technical Debt · Blockers · Reuse Inventory · Duplicate Review · Dependency Readiness · **Phase 1 Decision (GO / GO WITH OBSERVATIONS / BLOCKED)**.
3. `docs/60-engineering/PHASE0_REPOSITORY_HEALTH.md` — areas 1, 3, 4, 8, 12.
4. `docs/60-engineering/PHASE0_TECHNICAL_DEBT.md` — areas 2, 5, 6, 7, 9, 10, 11.
5. `docs/60-engineering/PHASE0_IMPLEMENTATION_READINESS_CHECKLIST.md` — PASS/FAIL/N/A per exit criterion + evidence pointer.
6. `docs/60-engineering/PHASE0_REUSE_INVENTORY.md` — full inventory using the fixed schema, plus a scoped **"SPR-MOD-001-001 Reuse Analysis"** section cited by the sprint's implementation plan. Includes the Duplicate/Superseded Detection and Dependency Readiness subsections.

All documents use Business OS frontmatter + Revision History table.

## Exit Criteria

- Reuse Before Build standard published.
- Repository builds (dev + prod) verified read-only.
- No Blocker-Disposition findings outstanding.
- Stack, env, auth, routing, Supabase integration validated.
- Reuse Inventory covers every category with file-path evidence and Reuse Confidence.
- Duplicate/Superseded Detection completed; existing finding IDs reused where applicable.
- Dependency Readiness recorded for all nine dependencies with Availability + Implementation Risk.
- **Every planned CREATE action reviewed and confirmed that no reusable repository asset satisfies the requirement.**
- Implementation Readiness Summary table published in the Readiness Report.
- All seven documents published.

## Stop Rule

After publishing the seven documents: **STOP.** No implementation of SPR-MOD-001-001, no new platform code, no database objects, no UI. Await explicit authorization for Phase 1.

## Out of Scope

Business logic, UI, DB, migrations, APIs, components, routes, architecture, ADR/PRD/Baseline edits, dependency upgrades, deletion of duplicate/superseded assets, "quick fixes" surfaced during validation, EEMP chapter body edits.

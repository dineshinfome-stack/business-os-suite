---
title: "MOD-001 v2 Architecture Refresh — Audit Report"
summary: "Governance audit for the MOD-001 Platform Administration republishing under ADR-017 (Dedicated Database per Tenant Architecture). Documents repository discovery, superseded artifacts, published artifacts, resolved conflicts, traceability, risks, and outstanding decisions. Documentation-only pass; no code, schema, migration, RBAC, API, or navigation change."
report_id: "MOD001_V2_ARCHITECTURE_REFRESH_REPORT"
module_id: "MOD-001"
pass: "Plan A — Architecture Publication"
status: "Awaiting Architecture Board approval"
layer: "governance"
owner: "Platform Architecture"
updated: "2026-07-25"
tags: ["audit", "MOD-001", "ADR-017", "governance", "architecture-refresh"]
document_type: "Audit Report"
---

# MOD-001 v2 Architecture Refresh — Audit Report

> **Scope.** Plan A of a two-gate approval programme. Republishes MOD-001 Platform Administration under **ADR-017 — Dedicated Database per Tenant Architecture** and defers the ten Sprint PRDs to Plan B (post-approval). This pass is **documentation-only**: zero source code, zero migrations, zero RBAC changes, zero API changes, zero schema changes, zero navigation changes.

## 1. Executive Summary

The Business OS platform is repositioned from a shared-database, RLS-enforced multi-tenant model (ADR-011) to a **dedicated-database-per-Tenant** model, with **Workspace reintroduced as a logical (non-persistent) container**. This pass ratifies the architecture through a new ADR (**ADR-017**), republishes the MOD-001 module baseline (**v2.0**), refreshes the sprint plan (**v2.0**, ten sprints), amends supporting indexes, and marks the superseded artifacts.

**Recommendation:** Approve Plan A. Hold Plan B (Sprint PRD authoring for SPR-MOD-001-001 through SPR-MOD-001-010) until Plan A is signed off by the Architecture Board.

## 2. Repository Discovery Summary

Repository state was inspected before authoring. Findings:

| Area | Finding | Action |
| --- | --- | --- |
| `docs/11-adrs/architecture/ADR-008` | Existed; already superseded by ADR-009. | No change. |
| `docs/11-adrs/architecture/ADR-009` | Retired Workspace concept; body preserved. | Top-of-file superseded notice added; body untouched. |
| `docs/11-adrs/ADR_INDEX.md` | Numeric conflict: **ADR-010 already taken** by `ADR-010 — PostgreSQL as System of Record` (Data bucket). | Chose next-free Data-adjacent slot **ADR-017** for the new decision. Documented in ADR-017 §Numbering Note and in §7 below. |
| `docs/11-adrs/data/ADR-011` | Multi-Tenant Isolation via shared schema + RLS. | Preserved; still governs Platform database. Scope narrowed to Platform-metadata tables. |
| `docs/20-module-prds/platform/MODULE_PRD.md` | Contains shared-DB assumptions (implicit) and lists 6 sprints. | Amended with a top-of-file v2 alignment notice pointing to Baseline v2.0 and ADR-017. Body preserved for historical continuity; downstream now reads via Baseline v2.0. |
| `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` | Enumerated 6 sprints and 5 governance conventions. | Marked superseded; body preserved. |
| `docs/40-module-baselines/README.md`, `docs/MODULE_BASELINE_CATALOG.md` | Listed v1 as current. | Amended to list v2 as current; v1 shown as Superseded. |
| `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md` | 6-sprint plan for the pre-ADR-017 architecture. | Marked superseded; body preserved. |
| `docs/30-sprint-prds/platform/SPR-MOD-001-00{1..6}-*.md` | Sprint PRDs authored against the v1 plan. | Marked superseded (top-of-file notice) with pointer to Sprint Plan v2.0 and note that new PRDs will be re-authored under Plan B. Bodies preserved. |
| `docs/02-architecture/multi-tenant-architecture.md`, `database-architecture.md`, `deployment-architecture.md` | Describe the shared-schema posture. | **Left untouched in Plan A.** These are architecture-layer documents that will be updated in a follow-up pass once ADR-017 is approved (out of Plan A scope, to avoid pre-empting the Board). |
| `docs/15-governance/TENANCY_STANDARD.md` | Governance standard for tenant isolation. | **Left untouched in Plan A.** Cross-referenced from ADR-017. Amendments deferred to the post-approval implementation programme. |
| `src/**` | Application code. | **Untouched.** No source change is authorised. |

## 3. Documents Superseded

| Artifact | New Status | Successor |
| --- | --- | --- |
| ADR-009 — Workspace Retirement | Superseded | ADR-017 |
| MOD001_PLATFORM_BASELINE_v1 | Superseded | MOD001_PLATFORM_BASELINE_v2 |
| MOD-001_SPRINT_PLAN.md (v1) | Superseded | MOD-001_SPRINT_PLAN_v2.md |
| SPR-MOD-001-001 … SPR-MOD-001-006 (v1 PRDs) | Superseded (bodies retained) | Sprint Plan v2.0; new PRDs authored under Plan B |

## 4. Documents Published

| Artifact | Path |
| --- | --- |
| ADR-017 — Dedicated Database per Tenant Architecture | `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md` |
| MOD-001 Baseline v2.0 | `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md` |
| MOD-001 Sprint Plan v2.0 | `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md` |
| MOD-001 v2 Architecture Refresh Audit Report | `docs/50-audit-reports/MOD001_V2_ARCHITECTURE_REFRESH_REPORT.md` (this document) |

## 5. Documents Amended (header-only notices)

- `docs/11-adrs/architecture/ADR-009-workspace-retirement.md` — top-of-file notice added.
- `docs/11-adrs/ADR_INDEX.md` — ADR-017 row added; ADR-009 status set to `Superseded` with successor ADR-017.
- `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` — top-of-file superseded notice added.
- `docs/40-module-baselines/README.md` — v2 marked current, v1 marked Superseded.
- `docs/MODULE_BASELINE_CATALOG.md` — v2 row added; v1 status changed to Superseded.
- `docs/20-module-prds/platform/MODULE_PRD.md` — top-of-file v2 alignment notice added pointing to Baseline v2.0 and ADR-017.
- `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md` — top-of-file superseded notice added.
- `docs/30-sprint-prds/platform/SPR-MOD-001-00{1..6}-*.md` — top-of-file superseded notice added.

## 6. Shared-Database Assumption Sweep

Every location in Plan A's authored / amended surface was reviewed for shared-database assumptions.

| Location | Finding | Resolution |
| --- | --- | --- |
| ADR-017 | Authored fresh under dedicated-DB posture. | Clean. |
| Baseline v2 | Authored fresh under dedicated-DB posture. | Clean. |
| Sprint Plan v2 | Authored fresh under dedicated-DB posture. | Clean. |
| Module PRD (body) | Historical body assumes shared-DB implicitly. | Alignment notice at top routes downstream reads to Baseline v2; body preserved for continuity. Explicit rewrite deferred to a later documentation pass to preserve ADR-immutability-analogous editing discipline. |
| ADR-009 (body) | Retired Workspace under the shared-DB posture. | Superseded notice added; body preserved by design (governance immutability). |
| Baseline v1, Sprint Plan v1, SPR-001..006 v1 (bodies) | Written under shared-DB posture. | Superseded notices; bodies preserved as historical record. Downstream consumers follow the v2 chain. |
| `docs/02-architecture/*.md`, `docs/15-governance/TENANCY_STANDARD.md` | Contain shared-DB posture. | **Not amended in Plan A** — flagged as Outstanding Decision O1 (see §9). |

## 7. Numbering Conflict Resolution

The originating governance prompt specified the new ADR as `ADR-010`. Repository state showed `ADR-010` already assigned to `PostgreSQL as System of Record` (Proposed, Data bucket). Because ADR identifiers are permanent, the new decision was registered as **`ADR-017`** — the next free slot in the Data / Architecture range and kin to `ADR-011 — Multi-Tenant Isolation` which it evolves. The ADR chain `ADR-008 → ADR-009 → ADR-017` is documented explicitly in ADR-017 §Numbering Note and in ADR-009's superseded notice.

## 8. Traceability Matrix

| Concept | ADR-017 | Baseline v2 | Sprint Plan v2 | Module PRD | Engine Catalog |
| --- | :-: | :-: | :-: | :-: | :-: |
| Dedicated DB per Tenant | ● | ● | ● (SPR-001, 008) | (via alignment notice) | ENG-001, ENG-004, ENG-024 |
| Logical Workspace | ● | ● | ● (SPR-001, 002, 007) | (via alignment notice) | ENG-005, ENG-024 |
| Platform vs Tenant DB responsibilities | ● | ● | ● (SPR-001, 003, 005, 008) | (via alignment notice) | ENG-001, ENG-004 |
| Authentication flow | ● | ● | ● (SPR-001, 003, 010) | § 3, § 4 | ENG-001, ENG-002 |
| Licensing attaches to Tenant | ● | ● | ● (SPR-005) | (via alignment notice) | ENG-002, ENG-004 |
| Audit split (Platform vs Tenant) | ● | ● | ● (SPR-009) | § 6 | ENG-004 |
| Workspace non-persistent invariant | ● | ● | ● (SPR-007) | (via alignment notice) | — |

## 9. Outstanding Decisions

| ID | Item | Owner | Gate |
| --- | --- | --- | --- |
| O1 | Update `docs/02-architecture/multi-tenant-architecture.md`, `database-architecture.md`, `deployment-architecture.md`, and `docs/15-governance/TENANCY_STANDARD.md` to reflect ADR-017. | Platform Architecture | Post Plan A approval, before Plan B kickoff. |
| O2 | Cloud vendor, database engine version, and replication topology per residency zone. | Platform + Infra | Downstream ADR(s); gates SPR-MOD-001-008 Stage 2. |
| O3 | Runtime pattern for Tenant → DB connection routing. | Platform Architecture | Downstream ADR; gates SPR-MOD-001-001 Stage 2. |
| O4 | License enforcement point (specific runtime hook). | Platform Architecture | Sprint authoring; gates SPR-MOD-001-005 Stage 2. |
| O5 | Historical migration programme for existing shared deployment. | Platform + Product | Separate ADR + programme charter after Plan A. |
| O6 | Decision on renaming `ADR-017` if the Board prefers a different bucket. | Architecture Board | Plan A review. |
| O7 | Whether to promote `ADR-025`, `ADR-026`, `ADR-030`, `ADR-035`, `ADR-036`, `ADR-065` from `Proposed` to `Accepted` before Plan B. | Architecture Board | Sequential; each gates its consuming sprint. |

## 10. Risks

| ID | Risk | Mitigation |
| --- | --- | --- |
| R1 | Provisioning cost per Tenant increases materially. | Cost model authored under SPR-MOD-001-008; enterprise/starter tier variants deferred to commercial pass. |
| R2 | Per-tenant schema drift complicates upgrades. | DB version registry mandated in SPR-MOD-001-008; upgrade flow gated by health checks. |
| R3 | Cross-tenant Platform metrics require anonymised derivations. | Convention in Baseline v2 §7 (Tenant Persistence Boundary Convention). |
| R4 | Contributors add a `workspaces` table without an ADR. | ADR-017 §Non-Goals + Baseline v2 §7 (Workspace-is-Non-Persistent Convention). Review-enforced. |
| R5 | Historical shared deployment and new per-Tenant deployments coexist during transition. | Explicitly permitted by ADR-017 §Migration/Transition Posture. Transition programme scoped separately. |

## 11. Verification Checklist

| Check | Result |
| --- | --- |
| No source code changes | ✔ |
| No database migration changes | ✔ |
| No RBAC / permission-catalog changes | ✔ |
| No API changes | ✔ |
| No schema changes | ✔ |
| No navigation changes | ✔ |
| ADR-017 authored with full frontmatter, context, decision, invariants, non-goals, alternatives, references | ✔ |
| ADR-009 amended with header-only superseded notice; body preserved | ✔ |
| ADR_INDEX.md updated | ✔ |
| Baseline v2 authored per `docs/40-module-baselines/README.md` content contract | ✔ |
| Baseline v1 amended with header-only superseded notice; body preserved | ✔ |
| `docs/40-module-baselines/README.md` and `docs/MODULE_BASELINE_CATALOG.md` updated | ✔ |
| Module PRD amended with header-only alignment notice; body preserved | ✔ |
| Sprint Plan v2 authored with ten sprints, dependency graph, engine map, ADR map, risks, completion criteria | ✔ |
| Existing sprint plan and SPR PRDs marked superseded | ✔ |
| All cross-links resolve within Plan A's authored files | ✔ |
| Governance inheritance declared in every new document | ✔ |

## 12. Completion

**Plan A is complete.** STOP.

Do NOT begin implementation. Do NOT modify source code. Do NOT create database migrations. Do NOT begin authoring Plan B Sprint PRDs.

**Request:** Architecture Board approval of ADR-017, MOD-001 Baseline v2.0, and MOD-001 Sprint Plan v2.0. On approval:

1. Address Outstanding Decisions O1, O6.
2. Kick off Plan B — Sprint PRD authoring for SPR-MOD-001-001 through SPR-MOD-001-010.
3. Sequentially promote the `Proposed` ADRs listed in Outstanding Decision O7 before their consuming sprints enter Stage 2.

## 13. References

- [`docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`](../11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md)
- [`docs/11-adrs/architecture/ADR-009-workspace-retirement.md`](../11-adrs/architecture/ADR-009-workspace-retirement.md)
- [`docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md`](../11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md)
- [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`](../40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/40-module-baselines/README.md`](../40-module-baselines/README.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md)
- [`docs/20-module-prds/platform/MODULE_PRD.md`](../20-module-prds/platform/MODULE_PRD.md)
- [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md`](../30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md)
- [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`](../30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md)

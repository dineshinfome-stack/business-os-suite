---
title: "Architecture Baseline Synchronization — ADR-017 Freeze Report"
summary: "Records the Plan A.5 synchronization pass that aligned foundational architecture, governance, glossary, engineering, and implementation documents to ADR-017. Includes the Affected Module Review Matrix."
layer: "audit"
owner: "Platform Architecture"
status: "final"
updated: "2026-07-25"
version: "1.0"
tags: ["audit", "adr-017", "architecture-freeze", "baseline-sync"]
document_type: "Audit Report"
supersedes: ""
---

# Architecture Baseline Synchronization — ADR-017 Freeze Report

## Purpose

This report closes **Plan A.5 — Architecture Baseline Synchronization**. It documents every foundational document updated after Architecture Board approval of ADR-017 (Dedicated Database per Tenant Architecture) and captures the **Affected Module Review Matrix** used to gate Sprint PRD authoring (Plan B).

Freeze statement: *No foundational document in this repository still describes the shared-database posture as current for Tenant business data. All future PRDs SHALL be authored against this baseline.*

## Step 1 — ADR-017 Pre-flight Verification

ADR-017 was verified against the twelve required elements:

| # | Element | Present in ADR-017 | Location |
| - | ------- | ------------------ | -------- |
| 1 | Dedicated database per Tenant | ✔ | § Decision, Invariant 1 |
| 2 | Platform database responsibilities | ✔ | § Platform vs Tenant Database Responsibilities |
| 3 | Tenant provisioning | ✔ (posture; tooling deferred) | § Authentication Flow, § Migration / Transition Posture |
| 4 | Database provisioning lifecycle | ✔ (posture; tooling deferred) | § Migration / Transition Posture |
| 5 | Logical Workspace (non-persistent) | ✔ | § Decision, Invariants 2–3 |
| 6 | Company hierarchy | ✔ | § Decision diagram, Invariant 5 |
| 7 | Licensing model (attached to Tenant) | ✔ | § Licensing Model |
| 8 | Authentication flow | ✔ | § Authentication Flow |
| 9 | Backup/restore responsibility | ✔ | § Consequences (Positive) |
| 10 | Platform vs Tenant responsibilities matrix | ✔ | § Platform vs Tenant Database Responsibilities |
| 11 | Migration strategy | ✔ | § Migration / Transition Posture |
| 12 | Explicit "Supersedes ADR-009" | ✔ | Front-matter + § Status |

**Verdict:** ADR-017 is complete for the purposes of Plan A.5. No in-place amendment required. Concrete provisioning tooling, connection routing code, and backup topology are explicitly deferred to downstream sprints per § Migration / Transition Posture and are tracked in `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md`.

## Step 2 — `docs/02-architecture/**`

### Substantive rewrites

| File | Change |
| ---- | ------ |
| `multi-tenant-architecture.md` | Front-matter updated (aligned_to: ADR-017, updated 2026-07-25). Hierarchy section rewritten to include the Logical Workspace and Company/Branch/FY chain. Isolation Strategy rewritten around the dedicated-DB boundary (six layers). RLS section repositioned as within-Tenant defense-in-depth. |
| `database-architecture.md` | Front-matter updated. Overview rewritten. New "Platform vs Tenant Database Responsibilities" table added. Backup and Replication sections rewritten around Tenant-database granularity. |

### Alignment banners added

The following architecture reference documents received a prominent "Aligned to ADR-017" banner immediately under their H1. No load-bearing content required rewriting; the banner establishes the authoritative posture for readers arriving at the file directly:

- `README.md`
- `master-architecture.md`
- `deployment-architecture.md`
- `devops-architecture.md`
- `integration-architecture.md`
- `event-catalog.md`
- `observability-architecture.md`
- `quality-attributes.md`
- `reference-data.md`
- `testing-strategy.md`
- `security-architecture.md`

### Inspected and intentionally unchanged

- `ai-architecture.md`, `api-architecture.md`, `data-dictionary.md`, `database-standards.md`, `domain-driven-design.md`, `domain-map.md` — the persistence-boundary question is not load-bearing in these files; column-level standards, DDD vocabulary, and API contracts remain valid inside a Tenant database. Any downstream refresh will happen via the Affected Module Review queue below, not in this pass.

## Step 3 — `docs/15-governance/TENANCY_STANDARD.md`

Rewritten to v2.0. Key changes:

- Front-matter version bumped to `2.0`; `supersedes: "Tenancy Standard v1.0 (shared-schema posture)"`.
- Terminology block updated to reintroduce **Workspace as logical** and to add **Dedicated Tenant Database** to the physical-representation table.
- R2 rewritten: RLS is now defense-in-depth *inside* a Tenant DB.
- R3 extended: server functions MUST resolve a Tenant-scoped connection before the handler runs.
- R4 extended: neither `organizationId` nor `tenantId` may be accepted from client payloads.
- **R6 added (new):** *No cross-Tenant queries.* One Tenant-scoped connection per request; cross-tenant metrics operate on anonymised/pre-aggregated derivations delivered to the Platform layer.

## Step 4 — Glossary and cross-references

| File | Change |
| ---- | ------ |
| `docs/glossary.md` | Restored **Workspace** as "logical, non-persistent container (ADR-017)". Added **Dedicated Tenant Database** and **Platform Database**. Updated **Tenant** and **Platform** to reference ADR-017. |
| `docs/GLOSSARY_INDEX.md` | Added `Dedicated Tenant Database`, `Platform Database`. Replaced "Workspace (retired)" with "Workspace (logical, ADR-017)"; repointed `Platform (hierarchy)` to ADR-017. |
| `docs/ADR_IMPACT_MATRIX.md` | Section renamed to "Data / Architecture (ADR-010..017)". Added ADR-017 row. Amended ADR-011 row to note it now applies to the Platform database only. |
| `docs/DOCUMENT_TRACEABILITY.md`, `docs/REPOSITORY_MAP.md` | Banner added; ADR-017 is discoverable at the file head. |
| `docs/decision-register.md` | No change — file is a redirect stub pointing at `docs/11-adrs/ADR_INDEX.md`; the ADR index itself already carries ADR-017. |

## Step 5 — Architecture diagrams

`docs/02_Engineering_Execution_Master_Plan/indexes/diagram_index.md` updated to register three ADR-017 diagrams that live inside ADR-017 itself:

1. **Hierarchy tree** — `Platform → Tenant → [Dedicated DB + Logical Workspace] → Company → Branch / FY`.
2. **Authentication + Tenant DB routing flow** — Platform login → Tenant resolution (Platform DB) → dedicated Tenant DB connection → Workspace → Company → Modules.
3. **Platform vs Tenant DB responsibilities matrix** — echoed in `docs/02-architecture/database-architecture.md`.

Additional Mermaid diagram artefacts under `docs/11-erd/` and `docs/02-architecture/` are deferred to the next diagram-authoring pass; the diagrams above are the authoritative visual references for the ADR-017 posture in the interim.

## Step 6a — Implementation and Engineering master references

Alignment banners added at the head of:

- `docs/03_Implementation_Master_Plan/03_Implementation_Strategy.md`
- `docs/03_Implementation_Master_Plan/04_Dependency_Architecture.md`
- `docs/03_Implementation_Master_Plan/10_Platform_Foundation.md`
- `docs/03_Implementation_Master_Plan/13_Database_Strategy.md`
- `docs/03_Implementation_Master_Plan/18_Risk_Register.md`
- `docs/02_Engineering_Execution_Master_Plan/07_Database_Standards.md`
- `docs/02_Engineering_Execution_Master_Plan/08_Security_Standards.md`
- `docs/02_Engineering_Execution_Master_Plan/16_Operations_And_Runbooks.md`
- `docs/MODULE_BASELINE_CATALOG.md`
- `docs/SPRINT_ROADMAP.md`
- `docs/SPRINT_DEPENDENCY_MATRIX.md`
- `docs/SOLUTION_STATUS.md`
- `docs/40-module-baselines/README.md`

Plan A had already superseded `MOD001_PLATFORM_BASELINE_v1` in favour of v2; that supersession is verified.

## Step 6b — Affected Module Review Matrix

Every published module was inspected for ADR-017 compatibility. Modules were scanned for the following signature phrases: *"shared database"*, *"shared schema"*, *"cross-tenant"*, *"single database"*, plus `organization_id`-as-tenant-boundary language. Verdicts:

| Module | Verdict | Notes |
| ------ | ------- | ----- |
| **MOD-001 Platform Administration** | Compatible with ADR-017 (via v2 baseline) | `MOD001_PLATFORM_BASELINE_v2.md`, `MOD-001_SPRINT_PLAN_v2.md`, and WEB/MOB/API-001 refresh already scoped under the sprint programme; SPR-MOD-001-001…010 will implement provisioning, connection routing, and licensing surfaces. v1 baseline superseded. |
| **MOD-002 Accounting** | Compatible with ADR-017 | Ledger, posting, and voucher logic operate strictly within a Tenant database. `organization_id` remains the correct company-scoping key. WEB-002 / MOB-002 / API-002 use `organization_id` semantics that survive unchanged. No refresh sprint required. |
| **MOD-003 Sales** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-004 Purchase** | Compatible with ADR-017 | Baseline mentions "shared" in the context of shared master data (vendors) *within* a Tenant, not cross-Tenant. No refresh sprint required. |
| **MOD-005 Inventory** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-006 CRM** | Compatible with ADR-017 | Fully within-Tenant. Contact/lead scope is company-scoped inside the Tenant DB. |
| **MOD-007 HRMS** | Compatible with ADR-017 | Employee master and org chart are within-Tenant. |
| **MOD-008 Payroll** | Compatible with ADR-017 | Payroll runs are within-Tenant. Statutory outputs are exported artefacts, not cross-Tenant reads. |
| **MOD-009 Manufacturing** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-010 Projects** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-011 AMC** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-012 Field Service** | Compatible with ADR-017 | Fully within-Tenant. Offline sync assumptions unchanged. |
| **MOD-013 Assets** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-014 Fleet** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-015 POS** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-016 Service Desk** | Compatible with ADR-017 | Fully within-Tenant. |
| **MOD-017 Analytics** | **Requires future architecture refresh** | Any *cross-Tenant platform metric* narrative in the baseline / WEB-017 / MOB-017 must be rewritten around Tenant-side pre-aggregation delivered to the Platform layer, per Tenancy Standard R6. Within-Tenant analytics is unaffected. Queue: **REFRESH-MOD-017**. Do not fold into Plan B. |
| **MOD-018 AI Workspace** | **Requires future architecture refresh** | Embeddings, knowledge base, and vector-store scoping must be reconfirmed as strictly per-Tenant (no shared vector index across Tenants). WEB-018 / MOB-018 / API-018 flagged for review. Queue: **REFRESH-MOD-018**. Do not fold into Plan B. |
| **MOD-019 Warehouse** | Compatible with ADR-017 | Baseline mentions "shared" in the context of shared warehouse resources *within* a Tenant. Fully within-Tenant. |

**Priority-inspected modules** (tenant-isolation-sensitive): MOD-001, MOD-002, MOD-004, MOD-005, MOD-006, MOD-007, MOD-008, MOD-010, MOD-017, MOD-018. Inspected against baselines, publications (where present), and WEB/MOB/API solution designs.

**Summary:** 17 of 19 modules Compatible with ADR-017; 2 modules queued for future refresh sprints (MOD-017 Analytics, MOD-018 AI Workspace); MOD-001 already covered by the in-flight v2 programme. **No module document was rewritten in Plan A.5.** Refresh sprints for MOD-017 and MOD-018 are scoped separately from Plan B and are not gating for SPR-MOD-001-001…010 authoring.

## Step 7 — Freeze Statement

The Architecture Baseline is **frozen at ADR-017** as of 2026-07-25.

- No foundational document still describes the shared-database posture as current for Tenant business data.
- ADR-011 remains historical record and applies only to the Platform database's single-schema deployment.
- The Logical Workspace concept is reintroduced and defined in the Glossary, TENANCY_STANDARD v2.0, and ADR-017.
- MOD-001 v2 sprint programme is authorised to proceed with Sprint PRD authoring (Plan B) against this baseline.
- REFRESH-MOD-017 and REFRESH-MOD-018 are added to the refresh backlog and will be scheduled independently.

## Non-goals honoured

- No source code changes (`src/**` untouched).
- No SQL migrations.
- No new ADRs (ADR-017 stands; no amendments required).
- No Sprint PRDs authored (Plan B).
- No module baseline / PRD / Solution Design rewrites (Step 6b produced an inventory only).
- Historical audit reports under `docs/50-audit-reports/` and prior superseded ADRs (ADR-008, ADR-009) remain frozen.

## References

- `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`
- `docs/11-adrs/architecture/ADR-009-workspace-retirement.md` (superseded)
- `docs/11-adrs/data/ADR-011-multi-tenant-isolation.md` (Platform DB only)
- `docs/15-governance/TENANCY_STANDARD.md` (v2.0)
- `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`
- `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md`
- `docs/50-audit-reports/MOD001_V2_ARCHITECTURE_REFRESH_REPORT.md`

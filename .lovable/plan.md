
# MOD-001 Platform Administration v2.0 — Architecture Refresh

**Type:** Governance / documentation-only. No source code, migrations, RBAC, API, schema, or navigation changes.

**Approval strategy:** Split into two gates (per your recommendation).
- **Plan A (this plan):** ADR-010, MOD-001 Baseline v2.0, Sprint Plan v2.0, Audit Report → Architecture Board approval.
- **Plan B (deferred):** SPR-MOD-001-001 through -010 PRDs, authored only after Board approves Plan A.

## Phase 0 — Repository Discovery (read-only)

Before authoring, read (in this order) and record findings in the audit report:

1. `docs/REPOSITORY_MAP.md`, `docs/DOCUMENT_OWNERSHIP_MATRIX.md`, `docs/DOCUMENT_TRACEABILITY.md`
2. `docs/15-governance/` (all standards; identify anything asserting shared-DB)
3. `docs/02_Engineering_Execution_Master_Plan/`, `docs/03_Implementation_Master_Plan/10_Platform_Foundation.md`
4. `docs/02-architecture/multi-tenant-architecture.md`, `database-architecture.md`, `deployment-architecture.md`
5. `docs/11-adrs/ADR_INDEX.md`, `ADR-007`, `ADR-008`, `ADR-009`, `ADR-011` (Multi-Tenant Isolation), `ADR-014`, `ADR-032`
6. `docs/20-module-prds/platform/README.md` + `MODULE_PRD.md`
7. `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`, `docs/40-module-baselines/README.md`
8. `docs/45-module-publications/README.md` + any MOD-001 publication under `45-module-publications/platform/`
9. `docs/30-sprint-prds/platform/` (existing SPR-MOD-001-00x)
10. `docs/50-audit-reports/` (SPRINT_0 reports + prior MOD-001 audits)
11. `docs/SPRINT_ROADMAP.md`, `SPRINT_DEPENDENCY_MATRIX.md`

Discovery output: a list of documents to **supersede**, documents to **cross-link**, and every location where a shared-database assumption appears.

## Phase 1 — ADR-010 (new) + ADR-009 amendment

**Create** `docs/11-adrs/architecture/ADR-010-dedicated-database-per-tenant-architecture.md`

Sections:
- Status: Accepted; `supersedes: ADR-009`
- Context — evolution ADR-008 → ADR-009 → ADR-010; why the shared-schema/RLS model is replaced with dedicated-DB-per-tenant and logical Workspace is reintroduced (as non-persistent)
- Decision — Dedicated Database Per Tenant + Logical Workspace + Company/Branch/Financial Year hierarchy
- Platform vs Tenant database responsibilities (platform DB holds only tenant registry, licenses, platform users, audit; no business data)
- Authentication flow: Platform login → Tenant resolution → Dedicated DB connection → Workspace → Company → Modules
- Licensing: attaches to Tenant (not Company, not Branch)
- Architectural Invariants (7 items from prompt)
- Migration/transition posture from the ADR-009 conceptual model (no code migration in this ADR)
- Promotion Criteria (when Workspace becomes physical)
- Non-Goals (no `workspaces` table; no schema changes in this ADR)
- Consequences, Alternatives Considered, References

**Amend** `docs/11-adrs/architecture/ADR-009-workspace-retirement.md`:
- Add a top-of-file notice: `Status: Superseded by ADR-010 — Dedicated Database per Tenant Architecture.` Body preserved verbatim for historical integrity.

**Update** `docs/11-adrs/ADR_INDEX.md` — register ADR-010, mark ADR-009 superseded, update ADR-008 chain note.

## Phase 2 — MOD-001 Baseline v2.0

**Create** `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md` and mark v1 superseded (front-matter + top notice; v1 file retained).

Baseline v2.0 covers:
- Overview & objectives (dedicated-DB-per-tenant)
- Capabilities: Tenant lifecycle, **Database provisioning lifecycle**, Workspace (logical), Org structure, Users/Roles/Permissions, Configuration, Localization, **Licensing**, Platform Operations (monitoring, backup, recovery, DB versioning), Audit, Notifications, Search, Documents, Workflow, Reporting
- Architecture diagram (Mermaid) reflecting Platform DB ↔ per-Tenant DBs
- Dependency map, consumer modules (MOD-002..MOD-018)
- Cross-links to ADR-010, ADR-007, ADR-011, ADR-014, ADR-032
- Traceability to Module PRD and Engine Catalog

**Update** `docs/40-module-baselines/README.md` and `docs/MODULE_BASELINE_CATALOG.md` to list v2 as current.

**Amend** `docs/20-module-prds/platform/MODULE_PRD.md` — replace shared-DB assumptions; add pointer to Baseline v2.0 and ADR-010. Do not fork the PRD.

## Phase 3 — Sprint Plan v2.0

**Create** `docs/30-sprint-prds/platform/SPRINT_PLAN_v2.md` listing SPR-MOD-001-001 through -010 exactly as specified (Provisioning, Workspace/Org, Identity, Configuration, Licensing, Localization, Workspace Services, Platform Operations, Audit & Compliance, Admin Console) with objectives, sequence, dependency arrows, and inheritance from EEMP/IMP/ADR-010.

**Amend** `docs/SPRINT_ROADMAP.md` and `docs/SPRINT_DEPENDENCY_MATRIX.md` to reference v2.0 and mark the earlier MOD-001 roadmap superseded.

Existing SPR-MOD-001-001 and -002 sprint artifacts are **not deleted**; they receive a top-of-file notice: "Superseded by Sprint Plan v2.0; PRD to be re-authored under Plan B." No code touched.

## Phase 4 — Audit Report

**Create** `docs/50-audit-reports/MOD001_V2_ARCHITECTURE_REFRESH_REPORT.md`:
- Repository discovery summary (files read, findings)
- Documents superseded (ADR-009, Baseline v1, prior Sprint Plan, prior SPR PRDs)
- Documents published (ADR-010, Baseline v2, Sprint Plan v2, this report)
- Every location where a shared-DB assumption was found and how it was addressed (amended vs superseded)
- Traceability matrix: ADR-010 ↔ Baseline v2 ↔ Sprint Plan v2 ↔ Module PRD ↔ Engine Catalog
- Verification checklist (no code / migrations / RBAC / API / schema / navigation changes)
- Risks and outstanding decisions (tenant DB provisioning vendor, connection routing, backup topology, license enforcement point — all deferred to Plan B PRDs / follow-up ADRs)
- Explicit **STOP** — awaiting Architecture Board approval before Plan B.

## Deliverables (Plan A)

1. `docs/11-adrs/architecture/ADR-010-dedicated-database-per-tenant-architecture.md` (new)
2. `docs/11-adrs/architecture/ADR-009-workspace-retirement.md` (amended header only)
3. `docs/11-adrs/ADR_INDEX.md` (updated)
4. `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md` (new)
5. `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` (superseded notice)
6. `docs/40-module-baselines/README.md`, `docs/MODULE_BASELINE_CATALOG.md` (updated indexes)
7. `docs/20-module-prds/platform/MODULE_PRD.md` (amended for v2 alignment)
8. `docs/30-sprint-prds/platform/SPRINT_PLAN_v2.md` (new)
9. `docs/SPRINT_ROADMAP.md`, `docs/SPRINT_DEPENDENCY_MATRIX.md` (updated)
10. Existing SPR-MOD-001-001/-002 files (superseded notice only)
11. `docs/50-audit-reports/MOD001_V2_ARCHITECTURE_REFRESH_REPORT.md` (new)

## Not in this plan (Plan B — deferred)

Ten Sprint PRDs (SPR-MOD-001-001 through -010) — authored only after Architecture Board approves Plan A. This avoids rewriting ten PRDs if the Board revises the baseline.

## Guardrails

- Documentation only. Zero source, migration, RBAC, API, schema, or navigation edits.
- ADR immutability preserved (ADR-009 amended header only; body untouched).
- Every new document declares inheritance from Governance Framework, EEMP, IMP, ADR-010.
- All cross-links verified before publishing the audit report.
- After the audit report is written, STOP and request Architecture Board approval.

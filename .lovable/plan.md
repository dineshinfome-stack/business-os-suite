## Revised Sequence: Plan A → Plan A.5 (Architecture Sync + Impact Review) → Plan B

Plan A (ADR-017, MOD-001 Baseline v2, Sprint Plan v2, Audit Report) is already published. Before authoring any Sprint PRDs, execute **Plan A.5 — Architecture Baseline Synchronization**, now extended with a formal **Affected Module Review** in Step 6. Plan B (SPR-MOD-001-001 … -010) is gated on the Architecture Baseline Freeze artifact.

---

## Plan A.5 — Architecture Baseline Synchronization

**Trigger:** Architecture Board approval of ADR-017.
**Exit criterion:** Zero foundational document still describes the shared-database posture as current for Tenant business data, AND every published module has a recorded ADR-017 compatibility verdict.

### Step 1 — Pre-flight verification of ADR-017

Confirm ADR-017 contains all required elements before touching downstream documents:

1. Dedicated database per tenant
2. Platform database responsibilities
3. Tenant provisioning
4. Database provisioning lifecycle
5. Logical Workspace (non-persistent)
6. Company hierarchy (Tenant → Company → Branch / Financial Year)
7. Licensing model (attached to Tenant)
8. Authentication flow (Platform → Tenant resolution → dedicated DB connection)
9. Backup/restore responsibility
10. Platform vs Tenant responsibilities matrix
11. Migration strategy from the previous shared-DB model
12. Explicit "Supersedes ADR-009"

Missing elements are added as in-place amendments to ADR-017 (no new ADR) and re-approved before Step 2.

### Step 2 — Update `docs/02-architecture/**`

Republish the architecture reference set to ADR-017. Each affected file receives a "Supersedes: shared-database posture per ADR-011; aligned to ADR-017" note and targeted body edits:

- `multi-tenant-architecture.md` — dedicated-DB-per-Tenant as primary boundary; RLS scoped to Platform DB and within-Tenant defense-in-depth.
- `database-architecture.md` — Platform DB vs Tenant DB responsibilities; connection routing; per-tenant backup/restore; per-tenant schema-version drift.
- `deployment-architecture.md` — per-Tenant DB provisioning topology; cost/monitoring implications.
- `devops-architecture.md` — tenant-aware backup, upgrade, and observability pipelines.
- `integration-architecture.md`, `event-catalog.md`, `observability-architecture.md`, `quality-attributes.md`, `reference-data.md`, `testing-strategy.md` — targeted edits only where a single shared database is asserted.
- `README.md` — index points at ADR-017 as authoritative isolation ADR.

### Step 3 — Update `docs/15-governance/TENANCY_STANDARD.md`

- Add ADR-017 to Terminology; reintroduce **Workspace** as logical (non-persistent) container.
- Rewrite Model: Tenant is the *database* boundary; `organization_id` remains company-scoping key **within** a Tenant DB.
- Rewrite R2 (RLS) as defense-in-depth inside a Tenant DB, not the primary tenant boundary.
- Add **R6 — No cross-Tenant queries**: application code MUST resolve a Tenant-scoped DB connection per request; no path holds two Tenant DB connections simultaneously for business reads/writes.
- Keep R1, R3, R4, R5 with minor wording updates.

### Step 4 — Update Glossary and cross-references

- `docs/glossary.md` — restore **Workspace** as "logical, non-persistent container within a Tenant (ADR-017)"; update **Tenant** to note dedicated-DB boundary.
- `docs/GLOSSARY_INDEX.md`, `docs/ADR_IMPACT_MATRIX.md`, `docs/decision-register.md` — add ADR-017 rows; mark ADR-009 superseded.
- `docs/DOCUMENT_TRACEABILITY.md`, `docs/REPOSITORY_MAP.md` — reference ADR-017 where they cite ADR-009/ADR-011.

### Step 5 — Update architecture diagrams

- `docs/02_Engineering_Execution_Master_Plan/indexes/diagram_index.md` — register new diagrams.
- Add/refresh Mermaid diagrams under `docs/11-erd/` and `docs/02-architecture/` for: (a) Platform DB vs Tenant DB split, (b) authentication + tenant-resolution + DB-routing flow, (c) revised hierarchy (Platform → Tenant → [Dedicated DB, Logical Workspace] → Company → Branch/FY).

### Step 6 — Implementation, Engineering, and **Affected Module Review**

**6a. Master plan alignment**
- `docs/03_Implementation_Master_Plan/**` — align phase gates and dependency notes to ADR-017.
- `docs/02_Engineering_Execution_Master_Plan/**` — delivery workflow reflects per-Tenant provisioning.
- `docs/MODULE_BASELINE_CATALOG.md`, `docs/SPRINT_ROADMAP.md`, `docs/SPRINT_DEPENDENCY_MATRIX.md`, `docs/SOLUTION_STATUS.md` — cross-reference ADR-017; verify Plan A's supersession notes.
- `docs/40-module-baselines/README.md` — confirm v2 is the active MOD-001 baseline.

**6b. Affected Module Review (new)**

Inspect every published module baseline, PRD, and Solution Design (WEB / MOB / API / CPC / VR) across MOD-001 through MOD-019 for assumptions that depend on the former shared-database architecture. Typical assumption sites: cross-module joins, "single database" wording, `organization_id`-as-tenant-boundary language, shared connection pools, cross-tenant reporting queries, and RLS-as-primary-isolation claims.

For each module, record exactly one verdict:

- **Compatible with ADR-017** — no changes required; document rationale.
- **Requires future architecture refresh** — list the specific sections/assumptions needing revision; do NOT rewrite them in Plan A.5.

Modules with elevated inspection priority (tenant-isolation-sensitive): MOD-001 Platform, MOD-002 Accounting, MOD-006 CRM, MOD-008 HRMS, MOD-009 Payroll, MOD-004 Inventory, MOD-010 Projects, MOD-017 Analytics, MOD-018 AI Workspace, plus authentication surfaces in MOD-001. All other modules still receive a verdict, even if the inspection is short.

Deliverable: an **Affected Module Review Matrix** section embedded in the Step 7 audit report. Modules marked "Requires future architecture refresh" are queued for individual refresh sprints, scoped separately from Plan B.

**Non-goal for 6b:** no module baseline, PRD, or Solution Design is rewritten in Plan A.5. This step produces an inventory, not edits.

### Step 7 — Architecture Baseline Freeze audit report

Author `docs/50-audit-reports/ARCHITECTURE_BASELINE_SYNC_ADR017_REPORT.md` containing:

1. Files updated (Steps 2–6a) with per-file change summary.
2. Files inspected and intentionally left unchanged.
3. **Affected Module Review Matrix** (from Step 6b) with a verdict for every published module.
4. Freeze statement: no foundational document still contradicts ADR-017; all future PRDs are authored against this baseline.

This is the artifact the Architecture Board signs to close Plan A.5 and unlock Plan B.

### Non-goals for Plan A.5

- No source code changes (`src/**` untouched).
- No SQL migrations.
- No new ADRs (ADR-017 amendments only if Step 1 finds gaps).
- No Sprint PRDs (that is Plan B).
- No module baseline / PRD / Solution Design rewrites (Step 6b produces inventory only).
- Historical audit reports and prior superseded ADRs remain frozen.

---

## Plan B — Gated on Plan A.5

After the Step 7 audit report is signed, proceed with SPR-MOD-001-001 through SPR-MOD-001-010 PRD authoring, each written against the fully synchronized ADR-017 baseline. Modules flagged "Requires future architecture refresh" in Step 6b are handled by dedicated per-module refresh sprints, not folded into Plan B.

---

## Technical Notes

- ADR-017 numbering is preserved; ADRs are immutable identifiers.
- ADR-011 (shared-schema RLS) remains historical record and continues to apply to the Platform database's own single-schema deployment — preserved in Steps 2, 3, and 6a rewrites.
- Presentation-layer `nav_id` values (`workspace.hub`, etc.) and `workspace.*` permission keys remain unchanged in this pass, per ADR-009 Design Constraints carried forward. Any rename is a separate future RBAC migration.

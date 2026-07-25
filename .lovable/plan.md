## Revised Sequence: Plan A → Plan A.5 (Architecture Sync) → Plan B

Plan A (ADR-017, MOD-001 Baseline v2, Sprint Plan v2, Audit Report) is already published. Before authoring any Sprint PRDs, insert a new **Plan A.5 — Architecture Baseline Synchronization** pass so every foundational document describes the dedicated-database-per-tenant model authoritatively. Plan B (SPR-MOD-001-001 … -010 PRD authoring) is gated on Plan A.5 completion.

---

## Plan A.5 — Architecture Baseline Synchronization

**Trigger:** Architecture Board approval of ADR-017.
**Exit criterion:** Zero foundational document still describes the shared-database posture as current for Tenant business data.

### Step 1 — Pre-flight verification of ADR-017

Before touching downstream documents, confirm ADR-017 contains all eleven required elements:

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

If any element is missing, amend ADR-017 first (as an in-place clarification, not a new ADR) and re-request board sign-off on the amendment before proceeding.

### Step 2 — Update `docs/02-architecture/**`

Republish the architecture reference set to ADR-017. Each file gets a "Supersedes: shared-database posture per ADR-011; aligned to ADR-017" note in front-matter and body edits where the shared-DB assumption is load-bearing:

- `multi-tenant-architecture.md` — replace shared-schema/RLS-as-primary-boundary narrative with dedicated-DB-per-Tenant; keep RLS discussion scoped to the Platform database and within-Tenant defense-in-depth.
- `database-architecture.md` — split into Platform DB vs Tenant DB responsibilities; document connection routing, per-tenant backup/restore, per-tenant schema-version drift.
- `deployment-architecture.md` — add per-Tenant DB provisioning topology; note cost/monitoring implications.
- `devops-architecture.md` — tenant-aware backup, upgrade, and observability pipelines.
- `integration-architecture.md`, `event-catalog.md`, `observability-architecture.md`, `quality-attributes.md`, `reference-data.md`, `testing-strategy.md` — targeted edits only where they assert a single shared database.
- `README.md` — update index to point at ADR-017 as the authoritative isolation ADR for Tenant business data.

### Step 3 — Update `docs/15-governance/TENANCY_STANDARD.md`

- Add ADR-017 to Terminology block; reintroduce **Workspace** as logical (non-persistent) container.
- Rewrite the Model section: Tenant is the *database* boundary; `organization_id` remains the company-scoping key **within** a Tenant DB.
- Rewrite R2 (RLS) to clarify RLS is defense-in-depth *inside* a Tenant DB, not the primary tenant boundary.
- Add a new rule: **R6 — No cross-Tenant queries**. Application code MUST resolve a Tenant-scoped DB connection per request; no code path may hold connections to two Tenant DBs simultaneously for a business read/write.
- Keep R1, R3, R4, R5 with minor wording updates.

### Step 4 — Update Glossary and cross-references

- `docs/glossary.md` — restore **Workspace** entry as "logical, non-persistent container within a Tenant (ADR-017)"; update **Tenant** entry to note the dedicated-DB boundary.
- `docs/GLOSSARY_INDEX.md`, `docs/ADR_IMPACT_MATRIX.md`, `docs/decision-register.md` — add ADR-017 rows and mark ADR-009 superseded.
- `docs/DOCUMENT_TRACEABILITY.md`, `docs/REPOSITORY_MAP.md` — reference ADR-017 where they cite ADR-009/ADR-011.

### Step 5 — Update architecture diagrams

- `docs/02_Engineering_Execution_Master_Plan/indexes/diagram_index.md` — register the new diagrams.
- Add/refresh Mermaid diagrams under `docs/11-erd/` and `docs/02-architecture/` for: (a) Platform DB vs Tenant DB split, (b) authentication + tenant-resolution + DB-routing flow, (c) revised hierarchy (Platform → Tenant → [Dedicated DB, Logical Workspace] → Company → Branch/FY).

### Step 6 — Update Implementation & Engineering master references

- `docs/03_Implementation_Master_Plan/**` — align phase gates and dependency notes to ADR-017; flag any prior assumption of a single shared DB.
- `docs/02_Engineering_Execution_Master_Plan/**` — same treatment; ensure delivery workflow reflects per-Tenant provisioning.
- `docs/MODULE_BASELINE_CATALOG.md`, `docs/SPRINT_ROADMAP.md`, `docs/SPRINT_DEPENDENCY_MATRIX.md`, `docs/SOLUTION_STATUS.md` — cross-reference ADR-017; mark v1 MOD-001 baseline superseded (already done in Plan A, verify).
- `docs/40-module-baselines/README.md` — confirm v2 is the active MOD-001 baseline.

### Step 7 — Architecture Baseline Freeze audit report

Author `docs/50-audit-reports/ARCHITECTURE_BASELINE_SYNC_ADR017_REPORT.md` enumerating: every file touched, every file inspected and intentionally left unchanged, and an explicit statement that no foundational document still contradicts ADR-017. This is the artifact the Architecture Board signs to close Plan A.5.

### Non-goals for Plan A.5

- No source code changes (`src/**` untouched).
- No SQL migrations.
- No new ADRs (ADR-017 stands; amendments only if Step 1 finds gaps).
- No Sprint PRDs (that is Plan B).
- Historical audit reports under `docs/50-audit-reports/` and prior superseded ADRs remain frozen.

---

## Plan B — Gated on Plan A.5

After the Step 7 audit report is signed, proceed with the previously-scoped PRD authoring: SPR-MOD-001-001 through SPR-MOD-001-010, each written against the fully synchronized ADR-017 baseline.

---

## Technical Notes

- ADR-017 numbering is kept. ADRs are immutable identifiers; no renumbering.
- ADR-011 (shared-schema RLS) remains part of the historical record and continues to apply to the Platform database's own single-schema deployment — this nuance must be preserved in every rewrite in Step 2 and Step 3.
- Presentation-layer `nav_id` values (`workspace.hub`, etc.) and `workspace.*` permission keys remain unchanged in this pass, per the Design Constraints in ADR-009 (carried forward). Any rename is a separate future RBAC migration.

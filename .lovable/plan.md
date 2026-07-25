# Plan — Phase B2: Platform Services Foundation (v3, upgraded)

Documentation-only. Zero source, schema, migration, or Solution Design changes. Mirrors Phase B1 rigor; expands cross-PRD consistency to all seven Platform sprint PRDs (001–007); adds contract-ownership, contract-version compatibility, and event-ownership validation.

## Preconditions (verify at start; abort on failure)

- ADR-017 Accepted; Architecture Baseline Freeze approved.
- `MOD001_PLATFORM_BASELINE_v2` and `MOD-001_SPRINT_PLAN_v2` active.
- Phase B1 §11 Architecture Board Decision recorded as APPROVED.
- Repository clean of non-doc drift for this phase.

## Repository Discovery (read-only, in precedence order)

1. ADRs — `docs/11-adrs/architecture/ADR-017-*.md`, plus ADR-011, ADR-014, ADR-030, ADR-032 (status).
2. Governance — `docs/15-governance/TENANCY_STANDARD.md` (v2.0), `RBAC_STANDARD.md`, `PERMISSION_CATALOG.md`, `ROLE_MODEL.md`, `PLATFORM_TESTING_STANDARD.md`, `PLATFORM_OBSERVABILITY_STANDARD.md`.
3. Templates — `docs/99-templates/sprint-prd-template.md`, `docs/SPRINT_AUTHORING_GUIDE.md`, `docs/SPRINT_DEPENDENCY_MATRIX.md`.
4. Module baseline — `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`, `docs/20-module-prds/platform/MODULE_PRD.md`.
5. Existing PRDs — SPR-MOD-001-001/002/003 (normative; do not duplicate FRs).
6. Predecessor versions — any v1 predecessors for -004/-005/-006/-007 for Change-Log-from-v1 provenance.

## Sprint PRDs to Author

Each PRD uses the 12-section sprint-prd-template and adds the Phase B1 governance sections (Reuse Provenance, Change Log from v1, Traceability Matrix).

### SPR-MOD-001-004 — Platform Configuration Framework
Platform config model, effective-configuration resolver (owner of the contract), feature flags, runtime config, validation, inheritance, config audit + events (`config.*`).

### SPR-MOD-001-005 — Licensing & Subscription Management
License lifecycle, subscription plans, usage limits, feature entitlement, trial/renewal/suspension/expiration, license enforcement (owner of the enforcement contract; fulfils the SPR-003 pass-through hook). Events `license.*`, `subscription.*`.

### SPR-MOD-001-006 — Localization & Regionalization
Languages, time zones, currency, date/time & number formatting, regional compliance settings, localization preferences, translation management. Consumes SPR-004 resolver; declares regional overrides at Tenant/Workspace/Company scope. Events `l10n.*`.

### SPR-MOD-001-007 — Workspace Services & Administration
Workspace administration surface (logical only, no `workspaces` table — ADR-017 I3), preferences, notifications, branding, **workspace metadata cache (derived, ephemeral only; no persistent Workspace entity)**, admin utilities, workspace lifecycle services. Consumes SPR-002 navigation contract, SPR-004 config, SPR-005 entitlements, SPR-006 locale. Events `workspace.*`.

## Requirement Standards

Every FR carries: unique ID, description, priority, capability reference, ADR reference, module objective, acceptance-criterion link. Zero orphans.

## Repository Reuse Review (per PRD)

Per major section: exactly one of {Reused Unchanged, Updated from Existing, Newly Authored} with justification. Standards referenced by ID, never restated.

## Effective Configuration Resolution Order (canonical, per ADR-017)

```text
Platform Defaults
        ↓
Tenant
        ↓
Workspace (logical)
        ↓
Company
        ↓
Branch
        ↓
Financial Year
```

Documented in full in SPR-004, referenced by ID from SPR-006 and SPR-007. Branch and Financial Year are declared scopes even if they do not yet own overrides.

## Cross-PRD Consistency Matrix (expanded, covers SPR-001…SPR-007)

Axes:

- A1 Terminology · A2 Architecture (ADR-017) · A3 Lifecycle · A4 Event naming · A5 Dependency ordering · A6 No duplicated standards · A7 No conflicting ownership · A8 Identical ADR references · A9 Valid capability references · A10 No shared-DB wording.
- **A11 Configuration hierarchy** — every config-consuming PRD resolves through the SPR-004 contract using the canonical chain above.
- **A12 License gate coverage** — every entitlement-gated capability references the SPR-005 enforcement contract; the SPR-003 pass-through hook is marked fulfilled.
- **A13 Contract ownership** — every shared contract has exactly one owning PRD; consumers reference by ID and do not redefine.
- **A14 Event ownership** — every event has exactly one publisher; no duplicate definitions.
- **A15 Contract version compatibility** — every consumer pins the contract version it was validated against; no implicit upgrades.

### Contract Ownership + Version Compatibility (new table)

| Contract | Owning PRD | Current Version | Consuming PRDs (pinned version) | Breaking Change? | Status |
| --- | --- | --- | --- | --- | --- |
| Effective configuration resolver | SPR-004 | 1.0 | SPR-006 @ 1.0, SPR-007 @ 1.0 | No | Draft |
| License enforcement | SPR-005 | 1.0 | SPR-003 hook @ 1.0, SPR-007 @ 1.0 | No | Draft |
| Workspace navigation | SPR-002 | 1.0 | SPR-007 @ 1.0 | No | Draft |
| Tenant connection registry | SPR-001 | 1.0 | SPR-003 @ 1.0 | No | Draft |
| Permission catalog integration | SPR-003 | 1.0 | SPR-004/005/006/007 @ 1.0 | No | Draft |

**Contract Version Rule.** Consumers SHALL reference the contract version they were validated against. Any incompatible contract revision requires (a) owner update, (b) consumer impact assessment, (c) Cross-PRD Consistency Matrix update. No implicit contract upgrades are permitted.

*Deferred to a later phase (noted, not built now): a Global Contract Registry under `docs/15-governance/` once contracts begin spanning MOD-002…MOD-019.*

### Event Ownership Validation (new table)

| Event | Publisher (owning PRD) | Consumers | Trigger | Payload owner |
| --- | --- | --- | --- | --- |
| `tenant.*` | SPR-001 | … | … | SPR-001 |
| `org.company.*` / `org.branch.*` / `org.financialyear.*` | SPR-002 | … | … | SPR-002 |
| `iam.*` | SPR-003 | … | … | SPR-003 |
| `config.*` | SPR-004 | … | … | SPR-004 |
| `license.*`, `subscription.*` | SPR-005 | … | … | SPR-005 |
| `l10n.*` | SPR-006 | … | … | SPR-006 |
| `workspace.*` | SPR-007 | … | … | SPR-007 |

Rule: no event may be defined in more than one PRD; multiple subscribers permitted.

## Dependency Validation

Sequence: 001 → 002 → 003 → 004 → 005 → 006 → 007. Verify 0 cycles and 0 forward runtime dependencies; document each declared dependency and its satisfying artifact; explicitly mark the SPR-003 License hook as fulfilled by SPR-005.

## Traceability Coverage

Every FR traces to: Capability, ADR, Module Objective, Acceptance Criterion. **Zero orphan Functional Requirements** — reported per PRD and rolled up.

## Deliverables (all under `docs/`)

1. `docs/30-sprint-prds/platform/SPR-MOD-001-004-platform-configuration-framework.md`
2. `docs/30-sprint-prds/platform/SPR-MOD-001-005-licensing-and-subscription-management.md`
3. `docs/30-sprint-prds/platform/SPR-MOD-001-006-localization-and-regionalization.md`
4. `docs/30-sprint-prds/platform/SPR-MOD-001-007-workspace-services-and-administration.md`
5. `docs/30-sprint-prds/platform/MOD-001_PHASE_B2_CROSS_PRD_CONSISTENCY_MATRIX.md` (covers 001–007; includes Contract Ownership + Version and Event Ownership tables)
6. `docs/50-audit-reports/MOD001_PHASE_B2_PRD_AUTHORING_REPORT.md`

Any v1 predecessor PRDs found for -004/-005/-006/-007 get superseded banners (metadata only); their bodies are not otherwise edited.

## Authoring Report Contents

Repository Discovery Summary · Reuse Rollup · ADR-017 Compliance · Traceability Coverage · Dependency Validation · Cross-PRD Consistency Results (A1–A15) · Contract Ownership + Version Results · Event Ownership Results · Risks · Recommendations · Phase B3 Readiness Gate · Stop Rule.

### Phase B3 Readiness Gate (objective criteria)

- Zero architectural conflicts.
- Zero dependency cycles.
- Zero forward runtime dependencies.
- Cross-PRD Consistency Matrix passes all axes A1–A15.
- Contract ownership validated (1 owner per contract; no consumer redefinitions).
- Contract version compatibility validated (every consumer pins a specific version; no implicit upgrades).
- Event ownership validated (1 publisher per event; no duplicates).
- Repository safety verified (writes confined to the six deliverable paths).

## Repository Safety

Writes confined to the six paths above. No changes to `src/`, `supabase/`, `scripts/`, package/config/infra files, or Phase B1 PRDs.

## Stop Rule

After the six deliverables are published, **STOP**. Do not author SPR-MOD-001-008/-009/-010. Await explicit Architecture Board authorization for Phase B3.

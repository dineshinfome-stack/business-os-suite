# Plan — Phase B3: Platform Operations & Administration (v3, upgraded)

Documentation-only. Zero source, schema, migration, infrastructure, or Solution Design changes. Final authoring phase for MOD-001. Adds a Repository Baseline Snapshot and forward-looking Platform Dependency Manifest guidance on top of v2.

## Preconditions (verify at start; abort on failure)

- ADR-017 Accepted; Architecture Baseline Freeze approved.
- `MOD001_PLATFORM_BASELINE_v2` and `MOD-001_SPRINT_PLAN_v2` active.
- Phase B2 Architecture Board Decision recorded as APPROVED.
- Repository clean of non-doc drift for this phase.

## Repository Discovery (read-only, in precedence order)

1. ADRs — `docs/11-adrs/architecture/ADR-017-*.md`, plus operations/audit-relevant ADRs (status verified).
2. Governance — `TENANCY_STANDARD.md` (v2.0), `RBAC_STANDARD.md`, `PERMISSION_CATALOG.md`, `PLATFORM_TESTING_STANDARD.md`, `PLATFORM_OBSERVABILITY_STANDARD.md`, audit/retention standards, documentation standards.
3. Templates — `docs/99-templates/sprint-prd-template.md`, `docs/SPRINT_AUTHORING_GUIDE.md`, `docs/SPRINT_DEPENDENCY_MATRIX.md`.
4. Module baseline — `MOD001_PLATFORM_BASELINE_v2`, `docs/20-module-prds/platform/MODULE_PRD.md`.
5. Existing PRDs — SPR-MOD-001-001…007 (normative; do not duplicate FRs).
6. Phase matrices — Phase B1 and B2 consistency matrices.
7. Predecessor versions — any v1 predecessors for -008/-009/-010 for Change-Log-from-v1 provenance.

## Sprint PRDs to Author

Each PRD uses the 12-section sprint-prd-template and adds Phase B1/B2 governance sections (Reuse Provenance, Change Log from v1, Traceability Matrix).

### SPR-MOD-001-008 — Platform Operations
Platform monitoring, health management, service lifecycle, scheduler, background jobs, queue management, maintenance mode, backup coordination, disaster recovery coordination, operational notifications. Consumes SPR-004 config, SPR-006 locale (notifications), SPR-003 identity (operator RBAC). **Owns `ops.*` events.**

### SPR-MOD-001-009 — Audit, Compliance & Governance
Platform audit, compliance controls, governance enforcement, audit policies, security audit, retention policies, data access audit, administrative activity logging, compliance reporting. Consumes SPR-001, SPR-003, SPR-004, SPR-008. **Owns `audit.*` and `compliance.*` events.**

### SPR-MOD-001-010 — Platform Administration Console
Platform administration UI, Super Administrator workspace, tenant management console, operational dashboards, platform analytics, system configuration console, platform diagnostics, administrative reporting. Consumes SPR-001, SPR-003, SPR-004, SPR-005, SPR-008, SPR-009. **Owns `platform-admin.*` events.**

## Requirement Standards

Every FR carries: unique ID, description, priority, capability reference, ADR reference, module objective, acceptance-criterion link. Zero orphans.

## Repository Reuse Review (per PRD)

Per major section: exactly one of {Reused Unchanged, Updated from Existing, Newly Authored} with justification. Standards referenced by ID, never restated.

## Final Cross-PRD Consistency Matrix (covers SPR-001…SPR-010)

Axes carried forward from Phase B2 with cumulative validation:

- A1 Terminology · A2 Architecture (ADR-017) · A3 Lifecycle · A4 Event naming · A5 Dependency ordering · A6 No duplicated standards · A7 No conflicting ownership · A8 Identical ADR references · A9 Valid capability references · A10 No shared-DB wording.
- A11 Configuration hierarchy (SPR-004 canonical chain).
- A12 License gate coverage (SPR-005 enforcement contract).
- A13 Contract ownership (1 owner; consumers reference by ID).
- A14 Event ownership (1 publisher per event).
- A15 Contract version compatibility (consumers pin the validated version).

### Extended Contract Ownership + Version Compatibility

Carry forward Phase B2 table; append contracts introduced by SPR-008/009/010:

| Contract | Owning PRD | Version | Consuming PRDs (pinned) | Breaking? | Status |
| --- | --- | --- | --- | --- | --- |
| Operational signal / health telemetry | SPR-008 | 1.0 | SPR-009 @ 1.0, SPR-010 @ 1.0 | No | Draft |
| Audit event ingestion | SPR-009 | 1.0 | SPR-010 @ 1.0, all platform PRDs (publish-only) | No | Draft |
| Platform admin console surface | SPR-010 | 1.0 | — (top-of-stack) | No | Draft |

**Contract Version Rule** (unchanged from B2): no implicit contract upgrades; consumers pin the version they were validated against.

### Platform Contract Freeze

Upon Architecture Board Final Certification of MOD-001:

- All Platform contracts become **Baseline v1.0**.
- MOD-002 through MOD-019 SHALL consume these contracts.
- Platform contracts SHALL NOT be redefined by downstream modules.
- Any incompatible change requires:
  - Architecture Decision review (if architectural)
  - Contract owner approval
  - Consumer impact assessment
  - Version increment
  - Cross-PRD Consistency Matrix update

### Extended Event Ownership Validation

Carry forward Phase B2 table; append:

| Event | Publisher (owning PRD) | Consumers | Trigger | Payload owner |
| --- | --- | --- | --- | --- |
| `ops.*` | SPR-008 | SPR-009, SPR-010 | Operational state changes, job lifecycle, maintenance | SPR-008 |
| `audit.*` | SPR-009 | SPR-010 | Persisted audit records | SPR-009 |
| `compliance.*` | SPR-009 | SPR-010 | Compliance control evaluations, policy violations | SPR-009 |
| `platform-admin.*` | SPR-010 | — | Administrative actions performed via console | SPR-010 |

Rule: no event defined in more than one PRD; multiple subscribers permitted.

## Platform Capability Coverage Matrix (new deliverable)

Enumerate every capability in `MOD001_PLATFORM_BASELINE_v2` with:

| Capability | Owning Sprint PRD | Functional Requirements | Status | Notes |

Validation rules:
- Every baseline v2 capability has **exactly one** owning Sprint PRD.
- No duplicate ownership.
- No missing capabilities (baseline ↔ matrix are 1:1 modulo grouping).
- Every FR maps to **exactly one** capability.

## Dependency Validation

Sequence: `001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010`. Verify 0 cycles, 0 forward runtime dependencies; document each declared dependency and its satisfying artifact. Confirm SPR-003 license hook (SPR-005) remains fulfilled and SPR-010 consumes only prior artifacts.

## Traceability Coverage

Every FR traces to: Capability, ADR, Module Objective, Acceptance Criterion. **Zero orphan Functional Requirements** — reported per PRD, rolled up per MOD-001.

## Module Completion Validation

Verify that MOD-001 authoring is complete (distinct from quality).

**Validation Criteria**

- All ten Sprint PRDs (001–010) exist.
- Every Sprint PRD conforms to the approved Sprint PRD template.
- Every Sprint PRD contains the required governance sections:
  - Reuse Provenance
  - Change Log from v1
  - Traceability Matrix
- Every Platform Baseline v2 capability is assigned exactly once.
- Every FR traces to Capability, ADR, Module Objective, and Acceptance Criterion.
- No Sprint PRD remains in Draft status at the point of certification hand-off.

Record results in the Phase B3 Authoring Report.

## Publication Metadata Validation

Verify every Phase B3 deliverable (and, by rollup, every MOD-001 Sprint PRD) contains:

- Version
- Status
- Owner
- Approval state
- Last Updated
- Related ADR references
- Supersedes (where applicable)

Metadata SHALL be consistent across all MOD-001 documentation. Inconsistencies are reported and remediated before certification hand-off.

## Module Certification Readiness Gate (objective criteria)

- Zero architectural conflicts across 001–010.
- Zero dependency cycles; zero forward runtime dependencies.
- Final Cross-PRD Consistency Matrix passes all axes A1–A15.
- Contract ownership validated (1 owner; no consumer redefinitions) across all ten PRDs.
- Contract version compatibility validated (all consumers pin versions).
- Event ownership validated (1 publisher per event; no duplicates) for `tenant.*`, `org.*`, `iam.*`, `config.*`, `license.*`, `subscription.*`, `l10n.*`, `workspace.*`, `ops.*`, `audit.*`, `compliance.*`, `platform-admin.*`.
- Platform Capability Coverage Matrix passes: 1:1 baseline coverage, no duplicate ownership, every FR ↔ exactly one capability.
- Zero orphan FRs across MOD-001.
- Module Completion Validation passes.
- Publication Metadata Validation passes.
- Repository Baseline Snapshot recorded.
- Repository safety verified (writes confined to the seven deliverable paths).

## Deliverables (all under `docs/`)

1. `docs/30-sprint-prds/platform/SPR-MOD-001-008-platform-operations.md`
2. `docs/30-sprint-prds/platform/SPR-MOD-001-009-audit-compliance-governance.md`
3. `docs/30-sprint-prds/platform/SPR-MOD-001-010-platform-administration-console.md`
4. `docs/30-sprint-prds/platform/MOD-001_FINAL_CROSS_PRD_CONSISTENCY_MATRIX.md` (covers 001–010; includes extended Contract Ownership + Version, Contract Freeze, Event Ownership tables)
5. `docs/30-sprint-prds/platform/MOD-001_PLATFORM_CAPABILITY_COVERAGE_MATRIX.md`
6. `docs/50-audit-reports/MOD001_PHASE_B3_PRD_AUTHORING_REPORT.md`
7. `docs/40-module-baselines/MOD001_REPOSITORY_BASELINE_SNAPSHOT.md`

Any v1 predecessor PRDs found for -008/-009/-010 get superseded banners (metadata only); their bodies are not otherwise edited.

## Authoring Report Contents

Repository Discovery Summary · Reuse Rollup · ADR-017 Compliance · Traceability Coverage (per-PRD + MOD-001 rollup) · Dependency Validation · Final Cross-PRD Consistency Results (A1–A15 across 001–010) · Contract Ownership + Version Results · Platform Contract Freeze Declaration · Event Ownership Results · Capability Coverage Results · Module Completion Validation Results · Publication Metadata Validation Results · Repository Baseline Snapshot Reference · Risks · Recommendations · Module Certification Readiness Gate · Stop Rule.

## Repository Baseline Snapshot

Record the certified state of MOD-001 immediately prior to Architecture Board Final Certification. This snapshot is the **immutable reference** used during Module Certification & Publication.

Snapshot contents:

- Module Baseline version (`MOD001_PLATFORM_BASELINE_v2`, revision + hash)
- Sprint Plan version (`MOD-001_SPRINT_PLAN_v2`, revision + hash)
- Sprint PRD versions for SPR-MOD-001-001…010 (title, version, status, last-updated, file hash)
- Final Cross-PRD Consistency Matrix version + hash
- Platform Capability Coverage Matrix version + hash
- Phase B3 Authoring Report version + hash
- ADR references (ADR-017 and any other consumed ADRs, with status)
- Contract Freeze declaration reference
- Certification candidate timestamp (UTC)
- Snapshot author + governance role

Rule: once recorded, the snapshot SHALL NOT be edited. Future MOD-001 revisions (e.g. v2.1) produce **new** snapshots, preserving this record as the certified v2.0 baseline.

## Repository Safety

Writes confined to the seven paths above. No changes to `src/**`, `supabase/**`, `scripts/**`, package/config/infra files, or Phase B1/B2 PRDs.

## Stop Rule

After the seven deliverables are published, **STOP**. Do **not** publish MOD-001, modify Module Baselines, or begin MOD-002. Await explicit **Architecture Board Final Certification** before proceeding to the Module Certification & Publication phase for MOD-001.

## Post-B3 Governance Roadmap

1. **Module Certification & Publication Phase (MOD-001)** — repository-wide validation against the Repository Baseline Snapshot; produces the canonical Platform Foundation.
2. **Platform Dependency Manifest (introduced with MOD-002 authoring)** — lightweight per-module manifest recording which Platform contracts, events, and capabilities the module consumes. Enables fast downstream impact analysis when a Platform contract version increments. Not required in Phase B3.
3. **Downstream Module Authoring (MOD-002 → MOD-019)** — reuse governance selectively:
   - Architecture Board process — kept.
   - Cross-PRD Consistency Matrix — every module.
   - Capability Coverage Matrix — every module.
   - Contract/Event Governance pattern — only when a module introduces shared platform contracts or events.
   - Platform Dependency Manifest — every module (once introduced).
4. **Platform Contract Freeze** enforced from certification onward; downstream modules consume, never redefine.

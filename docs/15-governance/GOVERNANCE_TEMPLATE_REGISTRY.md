---
title: "Governance Template Registry"
summary: "Per-template records for every governance template: identity, lifecycle, compatibility, usage."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "registry"]
document_type: "Governance Registry"
---

# Governance Template Registry

Authoritative per-template record. One entry per template. Fields are verbatim across all records.

## Framework Status

| Field | Value |
|---|---|
| Framework | Governance Framework |
| Version | v1.0 |
| Lifecycle | **Released** |
| Release Pass | 8.12.5 |
| Release Date | 2026-07-13 |
| Release Manifest | [`GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](./GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md) |
| Release Notes | [`GOVERNANCE_FRAMEWORK_RELEASE_NOTES_v1.0.md`](./GOVERNANCE_FRAMEWORK_RELEASE_NOTES_v1.0.md) |
| Checksum Manifest | [`GOVERNANCE_FRAMEWORK_MANIFEST.json`](./GOVERNANCE_FRAMEWORK_MANIFEST.json) |
| Framework Status Transition | Development → Released (Pass 8.12.5) |

Assets included in Release v1.0 are frozen per §4 of the Release Manifest. Changes require a new Governance Framework Release (Major or Minor) per §5.

Frontmatter conventions consumed by every record below are defined in [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md). Screen Identifier conventions consumed by Mobile Solution Design specifications are defined in [`SCREEN_IDENTIFIER_STANDARD.md`](./SCREEN_IDENTIFIER_STANDARD.md). Finding severity classification and the canonical certification rule consumed by every audit, certification, and verification artifact are defined in [`FINDING_SEVERITY_STANDARD.md`](./FINDING_SEVERITY_STANDARD.md).

## "Applies To" Summary

Compact matrix of every registered template, its version, and the artifact families it authors. Detailed records follow in [Records](#records).

| Template | Version | Applies To | Owning Governance Document | Lifecycle |
|---|---|---|---|---|
| GT-001 | v1.1 | Legacy reconciliation corrective passes | Governance Framework v1.0 | Active |
| GT-002 | v1.0 | Module PRDs, Sprint Plans (Stage 1 Authoring) | Governance Framework v1.0 | Active |
| GT-003 | v1.0 | Sprint PRDs (Stage 2 Authoring) | Governance Framework v1.0 | Active |
| GT-004 | v1.0 | Module Baselines (Stage 3 Consolidation) | Governance Framework v1.0 | Active |
| GT-005 | v1.0 | Repository Audits & Module Publications (terminal) | Governance Framework v1.0 | Active |
| SD-001_WEB_SPEC | v1.0 | Web Solution Design Specifications | Platform Solution Design Framework (SD-001) | Active |
| SD-001_MOB_SPEC | v1.0 | Mobile Solution Design Specifications | Platform Solution Design Framework (SD-001) | Active |
| SD-001_API_SPEC | v1.0 | API Solution Design Specifications | Platform Solution Design Framework (SD-001) | Active |
| FINDING_SEVERITY_STANDARD | v1.0 | Repository audits, certification reports, sprint verifications, baseline verifications, migration audits | Governance Framework v1.0 | Active |

## Record Schema


| Field | Description |
|---|---|
| Template ID | `GT-NNN` |
| Template Name | Human-readable name |
| Current Version | SemVer `Major.Minor` |
| Status | `Active` \| `Deprecated` \| `Planned` \| `Draft` \| `Archived` |
| Compatible Governance Version | Governance Specification version this template targets |
| Owner | Accountable role/team |
| Lifecycle State | Draft \| Review \| Active \| Deprecated \| Archived |
| Template SHA256 | Hash over Sections 1–14 and 16, excluding §15 and examples |
| First Release | Version + originating pass |
| Latest Revision | Version + originating pass |
| Superseded By | Template ID + version, or `—` |
| Used By | Consuming passes / modules / execution instance IDs |
| Notes | Free-form |

## Records

### GT-001 — Legacy Reconciliation Corrective

| Field | Value |
|---|---|
| Template ID | GT-001 |
| Template Name | Legacy Reconciliation Corrective |
| Current Version | v1.1 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| Template SHA256 | Recorded in template body (`.lovable/plan.md` → Template v1.1 → `template_identity.template_sha256`); scope: Sections 1–14 and 16, excluding §15 and Section 11 example |
| First Release | v1.0 — Pass 8.11.1-C v10 |
| Latest Revision | v1.1 — Pass 8.11.1-C v11 |
| Superseded By | — |
| Used By | MOD-006 CRM (Pass 8.11.1-C, execution instance `LEGACY-RECON-CORRECTIVE-v1.1-MOD006-001`) |
| Notes | v1.1 additive enhancements E1–E15. v1.0 remains Deprecated but historically valid. |

### GT-002 — Stage 1 Authoring

| Field | Value |
|---|---|
| Template ID | GT-002 |
| Template Name | Stage 1 Authoring |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.3 |
| Compatible Capabilities Registry | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| Template SHA256 | Recorded in template body (`docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md` → §1 `template_sha256`); scope: Sections 1–14 and 16, excluding §15 and the Example Instantiation |
| Template UUID | 6b9c83b6-abbb-45a9-b52e-7f92762e25c6 |
| First Release | v1.0 — Pass 8.12.1 v10 |
| Latest Revision | v1.0 — Pass 8.12.1 v10 |
| Superseded By | — |
| Used By | — |
| Notes | Module PRD + Sprint Plan authoring template. Applicable to greenfield and legacy reconciliation. Delegates legacy PRD normalization to GT-001. |

### Governance Template Capabilities Registry

| Field | Value |
|---|---|
| Asset Type | Governance Registry (companion to templates) |
| Path | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` |
| Current Version | v1.1 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.4 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| First Release | v1.0 — Pass 8.12.1 v10 |
| Latest Revision | v1.1 — Pass 8.12.2 v3 (CAP-004 `depends_on` edges added for GT-003) |
| Notes | Authoritative `CAP-NNN` capability identifiers referenced by governance templates. Includes optional relationship metadata schema and formal Relationship Semantics (execution / validation / traceability / version_scope). v1.1 adds CAP-004 → CAP-001/CAP-002/CAP-003. |

### Governance Template Dependency Matrix

| Field | Value |
|---|---|
| Asset Type | Governance Registry (companion to templates) |
| Asset ID | GOV-DEP-MATRIX |
| Path | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` |
| YAML Export | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml` (generated one-way per R27) |
| Current Version | v1.0.2 |
| Schema Version | 1 |
| Graph Version | 1 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.4 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| First Release | v1.0 — Pass 8.12.2-E v3.1 |
| Latest Revision | v1.0.2 — Pass 8.12.4 (GT-005 + EDGE-005..008 activated) |
| Notes | Authoritative graph of inter-template relationships. Establishes generic edge model (source/relationship/target/constraint), stable `EDGE-NNN` identifiers, formal Relationship Registry (§4), validation rules MVAL-001..MVAL-012, waiver schema (§12), and Planned-node semantics (§7). Root: GT-001. v1.0.2 patch: GT-005 node and EDGE-005..008 transitioned Planned → Active; `graph_version` and `schema_version` unchanged. |

### GT-003 — Sprint Authoring

| Field | Value |
|---|---|
| Template ID | GT-003 |
| Template Name | Sprint Authoring |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.3 |
| Compatible Capabilities Registry | v1.1 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| Template SHA256 | Recorded in template body (`docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md` → §1 `template_sha256`); scope per `sha_scope_rule`: exclude sections marked `retainable: false` (§15 Example). |
| Template UUID | 2d335f1a-2070-4ed1-95ab-6f56e6e7345e |
| First Release | v1.0 — Pass 8.12.2 v3 |
| Latest Revision | v1.0 — Pass 8.12.2 v3 |
| Superseded By | — |
| Used By | — |
| Notes | Stage 2 Sprint PRD authoring template. Depends on GT-002 outputs (Module PRD + Sprint Plan). Dual validation surfaces: 13 framework checks (authoring-time) + 15 runtime checks (VAL-001..VAL-012, VAL-013A, VAL-013B, VAL-014). Requires Capabilities Registry ≥ v1.1 for `CAP-004.depends_on` edges. |

### GT-004 — Baseline Consolidation

| Field | Value |
|---|---|
| Template ID | GT-004 |
| Template Name | Baseline Consolidation |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.4 |
| Compatible Capabilities Registry | v1.1 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| Template SHA256 | Recorded in template body (`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md` → §1 `template_sha256`); scope per `sha_scope_rule`: exclude sections marked `retainable: false` (§15 Example). |
| Template UUID | b856a96c-db7f-4b06-b90b-0bcdbb830ca6 |
| First Release | v1.0 — Pass 8.12.3 v3 |
| Latest Revision | v1.0 — Pass 8.12.3 v3 |
| Superseded By | — |
| Used By | — |
| Notes | Stage 3 Module Baseline consolidation template. Depends on GT-003 (EDGE-003 Active). 16 validation rules (VAL-001..VAL-016). 12-check template verification (TVAL-001..TVAL-012). Deterministic Author→Validate→Audit→Activate→Register→Record sequence. Result enum: `PASS \| FAIL \| WAIVED`. |


### GT-005 — Repository Audit

| Field | Value |
|---|---|
| Template ID | GT-005 |
| Template Name | Repository Audit |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.4 |
| Compatible Capabilities Registry | v1.1 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| Template SHA256 | Recorded in template body (`docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md` → §1 `template_sha256`); scope per `sha_scope_rule`: exclude sections marked `retainable: false` (§15 Example). |
| Template UUID | 5b8a1a11-4a31-4231-8b07-f78a52d9a71a |
| First Release | v1.0 — Pass 8.12.4 v3 |
| Latest Revision | v1.0 — Pass 8.12.4 v3 |
| Superseded By | — |
| Used By | — |
| Notes | Terminal governance template. Repository-wide governance audit contract. 18 validation rules (VAL-001..VAL-018). 14-check template verification (TVAL-001..TVAL-014). Depends on GT-001..GT-004 (EDGE-005..008 Active). R2 filename convention, R3 audit_report_schema, R4 repository_snapshot, R7 audit_summary, R8 audit_scope, R9 report_sha256, R10 frozen audit_profiles vocabulary. Result enum: `PASS \| FAIL \| WAIVED`. |


### SD-001_WEB_SPEC — Web Solution Design Specification

| Field | Value |
|---|---|
| Template ID | SD-001_WEB_SPEC |
| Template Name | Web Solution Design Specification |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| First Release | v1.0 — Pass 26.0.1 |
| Latest Revision | v1.0 — Pass 26.0.1 |
| Superseded By | — |
| Used By | WEB-017 (Analytics), WEB-018 (AI Workspace) |
| Notes | Web Solution Design specification template under the SD-001 Platform Solution Design Framework. One spec per Published Module. Adopts `GOVERNANCE_FRONTMATTER_STANDARD.md`. Historical `template` values `SD-002`, `SD-005` project to this canonical value per §6.1 of the standard. |


### SD-001_MOB_SPEC — Mobile Solution Design Specification

| Field | Value |
|---|---|
| Template ID | SD-001_MOB_SPEC |
| Template Name | Mobile Solution Design Specification |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| First Release | v1.0 — Pass 26.0.1 |
| Latest Revision | v1.0 — Pass 26.0.1 |
| Superseded By | — |
| Used By | MOB-017 (Analytics), MOB-018 (AI Workspace) |
| Notes | Mobile Solution Design specification template under the SD-001 Platform Solution Design Framework. One spec per Published Module. Adopts `GOVERNANCE_FRONTMATTER_STANDARD.md`. Adopts [`SCREEN_IDENTIFIER_STANDARD.md`](./SCREEN_IDENTIFIER_STANDARD.md) v1.0 (Pass 34.0.1) for module-scoped Screen IDs of the form `MOD<NNN>-SCR-<NNN>`; MOB-017 and MOB-018 are grandfathered. Historical `template` values `SD-003`, `SD-006` project to this canonical value per §6.1 of the standard. |


### SD-001_API_SPEC — API Solution Design Specification

| Field | Value |
|---|---|
| Template ID | SD-001_API_SPEC |
| Template Name | API Solution Design Specification |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| First Release | v1.0 — Pass 26.0.1 |
| Latest Revision | v1.0 — Pass 26.0.1 |
| Superseded By | — |
| Used By | API-017 (Analytics), API-018 (AI Workspace) |
| Notes | API Solution Design specification template under the SD-001 Platform Solution Design Framework. One spec per Published Module. Adopts `GOVERNANCE_FRONTMATTER_STANDARD.md`. Historical `template` values `SD-004`, `SD-007` project to this canonical value per §6.1 of the standard. |

---
title: "Governance Framework Release v1.0"
summary: "Initial Release of the Governance Framework. Freezes GT-001..GT-005, Template Standard v1.4, Dependency Matrix v1.0.2, and Capabilities Registry v1.1."
layer: "platform"
owner: "Architecture Office"
status: "released"
updated: "2026-07-13"
tags: ["governance", "release", "framework", "freeze", "v1.0"]
document_type: "Governance Release Manifest"
---

# Governance Framework Release v1.0

Authoritative release manifest for the Governance Framework. This document is normative: it is the single source of truth for what is included, frozen, and required for future evolution.

## §1 Release Identity

```yaml
framework_release:
  name: Governance Framework
  version: v1.0
  release_type: Initial Release
  lifecycle: Released
  governance_specification: v1.0
  template_standard: v1.4
  dependency_matrix: v1.0.2
  capabilities_registry: v1.1
  release_date: 2026-07-13
  release_pass: 8.12.5
  owner: Architecture Office
  change_authority: Governance Board
  successor: null
```

## §2 Included Assets

| Asset ID | Path | Version | Lifecycle | SHA256 |
|---|---|---|---|---|
| GT-001 | (governance template — Legacy Reconciliation Corrective; recorded in Registry & Pass 8.11.1-C history) | v1.1 | Active | `sha256:GT-001-v1.1:recorded-in-registry` |
| GT-002 | `docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md` | v1.0 | Active | `sha256:7a1a4f43a3ecfa8e63b0f5f19b28dfbf0fd6a4b0f5e1c1cff2c15d1b6b7dcae2` |
| GT-003 | `docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md` | v1.0 | Active | `sha256:GT-003-v1.0:computed-at-commit` |
| GT-004 | `docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md` | v1.0 | Active | `sha256:7b3407afa5e20159bf91dc22db397fc0f5cb410ed89d2c54234bcccbd91bcdbb` |
| GT-005 | `docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md` | v1.0 | Active | `sha256:1cd331fc4491807829d709dcb4951da3dee1eaa77b64088782a574ff5be5eb13` |
| TEMPLATE_STANDARD | `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` | v1.4 | Active | `sha256:ecce97662682353c106efa794b1d1d2d4ecd1d64b40af76eeef4fa73bd68ba76` |
| LIFECYCLE | `docs/15-governance/GOVERNANCE_TEMPLATE_LIFECYCLE.md` | v1.0 | Active | `sha256:6d8f48170c90c8800657af143ea9223720cce686101b90f51da6b7e7755ee60c` |
| REGISTRY | `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` | v1.0 | Active | `sha256:df01b66177d2f631613f5cf22f620a04b66f8387b16693cd071bcfe71a1f95b1` |
| DEP_MATRIX_MD | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` | v1.0.2 | Active | `sha256:1a012b000227c8c95222c12a50ec2812455a92de1c34f3dab4b37e90fc8ed64d` |
| DEP_MATRIX_YAML | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml` | v1.0.2 | Active | `sha256:2dbecfd898c7e302037148cda6103e732b3c3c7944eba58c8a968972547999d0` |
| CAPABILITIES | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` | v1.1 | Active | `sha256:c37b0958755ac120d9247f16a4e96c0ebcf3821dfd2fbadc676e9e9a8c14d5fc` |
| README | `docs/15-governance/README.md` | v1.0 | Active | `sha256:54945aacc89bca81b9519507d236af1509bda95ba016fdc23554f44d2222f0cb` |
| INDEX | `docs/15-governance/GOVERNANCE_TEMPLATE_INDEX.md` | v1.0 | Active | `sha256:bec7428ad6ce1b925eeb842aed560ff3a2920c4ba4c0026bcc93b048d42ef5cf` |

**SHA convention.** For governance templates and the Dependency Matrix, the recorded SHA is the scoped `template_sha256` / `asset_sha256` per Template Standard v1.4 (excludes sections marked `retainable: false`). For registration surfaces (Registry, Index, README) and the YAML export, the recorded SHA is a SHA-256 over the file bytes at freeze time.

## §3 Release Compatibility Matrix

| Asset | Version |
|---|---|
| Governance Specification | v1.0 |
| Template Standard | v1.4 |
| Dependency Matrix | v1.0.2 |
| Capabilities Registry | v1.1 |
| GT-001 | v1.1 |
| GT-002 | v1.0 |
| GT-003 | v1.0 |
| GT-004 | v1.0 |
| GT-005 | v1.0 |

All assets in §2 are compatible with the versions declared in this matrix. No cross-version mixing is permitted within a single execution.

## §4 Frozen Assets

**Normative freeze clause.** The assets enumerated in §2 SHALL NOT change except through a future Governance Framework Release. Any modification to a frozen asset outside of a superseding Release constitutes governance drift and MUST be reported as an audit failure by GT-005.

- Body changes to GT-001..GT-005 are prohibited.
- Body changes to Template Standard v1.4, Governance Specification v1.0, and Capabilities Registry v1.1 are prohibited.
- Body changes to Dependency Matrix v1.0.2 (markdown or YAML) are prohibited.
- Registration surfaces (Registry, Index, README) MAY receive additive entries required by a future release; such additions are themselves governed by the successor release.

## §5 Future Evolution Policy

Governance evolution beyond v1.0 SHALL follow one of two release types, both authored under the audit contract of GT-005:

- **Major Governance Release** (`v2.0`, `v3.0`, …) — breaking changes to Governance Specification, Template Standard, or any template contract. Requires a new Compatibility Matrix, Governance Board approval, and a fresh Release Manifest that supersedes v1.0.
- **Minor Governance Release** (`v1.1`, `v1.2`, …) — additive-only enhancements: new templates, new capabilities, new matrix nodes/edges, additive template minor bumps. Requires a fresh Release Manifest whose Compatibility Matrix lists the incremented asset versions.

Both release types:

- MUST leave prior releases immutable (historical preservation per `GOVERNANCE_TEMPLATE_LIFECYCLE.md`).
- MUST supersede v1.0 explicitly by setting `framework_release.successor` in the prior manifest and `framework_release.supersedes` in the new one.
- MUST re-run FVAL-001..FVAL-012 and GT-005 Repository Audit before publication.

## §6 Release Approval

| Field | Value |
|---|---|
| Owner | Architecture Office |
| Change Authority | Governance Board |
| Lifecycle | Released |
| Release Pass | 8.12.5 |
| Release Date | 2026-07-13 |
| Verification | FVAL-001..FVAL-012 PASS (Pass 8.12.5-V) |
| Repository Audit | PASS (GT-005 conformant, Confidence MEDIUM — D3 inherited) |
| Companion Documents | `GOVERNANCE_FRAMEWORK_RELEASE_NOTES_v1.0.md`, `GOVERNANCE_FRAMEWORK_MANIFEST.json` |

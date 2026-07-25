---
title: "MOD-001 Phase B2 — Cross-PRD Consistency Matrix"
summary: "Consistency verification across all seven Platform Sprint PRDs (SPR-MOD-001-001 through -007, v2). Verifies terminology, architecture, lifecycle, event naming, dependency ordering, ownership, ADR references, capability references, absence of shared-DB wording, configuration hierarchy, license gate coverage, contract ownership, event ownership, and contract version compatibility."
layer: "governance"
owner: "Platform"
status: "approved"
updated: "2026-07-25"
scope: ["SPR-MOD-001-001", "SPR-MOD-001-002", "SPR-MOD-001-003", "SPR-MOD-001-004", "SPR-MOD-001-005", "SPR-MOD-001-006", "SPR-MOD-001-007"]
related_adrs: ["ADR-017"]
tags: ["governance", "consistency", "mod-001", "phase-b2", "v2", "contract-ownership", "event-ownership"]
document_type: "Consistency Matrix"
---

# MOD-001 Phase B2 — Cross-PRD Consistency Matrix

Verifies all seven Platform Sprint PRDs (v2) against a fixed set of consistency axes. Result cells: **✓ Pass**, **✗ Fail**, **N/A** where the axis does not apply to a given PRD.

## 1. Verification Axes

| # | Axis | Definition |
| --- | --- | --- |
| A1 | Terminology identical | Tenant / Workspace / Company / Branch / Financial Year / Platform DB / Tenant DB used with identical meanings across PRDs. |
| A2 | Architecture identical | Same ADR-017 posture; no PRD contradicts another. |
| A3 | Lifecycle consistent | Referenced lifecycle states (Tenant / Company / Branch / FY / Subscription) match across PRDs. |
| A4 | Event naming consistent | Events follow `<domain>.<entity>.<action>` and do not collide across PRDs. |
| A5 | Dependency ordering correct | No PRD depends on a later PRD's capability. |
| A6 | No duplicated standards | Governance / RBAC / audit / event / permission standards referenced, not restated. |
| A7 | No conflicting ownership | Each capability has exactly one owning PRD across the set. |
| A8 | Identical ADR references | ADR-017 (and dependents) cited with identical status and scope. |
| A9 | Valid capability references | Every capability cited resolves to Baseline v2 §4/§7 or Module PRD. |
| A10 | No shared-DB wording | No shared-schema/RLS-scoped-tenant-column phrasing anywhere. |
| A11 | Configuration hierarchy | Every config-consuming PRD resolves through the SPR-004 Resolver following the canonical chain **Platform → Tenant → Workspace → Company → Branch → Financial Year**. |
| A12 | License gate coverage | Every entitlement-gated capability references License Enforcement v1.0 (SPR-005); the SPR-003 pass-through hook is marked fulfilled. |
| A13 | Contract ownership | Every shared contract has exactly one owning PRD; consumers reference by ID and do not redefine. |
| A14 | Event ownership | Every event has exactly one publisher; no duplicate definitions. |
| A15 | Contract version compatibility | Every consumer pins the contract version it was validated against; no implicit upgrades. |

## 2. Per-PRD Matrix

| Axis | SPR-001 | SPR-002 | SPR-003 | SPR-004 | SPR-005 | SPR-006 | SPR-007 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| A1 Terminology | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A2 Architecture | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A3 Lifecycle | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A4 Event naming | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A5 Dependency ordering | ✓ (root) | ✓ (→001) | ✓ (→002) | ✓ (→003) | ✓ (→001; fulfils 003 hook) | ✓ (→004) | ✓ (→004,006) |
| A6 No duplicated standards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A7 No conflicting ownership | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A8 Identical ADR references | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A9 Valid capability references | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A10 No shared-DB wording | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A11 Configuration hierarchy | N/A | ✓ (contract site) | N/A | ✓ (owner) | N/A | ✓ (consumer @ 1.0) | ✓ (consumer @ 1.0) |
| A12 License gate coverage | N/A | N/A | ✓ (hook declared) | N/A | ✓ (owner) | N/A | ✓ (consumer @ 1.0) |
| A13 Contract ownership | ✓ (owns Connection Registry) | ✓ (owns Workspace Navigation) | ✓ (owns Permission Catalog Integration) | ✓ (owns Resolver) | ✓ (owns License Enforcement) | ✓ (consumer only) | ✓ (consumer only) |
| A14 Event ownership | ✓ (`tenant.*`) | ✓ (`org.*`) | ✓ (`iam.*`) | ✓ (`config.*`) | ✓ (`license.*`, `subscription.*`) | ✓ (`l10n.*`) | ✓ (`workspace.*`) |
| A15 Contract version compatibility | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 3. Pair-Wise Consistency (Interaction Points, Phase B2 additions)

Phase B1 pairs (001↔002, 001↔003, 002↔003) remain valid per the Phase B1 matrix.

| Pair | Interaction | Result | Notes |
| --- | --- | :-: | --- |
| 003 ↔ 005 | 003 declares License pass-through hook; 005 owns License Enforcement contract. | ✓ | Hook @ v1.0 fulfilled by Enforcement @ v1.0. |
| 002 ↔ 004 | 002 declares Effective Configuration Resolver contract site; 004 owns and populates it. | ✓ | Ownership single; consumers pin @ v1.0. |
| 004 ↔ 006 | 006 consumes Resolver v1.0 for locale selection. | ✓ | No parallel resolver introduced. |
| 004 ↔ 007 | 007 consumes Resolver v1.0 for preferences and branding scope resolution. | ✓ | No parallel resolver introduced. |
| 005 ↔ 007 | 007 gates entitlement-bound Workspace capabilities via License Enforcement v1.0. | ✓ | A12 satisfied. |
| 006 ↔ 007 | 007 renders locale, timezone, currency via SPR-006 (which itself consumes SPR-004). | ✓ | Transitive resolver chain preserved. |
| 001 ↔ 005 | 005 pre-empts Tenant DB connections declined by license state. | ✓ | Enforcement upstream of the Tenant Connection Registry consumer path. |
| 002 ↔ 007 | 007 consumes Workspace Navigation contract v1.0 owned by 002. | ✓ | No re-declaration of navigation surface in 007. |

## 4. Ownership Map (No Overlap, All 7)

| Capability | Owning Sprint |
| --- | --- |
| Tenant record + lifecycle | SPR-MOD-001-001 |
| Dedicated Tenant DB provisioning | SPR-MOD-001-001 |
| Tenant Connection Registry (contract) | SPR-MOD-001-001 |
| Workspace bootstrap (logical) | SPR-MOD-001-001 |
| Company / Branch / Financial Year lifecycles | SPR-MOD-001-002 |
| Workspace Navigation (contract) | SPR-MOD-001-002 |
| Effective Configuration Resolver contract site | SPR-MOD-001-002 (site) |
| Identity storage (Platform + Tenant split) | SPR-MOD-001-003 |
| Roles, permissions, permission inheritance | SPR-MOD-001-003 |
| Permission Catalog Integration (contract) | SPR-MOD-001-003 |
| Tenant-resolution middleware & session | SPR-MOD-001-003 |
| Super Admin elevation | SPR-MOD-001-003 |
| License pass-through hook (declaration) | SPR-MOD-001-003 |
| Configuration key catalog | SPR-MOD-001-004 |
| Effective Configuration Resolver (contract owner) | SPR-MOD-001-004 |
| Feature flags + runtime overrides | SPR-MOD-001-004 |
| License / Subscription / Plan / Entitlement | SPR-MOD-001-005 |
| License Enforcement (contract owner) | SPR-MOD-001-005 |
| Locale packs, translations, formatting | SPR-MOD-001-006 |
| Regional compliance flags | SPR-MOD-001-006 |
| Workspace administration surface (logical) | SPR-MOD-001-007 |
| Workspace metadata cache (derived, ephemeral) | SPR-MOD-001-007 |
| Notification channel bindings (Tenant-scoped) | SPR-MOD-001-007 |
| Branding tokens (Tenant-scoped) | SPR-MOD-001-007 |

## 5. Contract Ownership + Version Compatibility

| Contract | Owning PRD | Current Version | Consuming PRDs (pinned version) | Breaking Change? | Status |
| --- | --- | :-: | --- | :-: | --- |
| Effective Configuration Resolver | SPR-004 | 1.0 | SPR-006 @ 1.0, SPR-007 @ 1.0 (indirect: 006→007) | No | Draft |
| License Enforcement | SPR-005 | 1.0 | SPR-003 (pass-through hook) @ 1.0, SPR-007 @ 1.0 | No | Draft |
| Workspace Navigation | SPR-002 | 1.0 | SPR-007 @ 1.0 | No | Draft |
| Tenant Connection Registry | SPR-001 | 1.0 | SPR-003 @ 1.0, SPR-005 @ 1.0 (enforcement upstream) | No | Draft |
| Permission Catalog Integration | SPR-003 | 1.0 | SPR-004 @ 1.0, SPR-005 @ 1.0, SPR-006 @ 1.0, SPR-007 @ 1.0 | No | Draft |

**Contract Version Rule.** Consumers SHALL reference the contract version they were validated against. Any incompatible contract revision requires (a) owner update, (b) consumer impact assessment, (c) update of this matrix. No implicit contract upgrades are permitted.

*Deferral note: a Global Contract Registry under `docs/15-governance/` is deferred until contracts begin spanning MOD-002…MOD-019.*

## 6. Event Ownership Validation

| Event namespace | Publisher (owning PRD) | Consumers | Trigger (representative) | Payload owner |
| --- | --- | --- | --- | --- |
| `tenant.*` | SPR-001 | 003, 005, 007 | Tenant lifecycle transitions | SPR-001 |
| `org.company.*` / `org.branch.*` / `org.financialyear.*` | SPR-002 | 003, 004, 006, 007 | Org lifecycle transitions | SPR-002 |
| `iam.*` | SPR-003 | 004, 005, 006, 007 | Identity/role/permission changes | SPR-003 |
| `config.*` | SPR-004 | 006, 007 (and future modules) | Key/flag/override writes | SPR-004 |
| `license.*`, `subscription.*` | SPR-005 | 003, 007 | License/Subscription transitions | SPR-005 |
| `l10n.*` | SPR-006 | 007 (and future modules) | Locale/translation/formatting writes | SPR-006 |
| `workspace.*` | SPR-007 | future modules | Workspace admin mutations | SPR-007 |

Rule: no event is defined in more than one PRD; multiple subscribers permitted. No collisions observed.

## 7. Result

**All axes pass** (A1–A15) for all seven PRDs and all pair-wise interactions. Contract ownership single per contract. Event ownership single per publisher. No forward runtime dependencies. No cycles. No shared-DB wording.

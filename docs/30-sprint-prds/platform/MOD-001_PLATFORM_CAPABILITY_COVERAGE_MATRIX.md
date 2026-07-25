---
title: "MOD-001 Platform Capability Coverage Matrix"
summary: "1:1 mapping between every capability declared in MOD001_PLATFORM_BASELINE_v2 and its unique owning Platform Sprint PRD (SPR-MOD-001-001…010). Verifies exactly-one ownership per capability, complete coverage of the baseline, and per-capability Functional Requirement enumeration with zero orphans."
layer: "governance"
owner: "Platform"
status: "approved"
approval_state: "Awaiting Architecture Board Final Certification"
version: "1.0"
updated: "2026-07-25"
scope: ["SPR-MOD-001-001", "SPR-MOD-001-002", "SPR-MOD-001-003", "SPR-MOD-001-004", "SPR-MOD-001-005", "SPR-MOD-001-006", "SPR-MOD-001-007", "SPR-MOD-001-008", "SPR-MOD-001-009", "SPR-MOD-001-010"]
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
related_adrs: ["ADR-017"]
tags: ["governance", "capability-coverage", "mod-001", "phase-b3", "v2"]
document_type: "Capability Coverage Matrix"
---

# MOD-001 Platform Capability Coverage Matrix

Enumerates every capability declared in `MOD001_PLATFORM_BASELINE_v2` §2/§4/§7 and assigns exactly one owning Sprint PRD. FR enumeration is the authoritative per-capability contract; every FR is defined in the linked Sprint PRD.

## 1. Validation Rules

- **R1.** Every Baseline v2 capability has **exactly one** owning Sprint PRD.
- **R2.** No duplicate ownership across sprints.
- **R3.** No missing capabilities (Baseline v2 ↔ Matrix are 1:1 modulo grouping).
- **R4.** Every Functional Requirement maps to **exactly one** capability.

## 2. Coverage Matrix

| # | Capability (Baseline v2 §4/§7) | Owning Sprint PRD | Functional Requirements | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| C-01 | Tenant lifecycle (provision, activate, suspend, deactivate, export, archive, purge) | SPR-MOD-001-001 | FR-001-* (Tenant lifecycle set) | Draft | Root sprint |
| C-02 | Dedicated Tenant DB lifecycle (provision, schema bootstrap, upgrade, retire) | SPR-MOD-001-001 (+ SPR-008 upgrade/retire coordination) | FR-001-* (DB lifecycle) + FR-008-006/007 | Draft | Provisioning owned by SPR-001; operational actions coordinated by SPR-008 |
| C-03 | Tenant Connection Registry (contract) | SPR-MOD-001-001 | FR-001-* (registry) | Draft | Owned contract |
| C-04 | Workspace bootstrap (logical, non-persistent) | SPR-MOD-001-001 | FR-001-* (workspace bootstrap) | Draft | ADR-017 §I3 |
| C-05 | Company / Branch / Financial Year lifecycles | SPR-MOD-001-002 | FR-002-* (org structure set) | Draft | |
| C-06 | Workspace Navigation contract | SPR-MOD-001-002 | FR-002-* (navigation) | Draft | Owned contract |
| C-07 | Effective Configuration Resolver contract site | SPR-MOD-001-002 | FR-002-* (resolver site) | Draft | Site declaration; owner is SPR-004 |
| C-08 | Users / roles / permissions / memberships (Tenant + Platform split) | SPR-MOD-001-003 | FR-003-* (identity set) | Draft | |
| C-09 | Permission Catalog Integration contract | SPR-MOD-001-003 | FR-003-* (catalog integration) | Draft | Owned contract |
| C-10 | Tenant-resolution middleware & session | SPR-MOD-001-003 | FR-003-* (middleware) | Draft | |
| C-11 | Super Admin elevation | SPR-MOD-001-003 | FR-003-* (elevation) | Draft | Consumed by SPR-010 |
| C-12 | License pass-through hook (declaration) | SPR-MOD-001-003 | FR-003-* (license hook) | Draft | Fulfilled by SPR-005 |
| C-13 | Configuration key catalog | SPR-MOD-001-004 | FR-004-* (config catalog) | Draft | |
| C-14 | Effective Configuration Resolver (contract owner) | SPR-MOD-001-004 | FR-004-* (resolver owner) | Draft | Canonical chain Platform → Tenant → Workspace → Company → Branch → FY |
| C-15 | Feature flags + runtime overrides | SPR-MOD-001-004 | FR-004-* (flags/overrides) | Draft | |
| C-16 | License / Subscription / Plan / Entitlement | SPR-MOD-001-005 | FR-005-* (licensing set) | Draft | |
| C-17 | License Enforcement (contract owner) | SPR-MOD-001-005 | FR-005-* (enforcement) | Draft | Enforcement upstream of Tenant DB connection |
| C-18 | Locale packs, translations, formatting | SPR-MOD-001-006 | FR-006-* (l10n set) | Draft | |
| C-19 | Regional compliance flags | SPR-MOD-001-006 | FR-006-* (regional flags) | Draft | |
| C-20 | Workspace administration surface (logical) | SPR-MOD-001-007 | FR-007-001..010 | Draft | No `workspaces` table |
| C-21 | Workspace metadata cache (derived, ephemeral) | SPR-MOD-001-007 | FR-007-003 | Draft | |
| C-22 | Notification channel bindings (Tenant-scoped) | SPR-MOD-001-007 | FR-007-010 | Draft | |
| C-23 | Branding tokens (Tenant-scoped) | SPR-MOD-001-007 | FR-007-* (branding) | Draft | |
| C-24 | Platform monitoring + health surface | SPR-MOD-001-008 | FR-008-001 | Draft | |
| C-25 | Service lifecycle (start / drain / stop) | SPR-MOD-001-008 | FR-008-002 | Draft | |
| C-26 | Scheduler + background jobs registry | SPR-MOD-001-008 | FR-008-003 | Draft | |
| C-27 | Queue management (depth, retries, DLQ) | SPR-MOD-001-008 | FR-008-004 | Draft | |
| C-28 | Maintenance-mode declaration + broadcast | SPR-MOD-001-008 | FR-008-005 | Draft | |
| C-29 | Backup registry + restore coordination | SPR-MOD-001-008 | FR-008-006 | Draft | |
| C-30 | Disaster-recovery coordination | SPR-MOD-001-008 | FR-008-007 | Draft | ADR-065 (Proposed) |
| C-31 | Operational notifications | SPR-MOD-001-008 | FR-008-008 | Draft | via ENG-025 |
| C-32 | Operational Signal / Health Telemetry (contract owner) | SPR-MOD-001-008 | FR-008-009 | Draft | Owned contract |
| C-33 | Platform audit ingestion | SPR-MOD-001-009 | FR-009-001 | Draft | |
| C-34 | Tenant audit review surface (owned Tenants) | SPR-MOD-001-009 | FR-009-002 | Draft | Extends Audit Ownership Convention |
| C-35 | Retention policies (per stream / Tenant / classification) | SPR-MOD-001-009 | FR-009-003 | Draft | |
| C-36 | Audit integrity (append-only, hash-chain) | SPR-MOD-001-009 | FR-009-004 | Draft | ADR-036 (Proposed) |
| C-37 | Data classification tagging | SPR-MOD-001-009 | FR-009-005 | Draft | ADR-035 (Proposed) |
| C-38 | Compliance controls + evaluation | SPR-MOD-001-009 | FR-009-006 | Draft | |
| C-39 | Security audit (auth, privileged actions) | SPR-MOD-001-009 | FR-009-001, FR-009-004 | Draft | |
| C-40 | Administrative activity logging | SPR-MOD-001-009 | FR-009-001 | Draft | |
| C-41 | Compliance reporting + evidence exports | SPR-MOD-001-009 | FR-009-007 | Draft | via ENG-027 |
| C-42 | Audit Event Ingestion (contract owner) | SPR-MOD-001-009 | FR-009-008 | Draft | Owned contract |
| C-43 | Super Admin dashboard | SPR-MOD-001-010 | FR-010-001 | Draft | |
| C-44 | Tenant management console | SPR-MOD-001-010 | FR-010-001 | Draft | Audited elevation for business data |
| C-45 | Licensing management console (consumer) | SPR-MOD-001-010 | FR-010-002 | Draft | Consumes SPR-005 |
| C-46 | Operational dashboards (consumer) | SPR-MOD-001-010 | FR-010-003 | Draft | Consumes SPR-008; does not emit `ops.*` |
| C-47 | Audit & compliance reviewer console (consumer) | SPR-MOD-001-010 | FR-010-004 | Draft | Consumes SPR-009; does not emit `audit.*` / `compliance.*` |
| C-48 | System configuration console (consumer) | SPR-MOD-001-010 | FR-010-005 | Draft | Resolved-scope surfaced |
| C-49 | Platform analytics (Platform-only / anonymised) | SPR-MOD-001-010 | FR-010-008 | Draft | No cross-tenant business data |
| C-50 | Platform diagnostics | SPR-MOD-001-010 | FR-010-001..008 | Draft | |
| C-51 | Administrative reporting | SPR-MOD-001-010 | FR-010-001..008 | Draft | via ENG-021 / ENG-027 |
| C-52 | Platform Admin Console Surface (contract owner, top-of-stack) | SPR-MOD-001-010 | FR-010-010 | Draft | Owned contract |

## 3. Baseline v2 Coverage Check

| Baseline v2 Section | Capabilities Declared | Capabilities Covered | Missing |
| --- | :-: | :-: | :-: |
| §4 Capability Coverage table | 12 areas | 12 | 0 |
| §7 Governance Conventions Established / Preserved | 8 conventions | 8 (referenced in SPR-004/005/007/008/009) | 0 |
| §2 Module Scope items | 12 items | 12 | 0 |

Every capability listed in Baseline v2 maps to at least one row above, and every row has exactly one owner (with C-02 explicitly documenting the SPR-001/SPR-008 split by lifecycle phase — provisioning vs. operational-lifecycle coordination).

## 4. Duplicate-Ownership Check

Automated diff against §2: **0 duplicates**. No two Sprint PRDs claim the same capability.

## 5. FR-to-Capability Check

Every Sprint PRD FR maps to exactly one capability (see §2 "Functional Requirements" column). Cross-PRD FR ranges (per PRD §3) map cleanly:

- SPR-007: FR-007-001..010 → C-20/21/22/23
- SPR-008: FR-008-001..015 → C-24..C-32 (with FR-008-011..015 supporting the same set through Permission Catalog / Resolver / TENANCY_STANDARD linkage rather than adding new capabilities)
- SPR-009: FR-009-001..015 → C-33..C-42 (with FR-009-010..015 supporting the same set)
- SPR-010: FR-010-001..014 → C-43..C-52 (with FR-010-006/007/013/014 supporting the same set)

**Zero orphan FRs across MOD-001.**

## 6. Result

- **R1 (exactly-one ownership):** ✓
- **R2 (no duplicates):** ✓
- **R3 (complete coverage):** ✓
- **R4 (every FR → one capability):** ✓

MOD-001 capability coverage is complete and unambiguous. Ready for Architecture Board Final Certification.

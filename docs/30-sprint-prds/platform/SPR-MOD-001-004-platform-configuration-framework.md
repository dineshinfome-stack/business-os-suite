---
title: "SPR-MOD-001-004 — Platform Configuration Framework (v2)"
summary: "Sprint PRD for the Platform Configuration Framework under ADR-017: configuration key registration, hierarchical effective-configuration resolver (Platform → Tenant → Workspace → Company → Branch → Financial Year), feature flags, runtime configuration, validation, inheritance, and configuration audit + events."
sprint_id: "SPR-MOD-001-004"
parent_module: "MOD-001"
iteration: "Sprint 4"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
updated: "2026-07-25"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-024"]
related_adrs: ["ADR-017", "ADR-025", "ADR-026", "ADR-014"]
supersedes: "docs/30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md"
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "configuration", "feature-flags", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-004 — Platform Configuration Framework (v2)

> Authored against **ADR-017**, **MOD001_PLATFORM_BASELINE_v2**, **MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-004**, and **TENANCY_STANDARD v2.0**. Inherited standards, invariants, and definitions are **referenced by ID and not restated**. This sprint **owns** the Effective Configuration Resolver contract.

## Inheritance Block

- **ADR-017 §Architectural Invariants (I1–I7)** — configuration values live in the Tenant DB except Platform-scoped defaults, which live in the Platform DB.
- **ADR-025 / ADR-026** — configuration and extensibility conventions.
- **TENANCY_STANDARD v2.0** — R6 (no cross-tenant queries), Tenant Persistence Boundary Convention.
- **MOD001_PLATFORM_BASELINE_v2 §7** — Effective Configuration Convention.
- Cross-cutting engine, audit, event, and permission conventions apply per baseline.

## 1. Sprint Objective and Scope

**Objective.** Deliver the Platform Configuration Framework: a registered key model, deterministic hierarchical resolution across Platform → Tenant → Workspace → Company → Branch → Financial Year, feature flags, runtime configuration, validation, and full audit and event coverage.

**In-scope surface.** Configuration key registration, scope hierarchy resolver contract (**owned here**), feature flag CRUD + evaluation, runtime overrides, admin UI to view effective values, validation rules, `config.*` domain events, configuration audit.

**Out-of-scope.** Module-owned keys (registered by owning modules), payment/billing config (SPR-005), locale/regional formatting rules (SPR-006), Workspace branding tokens (SPR-007).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-004-01 | Configuration key registration & catalog | Baseline v2 §7; ADR-026 |
| F-004-02 | Effective-configuration resolver (canonical chain) | ADR-017; Baseline v2 §7 |
| F-004-03 | Feature flag CRUD + scoped evaluation | ADR-025 |
| F-004-04 | Runtime configuration overrides with TTL | ADR-025 |
| F-004-05 | Configuration validation (type, range, enum, regex) | Baseline v2 §7 |
| F-004-06 | Effective-config inspector UI (admin) | Baseline v2 §4 |
| F-004-07 | `config.*` domain events | ADR-014; Baseline v2 §7 |
| F-004-08 | Configuration audit trail (Tenant DB + Platform DB per scope) | ADR-014 |

## 3. Functional Requirements

- **FR-004-001.** The system SHALL maintain a Configuration Key catalog with unique key, scope-set, type, default value, and validator.
- **FR-004-002.** The Effective Configuration Resolver SHALL resolve values in the canonical order **Platform Defaults → Tenant → Workspace (logical) → Company → Branch → Financial Year**, returning the nearest defined value.
- **FR-004-003.** The Resolver contract is version **1.0** and is the single owning contract for effective-configuration reads across MOD-001.
- **FR-004-004.** Feature flags SHALL evaluate at every scope in the hierarchy and expose a boolean with source-scope metadata.
- **FR-004-005.** Runtime overrides SHALL be time-boxed (TTL) and rejected without an audit reason.
- **FR-004-006.** All writes SHALL validate against the registered validator; invalid writes are rejected.
- **FR-004-007.** All writes SHALL emit `config.key.written`, `config.flag.written`, or `config.override.written` events with prior/next values.
- **FR-004-008.** All writes SHALL audit to the Tenant audit stream (Tenant/Workspace/Company/Branch/FY scopes) or the Platform audit stream (Platform scope).
- **FR-004-009.** Cross-tenant reads/writes SHALL be prohibited (TENANCY_STANDARD R6).
- **FR-004-010.** No `workspaces` table or `workspace_id` column SHALL be introduced (ADR-017 I3).

## 4. Non-Functional Requirements

- **NFR-004-001.** Resolver p95 < 5 ms in-process cache hit; < 25 ms cold read per scope. (Placeholder; Solution Design finalises.)
- **NFR-004-002.** Cache invalidation SHALL propagate within 1 s of any write in-tenant.
- **NFR-004-003.** All logs and events redact secret-typed values.

## 5. User Experience

Effective-config inspector shows the resolved value plus the scope that supplied it and the full override chain. Feature-flag panel groups flags by scope.

## 6. Technical Design (contract references only)

- **Contract: Effective Configuration Resolver v1.0** — owner SPR-004; consumers SPR-006, SPR-007 (and future modules). See Contract Ownership + Version table in the Phase B2 Cross-PRD Consistency Matrix.
- Storage split follows ADR-017: Platform Defaults in Platform DB `platform.config_*`; all other scopes in Tenant DB `tenant.config_*`. Physical schema authored at Solution Design.

## 7. Security

- Secret-typed keys SHALL be stored encrypted at rest and never returned in list responses.
- Write access gated by Permission Catalog entries `config.write`, `config.flag.write`, `config.override.write` (integration owned by SPR-003).

## 8. Acceptance Criteria

- **AC-004-001.** Resolver returns the nearest defined value across all six scopes, deterministically.
- **AC-004-002.** Feature-flag evaluation reflects the correct scope.
- **AC-004-003.** Every write appears in the correct audit stream and emits the correct `config.*` event exactly once.
- **AC-004-004.** No cross-tenant SQL is added by this sprint; no Workspace identifier is introduced anywhere.
- **AC-004-005.** Effective-config inspector displays the source scope for every rendered value.

## 9. Testing

Per `PLATFORM_TESTING_STANDARD.md`.

## 10. Dependencies

- Upstream (runtime): SPR-MOD-001-001, SPR-MOD-001-002, SPR-MOD-001-003.
- Consumed contracts: Permission Catalog Integration v1.0 (SPR-003).
- Owned contracts: Effective Configuration Resolver v1.0.
- Emitted events: `config.*`.

## 11. Exit / Definition of Done

Every FR met, every AC green, no cross-tenant SQL added, no Workspace identifier introduced, resolver contract v1.0 published for consumers.

## 12. Out-of-Scope

- Module-owned keys, licensing plan-limit evaluation (SPR-005), locale formatting rules (SPR-006), Workspace branding (SPR-007).

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §7 Effective Configuration Convention | F-004-01..02, FR-004-001..003 |
| ADR-025 Feature flags | F-004-03, FR-004-004 |
| ADR-026 Extensibility | F-004-01, FR-004-001 |
| ADR-017 §I3 | FR-004-010 |
| ADR-017 §I6/I7 | FR-004-008 |
| ADR-014 Audit | F-004-07..08, FR-004-007..008 |
| TENANCY_STANDARD R6 | FR-004-009 |

Zero-orphan FR check: 10/10 linked.

## 14. Change Log from v1

Replaces v1 sprint **`SPR-MOD-001-004-configuration-hierarchy.md`**.

| Change | Reason |
| --- | --- |
| Elevated resolver to a versioned, single-owner contract. | Contract-driven architecture (Phase B2 A13/A15). |
| Extended chain to include Workspace (logical), Branch, Financial Year scopes explicitly. | Canonical resolution order per ADR-017. |
| Prohibited any `workspaces` table introduction. | ADR-017 Invariant I3. |
| Split storage across Platform DB (defaults) and Tenant DB (all other scopes). | ADR-017 Invariants I6/I7. |

## 15. Reuse Provenance

| Section | Outcome |
| --- | --- |
| Inheritance Block | Reused unchanged (references) |
| §1..§3 | Newly authored |
| §4 NFRs | Newly authored |
| §5 UX | Newly authored |
| §6 Technical Design | Newly authored |
| §7 Security | Reused unchanged (references RBAC_STANDARD + Permission Catalog) |
| §8 AC | Newly authored |
| §9 Testing | Reused unchanged (references PLATFORM_TESTING_STANDARD) |
| §10..§11 | Newly authored |
| §12 Out-of-Scope | Newly authored |
| §13 Traceability | Newly authored |
| §14 Change Log | Newly authored |
| §15 Reuse Provenance | Newly authored |

## 16. References

- ADR-017, ADR-025, ADR-026, ADR-014
- MOD001_PLATFORM_BASELINE_v2 §7
- MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-004
- TENANCY_STANDARD v2.0
- v1 (superseded): `SPR-MOD-001-004-configuration-hierarchy.md`

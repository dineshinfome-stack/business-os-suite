---
title: "SPR-MOD-001-007 — Workspace Services & Administration (v2)"
summary: "Sprint PRD for the logical Workspace surface under ADR-017: workspace administration, preferences, notifications, branding, workspace metadata cache (derived, ephemeral only), administrative utilities, and workspace lifecycle services. Consumes SPR-002 navigation, SPR-004 config, SPR-005 entitlements, SPR-006 locale. No persistent Workspace entity is introduced."
sprint_id: "SPR-MOD-001-007"
parent_module: "MOD-001"
iteration: "Sprint 7"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
updated: "2026-07-25"
related_engines: ["ENG-005", "ENG-006", "ENG-024", "ENG-025"]
related_adrs: ["ADR-017", "ADR-025", "ADR-026", "ADR-014"]
supersedes: null
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "workspace", "logical", "branding", "notifications", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-007 — Workspace Services & Administration (v2)

> Authored against **ADR-017**, **MOD001_PLATFORM_BASELINE_v2**, **MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-007**, and **TENANCY_STANDARD v2.0**. Inherited standards are **referenced by ID and not restated**. Workspace remains **logical** per ADR-017 Invariant I3. **No persistent Workspace entity is introduced.**

## Inheritance Block

- **ADR-017 §Architectural Invariants I3** — Workspace is non-persistent; no `workspaces` table, no `workspace_id` column.
- **ADR-025 / ADR-026** — configuration and extensibility conventions (consumed).
- **TENANCY_STANDARD v2.0** — R6 (no cross-tenant queries), Workspace-is-Non-Persistent Convention.
- **MOD001_PLATFORM_BASELINE_v2 §7** — Workspace-is-Non-Persistent Convention.

## 1. Sprint Objective and Scope

**Objective.** Deliver the Workspace administration surface (branding, preferences, notifications, dashboard shell, integration registration entry-points, administrative utilities) as a **logical** surface over the Tenant DB, consuming existing contracts without introducing any Workspace-persistent identifier.

**In-scope surface.** Workspace administration UI, preferences resolution, notification channel bindings (Tenant-scoped), branding tokens (Tenant-scoped), **workspace metadata cache (derived, ephemeral only)**, admin utilities, workspace lifecycle services, `workspace.*` events.

**Out-of-scope.** Any persistence introducing a Workspace identifier; module-specific dashboards; SIEM/observability pipelines (SPR-009); Super Admin console (SPR-010).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-007-01 | Workspace administration surface (logical) | ADR-017 §I3; Baseline v2 §7 |
| F-007-02 | Workspace preferences resolved via Resolver v1.0 | SPR-004 contract |
| F-007-03 | Notification channel bindings (Tenant-scoped) | Baseline v2 §7 |
| F-007-04 | Branding tokens (Tenant-scoped) | Baseline v2 §7 |
| F-007-05 | Workspace metadata cache (derived, ephemeral) | ADR-017 §I3 |
| F-007-06 | Administrative utilities (health, cache flush, session review) | Baseline v2 §7 |
| F-007-07 | Workspace lifecycle services (bootstrap read, activation, deactivation-signal) | ADR-017 §I3 |
| F-007-08 | `workspace.*` events | ADR-014 |

## 3. Functional Requirements

- **FR-007-001.** No `workspaces` table SHALL be created; no `workspace_id` column SHALL be added anywhere.
- **FR-007-002.** All Workspace-facing data SHALL be derived from Tenant-scoped tables or the Resolver v1.0 chain (SPR-004).
- **FR-007-003.** The Workspace metadata cache SHALL be **derived and ephemeral**: repopulatable at any time from Tenant-scoped source-of-truth tables; loss of cache SHALL cause zero data loss.
- **FR-007-004.** Workspace administration actions SHALL be gated by License Enforcement v1.0 (SPR-005) for entitlement-bound capabilities.
- **FR-007-005.** Workspace preferences SHALL be resolved via Effective Configuration Resolver v1.0 (SPR-004); no independent preference resolver SHALL be introduced.
- **FR-007-006.** Workspace navigation SHALL be sourced from Workspace Navigation contract v1.0 (SPR-002).
- **FR-007-007.** Locale, timezone, currency, and formatting SHALL be resolved via SPR-006 (which itself consumes the Resolver).
- **FR-007-008.** Every administrative mutation SHALL emit a `workspace.*` event and a Tenant audit entry.
- **FR-007-009.** Cross-tenant reads/writes SHALL be prohibited (TENANCY_STANDARD R6).
- **FR-007-010.** Notification channel bindings SHALL be stored in the Tenant DB and evaluated per Tenant only.

## 4. Non-Functional Requirements

- **NFR-007-001.** Workspace shell TTI p95 < 500 ms after Tenant DB warm.
- **NFR-007-002.** Metadata cache warm ≤ 200 ms after cold miss.
- **NFR-007-003.** Cache invalidation propagates within 1 s of any upstream write.

## 5. User Experience

Workspace admin surface exposes tabs for Preferences, Branding, Notifications, Utilities. Every rendered value shows its source scope via the Resolver.

## 6. Technical Design (contract references only)

- **Consumed contracts (pinned to v1.0):** Effective Configuration Resolver (SPR-004), License Enforcement (SPR-005), Workspace Navigation (SPR-002), Permission Catalog Integration (SPR-003).
- **Owned contracts:** none.
- **Metadata cache:** in-process/edge cache keyed by `tenant_id`; never persisted as source-of-truth.

## 7. Security

- Every administrative action requires Permission Catalog entries (`workspace.branding.write`, `workspace.notification.write`, `workspace.util.exec`) via SPR-003.
- Entitlement-bound capabilities require a successful License Enforcement check.

## 8. Acceptance Criteria

- **AC-007-001.** Repository scan finds zero `workspaces` table definitions and zero `workspace_id` columns introduced by this sprint.
- **AC-007-002.** Preferences, locale, and entitlement checks all route through the correct v1.0 contracts owned by other sprints.
- **AC-007-003.** Metadata cache can be dropped and repopulated with no data loss.
- **AC-007-004.** Every admin mutation emits the correct `workspace.*` event and a Tenant audit entry.
- **AC-007-005.** No cross-tenant SQL is added.

## 9. Testing

Per `PLATFORM_TESTING_STANDARD.md`; a governance-level lint verifies FR-007-001 across the diff.

## 10. Dependencies

- Upstream (runtime): SPR-MOD-001-004, SPR-MOD-001-006.
- Consumed contracts: Effective Configuration Resolver v1.0 (SPR-004), License Enforcement v1.0 (SPR-005), Workspace Navigation v1.0 (SPR-002), Permission Catalog Integration v1.0 (SPR-003).
- Owned contracts: none.
- Emitted events: `workspace.*`.

## 11. Exit / Definition of Done

Every FR met, every AC green, no `workspaces` table introduced, no `workspace_id` column introduced, no independent config/license/nav resolver invented.

## 12. Out-of-Scope

- Any persistence introducing a Workspace identifier.
- Module-specific dashboards.
- SIEM/observability pipelines (SPR-009), Super Admin console (SPR-010).

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §7 Workspace-is-Non-Persistent Convention | F-007-01, FR-007-001..003 |
| ADR-017 §I3 | FR-007-001..003, AC-007-001 |
| SPR-004 Resolver v1.0 (consumer) | F-007-02, FR-007-005 |
| SPR-005 License Enforcement v1.0 (consumer) | F-007-04, FR-007-004 |
| SPR-002 Workspace Navigation v1.0 (consumer) | F-007-06, FR-007-006 |
| SPR-006 Localization (consumer) | FR-007-007 |
| ADR-014 Audit | F-007-08, FR-007-008 |
| TENANCY_STANDARD R6 | FR-007-009 |

Zero-orphan FR check: 10/10 linked.

## 14. Change Log from v1

No direct v1 predecessor (Workspace Services surface was not authored as a discrete sprint under Sprint Plan v1). New under Sprint Plan v2.0.

| Change | Reason |
| --- | --- |
| Introduced Workspace surface as strictly logical. | ADR-017 Invariant I3. |
| Declared metadata cache as derived and ephemeral only. | Prevents ambiguity with persistence. |
| Expressed every Workspace-facing setting as a Resolver consumer, not a redefinition. | Contract-driven architecture (A13/A15). |
| Bound entitlement-gated capabilities to License Enforcement v1.0. | A12 gate coverage. |

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
- MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-007
- TENANCY_STANDARD v2.0
- SPR-MOD-001-002 (Workspace Navigation contract), SPR-MOD-001-003 (Permission Catalog Integration), SPR-MOD-001-004 (Resolver), SPR-MOD-001-005 (License Enforcement), SPR-MOD-001-006 (Localization)

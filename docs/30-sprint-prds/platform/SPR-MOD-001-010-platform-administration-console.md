---
title: "SPR-MOD-001-010 — Platform Administration Console (v2)"
summary: "Sprint PRD for the Super Administrator console under ADR-017: administration UI, Super Administrator workspace, tenant management console, operational dashboards, platform analytics, system configuration console, platform diagnostics, and administrative reporting. Top-of-stack consumer only; owns the Platform Admin Console Surface contract v1.0 and the `platform-admin.*` event namespace. Consumes prior Platform contracts pinned at v1.0."
sprint_id: "SPR-MOD-001-010"
parent_module: "MOD-001"
iteration: "Sprint 10"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
approval_state: "Awaiting Architecture Board Final Certification"
updated: "2026-07-25"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-020", "ENG-021", "ENG-024", "ENG-027"]
related_adrs: ["ADR-017", "ADR-030", "ADR-032"]
supersedes: null
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "admin-console", "super-admin", "operations", "analytics", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-010 — Platform Administration Console (v2)

> Authored against **ADR-017**, **MOD001_PLATFORM_BASELINE_v2 §4/§7**, **MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-010**, and **TENANCY_STANDARD v2.0**. Inherited standards are **referenced by ID and not restated**. **Top of stack.** This PRD consumes every prior Platform contract at v1.0 and owns no downstream consumer within MOD-001.

## Inheritance Block

- **ADR-017** — Dedicated DB per Tenant; console never renders Tenant business data outside an audited elevation.
- **ADR-030** *(Proposed)* — Authentication Model (consumed).
- **ADR-032** — RBAC + ABAC (consumed).
- **TENANCY_STANDARD v2.0** — R6 (no cross-tenant queries); Super Admin elevation flows through SPR-003.

## 1. Sprint Objective and Scope

**Objective.** Deliver the Super Administrator console: administration UI, Super Administrator workspace, tenant management console, operational dashboards, platform analytics, system configuration console, platform diagnostics, and administrative reporting. Own the **Platform Admin Console Surface contract v1.0** and the **`platform-admin.*`** event namespace.

**In-scope surface.** Super Admin dashboard; Tenant list/detail/lifecycle actions; Licensing management surface (consumes SPR-005); Operations dashboards (consumes SPR-008); Audit & Compliance reviewer surface (consumes SPR-009); System configuration console (consumes SPR-004); Platform diagnostics; administrative reporting.

**Out-of-scope.** External vendor consoles; third-party ops tooling; business dashboards owned by MOD-002…MOD-018; new persistence contracts (this sprint is a consumer surface only).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-010-01 | Super Admin dashboard | Baseline v2 §4 (Platform Administration Console) |
| F-010-02 | Tenant management console | SPR-001 |
| F-010-03 | Licensing management console | SPR-005 |
| F-010-04 | Operational dashboards | SPR-008 |
| F-010-05 | Audit & compliance reviewer console | SPR-009 |
| F-010-06 | System configuration console | SPR-004 |
| F-010-07 | Platform analytics (Platform-only, no cross-tenant data leakage) | Baseline v2 §4 |
| F-010-08 | Platform diagnostics | Baseline v2 §4 |
| F-010-09 | Administrative reporting | ENG-021, ENG-027 |
| F-010-10 | `platform-admin.*` events (owned) | A14 |
| F-010-11 | Platform Admin Console Surface contract v1.0 (owned) | A13 |

## 3. Functional Requirements

- **FR-010-001.** SHALL render Tenant list/detail and expose Tenant lifecycle actions through **Tenant Connection Registry v1.0 (SPR-001)** and Tenant lifecycle capabilities (SPR-001).
- **FR-010-002.** SHALL render the licensing management console using **License Enforcement v1.0 (SPR-005)** and the license/subscription entities owned by SPR-005; SHALL NOT re-implement license rules.
- **FR-010-003.** SHALL render operational dashboards from the **Operational Signal / Health Telemetry v1.0 (SPR-008)** contract; SHALL NOT emit `ops.*` events.
- **FR-010-004.** SHALL render the reviewer surface from **Audit Event Ingestion v1.0 (SPR-009)** and its `audit.*` / `compliance.*` streams; SHALL NOT emit `audit.*` or `compliance.*` events.
- **FR-010-005.** SHALL render the system configuration console via **Effective Configuration Resolver v1.0 (SPR-004)** using the canonical chain **Platform → Tenant → Workspace → Company → Branch → Financial Year**; every rendered value SHALL surface its resolved scope.
- **FR-010-006.** Every console action SHALL be authorised via **Permission Catalog Integration v1.0 (SPR-003)**.
- **FR-010-007.** SHALL resolve locale, currency, timezone, and formatting via **Localization v1.0 (SPR-006)**.
- **FR-010-008.** Platform analytics SHALL operate on Platform-owned data and pre-aggregated / anonymised derivations only; SHALL NOT execute cross-tenant queries against Tenant business data (TENANCY_STANDARD R6).
- **FR-010-009.** Any elevation into a Tenant DB from the console SHALL flow through **Super Admin elevation** (SPR-003) and SHALL be audited to Platform audit; the console SHALL NEVER render Tenant business data outside such an audited elevation.
- **FR-010-010.** SHALL own the **Platform Admin Console Surface contract v1.0** as the top-of-stack contract for MOD-001; no downstream MOD-001 consumer.
- **FR-010-011.** SHALL own the `platform-admin.*` event namespace; no other PRD SHALL publish `platform-admin.*`.
- **FR-010-012.** Every console mutation SHALL emit exactly one `platform-admin.*` event and one Platform audit entry.
- **FR-010-013.** SHALL NOT create a `workspaces` table and SHALL NOT add a `workspace_id` column.
- **FR-010-014.** SHALL NOT redefine any contract owned by SPR-001…009.

## 4. Non-Functional Requirements

- **NFR-010-001.** Dashboard TTI p95 < 1.5 s at 1 000 concurrent Super Admin sessions.
- **NFR-010-002.** Tenant list load p95 < 800 ms at 10 000 Tenants.
- **NFR-010-003.** Elevation-flow round-trip p95 < 2 s and always audited.

## 5. User Experience

Single Super Admin console with tabs mapping 1:1 to consumed contracts (Tenants, Licensing, Operations, Audit & Compliance, Configuration, Analytics, Diagnostics, Reports). Every value surfaces resolved scope. Elevation-required actions are visually distinguished and require confirmation + reason.

## 6. Technical Design (contract references only)

- **Owned contracts:** Platform Admin Console Surface v1.0 (top-of-stack; no MOD-001 downstream consumer).
- **Consumed contracts (pinned to v1.0):** Tenant Connection Registry (SPR-001), Permission Catalog Integration (SPR-003), Effective Configuration Resolver (SPR-004), License Enforcement (SPR-005), Localization (SPR-006), Operational Signal / Health Telemetry (SPR-008), Audit Event Ingestion (SPR-009).
- **Owned events:** `platform-admin.*`.
- **Persistence:** console-only preference state in the **Platform DB**; no Tenant business persistence.

## 7. Security

- Every console action requires Permission Catalog entries (`platform-admin.*.read` / `.write` / `.exec`).
- Elevation into a Tenant DB requires Super Admin elevation (SPR-003) and is always audited (ADR-014 via SPR-009).
- ADR-032 RBAC + ABAC is applied at the console; console never bypasses the Permission Catalog.

## 8. Acceptance Criteria

- **AC-010-001.** Super Admin can operate the Tenant estate end-to-end without leaving the console.
- **AC-010-002.** Every console action is audited (verified via SPR-009 review surface).
- **AC-010-003.** Console never displays Tenant business data outside an audited elevation.
- **AC-010-004.** `platform-admin.*` published only by this PRD; no `ops.*`, `audit.*`, `compliance.*` emitted here.
- **AC-010-005.** Configuration console renders resolved scope for every value.
- **AC-010-006.** Analytics operates only on Platform-owned or anonymised data; no cross-tenant query is executed.
- **AC-010-007.** Repository scan finds zero new `workspaces` table definitions and zero new `workspace_id` columns.
- **AC-010-008.** No consumed contract is redefined; all consumers pin their contract version at v1.0.

## 9. Testing

Per `PLATFORM_TESTING_STANDARD.md`. Governance-level lint verifies FR-010-013 across the diff, single-publisher rule for `platform-admin.*`, and no re-emission of `ops.*` / `audit.*` / `compliance.*`.

## 10. Dependencies

- Upstream (runtime): SPR-MOD-001-001, SPR-MOD-001-003, SPR-MOD-001-004, SPR-MOD-001-005, SPR-MOD-001-006, SPR-MOD-001-008, SPR-MOD-001-009.
- Consumed contracts: Tenant Connection Registry v1.0 (SPR-001), Permission Catalog Integration v1.0 (SPR-003), Effective Configuration Resolver v1.0 (SPR-004), License Enforcement v1.0 (SPR-005), Localization v1.0 (SPR-006), Operational Signal / Health Telemetry v1.0 (SPR-008), Audit Event Ingestion v1.0 (SPR-009).
- Owned contracts: Platform Admin Console Surface v1.0 (top-of-stack).
- Emitted events: `platform-admin.*`.

## 11. Exit / Definition of Done

Every FR met, every AC green, `platform-admin.*` publisher singleton, no redefinition of any consumed contract, console never renders Tenant business data outside audited elevation.

## 12. Out-of-Scope

- External vendor consoles; third-party ops tooling.
- Business dashboards owned by MOD-002…MOD-018.
- New persistence contracts.

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §4 Platform Administration Console | F-010-01..09, FR-010-001..008 |
| ADR-030 Authentication Model | FR-010-006, FR-010-009 |
| ADR-032 RBAC + ABAC | FR-010-006 |
| ADR-017 §Architectural Invariants | FR-010-008, FR-010-009, FR-010-013 |
| Contract Ownership (A13) | FR-010-010, F-010-11 |
| Event Ownership (A14) | FR-010-011, F-010-10 |
| Contract Version Compatibility (A15) | FR-010-001..005, FR-010-007 |

Zero-orphan FR check: 14/14 linked.

## 14. Change Log from v1

No v1 predecessor exists for `SPR-MOD-001-010` (Sprint Plan v1 used a different sprint id assignment). New under Sprint Plan v2.0.

| Change | Reason |
| --- | --- |
| Introduced Platform Administration Console as top-of-stack surface. | Baseline v2 §4 explicitly separates console from operations and audit. |
| Declared Platform Admin Console Surface contract v1.0. | A13 single-owner rule. |
| Bound `platform-admin.*` to this publisher exclusively. | A14 single-publisher rule. |
| Enforced audited elevation before any Tenant business data render. | ADR-017 Tenant Persistence Boundary Convention + Super Admin elevation. |

## 15. Reuse Provenance

| Section | Outcome |
| --- | --- |
| Inheritance Block | Reused unchanged (references) |
| §1..§3 | Newly authored |
| §4 NFRs | Newly authored |
| §5 UX | Newly authored |
| §6 Technical Design | Newly authored |
| §7 Security | Reused unchanged (references RBAC_STANDARD + Permission Catalog + ADR-032) |
| §8 AC | Newly authored |
| §9 Testing | Reused unchanged (references PLATFORM_TESTING_STANDARD) |
| §10..§11 | Newly authored |
| §12 Out-of-Scope | Newly authored |
| §13 Traceability | Newly authored |
| §14 Change Log | Newly authored |
| §15 Reuse Provenance | Newly authored |

## 16. References

- ADR-017, ADR-030 *(Proposed)*, ADR-032
- MOD001_PLATFORM_BASELINE_v2 §4/§7
- MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-010
- TENANCY_STANDARD v2.0
- SPR-MOD-001-001, SPR-MOD-001-003, SPR-MOD-001-004, SPR-MOD-001-005, SPR-MOD-001-006, SPR-MOD-001-008, SPR-MOD-001-009

---
title: "SPR-MOD-001-008 — Platform Operations (v2)"
summary: "Sprint PRD for the Platform Operations surface under ADR-017: monitoring, health management, service lifecycle, scheduler & background jobs, queue management, maintenance mode, backup and disaster-recovery coordination, and operational notifications. Owns the Operational Signal / Health Telemetry contract v1.0 and the `ops.*` event namespace. Consumes prior Platform contracts pinned at v1.0; introduces no persistent Workspace identifier."
sprint_id: "SPR-MOD-001-008"
parent_module: "MOD-001"
iteration: "Sprint 8"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
approval_state: "Awaiting Architecture Board Final Certification"
updated: "2026-07-25"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-024", "ENG-025"]
related_adrs: ["ADR-017", "ADR-011", "ADR-014", "ADR-065", "ADR-051"]
supersedes: null
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "operations", "monitoring", "backup", "dr", "scheduler", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-008 — Platform Operations (v2)

> Authored against **ADR-017**, **MOD001_PLATFORM_BASELINE_v2 §4/§7**, **MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-008**, and **TENANCY_STANDARD v2.0**. Inherited standards are **referenced by ID and not restated**. No `workspaces` table and no `workspace_id` column are introduced.

## Inheritance Block

- **ADR-017** — Dedicated Database per Tenant; per-Tenant DB is the operational unit for provisioning, upgrade, backup, restore, retire.
- **ADR-011** — Multi-Tenant Isolation (Platform DB scope).
- **ADR-014** — Audit Strategy (every operator action audited to Platform audit).
- **ADR-065** *(Proposed)* — Disaster Recovery topology (referenced only; coordination surface, not topology).
- **ADR-051** *(Proposed)* — Transactional Outbox (event emission).
- **TENANCY_STANDARD v2.0** — R6 (no cross-tenant queries); Tenant Persistence Boundary Convention.
- **PLATFORM_OBSERVABILITY_STANDARD** — telemetry, logs, and metrics conventions (consumed).

## 1. Sprint Objective and Scope

**Objective.** Deliver Platform-level operations for the dedicated-DB-per-Tenant estate: monitoring, health, service lifecycle, scheduler and background jobs, queue management, maintenance windows, backup / restore coordination, disaster-recovery coordination, and operator notifications. Own the **Operational Signal / Health Telemetry contract v1.0** and the **`ops.*`** event namespace.

**In-scope surface.** Health probes and health surface; service registry and lifecycle actions (start, drain, stop); scheduler + background job registry; queue depth and DLQ management; maintenance-mode declaration + broadcast; backup schedule registry + restore coordination; DR drill coordination; operator notifications; `ops.*` events.

**Out-of-scope.** Vendor / cloud region / DB engine choice; specific replication topology; SIEM export (deferred); business-facing dashboards; audit review surface (SPR-009); Super Admin console UI (SPR-010).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-008-01 | Platform monitoring + health surface | Baseline v2 §4 (Platform Operations), ADR-017 |
| F-008-02 | Service lifecycle (start / drain / stop) | Baseline v2 §4 |
| F-008-03 | Scheduler + background jobs registry | Baseline v2 §4 |
| F-008-04 | Queue management (depth, retry, DLQ) | Baseline v2 §4, ADR-051 |
| F-008-05 | Maintenance-mode declaration + broadcast | Baseline v2 §4 |
| F-008-06 | Backup schedule registry + restore coordination | Baseline v2 §4, ADR-017 |
| F-008-07 | Disaster-recovery coordination | Baseline v2 §4, ADR-065 |
| F-008-08 | Operator notifications (Tenant-scoped and Platform-scoped) | Baseline v2 §4, ENG-025 |
| F-008-09 | `ops.*` events (owned) | ADR-014, ADR-051 |
| F-008-10 | Operational Signal / Health Telemetry contract v1.0 (owned) | A13 |

## 3. Functional Requirements

- **FR-008-001.** SHALL expose a Platform-level health surface listing every Tenant DB with version, last backup timestamp, health state, and last operator action.
- **FR-008-002.** SHALL expose service lifecycle actions (`start`, `drain`, `stop`) at Platform-service granularity; every action SHALL be audited.
- **FR-008-003.** SHALL provide a scheduler + background-jobs registry with idempotent job identifiers and per-job outcome history.
- **FR-008-004.** SHALL provide queue observability (depth, oldest message age, retry counters, DLQ inspection) without exposing message payloads across Tenant boundaries.
- **FR-008-005.** SHALL support maintenance-mode declaration at Platform or per-Tenant scope; consumers SHALL receive `ops.maintenance.*` events.
- **FR-008-006.** SHALL maintain a backup schedule registry per Tenant DB and coordinate restore workflows; restore SHALL never target a different Tenant.
- **FR-008-007.** SHALL coordinate disaster-recovery drills (initiate, checkpoint, complete) without prescribing replication topology (deferred to ADR-065).
- **FR-008-008.** SHALL deliver operator notifications through **ENG-025**; localisation SHALL resolve via **Localization v1.0 (SPR-006)**; recipients resolved via **Permission Catalog Integration v1.0 (SPR-003)**.
- **FR-008-009.** SHALL own the **Operational Signal / Health Telemetry contract v1.0** and publish it as the sole platform-operational telemetry contract. Consumers SHALL pin to v1.0.
- **FR-008-010.** SHALL own the `ops.*` event namespace; no other PRD SHALL publish `ops.*`.
- **FR-008-011.** SHALL resolve every operator RBAC decision through **Permission Catalog Integration v1.0 (SPR-003)**; SHALL NOT introduce a parallel permission model.
- **FR-008-012.** SHALL resolve every operator-facing configuration value through **Effective Configuration Resolver v1.0 (SPR-004)** using the canonical chain **Platform → Tenant → Workspace → Company → Branch → Financial Year**.
- **FR-008-013.** SHALL NOT create a `workspaces` table and SHALL NOT add a `workspace_id` column.
- **FR-008-014.** SHALL NOT execute cross-tenant reads or writes (TENANCY_STANDARD R6).
- **FR-008-015.** Every operator mutation SHALL emit exactly one `ops.*` event and one Platform audit entry.

## 4. Non-Functional Requirements

- **NFR-008-001.** Health surface refresh p95 < 2 s across up to 10 000 Tenant DBs.
- **NFR-008-002.** Maintenance-mode broadcast delivered to subscribed consumers within 5 s p95.
- **NFR-008-003.** Backup registry read p95 < 200 ms.
- **NFR-008-004.** Job scheduler drift < 30 s per hour.

## 5. User Experience

Operator-facing surface is minimal and API-first; a lightweight Ops view aggregates health, jobs, queues, backups, and maintenance state. Rich Super Admin visualisation is deferred to SPR-010.

## 6. Technical Design (contract references only)

- **Owned contracts:** Operational Signal / Health Telemetry v1.0.
- **Consumed contracts (pinned to v1.0):** Effective Configuration Resolver (SPR-004), Permission Catalog Integration (SPR-003), Tenant Connection Registry (SPR-001), Localization (SPR-006).
- **Owned events:** `ops.*`.
- **Persistence:** operator metadata (schedules, maintenance declarations, DR checkpoints, backup catalogue) lives in the **Platform DB**; Tenant business data is never mirrored to the Platform DB except as anonymised or pre-aggregated derivations authorised by the Tenant Persistence Boundary Convention.

## 7. Security

- Every operator action requires a Permission Catalog entry (`ops.service.write`, `ops.maintenance.write`, `ops.backup.exec`, `ops.dr.exec`, `ops.queue.read`, `ops.job.exec`) via SPR-003.
- Every operator action is audited to Platform audit (ADR-014); audit records are consumed by SPR-009.

## 8. Acceptance Criteria

- **AC-008-001.** Health surface enumerates every Tenant DB with version, last backup, health state.
- **AC-008-002.** Scheduler executes registered jobs idempotently under retry.
- **AC-008-003.** Queue depth, retries, and DLQ counts are visible without leaking payloads across Tenants.
- **AC-008-004.** Maintenance-mode declaration produces `ops.maintenance.declared` and reversal produces `ops.maintenance.cleared`.
- **AC-008-005.** Backup and restore actions are audited to Platform audit and never cross Tenant boundaries.
- **AC-008-006.** DR drill produces `ops.dr.initiated`, `ops.dr.checkpoint`, `ops.dr.completed`.
- **AC-008-007.** Every `ops.*` event has exactly one publisher (this PRD) with a well-defined payload owned by this PRD.
- **AC-008-008.** Repository scan finds zero new `workspaces` table definitions and zero new `workspace_id` columns.

## 9. Testing

Per `PLATFORM_TESTING_STANDARD.md`. Governance-level lint verifies FR-008-013 and FR-008-014 across the diff.

## 10. Dependencies

- Upstream (runtime): SPR-MOD-001-001, SPR-MOD-001-003, SPR-MOD-001-004, SPR-MOD-001-006.
- Consumed contracts: Tenant Connection Registry v1.0 (SPR-001), Permission Catalog Integration v1.0 (SPR-003), Effective Configuration Resolver v1.0 (SPR-004), Localization v1.0 (SPR-006).
- Owned contracts: Operational Signal / Health Telemetry v1.0.
- Emitted events: `ops.*`.

## 11. Exit / Definition of Done

Every FR met, every AC green, `ops.*` publisher singleton, Operational Signal / Health Telemetry contract v1.0 published and consumed only by SPR-009 and SPR-010 pinned at v1.0.

## 12. Out-of-Scope

- Vendor / region / engine choices, replication topology, SIEM export.
- Audit review surface (SPR-009), Super Admin console UI (SPR-010).
- Business dashboards.

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §4 Platform Operations | F-008-01..08, FR-008-001..008 |
| ADR-017 §Architectural Invariants | FR-008-013, FR-008-014 |
| ADR-014 Audit Strategy | FR-008-015, F-008-09 |
| ADR-051 Transactional Outbox | FR-008-004, FR-008-015 |
| ADR-065 Disaster Recovery | FR-008-007 |
| Contract Ownership (A13) | FR-008-009, F-008-10 |
| Event Ownership (A14) | FR-008-010, F-008-09 |
| Contract Version Compatibility (A15) | FR-008-012 |

Zero-orphan FR check: 15/15 linked.

## 14. Change Log from v1

No v1 predecessor exists for `SPR-MOD-001-008` (Sprint Plan v1 used a different sprint id assignment). New under Sprint Plan v2.0.

| Change | Reason |
| --- | --- |
| Introduced Platform Operations as a discrete Sprint PRD. | ADR-017 changes the operational unit to a per-Tenant DB. |
| Declared Operational Signal / Health Telemetry contract v1.0 as owned by this PRD. | A13 single-owner rule. |
| Bound `ops.*` events to this publisher exclusively. | A14 single-publisher rule. |
| Deferred vendor / replication topology to ADR-065. | Keeps sprint focus on coordination surface. |

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

- ADR-017, ADR-011, ADR-014, ADR-051 *(Proposed)*, ADR-065 *(Proposed)*
- MOD001_PLATFORM_BASELINE_v2 §4/§7
- MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-008
- TENANCY_STANDARD v2.0
- SPR-MOD-001-001 (Connection Registry), SPR-MOD-001-003 (Permission Catalog Integration), SPR-MOD-001-004 (Resolver), SPR-MOD-001-006 (Localization)

---
title: "SPR-MOD-001-009 — Audit, Compliance & Governance (v2)"
summary: "Sprint PRD for the Platform Audit, Compliance & Governance surface under ADR-017: platform audit ingestion, review surface across owned Tenants, retention policies, audit-integrity guarantees, data-classification tagging, security audit, administrative activity logging, and compliance reporting/exports. Owns the Audit Event Ingestion contract v1.0 and the `audit.*` and `compliance.*` event namespaces. Consumes prior Platform contracts pinned at v1.0."
sprint_id: "SPR-MOD-001-009"
parent_module: "MOD-001"
iteration: "Sprint 9"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
approval_state: "Awaiting Architecture Board Final Certification"
updated: "2026-07-25"
related_engines: ["ENG-004", "ENG-020", "ENG-021", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-017", "ADR-014", "ADR-035", "ADR-036"]
supersedes: null
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "audit", "compliance", "governance", "retention", "integrity", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-009 — Audit, Compliance & Governance (v2)

> Authored against **ADR-017**, **MOD001_PLATFORM_BASELINE_v2 §4/§7**, **MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-009**, and **TENANCY_STANDARD v2.0**. Inherited standards are **referenced by ID and not restated**. Extends the Audit Ownership Convention: Platform owns Platform audit **and** the review surface over Tenant audit; business modules MUST NOT implement independent audit review mechanisms.

## Inheritance Block

- **ADR-017** — Dedicated DB per Tenant; Tenant audit lives in each Tenant DB, Platform audit in the Platform DB.
- **ADR-014** — Audit Strategy (consumed).
- **ADR-035** *(Proposed)* — Data Classification tags.
- **ADR-036** *(Proposed)* — Audit Integrity.
- **TENANCY_STANDARD v2.0** — R6 (no cross-tenant queries); Audit Ownership Convention (extended).
- **PLATFORM_OBSERVABILITY_STANDARD** — telemetry conventions (consumed).

## 1. Sprint Objective and Scope

**Objective.** Deliver Platform Audit ingestion, the Platform-owned review surface over Tenant audit for owned Tenants, retention configuration, integrity guarantees (per ADR-036), data-classification tagging (per ADR-035), security audit, administrative activity logging, and compliance reporting / exports. Own the **Audit Event Ingestion contract v1.0**, the **`audit.*`** namespace, and the **`compliance.*`** namespace.

**In-scope surface.** Platform audit ingestion; Tenant audit review surface for owned Tenants (search, filter, timeline, cross-link, export); retention policies; audit integrity (append-only, hash-chain); data-classification tagging; compliance control evaluation and reporting; security audit (auth, privileged actions); administrative activity logging.

**Out-of-scope.** SIEM export (deferred); cross-tenant audit aggregation for tenants not owned by the caller; audit collection primitives (owned by ENG-004); business dashboards; Super Admin console UI (SPR-010).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-009-01 | Platform audit ingestion | Baseline v2 §4/§7, ADR-014 |
| F-009-02 | Tenant audit review surface for owned Tenants | Baseline v2 §7 (Audit Ownership extension) |
| F-009-03 | Retention policies (per audit stream, per Tenant, per classification) | ADR-014 |
| F-009-04 | Audit integrity (append-only, hash-chain) | ADR-036 |
| F-009-05 | Data classification tagging | ADR-035 |
| F-009-06 | Compliance controls + evaluation | Baseline v2 §4 |
| F-009-07 | Security audit (auth, privileged actions) | ADR-014 |
| F-009-08 | Administrative activity logging | Baseline v2 §4 |
| F-009-09 | Compliance reporting + evidence exports | ENG-027 |
| F-009-10 | `audit.*` and `compliance.*` events (owned) | ADR-014, A14 |
| F-009-11 | Audit Event Ingestion contract v1.0 (owned) | A13 |

## 3. Functional Requirements

- **FR-009-001.** SHALL provide a Platform audit ingestion channel; every SPR-001…008 operator action SHALL be persisted to Platform audit.
- **FR-009-002.** SHALL provide a Tenant audit review surface scoped to Tenants the caller owns; scope enforcement SHALL use Permission Catalog Integration v1.0 (SPR-003).
- **FR-009-003.** Retention SHALL be configured per audit stream, per Tenant, and per data classification; changes SHALL be audited.
- **FR-009-004.** Audit records SHALL be append-only; the review surface SHALL expose an integrity check consistent with ADR-036.
- **FR-009-005.** Every audit record SHALL carry a data-classification tag per ADR-035.
- **FR-009-006.** Compliance controls SHALL be evaluated on a schedule and on demand; failures SHALL emit `compliance.control.failed`.
- **FR-009-007.** Compliance reports and evidence exports SHALL be produced through **ENG-027**; every export SHALL be recorded to Platform audit.
- **FR-009-008.** SHALL own the **Audit Event Ingestion contract v1.0**; every publisher across MOD-001 SHALL emit via this contract.
- **FR-009-009.** SHALL own the `audit.*` and `compliance.*` event namespaces; no other PRD SHALL publish these namespaces.
- **FR-009-010.** SHALL consume the **Operational Signal / Health Telemetry v1.0 (SPR-008)** to correlate audit with operational state.
- **FR-009-011.** SHALL resolve every reviewer RBAC decision through **Permission Catalog Integration v1.0 (SPR-003)**.
- **FR-009-012.** SHALL resolve every reviewer-facing configuration value through **Effective Configuration Resolver v1.0 (SPR-004)** using the canonical chain **Platform → Tenant → Workspace → Company → Branch → Financial Year**.
- **FR-009-013.** SHALL NOT create a `workspaces` table and SHALL NOT add a `workspace_id` column.
- **FR-009-014.** SHALL NOT perform cross-tenant reads or writes (TENANCY_STANDARD R6).
- **FR-009-015.** SHALL NOT re-implement audit collection primitives owned by ENG-004.

## 4. Non-Functional Requirements

- **NFR-009-001.** Review surface search p95 < 1.5 s over 90-day window per Tenant.
- **NFR-009-002.** Ingestion sustained throughput ≥ 5 000 records/s per Platform region.
- **NFR-009-003.** Integrity check completes in O(log n) per record given hash-chain state.
- **NFR-009-004.** Compliance evaluation batch completes within its declared window (target < 5 min p95).

## 5. User Experience

Reviewer surface (Platform Admin scope): search, filter, timeline, cross-link, export. Rich Super Admin visualisation deferred to SPR-010.

## 6. Technical Design (contract references only)

- **Owned contracts:** Audit Event Ingestion v1.0.
- **Consumed contracts (pinned to v1.0):** Permission Catalog Integration (SPR-003), Effective Configuration Resolver (SPR-004), Localization (SPR-006), Operational Signal / Health Telemetry (SPR-008), Tenant Connection Registry (SPR-001).
- **Owned events:** `audit.*`, `compliance.*`.
- **Persistence:** Platform audit in **Platform DB**; Tenant audit remains in each **Tenant DB** and is accessed only through the review surface, per-Tenant.

## 7. Security

- Every reviewer action requires Permission Catalog entries (`audit.read`, `audit.export`, `audit.retention.write`, `compliance.report.read`, `compliance.control.exec`).
- Every reviewer export is itself audited (meta-audit).
- Cross-Tenant reads are prohibited by TENANCY_STANDARD R6; the review surface enforces owned-Tenant scope only.

## 8. Acceptance Criteria

- **AC-009-001.** Every SPR-001…008 operator mutation appears in Platform audit with correct classification.
- **AC-009-002.** Reviewer surface returns Tenant audit only for owned Tenants; unauthorised access is denied and audited.
- **AC-009-003.** Retention changes are audited and effective immediately for subsequent writes.
- **AC-009-004.** Integrity check detects any tampering with the hash chain.
- **AC-009-005.** Compliance controls emit `compliance.control.evaluated` and `compliance.control.failed` correctly.
- **AC-009-006.** Compliance reports are produced through ENG-027 and recorded to Platform audit.
- **AC-009-007.** `audit.*` and `compliance.*` are published only by this PRD.
- **AC-009-008.** Repository scan finds zero new `workspaces` table definitions and zero new `workspace_id` columns.

## 9. Testing

Per `PLATFORM_TESTING_STANDARD.md`. Governance-level lint verifies FR-009-013 / FR-009-014 across the diff and single-publisher rule for `audit.*` and `compliance.*`.

## 10. Dependencies

- Upstream (runtime): SPR-MOD-001-001, SPR-MOD-001-003, SPR-MOD-001-004, SPR-MOD-001-006, SPR-MOD-001-008.
- Consumed contracts: Tenant Connection Registry v1.0 (SPR-001), Permission Catalog Integration v1.0 (SPR-003), Effective Configuration Resolver v1.0 (SPR-004), Localization v1.0 (SPR-006), Operational Signal / Health Telemetry v1.0 (SPR-008).
- Owned contracts: Audit Event Ingestion v1.0.
- Emitted events: `audit.*`, `compliance.*`.

## 11. Exit / Definition of Done

Every FR met, every AC green, Audit Event Ingestion v1.0 published, `audit.*` / `compliance.*` publisher singleton, review surface enforces owned-Tenant scope.

## 12. Out-of-Scope

- SIEM export; cross-tenant aggregation for tenants not owned by the caller.
- Audit collection primitives (ENG-004).
- Business dashboards; Super Admin console UI (SPR-010).

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §4/§7 Audit & Compliance | F-009-01..09, FR-009-001..007 |
| ADR-014 Audit Strategy | F-009-01, F-009-04, F-009-07, FR-009-001, FR-009-004 |
| ADR-035 Data Classification | F-009-05, FR-009-005 |
| ADR-036 Audit Integrity | F-009-04, FR-009-004 |
| ADR-017 §Architectural Invariants | FR-009-013, FR-009-014 |
| Contract Ownership (A13) | FR-009-008, F-009-11 |
| Event Ownership (A14) | FR-009-009, F-009-10 |
| Contract Version Compatibility (A15) | FR-009-010, FR-009-012 |

Zero-orphan FR check: 15/15 linked.

## 14. Change Log from v1

No v1 predecessor exists for `SPR-MOD-001-009` (v1 packaged audit review into `SPR-MOD-001-006-audit-review-platform-administration.md`, now superseded by the Sprint Plan v2 renumbering). New under Sprint Plan v2.0.

| Change | Reason |
| --- | --- |
| Split audit review from Platform admin surface. | Sprint Plan v2 assigns admin surface to SPR-010. |
| Added compliance controls, evaluation, and reporting. | Baseline v2 §4 explicitly names compliance under this sprint. |
| Declared Audit Event Ingestion contract v1.0. | Single-owner contract rule (A13). |
| Bound `audit.*` and `compliance.*` to this publisher exclusively. | A14 single-publisher rule. |

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

- ADR-017, ADR-014, ADR-035 *(Proposed)*, ADR-036 *(Proposed)*
- MOD001_PLATFORM_BASELINE_v2 §4/§7
- MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-009
- TENANCY_STANDARD v2.0
- SPR-MOD-001-001 (Connection Registry), SPR-MOD-001-003 (Permission Catalog Integration), SPR-MOD-001-004 (Resolver), SPR-MOD-001-006 (Localization), SPR-MOD-001-008 (Operational Signal / Health Telemetry)

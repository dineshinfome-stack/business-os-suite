---
title: "SPR-MOD-001-001 — Platform & Tenant Provisioning (v2)"
summary: "Sprint PRD for end-to-end Tenant provisioning under ADR-017: Platform DB tenant record, dedicated Tenant DB creation, schema bootstrap, connection registry, logical Workspace bootstrap, default Company + Financial Year seed inside Tenant DB, and initial Tenant Admin invitation."
sprint_id: "SPR-MOD-001-001"
parent_module: "MOD-001"
iteration: "Sprint 1"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
updated: "2026-07-25"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-024"]
related_adrs: ["ADR-017", "ADR-011", "ADR-014", "ADR-030", "ADR-032"]
supersedes: "docs/30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md"
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "provisioning", "tenant", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-001 — Platform & Tenant Provisioning (v2)

> Authored against **ADR-017** (Dedicated Database per Tenant Architecture), **MOD001_PLATFORM_BASELINE_v2**, **MOD-001_SPRINT_PLAN_v2**, and **TENANCY_STANDARD v2.0**. Inherited standards, invariants, and definitions are **referenced by ID and not restated**.

## Inheritance Block

- **ADR-017 §Architectural Invariants (I1–I7)** — every business record lives in the Tenant DB; Platform DB stores platform metadata only; Workspace is non-persistent.
- **TENANCY_STANDARD v2.0** — Tenant persistence boundary, License Attachment Convention, Workspace-is-Non-Persistent Convention.
- **MOD001_PLATFORM_BASELINE_v2 §7** — Governance Conventions preserved and extended.
- Cross-cutting engine, audit, event, and permission conventions apply per baseline.

## 1. Sprint Objective and Scope

**Objective.** Deliver end-to-end Tenant provisioning under ADR-017: create a Tenant record in the Platform DB, provision a dedicated Tenant DB, bootstrap its schema, register connection routing, bootstrap the logical Workspace, seed a default Company and Financial Year inside the Tenant DB, and issue the initial Tenant Admin invitation.

**In-scope surface.** Platform DB tenant registry, provisioning orchestration workflow, dedicated-DB provisioning contract, schema bootstrap sequence, connection registry writes, logical Workspace bootstrap, default Company + default Financial Year seed inside the newly minted Tenant DB, Tenant Admin invitation, provisioning audit + events, failure recovery & idempotent retry, decommissioning **prerequisites** (planning artifacts only, not decommissioning execution).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-001-01 | Tenant registration intake (Platform DB) | MODULE_PRD §Tenant Lifecycle; Baseline v2 §4 (Tenant provisioning) |
| F-001-02 | Tenant lifecycle state machine (Draft → Provisioning → Active → Suspended → Deactivated) | Baseline v2 §2 |
| F-001-03 | Dedicated Tenant DB provisioning contract | ADR-017 §Platform vs Tenant DB Responsibilities |
| F-001-04 | Schema + migration bootstrap inside new Tenant DB | Baseline v2 §4 (DB provisioning) |
| F-001-05 | Connection routing registry write & health verification | ADR-017 §Authentication Flow |
| F-001-06 | Logical Workspace bootstrap (no `workspaces` table) | ADR-017 §Invariant I3; Baseline v2 §7 |
| F-001-07 | Default Company seed inside Tenant DB | Baseline v2 §4 (Company/Branch/Financial Year) |
| F-001-08 | Default Financial Year seed inside Tenant DB | Baseline v2 §4 |
| F-001-09 | Initial Tenant Admin user + invitation | Baseline v2 §4 (Identity) |
| F-001-10 | Provisioning orchestration with idempotent retry & compensating rollback | ADR-017; ADR-014 |
| F-001-11 | Provisioning audit trail (Platform audit) & domain events | ADR-014; Baseline v2 §7 |
| F-001-12 | Decommissioning prerequisites (planning artifacts only) | Baseline v2 §2 |

## 3. Functional Requirements

- **FR-001-001.** The system SHALL create a Tenant record in the Platform DB with a globally unique slug and display name.
- **FR-001-002.** The system SHALL enforce the Tenant lifecycle state machine (Draft → Provisioning → Active → Suspended → Deactivated). Invalid transitions SHALL be rejected.
- **FR-001-003.** The system SHALL provision exactly one dedicated Tenant database per Tenant record (ADR-017 Invariant I1).
- **FR-001-004.** The provisioning workflow SHALL be idempotent: re-invocation with the same provisioning correlation ID SHALL never create a second Tenant DB.
- **FR-001-005.** The provisioning workflow SHALL execute the schema bootstrap migration set inside the newly provisioned Tenant DB before Tenant activation.
- **FR-001-006.** The system SHALL write the Tenant → Database routing entry into the connection registry only after schema bootstrap succeeds.
- **FR-001-007.** The system SHALL verify Tenant DB reachability via the registry entry before marking the Tenant `Active`.
- **FR-001-008.** The system SHALL bootstrap the logical Workspace for the Tenant without persisting any Workspace identifier or row (ADR-017 Invariant I3).
- **FR-001-009.** The system SHALL seed exactly one default Company inside the newly provisioned Tenant DB.
- **FR-001-010.** The system SHALL seed exactly one default Financial Year inside the newly provisioned Tenant DB, scoped to the default Company.
- **FR-001-011.** The system SHALL create an initial Tenant Admin identity in the Platform DB linked to the Tenant, and dispatch an invitation to the operator-supplied email.
- **FR-001-012.** On any provisioning step failure, the system SHALL execute a compensating rollback and leave the Tenant in a terminal `Provisioning-Failed` state with retry allowed.
- **FR-001-013.** The system SHALL emit a domain event for each provisioning milestone: `tenant.registered`, `tenant.db.provisioned`, `tenant.schema.bootstrapped`, `tenant.routing.registered`, `tenant.workspace.bootstrapped`, `tenant.seed.completed`, `tenant.admin.invited`, `tenant.activated`, `tenant.provisioning.failed`.
- **FR-001-014.** The system SHALL write a Platform audit record for every state transition and every provisioning step outcome.
- **FR-001-015.** The system SHALL never write Tenant business data into the Platform DB (ADR-017 Invariant I6, I7).
- **FR-001-016.** The system SHALL cite Baseline v2 §7 Tenant Persistence Boundary Convention: no cross-tenant SQL join is permitted; provisioning code SHALL NOT open two Tenant DB connections in the same transaction.
- **FR-001-017.** The system SHALL provide a documented decommissioning-prerequisites checklist (planning artifact only); execution of decommission is out of scope for this sprint.

## 4. Non-Functional Requirements

- **NFR-001-001.** Provisioning of a new Tenant SHALL complete within an operator-visible time budget defined by the Performance Budgets Standard (targets recorded in the Solution Design phase; sprint enforces the budget once published).
- **NFR-001-002.** Provisioning SHALL be resumable: a crashed orchestration SHALL be safely resumed by re-invocation with the same correlation ID.
- **NFR-001-003.** All provisioning steps SHALL be observable via structured logs and metrics per PLATFORM_OBSERVABILITY_STANDARD.
- **NFR-001-004.** Platform DB writes for tenant registry SHALL be transactional; Tenant DB creation SHALL occur outside the Platform DB transaction, coordinated by the orchestrator.
- **NFR-001-005.** Provisioning audit entries SHALL be immutable per ADR-014 and the Audit Ownership Convention.

## 5. UX

- Platform Admin surface exposes a **New Tenant** action, a Tenant list with lifecycle state, and per-Tenant detail with a provisioning timeline.
- Failure states surface a human-readable reason and a **Retry provisioning** action.
- The Tenant Admin receives an invitation email leading to sign-in; on first sign-in they are routed to the Tenant's logical Workspace shell.
- Detailed screens defer to the Solution Design phase; this PRD does not prescribe layouts.

## 6. Technical Design Considerations (Guidance, Not Prescription)

- Orchestration boundary is a saga-style workflow with per-step compensating actions. Concrete engine choice is a Solution Design decision.
- Connection registry is authoritative and read on every request (see MOD-001-003 for the request-time flow); this sprint writes to it.
- Schema bootstrap is a versioned migration set; version pinning is a MOD-001-008 concern (Platform Operations); this sprint applies the current pinned version.
- All DB provisioning primitives are abstracted behind a `TenantDatabaseProvisioner` contract; vendor / topology are ADR-deferred (Baseline v2 §9).

## 7. Security

- Tenant registration and provisioning actions require the Platform `super_admin` role.
- Compromise of one Tenant DB credential SHALL NOT grant access to another Tenant DB (ADR-017 Invariant I7).
- Tenant Admin invitation tokens follow the existing secure invitation token standard.
- Platform audit for provisioning is subject to ADR-014; no PII beyond Tenant Admin invitation address is written.

## 8. Acceptance Criteria

- **AC-001-001.** Given a valid tenant intake, When the operator submits it, Then a Tenant row exists in Platform DB with state `Draft` and a `tenant.registered` event is emitted.
- **AC-001-002.** When provisioning is triggered, Then the state transitions through `Provisioning` → `Active` and all nine milestone events (FR-001-013) are emitted exactly once.
- **AC-001-003.** Given a mid-flow failure at any step, When provisioning is retried with the same correlation ID, Then no duplicate Tenant DB is created and the workflow resumes from the failed step.
- **AC-001-004.** Given an activated Tenant, When Platform Admin inspects the Tenant, Then the Tenant DB is reachable through the registry entry and a health probe succeeds.
- **AC-001-005.** Given an activated Tenant, When a query inspects that Tenant DB, Then exactly one default Company and exactly one default Financial Year exist and no rows exist referencing a Workspace identifier.
- **AC-001-006.** When the initial Tenant Admin accepts the invitation, Then the user is signed in and routed to the Tenant's logical Workspace shell.
- **AC-001-007.** Given a permanently failed provisioning, When Platform Admin views the Tenant, Then a `Provisioning-Failed` state, a human-readable failure reason, a compensating-rollback confirmation, and a Retry action are visible.
- **AC-001-008.** No Platform audit record for this sprint references Tenant business rows, and no cross-tenant join is emitted anywhere in provisioning code (verified by test).

## 9. Testing Strategy

Follows PLATFORM_TESTING_STANDARD and ADR-063.

- **Unit** — state-machine transitions, invitation token issuance, event serialization.
- **Contract** — `TenantDatabaseProvisioner`, connection registry writer, audit writer.
- **Integration** — end-to-end provisioning against ephemeral Platform + Tenant DB pair; retry idempotency; compensating rollback; failure resumption.
- **Governance** — assertion tests that provisioning code never opens two Tenant DB connections in the same transaction; no writes to `workspaces` table (must not exist).

## 10. Deliverables

Documentation-and-planning deliverables for this Sprint PRD (implementation is authored later): this Sprint PRD, its Solution Design (Phase C, later), its acceptance-criteria matrix (below), its dependency validation entry in the Phase B1 authoring report.

## 11. Definition of Done / Completion Criteria

- Every FR is satisfied by an AC and by a passing test at implementation time.
- Every emitted event is registered in the event catalog.
- Every audit record is present and immutable per ADR-014.
- Tenant lifecycle terminates in `Active` on happy path; `Provisioning-Failed` on retryable failure.
- No shared-DB assumption remains in any code path added by this sprint.

## 12. Out-of-Scope

- Multi-Workspace bootstrap (Workspace stays 1:1 with Tenant per ADR-017).
- Cross-tenant migration or tenant merge / split.
- Physical Workspace persistence (any `workspaces` table).
- Vendor / cloud / DB engine version selection (Baseline v2 §9).
- Licensing (SPR-MOD-001-005) and Platform Operations (SPR-MOD-001-008).
- Decommissioning **execution**.
- Detailed permission catalog beyond `super_admin` + initial Tenant Admin grant (defers to SPR-MOD-001-003).

## 13. Traceability

| Baseline v2 / ADR-017 element | Delivered by |
| --- | --- |
| Baseline §4 Tenant provisioning | F-001-01…F-001-05, FR-001-001..007 |
| Baseline §4 Dedicated database lifecycle | F-001-03, F-001-04, FR-001-003..006 |
| Baseline §4 Workspace bootstrap (logical) | F-001-06, FR-001-008 |
| Baseline §4 Company/Branch/Financial Year seed | F-001-07, F-001-08, FR-001-009, FR-001-010 |
| Baseline §7 Tenant Persistence Boundary Convention | FR-001-015, FR-001-016, AC-001-008 |
| Baseline §7 License Attachment Convention | Cited only; enforcement in SPR-005 |
| ADR-017 §Invariants I1..I7 | FR-001-003, FR-001-008, FR-001-015, FR-001-016 |
| ADR-017 §Authentication Flow (registry write only) | F-001-05, FR-001-006, FR-001-007 |
| ADR-014 Audit Strategy | FR-001-014, NFR-001-005 |

All FRs trace to at least one Capability, at least one ADR, at least one Baseline objective, and at least one AC. Zero-orphan FR check: 17/17 linked.

## 14. Change Log from v1

Replaces v1 sprint **`SPR-MOD-001-001-tenancy-foundation.md`**.

| Change | Reason |
| --- | --- |
| Renamed scope from "Tenancy Foundation" to "Platform & Tenant Provisioning". | v1 conflated Platform-DB tenancy and shared-schema RLS; v2 provisions a dedicated Tenant DB per Tenant (ADR-017). |
| Introduced dedicated Tenant DB provisioning contract, schema bootstrap, and connection registry write. | ADR-017 Invariants I1, I4, I6. |
| Reintroduced logical Workspace bootstrap. | ADR-017 supersedes ADR-009. |
| Removed `workspace_id` and any shared-schema RLS scaffolding language. | ADR-017 Invariants I3, I7. |
| Added compensating rollback, idempotent retry, and correlation-ID resumability. | Provisioning now spans two databases; failure semantics are richer. |
| Added Platform audit + nine-event milestone stream. | Baseline v2 §7 extended Audit Ownership Convention. |
| Moved License attachment references to citation-only. | SPR-005 owns Licensing. |

## 15. Reuse Provenance

| Section | Outcome |
| --- | --- |
| Inheritance Block | Reused unchanged (references only) |
| §1 Objective / Scope | Newly authored (v2 architecture) |
| §2 Features | Newly authored |
| §3 Functional Requirements | Newly authored |
| §4 NFRs | Updated from existing content (references NFR standards) |
| §5 UX | Newly authored (thin, defers to Solution Design) |
| §6 Technical Design | Newly authored |
| §7 Security | Reused unchanged (references RBAC + ADR-014) |
| §8 Acceptance Criteria | Newly authored |
| §9 Testing Strategy | Reused unchanged (references testing standards) |
| §10 Deliverables | Reused unchanged (per PRD template) |
| §11 DoD | Reused unchanged (per template) |
| §12 Out-of-Scope | Newly authored |
| §13 Traceability | Newly authored |
| §14 Change Log from v1 | Newly authored |
| §15 Reuse Provenance | Newly authored |

## 16. References

- ADR-017 (Accepted)
- MOD001_PLATFORM_BASELINE_v2
- MOD-001_SPRINT_PLAN_v2 §2 SPR-MOD-001-001
- TENANCY_STANDARD v2.0
- ADR-011, ADR-014, ADR-030, ADR-032
- v1 (superseded): `SPR-MOD-001-001-tenancy-foundation.md`

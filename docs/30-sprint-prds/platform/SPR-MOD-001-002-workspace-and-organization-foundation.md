---
title: "SPR-MOD-001-002 — Workspace & Organization Foundation (v2)"
summary: "Sprint PRD for the logical Workspace surface and the Company / Branch / Financial Year lifecycles inside a Tenant DB, with hierarchy, ownership, and configuration-inheritance contracts per ADR-017."
sprint_id: "SPR-MOD-001-002"
parent_module: "MOD-001"
iteration: "Sprint 2"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
updated: "2026-07-25"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-017", "ENG-024"]
related_adrs: ["ADR-017", "ADR-011"]
supersedes: "docs/30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md"
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "workspace", "organization", "v2"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-002 — Workspace & Organization Foundation (v2)

> Inherits **ADR-017**, **MOD001_PLATFORM_BASELINE_v2**, **MOD-001_SPRINT_PLAN_v2**, **TENANCY_STANDARD v2.0** by reference. Restates none of their invariants.

## Inheritance Block

- **ADR-017 §Architectural Invariants I1–I7** and **§Platform vs Tenant DB Responsibilities**.
- **TENANCY_STANDARD v2.0** — Workspace-is-Non-Persistent Convention; Tenant Persistence Boundary Convention.
- **MOD001_PLATFORM_BASELINE_v2 §7** — Configuration Ownership + Effective Configuration Conventions.
- Depends on `SPR-MOD-001-001` completed (Tenant + default Company + default Financial Year exist).

## 1. Sprint Objective and Scope

**Objective.** Deliver the organisation structure inside a Tenant database: Companies, Branches, and Financial Years — plus the **logical Workspace surface** (navigation + configuration-inheritance contracts). No `workspaces` table, no `workspace_id` column.

**In-scope surface.** Company / Branch / Financial Year lifecycles (create, activate, suspend, close, archive); hierarchy + ownership rules; Workspace navigation contract; configuration-inheritance chain Tenant → Company → Branch; org boundary rules; audit + event streams.

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-002-01 | Company entity + lifecycle inside Tenant DB | Baseline v2 §4 |
| F-002-02 | Branch entity + lifecycle inside Tenant DB | Baseline v2 §4 |
| F-002-03 | Financial Year entity + lifecycle inside Tenant DB | Baseline v2 §4 |
| F-002-04 | Hierarchy + ownership rules (ADR-017 Invariant I5) | ADR-017 §Invariants |
| F-002-05 | Logical Workspace navigation contract | ADR-017 §Decision; Baseline §7 |
| F-002-06 | Configuration inheritance chain (Tenant → Company → Branch) — resolver contract only | Baseline §7 Effective Configuration |
| F-002-07 | Organisation boundary rules (Branch/FY scope enforcement) | Baseline §7 |
| F-002-08 | Audit stream (Tenant DB) and domain events | ADR-014 |

## 3. Functional Requirements

- **FR-002-001.** The system SHALL persist Company, Branch, and Financial Year records **inside the Tenant DB only** (ADR-017 I6, I7).
- **FR-002-002.** The system SHALL enforce ADR-017 Invariant I5: every Company belongs to exactly one Tenant; every Branch and Financial Year belongs to exactly one Company.
- **FR-002-003.** The system SHALL expose lifecycle transitions for Company (Draft → Active → Suspended → Archived), Branch (Draft → Active → Suspended → Closed), and Financial Year (Planned → Open → Closed → Archived). Invalid transitions SHALL be rejected.
- **FR-002-004.** The system SHALL prevent deletion of the default Company or default Financial Year seeded by SPR-MOD-001-001 while the Tenant is `Active`.
- **FR-002-005.** The system SHALL expose a **logical Workspace navigation contract** that renders every child capability listed in ADR-017 (Companies, Branches, Financial Years, Users, Roles, Permissions, Settings, AI Workspace, Business Modules). The Workspace surface SHALL NOT persist an identifier or a row.
- **FR-002-006.** The system SHALL provide an Effective Configuration resolver contract that resolves keys along Tenant → Company → Branch. This sprint defines the **contract only**; concrete key registration is owned by SPR-MOD-001-004.
- **FR-002-007.** All lifecycle transitions and structural mutations SHALL be recorded to the Tenant audit stream.
- **FR-002-008.** The system SHALL emit domain events: `org.company.created|activated|suspended|archived`, `org.branch.created|activated|suspended|closed`, `org.financialyear.created|opened|closed|archived`.
- **FR-002-009.** No API surface added by this sprint SHALL accept or return a Workspace identifier.
- **FR-002-010.** No SQL added by this sprint SHALL join across two Tenant databases.

## 4. Non-Functional Requirements

- **NFR-002-001.** Every hierarchical mutation SHALL be transactional inside a single Tenant DB.
- **NFR-002-002.** Configuration resolver contract SHALL be side-effect free and cacheable.
- **NFR-002-003.** Audit writes SHALL comply with ADR-014 and the Audit Ownership Convention.

## 5. UX

- Workspace shell renders the child capabilities enumerated in ADR-017 §Decision (Companies, Branches, Financial Years, Users, Roles, Permissions, Settings, AI Workspace, Business Modules).
- Company / Branch / Financial Year screens are standard list + detail + lifecycle-action surfaces; layouts deferred to Solution Design.

## 6. Technical Design Considerations

- The Workspace surface is a **presentation composition** over the Tenant context; treat as a route group / shell rather than a persisted entity.
- Configuration resolver is defined as an abstract contract in this sprint; implementation of key registration is SPR-004.
- No new foreign key SHALL reference a Workspace concept.

## 7. Security

- Mutations require Tenant-scoped roles (`tenant_admin` or `company_admin`). Permission catalog integration is scheduled for SPR-MOD-001-003; this sprint defines the required permission identifiers only.

## 8. Acceptance Criteria

- **AC-002-001.** Given an Active Tenant, When a Tenant Admin creates a Company, Then it appears in the Tenant DB with state `Draft`, and only there.
- **AC-002-002.** When a Branch is created without a parent Company, Then the request is rejected with a hierarchy-violation error.
- **AC-002-003.** When a Financial Year is created outside of a Company scope, Then the request is rejected.
- **AC-002-004.** Given the seeded default Company, When any user attempts to delete it while the Tenant is Active, Then deletion is rejected.
- **AC-002-005.** When the Workspace surface renders, Then every child capability listed in ADR-017 §Decision is present as a navigation entry, and no HTTP payload contains a Workspace identifier.
- **AC-002-006.** Given a key registered against Company scope (test fixture), When the resolver is called with (Tenant, Company, Branch), Then it returns the Company-scoped value; When called with (Tenant, Company) only, Then it falls back to the Tenant scope.
- **AC-002-007.** Every lifecycle transition emits exactly one audit record in the Tenant DB and exactly one domain event.
- **AC-002-008.** Repository-wide search for `workspaces` table and `workspace_id` column returns zero matches after this sprint (governance test).

## 9. Testing Strategy

- Unit: lifecycle state machines; resolver contract.
- Contract: navigation-registry entries; audit + event schemas.
- Integration: Tenant-DB scoped end-to-end for hierarchy CRUD.
- Governance: static checks for absence of `workspaces` table and `workspace_id` column.

## 10. Deliverables

Sprint PRD (this document); dependency-validation entry in Phase B1 report; Solution Design deferred to Phase C.

## 11. Definition of Done / Completion Criteria

Every FR met, every AC green, no cross-tenant SQL added, no Workspace identifier introduced anywhere in code, docs, or API.

## 12. Out-of-Scope

- Users, Roles, Permissions (SPR-MOD-001-003).
- Configuration key registration & feature flags (SPR-MOD-001-004).
- Localization (SPR-MOD-001-006).
- Workspace-level branding, dashboard, notifications, integrations (SPR-MOD-001-007).
- Any promotion of Workspace to a physical entity (blocked by ADR-017 §Promotion Criteria).

## 13. Traceability

| Baseline v2 / ADR-017 element | Delivered by |
| --- | --- |
| Baseline §4 Company / Branch / Financial Year | F-002-01..03, FR-002-001..004 |
| Baseline §7 Effective Configuration Convention | F-002-06, FR-002-006 |
| Baseline §7 Workspace-is-Non-Persistent Convention | F-002-05, FR-002-005, FR-002-009, AC-002-008 |
| ADR-017 §Invariant I5 | FR-002-002, AC-002-002..003 |
| ADR-017 §Invariant I3 | FR-002-005, FR-002-009, AC-002-005, AC-002-008 |
| ADR-014 Audit | FR-002-007, AC-002-007 |

Zero-orphan FR check: 10/10 linked.

## 14. Change Log from v1

Replaces v1 sprint **`SPR-MOD-001-002-organization-structure.md`**.

| Change | Reason |
| --- | --- |
| Removed shared-schema RLS scoping language for org tables. | ADR-017 replaces RLS-scoping with dedicated Tenant DB. |
| Added logical Workspace navigation contract. | ADR-017 reintroduces Workspace as logical. |
| Prohibited `workspaces` table and `workspace_id` column at governance level. | ADR-017 Invariant I3. |
| Added Effective Configuration resolver contract (defined here, populated in SPR-004). | Baseline v2 §7. |
| Added prohibition on cross-tenant joins in this sprint's code. | Baseline v2 §7 Tenant Persistence Boundary Convention. |

## 15. Reuse Provenance

| Section | Outcome |
| --- | --- |
| Inheritance Block | Reused unchanged (references) |
| §1..§3 | Newly authored |
| §4 NFRs | Updated from existing content |
| §5 UX | Newly authored |
| §6 Technical Design | Newly authored |
| §7 Security | Updated from existing content |
| §8 AC | Newly authored |
| §9 Testing | Reused unchanged |
| §10..§11 | Reused unchanged (template) |
| §12 Out-of-Scope | Newly authored |
| §13 Traceability | Newly authored |
| §14 Change Log | Newly authored |
| §15 Reuse Provenance | Newly authored |

## 16. References

- ADR-017, ADR-011, ADR-014
- MOD001_PLATFORM_BASELINE_v2 §4, §7
- MOD-001_SPRINT_PLAN_v2 §2 SPR-MOD-001-002
- TENANCY_STANDARD v2.0
- v1 (superseded): `SPR-MOD-001-002-organization-structure.md`

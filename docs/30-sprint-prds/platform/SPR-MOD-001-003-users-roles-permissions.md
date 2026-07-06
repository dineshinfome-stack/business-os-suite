---
title: "SPR-MOD-001-003 — Users, Roles & Permissions"
summary: "Sprint PRD for the user, role, and permission administration layer of MOD-001 Platform Administration: user lifecycle (create, invite, activate, suspend, archive); user profile metadata; tenant, company, and branch memberships; role assignment; permission assignment; default administrative user; audit integration; and user.*, role.*, and permission.* events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Platform"
status: "Draft"
updated: "2026-07-06"
sprint_id: "SPR-MOD-001-003"
parent_module: "MOD-001"
iteration: "Sprint 3"
stage: "2"
pass: "8.2.3"
related_engines: ["ENG-001", "ENG-004", "ENG-005", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-032", "ADR-051"]
tags: ["sprint", "prd", "platform", "mod-001", "users", "roles", "permissions", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-003 — Users, Roles & Permissions

> **Stage 2 deliverable.** Third authored Sprint PRD under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.
>
> **Editorial consistency.** *The level of detail, terminology, section ordering, traceability conventions, and writing style SHOULD remain consistent with `SPR-MOD-001-001` and `SPR-MOD-001-002` so that all Sprint PRDs evolve as a uniform documentation family. Improvements MAY be introduced where they clearly improve clarity or maintainability, but established governance patterns, document structure, and traceability conventions MUST remain consistent across authored Sprint PRDs.*

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-001-003` (permanent) |
| Parent Module | `MOD-001` — Platform Administration |
| Parent Sprint Plan | [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | `SPR-MOD-001-001`, `SPR-MOD-001-002` |
| Downstream Sprints | `SPR-MOD-001-004` … `SPR-MOD-001-006`; every subsequent sprint that requires an administered user, role, or permission grant |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the foundational **user, role, and permission administration** layer required by every downstream business module. Establish user lifecycles (create, invite, activate, suspend, archive) under a tenant; user profile metadata; tenant, company, and branch memberships over the organizational hierarchy created in `SPR-MOD-001-002`; role assignment; permission assignment; the default administrative user; audit integration; and the `user.*`, `role.*`, and `permission.*` event contracts on which every downstream module depends for identity, membership, and access decisions. **This sprint administers users, roles, and permissions; it does not deliver authentication.**

### 1.2 In Scope

- User lifecycle: `create`, `invite`, `activate`, `suspend`, `archive`.
- User profile metadata: display name, email, contact information, preferred language, preferred timezone.
- Tenant membership (a user belongs to exactly one tenant).
- Company membership (a user MAY belong to zero or more companies within the tenant).
- Branch membership (a user MAY belong to zero or more branches within a joined company).
- Role assignment (grant / revoke of platform-scoped and org-scoped roles to a user).
- Permission assignment (direct permission grants at supported scopes; role-mediated grants).
- Default administrative user bootstrap on tenant provisioning (upgraded from `SPR-MOD-001-001`).
- Audit integration for every user, membership, role, and permission transition via `ENG-004`.
- Events published: `user.created`, `user.invited`, `user.activated`, `user.suspended`, `user.archived`, `role.assigned`, `permission.assigned` — delivered via `ENG-024`.
- Consumption of `ENG-001` identity records for user identity; consumption of `ENG-005` for user-scoped preference storage only (module-owned config keys are not registered here).

### 1.3 Out of Scope

Reserved for later Platform sprints and for the existing security architecture, which is **consumed only** (see [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) and the referenced ADRs):

- Login, authentication flows, session management, password policies, MFA, API keys, OAuth, SSO, identity federation, external identity providers — owned by the existing security architecture, ADRs, and `ENG-001`; **consumed, never redefined here**.
- Configuration hierarchy resolution and feature-flag administration surface — `SPR-MOD-001-004`.
- Localization activation and locale-pack administration — `SPR-MOD-001-005`.
- Audit Review UI (search, export, dashboards) — `SPR-MOD-001-006`.
- Advanced delegated administration (out-of-office, delegation chains, approval workflows over user administration) — deferred to a later Platform sprint per `MOD-001` MODULE_PRD §14.
- Bulk user provisioning and directory synchronization — deferred to a later Platform sprint.
- Module-specific role catalogs and permission keys — owned by their originating modules, not here.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-001-003`, the following will exist:

- **Business capabilities.**
  - A platform administrator can create, invite, activate, suspend, and archive users under a tenant.
  - A platform administrator can maintain user profile metadata (display name, email, contact information, preferred language, preferred timezone).
  - A platform administrator can attach users to companies and branches within the tenant, and detach them, without losing historical audit records.
  - A platform administrator can assign and revoke roles at platform-scoped and org-scoped levels.
  - A platform administrator can grant and revoke direct permission assignments at supported scopes.
  - Exactly one default administrative user exists per tenant, upgraded from the bootstrap seeded by `SPR-MOD-001-001`.
- **Published events.** Seven lifecycle event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions.
- **Audit artifacts.** An audit record exists for every user, membership, role, and permission transition, produced via `ENG-004`, in a form consumable by the audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-001-003`.
  - `user.*`, `role.*`, and `permission.*` event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-001 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — User, role, and permission administration | User lifecycle, role assignment, permission assignment |
| §3 Personas — Platform Admin, Tenant Admin, Company Admin | Administered by this sprint; consumed by downstream role checks |
| §4 Business Processes — User invitation and deactivation | User invite / activate / suspend / archive flows |
| §4 Business Processes — Role grant and revocation | Role assignment / revocation flows |
| §5 Master Data — User | User entity, identity, profile metadata, lifecycle |
| §5 Master Data — Role | Role assignment surface (role catalog consumed from existing security architecture, not redefined here) |
| §5 Master Data — Permission Grant | Direct and role-mediated permission grants at supported scopes |
| §6 Transactions — Role Grant | Grant / revoke transaction lifecycle |
| §7 Business Rules — Last-admin protection | A user cannot self-revoke the last platform-admin role in a tenant |
| §8 Integration Points — Events published | `user.*`, `role.*`, `permission.*` events (§11) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As a platform administrator, I want to create a user under a tenant with display name, email, contact information, preferred language, and preferred timezone, so that the user has an administered identity in the platform.*
- **US-002.** *As a platform administrator, I want to invite a user (send them a pending invitation), so that they can be onboarded through the existing authentication flow (out of scope for this sprint).*
- **US-003.** *As a platform administrator, I want to activate, suspend, and archive users, so that I can manage their operational lifecycle without deleting historical data.*
- **US-004.** *As a platform administrator, I want to attach and detach a user's company and branch memberships within the tenant, so that access is scoped to the organizational units where the user operates.*
- **US-005.** *As a platform administrator, I want to assign and revoke roles at platform-scoped and org-scoped levels, so that role-mediated permissions apply per `ADR-032`.*
- **US-006.** *As a platform administrator, I want to grant and revoke direct permission assignments at supported scopes, so that exceptional access can be granted without inventing single-purpose roles.*
- **US-007.** *As a platform administrator, I want the default administrative user seeded by `SPR-MOD-001-001` to be upgraded into a first-class administered user, so that ongoing administration flows through this sprint's surface.*
- **US-008.** *As a security reviewer, I want every user, membership, role, and permission transition to be audited via `ENG-004`, so that I can reconstruct the access history from an authoritative log.*
- **US-009.** *As a downstream module (system persona), I want to receive `user.*`, `role.*`, and `permission.*` events, so that I can react to identity and access transitions in a decoupled way.*
- **US-010.** *As a security officer, I want the platform to prevent self-revocation of the last platform-admin role in a tenant, so that no tenant is ever left without an administrator.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 User creation and lifecycle (US-001, US-002, US-003)

- **Given** a valid user creation request under an active tenant with display name, email, contact information, preferred language, and preferred timezone,
  **when** a platform admin submits it,
  **then** a user record is persisted with a stable, immutable user ID, its email is unique within the tenant, the user enters the `created` state, and a `user.created` event is emitted via `ENG-024`.
- **Given** a user in `created` state,
  **when** a platform admin invites the user,
  **then** the user transitions to `invited`, an invitation artifact consumable by the existing authentication flow is produced, and a `user.invited` event is emitted.
- **Given** a user in `created` or `invited` state whose identity has been established through `ENG-001`,
  **when** a platform admin activates the user,
  **then** the user transitions to `active` and a `user.activated` event is emitted.
- **Given** an `active` user,
  **when** a platform admin suspends the user,
  **then** the user transitions to `suspended`, all role-mediated and direct permission grants become non-effective at evaluation time, and a `user.suspended` event is emitted.
- **Given** a `suspended` or `active` user,
  **when** a platform admin archives the user,
  **then** the user transitions to `archived`, all writes on behalf of that user are blocked, historical reads remain permitted, and a `user.archived` event is emitted.

### 5.2 Memberships (US-004)

- **Given** an `active` user under a tenant and an `active` company in the same tenant,
  **when** a platform admin attaches the user to the company,
  **then** a company membership record is persisted, and the membership is uniquely keyed by `(user, company)`.
- **Given** a user with an existing company membership and an `active` branch under the same company,
  **when** a platform admin attaches the user to the branch,
  **then** a branch membership record is persisted, and the membership is uniquely keyed by `(user, branch)`.
- **Given** an existing company or branch membership,
  **when** a platform admin detaches it,
  **then** the membership is retired (soft-detached), all role and permission grants scoped to that membership become non-effective at evaluation time, and historical reads of the retired membership remain permitted.
- **Given** any membership write,
  **when** it executes,
  **then** the `Tenant → Company → Branch` hierarchy of `SPR-MOD-001-002` is enforced (no cross-tenant memberships, no orphan branch memberships).

### 5.3 Role assignment (US-005)

- **Given** an `active` user and a role defined by the existing security architecture,
  **when** a platform admin assigns the role at a supported scope (platform, tenant, company, or branch — per `ADR-032`),
  **then** a role assignment record is persisted, and a `role.assigned` event is emitted.
- **Given** an existing role assignment,
  **when** a platform admin revokes it,
  **then** the assignment is retired (soft-revoked), a `role.assigned` event reflecting the revocation state is emitted per the Event Ownership Convention in §11, and permission evaluations for that role no longer include the revoked scope.
- **Given** a platform-admin role,
  **when** the acting user attempts to revoke that role from themselves and doing so would leave the tenant with zero platform administrators,
  **then** the request is rejected deterministically and no partial state is left behind (per MOD-001 MODULE_PRD §7 business rule).

### 5.4 Permission assignment (US-006)

- **Given** an `active` user and a permission key registered by the existing security architecture,
  **when** a platform admin grants the permission at a supported scope,
  **then** a permission grant record is persisted and a `permission.assigned` event is emitted.
- **Given** an existing permission grant,
  **when** a platform admin revokes it,
  **then** the grant is retired (soft-revoked) and a `permission.assigned` event reflecting the revocation state is emitted per the Event Ownership Convention in §11.

### 5.5 Default administrative user (US-007)

- **Given** a tenant provisioned by `SPR-MOD-001-001`,
  **when** this sprint's surface first becomes available for that tenant,
  **then** the seed administrative user is upgraded into a fully administered `active` user with a stable, preserved identifier, holds the platform-admin role at tenant scope, and is subject to the last-admin protection in §5.3.

### 5.6 Audit integration (US-008)

- **Given** any user, membership, role, or permission transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant ID, subject user ID, scope (platform / tenant / company / branch), transition type, and timestamp.

### 5.7 Events (US-009)

- **Given** any transition enumerated in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to that contract.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-001` — Platform Administration.
- **Module PRD:** [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (User/role/permission administration), §3 (Personas administered), §4 (User invitation, deactivation, role grant/revoke), §5 (User, Role, Permission Grant), §6 (Role Grant transaction), §7 (Last-admin protection), §8 (User/role/permission events), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-001` MODULE_PRD.
- **Upstream sprints:**
  - `SPR-MOD-001-001` — Tenancy Foundation. Tenant context, `ADR-011` isolation invariants, and the seed administrative user are consumed here and (for the seed admin) upgraded into a fully administered entity.
  - `SPR-MOD-001-002` — Organization Structure. The `Tenant → Company → Branch` hierarchy is consumed by company and branch memberships and by role / permission scopes.
- **Downstream sprints:** `SPR-MOD-001-004` … `SPR-MOD-001-006` (configuration, localization, audit review) and every sprint in every downstream module that requires an administered user, membership, or access grant.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined**. See each engine's specification for capability details.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides identity records for administered users and identity assertions for platform administrators performing user, role, and permission transitions. Authentication flow is out of scope for this sprint. |
| `ENG-004` Audit | Records every user, membership, role, and permission transition. |
| `ENG-005` Configuration | Stores user-scoped preference values (preferred language, preferred timezone) as user-scoped configuration; module-owned keys are not registered here. |
| `ENG-024` Eventing | Publishes `user.*`, `role.*`, and `permission.*` events with the contracts declared in §11. |
| `ENG-002` Authorization | Read-only contextual reference; role-mediated and direct permission evaluation is delivered by the existing authorization engine, not redefined here. |
| `ENG-003` Permission Management | Read-only contextual reference; the permission catalog and role catalog are owned by the existing security architecture, not redefined here. |

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced across user identity, memberships, role assignments, and permission grants — not redefined. |
| `ADR-012` Tenant Lifecycle | Authoritative lifecycle state-machine pattern; the same pattern is applied consistently to the user lifecycle (`created → invited → active → suspended → archived`). |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for user, membership, role, and permission transitions. |
| `ADR-032` RBAC + ABAC | Authoritative access-control model; role assignments and permission grants are administered here strictly within the model defined by this ADR. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for `user.*`, `role.*`, and `permission.*` events. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| User | MOD-001 (this sprint) | Administered user under a tenant; carries stable identity, profile metadata, and lifecycle state. Identity records themselves are owned by `ENG-001`. |
| Membership | MOD-001 (this sprint) | Attachment of a user to a company or branch within the tenant; carries the (user, org-unit) key and effective state. |
| Role Assignment | MOD-001 (this sprint) | Grant of a role (defined by the existing security architecture) to a user at a supported scope (platform / tenant / company / branch), per `ADR-032`. |
| Permission Assignment | MOD-001 (this sprint) | Direct grant of a permission key to a user at a supported scope, per `ADR-032`. Role and permission catalogs themselves are owned by the existing security architecture. |

### 10.2 Relationships

- A **user** belongs to exactly one tenant.
- A **user** MAY hold zero or more company memberships within that tenant, and zero or more branch memberships within the companies they have joined.
- A **role assignment** binds one user to one role at exactly one scope (platform / tenant / company / branch).
- A **permission assignment** binds one user to one permission key at exactly one supported scope.
- The seed administrative user introduced by `SPR-MOD-001-001` is upgraded here into a first-class administered user with a preserved identifier.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-001`.
- The role catalog and permission catalog are owned by the existing security architecture and are **consumed, not redefined**. This sprint only owns the *assignment* of those roles and permissions to users.
- The identity record backing a user is owned by `ENG-001` and is **consumed**.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`.

> **Event Ownership Convention.** *The sprint that first introduces an event becomes the authoritative owner of that event. Subsequent Sprint PRDs MAY reference or consume the event but MUST NOT redefine its business meaning, ownership, or delivery guarantees. Any evolution of an existing event MUST be documented by updating the owning Sprint PRD (or its successor baseline), not by redefining the event in consuming Sprint PRDs.*

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `user.created` | MOD-001 | SPR-MOD-001-003 | MOD-001 (self), MOD-002 (Accounting), MOD-003 (Sales), MOD-004 (Purchase), all downstream modules | At-least-once, ordered per tenant (per `ADR-051`) |
| `user.invited` | MOD-001 | SPR-MOD-001-003 | MOD-001 (self), all downstream modules | At-least-once, ordered per tenant |
| `user.activated` | MOD-001 | SPR-MOD-001-003 | MOD-001 (self), MOD-002, MOD-003, MOD-004, all downstream modules | At-least-once, ordered per tenant |
| `user.suspended` | MOD-001 | SPR-MOD-001-003 | MOD-001 (self), MOD-002, MOD-003, MOD-004, all downstream modules | At-least-once, ordered per tenant |
| `user.archived` | MOD-001 | SPR-MOD-001-003 | MOD-001 (self), MOD-002, MOD-003, MOD-004, all downstream modules | At-least-once, ordered per tenant |
| `role.assigned` | MOD-001 | SPR-MOD-001-003 | MOD-001 (self), MOD-002, MOD-003, MOD-004, all downstream modules | At-least-once, ordered per tenant |
| `permission.assigned` | MOD-001 | SPR-MOD-001-003 | MOD-001 (self), MOD-002, MOD-003, MOD-004, all downstream modules | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Per the Event Ownership Convention above, `SPR-MOD-001-003` is the authoritative owner of every event listed here. Revocation transitions for role and permission assignments are conveyed by the same `role.assigned` / `permission.assigned` event contracts carrying the effective state, per `ADR-051`.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] `user.*`, `role.*`, and `permission.*` events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] The `Tenant → Company → Branch` hierarchy of `SPR-MOD-001-002` is enforced for every membership, role assignment, and permission assignment.
- [ ] Every user, membership, role, and permission transition produces an audit record via `ENG-004`.
- [ ] The last-admin protection rule (MOD-001 MODULE_PRD §7) is enforced.
- [ ] The seed administrative user from `SPR-MOD-001-001` is upgraded in place with a preserved identifier.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-001_SPRINT_PLAN.md` §2 (`SPR-MOD-001-003`):

- A tenant admin can create users, define roles, grant permissions, and revoke access.
- Permission checks resolve deterministically for both RBAC and ABAC inputs.
- Every access grant/revoke is audited with actor, subject, and scope.
- Downstream modules can rely on `ENG-002` / `ENG-003` for authorization decisions.

If any exit criterion is not met, the sprint MUST NOT move to `Done`. Note that "define roles" and "permission checks resolve deterministically for both RBAC and ABAC inputs" are satisfied by the existing security architecture (`ENG-002`, `ENG-003`, `ADR-032`), which this sprint **consumes** — this sprint owns the assignment surface only.

---

## 14. Risks and Assumptions

- **R1 — Upstream dependency.** `SPR-MOD-001-001` and `SPR-MOD-001-002` MUST be in the `Done` lifecycle state before implementation of this sprint begins. Documentation authoring MAY proceed while upstream sprints are still in `Draft` or `Planned`, but implementation sequencing follows the dependency graph.
- **R2 — Authentication boundary.** Authentication, MFA, password policies, session management, SSO, OAuth, API keys, and identity federation are **not** delivered by this sprint. They are owned by the existing security architecture, ADRs, and `ENG-001`, and are consumed as-is. This boundary is preserved even under pressure from downstream backlog.
- **R3 — Role and permission catalogs.** The role catalog and permission catalog are owned by the existing security architecture (per `ADR-032`). This sprint MUST NOT introduce a competing catalog under `MOD-001`.
- **R4 — Seed admin upgrade.** The default administrative user created by `SPR-MOD-001-001` is upgraded here into a first-class administered user. Assumption: this upgrade preserves the stable identifier so downstream references (audit history, event stream) remain valid.
- **R5 — Downstream deferrals.** Configuration hierarchy resolution, feature flags, localization activation, audit review UI, delegated administration, and bulk provisioning are deferred to `SPR-MOD-001-004` … `SPR-MOD-001-006` and to later planning revisions. Assumption: these deferrals hold; this sprint does not silently absorb their scope.
- **R6 — ADR acceptance.** All referenced ADRs (`ADR-011`, `ADR-012`, `ADR-014`, `ADR-032`, `ADR-051`) are Accepted at authoring time. If any becomes non-Accepted, this sprint is re-planned.
- **R7 — Last-admin protection.** The prohibition on self-revocation of the last platform-admin role MUST be enforced atomically with the revocation transition. If atomicity cannot be achieved for a specific implementation path, that path is rejected — the acceptance criterion is not weakened.

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — user lifecycle state-machine transitions; last-admin protection; membership uniqueness; role and permission assignment / revocation logic.
- **Integration** — audit emission via `ENG-004`, user-scoped preference storage via `ENG-005`, event publication via `ENG-024`, identity lookup via `ENG-001`.
- **Contract** — `user.*`, `role.*`, and `permission.*` event contracts against the event catalog.
- **End-to-end (smoke)** — a smoke fixture that provisions a tenant (via `SPR-MOD-001-001`), builds an organizational hierarchy (via `SPR-MOD-001-002`), then creates a user, invites them, activates them, attaches them to a company and a branch, assigns a role at branch scope, grants a direct permission at company scope, revokes them, and finally suspends and archives the user. The fixture verifies that (a) all transitions are audited, (b) all events are emitted, (c) `ADR-011` isolation invariants hold across identity, membership, and access records, and (d) the last-admin protection rule cannot be bypassed.

Sprint-specific fixtures: a two-tenant / multi-user / multi-role smoke fixture used to prove isolation, last-admin protection, and deterministic authorization behavior via `ENG-002` / `ENG-003` (consumed, not redefined).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the user lifecycle with the same state-machine primitive used for tenant, company, branch, and financial-year lifecycles in `SPR-MOD-001-001` and `SPR-MOD-001-002`, so §5.6 (audit) and §5.7 (events) remain trivially uniform across all lifecycles.
- Consider upgrading the seed administrative user from `SPR-MOD-001-001` in place (preserving its identifier) rather than replacing it, so downstream audit and event references remain valid.
- Consider co-locating role and permission revocation with a state field on the assignment record (rather than a hard delete), so that revocation events can be emitted uniformly and audit history remains intact.
- Consider evaluating the last-admin protection at the same boundary the platform enforces tenant isolation, so the rule is a structural guarantee rather than a scattered runtime check.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-001-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the foundational user, role, and permission administration layer — user lifecycle, profile metadata, memberships, role and permission assignment, default administrative user, audit, and lifecycle events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-001` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly with "consumed, not redefined" language; no engine or ADR text is duplicated here. Authentication, RBAC/ABAC evaluation, role catalog, and permission catalog are consumed from existing security architecture.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates authentication, MFA, password policies, SSO, session management, configuration hierarchy, localization, audit UI, delegated administration, and bulk provisioning, each linked to its owning sprint, engine, or ADR.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-001-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-001-004 Configuration Hierarchy` is the immediate successor per [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) §2–§3 and depends only on `SPR-MOD-001-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-001-001-tenancy-foundation.md`](./SPR-MOD-001-001-tenancy-foundation.md), [`./SPR-MOD-001-002-organization-structure.md`](./SPR-MOD-001-002-organization-structure.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

---
title: "SPR-MOD-001-003 — Identity & Access Foundation (v2)"
summary: "Sprint PRD for identity and access under ADR-017: Platform Super Admin (Platform DB), Tenant Admin / Company Admin / Employee (Tenant DB), roles, permissions, permission inheritance, and authentication flow with tenant resolution before Tenant DB connection."
sprint_id: "SPR-MOD-001-003"
parent_module: "MOD-001"
iteration: "Sprint 3"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
updated: "2026-07-25"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-024"]
related_adrs: ["ADR-017", "ADR-030", "ADR-032", "ADR-014"]
supersedes: "docs/30-sprint-prds/platform/SPR-MOD-001-003-users-roles-permissions.md"
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "identity", "access", "rbac", "v2"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-003 — Identity & Access Foundation (v2)

> Inherits **ADR-017**, **MOD001_PLATFORM_BASELINE_v2**, **MOD-001_SPRINT_PLAN_v2**, **TENANCY_STANDARD v2.0**, **RBAC_STANDARD**, **PERMISSION_CATALOG** by reference. Restates none of their invariants.

## Inheritance Block

- **ADR-017 §Authentication Flow** — tenant resolution precedes Tenant DB connection.
- **ADR-030 Authentication Model (Proposed)** — awaited dependency; MUST be `Accepted` before Stage 2 implementation.
- **ADR-032 RBAC + ABAC** — role model and evaluation.
- **RBAC_STANDARD**, **PERMISSION_CATALOG**, **ROLE_MODEL** — role and permission conventions.
- Depends on `SPR-MOD-001-001` (Tenant + initial Admin exist) and `SPR-MOD-001-002` (Company / Branch scope exists).

## 1. Sprint Objective and Scope

**Objective.** Deliver the Identity & Access foundation across the dedicated-DB-per-Tenant architecture: Platform Super Admin identity in the Platform DB, Tenant-scoped identities (Tenant Admin, Company Admin, Employee) in each Tenant DB, roles, permissions, permission inheritance, session model, and the authentication flow that resolves the Tenant **before** opening a Tenant DB connection.

**In-scope surface.** Identity + membership models (Platform + Tenant), role model, permission catalog integration, permission inheritance (Tenant → Company → Branch → User), authentication flow with tenant-first resolution, session model, audit events; future SSO/MFA as planning-only.

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-003-01 | Platform Super Admin identity (Platform DB) | ADR-017 §Auth Flow; Baseline §4 |
| F-003-02 | Tenant Admin / Company Admin / Employee identities (Tenant DB) | Baseline §4 |
| F-003-03 | Tenant membership record (Platform DB → Tenant DB linkage) | ADR-017 §Auth Flow |
| F-003-04 | Role model + assignment (per-Tenant) | ADR-032 |
| F-003-05 | Permission catalog integration (per-Tenant DB) | PERMISSION_CATALOG |
| F-003-06 | Permission inheritance Tenant → Company → Branch → User | Baseline §7 Effective Configuration parallel |
| F-003-07 | Authentication flow: tenant resolution before Tenant DB connection | ADR-017 §Auth Flow |
| F-003-08 | Session model (short-lived; tenant-bound after resolution) | ADR-030 (awaited) |
| F-003-09 | Audit events for grant / revoke / login / elevation | ADR-014 |
| F-003-10 | SSO / MFA — planning-only design notes | ADR-030 §Future |

## 3. Functional Requirements

- **FR-003-001.** Platform Super Admin identities SHALL exist **only** in the Platform DB (ADR-017 I6).
- **FR-003-002.** Tenant-scoped identities (Tenant Admin, Company Admin, Employee) SHALL exist **only** in the corresponding Tenant DB.
- **FR-003-003.** A Tenant membership record in the Platform DB SHALL link a login credential to exactly one Tenant identity per Tenant. The record SHALL NOT contain Tenant business attributes.
- **FR-003-004.** The system SHALL support role assignment scoped to Tenant, Company, or Branch. Roles SHALL be stored inside the Tenant DB.
- **FR-003-005.** The permission model SHALL integrate PERMISSION_CATALOG per RBAC_STANDARD and ADR-032. Permissions SHALL NOT be stored on user or profile records (see Security Memory).
- **FR-003-006.** The system SHALL resolve **effective permissions** via inheritance Tenant → Company → Branch → User, with the most specific grant winning; explicit denies at any level override inherited grants at lower specificity.
- **FR-003-007.** The authentication flow SHALL resolve the caller's Tenant from the credential / route / claim **before** opening the Tenant DB connection (ADR-017 §Auth Flow).
- **FR-003-008.** The system SHALL NOT open the Tenant DB connection until the Tenant is `Active` and the License gate (SPR-005, later) is passed. This sprint SHALL provide the hook and treat License check as pass-through pending SPR-005.
- **FR-003-009.** Sessions SHALL be tenant-bound after resolution; switching Tenants SHALL require re-authentication.
- **FR-003-010.** Super Admin access to a Tenant DB SHALL require an explicit, audited, time-bounded elevation; default Super Admin sessions SHALL NOT hold Tenant DB connections.
- **FR-003-011.** Grant, revoke, sign-in, sign-out, and elevation events SHALL be audited: Tenant events to Tenant audit; Super Admin events to Platform audit.
- **FR-003-012.** SSO and MFA SHALL be represented as **design notes** only, targeting a future Authentication ADR; no runtime SSO/MFA is delivered by this sprint.

## 4. Non-Functional Requirements

- **NFR-003-001.** Permission resolution SHALL be deterministic and cacheable per session.
- **NFR-003-002.** Authentication SHALL fail closed: any error during tenant resolution or Tenant-DB connection SHALL deny access, never fall back to a shared connection.
- **NFR-003-003.** All identity/role/permission writes SHALL be audited per ADR-014.

## 5. UX

- Sign-in surface unchanged in shape; the tenant-resolution step is transparent to users.
- Tenant Admin sees a Users + Roles + Permissions surface inside the Workspace shell delivered by SPR-002.
- Company Admin's view is scoped to their Company; Employee sees only their profile + assigned permissions.

## 6. Technical Design Considerations

- The tenant-resolution step is implemented as a middleware executed against the Platform DB before request handlers can access the Tenant DB.
- Role tables live in the Tenant DB; the has_role() pattern (Security Memory) applies.
- Elevation for Super Admin is a scoped, time-boxed session augmentation; concrete transport is a Solution Design decision.

## 7. Security

- Roles are stored in dedicated tables inside the Tenant DB — **never** on profile or user tables (Security Memory: "What should never happen").
- Super Admin elevation is always audited with time-bound expiry.
- Session tokens SHALL be bound to Tenant identity after resolution.
- No secrets in client bundles; publishable Supabase keys only.

## 8. Acceptance Criteria

- **AC-003-001.** Given a valid Super Admin credential, When they sign in, Then their session references Platform DB only and no Tenant DB connection is opened.
- **AC-003-002.** Given a valid Tenant user credential, When they sign in, Then the tenant is resolved from Platform DB **before** any Tenant DB query is issued (observable through instrumentation).
- **AC-003-003.** Given a suspended Tenant, When any Tenant user attempts to sign in, Then access is denied with no Tenant DB connection attempted.
- **AC-003-004.** Given inherited permissions at Tenant scope and an explicit deny at User scope, When permission is evaluated, Then the deny wins.
- **AC-003-005.** When a role is granted to a user, Then a Tenant audit record and a `iam.role.granted` event exist; the row appears in the Tenant DB and nowhere in the Platform DB.
- **AC-003-006.** When a Super Admin elevates to a Tenant, Then a Platform audit record is written with expiry timestamp, and the elevation session terminates automatically at expiry.
- **AC-003-007.** No role, permission, or grant is written to a profile or user table (governance test enforcing Security Memory rule).
- **AC-003-008.** Session switch between Tenants requires re-authentication (integration test).

## 9. Testing Strategy

- Unit: permission resolution and inheritance; deny-wins semantics; session binding.
- Contract: tenant-resolution middleware; elevation issuer.
- Integration: end-to-end sign-in for Super Admin, Tenant Admin, Company Admin, Employee; suspended-Tenant denial; elevation lifecycle.
- Governance: static test asserting roles are not stored on user/profile tables.

## 10. Deliverables

This Sprint PRD; entry in Phase B1 Authoring Report; Solution Design deferred to Phase C.

## 11. Definition of Done / Completion Criteria

Every FR met, every AC green; ADR-030 `Accepted` before Stage 2; PERMISSION_CATALOG updated for any new identifiers this sprint introduces; no cross-tenant identity records introduced.

## 12. Out-of-Scope

- SSO / MFA runtime (planning notes only in this sprint).
- Configuration keys and feature flags (SPR-MOD-001-004).
- Licensing enforcement (SPR-MOD-001-005) — this sprint provides the pass-through hook.
- Platform Admin Console UX (SPR-MOD-001-010).

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §4 Users/roles/permissions | F-003-01..06, FR-003-001..006 |
| Baseline §7 Extended Audit Ownership | FR-003-011, AC-003-005..006 |
| ADR-017 §Authentication Flow | F-003-07, FR-003-007, FR-003-008, AC-003-002..003 |
| ADR-017 §I6/I7 (Platform vs Tenant DB) | FR-003-001..003, AC-003-005 |
| ADR-030 (awaited) | F-003-08, F-003-10, FR-003-009, FR-003-012 |
| ADR-032 RBAC + ABAC | F-003-04..06, FR-003-004..006 |
| ADR-014 Audit | FR-003-011, NFR-003-003 |

Zero-orphan FR check: 12/12 linked.

## 14. Change Log from v1

Replaces v1 sprint **`SPR-MOD-001-003-users-roles-permissions.md`**.

| Change | Reason |
| --- | --- |
| Split identity storage across Platform DB (Super Admin, Tenant membership) and Tenant DB (Tenant identities, roles, permissions). | ADR-017 I6, I7. |
| Added tenant-resolution-before-Tenant-DB-connection contract. | ADR-017 §Authentication Flow. |
| Added Super Admin elevation model with expiry + Platform audit. | Baseline v2 §7 extended Audit Ownership Convention. |
| Reaffirmed roles-in-dedicated-table rule; explicitly banned roles-on-profile pattern. | Security Memory; RBAC_STANDARD. |
| Reduced SSO/MFA scope to planning notes. | Runtime SSO/MFA depends on a future Authentication ADR beyond ADR-030. |

## 15. Reuse Provenance

| Section | Outcome |
| --- | --- |
| Inheritance Block | Reused unchanged (references) |
| §1..§3 | Newly authored |
| §4 NFRs | Updated from existing content |
| §5 UX | Newly authored |
| §6 Technical Design | Newly authored |
| §7 Security | Reused unchanged (references Security Memory + RBAC_STANDARD) |
| §8 AC | Newly authored |
| §9 Testing | Reused unchanged |
| §10..§11 | Reused unchanged (template) |
| §12 Out-of-Scope | Newly authored |
| §13 Traceability | Newly authored |
| §14 Change Log | Newly authored |
| §15 Reuse Provenance | Newly authored |

## 16. References

- ADR-017, ADR-030 (Proposed), ADR-032, ADR-014
- MOD001_PLATFORM_BASELINE_v2 §4, §7
- MOD-001_SPRINT_PLAN_v2 §2 SPR-MOD-001-003
- TENANCY_STANDARD v2.0
- RBAC_STANDARD, PERMISSION_CATALOG, ROLE_MODEL
- v1 (superseded): `SPR-MOD-001-003-users-roles-permissions.md`

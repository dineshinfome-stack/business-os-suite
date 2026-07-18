---
title: "MOB-001 — Platform Administration Mobile Solution Design Specification"
summary: "Phase 3 Mobile Solution Design specification for MOD-001 Platform Administration. Derived exclusively from the Platform Administration Module Publication (with WEB-001 referenced only for terminology, workflow, and navigation consistency). Defines mobile personas, journeys, navigation, screen inventory with stable module-scoped Screen IDs, forms, offline behaviour, notifications, accessibility, and user-facing security expectations. Introduces no new business requirements."
spec_id: "MOB-001"
family: "MOB"
source_module: "MOD-001"
source_module_name: "Platform Administration"
source_publication: "MOD-001_MODULE_PUBLICATION"
source_baseline: "MOD001_PLATFORM_BASELINE_v1"
source_module_prd: "docs/20-module-prds/platform/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-001-001", "SPR-MOD-001-002", "SPR-MOD-001-003", "SPR-MOD-001-004", "SPR-MOD-001-005", "SPR-MOD-001-006"]
related_web_spec: "WEB-001"
related_api_spec: "API-001"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Architecture Office"
layer: "platform"
updated: "2026-07-18"
tags: ["solution-design", "mobile", "phase-3", "MOB-001", "MOD-001", "platform-administration"]
document_type: "Mobile Solution Design Specification"
template: "SD-001_MOB_SPEC"
template_version: "v1.0"
governance_specification: "v1.0"
screen_identifier_standard: "SCREEN_IDENTIFIER_STANDARD v1.0"
related_engines: ["ENG-001", "ENG-004", "ENG-005", "ENG-006", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-032", "ADR-051", "ADR-081"]
---

# MOB-001 — Platform Administration Mobile Solution Design Specification

> **Reference derivation only.** MOB-001 is a Mobile-surface projection of the Platform Administration Module Publication [`MOD-001_MODULE_PUBLICATION`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. [`WEB-001`](../web/WEB-001_PLATFORM_ADMINISTRATION.md) is referenced only to maintain consistency of journeys, terminology, and navigation; it is not a business source. Screen identifiers follow [`SCREEN_IDENTIFIER_STANDARD`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md) v1.0. On any conflict with the Module Publication or its parent Module Baseline, the upstream artefact wins and MOB-001 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Mobile-surface user experience through which authorized administrators consume the Platform Administration capabilities published in `MOD-001_MODULE_PUBLICATION` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization pack lifecycle, and the audit review surface — on mobile-native devices, while honouring the governance conventions (Event, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership) that bind every downstream business module.

### A.2 Scope

Mobile-native surface (phone and tablet form factors) covering:

- On-the-go tenant, organization, company, branch, and financial year lookup and light lifecycle actions within scope.
- User invitation, deactivation, role grant and revoke actions within the administrator's scope.
- Read and light-authoring surface for Configuration Hierarchy entries; effective-configuration inspection.
- Read and activation surface for Localization Packs.
- Read-only Audit Review timeline with filtering, drill-down, and export requests.
- Governance conventions surface (read-only).
- Notification handling for platform administrative events delivered via `ENG-025`.
- Offline availability limited strictly to what the Published Module supports (cached read-only viewing and queued read-only preference edits).

Out of scope for MOB-001: Web surfaces (belongs to WEB-001), API contracts (belongs to API-001 — forward reference), UI mockups, framework decisions, authentication mechanics (SSO, MFA, identity federation), SIEM integration, external monitoring, and any business-rule authoring.

### A.3 Source Published Module

- **Module ID / Name:** MOD-001 Platform Administration
- **Publication:** [`MOD-001_MODULE_PUBLICATION`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`](../../30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-001-001` … `SPR-MOD-001-006`
- **Related Web Specification:** [`WEB-001`](../web/WEB-001_PLATFORM_ADMINISTRATION.md) — consistency reference only.
- **Related API Specification:** `API-001` — forward reference (authored in Pass 35.0.1).

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-001 v1.0

### A.5 Screen Identifier Convention

Every screen in §E is assigned a stable Screen ID of the form `MOD001-SCR-NNN` per [`SCREEN_IDENTIFIER_STANDARD`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md) v1.0. Screen IDs are immutable once assigned; deprecated screens retain their IDs. Every Screen ID referenced in User Journeys (§C), Forms (§F), and the Traceability Matrix (§K) MUST resolve to a Screen defined in §E.

### A.6 Traceability References

See §K for the complete capability-to-screen-to-sprint-to-WEB-001 traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → MOB-001).

## B. Mobile Personas

Personas are inherited from the Module PRD, the Module Publication, and the Sprint PRD family; MOB-001 introduces no new roles. Concrete grants remain enforced by `ENG-001` and by RBAC/ABAC per `ADR-032` at platform scope. This section describes mobile-specific responsibilities and primary scenarios only.

### B.1 Platform Administrator

- **Mobile Responsibilities:** Approve tenant lifecycle transitions on the go; monitor platform-scope configuration health; act on platform-scope audit notifications.
- **Primary Mobile Scenarios:** Approve tenant activation; review platform-scope audit event; publish a Localization Pack update on approval.

### B.2 Tenant Administrator

- **Mobile Responsibilities:** Invite users; grant / revoke roles within scope; act on pending configuration approvals; activate a Localization Pack; review tenant audit timeline.
- **Primary Mobile Scenarios:** Invite a new user from a notification; approve a configuration override; activate a Localization Pack; review a tenant audit event.

### B.3 Company Administrator

- **Mobile Responsibilities:** Assign users to company roles; override company-scope configuration entries; manage branch-level structure lookups.
- **Primary Mobile Scenarios:** Assign a user to a company role; override a company-scope configuration key; open or close a Financial Year within scope.

### B.4 Auditor

- **Mobile Responsibilities:** Read-only inspection of the platform audit timeline; drill into individual audit events; request an export of a filtered selection.
- **Primary Mobile Scenarios:** Open Audit Timeline from a notification; filter by actor and time range; request an export.

### B.5 Security Officer

- **Mobile Responsibilities:** Read-only oversight over role grants, effective configuration for sensitive keys, and administrative activity in the audit surface.
- **Primary Mobile Scenarios:** Review a sensitive Role Grant; inspect effective configuration for a scoped key; review recent administrative actions in the audit timeline.

## C. Mobile User Journeys

Every journey derives from a capability in Module Publication §3 and an authority in Publication §4. Corresponding WEB-001 sections are cited parenthetically for consistency only. Screen IDs reference §E.

### C.1 Journey — Invite and Deactivate a User (WEB-001 §C.3)

- **Entry Points:** Home (`MOD001-SCR-001`) → Users list (`MOD001-SCR-010`) → Invite; deep link from a `UserInvited` reminder notification.
- **Primary Flow:** Tenant Administrator opens the Invite User form (`MOD001-SCR-012`) → captures business fields → submits → `UserInvited` emits via `ENG-024` → invitation dispatches via `ENG-006`. Deactivation from User Detail (`MOD001-SCR-011`) follows the User Master Authority; audit-visible per `ADR-014`.
- **Offline / Online Transitions:** Invitation submission requires connectivity; drafts persist locally and are re-presented on reconnect.
- **Exception Flows:** Attempted self-revocation of the last platform-admin role in a tenant → rejected per PRD §7.

### C.2 Journey — Grant and Revoke a Role (WEB-001 §C.4)

- **Entry Points:** User Detail (`MOD001-SCR-011`) → Roles; Roles catalog (`MOD001-SCR-013`) → Role Detail (`MOD001-SCR-014`) → Members.
- **Primary Flow:** Administrator selects a Role → applies to a User at a scope via the Role Grant form (`MOD001-SCR-015`) → Permission Resolution Authority (per `ADR-032`) evaluates → `RoleGranted` emits via `ENG-024`. Revocation follows the same authority and is audit-visible per `ADR-014`.
- **Exception Flows:** Grant outside the assignor's authorization → rejected; grant that would violate the last-platform-admin rule → rejected.

### C.3 Journey — Approve a Configuration Change (WEB-001 §C.5)

- **Entry Points:** Notification for a pending configuration approval; Configuration → Approvals (`MOD001-SCR-022`).
- **Primary Flow:** Administrator opens Configuration Key Detail (`MOD001-SCR-021`) → reviews scope, resolved value, and originating scope → acts via Configuration Override form (`MOD001-SCR-023`) or approves the pending change → `ConfigurationChanged` emits via `ENG-024`; change is audit-visible per `ADR-014`.
- **Offline / Online Transitions:** Approvals not submitted offline; retained locally as clearly pending submission until reconnected.
- **Exception Flows:** Scope conflict with parent-scope invariants → surfaced before publication; override outside author's scope → rejected.

### C.4 Journey — Review an Audit Event (WEB-001 §C.8)

- **Entry Points:** Audit Timeline (`MOD001-SCR-040`); deep link from any Platform master detail.
- **Primary Flow:** Auditor or Security Officer applies filters via the Audit Filter form (`MOD001-SCR-042`) → opens Audit Event Detail (`MOD001-SCR-041`) → optionally requests an export via `MOD001-SCR-043`. Content is consumed read-only from `ENG-004`; the surface never mutates audit state per Audit Ownership Convention.
- **Offline / Online Transitions:** Recently viewed events render read-only from cache with a "cached at" indicator; new queries require connectivity.
- **Exception Flows:** Access denied where audit visibility policy prohibits; retention-aged events surfaced as archived.

### C.5 Journey — Activate a Localization Pack (WEB-001 §C.6)

- **Entry Points:** Localization Packs list (`MOD001-SCR-030`); Tenant Detail (`MOD001-SCR-004`) → Localization.
- **Primary Flow:** Administrator opens Localization Pack Detail (`MOD001-SCR-031`) → activates via the Pack Activation form (`MOD001-SCR-032`) → Localization Pack Lifecycle Authority resolves inheritance and regional defaults → locale resolution applies to downstream reads via `ENG-018`.
- **Exception Flows:** Activation outside the activator's scope → rejected; conflicting regional defaults across parent scopes → surfaced before publication.

### C.6 Journey — Open and Close a Financial Year (WEB-001 §C.7)

- **Entry Points:** Organization Structure → Financial Years (`MOD001-SCR-008`).
- **Primary Flow:** Tenant or Company Administrator opens a Financial Year for a Company via the Financial Year form (`MOD001-SCR-009`) → close is executed only when all lifecycle preconditions declared by the Publication are met; `FinancialYearClosed` emits via `ENG-024` when applicable.
- **Exception Flows:** Close blocked by unresolved lifecycle preconditions declared by downstream modules → close rejected until resolved.

### C.7 Journey — Provision or Adjust a Tenant (WEB-001 §C.1)

- **Entry Points:** Tenants list (`MOD001-SCR-003`); Tenant Detail (`MOD001-SCR-004`).
- **Primary Flow:** Platform Administrator opens Tenant Lifecycle actions (`MOD001-SCR-005`) → captures the change → Tenancy Model Authority validates → `TenantProvisioned` (or the appropriate lifecycle event) emits via `ENG-024`.
- **Offline / Online Transitions:** Tenant lifecycle actions require connectivity; retained locally as pending submission until reconnected.
- **Exception Flows:** Duplicate identifier or scope conflict → surfaced before activation.

### C.8 Journey — Set Up Organization, Company, Branch (WEB-001 §C.2)

- **Entry Points:** Organizations list (`MOD001-SCR-006`); Company Detail (`MOD001-SCR-007`).
- **Primary Flow:** Tenant Administrator creates Organization / Company / Branch entries via the Org Structure form (`MOD001-SCR-050`); each entity honours the Organizational Hierarchy Lifecycle Authority; lifecycle signals emit via `ENG-024`.
- **Exception Flows:** A Company cannot be deleted while it has open Financial Years (per PRD §7 rule); violations surface validation feedback.

### C.9 Journey — Governance Conventions Read (WEB-001 §C.9)

- **Entry Points:** Governance surface (`MOD001-SCR-060`).
- **Primary Flow:** Any authorized administrator reviews the Event, Configuration, Localization, and Audit Ownership conventions currently in force — read-only.
- **Exception Flows:** None; the surface never permits mutation.

## D. Mobile Navigation

Navigation groups derive from Module Publication §3 (Approved Scope). Behaviour only — no visual designs.

### D.1 Bottom Navigation (Primary)

- **Home** — persona-appropriate landing surface with pending administrative tasks and recent audit-visible events.
- **Users** — Users, Roles, Permissions.
- **Config** — Configuration Keys, Scope Overrides, Effective Configuration.
- **Audit** — Timeline, Filters, Exports.
- **More** — Tenancy, Organization Structure, Localization, Governance, Notifications, Settings.

### D.2 Contextual / Drawer Navigation

The "More" drawer exposes Tenancy, Organization Structure, Localization Packs, Governance conventions, Notifications, and Settings. Deep links from `ENG-025` notifications target the appropriate detail screen.

## E. Screen Hierarchy & Inventory

Canonical screen inventory. Every screen carries a stable Screen ID per [`SCREEN_IDENTIFIER_STANDARD`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md) v1.0. Every Screen ID referenced elsewhere in this specification MUST resolve here.

### E.1 Home & Session

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-001` | Platform Administration Home | Active |
| `MOD001-SCR-002` | Scope Selector (Tenant / Organization / Company / Branch) | Active |

### E.2 Tenancy

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-003` | Tenants List | Active |
| `MOD001-SCR-004` | Tenant Detail | Active |
| `MOD001-SCR-005` | Tenant Lifecycle Action | Active |

### E.3 Organization Structure

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-006` | Organizations List | Active |
| `MOD001-SCR-007` | Company Detail | Active |
| `MOD001-SCR-008` | Financial Years List | Active |
| `MOD001-SCR-009` | Financial Year Form | Active |

### E.4 Users, Roles & Permissions

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-010` | Users List | Active |
| `MOD001-SCR-011` | User Detail | Active |
| `MOD001-SCR-012` | Invite User Form | Active |
| `MOD001-SCR-013` | Roles Catalog | Active |
| `MOD001-SCR-014` | Role Detail | Active |
| `MOD001-SCR-015` | Role Grant Form | Active |
| `MOD001-SCR-016` | Permissions Explorer (read-only) | Active |

### E.5 Configuration

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-020` | Configuration Keys List | Active |
| `MOD001-SCR-021` | Configuration Key Detail | Active |
| `MOD001-SCR-022` | Configuration Approvals Queue | Active |
| `MOD001-SCR-023` | Configuration Override Form | Active |
| `MOD001-SCR-024` | Effective Configuration Inspector | Active |

### E.6 Localization

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-030` | Localization Packs List | Active |
| `MOD001-SCR-031` | Localization Pack Detail | Active |
| `MOD001-SCR-032` | Pack Activation Form | Active |
| `MOD001-SCR-033` | Regional Defaults (read-only) | Active |

### E.7 Audit Review

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-040` | Audit Timeline | Active |
| `MOD001-SCR-041` | Audit Event Detail | Active |
| `MOD001-SCR-042` | Audit Filter Form | Active |
| `MOD001-SCR-043` | Audit Export Request | Active |

### E.8 Organization Structure — Authoring

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-050` | Organization / Company / Branch Form | Active |

### E.9 Governance & Settings

| Screen ID | Screen | Lifecycle |
| --- | --- | --- |
| `MOD001-SCR-060` | Governance Conventions (read-only) | Active |
| `MOD001-SCR-061` | Notifications | Active |
| `MOD001-SCR-062` | Notification Preferences | Active |
| `MOD001-SCR-063` | Settings & Session | Active |

## F. Mobile Forms

Every form is bound to a Screen in §E. Business fields, required / optional split, validation rules, and outcomes are derived from Module Publication §4 authorities.

### F.1 Invite User Form (`MOD001-SCR-012`)

- **Purpose:** Invite a user into a tenant scope.
- **Business Fields:** Email, display name, initial role selection, scope selection.
- **Required:** Email, initial role, scope.
- **Business Validation Rules:** Email uniqueness within tenant; scope must be within the inviter's authorization; role must be within the inviter's grant scope.
- **Submit Outcome:** `UserInvited` emits via `ENG-024`; notification dispatched via `ENG-006`.
- **Retry Outcome:** Not submitted offline; retained locally.

### F.2 Role Grant Form (`MOD001-SCR-015`)

- **Purpose:** Grant a Role to a User at a scope.
- **Business Fields:** User, Role, scope, optional time-box.
- **Required:** User, Role, scope.
- **Business Validation Rules:** Grant must be within the assignor's authorization; last-platform-admin rule enforced.
- **Submit Outcome:** `RoleGranted` emits via `ENG-024`; audit-visible per `ADR-014`.

### F.3 Configuration Override Form (`MOD001-SCR-023`)

- **Purpose:** Author or approve a configuration override at a scope.
- **Business Fields:** Configuration Key, target scope, proposed value, note.
- **Required:** Key, target scope, value.
- **Business Validation Rules:** Target scope must be within the author's authorization; parent-scope invariants respected; Effective Configuration Resolution Authority updates on publish.
- **Submit Outcome:** `ConfigurationChanged` emits via `ENG-024`.

### F.4 Pack Activation Form (`MOD001-SCR-032`)

- **Purpose:** Activate a Localization Pack at a scope.
- **Business Fields:** Pack reference, target scope, optional overrides of regional defaults.
- **Required:** Pack reference, target scope.
- **Business Validation Rules:** Activation scope within activator's authorization; conflicting parent-scope defaults surfaced.
- **Submit Outcome:** Locale resolution updates via `ENG-018`.

### F.5 Financial Year Form (`MOD001-SCR-009`)

- **Purpose:** Open, close, or reopen a Financial Year at Company scope.
- **Business Fields:** Company, period, action.
- **Business Validation Rules:** Close subject to lifecycle preconditions; reopen limited to the authority window.
- **Submit Outcome:** `FinancialYearClosed` (or the applicable lifecycle event) emits via `ENG-024`.

### F.6 Audit Filter Form (`MOD001-SCR-042`)

- **Purpose:** Apply filters to the Audit Timeline.
- **Business Fields:** Time range, actor, action, entity scope.
- **Business Validation Rules:** Selections within tenant / company / row scope; sensitive filters honour audit visibility policy.
- **Submit Outcome:** Timeline query applied immediately; not a state-changing action.

### F.7 Audit Export Request (`MOD001-SCR-043`)

- **Purpose:** Request an export of a filtered audit selection.
- **Business Fields:** Filter reference, export format (as exposed by `ENG-004`), delivery target.
- **Business Validation Rules:** Selection within audit visibility policy; export never mutates audit state.
- **Submit Outcome:** Export request routed via `ENG-004`; completion notification via `ENG-025`.

### F.8 Notification Preferences Form (`MOD001-SCR-062`)

- **Purpose:** Manage per-user notification preferences for Platform administrative categories exposed by `ENG-025`.
- **Business Fields:** Category, delivery preference.
- **Business Validation Rules:** Categories and preferences must be within the permitted set exposed by `ENG-025`.

### F.9 Org Structure Form (`MOD001-SCR-050`)

- **Purpose:** Author or edit Organization, Company, or Branch master entries.
- **Business Fields:** Entity type, name, parent scope, lifecycle status.
- **Business Validation Rules:** Organizational Hierarchy Lifecycle Authority enforced; deletion of Company blocked while any Financial Year is open.

### F.10 Tenant Lifecycle Action (`MOD001-SCR-005`)

- **Purpose:** Provision, suspend, or archive a tenant.
- **Business Fields:** Tenant reference, action, business justification.
- **Business Validation Rules:** Tenancy Model Authority validates; duplicate identifier rejected.

## G. Offline Behaviour & Synchronization

- **Cached Read Surfaces:** Recently viewed Tenant, Organization, Company, Branch, Financial Year, User, Role, Configuration Key, Localization Pack, and Audit Event records render read-only from cache with a "cached at" indicator.
- **Queued Actions:** Non-state-changing preference edits (`MOD001-SCR-062`) may be queued offline. All other authoring actions (invitations, grants, configuration changes, activations, tenant lifecycle actions) require connectivity and are retained locally as **pending submission** until reconnected.
- **Sign-Out:** Cache is cleared within the platform envelope on sign-out.
- **Conflict Handling:** On reconnect, submitted actions revalidate against the authoritative state; conflicts surface as an in-app resolution state and never silently overwrite.

## H. Authentication, Session & Notifications

- **Authentication:** Access requires authenticated identity per `ENG-001`. Biometric unlock is an entry convenience only; it does not substitute for the platform authentication mechanism. MOB-001 defines no authentication mechanics.
- **Session Awareness:** Active tenant / organization / company / branch is always displayed in a persistent session surface; session expiration is communicated before it interferes with an in-progress action.
- **Push Notifications:** Delivered exclusively via `ENG-025`. Deep links target the corresponding detail screen (User Detail, Configuration Key Detail, Audit Event Detail, Tenant Detail, Localization Pack Detail).

## I. Accessibility

Aligned to `ADR-081`. All actionable targets meet the platform accessibility baseline; state changes are announced; color-independent communication is required for lifecycle states, audit outcomes, offline / online state, and error states; localization is resolvable via `ENG-006` and `ENG-018`.

## J. Security Considerations

Derived from Module Publication §4 authorities and §11 engine / ADR consumption. No implementation mechanisms.

- **Tenant Isolation.** Cross-tenant navigation is not permitted per `ADR-011`; the resolved scope is always displayed.
- **Permission Resolution.** Screens, actions, and fields are gated by RBAC/ABAC per `ADR-032`.
- **Audit Visibility.** Every state-changing action is audit-visible per `ADR-014` via `ENG-004`.
- **Configuration Ownership.** Effective values and their originating scope are always inspectable.
- **Sensitive Data.** Sensitive-data redaction applies where the user lacks row-level access.
- **Cache Handling.** On-device cache stores only content the user was authorized to view at capture time; cache is cleared on sign-out.

## K. Traceability Matrix

Repository standard 5-column matrix per Verification Reporting Standard. Every MOD-001 capability appears at least once; every `Screen ID(s)` entry resolves to a Screen in §E (bidirectional consistency per `SCREEN_IDENTIFIER_STANDARD` §7 V3).

| MOD Capability | Screen ID(s) | Engine(s) | ADR(s) | Notes |
| --- | --- | --- | --- | --- |
| Tenancy Model Authority + Tenant Isolation Rule Authority | `MOD001-SCR-003`, `MOD001-SCR-004`, `MOD001-SCR-005` | ENG-001, ENG-024 | ADR-011, ADR-012 | Journey §C.7. Cross-tenant navigation prohibited. |
| Organization / Company / Branch / Financial Year Master + Hierarchy Lifecycle | `MOD001-SCR-006`, `MOD001-SCR-007`, `MOD001-SCR-008`, `MOD001-SCR-009`, `MOD001-SCR-050` | ENG-024 | ADR-012 | Journeys §C.6, §C.8. |
| User Master Authority | `MOD001-SCR-010`, `MOD001-SCR-011`, `MOD001-SCR-012` | ENG-001, ENG-006, ENG-024 | ADR-014, ADR-032 | Journey §C.1. `UserInvited` emits via ENG-024. |
| Role Master Authority + Permission Resolution Authority | `MOD001-SCR-013`, `MOD001-SCR-014`, `MOD001-SCR-015`, `MOD001-SCR-016` | ENG-001, ENG-024 | ADR-032, ADR-014 | Journey §C.2. Last-platform-admin rule enforced. |
| Configuration Hierarchy Authority + Effective Configuration Resolution Authority | `MOD001-SCR-020`, `MOD001-SCR-021`, `MOD001-SCR-022`, `MOD001-SCR-023`, `MOD001-SCR-024` | ENG-024 | ADR-014, ADR-051 | Journey §C.3. `ConfigurationChanged` emits via ENG-024. |
| Event Ownership Convention + Configuration Ownership Convention | `MOD001-SCR-060` | ENG-005, ENG-024 | ADR-051 | Read-only surface per Journey §C.9. |
| Localization Pack Master + Lifecycle + Localization Ownership Convention | `MOD001-SCR-030`, `MOD001-SCR-031`, `MOD001-SCR-032`, `MOD001-SCR-033`, `MOD001-SCR-060` | ENG-018, ENG-024 | ADR-014 | Journey §C.5. Locale resolution applies downstream via ENG-018. |
| Audit Review Surface Authority + Audit Ownership Convention | `MOD001-SCR-040`, `MOD001-SCR-041`, `MOD001-SCR-042`, `MOD001-SCR-043`, `MOD001-SCR-060` | ENG-004, ENG-025 | ADR-014 | Journey §C.4. Read-only; never mutates audit state. |
| Session, Notification & Preference Surface | `MOD001-SCR-001`, `MOD001-SCR-002`, `MOD001-SCR-061`, `MOD001-SCR-062`, `MOD001-SCR-063` | ENG-001, ENG-025 | ADR-011, ADR-032, ADR-081 | Cross-cutting mobile surface; no new business content. |

**Consistency Note.** No Screen ID referenced above is absent from §E, and every Screen defined in §E appears at least once in this matrix — satisfying §7 V3 of the Screen Identifier Standard. MOB-001 introduces no capability, master data entity, transaction, event, engine, or ADR beyond those declared by `MOD-001_MODULE_PUBLICATION`.

## L. Web / Mobile Parity Notes (deltas vs WEB-001)

- WEB-001 §D Menu Hierarchy is projected onto MOB-001 §D bottom navigation (Home / Users / Config / Audit / More).
- WEB-001 Journeys §C.1 (Provision Tenant) and §C.2 (Set Up Org Structure) are lower-frequency on mobile and surface via the "More" drawer rather than primary tabs.
- WEB-001 §C.9 Delegated Administration is intentionally deferred on mobile: only the resulting notification and read-only inspection are surfaced; complex authoring remains Web-primary.
- Localization Pack **authoring** remains Web-primary; MOB-001 exposes activation and read-only browse only.

## References

- [`docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`](../../30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md)
- [`docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md`](../web/WEB-001_PLATFORM_ADMINISTRATION.md) — consistency reference only.
- [`docs/15-governance/SCREEN_IDENTIFIER_STANDARD.md`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md)
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md`](../../15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)

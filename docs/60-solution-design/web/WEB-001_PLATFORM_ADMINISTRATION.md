---
title: "WEB-003 — Platform Administration Web Solution Design Specification"
summary: "Phase 3 Web Solution Design specification for MOD-001 Platform Administration. Derived exclusively from the Platform Administration Module Publication. Defines Web-surface personas, journeys, navigation, screen inventory, forms, collaboration, accessibility, localization, and user-facing security expectations. Introduces no new business requirements."
spec_id: "WEB-003"
family: "WEB"
source_module: "MOD-001"
source_module_name: "Platform Administration"
source_publication: "MOD-001_MODULE_PUBLICATION"
source_baseline: "MOD001_PLATFORM_BASELINE_v1"
source_module_prd: "docs/20-module-prds/platform/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-001-001", "SPR-MOD-001-002", "SPR-MOD-001-003", "SPR-MOD-001-004", "SPR-MOD-001-005", "SPR-MOD-001-006"]
related_mobile_spec: "MOB-003"
related_api_spec: "API-003"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Architecture Office"
layer: "platform"
updated: "2026-07-18"
tags: ["solution-design", "web", "phase-3", "WEB-003", "MOD-001", "platform-administration"]
document_type: "Web Solution Design Specification"
template: "SD-001_WEB_SPEC"
template_version: "v1.0"
governance_specification: "v1.0"
related_engines: ["ENG-001", "ENG-004", "ENG-005", "ENG-006", "ENG-018", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-032", "ADR-051"]
---

# WEB-003 — Platform Administration Web Solution Design Specification

> **Reference derivation only.** WEB-003 is a Web-surface projection of the Platform Administration Module Publication [`MOD-001_MODULE_PUBLICATION`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and WEB-003 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Web-surface user experience through which authorized administrators consume the Platform Administration capabilities published in `MOD-001_MODULE_PUBLICATION` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization pack lifecycle, and the audit review surface — while honouring the governance conventions (Event, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership) that bind every downstream business module.

### A.2 Scope

Web (desktop, tablet, mobile-browser responsive) surface covering:

- Tenancy administration — tenant identity, tenant lifecycle, tenant isolation surface.
- Organization structure administration — organizations, companies, branches, financial years, and their lifecycle.
- Users, roles, and permissions administration.
- Configuration Hierarchy administration — capture, inheritance, effective configuration resolution across system → tenant → organization → company → branch → user.
- Localization Pack administration — pack authoring, activation, inheritance, regional defaults, locale resolution.
- Audit Review surface — timeline, filtering, drill-down, and export over audit outputs owned by `ENG-004`.

Out of scope for WEB-003: mobile-native surfaces (belongs to MOB-003), API contracts (belongs to API-003), UI mockups, framework decisions, authentication mechanics (SSO, MFA, identity federation), SIEM integration, external monitoring, and any business-rule authoring.

### A.3 Source Published Module

- **Module ID / Name:** MOD-001 Platform Administration
- **Publication:** [`MOD-001_MODULE_PUBLICATION`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`](../../30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-001-001` … `SPR-MOD-001-006`

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-001 v1.0

### A.5 Design Principles

- **Publication-derived only.** Every WEB-003 element traces to a capability, authority, master entity, or convention in `MOD-001_MODULE_PUBLICATION`.
- **Tenant isolation always visible.** Every surface displays the resolved tenant / organization / company / branch scope and enforces isolation per `ADR-011`.
- **Effective configuration is transparent.** Every configuration surface reveals the resolved value and its originating scope in the hierarchy.
- **Audit is read-only.** The audit review surface consumes `ENG-004` outputs; it never mutates audit state.
- **Governance conventions are conveyed, not redefined.** Event Ownership, Configuration Ownership, Localization Ownership, and Audit Ownership are surfaced as informational context, never as editable rules.

### A.6 Business Boundary

WEB-003 covers only the Platform Administration bounded context. Business master data, transactions, and reports of downstream modules (MOD-002 … MOD-019) remain owned by those modules and are out of scope. Authentication mechanics, identity federation, SIEM integration, external monitoring, business intelligence workspaces (MOD-017), and alerting infrastructure beyond notification dispatch are explicitly out of scope per Publication §15.

### A.7 Traceability References

See §L for the complete feature-to-capability-to-sprint traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → WEB-003).

## B. Web Personas

Personas are inherited from the Module PRD §3 and the Module Publication; WEB-003 introduces no new roles. Concrete grants remain enforced by `ENG-002` / `ENG-003` (referenced via `ADR-032` RBAC + ABAC) as applicable at platform scope.

### B.1 Platform Administrator

- **Responsibilities:** Provision tenants; oversee tenant lifecycle and isolation; manage platform-level configuration defaults; oversee localization pack availability at platform scope.
- **Permissions (business-level):** Platform-scope authority over Tenant master, Configuration Hierarchy at system scope, Localization Pack master, and platform-level Audit Review.
- **Primary Web Scenarios:** Provision Tenant, Manage Tenant Lifecycle, Configure Platform-Scope Defaults, Publish Localization Pack.

### B.2 Tenant Administrator

- **Responsibilities:** Administer a single tenant — organization structure, users, roles, tenant-scope configuration, activated localization packs, tenant-scope audit review.
- **Permissions (business-level):** Tenant-scope authority over Organization / Company / Branch / Financial Year master, User master, Role master, tenant-scope Configuration entries, activated Localization Packs, and tenant-scope Audit Review.
- **Primary Web Scenarios:** Create Organization / Company / Branch, Open / Close Financial Year, Invite User, Grant Role, Configure Tenant Defaults, Activate Localization Pack, Review Tenant Audit Timeline.

### B.3 Company Administrator

- **Responsibilities:** Administer a company within a tenant — company-scope configuration overrides, branch-level structure, user assignments within company scope.
- **Permissions (business-level):** Company-scope authority over Company / Branch master, company-scope Configuration entries, and user-role assignments within company scope.
- **Primary Web Scenarios:** Maintain Company Master, Maintain Branch Master, Override Company-Scope Configuration, Assign Users to Company Roles.

### B.4 Auditor

- **Responsibilities:** Verify audit-visible history for Platform Administration — Tenant, Organization, User, Role, Configuration, and Localization Pack lifecycle events; timeline continuity; export integrity.
- **Permissions (business-level):** Read-only access to Platform audit-visible surfaces within scope per `ADR-014`; no mutation rights.
- **Primary Web Scenarios:** Open Audit Timeline, Filter Audit Events, Drill-down to Event Detail, Export Audit Selection.

### B.5 Security Officer

- **Responsibilities:** Oversee tenant isolation posture, permission grants, and configuration/localization ownership boundaries; review sensitive administrative activity via the audit surface.
- **Permissions (business-level):** Read-only oversight over Role master, Permission resolution outcomes, Configuration Hierarchy resolution, and Audit Review within scope; no mutation of Platform master data.
- **Primary Web Scenarios:** Review Role Grants, Review Effective Configuration for Sensitive Keys, Review Audit Timeline for Administrative Actions.

### B.6 External Actors (surfaced only where the Publication permits)

- **Identity Provider / Directory Service:** Referenced by the User surface as external synchronization sources; WEB-003 defines no authentication mechanics per Publication §15.
- **Support:** Read-only observer surface (where activated) subject to tenant-isolation and audit-visibility rules.

## C. Web User Journeys

Every journey is derived from a capability in Module Publication §3 and an authority in Publication §4. WEB-003 defines Web-surface flows only; business rules, state legality, and authorization are owned by the Module Publication and enforced by platform engines.

### C.1 Journey — Provision a Tenant

- **Entry Points:** Platform Administrator area → Tenants → New Tenant.
- **Primary Flow:** Platform Administrator captures Tenant master fields → validates against Tenancy Model Authority → tenant provisioned in `Draft`; upon activation the Tenant Isolation Rule Authority applies to all subsequent access; `TenantProvisioned` emits via `ENG-024` (Event Ownership Convention).
- **Alternate Flows:** Suspend or archive a tenant per lifecycle authority; copy platform-scope defaults into the new tenant scope.
- **Interruption / Resume:** Draft tenants persist within the Platform Administrator's scope; resuming does not re-emit lifecycle events.
- **Exception Flows:** Duplicate tenant identifier → validation feedback; scope conflict with platform-scope configuration → surfaced before activation.

### C.2 Journey — Set Up Organization, Company, Branch, and Financial Year

- **Entry Points:** Tenant Administrator area → Organization Structure.
- **Primary Flow:** Tenant Administrator creates Organization → creates Companies within Organization → creates Branches within Companies → opens Financial Year at Company scope; each entity honours the Organizational Hierarchy Lifecycle Authority; `CompanyCreated` and related lifecycle signals emit via `ENG-024`.
- **Alternate Flows:** Deactivate a Branch; close a Financial Year; archive an Organization no longer in use (subject to lifecycle rules).
- **Interruption / Resume:** Draft entries persist per author within tenant scope.
- **Exception Flows:** A Company cannot be deleted while it has open Financial Years (per PRD §7 rule); attempted violation surfaces validation feedback.

### C.3 Journey — Invite a User and Deactivate a User

- **Entry Points:** Users, Roles & Permissions area → Users → Invite User; existing user detail → Deactivate.
- **Primary Flow:** Tenant Administrator captures User master fields (business-level) → invitation dispatches via `ENG-006` (Notification Engine) → user assumes User Master lifecycle → `UserInvited` emits via `ENG-024`. Deactivation follows the User Master Authority; audit-visible per `ADR-014`.
- **Alternate Flows:** Resend invitation; reassign role at a lower scope; suspend rather than deactivate.
- **Interruption / Resume:** Pending invitations persist across sessions.
- **Exception Flows:** Attempted self-revocation of the last platform-admin role in a tenant is rejected (per PRD §7 rule).

### C.4 Journey — Grant and Revoke a Role

- **Entry Points:** Users → User Detail → Roles; Roles catalog → Role Detail → Members.
- **Primary Flow:** Tenant Administrator or Company Administrator (within scope) selects a Role → grants to a User at a scope → Permission Resolution Authority (per `ADR-032`) evaluates the grant; `RoleGranted` emits via `ENG-024`. Revocation follows the same authority and is audit-visible per `ADR-014`.
- **Alternate Flows:** Grant a Role at a lower scope override; time-boxed grant (where a Role master permits it).
- **Interruption / Resume:** Draft grant selections persist within the assignor's session.
- **Exception Flows:** Grant outside the assignor's authorization scope → rejected; attempted grant that would violate the last-platform-admin rule → rejected.

### C.5 Journey — Change Configuration with Audit

- **Entry Points:** Configuration area → Configuration Keys → Key Detail; scope selector for tenant / organization / company / branch / user.
- **Primary Flow:** Administrator selects a Configuration Key → selects the scope in the hierarchy → captures the new value → the Configuration Hierarchy Authority persists the entry versioned and tenant-scoped → the Effective Configuration Resolution Authority updates resolved values for downstream reads → `ConfigurationChanged` emits via `ENG-024`; the change is audit-visible per `ADR-014`.
- **Alternate Flows:** Inherit from parent scope (delete override); preview effective value before publishing; compare scope-level values.
- **Interruption / Resume:** Draft overrides persist per author within scope.
- **Exception Flows:** Scope conflict with parent-scope invariants → surfaced before publication; attempted override outside the author's scope → rejected.

### C.6 Journey — Activate and Inherit a Localization Pack

- **Entry Points:** Localization → Localization Packs; Tenant Detail → Localization.
- **Primary Flow:** Platform Administrator publishes a Localization Pack Master entry → Tenant Administrator activates the pack within tenant scope → the Localization Pack Lifecycle Authority resolves inheritance and regional defaults → locale resolution applies to downstream reads via `ENG-018` (Localization Engine).
- **Alternate Flows:** Override regional defaults at a lower scope; deactivate a pack; archive an unused pack.
- **Interruption / Resume:** Activation status persists per tenant.
- **Exception Flows:** Pack activation outside the activator's scope → rejected; conflicting locale defaults across parent scopes → surfaced before publication.

### C.7 Journey — Open and Close a Financial Year

- **Entry Points:** Organization Structure → Financial Years.
- **Primary Flow:** Tenant or Company Administrator opens a Financial Year for a Company → Financial-year lifecycle follows the Organization Structure authority → close is executed only when all lifecycle preconditions declared by the Publication are met; `FinancialYearClosed` emits via `ENG-024` when applicable.
- **Alternate Flows:** Reopen a recently closed Financial Year within the authority window; roll defaults to the next Financial Year.
- **Interruption / Resume:** Pending lifecycle selections persist within the administrator's session.
- **Exception Flows:** Close blocked by unresolved lifecycle preconditions declared by downstream modules (out-of-scope to enumerate here) → close rejected until resolved.

### C.8 Journey — Review the Audit Timeline

- **Entry Points:** Audit Review → Timeline; deep links from any Platform master or transaction detail.
- **Primary Flow:** Auditor or Security Officer opens the Audit Review surface → applies scope, actor, action, and time filters → drills into an event detail → optionally exports a filtered selection. Audit content is consumed read-only from `ENG-004`; the surface never mutates audit state per Audit Ownership Convention.
- **Alternate Flows:** Bookmark a filter set; share a filter set within tenant scope; open source entity detail from an event.
- **Interruption / Resume:** Filter state persists across sessions for the auditor within scope.
- **Exception Flows:** Access denied where audit visibility policy prohibits; retention-aged events surfaced as archived.

### C.9 Journey — Delegated Administration

- **Entry Points:** Users → User Detail → Delegated Administration; Roles → Role Detail → Delegates.
- **Primary Flow:** A scope-appropriate administrator delegates a subset of administrative capability within their scope → delegation follows the Permission Resolution Authority per `ADR-032` → notifications route via `ENG-006`; audit-visible per `ADR-014`.
- **Alternate Flows:** Revoke delegation; time-box delegation.
- **Exception Flows:** Delegation beyond the delegator's authorization → rejected.

## D. Menu Hierarchy

Derived strictly from Publication §3 (Approved Scope), which enumerates the Platform Administration areas.

### D.1 Application Areas

- **Platform Administration Home** — persona-appropriate landing surface with scope selector, pending administrative tasks, and recent audit-visible events.
- **Tenancy** — Tenant master, tenant lifecycle, tenant isolation surface.
- **Organization Structure** — Organizations, Companies, Branches, Financial Years.
- **Users, Roles & Permissions** — User master, Role master, Permission resolution surface.
- **Configuration** — Configuration Keys, scope-based overrides, Effective Configuration resolution.
- **Localization** — Localization Pack master and lifecycle.
- **Audit Review** — Timeline, filters, drill-down, export.
- **Governance** — read-only surface displaying Event Ownership, Configuration Ownership, Localization Ownership, and Audit Ownership conventions in force.

### D.2 Menu Hierarchy

```text
Platform Administration
├── Home
├── Tenancy
│   ├── Tenants
│   └── Tenant Lifecycle
├── Organization Structure
│   ├── Organizations
│   ├── Companies
│   ├── Branches
│   └── Financial Years
├── Users, Roles & Permissions
│   ├── Users
│   ├── Roles
│   └── Permissions
├── Configuration
│   ├── Configuration Keys
│   ├── Scope Overrides
│   └── Effective Configuration
├── Localization
│   ├── Localization Packs
│   ├── Pack Activation
│   └── Regional Defaults
├── Audit Review
│   ├── Timeline
│   ├── Filters
│   └── Exports
└── Governance
    ├── Event Ownership
    ├── Configuration Ownership
    ├── Localization Ownership
    └── Audit Ownership
```

### D.3 Deep-Link Entry Points

Direct links resolve to: a Tenant detail, an Organization detail, a Company detail, a Branch detail, a Financial Year detail, a User detail, a Role detail, a Configuration Key detail (with scope), a Localization Pack detail, an Audit Event detail, and any Governance convention read surface. Every deep-link is re-evaluated against the caller's authorization on resolution.

### D.4 Breadcrumbs

Breadcrumbs mirror the menu hierarchy and always root at "Platform Administration". Entity detail surfaces append the entity's business name and, where applicable, the resolved scope (for example `Platform Administration / Configuration / Configuration Keys / default.locale / Tenant: Acme`).

### D.5 Back-Navigation Behaviour

Back-navigation returns to the prior surface preserving scope, filter, and pagination selections. Back-navigation from an Audit Event detail returns to the Audit Timeline with filters intact.

### D.6 Cross-Module Navigation

Drill-downs into downstream module surfaces (for example from a Company detail to a downstream module transaction) surrender control to that module's own surface and its own authorization. Platform Administration never mutates downstream module master data or transactions.

## E. Screen Inventory

Each entry: purpose, business capability, primary actions, displayed business information, navigation relationships. Derived from the capabilities, master data, and transactions declared in the Module Publication. Visual mockups are out of scope.

### E.1 Platform Administration Home

- **Purpose:** Persona-appropriate landing surface for Platform Administration.
- **Business Capability:** Cross-area overview (Publication §3).
- **Primary Actions:** Open Tenants, Open Users, Open Configuration, Open Audit Review.
- **Displayed Business Information:** Resolved scope, pending administrative tasks within scope, recent audit-visible events within scope.
- **Relationships:** Entry point to all §D application areas.

### E.2 Tenants Catalog

- **Purpose:** Browse Tenant master entries at platform scope.
- **Business Capability:** Tenancy Model Authority (Publication §4.1).
- **Primary Actions:** New Tenant, Open, Suspend, Archive.
- **Displayed Business Information:** Tenant identifier, business name, lifecycle state, activation date, isolation posture indicator.
- **Relationships:** Opens Tenant Detail (§E.3).

### E.3 Tenant Detail

- **Purpose:** Read and administer a single Tenant.
- **Business Capability:** Tenancy Model Authority; Tenant Isolation Rule Authority (Publication §4.1).
- **Primary Actions:** Edit, Suspend, Archive, Activate, Open Tenant Localization, Open Tenant Configuration.
- **Displayed Business Information:** Tenant master fields, lifecycle history, isolation indicators, associated Organizations, active Localization Packs, tenant-scope Configuration summary.
- **Relationships:** Organizations Catalog (§E.5); Localization Pack Activation (§E.16); Configuration Keys (§E.12).

### E.4 Tenant Lifecycle Timeline

- **Purpose:** Read-only lifecycle history for a Tenant.
- **Business Capability:** Tenancy Model Authority; audit visibility per `ADR-014` (Publication §4.1, §11).
- **Primary Actions:** Filter, drill into event.
- **Displayed Business Information:** Lifecycle events (`TenantProvisioned`, activation, suspension, archival).
- **Relationships:** Audit Event Detail (§E.20).

### E.5 Organizations Catalog and Detail

- **Purpose:** Browse and manage Organization master.
- **Business Capability:** Organization Master Authority; Organizational Hierarchy Lifecycle Authority (Publication §4.2).
- **Primary Actions:** New, Open, Edit, Deactivate, Archive.
- **Displayed Business Information:** Organization identifier, name, associated Companies, lifecycle state.
- **Relationships:** Companies Catalog (§E.6).

### E.6 Companies Catalog and Detail

- **Purpose:** Browse and manage Company master within an Organization.
- **Business Capability:** Company Master Authority; Organizational Hierarchy Lifecycle Authority (Publication §4.2).
- **Primary Actions:** New, Open, Edit, Deactivate, Archive; Open Financial Years.
- **Displayed Business Information:** Company identifier, business name, parent Organization, active Financial Year, lifecycle state.
- **Relationships:** Branches Catalog (§E.7); Financial Years Catalog (§E.8).

### E.7 Branches Catalog and Detail

- **Purpose:** Browse and manage Branch master within a Company.
- **Business Capability:** Branch Master Authority; Organizational Hierarchy Lifecycle Authority (Publication §4.2).
- **Primary Actions:** New, Open, Edit, Deactivate, Archive.
- **Displayed Business Information:** Branch identifier, name, parent Company, lifecycle state.
- **Relationships:** Company Detail (§E.6).

### E.8 Financial Years Catalog and Detail

- **Purpose:** Browse and manage Financial Year master per Company.
- **Business Capability:** Financial Year Master Authority (Publication §4.2).
- **Primary Actions:** Open, Close, Reopen (within authority window), Edit calendar boundaries.
- **Displayed Business Information:** Financial Year identifier, period bounds, lifecycle state, close preconditions summary.
- **Relationships:** Company Detail (§E.6); Audit Timeline (§E.19).

### E.9 Users Catalog and Detail

- **Purpose:** Browse and manage User master within tenant / company scope.
- **Business Capability:** User Master Authority (Publication §4.3).
- **Primary Actions:** Invite, Open, Edit, Deactivate, Reactivate.
- **Displayed Business Information:** User identifier, business name, tenant / company scope, lifecycle state, active Roles, delegated capabilities.
- **Relationships:** Role Detail (§E.10); Delegated Administration (§E.11); Audit Timeline (§E.19).

### E.10 Roles Catalog and Detail

- **Purpose:** Browse and manage Role master and grants.
- **Business Capability:** Role Master Authority; Permission Resolution Authority per `ADR-032` (Publication §4.3).
- **Primary Actions:** New, Open, Edit, Grant to User, Revoke, Deactivate.
- **Displayed Business Information:** Role identifier, name, business purpose, permission composition (business-level), current members within scope.
- **Relationships:** User Detail (§E.9).

### E.11 Delegated Administration

- **Purpose:** Manage scope-bound delegated administrative capability.
- **Business Capability:** Permission Resolution Authority (Publication §4.3); delegated administration per `ADR-032`.
- **Primary Actions:** Create Delegation, Revoke, Time-box.
- **Displayed Business Information:** Delegator, delegate, scope, active window, audit indicator.
- **Relationships:** User Detail (§E.9); Audit Timeline (§E.19).

### E.12 Configuration Keys Catalog

- **Purpose:** Browse Configuration Key master and their scope overrides.
- **Business Capability:** Configuration Hierarchy Authority (Publication §4.4).
- **Primary Actions:** Open Key, Filter by scope, Open Effective Configuration.
- **Displayed Business Information:** Configuration Key identifier, description, ownership convention indicator, override count by scope.
- **Relationships:** Configuration Key Detail (§E.13); Effective Configuration (§E.14).

### E.13 Configuration Key Detail (Scope-Aware)

- **Purpose:** Read and edit Configuration values across the scope hierarchy.
- **Business Capability:** Configuration Hierarchy Authority; Configuration Ownership Convention Authority (Publication §4.4).
- **Primary Actions:** Edit at Scope, Inherit From Parent, Publish, Withdraw Draft, Preview Effective Value.
- **Displayed Business Information:** Value per scope, resolved originating scope, versioned change history, ownership indicator.
- **Relationships:** Effective Configuration (§E.14); Audit Timeline (§E.19).

### E.14 Effective Configuration

- **Purpose:** Present the resolved configuration value for a caller-selected scope.
- **Business Capability:** Effective Configuration Resolution Authority (Publication §4.4).
- **Primary Actions:** Select scope, Compare with parent, Copy resolved value link.
- **Displayed Business Information:** Resolved value, resolving scope, upstream overrides in the chain.
- **Relationships:** Configuration Key Detail (§E.13).

### E.15 Localization Packs Catalog and Detail

- **Purpose:** Browse and manage Localization Pack master.
- **Business Capability:** Localization Pack Master Authority; Localization Ownership Convention Authority (Publication §4.5).
- **Primary Actions:** New, Edit, Publish, Deactivate, Archive.
- **Displayed Business Information:** Pack identifier, locales covered, ownership convention indicator, lifecycle state.
- **Relationships:** Pack Activation (§E.16); Regional Defaults (§E.17).

### E.16 Pack Activation

- **Purpose:** Activate and inherit Localization Packs at a scope.
- **Business Capability:** Localization Pack Lifecycle Authority (Publication §4.5).
- **Primary Actions:** Activate, Deactivate, Inherit From Parent, Preview Locale Resolution.
- **Displayed Business Information:** Active packs by scope, inheritance chain, resolved locale defaults.
- **Relationships:** Localization Pack Detail (§E.15); Regional Defaults (§E.17).

### E.17 Regional Defaults

- **Purpose:** Read-only surface presenting resolved regional defaults for a scope.
- **Business Capability:** Localization Pack Lifecycle Authority (Publication §4.5).
- **Primary Actions:** Filter, Compare with parent.
- **Displayed Business Information:** Resolved defaults (locale, currency, date format, number format — as declared by the Pack master), originating scope per entry.
- **Relationships:** Pack Activation (§E.16).

### E.18 Governance Conventions

- **Purpose:** Present the governance conventions in force for the tenant.
- **Business Capability:** Event Ownership, Configuration Ownership, Localization Ownership, Audit Ownership Convention Authorities (Publication §4.4, §4.5, §4.6).
- **Primary Actions:** Open Convention read view.
- **Displayed Business Information:** Textual restatement of each convention, references to source publication section.
- **Relationships:** Read-only surfaces only.

### E.19 Audit Review Timeline

- **Purpose:** Present the audit-visible timeline for Platform events within scope.
- **Business Capability:** Audit Review Surface Authority; Audit Ownership Convention Authority (Publication §4.6).
- **Primary Actions:** Filter by scope / actor / action / time; open event detail; export selection.
- **Displayed Business Information:** Ordered audit events, actor, action, scope, timestamp, source entity reference.
- **Relationships:** Audit Event Detail (§E.20); every Platform detail surface (§E.3, §E.5–§E.17).

### E.20 Audit Event Detail

- **Purpose:** Read a single audit-visible event.
- **Business Capability:** Audit Review Surface Authority; audit visibility per `ADR-014` (Publication §4.6, §11).
- **Primary Actions:** Open source entity, add to export selection.
- **Displayed Business Information:** Actor, action, scope, timestamp, source entity, event payload summary (business-level, read-only).
- **Relationships:** Source entity detail; Audit Timeline (§E.19).

### E.21 Audit Export Workbench

- **Purpose:** Manage export selections of audit events per Audit Review Surface Authority.
- **Business Capability:** Audit Review Surface Authority (Publication §4.6).
- **Primary Actions:** Assemble selection, submit export, download completed export.
- **Displayed Business Information:** Selection contents, export status, retention indicator.
- **Relationships:** Audit Timeline (§E.19); Audit Event Detail (§E.20).

## F. Forms & User Interactions

Every form derives its fields from the Master Data and Governance Convention authorities declared in Module Publication §4 and §7. Validation is business-level; technical validation is out of scope.

### F.1 Tenant Form

- **Purpose:** Create / edit a Tenant.
- **Business Fields:** Tenant identifier, business name, description, isolation posture selector, ownership contact, lifecycle state.
- **Required vs Optional:** Identifier, business name, isolation posture required; description, ownership contact optional.
- **Business Validation Rules:** Identifier unique at platform scope; isolation posture consistent with Tenant Isolation Rule Authority per `ADR-011`.
- **User Actions:** Save Draft, Activate, Suspend, Archive.
- **Submit Outcome:** Tenant persisted; `TenantProvisioned` emits via `ENG-024` on activation.
- **Cancel / Retry Outcome:** Draft preserved; retry surfaces last validation feedback.

### F.2 Organization / Company / Branch Form

- **Purpose:** Create / edit an Organization, Company, or Branch entry.
- **Business Fields:** Identifier, business name, description, parent reference (Organization → Company → Branch), lifecycle state.
- **Required vs Optional:** Identifier, business name, parent (except Organization root) required; description optional.
- **Business Validation Rules:** Identifier unique within parent scope; hierarchy consistent with Organizational Hierarchy Lifecycle Authority; a Company cannot be deleted while it has open Financial Years.
- **User Actions:** Save Draft, Activate, Deactivate, Archive.
- **Submit Outcome:** Entity persisted; lifecycle signals emit via `ENG-024` where applicable.
- **Cancel / Retry Outcome:** Draft preserved.

### F.3 Financial Year Form

- **Purpose:** Open / edit a Financial Year for a Company.
- **Business Fields:** Financial Year identifier, period bounds (start, end), Company reference, business calendar notes.
- **Required vs Optional:** Identifier, period bounds, Company reference required; notes optional.
- **Business Validation Rules:** Period bounds non-overlapping with existing open Financial Years for the Company; close preconditions must all be satisfied to permit close.
- **User Actions:** Open, Close, Reopen (within authority window).
- **Submit Outcome:** Financial Year persisted; `FinancialYearClosed` emits via `ENG-024` on close.
- **Cancel / Retry Outcome:** Draft preserved.

### F.4 User Invitation Form

- **Purpose:** Invite a User into a tenant / company scope.
- **Business Fields:** Business name, business contact reference, initial scope, initial Role assignments (optional).
- **Required vs Optional:** Business name, business contact reference, initial scope required; initial Role assignments optional.
- **Business Validation Rules:** Scope must be within the inviter's authorization; initial Roles must be within the inviter's authorization.
- **User Actions:** Send Invitation, Save Draft, Cancel.
- **Submit Outcome:** Invitation dispatched via `ENG-006`; `UserInvited` emits via `ENG-024`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.5 Role Grant Form

- **Purpose:** Grant / revoke a Role at a scope.
- **Business Fields:** Role reference, User reference, scope, time-box (optional).
- **Required vs Optional:** Role, User, scope required; time-box optional.
- **Business Validation Rules:** Grant within the assignor's authorization per `ADR-032`; the last-platform-admin invariant is enforced.
- **User Actions:** Grant, Revoke, Cancel.
- **Submit Outcome:** Grant persisted; `RoleGranted` emits via `ENG-024`; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.6 Role Master Form

- **Purpose:** Author / edit a Role master entry.
- **Business Fields:** Role identifier, name, business purpose, permission composition (business-level), ownership, lifecycle state.
- **Required vs Optional:** Identifier, name, permission composition required; description optional.
- **Business Validation Rules:** Permission composition resolvable by the Permission Resolution Authority; identifier unique in scope.
- **User Actions:** Save Draft, Activate, Deactivate, Archive.
- **Submit Outcome:** Role persisted; downstream permission resolution updated.
- **Cancel / Retry Outcome:** Draft preserved.

### F.7 Configuration Change Form (Scope-Aware)

- **Purpose:** Capture a configuration value at a scope in the hierarchy.
- **Business Fields:** Configuration Key reference, scope (system / tenant / organization / company / branch / user), value (business-level), effective-from indicator, reason (optional).
- **Required vs Optional:** Key, scope, value required; reason optional at Draft.
- **Business Validation Rules:** Scope must be within the author's authorization; value must respect the Key's declared ownership convention; parent-scope invariants are honoured.
- **User Actions:** Save Draft, Preview Effective Value, Publish, Withdraw.
- **Submit Outcome:** Entry versioned and persisted; `ConfigurationChanged` emits via `ENG-024`; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved; retry surfaces validation feedback.

### F.8 Localization Pack Master Form

- **Purpose:** Author / edit a Localization Pack master entry.
- **Business Fields:** Pack identifier, name, description, locales covered, regional defaults, ownership convention indicator, lifecycle state.
- **Required vs Optional:** Identifier, locales covered, regional defaults required; description optional.
- **Business Validation Rules:** Locales unique within pack; regional defaults consistent with Localization Ownership Convention.
- **User Actions:** Save Draft, Publish, Deactivate, Archive.
- **Submit Outcome:** Pack persisted; publication signals emit via `ENG-024`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.9 Localization Pack Activation Form

- **Purpose:** Activate / deactivate a Localization Pack at a scope.
- **Business Fields:** Pack reference, scope, inheritance selection, effective-from indicator.
- **Required vs Optional:** Pack, scope required; inheritance selection optional (defaults to inherit from parent).
- **Business Validation Rules:** Scope within activator's authorization; parent-scope inheritance honoured.
- **User Actions:** Activate, Deactivate, Preview Locale Resolution.
- **Submit Outcome:** Activation persisted; downstream locale resolution updated via `ENG-018`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.10 Audit Export Selection Form

- **Purpose:** Assemble an audit export selection.
- **Business Fields:** Selection criteria (scope, actor, action, time range), export label, retention preference.
- **Required vs Optional:** Selection criteria required; label optional.
- **Business Validation Rules:** Selection must fall within the requester's audit-visibility scope per `ADR-014`; export retention consistent with Audit Ownership Convention.
- **User Actions:** Assemble, Submit Export, Cancel.
- **Submit Outcome:** Export request submitted through the Audit Review Surface Authority; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

## G. Collaboration

Collaboration is supported only where the Module Publication permits it. WEB-003 introduces no new collaboration surfaces beyond those authorized by Publication §4.

- **Shared Administration:** Tenancy, Organization Structure, Users/Roles, Configuration, and Localization surfaces are tenant-scoped shared workspaces for the administrator personas. Concurrent edits surface as validation-time conflict indicators; there is no free-form co-editing beyond scope-permitted draft handoffs.
- **Delegated Administration:** Delegation of scope-bound administrative capability is available where the Permission Resolution Authority permits (§E.11). Delegations are audit-visible per `ADR-014`.
- **Approval Interactions:** WEB-003 does not introduce an approval workflow surface. Where downstream modules require approvals, they own that surface. The Configuration Change lifecycle and Localization Pack lifecycle operate under the Configuration Ownership and Localization Ownership conventions rather than a multi-step Web approval flow.
- **Notifications:** User invitations, role changes, delegation changes, and localization activation notifications route via `ENG-006` (Notification Engine) as declared in Publication §11.
- **Audit Participation:** Every collaboration action (grant, revocation, delegation, configuration publish, pack activation) is audit-visible per `ADR-014` via `ENG-004`.
- **Handoff:** Draft state persists per author within scope; back-navigation and deep-links preserve scope and filter state so administrators can hand off drafts within a scope-authorized team.

## H. Accessibility

Aligned to `ADR-081` (Accessibility Standard) as referenced by the Publication's ADR set. No implementation guidance; objectives only.

- **Keyboard Navigation:** Every action reachable via keyboard alone. Escape returns focus predictably from Tenant Detail, Configuration Key Detail, Localization Pack Detail, and Audit Event Detail surfaces.
- **Focus Management:** Focus lands on the primary editable field after opening a form; focus lands on the resolved-value display after Preview Effective Value; focus indicators are always visible.
- **Screen Reader Compatibility:** All interactive elements have accessible names; scope changes, resolution outcomes, lifecycle transitions, and audit event details are announced.
- **Color-Independent Communication:** Lifecycle state (Draft / Active / Inactive / Archived), scope indicators, effective-configuration originating scope, and audit event categories are communicated by more than color alone (icon + text label).
- **Responsive Behaviour:** Catalogs (Tenants, Organizations, Users, Roles, Configuration Keys, Localization Packs, Audit Timeline) reflow across desktop, tablet, and mobile browser widths without loss of content or actions. Complex authoring (multi-scope Configuration change, Pack authoring) may be deferred to larger widths.
- **Localization:** All labels resolvable via `ENG-018` (Localization Engine); layout tolerates text expansion.

Mobile-native experiences (offline, push, camera, device capabilities) are out of scope for WEB-003 and belong to MOB-003.

## I. Localization

Derived from the Localization Pack Master Authority and Localization Pack Lifecycle Authority (Publication §4.5).

- **Locale Resolution:** All Web surfaces resolve locale via `ENG-018` under the Localization Pack Lifecycle Authority. The resolved locale is displayed alongside the scope indicator.
- **Regional Defaults:** Number, date, and currency formats surface as read-only indicators wherever the Publication's Regional Defaults apply; users cannot mutate defaults outside the Pack Activation surface at scope.
- **Pack Activation Feedback:** After a Localization Pack activation, all subsequent Web reads reflect the updated resolution; drafts in progress display an indicator that the resolution has changed.
- **Inheritance Transparency:** The Regional Defaults screen (§E.17) reveals the originating scope for each resolved default.
- **No Regional Behaviour Beyond the Publication:** WEB-003 introduces no country-specific rules; regional behaviour is entirely governed by the activated Localization Pack.

## J. Security & Authorization

User-facing security expectations derived from Module Publication §4 authorities and §11 engine / ADR consumption. No authentication implementation.

### J.1 Authentication Entry Points

- Access to Platform Administration requires authenticated identity per `ENG-001`. Unauthenticated navigation is redirected to the platform-level sign-in surface. WEB-003 does not define authentication mechanics per Publication §15 (SSO, MFA, identity federation are out of scope).

### J.2 Authorization Visibility

- Menus, actions, and detail fields are gated per `ADR-032` (RBAC + ABAC) as declared in the Publication's ADR set. Users see only entities within their tenant, organization, company, branch, and row-level scope.
- The Permission Resolution Authority (Publication §4.3) governs every grant, revocation, and delegation decision; the resolved permission set is inspectable by the actor within their scope.

### J.3 Tenant Isolation

- All catalogs and detail surfaces honour tenant isolation per `ADR-011`. Cross-tenant navigation, sharing, and lookup are not offered. Deep-links are re-evaluated against the caller's tenant scope on resolution.

### J.4 Administrative Permissions

- The last-platform-admin invariant (per PRD §7 rule) is surfaced as a hard validation on Role revocation and User deactivation surfaces.
- Delegated Administration honours the delegator's scope; a delegate cannot exceed the delegator's authorization.

### J.5 Configuration & Localization Ownership Boundaries

- The Configuration Ownership Convention Authority and Localization Ownership Convention Authority (Publication §4.4, §4.5) are surfaced as read-only indicators on each Configuration Key and Localization Pack. Users cannot override an entry outside the declared ownership without an authorized scope override.

### J.6 Audit Visibility

- Every state-changing action (`TenantProvisioned`, `CompanyCreated`, `FinancialYearClosed`, `UserInvited`, `RoleGranted`, `ConfigurationChanged`, and Localization activation lifecycle) is audit-visible per `ADR-014` via `ENG-004`.
- Audit content is consumed read-only through the Audit Review surface (§E.19–§E.21). The surface never mutates audit state — Audit Ownership Convention Authority preserves `ENG-004` as the sole authoritative owner of audit collection, storage, integrity, and lifecycle.

### J.7 Secure Handling of Business Information

- The Web surface never offers actions that mutate downstream module master data or transactions from within Platform Administration. Drill-down into a downstream module surface surrenders control to that module's own surface and its own authorization.
- Event delivery infrastructure is owned by `ENG-024`; Platform emits infrastructure-level events under the Event Ownership Convention without surfacing event bus internals to end users.

## K. Cross-Platform Alignment

WEB-003 aligns with the planned Mobile (MOB-003) and API (API-003) specifications derived from the same Module Publication.

- **MOB-003 (planned):** Personas, entity vocabulary, lifecycle states, scope hierarchy, and audit visibility are intended to remain consistent with WEB-003. Mobile-native concerns (offline, push, camera, device capabilities) belong to MOB-003 and are out of scope here.
- **API-003 (planned):** Business capabilities exposed by WEB-003 (Tenant, Organization, Company, Branch, Financial Year, User, Role, Permission, Configuration Key, Localization Pack, Audit Review) are intended to be exposed consistently to API consumers, subject to the same authorities and governance conventions. Endpoint contracts, transport, and payload schemas remain out of scope for WEB-003.
- **Consistency Rules:** All three surfaces share the same source authorities; any divergence must be reconciled at the Module Publication level, not at a family specification.

## L. Traceability Matrix

Every WEB-003 feature maps to a Module Publication capability and one or more originating Sprints. Every row resolves to `MOD-001_MODULE_PUBLICATION`.

| Publication Section | Business Capability | Source Sprint | WEB Section | Planned MOB Section | Planned API Section |
| --- | --- | --- | --- | --- | --- |
| §3, §4.1 | Tenancy Model Authority; Tenant Isolation Rule Authority | SPR-MOD-001-001 | §C.1, §E.2–§E.4, §F.1 | MOB-003 §C.1, §E.2–§E.4, §F.1 | API-003 Tenancy service group |
| §3, §4.2 | Organization / Company / Branch / Financial Year Master Authority; Organizational Hierarchy Lifecycle Authority | SPR-MOD-001-002 | §C.2, §C.7, §E.5–§E.8, §F.2–§F.3 | MOB-003 §C.2, §C.7, §E.5–§E.8 | API-003 Organization Structure service group |
| §3, §4.3 | User Master Authority | SPR-MOD-001-003 | §C.3, §E.9, §F.4 | MOB-003 §C.3, §E.9 | API-003 User service group |
| §3, §4.3 | Role Master Authority | SPR-MOD-001-003 | §C.4, §E.10, §F.5–§F.6 | MOB-003 §C.4, §E.10 | API-003 Role service group |
| §3, §4.3 | Permission Resolution Authority per `ADR-032` | SPR-MOD-001-003 | §C.4, §C.9, §E.10–§E.11, §J.2, §J.4 | MOB-003 §C.4, §C.9, §E.10–§E.11 | API-003 Permission Resolution service group |
| §3, §4.4 | Configuration Hierarchy Authority; Effective Configuration Resolution Authority | SPR-MOD-001-004 | §C.5, §E.12–§E.14, §F.7 | MOB-003 §C.5, §E.12–§E.14 | API-003 Configuration service group |
| §4.4 | Event Ownership Convention Authority | SPR-MOD-001-004 | §D.1 (Governance), §E.18, §J.7 | MOB-003 Governance surface | API-003 Governance conventions surface |
| §4.4 | Configuration Ownership Convention Authority | SPR-MOD-001-004 | §E.13, §E.18, §J.5 | MOB-003 §E.13, Governance surface | API-003 Configuration ownership surface |
| §3, §4.5 | Localization Pack Master Authority; Localization Pack Lifecycle Authority | SPR-MOD-001-005 | §C.6, §E.15–§E.17, §F.8–§F.9, §I | MOB-003 §C.6, §E.15–§E.17 | API-003 Localization service group |
| §4.5 | Localization Ownership Convention Authority | SPR-MOD-001-005 | §E.15, §E.18, §J.5 | MOB-003 §E.15, Governance surface | API-003 Localization ownership surface |
| §3, §4.6 | Audit Review Surface Authority | SPR-MOD-001-006 | §C.8, §E.19–§E.21, §F.10 | MOB-003 §C.8, §E.19–§E.21 | API-003 Audit Review service group |
| §4.6 | Audit Ownership Convention Authority | SPR-MOD-001-006 | §E.18, §J.6 | MOB-003 Governance surface | API-003 Audit ownership surface |
| §9 | Published events (`TenantProvisioned`, `CompanyCreated`, `FinancialYearClosed`, `UserInvited`, `RoleGranted`, `ConfigurationChanged`) | SPR-MOD-001-001 … 006 | §C.1–§C.7, §J.6 | MOB-003 mirror | API-003 event exposure surface |
| §11 | ADR-011 Multi-Tenant Isolation | SPR-MOD-001-001 | §J.3 | MOB-003 §J.3 | API-003 tenancy enforcement surface |
| §11 | ADR-014 Audit Strategy | SPR-MOD-001-006 | §C.8, §E.19–§E.21, §J.6 | MOB-003 §C.8, §J.6 | API-003 Audit Review service group |
| §11 | ADR-032 RBAC + ABAC | SPR-MOD-001-003 | §C.4, §C.9, §J.2, §J.4 | MOB-003 §J.2, §J.4 | API-003 authorization surface |
| §11 | Accessibility Standard (`ADR-081`) as referenced by Publication ADR set | SPR-MOD-001-003 … 006 | §H | MOB-003 accessibility surface | n/a for API |

No WEB-003 feature is absent from the traceability matrix. No feature in the matrix lacks an originating Sprint. WEB-003 introduces no capability, master data entity, transaction, event, engine, or ADR beyond those declared by `MOD-001_MODULE_PUBLICATION`.

## References

- [`docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`](../../30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md)
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`docs/60-solution-design/README.md`](../README.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)

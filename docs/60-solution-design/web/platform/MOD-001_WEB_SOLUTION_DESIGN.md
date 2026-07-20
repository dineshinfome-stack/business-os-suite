---
title: "MOD-001 WEB Solution Design — Platform Administration"
spec_id: "MOD-001_WEB_SOLUTION_DESIGN"
module_id: "MOD-001"
module_name: "Platform Administration"
version: "1.0"
status: "Draft"
owner: "Platform"
layer: "solution-design"
surface: "web"
canonical_reference: true
document_type: "WEB Solution Design"
source_of_truth: "docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-001", "platform", "canonical-reference"]
---

# MOD-001 WEB Solution Design — Platform Administration

> **Canonical Reference Implementation.** Once approved, this document is the canonical reference implementation for all future WEB Solution Design documents. Future WEB Solution Designs shall follow the same structure, section order, terminology, and documentation conventions unless superseded by an approved repository-wide documentation standard.

> **Derivation Rule.** Every requirement in this document is derived exclusively from `MOD-001_MODULE_PUBLICATION`. No new business behavior, feature, workflow, terminology, or scope is introduced. Where the Publication is silent on an implementation detail, an Implementation Note or Open Item is recorded; Implementation Notes are informative only and do not become business requirements. If any Implementation Note conflicts with the Publication, the Publication prevails.

---

## 1. Document Information

- **Title:** MOD-001 WEB Solution Design — Platform Administration
- **Module ID:** MOD-001
- **Version:** 1.0
- **Status:** Draft
- **Owner:** Platform

**Source of Truth (authoritative):**

- `docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md`

**Reference Documents (context only — must not introduce requirements beyond the Publication):**

- Module PRD
- Module Baseline
- Applicable Architecture Standards
- Accessibility Standards

---

## 2. Purpose

*Source: Publication §2.*

Provide the web implementation specification for Platform Administration, translating the Publication's tenancy, organizational structure, users/roles/permissions, configuration hierarchy, localization pack lifecycle, and audit review capabilities into implementation-ready screens, navigation, components, and behavior for a web (browser-based) surface.

---

## 3. Scope

*Source: Publication §3, §15.*

**In Scope (web surface only):**

- Tenancy administration surface.
- Organization structure administration (organizations, companies, branches, financial years).
- Users, roles, and permissions administration surface.
- Configuration hierarchy administration and effective configuration resolution surface (system → tenant → organization → company → branch → user).
- Localization pack administration surface (activation, inheritance, regional defaults, locale resolution).
- Audit review surface — timeline, filtering, export, and administrative monitoring — over `ENG-004` outputs.

**Out of Scope (per Publication §15 and cross-surface boundaries):**

- Authentication mechanisms (SSO, MFA, password policy enforcement).
- Identity federation (SAML, OIDC).
- SIEM integration.
- External monitoring / infrastructure observability.
- Business intelligence / analytics workspaces (MOD-017).
- Alerting infrastructure beyond notification dispatch.
- API contracts (owned by API Solution Design).
- Native mobile surfaces (owned by Mobile Solution Design).
- Ledger effects and business transactions (MOD-002).

---

## 4. Business Context

*Source: Publication §2, §4.*

Platform Administration is the root of the module dependency graph. It defines platform-level governance conventions (Event Ownership, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership) that bind every downstream business module. The web surface is the primary administrative touchpoint through which Platform-owned authorities are administered by human operators.

---

## 5. User Roles

*Source: Publication §4, §11 (ENG-001 Identity), §13 (Ownership Boundaries).*

The Publication names authorities but does not enumerate business personas. Roles are administered through the User Master, Role Master, and Permission Resolution authorities (SPR-MOD-001-003) under `ADR-032` (RBAC/ABAC). The web surface therefore recognizes the following operator classes strictly as derived from the administered authorities:

- **Platform Administrator** — operates tenancy, configuration hierarchy, localization pack lifecycle, and audit review surface at platform scope.
- **Tenant Administrator** — operates organization structure, users/roles/permissions, tenant-scoped configuration, and tenant-scoped audit review.
- **Audit Reviewer** — read-only access to the audit review surface.

**Implementation Note (non-binding).** Concrete role definitions and their permission bindings are created and managed via the Roles administration screens themselves, per the Role Master and Permission Resolution authorities. Named operator classes above are labels used within this WEB SD only for permission mapping. Any deviation is recorded under Open Items → Business Gap.

---

## 6. Navigation Structure

*Source: Publication §3, §4.*

Top-level web navigation mirrors the six authority areas of the Publication. No other top-level entries are introduced.

- Tenancy
- Organization
- Users & Roles
- Configuration
- Localization
- Audit Review

Each top-level entry expands into the screens defined in §8. Cross-linking between screens (e.g., an organization detail linking to its financial years) is permitted only where such a relationship is stated in the Publication (§3, §7).

---

## 7. Information Architecture

*Source: Publication §3, §7, §13.*

Entities below are inherited verbatim from Publication §7. Relationships are stated only where the Publication states them; other relationships are recorded under Open Items → Data Gap.

| Entity | Ownership | Relationships (per Publication) | Screen Mapping |
| --- | --- | --- | --- |
| Tenant | MOD-001 (SPR-MOD-001-001) | Root of tenant isolation boundary; parent of Organization in Configuration Hierarchy (§3). | Tenant List, Tenant Detail |
| Organization | MOD-001 (SPR-MOD-001-002) | Belongs to Tenant; parent of Company in Configuration Hierarchy (§3). | Organization List, Organization Detail |
| Company | MOD-001 (SPR-MOD-001-002) | Belongs to Organization; parent of Branch in Configuration Hierarchy (§3). | Company List, Company Detail |
| Branch | MOD-001 (SPR-MOD-001-002) | Belongs to Company; parent of User scope in Configuration Hierarchy (§3). | Branch List, Branch Detail |
| Financial Year | MOD-001 (SPR-MOD-001-002) | Managed under the organizational structure lifecycle (§4.2). | Financial Year List, Financial Year Detail |
| User | MOD-001 (SPR-MOD-001-003) | Scoped under Configuration Hierarchy leaf (§3). | User List, User Detail |
| Role | MOD-001 (SPR-MOD-001-003) | Bound to Users via Permission Resolution (`ADR-032`). | Role List, Role Detail |
| Permission | MOD-001 (SPR-MOD-001-003) | Resolved via Permission Resolution Authority (`ADR-032`). | Role Detail (bindings) |
| Configuration Key | MOD-001 (SPR-MOD-001-004) | Resolved along system → tenant → organization → company → branch → user (§3). | Configuration Browser, Effective Configuration View |
| Localization Pack | MOD-001 (SPR-MOD-001-005) | Activated / inherited across the organizational hierarchy (§4.5). | Localization Pack List, Localization Pack Detail |

---

## 8. Screen Inventory

*Source: Publication §3, §4, §7. Screens are derived strictly from the published authority areas; each screen traces back to a Publication section.*

Fields listed as "Not Defined in Publication" are recorded under Open Items. Error and success message wording is not specified by the Publication; the categories below indicate where such messages MUST appear.

### 8.1 Tenant List

- **Source Reference:** Publication §3, §4.1, §7 (Tenant).
- **Purpose:** Administer tenants under the Tenancy authority.
- **Entry Points:** Tenancy → Tenants (primary nav).
- **Exit Points:** Tenant Detail; back to top-level navigation.
- **Components:** Table (tenants), Search, Filters, Pagination, Action Buttons (Open).
- **Actions:** Open a tenant.
- **Permissions:** Platform Administrator (per Permission Resolution Authority, §4.3).
- **Business Rules:** Tenant isolation is enforced on every read (§6). Only tenants visible to the operator's scope are listed.
- **Validation Rules:** Not Defined in Publication → Open Items → UX Gap.
- **Error Messages:** Access denied when scope does not permit the tenant.
- **Success Messages:** Not applicable (read-only list).

### 8.2 Tenant Detail

- **Source Reference:** Publication §4.1, §7 (Tenant).
- **Purpose:** Review a tenant under the Tenancy Model Authority and its lifecycle under the Tenant Isolation Rule Authority.
- **Entry Points:** Tenant List.
- **Exit Points:** Tenant List; Organization List (scoped to tenant).
- **Components:** Card (tenant identity), Tabs (Overview, Organizations), Action Buttons (as defined by the tenant lifecycle in §4.1).
- **Actions:** Tenant lifecycle actions inherited from the Tenancy Model Authority (§4.1). Specific verbs are Not Defined in Publication → Open Items → Business Gap.
- **Permissions:** Platform Administrator.
- **Business Rules:** Tenant isolation is enforced on every write (§6).
- **Validation Rules:** Not Defined in Publication → Open Items.
- **Error Messages:** Tenant isolation violation; unauthorized action.
- **Success Messages:** Lifecycle action completed.

### 8.3 Organization List / Detail

- **Source Reference:** Publication §4.2, §7 (Organization).
- **Purpose:** Administer organizations under the Organization Master Authority and the Organizational Hierarchy Lifecycle Authority.
- **Entry Points:** Organization (primary nav); Tenant Detail → Organizations.
- **Exit Points:** Company List (scoped to organization).
- **Components:** Table, Search, Filters, Pagination; Detail Card + Tabs (Overview, Companies, Financial Years).
- **Actions:** Hierarchy lifecycle actions inherited from §4.2. Specific verbs Not Defined in Publication → Open Items → Business Gap.
- **Permissions:** Tenant Administrator (per Permission Resolution).
- **Business Rules:** Configuration hierarchy relationship Organization → Company (§3) MUST be preserved.
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Hierarchy violation; unauthorized action.
- **Success Messages:** Lifecycle action completed.

### 8.4 Company List / Detail

- **Source Reference:** Publication §4.2, §7 (Company).
- **Purpose:** Administer companies under the Company Master Authority.
- **Entry Points:** Company (primary nav); Organization Detail → Companies.
- **Exit Points:** Branch List (scoped to company); Financial Year List (scoped to company).
- **Components:** Table, Search, Filters, Pagination; Detail Card + Tabs (Overview, Branches, Financial Years).
- **Actions:** Hierarchy lifecycle actions inherited from §4.2.
- **Permissions:** Tenant Administrator.
- **Business Rules:** Configuration hierarchy Company → Branch (§3) MUST be preserved.
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Hierarchy violation; unauthorized action.
- **Success Messages:** Lifecycle action completed.

### 8.5 Branch List / Detail

- **Source Reference:** Publication §4.2, §7 (Branch).
- **Purpose:** Administer branches under the Branch Master Authority.
- **Entry Points:** Branch (primary nav); Company Detail → Branches.
- **Exit Points:** Company Detail.
- **Components:** Table, Search, Filters, Pagination; Detail Card.
- **Actions:** Hierarchy lifecycle actions inherited from §4.2.
- **Permissions:** Tenant Administrator.
- **Business Rules:** Branch belongs to Company (§3).
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Hierarchy violation.
- **Success Messages:** Lifecycle action completed.

### 8.6 Financial Year List / Detail

- **Source Reference:** Publication §4.2, §7 (Financial Year).
- **Purpose:** Administer financial years under the Financial Year Master Authority.
- **Entry Points:** Financial Year (primary nav); Company Detail → Financial Years.
- **Exit Points:** Company Detail.
- **Components:** Table, Search, Filters, Pagination; Detail Card.
- **Actions:** Financial year lifecycle actions inherited from the Organizational Hierarchy Lifecycle Authority (§4.2). Specific verbs Not Defined in Publication → Open Items → Business Gap.
- **Permissions:** Tenant Administrator.
- **Business Rules:** Inherited from §4.2.
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Lifecycle violation; unauthorized action.
- **Success Messages:** Lifecycle action completed.

### 8.7 User List / Detail

- **Source Reference:** Publication §4.3, §7 (User).
- **Purpose:** Administer users under the User Master Authority.
- **Entry Points:** Users & Roles → Users (primary nav).
- **Exit Points:** Role List; Configuration Browser (user scope).
- **Components:** Table, Search, Filters, Pagination; Detail Card + Tabs (Overview, Roles).
- **Actions:** User lifecycle actions inherited from §4.3. Specific verbs Not Defined in Publication → Open Items → Business Gap.
- **Permissions:** Tenant Administrator.
- **Business Rules:** Tenant isolation (§6). Permission Resolution per `ADR-032`.
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Tenant isolation violation; unauthorized action.
- **Success Messages:** Lifecycle action completed.

### 8.8 Role List / Detail (with Permission Bindings)

- **Source Reference:** Publication §4.3, §7 (Role, Permission), `ADR-032` (RBAC/ABAC).
- **Purpose:** Administer roles under the Role Master Authority and permission bindings under the Permission Resolution Authority.
- **Entry Points:** Users & Roles → Roles.
- **Exit Points:** User Detail.
- **Components:** Table, Search, Filters, Pagination; Detail Card + Tabs (Overview, Permissions, Users).
- **Actions:** Role lifecycle and permission binding actions inherited from §4.3.
- **Permissions:** Tenant Administrator; Platform Administrator for platform-scope roles.
- **Business Rules:** Permission Resolution per `ADR-032`.
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Permission Resolution violation; unauthorized action.
- **Success Messages:** Role updated; permission binding updated.

### 8.9 Configuration Browser

- **Source Reference:** Publication §4.4, §7 (Configuration Key).
- **Purpose:** Administer configuration keys under the Configuration Hierarchy Authority and inspect resolution under the Effective Configuration Resolution Authority.
- **Entry Points:** Configuration (primary nav).
- **Exit Points:** Effective Configuration View.
- **Components:** Scope selector (system → tenant → organization → company → branch → user), Table, Search, Filters, Pagination, Detail Card, Action Buttons.
- **Actions:** Configuration set / clear at the selected scope, per the Configuration Hierarchy Authority (§4.4).
- **Permissions:** Platform Administrator (system scope); Tenant Administrator (tenant and below).
- **Business Rules:** Configuration resolves deterministically along system → tenant → organization → company → branch → user (§6). Configuration Ownership Convention (§4.4) is enforced.
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Scope violation; ownership violation; unauthorized action.
- **Success Messages:** Configuration updated at scope.

### 8.10 Effective Configuration View

- **Source Reference:** Publication §4.4, §6 (Configuration resolution rule).
- **Purpose:** Present deterministic effective configuration for a chosen scope combination under the Effective Configuration Resolution Authority.
- **Entry Points:** Configuration Browser.
- **Exit Points:** Configuration Browser.
- **Components:** Scope selector, Table (effective keys with resolved source scope).
- **Actions:** Read-only inspection.
- **Permissions:** Same as Configuration Browser.
- **Business Rules:** Resolution order is deterministic (§6).
- **Validation Rules:** Not applicable (read-only).
- **Error Messages:** Unauthorized scope inspection.
- **Success Messages:** Not applicable.

### 8.11 Localization Pack List / Detail

- **Source Reference:** Publication §4.5, §7 (Localization Pack).
- **Purpose:** Administer localization packs under the Localization Pack Master Authority and manage activation, inheritance, regional defaults, and locale resolution under the Localization Pack Lifecycle Authority.
- **Entry Points:** Localization (primary nav).
- **Exit Points:** Effective Configuration View (for locale-related keys).
- **Components:** Table, Search, Filters, Pagination; Detail Card + Tabs (Overview, Activation, Inheritance, Regional Defaults).
- **Actions:** Lifecycle actions inherited from §4.5 (activation, inheritance changes, regional defaults, locale resolution).
- **Permissions:** Platform Administrator; Tenant Administrator per scope.
- **Business Rules:** Platform owns pack activation, inheritance, and locale resolution; business modules own only the localized business content they introduce (§6).
- **Validation Rules:** Not Defined in Publication.
- **Error Messages:** Ownership violation; scope violation.
- **Success Messages:** Pack activated / inheritance updated / regional default updated.

### 8.12 Audit Review

- **Source Reference:** Publication §4.6, §6, §13.
- **Purpose:** Provide the audit review surface — timeline, filtering, export, and administrative monitoring — over `ENG-004` outputs.
- **Entry Points:** Audit Review (primary nav).
- **Exit Points:** N/A (terminal review surface).
- **Components:** Timeline, Filters (time range, entity, actor, event type as available from `ENG-004`), Search, Pagination, Export action.
- **Actions:** Filter, search, view detail, export.
- **Permissions:** Audit Reviewer; Platform Administrator; Tenant Administrator (tenant scope).
- **Business Rules:** `ENG-004` remains the authoritative owner of audit collection, storage, integrity, and lifecycle; Platform owns the review surface only (§6, §13). Tenant isolation applies (§6).
- **Validation Rules:** Not applicable (read-only + export).
- **Error Messages:** Unauthorized review; export failed.
- **Success Messages:** Export prepared.

---

## 9. User Workflows

*Source: Publication §4 (Consolidated Authorities), §6 (Business Rules).*

The Publication does not enumerate user-level workflow steps; it enumerates authorities. The following workflows are derived one-per-authority-area and MUST NOT be interpreted as introducing new business behavior.

1. **Tenancy administration** (§4.1) — operator navigates Tenancy → performs a tenant lifecycle action → tenant isolation is enforced on every read/write.
2. **Organization structure administration** (§4.2) — operator navigates Organization / Company / Branch / Financial Year → performs a lifecycle action → hierarchy integrity is preserved.
3. **Users, roles, and permissions administration** (§4.3) — operator navigates Users & Roles → maintains User, Role, and Permission bindings → Permission Resolution per `ADR-032`.
4. **Configuration administration** (§4.4) — operator navigates Configuration → sets or clears a Configuration Key at a scope → deterministic Effective Configuration Resolution is observable via the Effective Configuration View.
5. **Localization pack administration** (§4.5) — operator navigates Localization → activates a pack / adjusts inheritance / sets regional defaults → locale resolution updates accordingly.
6. **Audit review** (§4.6) — operator navigates Audit Review → filters, searches, inspects, and exports records sourced from `ENG-004`.

Step-level user flow details are Not Defined in Publication → Open Items → UX Gap.

---

## 10. UI Components

*Source: Publication §3, §4 (drives the presence of each component); component appearance/behavior is an implementation detail per the Implementation Interpretation Rule.*

- **Forms** — used by lifecycle actions on Tenant, Organization, Company, Branch, Financial Year, User, Role, Configuration Key, and Localization Pack detail screens.
- **Tables** — used by every list screen in §8.
- **Cards** — used by every detail screen in §8.
- **Dialogs** — used to confirm destructive or irreversible lifecycle actions (specific interactions Not Defined in Publication).
- **Search** — present on every list screen.
- **Filters** — present on list screens and on Audit Review.
- **Pagination** — present on every list screen.
- **Tabs** — used on detail screens as indicated in §8.
- **Navigation Elements** — top-level entries per §6; cross-links between screens as permitted in §7.
- **Action Buttons** — present per screen actions listed in §8; verbs derive from Publication-declared lifecycle authorities.

---

## 11. Validation Rules

*Source: Publication §6.*

The Publication states the following invariants that MUST be enforced by the web surface as validation and pre-submit checks:

- **V-1 Tenant Isolation.** Every read and every write MUST respect tenant isolation. The web surface MUST refuse cross-tenant operations.
- **V-2 Configuration Hierarchy Integrity.** Configuration scope selection MUST follow system → tenant → organization → company → branch → user. Out-of-order or ambiguous scope selections MUST be rejected.
- **V-3 Configuration Ownership.** Configuration Key operations MUST respect the Configuration Ownership Convention (§4.4).
- **V-4 Localization Ownership.** Localization pack activation, inheritance, and locale resolution MUST NOT be performed by any surface other than the Localization administration screens (§4.5).
- **V-5 Audit Ownership.** The audit review surface MUST NOT mutate audit records; write operations against `ENG-004` outputs are forbidden (§6, §13).
- **V-6 Permission Resolution.** Every screen action MUST be gated by Permission Resolution per `ADR-032` (§4.3).

Field-level validations (length, format, uniqueness beyond tenant isolation) are Not Defined in Publication → Open Items → Data Gap.

---

## 12. Business Rules

*Source: Publication §6.*

The following business rules bind the web surface verbatim from the Publication:

- **BR-1** Tenant isolation is enforced at every read and write; no downstream module MAY bypass it.
- **BR-2** Configuration resolves deterministically through the tenant → organization → company → branch → user hierarchy.
- **BR-3** Localization pack activation, inheritance, and locale resolution are owned by Platform; business modules own only the localized business content they introduce.
- **BR-4** Audit collection, storage, integrity, and lifecycle remain owned by `ENG-004`; Platform owns the review surface only.
- **BR-5** Business modules own the semantics of the events they emit; Platform owns the event delivery infrastructure via `ENG-005`.

---

## 13. Permissions

*Source: Publication §4.3 (Permission Resolution Authority), §11 (ENG-001 Identity), §13 (Ownership Boundaries); `ADR-032` RBAC/ABAC.*

- All web actions are gated by Permission Resolution per `ADR-032`.
- Roles and permissions are administered through the Users & Roles screens (§8.7, §8.8) — they are NOT hard-coded in the web surface.
- The web surface recognizes three operator classes (§5) for the purpose of default screen-to-permission mapping:
  - Platform Administrator → Tenancy, Configuration (system scope), Localization (platform scope), Audit Review (platform scope).
  - Tenant Administrator → Organization, Company, Branch, Financial Year, Users & Roles, Configuration (tenant and below), Localization (tenant scope), Audit Review (tenant scope).
  - Audit Reviewer → Audit Review (read-only within permitted scope).
- Any screen action performed by an operator without the resolved permission MUST be denied with an unauthorized error.

Concrete permission identifiers are Not Defined in Publication → Open Items → Security Gap.

---

## 14. Notifications

*Source: Publication §9 (Published Events), §10 (Consumed Events), §11 (ENG-006 Notification Engine, ENG-005 Event Engine).*

The Publication states that Platform does not introduce independent business events and that notification dispatch is bounded by `ENG-006`. The web surface therefore surfaces notifications only in the following categories:

- **Success** — in-page confirmation for a completed lifecycle action (screens in §8).
- **Warning** — in-page warning where a lifecycle action is permitted but changes cross-scope state (e.g., Configuration change at a broader scope).
- **Error** — in-page error for validation failures (§11) or permission denials (§13).
- **Informational** — in-page informational messages for deterministic resolution outcomes (e.g., effective configuration source scope) and for audit review filter results.

Push, email, and out-of-band notifications are governed by `ENG-006` and are outside the web surface's scope. Specific notification channels, templates, and content are Not Defined in Publication → Open Items → UX Gap.

---

## 15. Responsive Behaviour

*Source: Publication §3 (web surface is administrative). Concrete breakpoints and layout targets are Not Defined in Publication.*

- **Desktop** — primary target for all administrative screens in §8.
- **Tablet** — supported for read-heavy screens (list screens, Audit Review, Effective Configuration View); write-heavy administrative actions are supported without degradation of validation (§11).
- **Mobile Browser** — supported for read-heavy screens; administrative write actions remain functional but are not the primary target.

**Implementation Note (non-binding).** Specific breakpoints, table-to-card collapse thresholds, and mobile-browser affordances are implementation details. Any decision that would restrict a Publication-derived action to a subset of form factors MUST be recorded under Open Items → UX Gap.

---

## 16. Accessibility

*Source: Accessibility Standards.*

The web surface MUST meet the Accessibility Standards. Specifically:

- **Keyboard Navigation** — every screen action listed in §8 MUST be reachable and operable via keyboard.
- **Focus Order** — focus order MUST follow reading order on every screen.
- **Screen Reader Support** — every actionable element MUST expose an accessible name; every list, table, and timeline MUST expose appropriate semantics.
- **Colour Contrast** — meets the Accessibility Standards contrast baseline.
- **Form Accessibility** — every input MUST have a programmatically associated label; validation messages (§11) MUST be programmatically associated with the corresponding input.

Specific WCAG level and audit tooling are Not Defined in Publication → Open Items → Technical Gap.

---

## 17. Performance Expectations

*Source: Publication §11 (Platform Engine Usage). No measurable performance targets are stated in the Publication.*

- Read latency, write latency, audit export throughput, and configuration resolution latency are Not Defined in Publication → Open Items → Technical Gap.
- **Implementation Note (non-binding).** The web surface should not add measurable overhead beyond the underlying engine responses (`ENG-001`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-018`, `ENG-024`). This note is informative only.

---

## 18. Dependencies

*Source: Publication §11, §12.*

**Upstream:** None. Platform Administration is the root of the module dependency graph.

**Downstream consumers of Platform Administration (per Publication §12):** MOD-002 Accounting, MOD-003 Sales, MOD-004 Purchase, MOD-005 Inventory, MOD-006 CRM, MOD-007 HRMS, MOD-008 Payroll, MOD-009 Manufacturing, MOD-010 Projects, MOD-013 Assets, MOD-014 Fleet, MOD-015 POS, MOD-016 Service Desk, MOD-017 Analytics, MOD-018 AI Workspace, MOD-019 Warehouse.

**Platform engines consumed by the web surface (per Publication §11):**

- `ENG-001` Identity Engine
- `ENG-004` Audit Engine
- `ENG-005` Event Engine
- `ENG-006` Notification Engine
- `ENG-018` Localization Engine
- `ENG-024` Configuration Engine

**Related ADRs (per Publication §11):** `ADR-011`, `ADR-012`, `ADR-014`, `ADR-032`, `ADR-051`.

---

## 19. Acceptance Criteria

*Source: Publication §3, §4, §6, §11, §13.*

Acceptance criteria are testable and cover screen behaviour, navigation, validation, permissions, business rules, and workflows.

**Screen behaviour**

- AC-S1. Every screen listed in §8 renders under the operator class and scope specified in that screen's Permissions field. *(Publication §4.3, §13.)*
- AC-S2. Every list screen supports Search, Filters, and Pagination. *(Publication §3 read surface.)*
- AC-S3. The Effective Configuration View renders the source scope for every resolved key. *(Publication §4.4, §6.)*
- AC-S4. Audit Review renders records sourced from `ENG-004` without mutation controls. *(Publication §4.6, §13.)*

**Navigation**

- AC-N1. Top-level navigation exposes exactly the six entries listed in §6. *(Publication §3, §4.)*
- AC-N2. Cross-links between screens exist only for relationships stated in the Publication (§7).

**Validation**

- AC-V1. Cross-tenant operations are refused. *(Publication §6, V-1.)*
- AC-V2. Out-of-order scope selection in Configuration Browser is refused. *(Publication §6, V-2.)*
- AC-V3. Localization pack activation is available only via the Localization administration screens. *(Publication §6, V-4.)*
- AC-V4. Audit records are never mutated by the web surface. *(Publication §6, V-5.)*

**Permissions**

- AC-P1. Every screen action is gated by Permission Resolution per `ADR-032` and denies unauthorized actions with an unauthorized error. *(Publication §4.3, §13, V-6.)*

**Business Rules**

- AC-B1. Tenant isolation holds on every read and write across every screen. *(Publication §6, BR-1.)*
- AC-B2. Configuration resolution follows system → tenant → organization → company → branch → user. *(Publication §6, BR-2.)*
- AC-B3. Localization pack lifecycle is executed only from Localization administration screens. *(Publication §6, BR-3.)*
- AC-B4. Audit review surface exposes no write actions against `ENG-004` outputs. *(Publication §6, BR-4.)*

**Workflows**

- AC-W1. Each workflow in §9 is completable end-to-end using the screens in §8. *(Publication §4.)*

---

## 20. Open Items

*Every item below is unresolved because it is not defined in the Module Publication. Categories: Business Gap, UX Gap, Technical Gap, Data Gap, Security Gap.*

**Business Gap**

- OI-B1. Concrete tenant lifecycle verbs (create/suspend/archive/…) are not enumerated in the Publication (§4.1).
- OI-B2. Concrete organization / company / branch / financial year lifecycle verbs are not enumerated (§4.2).
- OI-B3. Concrete user and role lifecycle verbs are not enumerated (§4.3).
- OI-B4. Business personas beyond the authority names are not enumerated (§3, §4).

**UX Gap**

- OI-U1. Step-level user-flow detail per workflow (§9).
- OI-U2. Field-level form arrangements per detail screen (§8).
- OI-U3. Notification templates, wording, and channels beyond in-page categories (§14).
- OI-U4. Any restriction of Publication-derived actions to a subset of form factors (§15).

**Technical Gap**

- OI-T1. Measurable performance targets (§17).
- OI-T2. Specific WCAG level and audit tooling (§16).

**Data Gap**

- OI-D1. Field-level validation (length, format, uniqueness beyond tenant isolation) per entity (§7, §11).
- OI-D2. Entity relationships beyond those stated in the Publication (§7).

**Security Gap**

- OI-S1. Concrete permission identifiers for screen-to-permission mapping (§13).

---

## Traceability Matrix

| Publication Section | WEB SD Section |
| --- | --- |
| §1 Module Identity | §1 Document Information |
| §2 Module Purpose | §2 Purpose, §4 Business Context |
| §3 Approved Scope | §3 Scope, §6 Navigation Structure, §7 Information Architecture |
| §4 Consolidated Authorities | §5 User Roles, §8 Screen Inventory, §9 User Workflows, §13 Permissions |
| §6 Business Rules | §11 Validation Rules, §12 Business Rules |
| §7 Master Data Authorities | §7 Information Architecture, §8 Screen Inventory |
| §9 Published Events / §10 Consumed Events | §14 Notifications |
| §11 Platform Engine Usage | §14 Notifications, §17 Performance Expectations, §18 Dependencies |
| §12 Dependencies | §18 Dependencies |
| §13 Ownership Boundaries | §11 Validation Rules, §12 Business Rules, §13 Permissions |
| §15 Non-Goals | §3 Scope (Out of Scope) |

---

## Completion Checklist

- [x] All Publication requirements mapped
- [x] No invented functionality
- [x] All Business Rules mapped (§12)
- [x] All Validation Rules mapped (§11)
- [x] All Personas covered (§5; gaps recorded in OI-B4)
- [x] All workflows documented (§9)
- [x] All dependencies documented (§18)
- [x] All unresolved items listed (§20)
- [x] Ready for Mobile Solution Design

---

## Document Quality Gate

This document may be marked `IMPLEMENTATION READY` only if:

- Every published capability is mapped. **Met** (§3, §8, §9).
- Every published workflow is mapped. **Met** (§9).
- Every published business rule is mapped. **Met** (§12).
- Every published validation rule is mapped. **Met** (§11).
- Every screen is traceable to a published capability. **Met** (§8, Traceability Matrix).
- No undocumented assumptions remain unresolved. **Met** (Implementation Notes are classified; unresolved items are listed in §20).
- All Open Items are classified. **Met** (§20; every item carries a category).

---

WEB Solution Design Status:

REQUIRES CLARIFICATION

**Unresolved gaps in the Module Publication (summary).** The Publication does not enumerate concrete lifecycle verbs for Tenant, Organization, Company, Branch, Financial Year, User, or Role (OI-B1–OI-B3); does not enumerate business personas beyond authority names (OI-B4); does not define step-level user flows (OI-U1), field arrangements (OI-U2), notification templates/channels (OI-U3), or form-factor restrictions (OI-U4); does not state measurable performance targets (OI-T1); does not name a specific WCAG level or audit tooling (OI-T2); does not define field-level validations (OI-D1) or entity relationships beyond §7 (OI-D2); and does not define concrete permission identifiers (OI-S1). These gaps must be closed via Publication amendment before the status can be advanced to `IMPLEMENTATION READY`.

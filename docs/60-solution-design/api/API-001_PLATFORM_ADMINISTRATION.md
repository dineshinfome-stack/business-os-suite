---
title: "API-001 — Platform Administration API Solution Design Specification"
summary: "Phase 3 API Solution Design specification for MOD-001 Platform Administration. Derived exclusively from the Platform Administration Module Publication (with WEB-001 and MOB-001 referenced only for cross-platform terminology and workflow consistency). Defines API architecture, service groups, resource model, endpoint inventory, request/response standards, authorization, versioning, error behaviour, and cross-platform alignment. Introduces no new business requirements."
spec_id: "API-001"
family: "API"
source_module: "MOD-001"
source_module_name: "Platform Administration"
source_publication: "MOD-001_MODULE_PUBLICATION"
source_baseline: "MOD001_PLATFORM_BASELINE_v1"
source_module_prd: "docs/20-module-prds/platform/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-001-001", "SPR-MOD-001-002", "SPR-MOD-001-003", "SPR-MOD-001-004", "SPR-MOD-001-005", "SPR-MOD-001-006"]
related_web_spec: "WEB-001"
related_mobile_spec: "MOB-001"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Architecture Office"
layer: "platform"
updated: "2026-07-18"
tags: ["solution-design", "api", "phase-3", "SD-001_API_SPEC", "API-001", "MOD-001", "platform-administration"]
document_type: "API Solution Design Specification"
template: "SD-001_API_SPEC"
template_version: "v1.0"
governance_specification: "v1.0"
related_engines: ["ENG-001", "ENG-004", "ENG-005", "ENG-006", "ENG-018", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-032", "ADR-051"]
---

# API-001 — Platform Administration API Solution Design Specification

> **Reference derivation only.** API-001 is an API-surface projection of the Platform Administration Module Publication [`MOD-001_MODULE_PUBLICATION`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. [`WEB-001`](../web/WEB-001_PLATFORM_ADMINISTRATION.md) and [`MOB-001`](../mobile/MOB-001_PLATFORM_ADMINISTRATION.md) are referenced only to maintain cross-platform terminology, workflow, and authorization consistency. Endpoint paths in §E are illustrative business-level shapes derived from Publication authorities; concrete payload schemas, wire formats, and infrastructure design remain out of scope. On any conflict with the Module Publication or its parent Module Baseline, the upstream artefact wins and API-001 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the API-surface through which authorized consumers — the Platform Administration Web application (WEB-001), the Platform Administration Mobile application (MOB-001), authorized internal Business OS services, and approved external integrations — invoke the Platform Administration capabilities published in `MOD-001_MODULE_PUBLICATION`: tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization pack lifecycle, and the audit review surface, while honouring the governance conventions (Event, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership) that bind every downstream business module.

### A.2 Scope

In scope for API-001:

- Business-level API architecture (service boundaries, statelessness, authentication and authorization pipeline, tenant isolation).
- API domain decomposition into Tenancy, Organization, Users, Roles, Permissions, Configuration, Localization, and Audit.
- Business resource model, business-level endpoint inventory, and request/response standards.
- Authorization boundaries derived from `ADR-032` (RBAC + ABAC) and the tenant isolation boundary derived from `ADR-011`.
- Error behaviour, pagination/filtering/sorting, idempotency, concurrency, and versioning governance.
- Integration points with the platform engines consumed by MOD-001.
- Cross-platform alignment with WEB-001 and MOB-001.

Out of scope: Web-surface UX (belongs to WEB-001), mobile-surface UX (belongs to MOB-001), payload schemas, protocol tuning, database schema, infrastructure sizing, authentication mechanics (SSO, MFA, identity federation), SIEM integration, external monitoring, and any business-rule authoring.

### A.3 Source Published Module

- **Module ID / Name:** MOD-001 Platform Administration
- **Publication:** [`MOD-001_MODULE_PUBLICATION`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`](../../30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-001-001` … `SPR-MOD-001-006`
- **Related Web Specification:** [`WEB-001`](../web/WEB-001_PLATFORM_ADMINISTRATION.md) — consistency reference only.
- **Related Mobile Specification:** [`MOB-001`](../mobile/MOB-001_PLATFORM_ADMINISTRATION.md) — consistency reference only.

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-001 v1.0

### A.5 Endpoint Identifier Convention

Every endpoint in §E is assigned a stable business-level identifier of the form `API001-EP-NNN`. Endpoint IDs are unique within this specification and are referenced by the Traceability Matrix (§N). Every endpoint referenced elsewhere in this specification MUST resolve to a row in §E.

### A.6 Traceability References

See §N for the full capability-to-resource-to-endpoint-to-engine-to-ADR matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → API-001).

## B. API Architecture

Business-level architecture only. No protocol, framework, or infrastructure design.

### B.1 Service Boundaries

The Platform Administration API is decomposed into eight business domains, each aligned to a Publication §4 authority group: **Tenancy**, **Organization**, **Users**, **Roles**, **Permissions**, **Configuration**, **Localization**, and **Audit**. Each domain owns its resource model, endpoint surface, and lifecycle transitions; cross-domain interactions occur only through Published Module authorities and platform engines. No cross-domain shortcut is exposed.

### B.2 Stateless Design

Every API request is self-describing. Session state is not held by the API surface; caller identity, tenant scope, and authorization scope are resolved from the caller's credentials on every request via `ENG-001` and `ADR-032`. Long-running lifecycles (tenant provisioning, financial-year close, localization pack activation) are represented as resources with explicit lifecycle state — never as transient session state.

### B.3 Authentication Pipeline

All consumers authenticate through `ENG-001` (Identity Engine). Authentication mechanics (SSO, MFA, identity federation) remain platform concerns per Publication §15 and are not defined by this specification. The API surface accepts only authenticated principals; anonymous access is not exposed. Service-to-service identity is expressed under the same `ENG-001` boundary.

### B.4 Authorization Pipeline

Every request is authorized by `ENG-002` (Authorization) with grants managed by `ENG-003` (Permission Management) per `ADR-032` (RBAC + ABAC). Authorization decisions consider role, tenant scope, and attribute-based context (organization, company, branch, resource). Denials produce a business-level "unauthorized" outcome that discloses no protected content or existence beyond the caller's role.

### B.5 Tenant Isolation

Tenant isolation is enforced by the Tenant Isolation Rule Authority (Publication §4.1) per `ADR-011`. Every request is executed within the caller's tenant scope; cross-tenant access is not exposed on this surface. The Platform Administrator persona operates cross-tenant only through explicit platform-scope resources (§C.1) subject to the same authorization boundary.

## C. API Domains

Domains correspond one-to-one to Publication §4 authorities. No new domains introduced.

### C.1 Tenancy

- **Business Purpose.** Expose Tenant identity, tenant lifecycle transitions, and the Tenant Isolation Rule (read).
- **Authorities.** Tenancy Model Authority; Tenant Isolation Rule Authority (Publication §4.1).
- **Primary Business Operations.** List / retrieve Tenants; provision a Tenant; transition Tenant lifecycle (activate / suspend / deactivate) within the operator's authorization; retrieve tenant-scope governance state.

### C.2 Organization

- **Business Purpose.** Expose Organization, Company, Branch, and Financial Year masters and their lifecycle.
- **Authorities.** Organization / Company / Branch / Financial Year Master Authority; Organizational Hierarchy Lifecycle Authority (Publication §4.2).
- **Primary Business Operations.** CRUD on Organizations, Companies, Branches; open / close Financial Years subject to lifecycle preconditions; retrieve the organizational hierarchy for authorized scopes.

### C.3 Users

- **Business Purpose.** Expose the User master and user lifecycle within tenant scope.
- **Authorities.** User Master Authority (Publication §4.3).
- **Primary Business Operations.** Invite / retrieve / update / deactivate Users; enumerate Users within authorized scope; expose user-scope governance metadata (last activity, effective role summary) read-only.

### C.4 Roles

- **Business Purpose.** Expose the Role master and role grant/revoke lifecycle.
- **Authorities.** Role Master Authority; Permission Resolution Authority (Publication §4.3).
- **Primary Business Operations.** CRUD on Roles; grant / revoke a Role to a User at a scope; enumerate Role members; retrieve effective role sets for a User.

### C.5 Permissions

- **Business Purpose.** Expose Permission Resolution results read-only; permission catalog for administrative surfaces.
- **Authorities.** Permission Resolution Authority (Publication §4.3) per `ADR-032`.
- **Primary Business Operations.** Retrieve the permission catalog within authorized scope; resolve effective permissions for a User at a scope (read-only). Permission grants are performed via the Roles domain (§C.4); this domain exposes evaluation and inspection only.

### C.6 Configuration

- **Business Purpose.** Expose the Configuration Hierarchy, Effective Configuration Resolution, and the Configuration Ownership Convention.
- **Authorities.** Configuration Hierarchy Authority; Effective Configuration Resolution Authority; Event Ownership Convention Authority; Configuration Ownership Convention Authority (Publication §4.4).
- **Primary Business Operations.** CRUD on Configuration Keys within authorized scope; retrieve resolved effective configuration for a scope; submit and resolve configuration change approvals; read the Ownership Conventions in force.

### C.7 Localization

- **Business Purpose.** Expose the Localization Pack master and its lifecycle (activation, inheritance, regional defaults, locale resolution).
- **Authorities.** Localization Pack Master Authority; Localization Pack Lifecycle Authority; Localization Ownership Convention Authority (Publication §4.5).
- **Primary Business Operations.** CRUD on Localization Packs; activate / deactivate a Pack at a scope; retrieve inheritance and regional defaults; resolve the effective locale for a scope.

### C.8 Audit

- **Business Purpose.** Expose the Audit Review surface as a read-only projection of `ENG-004` outputs, with filtering, drill-down, and export requests.
- **Authorities.** Audit Review Surface Authority; Audit Ownership Convention Authority (Publication §4.6).
- **Primary Business Operations.** Query Audit Events by filter within authorized scope; retrieve an Audit Event Detail; request an Audit Export. Audit collection, storage, integrity, and lifecycle remain owned by `ENG-004` — this domain never mutates audit state.

## D. Resource Model

Resources are inherited from Publication §7 (Master Data) and Module PRD §8 (Events). No new resources introduced. No wire schemas.

| Resource | Ownership | Lifecycle | Notes |
| --- | --- | --- | --- |
| **Tenant** | MOD-001 (SPR-MOD-001-001) | Provisioning → Active → Suspended → Deactivated → Archived | Root scope for isolation per `ADR-011`. |
| **Organization** | MOD-001 (SPR-MOD-001-002) | Draft → Active → Inactive → Archived | Nested under Tenant. |
| **Company** | MOD-001 (SPR-MOD-001-002) | Draft → Active → Inactive → Archived | Cannot be archived while open Financial Years exist (PRD §7). |
| **Branch** | MOD-001 (SPR-MOD-001-002) | Draft → Active → Inactive → Archived | Nested under Company. |
| **Financial Year** | MOD-001 (SPR-MOD-001-002) | Open → Closed → Archived | Close subject to downstream preconditions. |
| **User** | MOD-001 (SPR-MOD-001-003) | Invited → Active → Inactive → Archived | Cannot self-revoke last platform-admin role in a tenant (PRD §7). |
| **Role** | MOD-001 (SPR-MOD-001-003) | Draft → Active → Inactive → Archived | Resolves via `ADR-032`. |
| **Role Grant** | MOD-001 (SPR-MOD-001-003) | Granted → Revoked | Scope-bound; audit-visible. |
| **Permission** | MOD-001 (SPR-MOD-001-003) | Managed by `ENG-003` | Exposed read-only via §C.5. |
| **Configuration Key** | MOD-001 (SPR-MOD-001-004) | Draft → Active → Inactive → Archived | Scoped per hierarchy; emits `ConfigurationChanged` (PRD §8). |
| **Configuration Change** (transaction) | MOD-001 (SPR-MOD-001-004) | Pending → Approved / Rejected → Applied | Governed by Configuration Ownership Convention. |
| **Localization Pack** | MOD-001 (SPR-MOD-001-005) | Draft → Active → Inactive → Archived | Activation resolves inheritance and regional defaults via `ENG-018`. |
| **Audit Event** (read-only) | `ENG-004` | Governed by `ENG-004` and `ADR-014` | Projected through Audit Review surface. |
| **Audit Export Request** (transaction) | MOD-001 (SPR-MOD-001-006) | Requested → Preparing → Ready → Delivered / Failed | Delivered via `ENG-006`. |

Events emitted (Module PRD §8, delivered via `ENG-024` / `ENG-005`): `TenantProvisioned`, `CompanyCreated`, `FinancialYearClosed`, `UserInvited`, `RoleGranted`, `ConfigurationChanged`. Additional lifecycle signals (`TenantActivated`, `TenantSuspended`, `LocalizationPackActivated`, `AuditExportReady`) are governed by the same Event Ownership Convention.

## E. Endpoint Inventory

Business-level endpoint identities. Paths are illustrative shapes; concrete wire contracts are established in downstream implementation artefacts. Every endpoint carries a stable `API001-EP-NNN` identifier, HTTP verb (business-level), path template, business purpose, authorization scope, and idempotency posture. Where the verb is a lifecycle transition, the operation is idempotent under the same idempotency key.

### E.1 Tenancy

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-001` | GET | `/v1/tenants` | List tenants visible to the caller | Platform Admin | Yes |
| `API001-EP-002` | GET | `/v1/tenants/{tenantId}` | Retrieve tenant detail | Platform Admin / Tenant Admin (own) | Yes |
| `API001-EP-003` | POST | `/v1/tenants` | Provision a new tenant | Platform Admin | Yes (keyed) |
| `API001-EP-004` | POST | `/v1/tenants/{tenantId}/lifecycle` | Transition tenant lifecycle (activate / suspend / deactivate) | Platform Admin | Yes (keyed) |

### E.2 Organization

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-010` | GET | `/v1/organizations` | List organizations in tenant scope | Tenant Admin | Yes |
| `API001-EP-011` | POST | `/v1/organizations` | Create an organization | Tenant Admin | Yes (keyed) |
| `API001-EP-012` | GET | `/v1/organizations/{organizationId}` | Retrieve organization detail | Tenant / Company Admin | Yes |
| `API001-EP-013` | PATCH | `/v1/organizations/{organizationId}` | Update an organization within lifecycle rules | Tenant Admin | Yes |
| `API001-EP-014` | GET | `/v1/organizations/{organizationId}/companies` | List companies | Tenant / Company Admin | Yes |
| `API001-EP-015` | POST | `/v1/companies` | Create a company | Tenant Admin | Yes (keyed) |
| `API001-EP-016` | GET | `/v1/companies/{companyId}` | Retrieve company detail | Company Admin | Yes |
| `API001-EP-017` | GET | `/v1/companies/{companyId}/branches` | List branches | Company Admin | Yes |
| `API001-EP-018` | POST | `/v1/branches` | Create a branch | Company Admin | Yes (keyed) |
| `API001-EP-019` | GET | `/v1/companies/{companyId}/financial-years` | List financial years | Company Admin | Yes |
| `API001-EP-020` | POST | `/v1/financial-years` | Open a financial year | Company Admin | Yes (keyed) |
| `API001-EP-021` | POST | `/v1/financial-years/{financialYearId}/close` | Close a financial year subject to preconditions | Company Admin | Yes (keyed) |

### E.3 Users

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-030` | GET | `/v1/users` | List users in authorized scope | Tenant / Company Admin | Yes |
| `API001-EP-031` | POST | `/v1/users/invitations` | Invite a user | Tenant / Company Admin | Yes (keyed) |
| `API001-EP-032` | GET | `/v1/users/{userId}` | Retrieve user detail | Tenant / Company Admin / Self | Yes |
| `API001-EP-033` | PATCH | `/v1/users/{userId}` | Update user profile within scope | Tenant / Company Admin / Self | Yes |
| `API001-EP-034` | POST | `/v1/users/{userId}/deactivate` | Deactivate a user | Tenant Admin | Yes (keyed) |

### E.4 Roles

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-040` | GET | `/v1/roles` | List roles in tenant | Tenant Admin | Yes |
| `API001-EP-041` | POST | `/v1/roles` | Create a role | Tenant Admin | Yes (keyed) |
| `API001-EP-042` | GET | `/v1/roles/{roleId}` | Retrieve role detail | Tenant Admin / Security Officer | Yes |
| `API001-EP-043` | PATCH | `/v1/roles/{roleId}` | Update role definition | Tenant Admin | Yes |
| `API001-EP-044` | POST | `/v1/users/{userId}/role-grants` | Grant a role at a scope | Tenant / Company Admin | Yes (keyed) |
| `API001-EP-045` | DELETE | `/v1/users/{userId}/role-grants/{grantId}` | Revoke a role grant | Tenant / Company Admin | Yes |
| `API001-EP-046` | GET | `/v1/roles/{roleId}/members` | List members of a role | Tenant Admin / Security Officer | Yes |

### E.5 Permissions

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-050` | GET | `/v1/permissions` | Retrieve permission catalog | Tenant Admin / Security Officer | Yes |
| `API001-EP-051` | GET | `/v1/users/{userId}/effective-permissions` | Resolve effective permissions for a user in a scope | Tenant Admin / Security Officer / Self | Yes |

### E.6 Configuration

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-060` | GET | `/v1/configuration/keys` | List configuration keys in authorized scope | Tenant / Company Admin | Yes |
| `API001-EP-061` | POST | `/v1/configuration/keys` | Author a configuration key at a scope | Tenant / Company Admin | Yes (keyed) |
| `API001-EP-062` | GET | `/v1/configuration/keys/{keyId}` | Retrieve configuration key detail | Tenant / Company Admin / Security Officer | Yes |
| `API001-EP-063` | PATCH | `/v1/configuration/keys/{keyId}` | Override a configuration key value | Tenant / Company Admin | Yes |
| `API001-EP-064` | GET | `/v1/configuration/effective` | Resolve effective configuration for a scope | Any authenticated (scope-authorized) | Yes |
| `API001-EP-065` | GET | `/v1/configuration/changes` | List pending configuration changes | Tenant / Company Admin | Yes |
| `API001-EP-066` | POST | `/v1/configuration/changes/{changeId}/decision` | Approve or reject a configuration change | Tenant / Company Admin | Yes (keyed) |
| `API001-EP-067` | GET | `/v1/configuration/ownership-conventions` | Read Configuration and Event Ownership Conventions | Any authenticated | Yes |

### E.7 Localization

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-070` | GET | `/v1/localization/packs` | List localization packs | Tenant Admin | Yes |
| `API001-EP-071` | POST | `/v1/localization/packs` | Author a localization pack | Platform Admin / Tenant Admin | Yes (keyed) |
| `API001-EP-072` | GET | `/v1/localization/packs/{packId}` | Retrieve localization pack detail | Tenant Admin | Yes |
| `API001-EP-073` | POST | `/v1/localization/packs/{packId}/activation` | Activate / deactivate a pack at a scope | Tenant Admin | Yes (keyed) |
| `API001-EP-074` | GET | `/v1/localization/effective-locale` | Resolve effective locale for a scope | Any authenticated | Yes |
| `API001-EP-075` | GET | `/v1/localization/regional-defaults` | Retrieve regional defaults in force | Any authenticated | Yes |

### E.8 Audit

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API001-EP-080` | GET | `/v1/audit/events` | Query audit events by filter | Auditor / Security Officer / Tenant Admin | Yes |
| `API001-EP-081` | GET | `/v1/audit/events/{eventId}` | Retrieve an audit event detail | Auditor / Security Officer / Tenant Admin | Yes |
| `API001-EP-082` | POST | `/v1/audit/exports` | Request an audit export over a filter | Auditor / Security Officer | Yes (keyed) |
| `API001-EP-083` | GET | `/v1/audit/exports/{exportId}` | Retrieve export request status | Auditor / Security Officer | Yes |
| `API001-EP-084` | GET | `/v1/audit/ownership-conventions` | Read the Audit Ownership Convention | Any authenticated | Yes |

## F. Request / Response Standards

Business-level conventions only. No wire schemas.

- **Resource Identity.** Every resource is addressed by a stable, tenant-scoped identifier owned by MOD-001; identifiers are opaque and immutable.
- **Case Convention.** Field names use a consistent case convention across every resource; the convention is fixed at implementation time and is version-governed under §L.
- **Timestamps.** All timestamps are UTC and carry an unambiguous ISO representation.
- **Locale-Aware Fields.** Locale-aware content is resolved via `ENG-018` and the Localization Pack Master; callers may pass an explicit locale hint bounded by the caller's authorization.
- **Envelope.** Every response conveys the resource plus a stable metadata block (resource identity, lifecycle state, tenant scope, audit-visibility). No implementation detail leaks into the envelope.

## G. Authentication & Authorization

Business-level expectations only. Implementation is delegated to the platform engines and ADRs cited.

- **OAuth / SSO Handoff.** All consumer categories authenticate via `ENG-001`. The SSO / MFA mechanics are out of scope (Publication §15); the API accepts only authenticated principals.
- **JWT Lifecycle.** Session credentials follow the platform Identity Engine's lifecycle; expiry, refresh, and revocation are `ENG-001` concerns. The API surface honours revocation on every request.
- **RBAC + ABAC.** Every request is evaluated by `ENG-002` with grants managed by `ENG-003` per `ADR-032`. Role membership provides the coarse permission set; attribute-based context (tenant, organization, company, branch, resource) narrows the decision.
- **Service Identity.** Service-to-service calls carry a service identity under the same `ENG-001` boundary; service principals honour the same RBAC + ABAC evaluation.
- **Cross-Tenant Access.** Cross-tenant reads and writes are not exposed on this surface. Platform Admin cross-tenant operations use platform-scope resources subject to explicit authorization.

## H. Validation Rules

Rules are inherited verbatim from Publication §6 and Module PRD §7. Key API-visible invariants:

- Tenant isolation is enforced on every read and write; no endpoint bypasses it.
- A Company cannot be archived while it has open Financial Years.
- A User cannot self-revoke the last platform-admin role in a tenant.
- Configuration changes are tenant-scoped and versioned; overrides outside the author's scope are rejected.
- Financial-year close is blocked by unresolved downstream-module preconditions declared by the Publication.
- Localization pack activation outside the activator's scope is rejected.
- Audit endpoints never mutate audit state; the surface is strictly read-only over `ENG-004` outputs and the Export Request resource.

## I. Error Handling

Business-level error behaviour. No protocol-level status catalog.

- **Standard Error Envelope.** Every error response conveys a business error category, a human-readable summary, and a stable business error identifier suitable for support and audit correlation. No stack traces, protocol codes beyond the standard set, or internal implementation identifiers are leaked.
- **Status Code Mapping.** Success responses use the standard success band; authorization denials use the standard authorization-denied band; validation failures use the standard validation band; resource-not-found uses the standard not-found band; conflicts use the standard conflict band; server-side unavailability uses the standard unavailable band. The precise codes and their business meaning are fixed at implementation time under §L.
- **Retry Guidance.** Idempotent operations (GET, PUT-like updates, keyed mutations) are safe to retry under the same idempotency key. Non-idempotent operations MUST NOT be retried without a fresh idempotency key. Retry timing follows the platform back-off convention.
- **Authorization Failures** disclose no protected content or existence beyond what the caller's role permits; denials are audited via `ENG-004`.
- **Validation Failures** are precise about which business field is invalid, without leaking business content the caller is not authorized to read.
- **Lifecycle Failures** (e.g. cannot close a Financial Year, cannot archive a Company) return the applicable business rule identifier from §H so the caller can present a coherent remediation.

## J. Pagination, Filtering & Sorting

- **Pagination.** Every list endpoint (`API001-EP-001`, `010`, `014`, `017`, `019`, `030`, `040`, `046`, `060`, `065`, `070`, `080`, `083`) supports stable, opaque cursor-style pagination bounded by an implementation-declared maximum page size.
- **Filtering.** Filtering is limited to business fields declared by the Publication. Audit filtering (`API001-EP-080`) supports actor, tenant scope, time range, event category, and object reference. Configuration change filtering (`API001-EP-065`) supports scope and change state. Role member filtering (`API001-EP-046`) supports scope.
- **Sorting.** Sorting is limited to stable business fields with well-defined ordering (identifier, lifecycle timestamp, updated timestamp).
- **Field Selection.** Optional field selection is not exposed at the business-API level; response envelopes are stable.

## K. Idempotency & Concurrency

- **Idempotency Keys.** Every keyed mutation endpoint (marked "Yes (keyed)" in §E) accepts a caller-supplied idempotency key. Repeat submissions with the same key and payload are treated as the same operation; a repeat submission with the same key but a different payload is rejected.
- **Optimistic Concurrency.** Mutating operations on stateful resources (Tenant lifecycle, Configuration Key, Role, User, Localization Pack) honour an optimistic-concurrency token (an opaque version identifier). Stale-token updates return a conflict outcome; the caller MUST re-read and retry with the current token.
- **Long-Running Operations.** Tenant provisioning, financial-year close, localization pack activation, and audit export are represented as resources with explicit lifecycle state. Callers poll the resource; the API never blocks indefinitely.

## L. Versioning Strategy

Governance expectations only; no implementation strategy.

- **Version Path.** Every endpoint is served under the `v1` version namespace. The version identifier is the sole versioning surface exposed to callers.
- **Backward Compatibility.** Every published capability MUST remain backward compatible until formally deprecated. Business-visible entities and lifecycle states enumerated in §D are compatibility-critical.
- **Additive Evolution.** Non-authoritative refinements follow the additive-only convention (new endpoints, new optional fields, new optional filters). Any change that alters a business capability, master data lifecycle, transaction lifecycle, event, or authorization boundary is a governed change and requires a new Module Baseline version per Publication §16.
- **Deprecation Governance.** Deprecation follows the governance lifecycle `Active → Deprecated → Archived` and is reflected in the Module Publication and this specification. No silent removal is permitted.
- **Cross-Platform Consistency.** WEB-001, MOB-001, and this specification MUST remain aligned. A change to any capability triggers a consumer impact assessment across all three surfaces.

## M. Security

Business-level expectations only. Implementation is delegated to platform engines and ADRs.

- **Multi-Tenant Isolation** (`ADR-011`). Enforced on every request. Cross-tenant leaks are not exposed on this surface. Platform-scope resources honour explicit authorization.
- **Audit Visibility** (`ADR-014`). Every state-changing operation and every authorization denial is audited via `ENG-004`. The Audit Review surface (§C.8) is a read-only projection.
- **RBAC + ABAC** (`ADR-032`). Every request is authorized as described in §G.4; no authority named in Publication §4 is bypassable via the API.
- **Data Classification.** Sensitive fields (user personal information, security-officer-visible role grants, audit content) honour the platform data-classification policy and the caller's authorization boundary.
- **Transactional Outbox** (`ADR-051`). Events emitted by state-changing operations follow the Transactional Outbox convention via `ENG-024` / `ENG-005`; no event is lost across a mutation boundary.

## N. Performance Expectations

Business-facing envelopes only; no infrastructure sizing.

- **Interactive Reads.** All list and retrieval endpoints inherit the platform interactive latency envelope declared in Module PRD §11.
- **Interactive Writes.** Non-batched mutations (single-resource CRUD, role grant / revoke, configuration override, user invite) inherit the interactive envelope.
- **Long-Running Operations.** Tenant provisioning (`API001-EP-003`), financial-year close (`API001-EP-021`), localization pack activation (`API001-EP-073`), and audit export (`API001-EP-082`) inherit the platform batch envelope; callers poll for completion.
- **Effective Configuration Resolution.** `API001-EP-064` is bounded by the effective-configuration resolution envelope declared by the Configuration Hierarchy Authority.
- **Audit Queries.** `API001-EP-080` inherits the audit-query envelope declared by `ENG-004`.

## O. Integration Points

Only engines consumed by MOD-001 per Publication §11 are enumerated. No new engine dependencies introduced.

- **`ENG-001` (Identity Engine).** All authentication (§G.1, §G.2).
- **`ENG-004` (Audit Engine).** Audit collection, storage, integrity, lifecycle; the Audit Review surface (§C.8) reads through this engine per `ADR-014`.
- **`ENG-005` (Event Engine).** Event Ownership Convention; delivery of Platform-emitted events (§D) via the Transactional Outbox pattern per `ADR-051`.
- **`ENG-006` (Notification Engine).** Delivery of platform-administrative notifications — user invitations, configuration approval reminders, audit-export-ready signals.
- **`ENG-018` (Localization Engine).** Localization Pack lifecycle, locale resolution, regional defaults (§C.7).
- **`ENG-024` (Configuration Engine).** Configuration hierarchy resolution, effective configuration (§C.6).

Cross-cutting alignments:

- **Notification Engine (`ENG-006`).** Every asynchronous outcome the caller must observe (invitation dispatched, export ready, activation completed) surfaces both through the resource lifecycle state and through `ENG-006` where the notification policy applies.
- **Audit Engine (`ENG-004`).** Every state-changing endpoint contributes an audit record. No caller can suppress the audit record.
- **Configuration Engine (`ENG-024`).** All API behaviour that depends on tenant-scoped configuration (retention windows, approval requirements, invitation policies) resolves via `ENG-024`.

## P. API Traceability Matrix

Every MOD-001 capability from Publication §3 and §4 is represented. Every endpoint referenced in this matrix appears in §E; every endpoint in §E maps back to at least one capability row. No orphan capabilities. No baseline-introduced items.

| MOD Capability | API Resource(s) | Endpoint(s) | Engine(s) | ADR(s) | Notes |
| --- | --- | --- | --- | --- | --- |
| Tenancy Model Authority (§4.1) | Tenant | `API001-EP-001`, `API001-EP-002`, `API001-EP-003`, `API001-EP-004` | ENG-001, ENG-004, ENG-005, ENG-024 | ADR-011, ADR-014, ADR-032, ADR-051 | Platform-scope operator per §B.5. |
| Tenant Isolation Rule Authority (§4.1) | (cross-cutting) | (all endpoints, §B.5) | ENG-001, ENG-002 | ADR-011, ADR-032 | Enforced on every request; not a discrete endpoint. |
| Organization / Company / Branch / Financial Year Master Authority (§4.2) | Organization, Company, Branch, Financial Year | `API001-EP-010`–`API001-EP-020` | ENG-001, ENG-004, ENG-005, ENG-024 | ADR-011, ADR-014, ADR-032, ADR-051 | Emits `CompanyCreated`. |
| Organizational Hierarchy Lifecycle Authority (§4.2) | Organization, Company, Branch, Financial Year | `API001-EP-013`, `API001-EP-020`, `API001-EP-021` | ENG-001, ENG-004, ENG-005 | ADR-011, ADR-014, ADR-051 | Emits `FinancialYearClosed`; PRD §7 rule "no delete company with open FY". |
| User Master Authority (§4.3) | User | `API001-EP-030`–`API001-EP-034` | ENG-001, ENG-004, ENG-005, ENG-006 | ADR-011, ADR-014, ADR-032 | Emits `UserInvited`; last-platform-admin rule enforced. |
| Role Master Authority (§4.3) | Role, Role Grant | `API001-EP-040`–`API001-EP-046` | ENG-001, ENG-003, ENG-004, ENG-005 | ADR-032, ADR-014, ADR-051 | Emits `RoleGranted`. |
| Permission Resolution Authority (§4.3) | Permission | `API001-EP-050`, `API001-EP-051` | ENG-002, ENG-003, ENG-004 | ADR-032, ADR-014 | Read-only evaluation; grants via §C.4. |
| Configuration Hierarchy Authority (§4.4) | Configuration Key | `API001-EP-060`–`API001-EP-063` | ENG-001, ENG-004, ENG-005, ENG-024 | ADR-011, ADR-014, ADR-051 | Scope-versioned. |
| Effective Configuration Resolution Authority (§4.4) | Configuration Key | `API001-EP-064` | ENG-024, ENG-004 | ADR-011, ADR-014 | Deterministic resolution across the hierarchy. |
| Event Ownership Convention Authority (§4.4) | (cross-cutting) | `API001-EP-067` | ENG-005 | ADR-051 | Read of the convention in force. |
| Configuration Ownership Convention Authority (§4.4) | Configuration Change | `API001-EP-065`, `API001-EP-066`, `API001-EP-067` | ENG-004, ENG-005, ENG-024 | ADR-014, ADR-051 | Emits `ConfigurationChanged`. |
| Localization Pack Master Authority (§4.5) | Localization Pack | `API001-EP-070`, `API001-EP-071`, `API001-EP-072` | ENG-001, ENG-004, ENG-018 | ADR-011, ADR-014 | — |
| Localization Pack Lifecycle Authority (§4.5) | Localization Pack | `API001-EP-073`, `API001-EP-074`, `API001-EP-075` | ENG-004, ENG-005, ENG-018 | ADR-014, ADR-051 | Activation, inheritance, regional defaults, locale resolution. |
| Localization Ownership Convention Authority (§4.5) | (cross-cutting) | `API001-EP-075` | ENG-018 | ADR-014 | Convention exposed read-only. |
| Audit Review Surface Authority (§4.6) | Audit Event, Audit Export Request | `API001-EP-080`, `API001-EP-081`, `API001-EP-082`, `API001-EP-083` | ENG-004, ENG-006 | ADR-014 | Read-only projection of `ENG-004`. |
| Audit Ownership Convention Authority (§4.6) | (cross-cutting) | `API001-EP-084` | ENG-004 | ADR-014 | Convention exposed read-only; audit state never mutated by the API. |

## Q. Cross-Platform Consistency

Terminology, personas, workflows, and authorization boundaries are aligned across WEB-001, MOB-001, and this specification. The mapping below preserves consistency; it introduces no new alignment obligations beyond those in the Published Module.

| API Domain (§C) | WEB-001 Section | MOB-001 Section |
| --- | --- | --- |
| C.1 Tenancy | Screen Inventory (Tenants); User Journeys (Provision or Adjust a Tenant) | §C.7 Journey — Provision or Adjust a Tenant; §E.2 Tenancy screens |
| C.2 Organization | Screen Inventory (Organizations, Companies, Branches, Financial Years); User Journeys (Set Up Organization; Open/Close FY) | §C.6, §C.8 Journeys; §E.3, §E.8 screens |
| C.3 Users | Screen Inventory (Users); User Journeys (Invite / Deactivate) | §C.1 Journey; §E.4 screens |
| C.4 Roles | Screen Inventory (Roles); User Journeys (Grant / Revoke Role) | §C.2 Journey; §E.4 screens |
| C.5 Permissions | Screen Inventory (Permissions Explorer read-only) | §E.4 `MOD001-SCR-016` |
| C.6 Configuration | Screen Inventory (Configuration Keys, Approvals, Effective Configuration); User Journeys (Approve Configuration Change) | §C.3 Journey; §E.5 screens |
| C.7 Localization | Screen Inventory (Localization Packs, Regional Defaults); User Journeys (Activate Localization Pack) | §C.5 Journey; §E.6 screens |
| C.8 Audit | Screen Inventory (Audit Timeline, Filters, Exports); User Journeys (Review Audit Event) | §C.4 Journey; §E.7 screens |

Cross-cutting alignments:

- **Personas.** Business roles are inherited verbatim from Publication §3 across all three specifications (Platform Admin, Tenant Admin, Company Admin, Auditor, Security Officer); no new personas.
- **Authorization Visibility.** WEB-001, MOB-001, and this §G share the same authorization model rooted in `ADR-032`.
- **Approval Behaviour.** The configuration-change approval workflow is identical across surfaces; approvals are never applied offline.
- **Audit Visibility.** All three specifications share the same audit posture via `ENG-004` / `ADR-014`.
- **Ownership Conventions.** Event, Configuration, Localization, and Audit Ownership Conventions are exposed identically across web, mobile, and API surfaces.

## R. References

- [`docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md`](../../45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md) — authoritative source.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`](../../30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md)
- [`docs/20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- [`docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md`](../web/WEB-001_PLATFORM_ADMINISTRATION.md) — consistency reference only.
- [`docs/60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION.md`](../mobile/MOB-001_PLATFORM_ADMINISTRATION.md) — consistency reference only.
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md`](../../15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md)
- [`docs/60-solution-design/README.md`](../README.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)

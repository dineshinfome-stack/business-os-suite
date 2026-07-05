---
title: "Security Architecture"
summary: "The platform security constitution: threat model, authentication, RBAC + ABAC authorization, tenant isolation, data classification, encryption, secrets, audit, compliance architecture and posture, and incident response principles."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "security", "platform", "pass-4c"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
  - "02-architecture/database-standards"
  - "02-architecture/multi-tenant-architecture"
  - "02-architecture/data-dictionary"
  - "02-architecture/api-architecture"
referenced_by: []
---

# Security Architecture

> Part of **Pass 4C — Platform Constitution**. Defines the security principles, authorization model, isolation strategy, data classification, and compliance posture every BusinessOS capability must obey. It does **not** contain IAM policy documents, RLS SQL, secret values, cryptographic algorithm choices, or vendor tooling — those are downstream of this document.

## Overview

Security in BusinessOS is a platform property, not a per-module afterthought. Every domain — accounting, inventory, payroll, AI — inherits the same identity model, the same authorization primitives, the same tenant isolation guarantees, the same audit trail, and the same data-classification vocabulary. This document is the constitution those inheritances rest upon.

**Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## Security Principles

- **SP-01 — Secure by default.** Every capability starts closed; access is granted, never assumed.
- **SP-02 — Defense in depth.** No single control is the last line. Identity, authorization, tenant isolation, encryption, audit, and monitoring reinforce one another.
- **SP-03 — Least privilege.** Every principal (user, service, integration, AI) receives the smallest scope needed to perform its work.
- **SP-04 — Tenant isolation is absolute.** A cross-tenant read or write is a critical incident regardless of intent.
- **SP-05 — Explicit trust boundaries.** Every input crossing a boundary is validated; every principal crossing a boundary is re-authorized.
- **SP-06 — Auditability is non-negotiable.** Every security-relevant action is recorded, correlated, and tamper-evident.
- **SP-07 — Data classification governs handling.** How data is stored, transmitted, logged, cached, and retained follows its classification tier.
- **SP-08 — Fail closed.** When in doubt — configuration missing, dependency unhealthy, claim ambiguous — deny.
- **SP-09 — Privacy by design.** Personal data is minimized, purpose-bound, and subject to statutory rights from day one.
- **SP-10 — Compliance is a posture, not a claim.** The platform is architected to *support* regulatory certification; it does not itself constitute certification.

## Threat Model at Platform Level

The platform-level threat model addresses classes of adversaries and failure modes that every module inherits. Module-specific threats live in module PRDs.

- **External unauthenticated attackers** — automated probing, credential stuffing, injection, denial of service.
- **Authenticated malicious tenants** — attempts to enumerate or reach other tenants' data.
- **Authenticated malicious users within a tenant** — privilege escalation, data exfiltration, forged approvals.
- **Compromised integration credentials** — over-scoped tokens, leaked webhook secrets.
- **Compromised AI or automation principals** — prompt injection, tool misuse, unattended escalation.
- **Insider risk within the platform operator** — privileged access misuse, break-glass abuse.
- **Supply-chain risk** — malicious dependencies, compromised build pipelines, unsafe transitive packages.
- **Availability threats** — denial of service, resource exhaustion, cascading failures.

The platform's mitigations are the controls named in this document; module-level residual risk is documented in the module's PRD.

## Authentication

- **Identity** — every request carries a principal. Principals include human users, service accounts, integration clients, webhook receivers, and AI actors.
- **Credentials** — the platform supports interactive user authentication and machine-to-machine authentication; the specific mechanisms (password + MFA, SSO/federation, key-based, mutual TLS) are chosen per principal class and documented in dedicated foundation-domain specifications.
- **Sessions** — sessions have bounded lifetime; refresh flows are explicit and revocable.
- **MFA** — multi-factor authentication is REQUIRED for administrative principals and RECOMMENDED for all users, with tenant-configurable enforcement.
- **Token conveyance** — bearer tokens travel in the `Authorization` header only. Tokens MUST NOT appear in URLs, query strings, or logs.
- **Impersonation and delegation** — permitted only through a distinct, audited flow with a separate scope; the audit record always names both the acting principal and the impersonated one.

## Authorization Model (RBAC + ABAC)

Authorization combines **role-based** and **attribute-based** access control. Neither alone is sufficient for an ERP.

### Role-Based Access Control (RBAC)

- **Permissions** are fine-grained action verbs on resource types (`accounting.voucher.post`, `inventory.item.update`, `hr.employee.terminate`).
- **Roles** are named bundles of permissions curated per business function (e.g. *Accounts Clerk*, *Warehouse Supervisor*, *HR Manager*).
- **Role assignment** binds a principal to one or more roles within a scope (tenant, company, branch, or resource).
- **Role hierarchy** is expressed by permission composition, not by inheritance chains; there is no implicit "super role."

### Attribute-Based Access Control (ABAC)

- **Attributes** describe principals (department, seniority), resources (ownership, status, classification), and context (time, location, session risk).
- **Policies** express conditions such as *approve only vouchers below your approval limit*, *edit only records you own*, *read financial data only during business hours from managed devices*.
- ABAC policies operate on top of RBAC: a request must first satisfy RBAC and then satisfy any applicable ABAC condition.

### Role / Permission Taxonomy

The platform reserves three role tiers:

- **System roles** — defined by the platform (e.g. *Tenant Owner*, *Platform Support with Break-Glass*). Immutable per tenant.
- **Standard roles** — shipped defaults per domain (e.g. *Accounts Clerk*, *Sales Manager*). Editable per tenant; changes are audited.
- **Custom roles** — tenant-authored, composed from published permissions. Never exceed permissions granted to their author.

Permissions are strictly namespaced by domain and never overlap; there is no permission that grants access outside its domain's scope of ownership.

### Least Privilege

- Principals accumulate scopes explicitly. There is no wildcard permission (`*`) exposed to tenants.
- Elevated actions (mass update, export of sensitive data, cross-company reporting) require distinct permissions and produce distinct audit records.

## Tenant Isolation Enforcement

Isolation is enforced in **layers**, and every layer is authoritative on its own:

- **Identity claim layer** — the authenticated principal's claims declare the tenant(s) it may access. Claims are cryptographically integrity-protected.
- **Application layer** — every request handler validates that the requested scope (tenant, company, branch) is within the claim's allowable set.
- **Data layer** — row-level security predicates enforce tenant scope at the database, so a missing check in application code cannot leak data.
- **Cache layer** — cache keys include tenant scope; no cache entry is shared across tenants.
- **Transport / edge layer** — outbound traffic (webhooks, notifications, exports) is bound to the originating tenant's endpoints and secrets.

Cross-tenant operations (support tooling, platform operator maintenance) are performed only through a distinct principal class subject to *Privileged Access & Break-Glass* below.

## Data Classification

Every data element handled by the platform is classified into one of six tiers. Handling requirements (transport, storage, logging, caching, retention, export, AI exposure) derive from the tier.

| Tier | Description | Examples |
|---|---|---|
| **Public** | Intended for unrestricted distribution. | Marketing content, public reference data, published API documentation. |
| **Internal** | Not confidential but not for public release. | Non-sensitive configuration, tenant-shared master data of non-restricted nature. |
| **Confidential** | Business-sensitive; disclosure would harm the tenant. | Contracts, negotiated prices, unpublished plans, internal correspondence. |
| **Financial** | Regulated business data with statutory retention. | Vouchers, ledgers, tax filings, statutory reports. |
| **Personal** | Data about identifiable individuals subject to privacy law. | Employee records, customer contacts, payroll data, biometric identifiers. |
| **Sensitive** | Data requiring the strongest controls. | Authentication secrets, cryptographic keys, health information, government identifiers. |

Handling rules per tier are captured in the Data Dictionary and reinforced across encryption, audit, logging, and AI-exposure policies. Data may not be reclassified downward without an owner sign-off recorded in the audit trail.

## Encryption

- **In transit** — all network traffic between clients, services, and dependencies is encrypted using current-generation transport security. Unencrypted transport is forbidden across trust boundaries.
- **At rest** — persistent storage (databases, object stores, backups, exports) is encrypted at rest.
- **At column level** — fields classified *Sensitive*, and select *Personal* fields per jurisdictional requirement, are additionally encrypted at column level with keys managed independently of the database engine.
- **Key management** — keys are managed centrally, rotated on a documented schedule, and revocable per tenant where residency requires it. Key material is never present in application source, configuration files, or logs.
- **Backups and exports** — inherit the classification of their sources and are encrypted with equivalent strength; export destinations obey the source classification's handling rules.

## Secrets Management

- Secrets (API keys, webhook signing keys, database credentials, cryptographic material) live in a dedicated secret store, never in source control or client-visible configuration.
- Secrets are **scoped**: per tenant, per integration, per environment.
- Secrets **rotate on a documented cadence** and on suspicion of compromise; rotation is a first-class operation, not a fire drill.
- Access to secrets is audited; the audit records the reader, the purpose, and the correlation id of the operation.
- The platform provides a canonical *break-glass* flow for retrieving elevated secrets; see *Privileged Access & Break-Glass*.

## Audit & Non-Repudiation

- Every security-relevant action produces an audit record: authentication events, authorization decisions (grants and denials), configuration changes, permission grants, break-glass access, data exports, deletions, and privileged reads.
- Audit records include: actor, tenant, correlation id, action code, target, timestamp, outcome, and (where applicable) before/after state or a reference to it.
- Audit is **append-only** and tamper-evident; modifications to audit records are themselves audited and require the highest authorization tier.
- Retention of audit follows statutory retention for financial records at minimum; classification-specific overrides are captured in Compliance Architecture & Posture.
- Audit is queryable by tenant administrators for their scope, and by the platform operator subject to break-glass and privileged-access controls.

## Privileged Access & Break-Glass

- Privileged operator access to tenant data is prohibited except through an explicit break-glass flow.
- Break-glass access requires: a stated reason, a linked support ticket or incident, dual authorization for the most sensitive scopes, and a bounded time window that automatically expires.
- Every break-glass session is recorded in full and its audit trail is delivered to the affected tenant.
- Standing privileged access is forbidden; roles that once had it are decomposed into just-in-time grants.

## Input Validation & Trust Boundaries

- Every field received from an untrusted source is validated against the API specification for type, shape, size, and permissible values.
- Rich content (HTML, markdown, uploaded documents) is normalized and sanitized before storage and re-sanitized on render.
- File uploads are scanned, size-bounded, and stored under classification-appropriate controls; executable content is never rendered inline.
- Server-side validation is authoritative; client-side validation is a UX convenience only.
- Trust boundaries are drawn at ingress, at every service call, at the data layer, and at every integration.

## Rate Limiting & Abuse Controls

- Rate limiting is coordinated with API Architecture; security-relevant limits (login attempts, MFA challenges, password reset, export triggers) are stricter than default API tiers.
- Repeated failures against sensitive endpoints trigger progressive controls: elongated back-off, MFA challenge escalation, temporary account locks, and administrator notifications.
- Bot and automation detection is applied at edge and at sensitive interior surfaces.

## Supply-Chain Security Posture

- Third-party dependencies are inventoried; a software bill of materials is produced for every release.
- Dependencies are subject to vulnerability scanning; findings above documented severity block release until mitigated or accepted with an explicit exception.
- Build pipelines produce signed, verifiable artifacts. Deployments accept only signed artifacts.
- New dependencies undergo review for licensing, maintenance health, and security posture before adoption.

## Compliance Architecture & Posture

BusinessOS is **architected for compliance**, not certified by this document. This section defines the architectural approach to regulatory compliance and the relationship between design decisions and independently obtained certifications or attestations.

### Compliance vs Certification

- **Compliance architecture** — the platform is designed so that regulatory controls can be met by configuration and operation.
- **Certification / attestation** — is obtained independently, per environment and per deployment, through recognized auditors and issuing bodies.
- **This document MUST NOT be read as a certification, an attestation, or a claim of regulatory approval.** No specific certification (SOC 2, ISO 27001, PCI DSS, HIPAA, etc.) is asserted here; each is pursued as a program in its own right, when and where warranted.

### Compliance-by-Design Principles

- **Data-classification driven** — handling controls flow from classification, not from ad-hoc per-regulation logic.
- **Least data** — collection, retention, replication, and export are minimized to what the capability requires.
- **Purpose limitation** — data collected for one purpose is not reused for another without an explicit lawful basis or consent record.
- **Traceability** — every processing action against classified data is auditable to a principal and a purpose.
- **Right by default** — statutory rights (access, portability, correction, erasure) are supported by first-class capabilities rather than case-by-case data engineering.
- **Regional adaptability** — the platform accommodates jurisdictional variance without forking the product.

### Jurisdictional Adaptability

The platform is designed to accommodate regulatory variance without redesign:

- **Erasure (GDPR-style right to be forgotten)** — supported through purpose-bound retention, cryptographic erasure of sensitive fields, and statutory-preservation exceptions for financial records. Erasure requests produce an audit trail that itself survives statutory retention.
- **Statutory retention** — financial records, tax records, and other statutorily preserved data are retained for the maximum applicable window, regardless of erasure requests, and the reason is recorded.
- **Data residency** — the architecture supports pinning a tenant's data to a jurisdiction. Residency choices are captured at tenant provisioning and enforced by the deployment topology (owned by Pass 4D — Operational Architecture).
- **SOC / ISO alignment** — the platform's controls (identity, authorization, audit, change management, incident response) are structured to be *mappable* to widely recognized frameworks. Formal alignment is pursued as certification programs, not asserted here.
- **Sector regulation** — where a tenant operates under sector-specific obligations (healthcare, banking, public sector), the platform provides classification and configuration primitives rather than sector-specific hard-coded behavior.

### Relationship to Audit, Retention, Security, and Data Governance

- **Audit** is the evidence layer for compliance; retention rules for audit meet or exceed the strictest applicable requirement.
- **Retention** rules are set per classification tier and per jurisdiction; deletion is a durable operation, not merely a UI action.
- **Security** controls (authentication, authorization, encryption, incident response) constitute the technical safeguards that compliance frameworks require.
- **Data Governance** (Pass 4B) defines the vocabulary, ownership, and lineage those controls operate on.

### Compliance Non-Claims

- No certification or regulatory approval is asserted by this document.
- Any published compliance status is maintained separately by the platform operator, per deployment and per certification program.

## Incident Response Principles

- **Preparation** — playbooks exist for the incident classes named in the Threat Model; on-call rotations are staffed; contact chains are current.
- **Detection** — telemetry from authentication, authorization, audit, rate limits, and dependency health is monitored for anomalies (owned in detail by Observability Architecture in Pass 4D).
- **Containment** — the platform provides emergency controls (session revocation, key rotation, integration disablement, tenant isolation extensions) usable within minutes.
- **Eradication and recovery** — root cause is identified; controls are hardened; affected data is restored from tested backups.
- **Notification** — affected tenants are notified in line with statutory obligations and contractual commitments; timing, content, and channel are documented per jurisdiction.
- **Post-incident review** — every significant incident produces a written review with concrete follow-ups tracked to closure.

## Security Decisions Pending

| Topic | Why Deferred | Rough Window | Owner | ADR Placeholder |
|---|---|---|---|---|
| Authentication mechanisms per principal class (SSO federation, mTLS, key auth) | Depends on foundation-domain specifications and deployment context. | Pass 5 foundation specs. | Platform + Security | ADR-TBD |
| MFA enforcement defaults and progressive-authentication rules | Requires tenant-segment analysis. | Pre-GA. | Platform + Security | ADR-TBD |
| Key management topology and rotation cadence | Depends on deployment topology (Pass 4D). | Pass 4D. | Security + Operations | ADR-TBD |
| Column-level encryption coverage per Personal-tier field | Requires per-jurisdiction analysis. | Per-jurisdiction rollout. | Security + Data | ADR-TBD |
| Certification programs to pursue (SOC 2, ISO 27001, others) | Business decision driven by market entry. | Business planning. | Executive + Security | ADR-TBD |
| Data residency regions and topology | Depends on operational architecture. | Pass 4D. | Operations + Security | ADR-TBD |
| Break-glass dual-authorization scope | Requires operational-model definition. | Pass 4D. | Security + Operations | ADR-TBD |

*Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.*

## Conforms to Canon

- **A.3 / A.4** — Security Architecture is authoritative for platform security; PRDs and code conform to it.
- **P.2** — Normative language follows RFC 2119.
- **Canon multi-tenancy chapter** — tenant isolation is enforced in claim, application, data, cache, and transport layers.
- **Canon audit chapter** — every security-relevant action is captured in an append-only, tamper-evident audit trail.
- **Canon evolution chapter** — security controls evolve through the ADR process, never by ad-hoc code change.
- **Canon AI chapter** — AI principals are ordinary security principals with scoped, audited authorization; they never bypass RBAC, RLS, workflow, or audit.

## References

- Master Architecture (Pass 4A)
- Domain Map (Pass 4A)
- Multi-Tenant Architecture (Pass 4B)
- Data Dictionary (Pass 4B)
- Database Standards (Pass 4B)
- API Architecture (Pass 4C)
- AI Architecture (Pass 4C)
- Foundation Domain — Authentication
- Foundation Domain — Roles & Permissions
- Foundation Domain — Audit
- ADR-0002 — Multi-Tenant Strategy
- BusinessOS Canon

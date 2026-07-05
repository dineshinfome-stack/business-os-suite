---
title: "ADR Index"
summary: "Master index of every Architecture Decision Record: ID, title, category, status, related engines, and supersession links."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["adr", "index"]
document_type: "Governance Guide"
---

# ADR Index

## Purpose

The **ADR Index** is the single tabular index of every Architecture Decision Record in BusinessOS. It exists to support:

- architecture reviews and governance meetings,
- impact analysis when a decision changes,
- AI-assisted retrieval and code generation,
- onboarding of new engineers.

This index is **derived** from the individual ADR files. On any conflict, the ADR file wins and this index is corrected in the same change.

## How to Read This Index

| Column | Meaning |
| --- | --- |
| **ADR ID** | Permanent identifier `ADR-NNN`; never reassigned. |
| **Title** | Human-readable title, linked to the ADR file. |
| **Category** | One of the nine ADR categories. |
| **Status** | `Draft` · `Proposed` · `Accepted` · `Superseded` · `Deprecated` · `Rejected`. |
| **Related Engines** | ERP Core Engine IDs (`ENG-NNN`) impacted by this decision. |
| **Supersedes** | ADR IDs replaced by this ADR, if any. |
| **Superseded By** | ADR ID that replaces this ADR, if any. |

## Status Legend

- **Draft** — being written; not yet reviewable.
- **Proposed** — complete draft; open for review.
- **Accepted** — ratified; authoritative.
- **Superseded** — replaced by a newer ADR.
- **Deprecated** — no longer recommended; not yet replaced.
- **Rejected** — considered and declined.

## Maintenance Rule

Adding, superseding, or changing the status of any ADR MUST update this index in the same change. This index is a projection of the ADR files; the ADR files are the source of truth.

## Index

| ADR ID | Title | Category | Status | Related Engines | Supersedes | Superseded By |
| --- | --- | --- | --- | --- | --- | --- |
| ADR-001 | [Modular Monolith](./architecture/ADR-001-modular-monolith.md) | Architecture | Accepted | ENG-001..ENG-028 | — | — |
| ADR-002 | [Domain-Driven Design](./architecture/ADR-002-domain-driven-design.md) | Architecture | Accepted | ENG-001..ENG-028 | — | — |
| ADR-003 | [Event-Driven Communication](./architecture/ADR-003-event-driven-communication.md) | Architecture | Accepted | ENG-025, ENG-004, ENG-019, ENG-020 | — | — |
| ADR-004 | [Plugin Extension Model](./architecture/ADR-004-plugin-extension-model.md) | Architecture | Accepted | ENG-005, ENG-013, ENG-014 | — | — |
| ADR-005 | [Clean Architecture](./architecture/ADR-005-clean-architecture.md) | Architecture | Accepted | ENG-001..ENG-028 | — | — |
| ADR-006 | [CQRS Usage Guidelines](./architecture/ADR-006-cqrs-usage-guidelines.md) | Architecture | Proposed | ENG-022, ENG-023, ENG-024 | — | — |
| ADR-010 | [PostgreSQL as System of Record](./data/ADR-010-postgresql-as-system-of-record.md) | Data | Proposed | ENG-018, ENG-019, ENG-020 | — | — |
| ADR-011 | [Multi-Tenant Isolation](./data/ADR-011-multi-tenant-isolation.md) | Data | Accepted | ENG-001, ENG-002 | — | — |
| ADR-012 | [UUID Primary Keys](./data/ADR-012-uuid-primary-keys.md) | Data | Proposed | — | — | — |
| ADR-013 | [Money Representation](./data/ADR-013-money-representation.md) | Data | Proposed | ENG-016, ENG-017 | — | — |
| ADR-014 | [Audit Strategy](./data/ADR-014-audit-strategy.md) | Data | Accepted | ENG-004 | — | — |
| ADR-015 | [Soft Delete Policy](./data/ADR-015-soft-delete-policy.md) | Data | Proposed | — | — | — |
| ADR-016 | [Data Versioning](./data/ADR-016-data-versioning.md) | Data | Proposed | ENG-025 | — | — |
| ADR-020 | [API Style: REST-First](./platform/ADR-020-api-style-rest-first.md) | Platform | Proposed | ENG-021 | — | — |
| ADR-021 | [API Versioning](./platform/ADR-021-api-versioning.md) | Platform | Proposed | ENG-021 | — | — |
| ADR-022 | [Error Envelope](./platform/ADR-022-error-envelope.md) | Platform | Proposed | ENG-021 | — | — |
| ADR-023 | [Pagination Standard](./platform/ADR-023-pagination-standard.md) | Platform | Proposed | ENG-021, ENG-022 | — | — |
| ADR-024 | [Webhook Delivery](./platform/ADR-024-webhook-delivery.md) | Platform | Proposed | ENG-025, ENG-026 | — | — |
| ADR-025 | [Feature Flags](./platform/ADR-025-feature-flags.md) | Platform | Proposed | ENG-005 | — | — |
| ADR-026 | [Configuration Hierarchy](./platform/ADR-026-configuration-hierarchy.md) | Platform | Proposed | ENG-005 | — | — |
| ADR-030 | [Authentication Model](./security/ADR-030-authentication-model.md) | Security | Proposed | ENG-001 | — | — |
| ADR-031 | [Authorization Model](./security/ADR-031-authorization-model.md) | Security | Proposed | ENG-002, ENG-003 | — | — |
| ADR-032 | [RBAC + ABAC](./security/ADR-032-rbac-abac.md) | Security | Accepted | ENG-002, ENG-003 | — | — |
| ADR-033 | [Secrets Management](./security/ADR-033-secrets-management.md) | Security | Proposed | — | — | — |
| ADR-034 | [Encryption Policy](./security/ADR-034-encryption-policy.md) | Security | Proposed | — | — | — |
| ADR-035 | [Data Classification](./security/ADR-035-data-classification.md) | Security | Proposed | ENG-004 | — | — |
| ADR-036 | [Audit Integrity](./security/ADR-036-audit-integrity.md) | Security | Proposed | ENG-004 | — | — |
| ADR-040 | [AI Provider Abstraction](./ai/ADR-040-ai-provider-abstraction.md) | AI | Proposed | ENG-028 | — | — |
| ADR-041 | [Tool Calling Contract](./ai/ADR-041-tool-calling-contract.md) | AI | Proposed | ENG-028 | — | — |
| ADR-042 | [Human Approval Boundary](./ai/ADR-042-human-approval-boundary.md) | AI | Proposed | ENG-028, ENG-011 | — | — |
| ADR-043 | [Prompt Governance](./ai/ADR-043-prompt-governance.md) | AI | Proposed | ENG-028 | — | — |
| ADR-044 | [RAG Architecture](./ai/ADR-044-rag-architecture.md) | AI | Proposed | ENG-028, ENG-022 | — | — |
| ADR-045 | [AI Cost Governance](./ai/ADR-045-ai-cost-governance.md) | AI | Proposed | ENG-028 | — | — |
| ADR-050 | [Event Bus](./integration/ADR-050-event-bus.md) | Integration | Proposed | ENG-025 | — | — |
| ADR-051 | [Transactional Outbox](./integration/ADR-051-transactional-outbox.md) | Integration | Proposed | ENG-025 | — | — |
| ADR-052 | [Retry Policy](./integration/ADR-052-retry-policy.md) | Integration | Proposed | ENG-025, ENG-026 | — | — |
| ADR-053 | [Idempotency](./integration/ADR-053-idempotency.md) | Integration | Proposed | ENG-025, ENG-026, ENG-021 | — | — |
| ADR-054 | [Dead Letter Handling](./integration/ADR-054-dead-letter-handling.md) | Integration | Proposed | ENG-025, ENG-026 | — | — |
| ADR-055 | [External Integration Philosophy](./integration/ADR-055-external-integration-philosophy.md) | Integration | Proposed | ENG-026 | — | — |
| ADR-060 | [Deployment Model](./devops/ADR-060-deployment-model.md) | DevOps | Proposed | — | — | — |
| ADR-061 | [Environment Strategy](./devops/ADR-061-environment-strategy.md) | DevOps | Proposed | — | — | — |
| ADR-062 | [Release Process](./devops/ADR-062-release-process.md) | DevOps | Proposed | — | — | — |
| ADR-063 | [Testing Strategy](./devops/ADR-063-testing-strategy.md) | DevOps | Proposed | — | — | — |
| ADR-064 | [Observability Baseline](./devops/ADR-064-observability-baseline.md) | DevOps | Proposed | — | — | — |
| ADR-065 | [Disaster Recovery](./devops/ADR-065-disaster-recovery.md) | DevOps | Proposed | — | — | — |
| ADR-070 | [Coding Standards](./engineering/ADR-070-coding-standards.md) | Engineering | Proposed | — | — | — |
| ADR-071 | [Documentation Standards](./engineering/ADR-071-documentation-standards.md) | Engineering | Proposed | — | — | — |
| ADR-072 | [Module Boundaries](./engineering/ADR-072-module-boundaries.md) | Engineering | Proposed | ENG-001..ENG-028 | — | — |
| ADR-073 | [Dependency Rules](./engineering/ADR-073-dependency-rules.md) | Engineering | Proposed | ENG-001..ENG-028 | — | — |
| ADR-074 | [Technical Debt Management](./engineering/ADR-074-technical-debt-management.md) | Engineering | Proposed | — | — | — |
| ADR-075 | [Backward Compatibility](./engineering/ADR-075-backward-compatibility.md) | Engineering | Proposed | ENG-021, ENG-025 | — | — |
| ADR-080 | [Design Tokens](./ui/ADR-080-design-tokens.md) | UI | Proposed | — | — | — |
| ADR-081 | [Accessibility Standard](./ui/ADR-081-accessibility-standard.md) | UI | Proposed | — | — | — |
| ADR-082 | [Localization Standard](./ui/ADR-082-localization-standard.md) | UI | Proposed | ENG-006 | — | — |
| ADR-083 | [Offline UX](./ui/ADR-083-offline-ux.md) | UI | Proposed | — | — | — |
| ADR-084 | [Navigation Standards](./ui/ADR-084-navigation-standards.md) | UI | Proposed | — | — | — |

## References

- `docs/11-adrs/README.md`
- `docs/11-adrs/ADR_TEMPLATE.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/canon.md`
- `docs/FOUNDATION_FREEZE_v1.md`

---
title: "Glossary Index"
summary: "Master alphabetical index of BusinessOS terminology, pointing to the authoritative definition in Canon, Architecture, Data Dictionary, or Module PRDs."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["glossary", "index"]
document_type: "Governance Guide"
---

# Glossary Index

> **Derived document.** Index only. Every definition lives in its source document; on any conflict, the source wins and this index is corrected in the same change.

## Purpose

The **Glossary Index** is a single alphabetical pointer to every business or technical term used in BusinessOS. It exists so a reader can find the authoritative definition of a term without knowing which document originally defined it. **No definitions are stored here.**

## How to Read

- **Term** — the canonical name of the concept.
- **Definition Source** — the authoritative document that defines the term (linked).
- **Canon / Architecture / Data Dictionary / Module PRD** — a `✓` marks any additional documents that use or cross-reference the term.

Sources referenced in this index:

- `docs/glossary.md` — general glossary
- `docs/canon.md` — canonical vocabulary
- `docs/02-architecture/data-dictionary.md` — data model terms
- `docs/02-architecture/domain-driven-design.md` — DDD vocabulary
- `docs/02-architecture/domain-map.md` — bounded contexts
- `docs/02-architecture/event-catalog.md` — event names
- `docs/10-erp-core/ENGINE_CATALOG.md` — engine names (`ENG-NNN`)
- `docs/11-adrs/ADR_INDEX.md` — ADR IDs
- Module PRDs (Pass 7+)

## Maintenance Note

This index SHOULD be regenerated or reviewed whenever a term is added, renamed, or removed in any source document, and whenever a Module PRD introduces new terminology. It MUST NOT become an independent source of truth.

## Index

| Term | Definition Source | Canon | Architecture | Data Dictionary | Module PRD (future) |
| --- | --- | --- | --- | --- | --- |
| ABAC | `docs/canon.md` | ✓ | ✓ | — | — |
| Aggregate | `docs/02-architecture/domain-driven-design.md` | — | ✓ | ✓ | — |
| Approval | `docs/10-erp-core/workflow/approval-engine.md` | — | ✓ | — | — |
| Attachment | `docs/10-erp-core/document/attachment-engine.md` | — | ✓ | ✓ | — |
| Audit Entry | `docs/10-erp-core/foundation/audit-engine.md` | — | ✓ | ✓ | — |
| Automation | `docs/10-erp-core/workflow/automation-engine.md` | — | ✓ | — | — |
| Base Currency | `docs/10-erp-core/financial/currency-engine.md` | — | ✓ | ✓ | — |
| Bounded Context | `docs/02-architecture/domain-driven-design.md` | ✓ | ✓ | — | — |
| Branch | `docs/04-domains/foundation/branch.md` | ✓ | ✓ | ✓ | — |
| Business Document | `docs/10-erp-core/document/document-engine.md` | — | ✓ | ✓ | — |
| Canon | `docs/canon.md` | ✓ | — | — | — |
| Capability Interface | `docs/10-erp-core/README.md` | — | ✓ | — | — |
| Clean Architecture | `docs/11-adrs/architecture/ADR-005-clean-architecture.md` | ✓ | ✓ | — | — |
| Company | `docs/04-domains/foundation/company.md` | ✓ | ✓ | ✓ | — |
| Configuration | `docs/10-erp-core/foundation/configuration-engine.md` | — | ✓ | ✓ | — |
| CQRS | `docs/11-adrs/architecture/ADR-006-cqrs-usage-guidelines.md` | — | ✓ | — | — |
| Dashboard | `docs/10-erp-core/intelligence/dashboard-engine.md` | — | ✓ | — | — |
| Data Classification | `docs/11-adrs/security/ADR-035-data-classification.md` | — | ✓ | ✓ | — |
| Derived Document | `docs/DOCUMENT_TRACEABILITY.md` | — | — | — | — |
| Domain Event | `docs/02-architecture/event-catalog.md` | ✓ | ✓ | — | — |
| Domain-Driven Design | `docs/02-architecture/domain-driven-design.md` | ✓ | ✓ | — | — |
| Engine (ERP Core) | `docs/10-erp-core/README.md` | ✓ | ✓ | — | — |
| Engine ID (`ENG-NNN`) | `docs/10-erp-core/ENGINE_CATALOG.md` | — | ✓ | — | — |
| Event Bus | `docs/11-adrs/integration/ADR-050-event-bus.md` | — | ✓ | — | — |
| Event Envelope | `docs/02-architecture/event-catalog.md` | — | ✓ | ✓ | — |
| Feature Flag | `docs/11-adrs/platform/ADR-025-feature-flags.md` | — | ✓ | — | — |
| Financial Year | `docs/04-domains/foundation/financial-year.md` | ✓ | ✓ | ✓ | — |
| Foundation Freeze | `docs/FOUNDATION_FREEZE_v1.md` | ✓ | — | — | — |
| Idempotency Key | `docs/11-adrs/integration/ADR-053-idempotency.md` | — | ✓ | — | — |
| Identity | `docs/10-erp-core/foundation/identity-engine.md` | ✓ | ✓ | ✓ | — |
| Import Batch | `docs/10-erp-core/data-exchange/import-engine.md` | — | ✓ | ✓ | — |
| Integration | `docs/10-erp-core/integration/integration-engine.md` | — | ✓ | — | — |
| Ledger Posting | `docs/10-erp-core/financial/posting-engine.md` | — | ✓ | ✓ | — |
| Locale | `docs/10-erp-core/foundation/localization-engine.md` | ✓ | ✓ | ✓ | — |
| Modular Monolith | `docs/11-adrs/architecture/ADR-001-modular-monolith.md` | ✓ | ✓ | — | — |
| Module PRD | `docs/99-templates/module-prd-template.md` | ✓ | — | — | — |
| Multi-Tenant Isolation | `docs/11-adrs/data/ADR-011-multi-tenant-isolation.md` | ✓ | ✓ | ✓ | — |
| Notification | `docs/10-erp-core/integration/notification-engine.md` | — | ✓ | — | — |
| Numbering Series | `docs/10-erp-core/financial/numbering-engine.md` | — | ✓ | ✓ | — |
| Organization | `docs/04-domains/foundation/organization.md` | ✓ | ✓ | ✓ | — |
| Outbox | `docs/11-adrs/integration/ADR-051-transactional-outbox.md` | — | ✓ | ✓ | — |
| Permission | `docs/10-erp-core/foundation/permission-management-engine.md` | ✓ | ✓ | ✓ | — |
| Plugin | `docs/11-adrs/architecture/ADR-004-plugin-extension-model.md` | ✓ | ✓ | — | — |
| Prompt | `docs/09-ai/prompt-library.md` | — | ✓ | — | — |
| RAG | `docs/11-adrs/ai/ADR-044-rag-architecture.md` | — | ✓ | — | — |
| RBAC | `docs/11-adrs/security/ADR-032-rbac-abac.md` | ✓ | ✓ | — | — |
| Report | `docs/10-erp-core/intelligence/reporting-engine.md` | — | ✓ | — | — |
| Role | `docs/04-domains/foundation/roles-permissions.md` | ✓ | ✓ | ✓ | — |
| Rule (Business Rule) | `docs/10-erp-core/workflow/rules-engine.md` | — | ✓ | — | — |
| Scheduler Job | `docs/10-erp-core/workflow/scheduler-engine.md` | — | ✓ | — | — |
| Search Index | `docs/10-erp-core/intelligence/search-engine.md` | — | ✓ | — | — |
| Soft Delete | `docs/11-adrs/data/ADR-015-soft-delete-policy.md` | — | ✓ | ✓ | — |
| Sprint PRD | `docs/99-templates/sprint-prd-template.md` | ✓ | — | — | — |
| Tax Code | `docs/10-erp-core/financial/tax-engine.md` | — | ✓ | ✓ | — |
| Tenant | `docs/02-architecture/multi-tenant-architecture.md` | ✓ | ✓ | ✓ | — |
| Tool Calling | `docs/11-adrs/ai/ADR-041-tool-calling-contract.md` | — | ✓ | — | — |
| User | `docs/04-domains/foundation/users.md` | ✓ | ✓ | ✓ | — |
| UUID Primary Key | `docs/11-adrs/data/ADR-012-uuid-primary-keys.md` | — | ✓ | ✓ | — |
| Voucher | `docs/10-erp-core/financial/voucher-engine.md` | ✓ | ✓ | ✓ | — |
| Webhook | `docs/11-adrs/platform/ADR-024-webhook-delivery.md` | — | ✓ | — | — |
| Workflow | `docs/10-erp-core/workflow/workflow-engine.md` | ✓ | ✓ | — | — |

## References

- `docs/glossary.md`
- `docs/canon.md`
- `docs/02-architecture/data-dictionary.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/DOCUMENT_TRACEABILITY.md`

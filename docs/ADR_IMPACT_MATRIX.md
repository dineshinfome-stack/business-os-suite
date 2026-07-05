---
title: "ADR Impact Matrix"
summary: "Which documentation is affected when each ADR changes. Derived from each ADR's affected_documents plus explicit engine cross-references."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["adr", "impact", "matrix", "index"]
document_type: "Governance Guide"
---

# ADR Impact Matrix

> **Derived document.** Projection of `docs/11-adrs/ADR_INDEX.md` and each ADR's `affected_documents` frontmatter. On any conflict, the ADR file wins and this matrix is corrected in the same change.

## Purpose

The **ADR Impact Matrix** is an at-a-glance impact-analysis aid. For every ADR, it lists the documentation surfaces that will require review or update if the ADR's status or content changes. It complements — but does not replace — the `affected_documents` field on each ADR.

## How to Read

- **Architecture Documents** — files under `docs/02-architecture/`.
- **ERP Core Engines** — engines referenced by `ENG-NNN`; see `ENGINE_CATALOG.md`.
- **Module PRDs** — Pass 7+ module PRDs under `docs/04-domains/` (placeholder today).
- **Coding Standards** — `docs/03-design/coding-standards.md`.
- **Design Standards** — `docs/03-design/ui-ux-design-system.md`, `docs/03-design/ux-standards.md`.

A `—` indicates no known impact today. As Module PRDs land (Pass 7+), Module PRD cells become concrete.

## Maintenance Note

This matrix SHOULD be regenerated or reviewed whenever any ADR is authored, superseded, or has its `affected_documents` updated. It MUST NOT become an independent source of truth.

## Matrix

### Architecture (ADR-001..006)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-001 Modular Monolith | master-architecture, deployment-architecture, domain-driven-design | ENG-001..ENG-028 | All | ✓ | — |
| ADR-002 Domain-Driven Design | domain-driven-design, domain-map | ENG-001..ENG-028 | All | ✓ | — |
| ADR-003 Event-Driven Communication | integration-architecture, event-catalog | ENG-024, ENG-025, ENG-019, ENG-020 | All event consumers | ✓ | — |
| ADR-004 Plugin Extension Model | master-architecture, api-architecture | ENG-005, ENG-013, ENG-014 | Platform | ✓ | — |
| ADR-005 Clean Architecture | master-architecture, domain-driven-design | ENG-001..ENG-028 | All | ✓ | — |
| ADR-006 CQRS Usage Guidelines | database-architecture, api-architecture | ENG-021, ENG-022 | Analytics, Accounting, Reporting consumers | ✓ | — |

### Data (ADR-010..016)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-010 PostgreSQL as System of Record | database-architecture, database-standards | ENG-016, ENG-020, ENG-021 | All | ✓ | — |
| ADR-011 Multi-Tenant Isolation | multi-tenant-architecture, database-architecture, security-architecture | ENG-001, ENG-002 | All | ✓ | — |
| ADR-012 UUID Primary Keys | database-standards, data-dictionary | — | All | ✓ | — |
| ADR-013 Money Representation | data-dictionary, database-standards | ENG-015, ENG-016 | Accounting, Sales, Payroll, POS | ✓ | — |
| ADR-014 Audit Strategy | security-architecture, observability-architecture | ENG-004 | All | ✓ | — |
| ADR-015 Soft Delete Policy | database-standards, data-dictionary | — | All | ✓ | — |
| ADR-016 Data Versioning | database-standards, event-catalog | ENG-024 | All event producers | ✓ | — |

### Platform (ADR-020..026)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-020 API Style: REST-First | api-architecture | ENG-021 | All | ✓ | — |
| ADR-021 API Versioning | api-architecture | ENG-021 | All external-facing modules | ✓ | — |
| ADR-022 Error Envelope | api-architecture | ENG-021 | All | ✓ | — |
| ADR-023 Pagination Standard | api-architecture | ENG-021, ENG-022 | All list/report producers | ✓ | — |
| ADR-024 Webhook Delivery | integration-architecture | ENG-024, ENG-025, ENG-023 | Platform, integrations | ✓ | — |
| ADR-025 Feature Flags | master-architecture | ENG-005 | All | ✓ | — |
| ADR-026 Configuration Hierarchy | master-architecture | ENG-005 | All | ✓ | — |

### Security (ADR-030..036)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-030 Authentication Model | security-architecture | ENG-001 | All | ✓ | — |
| ADR-031 Authorization Model | security-architecture | ENG-002, ENG-003 | All | ✓ | — |
| ADR-032 RBAC + ABAC | security-architecture | ENG-002, ENG-003 | All | ✓ | — |
| ADR-033 Secrets Management | security-architecture, devops-architecture | — | Integrations | ✓ | — |
| ADR-034 Encryption Policy | security-architecture, database-architecture | — | All | ✓ | — |
| ADR-035 Data Classification | security-architecture, data-dictionary | ENG-004 | All | ✓ | — |
| ADR-036 Audit Integrity | security-architecture, observability-architecture | ENG-004 | All | ✓ | — |

### AI (ADR-040..045)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-040 AI Provider Abstraction | ai-architecture | ENG-028 | AI | ✓ | — |
| ADR-041 Tool Calling Contract | ai-architecture, api-architecture | ENG-028 | AI, all tool-exposing modules | ✓ | — |
| ADR-042 Human Approval Boundary | ai-architecture, security-architecture | ENG-028, ENG-011 | AI, approval consumers | ✓ | — |
| ADR-043 Prompt Governance | ai-architecture | ENG-028 | AI | ✓ | — |
| ADR-044 RAG Architecture | ai-architecture | ENG-028, ENG-020 | AI, Analytics | ✓ | — |
| ADR-045 AI Cost Governance | ai-architecture, observability-architecture | ENG-028 | AI, Platform | ✓ | — |

### Integration (ADR-050..055)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-050 Event Bus | integration-architecture, event-catalog | ENG-024 | All event participants | ✓ | — |
| ADR-051 Transactional Outbox | integration-architecture, database-architecture | ENG-024 | All event producers | ✓ | — |
| ADR-052 Retry Policy | integration-architecture | ENG-024, ENG-025, ENG-023 | Integrations, notifications | ✓ | — |
| ADR-053 Idempotency | api-architecture, integration-architecture | ENG-024, ENG-025, ENG-023 | All external-facing modules | ✓ | — |
| ADR-054 Dead Letter Handling | integration-architecture, observability-architecture | ENG-024, ENG-025 | Integrations | ✓ | — |
| ADR-055 External Integration Philosophy | integration-architecture | ENG-023 | Integrations, Platform | ✓ | — |

### DevOps (ADR-060..065)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-060 Deployment Model | deployment-architecture, devops-architecture | — | — | ✓ | — |
| ADR-061 Environment Strategy | devops-architecture | — | — | ✓ | — |
| ADR-062 Release Process | devops-architecture | — | — | ✓ | — |
| ADR-063 Testing Strategy | testing-strategy | — | All | ✓ | — |
| ADR-064 Observability Baseline | observability-architecture | — | All | ✓ | — |
| ADR-065 Disaster Recovery | deployment-architecture, devops-architecture | — | — | ✓ | — |

### Engineering (ADR-070..075)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-070 Coding Standards | — | — | All | ✓ (primary target) | — |
| ADR-071 Documentation Standards | — | — | All | ✓ | ✓ |
| ADR-072 Module Boundaries | domain-driven-design, domain-map | ENG-001..ENG-028 | All | ✓ | — |
| ADR-073 Dependency Rules | master-architecture | ENG-001..ENG-028 | All | ✓ | — |
| ADR-074 Technical Debt Management | — | — | All | ✓ | — |
| ADR-075 Backward Compatibility | api-architecture, event-catalog | ENG-021, ENG-024 | All external-facing modules | ✓ | — |

### UI (ADR-080..084)

| ADR | Architecture Documents | ERP Core Engines | Module PRDs | Coding Standards | Design Standards |
| --- | --- | --- | --- | --- | --- |
| ADR-080 Design Tokens | — | — | All UI-bearing modules | ✓ | ✓ (primary target) |
| ADR-081 Accessibility Standard | — | — | All UI-bearing modules | ✓ | ✓ |
| ADR-082 Localization Standard | — | ENG-006 | All UI-bearing modules | ✓ | ✓ |
| ADR-083 Offline UX | — | — | Field Service, POS, Sales | ✓ | ✓ |
| ADR-084 Navigation Standards | — | — | All UI-bearing modules | ✓ | ✓ |

## References

- `docs/11-adrs/README.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/11-adrs/ADR_TEMPLATE.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/DOCUMENT_TRACEABILITY.md`

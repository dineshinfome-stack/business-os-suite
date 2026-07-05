---
title: "ADR-011: Multi-Tenant Isolation"
summary: "Accepted ADR: Multi-Tenant Isolation."
adr_id: "ADR-011"
status: "Accepted"
owner: "Platform"
category: "Data"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/multi-tenant-architecture.md", "docs/02-architecture/database-architecture.md"]
related_engines: ["ENG-001", "ENG-002"]
affected_documents: ["docs/02-architecture/multi-tenant-architecture.md", "docs/02-architecture/database-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "data"]
document_type: "Architecture Decision Record"
---

# ADR-011: Multi-Tenant Isolation

## Metadata

- **ADR ID:** ADR-011
- **Title:** Multi-Tenant Isolation
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Data
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/multi-tenant-architecture.md`, `docs/02-architecture/database-architecture.md`
- **Affected Documents:** `docs/02-architecture/multi-tenant-architecture.md`, `docs/02-architecture/database-architecture.md`
- **Related ERP Core Engines:** ENG-001, ENG-002
- **Related Module PRDs:** TBD (Pass 7+)

## Context

BusinessOS is multi-tenant SaaS with strong isolation requirements and cost pressure from many small tenants.

## Problem Statement

Choose the tenant isolation model.

## Decision

Tenants share the database and schema; every tenant-scoped table carries `tenant_id` and is protected by **PostgreSQL Row-Level Security**. High-sensitivity or high-scale tenants may be migrated to a dedicated database via the same schema, without application changes.

## Alternatives Considered

Database-per-tenant; schema-per-tenant; application-only filtering.

## Trade-offs

Lowest steady-state cost and easiest cross-tenant analytics; requires disciplined RLS coverage and connection-level tenant context.

## Consequences

Every tenant query is authorised by RLS; connection pooling sets the tenant claim per request; a tenant may be relocated without code changes.

## Migration Strategy

Not applicable at this stage — no existing production system. Adoption is by construction as engines and modules are authored.

## Backward Compatibility

Governed by ADR-075. Any future change to this decision follows the deprecation window defined there.

## Risks

- The decision proves too rigid for a future use case → mitigated by ADR supersession.
- The decision proves too lax and permits drift → mitigated by dependency linters and CI gates where applicable.

## Rejected Options

See Alternatives Considered.

## Implementation Notes

Realised in code and configuration by the related engines and by the architecture documents listed above.

## Future Review Trigger

A regulator or enterprise customer requires physical database isolation as a contract.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

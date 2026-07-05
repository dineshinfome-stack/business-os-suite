---
title: "ADR-010: PostgreSQL as System of Record"
summary: "Proposed ADR: PostgreSQL as System of Record."
adr_id: "ADR-010"
status: "Proposed"
owner: "Platform"
category: "Data"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/database-architecture.md", "docs/02-architecture/database-standards.md"]
related_engines: ["ENG-018", "ENG-019", "ENG-020"]
affected_documents: ["docs/02-architecture/database-architecture.md", "docs/02-architecture/database-standards.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "data"]
document_type: "Architecture Decision Record"
---

# ADR-010: PostgreSQL as System of Record

## Metadata

- **ADR ID:** ADR-010
- **Title:** PostgreSQL as System of Record
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Data
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/database-architecture.md`, `docs/02-architecture/database-standards.md`
- **Affected Documents:** `docs/02-architecture/database-architecture.md`, `docs/02-architecture/database-standards.md`
- **Related ERP Core Engines:** ENG-018, ENG-019, ENG-020
- **Related Module PRDs:** TBD (Pass 7+)

## Context

The platform requires strong transactional guarantees, rich types (JSONB, arrays, ranges), row-level security, mature tooling, and multi-tenant support.

## Problem Statement

Select the primary database engine for the System of Record.

## Decision

**PostgreSQL** is the System of Record for all transactional data. Analytical or search workloads may use additional stores fed via events, but authoritative state lives in Postgres.

## Alternatives Considered

MySQL; a NoSQL document store; a mixed polystore SoR.

## Trade-offs

Excellent feature set vs. operational responsibility; some patterns (RLS) require care under connection pooling.

## Consequences

Every module persists its aggregates to Postgres; secondary stores are read-only projections.

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

A workload demonstrably cannot meet SLOs on Postgres despite reasonable tuning.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

---
title: "ADR-015: Soft Delete Policy"
summary: "Proposed ADR: Soft Delete Policy."
adr_id: "ADR-015"
status: "Proposed"
owner: "Platform"
category: "Data"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/database-standards.md"]
related_engines: []
affected_documents: ["docs/02-architecture/database-standards.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "data"]
document_type: "Architecture Decision Record"
---

# ADR-015: Soft Delete Policy

## Metadata

- **ADR ID:** ADR-015
- **Title:** Soft Delete Policy
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Data
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/database-standards.md`
- **Affected Documents:** `docs/02-architecture/database-standards.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

ERP data often needs to be preserved for legal and referential reasons even when logically removed.

## Problem Statement

Define the deletion model.

## Decision

Business entities use **soft delete** (`deleted_at`, `deleted_by`) with query filters applied by default. Hard delete is limited to GDPR-style erasure flows, executed via a dedicated pipeline that records the erasure event.

## Alternatives Considered

Hard delete always; archive-table pattern; status column only.

## Trade-offs

More query complexity vs. safer defaults and preserved history.

## Consequences

Repositories filter deleted rows by default; RLS/soft-delete interactions are covered by shared query helpers.

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

A regulator mandates hard delete for a class of data.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

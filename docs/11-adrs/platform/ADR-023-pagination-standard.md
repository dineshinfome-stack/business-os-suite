---
title: "ADR-023: Pagination Standard"
summary: "Proposed ADR: Pagination Standard."
adr_id: "ADR-023"
status: "Proposed"
owner: "Platform"
category: "Platform"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/api-architecture.md"]
related_engines: ["ENG-021", "ENG-022"]
affected_documents: ["docs/02-architecture/api-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "platform"]
document_type: "Architecture Decision Record"
---

# ADR-023: Pagination Standard

## Metadata

- **ADR ID:** ADR-023
- **Title:** Pagination Standard
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Platform
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/api-architecture.md`
- **Affected Documents:** `docs/02-architecture/api-architecture.md`
- **Related ERP Core Engines:** ENG-021, ENG-022
- **Related Module PRDs:** TBD (Pass 7+)

## Context

List endpoints span from a handful to millions of rows.

## Problem Statement

Define a single pagination convention.

## Decision

Collections use **cursor-based pagination** by default (`?cursor=…&limit=…`), with a bounded max limit. Offset pagination is offered only for admin/reporting endpoints where deep skip is required.

## Alternatives Considered

Offset-only; token-based with opaque IDs only; no pagination cap.

## Trade-offs

Cursors need stable sort keys vs. consistent performance at scale.

## Consequences

All list endpoints document the sort key that anchors the cursor; SDKs iterate transparently.

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

A high-value use case requires stable page numbers users can bookmark.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

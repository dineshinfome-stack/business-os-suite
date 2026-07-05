---
title: "ADR-074: Technical Debt Management"
summary: "Proposed ADR: Technical Debt Management."
adr_id: "ADR-074"
status: "Proposed"
owner: "Platform"
category: "Engineering"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/governance.md"]
related_engines: []
affected_documents: ["docs/governance.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "engineering"]
document_type: "Architecture Decision Record"
---

# ADR-074: Technical Debt Management

## Metadata

- **ADR ID:** ADR-074
- **Title:** Technical Debt Management
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Engineering
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/governance.md`
- **Affected Documents:** `docs/governance.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Debt accumulates silently and blocks delivery over time.

## Problem Statement

Manage technical debt explicitly.

## Decision

Debt items are tracked as first-class tickets with a **cost/impact estimate** and a nominated owner. A share of every sprint capacity is reserved for debt. Debt with regulatory or security impact is prioritised as production risk.

## Alternatives Considered

Ignored debt; annual cleanup sprints.

## Trade-offs

Some feature velocity trade-off vs. sustainable pace.

## Consequences

Debt burndown is a visible team metric.

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

No scheduled review required.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

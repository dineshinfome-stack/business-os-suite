---
title: "ADR-026: Configuration Hierarchy"
summary: "Proposed ADR: Configuration Hierarchy."
adr_id: "ADR-026"
status: "Proposed"
owner: "Platform"
category: "Platform"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/10-erp-core/foundation/configuration-engine.md"]
related_engines: ["ENG-005"]
affected_documents: ["docs/10-erp-core/foundation/configuration-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "platform"]
document_type: "Architecture Decision Record"
---

# ADR-026: Configuration Hierarchy

## Metadata

- **ADR ID:** ADR-026
- **Title:** Configuration Hierarchy
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Platform
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/10-erp-core/foundation/configuration-engine.md`
- **Affected Documents:** `docs/10-erp-core/foundation/configuration-engine.md`
- **Related ERP Core Engines:** ENG-005
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Configuration exists at many scopes: platform default, tenant, company, branch, user.

## Problem Statement

Define precedence and override rules.

## Decision

Configuration resolves through a **strict precedence chain**: User → Branch → Company → Tenant → Platform Default. Overrides are explicit and audited; unresolved keys fall back to platform defaults.

## Alternatives Considered

Flat key-value store; per-module config silos.

## Trade-offs

Chain resolution cost per read vs. predictable behaviour and clean UX for administrators.

## Consequences

All engines read config via the resolver; UI shows the effective value and its source scope.

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

The chain proves insufficient for a required scope (e.g. per-project overrides).

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

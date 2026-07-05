---
title: "ADR-004: Plugin Extension Model"
summary: "Accepted ADR: Plugin Extension Model."
adr_id: "ADR-004"
status: "Accepted"
owner: "Platform"
category: "Architecture"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/master-architecture.md", "docs/10-erp-core/foundation/configuration-engine.md", "docs/10-erp-core/workflow/rules-engine.md"]
related_engines: ["ENG-005", "ENG-013", "ENG-014"]
affected_documents: ["docs/02-architecture/master-architecture.md", "docs/10-erp-core/foundation/configuration-engine.md", "docs/10-erp-core/workflow/rules-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "architecture"]
document_type: "Architecture Decision Record"
---

# ADR-004: Plugin Extension Model

## Metadata

- **ADR ID:** ADR-004
- **Title:** Plugin Extension Model
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Architecture
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/master-architecture.md`, `docs/10-erp-core/foundation/configuration-engine.md`, `docs/10-erp-core/workflow/rules-engine.md`
- **Affected Documents:** `docs/02-architecture/master-architecture.md`, `docs/10-erp-core/foundation/configuration-engine.md`, `docs/10-erp-core/workflow/rules-engine.md`
- **Related ERP Core Engines:** ENG-005, ENG-013, ENG-014
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Different customers need controlled variability (custom fields, custom rules, custom reports) without forking the codebase.

## Problem Statement

Define how the platform is extended by customers and partners without compromising the core.

## Decision

Extensibility is realised through a **plugin/extension model** exposed by platform engines: custom fields via Configuration, custom logic via the Rules Engine, custom automations via Automation, and packaged extensions via a signed manifest. Core engines are not modified per tenant.

## Alternatives Considered

Per-tenant code branches; runtime code injection; heavy templating.

## Trade-offs

Predictable core evolution vs. constrained extension surface; extensions gain the same guarantees (audit, RBAC, tenancy) as core.

## Consequences

All customer-specific behaviour lives in configuration, rules, or packaged extensions; the core codebase remains single-source.

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

A recurring customer need cannot be expressed by the extension model.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

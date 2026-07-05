---
title: "ADR-031: Authorization Model"
summary: "Proposed ADR: Authorization Model."
adr_id: "ADR-031"
status: "Proposed"
owner: "Platform"
category: "Security"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/security-architecture.md", "docs/10-erp-core/foundation/authorization-engine.md"]
related_engines: ["ENG-002", "ENG-003"]
affected_documents: ["docs/02-architecture/security-architecture.md", "docs/10-erp-core/foundation/authorization-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "security"]
document_type: "Architecture Decision Record"
---

# ADR-031: Authorization Model

## Metadata

- **ADR ID:** ADR-031
- **Title:** Authorization Model
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Security
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/security-architecture.md`, `docs/10-erp-core/foundation/authorization-engine.md`
- **Affected Documents:** `docs/02-architecture/security-architecture.md`, `docs/10-erp-core/foundation/authorization-engine.md`
- **Related ERP Core Engines:** ENG-002, ENG-003
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Access decisions must consider role, resource attributes, tenant, and context (e.g. financial year, branch).

## Problem Statement

Choose the authorization approach.

## Decision

Authorization is enforced by the **Authorization Engine** using policy-based checks. Role assignments feed the engine but do not themselves grant access. Every access decision is auditable.

## Alternatives Considered

Static role checks in controllers; per-module ACL tables; RBAC-only without attributes.

## Trade-offs

Higher initial modelling cost vs. accurate and auditable decisions.

## Consequences

All access decisions call the Authorization Engine; direct role string checks in application code are forbidden.

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

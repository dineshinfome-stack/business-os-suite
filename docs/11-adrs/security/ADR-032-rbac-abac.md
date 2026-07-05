---
title: "ADR-032: RBAC + ABAC"
summary: "Accepted ADR: RBAC + ABAC."
adr_id: "ADR-032"
status: "Accepted"
owner: "Platform"
category: "Security"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/security-architecture.md", "docs/04-domains/foundation/roles-permissions.md"]
related_engines: ["ENG-002", "ENG-003"]
affected_documents: ["docs/02-architecture/security-architecture.md", "docs/04-domains/foundation/roles-permissions.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "security"]
document_type: "Architecture Decision Record"
---

# ADR-032: RBAC + ABAC

## Metadata

- **ADR ID:** ADR-032
- **Title:** RBAC + ABAC
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Security
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/security-architecture.md`, `docs/04-domains/foundation/roles-permissions.md`
- **Affected Documents:** `docs/02-architecture/security-architecture.md`, `docs/04-domains/foundation/roles-permissions.md`
- **Related ERP Core Engines:** ENG-002, ENG-003
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Roles are how administrators think; attributes are how policies must actually decide.

## Problem Statement

Define the concrete permission model realised by the Authorization Engine.

## Decision

BusinessOS combines **RBAC** (role → permission grants) with **ABAC** (attribute predicates over user, resource, and context). Permissions never reference roles directly; roles map to permission sets that policies evaluate against attributes.

## Alternatives Considered

Pure RBAC; pure ABAC; per-endpoint hard-coded checks.

## Trade-offs

Slightly more design work for policy authors vs. correct behaviour under real ERP constraints (branches, financial years, ownership).

## Consequences

Roles are administrative; policies are enforced.

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

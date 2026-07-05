---
title: "ADR-030: Authentication Model"
summary: "Proposed ADR: Authentication Model."
adr_id: "ADR-030"
status: "Proposed"
owner: "Platform"
category: "Security"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/security-architecture.md", "docs/10-erp-core/foundation/identity-engine.md"]
related_engines: ["ENG-001"]
affected_documents: ["docs/02-architecture/security-architecture.md", "docs/10-erp-core/foundation/identity-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "security"]
document_type: "Architecture Decision Record"
---

# ADR-030: Authentication Model

## Metadata

- **ADR ID:** ADR-030
- **Title:** Authentication Model
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Security
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/security-architecture.md`, `docs/10-erp-core/foundation/identity-engine.md`
- **Affected Documents:** `docs/02-architecture/security-architecture.md`, `docs/10-erp-core/foundation/identity-engine.md`
- **Related ERP Core Engines:** ENG-001
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Users, partners, and AI agents all authenticate; multiple factors and SSO are required.

## Problem Statement

Choose the authentication foundation.

## Decision

Authentication is centralised in the **Identity Engine**. Sessions use short-lived JWT access tokens with refresh rotation. SSO (SAML/OIDC), MFA (TOTP/WebAuthn), and API keys are all issued and revoked by Identity.

## Alternatives Considered

Per-module auth; long-lived session cookies without rotation; passwords-only.

## Trade-offs

One critical surface to harden vs. one point that must be secured well.

## Consequences

No module implements auth locally; all callers present tokens minted by Identity.

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

A published vulnerability affects the chosen token format.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

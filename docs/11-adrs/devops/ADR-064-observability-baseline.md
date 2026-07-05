---
title: "ADR-064: Observability Baseline"
summary: "Proposed ADR: Observability Baseline."
adr_id: "ADR-064"
status: "Proposed"
owner: "Platform"
category: "DevOps"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/observability-architecture.md"]
related_engines: []
affected_documents: ["docs/02-architecture/observability-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "devops"]
document_type: "Architecture Decision Record"
---

# ADR-064: Observability Baseline

## Metadata

- **ADR ID:** ADR-064
- **Title:** Observability Baseline
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** DevOps
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/observability-architecture.md`
- **Affected Documents:** `docs/02-architecture/observability-architecture.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Operating multi-tenant SaaS demands consistent telemetry.

## Problem Statement

Define the observability baseline for every module.

## Decision

Every module emits **structured logs, RED/USE metrics, and OpenTelemetry traces** by default via the platform observability layer. Tenant, user, and trace IDs are correlated end-to-end. SLOs are declared for user-facing flows.

## Alternatives Considered

Ad-hoc logging; metrics-only; per-module dashboards.

## Trade-offs

Standardisation cost vs. usable production visibility.

## Consequences

A new module inherits observability from platform middleware without extra code.

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

A telemetry standard becomes obviously superior to OTel.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`

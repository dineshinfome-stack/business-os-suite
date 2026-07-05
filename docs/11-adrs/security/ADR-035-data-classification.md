---
title: "ADR-035: Data Classification"
summary: "Proposed ADR: Data Classification."
adr_id: "ADR-035"
status: "Proposed"
owner: "Platform"
category: "Security"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/security-architecture.md", "docs/02-architecture/data-dictionary.md"]
related_engines: ["ENG-004"]
affected_documents: ["docs/02-architecture/security-architecture.md", "docs/02-architecture/data-dictionary.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "security"]
document_type: "Architecture Decision Record"
---

# ADR-035: Data Classification

## Metadata

- **ADR ID:** ADR-035
- **Title:** Data Classification
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Security
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/security-architecture.md`, `docs/02-architecture/data-dictionary.md`
- **Affected Documents:** `docs/02-architecture/security-architecture.md`, `docs/02-architecture/data-dictionary.md`
- **Related ERP Core Engines:** ENG-004
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Different fields carry different sensitivity and regulatory burdens.

## Problem Statement

Define a classification scheme and its consequences.

## Decision

Data is classified as **Public · Internal · Confidential · Restricted**. Classification is a mandatory column-level annotation and drives encryption, logging redaction, export controls, and retention.

## Alternatives Considered

No classification; per-domain ad-hoc labels.

## Trade-offs

Requires an upfront pass over the data dictionary vs. consistent controls.

## Consequences

Every column in the data dictionary has a classification; Export Engine and logs honour it.

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

A new regulation adds a class of data outside the current scheme.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
